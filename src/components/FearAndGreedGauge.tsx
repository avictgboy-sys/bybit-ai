import React from 'react';
import { Gauge, Info, Activity } from 'lucide-react';
import { FearAndGreedData } from '../types';

interface FearAndGreedGaugeProps {
  data: FearAndGreedData;
}

export const FearAndGreedGauge: React.FC<FearAndGreedGaugeProps> = ({ data }) => {
  const value = Math.min(100, Math.max(0, data.value));

  const getColor = (val: number) => {
    if (val <= 25) return { text: 'text-red-500', bg: 'bg-red-500', border: 'border-red-500/30', glow: 'shadow-red-500/20' };
    if (val <= 45) return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' };
    if (val <= 55) return { text: 'text-yellow-400', bg: 'bg-yellow-400', border: 'border-yellow-400/30', glow: 'shadow-yellow-400/20' };
    if (val <= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-400/30', glow: 'shadow-emerald-400/20' };
    return { text: 'text-green-400', bg: 'bg-green-400', border: 'border-green-400/30', glow: 'shadow-green-400/20' };
  };

  const theme = getColor(value);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800/80 text-amber-400 border border-slate-700/50">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Fear & Greed Index
            </h3>
            <p className="text-[11px] text-slate-500">Alternative.me Public Market Sentiment</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.text} ${theme.border} bg-slate-950/60`}
        >
          {data.classification}
        </span>
      </div>

      {/* Main Gauge Meter display */}
      <div className="my-2 flex items-baseline gap-3">
        <span className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
          {data.value}
        </span>
        <span className="text-xs text-slate-400">/ 100 Score</span>
      </div>

      {/* Visual Bar Indicator */}
      <div className="space-y-1.5 my-1">
        <div className="w-full h-3 rounded-full bg-slate-800 p-0.5 flex items-center relative">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${theme.bg}`}
            style={{ width: `${value}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-medium px-0.5">
          <span className="text-red-400 font-semibold">0 Extreme Fear</span>
          <span>50 Neutral</span>
          <span className="text-emerald-400 font-semibold">100 Extreme Greed</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
        <Info className="w-3 h-3 text-amber-400 inline mr-1 -mt-0.5" />
        {value <= 25
          ? 'Extreme fear can indicate capitulation and potential buying opportunity.'
          : value >= 75
          ? 'Extreme greed suggests over-extended market euphoria; exercise risk guard.'
          : 'Market sentiment is in balanced transition. Technical indicators drive setups.'}
      </p>
    </div>
  );
};
