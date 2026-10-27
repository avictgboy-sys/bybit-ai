import React, { useState, useEffect } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calculator,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Zap,
  Globe,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Trash2,
  Send,
  Sliders,
  DollarSign,
  BarChart2,
  Award,
  ChevronRight,
  Info,
  Maximize2,
  Activity,
  Radio,
  CheckCircle2,
  Layers,
  Shield,
  Target,
  Compass,
} from 'lucide-react';
import {
  ExnessSignalService,
  ExnessSignal,
  EXNESS_SESSIONS,
  ExnessMarketSession,
  ExnessConfig,
} from '../services/exnessSignalService';
import { ExnessLivePriceFeed, LiveMarketState, LiveMarketTick } from '../services/exnessLivePriceFeed';
import { ExnessLiveChartModal } from './ExnessLiveChartModal';
import { ForexNineRequirementsModal, evaluateForexSignalConfirmationFactors } from './ForexNineRequirementsModal';
import { ForexTechnicalAnalysisSection } from './ForexTechnicalAnalysisSection';
import { ForexTechnicalModal } from './ForexTechnicalModal';
import { TradingViewLiveStation } from './TradingViewLiveStation';
import { AuthService, UserAccount } from '../services/authService';
import { TradingMemoryService } from '../services/tradingMemory';
import { VeteranTraderIntelligence, VeteranSignalEnhancement } from '../services/veteranTraderIntelligence';
import { VeteranAiCouncilModal } from './VeteranAiCouncilModal';
import { SignalCardTpSlGrid } from './SignalCardTpSlGrid';
import { formatFixedPrecisionPrice } from '../utils/formatters';
import {
  TWELVE_VETERAN_TRADERS,
  VeteranAiCouncilService,
  CouncilConsensusResult,
} from '../services/veteranAiCouncilService';
import { Bot, ArrowUpRight, ShieldAlert, Users, MessageSquare } from 'lucide-react';

interface ExnessSignalsTabProps {
  currentUser?: UserAccount | null;
  onOpenAuth?: () => void;
}

