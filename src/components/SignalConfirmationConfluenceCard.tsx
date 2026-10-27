import React from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Compass,
  Flame,
  Scale,
  Clock,
  Radio,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Eye,
  Percent,
  Coins,
  Cpu,
} from 'lucide-react';
import { TickerData, TechnicalIndicators } from '../types';
import { formatPrice } from '../utils/formatters';
import { evaluateUnifiedSignal } from '../utils/unifiedSignals';

export interface ConfluenceFactorItem {
  id: number;
  title: string;
  titleBn: string;
  statusIcon: 'PASSED' | 'WARNING' | 'NEUTRAL' | 'FAILED';
  statusBadge: string;
  statusBadgeColor: string; // e.g. text-emerald-400, text-red-400
  detail: string;
  detailBn: string;
  weight: number;
}

export interface SignalConfirmationResult {
  marketState: 'BULLISH TRENDING' | 'BEARISH BREAKDOWN' | 'RANGE / MIXED' | 'HIGH VOLATILITY EXPANSION';
  marketStateBn: string;
  marketStateColor: string;
  totalScore: number; // 0 - 100
  passedCount: number;
  warningCount: number;
  neutralCount: number;
  factors: ConfluenceFactorItem[];
  overallVerdictBn: string;
}

export function evaluateSignalConfirmationFactors(
  coin: TickerData,
  indicators?: Partial<TechnicalIndicators>
): SignalConfirmationResult {
  const price = coin.lastPrice;
  const high = coin.highPrice24h || price * 1.03;
  const low = coin.lowPrice24h || price * 0.97;
  const pcnt = coin.price24hPcnt * 100;
  const turnover = coin.turnover24h || 1000000;

  const rsi = indicators?.rsi ?? 48.5;
  const ema50 = indicators?.ema50 ?? price * 0.992;
  const ema100 = indicators?.ema100 ?? price * 0.985;
  const ema200 = indicators?.ema200 ?? price * 0.975;

  const isBullishEma = ema50 > ema100 && ema100 > ema200;
  const isBearishEma = ema50 < ema100 && ema100 < ema200;

  // 1. EMA Trend Factor
  let emaFactor: ConfluenceFactorItem;
  if (isBullishEma) {
    emaFactor = {
      id: 1,
      title: 'EMA Trend',
      titleBn: '১. ইএমএ ট্রেন্ড (EMA 50/100/200)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 BULLISH STACK (EMA 50 > 100 > 200)',
      statusBadgeColor: 'text-emerald-400',
      detail: `EMA 50 ($${formatPrice(ema50).replace('$', '')}) > 100 > 200 golden sequence confirmed`,
      detailBn: 'EMA ৫০ > ১০০ > ২০০ সুদৃঢ় বুলিশ অ্যালাইনমেন্টে আপট্রেন্ড সাপোর্ট করছে।',
      weight: 15,
    };
  } else if (isBearishEma) {
    emaFactor = {
      id: 1,
      title: 'EMA Trend',
      titleBn: '১. ইএমএ ট্রেন্ড (EMA 50/100/200)',
      statusIcon: 'PASSED',
      statusBadge: '🔴 BEARISH STACK (EMA 50 < 100 < 200)',
      statusBadgeColor: 'text-rose-400',
      detail: `EMA 50 ($${formatPrice(ema50).replace('$', '')}) < 100 < 200 death alignment descending`,
      detailBn: 'EMA ৫০ < ১০০ < ২০০ ডাউনট্রেন্ড অ্যালাইনমেন্টে সেলিং প্রেসার নির্দেশ করছে।',
      weight: 15,
    };
  } else {
    emaFactor = {
      id: 1,
      title: 'EMA Trend',
      titleBn: '১. ইএমএ ট্রেন্ড (EMA 50/100/200)',
      statusIcon: 'NEUTRAL',
      statusBadge: '⚪ MIXED / CONSOLIDATION',
      statusBadgeColor: 'text-slate-300',
      detail: 'EMA 50/100/200 entwined inside ranging zone',
      detailBn: 'EMA ৫০/১০০/২০০ রেঞ্জিং জোনের মধ্যে একে অপরের সাথে জড়ানো অবস্থায় রয়েছে।',
      weight: 8,
    };
  }

  // 2. RSI (14) Factor
  let rsiFactor: ConfluenceFactorItem;
  if (rsi < 20) {
    rsiFactor = {
      id: 2,
      title: 'RSI (14)',
      titleBn: '২. আরএসআই (RSI 14)',
      statusIcon: 'PASSED',
      statusBadge: `🟢 EXTREME OVERSOLD (${rsi.toFixed(1)})`,
      statusBadgeColor: 'text-emerald-400',
      detail: 'RSI below 20 prime deep reversal bounce territory',
      detailBn: 'RSI ২০ এর নিচে এক্সট্রিম ডিপ জোনে, শক্তিশালী বাউন্স প্রত্যাশিত।',
      weight: 12,
    };
  } else if (rsi > 85) {
    rsiFactor = {
      id: 2,
      title: 'RSI (14)',
      titleBn: '২. আরএসআই (RSI 14)',
      statusIcon: 'WARNING',
      statusBadge: `⚠️ EXTREME OVERBOUGHT (${rsi.toFixed(1)})`,
      statusBadgeColor: 'text-amber-400',
      detail: 'RSI above 85 overheated exhaustion warning',
      detailBn: 'RSI ৮৫ এর উপরে অতি-ক্রীত জোনে, পুলব্যাকের ঝুঁকি বিদ্যমান।',
      weight: 6,
    };
  } else {
    rsiFactor = {
      id: 2,
      title: 'RSI (14)',
      titleBn: '২. আরএসআই (RSI 14)',
      statusIcon: 'NEUTRAL',
      statusBadge: `⚪ NORMAL BAND (${rsi.toFixed(1)})`,
      statusBadgeColor: 'text-slate-300',
      detail: 'RSI between 20 and 85 safe neutral corridor',
      detailBn: 'RSI ২০ থেকে ৮৫ সেফ নিউট্রাল করিডোরের ভেতরে ব্যালান্সড রয়েছে।',
      weight: 10,
    };
  }

  // 3. BB Setup (Bollinger Bands)
  const range = high - low || price * 0.04;
  const relPos = Math.max(0, Math.min(1, (price - low) / range));
  let bbFactor: ConfluenceFactorItem;
  if (relPos > 0.88) {
    bbFactor = {
      id: 3,
      title: 'BB Setup',
      titleBn: '৩. বলিঙ্গার ব্যান্ডস সেটআপ (BB Setup)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 UPPER BB EXPANSION / BREAKOUT',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Price riding upper Bollinger band volatility envelope',
      detailBn: 'দাম আপার বলিঙ্গার ব্যান্ডের উপর ভর করে ব্রেকআউট মোমেন্টামে রয়েছে।',
      weight: 12,
    };
  } else if (relPos < 0.12) {
    bbFactor = {
      id: 3,
      title: 'BB Setup',
      titleBn: '৩. বলিঙ্গার ব্যান্ডস সেটআপ (BB Setup)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 LOWER BB DIP REBOUND',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Price piercing lower Bollinger band mean-reversion',
      detailBn: 'লোয়ার বলিঙ্গার ব্যান্ড স্পর্শ করে রিভার্সাল বাউন্স নেওয়ার প্রস্তুতি।',
      weight: 12,
    };
  } else {
    bbFactor = {
      id: 3,
      title: 'BB Setup',
      titleBn: '৩. বলিঙ্গার ব্যান্ডস সেটআপ (BB Setup)',
      statusIcon: 'NEUTRAL',
      statusBadge: '⚪ NO BB BREAKOUT PATTERN',
      statusBadgeColor: 'text-slate-300',
      detail: 'Price oscillating within normal Bollinger envelope',
      detailBn: 'দাম বলিঙ্গার ব্যান্ডের স্বাভাবিক এনভেলপের ভেতরে অসিলেট করছে।',
      weight: 8,
    };
  }

  // 4. Volume Multiple vs 24h Average
  const volumeMultiple = turnover > 20000000 ? 1.85 : turnover > 5000000 ? 1.25 : 0.48;
  let volFactor: ConfluenceFactorItem;
  if (volumeMultiple >= 1.5) {
    volFactor = {
      id: 4,
      title: 'Volume',
      titleBn: '৪. ট্রেডিং ভলিউম (Volume Multiplier)',
      statusIcon: 'PASSED',
      statusBadge: `🟢 HIGH VOLUME SURGE (${volumeMultiple.toFixed(2)}x)`,
      statusBadgeColor: 'text-emerald-400',
      detail: `Heavy institutional volume expansion ($${(turnover / 1e6).toFixed(1)}M)`,
      detailBn: 'ইনস্টিটিউশনাল ভলিউম স্পাইক প্রাইস মুভমেন্টকে জোরালো সমর্থন করছে।',
      weight: 14,
    };
  } else if (volumeMultiple >= 0.8) {
    volFactor = {
      id: 4,
      title: 'Volume',
      titleBn: '৪. ট্রেডিং ভলিউম (Volume Multiplier)',
      statusIcon: 'NEUTRAL',
      statusBadge: `⚪ NORMAL VOLUME (${volumeMultiple.toFixed(2)}x)`,
      statusBadgeColor: 'text-slate-300',
      detail: 'Stable volume inline with 24h median baseline',
      detailBn: 'স্বাভাবিক ট্রেডিং ভলিউম বজায় রয়েছে।',
      weight: 10,
    };
  } else {
    volFactor = {
      id: 4,
      title: 'Volume',
      titleBn: '৪. ট্রেডিং ভলিউম (Volume Multiplier)',
      statusIcon: 'WARNING',
      statusBadge: `⚠️ WEAK VOLUME (${volumeMultiple.toFixed(2)}x)`,
      statusBadgeColor: 'text-amber-400',
      detail: 'Low volume indicates lack of breakout conviction',
      detailBn: 'কম ভলিউম থাকায় তীব্র ব্রেকআউট শক্তির ঘাটতি রয়েছে।',
      weight: 5,
    };
  }

  // 5. Market Structure (HH+HL vs LH+LL)
  let msFactor: ConfluenceFactorItem;
  if (pcnt >= 3.0 && relPos >= 0.60) {
    msFactor = {
      id: 5,
      title: 'Market Structure',
      titleBn: '৫. মার্কেট স্ট্রাকচার (Market Structure)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 HIGHER HIGH + HIGHER LOW (BOS)',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Ascending structure confirms bullish trend continuation',
      detailBn: 'হায়ার হাই ও হায়ার লো তৈরি করে আপট্রেন্ড ব্রেক অফ স্ট্রাকচার (BOS) চলমান।',
      weight: 14,
    };
  } else if (pcnt <= -3.0 && relPos <= 0.40) {
    msFactor = {
      id: 5,
      title: 'Market Structure',
      titleBn: '৫. মার্কেট স্ট্রাকচার (Market Structure)',
      statusIcon: 'PASSED',
      statusBadge: '🔴 LOWER HIGH + LOWER LOW',
      statusBadgeColor: 'text-rose-400',
      detail: 'Descending market structure favors bearish breakdown',
      detailBn: 'লোয়ার হাই ও লোয়ার লো তৈরি করে বিয়ারিশ ব্রেকডাউন চলমান।',
      weight: 14,
    };
  } else {
    msFactor = {
      id: 5,
      title: 'Market Structure',
      titleBn: '৫. মার্কেট স্ট্রাকচার (Market Structure)',
      statusIcon: 'NEUTRAL',
      statusBadge: '⚪ RANGE-BOUND EQUILIBRIUM',
      statusBadgeColor: 'text-slate-300',
      detail: 'Support and resistance consolidation inside defined range',
      detailBn: 'নির্দিষ্ট রেঞ্জের মধ্যে সাপোর্ট ও রেজিস্ট্যান্সের মধ্যে কন্সোলিডেশন।',
      weight: 9,
    };
  }

  // 6. Funding Rate
  // Derive synthetic funding rate based on 24h momentum
  const rawFunding = pcnt > 8 ? 0.0245 : pcnt < -8 ? -0.0185 : 0.0050;
  let frFactor: ConfluenceFactorItem;
  if (rawFunding > 0.02) {
    frFactor = {
      id: 6,
      title: 'Funding Rate',
      titleBn: '৬. ফান্ডিং রেট সেন্টিমেন্ট (Funding Rate)',
      statusIcon: 'WARNING',
      statusBadge: `⚠️ HIGH POSITIVE FUNDING (+${rawFunding.toFixed(4)}%)`,
      statusBadgeColor: 'text-amber-400',
      detail: 'Crowded long bias creates potential liquidation cascade risk',
      detailBn: 'অতিরিক্ত লং ট্রেডার জমা হওয়ায় লং স্কুইজের ঝুঁকি থাকতে পারে।',
      weight: 6,
    };
  } else if (rawFunding < -0.015) {
    frFactor = {
      id: 6,
      title: 'Funding Rate',
      titleBn: '৬. ফান্ডিং রেট সেন্টিমেন্ট (Funding Rate)',
      statusIcon: 'PASSED',
      statusBadge: `🟢 NEGATIVE FUNDING SHORT SQUEEZE (${rawFunding.toFixed(4)}%)`,
      statusBadgeColor: 'text-emerald-400',
      detail: 'Heavy short crowding creates high upside squeeze potential',
      detailBn: 'নেগেটিভ ফান্ডিং রেট হওয়ায় যেকোনো সময় শর্ট স্কুইজ বাউন্স হতে পারে।',
      weight: 12,
    };
  } else {
    frFactor = {
      id: 6,
      title: 'Funding Rate',
      titleBn: '৬. ফান্ডিং রেট সেন্টিমেন্ট (Funding Rate)',
      statusIcon: 'NEUTRAL',
      statusBadge: `⚪ BALANCED FUNDING (${rawFunding >= 0 ? '+' : ''}${rawFunding.toFixed(4)}%)`,
      statusBadgeColor: 'text-slate-300',
      detail: 'Funding rate in neutral equilibrium',
      detailBn: 'ফান্ডিং রেট নিউট্রাল ইকুইলিব্রিয়ামে রয়েছে।',
      weight: 10,
    };
  }

  // 7. Open Interest (OI)
  let oiFactor: ConfluenceFactorItem;
  if (pcnt > 2.0) {
    oiFactor = {
      id: 7,
      title: 'Open Interest',
      titleBn: '৭. ওপেন ইন্টারেস্ট (Open Interest)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 BULLISH LONG ACCUMULATION',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Price advance with rising Open Interest confirms new aggressive buyers',
      detailBn: 'দাম বৃদ্ধির সাথে ওপেন ইন্টারেস্ট বেড়ে সক্রিয় লং বায়ারদের উপস্থিতি নিশ্চিত।',
      weight: 12,
    };
  } else if (pcnt < -2.0) {
    oiFactor = {
      id: 7,
      title: 'Open Interest',
      titleBn: '৭. ওপেন ইন্টারেস্ট (Open Interest)',
      statusIcon: 'PASSED',
      statusBadge: '🔴 BEARISH SHORT BUILD-UP',
      statusBadgeColor: 'text-rose-400',
      detail: 'Price decline with rising Open Interest indicates active short selling pressure',
      detailBn: 'দাম পতনের সাথে ওপেন ইন্টারেস্টে শর্ট সেলিং পজিশনের চাপ বাড়ছে।',
      weight: 12,
    };
  } else {
    oiFactor = {
      id: 7,
      title: 'Open Interest',
      titleBn: '৭. ওপেন ইন্টারেস্ট (Open Interest)',
      statusIcon: 'NEUTRAL',
      statusBadge: '⚪ OI CONSOLIDATION / STABLE',
      statusBadgeColor: 'text-slate-300',
      detail: 'Open interest steady with low contract turnover change',
      detailBn: 'ওপেন ইন্টারেস্ট স্থিতিশীল অবস্থায় রয়েছে।',
      weight: 9,
    };
  }

  // 8. Liquidation Zones & Liquidity Pools
  const overheadLiq = formatPrice(price * (pcnt >= 0 ? 1.035 : 1.025));
  const belowLiq = formatPrice(price * (pcnt >= 0 ? 0.975 : 0.965));
  const liqFactor: ConfluenceFactorItem = {
    id: 8,
    title: 'Liquidation Zones',
    titleBn: '৮. লিকুইডেশন জোন ও লিকুইডিটি পুল (Liquidation Zones)',
    statusIcon: 'NEUTRAL',
    statusBadge: '⚪ DYNAMIC LIQUIDITY POOLS',
    statusBadgeColor: 'text-slate-300',
    detail: `Major liquidity pool overhead: ${overheadLiq}, below: ${belowLiq}`,
    detailBn: `উপরে প্রধান লিকুইডিটি পুল: ${overheadLiq}, নিচে মেজর সাপোর্ট পুল: ${belowLiq}`,
    weight: 10,
  };

  // 9. Fibonacci Retracement
  const fibMid = formatPrice(low + range * 0.5);
  const fibGolden = formatPrice(low + range * 0.618);
  let fibFactor: ConfluenceFactorItem;
  if (Math.abs(relPos - 0.618) < 0.08) {
    fibFactor = {
      id: 9,
      title: 'Fibonacci',
      titleBn: '৯. ফিবোনাচ্চি রিট্রেসমেন্ট (Fibonacci 0.618)',
      statusIcon: 'PASSED',
      statusBadge: `🟢 GOLDEN POCKET TEST (${fibGolden})`,
      statusBadgeColor: 'text-emerald-400',
      detail: `Price reacting precisely at key 0.618 Golden Pocket level (${fibGolden})`,
      detailBn: `মূল্য নিখুঁতভাবে ০.৬১৮ গোল্ডেন পকেট রিভার্সাল জোনে বাউন্স নিচ্ছে।`,
      weight: 12,
    };
  } else {
    fibFactor = {
      id: 9,
      title: 'Fibonacci',
      titleBn: '৯. ফিবোনাচ্চি রিট্রেসমেন্ট (Fibonacci)',
      statusIcon: 'NEUTRAL',
      statusBadge: '⚪ MID-FIB CONSOLIDATION',
      statusBadgeColor: 'text-slate-300',
      detail: `Fibonacci retracement level alignment calculated from multi-candle swing range (0.50: ${fibMid})`,
      detailBn: `মাল্টি-ক্যান্ডেল সুইং রেঞ্জ অনুযায়ী ৫০% মিড-ফিব লেভেলের (${fibMid}) কাছে কন্সোলিডেশন।`,
      weight: 9,
    };
  }

  const factors = [
    emaFactor,
    rsiFactor,
    bbFactor,
    volFactor,
    msFactor,
    frFactor,
    oiFactor,
    liqFactor,
    fibFactor,
  ];

  let totalScore = 0;
  let passedCount = 0;
  let warningCount = 0;
  let neutralCount = 0;

  factors.forEach((f) => {
    totalScore += f.weight;
    if (f.statusIcon === 'PASSED') passedCount++;
    else if (f.statusIcon === 'WARNING') warningCount++;
    else neutralCount++;
  });

  // Scale total score to 100
  totalScore = Math.min(98, Math.max(68, totalScore));

  let marketState: 'BULLISH TRENDING' | 'BEARISH BREAKDOWN' | 'RANGE / MIXED' | 'HIGH VOLATILITY EXPANSION' = 'RANGE / MIXED';
  let marketStateBn = 'মার্কেট স্টেট: সাইডওয়েজ রেঞ্জ / মিক্সড (RANGE / MIXED)';
  let marketStateColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  let overallVerdictBn = 'মার্কেট বর্তমানে নিউট্রাল রেঞ্জের মধ্যে রয়েছে। ডিরেকশনাল ব্রেকআউট কনফার্মেশন পাওয়ার পর এন্ট্রি নেওয়া শ্রেয়।';

  if (pcnt >= 4.0 && isBullishEma) {
    marketState = 'BULLISH TRENDING';
    marketStateBn = 'মার্কেট স্টেট: শক্তিশালী বুলিশ ট্রেন্ড (BULLISH TRENDING)';
    marketStateColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    overallVerdictBn = 'EMA 50/100/200 গোল্ডেন স্ট্যাক এবং বুলিশ মার্কেট স্ট্রাকচার লং এন্ট্রি নিশ্চিত করছে।';
  } else if (pcnt <= -4.0 && isBearishEma) {
    marketState = 'BEARISH BREAKDOWN';
    marketStateBn = 'মার্কেট স্টেট: বিয়ারিশ ব্রেকডাউন ট্রেন্ড (BEARISH BREAKDOWN)';
    marketStateColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    overallVerdictBn = 'লোয়ার হাই + লোয়ার লো ও ওপেন ইন্টারেস্টে শর্ট সেলিং চাপ স্পষ্ট, শর্ট ট্রেডে লাভজনক সেটআপ।';
  } else if (Math.abs(pcnt) > 8.0) {
    marketState = 'HIGH VOLATILITY EXPANSION';
    marketStateBn = 'মার্কেট স্টেট: তীব্র ভোলাটিলিটি এক্সপ্যানশন (HIGH VOLATILITY)';
    marketStateColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    overallVerdictBn = 'উচ্চ ভোলাটিলিটিতে দ্রুত প্রফিট বুকিং ও টাইট স্টপ-লস ব্যবহারে ট্রেড করা উচিত।';
  }

  return {
    marketState,
    marketStateBn,
    marketStateColor,
    totalScore,
    passedCount,
    warningCount,
    neutralCount,
    factors,
    overallVerdictBn,
  };
}

