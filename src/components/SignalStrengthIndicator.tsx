import React, { useState } from 'react';
import {
  Zap,
  Activity,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Sparkles,
  Clock,
  Sliders,
} from 'lucide-react';
import { KlinePoint, TechnicalIndicators, TickerData } from '../types';
import { LongShortProbabilityMeter } from './LongShortProbabilityMeter';
import { StopLossEfficiencyMeter } from './StopLossEfficiencyMeter';
import { SmartSlSuggestionModal, SmartSlSuggestionButton } from './SmartSlSuggestionModal';
import { evaluateUnifiedSignal } from '../utils/unifiedSignals';

interface SignalStrengthIndicatorProps {
  indicators: TechnicalIndicators;
  coin: TickerData;
  klines?: KlinePoint[];
}

export const SignalStrengthIndicator: React.FC<SignalStrengthIndicatorProps> = ({
  indicators,
  coin,
  klines,
}) => {
  const unified = evaluateUnifiedSignal(coin, indicators);
  const [overrideSl, setOverrideSl] = useState<{ symbol: string; price: number; pcnt: number } | null>(null);
  const [isSmartSlModalOpen, setIsSmartSlModalOpen] = useState<boolean>(false);

  // Derive active SL and calibration status cleanly without useEffect
  const isCustomForThisCoin = Boolean(overrideSl && overrideSl.symbol === coin.symbol);
  const activeSlPrice = isCustomForThisCoin ? overrideSl!.price : unified.sl;
  const activeSlPcnt = isCustomForThisCoin ? overrideSl!.pcnt : unified.slPcnt;
  const isSmartCalibrated = isCustomForThisCoin;

  const handleApplySmartSl = (newSlPrice: number, newSlPcnt: number) => {
    setOverrideSl({ symbol: coin.symbol, price: newSlPrice, pcnt: newSlPcnt });
  };

  // 1. RSI Score & Analysis (New AI Setup: Above 85 Overbought, Below 20 Oversold)
  const getRsiEvaluation = () => {
    const rsi = indicators.rsi;
    if (rsi <= 20) {
      return {
        score: 95,
        status: 'Extreme Oversold (অতি-বিক্রীত / <20)',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        badge: 'PRIME BUY ZONE (RSI ≤ 20) 📥',
        desc: 'RSI ২০-এর নিচে (Extreme Oversold)! অতিরিক্ত সেলঅফের পর ইনস্টিটিউশনাল বাউন্স ও রিভার্সালের সম্ভাবনা সর্বোচ্চ।',
      };
    }
    if (rsi <= 40) {
      return {
        score: 80,
        status: 'Bullish Rebound / Recovery',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        badge: 'GOOD ACCUMULATION 🎯',
        desc: 'RSI রেঞ্জ সুস্থ একুমুলেশন নির্দেশ করছে। দীর্ঘমেয়াদী এন্ট্রির জন্য সাশ্রয়ী জোন।',
      };
    }
    if (rsi <= 65) {
      return {
        score: 60,
        status: 'Neutral Momentum',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30',
        badge: 'BALANCED ZONE (20-85) ⚖️',
        desc: 'মডারেট ট্রেন্ড। ২০ থেকে ৮৫ সেফ ব্যান্ডের মধ্যে বায়ার ও সেলারদের অবস্থান ব্যালান্সড।',
      };
    }
    if (rsi < 85) {
      return {
        score: 70,
        status: 'Strong Bullish Momentum',
        color: 'text-sky-400',
        bgColor: 'bg-sky-500/10 border-sky-500/30',
        badge: 'HIGH MOMENTUM (< 85) 🚀',
        desc: 'শক্তিশালী ক্রয় মোমেন্টাম আছে। ৮৫ আপার ব্যান্ডের নিচে আপট্রেন্ড চলমান।',
      };
    }
    return {
      score: 15,
      status: 'Extreme Overbought (অতি-ক্রীত / >85)',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      badge: 'HIGH PULLBACK RISK (RSI ≥ 85) ⚠️',
      desc: 'RSI ৮৫-এর উপরে (Extreme Overbought)! মারাত্মক ওভারহিটেড অবস্থা, যেকোনো সময় বড় কারেকশন/ডাম্প হতে পারে। নতুন লং এড়িয়ে চলুন!',
    };
  };

  // 2. MACD Score & Analysis
  const getMacdEvaluation = () => {
    const macd = indicators.macd;
    if (macd.trend === 'Bullish Crossover' || macd.histogram > 0) {
      return {
        score: macd.trend === 'Bullish Crossover' ? 90 : 75,
        status: macd.trend === 'Bullish Crossover' ? 'Bullish Crossover 🟢' : 'Positive Histogram',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        badge: 'STRONG BULLISH MACD ⚡',
        desc: 'MACD লাইন সিগন্যাল লাইনের উপরে আছে। ওপরে ওঠার বুলিশ মোমেন্টাম নিশ্চিত।',
      };
    }
    if (macd.trend === 'Bearish Crossover' || macd.histogram < 0) {
      return {
        score: macd.trend === 'Bearish Crossover' ? 20 : 35,
        status: macd.trend === 'Bearish Crossover' ? 'Bearish Crossover 🔴' : 'Negative Histogram',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/30',
        badge: 'BEARISH PRESSURE 📉',
        desc: 'MACD হিস্তোগ্রাম লাল/নেগেটিভ। বিক্রি এবং ডাউনট্রেন্ডের চাপ রয়েছে।',
      };
    }
    return {
      score: 50,
      status: 'Neutral MACD',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      badge: 'CONSOLIDATION ⚖️',
      desc: 'MACD নিউট্রাল পজিশনে আছে। স্পষ্ট ট্রেন্ড তৈরি হওয়ার জন্য অপেক্ষা করা উচিত।',
    };
  };

  // 3. Volume Score & Analysis
  const getVolumeEvaluation = () => {
    const trend = indicators.volumeTrend;
    if (trend === 'High Spike' || trend === 'Anomaly') {
      return {
        score: 95,
        status: 'Institutional High Volume Spike 🔥',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/30',
        badge: 'INSTITUTIONAL INFLOW 🏦',
        desc: 'হঠাৎ অস্বাভাবিক বড় ভলিউম এসেছে! ইনস্টিটিউশনাল ট্রেডারদের বড় এন্ট্রির লক্ষণ।',
      };
    }
    if (trend === 'Increasing') {
      return {
        score: 82,
        status: 'Healthy Volume Surge 📈',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/30',
        badge: 'VOLUME SUPPORTED 🎯',
        desc: 'ট্রেডিং ভলিউম ক্রমশ বাড়ছে। প্রাইস মুভমেন্টকে ভলিউম সাপোর্ট করছে।',
      };
    }
    if (trend === 'Normal') {
      return {
        score: 60,
        status: 'Normal Volume Level',
        color: 'text-slate-300',
        bgColor: 'bg-slate-800/80 border-slate-700/80',
        badge: 'AVERAGE VOLUME 📊',
        desc: 'স্বাভাবিক ভলিউম বিদ্যমান। তীব্র প্রফিট স্পাইকের জন্য বাড়তি ভলিউম দরকার।',
      };
    }
    return {
      score: 35,
      status: 'Low Volume / Decreasing Volume 📉',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500/30',
      badge: 'WEAK CONFIRMATION ⚠️',
      desc: 'ভলিউম কমে গেছে। কম ভলিউমে ভুয়া ব্রেকআউট (Fakeout) বা ফেক ট্র্যাপ হওয়ার ভয় বেশি।',
    };
  };

  const rsiEval = getRsiEvaluation();
  const macdEval = getMacdEvaluation();
  const volumeEval = getVolumeEvaluation();

  // Weighted Score: RSI (35%), MACD (35%), Volume (30%)
  const overallScore = Math.round(
    rsiEval.score * 0.35 + macdEval.score * 0.35 + volumeEval.score * 0.30
  );

  // Overall Quality Rating
  const getOverallQuality = (score: number) => {
    if (score >= 80) {
      return {
        title: '🚀 PRIME ENTRY QUALITY (অত্যন্ত উচ্চমানের এন্ট্রি সিগন্যাল)',
        badge: 'SUPERIOR CONFLUENCE',
        color: 'text-emerald-400',
        bgGradient: 'from-emerald-500/20 via-slate-900 to-slate-950',
        borderColor: 'border-emerald-500/40',
        gaugeColor: 'bg-emerald-500',
        recommendation:
          'RSI, MACD এবং Volume তিনটি নির্দেশকই একই দিকে মোমেন্টাম সাপোর্ট করছে! এন্ট্রি নেওয়ার জন্য এটি সেরা জোন।',
      };
    }
    if (score >= 65) {
      return {
        title: '⚡ HIGH QUALITY ENTRY (ভালো এন্ট্রি সম্ভাবনা)',
        badge: 'STRONG SIGNAL',
        color: 'text-emerald-400',
        bgGradient: 'from-amber-500/15 via-slate-900 to-slate-950',
        borderColor: 'border-amber-500/40',
        gaugeColor: 'bg-amber-400',
        recommendation:
          'নির্দেশকগুলোতে ভালো সখ্যতা (Confluence) দেখা যাচ্ছে। সীমিত স্টপ-লস ব্যবহারে ভালো এন্ট্রি নেওয়া যায়।',
      };
    }
    if (score >= 45) {
      return {
        title: '⏳ MODERATE / WAIT FOR CONFIRMATION (মাঝারি এন্ট্রি সিগন্যাল)',
        badge: 'NEUTRAL ZONE',
        color: 'text-amber-400',
        bgGradient: 'from-amber-500/10 via-slate-900 to-slate-950',
        borderColor: 'border-slate-800',
        gaugeColor: 'bg-amber-500',
        recommendation:
          'নির্দেশকগুলোর কিছু পজিটিভ এবং কিছু নিউট্রাল। অতিরিক্ত নিশ্চিতকরণ (Confirmation) পর্যন্ত অপেক্ষা করতে পারেন।',
      };
    }
    return {
      title: '⚠️ POOR ENTRY / HIGH RISK ZONE (দুর্বল এন্ট্রি সিগন্যাল)',
      badge: 'HIGH RISK / WAIT',
      color: 'text-red-400',
      bgGradient: 'from-red-500/15 via-slate-900 to-slate-950',
      borderColor: 'border-red-500/40',
      gaugeColor: 'bg-red-500',
      recommendation:
        'RSI, MACD বা Volume-এ ট্রেন্ড দুর্বল অথবা অতি-ক্রীত ঝুকি বিদ্যমান। আপাতত এ ট্রেড এড়ানো উত্তম।',
    };
  };

  const quality = getOverallQuality(overallScore);

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${quality.bgGradient} border ${quality.borderColor} shadow-xl space-y-4 animate-fadeIn`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-black border border-amber-500/30 shrink-0">
            <Gauge className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                🎯 {coin.baseCoin}/USDT সিগন্যাল স্ট্রেন্থ (Signal Strength Index)
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                RSI + MACD + VOLUME
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              RSI, MACD এবং Volume ৩টি সূচকের সমন্বয়ে এন্ট্রি কোয়ালিটি ও মোমেন্টাম স্কোর মূল্যায়ন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto font-mono flex-wrap">
          {/* Smart SL Suggestion Button */}
          <SmartSlSuggestionButton
            onClick={() => setIsSmartSlModalOpen(true)}
            noiseLevel={unified.volatilityLevel === 'HIGH' ? 'HIGH' : undefined}
          />

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-sans block">সামগ্রিক এন্ট্রি স্কোর</span>
            <span className={`text-xl font-black ${quality.color}`}>{overallScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Smart Calibrated SL Active Banner if applied */}
      {isSmartCalibrated && (
        <div className="p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-emerald-950/70 border border-emerald-500/50 flex items-center justify-between gap-2 text-xs animate-fadeIn shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-bold">
              ⚡ স্মার্ট নয়েজ-রিক্যালিব্রেটেড এসএল সক্রিয়:
            </span>
            <span className="font-mono font-black text-emerald-200">
              ${activeSlPrice.toFixed(4)} (-{activeSlPcnt}%)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setOverrideSl(null);
            }}
            className="text-[11px] text-slate-400 hover:text-rose-300 underline font-mono cursor-pointer"
          >
            রিসেট (ডিফল্ট -{unified.slPcnt}%)
          </button>
        </div>
      )}

      {/* Expected Trade Duration & Trading Style Card */}
      <div className="p-2.5 px-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-slate-300 font-semibold">
            ট্রেড স্থায়িত্বকাল (Expected Duration):
          </span>
          <strong className="text-sky-300 font-mono">
            {unified.estimatedDurationEn || 'Expected duration: 2-4 hours'}
          </strong>
          {unified.estimatedDurationBn && (
            <span className="text-slate-400 font-mono text-[11px]">
              ({unified.estimatedDurationBn})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unified.tradingStyleLabelBn && (
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/30">
              {unified.tradingStyleLabelBn}
            </span>
          )}
          {unified.volatilityLevel && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              unified.volatilityLevel === 'HIGH'
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : unified.volatilityLevel === 'LOW'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}>
              ভোলাটিলিটি: {unified.volatilityLevel === 'HIGH' ? 'তীব্র (Fast Movement)' : unified.volatilityLevel === 'LOW' ? 'ধীর (Consolidation)' : 'স্বাভাবিক (Normal)'}
            </span>
          )}
        </div>
      </div>

      {/* LONG VS SHORT PROBABILITY SCORE METER BAR */}
      <LongShortProbabilityMeter coin={coin} indicators={indicators} />

      {/* STOP LOSS DISTANCE VISUALIZER & EFFICIENCY METER */}
      <StopLossEfficiencyMeter
        coin={coin}
        slPrice={activeSlPrice}
        tpPrice={unified.tp1}
        direction={unified.positionDirection}
        klines={klines}
        onApplySmartSl={handleApplySmartSl}
      />


      {/* Main Overall Progress Meter */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className={`${quality.color} flex items-center gap-1.5`}>
            <Sparkles className="w-4 h-4" />
            {quality.title}
          </span>
          <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400">
            {quality.badge}
          </span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 relative">
          <div
            className={`h-full ${quality.gaugeColor} rounded-full transition-all duration-700 shadow-md`}
            style={{ width: `${overallScore}%` }}
          />
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
          <strong>পরামর্শ:</strong> {quality.recommendation}
        </p>
      </div>

      {/* 3 Component Breakdown Cards: RSI, MACD, Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Card 1: RSI Evaluation */}
        <div className={`p-3.5 rounded-xl border ${rsiEval.bgColor} space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>১. RSI (১৪) ইন্ডকেটর</span>
            </div>
            <span className="font-mono font-bold text-amber-400">{indicators.rsi}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={rsiEval.color}>{rsiEval.status}</span>
            <span className="text-slate-400">স্কোর: {rsiEval.score}/100</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
            {rsiEval.desc}
          </p>
        </div>

        {/* Card 2: MACD Evaluation */}
        <div className={`p-3.5 rounded-xl border ${macdEval.bgColor} space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <BarChart2 className="w-4 h-4 text-sky-400" />
              <span>২. MACD মোমেন্টাম</span>
            </div>
            <span className="font-mono font-bold text-slate-300">
              {indicators.macd.histogram > 0 ? '+' : ''}
              {indicators.macd.histogram.toFixed(4)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={macdEval.color}>{macdEval.status}</span>
            <span className="text-slate-400">স্কোর: {macdEval.score}/100</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
            {macdEval.desc}
          </p>
        </div>

        {/* Card 3: Volume Indicator */}
        <div className={`p-3.5 rounded-xl border ${volumeEval.bgColor} space-y-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>৩. ট্রেডিং ভলিউম ট্রেন্ড</span>
            </div>
            <span className="font-mono font-bold text-slate-300">
              ${(coin.turnover24h / 1e6).toFixed(1)}M
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className={volumeEval.color}>{volumeEval.status}</span>
            <span className="text-slate-400">স্কোর: {volumeEval.score}/100</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-1">
            {volumeEval.desc}
          </p>
        </div>
      </div>

      {/* Smart SL Suggestion Modal */}
      <SmartSlSuggestionModal
        isOpen={isSmartSlModalOpen}
        onClose={() => setIsSmartSlModalOpen(false)}
        coin={coin}
        currentSlPrice={activeSlPrice}
        direction={unified.positionDirection}
        klines={klines}
        onApplySmartSl={handleApplySmartSl}
      />
    </div>
  );
};

