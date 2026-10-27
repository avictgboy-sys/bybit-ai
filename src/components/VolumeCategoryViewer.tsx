import React, { useState } from 'react';
import { Activity, Flame, Shield, TrendingUp, TrendingDown, Layers, Zap, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice, formatTurnover } from '../utils/formatters';

interface VolumeCategoryViewerProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export const VolumeCategoryViewer: React.FC<VolumeCategoryViewerProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [activeTab, setActiveTab] = useState<'volatile' | 'stable' | 'all'>('volatile');

  // Categorize Tickers based on Volume & Price Volatility Ratio
  // Volatile = high absolute price movement (>= 2.5%) or very high turnover ratio
  const volatileTickers = tickers.filter(
    (t) => Math.abs(t.price24hPcnt * 100) >= 2.5 || t.turnover24h > 50000000
  ).sort((a, b) => b.turnover24h - a.turnover24h);

  // Stable = lower price movement (< 2.5%) with consistent volume flow
  const stableTickers = tickers.filter(
    (t) => Math.abs(t.price24hPcnt * 100) < 2.5
  ).sort((a, b) => b.turnover24h - a.turnover24h);

  return (
    <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4">
      {/* Title & Category Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              ভলিউম ক্যাটাগরি ও পজিশন রেকমেন্ডেশন
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                Bybit Live Flow
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            কয়েনে ভলিউম প্রবেশ করছে নাকি বের হয়ে যাচ্ছে তা সহজেই জানুন এবং লং/শর্ট সিদ্ধান্ত নিন
          </p>
        </div>

        {/* Tab Selection Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('volatile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'volatile'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>⚡ অস্থির ভলিউম ({volatileTickers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'stable'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>🔒 স্থির ভলিউম ({stableTickers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>সকল ({tickers.length})</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 flex items-start gap-2">
          <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-emerald-200">🟢 কয়েনে ভলিউম প্রবেশ করছে (Volume Inflow - বাই প্রেসার):</strong>
            <span>নতুন মূলধন ও ক্রেতারা প্রবেশ করায় দাম ওপরের দিকে যাচ্ছে। এখানে <strong>লং (LONG) পজিশন</strong> বেছে নেওয়া লাভজনক।</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 flex items-start gap-2">
          <ArrowDownRight className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-red-200">🔴 কয়েন থেকে ভলিউম বের হয়ে যাচ্ছে (Volume Outflow - সেল প্রেসার):</strong>
            <span>বিক্রেতারা লিকুইডেশন করায় মূলধন বের হয়ে দাম কমছে। এখানে <strong>শর্ট (SHORT) পজিশন</strong> বা সেল ট্রেড উপযোগী।</span>
          </div>
        </div>
      </div>

      {/* Grid of Coins for the Selected Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(activeTab === 'volatile'
          ? volatileTickers
          : activeTab === 'stable'
          ? stableTickers
          : tickers
        )
          .slice(0, 18)
          .map((coin) => {
            const pcnt = coin.price24hPcnt * 100;
            const isPositive = pcnt >= 0;
            const isHighlyVolatile = Math.abs(pcnt) >= 3.0;

            return (
              <div
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className="bg-slate-950/80 hover:bg-slate-950 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all shadow-md group space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-100 font-mono group-hover:text-amber-400 transition-colors">
                      {coin.baseCoin}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">/USDT</span>
                  </div>

                  {/* Volatility Status Badge */}
                  {isHighlyVolatile ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      উচ্চ অস্থিরতা
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5" />
                      স্থির ভলিউম
                    </span>
                  )}
                </div>

                {/* Price and 24h Change */}
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black font-mono text-slate-100">
                    {formatPrice(coin.lastPrice)}
                  </div>

                  <div
                    className={`text-xs font-bold font-mono px-2 py-1 rounded-lg flex items-center gap-1 ${
                      isPositive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}
                      {pcnt.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Simple Bengali Volume Inflow/Outflow Box */}
                <div
                  className={`p-2 rounded-xl text-xs font-bold flex items-center justify-between border ${
                    isPositive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                      : 'bg-red-500/10 text-red-300 border border-red-500/25'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {isPositive ? '🟢' : '🔴'}
                    {isPositive ? 'ভলিউম প্রবেশ করছে (ইনফ্লো)' : 'ভলিউম বের হয়ে যাচ্ছে (আউটফ্লো)'}
                  </span>
                  <span className="text-[10px] opacity-80">বাইবিট ফ্লো</span>
                </div>

                {/* Clear Position Recommendation Badge (LONG vs SHORT) */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">পজিশন রেকমেন্ডেশন:</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-black text-xs flex items-center gap-1 shadow-sm ${
                      isPositive
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20'
                        : 'bg-red-500 text-white font-black shadow-red-500/20'
                    }`}
                  >
                    {isPositive ? '📈 LONG পজিশন নিন' : '📉 SHORT পজিশন নিন'}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </section>
  );
};
