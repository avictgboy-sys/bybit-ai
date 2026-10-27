import React, { useState, useMemo } from 'react';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Newspaper,
  Eye,
  SlidersHorizontal,
  Search,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Radio,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  MarketOpportunity,
  OpportunityCategory,
  OpportunityScannerService
} from '../../services/aiCouncilPro/opportunityScanner';
import { CanonicalPriceRecord } from '../../services/aiCouncilPro/centralPriceStore';
import { formatPrice } from '../../utils/formatters';

interface MarketOpportunitiesHubProps {
  assets: CanonicalPriceRecord[];
  selectedSymbol: string;
  onSelectAsset: (symbol: string) => void;
  onStartCouncilAnalysis?: (symbol: string) => void;
}

export const MarketOpportunitiesHub: React.FC<MarketOpportunitiesHubProps> = ({
  assets,
  selectedSymbol,
  onSelectAsset,
  onStartCouncilAnalysis,
}) => {
  const [activeCategory, setActiveCategory] = useState<OpportunityCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Scan opportunities in real-time from canonical prices
  const allOpportunities = useMemo(() => {
    return OpportunityScannerService.scanOpportunities(assets);
  }, [assets]);

  // Filter opportunities by Category and Search
  const filteredOpportunities = useMemo(() => {
    let list = [...allOpportunities];

    if (activeCategory !== 'ALL') {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim().replace(/USDT$/, '');
      list = list.filter(
        (item) =>
          item.symbol.toUpperCase().includes(q) ||
          item.baseCoin.toUpperCase().includes(q) ||
          (q === 'GOLD' && item.symbol.includes('XAU'))
      );
    }

    return list;
  }, [allOpportunities, activeCategory, searchQuery]);

  // Counts for Category Badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allOpportunities.length };
    allOpportunities.forEach((opp) => {
      counts[opp.category] = (counts[opp.category] || 0) + 1;
    });
    return counts;
  }, [allOpportunities]);

  const categoriesConfig: {
    id: OpportunityCategory | 'ALL';
    label: string;
    icon: React.ElementType;
    color: string;
    bgHover: string;
  }[] = [
    { id: 'ALL', label: 'সব অপরচুনিটি', icon: SlidersHorizontal, color: 'text-indigo-400', bgHover: 'hover:border-indigo-500/50' },
    { id: 'EARLY_MOMENTUM', label: '👀 আর্লি মোমেন্টাম', icon: Eye, color: 'text-orange-400', bgHover: 'hover:border-orange-500/50' },
    { id: 'VOLUME_SURGE', label: '🌊 ভলিউম সার্জ', icon: Activity, color: 'text-cyan-400', bgHover: 'hover:border-cyan-500/50' },
    { id: 'TOP_GAINER', label: '🔥 টপ গেইনার', icon: TrendingUp, color: 'text-emerald-400', bgHover: 'hover:border-emerald-500/50' },
    { id: 'TOP_LOSER', label: '📉 টপ লুজার / ডিপ বাই', icon: TrendingDown, color: 'text-rose-400', bgHover: 'hover:border-rose-500/50' },
    { id: 'HIGH_VOLATILITY', label: '⚡ হাই ভোলাটিলিটি', icon: Zap, color: 'text-amber-400', bgHover: 'hover:border-amber-500/50' },
    { id: 'NEWS_CATALYST', label: '📰 ম্যাক্রো ও ক্যাটালিস্ট', icon: Newspaper, color: 'text-purple-400', bgHover: 'hover:border-purple-500/50' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Category Bar & Real-time Scanner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                Today's Market Opportunities System
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                LIVE SCAN
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              রিয়েল-টাইম সেন্ট্রাল ডেটা থেকে সর্বোচ্চ সম্ভাবনাময় ট্রেড অপরচুনিটি স্বয়ংক্রিয়ভাবে শ্রেণিবদ্ধ
            </p>
          </div>
        </div>

        {/* Search within opportunities */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="কয়েন ফিল্টার করুন..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 placeholder-slate-500 font-medium focus:outline-none transition"
          />
        </div>
      </div>

      {/* 2. Horizontal Category Pills with Dynamic Counts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        {categoriesConfig.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/40 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Opportunity Cards Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs sm:text-sm">
          এই ক্যাটাগরিতে বর্তমানে কোনো সক্রিয় সুযোগ পাওয়া যায়নি। অন্য ক্যাটাগরি নির্বাচন করুন।
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOpportunities.slice(0, 15).map((opp) => {
            const isSelected = selectedSymbol === opp.symbol;
            const isPositive = opp.price24hPcnt >= 0;
            const changePcntStr = `${isPositive ? '+' : ''}${(opp.price24hPcnt * 100).toFixed(2)}%`;

            // Score Color Coding
            const scoreColor =
              opp.opportunityScore >= 85
                ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                : opp.opportunityScore >= 75
                ? 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30'
                : 'text-amber-400 bg-amber-500/15 border-amber-500/30';

            return (
              <div
                key={opp.id}
                onClick={() => {
                  onSelectAsset(opp.symbol);
                  if (onStartCouncilAnalysis) {
                    onStartCouncilAnalysis(opp.symbol);
                  }
                }}
                className={`p-4 sm:p-5 rounded-2xl bg-slate-900/95 border transition-all cursor-pointer relative flex flex-col justify-between group hover:shadow-2xl ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/25 shadow-indigo-500/15'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Header: Coin Info & Score */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-base text-slate-100 group-hover:text-indigo-400 transition-colors">
                          {opp.baseCoin}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          /{opp.quoteCoin}
                        </span>
                        {opp.assetClass === 'COMMODITY' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                            GOLD
                          </span>
                        )}
                        {opp.assetClass === 'FOREX' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                            FX
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>ভলিউম: ${((opp.turnover24h || 0) / 1000000).toFixed(1)}M</span>
                        <span>•</span>
                        <span>স্প্রেড: {opp.volatilityPcnt.toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Opportunity Score Pill */}
                    <div className="text-right">
                      <div
                        className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border flex items-center gap-1 ${scoreColor}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>{opp.opportunityScore}/100</span>
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        স্কোর
                      </span>
                    </div>
                  </div>

                  {/* Real-time Canonical Live Price & Change */}
                  <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold">
                        সেন্ট্রাল লাইভ প্রাইস
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-100 font-mono">
                        ${formatPrice(opp.price)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg inline-block ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {changePcntStr}
                      </span>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {opp.source === 'WEBSOCKET_LIVE'
                          ? '🟢 LIVE WS'
                          : opp.source === 'EXNESS_FEED'
                          ? '👑 EXNESS VIP'
                          : '🔵 REST'}
                      </div>
                    </div>
                  </div>

                  {/* Setup Pattern Identified */}
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      <span>সম্ভাব্য টেকনিক্যাল সেটআপ</span>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs font-semibold text-indigo-200 flex items-center justify-between">
                      <span>{opp.setupPattern}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                          opp.recommendedBias === 'STRONG_BUY'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : opp.recommendedBias === 'BUY'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {opp.recommendedBias}
                      </span>
                    </div>
                  </div>

                  {/* Algorithmic Reasons */}
                  <div className="space-y-1 text-[11px] text-slate-300">
                    {opp.reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 leading-tight">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Action Button to Trigger Council Analysis */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {isSelected ? '✓ সিলেক্টেড' : 'বিশ্লেষণ দেখতে ক্লিক করুন'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAsset(opp.symbol);
                      if (onStartCouncilAnalysis) {
                        onStartCouncilAnalysis(opp.symbol);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 flex items-center gap-1 transition"
                  >
                    <span>কাউন্সিল এনালাইসিস</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
