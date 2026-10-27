import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  BrainCircuit,
  Search,
  Users,
  Flame,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Newspaper,
  Sparkles,
  ShieldCheck,
  Scale,
  RefreshCw,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  SlidersHorizontal,
  Radio,
  Coins,
  Globe,
  BookOpen,
  Send
} from 'lucide-react';
import { TickerData } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { useAllCentralPrices, useCentralPrice } from '../../services/aiCouncilPro/useCentralPrice';
import { CanonicalPriceRecord } from '../../services/aiCouncilPro/centralPriceStore';
import { MarketOpportunitiesHub } from './MarketOpportunitiesHub';
import { NewsCatalystRadar } from './NewsCatalystRadar';
import { TradeStyleSelector } from './TradeStyleSelector';
import { TwelveCouncilInteractiveRoom } from './TwelveCouncilInteractiveRoom';
import { RiskManagerGuardShield } from './RiskManagerGuardShield';
import { TelegramAndJournalHub } from './TelegramAndJournalHub';
import { TradeStyleAnalyzerService, TradeStyleMode } from '../../services/aiCouncilPro/tradeStyleAnalyzer';

interface AiCouncilProTabProps {
  tickers: TickerData[];
  onSelectCoin?: (coin: TickerData) => void;
  currentUser?: any;
  onExecuteBybitTrade?: (target: any) => void;
  initialViewMode?: 'COUNCIL_ROOM' | 'OPPORTUNITIES' | 'NEWS_CATALYST' | 'TRADE_STYLE' | 'RISK_GUARD' | 'JOURNAL_TELEGRAM' | 'ALL_ASSETS';
  initialSymbol?: string;
}

export type OpportunityFilter =
  | 'ALL'
  | 'CRYPTO'
  | 'GOLD_FOREX'
  | 'GAINERS'
  | 'LOSERS'
  | 'VOLUME'
  | 'VOLATILITY'
  | 'MOMENTUM';

