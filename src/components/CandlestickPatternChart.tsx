import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Target,
  Crosshair,
  Compass,
  Zap,
  Radio,
  Wifi,
  WifiOff,
  Code2,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  Clock,
} from 'lucide-react';
import { KlinePoint, Timeframe, EmaTradeSetup, TickerData, TechnicalIndicators } from '../types';
import { detectCandlestickPatterns, DetectedPattern } from '../utils/candlestickPatterns';
import { formatPrice } from '../utils/formatters';
import { calculateEMA, calculateEmaTradeSetup } from '../utils/technicalAnalysis';
import { bybitWs, BybitTradeTick, BybitTickerUpdate } from '../services/bybitWebSocket';
import { CandlestickVisual } from './CandlestickVisual';
import { CandlestickLearningModal } from './CandlestickLearningModal';

export const PINE_SCRIPT_V5_CODE = `//@version=5
indicator("Bollinger Bands Custom Signal Strategy", overlay=true)

// ==========================================
// 1. INPUT SETTINGS & BOLLINGER BANDS (10, 2.0)
// ==========================================
bbPeriod = input.int(10, title="Bollinger Bands Period", minval=1)
bbMult   = input.float(2.0, title="Standard Deviation Multiplier", minval=0.1, step=0.1)

// Calculate Bollinger Bands
[middleBand, upperBand, lowerBand] = ta.bb(close, bbPeriod, bbMult)

// Plot Bollinger Bands with Specified Colors
plot(upperBand,  title="Upper Band (UP)",   color=color.yellow,  linewidth=2)
plot(middleBand, title="Middle Band (MB)",  color=color.fuchsia, linewidth=2) // Pink / Magenta
plot(lowerBand,  title="Lower Band (DN)",   color=color.purple,  linewidth=2)

// ==========================================
// 2. CANDLESTICK PATTERN LOGIC
// ==========================================
// Candle components
bodySize  = math.abs(close - open)
isBullish = close > open
isBearish = open > close

upperWick = isBullish ? (high - close) : (high - open)
lowerWick = isBullish ? (open - low)   : (close - low)

// Green Hammer:
// - Bullish (Close > Open)
// - Lower wick >= 2 * Body size
// - Upper wick <= 0.5 * Body size
isGreenHammer = isBullish and (lowerWick >= 2 * bodySize) and (upperWick <= 0.5 * bodySize)

// Red Inverted Hammer:
// - Bearish (Open > Close)
// - Upper wick >= 2 * Body size
// - Lower wick <= 0.5 * Body size
isRedInvertedHammer = isBearish and (upperWick >= 2 * bodySize) and (lowerWick <= 0.5 * bodySize)

// ==========================================
// 3. SIGNAL TRIGGER CONDITIONS
// ==========================================
// BUY Signal: Green Hammer strictly BELOW Lower Band (Entire candle below DN: High < lowerBand)
buySignal = isGreenHammer and (high < lowerBand)

// SELL Signal: Red Inverted Hammer strictly ABOVE Upper Band (Entire candle above UP: Low > upperBand)
sellSignal = isRedInvertedHammer and (low > upperBand)

// ==========================================
// 4. CHART PLOTS, LABELS & SHAPES
// ==========================================
// Plot Buy Signal Label (Green below bar)
plotshape(buySignal, title="Buy Signal Label", style=shape.labelup, location=location.belowbar,
          color=color.green, text="BUY", textcolor=color.white, size=size.normal)

// Plot Sell Signal Label (Red above bar)
plotshape(sellSignal, title="Sell Signal Label", style=shape.labeldown, location=location.abovebar,
          color=color.red, text="SELL", textcolor=color.white, size=size.normal)

// Highlight Bar Color
barcolor(buySignal ? color.green : sellSignal ? color.red : na)

// ==========================================
// 5. ALERT CONDITIONS
// ==========================================
alertcondition(buySignal, title="BB Custom BUY Alert", 
               message="BUY Signal: Green Hammer below Lower Bollinger Band on {{ticker}} at {{close}}")

alertcondition(sellSignal, title="BB Custom SELL Alert", 
               message="SELL Signal: Red Inverted Hammer above Upper Bollinger Band on {{ticker}} at {{close}}")`;

interface CandlestickPatternChartProps {
  klines: KlinePoint[];
  symbol: string;
  timeframe: Timeframe;
  coin?: TickerData;
  indicators?: TechnicalIndicators;
  onTimeframeChange?: (tf: Timeframe) => void;
  height?: number;
  showPatterns?: boolean;
  showSMA?: boolean;
  showVolume?: boolean;
  className?: string;
}

