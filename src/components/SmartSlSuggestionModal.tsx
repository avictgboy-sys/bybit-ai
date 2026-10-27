import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  X,
  Copy,
  Check,
  Info,
  Layers,
  Activity,
  CandlestickChart,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { TickerData, KlinePoint } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  recalibrateSmartStopLoss,
  SmartSlRecalibrationResult,
} from '../utils/smartSlRecalibrator';

const EMPTY_KLINES: KlinePoint[] = [];

interface SmartSlSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: TickerData;
  currentSlPrice: number;
  direction?: 'LONG' | 'SHORT' | string;
  klines?: KlinePoint[];
  onApplySmartSl?: (newSlPrice: number, newSlPcnt: number) => void;
}

export const SmartSlSuggestionModal: React.FC<SmartSlSuggestionModalProps> = ({
  isOpen,
  onClose,
  coin,
  currentSlPrice,
  direction = 'LONG',
  klines = EMPTY_KLINES,
  onApplySmartSl,
}) => {
  const safeKlines = klines || EMPTY_KLINES;
  const [recalibration, setRecalibration] = useState<SmartSlRecalibrationResult>(() =>
    recalibrateSmartStopLoss(coin, currentSlPrice, direction, safeKlines)
  );
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [customSlPcnt, setCustomSlPcnt] = useState<number>(recalibration.recalibratedSlPcnt);

  const coinSymbol = coin?.symbol;
  const klinesCount = safeKlines.length;

  // Update on open or props change with stable primitive dependencies
  React.useEffect(() => {
    if (isOpen && coin) {
      const res = recalibrateSmartStopLoss(coin, currentSlPrice, direction, safeKlines);
      setRecalibration(res);
      setCustomSlPcnt(res.recalibratedSlPcnt);
      setApplied(false);
    }
  }, [isOpen, coinSymbol, currentSlPrice, direction, klinesCount]);

  if (!isOpen) return null;

  const currentPrice = coin.lastPrice > 0 ? coin.lastPrice : 1;
  const isShort = typeof direction === 'string' && (direction.toUpperCase().includes('SHORT') || direction.toUpperCase().includes('SELL'));

  // Calculate dynamic price from custom slider
  const liveAdjustedSlPrice = isShort
    ? currentPrice * (1 + customSlPcnt / 100)
    : currentPrice * (1 - customSlPcnt / 100);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplySmartSl) {
      onApplySmartSl(liveAdjustedSlPrice, customSlPcnt);
    }
    setApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const getNoiseBadge = (level: string) => {
    switch (level) {
      case 'EXTREME':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          label: 'চরম নয়েজ ও স্পাইক (Extreme Noise)',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          dot: 'bg-orange-500',
          label: 'উচ্চ নয়েজ লেভেল (High Noise)',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-500',
          label: 'মাঝারি নয়েজ (Moderate Noise)',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-500',
          label: 'স্বাভাবিক ও শান্ত (Low Noise)',
        };
    }
  };

  const noiseBadge = getNoiseBadge(recalibration.noiseLevel);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 space-y-4 my-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5">
                  <span>স্মার্ট এসএল ক্যালিব্রেশন (Smart SL Suggestion)</span>
                </h3>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {coin.baseCoin}/USDT
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {direction}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                ক্যান্ডেলস্টিক প্যাটার্ন স্ক্যানারের রিয়েল-টাইম উইক নয়েজ ও স্পাইক লেভেলের ভিত্তিতে স্বয়ংক্রিয় এসএল পুনর্নির্ধারণ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Noise Radar Summary Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${noiseBadge.dot}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${noiseBadge.dot}`}></span>
              </span>
              <span className="text-xs font-bold text-slate-300">
                ক্যান্ডেলস্টিক স্ক্যানার নয়েজ লেভেল:
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${noiseBadge.bg}`}>
                {noiseBadge.label}
              </span>
            </div>

            <div className="text-[11px] font-mono text-amber-400 font-bold">
              নয়েজ স্কোর: {recalibration.noiseScore} / ১০০
            </div>
          </div>

          {/* 3 Metric Mini Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">গড় উইক রেশিও</span>
              <strong className="text-slate-200 font-mono text-sm">{recalibration.avgWickRatioPcnt}%</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">সর্বোচ্চ উইক স্পাইক</span>
              <strong className="text-amber-300 font-mono text-sm">+{recalibration.maxRecentWickPcnt}%</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">প্রস্তাবিত নয়েজ বাফার</span>
              <strong className="text-emerald-400 font-mono text-sm">≥{customSlPcnt}%</strong>
            </div>
          </div>
        </div>

        {/* Before vs After Comparison Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3 shadow-inner">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              এসএল রিক্যালিব্রেশন তুলনা (Before vs After)
            </span>
            <span className="text-[10px] font-mono text-sky-400">
              Current: ${formatPrice(currentPrice)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Previous Default SL */}
            <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  আগের ডিফল্ট এসএল
                </span>
                <span className="text-rose-400 font-mono font-bold">(-{recalibration.originalSlPcnt}%)</span>
              </div>
              <div className="text-base font-black font-mono text-rose-300">
                ${formatPrice(recalibration.originalSlPrice)}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {recalibration.originalSlPcnt < 3.2 ? '⚠️ সাধারণ নয়েজে অকালে হিট করার ঝুঁকি বেশি' : 'মাঝারি এসএল রেঞ্জ'}
              </p>
            </div>

            {/* Smart Recalibrated SL */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/50 space-y-1 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center justify-between text-[11px] text-emerald-300">
                <span className="flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  স্মার্ট রিক্যালিব্রেটেড এসএল
                </span>
                <span className="text-emerald-400 font-mono font-extrabold">(-{customSlPcnt}%)</span>
              </div>
              <div className="text-base font-black font-mono text-emerald-300 flex items-center justify-between">
                <span>${formatPrice(liveAdjustedSlPrice)}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(liveAdjustedSlPrice.toFixed(4))}
                  className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
                  title="Copy SL Price"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-emerald-400/90 leading-tight font-medium">
                ✅ ক্যান্ডেলস্টিক নয়েজ ও সাপোর্ট উইকের নিচে সম্পূর্ণ সুরক্ষিত
              </p>
            </div>
          </div>

          {/* Bengali Diagnostic Explanation */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
            <p className="font-medium">
              💡 <strong>ক্যালিব্রেশন কারণ:</strong> {recalibration.reasonBn}
            </p>
            {recalibration.primaryPatternNameBn && (
              <p className="text-[11px] text-amber-300 mt-1 font-mono">
                🕯️ সনাক্তকৃত প্যাটার্ন: {recalibration.primaryPatternNameBn}
              </p>
            )}
          </div>
        </div>

        {/* Interactive Slider to Fine-Tune Buffer */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              কাস্টম এসএল দূরত্ব অ্যাডজাস্টার (Fine-Tune Buffer)
            </span>
            <span className="text-amber-400 font-mono font-bold text-sm">
              -{customSlPcnt}% (${formatPrice(liveAdjustedSlPrice)})
            </span>
          </div>

          <input
            type="range"
            min="2.5"
            max="8.0"
            step="0.1"
            value={customSlPcnt}
            onChange={(e) => setCustomSlPcnt(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>২.৫% (টাইট)</span>
            <span className="text-amber-400 font-bold">৪.৫% (প্রস্তাবিত অপ্টিমাল)</span>
            <span>৮.০% (ওয়াইড বাফার)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>স্মার্ট এসএল প্রয়োগ করলে সিগন্যাল ডিসপ্লেতে নতুন এসএল মান সক্রিয় হবে।</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={applied}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                applied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                  সফলভাবে ক্যালিব্রেট করা হয়েছে!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  স্মার্ট এসএল প্রয়োগ করুন (-{customSlPcnt}%)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SmartSlSuggestionButton: React.FC<{
  onClick: () => void;
  noiseLevel?: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  className?: string;
  compact?: boolean;
}> = ({ onClick, noiseLevel, className = '', compact = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-600/25 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold font-sans shadow-sm shadow-amber-950/40 transition-all cursor-pointer ${className}`}
      title="স্মার্ট এসএল ক্যালিব্রেশন: ক্যান্ডেলস্টিক প্যাটার্ন স্ক্যানারের মার্কেট নয়েজের প্রেক্ষিতে স্বয়ংক্রিয় এসএল পুনর্নির্ধারণ"
    >
      <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform animate-pulse" />
      <span>{compact ? 'Smart SL' : 'Smart SL Suggestion'}</span>
      {noiseLevel && (
        <span
          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full font-mono ${
            noiseLevel === 'HIGH' || noiseLevel === 'EXTREME'
              ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
              : 'bg-amber-500/30 text-amber-200 border border-amber-500/40'
          }`}
        >
          {noiseLevel}
        </span>
      )}
    </button>
  );
};

