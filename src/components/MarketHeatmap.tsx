import React, { useState } from 'react';
import { TickerData } from '../types';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  BarChart2,
  Zap,
  Info,
  ArrowUpDown,
} from 'lucide-react';

interface MarketHeatmapProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

type SizeMode = 'WEIGHTED' | 'GRID';
type FilterCategory = 'ALL' | 'MAJORS' | 'TOP_20' | 'GAINERS' | 'LOSERS';
type SortOption = 'VOLUME_DESC' | 'GAINERS_FIRST' | 'LOSERS_FIRST' | 'NAME_ASC';

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [sizeMode, setSizeMode] = useState<SizeMode>('WEIGHTED');
  const [category, setCategory] = useState<FilterCategory>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('VOLUME_DESC');
  const [hoveredCoin, setHoveredCoin] = useState<TickerData | null>(null);

  if (!tickers || tickers.length === 0) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
        No ticker data available for heatmap visualization.
      </div>
    );
  }

  // Filter tickers
  const majorsList = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'AVAXUSDT', 'SUIUSDT', 'XRPUSDT'];
  let filteredTickers = [...tickers];

  if (category === 'MAJORS') {
    filteredTickers = filteredTickers.filter(
      (t) => majorsList.includes(t.symbol) || t.turnover24h > 500000000
    );
  } else if (category === 'TOP_20') {
    filteredTickers = [...filteredTickers]
      .sort((a, b) => b.turnover24h - a.turnover24h)
      .slice(0, 20);
  } else if (category === 'GAINERS') {
    filteredTickers = filteredTickers.filter((t) => t.price24hPcnt > 0);
  } else if (category === 'LOSERS') {
    filteredTickers = filteredTickers.filter((t) => t.price24hPcnt < 0);
  }

  // Apply sorting dynamically
  filteredTickers.sort((a, b) => {
    if (sortBy === 'VOLUME_DESC') {
      return b.turnover24h - a.turnover24h;
    } else if (sortBy === 'GAINERS_FIRST') {
      return b.price24hPcnt - a.price24hPcnt;
    } else if (sortBy === 'LOSERS_FIRST') {
      return a.price24hPcnt - b.price24hPcnt;
    } else if (sortBy === 'NAME_ASC') {
      return a.baseCoin.localeCompare(b.baseCoin);
    }
    return 0;
  });

  // Calculate Market Breadth (Gainers vs Losers)
  const gainersCount = tickers.filter((t) => t.price24hPcnt > 0).length;
  const losersCount = tickers.filter((t) => t.price24hPcnt < 0).length;
  const totalCount = tickers.length || 1;
  const gainerPcnt = Math.round((gainersCount / totalCount) * 100);

  const totalVolume = tickers.reduce((acc, t) => acc + t.turnover24h, 0);

  // Helper function to get color intensity based on percentage change
  const HeatmapColor = (pcnt: number) => {
    const pct = pcnt * 100; // e.g., 5.4 for +5.4%

    if (pct >= 10) {
      return {
        bg: 'bg-emerald-600/90 hover:bg-emerald-500',
        border: 'border-emerald-400/80',
        text: 'text-emerald-100',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      };
    } else if (pct >= 4) {
      return {
        bg: 'bg-emerald-700/75 hover:bg-emerald-600/80',
        border: 'border-emerald-500/50',
        text: 'text-emerald-100',
        badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30',
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      };
    } else if (pct > 0) {
      return {
        bg: 'bg-emerald-900/60 hover:bg-emerald-800/70',
        border: 'border-emerald-600/40',
        text: 'text-emerald-200',
        badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-600/30',
        glow: '',
      };
    } else if (pct === 0) {
      return {
        bg: 'bg-slate-800/60 hover:bg-slate-700/70',
        border: 'border-slate-700/50',
        text: 'text-slate-300',
        badge: 'bg-slate-900/60 text-slate-400 border-slate-700/30',
        glow: '',
      };
    } else if (pct > -4) {
      return {
        bg: 'bg-rose-950/65 hover:bg-rose-900/70',
        border: 'border-rose-700/40',
        text: 'text-rose-200',
        badge: 'bg-rose-950/80 text-rose-400 border-rose-700/30',
        glow: '',
      };
    } else if (pct > -10) {
      return {
        bg: 'bg-rose-800/75 hover:bg-rose-700/80',
        border: 'border-rose-500/50',
        text: 'text-rose-100',
        badge: 'bg-rose-950/90 text-rose-300 border-rose-500/30',
        glow: 'shadow-[0_0_12px_rgba(244,63,94,0.2)]',
      };
    } else {
      return {
        bg: 'bg-rose-600/90 hover:bg-rose-500',
        border: 'border-rose-400/80',
        text: 'text-rose-100',
        badge: 'bg-rose-950/90 text-rose-300 border-rose-400/40',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      };
    }
  };

  // Helper to format price nicely
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.0001) {
      return `$${price.toFixed(4)}`;
    } else {
      return `$${price.toFixed(7)}`;
    }
  };

  const formatTurnover = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  // Calculate size weights for weighted layout
  const maxTurnover = Math.max(...filteredTickers.map((t) => t.turnover24h), 1);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 text-slate-100">
      {/* Heatmap Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Market Performance Heatmap
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                Live 24H
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Color intensity reflects 24h percentage changes • Tile size indicates volume
            </p>
          </div>
        </div>

        {/* View Controls & Category Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Size Mode Switcher */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSizeMode('WEIGHTED')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                sizeMode === 'WEIGHTED'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Volume Weighted</span>
            </button>
            <button
              onClick={() => setSizeMode('GRID')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                sizeMode === 'GRID'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Equal Grid</span>
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FilterCategory)}
            className="bg-slate-950/80 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400/60"
          >
            <option value="ALL">All Tickers ({tickers.length})</option>
            <option value="TOP_20">Top 20 Volume</option>
            <option value="MAJORS">Major Coins</option>
            <option value="GAINERS">Gainers Only ({gainersCount})</option>
            <option value="LOSERS">Losers Only ({losersCount})</option>
          </select>

          {/* Dynamic Sort Order Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="VOLUME_DESC" className="bg-slate-900 text-slate-200">
                🔥 Highest Volume
              </option>
              <option value="GAINERS_FIRST" className="bg-slate-900 text-slate-200">
                🚀 Best Performers (+%)
              </option>
              <option value="LOSERS_FIRST" className="bg-slate-900 text-slate-200">
                📉 Worst Performers (-%)
              </option>
              <option value="NAME_ASC" className="bg-slate-900 text-slate-200">
                🔤 Alphabetical (A-Z)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Market Breadth & Sentiment Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
        {/* Gainers / Losers Ratio Bar */}
        <div className="sm:col-span-2 flex flex-col justify-center space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              {gainersCount} Gainers ({gainerPcnt}%)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              {losersCount} Losers ({100 - gainerPcnt}%)
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          {/* Ratio Progress Bar */}
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/50">
            <div
              className="bg-emerald-500 transition-all duration-500 h-full"
              style={{ width: `${gainerPcnt}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-500 h-full"
              style={{ width: `${100 - gainerPcnt}%` }}
            />
          </div>
        </div>

        {/* Total Volume */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l border-slate-800/80 sm:pl-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              24H Market Volume
            </span>
            <span className="text-sm font-bold font-mono text-amber-400">
              {formatTurnover(totalVolume)}
            </span>
          </div>
        </div>
      </div>

      {/* Color Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
        <span className="font-semibold flex items-center gap-1 text-slate-300">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          Color Scale:
        </span>
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold">&lt;-10%</span>
          <span className="px-2 py-0.5 rounded bg-rose-800 text-rose-200">-5%</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">0%</span>
          <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">+5%</span>
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold">&gt;+10%</span>
        </div>
      </div>

      {/* Heatmap Grid Rendering */}
      <div
        className={
          sizeMode === 'GRID'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 min-h-[360px]'
            : 'flex flex-wrap gap-2.5 min-h-[360px] items-stretch'
        }
      >
        {filteredTickers.map((coin) => {
          const style = HeatmapColor(coin.price24hPcnt);
          const isGainer = coin.price24hPcnt >= 0;
          const pctStr = `${isGainer ? '+' : ''}${(coin.price24hPcnt * 100).toFixed(2)}%`;

          // Weighted sizing calculation
          const volRatio = coin.turnover24h / maxTurnover;
          // Scale tile width/height dynamically for weighted mode
          let flexBasisClass = 'flex-1 min-w-[140px] sm:min-w-[160px]';
          let minHeightClass = 'min-h-[100px]';

          if (sizeMode === 'WEIGHTED') {
            if (volRatio > 0.4) {
              flexBasisClass = 'w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.33%-0.625rem)] min-w-[220px]';
              minHeightClass = 'min-h-[140px]';
            } else if (volRatio > 0.1) {
              flexBasisClass = 'w-[calc(50%-0.625rem)] sm:w-[calc(33.33%-0.625rem)] lg:w-[calc(25%-0.625rem)] min-w-[170px]';
              minHeightClass = 'min-h-[120px]';
            } else {
              flexBasisClass = 'w-[calc(50%-0.625rem)] sm:w-[calc(25%-0.625rem)] lg:w-[calc(16.66%-0.625rem)] min-w-[130px]';
              minHeightClass = 'min-h-[100px]';
            }
          }

          return (
            <div
              key={coin.symbol}
              onClick={() => onSelectCoin(coin)}
              onMouseEnter={() => setHoveredCoin(coin)}
              onMouseLeave={() => setHoveredCoin(null)}
              className={`group relative rounded-xl p-3 border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${style.bg} ${style.border} ${style.glow} ${flexBasisClass} ${minHeightClass}`}
            >
              {/* Subtle Ambient Background Watermark */}
              <div className="absolute -right-3 -bottom-3 text-white/5 font-black text-4xl select-none pointer-events-none group-hover:scale-110 transition-transform">
                {coin.baseCoin}
              </div>

              {/* Tile Top Row: Symbol & Badge */}
              <div className="flex items-start justify-between gap-1 z-10">
                <div>
                  <div className={`font-black tracking-tight text-sm sm:text-base ${style.text} flex items-center gap-1`}>
                    <span>{coin.baseCoin}</span>
                    <span className="text-[10px] opacity-70 font-normal">/USDT</span>
                  </div>
                  <div className="text-[10px] text-white/80 font-mono">
                    {formatTurnover(coin.turnover24h)}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${style.badge}`}
                >
                  {pctStr}
                </span>
              </div>

              {/* Tile Bottom Row: Last Price */}
              <div className="z-10 mt-2">
                <div className="text-xs sm:text-sm font-bold font-mono text-white group-hover:scale-105 transition-transform origin-left">
                  {formatPrice(coin.lastPrice)}
                </div>

                {/* Optional mini indicators if hovered or large */}
                {coin.fundingRate !== undefined && (
                  <div className="text-[9px] text-white/70 font-mono mt-0.5">
                    FR: {(coin.fundingRate * 100).toFixed(4)}%
                  </div>
                )}
              </div>

              {/* Hover Highlight Overlay Effect */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            </div>
          );
        })}
      </div>

      {/* Hover Info Footer Banner if a coin is hovered */}
      {hoveredCoin && (
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">{hoveredCoin.symbol} Summary:</span>
            <span className="font-mono text-slate-300">Price: {formatPrice(hoveredCoin.lastPrice)}</span>
            <span
              className={`font-mono font-bold ${
                hoveredCoin.price24hPcnt >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              24h: {hoveredCoin.price24hPcnt >= 0 ? '+' : ''}
              {(hoveredCoin.price24hPcnt * 100).toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>24h High: {formatPrice(hoveredCoin.highPrice24h)}</span>
            <span>24h Low: {formatPrice(hoveredCoin.lowPrice24h)}</span>
            <span>Volume: {formatTurnover(hoveredCoin.turnover24h)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
