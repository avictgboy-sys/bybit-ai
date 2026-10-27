import React from 'react';
import {
  BrainCircuit,
  Users,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Zap,
  Activity,
  Award,
  Radio,
  Newspaper,
  Target
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice } from '../utils/formatters';

interface AiCouncilProDashboardBannerProps {
  onOpenCouncilPro: (initialView?: 'COUNCIL_ROOM' | 'OPPORTUNITIES' | 'NEWS_CATALYST' | 'TRADE_STYLE' | 'RISK_GUARD' | 'JOURNAL_TELEGRAM' | 'ALL_ASSETS') => void;
  tickers: TickerData[];
}

export const AiCouncilProDashboardBanner: React.FC<AiCouncilProDashboardBannerProps> = ({
  onOpenCouncilPro,
  tickers,
}) => {
  const btcTicker = tickers.find((t) => t.symbol === 'BTCUSDT');
  const ethTicker = tickers.find((t) => t.symbol === 'ETHUSDT');
  const solTicker = tickers.find((t) => t.symbol === 'SOLUSDT');

  const btcPcnt = btcTicker ? btcTicker.price24hPcnt * 100 : 2.45;
  const ethPcnt = ethTicker ? ethTicker.price24hPcnt * 100 : 3.12;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-indigo-950/70 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
      {/* Background glowing ambient light */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4 sm:space-y-5">
        {/* Header Badges & Title */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25 shrink-0 animate-pulse">
              <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  INSTITUTIONAL AI TRADING
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  👑 VIP PRO
                </span>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-ping" />
                  লাইভ ১২ জন ট্রেডার কনসেনসাস
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-100 tracking-tight mt-1 flex items-center gap-2">
                🧠 AI COUNCIL PRO
                <span className="text-xs sm:text-sm font-semibold text-purple-300">
                  (১২ প্রাতিষ্ঠানিক এআই কাউন্সেলর ও মাস্টার ডিসিশন রুম)
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenCouncilPro('COUNCIL_ROOM')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-purple-600/30 active:scale-95 group self-start lg:self-auto"
          >
            <span>🏛️ কাউন্সিল রুমে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3 Quick Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card 1: 12 Institutional Members Consensus */}
          <div
            onClick={() => onOpenCouncilPro('COUNCIL_ROOM')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-purple-500/30 hover:border-purple-500/60 space-y-2 cursor-pointer transition shadow-lg group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300 font-bold flex items-center gap-1.5 group-hover:text-purple-200">
                <Users className="w-4 h-4 text-purple-400" />
                ১২ জন সিনিয়র কাউন্সেলর
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-400">
                ১০/১২ বুলিশ ভোট
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wyckoff ভলিউম, Williams মোমেন্টাম, Taleb রিস্ক গার্ড, Gann সাইকেল ও Dalio ম্যাক্রো একত্রে এনালাইসিস করে চূড়ান্ত ডিসিশন প্রদান করে।
            </p>
          </div>

          {/* Card 2: Live Market Opportunities */}
          <div
            onClick={() => onOpenCouncilPro('OPPORTUNITIES')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 space-y-2 cursor-pointer transition shadow-lg group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-300 font-bold flex items-center gap-1.5 group-hover:text-indigo-200">
                <Target className="w-4 h-4 text-indigo-400" />
                মার্কেট অপরচুনিটিজ স্ক্যানার
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-400">
                ক্রিপ্টো + গোল্ড (XAUUSD)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200">
                BTC: <strong className={btcPcnt >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{btcPcnt >= 0 ? '+' : ''}{btcPcnt.toFixed(1)}%</strong>
              </div>
              <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-200">
                ETH: <strong className={ethPcnt >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{ethPcnt >= 0 ? '+' : ''}{ethPcnt.toFixed(1)}%</strong>
              </div>
              <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-amber-300">
                GOLD: STRONG BUY
              </div>
            </div>
          </div>

          {/* Card 3: Risk Guard & Bybit 1-Click Bot */}
          <div
            onClick={() => onOpenCouncilPro('RISK_GUARD')}
            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 space-y-2 cursor-pointer transition shadow-lg group"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5 group-hover:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                শিল্ড ও বাইবিট ১-ক্লিক ট্রেড
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                1:2.5+ R:R
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              স্বয়ংক্রিয় স্টপ-লস বাফার (Scalp, Swing, Intraday) এবং কাউন্সিলের সিগন্যালে সরাসরি বাইবিট V5 দিয়ে অটোমেটেড পজিশন এক্সিকিউট করুন।
            </p>
          </div>
        </div>

        {/* Quick Feature Badges & Direct Jump */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 flex-wrap text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400">কাউন্সিল মডিউল:</span>
            <button
              type="button"
              onClick={() => onOpenCouncilPro('COUNCIL_ROOM')}
              className="px-2 py-0.5 rounded-md bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[11px] font-bold transition"
            >
              🏛️ ১২ মেম্বার ভোট রুম
            </button>
            <button
              type="button"
              onClick={() => onOpenCouncilPro('OPPORTUNITIES')}
              className="px-2 py-0.5 rounded-md bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold transition"
            >
              🎯 অপরচুনিটিজ রাডার
            </button>
            <button
              type="button"
              onClick={() => onOpenCouncilPro('RISK_GUARD')}
              className="px-2 py-0.5 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition"
            >
              🛡️ রিস্ক গার্ড শিল্ড
            </button>
            <button
              type="button"
              onClick={() => onOpenCouncilPro('NEWS_CATALYST')}
              className="px-2 py-0.5 rounded-md bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/30 text-sky-300 text-[11px] font-bold transition"
            >
              📰 নিউজ ক্যাটালিস্ট
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenCouncilPro('COUNCIL_ROOM')}
            className="text-purple-300 hover:text-purple-200 font-bold flex items-center gap-1 text-xs transition underline underline-offset-4"
          >
            AI Council Pro এক্সপ্লোর করুন &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};
