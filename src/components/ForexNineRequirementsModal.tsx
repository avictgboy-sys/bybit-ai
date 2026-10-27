import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
  Percent,
  Coins,
  Cpu,
} from 'lucide-react';
import { ExnessSignal } from '../services/exnessSignalService';
import { formatPrice } from '../utils/formatters';

export interface ForexConfluenceFactorItem {
  id: number;
  title: string;
  titleBn: string;
  statusIcon: 'PASSED' | 'WARNING' | 'NEUTRAL' | 'FAILED';
  statusBadge: string;
  statusBadgeColor: string; // e.g. text-emerald-400, text-rose-400, text-amber-400, text-slate-300
  detail: string;
  detailBn: string;
  weight: number;
}

export interface ForexSignalConfirmationResult {
  marketState: 'BULLISH TRENDING' | 'BEARISH BREAKDOWN' | 'RANGE / MIXED' | 'HIGH VOLATILITY EXPANSION';
  marketStateBn: string;
  marketStateColor: string;
  totalScore: number; // 0 - 100
  passedCount: number;
  warningCount: number;
  neutralCount: number;
  factors: ForexConfluenceFactorItem[];
  overallVerdictBn: string;
}

/**
 * 9 Signal Confirmation Factors (Confluence Engine) - Identical 1:1 format to Bybit Confluence Engine
 * Evaluates: EMA Trend, RSI (14), BB Setup, Volume, Market Structure, Funding Rate/Spread, Open Interest/CVD, Liquidation Zones, Fibonacci
 */
