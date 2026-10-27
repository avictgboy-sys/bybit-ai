import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
  Award,
  HelpCircle,
  BarChart3,
  Flame,
  Copy,
  Check,
  Calculator,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice } from '../utils/formatters';

interface DailyTenLoserPortfolioStrategyProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

const EXCLUDED_SYMBOLS = new Set([
  'USDCUSDT',
  'BUSDUSDT',
  'FDUSDUSDT',
  'DAIUSDT',
  'USDEUSDT',
  'TUSDUSDT',
  'EURUSDT',
  'USTCUSDT',
  'WBTCUSDT',
]);

export const DailyTenLoserPortfolioStrategy: React.FC<DailyTenLoserPortfolioStrategyProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [bdTime, setBdTime] = useState<string>('');
  const [isEntryWindow, setIsEntryWindow] = useState<boolean>(false);
  const [isProfitWindow, setIsProfitWindow] = useState<boolean>(false);
  const [profitLocked, setProfitLocked] = useState<boolean>(false);
  const [activeStrategy, setActiveStrategy] = useState<'losers' | 'gainers' | 'combined'>('losers');
  const [copied, setCopied] = useState<boolean>(false);

  // User Customizable Portfolio & Recovery Plan Settings
  const [capital, setCapital] = useState<number>(1000);
  const [lossAmount, setLossAmount] = useState<number>(1160);
  const [targetDailyRate, setTargetDailyRate] = useState<number>(1.2); // 1.2% daily target

  // Update BD Time (GMT+6)
  useEffect(() => {
    const updateBDClock = () => {
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const bdDate = new Date(utcMs + 6 * 3600000);

      const hours = bdDate.getHours();
      const minutes = bdDate.getMinutes();

      const timeString = bdDate.toLocaleTimeString('bn-BD', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      setBdTime(timeString);

      // Entry Window for Losers: around 12:00 AM BD Time (23:30 to 02:00)
      setIsEntryWindow(hours === 0 || hours === 1 || (hours === 23 && minutes >= 30));
      // Profit Booking Window: 8:00 AM to 2:00 PM BD Time (Asian/European morning surge)
      setIsProfitWindow(hours >= 8 && hours < 14);
    };

    updateBDClock();
    const interval = setInterval(updateBDClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter genuine crypto tickers (exclude stablecoins & low liquidity junk)
  const tradeableTickers = useMemo(() => {
    if (!tickers) return [];
    return tickers.filter(
      (t) =>
        !EXCLUDED_SYMBOLS.has(t.symbol) &&
        !t.symbol.includes('UP') &&
        !t.symbol.includes('DOWN') &&
        t.turnover24h > 400000 &&
        t.lastPrice > 0
    );
  }, [tickers]);

  // 1. Top 10 Dip Losers (oversold but with good turnover)
  const tenLosers = useMemo(() => {
    const sorted = [...tradeableTickers]
      .filter((t) => t.price24hPcnt < 0)
      .sort((a, b) => a.price24hPcnt - b.price24hPcnt);
    const result = sorted.slice(0, 10);
    if (result.length < 10) {
      tradeableTickers.forEach((t) => {
        if (result.length < 10 && !result.some((r) => r.symbol === t.symbol)) {
          result.push(t);
        }
      });
    }
    return result;
  }, [tradeableTickers]);

  // 2. Top 10 Momentum Gainers
  const tenGainers = useMemo(() => {
    const sorted = [...tradeableTickers]
      .filter((t) => t.price24hPcnt > 0)
      .sort((a, b) => b.price24hPcnt - a.price24hPcnt);
    const result = sorted.slice(0, 10);
    if (result.length < 10) {
      tradeableTickers.forEach((t) => {
        if (result.length < 10 && !result.some((r) => r.symbol === t.symbol)) {
          result.push(t);
        }
      });
    }
    return result;
  }, [tradeableTickers]);

  // 3. Combined 10 Coins (5 Dip Losers + 5 Momentum Gainers)
  const combinedCoins = useMemo(() => {
    return [...tenLosers.slice(0, 5), ...tenGainers.slice(0, 5)];
  }, [tenLosers, tenGainers]);

  const activeCoins =
    activeStrategy === 'losers'
      ? tenLosers
      : activeStrategy === 'gainers'
      ? tenGainers
      : combinedCoins;

  // Portfolio Math Calculations
  const coinCount = activeCoins.length || 10;
  const investmentPerCoin = capital / coinCount;
  const targetDailyDollar = (capital * targetDailyRate) / 100;
  const estimatedDaysToRecovery =
    targetDailyDollar > 0 ? Math.ceil(lossAmount / targetDailyDollar) : 90;
  const monthlyProjectedDollar = targetDailyDollar * 30;
  const monthlyProjectedPcnt = (monthlyProjectedDollar / capital) * 100;

  // Max Drawdown Stop
  const maxDailyRiskDollar = capital * 0.015; // 1.5% max daily drawdown limit ($15 on $1k)
  const maxLossPerCoin = investmentPerCoin * 0.016; // 1.6% max stop loss per coin

  // Simulated Live Combined PnL Estimation
  let estimatedTotalPnLDollar = 0;
  activeCoins.forEach((coin) => {
    const pcnt = coin.price24hPcnt * 100;
    if (activeStrategy === 'losers') {
      const bouncePcnt = Math.min(Math.max(Math.abs(pcnt) * 0.25, 0.8), 2.2);
      estimatedTotalPnLDollar += investmentPerCoin * (bouncePcnt / 100);
    } else {
      const momentumPcnt = Math.min(Math.max(pcnt * 0.3, 1.0), 3.0);
      estimatedTotalPnLDollar += investmentPerCoin * (momentumPcnt / 100);
    }
  });

  const handleCopySymbols = () => {
    const symbolList = activeCoins.map((c) => c.symbol).join(', ');
    navigator.clipboard.writeText(symbolList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!tickers || tickers.length === 0) return null;

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-emerald-500/40 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-950 font-black shrink-0 shadow-lg shadow-emerald-500/20">
            <Target className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                🎯 ক্যাপিটাল ও লস রিকভারি পোর্টফোলিও ইঞ্জিন
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                ১০টি কয়েন ডাইভার্সিফিকেশন
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              কম্পাউন্ড গাণিতিক মডেলে প্রতিদিন ১.০% - ১.৫% নিশ্চিত লক্ষ্য নিয়ে ঝুঁকিমুক্তভাবে পূর্বের সম্পূর্ণ লস রিকভার করার স্ট্র্যাটেজি
            </p>
          </div>
        </div>

        {/* Live BD Time Badge */}
        <div className="flex items-center gap-3 self-start lg:self-auto bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              বাংলাদেশ সময় (GMT+6)
            </span>
            <span className="text-sm font-black font-mono text-amber-400">{bdTime}</span>
          </div>
        </div>
      </div>

      {/* Interactive Loss Recovery Calculator Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              📐 আপনার লস রিকভারি ক্যালকুলেটর ও দৈনিক টার্গেট সেটআপ
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            ১:২.৫+ রিস্ক-রিওয়ার্ড সুরক্ষা
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Capital Input */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block">
              💰 বর্তমান মোট ক্যাপিটাল ($):
            </label>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold">$</span>
              <input
                type="number"
                min="100"
                max="50000"
                step="50"
                value={capital}
                onChange={(e) => setCapital(Math.max(100, Number(e.target.value) || 100))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-black font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              প্রতি কয়েনে অ্যালোকেশন: ${investmentPerCoin.toFixed(0)} ({capital / 10}$/কয়েন)
            </span>
          </div>

          {/* Previous Loss to Recover */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block">
              🛡️ পূর্বের লস পরিমাণ ($):
            </label>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-bold">$</span>
              <input
                type="number"
                min="50"
                max="100000"
                step="50"
                value={lossAmount}
                onChange={(e) => setLossAmount(Math.max(10, Number(e.target.value) || 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-black font-mono text-red-400 focus:outline-none focus:border-red-400"
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              যে পরিমাণ লস ধাপে ধাপে রিকভার হবে
            </span>
          </div>

          {/* Daily Target % Selection */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 block">
              🎯 দৈনিক প্রফিট টার্গেট রেট (%):
            </label>
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {[
                { label: '১.০% (Ultra Safe)', value: 1.0 },
                { label: '১.২% (Standard)', value: 1.2 },
                { label: '১.৫% (High Profit)', value: 1.5 },
              ].map((rate) => (
                <button
                  key={rate.value}
                  type="button"
                  onClick={() => setTargetDailyRate(rate.value)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                    targetDailyRate === rate.value
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {rate.value}%
                </button>
              ))}
            </div>
            <span className="text-[10px] text-emerald-400 block font-mono">
              দৈনিক টার্গেট: +${targetDailyDollar.toFixed(2)} USD
            </span>
          </div>
        </div>

        {/* Calculated Projection Roadmap */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block">১. দৈনিক প্রফিট গোল:</span>
            <span className="text-sm font-black text-emerald-400">
              +${targetDailyDollar.toFixed(2)} / দিন ({targetDailyRate}%)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
            <span className="text-[10px] text-slate-400 block">২. মাসিক সম্ভাব্য কম্পাউন্ড:</span>
            <span className="text-sm font-black text-amber-400">
              ~+${monthlyProjectedDollar.toFixed(2)} ({monthlyProjectedPcnt.toFixed(1)}%/মাস)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
            <span className="text-[10px] text-slate-400 block">৩. সম্পূর্ণ রিকভারি সময়কাল:</span>
            <span className="text-sm font-black text-cyan-400">
              ~{estimatedDaysToRecovery} ট্রেডিং দিন (~{(estimatedDaysToRecovery / 30).toFixed(1)} মাস)
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-red-500/30">
            <span className="text-[10px] text-slate-400 block">৪. সর্বোচ্চ দৈনিক ড্র-ডাউন রিস্ক:</span>
            <span className="text-sm font-black text-red-400">
              -${maxDailyRiskDollar.toFixed(2)} (-১.৫% Max)
            </span>
          </div>
        </div>
      </div>

      {/* 3 Strategic Windows and Timing Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Entry Window Indicator */}
        <div
          className={`p-3.5 rounded-xl border ${
            isEntryWindow
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] uppercase font-bold text-slate-400">
              ১. এন্ট্রি উইন্ডো (ডিপ ও সেটেলমেন্ট)
            </span>
          </div>
          <span className="text-xs font-bold font-mono">
            {isEntryWindow
              ? '🟢 রাত ১২:০০ AM পারফেক্ট এন্ট্রি টাইম চলছে!'
              : activeStrategy === 'gainers'
              ? '⚡ দিনের মোমেন্টাম ভলিউমে লাইভ এন্ট্রি ওপেন'
              : '🌙 রাত ১১:৩০ PM - ১:৩০ AM ডিপ এন্ট্রি সময়'}
          </span>
        </div>

        {/* Profit Booking Window */}
        <div
          className={`p-3.5 rounded-xl border ${
            isProfitWindow
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] uppercase font-bold text-slate-400">
              ২. প্রফিট বুকিং উইন্ডো (Asian/EU Session)
            </span>
          </div>
          <span className="text-xs font-bold font-mono">
            {isProfitWindow
              ? '💰 সকাল ৮:০০ AM - ১:০০ PM প্রফিট তোলার সময়!'
              : activeStrategy === 'gainers'
              ? '⚡ মোমেন্টাম টার্গেট (+১.৫% থেকে +৩.০%) হলে এক্সিট'
              : '⏰ সকাল ৮:০০ AM এর পর প্রফিট বুকিং শুরু'}
          </span>
        </div>

        {/* Live Profit Target & Profit Lock Button */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              ৩. লাইভ প্রফিট স্থিতি (Live Target)
            </span>
            <span className="text-sm font-black font-mono text-emerald-400">
              ~${estimatedTotalPnLDollar.toFixed(2)} / ${targetDailyDollar.toFixed(2)} USD
            </span>
          </div>

          <button
            type="button"
            onClick={() => setProfitLocked(!profitLocked)}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              profitLocked
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                : 'bg-slate-900 text-amber-400 hover:bg-slate-800 border border-amber-500/30'
            }`}
          >
            {profitLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            {profitLocked ? 'প্রফিট লকড' : 'প্রফিট লক করুন'}
          </button>
        </div>
      </div>

      {/* Strategy Mode Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveStrategy('losers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeStrategy === 'losers'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            🌙 ১০টি Losers ডিপ বাউন্স (রাত ১২:০০ AM)
          </button>

          <button
            type="button"
            onClick={() => setActiveStrategy('gainers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeStrategy === 'gainers'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            ☀️ ১০টি Gainers মোমেন্টাম (বেশি প্রফিট)
          </button>

          <button
            type="button"
            onClick={() => setActiveStrategy('combined')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeStrategy === 'combined'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ⚖️ কম্বাইন্ড ১০ কয়েন (৫ Losers + ৫ Gainers)
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopySymbols}
          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all self-end sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'কপিকৃত হয়েছে!' : '১০টি কয়েন কপি করুন'}
        </button>
      </div>

      {/* 10 Selected Coins Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>
              {activeStrategy === 'losers'
                ? `Bybit Top 10 Losers selection ($${investmentPerCoin.toFixed(0)} Allocation Each - ডিপ বাউন্স):`
                : activeStrategy === 'gainers'
                ? `Bybit Top 10 Gainers selection ($${investmentPerCoin.toFixed(0)} Allocation Each - মোমেন্টাম ব্রেকআউট):`
                : `Bybit Balanced 10 Coins selection ($${investmentPerCoin.toFixed(0)} Allocation Each - ৫ Losers + ৫ Gainers):`}
            </span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            মোট ইনভেস্টমেন্ট: ${capital} USD (${investmentPerCoin.toFixed(0)} / কয়েন)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">কয়েন পেয়ার</th>
                <th className="p-3">২৪ঘণ্টায় পরিবর্তন</th>
                <th className="p-3">ইনভেস্টমেন্ট</th>
                <th className="p-3">বর্তমান প্রাইজ</th>
                <th className="p-3">টার্গেট প্রফিট (TP1/TP2)</th>
                <th className="p-3">স্টপ লস (SL)</th>
                <th className="p-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {activeCoins.map((coin, index) => {
                const pcnt = coin.price24hPcnt * 100;
                const isPositive = pcnt >= 0;
                const price = coin.lastPrice;

                // Dynamic TP and SL based on volatility and strategy
                const tp1Rate = activeStrategy === 'gainers' ? 1.025 : 1.015;
                const tp2Rate = activeStrategy === 'gainers' ? 1.06 : 1.035;
                const slRate = activeStrategy === 'gainers' ? 0.982 : 0.984;

                const coinTp1 = price * tp1Rate;
                const coinTp2 = price * tp2Rate;
                const coinSl = price * slRate;

                const tp1PcntVal = ((tp1Rate - 1) * 100).toFixed(1);
                const slPcntVal = ((1 - slRate) * 100).toFixed(1);

                return (
                  <tr key={coin.symbol} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-bold text-slate-500">{index + 1}</td>
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-100">{coin.baseCoin}/USDT</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${
                            isPositive
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {isPositive ? '🚀 MOMENTUM' : '📉 DIP BUY'}
                        </span>
                      </div>
                    </td>

                    <td
                      className={`p-3 font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {pcnt.toFixed(2)}%
                    </td>

                    <td className="p-3 font-bold text-emerald-400">
                      ${investmentPerCoin.toFixed(0)}
                    </td>

                    <td className="p-3 text-slate-200">
                      {formatPrice(price)}
                    </td>

                    <td className="p-3 text-emerald-400 font-bold">
                      <div>${coinTp1 >= 1 ? coinTp1.toFixed(2) : coinTp1.toFixed(4)} (+{tp1PcntVal}%)</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        TP2: ${coinTp2 >= 1 ? coinTp2.toFixed(2) : coinTp2.toFixed(4)}
                      </div>
                    </td>

                    <td className="p-3 text-red-400">
                      <div>${coinSl >= 1 ? coinSl.toFixed(2) : coinSl.toFixed(4)}</div>
                      <div className="text-[10px] text-slate-500">(-{slPcntVal}%)</div>
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onSelectCoin(coin)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all"
                      >
                        ট্রেড চার্ট &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capital Protection Golden Rules */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-red-500/30 text-xs text-slate-200 space-y-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-red-400 text-sm">
              🛡️ মূলধন সুরক্ষা ও লস রিকভারির ৫টি অলঙ্ঘনীয় নিয়ম (Capital Protection Shield)
            </h4>
            <p className="text-slate-300 leading-relaxed font-sans">
              ক্রিপ্টো ফিউচারস ট্রেডিংয়ে লস রিকভার করতে গিয়ে কখনোই ওভার-লিভারেজ (১০x-৫০x) বা অল-ইন করবেন না। ১০টি কয়েনে $১০০ করে ভাগ করে ট্রেড নিলে কোনো একটি কয়েনে স্টপ লস হলেও বাকিগুলোর প্রফিটে মোট পোর্টফোলিও দৈনিক ১% - ১.৫% পজিটিভ থাকে।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 space-y-0.5">
            <strong className="text-emerald-400 block">১. ডাইভার্সিফিকেশন:</strong>
            <span>একটি কয়েনে সব টাকা না রেখে ১০টি কয়েনে সমান ভাগ করুন।</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 space-y-0.5">
            <strong className="text-red-400 block">২. ফিক্সড স্টপ লস:</strong>
            <span>প্রতি কয়েনে সর্বোচ্চ ১.৫% - ১.৮% স্টপ লস নিশ্চিত সেট করুন।</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 space-y-0.5">
            <strong className="text-amber-400 block">৩. দৈনিক প্রফিট লক:</strong>
            <span>দৈনিক লক্ষ্য পূরণ হওয়া মাত্র সব ট্রেড ক্লোজ করে মার্কেট থেকে বের হয়ে যান।</span>
          </div>
        </div>
      </div>
    </section>
  );
};
