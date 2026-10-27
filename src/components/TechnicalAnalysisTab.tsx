import React from 'react';
import {
  Activity,
  Layers,
  BarChart2,
  TrendingUp,
  Sliders,
  Maximize,
  Shield,
  Zap,
  Target,
  Crosshair,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { KlinePoint, TechnicalIndicators, TickerData } from '../types';
import { SignalStrengthIndicator } from './SignalStrengthIndicator';
import { SignalConfirmationConfluenceCard } from './SignalConfirmationConfluenceCard';
import { formatPrice } from '../utils/formatters';

interface TechnicalAnalysisTabProps {
  indicators: TechnicalIndicators;
  currentPrice: number;
  coin?: TickerData;
  klines?: KlinePoint[];
}

export const TechnicalAnalysisTab: React.FC<TechnicalAnalysisTabProps> = ({
  indicators,
  currentPrice,
  coin,
  klines,
}) => {
  const emaSetup = indicators.emaTradeSetup;

  return (
    <div className="space-y-4">
      {/* Signal Strength Evaluation */}
      {coin && <SignalStrengthIndicator indicators={indicators} coin={coin} klines={klines} />}


      {/* 9-Factor Signal Confirmation Confluence Engine */}
      {coin && <SignalConfirmationConfluenceCard coin={coin} indicators={indicators} />}

      {/* Prominent EMA 50 / 100 / 200 Strategy & Action Box */}
      {emaSetup && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <Compass className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-100">
                    EMA 50 / 100 / 200 ট্রেড সেটআপ ও অ্যানালাইসিস
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      emaSetup.direction === 'LONG'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : emaSetup.direction === 'SHORT'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {emaSetup.direction === 'LONG' ? '🟢 BUY / LONG' : emaSetup.direction === 'SHORT' ? '🔴 SELL / SHORT' : '🟡 WAIT / RANGE'}
                  </span>
                </div>
                <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                  {emaSetup.trendTitleBn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {emaSetup.tradingStyleLabelBn && (
                <div className="px-3 py-1 bg-cyan-950/80 rounded-xl border border-cyan-500/40 text-center shadow-sm">
                  <span className="text-[9px] text-cyan-300 block uppercase font-mono">ট্রেডিং স্টাইল</span>
                  <span className="text-xs font-bold font-mono text-cyan-400">{emaSetup.tradingStyleLabelBn}</span>
                </div>
              )}
              <div className="px-3 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 block uppercase font-mono">কনফিডেন্স</span>
                <span className="text-xs font-bold font-mono text-amber-400">{emaSetup.confidenceScore}%</span>
              </div>
              <div className="px-3 py-1 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-400 block uppercase font-mono">রিস্ক:রিওয়ার্ড</span>
                <span className="text-xs font-bold font-mono text-emerald-400">{emaSetup.riskRewardRatio}</span>
              </div>
            </div>
          </div>

          {/* 5-Column Grid for Entry, TP1, TP2, TP3, SL */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* Entry Box */}
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5 text-sky-400" />
                এন্ট্রি জোন
              </span>
              <div className="text-base font-black font-mono text-slate-100 mt-1">
                ${formatPrice(emaSetup.entryPrice).replace('$', '')}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ${formatPrice(emaSetup.entryRange.min).replace('$', '')} - ${formatPrice(emaSetup.entryRange.max).replace('$', '')}
              </span>
            </div>

            {/* TP 1 */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                TP 1 (টার্গেট ১)
              </span>
              <div className="text-base font-black font-mono text-emerald-300 mt-1">
                ${formatPrice(emaSetup.tp1).replace('$', '')}
              </div>
              <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">
                +{emaSetup.tp1GainPcnt}% (Book 33%)
              </span>
            </div>

            {/* TP 2 */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                TP 2 (টার্গেট ২)
              </span>
              <div className="text-base font-black font-mono text-emerald-200 mt-1">
                ${formatPrice(emaSetup.tp2).replace('$', '')}
              </div>
              <span className="text-[10px] font-bold text-emerald-300 block mt-0.5">
                +{emaSetup.tp2GainPcnt}% (Book 33%)
              </span>
            </div>

            {/* TP 3 */}
            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40">
              <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-teal-300" />
                TP 3 (ম্যাক্স রানার)
              </span>
              <div className="text-base font-black font-mono text-teal-200 mt-1">
                ${formatPrice(emaSetup.tp3).replace('$', '')}
              </div>
              <span className="text-[10px] font-bold text-teal-300 block mt-0.5">
                +{emaSetup.tp3GainPcnt}% (Trail 34%)
              </span>
            </div>

            {/* Stop Loss (SL) */}
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                স্টপ-লস (SL)
              </span>
              <div className="text-base font-black font-mono text-rose-300 mt-1">
                ${formatPrice(emaSetup.stopLoss).replace('$', '')}
              </div>
              <span className="text-[10px] font-bold text-rose-400 block mt-0.5">
                -{emaSetup.stopLossPcnt}% (ক্যাপিটাল সেফটি)
              </span>
            </div>
          </div>

          {/* Actionable Strategy Advice */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <p className="font-sans text-slate-200">
              {emaSetup.summaryBn}
            </p>
          </div>
        </div>
      )}

      {/* Overview Indicator Summary Banner */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">RSI (14)</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`font-mono text-sm font-bold ${
                indicators.rsi <= 30
                  ? 'text-emerald-400'
                  : indicators.rsi >= 70
                  ? 'text-red-400'
                  : 'text-amber-400'
              }`}
            >
              {indicators.rsi}
            </span>
            <span className="text-[10px] text-slate-400">({indicators.rsiStatus})</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">MACD Signal</span>
          <div className="font-mono text-sm font-bold text-slate-200 mt-0.5">
            {indicators.macd.trend}
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">EMA 50/100/200 Stack</span>
          <div
            className={`font-mono text-xs font-bold mt-0.5 ${
              indicators.emaAlignment.includes('Bullish')
                ? 'text-emerald-400'
                : indicators.emaAlignment.includes('Bearish')
                ? 'text-red-400'
                : 'text-slate-300'
            }`}
          >
            {indicators.emaAlignment}
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold">Trend Strength</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-sm font-bold text-amber-400">
              {indicators.trendStrength}%
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all"
                style={{ width: `${indicators.trendStrength}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of detailed technical cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. EMA 50, 100, 200 Moving Averages */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Exponential Moving Averages (EMA 50, 100, 200)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                indicators.ema50 > indicators.ema100 && indicators.ema100 > indicators.ema200
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : indicators.ema50 < indicators.ema100 && indicators.ema100 < indicators.ema200
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {indicators.ema50 > indicators.ema100 && indicators.ema100 > indicators.ema200
                ? 'Bullish Stack'
                : indicators.ema50 < indicators.ema100 && indicators.ema100 < indicators.ema200
                ? 'Bearish Stack'
                : 'Mixed / Crossing'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono my-2">
            <div className="flex justify-between p-1.5 rounded bg-slate-950/50 border border-amber-500/20">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                EMA 50 (শর্ট-টার্ম ট্রেন্ড):
              </span>
              <span className="text-slate-200 font-bold">${formatPrice(indicators.ema50).replace('$', '')}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-950/50 border border-cyan-500/20">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                EMA 100 (মিড-টার্ম সাপোর্ট):
              </span>
              <span className="text-slate-200 font-bold">${formatPrice(indicators.ema100).replace('$', '')}</span>
            </div>
            <div className="flex justify-between p-1.5 rounded bg-slate-950/50 border border-purple-500/20">
              <span className="text-purple-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                EMA 200 (মূল ট্রেন্ড বেসলাইন):
              </span>
              <span className="text-slate-200 font-bold">${formatPrice(indicators.ema200).replace('$', '')}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            বর্তমান প্রাইজ (${formatPrice(currentPrice).replace('$', '')}) EMA 50-এর{' '}
            <span className={currentPrice >= indicators.ema50 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {currentPrice >= indicators.ema50 ? 'উপরে' : 'নিচে'}
            </span>{' '}
            এবং EMA 200-এর{' '}
            <span className={currentPrice >= indicators.ema200 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {currentPrice >= indicators.ema200 ? 'উপরে' : 'নিচে'}
            </span>{' '}
            ট্রেড করছে।
          </p>
        </div>

        {/* 2. RSI (14) Setup: Above 85 Overbought (Full Sell) / Below 20 Oversold (Full Buy) */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-fuchsia-400" />
              RSI (14) — Overbought 85 / Oversold 20
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                indicators.rsi <= 20
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : indicators.rsi >= 85
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {indicators.rsi <= 20 ? 'Extreme Oversold (≤20)' : indicators.rsi >= 85 ? 'Extreme Overbought (≥85)' : indicators.rsiStatus}
            </span>
          </div>

          <div className="my-2">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span className="text-emerald-400 font-bold">≤20 Oversold (BUY)</span>
              <span className="text-fuchsia-300 font-black text-xs px-1.5 py-0.5 bg-fuchsia-950/60 rounded border border-fuchsia-500/30">
                RSI: {indicators.rsi}
              </span>
              <span className="text-rose-400 font-bold">≥85 Overbought (SELL)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-800 p-0.5 relative">
              <div
                className={`h-1.5 rounded-full ${
                  indicators.rsi <= 20
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : indicators.rsi >= 85
                    ? 'bg-red-500 shadow-sm shadow-red-500/50'
                    : 'bg-fuchsia-400'
                }`}
                style={{ width: `${indicators.rsi}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            {indicators.rsi <= 20
              ? '🟢 RSI এক্সট্রিম ওভারসোল্ড (≤20)। সর্বোচ্চ কনফার্মেশনের সাথে স্ট্রং বাই / লং রিভার্সাল জোন।'
              : indicators.rsi >= 85
              ? '🔴 RSI এক্সট্রিম ওভারবট (≥85)। সম্পূর্ণ ফুল সেল (FULL SELL) ও বিয়ারিশ রিজেকশন রিভার্সাল ট্রিগার।'
              : '⚪ RSI নিউট্রাল করিডোরে (২০ থেকে ৮৫ এর মধ্যে) ট্রেড করছে।'}
          </p>
        </div>

        {/* 3. MACD Momentum */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              MACD (12, 26, 9)
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-400">
              Hist: {indicators.macd.histogram}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
            <div className="bg-slate-950/50 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px]">MACD Line:</span>
              <div className="text-slate-200 font-bold">{indicators.macd.macdLine}</div>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px]">Signal Line:</span>
              <div className="text-slate-200 font-bold">{indicators.macd.signalLine}</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            হিস্টোগ্রাম {indicators.macd.histogram >= 0 ? 'পজিটিভ' : 'নেগেটিভ'} (
            {indicators.macd.histogram >= 0 ? 'বুলিশ' : 'বিয়ারিশ'} মোমেন্টাম)।
          </p>
        </div>

        {/* 4. Bollinger Bands (10, 2.0) & VWAP */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-fuchsia-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-fuchsia-400" />
              Bollinger Bands (10, 2.0)
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
              Period 10 | Mult 2.0
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono my-2">
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                UP (Upper Band):
              </span>
              <span className="text-yellow-300 font-bold">${indicators.bollingerBands.upper}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1 text-fuchsia-400">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 inline-block" />
                MB (Middle SMA 10):
              </span>
              <span className="text-fuchsia-300">${indicators.bollingerBands.middle}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                DN (Lower Band):
              </span>
              <span className="text-purple-300 font-bold">${indicators.bollingerBands.lower}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-amber-400 font-bold">
              <span>VWAP:</span>
              <span>${indicators.vwap.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] space-y-1 text-slate-300">
            <div className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span>🟢 BUY:</span> গ্রীন হ্যামার (High &lt; লোয়ার ব্যান্ড DN)
            </div>
            <div className="text-rose-400 flex items-center gap-1 font-semibold">
              <span>🔴 SELL:</span> রেড ইনভার্টেড হ্যামার (Low &gt; আপার ব্যান্ড UP)
            </div>
          </div>
        </div>

        {/* 5. Support & Resistance Pivot Points */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 md:col-span-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Pivot Support & Resistance Levels
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono my-2">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-[10px] block mb-1">
                KEY SUPPORT LEVELS
              </span>
              {indicators.support.map((sup, idx) => (
                <div key={idx} className="text-slate-200">
                  S{idx + 1}: ${sup.toLocaleString()}
                </div>
              ))}
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-amber-500/20 text-center">
              <span className="text-amber-400 font-bold text-[10px] block mb-1">
                PIVOT POINT
              </span>
              <div className="text-slate-100 font-bold text-sm">
                ${indicators.pivotPoint.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-red-500/20">
              <span className="text-red-400 font-bold text-[10px] block mb-1">
                KEY RESISTANCE LEVELS
              </span>
              {indicators.resistance.map((res, idx) => (
                <div key={idx} className="text-slate-200">
                  R{idx + 1}: ${res.toLocaleString()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
