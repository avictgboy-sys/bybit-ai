import React, { useState } from 'react';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Flame,
  Search,
  Filter,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  LayoutGrid,
  Scale,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import { TickerData, SignalType } from '../types';
import { computeTechnicalIndicators, computeAiAnalysis } from '../utils/technicalAnalysis';
import { MarketHeatmap } from './MarketHeatmap';
import { formatPrice } from '../utils/formatters';

interface CoinListProps {
  tickers: TickerData[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectCoin: (coin: TickerData) => void;
  searchQuery: string;
}

type TabType = 'DUAL' | 'ALL' | 'HEATMAP' | 'GAINERS' | 'LOSERS' | 'TRENDING' | 'WATCHLIST';
type SortField = 'symbol' | 'price' | 'change' | 'turnover' | 'funding';

export const CoinList: React.FC<CoinListProps> = ({
  tickers,
  watchlist,
  onToggleWatchlist,
  onSelectCoin,
  searchQuery,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('DUAL');
  const [sortField, setSortField] = useState<SortField>('turnover');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dualLimit, setDualLimit] = useState<number>(10);

  // Compute top gainers and top losers for side-by-side comparison
  const validForDual = tickers.filter(
    (t) =>
      t.symbol.endsWith('USDT') &&
      !['USDCUSDT', 'BUSDUSDT', 'FDUSDUSDT', 'DAIUSDT', 'USDEUSDT'].includes(t.symbol)
  );

  const topGainersList = [...validForDual]
    .filter((t) => t.price24hPcnt > 0)
    .sort((a, b) => b.price24hPcnt - a.price24hPcnt)
    .slice(0, dualLimit);

  const topLosersList = [...validForDual]
    .filter((t) => t.price24hPcnt < 0)
    .sort((a, b) => a.price24hPcnt - b.price24hPcnt)
    .slice(0, dualLimit);

  const totalGainersCount = validForDual.filter((t) => t.price24hPcnt > 0).length;
  const totalLosersCount = validForDual.filter((t) => t.price24hPcnt < 0).length;
  const totalCount = validForDual.length || 1;
  const bullDominancePcnt = Math.round((totalGainersCount / totalCount) * 100);

  // Filter logic for standard table
  let filtered = tickers.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.symbol.toLowerCase().includes(q) || t.baseCoin.toLowerCase().includes(q);
    }
    return true;
  });

  if (activeTab === 'GAINERS') {
    filtered = filtered.filter((t) => t.price24hPcnt > 0);
  } else if (activeTab === 'LOSERS') {
    filtered = filtered.filter((t) => t.price24hPcnt < 0);
  } else if (activeTab === 'WATCHLIST') {
    filtered = filtered.filter((t) => watchlist.includes(t.symbol));
  } else if (activeTab === 'TRENDING') {
    // Trending = high volume or large absolute % change
    filtered = filtered.filter((t) => Math.abs(t.price24hPcnt) > 0.05 || t.turnover24h > 200000000);
  }

  // Sorting logic
  filtered.sort((a, b) => {
    if (sortField === 'symbol') {
      const aSymbol = a.baseCoin || a.symbol;
      const bSymbol = b.baseCoin || b.symbol;
      return sortOrder === 'desc'
        ? bSymbol.localeCompare(aSymbol)
        : aSymbol.localeCompare(bSymbol);
    }

    let aVal = 0;
    let bVal = 0;
    if (sortField === 'turnover') {
      aVal = a.turnover24h;
      bVal = b.turnover24h;
    } else if (sortField === 'change') {
      aVal = a.price24hPcnt;
      bVal = b.price24hPcnt;
    } else if (sortField === 'price') {
      aVal = a.lastPrice;
      bVal = b.lastPrice;
    } else if (sortField === 'funding') {
      aVal = a.fundingRate || 0;
      bVal = b.fundingRate || 0;
    }

    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder(field === 'symbol' ? 'asc' : 'desc');
    }
  };

  const renderSortHeader = (field: SortField, label: string, className = '') => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => toggleSort(field)}
        className={`pb-2.5 cursor-pointer select-none transition-colors group/head ${
          isActive ? 'text-amber-400 font-bold' : 'hover:text-slate-200'
        } ${className}`}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <span
            className={`p-0.5 rounded transition-all ${
              isActive
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-500 group-hover/head:text-slate-300'
            }`}
          >
            {isActive ? (
              sortOrder === 'desc' ? (
                <ArrowDown className="w-3.5 h-3.5" />
              ) : (
                <ArrowUp className="w-3.5 h-3.5" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-60" />
            )}
          </span>
        </div>
      </th>
    );
  };

  const getSignalBadge = (coin: TickerData) => {
    // Quick indicator estimation
    const mockKlines = [
      { close: coin.lastPrice * 0.98, high: coin.highPrice24h, low: coin.lowPrice24h, volume: coin.volume24h },
      { close: coin.lastPrice, high: coin.highPrice24h, low: coin.lowPrice24h, volume: coin.volume24h },
    ] as any;
    const indicators = computeTechnicalIndicators(mockKlines, coin.lastPrice);
    const ai = computeAiAnalysis(coin, indicators);

    switch (ai.signal) {
      case 'LONG':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20">
            🟢 LONG (লং নিন)
          </span>
        );
      case 'SHORT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-red-500 text-white shadow-sm shadow-red-500/20">
            🔴 SHORT (শর্ট নিন)
          </span>
        );
      case 'AVOID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            ⚫ এভোয়েড (সবাই পরিহার)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
            🟡 WAIT (অপেক্ষা করুন)
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3.5 sm:p-5 shadow-xl">
      {/* Tabs Row */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {(
            [
              { key: 'DUAL', label: '⚖️ Gainers ও Losers পাশাপাশি' },
              { key: 'ALL', label: 'All Markets' },
              { key: 'HEATMAP', label: 'Market Heatmap 🔥' },
              { key: 'GAINERS', label: 'Top Gainers 📈' },
              { key: 'LOSERS', label: 'Top Losers 📉' },
              { key: 'TRENDING', label: 'Trending ⚡' },
              { key: 'WATCHLIST', label: `Watchlist ⭐ (${watchlist.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Count badge */}
        <span className="text-[11px] text-slate-400 hidden sm:inline-block font-mono">
          {filtered.length} pairs
        </span>
      </div>

      {/* Main View Area */}
      {activeTab === 'HEATMAP' ? (
        <MarketHeatmap tickers={filtered} onSelectCoin={onSelectCoin} />
      ) : activeTab === 'DUAL' ? (
        <div className="space-y-4">
          {/* Breadth & Limit Control Header */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  গেইনার কয়েন: {totalGainersCount} টি ({bullDominancePcnt}%)
                </span>
                <span className="text-red-400 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  লুজার কয়েন: {totalLosersCount} টি ({100 - bullDominancePcnt}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                  style={{ width: `${bullDominancePcnt}%` }}
                />
                <div
                  className="bg-gradient-to-r from-rose-500 to-red-600 h-full transition-all duration-500"
                  style={{ width: `${100 - bullDominancePcnt}%` }}
                />
              </div>
            </div>

            {/* Limit Selector */}
            <div className="flex items-center gap-2 self-end md:self-center">
              <span className="text-[11px] text-slate-400 font-medium">কয়েন সংখ্যা:</span>
              {[5, 10, 15].map((lim) => (
                <button
                  key={lim}
                  onClick={() => setDualLimit(lim)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    dualLimit === lim
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Top {lim}
                </button>
              ))}
            </div>
          </div>

          {/* Pro Trader Hint Banner */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <p>
              <strong className="text-amber-300">১২ বছরের প্রো ট্রেডার গাইড:</strong> বাম পাশের <strong>শীর্ষ পাম্প কয়েনে</strong> ওভারবট রিজেকশন শর্ট এবং ডান পাশের <strong>শীর্ষ লুজার কয়েনে</strong> ডিমান্ড জোন লিকুইডিটি বাউন্স লং ট্রেড খুঁজুন।
            </p>
          </div>

          {/* Dual Side-by-Side Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT COLUMN: Top Gainers */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      শীর্ষ পাম্প কয়েন (Top Gainers)
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                        +{topGainersList.length}টি
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">বাইবিট ২৪ ঘণ্টা সর্বোচ্চ লাভকারী পেয়ার</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  HIGH PUMP
                </span>
              </div>

              <div className="space-y-2">
                {topGainersList.map((coin, idx) => {
                  const gainPcnt = coin.price24hPcnt * 100;
                  const isHugePump = gainPcnt >= 20;

                  return (
                    <div
                      key={coin.symbol}
                      onClick={() => onSelectCoin(coin)}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center text-xs font-mono font-bold text-slate-500 group-hover:text-emerald-400">
                          #{idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
                          {coin.baseCoin.substring(0, 3)}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-100 group-hover:text-emerald-400 text-xs sm:text-sm flex items-center gap-1">
                            <span>{coin.baseCoin}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              {coin.symbol}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>ভলিউম: ${(coin.turnover24h / 1e6).toFixed(1)}M</span>
                            <span className="hidden sm:inline text-emerald-400/80">
                              {isHugePump ? '⚡ তীব্র পাম্প' : '📈 আপট্রেন্ড'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2.5">
                        <div>
                          <div className="text-xs sm:text-sm font-black font-mono text-slate-100">
                            {formatPrice(coin.lastPrice)}
                          </div>
                          <div className="text-xs font-bold font-mono text-emerald-400 flex items-center justify-end gap-0.5">
                            <ArrowUp className="w-3 h-3 inline" />
                            +{gainPcnt.toFixed(2)}%
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                              isHugePump
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isHugePump ? '🔴 শর্ট ওয়াচ' : '🟢 মোমেন্টাম'}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Top Losers */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/30 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                      শীর্ষ লস / ডিপ কয়েন (Top Losers)
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono">
                        -{topLosersList.length}টি
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">বাইবিট ২৪ ঘণ্টা সর্বোচ্চ পতন হওয়া পেয়ার</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  HEAVY DIP
                </span>
              </div>

              <div className="space-y-2">
                {topLosersList.map((coin, idx) => {
                  const dropPcnt = coin.price24hPcnt * 100;
                  const isDeepDip = Math.abs(dropPcnt) >= 10;

                  return (
                    <div
                      key={coin.symbol}
                      onClick={() => onSelectCoin(coin)}
                      className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center text-xs font-mono font-bold text-slate-500 group-hover:text-rose-400">
                          #{idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-rose-400 text-xs shrink-0">
                          {coin.baseCoin.substring(0, 3)}
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-100 group-hover:text-rose-400 text-xs sm:text-sm flex items-center gap-1">
                            <span>{coin.baseCoin}</span>
                            <span className="text-[10px] font-mono text-slate-400 font-normal">
                              {coin.symbol}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>ভলিউম: ${(coin.turnover24h / 1e6).toFixed(1)}M</span>
                            <span className="hidden sm:inline text-rose-400/80">
                              {isDeepDip ? '🩸 মেগা ডিপ' : '📉 পুলব্যাক'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2.5">
                        <div>
                          <div className="text-xs sm:text-sm font-black font-mono text-slate-100">
                            {formatPrice(coin.lastPrice)}
                          </div>
                          <div className="text-xs font-bold font-mono text-rose-400 flex items-center justify-end gap-0.5">
                            <ArrowDown className="w-3 h-3 inline" />
                            {dropPcnt.toFixed(2)}%
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                              isDeepDip
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isDeepDip ? '🟢 বাউন্স লং ওয়াচ' : '🟡 অপেক্ষা'}
                          </span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-2.5 pl-2 w-10">Fav</th>
              {renderSortHeader('symbol', 'Trading Pair')}
              {renderSortHeader('price', 'Price')}
              {renderSortHeader('change', '24h Change')}
              {renderSortHeader('turnover', '24h Volume', 'hidden md:table-cell')}
              {renderSortHeader('funding', 'Funding Rate', 'hidden lg:table-cell')}
              <th className="pb-2.5 text-center">AI Recommendation</th>
              <th className="pb-2.5 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-slate-400/50" />
                    <p className="text-sm font-semibold">No crypto pairs matched your filter</p>
                    <p className="text-xs text-slate-400">
                      Try searching another symbol or switching tabs.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((coin) => {
                const isSaved = watchlist.includes(coin.symbol);
                const isPositive = coin.price24hPcnt >= 0;

                return (
                  <tr
                    key={coin.symbol}
                    onClick={() => onSelectCoin(coin)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Favorite Star */}
                    <td className="py-3 pl-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleWatchlist(coin.symbol)}
                        className={`p-1 rounded-md transition-colors ${
                          isSaved ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>

                    {/* Symbol */}
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-amber-400 text-[10px]">
                          {coin.baseCoin.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                            {coin.baseCoin}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {coin.symbol}
                            </span>
                            {isPositive ? (
                              <span className="text-[9px] font-bold text-emerald-400">
                                (🟢 ভলিউম প্রবেশ)
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-red-400">
                                (🔴 ভলিউম নির্গমন)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 font-mono font-bold text-slate-200">
                      {formatPrice(coin.lastPrice)}
                    </td>

                    {/* 24h Change */}
                    <td className="py-3 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {(coin.price24hPcnt * 100).toFixed(2)}%
                      </span>
                    </td>

                    {/* 24h Turnover Volume */}
                    <td className="py-3 font-mono text-slate-300 hidden md:table-cell">
                      ${(coin.turnover24h / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}M
                    </td>

                    {/* Funding Rate */}
                    <td className="py-3 font-mono hidden lg:table-cell">
                      {coin.fundingRate !== undefined ? (
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded ${
                            Math.abs(coin.fundingRate) >= 0.0005
                              ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30'
                              : 'text-slate-400'
                          }`}
                        >
                          {(coin.fundingRate * 100).toFixed(4)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* AI Recommendation Badge */}
                    <td className="py-3 text-center">{getSignalBadge(coin)}</td>

                    {/* Action Arrow */}
                    <td className="py-3 text-right pr-2">
                      <div className="p-1 rounded-lg bg-slate-800/80 text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 inline-flex transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
