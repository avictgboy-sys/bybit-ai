import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  X,
  Target,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Sliders,
  Sparkles,
  RefreshCw,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { KlinePoint, TickerData } from '../types';
import {
  run30DaySlBacktest,
  HistoricalSlPerformanceReport,
  simulateTradesOnKlines,
} from '../utils/slBacktester';
import { formatPrice } from '../utils/formatters';

interface HistoricalSlPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: TickerData;
  initialSlPcnt?: number;
  initialTpPcnt?: number;
  direction?: 'LONG' | 'SHORT' | string;
  klines?: KlinePoint[];
}

export const HistoricalSlPerformanceModal: React.FC<HistoricalSlPerformanceModalProps> = ({
  isOpen,
  onClose,
  coin,
  initialSlPcnt = 4.0,
  initialTpPcnt = 5.8,
  direction = 'LONG',
  klines,
}) => {
  const normalizedDirection: 'LONG' | 'SHORT' =
    typeof direction === 'string' &&
    (direction.toUpperCase().includes('SHORT') || direction.toUpperCase().includes('SELL'))
      ? 'SHORT'
      : 'LONG';

  const [slPcnt, setSlPcnt] = useState<number>(initialSlPcnt || 4.0);
  const [tpPcnt, setTpPcnt] = useState<number>(initialTpPcnt || 5.8);
  const [report, setReport] = useState<HistoricalSlPerformanceReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cachedKlines, setCachedKlines] = useState<KlinePoint[] | null>(klines || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'comparison'>('overview');

  // Load 30-day report on open or coin change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    run30DaySlBacktest(coin, slPcnt, tpPcnt, normalizedDirection, cachedKlines || undefined)
      .then((res) => {
        if (isMounted) {
          setReport(res);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error running 30-day SL backtest:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, coin.symbol, normalizedDirection]);

  // Recalculate when user adjusts SL or TP slider
  const handleSlChange = (newSl: number) => {
    setSlPcnt(newSl);
    if (cachedKlines && cachedKlines.length >= 15) {
      const updated = simulateTradesOnKlines(
        coin.symbol || `${coin.baseCoin}USDT`,
        coin,
        cachedKlines,
        newSl,
        tpPcnt,
        normalizedDirection
      );
      setReport(updated);
    } else {
      run30DaySlBacktest(coin, newSl, tpPcnt, normalizedDirection).then(setReport);
    }
  };

  const handleTpChange = (newTp: number) => {
    setTpPcnt(newTp);
    if (cachedKlines && cachedKlines.length >= 15) {
      const updated = simulateTradesOnKlines(
        coin.symbol || `${coin.baseCoin}USDT`,
        coin,
        cachedKlines,
        slPcnt,
        newTp,
        normalizedDirection
      );
      setReport(updated);
    } else {
      run30DaySlBacktest(coin, slPcnt, newTp, normalizedDirection).then(setReport);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 text-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <History className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5">
                  📊 {coin.baseCoin}/USDT ৩০ দিনের ঐতিহাসিক SL পারফরম্যান্স
                </h3>
                <span
                  className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                    normalizedDirection === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {normalizedDirection} SETUPS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                বিগত ৩০ দিনের রিয়েল মার্কেট ডাটা ও ক্যান্ডেলস্টিক উইকের ওপর ভিত্তি করে এসএল ও টিপি সাফল্যের ব্যাকটেস্ট
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 border border-slate-700 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-5 pt-3 border-b border-slate-800 bg-slate-950/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            সারসংক্ষেপ ও সাফল্য হার (Overview)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trades')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'trades'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            ৩০ দিনের ট্রেড লগ ({report?.trades.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'border-amber-400 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            ওয়াইড বনাম টাইট এসএল তুলনা
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading || !report ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                বিগত ৩০ দিনের ক্যান্ডেলস্টিক ও ভোলাটিলিটি ডাটা ব্যাকটেস্ট করা হচ্ছে...
              </p>
              <p className="text-xs text-slate-500">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন</p>
            </div>
          ) : (
            <>
              {/* Top Summary Metrics Cards (TP Hits vs SL Triggers) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Metric 1: TP Target Reached */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-1 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Take-Profit (TP)
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                      {report.tpSuccessRatePcnt}%
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                    {report.tpHitsCount}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      / {report.totalSetups} টি
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    টার্গেট রিচড (+{tpPcnt}% লাভ)
                  </p>
                </div>

                {/* Metric 2: SL Triggered */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border border-rose-500/30 space-y-1 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" />
                      Stop-Loss (SL)
                    </span>
                    <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.5 rounded font-mono">
                      {report.slTriggerRatePcnt}%
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                    {report.slHitsCount}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      / {report.totalSetups} টি
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    এসএল ট্রিগার (-{slPcnt}% বাফার)
                  </p>
                </div>

                {/* Metric 3: Fakeout Wicks Survived */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 space-y-1 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      উইক হান্ট সুরক্ষা
                    </span>
                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      SAVED
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {report.wickPrematureStopsAvoided}{' '}
                    <span className="text-xs text-slate-400 font-normal">বার</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    অকালে লিকুইডেশন ও এসএল এড়ানো গেছে
                  </p>
                </div>

                {/* Metric 4: 30D Net Return / Profit Factor */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-950 border border-sky-500/30 space-y-1 shadow-lg">
                  <div className="flex items-center justify-between text-xs text-sky-400 font-bold">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      প্রফিট ফ্যাক্টর
                    </span>
                    <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded font-mono">
                      30D
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
                    {report.profitFactor}x
                  </div>
                  <p className="text-[10px] text-slate-400">
                    মোট কিউমুলেটিভ লাভ: +{report.netGainPcnt}%
                  </p>
                </div>
              </div>

              {/* Progress & Ratio Bar Visualizer */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    TP টার্গেট সাফল্য: {report.tpHitsCount} বার ({report.tpSuccessRatePcnt}%)
                  </span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    SL ট্রিগার: {report.slHitsCount} বার ({report.slTriggerRatePcnt}%)
                  </span>
                </div>

                {/* Split Win/Loss Visual Bar */}
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${report.tpSuccessRatePcnt}%` }}
                    title={`Take Profit Hits: ${report.tpSuccessRatePcnt}%`}
                  />
                  <div
                    className="bg-rose-500 h-full transition-all duration-500"
                    style={{ width: `${report.slTriggerRatePcnt}%` }}
                    title={`Stop Loss Hits: ${report.slTriggerRatePcnt}%`}
                  />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  <strong>💡 এআই মূল্যায়ন:</strong> {report.summaryBn}
                </p>
              </div>

              {/* Interactive SL & TP Distance Sliders for Live Simulation */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    ইন্টারেক্টিভ এসএল ও টিপি সিমুলেটর (Live What-If Backtester)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    স্লাইডার টেনে সাফল্যের পরিবর্তন দেখুন
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 text-xs">
                  {/* SL Distance Slider */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-300">স্টপ-লস দূরত্ব (SL Buffer):</span>
                      <strong className="text-rose-400 font-black text-sm">
                        -{slPcnt}% (${formatPrice(coin.lastPrice * (1 - (normalizedDirection === 'LONG' ? slPcnt : -slPcnt) / 100))})
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="7.0"
                      step="0.1"
                      value={slPcnt}
                      onChange={(e) => handleSlChange(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>১.৫% (টাইট)</span>
                      <span>৪.০% (প্রস্তাবিত)</span>
                      <span>৭.০% (ওয়াইড)</span>
                    </div>
                  </div>

                  {/* TP Distance Slider */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-300">টার্গেট প্রফিট (TP Target):</span>
                      <strong className="text-emerald-400 font-black text-sm">
                        +{tpPcnt}% (${formatPrice(coin.lastPrice * (1 + (normalizedDirection === 'LONG' ? tpPcnt : -tpPcnt) / 100))})
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="2.5"
                      max="15.0"
                      step="0.2"
                      value={tpPcnt}
                      onChange={(e) => handleTpChange(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>২.৫% (স্ক্যাল্প)</span>
                      <span>৫.৮% (সুইং)</span>
                      <span>১৫.০% (মেগা)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab 2: 30-Day Simulated Trade List */}
              {activeTab === 'trades' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    বিগত ৩০ দিনের সিমুলেটেড ট্রেড ঘটনাবলী ও ফলাফল:
                  </h4>

                  <div className="rounded-xl border border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0">
                        <tr>
                          <th className="p-2.5">তারিখ</th>
                          <th className="p-2.5">এন্ট্রি</th>
                          <th className="p-2.5">ডিপ উইক</th>
                          <th className="p-2.5">ফলাফল</th>
                          <th className="p-2.5 text-right">লাভ/ক্ষতি</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono">
                        {report.trades.map((t, idx) => (
                          <tr
                            key={t.id || idx}
                            className={`hover:bg-slate-850/80 transition-colors ${
                              t.wickSavedByBuffer ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <td className="p-2.5 text-slate-300">
                              <div>{t.dateStr}</div>
                              <div className="text-[9px] text-slate-500 font-sans">
                                {t.triggerReason}
                              </div>
                            </td>
                            <td className="p-2.5 text-slate-200">
                              ${formatPrice(t.entryPrice)}
                            </td>
                            <td className="p-2.5">
                              <span
                                className={`text-[10px] ${
                                  t.lowestWickPcnt >= 2.0
                                    ? 'text-amber-400 font-bold'
                                    : 'text-slate-400'
                                }`}
                              >
                                -{t.lowestWickPcnt}%
                              </span>
                              {t.wickSavedByBuffer && (
                                <span className="ml-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-sans">
                                  🛡️ বাফারে রক্ষা
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">
                              {t.outcome === 'TP_HIT' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                  <CheckCircle2 className="w-3 h-3" />
                                  TP হিট
                                </span>
                              ) : t.outcome === 'SL_TRIGGERED' ? (
                                <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                                  <XCircle className="w-3 h-3" />
                                  SL হিট
                                </span>
                              ) : (
                                <span className="text-slate-400">ওপেন</span>
                              )}
                            </td>
                            <td
                              className={`p-2.5 text-right font-bold ${
                                t.gainLossPcnt > 0
                                  ? 'text-emerald-400'
                                  : t.gainLossPcnt < 0
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {t.gainLossPcnt > 0 ? '+' : ''}
                              {t.gainLossPcnt}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Detailed Wide vs Tight SL Comparison */}
              {activeTab === 'comparison' && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    কেন টাইট এসএল (&lt;২%) এড়িয়ে ওয়াইড বাফার (-{slPcnt}%) নেওয়া উচিত?
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Tight SL Box */}
                    <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                      <div className="font-bold text-rose-400 flex items-center justify-between">
                        <span>❌ টাইট এসএল (-১.৮%)</span>
                        <span className="font-mono text-[11px]">{report.tightSlComparison.tightSuccessRatePcnt}% উইন রেট</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        মার্কেটের স্বাভাবিক ক্যান্ডেলস্টিক উইক এবং লিকুইডিটি হান্টিংয়ে <strong>{report.tightSlComparison.tightSlHits} বার</strong> ভুলবশত এসএল ট্রিগার হয়ে যেত।
                      </p>
                    </div>

                    {/* Wide Buffer SL Box */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <div className="font-bold text-emerald-400 flex items-center justify-between">
                        <span>🛡️ বর্তমান ওয়াইড এসএল (-{slPcnt}%)</span>
                        <span className="font-mono text-[11px]">{report.tpSuccessRatePcnt}% উইন রেট</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        উইক হান্ট ফিল্টার হয়ে <strong>{report.tpHitsCount} বার</strong> সফলভাবে প্রফিট টার্গেট পূরণ হয়েছে ({report.wickPrematureStopsAvoided}টি ট্রেড ফেকআউট থেকে রক্ষা পেয়েছে)।
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-slate-400 hidden sm:block">
            📌 বাস্তব ট্রেডিংয়ে সঠিক রিস্ক ও মানি ম্যানেজমেন্ট (১-২% মূলধন রিস্ক) অনুসরণ করুন
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