export const AiCouncilProTab: React.FC<AiCouncilProTabProps> = ({
  tickers,
  onSelectCoin,
  currentUser,
  onExecuteBybitTrade,
  initialViewMode,
  initialSymbol,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'COUNCIL_ROOM' | 'OPPORTUNITIES' | 'NEWS_CATALYST' | 'TRADE_STYLE' | 'RISK_GUARD' | 'JOURNAL_TELEGRAM' | 'ALL_ASSETS'>(
    initialViewMode || 'COUNCIL_ROOM'
  );
  const [tradeProfile, setTradeProfile] = useState(() => TradeStyleAnalyzerService.getUserProfile());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<OpportunityFilter>('ALL');
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>(initialSymbol || 'BTCUSDT');

  // Sync if initialViewMode or initialSymbol changes from parent
  useEffect(() => {
    if (initialViewMode) {
      setActiveViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  useEffect(() => {
    if (initialSymbol) {
      setSelectedAssetSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const handleSelectAsset = (sym: string) => {
    setSelectedAssetSymbol(sym);
    if (onSelectCoin) {
      const matched = tickers.find((t) => t.symbol === sym);
      if (matched) {
        onSelectCoin(matched);
      }
    }
  };

  // Universal Live Prices from Central Price Store (Single Source of Truth)
  const centralPrices = useAllCentralPrices();
  const selectedPriceRecord = useCentralPrice(selectedAssetSymbol);

  // Combine Central Price Store with Tickers into Universal Asset Records
  const universalAssets: CanonicalPriceRecord[] = useMemo(() => {
    // If central price store has records, use them as primary authoritative source
    if (centralPrices && centralPrices.length > 0) {
      return centralPrices;
    }

    // Fallback if central store is initializing
    return tickers.map((t) => ({
      symbol: t.symbol,
      baseCoin: t.baseCoin || t.symbol.replace(/USDT$/, ''),
      quoteCoin: t.quoteCoin || 'USDT',
      price: t.lastPrice,
      price24hPcnt: t.price24hPcnt || 0,
      highPrice24h: t.highPrice24h || t.lastPrice,
      lowPrice24h: t.lowPrice24h || t.lastPrice,
      volume24h: t.volume24h || 0,
      turnover24h: t.turnover24h || 0,
      source: 'REST_VERIFIED',
      assetClass: 'CRYPTO',
      lastUpdated: Date.now(),
      isStale: false,
      precision: t.lastPrice < 0.0001 ? 8 : t.lastPrice < 1 ? 4 : 2,
    }));
  }, [centralPrices, tickers]);

  // Filter and search universal assets
  const filteredAssets = useMemo(() => {
    let list = [...universalAssets];

    // Exclude stablecoin pegs in general view
    list = list.filter(
      (a) => !['USDCUSDT', 'BUSDUSDT', 'FDUSDUSDT', 'DAIUSDT', 'TUSDUSDT'].includes(a.symbol)
    );

    // Apply Search Query (supports BTC, XAU, GOLD, EUR, SOL, etc.)
    if (searchQuery.trim()) {
      const q = searchQuery.toUpperCase().trim().replace(/USDT$/, '');
      list = list.filter(
        (a) =>
          a.symbol.toUpperCase().includes(q) ||
          a.baseCoin.toUpperCase().includes(q) ||
          (q === 'GOLD' && a.symbol.includes('XAU')) ||
          (q === 'XAU' && a.symbol.includes('XAU'))
      );
    }

    // Apply Category & Opportunity Filter
    switch (activeFilter) {
      case 'CRYPTO':
        return list.filter((a) => a.assetClass === 'CRYPTO');
      case 'GOLD_FOREX':
        return list.filter((a) => a.assetClass === 'COMMODITY' || a.assetClass === 'FOREX');
      case 'GAINERS':
        return list.filter((a) => a.price24hPcnt > 0).sort((a, b) => b.price24hPcnt - a.price24hPcnt);
      case 'LOSERS':
        return list.filter((a) => a.price24hPcnt < 0).sort((a, b) => a.price24hPcnt - b.price24hPcnt);
      case 'VOLUME':
        return list.sort((a, b) => (b.turnover24h || 0) - (a.turnover24h || 0));
      case 'VOLATILITY':
        return list.sort((a, b) => {
          const spreadA = (a.highPrice24h - a.lowPrice24h) / Math.max(a.price, 0.0000001);
          const spreadB = (b.highPrice24h - b.lowPrice24h) / Math.max(b.price, 0.0000001);
          return spreadB - spreadA;
        });
      case 'MOMENTUM':
        return list
          .filter((a) => a.price24hPcnt >= 0.02 && a.price24hPcnt <= 0.15)
          .sort((a, b) => (b.turnover24h || 0) - (a.turnover24h || 0));
      case 'ALL':
      default:
        return list.sort((a, b) => (b.turnover24h || 0) - (a.turnover24h || 0));
    }
  }, [universalAssets, searchQuery, activeFilter]);

  const quickFilterButtons: { id: OpportunityFilter; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'ALL', label: 'সব অ্যাসেট', icon: SlidersHorizontal, color: 'text-indigo-400' },
    { id: 'CRYPTO', label: '🪙 ক্রিপ্টো মার্কেট', icon: Coins, color: 'text-cyan-400' },
    { id: 'GOLD_FOREX', label: '👑 স্বর্ণ ও ফরেক্স', icon: Globe, color: 'text-amber-400' },
    { id: 'GAINERS', label: '🔥 টপ গেইনার', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'LOSERS', label: '📉 টপ লুজার', icon: TrendingDown, color: 'text-rose-400' },
    { id: 'VOLUME', label: '🌊 ভলিউম সার্জ', icon: Activity, color: 'text-blue-400' },
    { id: 'VOLATILITY', label: '⚡ ভোলাটিলিটি', icon: Zap, color: 'text-yellow-400' },
    { id: 'MOMENTUM', label: '👀 আর্লি মোমেন্টাম', icon: Flame, color: 'text-orange-400' },
  ];

  // Helper for rendering price source badge
  const renderSourceBadge = (source: string, isStale: boolean) => {
    if (isStale) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <AlertCircle className="w-2.5 h-2.5" />
          <span>⚠️ Stale Cache</span>
        </span>
      );
    }
    if (source === 'WEBSOCKET_LIVE') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE WS (P1)</span>
        </span>
      );
    }
    if (source === 'EXNESS_FEED') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>EXNESS VIP</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
        <span>REST VERIFIED (P2)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Header Banner & System Status */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-purple-950/80 border border-indigo-500/30 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                <BrainCircuit className="w-4 h-4 animate-pulse" />
                <span>AI COUNCIL PRO</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ⭐ 12 Senior Institutional Traders
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🛡️ Master Decision Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                📡 Central Price Store (Active)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-100 tracking-tight">
              ১২ জন সিনিয়র এআই ট্রেডার কাউন্সিল ও সেন্ট্রাল প্রাইস হাব
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              সেন্ট্রাল প্রাইস স্টোর (Single Source of Truth) দ্বারা লাইভ কানেক্টেড। ড্যাশবোর্ড, কয়েন পেজ বা কাউন্সিল—যেকোনো স্ক্রিনে একই রিয়েল-টাইম লাইভ প্রাইস সিঙ্ক থাকে। লাইভ প্রাইসের প্রায়োরিটি সর্বদা সর্বোচ্চ।
            </p>
          </div>

          {/* Central Store Live Telemetry Box */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-left">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                <span>সেন্ট্রাল প্রাইস স্টোর</span>
              </div>
              <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                {universalAssets.length} টি অ্যাসেট সিঙ্কড
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase">প্রাইস প্রায়োরিটি ক্রম</div>
              <div className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                <span className="text-emerald-400">1.WS</span> &gt; <span className="text-cyan-400">2.REST</span> &gt; <span className="text-amber-400">3.Cache</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Rule Indicator */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>লাইভ ভেরিফায়েড প্রাইস সর্বদা সর্বোচ্চ প্রায়োরিটি (Live Price Supremacy)</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>কোনো হার্ডকোডেড লিমিট নেই—যেকোনো Bybit ও Exness অ্যাসেট ইউনিভার্সাল সাপোর্ট</span>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Council Room vs Market Opportunities vs News Catalyst vs Trade Style vs All Assets */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-1.5 rounded-2xl bg-slate-900 border border-slate-800 gap-1">
        <button
          type="button"
          onClick={() => setActiveViewMode('COUNCIL_ROOM')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'COUNCIL_ROOM'
              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>১২ সিনিয়র কাউন্সিল (Council Room)</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-indigo-400/20 text-indigo-300">
            {selectedAssetSymbol}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('OPPORTUNITIES')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'OPPORTUNITIES'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>ট্রেড অপরচুনিটি</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-amber-400/20 text-amber-300">
            AUTO
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('NEWS_CATALYST')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'NEWS_CATALYST'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Newspaper className="w-4 h-4 text-purple-400" />
          <span>নিউজ রাডার</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('TRADE_STYLE')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'TRADE_STYLE'
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>ট্রেড স্টাইল</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('RISK_GUARD')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'RISK_GUARD'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>রিস্ক গার্ড</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('JOURNAL_TELEGRAM')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'JOURNAL_TELEGRAM'
              ? 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>টেলিগ্রাম ও জার্নাল</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewMode('ALL_ASSETS')}
          className={`w-full sm:flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
            activeViewMode === 'ALL_ASSETS'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>প্রাইস ডিরেক্টরি</span>
        </button>
      </div>

      {/* View 0: Twelve Senior Council Room */}
      {activeViewMode === 'COUNCIL_ROOM' && (
        <TwelveCouncilInteractiveRoom
          asset={selectedPriceRecord || universalAssets.find((a) => a.symbol === selectedAssetSymbol) || universalAssets[0] || {
            symbol: 'BTCUSDT',
            baseCoin: 'BTC',
            quoteCoin: 'USDT',
            assetClass: 'CRYPTO',
            price: 90000,
            price24hPcnt: 0.02,
            highPrice24h: 91000,
            lowPrice24h: 89000,
            volume24h: 1000,
            turnover24h: 90000000,
            source: 'WEBSOCKET_LIVE',
            priority: 1,
            lastUpdatedMs: Date.now(),
            isStale: false,
          }}
          availableAssets={universalAssets}
          onSelectAsset={handleSelectAsset}
          activeTradeStyle={tradeProfile.activeStyle}
          onTradeStyleChange={(newStyle) => {
            setTradeProfile((prev) => ({ ...prev, activeStyle: newStyle }));
          }}
          onExecuteBybitTrade={onExecuteBybitTrade}
        />
      )}

      {/* View 1: Today's Market Opportunities System */}
      {activeViewMode === 'OPPORTUNITIES' && (
        <MarketOpportunitiesHub
          assets={universalAssets}
          selectedSymbol={selectedAssetSymbol}
          onSelectAsset={handleSelectAsset}
          onStartCouncilAnalysis={(sym) => {
            handleSelectAsset(sym);
            setActiveViewMode('COUNCIL_ROOM');
          }}
        />
      )}

      {/* View 2: News & Catalyst Scanner */}
      {activeViewMode === 'NEWS_CATALYST' && (
        <NewsCatalystRadar
          selectedSymbol={selectedAssetSymbol}
          onSelectCoinForCouncil={(sym) => {
            handleSelectAsset(sym);
            setActiveViewMode('COUNCIL_ROOM');
          }}
        />
      )}

      {/* View 3: Trade Style Analyzer */}
      {activeViewMode === 'TRADE_STYLE' && (
        <TradeStyleSelector
          onProfileChange={(newProf) => setTradeProfile(newProf)}
        />
      )}

      {/* View 4: Standalone Risk Manager Guard & Sizer */}
      {activeViewMode === 'RISK_GUARD' && (
        <RiskManagerGuardShield
          currentPrice={selectedPriceRecord?.price || 90000}
          assetSymbol={selectedAssetSymbol}
          isLong={true}
        />
      )}

      {/* View 5: Telegram Alert & Trade Journal Engine */}
      {activeViewMode === 'JOURNAL_TELEGRAM' && (
        <TelegramAndJournalHub
          onSelectCoinForCouncil={(symbol) => {
            handleSelectAsset(symbol);
            setActiveViewMode('COUNCIL_ROOM');
          }}
        />
      )}

      {/* View 2: Universal Central Price Store Directory */}
      {activeViewMode === 'ALL_ASSETS' && (
        <>
      {/* 2. Universal Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="যেকোনো কয়েন বা অ্যাসেট সার্চ করুন (যেমন: BTC, ETH, SOL, GOLD, XAU, EUR)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none text-slate-100 text-xs sm:text-sm placeholder-slate-500 font-medium transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Asset Class Filter Counts */}
          <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>মোট সক্রিয় অ্যাসেট: <strong className="text-slate-200 font-mono">{filteredAssets.length}</strong> টি</span>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          {quickFilterButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setActiveFilter(btn.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/40 scale-[1.02]'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : btn.color}`} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Universal Market Assets with Central Price Store Source */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-slate-100">
              সেন্ট্রাল প্রাইস স্টোর অ্যাসেট তালিকা (Single Source of Truth)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            প্রদর্শিত: {filteredAssets.length} টি
          </span>
        </div>

        {filteredAssets.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs sm:text-sm">
            কোনো অ্যাসেট পাওয়া যায়নি। অন্য কোনো নাম দিয়ে সার্চ করুন।
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredAssets.slice(0, 16).map((asset) => {
              const isSelected = selectedAssetSymbol === asset.symbol;
              const isPositive = asset.price24hPcnt >= 0;
              const changePcntStr = `${isPositive ? '+' : ''}${(asset.price24hPcnt * 100).toFixed(2)}%`;

              // Calculate temporary Opportunity Score (Price Momentum + Volume Activity + Volatility)
              const volScore = Math.min(30, Math.log10(Math.max(1, asset.turnover24h || 1000000)) * 3.5);
              const momScore = Math.min(40, Math.abs(asset.price24hPcnt) * 350);
              const baseScore = Math.min(96, Math.max(55, Math.round(volScore + momScore + 25)));

              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAssetSymbol(asset.symbol);
                    setActiveViewMode('COUNCIL_ROOM');
                  }}
                  className={`p-4 rounded-2xl bg-slate-900/90 border transition-all cursor-pointer group hover:shadow-xl relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header: Symbol & Price Source Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                            {asset.baseCoin}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            /{asset.quoteCoin}
                          </span>
                          {asset.assetClass === 'COMMODITY' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              GOLD
                            </span>
                          )}
                          {asset.assetClass === 'FOREX' && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold">
                              FX
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          ভলিউম: ${((asset.turnover24h || 0) / 1000000).toFixed(1)}M
                        </div>
                      </div>

                      {/* Authoritative Price Source Pill */}
                      <div>{renderSourceBadge(asset.source, asset.isStale)}</div>
                    </div>

                    {/* Central Verified Live Price */}
                    <div className="mt-3 flex items-baseline justify-between">
                      <div className="text-base sm:text-lg font-black text-slate-100 font-mono">
                        ${formatPrice(asset.price)}
                      </div>
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {changePcntStr}
                      </span>
                    </div>

                    {/* High/Low 24h spread */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>L: ${formatPrice(asset.lowPrice24h)}</span>
                      <span>H: ${formatPrice(asset.highPrice24h)}</span>
                    </div>
                  </div>

                  {/* Action Button & Council Consensus Ready */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-purple-400" />
                      <span>স্কোর: {baseScore}/100</span>
                    </span>
                    <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-0.5">
                      <span>কাউন্সিল এনালাইসিস</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {/* 4. Financial Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-900 text-center text-xs text-slate-500">
        AI Council Pro Central Price Store ensures price consensus across all views. Market movements are probabilistic. সর্বদাই নিজস্ব রিস্ক মেনে ট্রেড করুন।
      </div>
    </div>
  );
};
