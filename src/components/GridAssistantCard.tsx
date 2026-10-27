import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Zap,
  Calculator,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Play,
  Square,
  AlertTriangle,
  Settings,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GridParameters, TickerData, TechnicalIndicators, FinalDirection } from '../types';
import { calculateGridStrategy } from '../utils/technicalAnalysis';

interface GridAssistantCardProps {
  ticker: TickerData;
  indicators: TechnicalIndicators;
  recommendedDirection?: FinalDirection;
}

export const GridAssistantCard: React.FC<GridAssistantCardProps> = ({
  ticker,
  indicators,
  recommendedDirection = 'NEUTRAL',
}) => {
  // Determine AI Recommendation
  const aiRecDirection: FinalDirection =
    recommendedDirection === 'LONG'
      ? 'LONG'
      : recommendedDirection === 'SHORT'
      ? 'SHORT'
      : recommendedDirection === 'NEUTRAL'
      ? 'NEUTRAL'
      : ticker.price24hPcnt * 100 >= 3.5
      ? 'LONG'
      : ticker.price24hPcnt * 100 <= -3.5
      ? 'SHORT'
      : 'NEUTRAL';

  const [mode, setMode] = useState<'AI_AUTO' | 'MANUAL'>('AI_AUTO');
  const [direction, setDirection] = useState<FinalDirection>(aiRecDirection);
  const [investment, setInvestment] = useState<number>(100);
  const [gridType, setGridType] = useState<'Arithmetic' | 'Geometric'>('Arithmetic');
  const [leverage, setLeverage] = useState<number>(1);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Dynamic calculations based on ATR
  const price = ticker.lastPrice || 100;
  const atr = indicators.atr || price * 0.025;
  const defaultLower = Number((price - 3 * atr).toFixed(2));
  const defaultUpper = Number((price + 3 * atr).toFixed(2));
  const defaultGridCount = Math.min(60, Math.max(15, Math.round(((defaultUpper - defaultLower) / (atr * 0.4)))));

  const [customLower, setCustomLower] = useState<number>(defaultLower);
  const [customUpper, setCustomUpper] = useState<number>(defaultUpper);
  const [gridCount, setGridCount] = useState<number>(defaultGridCount);

  // Trailing Stop settings (5% - 99%)
  const [trailingStopEnabled, setTrailingStopEnabled] = useState<boolean>(true);
  const [trailingStopPcnt, setTrailingStopPcnt] = useState<number>(5);

  // Advanced Settings Toggle
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [trailingUpEnabled, setTrailingUpEnabled] = useState<boolean>(false);
  const [trailingDownEnabled, setTrailingDownEnabled] = useState<boolean>(false);

  // Paper Trading / Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedPnl, setSimulatedPnl] = useState<number>(0);
  const [simulatedTrades, setSimulatedTrades] = useState<number>(0);

  // Update defaults when AI Auto is active
  useEffect(() => {
    if (mode === 'AI_AUTO') {
      setDirection(aiRecDirection);
      setCustomLower(defaultLower);
      setCustomUpper(defaultUpper);
      setGridCount(defaultGridCount);
      setLeverage(1);
    }
  }, [mode, aiRecDirection, defaultLower, defaultUpper, defaultGridCount]);

  // Simulated live PnL ticker
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimulatedPnl((prev) => {
          const delta = (Math.random() - 0.48) * 0.25;
          return Number((prev + delta).toFixed(2));
        });
        if (Math.random() > 0.6) {
          setSimulatedTrades((t) => t + 1);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleCopyValue = (valText: string, fieldName: string) => {
    navigator.clipboard.writeText(valText);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const activeLower = mode === 'AI_AUTO' ? defaultLower : customLower;
  const activeUpper = mode === 'AI_AUTO' ? defaultUpper : customUpper;
  const activeGridCount = mode === 'AI_AUTO' ? defaultGridCount : gridCount;

  const grid: GridParameters = calculateGridStrategy(
    price,
    atr,
    investment,
    activeGridCount,
    leverage
  );

  const isDeviatingFromAi =
    mode === 'MANUAL' &&
    (direction !== aiRecDirection ||
      Math.abs(customLower - defaultLower) / price > 0.05 ||
      Math.abs(customUpper - defaultUpper) / price > 0.05 ||
      leverage > 3);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-lg">
            🤖
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-100 uppercase tracking-wider">
              AI Futures Grid Bot Setup ({ticker.symbol})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bybit-compliant Futures Grid parameter configuration engine with AI & manual controls.
            </p>
          </div>
        </div>

        {/* AI AUTO vs MANUAL Switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setMode('AI_AUTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              mode === 'AI_AUTO'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡</span>
            <span>AI AUTO MODE</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('MANUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              mode === 'MANUAL'
                ? 'bg-slate-800 text-slate-100 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛠️</span>
            <span>MANUAL MODE</span>
          </button>
        </div>
      </div>

      {/* Recommended Direction Mode Strip */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Grid Bot Direction Strategy
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            AI Central Engine recommends:{' '}
            <strong className={aiRecDirection === 'LONG' ? 'text-emerald-400' : aiRecDirection === 'SHORT' ? 'text-red-400' : 'text-amber-400'}>
              {aiRecDirection === 'LONG' ? '🟢 LONG (Bullish Grid)' : aiRecDirection === 'SHORT' ? '🔴 SHORT (Bearish Grid)' : '⚪ NEUTRAL (Ranging Grid)'}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'LONG', label: '🟢 LONG', desc: 'Bullish Grid' },
            { id: 'NEUTRAL', label: '⚪ NEUTRAL', desc: 'Range Grid' },
            { id: 'SHORT', label: '🔴 SHORT', desc: 'Bearish Grid' },
          ].map((dir) => (
            <button
              key={dir.id}
              type="button"
              disabled={mode === 'AI_AUTO'}
              onClick={() => setDirection(dir.id as FinalDirection)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                direction === dir.id
                  ? dir.id === 'LONG'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md'
                    : dir.id === 'SHORT'
                    ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-md'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                  : 'bg-slate-950/60 text-slate-500 border-slate-800 hover:text-slate-300'
              } ${mode === 'AI_AUTO' ? 'cursor-not-allowed opacity-90' : ''}`}
            >
              <div>{dir.label}</div>
              <span className="text-[9px] text-slate-400 block font-normal">{dir.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Deviation Warning in Manual Mode */}
      {isDeviatingFromAi && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">সতর্কবার্তা:</span> আপনার কাস্টম কনফিগারেশন AI সুপারিশ থেকে ভিন্ন (উচ্চতর লিভারেজ বা ভিন্ন দিক)। পর্যাপ্ত মার্জিন ও মূলধন সুরক্ষা নিশ্চিত করুন।
          </div>
        </div>
      )}

      {/* Main Bot Parameters Setup Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Parameter Inputs */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Bot Configuration Parameters</span>
            <span className="text-[10px] text-amber-400 font-mono">{mode}</span>
          </h4>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Price Range (USDT)</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Lower Price (Support)</span>
                <input
                  type="number"
                  disabled={mode === 'AI_AUTO'}
                  value={activeLower}
                  onChange={(e) => setCustomLower(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400 disabled:opacity-75"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Upper Price (Resistance)</span>
                <input
                  type="number"
                  disabled={mode === 'AI_AUTO'}
                  value={activeUpper}
                  onChange={(e) => setCustomUpper(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-red-400 font-bold focus:outline-none focus:border-amber-400 disabled:opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Grid Count & Grid Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Grid Count</span>
                <span className="text-amber-400 font-mono font-bold">{activeGridCount}</span>
              </div>
              <input
                type="range"
                min="15"
                max="80"
                step="5"
                disabled={mode === 'AI_AUTO'}
                value={activeGridCount}
                onChange={(e) => setGridCount(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer h-2 disabled:opacity-75"
              />
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                AI Optimal: {defaultGridCount} Grids
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1">Grid Type</span>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {(['Arithmetic', 'Geometric'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGridType(t)}
                    className={`py-1.5 rounded-lg border font-bold transition-all text-[11px] ${
                      gridType === t
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leverage */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Leverage Setting</span>
              <span className={`font-mono font-bold ${leverage === 1 ? 'text-emerald-400' : leverage <= 3 ? 'text-amber-400' : 'text-red-400'}`}>
                {leverage}x {leverage === 1 ? '(1x Spot-like Safe)' : leverage <= 3 ? '(Conservative)' : '(High Risk)'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-xs font-mono">
              {[1, 2, 3, 5, 10].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-1.5 rounded-lg border font-bold transition-all ${
                    leverage === lev
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-md'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Investment USDT (Pre-defined amounts without draining full balance) */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Investment Capital (USDT)</span>
              <span className="text-amber-400 font-mono font-bold">{investment} USDT</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mb-2 text-xs font-mono">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setInvestment(amt)}
                  className={`py-1 rounded-lg border transition-all ${
                    investment === amt
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {amt} USDT
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Strategy Output, Stop Loss & Trailing Stop */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase">
                Strategy Calculated Matrix
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Risk Level: {grid.riskLevel}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300 font-bold">Lower Price (Support):</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">${activeLower}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyValue(String(activeLower), 'lower')}
                    className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] flex items-center gap-1 border border-emerald-500/30"
                  >
                    {copiedField === 'lower' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'lower' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-300 font-bold">Upper Price (Resistance):</span>
                <div className="flex items-center gap-2">
                  <span className="text-red-400 font-bold">${activeUpper}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyValue(String(activeUpper), 'upper')}
                    className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] flex items-center gap-1 border border-red-500/30"
                  >
                    {copiedField === 'upper' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'upper' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Step Width per Grid:</span>
                <span className="text-slate-200 font-bold">${grid.gridStepUsdt}</span>
              </div>

              <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/60">
                <span className="text-slate-400">Estimated Profit / Grid:</span>
                <span className="text-amber-400 font-bold">~{grid.profitPerGridPcnt}%</span>
              </div>
            </div>

            {/* SEPARATED: Trade Stop Loss vs Bot Trailing Stop */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono">
                <span className="text-[10px] text-red-400 block font-bold uppercase">A. Trade Stop Loss</span>
                <span className="text-slate-100 font-bold text-sm block mt-0.5">${grid.suggestedStopLoss}</span>
                <span className="text-[9px] text-slate-400 block">Price-based hard liquidation protection</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono">
                <span className="text-[10px] text-amber-400 block font-bold uppercase">B. Bot Trailing Stop</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-amber-300 font-bold text-sm">{trailingStopPcnt}%</span>
                  <span className="text-[9px] text-slate-400">(5% - 99% range)</span>
                </div>
                <span className="text-[9px] text-slate-400 block">Bybit net value drawdown logic</span>
              </div>
            </div>
          </div>

          {/* Paper Trading / Simulation Button */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>🧪 Testnet Simulation Mode</span>
                {isSimulating && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {isSimulating
                  ? `Running: PnL +$${simulatedPnl} | Filled: ${simulatedTrades} trades`
                  : 'Simulate grid performance with zero risk'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                isSimulating
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-emerald-500 text-slate-950 shadow-md'
              }`}
            >
              {isSimulating ? <Square className="w-3.5 h-3.5 fill-red-400" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
              <span>{isSimulating ? 'বট থামান' : 'সিমুলেশন চালু'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Settings Accordion */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-slate-100 hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Advanced Bot Settings & Bybit Parameters</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold block">Trailing Up</span>
                  <span className="text-[10px] text-slate-500 font-sans">Move grid upwards on bullish breakout</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTrailingUpEnabled(!trailingUpEnabled)}
                  className={`px-3 py-1 rounded text-xs font-bold border ${
                    trailingUpEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {trailingUpEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-bold block">Trailing Down</span>
                  <span className="text-[10px] text-slate-500 font-sans">Move grid downwards on bearish channel</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTrailingDownEnabled(!trailingDownEnabled)}
                  className={`px-3 py-1 rounded text-xs font-bold border ${
                    trailingDownEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {trailingDownEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              💡 <strong>Bybit Bot Tip:</strong> Trailing Stop is calculated on your overall bot account equity drawdown, separate from individual order price stop loss. We suggest setting 5% trailing stop on high-volatility pairs.
            </p>
          </div>
        )}
      </div>

      {/* 3-Step Execution Guide in Bengali */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/80 space-y-2">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>বাইবিট অ্যাপে ফিউচার্স গ্রিড বট চালুর সহজ নির্দেশিকা (Bybit Execution Guide):</span>
        </h4>

        <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed font-sans">
          <li>
            Bybit অ্যাপে যান &gt; <strong>Tools</strong> &gt; <strong>Trading Bot</strong> &gt; <strong>Futures Grid</strong> সিলেক্ট করুন।
          </li>
          <li>
            কয়েন পেয়ার <strong className="text-amber-400">{ticker.symbol}</strong> এবং ডিরেকশন হিসেবে <strong className="text-emerald-400">{direction}</strong> সিলেক্ট করুন।
          </li>
          <li>
            <strong>Lower Price:</strong> <strong className="text-emerald-400">${activeLower}</strong> এবং <strong>Upper Price:</strong> <strong className="text-red-400">${activeUpper}</strong> কপি করে পেস্ট করুন।
          </li>
          <li>
            <strong>Grids:</strong> <strong className="text-slate-100">{activeGridCount}</strong>, <strong>Leverage:</strong> <strong className="text-slate-100">{leverage}x</strong> এবং <strong>Investment:</strong> <strong className="text-amber-400">{investment} USDT</strong> দিয়ে <strong>Create Bot</strong> ক্লিক করুন!
          </li>
        </ol>
      </div>
    </div>
  );
};

