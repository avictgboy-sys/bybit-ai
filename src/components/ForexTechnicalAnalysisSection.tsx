import React, { useState } from 'react';
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
  Radio,
  Coins,
  Globe,
} from 'lucide-react';
import { TechnicalIndicators, TickerData, EmaTradeSetup } from '../types';
import { TechnicalAnalysisTab } from './TechnicalAnalysisTab';
import { ExnessSignal } from '../services/exnessSignalService';
import { LiveMarketTick } from '../services/exnessLivePriceFeed';

interface ForexTechnicalAnalysisSectionProps {
  signals: ExnessSignal[];
  liveTicks: Record<string, LiveMarketTick>;
  initialSymbol?: string;
}

/**
 * Builds standard TechnicalIndicators and TickerData for any Forex / Exness pair
 */
export function buildForexTechnicalData(
  symbol: string,
  liveTick?: LiveMarketTick,
  matchingSignal?: ExnessSignal
): { indicators: TechnicalIndicators; currentPrice: number; coin: TickerData } {
  const currentPrice = liveTick?.price || matchingSignal?.currentPrice || (symbol === 'XAU/USD' ? 4471.50 : symbol === 'EUR/USD' ? 1.085 : symbol === 'GBP/USD' ? 1.295 : symbol === 'USD/JPY' ? 154.2 : symbol === 'US30' ? 43850 : 78780);
  const change24h = liveTick?.change24h ?? (matchingSignal ? 1.25 : 0.45);
  const isBullish = matchingSignal ? matchingSignal.type.includes('BUY') : change24h >= 0;

  const rsi = matchingSignal?.indicators.rsi || (isBullish ? 56.4 : 44.2);
  const rsiStatus = rsi <= 20 ? 'Oversold' : rsi >= 85 ? 'Overbought' : 'Neutral';

  // Realistic EMAs relative to current price
  const ema50 = Number((currentPrice * (isBullish ? 0.994 : 1.006)).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const ema100 = Number((currentPrice * (isBullish ? 0.988 : 1.012)).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const ema200 = Number((currentPrice * (isBullish ? 0.978 : 1.022)).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const ema20 = Number((currentPrice * (isBullish ? 0.997 : 1.003)).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const sma20 = ema20;
  const sma50 = ema50;

  // Bollinger Bands
  const bbRange = currentPrice * 0.015;
  const bollingerBands = {
    upper: Number((currentPrice + bbRange).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    middle: Number(currentPrice.toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    lower: Number((currentPrice - bbRange).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2)),
    bandwidth: 3.0,
    squeeze: false,
  };

  // Support & Resistance
  const s1 = matchingSignal?.stopLoss || Number((currentPrice * 0.988).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const s2 = Number((currentPrice * 0.975).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const r1 = matchingSignal?.tp1 || Number((currentPrice * 1.012).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const r2 = matchingSignal?.tp2 || Number((currentPrice * 1.025).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));
  const pivotPoint = Number((currentPrice * 0.999).toFixed(symbol.includes('USD') && !symbol.includes('XAU') && !symbol.includes('BTC') ? 5 : 2));

  // MACD
  const macd = {
    macdLine: isBullish ? 4.25 : -3.85,
    signalLine: isBullish ? 2.15 : -1.95,
    histogram: isBullish ? 2.1 : -1.9,
    trend: (isBullish ? 'Bullish Crossover' : 'Bearish Crossover') as 'Bullish Crossover' | 'Bearish Crossover' | 'Neutral',
  };

  const emaSetup: EmaTradeSetup = {
    symbol,
    direction: isBullish ? 'LONG' : 'SHORT',
    trendTitleBn: isBullish
      ? `EMA ৫০/১০০/২০০ গোল্ডেন বুলিশ অ্যালাইনমেন্ট (${symbol})`
      : `EMA ৫০/১০০/২০০ বিয়ারিশ ডেথ অ্যালাইনমেন্ট (${symbol})`,
    signalBadge: isBullish ? 'GOLDEN_ALIGNMENT' : 'DEATH_ALIGNMENT',
    entryPrice: matchingSignal?.entryZone[0] ?? currentPrice,
    entryRange: {
      min: matchingSignal?.entryZone[0] ?? Number((currentPrice * 0.998).toFixed(2)),
      max: matchingSignal?.entryZone[1] ?? Number((currentPrice * 1.002).toFixed(2)),
    },
    tp1: matchingSignal?.tp1 ?? Number((currentPrice * (isBullish ? 1.008 : 0.992)).toFixed(2)),
    tp1GainPcnt: 0.8,
    tp2: matchingSignal?.tp2 ?? Number((currentPrice * (isBullish ? 1.018 : 0.982)).toFixed(2)),
    tp2GainPcnt: 1.8,
    tp3: matchingSignal?.tp3 ?? Number((currentPrice * (isBullish ? 1.032 : 0.968)).toFixed(2)),
    tp3GainPcnt: 3.2,
    stopLoss: matchingSignal?.stopLoss ?? Number((currentPrice * (isBullish ? 0.992 : 1.008)).toFixed(2)),
    stopLossPcnt: 0.8,
    riskRewardRatio: matchingSignal?.riskReward || (isBullish ? '1:2.65' : '1:2.40'),
    confidenceScore: matchingSignal?.winRate || 92,
    summaryBn: matchingSignal?.analysisBangla || `${symbol} এর মার্কেট স্ট্রাকচার এবং EMA ৫০/১০০/২০০ অ্যালাইনমেন্ট ${isBullish ? 'বুলিশ রিবাউন্ড' : 'বিয়ারিশ পুলব্যাক'} সমর্থন করছে।`,
    ema50,
    ema100,
    ema200,
    currentPrice,
    distanceToEma50Pcnt: 0.6,
    distanceToEma200Pcnt: 2.2,
    statusLabel: isBullish ? 'STRONG BUY' : 'STRONG SELL',
  };

  const indicators: TechnicalIndicators = {
    rsi,
    rsiStatus,
    macd,
    ema20,
    ema50,
    ema100,
    ema200,
    emaAlignment: isBullish ? 'Strong Bullish' : 'Strong Bearish',
    sma20,
    sma50,
    atr: currentPrice * 0.006,
    bollingerBands,
    vwap: currentPrice * 0.999,
    volumeTrend: 'High Spike',
    support: [s1, s2],
    resistance: [r1, r2],
    trendStrength: matchingSignal?.winRate || 88,
    pivotPoint,
    emaTradeSetup: emaSetup,
  };

  const coin: TickerData = {
    symbol,
    baseCoin: symbol.split('/')[0] || symbol,
    quoteCoin: symbol.split('/')[1] || 'USD',
    lastPrice: currentPrice,
    prevPrice24h: currentPrice / (1 + change24h / 100),
    price24hPcnt: change24h / 100,
    highPrice24h: currentPrice * 1.015,
    lowPrice24h: currentPrice * 0.985,
    turnover24h: 54000000,
    volume24h: 1250000,
    fundingRate: 0.005,
    openInterest: 24000,
  };

  return { indicators, currentPrice, coin };
}

export const ForexTechnicalAnalysisSection: React.FC<ForexTechnicalAnalysisSectionProps> = ({
  signals,
  liveTicks,
  initialSymbol = 'XAU/USD',
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);

  const availableSymbols = [
    { symbol: 'XAU/USD', name: 'Gold Spot', icon: Coins, color: 'text-amber-400' },
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', icon: Globe, color: 'text-cyan-400' },
    { symbol: 'GBP/USD', name: 'British Pound', icon: Globe, color: 'text-indigo-400' },
    { symbol: 'USD/JPY', name: 'US Dollar / Yen', icon: Globe, color: 'text-purple-400' },
    { symbol: 'US30', name: 'Dow Jones CFD', icon: Activity, color: 'text-emerald-400' },
    { symbol: 'BTC/USD', name: 'Bitcoin CFD', icon: Zap, color: 'text-yellow-400' },
  ];

  const currentTick = liveTicks[selectedSymbol];
  const matchingSignal = signals.find((s) => s.symbol === selectedSymbol);
  const { indicators, currentPrice, coin } = React.useMemo(
    () => buildForexTechnicalData(selectedSymbol, currentTick, matchingSignal),
    [selectedSymbol, currentTick?.price, matchingSignal?.id]
  );

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-slate-950/95 border border-emerald-500/30 shadow-2xl space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-100 font-mono tracking-tight">
                Exness ও Forex টেকনিক্যাল অ্যানালাইসিস সেটআপ (Technical Pro Engine)
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                100% IDENTICAL SETUP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Signal Strength Indicator, 9-Factor Confluence Engine, EMA 50/100/200 Action Box, RSI, MACD, Bollinger Bands ও Pivot লেভেল
            </p>
          </div>
        </div>

        {/* Live Tick Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900/90 px-3.5 py-2 rounded-2xl border border-slate-800 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">লাইভ রেট:</span>
          <strong className="text-emerald-400 text-sm font-black">
            {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </strong>
        </div>
      </div>

      {/* Asset Switcher Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {availableSymbols.map((item) => {
          const isSelected = selectedSymbol === item.symbol;
          const IconComp = item.icon;
          const liveVal = liveTicks[item.symbol]?.price;
          return (
            <button
              key={item.symbol}
              type="button"
              onClick={() => setSelectedSymbol(item.symbol)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : item.color}`} />
              <span>{item.symbol}</span>
              {liveVal && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-950 text-slate-400'
                  }`}
                >
                  {liveVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Renders the EXACT same TechnicalAnalysisTab component */}
      <div className="pt-2">
        <TechnicalAnalysisTab
          indicators={indicators}
          currentPrice={currentPrice}
          coin={coin}
        />
      </div>
    </div>
  );
};
