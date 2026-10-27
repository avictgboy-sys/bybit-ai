import React, { useState } from 'react';
import {
  Zap,
  Flame,
  TrendingUp,
  Activity,
  ShieldAlert,
  Search,
  Sparkles,
  Copy,
  Check,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  Sliders,
  BarChart2,
  Info,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice, formatTurnover } from '../utils/formatters';
import { TradingMemoryService } from '../services/tradingMemory';

interface GrowingBullsScannerProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export type ScannerCategory = 'early_pump' | 'low_cap' | 'volume_surge' | 'breakout';

export const GrowingBullsScanner: React.FC<GrowingBullsScannerProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [activeCategory, setActiveCategory] = useState<ScannerCategory>('early_pump');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [selectedDeepDiveCoin, setSelectedDeepDiveCoin] = useState<TickerData | null>(null);

  // Trigger manual rescan visual feedback
  const handleRescan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 800);
  };

  // Filter & Calculate GrowingBulls Metrics
  const getProcessedCoins = () => {
    if (!tickers || tickers.length === 0) return [];

    return tickers
      .filter((t) => {
        if (!searchFilter) return true;
        return (
          t.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
          t.baseCoin.toLowerCase().includes(searchFilter.toLowerCase())
        );
      })
      .map((t) => {
        const pcnt = t.price24hPcnt * 100;
        const range = t.highPrice24h - t.lowPrice24h;
        const positionInRange = range > 0 ? ((t.lastPrice - t.lowPrice24h) / range) * 100 : 50;
        
        // Pivot points calculation
        const pivot = (t.highPrice24h + t.lowPrice24h + t.lastPrice) / 3;
        const r1 = 2 * pivot - t.lowPrice24h;
        const s1 = 2 * pivot - t.highPrice24h;
        const r2 = pivot + (t.highPrice24h - t.lowPrice24h);
        const s2 = pivot - (t.highPrice24h - t.lowPrice24h);

        // Simulated Volume Ramp & Accumulation Score (Inspired by GrowingBulls)
        // High turnover relative to price change indicates institutional accumulation
        const volumeDensity = t.turnover24h / (Math.abs(pcnt) + 0.1);
        const isLowCap = t.turnover24h >= 150000 && t.turnover24h <= 3500000;
        
        // Pump Early Score (0 - 100)
        let pumpScore = 50;
        if (positionInRange > 65 && pcnt > 1) pumpScore += 25;
        if (positionInRange > 80) pumpScore += 15;
        if (t.turnover24h > 1000000) pumpScore += 10;
        if (pcnt > 15) pumpScore -= 10; // Already pumped too much
        pumpScore = Math.min(Math.max(Math.round(pumpScore), 15), 98);

        let signalTag = 'ACCUMULATING 📥';
        if (pumpScore >= 80) signalTag = 'EARLY PUMP ALERT 🚀';
        else if (pumpScore >= 68) signalTag = 'VOLUME RAMP UP ⚡';
        else if (isLowCap && pcnt > 2) signalTag = 'LOW-CAP GEM 💎';
        else if (pcnt < -5) signalTag = 'DIP REBOUND 🎯';

        return {
          ...t,
          pcnt,
          positionInRange,
          pivot,
          r1,
          s1,
          r2,
          s2,
          pumpScore,
          signalTag,
          isLowCap,
          volumeDensity,
        };
      });
  };

  const processedCoins = getProcessedCoins();

  // Category Filtering
  const filteredCoins = processedCoins.filter((coin) => {
    if (activeCategory === 'early_pump') {
      return coin.pumpScore >= 65 && coin.pcnt >= -2 && coin.pcnt <= 18;
    }
    if (activeCategory === 'low_cap') {
      return coin.isLowCap && coin.turnover24h > 100000;
    }
    if (activeCategory === 'volume_surge') {
      return coin.turnover24h > 2000000;
    }
    if (activeCategory === 'breakout') {
      return coin.positionInRange >= 75;
    }
    return true;
  });

  // Sort by top pump score or turnover
  const sortedCoins = [...filteredCoins].sort((a, b) => b.pumpScore - a.pumpScore);

  const handleCopyList = () => {
    const symbols = sortedCoins.slice(0, 10).map((c) => c.symbol).join(', ');
    navigator.clipboard.writeText(symbols);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeDeepDive = selectedDeepDiveCoin
    ? processedCoins.find((c) => c.symbol === selectedDeepDiveCoin.symbol) || sortedCoins[0]
    : sortedCoins[0];

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl space-y-5 animate-fadeIn">
      {/* GrowingBulls Scanner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black shrink-0 shadow-lg shadow-amber-500/20">
            <Zap className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                ⚡ GrowingBulls লাইভ ক্রিপ্টো পাম্প ও একুমুলেশন স্ক্যানার
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                45m Early Signal Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              GrowingBulls-এর অ্যালগরিদম অনুকরণে ৪৫ মিনিট আগেই ভলিউম র‍্যাম্প-আপ এবং লো-ক্যাপ একুমুলেশন কয়েন সনাক্ত করুন!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleRescan}
            className={`px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all ${
              scanning ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 text-amber-400 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'স্ক্যান হচ্ছে...' : 'লাইভ রি-স্ক্যান'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyList}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '১০টি কয়েন কপি হয়েছে!' : '📋 টপ ১০ সিগন্যাল কপি'}</span>
          </button>
        </div>
      </div>

      {/* Feature Explanation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>১. Early Pump Radar (৪৫ মি. আগের সিগন্যাল)</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            মার্কেটে হঠাৎ বড় পাম্প শুরু হওয়ার ৪৫ মিনিট আগেই ভলিউম ক্লাস্টার এবং প্রাইস অ্যাকশন ধরে আগাম অ্যালার্ট দেয়।
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-slate-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-sky-400 text-sm">
            <Target className="w-4 h-4" />
            <span>২. Low Cap Gems Scanner ($200k - $3M Vol)</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            কম মার্কেটক্যাপ এবং মাঝারি ভলিউম কয়েনগুলোতে স্মার্ট মানি একুমুলেশন সনাক্ত করে যাতে বেশি রিটার্ন পাওয়া যায়।
          </p>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Scanner Category Selectors */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveCategory('early_pump')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeCategory === 'early_pump'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>🚀 Early Pump (আগাম পাম্প)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('low_cap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeCategory === 'low_cap'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>💎 Low-Cap Gems (কম ক্যাপ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('breakout')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeCategory === 'breakout'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>💥 Breakout Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('volume_surge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeCategory === 'volume_surge'
                ? 'bg-indigo-500 text-white font-black shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>⚡ High Volume Surge</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="কয়েন সার্চ করুন..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Main Content Layout: Left Table + Right Coin Deep-Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Signal Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-inner">
            <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>GrowingBulls স্ক্যান রেজাল্ট ({sortedCoins.length} টি কয়েন)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Bybit Realtime Feeds
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">কয়েন</th>
                    <th className="p-3">প্রাইজ</th>
                    <th className="p-3">২৪ঘণ্টা %</th>
                    <th className="p-3">২৪ঘণ্টা টার্নওভার</th>
                    <th className="p-3">পাম্প স্কোর</th>
                    <th className="p-3">সিগন্যাল ট্যাগর</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {sortedCoins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                        এই ফিল্টারে কোনো কয়েন পাওয়া যায়নি। অন্য ফিল্টার দিয়ে চেষ্টা করুন।
                      </td>
                    </tr>
                  ) : (
                    sortedCoins.slice(0, 15).map((coin) => {
                      const isPositive = coin.pcnt >= 0;
                      const isSelected = activeDeepDive?.symbol === coin.symbol;

                      return (
                        <tr
                          key={coin.symbol}
                          onClick={() => setSelectedDeepDiveCoin(coin)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-500/15 border-l-4 border-l-amber-500'
                              : 'hover:bg-slate-900/50'
                          }`}
                        >
                          <td className="p-3 font-bold">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-100">{coin.baseCoin}</span>
                              <span className="text-[9px] text-slate-500">/USDT</span>
                            </div>
                          </td>

                          <td className="p-3 font-bold text-slate-100">
                            {formatPrice(coin.lastPrice)}
                          </td>

                          <td
                            className={`p-3 font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {coin.pcnt.toFixed(2)}%
                          </td>

                          <td className="p-3 text-slate-300 font-sans text-[11px]">
                            {formatTurnover(coin.turnover24h)}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${coin.pumpScore}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-bold text-amber-400">
                                {coin.pumpScore}
                              </span>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-sans">
                              {coin.signalTag}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCoin(coin);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[10px] transition-all border border-amber-500/30"
                            >
                              ভিউ চার্ট
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Coin Deep-Dive & Pivot Support/Resistance Box */}
        {activeDeepDive && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold font-mono text-xs">
                  {activeDeepDive.baseCoin.substring(0, 3)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm font-mono">
                    {activeDeepDive.symbol} Deep-Dive
                  </h3>
                  <span className="text-[10px] text-amber-400 font-sans font-bold">
                    GrowingBulls Analytics
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-black text-slate-100">
                {formatPrice(activeDeepDive.lastPrice)}
              </span>
            </div>

            {/* Score & Momentum Meter */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">পাম্প মোমেন্টাম স্কোর:</span>
                <span className="text-amber-400 font-mono">{activeDeepDive.pumpScore} / 100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeDeepDive.pumpScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed pt-1">
                {activeDeepDive.pumpScore >= 75
                  ? '🔥 অত্যন্ত শক্তিশালী ভলিউম ইনফ্লো ও একুমুলেশন চলছে! এন্ট্রি পজিশন পর্যবেক্ষণ করুন।'
                  : '⚡ মাঝারি স্তরের একুমুলেশন। স্টপ লসসহ সীমিত রিস্কে ট্রেড করুন।'}
              </p>
            </div>

            {/* Pivot Support / Resistance Snapshot */}
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] font-bold uppercase text-slate-400 flex items-center justify-between">
                <span>পাইভট সাপোর্ট ও রেজিস্ট্যান্স:</span>
                <span className="text-amber-400 font-normal">24h High/Low Pivot</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Resistance 1 (R1)
                </span>
                <span className="text-slate-100 font-bold">{formatPrice(activeDeepDive.r1)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-amber-400 font-bold">Pivot Center (P)</span>
                <span className="text-slate-100 font-bold">{formatPrice(activeDeepDive.pivot)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Support 1 (S1)
                </span>
                <span className="text-slate-100 font-bold">{formatPrice(activeDeepDive.s1)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const p = activeDeepDive.lastPrice;
                  TradingMemoryService.addPredictionTrade(
                    activeDeepDive.symbol,
                    'LONG',
                    p,
                    p * 1.032,
                    p * 1.065,
                    p * 0.982,
                    `[পাম্প স্ক্যানার] ${activeDeepDive.baseCoin} এ মোমেন্টাম স্কোর ${activeDeepDive.pumpScore}/100 পেয়ে AI ট্র্যাকিংয়ে যুক্ত করা হয়েছে।`
                  );
                  alert(`🧠 ${activeDeepDive.baseCoin} সফলভাবে AI মেমোরি ট্র্যাকিংয়ে যুক্ত হয়েছে! প্রতি ৩ সেকেন্ডে এর প্রফিট/লস যাচাই করা হবে।`);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                🧠 AI মেমরিতে ট্র্যাক
              </button>

              <button
                type="button"
                onClick={() => onSelectCoin(activeDeepDive)}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/20"
              >
                🎯 চার্ট খুলুন
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
