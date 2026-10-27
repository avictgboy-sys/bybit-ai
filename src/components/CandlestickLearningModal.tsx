import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Sparkles,
  Info,
  X,
  Compass,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { CANDLESTICK_LIBRARY, CandlestickGuideItem } from '../utils/candlestickPatterns';
import { CandlestickVisual } from './CandlestickVisual';

interface CandlestickLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatternId?: string;
}

export const CandlestickLearningModal: React.FC<CandlestickLearningModalProps> = ({
  isOpen,
  onClose,
  initialPatternId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<CandlestickGuideItem>(() => {
    if (initialPatternId) {
      const found = CANDLESTICK_LIBRARY.find((p) => p.id === initialPatternId || initialPatternId.includes(p.id));
      if (found) return found;
    }
    return CANDLESTICK_LIBRARY[0];
  });

  if (!isOpen) return null;

  // Filter list
  const filteredPatterns = CANDLESTICK_LIBRARY.filter((item) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      item.category === selectedCategory ||
      (selectedCategory === 'BULLISH' && item.type === 'BULLISH') ||
      (selectedCategory === 'BEARISH' && item.type === 'BEARISH');

    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summaryBn.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-100">
                  🕯️ ক্যান্ডেলস্টিক প্যাটার্ন মাস্টারক্লাস ও ভিজ্যুয়াল একাডেমি
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {CANDLESTICK_LIBRARY.length}+ টি প্যাটার্ন
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                নতুন ও অভিজ্ঞ ট্রেডারদের জন্য প্রতিটি ক্যান্ডেলস্টিকের গ্রাফিক্যাল চিত্র, সাইকোলজি এবং এন্ট্রি-এক্সিট রুলস
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Candlestick Anatomy Banner (Visual Guide for Beginners) */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Bullish Candle Anatomy */}
            <div className="flex items-center gap-3 bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl w-full md:w-1/2">
              <div className="p-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                <CandlestickVisual type="BULLISH" size="md" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                  <span>🟢</span>
                  <span>সবুজ (Bullish) ক্যান্ডেল অ্যানাটমি</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  <strong>Close {'>'} Open</strong>: নিচে ওপেন হয়ে উপরে ক্লোজ করে।
                </p>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3">
                  <span>• উপরের উইক = High (সর্বোচ্চ)</span>
                  <span>• নিচের উইক = Low (সর্বনিম্ন)</span>
                </div>
              </div>
            </div>

            {/* Bearish Candle Anatomy */}
            <div className="flex items-center gap-3 bg-rose-950/20 border border-rose-500/30 p-2.5 rounded-xl w-full md:w-1/2">
              <div className="p-1 rounded-lg bg-rose-950/40 border border-rose-500/40">
                <CandlestickVisual type="BEARISH" size="md" />
              </div>
              <div className="space-y-0.5 text-xs">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                  <span>🔴</span>
                  <span>লাল (Bearish) ক্যান্ডেল অ্যানাটমি</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  <strong>Open {'>'} Close</strong>: উপরে ওপেন হয়ে নিচে ক্লোজ করে।
                </p>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3">
                  <span>• উপরের শ্যাডো = সেলার রিজেকশন</span>
                  <span>• নিচের শ্যাডো = বায়ার বাউন্স</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'সবগুলো' },
              { id: 'BOLLINGER_STRATEGY', label: '🎯 BB স্ট্র্যাটেজি' },
              { id: 'BULLISH', label: '🟢 বুলিশ রিভার্সাল' },
              { id: 'BEARISH', label: '🔴 বিয়ারিশ রিভার্সাল' },
              { id: 'INDECISION', label: '⚖️ দোজি / নিরপেক্ষ' },
              { id: 'CONTINUATION', label: '🚀 কন্টিনিউয়েশন' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="প্যাটার্ন খুঁজুন (যেমন: Hammer, Engulfing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Content Body (Split Layout: Master-Detail) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Pattern Cards Grid (5 cols on desktop) */}
          <div className="lg:col-span-5 p-3 space-y-2 border-r border-slate-800/80 overflow-y-auto max-h-[500px]">
            <span className="text-[11px] font-bold text-slate-400 px-1 block">
              শনাক্তযোগ্য ক্যান্ডেলস্টিক প্যাটার্ন তালিকা ({filteredPatterns.length}টি):
            </span>

            {filteredPatterns.map((item) => {
              const isSelected = activeItem.id === item.id;
              const isBull = item.type === 'BULLISH';
              const isBear = item.type === 'BEARISH';

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Graphical Candlestick Diagram beside name */}
                    <div
                      className={`p-1 rounded-lg border shrink-0 ${
                        isBull
                          ? 'bg-emerald-950/40 border-emerald-500/40'
                          : isBear
                          ? 'bg-rose-950/40 border-rose-500/40'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <CandlestickVisual
                        patternId={item.id}
                        name={item.name}
                        type={item.type}
                        size="xs"
                      />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-100 truncate">
                          {item.nameBn}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">
                        {item.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded uppercase block ${
                        isBull
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isBear
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.winRateStr}
                    </span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">
                      {item.reliability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Pattern Masterclass View (7 cols on desktop) */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-slate-950/40 space-y-4 overflow-y-auto max-h-[500px]">
            {activeItem && (
              <>
                {/* Header Card with Large Graphic */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${
                    activeItem.type === 'BULLISH'
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : activeItem.type === 'BEARISH'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-amber-950/20 border-amber-500/40'
                  }`}
                >
                  {/* Large Candlestick Visual */}
                  <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-center shrink-0">
                    <CandlestickVisual
                      patternId={activeItem.id}
                      name={activeItem.name}
                      type={activeItem.type}
                      size="lg"
                      showLabels={true}
                    />
                  </div>

                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-base sm:text-lg font-black text-slate-100">
                        {activeItem.nameBn}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          activeItem.type === 'BULLISH'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : activeItem.type === 'BEARISH'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {activeItem.type} SIGNAL
                      </span>
                    </div>

                    <p className="text-xs text-amber-300 font-mono font-bold">
                      {activeItem.name}
                    </p>

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {activeItem.summaryBn}
                    </p>

                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] font-mono">
                      <span className="text-slate-400">
                        উইন-রেট:{' '}
                        <strong className="text-emerald-400">{activeItem.winRateStr}</strong>
                      </span>
                      <span className="text-slate-400">
                        নির্ভরযোগ্যতা:{' '}
                        <strong className="text-amber-400">{activeItem.reliability}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Step Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Anatomy & Structure */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ক্যান্ডেলস্টিক গঠন ও অ্যানাটমি</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {activeItem.anatomyBn}
                    </p>
                  </div>

                  {/* Market Psychology */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Compass className="w-3.5 h-3.5" />
                      <span>মার্কেট সাইকোলজি (বায়ার বনাম সেলার)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {activeItem.psychologyBn}
                    </p>
                  </div>
                </div>

                {/* Actionable Rules (Entry, SL, TP) */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2.5">
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>ট্রেডিং নিয়ম (Entry, Stop Loss & Take Profit):</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        ১. এন্ট্রি নিয়ম (Entry)
                      </span>
                      <p className="text-[11px] text-slate-200">{activeItem.entryRuleBn}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-0.5">
                      <span className="text-[10px] font-bold text-rose-400 uppercase">
                        ২. স্টপ-লস (Stop Loss)
                      </span>
                      <p className="text-[11px] text-slate-200">{activeItem.stopLossRuleBn}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 space-y-0.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase">
                        ৩. টেক প্রফিট (Target)
                      </span>
                      <p className="text-[11px] text-slate-200">{activeItem.takeProfitRuleBn}</p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips Box */}
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-start gap-2.5 text-xs">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-300 block">প্রো-টিপ (Pro Tip):</span>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {activeItem.tipsBn}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>টিপ: লাইভ চার্টের পাশে এই ক্যান্ডেলগুলো পর্যবেক্ষণ করুন এবং হাই উইন-রেট কনফার্মেশন নিন।</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
