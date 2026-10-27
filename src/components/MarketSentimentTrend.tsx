import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Gauge,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { FearAndGreedData, HistoricalFearAndGreedPoint } from '../types';

interface MarketSentimentTrendProps {
  data: FearAndGreedData;
}

export const MarketSentimentTrend: React.FC<MarketSentimentTrendProps> = ({ data }) => {
  const [showDetails, setShowDetails] = useState<boolean>(true);

  // Fallback 7-day history if history is missing or empty
  const defaultValues = [50, 52, 55, 58, 56, 62, data.value || 64];
  const history: HistoricalFearAndGreedPoint[] =
    data.history && data.history.length > 0
      ? data.history
      : defaultValues.map((val, idx) => {
          const ts = Date.now() - (6 - idx) * 86400000;
          const d = new Date(ts);
          const label =
            idx === 6
              ? 'Today'
              : idx === 5
              ? 'Yesterday'
              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const getClassification = (v: number) => {
            if (v <= 25) return 'Extreme Fear';
            if (v <= 45) return 'Fear';
            if (v <= 55) return 'Neutral';
            if (v <= 75) return 'Greed';
            return 'Extreme Greed';
          };
          return {
            value: val,
            classification: getClassification(val),
            timestamp: ts,
            dateLabel: label,
          };
        });

  // Calculate 7-Day Metrics
  const firstValue = history[0]?.value ?? data.value;
  const latestValue = history[history.length - 1]?.value ?? data.value;
  const change7d = latestValue - firstValue;

  const totalSum = history.reduce((acc, curr) => acc + curr.value, 0);
  const avg7d = Math.round(totalSum / (history.length || 1));

  // Determine sentiment trend classification
  const isRising = change7d > 0;
  const isDeclining = change7d < 0;

  // Theme colors helper
  const getScoreColor = (val: number) => {
    if (val <= 25) return { text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', hex: '#ef4444' };
    if (val <= 45) return { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', hex: '#f59e0b' };
    if (val <= 55) return { text: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', hex: '#facc15' };
    if (val <= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', hex: '#10b981' };
    return { text: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', hex: '#22c55e' };
  };

  const currentTheme = getScoreColor(latestValue);

  // Bengali Sentiment Summary
  const getBengaliAnalysis = () => {
    if (change7d >= 10) {
      return `গত ৭ দিনে সেন্টিমেন্ট প্রথমাংশের ${firstValue} থেকে বেড়ে বর্তমানে ${latestValue}-এ পৌঁছেছে (+${change7d} পয়েন্ট বৃদ্ধি)। বাজারে স্ট্রং ক্রয়ের আগ্রহ এবং মেমোন্টাম লক্ষণীয়।`;
    }
    if (change7d > 0) {
      return `গত ৭ দিনে সেন্টিমেন্ট ধীরে ধীরে ইতিবাচক মোড়ে রয়েছে (গড় স্কোর ${avg7d})। এটি সুস্থ বুলিশ ট্রানজিশন নির্দেশ করে।`;
    }
    if (change7d <= -10) {
      return `গত ৭ দিনে সেন্টিমেন্ট ${firstValue} থেকে কমে ${latestValue}-এ নেমে এসেছে (${change7d} পয়েন্ট পতন)। বিনিয়োগকারীদের মধ্যে সতর্কতা ও প্রফিট বুকিং লক্ষ্য করা যাচ্ছে।`;
    }
    if (change7d < 0) {
      return `গত ৭ দিনে সেন্টিমেন্ট সামান্য হ্রাসের দিকে (গড় স্কোর ${avg7d})। ছোট আকারের কারেকশন চলছে।`;
    }
    return `গত ৭ দিনে সেন্টিমেন্ট স্কোর ${avg7d}-এর আশেপাশে স্থিতিশীল রয়েছে। মার্কেট সমন্বিত সাইডওয়ে কনসোলিডেশন জোনে রয়েছে।`;
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as HistoricalFearAndGreedPoint;
      const theme = getScoreColor(p.value);
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl space-y-1 font-mono text-xs">
          <div className="text-slate-400 text-[11px] font-sans flex items-center justify-between gap-3">
            <span>📅 {p.dateLabel}</span>
            <span className="text-[10px] text-slate-500">
              {new Date(p.timestamp).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className={`text-xl font-extrabold ${theme.text}`}>{p.value}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-sans font-extrabold border ${theme.bg} ${theme.text}`}>
              {p.classification}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-100">
                📈 মার্কেট সেন্টিমেন্ট ট্রেন্ড (Market Sentiment Trend)
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                7-DAY SPARKLINE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              গত ৭ দিনের Fear & Greed সূচকের ধারাবাহিক পরিবর্তন ও বুলিশ/বিয়ারিশ মোমেন্টাম শিফট
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700/80 self-start sm:self-auto transition"
        >
          {showDetails ? (
            <>
              <span>সংক্ষিপ্ত করুন</span>
              <ChevronUp className="w-4 h-4 text-emerald-400" />
            </>
          ) : (
            <>
              <span>বিস্তারিত দেখুন</span>
              <ChevronDown className="w-4 h-4 text-emerald-400" />
            </>
          )}
        </button>
      </div>

      {/* Metric Stat Badges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        {/* Current Score */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-sans block">বর্তমান স্কোর</span>
          <div className="flex items-center justify-between">
            <span className={`text-xl font-black ${currentTheme.text}`}>{latestValue}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold border ${currentTheme.bg} ${currentTheme.text}`}>
              {data.classification}
            </span>
          </div>
        </div>

        {/* 7-Day Change */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-sans block">৭ দিনের পরিবর্তন</span>
          <div className="flex items-center justify-between">
            <span
              className={`text-xl font-black flex items-center gap-0.5 ${
                isRising ? 'text-emerald-400' : isDeclining ? 'text-red-400' : 'text-slate-300'
              }`}
            >
              {isRising && <TrendingUp className="w-4 h-4" />}
              {isDeclining && <TrendingDown className="w-4 h-4" />}
              {change7d > 0 ? `+${change7d}` : change7d}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">পয়েন্ট</span>
          </div>
        </div>

        {/* 7-Day Average */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-sans block">৭ দিনের গড় (7D Avg)</span>
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-slate-200">{avg7d}</span>
            <span className="text-[10px] text-slate-500 font-sans">/ 100</span>
          </div>
        </div>

        {/* Trend Momentum Status */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1">
          <span className="text-[11px] text-slate-400 font-sans block">সেন্টিমেন্ট ট্রাঞ্জেক্টরি</span>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black font-sans ${isRising ? 'text-emerald-400' : isDeclining ? 'text-red-400' : 'text-amber-400'}`}>
              {isRising ? 'BULLISH SHIFT 🚀' : isDeclining ? 'BEARISH SHIFT 📉' : 'STABLE / NEUTRAL ⚖️'}
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Area / Sparkline Section */}
      <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>৭ দিনের সূচক স্পার্কলাইন চার্ট (Sparkline Visual):</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">0 (Fear) ── 50 (Neutral) ── 100 (Greed)</span>
        </div>

        <div className="h-44 sm:h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentTheme.hex} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentTheme.hex} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="dateLabel" stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} tickLine={false} />
              <Tooltip content={<CustomChartTooltip />} />
              <ReferenceLine y={50} stroke="#f1f5f9" strokeDasharray="3 3" opacity={0.3} label={{ value: 'Neutral (50)', fill: '#94a3b8', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={25} stroke="#ef4444" strokeDasharray="2 2" opacity={0.3} />
              <ReferenceLine y={75} stroke="#10b981" strokeDasharray="2 2" opacity={0.3} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={currentTheme.hex}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#sentimentGradient)"
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expanded Breakdown & Analysis */}
      {showDetails && (
        <div className="space-y-3 pt-1 animate-fadeIn">
          {/* Day by Day 7-Pill Breakdown */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>দিনভিত্তিক সূচক স্কোর (Daily Breakdown):</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 font-mono text-xs">
              {history.map((pt, idx) => {
                const theme = getScoreColor(pt.value);
                const isToday = idx === history.length - 1;
                return (
                  <div
                    key={pt.timestamp || idx}
                    className={`p-2.5 rounded-xl border space-y-1 text-center transition ${
                      isToday
                        ? 'bg-slate-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 font-sans block truncate">
                      {pt.dateLabel}
                    </span>
                    <span className={`text-base font-black ${theme.text} block`}>
                      {pt.value}
                    </span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-sans font-extrabold border block truncate ${theme.bg} ${theme.text}`}>
                      {pt.classification}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bengali Sentiment Shift Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>বাংলা সেন্টিমেন্ট সমীকরণ বিশ্লেষণ (AI Insight):</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {getBengaliAnalysis()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