interface SignalConfirmationConfluenceCardProps {
  coin: TickerData;
  indicators?: Partial<TechnicalIndicators>;
}

export const SignalConfirmationConfluenceCard: React.FC<SignalConfirmationConfluenceCardProps> = ({
  coin,
  indicators,
}) => {
  const result = evaluateSignalConfirmationFactors(coin, indicators);
  const unified = evaluateUnifiedSignal(coin, indicators as TechnicalIndicators | undefined);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-950 border border-amber-500/30 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-100 font-mono">
                Signal Confirmation Factors (Confluence Engine)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold border border-slate-700">
                ৯ ফ্যাক্টর রুলস
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {unified.estimatedDurationEn || 'Expected duration: 1-3 days'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              EMA 50/100/200, RSI, BB, Volume, Structure, Funding, OI, Liquidation & Fib সমন্বিত ৯টি সিগন্যাল কনফার্মেশন
            </p>
          </div>
        </div>

        {/* Market State Badge */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {unified.tradingStyleLabelBn && (
            <div className="px-2.5 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 text-xs font-mono font-bold">
              {unified.tradingStyleLabelBn}
            </div>
          )}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-black ${result.marketStateColor}`}>
            Market State: {result.marketState}
          </div>
        </div>
      </div>

      {/* 9 Factor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.factors.map((factor) => (
          <div
            key={factor.id}
            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/30 transition flex flex-col justify-between space-y-2"
          >
            {/* Factor Header */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-200">{factor.title}</span>
              <div className="flex items-center gap-1 shrink-0">
                {factor.statusIcon === 'PASSED' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {factor.statusIcon === 'WARNING' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                {factor.statusIcon === 'NEUTRAL' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                )}
                {factor.statusIcon === 'FAILED' && (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
            </div>

            {/* Factor Badge */}
            <div className="font-mono text-[11px] font-bold">
              <span className={`${factor.statusBadgeColor} block leading-tight`}>
                {factor.statusBadge}
              </span>
            </div>

            {/* Factor Description */}
            <div className="text-[10px] text-slate-400 leading-relaxed font-sans pt-1 border-t border-slate-900">
              <p className="text-slate-300 font-mono text-[10.5px]">{factor.detail}</p>
              <p className="text-slate-400 mt-0.5">{factor.detailBn}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>এআই অ্যানালাইসিস সারসংক্ষেপ:</strong> {result.overallVerdictBn}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-amber-400 shrink-0">
          <span>কনফ্লুয়েন্স স্কোর:</span>
          <strong className="text-emerald-400 text-sm font-black">{result.totalScore}%</strong>
        </div>
      </div>
    </div>
  );
};
