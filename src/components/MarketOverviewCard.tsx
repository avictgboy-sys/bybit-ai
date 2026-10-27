import React from 'react';
import { TrendingUp, TrendingDown, Flame, Zap, ShieldAlert, BarChart3 } from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice } from '../utils/formatters';

interface MarketOverviewCardProps {
  btcTicker?: TickerData;
  ethTicker?: TickerData;
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export const MarketOverviewCard: React.FC<MarketOverviewCardProps> = ({
  btcTicker,
  ethTicker,
  tickers,
  onSelectCoin,
}) => {
  // Compute overall market trend metrics
  const gainers = tickers.filter((t) => t.price24hPcnt > 0);
  const losers = tickers.filter((t) => t.price24hPcnt < 0);
  const avgPcnt =
    tickers.length > 0
      ? (tickers.reduce((acc, curr) => acc + curr.price24hPcnt, 0) / tickers.length) * 100
      : 0;

  const topGainer = [...tickers].sort((a, b) => b.price24hPcnt - a.price24hPcnt)[0];
  const topLoser = [...tickers].sort((a, b) => a.price24hPcnt - b.price24hPcnt)[0];
  const highestVolume = [...tickers].sort((a, b) => b.turnover24h - a.turnover24h)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
      {/* 1. Bitcoin Price Highlight */}
      <div
        onClick={() => btcTicker && onSelectCoin(btcTicker)}
        className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 hover:border-amber-500/40 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
              ₿
            </div>
            <div>
              <span className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                Bitcoin
              </span>
              <span className="text-[11px] text-slate-400 ml-1.5 font-mono">BTC/USDT</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span>🕯️</span>
              <span>ক্যান্ডেলস্টিক</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
              Bybit Spot
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {btcTicker ? formatPrice(btcTicker.lastPrice) : '$67,450.50'}
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
              (btcTicker?.price24hPcnt || 0) >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {(btcTicker?.price24hPcnt || 0) >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {((btcTicker?.price24hPcnt || 0) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2.5 border-t border-slate-800/80">
          <div>
            <span className="text-slate-500">24h High: </span>
            <span className="font-mono text-slate-300">
              {btcTicker?.highPrice24h ? formatPrice(btcTicker.highPrice24h) : '-'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">24h Low: </span>
            <span className="font-mono text-slate-300">
              {btcTicker?.lowPrice24h ? formatPrice(btcTicker.lowPrice24h) : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Ethereum Price Highlight */}
      <div
        onClick={() => ethTicker && onSelectCoin(ethTicker)}
        className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 hover:border-blue-500/40 cursor-pointer transition-all hover:scale-[1.01] shadow-xl group relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs">
              Ξ
            </div>
            <div>
              <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                Ethereum
              </span>
              <span className="text-[11px] text-slate-400 ml-1.5 font-mono">ETH/USDT</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
              <span>🕯️</span>
              <span>ক্যান্ডেলস্টিক</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
              Bybit Spot
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-black text-slate-100 font-mono tracking-tight">
            {ethTicker ? formatPrice(ethTicker.lastPrice) : '$1,890.00'}
          </div>
          <div
            className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
              (ethTicker?.price24hPcnt || 0) >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {(ethTicker?.price24hPcnt || 0) >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {((ethTicker?.price24hPcnt || 0) * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2.5 border-t border-slate-800/80">
          <div>
            <span className="text-slate-500">24h High: </span>
            <span className="font-mono text-slate-300">
              {ethTicker?.highPrice24h ? formatPrice(ethTicker.highPrice24h) : '-'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">24h Low: </span>
            <span className="font-mono text-slate-300">
              {ethTicker?.lowPrice24h ? formatPrice(ethTicker.lowPrice24h) : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Market Trend Pulse & Quick Highlights */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between shadow-xl md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 border border-slate-700/50">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Market Trend Pulse
            </h3>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              avgPcnt >= 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {avgPcnt >= 0 ? 'Bullish Drift' : 'Bearish Pressure'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-1 text-xs">
          <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 text-[10px]">Advance/Decline</span>
            <div className="font-bold text-slate-200 mt-0.5">
              <span className="text-emerald-400">{gainers.length} Gain</span> /{' '}
              <span className="text-red-400">{losers.length} Drop</span>
            </div>
          </div>
          <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
            <span className="text-slate-400 text-[10px]">Avg 24h Shift</span>
            <div
              className={`font-bold mt-0.5 ${
                avgPcnt >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {avgPcnt >= 0 ? '+' : ''}
              {avgPcnt.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Quick Highlights: Top Gainer & Top Loser (Side-by-Side Dual Bar) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          {/* Top Gainer */}
          {topGainer && (
            <div
              onClick={() => onSelectCoin(topGainer)}
              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-300 font-semibold shrink-0">Top Gainer:</span>
                <span className="font-bold text-slate-100 truncate">{topGainer.symbol}</span>
              </div>
              <span className="text-emerald-400 font-mono font-black text-xs shrink-0">
                +{(topGainer.price24hPcnt * 100).toFixed(2)}%
              </span>
            </div>
          )}

          {/* Top Loser */}
          {topLoser && (
            <div
              onClick={() => onSelectCoin(topLoser)}
              className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/20 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-[11px] text-rose-300 font-semibold shrink-0">Top Loser:</span>
                <span className="font-bold text-slate-100 truncate">{topLoser.symbol}</span>
              </div>
              <span className="text-rose-400 font-mono font-black text-xs shrink-0">
                {(topLoser.price24hPcnt * 100).toFixed(2)}%
              </span>
            </div>
          )}

          {/* Highest Volume Leader */}
          {highestVolume && (
            <div
              onClick={() => onSelectCoin(highestVolume)}
              className="flex items-center justify-between text-xs p-1 rounded-lg hover:bg-slate-800/60 cursor-pointer transition-colors text-[11px]"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-400">Vol Leader:</span>
                <span className="font-bold text-slate-200">{highestVolume.symbol}</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">
                ${(highestVolume.turnover24h / 1e6).toFixed(1)}M
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
