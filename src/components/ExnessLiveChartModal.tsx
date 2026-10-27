import React, { useState } from 'react';
import { X, Maximize2, ExternalLink, Activity, ShieldCheck, Flame } from 'lucide-react';
import { ExnessSignal } from '../services/exnessSignalService';
import { LiveMarketTick } from '../services/exnessLivePriceFeed';
import { TradingViewLiveStation } from './TradingViewLiveStation';

interface ExnessLiveChartModalProps {
  signal: ExnessSignal | null;
  isOpen: boolean;
  onClose: () => void;
  liveTick?: LiveMarketTick;
}

export const ExnessLiveChartModal: React.FC<ExnessLiveChartModalProps> = ({
  signal,
  isOpen,
  onClose,
  liveTick,
}) => {
  const [timeframe, setTimeframe] = useState<'5' | '15' | '60' | '240' | 'D'>('15');

  if (!isOpen || !signal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Close Button Header */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <span className="text-amber-400 font-bold">{signal.symbol}</span>
            <span>- TradingView লাইভ চার্ট ও টার্গেট মনিটর</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Station */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-1">
          <TradingViewLiveStation
            activeSymbol={signal.symbol}
            signal={signal}
            liveTick={liveTick}
            timeframe={timeframe}
            onSelectTimeframe={setTimeframe}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};
