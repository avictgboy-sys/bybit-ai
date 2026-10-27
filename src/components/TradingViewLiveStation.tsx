import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Flame,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Sliders,
  Maximize2,
  ExternalLink,
  Coins,
  Globe,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ExnessSignal } from '../services/exnessSignalService';
import { LiveMarketTick } from '../services/exnessLivePriceFeed';
import { formatPrice } from '../utils/formatters';

interface TradingViewLiveStationProps {
  activeSymbol: string;
  onSelectSymbol?: (symbol: string) => void;
  signal?: ExnessSignal | null;
  liveTick?: LiveMarketTick;
  timeframe?: '5' | '15' | '60' | '240' | 'D';
  onSelectTimeframe?: (tf: '5' | '15' | '60' | '240' | 'D') => void;
  onOpenModal?: () => void;
  isModal?: boolean;
}

// Live Real-Time Micro Price Wave / Sparkline
const LivePriceSparkline: React.FC<{
  history: number[];
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  width?: number;
  height?: number;
}> = ({ history, direction, width = 130, height = 36 }) => {
  if (!history || history.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-[10px] text-slate-500 font-mono"
        style={{ width, height }}
      >
        <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
      </div>
    );
  }

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const paddingY = 4;

  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * (width - 12) + 6;
    const y = height - paddingY - ((val - min) / range) * (height - paddingY * 2);
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const lastPoint = points[points.length - 1];
  const isUp = direction === 'UP';
  const strokeColor = isUp ? '#34d399' : direction === 'DOWN' ? '#fb7185' : '#38bdf8';
  const fillGradientId = `grad_${direction}_${Math.floor(Math.random() * 1000)}`;

  const areaD = `${pathD} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="relative flex items-center shrink-0">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${fillGradientId})`} />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Animated glowing tip on current live price */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="4"
          fill={strokeColor}
          className="animate-ping opacity-75"
        />
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3"
          fill="#020617"
          stroke={strokeColor}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export const TradingViewLiveStation: React.FC<TradingViewLiveStationProps> = ({
  activeSymbol,
  onSelectSymbol,
  signal,
  liveTick,
  timeframe = '15',
  onSelectTimeframe,
  onOpenModal,
  isModal = false,
}) => {
  const [priceDirection, setPriceDirection] = useState<'UP' | 'DOWN' | 'NEUTRAL'>('NEUTRAL');
  const [lastDeltaVal, setLastDeltaVal] = useState<number>(0);
  const [flashTick, setFlashTick] = useState<boolean>(false);
  const [copiedLevel, setCopiedLevel] = useState<string | null>(null);

  // Fallback realistic baseline if neither liveTick nor signal provides price
  const getDefaultPrice = (sym: string): number => {
    if (sym.includes('XAU') || sym.includes('GOLD')) return 4471.50;
    if (sym.includes('EUR')) return 1.0845;
    if (sym.includes('GBP')) return 1.2945;
    if (sym.includes('JPY')) return 153.25;
    if (sym.includes('US30') || sym.includes('DOW')) return 43850.0;
    if (sym.includes('BTC')) return 78780.0;
    return 4471.50;
  };

  const currentPrice = liveTick?.price || signal?.currentPrice || getDefaultPrice(activeSymbol);

  const [localHistory, setLocalHistory] = useState<number[]>(() => [currentPrice]);
  const prevSymbolRef = useRef<string>(activeSymbol);
  const prevPriceRef = useRef<number>(currentPrice);

  // Reset direction whenever active symbol changes or price ticks
  useEffect(() => {
    // 1. Symbol changed: reset direction and establish baseline
    if (prevSymbolRef.current !== activeSymbol) {
      prevSymbolRef.current = activeSymbol;
      prevPriceRef.current = currentPrice;
      setPriceDirection('NEUTRAL');
      setLastDeltaVal(0);
      setFlashTick(false);
      setLocalHistory([currentPrice]);
      return;
    }

    // 2. Price moved: compute delta & update history wave
    const prev = prevPriceRef.current;
    if (prev !== currentPrice) {
      const diff = currentPrice - prev;
      prevPriceRef.current = currentPrice;
      setLastDeltaVal(diff);
      setPriceDirection(currentPrice > prev ? 'UP' : currentPrice < prev ? 'DOWN' : 'NEUTRAL');
      setFlashTick(true);
      setLocalHistory((h) => [...h, currentPrice].slice(-30));
      const timer = setTimeout(() => {
        setFlashTick(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [activeSymbol, currentPrice]);

  // Price history to render live wave
  const sparklineHistory = (liveTick?.history && liveTick.history.length > 2) ? liveTick.history : localHistory;

  // Map symbols to TradingView embed codes
  const getTradingViewSymbol = (sym: string): string => {
    const clean = sym.toUpperCase().replace('/', '').trim();
    if (clean.includes('XAU') || clean.includes('GOLD')) {
      return 'OANDA:XAUUSD';
    }
    if (clean.includes('EURUSD')) {
      return 'FX:EURUSD';
    }
    if (clean.includes('GBPUSD')) {
      return 'FX:GBPUSD';
    }
    if (clean.includes('USDJPY')) {
      return 'FX:USDJPY';
    }
    if (clean.includes('US30') || clean.includes('DOW')) {
      return 'TVC:DJI';
    }
    if (clean.includes('BTC')) {
      return 'BINANCE:BTCUSDT';
    }
    return `FX:${clean}`;
  };

  const isPipForex = activeSymbol.includes('EUR') || activeSymbol.includes('GBP');
  const isJpy = activeSymbol.includes('JPY');
  const isGold = activeSymbol.includes('XAU') || activeSymbol.includes('GOLD');

  const getPipDiff = (price1: number, price2: number): number => {
    const diff = Math.abs(price1 - price2);
    if (isPipForex) return Math.round(diff * 10000 * 10) / 10;
    if (isJpy) return Math.round(diff * 100 * 10) / 10;
    if (isGold) return Math.round(diff * 10 * 10) / 10;
    return Math.round(diff * 10) / 10;
  };

  // Derive target levels based on active signal or realistic price model
  const isBuy = signal ? signal.type.includes('BUY') : (liveTick?.change24h ?? 0) >= 0;
  
  // Check if provided signal targets are stale compared to current price
  const isSignalOutdated =
    signal && Math.abs((signal.entryZone[0] || 0) - currentPrice) > (isGold ? 200 : currentPrice * 0.15);

  // Safe target calculations
  let entryMin = !isSignalOutdated ? signal?.entryZone[0] : undefined;
  let entryMax = !isSignalOutdated ? signal?.entryZone[1] : undefined;
  let tp1 = !isSignalOutdated ? signal?.tp1 : undefined;
  let tp2 = !isSignalOutdated ? signal?.tp2 : undefined;
  let tp3 = !isSignalOutdated ? signal?.tp3 : undefined;
  let sl = !isSignalOutdated ? signal?.stopLoss : undefined;

  if (!entryMin || !entryMax || !tp1 || !tp2 || !tp3 || !sl) {
    if (isGold) {
      entryMin = isBuy ? Number((currentPrice - 8.0).toFixed(2)) : Number((currentPrice + 8.0).toFixed(2));
      entryMax = isBuy ? Number((currentPrice + 3.0).toFixed(2)) : Number((currentPrice - 3.0).toFixed(2));
      tp1 = isBuy ? Number((currentPrice + 20.0).toFixed(2)) : Number((currentPrice - 20.0).toFixed(2));
      tp2 = isBuy ? Number((currentPrice + 48.0).toFixed(2)) : Number((currentPrice - 48.0).toFixed(2));
      tp3 = isBuy ? Number((currentPrice + 88.0).toFixed(2)) : Number((currentPrice - 88.0).toFixed(2));
      sl = isBuy ? Number((currentPrice - 28.0).toFixed(2)) : Number((currentPrice + 28.0).toFixed(2));
    } else if (isPipForex) {
      entryMin = isBuy ? currentPrice - 0.0010 : currentPrice + 0.0010;
      entryMax = isBuy ? currentPrice + 0.0005 : currentPrice - 0.0005;
      tp1 = isBuy ? currentPrice + 0.0040 : currentPrice - 0.0040;
      tp2 = isBuy ? currentPrice + 0.0080 : currentPrice - 0.0080;
      tp3 = isBuy ? currentPrice + 0.0130 : currentPrice - 0.0130;
      sl = isBuy ? currentPrice - 0.0040 : currentPrice + 0.0040;
    } else if (isJpy) {
      entryMin = isBuy ? currentPrice - 0.15 : currentPrice + 0.15;
      entryMax = isBuy ? currentPrice + 0.10 : currentPrice - 0.10;
      tp1 = isBuy ? currentPrice + 0.80 : currentPrice - 0.80;
      tp2 = isBuy ? currentPrice + 1.70 : currentPrice - 1.70;
      tp3 = isBuy ? currentPrice + 3.00 : currentPrice - 3.00;
      sl = isBuy ? currentPrice - 0.95 : currentPrice + 0.95;
    } else {
      // US30 & BTC
      entryMin = isBuy ? currentPrice * 0.998 : currentPrice * 1.002;
      entryMax = isBuy ? currentPrice * 1.001 : currentPrice * 0.999;
      tp1 = isBuy ? currentPrice * 1.006 : currentPrice * 0.994;
      tp2 = isBuy ? currentPrice * 1.012 : currentPrice * 0.988;
      tp3 = isBuy ? currentPrice * 1.020 : currentPrice * 0.980;
      sl = isBuy ? currentPrice * 0.994 : currentPrice * 1.006;
    }
  }

  const entryMid = (entryMin + entryMax) / 2;

  // Live PnL calculation
  const pipDistanceEntry = getPipDiff(currentPrice, entryMid);
  const isProfit = isBuy ? currentPrice >= entryMid : currentPrice <= entryMid;
  const livePnlPips = isProfit ? pipDistanceEntry : -pipDistanceEntry;

  // Status checks for targets
  const isTp1Hit = isBuy ? currentPrice >= tp1 : currentPrice <= tp1;
  const isTp2Hit = isBuy ? currentPrice >= tp2 : currentPrice <= tp2;
  const isTp3Hit = isBuy ? currentPrice >= tp3 : currentPrice <= tp3;
  const isSlHit = isBuy ? currentPrice <= sl : currentPrice >= sl;

  // Percentage progress across full trade spectrum (from SL to TP3)
  const totalRange = Math.abs(tp3 - sl) || 1;
  const currentProgressPct = Math.max(
    2,
    Math.min(98, Math.round((isBuy ? (currentPrice - sl) / totalRange : (sl - currentPrice) / totalRange) * 100))
  );

  const entryProgressPct = Math.max(
    0,
    Math.min(100, Math.round((isBuy ? (entryMid - sl) / totalRange : (sl - entryMid) / totalRange) * 100))
  );

  const tp1ProgressPct = Math.max(
    0,
    Math.min(100, Math.round((isBuy ? (tp1 - sl) / totalRange : (sl - tp1) / totalRange) * 100))
  );

  const tp2ProgressPct = Math.max(
    0,
    Math.min(100, Math.round((isBuy ? (tp2 - sl) / totalRange : (sl - tp2) / totalRange) * 100))
  );

  const tvSymbol = getTradingViewSymbol(activeSymbol);
  const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_station_${activeSymbol.replace(/[^a-zA-Z0-9]/g, '')}&symbol=${encodeURIComponent(
    tvSymbol
  )}&interval=${timeframe}&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=0f172a&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MASimple%40tv-basicstudies%22%5D&theme=dark&style=1&timezone=Asia%2FDhaka&studies_overrides=%7B%7D&overrides=%7B%22mainSeriesProperties.candleStyle.upColor%22%3A%22%2310b981%22%2C%22mainSeriesProperties.candleStyle.downColor%22%3A%22%23f43f5e%22%7D&locale=en`;

  const availableSymbols = [
    { symbol: 'XAU/USD', name: 'Gold Spot', icon: Coins, color: 'text-amber-400' },
    { symbol: 'EUR/USD', name: 'Euro / USD', icon: Globe, color: 'text-cyan-400' },
    { symbol: 'GBP/USD', name: 'Pound / USD', icon: Globe, color: 'text-indigo-400' },
    { symbol: 'USD/JPY', name: 'USD / Yen', icon: Globe, color: 'text-purple-400' },
    { symbol: 'US30', name: 'Dow Jones', icon: Activity, color: 'text-emerald-400' },
    { symbol: 'BTC/USD', name: 'Bitcoin', icon: Zap, color: 'text-yellow-400' },
  ];

  const handleCopyValue = (label: string, value: string | number) => {
    navigator.clipboard.writeText(String(value));
    setCopiedLevel(label);
    setTimeout(() => {
      setCopiedLevel(null);
    }, 2000);
  };

  const bidPrice = liveTick?.bid || Math.round((currentPrice - (isGold ? 0.15 : isPipForex ? 0.00005 : 0.01)) * 100000) / 100000;
  const askPrice = liveTick?.ask || Math.round((currentPrice + (isGold ? 0.15 : isPipForex ? 0.00005 : 0.01)) * 100000) / 100000;
  const spreadPips = liveTick?.spreadPips ?? (isGold ? 0.3 : isPipForex ? 0.1 : 0.2);

  return (
    <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col space-y-4">
      {/* Top Header & Symbol Navigation */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Live Price Ticker */}
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <BarChart2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-slate-100 font-mono tracking-tight">
                TradingView লাইভ মার্কেট চার্ট স্টেশন ({activeSymbol})
              </h3>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE TICK PULSE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              অবিরাম লাইভ প্রাইস মুভমেন্ট এবং ক্যান্ডেলস্টিক চার্টের সাথে সরাসরি এন্ট্রি, TP 1, TP 2, TP 3 ও SL ট্র্যাকার
            </p>
          </div>
        </div>

        {/* Live Flashing Price Card & Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Price Badge with Flashing Animation & Real-time Sparkline */}
          <div
            className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border transition-all duration-200 flex items-center gap-3 shadow-lg ${
              flashTick
                ? priceDirection === 'UP'
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-emerald-500/30 scale-[1.02] ring-2 ring-emerald-400/40'
                  : 'bg-rose-500/25 border-rose-400 text-rose-300 shadow-rose-500/30 scale-[1.02] ring-2 ring-rose-400/40'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-100'
            }`}
          >
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      priceDirection === 'UP'
                        ? 'bg-emerald-400 animate-ping'
                        : priceDirection === 'DOWN'
                        ? 'bg-rose-400 animate-ping'
                        : 'bg-cyan-400'
                    }`}
                  />
                  লাইভ রেট
                </span>
                {priceDirection === 'UP' && (
                  <span className="text-emerald-400 font-bold flex items-center text-[10px] animate-bounce">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> ▲ UP ({lastDeltaVal > 0 ? `+${lastDeltaVal.toFixed(isPipForex ? 5 : 2)}` : ''})
                  </span>
                )}
                {priceDirection === 'DOWN' && (
                  <span className="text-rose-400 font-bold flex items-center text-[10px] animate-bounce">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" /> ▼ DOWN ({lastDeltaVal < 0 ? `${lastDeltaVal.toFixed(isPipForex ? 5 : 2)}` : ''})
                  </span>
                )}
                {priceDirection === 'NEUTRAL' && (
                  <span className="text-cyan-400 font-bold flex items-center text-[10px]">
                    <Activity className="w-3 h-3 mr-0.5 inline animate-pulse" /> LIVE TICK
                  </span>
                )}
              </div>

              <div className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-1.5">
                <span
                  className={`transition-colors duration-150 ${
                    priceDirection === 'UP'
                      ? 'text-emerald-400'
                      : priceDirection === 'DOWN'
                      ? 'text-rose-400'
                      : 'text-slate-100'
                  }`}
                >
                  {currentPrice.toLocaleString(undefined, {
                    minimumFractionDigits: isPipForex ? 4 : 2,
                    maximumFractionDigits: isPipForex ? 5 : 2,
                  })}
                </span>
                <span className="text-xs text-slate-400 font-normal">USD</span>
              </div>
            </div>

            {/* Embedded Live Price Wave Sparkline */}
            <div className="hidden sm:block border-l border-slate-800/80 pl-2.5">
              <span className="text-[9px] uppercase font-mono text-slate-500 block mb-0.5">
                লাইভ মোমেন্টাম ওয়েভ
              </span>
              <LivePriceSparkline
                history={sparklineHistory}
                direction={priceDirection}
                width={100}
                height={30}
              />
            </div>

            {/* Live Floating Pip PnL */}
            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-slate-400 uppercase block font-mono">লাইভ PnL</span>
              <span
                className={`text-sm font-black font-mono flex items-center gap-0.5 ${
                  livePnlPips >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {livePnlPips >= 0 ? `+${livePnlPips}` : livePnlPips} Pips
              </span>
            </div>
          </div>

          {/* Timeframe Controls */}
          {onSelectTimeframe && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              {[
                { label: '5m', val: '5' as const },
                { label: '15m', val: '15' as const },
                { label: '1h', val: '60' as const },
                { label: '4h', val: '240' as const },
                { label: '1D', val: 'D' as const },
              ].map((tf) => (
                <button
                  key={tf.val}
                  type="button"
                  onClick={() => onSelectTimeframe(tf.val)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition ${
                    timeframe === tf.val
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          )}

          {onOpenModal && !isModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition"
              title="ফুল-স্ক্রিন চার্ট ওপেন করুন"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <a
            href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(tvSymbol)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition"
            title="TradingView ওয়েবসাইটে দেখুন"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Live Spread & Market Tape Bar */}
      <div className="px-4 sm:px-5 flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
            Exness Raw Spread:
            <strong className="text-emerald-300 font-black">{spreadPips} Pips</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Bid: <strong className="text-slate-200">{bidPrice}</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Ask: <strong className="text-amber-300">{askPrice}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span>
            24h H: <strong className="text-emerald-400">{liveTick?.high24h || (currentPrice * 1.01).toFixed(2)}</strong>
          </span>
          <span>
            24h L: <strong className="text-rose-400">{liveTick?.low24h || (currentPrice * 0.99).toFixed(2)}</strong>
          </span>
          <span className="hidden md:inline text-cyan-400 font-sans">
            (অটো লাইভ আপডেট সক্রিয়)
          </span>
        </div>
      </div>

      {/* Symbol Switcher Pills */}
      {onSelectSymbol && (
        <div className="px-4 sm:px-5 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {availableSymbols.map((item) => {
            const isSelected = activeSymbol === item.symbol;
            const IconComp = item.icon;
            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => onSelectSymbol(item.symbol)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : item.color}`} />
                <span>{item.symbol}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Live Target Dashboard (Entry, TP 1, TP 2, TP 3, SL) */}
      <div className="px-4 sm:px-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* 1. Entry Price / Zone */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between space-y-1.5 shadow-sm group hover:border-cyan-400 transition">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-cyan-400 font-mono flex items-center gap-1">
                <Target className="w-3 h-3" /> এন্ট্রি জোন (ENTRY)
              </span>
              <button
                type="button"
                onClick={() => handleCopyValue('ENTRY', `${entryMin} - ${entryMax}`)}
                className="text-slate-500 hover:text-cyan-300 p-0.5 rounded transition"
                title="এন্ট্রি জোন কপি করুন"
              >
                {copiedLevel === 'ENTRY' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-cyan-200">
              {entryMin.toLocaleString(undefined, { minimumFractionDigits: isPipForex ? 4 : 2, maximumFractionDigits: isPipForex ? 5 : 2 })} -{' '}
              {entryMax.toLocaleString(undefined, { minimumFractionDigits: isPipForex ? 4 : 2, maximumFractionDigits: isPipForex ? 5 : 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between pt-1 border-t border-slate-800">
              <span>অবস্থা:</span>
              <span className="font-mono font-bold text-cyan-300">
                {currentPrice >= entryMin && currentPrice <= entryMax
                  ? '🎯 ইন-জোন (Ready)'
                  : `${getPipDiff(currentPrice, entryMid)} Pips দূরে`}
              </span>
            </div>
          </div>

          {/* 2. Take Profit 1 (TP 1) */}
          <div
            className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1.5 shadow-sm transition group ${
              isTp1Hit
                ? 'bg-emerald-950/40 border-emerald-400/80 shadow-emerald-500/20 ring-1 ring-emerald-400/50'
                : 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> টার্গেট ১ (TP 1)
              </span>
              <div className="flex items-center gap-1">
                {isTp1Hit && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-mono animate-pulse">
                    ✅ HIT
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyValue('TP1', tp1)}
                  className="text-slate-500 hover:text-emerald-300 p-0.5 rounded transition"
                  title="TP1 কপি করুন"
                >
                  {copiedLevel === 'TP1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-emerald-300">
              {tp1.toLocaleString(undefined, { minimumFractionDigits: isPipForex ? 4 : 2, maximumFractionDigits: isPipForex ? 5 : 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between pt-1 border-t border-slate-800">
              <span>বাকি:</span>
              <span className="font-mono font-bold text-emerald-400">
                {isTp1Hit ? '🎉 লক্ষ্য অর্জিত' : `${getPipDiff(currentPrice, tp1)} Pips`}
              </span>
            </div>
          </div>

          {/* 3. Take Profit 2 (TP 2) */}
          <div
            className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1.5 shadow-sm transition group ${
              isTp2Hit
                ? 'bg-emerald-950/40 border-emerald-400/80 shadow-emerald-500/20 ring-1 ring-emerald-400/50'
                : 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> টার্গেট ২ (TP 2)
              </span>
              <div className="flex items-center gap-1">
                {isTp2Hit && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-mono animate-pulse">
                    ✅ HIT
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyValue('TP2', tp2)}
                  className="text-slate-500 hover:text-emerald-300 p-0.5 rounded transition"
                  title="TP2 কপি করুন"
                >
                  {copiedLevel === 'TP2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-emerald-300">
              {tp2.toLocaleString(undefined, { minimumFractionDigits: isPipForex ? 4 : 2, maximumFractionDigits: isPipForex ? 5 : 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between pt-1 border-t border-slate-800">
              <span>বাকি:</span>
              <span className="font-mono font-bold text-emerald-400">
                {isTp2Hit ? '🎉 লক্ষ্য অর্জিত' : `${getPipDiff(currentPrice, tp2)} Pips`}
              </span>
            </div>
          </div>

          {/* 4. Take Profit 3 (TP 3 Runner) */}
          <div
            className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1.5 shadow-sm transition group ${
              isTp3Hit
                ? 'bg-amber-950/40 border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/50'
                : 'bg-slate-900/90 border-amber-500/30 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mono flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> রানার (TP 3)
              </span>
              <div className="flex items-center gap-1">
                {isTp3Hit && (
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-mono animate-pulse">
                    🎯 MAX WIN
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyValue('TP3', tp3)}
                  className="text-slate-500 hover:text-amber-300 p-0.5 rounded transition"
                  title="TP3 কপি করুন"
                >
                  {copiedLevel === 'TP3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-amber-300">
              {tp3.toLocaleString(undefined, { minimumFractionDigits: isPipForex ? 4 : 2, maximumFractionDigits: isPipForex ? 5 : 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between pt-1 border-t border-slate-800">
              <span>বাকি:</span>
              <span className="font-mono font-bold text-amber-300">
                {isTp3Hit ? '🏆 সর্বোচ্চ প্রফিট' : `${getPipDiff(currentPrice, tp3)} Pips`}
              </span>
            </div>
          </div>

          {/* 5. Stop Loss (SL) */}
          <div
            className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1.5 shadow-sm transition col-span-2 sm:col-span-1 group ${
              isSlHit
                ? 'bg-rose-950/50 border-rose-500 shadow-rose-500/30'
                : 'bg-slate-900/90 border-rose-500/30 hover:border-rose-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-rose-400 font-mono flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-rose-400" /> স্টপ লস (SL)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCopyValue('SL', sl)}
                  className="text-slate-500 hover:text-rose-300 p-0.5 rounded transition"
                  title="Stop Loss কপি করুন"
                >
                  {copiedLevel === 'SL' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div className="text-sm sm:text-base font-black font-mono text-rose-400">
              {sl.toLocaleString(undefined, { minimumFractionDigits: isPipForex ? 4 : 2, maximumFractionDigits: isPipForex ? 5 : 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans flex items-center justify-between pt-1 border-t border-slate-800">
              <span>সেফ কুশন:</span>
              <span className="font-mono font-bold text-rose-300">
                {isSlHit ? '⚠️ SL TRIGGERED' : `${getPipDiff(currentPrice, sl)} Pips`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Live Target Range Bar (SL ─── Entry ─── TP1 ─── TP2 ─── TP3) */}
      <div className="px-4 sm:px-5">
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono flex-wrap gap-1">
            <span className="text-rose-400 flex items-center gap-1">
              🔴 SL: {sl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className="text-cyan-300 flex items-center gap-1">
              🔵 Entry: {entryMid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              🟢 TP1: {tp1.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className="text-emerald-300 hidden sm:inline flex items-center gap-1">
              🟢 TP2: {tp2.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
            <span className="text-amber-400 flex items-center gap-1">
              🟡 TP3: {tp3.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>

          {/* Interactive Multi-segment Progress Track with Moving Live Pin */}
          <div className="relative w-full h-3.5 bg-slate-950 rounded-full border border-slate-700/80 overflow-visible">
            {/* Range markers */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-sm z-10"
              style={{ left: `${entryProgressPct}%` }}
              title="Entry Level"
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-sm z-10"
              style={{ left: `${tp1ProgressPct}%` }}
              title="TP 1 Level"
            />
            <div
              className="absolute top-0 bottom-0 w-1 bg-emerald-300 shadow-sm z-10"
              style={{ left: `${tp2ProgressPct}%` }}
              title="TP 2 Level"
            />

            {/* Filled Progress Bar to Current Price */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isProfit
                  ? 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-400 shadow-md shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600'
              }`}
              style={{ width: `${currentProgressPct}%` }}
            />

            {/* Dynamic Moving Current Price Pin Pointer */}
            <div
              className="absolute -top-1.5 -bottom-1.5 w-4 h-6.5 -ml-2 bg-yellow-300 border-2 border-slate-950 rounded-full shadow-lg z-20 transition-all duration-200 flex items-center justify-center animate-bounce cursor-pointer"
              style={{ left: `${currentProgressPct}%` }}
              title={`লাইভ মার্কেট প্রাইস: ${currentPrice}`}
            >
              <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>স্টপ লস সাইড</span>
            <span className="font-mono font-bold text-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
              লাইভ প্রাইস ট্র্যাক পজিশন: {currentProgressPct}% ({currentPrice} USD)
            </span>
            <span>সর্বোচ্চ প্রফিট সাইড</span>
          </div>
        </div>
      </div>

      {/* Embedded TradingView Live IFrame with Real-Time Live Price Pulse Ribbon */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
        {/* Live Chart Header Bar with Real-Time Dynamic Price Up/Down Ticker */}
        <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs font-mono">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
              {activeSymbol}
            </span>

            {/* Live oscillating price with flash badge */}
            <div
              className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 transition-all duration-200 ${
                flashTick
                  ? priceDirection === 'UP'
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400'
                    : 'bg-rose-500/30 text-rose-300 border border-rose-400'
                  : 'bg-slate-950 text-slate-200 border border-slate-800'
              }`}
            >
              <span>লাইভ প্রাইস:</span>
              <span
                className={`font-black ${
                  priceDirection === 'UP'
                    ? 'text-emerald-400'
                    : priceDirection === 'DOWN'
                    ? 'text-rose-400'
                    : 'text-slate-100'
                }`}
              >
                ${currentPrice.toLocaleString(undefined, {
                  minimumFractionDigits: isPipForex ? 4 : 2,
                  maximumFractionDigits: isPipForex ? 5 : 2,
                })}
              </span>
              {priceDirection === 'UP' && <span className="text-emerald-400 animate-bounce">▲</span>}
              {priceDirection === 'DOWN' && <span className="text-rose-400 animate-bounce">▼</span>}
            </div>

            {/* Bid / Ask */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
              <span>Bid: <strong className="text-slate-300 font-mono">{(liveTick?.bid || currentPrice - 0.15).toFixed(isPipForex ? 4 : 2)}</strong></span>
              <span>Ask: <strong className="text-slate-300 font-mono">{(liveTick?.ask || currentPrice + 0.15).toFixed(isPipForex ? 4 : 2)}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time wave sparkline */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-0.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500">লাইভ ওয়েভ:</span>
              <LivePriceSparkline
                history={sparklineHistory}
                direction={priceDirection}
                width={85}
                height={22}
              />
            </div>

            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              REAL-TIME TICKS ACTIVE
            </span>
          </div>
        </div>

        <div
          className={`w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner relative ${
            isModal ? 'h-[56vh]' : 'h-[440px] sm:h-[480px]'
          }`}
        >
          <iframe
            title={`TradingView Live ${activeSymbol}`}
            src={widgetUrl}
            className="w-full h-full border-0"
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
};

