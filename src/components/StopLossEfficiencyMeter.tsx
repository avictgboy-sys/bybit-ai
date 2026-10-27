import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  History,
  BarChart2,
  Flame,
  Radio,
  Waves,
  Sparkles,
} from 'lucide-react';
import { KlinePoint, TickerData } from '../types';
import { calculateSlEfficiency, SlEfficiencyAnalysis } from '../utils/slEfficiency';
import { formatPrice } from '../utils/formatters';
import { HistoricalSlPerformanceModal } from './HistoricalSlPerformanceModal';
import { SmartSlSuggestionModal, SmartSlSuggestionButton } from './SmartSlSuggestionModal';

interface StopLossEfficiencyMeterProps {
  coin: TickerData;
  slPrice: number;
  tpPrice?: number;
  direction?: 'LONG' | 'SHORT' | string;
  atr?: number;
  compact?: boolean;
  klines?: KlinePoint[];
  onApplySmartSl?: (newSlPrice: number, newSlPcnt: number) => void;
}


/**
 * Reusable Visual Indicator Icon component displayed directly next to the SL Distance.
 * Pulses when current volatility is exceptionally high compared to 24h average.
 */
export const SlDistanceVolatilityIcon: React.FC<{
  analysis: SlEfficiencyAnalysis;
  showText?: boolean;
  className?: string;
}> = ({ analysis, showText = false, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (analysis.isExceptionallyVolatile) {
    return (
      <div className={`relative inline-flex items-center gap-1 align-middle ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip((prev) => !prev);
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 text-[10px] font-bold transition-all shadow-sm shadow-rose-900/30 cursor-pointer"
          title={analysis.marketNoiseWarningBn}
          aria-label="High Market Volatility Noise Alert"
        >
          {/* Pulsing Glow Animation */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>

          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />

          {showText && (
            <span className="text-[10px] font-black uppercase text-rose-300 font-mono tracking-tight animate-pulse">
              Noise Alert ({analysis.volatilitySurgeRatio}x)
            </span>
          )}
        </button>

        {/* Hover / Click Popover Tooltip */}
        {showTooltip && (
          <div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2.5 rounded-xl bg-slate-900/95 border border-rose-500/50 shadow-2xl text-left z-50 text-xs backdrop-blur-md animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 text-rose-400 font-bold pb-1 border-b border-rose-500/30">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>উচ্চ ভোলাটিলিটি নয়েজ সতর্কতা</span>
            </div>
            <p className="text-[11px] text-slate-200 mt-1.5 leading-relaxed font-sans">
              বর্তমান ভোলাটিলিটি ২৪ ঘণ্টার গড়ের চেয়ে <strong>{analysis.volatilitySurgeRatio}x বেশি</strong>। স্বাভাবিক মার্কেট নয়েজ বা উইক স্পাইকেই স্টপ-লস (-{analysis.slDistancePcnt}%) অকালে ট্রিগার হওয়ার উচ্চ ঝুঁকি রয়েছে।
            </p>
            <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-amber-300 font-mono">
              💡 প্রস্তাবিত নিরাপদ বাফার: ≥{analysis.recommendedMinSlPcnt}%
            </div>
          </div>
        )}
      </div>
    );
  }

  // Normal Volatility State
  return (
    <div className={`relative inline-flex items-center gap-1 align-middle ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip((prev) => !prev);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="group relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold transition-all cursor-pointer"
        title="স্বাভাবিক ভোলাটিলিটি: এসএল নিরাপদ নয়েজ রেঞ্জে রয়েছে"
      >
        <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
        {showText && (
          <span className="text-[10px] text-emerald-300/90 font-mono">Normal Vol</span>
        )}
      </button>

      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 p-2 rounded-xl bg-slate-900/95 border border-emerald-500/40 shadow-2xl text-left z-50 text-xs backdrop-blur-md animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold pb-1 border-b border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>স্বাভাবিক মার্কেট নয়েজ</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">
            এসএল দূরত্ব (-{analysis.slDistancePcnt}%) বর্তমান ২৪ ঘণ্টার স্বাভাবিক রেঞ্জে সুরক্ষিত রয়েছে।
          </p>
        </div>
      )}
    </div>
  );
};

export const StopLossEfficiencyMeter: React.FC<StopLossEfficiencyMeterProps> = ({
  coin,
  slPrice,
  tpPrice,
  direction = 'LONG',
  atr,
  compact = false,
  klines,
  onApplySmartSl,
}) => {

  const [isExpanded, setIsExpanded] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isSmartSlModalOpen, setIsSmartSlModalOpen] = useState(false);
  const analysis = calculateSlEfficiency(coin, slPrice, direction, atr);

  // Derived suggested TP % if not provided
  const derivedTpPcnt = tpPrice && tpPrice > 0 && coin.lastPrice > 0
    ? Number((Math.abs(tpPrice - coin.lastPrice) / coin.lastPrice * 100).toFixed(1))
    : 5.8;

  if (compact) {
    return (
      <>
        <div className={`p-2.5 rounded-xl border ${analysis.badgeBg} flex items-center justify-between gap-2 text-xs transition-all`}>
          <div className="flex items-center gap-2 min-w-0">
            {analysis.isTooTight ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                SL Efficiency ({analysis.volatility24hPcnt}% 24h Vol)
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`font-mono font-bold text-xs ${analysis.badgeColor}`}>
                  {analysis.statusLabelEn} (-{analysis.slDistancePcnt}%)
                </span>
                {/* Visual Volatility / Noise Pulse Indicator Icon */}
                <SlDistanceVolatilityIcon analysis={analysis} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <SmartSlSuggestionButton
              onClick={() => setIsSmartSlModalOpen(true)}
              noiseLevel={analysis.volatilityLevel === 'EXTREME' ? 'EXTREME' : analysis.volatilityLevel === 'HIGH' ? 'HIGH' : undefined}
              compact={true}
            />

            <button
              type="button"
              onClick={() => setIsPerformanceModalOpen(true)}
              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
              title="View 30-Day Historical SL Performance"
            >
              <History className="w-3 h-3" />
              <span>30D</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">
                Score
              </span>
              <span className={`font-mono font-black text-xs ${analysis.badgeColor}`}>
                {analysis.efficiencyScore}/100
              </span>
            </div>
          </div>
        </div>

        <HistoricalSlPerformanceModal
          isOpen={isPerformanceModalOpen}
          onClose={() => setIsPerformanceModalOpen(false)}
          coin={coin}
          initialSlPcnt={analysis.slDistancePcnt}
          initialTpPcnt={derivedTpPcnt}
          direction={direction}
          klines={klines}
        />

        <SmartSlSuggestionModal
          isOpen={isSmartSlModalOpen}
          onClose={() => setIsSmartSlModalOpen(false)}
          coin={coin}
          currentSlPrice={slPrice}
          direction={direction}
          klines={klines}
          onApplySmartSl={onApplySmartSl}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`rounded-2xl border ${
          analysis.isTooTight || analysis.isExceptionallyVolatile
            ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/40 shadow-rose-950/20'
            : 'bg-gradient-to-br from-slate-900/95 via-slate-900 to-slate-950 border-slate-800/90'
        } p-3.5 sm:p-4 shadow-xl space-y-3 transition-all`}
      >
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border shrink-0 ${
                analysis.isTooTight || analysis.isExceptionallyVolatile
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {analysis.isTooTight || analysis.isExceptionallyVolatile ? (
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                  🛡️ স্টপ-লস কার্যকারিতা ও বাফার মিটার (SL Efficiency)
                </span>
                <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${analysis.badgeBg}`}>
                  {analysis.statusLabelBn}
                </span>
                {/* Visual Indicator Icon next to SL Distance status */}
                <SlDistanceVolatilityIcon analysis={analysis} showText={true} />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ২৪ ঘণ্টার হিস্টোরিক্যাল ভোলাটিলিটি ({analysis.volatility24hPcnt}%) এবং ক্যান্ডেলস্টিক নয়েজের প্রেক্ষিতে এসএল সুরক্ষা
              </p>
            </div>
          </div>

          {/* Action Buttons: Smart SL Suggestion, Historical SL Performance & Efficiency Score Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto font-mono flex-wrap">
            {/* SMART SL SUGGESTION BUTTON */}
            <SmartSlSuggestionButton
              onClick={() => setIsSmartSlModalOpen(true)}
              noiseLevel={analysis.volatilityLevel === 'EXTREME' ? 'EXTREME' : analysis.volatilityLevel === 'HIGH' ? 'HIGH' : undefined}
            />

            <button
              type="button"
              onClick={() => setIsPerformanceModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold font-sans flex items-center gap-1.5 shadow-sm shadow-amber-950/40 transition-all cursor-pointer"
              title="View Historical SL Performance (30 Days)"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>30D SL History</span>
            </button>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-sans block">
                বাফার স্কোর
              </span>
              <span className={`text-base sm:text-lg font-black ${analysis.badgeColor}`}>
                {analysis.efficiencyScore} <span className="text-xs text-slate-500">/ 100</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all text-xs flex items-center gap-1 cursor-pointer"
              title="Toggle details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>


        {/* Warning Banner if SL is dangerously tight or High Volatility Noise is Surge */}
        {(analysis.warningBn || analysis.isExceptionallyVolatile) && (
          <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
            analysis.isTooTight || analysis.isExceptionallyVolatile
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/30'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
              analysis.isTooTight || analysis.isExceptionallyVolatile ? 'text-rose-400 animate-bounce' : 'text-amber-400'
            }`} />
            <div className="space-y-1">
              <p className="font-semibold leading-relaxed">
                {analysis.warningBn || analysis.marketNoiseWarningBn}
              </p>
              <p className="text-[11px] text-slate-300">
                💡 <strong>পরামর্শ:</strong> {analysis.recommendationBn}
              </p>
            </div>
          </div>
        )}

        {/* Visual SL Distance Bar vs Volatility Zones */}
        <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Current Price: <strong className="text-slate-200">${formatPrice(analysis.currentPrice)}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Stop Loss:</span>
              <strong className={`font-mono ${analysis.badgeColor}`}>
                ${formatPrice(analysis.slPrice)} (-{analysis.slDistancePcnt}%)
              </strong>
              {/* Visual Indicator Icon next to SL Distance */}
              <SlDistanceVolatilityIcon analysis={analysis} />
            </div>
          </div>

          {/* Visual Progress Bar with Zone Markers */}
          <div className="relative pt-1 pb-3">
            <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              {/* Danger Zone (0 - 2.8%) */}
              <div className="w-[30%] bg-rose-500/30 border-r border-rose-500/40" title="High Risk / Wick Stop Zone (<2.8%)" />
              {/* Moderate Zone (2.8 - 4.5%) */}
              <div className="w-[25%] bg-amber-500/30 border-r border-amber-500/40" title="Moderate Buffer Zone (2.8-4.5%)" />
              {/* Optimal Safe Zone (4.5%+ ) */}
              <div className="w-[45%] bg-emerald-500/30" title="Optimal Anti-Wick Zone (>4.5%)" />
            </div>

            {/* Marker Needle showing current SL Distance position */}
            <div
              className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500"
              style={{
                left: `${Math.min(96, Math.max(4, (analysis.slDistancePcnt / 8.0) * 100))}%`,
              }}
            >
              <div className={`w-3.5 h-3.5 rounded-full ${analysis.barColor} border-2 border-slate-950 shadow-md flex items-center justify-center`}>
                {analysis.isExceptionallyVolatile && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60"></span>
                )}
              </div>
              <span className={`text-[9px] font-mono font-black mt-0.5 px-1 rounded bg-slate-950 border border-slate-800 flex items-center gap-0.5 ${analysis.badgeColor}`}>
                {analysis.slDistancePcnt}%
                {analysis.isExceptionallyVolatile && (
                  <Flame className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span className="text-rose-400/80">⚠️ বিপদজনক (&lt;2.8%)</span>
            <span className="text-amber-400/80">⚡ মাঝারি (৩-৪.৫%)</span>
            <span className="text-emerald-400/80">🛡️ সুরক্ষিত (&gt;৪.৫%)</span>
          </div>
        </div>

        {/* Expandable Technical Details Section */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs animate-fadeIn">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">২৪ ঘণ্টার ভোলাটিলিটি</span>
              <span className="font-mono font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                {analysis.volatility24hPcnt}% ({analysis.volatilityLevel})
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">প্রস্তাবিত ন্যূনতম এসএল বাফার</span>
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                ≥ {analysis.recommendedMinSlPcnt}%
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">টাকা/পয়সায় এসএল ড্রপ</span>
              <span className="font-mono font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                {direction === 'SHORT' ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                )}
                ${formatPrice(analysis.slDistanceAmount)}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 block">৩০ দিনের হিস্ট্রি রিপোর্ট</span>
              <button
                type="button"
                onClick={() => setIsPerformanceModalOpen(true)}
                className="mt-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 text-left"
              >
                <History className="w-3 h-3" />
                ব্যাকটেস্ট ওপেন করুন →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical SL Performance Modal */}
      <HistoricalSlPerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        coin={coin}
        initialSlPcnt={analysis.slDistancePcnt}
        initialTpPcnt={derivedTpPcnt}
        direction={direction}
        klines={klines}
      />

      {/* Smart SL Suggestion Modal */}
      <SmartSlSuggestionModal
        isOpen={isSmartSlModalOpen}
        onClose={() => setIsSmartSlModalOpen(false)}
        coin={coin}
        currentSlPrice={slPrice}
        direction={direction}
        klines={klines}
        onApplySmartSl={onApplySmartSl}
      />
    </>
  );
};

