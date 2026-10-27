import React, { useState } from 'react';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  ShieldAlert,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice, formatTurnover } from '../utils/formatters';

interface MemeCoinLiveRadarProps {
  tickers: TickerData[];
  onSelectCoin?: (coin: TickerData) => void;
}

// Popular Bybit Meme Coin symbols list
const MEME_SYMBOLS = [
  'DOGEUSDT',
  'SHIBUSDT',
  'PEPEUSDT',
  'BONKUSDT',
  'FLOKIUSDT',
  'WIFUSDT',
  'TURBOUSDT',
  'BOMEUSDT',
  'MEMEUSDT',
  'NOTUSDT',
  'DOGSUSDT',
  'POPCATUSDT',
  'NEIROUSDT',
  'PNUTUSDT',
  'BRETTUSDT',
  'MOODENGUSDT',
  'MYROUSDT',
  'TRUMPUSDT',
  'CHILLGUYUSDT',
  'CATIUSDT',
  'MEWUSDT',
];

export const MemeCoinLiveRadar: React.FC<MemeCoinLiveRadarProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'gainers' | 'volume' | 'dip'>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Filter existing Bybit tickers for Meme Coins
  const memeTickers = tickers.filter((t) =>
    MEME_SYMBOLS.includes(t.symbol) ||
    ['DOGE', 'SHIB', 'PEPE', 'BONK', 'FLOKI', 'WIF', 'TURBO', 'BOME', 'MEME', 'NOT', 'DOGS', 'POPCAT', 'NEIRO', 'PNUT', 'BRETT', 'MOODENG', 'MYRO', 'TRUMP', 'MEW'].includes(t.baseCoin)
  );

  // Sort/filter based on user selection
  const displayTickers = [...memeTickers].sort((a, b) => {
    if (filterMode === 'gainers') return b.price24hPcnt - a.price24hPcnt;
    if (filterMode === 'dip') return a.price24hPcnt - b.price24hPcnt;
    if (filterMode === 'volume') return b.turnover24h - a.turnover24h;
    return b.turnover24h - a.turnover24h;
  });

  const handleCopyMemeList = () => {
    const listStr = memeTickers.map((c) => c.symbol).join(', ');
    navigator.clipboard.writeText(listStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shrink-0 shadow-lg shadow-amber-500/20">
            <Flame className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                🔥 মীম কয়েন (Meme Coins) লাইভ ট্রেড রাডার ও মোমেন্টাম গাইড
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
                হাই-প্রফিট সম্ভাবনা
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              মীম কয়েনে অল্প সময়ে বেশি লাভের সুযোগ থাকে! বাইবিটের লাইভ ভলিউম ইনফ্লো ও বট মোড রেকমেন্ডেশন দেখে নিন
            </p>
          </div>
        </div>

        {/* Copy Symbols Button */}
        <button
          type="button"
          onClick={handleCopyMemeList}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm self-start lg:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
          <span>{copied ? '✅ মীম কয়েন লিস্ট কপি হয়েছে!' : '📋 সব মীম কয়েনের লিস্ট কপি করুন'}</span>
        </button>
      </div>

      {/* Why Meme Coins are good & capital protection warning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-slate-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>কেন মীম কয়েনে ভালো লাভ হয়? (High Profit Opportunity)</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            মীম কয়েনগুলোতে (যেমন <strong>PEPE, DOGE, BONK, FLOKI, WIF</strong>) প্রচণ্ড কমিউনিটি মোমেন্টাম ও ভলিউম থাকে। ভলিউম ইনফ্লো শুরু হলে দিনে খুব দ্রুত <strong>+৫% থেকে +২০% পর্যন্ত পাম্প</strong> করে, যা শর্ট-টার্ম ট্রেড বা গ্রিড বটের জন্য চমৎকার।
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>সতর্কতা ও সেফটি রুলস (Capital Protection Rules)</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">
            মীম কয়েনের অস্থিরতা (Volatility) সাধারণ কয়েনের চেয়ে ৩ গুণ বেশি। তাই ট্রেডিং বটে <strong>লেভারেজ ১x-৩x এর বেশি নেবেন না</strong> এবং অবশ্যই <strong>১.৫% - ২.৫% স্টপ লস (SL)</strong> সেট করে মূলধন সুরক্ষিত রাখবেন।
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>সব মীম কয়েন ({memeTickers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('gainers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              filterMode === 'gainers'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>🚀 টপ গেইনার মীম</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              filterMode === 'volume'
                ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>⚡ সর্বোচ্চ ভলিউম</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('dip')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              filterMode === 'dip'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>🔻 ডিপ এন্ট্রি (Dip Buy)</span>
          </button>
        </div>

        <span className="text-xs font-mono text-slate-400">
          বাইবিট লাইভ ডেটা • {displayTickers.length} টি কয়েন পাওয়া গেছে
        </span>
      </div>

      {/* Meme Coins Cards Grid */}
      {displayTickers.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-300">
            এই মুহূর্তে আপনার লাইভ তালিকায় মীম কয়েন লোড হচ্ছে...
          </p>
          <p className="text-xs text-slate-500">
            বাইবিট থেকে রিয়েলটাইম ভলিউম ও প্রাইস আপডেট করা হচ্ছে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayTickers.map((coin) => {
            const pcnt = coin.price24hPcnt * 100;
            const isPositive = pcnt >= 0;
            const isHighlyVolatile = Math.abs(pcnt) >= 4.0;

            // Determine optimal bot mode
            let botMode: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
            if (pcnt >= 4.0) botMode = 'LONG';
            else if (pcnt <= -4.0) botMode = 'SHORT';

            return (
              <div
                key={coin.symbol}
                onClick={() => onSelectCoin && onSelectCoin(coin)}
                className="bg-slate-950/90 hover:bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-amber-500/60 cursor-pointer transition-all shadow-md group space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-extrabold text-xs font-mono">
                      {coin.baseCoin.substring(0, 4)}
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-slate-100 font-mono group-hover:text-amber-400 transition-colors">
                        {coin.baseCoin}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {coin.symbol} • MEME
                      </div>
                    </div>
                  </div>

                  {/* High Volatility Badge */}
                  {isHighlyVolatile ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5" />
                      হাই-ভলাটিলিটি
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Activity className="w-2.5 h-2.5" />
                      রেঞ্জ বাউন্ড
                    </span>
                  )}
                </div>

                {/* Price and 24h Change */}
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black font-mono text-slate-100">
                    {formatPrice(coin.lastPrice)}
                  </div>

                  <div
                    className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg flex items-center gap-1 ${
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

                {/* Bengali Volume Inflow/Outflow Box */}
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
                  <span className="text-[10px] font-mono opacity-80">
                    {formatTurnover(coin.turnover24h)}
                  </span>
                </div>

                {/* Recommended Bot Mode Badge */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">বট মোড পরামর্শ:</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-black text-xs flex items-center gap-1 shadow-sm ${
                      botMode === 'LONG'
                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                        : botMode === 'SHORT'
                        ? 'bg-red-500 text-white shadow-red-500/20'
                        : 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                    }`}
                  >
                    {botMode === 'LONG' && '📈 LONG (লং মোড)'}
                    {botMode === 'SHORT' && '📉 SHORT (শর্ট মোড)'}
                    {botMode === 'NEUTRAL' && '🛡️ NEUTRAL (নিউট্রিয়াল)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Strategy tip box for meme coins */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
        <div className="font-extrabold text-amber-400 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>মীম কয়েন ট্রেডিং এক্সপার্ট টিপস:</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">
          • <strong>দিনে ভলিউম স্পাইক:</strong> যখন কোনো মীম কয়েনে <strong>🟢 ভলিউম প্রবেশ করছে</strong> এবং দাম +৪% এর উপরে থাকে, তখন <strong>LONG মোড</strong> দিলে দারুণ লাভ পাওয়া যায়।
          <br />• <strong>রেঞ্জ বাউন্ড ট্রেড:</strong> আর যদি দাম -৩% থেকে +৩% এর মধ্যে ওঠা-নামা করে, তবে <strong>🛡️ NEUTRAL মোড</strong> চালু করুন, কারণ ক্রিপ্টো গ্রিড বটে মীম কয়েন সবচেয়ে বেশি বাউন্স দেয়!
        </p>
      </div>
    </section>
  );
};
