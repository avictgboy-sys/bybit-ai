import React, { useState, useMemo } from 'react';
import {
  Newspaper,
  Flame,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
  Radio,
  Zap,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import {
  NewsCatalystItem,
  NewsCatalystScannerService,
  CatalystImpact,
  CatalystSentiment
} from '../../services/aiCouncilPro/newsCatalystScanner';

interface NewsCatalystRadarProps {
  selectedSymbol?: string;
  onSelectCoinForCouncil?: (symbol: string) => void;
}

export const NewsCatalystRadar: React.FC<NewsCatalystRadarProps> = ({
  selectedSymbol,
  onSelectCoinForCouncil,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CRITICAL' | 'BULLISH' | 'BEARISH' | 'MACRO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allCatalysts = useMemo(() => {
    return NewsCatalystScannerService.getAllCatalysts();
  }, []);

  // Filter catalysts
  const filteredCatalysts = useMemo(() => {
    let list = [...allCatalysts];

    if (filterType === 'CRITICAL') {
      list = list.filter((c) => c.impact === 'CRITICAL' || c.impact === 'HIGH');
    } else if (filterType === 'BULLISH') {
      list = list.filter((c) => c.sentiment === 'ULTRA_BULLISH' || c.sentiment === 'BULLISH');
    } else if (filterType === 'BEARISH') {
      list = list.filter((c) => c.sentiment === 'BEARISH' || c.sentiment === 'HIGH_RISK_DUMP');
    } else if (filterType === 'MACRO') {
      list = list.filter((c) => c.category === 'MACRO_ECONOMY' || c.category === 'ETF_FLOW' || c.category === 'GEOPOLITICAL_GOLD');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim();
      list = list.filter(
        (c) =>
          c.title.toUpperCase().includes(q) ||
          c.titleBn.toUpperCase().includes(q) ||
          c.symbol.toUpperCase().includes(q) ||
          (c.affectedSymbols && c.affectedSymbols.some((s) => s.toUpperCase().includes(q)))
      );
    }

    return list;
  }, [allCatalysts, filterType, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 1. News & Catalyst Radar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                News & Catalyst Scanner (ম্যাক্রো ও ব্রেকিং ক্যাটালিস্ট)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                LIVE FEED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              হাই ইমপ্যাক্ট অর্থনৈতিক ইভেন্ট, ইটিএফ ইনফ্লো, টোকেন আনলক এবং রিয়েল-টাইম মার্কেট সেন্টিমেন্ট ফিল্টার
            </p>
          </div>
        </div>

        {/* Search within News */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নিউজ বা কয়েন সার্চ করুন..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-slate-100 placeholder-slate-500 font-medium focus:outline-none transition"
          />
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {[
          { id: 'ALL', label: 'সব ক্যাটালিস্ট', count: allCatalysts.length },
          { id: 'CRITICAL', label: '🚨 হাই ও ক্রিটিক্যাল ইমপ্যাক্ট', count: allCatalysts.filter((c) => c.impact === 'CRITICAL' || c.impact === 'HIGH').length },
          { id: 'BULLISH', label: '🟢 বুলিশ ইভেন্টস', count: allCatalysts.filter((c) => c.sentiment === 'BULLISH' || c.sentiment === 'ULTRA_BULLISH').length },
          { id: 'BEARISH', label: '🔴 বিয়ারিশ অ্যালার্ট', count: allCatalysts.filter((c) => c.sentiment === 'BEARISH' || c.sentiment === 'HIGH_RISK_DUMP').length },
          { id: 'MACRO', label: '🏦 ইটিএফ ও গোল্ড ম্যাক্রো', count: allCatalysts.filter((c) => c.category === 'MACRO_ECONOMY' || c.category === 'ETF_FLOW' || c.category === 'GEOPOLITICAL_GOLD').length },
        ].map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 border border-purple-400/40 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Catalyst Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatalysts.map((cat) => {
          const isBullish = cat.sentiment === 'ULTRA_BULLISH' || cat.sentiment === 'BULLISH';
          const isCritical = cat.impact === 'CRITICAL';

          return (
            <div
              key={cat.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-lg space-y-3"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md font-bold bg-slate-800 text-slate-300 font-mono">
                      {cat.categoryLabelBn}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{cat.publishedTime}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Impact Level */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {cat.impact} IMPACT
                    </span>

                    {/* Sentiment */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${
                        isBullish
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {cat.sentiment.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Bengali Headline */}
                <h4 className="text-sm sm:text-base font-black text-slate-100 group-hover:text-purple-300 transition-colors leading-snug">
                  {cat.titleBn}
                </h4>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cat.summaryBn}
                </p>

                {/* Actionable Trading Directive */}
                <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/25 space-y-1">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-400" />
                    <span>ট্রেডিং নির্দেশনা (Actionable Directive)</span>
                  </div>
                  <div className="text-xs font-semibold text-purple-200">
                    {cat.tradingDirectiveBn}
                  </div>
                </div>

                {/* Affected Symbols Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">সম্পর্কিত কয়েন:</span>
                  {cat.affectedSymbols.map((sym) => (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => onSelectCoinForCouncil && onSelectCoinForCouncil(sym)}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 font-mono text-[10px] font-bold transition"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Bottom Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  উৎস: {cat.source}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCoinForCouncil) {
                      onSelectCoinForCouncil(cat.affectedSymbols[0] || cat.symbol);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-600/20 flex items-center gap-1 transition"
                >
                  <span>কাউন্সিল অ্যানালাইসিস</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
