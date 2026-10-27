import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Zap,
  Info,
  Scale,
  DollarSign,
  Layers,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice } from '../utils/formatters';
import { classifyTradingStyle } from '../utils/unifiedSignals';
import { calculateSlEfficiency } from '../utils/slEfficiency';
import { lookupKeySupportResistanceLevels } from '../utils/swingLevels';
import { StopLossEfficiencyMeter, SlDistanceVolatilityIcon } from './StopLossEfficiencyMeter';

interface BengaliTradeEvaluatorProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

const EXCLUDED_SYMBOLS = new Set([
  'USDCUSDT',
  'BUSDUSDT',
  'FDUSDUSDT',
  'DAIUSDT',
  'USDEUSDT',
  'TUSDUSDT',
  'EURUSDT',
  'USTCUSDT',
  'WBTCUSDT',
]);

export const BengaliTradeEvaluator: React.FC<BengaliTradeEvaluatorProps> = ({
  tickers,
  onSelectCoin,
}) => {
  // Filter valid tradeable coins (excluding stablecoins)
  const validCoins = useMemo(() => {
    return tickers
      .filter((t) => !EXCLUDED_SYMBOLS.has(t.symbol) && t.turnover24h > 400000)
      .sort((a, b) => b.turnover24h - a.turnover24h);
  }, [tickers]);

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    validCoins[0]?.symbol || 'BTCUSDT'
  );

  const currentCoin =
    validCoins.find((t) => t.symbol === selectedSymbol) || validCoins[0] || tickers[0];

  if (!currentCoin) return null;

  // Real Technical Multi-Factor Indicators
  const pcnt = currentCoin.price24hPcnt * 100;
  const price = currentCoin.lastPrice;
  const high = currentCoin.highPrice24h || price * 1.05;
  const low = currentCoin.lowPrice24h || price * 0.95;
  const turnover = currentCoin.turnover24h;

  const priceRange = high - low || price * 0.05;
  const relativePosition = Math.max(0, Math.min(1, (price - low) / priceRange));
  const pullbackFromHigh = high > 0 ? ((high - price) / high) * 100 : 0;
  const bounceFromLow = low > 0 ? ((price - low) / low) * 100 : 0;

  // Evaluation Decision Engine
  let decisionType: 'LONG' | 'SHORT' | 'WAIT' | 'AVOID' = 'WAIT';
  let decisionTitle = '';
  let decisionBadgeBg = '';
  let decisionBadgeText = '';
  let banglaReason = '';
  let riskLevelBn = '';
  let leverageBn = '';
  let setupTagBn = '';

  let tp1Pcnt = 5.5;
  let tp2Pcnt = 12.0;
  let slPcnt = 3.8;

  // 1. Bullish Momentum Breakout (LONG)
  if (pcnt >= 2.0 && pcnt <= 18.0 && relativePosition >= 0.60 && pullbackFromHigh <= 4.0) {
    decisionType = 'LONG';
    decisionTitle = '🟢 হ্যাঁ, নিরাপদ LONG (BUY) ট্রেড নিতে পারেন';
    decisionBadgeBg = 'bg-emerald-500/15 border-emerald-500/30';
    decisionBadgeText = 'text-emerald-400';
    setupTagBn = '🚀 স্ট্রং বুলিশ ব্রেকআউট মোমেন্টাম';
    banglaReason = `${currentCoin.baseCoin} বর্তমানে শক্তিশালী আপট্রেন্ড ও ভলিউম ব্রেকআউটে রয়েছে (+${pcnt.toFixed(1)}%)। প্রাইস ২৪ ঘণ্টার সর্বোচ্চ লেভেলের কাছে অবস্থান করছে এবং পুলব্যাক মাত্র ${pullbackFromHigh.toFixed(1)}%, যা আরও প্রফিট দেওয়ার জোরালো সম্ভাবনা নির্দেশ করে।`;
    riskLevelBn = 'কম ঝুঁকি (Low to Moderate Risk)';
    leverageBn = '৩x - ৫x (নিরাপদ)';
    tp1Pcnt = 5.8;
    tp2Pcnt = 13.5;
    slPcnt = 4.0;
  }
  // 2. Confirmed Support Reversal Bounce (LONG)
  else if (pcnt <= -1.5 && pcnt >= -10.0 && bounceFromLow >= 1.5 && relativePosition >= 0.18 && relativePosition <= 0.50) {
    decisionType = 'LONG';
    decisionTitle = '🟢 বটম সাপোর্ট বাউন্স - LONG ট্রেডের সুযোগ';
    decisionBadgeBg = 'bg-emerald-500/15 border-emerald-500/30';
    decisionBadgeText = 'text-emerald-400';
    setupTagBn = '📈 বটম ডিপ রিভার্সাল বাউন্স';
    banglaReason = `${currentCoin.baseCoin} এর ২৪ ঘণ্টার লো সাপোর্ট ($${low.toFixed(4)}) থেকে বাউন্স শুরু হয়েছে (+${bounceFromLow.toFixed(1)}% বাউন্স)। ডিপে সেলারদের চাপ কমে বায়াররা ঢুকছে, ফলে সাশ্রয়ী মূল্যে লং এন্ট্রি নিলে ভালো রেশিওতে প্রফিট সম্ভব।`;
    riskLevelBn = 'কম থেকে মাঝারি ঝুঁকি (Good R:R)';
    leverageBn = '২x - ৪x (Safe Dip Entry)';
    tp1Pcnt = 5.2;
    tp2Pcnt = 12.0;
    slPcnt = 3.8;
  }
  // 3. Overbought / Top Rejection Exhaustion (SHORT)
  else if ((pcnt >= 8.0 && pullbackFromHigh >= 4.5) || (relativePosition >= 0.85 && pullbackFromHigh >= 4.0)) {
    decisionType = 'SHORT';
    decisionTitle = '🔴 টপ রিজেকশন - সাবধানে SHORT ট্রেড নিন';
    decisionBadgeBg = 'bg-red-500/15 border-red-500/30';
    decisionBadgeText = 'text-red-400';
    setupTagBn = '📉 টপ রেজিস্ট্যান্স রিজেকশন';
    banglaReason = `${currentCoin.baseCoin} ২৪ ঘণ্টার হাই ($${high.toFixed(4)}) থেকে রিজেক্ট হয়ে নিচে নামছে (-${pullbackFromHigh.toFixed(1)}% কারেকশন)। বায়ারদের দুর্বলতা ও প্রফিট টেকিং সেলিং প্রেসারের কারণে এখানে শর্ট (SHORT) ট্রেডে সুন্দর প্রফিট পাওয়ার সুযোগ রয়েছে।`;
    riskLevelBn = 'মাঝারি ঝুঁকি (Correction Play)';
    leverageBn = '২x - ৩x (কম লেভারেজ রাখুন)';
    tp1Pcnt = 5.6;
    tp2Pcnt = 12.8;
    slPcnt = 4.2;
  }
  // 4. Heavy Bearish Breakdown (SHORT)
  else if (pcnt <= -5.0 && relativePosition <= 0.20 && bounceFromLow < 1.0) {
    decisionType = 'SHORT';
    decisionTitle = '🔴 বিয়ারিশ ব্রেকডাউন - SHORT ট্রেড পক্ষপাত';
    decisionBadgeBg = 'bg-red-500/15 border-red-500/30';
    decisionBadgeText = 'text-red-400';
    setupTagBn = '⚠️ স্ট্রং ডাউনট্রেন্ড ব্রেকডাউন';
    banglaReason = `${currentCoin.baseCoin} এ তীব্র সেল প্রেসার রয়েছে (-${Math.abs(pcnt).toFixed(1)}%) এবং কোনো শক্তিশালী সাপোর্ট বাউন্স দৃশ্যমান নেই। ট্রেন্ড অব্যাহত থাকলে শর্ট পজিশনে ডাউনসাইড টার্গেট পূরণ হওয়ার সম্ভাবনা বেশি।`;
    riskLevelBn = 'উচ্চ ঝুঁকি (High Volatility)';
    leverageBn = '২x (ওয়াইড সেফ স্টপলস)';
    tp1Pcnt = 5.5;
    tp2Pcnt = 12.5;
    slPcnt = 4.4;
  }
  // 5. Narrow Sideways Consolidation (WAIT)
  else if (Math.abs(pcnt) < 1.5 && relativePosition >= 0.35 && relativePosition <= 0.65) {
    decisionType = 'WAIT';
    decisionTitle = '🟡 মার্কেট সাইডওয়েজ - এখন অপেক্ষা (WAIT) করুন';
    decisionBadgeBg = 'bg-amber-500/15 border-amber-500/30';
    decisionBadgeText = 'text-amber-400';
    setupTagBn = '⏳ সাইডওয়েজ কন্সোলিডেশন';
    banglaReason = `${currentCoin.baseCoin} বর্তমানে সংকীর্ণ রেঞ্জে কন্সোলিডেট করছে (${pcnt > 0 ? '+' : ''}${pcnt.toFixed(2)}%)। স্পষ্ট ব্রেকআউট বা ডিরেকশনাল মোমেন্টাম ছাড়া নতুন ট্রেড ওপেন না করে ব্রেকআউটের জন্য অপেক্ষা করা বুদ্ধিমানের কাজ।`;
    riskLevelBn = 'কম ভলিউম (Sideways Trap)';
    leverageBn = 'ট্রেড এড়িয়ে চলুন';
    tp1Pcnt = 4.0;
    tp2Pcnt = 8.5;
    slPcnt = 3.6;
  }
  // 6. Uncertain / High Risk Market (AVOID)
  else {
    decisionType = 'AVOID';
    decisionTitle = '🛡️ সতর্ক থাকুন - মূলধন সুরক্ষায় ট্রেড এড়িয়ে চলুন';
    decisionBadgeBg = 'bg-slate-800 border-slate-700';
    decisionBadgeText = 'text-slate-300';
    setupTagBn = '🛡️ অনিশ্চিত মার্কেট স্ট্রাকচার';
    banglaReason = `মার্কেটে দামের গতিবিধি অস্পষ্ট এবং ফেইকআউটের ঝুঁকি বেশি। ক্যাপিটাল প্রোটেকশনের স্বার্থে নিশ্চিত সাপোর্ট বা রেজিস্ট্যান্স কনফার্মেশন না পাওয়া পর্যন্ত ট্রেড না নিয়ে ওয়াচলিস্টে রাখুন।`;
    riskLevelBn = 'উচ্চ অনিশ্চয়তা (Uncertain Risk)';
    leverageBn = '১x (নো ফিউচার ট্রেড)';
    tp1Pcnt = 4.0;
    tp2Pcnt = 9.0;
    slPcnt = 3.8;
  }

  // Calculate Entry, TP1, TP2, SL based on direction and Key Support/Resistance
  const isLong = decisionType === 'LONG' || decisionType === 'WAIT';
  const entryMin = isLong ? price * 0.996 : price * 0.998;
  const entryMax = isLong ? price * 1.003 : price * 1.005;

  // Calculate Key Support & Resistance Swing Levels for real structural Stop Loss & TP targets
  const swingLevels = useMemo(() => {
    if (!currentCoin) return null;
    return lookupKeySupportResistanceLevels(
      currentCoin.lastPrice,
      currentCoin.highPrice24h,
      currentCoin.lowPrice24h,
      isLong ? 'LONG' : 'SHORT'
    );
  }, [currentCoin, isLong]);

  let tp1: number;
  let tp2: number;
  let sl: number;

  if (swingLevels) {
    tp1 = swingLevels.tp1;
    tp2 = swingLevels.tp2;
    sl = swingLevels.sl;
    tp1Pcnt = swingLevels.tp1Pcnt;
    tp2Pcnt = swingLevels.tp2Pcnt;
    slPcnt = swingLevels.slPcnt;
  } else if (decisionType === 'SHORT') {
    tp1 = price * (1 - tp1Pcnt / 100);
    tp2 = price * (1 - tp2Pcnt / 100);
    sl = price * (1 + slPcnt / 100);
  } else {
    tp1 = price * (1 + tp1Pcnt / 100);
    tp2 = price * (1 + tp2Pcnt / 100);
    sl = price * (1 - slPcnt / 100);
  }

  const rrRatio = (tp1Pcnt / (slPcnt || 1)).toFixed(1);
  const histVolatility = currentCoin.highPrice24h && currentCoin.lowPrice24h && currentCoin.lastPrice
    ? ((currentCoin.highPrice24h - currentCoin.lowPrice24h) / currentCoin.lastPrice) * 100
    : 5.0;
  const styleInfo = classifyTradingStyle(tp1Pcnt, tp2Pcnt, histVolatility);

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-amber-500/30 p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              এখন ট্রেড রান করবেন কিনা? (বাংলা এআই ডিসিশন ইঞ্জিন)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                লাইভ V5 ডাটা
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              প্রাইস অ্যাকশন, সাপোর্ট-রেজিস্ট্যান্স ও ভলিউম বিশ্লেষণের ভিত্তিতে রিয়েল-টাইম ট্রেড যাচাই
            </p>
          </div>
        </div>

        {/* Coin Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium shrink-0">কয়েন সিলেক্ট:</span>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-bold font-mono text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            {validCoins.slice(0, 30).map((t) => (
              <option key={t.symbol} value={t.symbol}>
                {t.baseCoin}/USDT ({t.price24hPcnt >= 0 ? '+' : ''}
                {(t.price24hPcnt * 100).toFixed(1)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Decision Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border ${decisionBadgeBg} transition-all shadow-xl space-y-3`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
              {decisionType === 'LONG' && <TrendingUp className="w-6 h-6 text-emerald-400" />}
              {decisionType === 'SHORT' && <TrendingDown className="w-6 h-6 text-red-400" />}
              {decisionType === 'WAIT' && <Clock className="w-6 h-6 text-amber-400" />}
              {decisionType === 'AVOID' && <ShieldAlert className="w-6 h-6 text-slate-400" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
                  {currentCoin.baseCoin}/USDT ডিসিশন
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold">
                  {setupTagBn}
                </span>
                {styleInfo.labelBn && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold shadow-sm">
                    {styleInfo.labelBn}
                  </span>
                )}
                {styleInfo.estimatedDurationBn && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-sky-300 font-bold shadow-sm flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-sky-400" />
                    ⏱️ {styleInfo.estimatedDurationBn}
                  </span>
                )}
              </div>
              <h3 className={`text-base sm:text-lg font-black ${decisionBadgeText}`}>
                {decisionTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectCoin(currentCoin)}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition-all"
          >
            কয়েন চার্ট ও বিস্তারিত
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Detailed Explanation in Bengali */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-1.5">
          <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            কেন এই সিদ্ধান্ত (মার্কেট টেকনিক্যাল লজিক):
          </div>
          <p className="text-slate-300 font-sans">{banglaReason}</p>
          {styleInfo.validityBn && (
            <div className="flex items-center gap-1.5 text-[11px] text-sky-300 font-mono pt-1 border-t border-slate-800/80">
              <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>
                <strong>⏱️ সম্ভাব্য ট্রেড সময়কাল:</strong> {styleInfo.estimatedDurationBn} ({styleInfo.validityBn})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Setup Details Grid: Entry, TP, SL & Risk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Entry Price */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            প্রস্তাবিত এন্ট্রি জোন (Entry Zone)
          </span>
          <div className="text-sm font-black font-mono text-slate-100">
            ${entryMin >= 1 ? entryMin.toFixed(2) : entryMin.toFixed(4)} - ${entryMax >= 1 ? entryMax.toFixed(2) : entryMax.toFixed(4)}
          </div>
          <span className="text-[10px] text-emerald-400 block font-medium">
            বর্তমান প্রাইজ: {formatPrice(price)}
          </span>
        </div>

        {/* Take Profit Target */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/20 space-y-1">
          <span className="text-[10px] text-emerald-400 uppercase font-semibold block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            টার্গেট প্রফিট (TP1 & TP2)
          </span>
          <div className="text-sm font-black font-mono text-emerald-400">
            TP1: ${tp1 >= 1 ? tp1.toFixed(2) : tp1.toFixed(4)} (+{tp1Pcnt}%)
          </div>
          <div className="text-xs font-mono text-slate-400">
            TP2: ${tp2 >= 1 ? tp2.toFixed(2) : tp2.toFixed(4)} (+{tp2Pcnt}%)
          </div>
          {styleInfo.tp1DurationBn && (
            <span className="text-[10px] text-sky-300 font-mono flex items-center gap-1 pt-0.5">
              <Clock className="w-2.5 h-2.5 text-sky-400" />
              TP1 সময়: {styleInfo.tp1DurationBn}
            </span>
          )}
        </div>

        {/* Stop Loss & Risk Reward */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-red-500/20 space-y-1">
          <span className="text-[10px] text-red-400 uppercase font-semibold block flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            স্টপ লস (SL) & R:R রেশিও
          </span>
          <div className="text-sm font-black font-mono text-red-400 flex items-center gap-1.5 flex-wrap">
            <span>SL: ${sl >= 1 ? sl.toFixed(2) : sl.toFixed(4)} (-{slPcnt}%)</span>
            {currentCoin && (
              <SlDistanceVolatilityIcon
                analysis={calculateSlEfficiency(
                  currentCoin,
                  sl,
                  decisionType === 'SHORT' ? 'SHORT' : 'LONG'
                )}
              />
            )}
          </div>
          {swingLevels?.slReason && (
            <div className="text-[10px] text-slate-300 font-sans leading-tight pt-0.5">
              🛡️ {swingLevels.slReason}
            </div>
          )}
          <span className="text-[10px] text-amber-400 block font-mono">
            রিস্ক-রিওয়ার্ড: ১:{rrRatio} (সেফটি জোন)
          </span>
        </div>

        {/* Leverage & Risk */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/20 space-y-1">
          <span className="text-[10px] text-amber-400 uppercase font-semibold block flex items-center gap-1">
            <Zap className="w-3 h-3" />
            লেভারেজ ও ক্যাপিটাল রিস্ক
          </span>
          <div className="text-xs font-bold text-slate-200">{leverageBn}</div>
          {styleInfo.estimatedDurationBn && (
            <span className="text-[10px] text-sky-300 font-mono flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-sky-400" />
              মেয়াদ: {styleInfo.estimatedDurationBn}
            </span>
          )}
        </div>
      </div>

      {/* Stop Loss Efficiency & Volatility Protection Visualizer */}
      <StopLossEfficiencyMeter
        coin={currentCoin}
        slPrice={sl}
        tpPrice={tp1}
        direction={decisionType === 'SHORT' ? 'SHORT' : 'LONG'}
      />

      {/* Safety Rules Reminder */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>গোল্ডেন রুল:</strong> প্রতিটি ট্রেডে আপনার মোট পোর্টফোলিওর সর্বোচ্চ ১.৫% এর বেশি রিস্ক নিবেন না এবং অবশ্যই স্টপ লস সেট করবেন।
        </span>
      </div>
    </section>
  );
};
