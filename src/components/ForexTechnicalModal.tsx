import React from 'react';
import { Compass, X } from 'lucide-react';
import { TechnicalAnalysisTab } from './TechnicalAnalysisTab';
import { buildForexTechnicalData } from './ForexTechnicalAnalysisSection';
import { ExnessSignal } from '../services/exnessSignalService';
import { LiveMarketTick } from '../services/exnessLivePriceFeed';

interface ForexTechnicalModalProps {
  signal: ExnessSignal | null;
  isOpen: boolean;
  onClose: () => void;
  liveTick?: LiveMarketTick;
}

export const ForexTechnicalModal: React.FC<ForexTechnicalModalProps> = ({
  signal,
  isOpen,
  onClose,
  liveTick,
}) => {
  if (!isOpen || !signal) return null;

  const { indicators, currentPrice, coin } = React.useMemo(
    () => buildForexTechnicalData(signal.symbol, liveTick, signal),
    [signal.symbol, liveTick?.price, signal.id]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-gradient-to-br from-slate-900 via-slate-900/98 to-slate-950 border border-emerald-500/40 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-100 font-mono">
                  {signal.symbol} টেকনিক্যাল অ্যানালাইসিস সেটআপ
                </h3>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${
                    signal.type.includes('BUY')
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {signal.type.replace('_', ' ')}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {signal.timeframe}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                EMA 50/100/200, Signal Strength, 9-Factor Confluence, RSI, MACD, Bollinger Bands & Pivots
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar">
          <TechnicalAnalysisTab
            indicators={indicators}
            currentPrice={currentPrice}
            coin={coin}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            লাইভ প্রাইস: <strong className="text-slate-100">{currentPrice}</strong> | এন্ট্রি: <strong className="text-amber-400">{signal.entryZone[0]} - {signal.entryZone[1]}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