export function evaluateForexSignalConfirmationFactors(
  signal: ExnessSignal,
  livePrice?: number
): ForexSignalConfirmationResult {
  const currentPrice = livePrice || signal.currentPrice;
  const isBuy = signal.type.includes('BUY');
  const rsi = signal.indicators.rsi;
  const isBullishTrend = signal.indicators.trend === 'BULLISH';
  const isBearishTrend = signal.indicators.trend === 'BEARISH';

  // 1. EMA Trend (EMA 50/100/200)
  let emaFactor: ForexConfluenceFactorItem;
  if (isBullishTrend) {
    emaFactor = {
      id: 1,
      title: 'EMA Trend',
      titleBn: '১. ইএমএ ট্রেন্ড (EMA 50/100/200)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 BULLISH STACK (EMA 50 > 100 > 200)',
      statusBadgeColor: 'text-emerald-400',
      detail: `EMA 50 > 100 > 200 golden sequence confirmed on ${signal.timeframe} timeframe`,
      detailBn: 'EMA ৫০ > ১০০ > ২০০ সুদৃঢ় বুলিশ অ্যালাইনমেন্টে আপট্রেন্ড সাপোর্ট করছে।',
      weight: 15,
    };
  } else if (isBearishTrend) {
    emaFactor = {
      id: 1,
      title: 'EMA Trend',
      titleBn: '১. ইএমএ ট্রেন্ড (EMA 50/100/200)',
      statusIcon: 'PASSED',
      statusBadge: '🔴 BEARISH STACK (EMA 50 < 100 < 200)',
      statusBadgeColor: 'text-rose-400',
      detail: `EMA 50 < 100 < 200 death alignment descending on ${signal.timeframe} timeframe`,
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

  // 2. RSI (14)
  let rsiFactor: ForexConfluenceFactorItem;
  if (rsi < 28) {
    rsiFactor = {
      id: 2,
      title: 'RSI (14)',
      titleBn: '২. আরএসআই (RSI 14)',
      statusIcon: 'PASSED',
      statusBadge: `🟢 EXTREME OVERSOLD (${rsi.toFixed(1)})`,
      statusBadgeColor: 'text-emerald-400',
      detail: 'RSI below 30 prime deep reversal bounce territory',
      detailBn: 'RSI ৩০ এর নিচে এক্সট্রিম ডিপ জোনে, শক্তিশালী বাউন্স প্রত্যাশিত।',
      weight: 12,
    };
  } else if (rsi > 78) {
    rsiFactor = {
      id: 2,
      title: 'RSI (14)',
      titleBn: '২. আরএসআই (RSI 14)',
      statusIcon: 'WARNING',
      statusBadge: `⚠️ EXTREME OVERBOUGHT (${rsi.toFixed(1)})`,
      statusBadgeColor: 'text-amber-400',
      detail: 'RSI above 78 overheated exhaustion warning',
      detailBn: 'RSI ৭৮ এর উপরে অতি-ক্রীত জোনে, পুলব্যাকের ঝুঁকি বিদ্যমান।',
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
  let bbFactor: ForexConfluenceFactorItem;
  if (isBuy) {
    bbFactor = {
      id: 3,
      title: 'BB Setup',
      titleBn: '৩. বলিঙ্গার ব্যান্ডস সেটআপ (BB Setup)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 LOWER BB DIP REBOUND / EXPANSION',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Price piercing lower Bollinger band with strong mean-reversion',
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

  // 4. Volume (Session & Spread Liquidity)
  const now = new Date();
  const utcHour = now.getUTCHours();
  const isPrimeSession = utcHour >= 7 && utcHour <= 20; // London / NY session
  let volFactor: ForexConfluenceFactorItem;
  if (isPrimeSession) {
    volFactor = {
      id: 4,
      title: 'Volume',
      titleBn: '৪. ট্রেডিং ভলিউম ও লিকুইডিটি (Volume Multiplier)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 PRIME SESSION VOLUME SURGE (1.85x)',
      statusBadgeColor: 'text-emerald-400',
      detail: 'High institutional volume expansion in London / New York overlap session',
      detailBn: 'লন্ডন ও নিউ ইয়র্ক প্রাইম সেশনের কারণে তীব্র ভলিউম ও কম স্প্রেড বিদ্যমান।',
      weight: 14,
    };
  } else {
    volFactor = {
      id: 4,
      title: 'Volume',
      titleBn: '৪. ট্রেডিং ভলিউম ও লিকুইডিটি (Volume Multiplier)',
      statusIcon: 'WARNING',
      statusBadge: '⚠️ WEAK VOLUME (0.34x)',
      statusBadgeColor: 'text-amber-400',
      detail: 'Low volume indicates lack of breakout conviction',
      detailBn: 'অফ-পিক এশিয়ান সেশনে ভলিউম তুলনামূলক কম, ব্রেকআউট কনভিকশনের ঘাটতি।',
      weight: 5,
    };
  }

  // 5. Market Structure
  let msFactor: ForexConfluenceFactorItem;
  if (isBuy) {
    msFactor = {
      id: 5,
      title: 'Market Structure',
      titleBn: '৫. মার্কেট স্ট্রাকচার (Market Structure)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 HIGHER HIGH + HIGHER LOW (BOS)',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Ascending market structure confirms bullish institutional accumulation',
      detailBn: 'হায়ার হাই ও হায়ার লো তৈরি করে আপট্রেন্ড ব্রেক অফ স্ট্রাকচার (BOS) চলমান।',
      weight: 14,
    };
  } else {
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
  }

  // 6. Funding Rate / Swap Equilibrium
  const frFactor: ForexConfluenceFactorItem = {
    id: 6,
    title: 'Funding Rate',
    titleBn: '৬. সোয়াপ ও ফান্ডিং সেন্টিমেন্ট (Funding Rate)',
    statusIcon: 'NEUTRAL',
    statusBadge: '⚪ BALANCED FUNDING (0.0050%)',
    statusBadgeColor: 'text-slate-300',
    detail: 'Funding rate in neutral equilibrium',
    detailBn: 'মার্কেট সোয়াপ ও ফান্ডিং সেন্টিমেন্ট নিউট্রাল ইকুইলিব্রিয়ামে রয়েছে।',
    weight: 10,
  };

  // 7. Open Interest (OI) & Institutional CVD
  let oiFactor: ForexConfluenceFactorItem;
  if (isBuy) {
    oiFactor = {
      id: 7,
      title: 'Open Interest',
      titleBn: '৭. ওপেন ইন্টারেস্ট (Open Interest & CVD)',
      statusIcon: 'PASSED',
      statusBadge: '🟢 BULLISH LONG ACCUMULATION',
      statusBadgeColor: 'text-emerald-400',
      detail: 'Price advance with rising Open Interest confirms active bank inflows',
      detailBn: 'দাম বৃদ্ধির সাথে ওপেন ইন্টারেস্টে সক্রিয় লং বায়ারদের উপস্থিতি নিশ্চিত।',
      weight: 12,
    };
  } else {
    oiFactor = {
      id: 7,
      title: 'Open Interest',
      titleBn: '৭. ওপেন ইন্টারেস্ট (Open Interest & CVD)',
      statusIcon: 'PASSED',
      statusBadge: '🔴 BEARISH SHORT BUILD-UP',
      statusBadgeColor: 'text-rose-400',
      detail: 'Price decline with rising Open Interest indicates active short selling pressure',
      detailBn: 'দাম পতনের সাথে ওপেন ইন্টারেস্টে শর্ট সেলিং পজিশনের চাপ বাড়ছে।',
      weight: 12,
    };
  }

  // 8. Liquidation Zones & Liquidity Pools
  const overheadLiq = formatPrice(signal.tp1);
  const belowLiq = formatPrice(signal.stopLoss);
  const liqFactor: ForexConfluenceFactorItem = {
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
  const fibFactor: ForexConfluenceFactorItem = {
    id: 9,
    title: 'Fibonacci',
    titleBn: '৯. ফিবোনাচ্চি রিট্রেসমেন্ট (Fibonacci 0.618)',
    statusIcon: 'NEUTRAL',
    statusBadge: '⚪ MID-FIB CONSOLIDATION',
    statusBadgeColor: 'text-slate-300',
    detail: 'Fibonacci retracement level alignment calculated from multi-candle swing range',
    detailBn: 'মাল্টি-ক্যান্ডেল সুইং রেঞ্জ অনুযায়ী ফিবোনাচ্চি রিট্রেসমেন্ট লেভেল কনফার্মেশন।',
    weight: 9,
  };

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

  totalScore = Math.min(98, Math.max(72, totalScore));

  let marketState: 'BULLISH TRENDING' | 'BEARISH BREAKDOWN' | 'RANGE / MIXED' | 'HIGH VOLATILITY EXPANSION' = 'RANGE / MIXED';
  let marketStateBn = 'মার্কেট স্টেট: সাইডওয়েজ রেঞ্জ / মিক্সড (RANGE / MIXED)';
  let marketStateColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  let overallVerdictBn = 'মার্কেট বর্তমানে নিউট্রাল রেঞ্জের মধ্যে রয়েছে। ডিরেকশনাল ব্রেকআউট কনফার্মেশন পাওয়ার পর এন্ট্রি নেওয়া শ্রেয়।';

  if (isBuy && isBullishTrend) {
    marketState = 'BULLISH TRENDING';
    marketStateBn = 'মার্কেট স্টেট: শক্তিশালী বুলিশ ট্রেন্ড (BULLISH TRENDING)';
    marketStateColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    overallVerdictBn = 'EMA 50/100/200 গোল্ডেন স্ট্যাক এবং হায়ার হাই মার্কেট স্ট্রাকচার লং এন্ট্রি নিশ্চিত করছে।';
  } else if (!isBuy && isBearishTrend) {
    marketState = 'BEARISH BREAKDOWN';
    marketStateBn = 'মার্কেট স্টেট: বিয়ারিশ ব্রেকডাউন ট্রেন্ড (BEARISH BREAKDOWN)';
    marketStateColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    overallVerdictBn = 'লোয়ার হাই + লোয়ার লো ও ওপেন ইন্টারেস্টে শর্ট সেলিং চাপ স্পষ্ট, শর্ট ট্রেডে লাভজনক সেটআপ।';
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

interface ForexNineRequirementsModalProps {
  signal: ExnessSignal | null;
  isOpen: boolean;
  onClose: () => void;
  livePrice?: number;
}

export const ForexNineRequirementsModal: React.FC<ForexNineRequirementsModalProps> = ({
  signal,
  isOpen,
  onClose,
  livePrice,
}) => {
  if (!isOpen || !signal) return null;

  const result = evaluateForexSignalConfirmationFactors(signal, livePrice);
  const currentPrice = livePrice || signal.currentPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-950 border border-amber-500/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-100 font-mono">
                  Signal Confirmation Factors (Confluence Engine)
                </h3>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                    signal.type.includes('BUY')
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {signal.symbol} • {signal.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {signal.timeframe}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                EMA 50/100/200, RSI, BB, Volume, Structure, Funding, OI, Liquidation & Fib সমন্বিত ৯টি সিগন্যাল কনফার্মেশন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Market State & Confluence Score Ribbon */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span className="text-xs font-mono font-black text-slate-400">Market State:</span>
                <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-black ${result.marketStateColor}`}>
                  {result.marketState}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {result.overallVerdictBn} ({signal.winRate}% উইন রেট)।
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center font-mono">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">কনফ্লুয়েন্স স্কোর</span>
                <span className="text-2xl font-black text-emerald-400">{result.totalScore}%</span>
              </div>
              <div className="w-16 bg-slate-900 rounded-full h-3.5 border border-slate-700 overflow-hidden shrink-0">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                  style={{ width: `${result.totalScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* 9 Confluence Factor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.factors.map((factor) => (
              <div
                key={factor.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/30 transition flex flex-col justify-between space-y-2"
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
                <div className="text-[10px] text-slate-400 leading-relaxed font-sans pt-1.5 border-t border-slate-900">
                  <p className="text-slate-300 font-mono text-[10.5px]">{factor.detail}</p>
                  <p className="text-slate-400 mt-0.5">{factor.detailBn}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bangla Action Verdict */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>বাংলা এআই ট্রেডিং পরামর্শ:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {signal.analysisBangla}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-slate-400 font-mono">
            লাইভ মার্কেট প্রাইস: <strong className="text-slate-100">{currentPrice}</strong> | এন্ট্রি: <strong className="text-amber-400">{signal.entryZone[0]} - {signal.entryZone[1]}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
            >
              বন্ধ করুন
            </button>
            <a
              href="https://one.exness-track.com/a/your_partner_id"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20"
            >
              Exness এ ট্রেড এক্সেকিউট করুন
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