export const CandlestickPatternChart: React.FC<CandlestickPatternChartProps> = ({
  klines,
  symbol,
  timeframe,
  coin,
  indicators,
  onTimeframeChange,
  height = 360,
  showPatterns = true,
  showSMA = true,
  showVolume = true,
  className = '',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);
  const [viewCount, setViewCount] = useState<number>(45); // default show last 45 candles

  // EMA & Target & BB toggles
  const [displayEMA50, setDisplayEMA50] = useState<boolean>(true);
  const [displayEMA100, setDisplayEMA100] = useState<boolean>(true);
  const [displayEMA200, setDisplayEMA200] = useState<boolean>(true);
  const [displayBB, setDisplayBB] = useState<boolean>(true);
  const [showTargets, setShowTargets] = useState<boolean>(true);
  const [displaySMA20, setDisplaySMA20] = useState<boolean>(false);
  const [showPineScriptModal, setShowPineScriptModal] = useState<boolean>(false);
  const [copiedPineScript, setCopiedPineScript] = useState<boolean>(false);
  const [showLearningModal, setShowLearningModal] = useState<boolean>(false);
  const [learningPatternId, setLearningPatternId] = useState<string | undefined>(undefined);

  // Real Bybit Live WebSocket Stream State (100% Real Trade Execution from Bybit)
  const [isWsConnected, setIsWsConnected] = useState<boolean>(true);
  const [liveRealPrice, setLiveRealPrice] = useState<number | null>(null);
  const [lastTrade, setLastTrade] = useState<BybitTradeTick | null>(null);
  const [tickDirection, setTickDirection] = useState<'UP' | 'DOWN' | 'NEUTRAL'>('UP');
  const [tickCount, setTickCount] = useState<number>(0);
  const [liveVolumeDelta, setLiveVolumeDelta] = useState<number>(0);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const tradeThrottleRef = useRef<{
    lastUpdate: number;
    pendingPrice: number | null;
    pendingTrade: BybitTradeTick | null;
    pendingDirection: 'UP' | 'DOWN' | 'NEUTRAL';
    volumeDeltaAccum: number;
    timer: any;
  }>({
    lastUpdate: 0,
    pendingPrice: null,
    pendingTrade: null,
    pendingDirection: 'UP',
    volumeDeltaAccum: 0,
    timer: null,
  });

  // Monitor WebSocket Connection Status
  useEffect(() => {
    const unsub = bybitWs.onStatusChange((connected) => {
      setIsWsConnected(connected);
    });
    return unsub;
  }, []);

  // Subscribe to 100% Real-Time Bybit Trades & Live Tickers
  useEffect(() => {
    if (!isStreaming) return;

    // Reset live overrides when symbol changes
    setLiveRealPrice(null);
    setLastTrade(null);
    setLiveVolumeDelta(0);
    setTickCount(0);
    tradeThrottleRef.current.volumeDeltaAccum = 0;

    const flushLiveTrade = () => {
      const state = tradeThrottleRef.current;
      if (state.pendingPrice !== null) {
        setLiveRealPrice(state.pendingPrice);
        if (state.pendingTrade) setLastTrade(state.pendingTrade);
        setTickDirection(state.pendingDirection);
        setTickCount((prev) => (prev + 1) % 10000);
        setLiveVolumeDelta(state.volumeDeltaAccum);
      }
    };

    const unsub = bybitWs.subscribeSymbol(symbol, {
      timeframe: timeframe === '15m' ? '15' : timeframe === '1h' ? '60' : timeframe === '4h' ? '240' : 'D',
      onTrade: (trade: BybitTradeTick) => {
        const state = tradeThrottleRef.current;
        state.pendingPrice = trade.price;
        state.pendingTrade = trade;
        state.pendingDirection = trade.side === 'Buy' ? 'UP' : 'DOWN';
        state.volumeDeltaAccum += trade.size;

        const now = Date.now();
        if (now - state.lastUpdate > 150) {
          state.lastUpdate = now;
          flushLiveTrade();
        } else if (!state.timer) {
          state.timer = setTimeout(() => {
            state.timer = null;
            state.lastUpdate = Date.now();
            flushLiveTrade();
          }, 150);
        }
      },
      onTicker: (ticker: BybitTickerUpdate) => {
        if (ticker.lastPrice && ticker.lastPrice > 0) {
          const state = tradeThrottleRef.current;
          state.pendingPrice = ticker.lastPrice;
          if (liveRealPrice !== null) {
            state.pendingDirection = ticker.lastPrice >= liveRealPrice ? 'UP' : 'DOWN';
          }
          const now = Date.now();
          if (now - state.lastUpdate > 200) {
            state.lastUpdate = now;
            flushLiveTrade();
          }
        }
      },
    });

    return () => {
      if (tradeThrottleRef.current.timer) {
        clearTimeout(tradeThrottleRef.current.timer);
        tradeThrottleRef.current.timer = null;
      }
      unsub();
    };
  }, [symbol, timeframe, isStreaming]);

  // Slice klines and update the active current candle with ACTUAL real Bybit executed market price
  const visibleKlines = useMemo(() => {
    if (!klines || klines.length === 0) return [];
    const rawVisible = klines.slice(Math.max(0, klines.length - viewCount));
    if (rawVisible.length === 0) return rawVisible;

    // If we have a real live Bybit executed price, update the active candle precisely
    if (liveRealPrice !== null && liveRealPrice > 0) {
      const cloned = [...rawVisible];
      const lastIdx = cloned.length - 1;
      const baseCandle = cloned[lastIdx];

      cloned[lastIdx] = {
        ...baseCandle,
        close: liveRealPrice,
        high: Math.max(baseCandle.high, liveRealPrice),
        low: Math.min(baseCandle.low, liveRealPrice),
        volume: baseCandle.volume + liveVolumeDelta,
      };

      return cloned;
    }

    return rawVisible;
  }, [klines, viewCount, liveRealPrice, liveVolumeDelta]);

  const lastPrice = useMemo(() => {
    if (visibleKlines.length === 0) return 0;
    return visibleKlines[visibleKlines.length - 1].close;
  }, [visibleKlines]);

  // Full EMA Trade Setup for this coin (Entry, TP 1, 2, 3, SL)
  const emaSetup: EmaTradeSetup = useMemo(() => {
    return calculateEmaTradeSetup(klines, lastPrice, symbol, coin, indicators);
  }, [klines, lastPrice, symbol, coin, indicators]);

  // Dynamic EMA Series for visible candles
  const { ema50Series, ema100Series, ema200Series } = useMemo(() => {
    if (visibleKlines.length === 0) {
      return { ema50Series: [], ema100Series: [], ema200Series: [] };
    }
    const closes = visibleKlines.map((k) => k.close);
    return {
      ema50Series: calculateEMA(closes, 50),
      ema100Series: calculateEMA(closes, 100),
      ema200Series: calculateEMA(closes, 200),
    };
  }, [visibleKlines]);

  const latestEma50 = ema50Series.length > 0 ? ema50Series[ema50Series.length - 1] : emaSetup.ema50;
  const latestEma100 = ema100Series.length > 0 ? ema100Series[ema100Series.length - 1] : emaSetup.ema100;
  const latestEma200 = ema200Series.length > 0 ? ema200Series[ema200Series.length - 1] : emaSetup.ema200;

  // Dynamic Bollinger Bands (Period: 10, Mult: 2.0) & Buy/Sell Signals
  const { bbUpperSeries, bbMiddleSeries, bbLowerSeries, bbSignals } = useMemo(() => {
    if (visibleKlines.length === 0) {
      return { bbUpperSeries: [], bbMiddleSeries: [], bbLowerSeries: [], bbSignals: [] };
    }
    const closes = visibleKlines.map((k) => k.close);
    const uppers: number[] = [];
    const middles: number[] = [];
    const lowers: number[] = [];
    const signals: { index: number; type: 'BUY' | 'SELL'; price: number; high: number; low: number }[] = [];

    for (let i = 0; i < visibleKlines.length; i++) {
      if (i < 9) {
        uppers.push(0);
        middles.push(0);
        lowers.push(0);
        continue;
      }
      const slice = closes.slice(i - 9, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / 10;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 10;
      const stdDev = Math.sqrt(variance);
      const up = mean + 2.0 * stdDev;
      const dn = mean - 2.0 * stdDev;
      uppers.push(up);
      middles.push(mean);
      lowers.push(dn);

      const c = visibleKlines[i];
      const body = Math.abs(c.close - c.open);
      const isGreen = c.close > c.open;
      const isRed = c.open > c.close;
      const upperWick = isGreen ? c.high - c.close : c.high - c.open;
      const lowerWick = isGreen ? c.open - c.low : c.close - c.low;

      // BUY Signal: Green Hammer strictly BELOW Lower Band (High < dn)
      const isGreenHammer = isGreen && lowerWick >= 2 * body && upperWick <= 0.5 * body;
      if (isGreenHammer && c.high < dn) {
        signals.push({ index: i, type: 'BUY', price: c.close, high: c.high, low: c.low });
      }

      // SELL Signal: Red Inverted Hammer strictly ABOVE Upper Band (Low > up)
      const isRedInvertedHammer = isRed && upperWick >= 2 * body && lowerWick <= 0.5 * body;
      if (isRedInvertedHammer && c.low > up) {
        signals.push({ index: i, type: 'SELL', price: c.close, high: c.high, low: c.low });
      }
    }

    return {
      bbUpperSeries: uppers,
      bbMiddleSeries: middles,
      bbLowerSeries: lowers,
      bbSignals: signals,
    };
  }, [visibleKlines]);

  const latestBbUpper = bbUpperSeries.length > 0 ? bbUpperSeries[bbUpperSeries.length - 1] : 0;
  const latestBbMiddle = bbMiddleSeries.length > 0 ? bbMiddleSeries[bbMiddleSeries.length - 1] : 0;
  const latestBbLower = bbLowerSeries.length > 0 ? bbLowerSeries[bbLowerSeries.length - 1] : 0;

  // Detect candlestick patterns
  const detectedPatterns = useMemo(() => {
    return detectCandlestickPatterns(visibleKlines);
  }, [visibleKlines]);

  // Latest detected pattern on the most recent candles
  const latestPattern = useMemo(() => {
    if (detectedPatterns.length === 0) return null;
    return detectedPatterns[detectedPatterns.length - 1];
  }, [detectedPatterns]);

  // Math bounds for chart
  const { minPrice, maxPrice, maxVolume, priceRange } = useMemo(() => {
    if (visibleKlines.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 1000, priceRange: 100 };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;

    visibleKlines.forEach((k, idx) => {
      if (k.low < min) min = k.low;
      if (k.high > max) max = k.high;
      if (k.volume > maxVol) maxVol = k.volume;

      if (displayEMA50 && ema50Series[idx]) {
        if (ema50Series[idx] < min) min = ema50Series[idx];
        if (ema50Series[idx] > max) max = ema50Series[idx];
      }
      if (displayEMA100 && ema100Series[idx]) {
        if (ema100Series[idx] < min) min = ema100Series[idx];
        if (ema100Series[idx] > max) max = ema100Series[idx];
      }
      if (displayEMA200 && ema200Series[idx]) {
        if (ema200Series[idx] < min) min = ema200Series[idx];
        if (ema200Series[idx] > max) max = ema200Series[idx];
      }
      if (displayBB) {
        if (bbLowerSeries[idx] && bbLowerSeries[idx] > 0 && bbLowerSeries[idx] < min) {
          min = bbLowerSeries[idx];
        }
        if (bbUpperSeries[idx] && bbUpperSeries[idx] > 0 && bbUpperSeries[idx] > max) {
          max = bbUpperSeries[idx];
        }
      }
    });

    if (showTargets && emaSetup) {
      if (emaSetup.stopLoss && emaSetup.stopLoss < min) min = emaSetup.stopLoss;
      if (emaSetup.tp3 && emaSetup.tp3 > max) max = emaSetup.tp3;
    }

    const pad = (max - min) * 0.08 || 1;
    return {
      minPrice: Math.max(0, min - pad),
      maxPrice: max + pad,
      maxVolume: maxVol || 1,
      priceRange: max + pad - (min - pad) || 1,
    };
  }, [visibleKlines, ema50Series, ema100Series, ema200Series, bbUpperSeries, bbLowerSeries, displayEMA50, displayEMA100, displayEMA200, displayBB, showTargets, emaSetup]);

  // Chart Dimensions
  const svgWidth = 800;
  const svgHeight = height;
  const paddingLeft = 10;
  const paddingRight = 75; // room for price labels and target tags
  const paddingTop = 25;
  const paddingBottom = showVolume ? 55 : 25;
  const chartPlotHeight = svgHeight - paddingTop - paddingBottom;
  const volumeHeight = showVolume ? 45 : 0;
  const pricePlotHeight = chartPlotHeight - volumeHeight;

  const candleCount = visibleKlines.length;
  const candleSpacing = (svgWidth - paddingLeft - paddingRight) / Math.max(1, candleCount);
  const candleWidth = Math.max(3, Math.min(18, candleSpacing * 0.72));

  // Convert Price to Y coordinate
  const priceToY = (price: number) => {
    const norm = (price - minPrice) / priceRange;
    return paddingTop + pricePlotHeight * (1 - norm);
  };

  // Convert Volume to Y coordinate
  const volumeToY = (vol: number) => {
    const ratio = Math.min(1, vol / maxVolume);
    const bottomY = svgHeight - 20;
    return bottomY - ratio * volumeHeight;
  };

  // Active hover candle
  const activeCandle = hoverIndex !== null && visibleKlines[hoverIndex]
    ? visibleKlines[hoverIndex]
    : visibleKlines[visibleKlines.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || visibleKlines.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = svgWidth / rect.width;
    const xInSvg = clientX * scaleX;

    const plotX = xInSvg - paddingLeft;
    const idx = Math.floor(plotX / candleSpacing);
    if (idx >= 0 && idx < visibleKlines.length) {
      setHoverIndex(idx);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  if (!visibleKlines || visibleKlines.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 bg-slate-950/80 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        ক্যান্ডেলস্টিক ডাটা লোড হচ্ছে...
      </div>
    );
  }

  // Price Grid Lines (4 lines)
  const gridSteps = 4;
  const gridPrices = Array.from({ length: gridSteps + 1 }, (_, i) => {
    return minPrice + (priceRange / gridSteps) * i;
  });

  return (
    <div className={`space-y-3 font-sans ${className}`}>
      {/* Top Chart Toolbar: Pair, Timeframe, Active OHLC, Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-950/90 rounded-2xl border border-slate-800/90 shadow-lg">
        {/* Left: Ticker Name & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-xs">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>{symbol} ক্যান্ডেলস্টিক + EMA চার্ট</span>
          </div>

          {/* Real-time Bybit WebSocket Live Indicator & Stream Toggle */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center gap-1.5 font-bold transition-all px-2.5 py-0.5 rounded-lg ${
                isStreaming
                  ? 'bg-emerald-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bybit রিয়েল-টাইম মার্কেট প্রাইজ এবং ট্রেড স্ট্রিম অন-অফ করুন"
            >
              {isStreaming ? (
                <Wifi className="w-3 h-3 text-slate-950 animate-pulse" />
              ) : (
                <WifiOff className="w-3 h-3 text-slate-500" />
              )}
              <span>{isStreaming ? '🟢 BYBIT LIVE WS' : '⏸️ WS PAUSED'}</span>
            </button>

            {isStreaming && (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
                {/* 4-Bar Animated Live Trade Volume Flow */}
                <div className="flex items-end gap-0.5 h-3.5 w-6 px-0.5" title="Bybit রিয়েল-টাইম ট্রেড ফ্লো">
                  <div
                    className="w-1 bg-emerald-400 rounded-t transition-all duration-100"
                    style={{ height: `${20 + (tickCount % 4) * 26}%` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-t transition-all duration-100"
                    style={{ height: `${30 + ((tickCount + 1) % 3) * 35}%` }}
                  />
                  <div
                    className="w-1 bg-cyan-400 rounded-t transition-all duration-100"
                    style={{ height: `${40 + (tickCount % 5) * 15}%` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-t transition-all duration-100"
                    style={{ height: `${25 + ((tickCount + 2) % 4) * 25}%` }}
                  />
                </div>

                {/* Real-time Trade Tick Counter */}
                <span className="text-[9px] font-mono text-slate-300 font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
                  <span className="text-slate-500">Tick:</span>
                  {lastTrade ? (
                    <strong className={lastTrade.side === 'Buy' ? 'text-emerald-400' : 'text-rose-400'}>
                      {lastTrade.side === 'Buy' ? '▲' : '▼'} {lastTrade.size}
                    </strong>
                  ) : (
                    <span className="text-slate-400">REAL TICK</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {onTimeframeChange && (
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {(['15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
                    timeframe === tf
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Technical EMA 50 / 100 / 200 & Target Toggles */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setDisplayEMA50(!displayEMA50)}
            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
              displayEMA50
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle EMA 50 (Golden Amber)"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-sm" />
            <span>EMA 50: ${latestEma50.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayEMA100(!displayEMA100)}
            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
              displayEMA100
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 font-bold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle EMA 100 (Cyan Sky)"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block shadow-sm" />
            <span>EMA 100: ${latestEma100.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayEMA200(!displayEMA200)}
            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
              displayEMA200
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50 font-bold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle EMA 200 (Major Trend Violet)"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block shadow-sm" />
            <span>EMA 200: ${latestEma200.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayBB(!displayBB)}
            className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
              displayBB
                ? 'bg-fuchsia-950/40 text-fuchsia-300 border-fuchsia-500/60 font-bold shadow-sm shadow-fuchsia-500/20'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle Bollinger Bands (10, 2.0) Custom Signal Strategy"
          >
            <div className="flex items-center -space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" title="Upper Band (Yellow)" />
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 inline-block" title="Middle Band (Magenta)" />
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" title="Lower Band (Purple)" />
            </div>
            <span>BB (10, 2) Strategy</span>
            {bbSignals.length > 0 && (
              <span className="px-1 py-0.2 bg-fuchsia-500 text-slate-950 rounded-full font-black text-[9px]">
                {bbSignals.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowPineScriptModal(true)}
            className="px-2 py-1 rounded-lg border bg-gradient-to-r from-blue-950/50 to-indigo-950/50 hover:from-blue-900/60 hover:to-indigo-900/60 text-blue-300 border-blue-500/40 hover:border-blue-400 transition flex items-center gap-1 font-bold shadow-sm"
            title="TradingView Pine Script (v5) Code"
          >
            <Code2 className="w-3 h-3 text-blue-400" />
            <span>Pine Script (v5)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTargets(!showTargets)}
            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 ${
              showTargets
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="Toggle Entry / TP / SL Lines on Chart"
          >
            <Target className="w-3 h-3 text-emerald-400" />
            <span>Entry / TP / SL</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setViewCount((prev) => Math.min(80, prev + 15))}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Zoom Out (Show More Candles)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 font-mono text-slate-300">{viewCount}C</span>
            <button
              onClick={() => setViewCount((prev) => Math.max(20, prev - 10))}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded"
              title="Zoom In (Show Fewer Candles)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Active Candle OHLC Banner with Real Bybit Execution Glow */}
      {activeCandle && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-mono transition-colors duration-150 border ${
            isStreaming && tickDirection === 'UP'
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
              : isStreaming && tickDirection === 'DOWN'
              ? 'bg-rose-950/30 border-rose-500/50 shadow-sm shadow-rose-500/10'
              : 'bg-slate-950/70 border-slate-800/80'
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-slate-400 flex items-center gap-1.5">
              {isStreaming && (
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      tickDirection === 'UP' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      tickDirection === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                </span>
              )}
              TIME: <strong className="text-slate-200">{activeCandle.timeStr}</strong>
            </span>
            <span>
              O: <strong className="text-slate-200">{formatPrice(activeCandle.open)}</strong>
            </span>
            <span>
              H: <strong className="text-emerald-400">{formatPrice(activeCandle.high)}</strong>
            </span>
            <span>
              L: <strong className="text-rose-400">{formatPrice(activeCandle.low)}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              C:{' '}
              <strong
                className={`transition-colors duration-100 text-sm font-black ${
                  activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPrice(activeCandle.close)}
              </strong>
              {isStreaming && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium flex items-center gap-1 border ${
                    tickDirection === 'UP'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  }`}
                  title="বাইবিট লাইভ মার্কেট ট্রেড ফ্লো (Last Executed Micro-Tick)"
                >
                  <span className="text-[8px] opacity-70">Tick:</span>
                  <strong>{tickDirection === 'UP' ? '▲ Buy' : '▼ Sell'}</strong>
                </span>
              )}
            </span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded ${
                activeCandle.close >= activeCandle.open
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {activeCandle.close >= activeCandle.open ? '+' : ''}
              {(((activeCandle.close - activeCandle.open) / activeCandle.open) * 100).toFixed(2)}%
            </span>
          </div>

          {/* Quick Signal & Last Real Trade Details */}
          <div className="flex items-center gap-2">
            {lastTrade && (
              <span className="text-[10px] font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>Bybit Vol:</span>
                <strong className={lastTrade.side === 'Buy' ? 'text-emerald-400' : 'text-rose-400'}>
                  {lastTrade.size}
                </strong>
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                emaSetup.direction === 'LONG'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : emaSetup.direction === 'SHORT'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {emaSetup.direction === 'LONG' ? '🟢 BUY / LONG' : emaSetup.direction === 'SHORT' ? '🔴 SELL / SHORT' : '🟡 WAIT / RANGE'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              R:R: <strong className="text-amber-400">{emaSetup.riskRewardRatio}</strong>
            </span>
          </div>
        </div>
      )}

      {/* SVG Candlestick Canvas Container */}
      <div className="relative w-full bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden shadow-inner p-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bullCandleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="bearCandleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="volumeBull" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="volumeBear" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          {/* Horizontal Price Grid Lines & Price Labels */}
          {gridPrices.map((price, idx) => {
            const y = priceToY(price);
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - paddingRight + 6}
                  y={y + 3.5}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ${price >= 100 ? price.toFixed(0) : price >= 1 ? price.toFixed(2) : price.toFixed(4)}
                </text>
              </g>
            );
          })}

          {/* Target Overlay Lines (Entry, TP 1, TP 2, TP 3, SL) */}
          {showTargets && emaSetup && (
            <g className="transition-opacity duration-300">
              {/* TP 3 Line (Cyan/Emerald) */}
              {emaSetup.tp3 > 0 && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={priceToY(emaSetup.tp3)}
                    x2={svgWidth - paddingRight}
                    y2={priceToY(emaSetup.tp3)}
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity={0.8}
                  />
                  <rect
                    x={svgWidth - paddingRight + 4}
                    y={priceToY(emaSetup.tp3) - 7}
                    width="66"
                    height="14"
                    fill="#065f46"
                    rx="3"
                  />
                  <text
                    x={svgWidth - paddingRight + 37}
                    y={priceToY(emaSetup.tp3) + 3}
                    fill="#34d399"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    TP3: ${emaSetup.tp3 >= 100 ? emaSetup.tp3.toFixed(0) : emaSetup.tp3.toFixed(2)}
                  </text>
                </g>
              )}

              {/* TP 2 Line */}
              {emaSetup.tp2 > 0 && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={priceToY(emaSetup.tp2)}
                    x2={svgWidth - paddingRight}
                    y2={priceToY(emaSetup.tp2)}
                    stroke="#10b981"
                    strokeWidth="1.4"
                    strokeDasharray="4 2"
                    opacity={0.9}
                  />
                  <rect
                    x={svgWidth - paddingRight + 4}
                    y={priceToY(emaSetup.tp2) - 7}
                    width="66"
                    height="14"
                    fill="#047857"
                    rx="3"
                  />
                  <text
                    x={svgWidth - paddingRight + 37}
                    y={priceToY(emaSetup.tp2) + 3}
                    fill="#6ee7b7"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    TP2: ${emaSetup.tp2 >= 100 ? emaSetup.tp2.toFixed(0) : emaSetup.tp2.toFixed(2)}
                  </text>
                </g>
              )}

              {/* TP 1 Line */}
              {emaSetup.tp1 > 0 && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={priceToY(emaSetup.tp1)}
                    x2={svgWidth - paddingRight}
                    y2={priceToY(emaSetup.tp1)}
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity={0.8}
                  />
                  <rect
                    x={svgWidth - paddingRight + 4}
                    y={priceToY(emaSetup.tp1) - 7}
                    width="66"
                    height="14"
                    fill="#065f46"
                    rx="3"
                  />
                  <text
                    x={svgWidth - paddingRight + 37}
                    y={priceToY(emaSetup.tp1) + 3}
                    fill="#a7f3d0"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    TP1: ${emaSetup.tp1 >= 100 ? emaSetup.tp1.toFixed(0) : emaSetup.tp1.toFixed(2)}
                  </text>
                </g>
              )}

              {/* Entry Price Line */}
              {emaSetup.entryPrice > 0 && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={priceToY(emaSetup.entryPrice)}
                    x2={svgWidth - paddingRight}
                    y2={priceToY(emaSetup.entryPrice)}
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={svgWidth - paddingRight + 4}
                    y={priceToY(emaSetup.entryPrice) - 7}
                    width="66"
                    height="14"
                    fill="#0369a1"
                    rx="3"
                  />
                  <text
                    x={svgWidth - paddingRight + 37}
                    y={priceToY(emaSetup.entryPrice) + 3}
                    fill="#e0f2fe"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ENTRY: ${emaSetup.entryPrice >= 100 ? emaSetup.entryPrice.toFixed(0) : emaSetup.entryPrice.toFixed(2)}
                  </text>
                </g>
              )}

              {/* Stop Loss Line (Rose/Red) */}
              {emaSetup.stopLoss > 0 && (
                <g>
                  <line
                    x1={paddingLeft}
                    y1={priceToY(emaSetup.stopLoss)}
                    x2={svgWidth - paddingRight}
                    y2={priceToY(emaSetup.stopLoss)}
                    stroke="#f43f5e"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <rect
                    x={svgWidth - paddingRight + 4}
                    y={priceToY(emaSetup.stopLoss) - 7}
                    width="66"
                    height="14"
                    fill="#be123c"
                    rx="3"
                  />
                  <text
                    x={svgWidth - paddingRight + 37}
                    y={priceToY(emaSetup.stopLoss) + 3}
                    fill="#ffe4e6"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    SL: ${emaSetup.stopLoss >= 100 ? emaSetup.stopLoss.toFixed(0) : emaSetup.stopLoss.toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Volume Separator Line */}
          {showVolume && (
            <line
              x1={paddingLeft}
              y1={svgHeight - volumeHeight - 20}
              x2={svgWidth - paddingRight}
              y2={svgHeight - volumeHeight - 20}
              stroke="#1e293b"
              strokeWidth="1"
            />
          )}

          {/* EMA 50 Polyline (Amber #f59e0b) */}
          {displayEMA50 && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={visibleKlines
                .map((_, idx) => {
                  const val = ema50Series[idx];
                  if (!val) return null;
                  const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
                  const cy = priceToY(val);
                  return `${cx},${cy}`;
                })
                .filter(Boolean)
                .join(' ')}
            />
          )}

          {/* EMA 100 Polyline (Cyan #06b6d4) */}
          {displayEMA100 && (
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={visibleKlines
                .map((_, idx) => {
                  const val = ema100Series[idx];
                  if (!val) return null;
                  const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
                  const cy = priceToY(val);
                  return `${cx},${cy}`;
                })
                .filter(Boolean)
                .join(' ')}
            />
          )}

          {/* EMA 200 Polyline (Purple #a855f7) */}
          {displayEMA200 && (
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={visibleKlines
                .map((_, idx) => {
                  const val = ema200Series[idx];
                  if (!val) return null;
                  const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
                  const cy = priceToY(val);
                  return `${cx},${cy}`;
                })
                .filter(Boolean)
                .join(' ')}
            />
          )}

          {/* Bollinger Bands (10, 2.0) Custom Strategy Polylines */}
          {displayBB && (
            <g>
              {/* Upper Band (Yellow #eab308) */}
              <polyline
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={visibleKlines
                  .map((_, idx) => {
                    const val = bbUpperSeries[idx];
                    if (!val) return null;
                    const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
                    const cy = priceToY(val);
                    return `${cx},${cy}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />

              {/* Middle Band (Pink/Magenta #ec4899) */}
              <polyline
                fill="none"
                stroke="#ec4899"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={visibleKlines
                  .map((_, idx) => {
                    const val = bbMiddleSeries[idx];
                    if (!val) return null;
                    const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
                    const cy = priceToY(val);
                    return `${cx},${cy}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />

              {/* Lower Band (Purple #a855f7) */}
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={visibleKlines
                  .map((_, idx) => {
                    const val = bbLowerSeries[idx];
                    if (!val) return null;
                    const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
                    const cy = priceToY(val);
                    return `${cx},${cy}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
              />
            </g>
          )}

          {/* Render Volume Bars */}
          {showVolume &&
            visibleKlines.map((k, idx) => {
              const isGreen = k.close >= k.open;
              const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
              const barY = volumeToY(k.volume);
              const barHeight = Math.max(2, svgHeight - 20 - barY);

              return (
                <rect
                  key={`vol-${k.timestamp}-${idx}`}
                  x={cx - candleWidth / 2}
                  y={barY}
                  width={candleWidth}
                  height={barHeight}
                  fill={isGreen ? 'url(#volumeBull)' : 'url(#volumeBear)'}
                  rx="1"
                />
              );
            })}

          {/* Render Japanese Candlesticks (Wicks & Bodies) */}
          {visibleKlines.map((k, idx) => {
            const isGreen = k.close >= k.open;
            const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;

            const highY = priceToY(k.high);
            const lowY = priceToY(k.low);
            const openY = priceToY(k.open);
            const closeY = priceToY(k.close);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2.5, Math.abs(closeY - openY));

            const isHovered = hoverIndex === idx;
            const isLiveCandle = idx === visibleKlines.length - 1;

            return (
              <g
                key={`candle-${k.timestamp}-${idx}`}
                className="transition-opacity duration-150"
                opacity={hoverIndex !== null && !isHovered ? 0.65 : 1}
              >
                {/* Live Active Candle Pulsing Aura */}
                {isLiveCandle && isStreaming && (
                  <g>
                    {/* Concentric Expanding Radar Ring 1 */}
                    <circle
                      cx={cx}
                      cy={closeY}
                      r="6"
                      fill={isGreen ? '#10b981' : '#f43f5e'}
                      opacity="0.3"
                    >
                      <animate attributeName="r" values="4;18;4" dur="1.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.05;0.5" dur="1.4s" repeatCount="indefinite" />
                    </circle>
                    {/* Concentric Expanding Radar Ring 2 */}
                    <circle
                      cx={cx}
                      cy={closeY}
                      r="12"
                      fill={isGreen ? '#34d399' : '#fb7185'}
                      opacity="0.2"
                    >
                      <animate attributeName="r" values="8;24;8" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.35;0.02;0.35" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )}

                {/* Candle Upper & Lower Wick Line */}
                <line
                  x1={cx}
                  y1={highY}
                  x2={cx}
                  y2={lowY}
                  stroke={isGreen ? '#10b981' : '#f43f5e'}
                  strokeWidth={isLiveCandle ? '1.8' : '1.3'}
                />

                {/* Candle Body Box */}
                <rect
                  x={cx - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isGreen ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)'}
                  stroke={isGreen ? '#059669' : '#e11d48'}
                  strokeWidth={isLiveCandle ? '1.2' : '0.8'}
                  rx="1"
                />

                {/* Active Live Candle Head Dot */}
                {isLiveCandle && (
                  <circle
                    cx={cx}
                    cy={closeY}
                    r="2.5"
                    fill="#ffffff"
                    stroke={isGreen ? '#10b981' : '#f43f5e'}
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}

          {/* Render Candlestick Pattern Overlay Markers */}
          {showPatterns &&
            detectedPatterns.map((pat) => {
              const cx = paddingLeft + pat.candleIndex * candleSpacing + candleSpacing / 2;
              const isBullish = pat.type === 'BULLISH';
              const isBearish = pat.type === 'BEARISH';
              const markerY = isBullish ? priceToY(visibleKlines[pat.candleIndex]?.low || minPrice) + 14 : priceToY(visibleKlines[pat.candleIndex]?.high || maxPrice) - 14;

              return (
                <g
                  key={pat.id}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedPattern(pat)}
                >
                  <circle
                    cx={cx}
                    cy={markerY}
                    r="8.5"
                    fill={isBullish ? '#059669' : isBearish ? '#e11d48' : '#d97706'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y={markerY + 3.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {isBullish ? '▲' : isBearish ? '▼' : '●'}
                  </text>
                </g>
              );
            })}

          {/* Render Bollinger Bands (10, 2.0) BUY / SELL Signal Labels */}
          {displayBB &&
            bbSignals.map((sig) => {
              const cx = paddingLeft + sig.index * candleSpacing + candleSpacing / 2;
              const isBuy = sig.type === 'BUY';
              const labelY = isBuy ? priceToY(sig.low) + 24 : priceToY(sig.high) - 24;

              return (
                <g key={`bb-sig-${sig.index}-${sig.type}`} className="cursor-pointer">
                  {/* Arrow stem/pointer */}
                  <polygon
                    points={
                      isBuy
                        ? `${cx},${labelY - 14} ${cx - 5},${labelY - 8} ${cx + 5},${labelY - 8}`
                        : `${cx},${labelY + 14} ${cx - 5},${labelY + 8} ${cx + 5},${labelY + 8}`
                    }
                    fill={isBuy ? '#10b981' : '#f43f5e'}
                  />
                  {/* Signal Badge Box */}
                  <rect
                    x={cx - 24}
                    y={isBuy ? labelY - 8 : labelY - 14}
                    width="48"
                    height="18"
                    rx="4"
                    fill={isBuy ? '#059669' : '#e11d48'}
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    className="shadow-lg"
                  />
                  <text
                    x={cx}
                    y={isBuy ? labelY + 4 : labelY - 2}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="900"
                    fontFamily="monospace"
                  >
                    {isBuy ? 'BUY' : 'SELL'}
                  </text>
                </g>
              );
            })}

          {/* Live Last Price Horizontal Animated Laser Line & Vibrating Price Tag */}
          {visibleKlines.length > 0 && (
            <g>
              {(() => {
                const lastCandle = visibleKlines[visibleKlines.length - 1];
                const lastY = priceToY(lastCandle.close);
                const isBull = lastCandle.close >= lastCandle.open;
                const isTickUp = tickDirection === 'UP';

                return (
                  <>
                    {/* Glowing Laser Scanline */}
                    <line
                      x1={paddingLeft}
                      y1={lastY}
                      x2={svgWidth - paddingRight}
                      y2={lastY}
                      stroke={isBull ? '#10b981' : '#f43f5e'}
                      strokeWidth={isStreaming ? '1.6' : '1.2'}
                      strokeDasharray="4 3"
                      className="transition-all duration-100"
                    >
                      {isStreaming && (
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0;28"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      )}
                    </line>

                    {/* Price Tag Badge with Live Ping Dot */}
                    <g className="transition-transform duration-100">
                      <rect
                        x={svgWidth - paddingRight + 4}
                        y={lastY - 10}
                        width="70"
                        height="20"
                        fill={isTickUp ? '#059669' : '#e11d48'}
                        rx="4"
                        className="transition-colors duration-150 shadow-md"
                      />
                      {/* Blinking Live Ping Dot on Badge */}
                      <circle
                        cx={svgWidth - paddingRight + 11}
                        cy={lastY}
                        r="2.5"
                        fill="#ffffff"
                      >
                        <animate
                          attributeName="opacity"
                          values="1;0.2;1"
                          dur="0.6s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <text
                        x={svgWidth - paddingRight + 43}
                        y={lastY + 3.5}
                        fill="#ffffff"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {formatPrice(lastCandle.close).replace('$', '')}
                      </text>
                    </g>
                  </>
                );
              })()}
            </g>
          )}

          {/* Hover Crosshair Vertical Line */}
          {hoverIndex !== null && (
            <line
              x1={paddingLeft + hoverIndex * candleSpacing + candleSpacing / 2}
              y1={paddingTop}
              x2={paddingLeft + hoverIndex * candleSpacing + candleSpacing / 2}
              y2={svgHeight - 20}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity={0.7}
            />
          )}

          {/* X Axis Time Labels */}
          {visibleKlines
            .filter((_, idx) => idx % Math.max(1, Math.floor(visibleKlines.length / 6)) === 0)
            .map((k) => {
              const idx = visibleKlines.indexOf(k);
              const cx = paddingLeft + idx * candleSpacing + candleSpacing / 2;
              return (
                <text
                  key={`time-${k.timestamp}`}
                  x={cx}
                  y={svgHeight - 4}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {k.timeStr}
                </text>
              );
            })}
        </svg>
      </div>

      {/* Actionable EMA 50 / 100 / 200 Trade Strategy & Target Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-emerald-500/30 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Compass className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>🎯 EMA 50 / 100 / 200 ট্রেডিং সিগন্যাল ও স্ট্র্যাটেজি প্ল্যান</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    emaSetup.direction === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : emaSetup.direction === 'SHORT'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {emaSetup.statusLabel}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400">
                {emaSetup.trendTitleBn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {emaSetup.tradingStyleLabelBn && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
                {emaSetup.tradingStyleLabelBn}
              </span>
            )}
            {emaSetup.estimatedDurationBn && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-sky-950/40 text-sky-400 border border-sky-500/40 shadow-sm shadow-sky-500/10 flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-400" />
                ⏱️ {emaSetup.estimatedDurationBn}
              </span>
            )}
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 border border-slate-800">
              কনফিডেন্স: {emaSetup.confidenceScore}%
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 border border-slate-800">
              R:R: {emaSetup.riskRewardRatio}
            </span>
          </div>
        </div>

        {/* 5-Box Action Matrix: Entry, TP 1, TP 2, TP 3, SL */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Entry Box */}
          <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-sky-400" />
              এন্ট্রি জোন (Entry)
            </span>
            <div className="text-sm font-black font-mono text-slate-100 mt-1">
              ${formatPrice(emaSetup.entryPrice).replace('$', '')}
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              ${formatPrice(emaSetup.entryRange.min).replace('$', '')} - ${formatPrice(emaSetup.entryRange.max).replace('$', '')}
            </span>
          </div>

          {/* TP 1 */}
          <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              TP 1 (প্রথম টার্গেট)
            </span>
            <div className="text-sm font-black font-mono text-emerald-300 mt-1">
              ${formatPrice(emaSetup.tp1).replace('$', '')}
            </div>
            <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">
              +{emaSetup.tp1GainPcnt}% (Book 33%)
            </span>
            {emaSetup.tp1DurationBn && (
              <span className="text-[8.5px] text-sky-300 font-mono flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
                {emaSetup.tp1DurationBn}
              </span>
            )}
          </div>

          {/* TP 2 */}
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-300" />
              TP 2 (সুইং টার্গেট)
            </span>
            <div className="text-sm font-black font-mono text-emerald-200 mt-1">
              ${formatPrice(emaSetup.tp2).replace('$', '')}
            </div>
            <span className="text-[9px] font-bold text-emerald-300 block mt-0.5">
              +{emaSetup.tp2GainPcnt}% (Book 33%)
            </span>
          </div>

          {/* TP 3 */}
          <div className="p-2.5 rounded-xl bg-teal-950/40 border border-teal-500/40">
            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 text-teal-300" />
              TP 3 (ম্যাক্স রানার)
            </span>
            <div className="text-sm font-black font-mono text-teal-200 mt-1">
              ${formatPrice(emaSetup.tp3).replace('$', '')}
            </div>
            <span className="text-[9px] font-bold text-teal-300 block mt-0.5">
              +{emaSetup.tp3GainPcnt}% (Trail 34%)
            </span>
          </div>

          {/* Stop Loss (SL) */}
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-rose-400" />
              স্টপ-লস (SL)
            </span>
            <div className="text-sm font-black font-mono text-rose-300 mt-1">
              ${formatPrice(emaSetup.stopLoss).replace('$', '')}
            </div>
            <span className="text-[9px] font-bold text-rose-400 block mt-0.5">
              -{emaSetup.stopLossPcnt}% (Capital Safety)
            </span>
          </div>
        </div>

        {/* Step-by-Step Bangla Trading Plan */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>ট্রেডিং প্ল্যান ও প্রফিট ম্যানেজমেন্ট গাইড:</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {emaSetup.summaryBn}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <div>
              EMA 50 সাপোর্ট: <strong className="text-amber-400">${formatPrice(emaSetup.ema50)}</strong> ({emaSetup.distanceToEma50Pcnt > 0 ? '+' : ''}{emaSetup.distanceToEma50Pcnt}%)
            </div>
            <div>
              EMA 100 মিড সাপোর্ট: <strong className="text-cyan-400">${formatPrice(emaSetup.ema100)}</strong>
            </div>
            <div>
              EMA 200 ট্রেন্ড বেস: <strong className="text-purple-400">${formatPrice(emaSetup.ema200)}</strong> ({emaSetup.distanceToEma200Pcnt > 0 ? '+' : ''}{emaSetup.distanceToEma200Pcnt}%)
            </div>
          </div>
        </div>
      </div>

      {/* Candlestick Patterns Discovery & Action Card */}
      {showPatterns && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-amber-500/30 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                  🕯️ রিয়েল-টাইম ক্যান্ডেলস্টিক প্যাটার্ন অ্যানালাইসিস (Pattern Scanner)
                </h4>
                <p className="text-[11px] text-slate-400">
                  জাপানিজ ক্যান্ডেলস্টিক থেকে শনাক্তকৃত মার্কেট ডিরেকশন ও রিভার্সাল সিগন্যাল
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setLearningPatternId(undefined);
                  setShowLearningModal(true);
                }}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md font-sans"
              >
                <span>📖 ক্যান্ডেলস্টিক শিখুন (Learn)</span>
              </button>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 border border-slate-800">
                প্যাটার্ন: {detectedPatterns.length}
              </span>
            </div>
          </div>

          {/* List of Detected Patterns or Empty State */}
          {detectedPatterns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {detectedPatterns.slice(-3).map((pat) => {
                const isBull = pat.type === 'BULLISH';
                const isBear = pat.type === 'BEARISH';
                return (
                  <div
                    key={pat.id}
                    onClick={() => setSelectedPattern(pat)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      isBull
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
                        : isBear
                        ? 'bg-rose-950/25 border-rose-500/40 text-rose-300'
                        : 'bg-amber-950/25 border-amber-500/40 text-amber-300'
                    }`}
                  >
                    <div>
                      {/* Header with Visual Diagram beside name */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Mini Graphical Candlestick Diagram */}
                          <div
                            className={`p-1 rounded-lg border shrink-0 ${
                              isBull
                                ? 'bg-emerald-950/50 border-emerald-500/40'
                                : isBear
                                ? 'bg-rose-950/50 border-rose-500/40'
                                : 'bg-slate-900 border-slate-700'
                            }`}
                          >
                            <CandlestickVisual
                              patternId={pat.id}
                              name={pat.name}
                              type={pat.type}
                              size="xs"
                            />
                          </div>

                          <div className="truncate">
                            <span className="font-black text-xs block text-slate-100 truncate">
                              {pat.nameBn}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block truncate">
                              {pat.name}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            isBull
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isBear
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {pat.type}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mb-2">
                        {pat.descriptionBn}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] flex items-center justify-between font-mono text-slate-400">
                      <span>সময়: {pat.timeStr}</span>
                      <span className="text-amber-300 font-bold">প্রাইজ: ${pat.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/70 text-center text-xs text-slate-400">
              বর্তমানে কোনো স্পেসিফিক হাই-ইমপ্যাক্ট রিভার্সাল প্যাটার্ন তৈরি হয়নি। মার্কেট স্ট্যান্ডার্ড ট্রেন্ড মোমেন্টামে চলমান।
            </div>
          )}

          {/* Actionable Strategy Box for Selected Pattern */}
          {(selectedPattern || latestPattern) && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                (selectedPattern || latestPattern)?.type === 'BULLISH'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : (selectedPattern || latestPattern)?.type === 'BEARISH'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                  : 'bg-amber-950/30 border-amber-500/50 text-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Visual Diagram for Selected Pattern */}
                  <div className="p-1.5 bg-slate-950/80 rounded-xl border border-slate-700/80 shrink-0">
                    <CandlestickVisual
                      patternId={(selectedPattern || latestPattern)?.id}
                      name={(selectedPattern || latestPattern)?.name}
                      type={(selectedPattern || latestPattern)?.type}
                      size="sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="font-black text-slate-100 flex flex-wrap items-center gap-2">
                      <span>
                        {(selectedPattern || latestPattern)?.nameBn} - ক্যান্ডেলস্টিক অ্যাকশন প্ল্যান:
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono">
                        নির্ভরযোগ্যতা: {(selectedPattern || latestPattern)?.reliability}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-200">
                      {(selectedPattern || latestPattern)?.actionBn}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLearningPatternId((selectedPattern || latestPattern)?.id);
                    setShowLearningModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow"
                >
                  <span>💡 এই ক্যান্ডেলটি শিখুন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bollinger Bands Custom Signal Strategy Live Panel */}
      {displayBB && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-fuchsia-950/20 to-slate-950 border border-fuchsia-500/30 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-400">
                <Target className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
                  🎯 Bollinger Bands Custom Signal Strategy (10, 2.0)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Green Hammer (Buy below Lower Band) & Red Inverted Hammer (Sell above Upper Band)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowPineScriptModal(true)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>TradingView Pine Script (v5) কোড দেখুন</span>
              </button>
            </div>
          </div>

          {/* Current Live Band Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-yellow-950/30 border border-yellow-500/40">
              <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                আপার ব্যান্ড (UP - Yellow)
              </div>
              <div className="text-sm font-black font-mono text-yellow-300 mt-1">
                ${latestBbUpper > 0 ? latestBbUpper.toFixed(latestBbUpper < 10 ? 4 : 2) : '---'}
              </div>
              <span className="text-[9px] text-yellow-500/90 block mt-0.5">
                রেড ইনভার্টেড হ্যামার এই লাইনের উপরে থাকলে SELL ট্রিগার
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-fuchsia-950/30 border border-fuchsia-500/40">
              <div className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 inline-block" />
                মিডল ব্যান্ড (MB - Magenta)
              </div>
              <div className="text-sm font-black font-mono text-fuchsia-300 mt-1">
                ${latestBbMiddle > 0 ? latestBbMiddle.toFixed(latestBbMiddle < 10 ? 4 : 2) : '---'}
              </div>
              <span className="text-[9px] text-fuchsia-400/90 block mt-0.5">
                SMA 10 বেসলাইন / মিডল টার্ম রিভার্সাল টার্গেট
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/40">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                লোয়ার ব্যান্ড (DN - Purple)
              </div>
              <div className="text-sm font-black font-mono text-purple-300 mt-1">
                ${latestBbLower > 0 ? latestBbLower.toFixed(latestBbLower < 10 ? 4 : 2) : '---'}
              </div>
              <span className="text-[9px] text-purple-400/90 block mt-0.5">
                গ্রীন হ্যামার এই লাইনের নিচে থাকলে BUY ট্রিগার
              </span>
            </div>
          </div>

          {/* Active BB Signals Banner */}
          {bbSignals.length > 0 ? (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>সাম্প্রতিক ক্যান্ডেলগুলোতে শনাক্তকৃত BB স্ট্র্যাটেজি সিগন্যাল ({bbSignals.length}টি):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {bbSignals.map((sig) => (
                  <div
                    key={`bb-sig-tag-${sig.index}`}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${
                      sig.type === 'BUY'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
                    }`}
                  >
                    <span>{sig.type === 'BUY' ? '🟢 BUY SIGNAL (Green Hammer)' : '🔴 SELL SIGNAL (Inverted Hammer)'}</span>
                    <span className="text-slate-400">@ ${sig.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/70 text-xs text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>বর্তমানে দৃশ্যমান ক্যান্ডেলগুলোতে কোনো BB ব্রেকআউট গ্রীন হ্যামার বা রেড ইনভার্টেড হ্যামার পাওয়া যায়নি।</span>
            </div>
          )}
        </div>
      )}

      {/* Pine Script (v5) Modal */}
      {showPineScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  <Code2 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    TradingView Pine Script (v5) Strategy Code
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bollinger Bands (10, 2.0) + Green Hammer Buy / Red Inverted Hammer Sell Strategy
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPineScriptModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Code View */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  TradingView এর Pine Editor এ পেস্ট করে চার্টে যোগ করুন:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(PINE_SCRIPT_V5_CODE);
                    setCopiedPineScript(true);
                    setTimeout(() => setCopiedPineScript(false), 2500);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    copiedPineScript
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                  }`}
                >
                  {copiedPineScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPineScript ? 'কপিকৃত (Copied!)' : 'কোড কপি করুন (Copy Code)'}</span>
                </button>
              </div>

              {/* Code display block */}
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed max-h-96">
                <pre>{PINE_SCRIPT_V5_CODE}</pre>
              </div>

              {/* Step-by-step TradingView setup guide */}
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-blue-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>TradingView-তে কীভাবে যুক্ত করবেন:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                  <li>TradingView চার্ট ওপেন করুন এবং নিচের <strong>Pine Editor</strong> ট্যাবে ক্লিক করুন।</li>
                  <li>পূর্বের সব টেক্সট মুছে উপরের সম্পূর্ণ স্ক্রিপ্টটি পেস্ট করুন।</li>
                  <li><strong>Save</strong> বাটনে ক্লিক করে নাম দিন &quot;Bollinger Bands Custom Signal Strategy&quot;।</li>
                  <li><strong>Add to Chart</strong> বাটনে ক্লিক করলেই চার্টে লাইভ সিগন্যাল ও কালার ব্যান্ড প্রদর্শিত হবে!</li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowPineScriptModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                বন্ধ করুন (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candlestick Educational Learning Masterclass Modal */}
      <CandlestickLearningModal
        isOpen={showLearningModal}
        onClose={() => setShowLearningModal(false)}
        initialPatternId={learningPatternId}
      />
    </div>
  );
};
