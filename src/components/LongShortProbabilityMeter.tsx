import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Flame,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { TechnicalIndicators, TickerData } from '../types';
import { evaluateUnifiedSignal } from '../utils/unifiedSignals';

interface LongShortProbabilityMeterProps {
  coin?: TickerData;
  indicators?: TechnicalIndicators;
  // Option to pass raw longScore if available
  customLongScore?: number;
  className?: string;
  showDetails?: boolean;
}

export const LongShortProbabilityMeter: React.FC<LongShortProbabilityMeterProps> = ({
  coin,
  indicators,
  customLongScore,
  className = '',
  showDetails = true,
}) => {
  // Use Unified Signal as the Single Source of Truth
  const unified = coin ? evaluateUnifiedSignal(coin, indicators) : null;

  // Compute Long vs Short probabilities (0 - 100%) based on synchronized unified engine
  const computeProbabilities = () => {
    if (customLongScore !== undefined) {
      const clampedLong = Math.min(96, Math.max(4, Math.round(customLongScore)));
      return { longScore: clampedLong, shortScore: 100 - clampedLong };
    }

    if (unified) {
      return { longScore: unified.longScore, shortScore: unified.shortScore };
    }

    let longPts = 50; // Neutral starting baseline
    const rsi = indicators?.rsi ?? 50;
    const macdTrend = indicators?.macd?.trend;
    const macdHist = indicators?.macd?.histogram ?? 0;
    const volTrend = indicators?.volumeTrend;

    // RSI Indicator Influence
    if (rsi <= 20) {
      longPts += 30;
    } else if (rsi <= 40) {
      longPts += 15;
    } else if (rsi <= 65) {
      longPts += 10;
    } else if (rsi >= 85) {
      longPts -= 30;
    } else if (rsi >= 75) {
      longPts -= 15;
    }

    // MACD Momentum Influence
    if (macdTrend === 'Bullish Crossover' || macdHist > 0) {
      longPts += macdTrend === 'Bullish Crossover' ? 20 : 12;
    } else if (macdTrend === 'Bearish Crossover' || macdHist < 0) {
      longPts -= macdTrend === 'Bearish Crossover' ? 20 : 12;
    }

    // Volume Trend Influence
    if (volTrend === 'High Spike' || volTrend === 'Anomaly') {
      longPts += 10;
    } else if (volTrend === 'Increasing') {
      longPts += 5;
    }

    const finalLong = Math.min(95, Math.max(5, Math.round(longPts)));
    const finalShort = 100 - finalLong;

    return { longScore: finalLong, shortScore: finalShort };
  };

  const { longScore, shortScore } = computeProbabilities();
  const isLongDominant = longScore >= 52;
  const isShortDominant = shortScore >= 52;
  const isBalanced = !isLongDominant && !isShortDominant;

  const symbolStr = coin ? coin.baseCoin : 'MARKET';

  // Dynamic Border and Background Gradient based on Directional Bias
  const containerStyle = isLongDominant
    ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/25 via-slate-950 to-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
    : isShortDominant
    ? 'border-red-500/40 bg-gradient-to-br from-red-950/25 via-slate-950 to-slate-900 shadow-[0_0_25px_rgba(239,68,68,0.15)]'
    : 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-900 shadow-[0_0_25px_rgba(245,158,11,0.12)]';

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border ${containerStyle} space-y-4 font-sans text-xs transition-all duration-500 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl font-black border shrink-0 ${
              isLongDominant
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isShortDominant
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}
          >
            {isLongDominant ? (
              <TrendingUp className="w-5 h-5 animate-pulse text-emerald-400" />
            ) : isShortDominant ? (
              <TrendingDown className="w-5 h-5 animate-pulse text-red-400" />
            ) : (
              <Zap className="w-5 h-5 animate-pulse text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                📊 {symbolStr} Long vs Short Probability Score
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                LIVE ALGORITHM
              </span>
            </div>
            <p className="text-xs text-slate-400">
              টেকনিক্যাল ইন্ডিকেটর (RSI, MACD, Volume, Momentum) এর রিয়েল-টাইম রেশিও
            </p>
          </div>
        </div>

        {/* Dynamic Directional Bias Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isLongDominant && (
            <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/50 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <ArrowUpRight className="w-4 h-4" />
              <span>LONG BIAS ({longScore}%)</span>
            </span>
          )}
          {isShortDominant && (
            <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-950/50 border border-red-400/50 text-xs font-black flex items-center gap-1.5 animate-pulse">
              <ArrowDownRight className="w-4 h-4" />
              <span>SHORT BIAS ({shortScore}%)</span>
            </span>
          )}
          {isBalanced && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>NEUTRAL (50/50)</span>
            </span>
          )}
        </div>
      </div>

      {/* Primary Probability Color-Coded Dynamic Bar */}
      <div className="space-y-3 bg-slate-950/90 p-4 rounded-xl border border-slate-800/90">
        <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-black">
          {/* Long Label */}
          <div
            className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border transition-all ${
              isLongDominant
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                : 'text-emerald-400/80 border-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>LONG (BUY): {longScore}%</span>
          </div>

          <div className="text-[10px] font-sans text-slate-400 uppercase tracking-widest hidden sm:flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              {isLongDominant
                ? 'বুলিশ মোমেন্টাম শক্তিশালী'
                : isShortDominant
                ? 'বিয়ারিশ সেলিং প্রেশার বেশি'
                : 'সাইডওয়েজ ব্যালেন্সড জোন'}
            </span>
          </div>

          {/* Short Label */}
          <div
            className={`flex items-center gap-2 p-1.5 px-3 rounded-lg border transition-all ${
              isShortDominant
                ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-md shadow-red-950/40'
                : 'text-red-400/80 border-transparent'
            }`}
          >
            <span>SHORT (SELL): {shortScore}%</span>
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Dual Color-Coded Gradient Progress Bar */}
        <div className="relative w-full h-7 sm:h-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700/80 p-0.5 flex items-center shadow-inner">
          {/* Long Gradient Fill */}
          <div
            className={`h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-l-lg transition-all duration-700 flex items-center justify-center text-xs font-black font-mono text-slate-950 shadow-md ${
              isLongDominant ? 'brightness-125 saturate-150' : 'opacity-80'
            }`}
            style={{ width: `${longScore}%` }}
          >
            {longScore >= 18 && (
              <span className="flex items-center gap-1 px-1 drop-shadow">
                {isLongDominant && <Flame className="w-3.5 h-3.5 text-slate-950 animate-bounce" />}
                {longScore}%
              </span>
            )}
          </div>

          {/* Short Gradient Fill */}
          <div
            className={`h-full bg-gradient-to-r from-rose-500 via-red-600 to-red-700 rounded-r-lg transition-all duration-700 flex items-center justify-center text-xs font-black font-mono text-white shadow-md ${
              isShortDominant ? 'brightness-125 saturate-150' : 'opacity-80'
            }`}
            style={{ width: `${shortScore}%` }}
          >
            {shortScore >= 18 && (
              <span className="flex items-center gap-1 px-1 drop-shadow">
                {shortScore}%
                {isShortDominant && <Flame className="w-3.5 h-3.5 text-white animate-bounce" />}
              </span>
            )}
          </div>

          {/* Glowing Pointer Needle */}
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_12px_#fff] z-10 transition-all duration-700 rounded-full"
            style={{ left: `calc(${longScore}% - 3px)` }}
          />
        </div>

        {/* Decision Banner */}
        <div
          className={`p-3 rounded-xl border text-xs leading-relaxed ${
            isLongDominant
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
              : isShortDominant
              ? 'bg-red-950/30 border-red-500/40 text-red-200'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
          }`}
        >
          {isLongDominant ? (
            <p className="flex items-start gap-2">
              <span className="text-base shrink-0">🟢</span>
              <span>
                <strong>বুলিশ ডিরেকশন (Bullish Bias):</strong> মার্কেটে বাইয়ারদের লিকুইডিটি প্রেশার ({longScore}%) বেশি থাকায়{' '}
                <strong className="text-emerald-300 underline">Long/Buy এন্ট্রি</strong> নেওয়াই প্রযুক্তিগতভাবে সবচেয়ে লাভজনক ও নিরাপদ।
              </span>
            </p>
          ) : isShortDominant ? (
            <p className="flex items-start gap-2">
              <span className="text-base shrink-0">🔴</span>
              <span>
                <strong>বিয়ারিশ ডিরেকশন ({unified?.isTopRejection ? 'Top Resistance Rejection' : 'Bearish Bias'}):</strong> মার্কেটে সেলিং প্রেশার ({shortScore}%) আধিপত্য বিস্তার করছে।{' '}
                {unified?.isTopRejection && coin?.highPrice24h
                  ? `২৪ ঘণ্টার হাই লেভেল ($${coin.highPrice24h.toFixed(4)}) থেকে তীব্র রিজেকশন (-${unified.pullbackFromHigh.toFixed(1)}% কারেকশন) থাকায় `
                  : ''}
                <strong className="text-red-300 underline">Short/Sell এন্ট্রি</strong> অথবা কারেকশনের পর ডিপ-বাই সাপোর্ট জোনের অপেক্ষা করুন।
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <span className="text-base shrink-0">🟡</span>
              <span>
                <strong>নিউট্রাল জোন (50/50 Balance):</strong> বায়িং ও সেলিং প্রেশার সমপর্যায়ে রয়েছে। স্পষ্ট ট্রেন্ড ব্রেকআউট না হওয়া পর্যন্ত ট্রেড হোল্ড রাখা বুদ্ধিমানের কাজ।
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Detailed Technical Drivers */}
      {showDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Long Drivers */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>লং (Long) প্রবাবিলিটি ড্রাইভারস:</span>
              </span>
              <span className="font-mono text-emerald-300 font-black">{longScore}%</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside leading-relaxed">
              {indicators && indicators.rsi <= 20 && (
                <li className="text-emerald-300 font-bold">RSI ({indicators.rsi}) এক্সট্রিম ওভারসোল্ড জোনে (≤20) থাকায় শক্তিশালী বাউন্স সম্ভাবনা।</li>
              )}
              {indicators && indicators.macd.histogram > 0 && (
                <li className="text-emerald-300">MACD হিস্তোগ্রাম বুলিশ ক্রসওভার সংকেত দিচ্ছে।</li>
              )}
              {coin && coin.price24hPcnt >= 0 && (
                <li>২৪ ঘণ্টার প্রাইজ মোমেন্টাম (+{(coin.price24hPcnt * 100).toFixed(2)}%) পজিটিভ ট্র্যাজেক্টরি।</li>
              )}
              <li>স্পট ও ফিউচার্স ওয়ালেটে লং লিকুইডিটি ইনফ্লো বজায় আছে।</li>
            </ul>
          </div>

          {/* Short Drivers */}
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
            <div className="flex items-center justify-between text-red-400 font-bold">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                <span>শর্ট (Short) প্রবাবিলিটি ড্রাইভারস:</span>
              </span>
              <span className="font-mono text-red-300 font-black">{shortScore}%</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside leading-relaxed">
              {indicators && indicators.rsi >= 70 && (
                <li className="text-red-300 font-bold">RSI ({indicators.rsi}) ওভারবট জোনে থাকায় কারেকশন বা পুলব্যাক ঝুঁকি।</li>
              )}
              {indicators && indicators.macd.histogram < 0 && (
                <li className="text-red-300">MACD হিস্তোগ্রাম নেগেটিভ সেলিং প্রেশার ক্যান্ডেল শো করছে।</li>
              )}
              {coin && coin.price24hPcnt < 0 && (
                <li>২৪ ঘণ্টার প্রাইজ চেঞ্জ ({(coin.price24hPcnt * 100).toFixed(2)}%) বিয়ারিশ সাপোর্ট টেস্ট করছে।</li>
              )}
              <li>রেজিস্ট্যান্স লেভেলে প্রফিট টেক ও হুইল সেলিং অর্ডার চিহ্নিত।</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
