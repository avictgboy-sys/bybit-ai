import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  Target,
  Lock,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Bell,
  Play,
  Check,
} from 'lucide-react';
import { TickerData } from '../types';

interface TenLosersStrategyProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export const TenLosersStrategyCard: React.FC<TenLosersStrategyProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [hasEnteredTrades, setHasEnteredTrades] = useState<boolean>(true);
  const [profitBlocked, setProfitBlocked] = useState<boolean>(false);

  // Filter top 10 losers from Bybit live ticker feed
  const sortedLosers = [...tickers]
    .filter((t) => t.price24hPcnt < 0)
    .sort((a, b) => a.price24hPcnt - b.price24hPcnt); // deepest losers first

  // Select 10 top oversold losers
  const top10Losers = (sortedLosers.length >= 10 ? sortedLosers.slice(0, 10) : sortedLosers).concat(
    tickers.filter((t) => !sortedLosers.includes(t)).slice(0, Math.max(0, 10 - sortedLosers.length))
  );

  // Each coin gets $100 investment = $1,000 Total Portfolio
  const investmentPerCoin = 100;
  const totalInvestment = 1000;
  const targetProfitGoal = 10; // $10 goal

  // Calculate live real-time portfolio value & PnL
  let currentPortfolioValue = 0;
  let totalLivePnlDollars = 0;

  const coinSetups = top10Losers.map((coin) => {
    const entryPrice = coin.lastPrice; // Simulating 12 AM entry price
    // 1% profit on $100 is $1 profit. To achieve $10 across 10 coins, each coin needs ~1% average gain
    const tpPrice = entryPrice * 1.015; // 1.5% target per coin
    const slPrice = entryPrice * 0.985; // 1.5% stop loss

    // Calculate simulated price movement from entry to current live price
    const currentPrice = coin.lastPrice;
    const priceChangePcnt = coin.price24hPcnt * 100; // live % change
    
    // Position sizing: $100 / entryPrice = number of tokens bought
    const tokensBought = investmentPerCoin / (entryPrice || 1);
    const currentValue = tokensBought * currentPrice;
    const pnlDollars = currentValue - investmentPerCoin;

    currentPortfolioValue += currentValue;
    totalLivePnlDollars += pnlDollars;

    return {
      coin,
      entryPrice,
      currentPrice,
      tokensBought,
      currentValue,
      pnlDollars,
      priceChangePcnt,
      tpPrice,
      slPrice,
    };
  });

  // Check if target profit of $10 is reached
  useEffect(() => {
    if (totalLivePnlDollars >= targetProfitGoal && !profitBlocked) {
      setProfitBlocked(true);
    }
  }, [totalLivePnlDollars, profitBlocked]);

  const progressPercent = Math.min(100, Math.max(0, (totalLivePnlDollars / targetProfitGoal) * 100));

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <DollarSign className="w-7 h-7 font-black animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                🎯 $1,000 📈 ১০টি ডিপ-বাই কয়েন পকেটিং স্ট্র্যাটেজি (Daily $10 Profit Goal)
              </h2>
              <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                10 COIN STRATEGY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Bybit Top Losers থেকে ১০টি কয়েনে $১০০ করে মোট $১,০০০ ইনভেস্টমেন্ট | রাত ১২ টায় এন্ট্রি &amp; সকাল ৮ টা থেকে $১০+ প্রফিটে ব্লক করার রুল
            </p>
          </div>
        </div>

        {/* Schedule & Timing Pills */}
        <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>এন্ট্রি সময়: <strong>রাত ১২:০০ AM</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>প্রফিট বুকিং: <strong>সকাল ৮:০০ AM+</strong></span>
          </div>
        </div>
      </div>

      {/* Portfolio Status Banner: $1000 Investment -> $10 Goal Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Stats Box */}
        <div className="md:col-span-8 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block mb-0.5">
                মোট ইনভেস্টমেন্ট ও প্রফিট গোল পোর্টফোলিও
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
                  ${(totalInvestment + totalLivePnlDollars).toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  (মূল ইনভেস্টমেন্ট: ${totalInvestment})
                </span>
              </div>
            </div>

            {/* Current PnL Pill */}
            <div
              className={`p-3 rounded-xl border text-right font-mono ${
                totalLivePnlDollars >= targetProfitGoal
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : totalLivePnlDollars >= 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block opacity-80">
                লাইভ মোট প্রফিট (PnL)
              </span>
              <span className="text-lg font-black">
                {totalLivePnlDollars >= 0 ? '+' : ''}${totalLivePnlDollars.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Progress Bar towards $10 Profit Goal */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400 font-medium">
                দৈনিক $১০ প্রফিট লক্ষ্যমাত্রা অগ্রগতি:
              </span>
              <span className="text-amber-400 font-bold">
                ${Math.max(0, totalLivePnlDollars).toFixed(2)} / ${targetProfitGoal}.00 USD ({progressPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalLivePnlDollars >= targetProfitGoal
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
              />
            </div>
          </div>

          {/* Auto Profit Block Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {profitBlocked ? (
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <Lock className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </div>
              )}

              <div>
                <span className="text-xs font-bold text-slate-100 block">
                  {profitBlocked
                    ? '🔒 প্রফিট ব্লক করা হয়েছে! ($১০.০০+ টার্গেট পূর্ণ হয়েছে)'
                    : '⏳ $১০ প্রফিট ট্র্যাকিং চালু রয়েছে (সকাল ৮টা থেকে লাভ বুক করুন)'}
                </span>
                <span className="text-[11px] text-slate-400 block font-sans">
                  {profitBlocked
                    ? 'অভিনন্দন! আপনার ১০টি কয়েন থেকে কাঙ্ক্ষিত $১০ বা তার বেশি লাভ অর্জিত হয়েছে। লাভ ব্লক করে দিন।'
                    : '১০টি কয়েনের মোট লাভ $১০ ছাড়িয়ে গেলেই প্রফিট অটো লক অ্যালার্ট সংকেত বেজে উঠবে।'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setProfitBlocked(!profitBlocked)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 ${
                profitBlocked
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {profitBlocked ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{profitBlocked ? 'প্রফিট লকড (Done)' : 'ম্যানুয়াল লক করুন'}</span>
            </button>
          </div>
        </div>

        {/* Right Allocation Summary Box */}
        <div className="md:col-span-4 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-extrabold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ১০টি কয়েন ইনভেস্টমেন্ট রুলস:
            </h3>

            <ul className="space-y-2 text-xs text-slate-300 font-sans">
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>ইনভেস্ট প্রতি কয়েনে:</span>
                <strong className="font-mono text-slate-100">$১০০.০০ USD</strong>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>মোট ১০টি কয়েন:</span>
                <strong className="font-mono text-amber-400">$১,০০০.০০ USD</strong>
              </li>
              <li className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span>দৈনিক টার্গেট লাভ:</span>
                <strong className="font-mono text-emerald-400">$১০.০০ USD (+১%)</strong>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <strong>ইনভেস্টমেন্ট টাইম:</strong> রাত ১২:০০ টায় ১০টি কয়েনে $১০০ করে বাই এন্ট্রি নিবেন এবং সকাল ৮:০০ টার পর $১০ লাভ হতেই পজিশন ক্লোজ বা প্রফিট বুক করবেন।
          </div>
        </div>
      </div>

      {/* 10 Daily Signals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Bybit Top 10 Losers ডিপ-বাই সিগন্যাল ($১০০ x ১০ কয়েন)
          </h3>
          <span className="text-xs font-mono text-slate-400">
            ১টি ক্লিকে যেকোনো কয়েনের লাইভ চার্ট খুলুন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {coinSetups.map((item, idx) => {
            const { coin, entryPrice, currentPrice, pnlDollars, priceChangePcnt, tpPrice, slPrice } = item;
            const isProfitable = pnlDollars >= 0;

            return (
              <div
                key={coin.symbol}
                onClick={() => onSelectCoin(coin)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-xl cursor-pointer transition-all space-y-2 group flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      সিগন্যাল #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      {priceChangePcnt.toFixed(2)}%
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-100 group-hover:text-amber-400 transition-colors mt-1">
                    {coin.baseCoin}/USDT
                  </h4>

                  <div className="text-xs font-mono text-slate-300 mt-1">
                    এন্ট্রি (১২ AM): <strong>${entryPrice >= 1 ? entryPrice.toFixed(2) : entryPrice.toFixed(4)}</strong>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-semibold">TP: ${tpPrice >= 1 ? tpPrice.toFixed(2) : tpPrice.toFixed(4)}</span>
                    <span className="text-red-400">SL: ${slPrice >= 1 ? slPrice.toFixed(2) : slPrice.toFixed(4)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px]">ইনভেস্ট: $১০০</span>
                    <span className={`font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isProfitable ? '+' : ''}${pnlDollars.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
