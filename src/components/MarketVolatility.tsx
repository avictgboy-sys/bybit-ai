import React, { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';
import { TickerData } from '../types';
import { getTranslation } from '../lib/translations';
import { formatPrice } from '../utils/formatters';

interface MarketVolatilityProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
  language?: string;
}

type FilterMode = 'VOLATILITY' | 'GAINERS' | 'LOSERS' | 'VOLUME';

export const MarketVolatility: React.FC<MarketVolatilityProps> = ({
  tickers,
  onSelectCoin,
  language = 'en',
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('VOLATILITY');
  const [displayCount, setDisplayCount] = useState<number>(12);

  if (!tickers || tickers.length === 0) return null;

  // Calculate Market Volatility Score (average absolute 24h % change)
  const totalAbsPcnt = tickers.reduce((acc, t) => acc + Math.abs(t.price24hPcnt), 0);
  const avgAbsPcnt = (totalAbsPcnt / tickers.length) * 100;

  // Extremely volatile coins (> 5% change)
  const highVolCount = tickers.filter((t) => Math.abs(t.price24hPcnt) >= 0.05).length;
  const gainersCount = tickers.filter((t) => t.price24hPcnt > 0).length;
  const losersCount = tickers.filter((t) => t.price24hPcnt < 0).length;

  // Sort tickers based on active filter
  const sortedTickers = [...tickers].sort((a, b) => {
    if (filterMode === 'VOLATILITY') {
      return Math.abs(b.price24hPcnt) - Math.abs(a.price24hPcnt);
    }
    if (filterMode === 'GAINERS') {
      return b.price24hPcnt - a.price24hPcnt;
    }
    if (filterMode === 'LOSERS') {
      return a.price24hPcnt - b.price24hPcnt;
    }
    if (filterMode === 'VOLUME') {
      return b.turnover24h - a.turnover24h;
    }
    return 0;
  });

  const displayedTickers = sortedTickers.slice(0, displayCount);

  // Helper function to get color coding & tags for a ticker
  const getVolatilityMetadata = (pcnt: number) => {
    const pcnt100 = pcnt * 100;
    if (pcnt100 >= 8) {
      return {
        badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        cardBorder: 'border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/20',
        label: '🚀 Massive Surge',
        type: 'SUPER_GAINER',
        barFill: 'bg-emerald-400',
      };
    }
    if (pcnt100 >= 2) {
      return {
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        cardBorder: 'border-slate-800 hover:border-emerald-500/40',
        label: '📈 Bullish Rally',
        type: 'GAINER',
        barFill: 'bg-emerald-500',
      };
    }
    if (pcnt100 <= -8) {
      return {
        badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
        cardBorder: 'border-red-500/40 hover:border-red-400 shadow-red-950/20',
        label: '📉 Severe Dump',
        type: 'SUPER_LOSER',
        barFill: 'bg-red-500',
      };
    }
    if (pcnt100 <= -2) {
      return {
        badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
        cardBorder: 'border-slate-800 hover:border-red-500/40',
        label: '🔻 Pullback',
        type: 'LOSER',
        barFill: 'bg-rose-500',
      };
    }
    return {
      badgeBg: 'bg-slate-800/80 text-slate-300 border-slate-700/50',
      cardBorder: 'border-slate-800 hover:border-slate-700',
      label: '⚡ Consolidation',
      type: 'NEUTRAL',
      barFill: 'bg-amber-400',
    };
  };

  return (
    <section className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header & Volatility Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                {getTranslation(language, 'marketVolatilityTitle')}
                <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                  {tickers.length} {getTranslation(language, 'assetsTracked')}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {getTranslation(language, 'volatilityDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Volatility Index Gauge */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
              {getTranslation(language, 'avgMarketSwing')}
            </span>
            <div className="text-sm font-black font-mono text-amber-400">
              ±{avgAbsPcnt.toFixed(2)}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
              {getTranslation(language, 'highSwingTokens')}
            </span>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{highVolCount} Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls & Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('VOLATILITY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'VOLATILITY'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {getTranslation(language, 'topSwingers')}
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('GAINERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'GAINERS'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {getTranslation(language, 'topGainers')} ({gainersCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('LOSERS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'LOSERS'
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            {getTranslation(language, 'topLosers')} ({losersCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('VOLUME')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterMode === 'VOLUME'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {getTranslation(language, 'volumeLeaders')}
          </button>
        </div>

        {/* Display Limit Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400 font-mono">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span>{getTranslation(language, 'show')}</span>
          {[6, 12, 24].map((cnt) => (
            <button
              key={cnt}
              type="button"
              onClick={() => setDisplayCount(cnt)}
              className={`px-2 py-0.5 rounded border transition-colors ${
                displayCount === cnt
                  ? 'bg-slate-800 text-amber-400 font-bold border-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-300'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Color-Coded Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {displayedTickers.map((coin) => {
          const meta = getVolatilityMetadata(coin.price24hPcnt);
          const isPositive = coin.price24hPcnt >= 0;
          const pcntText = `${isPositive ? '+' : ''}${(coin.price24hPcnt * 100).toFixed(2)}%`;

          // Calculate price position relative to 24h range (0 to 100%)
          const low = coin.lowPrice24h || coin.lastPrice * 0.95;
          const high = coin.highPrice24h || coin.lastPrice * 1.05;
          const range = high - low;
          const positionPercent = range > 0 ? Math.min(100, Math.max(0, ((coin.lastPrice - low) / range) * 100)) : 50;

          return (
            <div
              key={coin.symbol}
              onClick={() => onSelectCoin(coin)}
              className={`bg-slate-950/70 rounded-2xl border p-3.5 hover:scale-[1.02] cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg relative overflow-hidden ${meta.cardBorder}`}
            >
              {/* Card Top: Coin Symbol & Volatility Badge */}
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold font-mono text-slate-200 group-hover:text-amber-400 transition-colors">
                      {coin.baseCoin.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-xs sm:text-sm group-hover:text-amber-400 transition-colors flex items-center gap-1">
                        {coin.baseCoin}
                        <span className="text-[10px] font-mono text-slate-500 font-normal">/USDT</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 font-mono ${meta.badgeBg}`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {pcntText}
                  </span>
                </div>

                {/* Price Display */}
                <div className="my-2.5 flex items-baseline justify-between">
                  <div className="text-lg font-black font-mono text-slate-100 group-hover:text-slate-50 transition-colors">
                    {formatPrice(coin.lastPrice)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                    {meta.label}
                  </span>
                </div>
              </div>

              {/* 24h High/Low Slider Range Bar */}
              <div className="mt-2 pt-2 border-t border-slate-900/90 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>L: {formatPrice(low)}</span>
                  <span>H: {formatPrice(high)}</span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden relative border border-slate-800/50">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${meta.barFill}`}
                    style={{ width: `${positionPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span className="text-slate-500 flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-slate-500" />
                    24h Vol:
                  </span>
                  <span className="font-semibold text-slate-300">
                    ${(coin.turnover24h / 1e6).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Control if count is limited */}
      {sortedTickers.length > displayCount && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 12)}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-xs font-bold text-amber-400 rounded-xl border border-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            Show More Volatile Coins ({sortedTickers.length - displayCount} remaining)
          </button>
        </div>
      )}
    </section>
  );
};
