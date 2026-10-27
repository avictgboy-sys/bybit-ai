import React, { useState, useMemo } from 'react';
import {
  Target,
  Crosshair,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Search,
  Filter,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';
import { TickerData, EmaTradeSetup } from '../types';
import { calculateEmaTradeSetup } from '../utils/technicalAnalysis';
import { formatPrice } from '../utils/formatters';

interface EmaTradeSetupHubProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
  className?: string;
}

export const EmaTradeSetupHub: React.FC<EmaTradeSetupHubProps> = ({
  tickers,
  onSelectCoin,
  className = '',
}) => {
  const [filter, setFilter] = useState<'ALL' | 'LONG' | 'SHORT' | 'GOLDEN'>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedSetup, setSelectedSetup] = useState<EmaTradeSetup | null>(null);

  // Generate EMA 50/100/200 setups for all coins
  const allSetups = useMemo(() => {
    return tickers.map((t) => {
      // Calculate setup synchronized with unified signal engine
      const setup = calculateEmaTradeSetup([], t.lastPrice, t.symbol, t);
      return {
        ticker: t,
        setup,
      };
    });
  }, [tickers]);

  // Filtered setups
  const filteredSetups = useMemo(() => {
    return allSetups.filter(({ ticker, setup }) => {
      const matchSearch =
        ticker.symbol.toLowerCase().includes(search.toLowerCase()) ||
        ticker.symbol.replace('USDT', '').toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      if (filter === 'LONG') return setup.direction === 'LONG';
      if (filter === 'SHORT') return setup.direction === 'SHORT';
      if (filter === 'GOLDEN') return setup.isTripleAligned && setup.direction === 'LONG';
      return true;
    });
  }, [allSetups, search, filter]);

  const longCount = allSetups.filter((s) => s.setup.direction === 'LONG').length;
  const shortCount = allSetups.filter((s) => s.setup.direction === 'SHORT').length;
  const goldenCount = allSetups.filter((s) => s.setup.isTripleAligned && s.setup.direction === 'LONG').length;

  return (
    <div className={`bg-slate-900/90 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-3.5 sm:p-5 shadow-2xl space-y-4 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Target className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
                <span>🎯 প্রতিটা কয়েনের EMA 50 / 100 / 200 ট্রেডিং অ্যানালাইসিস</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ENTRY • TP 1,2,3 • SL
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              EMA 50, EMA 100 এবং EMA 200 ট্রেন্ড সেটআপের উপর ভিত্তি করে স্বয়ংক্রিয় এন্ট্রি জোন, ৩টি টেক প্রফিট এবং ক্যাপিটাল প্রটেকশন স্টপ-লস।
            </p>
          </div>
        </div>

        {/* Filter Badges & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="কয়েন সার্চ (BTC, ETH, SOL...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-52 font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              সব ({allSetups.length})
            </button>
            <button
              onClick={() => setFilter('LONG')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === 'LONG'
                  ? 'bg-emerald-500 text-slate-950 shadow font-black'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <span>🟢 BUY ({longCount})</span>
            </button>
            <button
              onClick={() => setFilter('SHORT')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === 'SHORT'
                  ? 'bg-rose-500 text-slate-950 shadow font-black'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <span>🔴 SELL ({shortCount})</span>
            </button>
            <button
              onClick={() => setFilter('GOLDEN')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === 'GOLDEN'
                  ? 'bg-amber-500 text-slate-950 shadow font-black'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <span>✨ গোল্ডেন ({goldenCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Coin Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSetups.slice(0, 15).map(({ ticker, setup }) => {
          const isLong = setup.direction === 'LONG';
          const isShort = setup.direction === 'SHORT';

          return (
            <div
              key={ticker.symbol}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 shadow-lg hover:border-amber-500/60 ${
                isLong
                  ? 'bg-slate-950/80 border-emerald-500/30'
                  : isShort
                  ? 'bg-slate-950/80 border-rose-500/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              {/* Card Header: Symbol, Price, Direction Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <Layers className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      <span>{ticker.symbol}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          (ticker.price24hPcnt || 0) >= 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {(ticker.price24hPcnt || 0) >= 0 ? '+' : ''}
                        {(((ticker.price24hPcnt || 0)) * 100).toFixed(2)}%
                      </span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      ${formatPrice(ticker.lastPrice).replace('$', '')}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {setup.tradingStyleLabelBn && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm">
                        {setup.tradingStyleLabelBn}
                      </span>
                    )}
                    {setup.estimatedDurationBn && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-500/40 shadow-sm flex items-center gap-1 font-mono">
                        <Clock className="w-2.5 h-2.5 text-sky-400" />
                        ⏱️ {setup.estimatedDurationBn}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-xl border font-mono ${
                        isLong
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : isShort
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      {isLong ? '🟢 BUY / LONG' : isShort ? '🔴 SELL / SHORT' : '🟡 WAIT / RANGE'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    R:R: <strong className="text-amber-400">{setup.riskRewardRatio}</strong>
                  </span>
                </div>
              </div>

              {/* EMA Values Status (50 / 100 / 200) */}
              <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[10px] font-mono">
                <div className="text-center">
                  <span className="text-amber-400 block font-bold">EMA 50</span>
                  <span className="text-slate-200">${formatPrice(setup.ema50).replace('$', '')}</span>
                </div>
                <div className="text-center border-x border-slate-800">
                  <span className="text-cyan-400 block font-bold">EMA 100</span>
                  <span className="text-slate-200">${formatPrice(setup.ema100).replace('$', '')}</span>
                </div>
                <div className="text-center">
                  <span className="text-purple-400 block font-bold">EMA 200</span>
                  <span className="text-slate-200">${formatPrice(setup.ema200).replace('$', '')}</span>
                </div>
              </div>

              {/* Clear Target Levels: Entry, TP 1, 2, 3, SL */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-sky-950/30 border border-sky-500/30">
                  <span className="text-sky-400 font-bold flex items-center gap-1 text-[11px]">
                    <Crosshair className="w-3 h-3 text-sky-400" />
                    এন্ট্রি (Entry):
                  </span>
                  <span className="text-slate-100 font-black">
                    ${formatPrice(setup.entryPrice).replace('$', '')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-center">
                    <span className="text-emerald-400 font-bold block">TP 1 (+{setup.tp1GainPcnt}%)</span>
                    <span className="text-slate-200 font-bold">${formatPrice(setup.tp1).replace('$', '')}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-center">
                    <span className="text-emerald-300 font-bold block">TP 2 (+{setup.tp2GainPcnt}%)</span>
                    <span className="text-slate-100 font-bold">${formatPrice(setup.tp2).replace('$', '')}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-teal-950/40 border border-teal-500/40 text-center">
                    <span className="text-teal-300 font-bold block">TP 3 (+{setup.tp3GainPcnt}%)</span>
                    <span className="text-slate-100 font-bold">${formatPrice(setup.tp3).replace('$', '')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-950/30 border border-rose-500/30">
                  <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-rose-400" />
                    স্টপ-লস (SL -{setup.stopLossPcnt}%):
                  </span>
                  <span className="text-rose-300 font-black">
                    ${formatPrice(setup.stopLoss).replace('$', '')}
                  </span>
                </div>
              </div>

              {/* Bangla Recommendation Snippet */}
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {setup.summaryBn}
              </p>

              {/* Open Detail & Chart Button */}
              <button
                onClick={() => onSelectCoin(ticker)}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-800 hover:border-amber-400 shadow"
              >
                <span>{ticker.symbol} ক্যান্ডেলস্টিক ও EMA চার্ট দেখুন</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {filteredSetups.length > 15 && (
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center text-xs text-slate-400 font-mono">
          মোট {filteredSetups.length}টি কয়েনের EMA সেটআপ অ্যাক্টিভ রয়েছে। যেকোনো কয়েন ক্লিক করে তার সম্পূর্ণ ক্যান্ডেলস্টিক ও লাইভ চার্ট ওপেন করুন।
        </div>
      )}
    </div>
  );
};