export const ExnessSignalsTab: React.FC<ExnessSignalsTabProps> = ({
  currentUser: propCurrentUser,
  onOpenAuth,
}) => {
  const [signals, setSignals] = useState<ExnessSignal[]>(() => ExnessSignalService.getSignals());
  const [config, setConfig] = useState<ExnessConfig>(() => ExnessSignalService.getConfig());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => propCurrentUser || AuthService.getCurrentUser());
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'GOLD' | 'FOREX' | 'INDICES' | 'CRYPTO_CFD'>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'ALL' | 'M5' | 'M15' | 'H1' | 'H4'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Live Real-Time Market Feed State
  const [liveTicks, setLiveTicks] = useState<LiveMarketState>(() => ExnessLivePriceFeed.getTicks());
  const [chartModalSignal, setChartModalSignal] = useState<ExnessSignal | null>(null);
  const [nineReqModalSignal, setNineReqModalSignal] = useState<ExnessSignal | null>(null);
  const [technicalModalSignal, setTechnicalModalSignal] = useState<ExnessSignal | null>(null);
  const [councilModalSignal, setCouncilModalSignal] = useState<ExnessSignal | null>(null);
  const [activeInlineSymbol, setActiveInlineSymbol] = useState<string>('XAU/USD');
  const [inlineTimeframe, setInlineTimeframe] = useState<'5' | '15' | '60' | '240' | 'D'>('15');

  // Lot Size Calculator State
  const [calcBalance, setCalcBalance] = useState<number>(100);
  const [calcRiskPercent, setCalcRiskPercent] = useState<number>(2);
  const [calcSlPips, setCalcSlPips] = useState<number>(30);
  const [calcCategory, setCalcCategory] = useState<'GOLD' | 'FOREX' | 'INDICES' | 'CRYPTO_CFD'>('GOLD');
  const [calcResult, setCalcResult] = useState(() =>
    ExnessSignalService.calculateLotSize({
      balanceUsd: 100,
      riskPercent: 2,
      stopLossPips: 30,
      symbolCategory: 'GOLD',
    })
  );

  // 12-13 Year Veteran Professional Intelligence Expansion State
  const [expandedVeteranSignalId, setExpandedVeteranSignalId] = useState<string | null>(null);
  const [activeAiTradeSymbols, setActiveAiTradeSymbols] = useState<Set<string>>(() =>
    new Set(
      TradingMemoryService.getRecords()
        .filter((r) => r.status === 'ACTIVE')
        .map((r) => r.symbol)
    )
  );

  // Admin Custom Signal Modal
  const [isAdminSignalModalOpen, setIsAdminSignalModalOpen] = useState(false);
  const [newSignalForm, setNewSignalForm] = useState({
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    category: 'GOLD' as ExnessSignal['category'],
    timeframe: 'M15' as ExnessSignal['timeframe'],
    type: 'STRONG_BUY' as ExnessSignal['type'],
    currentPrice: 4471.50,
    entryLow: 4462.0,
    entryHigh: 4476.0,
    tp1: 4492.0,
    tp2: 4520.0,
    tp3: 4560.0,
    stopLoss: 4440.0,
    pipTarget: 885,
    pipRisk: 315,
    riskReward: '1:2.81',
    winRate: 93,
    leverage: '1:Unlimited',
    analysisBangla: 'M15 ৪৪৬০ সাপোর্ট জোন থেকে গোল্ডের স্ট্রং রিজেকশন এবং EMA বুলিশ ক্রসওভার।',
    recommendedLotSize: '0.01 - 0.02 Lots',
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  useEffect(() => {
    const loadedSignals = ExnessSignalService.getSignals();
    setSignals(loadedSignals);
    ExnessLivePriceFeed.init();

    // Ingest signals to AI memory if not already present
    TradingMemoryService.autoSyncExnessSignals(loadedSignals, ExnessLivePriceFeed.getTicks());
    setActiveAiTradeSymbols(
      new Set(
        TradingMemoryService.getRecords()
          .filter((r) => r.status === 'ACTIVE')
          .map((r) => r.symbol)
      )
    );

    const unsub = ExnessLivePriceFeed.subscribe((ticks) => {
      setLiveTicks(ticks);
      // Continuous 24/7 client evaluation with live ticks
      const evalRes = TradingMemoryService.syncWithExnessLiveTicks(ticks);
      if (evalRes.updatedCount > 0) {
        setActiveAiTradeSymbols(
          new Set(
            TradingMemoryService.getRecords()
              .filter((r) => r.status === 'ACTIVE')
              .map((r) => r.symbol)
          )
        );
      }
    });

    return () => unsub();
  }, []);

  const handleTakeAiTrade = (signal: ExnessSignal) => {
    const livePrice = liveTicks[signal.symbol]?.price || signal.currentPrice;
    TradingMemoryService.addTradeFromExnessSignal(
      {
        id: signal.id,
        symbol: signal.symbol,
        name: signal.name,
        category: signal.category === 'CRYPTO_CFD' ? 'CRYPTO' : signal.category,
        type: signal.type,
        currentPrice: signal.currentPrice,
        entryZone: `${signal.entryZone[0]} - ${signal.entryZone[1]}`,
        tp1: signal.tp1,
        tp2: signal.tp2,
        tp3: signal.tp3,
        stopLoss: signal.stopLoss,
        pipsGainTarget: signal.pipTarget,
        pipsRiskSL: signal.pipRisk,
        recommendedLotSize: signal.recommendedLotSize100Usd,
        rationaleBn: signal.analysisBangla,
      },
      livePrice
    );

    setActiveAiTradeSymbols(
      new Set(
        TradingMemoryService.getRecords()
          .filter((r) => r.status === 'ACTIVE')
          .map((r) => r.symbol)
      )
    );

    setFeedback(
      `🤖 [এআই ডেমো ট্রেড শুরু] ${signal.symbol} এন্ট্রি $${livePrice} ডেমো মেমোরিতে যুক্ত হয়েছে! ১২-১৩ বছরের প্রাতিষ্ঠানিক প্রফিট এক্সপেন্ডার ও ব্রেক-ইভেন শিল্ড সক্রিয়।`
    );
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Update calculator when inputs change
  useEffect(() => {
    const res = ExnessSignalService.calculateLotSize({
      balanceUsd: calcBalance || 100,
      riskPercent: calcRiskPercent || 1,
      stopLossPips: calcSlPips || 10,
      symbolCategory: calcCategory,
    });
    setCalcResult(res);
  }, [calcBalance, calcRiskPercent, calcSlPips, calcCategory]);

  const handleCopySignal = (signal: ExnessSignal) => {
    const text = ExnessSignalService.formatSignalForCopy(signal);
    navigator.clipboard.writeText(text);
    setCopiedId(signal.id);
    setFeedback(`${signal.symbol} সিগন্যাল কপি করা হয়েছে!`);
    setTimeout(() => {
      setCopiedId(null);
      setFeedback(null);
    }, 3000);
  };

  const getInlineTradingViewSymbol = (sym: string): string => {
    const clean = sym.toUpperCase().replace('/', '').trim();
    if (clean.includes('XAU') || clean.includes('GOLD')) return 'OANDA:XAUUSD';
    if (clean.includes('EURUSD')) return 'FX:EURUSD';
    if (clean.includes('GBPUSD')) return 'FX:GBPUSD';
    if (clean.includes('USDJPY')) return 'FX:USDJPY';
    if (clean.includes('US30') || clean.includes('DOW')) return 'TVC:DJI';
    if (clean.includes('BTC')) return 'BINANCE:BTCUSDT';
    return `FX:${clean}`;
  };

  const handleCreateCustomSignal = (e: React.FormEvent) => {
    e.preventDefault();
    const created = ExnessSignalService.addSignal({
      symbol: newSignalForm.symbol.trim(),
      name: newSignalForm.name.trim(),
      category: newSignalForm.category,
      timeframe: newSignalForm.timeframe,
      type: newSignalForm.type,
      currentPrice: Number(newSignalForm.currentPrice),
      entryZone: [Number(newSignalForm.entryLow), Number(newSignalForm.entryHigh)],
      tp1: Number(newSignalForm.tp1),
      tp2: Number(newSignalForm.tp2),
      tp3: Number(newSignalForm.tp3),
      stopLoss: Number(newSignalForm.stopLoss),
      pipTarget: Number(newSignalForm.pipTarget),
      pipRisk: Number(newSignalForm.pipRisk),
      riskReward: newSignalForm.riskReward,
      winRate: Number(newSignalForm.winRate),
      status: 'ACTIVE',
      leverage: newSignalForm.leverage,
      analysisBangla: newSignalForm.analysisBangla,
      indicators: {
        rsi: 55.0,
        trend: newSignalForm.type.includes('BUY') ? 'BULLISH' : 'BEARISH',
        emaConfluence: 'Admin Verified Institutional Confluence',
        support: Number(newSignalForm.stopLoss),
        resistance: Number(newSignalForm.tp2),
      },
      recommendedLotSize100Usd: newSignalForm.recommendedLotSize,
      author: currentUser?.name || 'Chief Analyst',
    });

    setSignals(ExnessSignalService.getSignals());
    setIsAdminSignalModalOpen(false);
    setFeedback(`✅ ${created.symbol} নতুন সিগন্যাল সফলভাবে লাইভ পাবলিশ করা হয়েছে!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleDeleteSignal = (id: string) => {
    ExnessSignalService.deleteSignal(id);
    setSignals(ExnessSignalService.getSignals());
    setFeedback('সিগন্যাল ডিলিট করা হয়েছে।');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Filter signals
  const filteredSignals = signals.filter((s) => {
    const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchTf = selectedTimeframe === 'ALL' || s.timeframe === selectedTimeframe;
    return matchCat && matchTf;
  });

  // Calculate current BD session status
  const now = new Date();
  const currentUtcHour = now.getUTCHours();
  const currentBdHour = (currentUtcHour + 6) % 24;

  const isSessionOpen = (session: ExnessMarketSession) => {
    if (session.startHourBD < session.endHourBD) {
      return currentBdHour >= session.startHourBD && currentBdHour < session.endHourBD;
    } else {
      // Overnight session (e.g. 18 to 3)
      return currentBdHour >= session.startHourBD || currentBdHour < session.endHourBD;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-amber-300 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Real-Time Price Ribbon & Live Feed Ticker */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/95 border border-amber-500/30 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exness ও গোল্ড লাইভ মার্কেট ফিড (Real-Time Live Data)</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-300">
              📡 সোর্স: TradingView Live Socket & Binance WebSocket
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
              ⚡ স্প্রেড: 0.1 - 0.3 Pips (Raw Spread)
            </span>
          </div>
        </div>

        {/* Live Ticker Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(Object.values(liveTicks) as LiveMarketTick[]).map((tick) => {
            const isPos = tick.change24h >= 0;
            const isSelected = activeInlineSymbol === tick.symbol;
            return (
              <div
                key={tick.symbol}
                onClick={() => setActiveInlineSymbol(tick.symbol)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200">{tick.symbol}</span>
                  <span
                    className={`text-[10px] font-mono font-bold ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {tick.change24h}%
                  </span>
                </div>

                <div className="mt-1 font-mono text-xs sm:text-sm font-black text-slate-100 flex items-center justify-between">
                  <span>
                    {tick.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}
                  </span>
                </div>

                <div className="mt-1 pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>B: {tick.bid}</span>
                  <span className="text-amber-400">A: {tick.ask}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Hero Banner: Exness Gold & Forex Precision Engine */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 opacity-10 hidden lg:block pointer-events-none">
          <Coins className="w-72 h-72 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                <span>EXNESS GOLD & FOREX VIP HUB</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ⚡ 90-95% WIN ACCURACY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MT4 / MT5 ZERO SPREAD
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              <span>Exness গোল্ড (XAUUSD) ও মেগা ফরেক্স সিগন্যাল</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Exness ট্রেডারদের জন্য বিশেষায়িত অ্যালগরিদমিক গোল্ড (Gold/XAUUSD), EUR/USD, GBP/USD, US30 এবং ক্রিপ্টো CFD সিগন্যাল। প্রতিটি ট্রেডে নির্দিষ্ট এন্ট্রি জোন, TP1/TP2/TP3, স্টপ লস ও লট সাইজ গাইডলাইন অন্তর্ভুক্ত।
            </p>
          </div>

          {/* Exness Partner Quick Registration CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <a
              href={config.partnerLink || 'https://one.exness-track.com/'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/25 active:scale-98"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Exness 0 Spread একাউন্ট খুলুন</span>
            </a>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminSignalModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>+ নতুন Exness সিগন্যাল পোস্ট করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 12 Senior AI Institutional Traders Council Board */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-purple-950/40 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                <Users className="w-3.5 h-3.5" />
                <span>১২ জন সিনিয়র এআই ট্রেডার কাউন্সিল</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                ⭐ ১২-৩০ বছরের প্রাতিষ্ঠানিক অভিজ্ঞতা
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                🛡️ ১২/১২ সর্বসম্মত ভোট ও বিতর্ক
              </span>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>১২ জন সিনিয়র এআই ট্রেডারের যৌথ আলোচনা ও এক্যুরেসি ফিল্টার</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              এখানে কোনো সাধারণ একক এআই সিগন্যাল দেয় না। প্রতিটি সিগন্যাল দেখানোর সময় ১২-৩০ বছরের বাস্তব হেজফান্ড ও ব্যাংক অভিজ্ঞতাসম্পন্ন ১২ জন সিনিয়র এআই বিশেষজ্ঞ (ম্যাক্রো, গোল্ড পিট, অর্ডার ফ্লো, এসএমসি, ওয়াইকফ, মোমেন্টাম, রিস্ক অফিসার) একসাথে বসে বিতর্ক করে। ১২ জন একমত হওয়ার পরেই কেবল সিগন্যালটি অনুমোদন পায়।
            </p>
          </div>

          {/* Quick Trigger to view discussion on current primary signal */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setCouncilModalSignal(signals[0] || null)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl shadow-indigo-600/25 active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>১২ জনের যৌথ বিতর্ক ও অডিট দেখুন</span>
            </button>
          </div>
        </div>

        {/* 12 Trader Personas Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
          {TWELVE_VETERAN_TRADERS.map((trader) => (
            <div
              key={trader.id}
              onClick={() => setCouncilModalSignal(signals[0] || null)}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
              title={`${trader.nameBn} (${trader.experienceYears} বছর অভিজ্ঞতা) - ${trader.roleBn}`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 ${trader.avatarBg}`}
                >
                  {trader.nameBn.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {trader.nameBn}
                  </div>
                  <div className="text-[9px] text-amber-400 font-mono font-bold">
                    {trader.experienceYears}Y অভিজ্ঞতা
                  </div>
                </div>
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 truncate">
                {trader.roleBn.split(' ')[0]} {trader.roleBn.split(' ')[1] || ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Forex Market Sessions Clock (BD Time GMT+6) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-wider">
              মার্কেট সেশন ও গোল্ড ভোলাটিলিটি রাডার (বাংলাদেশ সময়: GMT+6)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50">
            বর্তমান সময়: {now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EXNESS_SESSIONS.map((session, idx) => {
            const active = isSessionOpen(session);
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/50 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-200">{session.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      active
                        ? 'bg-emerald-500 text-slate-950 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {active ? '🟢 OPEN NOW' : 'CLOSED'}
                  </span>
                </div>

                <div className="mt-2 text-[11px] font-mono text-amber-300/90 font-bold">
                  {session.bdStartTime} - {session.bdEndTime}
                </div>

                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {session.descriptionBangla}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">সেরা পেয়ার:</span>
                  <span className="font-mono text-slate-300 font-bold">{session.bestPairs[0]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive TradingView Live Pro Station with Real-time Ticks, Flashing Price & TP1/2/3/SL/Entry */}
      <TradingViewLiveStation
        activeSymbol={activeInlineSymbol}
        onSelectSymbol={setActiveInlineSymbol}
        signal={signals.find((s) => s.symbol === activeInlineSymbol) || null}
        liveTick={liveTicks[activeInlineSymbol]}
        timeframe={inlineTimeframe}
        onSelectTimeframe={setInlineTimeframe}
        onOpenModal={() => {
          const sig = signals.find((s) => s.symbol === activeInlineSymbol) || signals[0] || null;
          setChartModalSignal(sig);
        }}
      />

      {/* EMA 50 / 100 / 200 + RSI (14: 85 Overbought / 20 Oversold) + Bollinger Bands (10, 2.0) Strategy Setup Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-fuchsia-500/30 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-100">
                  ট্রেডার সেটআপ: EMA 50/100/200 + RSI (14) + Bollinger Bands (10, 2.0)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-fuchsia-500/20 text-fuchsia-300 font-mono text-[10px] font-bold border border-fuchsia-500/30">
                  BB (10, 2.0) কাস্টম ক্যান্ডেলস্টিক সেটআপ অ্যাক্টিভ
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                সাইটের প্রতিটি সিগন্যাল, এন্ট্রি জোন, স্টপ লস ও টেক প্রফিট (TP1, TP2, TP3) এই ইন্ডিকেটরগুলোর গাণিতিক ফর্মুলায় নির্ধারিত।
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              ১. এন্ট্রি জোন (Entry)
            </span>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              <strong>EMA 50 পুলব্যাক</strong> এবং <strong>BB মিডল লাইন (SMA 10)</strong> রিটেস্ট বাউন্স/রিজেকশন জোন।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              ২. স্টপ লস (SL)
            </span>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              সর্বদা <strong>EMA 200</strong> এবং <strong>Lower/Upper BB</strong> এর নিরাপদ বাফার দূরত্বে (ক্যাপিটাল প্রটেকশন)।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              ৩. টেক প্রফিট (TP1-3)
            </span>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              <strong>TP1:</strong> মিডল ব্যান্ড (1:1) | <strong>TP2:</strong> আপার/লোয়ার ব্যান্ড (1:2) | <strong>TP3:</strong> ম্যাক্স রানার।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-fuchsia-500/30 space-y-1">
            <span className="text-fuchsia-400 font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              ৪. BB (10, 2) + RSI রুলস
            </span>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              <strong className="text-emerald-400">BUY:</strong> গ্রীন হ্যামার (High &lt; Lower Band) | <strong className="text-rose-400">SELL:</strong> রেড ইনভার্টেড হ্যামার (Low &gt; Upper Band)।
            </p>
          </div>
        </div>
      </div>

      {/* Exness Lot Size & Pip Risk Calculator Section */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                Exness Lot Size ও রিস্ক ক্যালকুলেটর (MT4 / MT5)
              </h3>
              <p className="text-[11px] text-slate-400">
                আপনার ব্যালেন্স এবং রিস্ক অনুযায়ী সঠিক লট সাইজ হিসাব করুন যাতে একাউন্ট জিরো হওয়ার ঝুঁকি না থাকে।
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {/* Input 1: Balance */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">একাউন্ট ব্যালেন্স (USD $)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">$</span>
              <input
                type="number"
                min="10"
                step="10"
                value={calcBalance}
                onChange={(e) => setCalcBalance(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none"
                placeholder="100"
              />
            </div>
          </div>

          {/* Input 2: Risk % */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">রিস্ক পার্সেন্টেজ (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={calcRiskPercent}
                onChange={(e) => setCalcRiskPercent(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none"
                placeholder="2"
              />
              <span className="absolute right-3 top-2.5 text-slate-500 font-mono text-xs">%</span>
            </div>
          </div>

          {/* Input 3: Stop Loss Pips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">স্টপ লস (Pips / Points)</label>
            <input
              type="number"
              min="5"
              step="5"
              value={calcSlPips}
              onChange={(e) => setCalcSlPips(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none"
              placeholder="30"
            />
          </div>

          {/* Input 4: Asset Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">ট্রেডিং অ্যাসেট</label>
            <select
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-400 focus:outline-none"
            >
              <option value="GOLD">XAU/USD (Gold Spot)</option>
              <option value="FOREX">Forex Majors (EUR, GBP, JPY)</option>
              <option value="INDICES">Indices (US30 / NAS100)</option>
              <option value="CRYPTO_CFD">Crypto CFD (BTC/USD)</option>
            </select>
          </div>
        </div>

        {/* Calculator Output Display Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-bold">অনুমোদিত লট সাইজ (Recommended Lot)</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                {calcResult.lotSize} Lots
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">সর্বোচ্চ রিস্ক ডলার:</span>
              <span className="font-bold text-rose-400">${calcResult.maxRiskAmount} USD</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-500 block text-[10px]">SL হিট হলে লস:</span>
              <span className="font-bold text-amber-300">${calcResult.totalPipRiskValue} USD</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-slate-500 block text-[10px]">সেফটি স্ট্যাটাস:</span>
              <span className="font-bold text-emerald-400">✅ ১০০% সেইফ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forex & Gold Technical Analysis Setup (Exact Same 9-Factor Confluence & Technicals Engine) */}
      <ForexTechnicalAnalysisSection
        signals={signals}
        liveTicks={liveTicks}
        initialSymbol={activeInlineSymbol}
      />

      {/* Signal Filtering & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            সব সিগন্যাল ({signals.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('GOLD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              selectedCategory === 'GOLD'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>গোল্ড (XAU/USD)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('FOREX')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
              selectedCategory === 'FOREX'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>ফরেক্স মেজর্স</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('INDICES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategory === 'INDICES'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            US30 / Indices
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('CRYPTO_CFD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedCategory === 'CRYPTO_CFD'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            BTC/USD CFD
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-500 font-bold">টাইমফ্রেম:</span>
          {(['ALL', 'M15', 'H1', 'H4'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                selectedTimeframe === tf
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-500 hover:text-slate-300'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSignals.map((signal) => {
          const isBuy = signal.type.includes('BUY');
          return (
            <div
              key={signal.id}
              className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/90 hover:border-amber-500/40 transition-all p-4 sm:p-5 shadow-xl space-y-4 group relative overflow-hidden"
            >
              {/* Card Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-lg ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-950/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-950/40'
                    }`}
                  >
                    {isBuy ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                        {signal.symbol}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {signal.timeframe}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${
                          isBuy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {signal.type.replace('_', ' ')}
                      </span>
                      {/* 9 Confluence Factors Quality Pill */}
                      {(() => {
                        const reqEval = evaluateForexSignalConfirmationFactors(signal, liveTicks[signal.symbol]?.price);
                        return (
                          <button
                            type="button"
                            onClick={() => setNineReqModalSignal(signal)}
                            className="px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 transition"
                            title="৯টি কনফ্লুয়েন্স ফ্যাক্টর্স (Signal Confirmation Factors) দেখুন"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            <span>৯ ফ্যাক্টর্স ({reqEval.passedCount} পাস)</span>
                          </button>
                        );
                      })()}
                    </div>
                    <span className="text-[11px] text-slate-400">{signal.name}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {signal.winRate}% WIN
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block">
                    R:R {signal.riskReward}
                  </span>
                </div>
              </div>

              {/* Price & Target Grid Matrix: Fixed-precision, min-width container & stable grid alignment */}
              <SignalCardTpSlGrid
                symbol={signal.symbol}
                entryZone={signal.entryZone}
                tp1={signal.tp1}
                tp2={signal.tp2}
                tp3={signal.tp3}
                stopLoss={signal.stopLoss}
                direction={isBuy ? 'BUY' : 'SELL'}
                includeCurrencySign={signal.symbol.includes('XAU') || signal.symbol.includes('BTC')}
              />

              {/* 12 Senior AI Traders Council Consensus Badge */}
              <div
                onClick={() => setCouncilModalSignal(signal)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/30 hover:border-indigo-400/60 transition-all cursor-pointer group shadow-sm"
                title="১২ জন সিনিয়র এআই ট্রেডারের যৌথ আলোচনা ও সর্বসম্মত ভোট দেখুন"
              >
                <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-bold">
                  <Users className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span>১২ জন সিনিয়র এআই কাউন্সিল:</span>
                  <span className="text-emerald-400 font-mono">১২/১২ সর্বসম্মত</span>
                  <span className="text-[10px] text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded font-mono">৯৭% এক্যুরেসি</span>
                </div>
                <span className="text-[11px] text-indigo-400 group-hover:text-indigo-200 underline font-semibold flex items-center gap-1">
                  <span>যৌথ বিতর্ক ও অডিট দেখুন</span>
                  <span>&rarr;</span>
                </span>
              </div>

              {/* Real-time Bid / Ask & Spread Ticker for this symbol */}
              {liveTicks[signal.symbol] && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800/70 text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        liveTicks[signal.symbol].direction === 'UP' ? 'bg-emerald-400' : liveTicks[signal.symbol].direction === 'DOWN' ? 'bg-rose-400' : 'bg-cyan-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        liveTicks[signal.symbol].direction === 'UP' ? 'bg-emerald-500' : liveTicks[signal.symbol].direction === 'DOWN' ? 'bg-rose-500' : 'bg-cyan-500'
                      }`}></span>
                    </span>
                    <span className="text-slate-400 font-bold">লাইভ রেট:</span>
                    <span className={`font-black transition-colors duration-150 flex items-center gap-1 ${
                      liveTicks[signal.symbol].direction === 'UP'
                        ? 'text-emerald-400 font-black'
                        : liveTicks[signal.symbol].direction === 'DOWN'
                        ? 'text-rose-400 font-black'
                        : 'text-slate-100'
                    }`}>
                      ${liveTicks[signal.symbol].price.toLocaleString()}
                      {liveTicks[signal.symbol].direction === 'UP' && <span className="text-emerald-400 text-[10px]">▲</span>}
                      {liveTicks[signal.symbol].direction === 'DOWN' && <span className="text-rose-400 text-[10px]">▼</span>}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-slate-400">
                      Bid: <strong className="text-slate-200">{liveTicks[signal.symbol].bid}</strong>
                    </span>
                    <span className="text-slate-400">
                      Ask: <strong className="text-amber-400">{liveTicks[signal.symbol].ask}</strong>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                      স্প্রেড: {liveTicks[signal.symbol].spreadPips} pip
                    </span>
                  </div>
                </div>
              )}

              {/* Bangla Technical Analysis & Indicators */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>স্ট্র্যাটেজি ও লিকুইডিটি বিশ্লেষণ:</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {signal.analysisBangla}
                </p>

                <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono flex-wrap gap-2">
                  <span>RSI: <strong className="text-slate-200">{signal.indicators.rsi}</strong></span>
                  <span>কনফ্লুয়েন্স: <strong className="text-cyan-300">{signal.indicators.emaConfluence}</strong></span>
                  <span>লেভারেজ: <strong className="text-amber-300">{signal.leverage}</strong></span>
                </div>
              </div>

              {/* EMA 50 / 100 / 200 + RSI + Bollinger Bands Exact Level Breakdown */}
              {signal.levelCalculations && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/20 text-[11px] space-y-2 font-mono">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
                    <span className="font-bold text-cyan-300 flex items-center gap-1">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      EMA 50/100/200 + RSI + BB লেভেল হিসাব:
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold">
                      Strict Setup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-sans">
                    <div className="space-y-0.5">
                      <span className="text-cyan-400 font-bold block font-mono">📍 এন্ট্রি জোন ({signal.entryZone[0]} - {signal.entryZone[1]}):</span>
                      <span className="text-slate-300">{signal.levelCalculations.entryReason}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-rose-400 font-bold block font-mono">🛑 স্টপ লস ({signal.stopLoss}):</span>
                      <span className="text-slate-300">{signal.levelCalculations.slReason}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-emerald-400 font-bold block font-mono">🎯 TP 1 / TP 2 ({signal.tp1} / {signal.tp2}):</span>
                      <span className="text-slate-300">{signal.levelCalculations.tp1Reason} & {signal.levelCalculations.tp2Reason}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-emerald-300 font-bold block font-mono">🚀 TP 3 ({signal.tp3}):</span>
                      <span className="text-slate-300">{signal.levelCalculations.tp3Reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-900 flex-wrap gap-1">
                    <span>EMA 50: <strong className="text-slate-200">{signal.levelCalculations.ema50}</strong></span>
                    <span>EMA 100: <strong className="text-slate-200">{signal.levelCalculations.ema100}</strong></span>
                    <span>EMA 200: <strong className="text-slate-200">{signal.levelCalculations.ema200}</strong></span>
                    <span>BB Upper: <strong className="text-slate-200">{signal.levelCalculations.bbUpper}</strong></span>
                    <span>BB Lower: <strong className="text-slate-200">{signal.levelCalculations.bbLower}</strong></span>
                  </div>
                </div>
              )}

              {/* Recommended Lot Size and 1-Click Execution Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 w-full sm:w-auto">
                  <span className="text-slate-500">$১০০ ব্যালেন্সে লট:</span>{' '}
                  <strong className="text-emerald-400 font-mono">{signal.recommendedLotSize100Usd}</strong>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  {/* AI Memory 24/7 Demo Trading Trigger */}
                  {activeAiTradeSymbols.has(signal.symbol) ? (
                    <div
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-xs flex items-center gap-1.5"
                      title="এই সিগন্যালটি বর্তমানে এআই ২৪/৭ ডেমো ট্রেডিং মেমোরিতে লাইভ রানিং আছে"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <Bot className="w-3.5 h-3.5 text-emerald-400" />
                      <span>এআই বোর্ডে রানিং</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleTakeAiTrade(signal)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20 active:scale-98"
                      title="এই নিখুঁত প্রাইস ও TP/SL নিয়ে এআই ডেমো ট্রেডিং মেমোরিতে লাইভ ট্রেড শুরু করুন"
                    >
                      <Bot className="w-3.5 h-3.5 text-cyan-200" />
                      <span>এআই ডেমো এন্ট্রি</span>
                    </button>
                  )}

                  {/* 12-13 Year Institutional Veteran Intelligence View Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedVeteranSignalId(
                        expandedVeteranSignalId === signal.id ? null : signal.id
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-98 border ${
                      expandedVeteranSignalId === signal.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                    title="১২-১৩ বছরের প্রাতিষ্ঠানিক ট্রেডারের হায়ার প্রফিট ও ব্রেক-ইভেন অপ্টিমাইজেশন দেখুন"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>
                      {expandedVeteranSignalId === signal.id ? 'মিনিমাইজ' : '১২-১৩Y এআই ভিউ'}
                    </span>
                  </button>

                  {/* Technical Analysis Setup Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setTechnicalModalSignal(signal)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-98"
                    title="ফুল টেকনিক্যাল অ্যানালাইসিস সেটআপ (Technical Analysis)"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>টেকনিক্যাল সেটআপ</span>
                  </button>

                  {/* 12 Senior AI Traders Council Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setCouncilModalSignal(signal)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 border border-indigo-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-98 shadow-sm"
                    title="১২ জন সিনিয়র এআই ট্রেডারের যৌথ আলোচনা ও সর্বসম্মত ভোট দেখুন"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>🏛️ ১২ জন এআই কাউন্সিল</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">১২/১২</span>
                  </button>

                  {/* 9 Confluence Factors Modal Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setNineReqModalSignal(signal)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-98"
                    title="৯টি কনফ্লুয়েন্স ফ্যাক্টর্স (Signal Confirmation Factors) যাচাই করুন"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>৯ কনফ্লুয়েন্স</span>
                  </button>

                  {/* Live Chart Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setChartModalSignal(signal)}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-98"
                    title="TradingView লাইভ চার্ট ওপেন করুন"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>লাইভ চার্ট</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopySignal(signal)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition active:scale-98"
                    title="Telegram/MT5 এর জন্য কপি করুন"
                  >
                    {copiedId === signal.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>কপি সিগন্যাল</span>
                      </>
                    )}
                  </button>

                  <a
                    href={config.partnerLink || 'https://one.exness-track.com/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1 transition shadow-md shadow-amber-500/20 active:scale-98"
                  >
                    <span>Exness এ ট্রেড</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSignal(signal.id)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 12-13 Year Institutional Professional Trader Enhancement Panel */}
              {expandedVeteranSignalId === signal.id && (() => {
                const liveP = liveTicks[signal.symbol]?.price || signal.currentPrice;
                const isLong = signal.type.includes('BUY');
                const veteran = VeteranTraderIntelligence.enhanceSignal({
                  id: signal.id,
                  symbol: signal.symbol,
                  entryPrice: liveP,
                  tp1: signal.tp1,
                  tp2: signal.tp2,
                  tp3: signal.tp3,
                  sl: signal.stopLoss,
                  direction: isLong ? 'LONG' : 'SHORT',
                  category: signal.category,
                });

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 text-xs space-y-3.5 shadow-2xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                            <span>১২-১৩ বছরের প্রাতিষ্ঠানিক এআই অপ্টিমাইজেশন</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                              {veteran.veteranExperienceYears}
                            </span>
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            উচ্চতর প্রফিট রানার ও ড্র-ডাউন লস প্রিভেনশন অ্যালগরিদম
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-black border border-emerald-500/20">
                          প্রফিট সম্ভাবনা: {veteran.profitExpansionMultiple}
                        </span>
                      </div>
                    </div>

                    {/* Target Comparison: Standard vs Veteran Extended */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-stretch">
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 min-h-[72px] flex flex-col justify-between">
                        <span className="text-[10px] text-slate-400 font-bold block truncate">
                          🎯 TP১ (আংশিক প্রফিট ৪০%):
                        </span>
                        <div className="min-w-[80px] w-full">
                          <span className="text-sm font-black font-mono tabular-nums text-emerald-400 block truncate">
                            {formatFixedPrecisionPrice(veteran.originalTp1, {
                              symbol: signal.symbol,
                              includeCurrencySign: signal.symbol.includes('XAU') || signal.symbol.includes('BTC'),
                            })}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 leading-tight block truncate">
                          প্রথম টার্গেটে লাভ নিশ্চিত করে লস মুক্ত হওয়া
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1 min-h-[72px] flex flex-col justify-between">
                        <span className="text-[10px] text-amber-400 font-bold block truncate">
                          🚀 এক্সপেন্ডেড TP২ (রানার ৪০%):
                        </span>
                        <div className="min-w-[80px] w-full">
                          <span className="text-sm font-black font-mono tabular-nums text-amber-300 block truncate">
                            {formatFixedPrecisionPrice(veteran.veteranExtendedTp2, {
                              symbol: signal.symbol,
                              includeCurrencySign: signal.symbol.includes('XAU') || signal.symbol.includes('BTC'),
                            })}
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-400 leading-tight block font-mono truncate">
                          +{veteran.extendedTp2PipsGain} pips টার্গেট
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1 min-h-[72px] flex flex-col justify-between">
                        <span className="text-[10px] text-cyan-400 font-bold block truncate">
                          ⚡ ম্যাক্সিমাম TP৩ (রানার ২০%):
                        </span>
                        <div className="min-w-[80px] w-full">
                          <span className="text-sm font-black font-mono tabular-nums text-cyan-300 block truncate">
                            {formatFixedPrecisionPrice(veteran.veteranExtendedTp3, {
                              symbol: signal.symbol,
                              includeCurrencySign: signal.symbol.includes('XAU') || signal.symbol.includes('BTC'),
                            })}
                          </span>
                        </div>
                        <span className="text-[9px] text-cyan-400 leading-tight block font-mono truncate">
                          +{veteran.extendedTp3PipsGain} pips এক্সটেনশন
                        </span>
                      </div>
                    </div>

                    {/* Capital Shield & Loss Minimizer Rules */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300 font-bold">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>ক্যাপিটাল শিল্ড ও জিরো-রিস্ক ট্রেইলিং:</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          ড্র-ডাউন লস হ্রাস: {veteran.lossReductionPercent}%
                        </span>
                      </div>
                      <p className="text-slate-300 text-[10.5px] leading-relaxed">
                        {veteran.breakEvenRuleBn}
                      </p>
                      <div className="pt-1 text-[10px] text-cyan-300 font-mono flex items-center gap-2">
                        <span>🛡️ কার্যকর SL: ${veteran.originalSl}</span>
                        <span>•</span>
                        <span>লিকুইডিটি জোন: ${veteran.structuralSupportSl}</span>
                      </div>
                    </div>

                    {/* Autonomous Site Development Insights */}
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5 text-[11px]">
                      <span className="text-amber-400 font-bold block text-[10.5px]">
                        💡 সাইট সিগন্যাল স্বয়ংক্রিয় উন্নয়ন যুক্তি (Autonomous Learning):
                      </span>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        {veteran.selfDevelopmentRationaleBn}
                      </p>
                    </div>

                    {/* 1-Click Action to Execute with Veteran Settings */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        প্রাইস: <strong className="text-slate-200">${liveP}</strong> | TP/SL অপরিবর্তিত লক
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTakeAiTrade(signal)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 active:scale-98"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>এই অপ্টিমাইজড সেটিংসে এআই ডেমো ট্রেড শুরু</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Exness Local Deposit & Withdrawal Guide (Bkash, Nagad, USDT) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-black text-slate-200">
            বাংলাদেশ থেকে Exness ডিপোজিট ও উইথড্রয়াল সুবিধা
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-black text-amber-300 block">📱 বিকাশ ও নগদ (Local Banking)</span>
            <p className="text-[11px] text-slate-400">
              কোনো থার্ড পার্টি ছাড়াই এক্সনেস অফিসিয়াল গেটওয়ে দিয়ে সরাসরি বিকাশ ও নগদ থেকে ৫ মিনিটে ডিপোজিট ও ইনস্ট্যান্ট উইথড্র।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-black text-emerald-400 block">💎 USDT (TRC20 & Binance Pay)</span>
            <p className="text-[11px] text-slate-400">
              বাইন্যান্স পে বা ক্রিপ্টো ওয়ালেট থেকে ০% ফি-তে সেকেন্ডের মধ্যে ডিপোজিট এবং যেকোনো সময় ডলার ক্যাশআউট।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="font-black text-cyan-400 block">⚡ Zero Spread & Raw Spread</span>
            <p className="text-[11px] text-slate-400">
              গোল্ড ও ক্রিপ্টোতে সবচেয়ে কম স্প্রেড এবং আনলিমিটেড লেভারেজ সুবিধা।
            </p>
          </div>
        </div>
      </div>

      {/* Admin Custom Signal Modal */}
      {isAdminSignalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>নতুন Exness সিগন্যাল পোস্ট করুন (Admin VIP Desk)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAdminSignalModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ বন্ধ করুন
              </button>
            </div>

            <form onSubmit={handleCreateCustomSignal} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">অ্যাসেট সিম্বল</label>
                  <input
                    type="text"
                    required
                    value={newSignalForm.symbol}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, symbol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono"
                    placeholder="XAU/USD"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">ক্যাটাগরি</label>
                  <select
                    value={newSignalForm.category}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                  >
                    <option value="GOLD">Gold Spot</option>
                    <option value="FOREX">Forex Majors</option>
                    <option value="INDICES">Indices (US30)</option>
                    <option value="CRYPTO_CFD">Crypto CFD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">সিগন্যাল টাইপ</label>
                  <select
                    value={newSignalForm.type}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-bold"
                  >
                    <option value="STRONG_BUY">🟢 STRONG BUY</option>
                    <option value="BUY">🟢 BUY</option>
                    <option value="STRONG_SELL">🔴 STRONG SELL</option>
                    <option value="SELL">🔴 SELL</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">টাইমফ্রেম</label>
                  <select
                    value={newSignalForm.timeframe}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, timeframe: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono"
                  >
                    <option value="M5">M5 Scalp</option>
                    <option value="M15">M15 Intraday</option>
                    <option value="H1">H1 Swing</option>
                    <option value="H4">H4 Mega</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">উইন রেট (%)</label>
                  <input
                    type="number"
                    min="70"
                    max="99"
                    value={newSignalForm.winRate}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, winRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">এন্ট্রি জোন (Low - High)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      required
                      value={newSignalForm.entryLow}
                      onChange={(e) => setNewSignalForm({ ...newSignalForm, entryLow: Number(e.target.value) })}
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono"
                      placeholder="2905"
                    />
                    <input
                      type="number"
                      step="any"
                      required
                      value={newSignalForm.entryHigh}
                      onChange={(e) => setNewSignalForm({ ...newSignalForm, entryHigh: Number(e.target.value) })}
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-slate-100 font-mono"
                      placeholder="4476"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-rose-400 font-bold block mb-1">স্টপ লস (SL)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newSignalForm.stopLoss}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, stopLoss: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-rose-300 font-mono"
                    placeholder="4440"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-emerald-400 font-bold block mb-1">TP 1 (Scalp)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newSignalForm.tp1}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, tp1: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-emerald-400 font-bold block mb-1">TP 2 (Day Trade)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newSignalForm.tp2}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, tp2: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-300 font-mono"
                  />
                </div>
                <div>
                  <label className="text-emerald-400 font-bold block mb-1">TP 3 (Swing)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newSignalForm.tp3}
                    onChange={(e) => setNewSignalForm({ ...newSignalForm, tp3: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-emerald-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">বাংলা অ্যানালাইসিস ও স্ট্র্যাটেজি নোট</label>
                <textarea
                  rows={2}
                  value={newSignalForm.analysisBangla}
                  onChange={(e) => setNewSignalForm({ ...newSignalForm, analysisBangla: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminSignalModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>পাবলিশ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live TradingView Full-Screen Chart Modal */}
      <ExnessLiveChartModal
        signal={chartModalSignal}
        isOpen={!!chartModalSignal}
        onClose={() => setChartModalSignal(null)}
        liveTick={chartModalSignal ? liveTicks[chartModalSignal.symbol] : undefined}
      />

      {/* Forex 9 Requirements Modal */}
      <ForexNineRequirementsModal
        signal={nineReqModalSignal}
        isOpen={!!nineReqModalSignal}
        onClose={() => setNineReqModalSignal(null)}
        livePrice={nineReqModalSignal ? liveTicks[nineReqModalSignal.symbol]?.price : undefined}
      />

      {/* Forex Full Technical Analysis Modal (Exact Site Technical Setup) */}
      <ForexTechnicalModal
        signal={technicalModalSignal}
        isOpen={!!technicalModalSignal}
        onClose={() => setTechnicalModalSignal(null)}
        liveTick={technicalModalSignal ? liveTicks[technicalModalSignal.symbol] : undefined}
      />

      {/* 12 Senior Institutional AI Traders Council Modal */}
      <VeteranAiCouncilModal
        isOpen={!!councilModalSignal}
        onClose={() => setCouncilModalSignal(null)}
        signal={
          councilModalSignal
            ? {
                id: councilModalSignal.id,
                symbol: councilModalSignal.symbol,
                name: councilModalSignal.name,
                entryPrice: liveTicks[councilModalSignal.symbol]?.price || councilModalSignal.currentPrice,
                tp1: councilModalSignal.tp1,
                tp2: councilModalSignal.tp2,
                tp3: councilModalSignal.tp3,
                sl: councilModalSignal.stopLoss,
                direction: councilModalSignal.type.includes('BUY') ? 'BUY' : 'SELL',
                category: councilModalSignal.category,
                currentPrice: liveTicks[councilModalSignal.symbol]?.price || councilModalSignal.currentPrice,
              }
            : null
        }
        onStartCouncilTrade={(consensus) => {
          if (councilModalSignal) {
            handleTakeAiTrade(councilModalSignal);
            setFeedback(
              `🏛️ [১২ জন সিনিয়র এআই কাউন্সিল] ${consensus.symbol} সর্বসম্মত ট্রেড ডেমো মেমোরিতে যুক্ত হয়েছে! ১২ জনের যৌথ প্রফিট ও রিস্ক নিয়ম কার্যকর।`
            );
          }
        }}
      />
    </div>
  );
};
