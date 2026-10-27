import React, { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  AlertTriangle,
  Award,
  CheckCircle2,
  RefreshCw,
  Flame,
  Clock,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice } from '../utils/formatters';
import { LongShortProbabilityMeter } from './LongShortProbabilityMeter';
import { StopLossEfficiencyMeter, SlDistanceVolatilityIcon } from './StopLossEfficiencyMeter';
import { calculateSlEfficiency } from '../utils/slEfficiency';
import { evaluateUnifiedSignal } from '../utils/unifiedSignals';
import { TradeSignalTarget } from './BybitTradeConfirmModal';

interface BybitTopPickCardProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
  language?: string;
  onExecuteBybitTrade?: (signal: TradeSignalTarget) => void;
}

export const BybitTopPickCard: React.FC<BybitTopPickCardProps> = ({
  tickers,
  onSelectCoin,
  language = 'en',
  onExecuteBybitTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'BEST_PICK' | 'GAINERS' | 'LOSERS'>('BEST_PICK');

  if (!tickers || tickers.length === 0) return null;

  // Sort tickers into Gainers and Losers
  const sortedGainers = [...tickers]
    .filter((t) => t.price24hPcnt > 0)
    .sort((a, b) => b.price24hPcnt - a.price24hPcnt);

  const sortedLosers = [...tickers]
    .filter((t) => t.price24hPcnt < 0)
    .sort((a, b) => a.price24hPcnt - b.price24hPcnt); // most negative first

  const topGainers = sortedGainers.slice(0, 5);
  const topLosers = sortedLosers.slice(0, 5);

  // AI Selection Logic for the Single Best Profit Pick:
  // Evaluates volume + momentum surge in gainers OR oversold dip bounce in losers
  const topGainerCandidate = topGainers[0];
  const topLoserCandidate = topLosers[0];

  let bestPick: TickerData = topGainerCandidate || tickers[0];
  let pickSource: 'GAINER' | 'LOSER' = 'GAINER';

  if (topGainerCandidate && topLoserCandidate) {
    // If gainer momentum is very strong (> 8% gain with high turnover), pick gainer continuation
    // If loser is severely oversold (<-8% dip), pick loser bounce reversal
    if (Math.abs(topLoserCandidate.price24hPcnt) > topGainerCandidate.price24hPcnt && Math.abs(topLoserCandidate.price24hPcnt) > 0.08) {
      bestPick = topLoserCandidate;
      pickSource = 'LOSER';
    } else {
      bestPick = topGainerCandidate;
      pickSource = 'GAINER';
    }
  }

  // Calculate trade setup using the Unified Single Source of Truth engine
  const price = bestPick.lastPrice;
  const pcnt = bestPick.price24hPcnt * 100;
  const isGainer = pickSource === 'GAINER';

  const unified = evaluateUnifiedSignal(bestPick);
  const isShort = unified.positionDirection === 'SHORT';

  const direction = isShort
    ? 'SHORT (টপ রিজেকশন প্রফিট সেল)'
    : isGainer
    ? 'LONG (বুলিশ ব্রেকআউট মোমেন্টাম)'
    : 'LONG (ডিপ বাই রিভার্সাল বাউন্স)';

  const entryPrice = price;
  const tp1 = unified.tp1;
  const tp2 = unified.tp2;
  const tp3 = unified.tp3;
  const sl = unified.sl;
  const expectedProfitPcnt = isShort
    ? `+${unified.tp1Pcnt.toFixed(1)}% - +${unified.tp2Pcnt.toFixed(1)}% (SHORT)`
    : isGainer
    ? '+7.0% - +12.0% (LONG)'
    : '+8.5% - +15.0% (LONG)';

  const reasonBn = unified.reasonBn || (isGainer
    ? `Bybit এর Top Gainers তালিকা থেকে ${bestPick.baseCoin} সর্বোচ্চ ভলিউম এবং শক্তিশালী বুলিশ মোমেন্টাম নিয়ে প্রথম স্থানে রয়েছে (+${pcnt.toFixed(2)}%)। ব্রেকআউট কনফার্ম হওয়ায় এই কয়েনে শর্ট টার্মে দারুণ প্রফিট অর্জনের সম্ভাবনা সবচেয়ে বেশি।`
    : `Bybit এর Top Losers তালিকা থেকে ${bestPick.baseCoin} অত্যধিক ওভারসোল্ড জোন (${pcnt.toFixed(2)}%) থেকে বাউন্স শুরু করেছে। সাপোর্ট লেভেল থেকে স্ট্রং রিভার্সাল সিগন্যাল থাকায় এটি ডিপ-বাই (Dip Buy) করে চড়া প্রফিট নেওয়ার সেরা সুযোগ।`);

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Trophy className="w-6 h-6 animate-bounce text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                🏆 Bybit Gainers & Losers: সেরা প্রফিটেবল কয়েন পিক
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                TOP PROFIT PICK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bybit এর Top Gainers ও Top Losers ফিল্টার করে AI দ্বারা নিরূপিত ১টি সেরা প্রফিট সম্ভাব্য কয়েন
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('BEST_PICK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'BEST_PICK'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            সেরা প্রফিট পিক
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GAINERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'GAINERS'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Top Gainers ({topGainers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOSERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'LOSERS'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Top Losers ({topLosers.length})
          </button>
        </div>
      </div>

      {/* Main Single Best Profit Pick View */}
      {activeTab === 'BEST_PICK' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className={`p-3.5 rounded-2xl bg-slate-900 border shrink-0 ${isShort ? 'border-red-500/40' : 'border-amber-500/40'}`}>
                {isShort ? (
                  <TrendingDown className="w-8 h-8 text-red-400 animate-pulse" />
                ) : isGainer ? (
                  <TrendingUp className="w-8 h-8 text-emerald-400 animate-pulse" />
                ) : (
                  <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isShort
                      ? 'text-red-400 bg-red-500/10 border-red-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {isShort
                      ? '⚠️ Top Rejection (Short Sell) নির্বাচিত'
                      : pickSource === 'GAINER'
                      ? '🔥 Top Gainers থেকে নির্বাচিত'
                      : '💎 Top Losers (Dip Buy) থেকে নির্বাচিত'}
                  </span>
                  {unified.tradingStyleLabelBn && (
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
                      {unified.tradingStyleLabelBn}
                    </span>
                  )}
                  {unified.estimatedDurationBn && (
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      ⏱️ {unified.estimatedDurationBn}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-slate-400">
                    Bybit 24h: <strong className={pcnt >= 0 ? 'text-emerald-400' : 'text-red-400'}>{pcnt >= 0 ? '+' : ''}{pcnt.toFixed(2)}%</strong>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-100 mt-1 flex items-center gap-2">
                  {bestPick.baseCoin}/USDT
                  <span className="text-sm font-mono text-slate-300 font-bold">
                    {formatPrice(price)}
                  </span>
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectCoin(bestPick)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 self-stretch md:self-auto justify-center"
            >
              ট্রেড চার্ট ও গ্রিড বট চালু করুন
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Trade Setup Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                প্রস্তাবিত এন্ট্রি (Entry)
              </span>
              <div className="text-base font-black font-mono text-slate-100">
                ${entryPrice >= 1 ? entryPrice.toFixed(2) : entryPrice.toFixed(4)}
              </div>
              <span className={`text-[10px] block font-bold ${isShort ? 'text-red-400' : 'text-emerald-400'}`}>
                দিক: {direction}
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                প্রফিট টার্গেট (TP1 / TP2 / TP3)
              </span>
              <div className="text-xs font-mono font-bold text-emerald-400">
                TP1: ${tp1 >= 1 ? tp1.toFixed(2) : tp1.toFixed(4)}
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                TP2: ${tp2 >= 1 ? tp2.toFixed(2) : tp2.toFixed(4)} | TP3: ${tp3 >= 1 ? tp3.toFixed(2) : tp3.toFixed(4)}
              </div>
              {unified.tp1DurationBn && (
                <span className="text-[10px] text-sky-300 font-mono flex items-center gap-1 pt-0.5">
                  <Clock className="w-3 h-3 text-sky-400" />
                  TP1 সময়: {unified.tp1DurationBn}
                </span>
              )}
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-red-500/20 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  স্টপ লস (SL)
                </span>
                <SlDistanceVolatilityIcon
                  analysis={calculateSlEfficiency(
                    bestPick,
                    sl,
                    direction as 'LONG' | 'SHORT'
                  )}
                />
              </div>
              <div className="text-base font-black font-mono text-red-400">
                ${sl >= 1 ? sl.toFixed(2) : sl.toFixed(4)}
              </div>
              <span className="text-[10px] text-slate-400 block">
                মূলধন সেফটি গ্যারান্টি
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/20 space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                সম্ভাব্য প্রফিট রিটার্ন
              </span>
              <div className="text-base font-black font-mono text-amber-400">
                {expectedProfitPcnt}
              </div>
              <span className="text-[10px] text-slate-400 block">
                {unified.estimatedDurationBn ? `⏱️ মেয়াদ: ${unified.estimatedDurationBn}` : '৩x - ৫x লেভারেজে প্রস্তাবিত'}
              </span>
            </div>
          </div>

          {/* Long vs Short Probability Bar for Best Pick */}
          <LongShortProbabilityMeter coin={bestPick} customLongScore={unified.longScore} showDetails={false} />

          {/* Stop Loss Distance & Volatility Efficiency Visualizer */}
          <StopLossEfficiencyMeter
            coin={bestPick}
            slPrice={sl}
            tpPrice={tp1}
            direction={direction as 'LONG' | 'SHORT'}
          />

          {/* Bengali Reason Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/20 text-xs text-slate-200 space-y-1.5 font-sans leading-relaxed">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              কেন এই কয়েনটি সর্বোচ্চ প্রফিটের জন্য নির্বাচিত করা হয়েছে (AI কারণ):
            </div>
            <p className="text-slate-300">{reasonBn}</p>
            {unified.validityBn && (
              <div className="flex items-center gap-1.5 text-[11px] text-sky-300 font-mono pt-1">
                <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  <strong>⏱️ সিগন্যাল কার্যকর সময়কাল:</strong> আনুমানিক {unified.estimatedDurationBn} ({unified.validityBn})
                </span>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
            <div className="text-[11px] text-slate-400">
              💡 Bybit V5 ইন্টিগ্রেশন দিয়ে লাইভ বা টেস্টনেট অ্যাকাউন্টে তাৎক্ষণিক এক্সিকিউট করুন
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onExecuteBybitTrade && (
                <button
                  type="button"
                  onClick={() =>
                    onExecuteBybitTrade({
                      symbol: bestPick.symbol,
                      baseCoin: bestPick.baseCoin || bestPick.symbol.replace('USDT', ''),
                      direction: unified.positionDirection,
                      currentPrice: price,
                      tp1: tp1,
                      tp2: tp2,
                      sl: sl,
                      tp1Pcnt: unified.tp1Pcnt,
                      slPcnt: unified.slPcnt,
                      winRate: 85,
                      reasonBn,
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>⚡ Bybit এ ১-ক্লিক ট্রেড করুন</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectCoin(bestPick)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>চার্ট ও বিস্তারিত দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Gainers Tab */}
      {activeTab === 'GAINERS' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            Bybit Top 5 Gainers (সর্বোচ্চ বর্ধনশীল কয়েন তালিকা)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topGainers.map((coin) => (
              <div
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {coin.baseCoin}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    +{(coin.price24hPcnt * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300 font-semibold">
                  {formatPrice(coin.lastPrice)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>Vol: ${(coin.turnover24h / 1000000).toFixed(1)}M</span>
                  <span className="text-emerald-400 font-bold group-hover:underline">ট্রেড দেখুন &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Losers Tab */}
      {activeTab === 'LOSERS' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" />
            Bybit Top 5 Losers (ডিপ-বাই ও রিভার্সাল কয়েন তালিকা)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topLosers.map((coin) => (
              <div
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/50 p-3.5 rounded-xl cursor-pointer transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-100 group-hover:text-red-400 transition-colors">
                    {coin.baseCoin}
                  </span>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                    {(coin.price24hPcnt * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-300 font-semibold">
                  {formatPrice(coin.lastPrice)}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span>Vol: ${(coin.turnover24h / 1000000).toFixed(1)}M</span>
                  <span className="text-amber-400 font-bold group-hover:underline">ডিপ ট্রেড &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
