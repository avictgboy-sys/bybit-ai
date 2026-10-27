import React, { useState } from 'react';
import {
  Briefcase,
  PlusCircle,
  Trash2,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AuthService, UserAccount, UserPortfolioItem } from '../services/authService';
import { TickerData } from '../types';

interface UserPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  tickers: TickerData[];
  onUserUpdate: (updatedUser: UserAccount) => void;
}

export const UserPortfolioModal: React.FC<UserPortfolioModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tickers,
  onUserUpdate,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [customCoinName, setCustomCoinName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSelectCoin = (symbol: string) => {
    setSelectedSymbol(symbol);
    const found = tickers.find((t) => t.symbol === symbol);
    if (found) {
      setBuyPrice(found.lastPrice.toString());
      setCustomCoinName(found.baseCoin);
    }
  };

  const handleAddCoin = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    const numAmount = parseFloat(amount);
    const numBuyPrice = parseFloat(buyPrice);

    if (isNaN(numAmount) || numAmount <= 0) {
      alert('অনুগ্রহ করে সঠিক ক্যান্টিটি (Amount) লিখুন।');
      return;
    }

    if (isNaN(numBuyPrice) || numBuyPrice <= 0) {
      alert('অনুগ্রহ করে সঠিক ক্রয় মূল্য (Buy Price) লিখুন।');
      return;
    }

    const updated = AuthService.addPortfolioCoin(
      currentUser.id,
      selectedSymbol,
      customCoinName || selectedSymbol.replace('USDT', ''),
      numAmount,
      numBuyPrice,
      notes
    );

    if (updated) {
      onUserUpdate(updated);
      setSuccessMsg(`ক্রিপ্টো ${selectedSymbol} সফলভাবে আপনার পোর্টফোলিওতে যোগ করা হয়েছে!`);
      setAmount('');
      setNotes('');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleDeleteCoin = (itemId: string) => {
    const updated = AuthService.deletePortfolioCoin(currentUser.id, itemId);
    if (updated) {
      onUserUpdate(updated);
    }
  };

  // Calculate live portfolio PnL
  let totalInvested = 0;
  let totalLiveValue = 0;

  const portfolioList = currentUser.portfolio || [];

  const enrichedPortfolio = portfolioList.map((item) => {
    const liveTicker = tickers.find((t) => t.symbol === item.symbol);
    const currentPrice = liveTicker ? liveTicker.lastPrice : item.buyPrice;
    const investedVal = item.amount * item.buyPrice;
    const liveVal = item.amount * currentPrice;
    const pnlUsdt = liveVal - investedVal;
    const pnlPcnt = investedVal > 0 ? (pnlUsdt / investedVal) * 100 : 0;

    totalInvested += investedVal;
    totalLiveValue += liveVal;

    return {
      ...item,
      currentPrice,
      investedVal,
      liveVal,
      pnlUsdt,
      pnlPcnt,
    };
  });

  const totalPnL = totalLiveValue - totalInvested;
  const totalPnLPcnt = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                💼 মাই অর্জিত ক্রিপ্টো পোর্টফোলিও (Personal Crypto Portfolio)
              </h2>
              <p className="text-xs text-slate-400">
                ইউজার: <strong className="text-emerald-400">{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/70 border-b border-slate-800 shrink-0">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">মোট ইনভেস্টমেন্ট</span>
            <span className="text-sm font-mono font-black text-slate-100">
              ${totalInvested.toFixed(2)} USD
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">লাইব পোর্টফোলিও ভ্যালু</span>
            <span className="text-sm font-mono font-black text-amber-400">
              ${totalLiveValue.toFixed(2)} USD
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">মোট লাভ / ক্ষতি (PnL)</span>
            <span
              className={`text-sm font-mono font-black flex items-center gap-1 ${
                totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {totalPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)} ({totalPnLPcnt.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add New Acquired Crypto Form */}
          <form
            onSubmit={handleAddCoin}
            className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3"
          >
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              নতুন অর্জিত ক্রিপ্টো যুক্ত করুন (Record Acquired Coin):
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Coin Picker */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">কয়েন নির্বাচন করুন:</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => handleSelectCoin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {tickers.map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.baseCoin} ({t.symbol}) - ${t.lastPrice}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">কয়ান্টিটি (Amount):</label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="যেমন: 0.05 বা 100"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buy Price */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">ক্রয় মূল্য (Buy Price USD):</label>
                <input
                  type="number"
                  step="any"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="যেমন: 64000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">নোট (নোটস/স্ট্র্যাটেজি):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: 12 AM Entry Loser"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              পোর্টফোলিওতে রেকর্ড করুন
            </button>
          </form>

          {/* Holdings List Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>অর্জিত কয়েন তালিকা ({enrichedPortfolio.length} টি):</span>
              <span className="text-[11px] text-emerald-400 font-mono">লাইভ বাইবিট প্রাইজ কানেক্টেড</span>
            </h3>

            {enrichedPortfolio.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950 space-y-2">
                <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  আপনার পোর্টফোলিওতে কোনো কয়েন যুক্ত করা নেই। উপরের ফর্ম ব্যবহার করে রেকর্ড করুন!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">কয়েন</th>
                      <th className="p-3.5">কয়ান্টিটি</th>
                      <th className="p-3.5">ক্রয় মূল্য (Buy Price)</th>
                      <th className="p-3.5">বর্তমান প্রাইজ (Live)</th>
                      <th className="p-3.5">ইনভেস্টমেন্ট & লাইভ ভ্যালু</th>
                      <th className="p-3.5">লাভ / ক্ষতি (PnL)</th>
                      <th className="p-3.5">নোট</th>
                      <th className="p-3.5 text-right">মুছুন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                    {enrichedPortfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3.5 font-bold">
                          <div className="text-slate-100">{item.coinName}</div>
                          <div className="text-[10px] text-amber-400">{item.symbol}</div>
                        </td>

                        <td className="p-3.5 text-slate-200 font-bold">{item.amount}</td>

                        <td className="p-3.5 text-slate-300">${item.buyPrice}</td>

                        <td className="p-3.5 font-bold text-amber-400">
                          ${item.currentPrice}
                        </td>

                        <td className="p-3.5 text-[11px]">
                          <div>ইনভেস্ট: ${item.investedVal.toFixed(2)}</div>
                          <div className="text-slate-400">লাইভ: ${item.liveVal.toFixed(2)}</div>
                        </td>

                        <td className={`p-3.5 font-bold ${item.pnlUsdt >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.pnlUsdt >= 0 ? '+' : ''}${item.pnlUsdt.toFixed(2)} ({item.pnlPcnt.toFixed(2)}%)
                        </td>

                        <td className="p-3.5 text-slate-400 text-[11px] font-sans">
                          {item.notes || '—'}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteCoin(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                            title="পোর্টফোলিও থেকে সরান"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
