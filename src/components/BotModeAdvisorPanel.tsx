import React, { useState } from 'react';
import {
  Bot,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Layers,
  HelpCircle,
  Zap,
  Flame,
  Copy,
  Check,
  Target,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice } from '../utils/formatters';

interface BotModeAdvisorPanelProps {
  tickers: TickerData[];
  onSelectCoin?: (coin: TickerData) => void;
}

export const BotModeAdvisorPanel: React.FC<BotModeAdvisorPanelProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [selectedMode, setSelectedMode] = useState<'NEUTRAL' | 'LONG' | 'SHORT'>('NEUTRAL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const selectedCoin = tickers.find((t) => t.symbol === selectedSymbol) || tickers[0];

  const handleCopyValue = (val: number, fieldName: string) => {
    const formattedVal = val >= 1 ? val.toFixed(2) : val.toFixed(4);
    navigator.clipboard.writeText(formattedVal);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Calculate Dynamic Support & Resistance prices for the selected coin
  const lastPrice = selectedCoin ? selectedCoin.lastPrice : 0;
  const pcntAbs = Math.abs(selectedCoin ? selectedCoin.price24hPcnt : 0.03);
  // Support 1 (Lower Price Limit for Grid Bot - যেখানে দাম বাউন্স করে)
  const support1 = lastPrice * (1 - Math.max(pcntAbs * 1.3, 0.055));
  // Resistance 1 (Upper Price Limit for Grid Bot - যেখানে দাম সেল হয়ে প্রফিট বুক হয়)
  const resistance1 = lastPrice * (1 + Math.max(pcntAbs * 1.3, 0.055));

  // Dynamically calculate recommended bot mode for the selected coin
  const getRecommendedMode = (coin?: TickerData): 'NEUTRAL' | 'LONG' | 'SHORT' => {
    if (!coin) return 'NEUTRAL';
    const pcnt = coin.price24hPcnt * 100;
    // If price is moving strongly upwards with high momentum (> +3.5%), LONG is favored
    if (pcnt >= 3.5) return 'LONG';
    // If price is dropping heavily (< -3.5%), SHORT is favored for Futures Grid
    if (pcnt <= -3.5) return 'SHORT';
    // Otherwise, for 80% of normal fluctuations (-3.5% to +3.5%), NEUTRAL is safest
    return 'NEUTRAL';
  };

  const recMode = getRecommendedMode(selectedCoin);

  return (
    <div className="bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-100">
                🤖 বট মোড সিলেকশন গাইড
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                NEUTRAL / LONG / SHORT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              বাইবিট ট্রেডিং বটে কোন মোড চালু করবেন তা সহজ বাংলায় বুঝে নিন এবং লাইভ কয়েন রেকমেন্ডেশন দেখুন
            </p>
          </div>
        </div>

        {/* Live Coin Selector to Check Recommendation */}
        {tickers.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <span className="text-[11px] font-bold text-slate-400 px-2">কয়েন চেক:</span>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-slate-900 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer font-mono"
            >
              {tickers.slice(0, 30).map((t) => (
                <option key={t.symbol} value={t.symbol}>
                  {t.baseCoin}/USDT ({t.price24hPcnt >= 0 ? '+' : ''}
                  {(t.price24hPcnt * 100).toFixed(2)}%)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Recommended Mode Badge for the Selected Coin */}
      {selectedCoin && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
                recMode === 'NEUTRAL'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : recMode === 'LONG'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40'
              }`}
            >
              {recMode === 'NEUTRAL' ? '🛡️' : recMode === 'LONG' ? '📈' : '📉'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-100 font-mono">
                  {selectedCoin.baseCoin}/USDT
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    selectedCoin.price24hPcnt >= 0
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-red-500/15 text-red-400'
                  }`}
                >
                  {selectedCoin.price24hPcnt >= 0 ? '+' : ''}
                  {(selectedCoin.price24hPcnt * 100).toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                এই মুহূর্তে <strong>{selectedCoin.baseCoin}</strong> কয়েনের জন্য সেরা বট মোড:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg ${
                recMode === 'NEUTRAL'
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : recMode === 'LONG'
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-red-500 text-white shadow-red-500/20'
              }`}
            >
              <span>
                {recMode === 'NEUTRAL'
                  ? '🛡️ NEUTRAL (নিউট্রিয়াল মোড)'
                  : recMode === 'LONG'
                  ? '📈 LONG (লং মোড)'
                  : '📉 SHORT (শর্ট মোড)'}
              </span>
            </div>

            {onSelectCoin && (
              <button
                type="button"
                onClick={() => onSelectCoin(selectedCoin)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1"
              >
                <span>গ্রিড প্যারামিটার</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🎯 ৩-ধাপে বাইবিট বট সহজ সেটআপ ও Support-Resistance (সাপোর্ট-রেজিস্ট্যান্স) ক্যালকুলেটর */}
      {selectedCoin && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-black">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-100">
                  🎯 ৩-ধাপে বাইবিট বট সহজ সেটআপ ও Support-Resistance গাইড
                </h3>
                <p className="text-[11px] text-slate-400">
                  বাইবিট গ্রিড বটের Lower Price হলো Support এবং Upper Price হলো Resistance! ১ ক্লিকে কপি করুন:
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 self-start sm:self-auto">
              {selectedCoin.baseCoin}/USDT লাইভ রেট: {formatPrice(lastPrice)}
            </span>
          </div>

          {/* Support and Resistance Cards with Copy Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Support Box (Lower Price) */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs sm:text-sm">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Lower Price (সাপোর্ট ১ - Support)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyValue(support1, 'support1')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-all border border-emerald-500/30"
                >
                  {copiedField === 'support1' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-lg sm:text-xl font-black font-mono text-emerald-400">
                ${formatPrice(support1)}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>সাপোর্ট কী?</strong> যে দামে কয়েন নিচে নামতে বাধা পায় এবং বাউন্স করে ওপরে ওঠে। বাইবিট গ্রিড বটে এটি <strong>Lower Price</strong> লিমিট হিসেবে বসান।
              </p>
            </div>

            {/* Resistance Box (Upper Price) */}
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-xs sm:text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Upper Price (রেজিস্ট্যান্স ১ - Resistance)</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyValue(resistance1, 'resistance1')}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-bold flex items-center gap-1 transition-all border border-red-500/30"
                >
                  {copiedField === 'resistance1' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-lg sm:text-xl font-black font-mono text-red-400">
                ${formatPrice(resistance1)}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                <strong>রেজিস্ট্যান্স কী?</strong> যে দামে কয়েন ওপরে উঠতে বাধা পায় এবং সেল হয়ে প্রফিট বুক হয়। বাইবিট গ্রিড বটে এটি <strong>Upper Price</strong> লিমিট হিসেবে বসান।
              </p>
            </div>
          </div>

          {/* Super Easy 3-Step Setup Guide */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>১ মিনিটে বাইবিট বট চালুর সহজ ৩টি ধাপ (Easy Setup Guide):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-amber-400 block mb-1">১. অ্যাপে প্রবেশ করুন:</strong>
                Bybit অ্যাপে গিয়ে <strong>Tools &gt; Trading Bot &gt; Futures Grid</strong> খুলুন এবং <strong>{selectedCoin.baseCoin}/USDT</strong> বেছে নিয়ে <strong>Manual Setup</strong> চাপুন।
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-emerald-400 block mb-1">২. লিমিট ও গ্রিড বসান:</strong>
                Lower Price-এ <strong>{formatPrice(support1)}</strong>, Upper Price-এ <strong>{formatPrice(resistance1)}</strong> এবং Grid Count-এ <strong>50</strong> বসান।
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                <strong className="text-sky-400 block mb-1">৩. ইনভেস্ট ও লেভারেজ:</strong>
                Investment-এ <strong>100 USDT</strong> (বা আপনার ইচ্ছা মতো) এবং লেভারেজ <strong>১x - ২x</strong> (নিরাপদ) সিলেক্ট করে <strong>Create Bot</strong> ক্লিক করুন!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Select Tabs for Deep Dive Explanation */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedMode('NEUTRAL')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedMode === 'NEUTRAL'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20 scale-[1.01]'
                : 'text-slate-300 hover:text-amber-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>NEUTRAL (সবচেয়ে নিরাপদ)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('LONG')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedMode === 'LONG'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 scale-[1.01]'
                : 'text-slate-300 hover:text-emerald-400'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>LONG (আপট্রেন্ড)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('SHORT')}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              selectedMode === 'SHORT'
                ? 'bg-red-500 text-white font-black shadow-md shadow-red-500/20 scale-[1.01]'
                : 'text-slate-300 hover:text-red-400'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>SHORT (ডাউনট্রেন্ড)</span>
          </button>
        </div>

        {/* Detailed Description Card for the Selected Mode */}
        {selectedMode === 'NEUTRAL' && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-amber-400 flex items-center gap-2">
                🛡️ NEUTRAL (নিউট্রিয়াল) বট মোড - ৯০% ট্রেডারের জন্য সেরা!
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                রিক্স: সর্বনিম্ন (Low Risk)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>কিভাবে কাজ করে:</strong> NEUTRAL মোডে বট কোনো নির্দিষ্ট দিকে একতরফা ট্রেড নেয় না। এটি একটি লোয়ার প্রাইস এবং আপার প্রাইসের মধ্যে গ্রিড তৈরি করে। দাম নিচে নামলে স্বয়ংক্রিয়ভাবে Buy (লং) করে এবং দাম ওপরে উঠলে Sell (শর্ট) করে প্রফিট বুক করে।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-400 block">কখন চালু করবেন:</strong>
                  মার্কেট যখন সাইডওয়েজ (Sideways) বা নির্দিষ্ট রেঞ্জের মধ্যে ওঠা-নামা করে। যেমন বিটকয়েন $95,000 থেকে $98,000-এর মধ্যে রেঞ্জ-বাউন্ড থাকলে।
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400 block">কেন সেরা:</strong>
                  ক্রিপ্টো মার্কেট ৭০% সময় রেঞ্জ-বাউন্ড থাকে। তাই নতুন বা সাধারণ ট্রেডারদের জন্য NEUTRAL মোড সবসময় সবচেয়ে নিরাপদ ও লাভজনক।
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMode === 'LONG' && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-emerald-400 flex items-center gap-2">
                📈 LONG (লং) বট মোড - বুল মার্কেট ও আপট্রেন্ডের জন্য
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                রিক্স: মাঝারি (Medium Risk)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>কিভাবে কাজ করে:</strong> LONG মোডে বট শুধুমাত্র নিচে ডিপ (Dip) এলে Buy করে এবং ওপরে দাম উঠলে Sell করে প্রফিট নেয়। এটি কোনো শর্ট (Short) পজিশন খোলে না।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-400 block">কখন চালু করবেন:</strong>
                  যখন আমাদের অ্যাপে দেখবেন কয়েনে <strong>"🟢 ভলিউম প্রবেশ করছে (Inflow)"</strong> এবং কয়েনটি শক্তিশালী আপট্রেন্ডে রয়েছে (দাম ব্রেকআউট করছে)।
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400 block">সতর্কতা:</strong>
                  মার্কেট হঠাৎ বড় ধরনের ক্র্যাশ করলে বা ডাউনট্রেন্ড শুরু হলে LONG মোডে লস হতে পারে, তাই স্টপ লস ব্যবহার করা জরুরি।
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedMode === 'SHORT' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-red-400 flex items-center gap-2">
                📉 SHORT (শর্ট) বট মোড - বিয়ার মার্কেট ও ডাউনট্রেন্ডের জন্য
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                রিক্স: উচ্চ (High Risk)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>কিভাবে কাজ করে:</strong> SHORT মোডে বট দাম ওপরে উঠলে Short Sell করে এবং দাম নিচে নামলে Buy to Close করে প্রফিট বুক করে। মার্কেট যখন একটানা নিচে নামে, তখন এটি লাভ দেয়।
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-400 block">কখন চালু করবেন:</strong>
                  যখন দেখবেন কয়েন থেকে <strong>"🔴 ভলিউম বের হয়ে যাচ্ছে (Outflow)"</strong> এবং দাম একটানা কমছে বা বড় রেজিস্ট্যান্স থেকে রিজেকশন পেয়েছে।
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-400 block">সতর্কতা:</strong>
                  ক্রিপ্টোতে শর্ট বট সবসময় ঝুঁকিপূর্ণ। লেভারেজ ১x-২x এর বেশি নেবেন না এবং স্টপ লস অবশ্যই সেট করবেন।
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Summary Reference Table */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>এক নজরে সিদ্ধান্ত নেওয়ার সহজ চার্ট:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30">
            <div className="font-extrabold text-amber-400 mb-1">🛡️ NEUTRAL মোড</div>
            <p className="text-[11px] text-slate-400">
              মার্কেট যখন সাইডওয়েজ থাকে এবং নিশ্চিত কোনো ট্রেন্ড থাকে না। <strong className="text-slate-200">৯০% ক্ষেত্রে এটিই সেরা।</strong>
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30">
            <div className="font-extrabold text-emerald-400 mb-1">📈 LONG মোড</div>
            <p className="text-[11px] text-slate-400">
              ভলিউম ইনফ্লো বেশি এবং দাম প্রতিনিয়ত নতুন হাই তৈরি করছে (বুল রান)।
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-red-500/30">
            <div className="font-extrabold text-red-400 mb-1">📉 SHORT মোড</div>
            <p className="text-[11px] text-slate-400">
              ভলিউম আউটফ্লো বেশি এবং দাম রেজিস্ট্যান্স ভেঙে নিচে নামছে (বিয়ারিশ রান)।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
