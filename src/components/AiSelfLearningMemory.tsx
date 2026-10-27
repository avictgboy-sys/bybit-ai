import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Activity,
  Zap,
  ShieldCheck,
  Award,
  PlusCircle,
  Lock,
  Info,
  Filter,
  Check,
  AlertTriangle,
  ArrowRight,
  Flame,
  Layers,
  Scale,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  X,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from 'lucide-react';
import { TickerData } from '../types';
import {
  TradingMemoryService,
  TradeRecord,
  LearningStats,
} from '../services/tradingMemory';
import { VeteranTraderIntelligence } from '../services/veteranTraderIntelligence';
import { formatPrice } from '../utils/formatters';
import { lookupKeySupportResistanceLevels } from '../utils/swingLevels';

interface AiSelfLearningMemoryProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export const AiSelfLearningMemory: React.FC<AiSelfLearningMemoryProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [records, setRecords] = useState<TradeRecord[]>([]);
  const [lastEvaluatedAt, setLastEvaluatedAt] = useState<Date>(new Date());
  const [pulseCount, setPulseCount] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'TP_HIT' | 'SL_HIT'>('ALL');
  const [autoIngest, setAutoIngest] = useState<boolean>(() =>
    TradingMemoryService.isAutoIngestEnabled()
  );
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');

  // Live Trade Modal States
  const [showAddLiveModal, setShowAddLiveModal] = useState<boolean>(false);
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState<string>('BTCUSDT');
  const [coinSearchQuery, setCoinSearchQuery] = useState<string>('');
  const [modalDirection, setModalDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [customEntryPrice, setCustomEntryPrice] = useState<string>('');
  const [customTp1, setCustomTp1] = useState<string>('');
  const [customTp2, setCustomTp2] = useState<string>('');
  const [customSl, setCustomSl] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const tickersRef = useRef(tickers);
  tickersRef.current = tickers;

  const currentModalCoin =
    tickers.find((t) => t.symbol === selectedCoinSymbol) ||
    tickers.find((t) => t.symbol === 'BTCUSDT') ||
    tickers[0];

  // Sync memory with real live tickers when ticker list initializes or count changes
  useEffect(() => {
    if (!tickers || tickers.length === 0) return;
    const synced = TradingMemoryService.syncWithLiveTickers(tickers);
    setRecords(synced);
  }, [tickers.length]);

  // Recalculate intelligent S/R targets ONLY when modal is open and coin or direction changes
  useEffect(() => {
    if (!showAddLiveModal || !currentModalCoin || currentModalCoin.lastPrice <= 0) return;
    const price = currentModalCoin.lastPrice;
    const swing = lookupKeySupportResistanceLevels(
      price,
      currentModalCoin.highPrice24h,
      currentModalCoin.lowPrice24h,
      modalDirection
    );

    setCustomEntryPrice(price.toString());
    setCustomTp1(swing.tp1.toString());
    setCustomTp2(swing.tp2.toString());
    setCustomSl(swing.sl.toString());
    setCustomReason(
      `[লাইভ ট্রেড] ${currentModalCoin.baseCoin || currentModalCoin.symbol} এ ${
        modalDirection === 'LONG' ? 'লং (BUY)' : 'শর্ট (SELL)'
      } এন্ট্রি। ${swing.slReason || 'সাপোর্ট/রেজিস্ট্যান্স বাফার'}`
    );
  }, [showAddLiveModal, selectedCoinSymbol, modalDirection, currentModalCoin?.symbol]);

  // Autonomous 3-Second Verification Loop with Live Bybit Tickers (Stable Interval)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const currentTickers = tickersRef.current;
      if (!currentTickers || currentTickers.length === 0) return;

      setIsScanning(true);
      const result = TradingMemoryService.evaluateActiveTrades(
        currentTickers.map((t) => ({
          symbol: t.symbol,
          lastPrice: t.lastPrice,
          baseCoin: t.baseCoin,
        }))
      );

      setRecords(result.records);
      setLastEvaluatedAt(new Date());
      setPulseCount((prev) => prev + 1);

      setTimeout(() => setIsScanning(false), 500);
    }, 3000); // Evaluates every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Connect to 24/7 Server Trade Engine to continuously merge background evaluated outcomes
  useEffect(() => {
    TradingMemoryService.syncWithBackendServer().then((synced) => {
      if (synced && synced.length > 0) {
        setRecords([...synced]);
      }
    });

    const serverSyncInterval = setInterval(() => {
      TradingMemoryService.syncWithBackendServer().then((synced) => {
        if (synced && synced.length > 0) {
          setRecords([...synced]);
        }
      });
    }, 6000);

    return () => clearInterval(serverSyncInterval);
  }, []);

  const stats: LearningStats = TradingMemoryService.getStats();

  const handleToggleAutoIngest = () => {
    const next = !autoIngest;
    setAutoIngest(next);
    TradingMemoryService.setAutoIngestEnabled(next);
    triggerToast(next ? '⚡ অটো-সিগন্যাল এন্ট্রি চালু করা হয়েছে।' : '⏸️ অটো-সিগন্যাল এন্ট্রি বন্ধ করা হয়েছে।');
  };

  const handleForceScanNow = () => {
    if (!tickers || tickers.length === 0) return;
    setIsScanning(true);
    const result = TradingMemoryService.evaluateActiveTrades(
      tickers.map((t) => ({
        symbol: t.symbol,
        lastPrice: t.lastPrice,
        baseCoin: t.baseCoin,
      }))
    );
    setRecords([...result.records]);
    setLastEvaluatedAt(new Date());
    setTimeout(() => setIsScanning(false), 400);
    triggerToast('✅ লাইভ বাইবিট মার্কেট প্রাইজে সকল ট্রেড সফলভাবে পুনর্মূল্যায়ন করা হয়েছে!');
  };

  // Sync all records with current live Bybit prices
  const handleSyncWithLivePrices = () => {
    if (!tickers || tickers.length === 0) return;
    setIsScanning(true);
    const synced = TradingMemoryService.syncWithLiveTickers(tickers);
    setRecords([...synced]);
    setLastEvaluatedAt(new Date());
    setTimeout(() => setIsScanning(false), 400);
    triggerToast('🔄 সমস্ত ট্রেডের লাইভ দাম বাইবিট রিয়েল-টাইমে সিঙ্ক করা হয়েছে!');
  };

  // Add Live Trade from Modal Form
  const handleConfirmAddLiveTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModalCoin || currentModalCoin.lastPrice <= 0) return;

    const entry = parseFloat(customEntryPrice) || currentModalCoin.lastPrice;
    const tp1 = parseFloat(customTp1);
    const tp2 = parseFloat(customTp2);
    const sl = parseFloat(customSl);

    TradingMemoryService.addLiveTradeFromTicker(currentModalCoin, modalDirection, {
      entryPrice: entry,
      tp1: tp1 > 0 ? tp1 : undefined,
      tp2: tp2 > 0 ? tp2 : undefined,
      sl: sl > 0 ? sl : undefined,
      reasonBn: customReason.trim() || undefined,
      sourceNameBn: '🔴 লাইভ বাইবিট ট্রেড',
    });

    setRecords([...TradingMemoryService.getRecords()]);
    setShowAddLiveModal(false);
    triggerToast(`⚡ ${currentModalCoin.baseCoin || currentModalCoin.symbol} লাইভ ট্রেড মেমোরিতে যুক্ত হয়েছে! প্রাইজ: $${formatPrice(entry)}`);
  };

  // 1-Click Auto Add Top Live Coins
  const handleAutoAddTopLiveSignals = () => {
    if (!tickers || tickers.length === 0) return;
    const added = TradingMemoryService.autoAddTopLiveSignals(tickers, 3);
    setRecords([...TradingMemoryService.getRecords()]);
    if (added.length > 0) {
      triggerToast(`🔥 টপ ৩টি লাইভ কয়েন (${added.map((a) => a.baseCoin).join(', ')}) বর্তমান রিয়েল-টাইম লাইভ প্রাইজে মেমোরিতে যুক্ত হয়েছে!`);
    } else {
      triggerToast('সব শীর্ষ কয়েন ইতিমধ্যে লাইভ ট্র্যাকিংয়ে সক্রিয় আছে।');
    }
  };

  const handleResetMemory = () => {
    triggerToast('🔒 ট্রেড হিস্ট্রি ও মেমোরি ডেটা সম্পূর্ণ স্থায়ী ও সুরক্ষিত। অতীতের সত্য ফলাফল ও এআই উইনরেট অটুট রাখতে কোনো রেকর্ড ডিলিট করা যাবে না।');
  };

  const handleOptimizeMemory = () => {
    const updated = TradingMemoryService.optimizeMemoryWithConfluenceRules(tickers);
    setRecords([...updated]);
    setPulseCount((prev) => prev + 1);
    triggerToast('✨ ৯৩%+ উইনরেট কনফ্লুয়েন্স রুলস দিয়ে মেমরি অপ্টিমাইজ ও লাইভ প্রাইজ সিঙ্ক সম্পন্ন!');
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (filterStatus === 'ACTIVE' && r.status !== 'ACTIVE') return false;
    if (filterStatus === 'TP_HIT' && r.status !== 'TP_HIT') return false;
    if (filterStatus === 'SL_HIT' && r.status !== 'SL_HIT') return false;
    if (selectedSourceFilter !== 'ALL') {
      if (selectedSourceFilter === 'EXNESS_ALL') {
        if (!r.source?.startsWith('EXNESS') && r.category !== 'GOLD' && r.category !== 'FOREX') return false;
      } else if (selectedSourceFilter === 'CRYPTO_ALL') {
        if (r.source?.startsWith('EXNESS') && r.source !== 'EXNESS_CRYPTO') return false;
      } else if (r.source !== selectedSourceFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header Title with Live Pulse */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shrink-0 shadow-lg shadow-amber-500/20 relative">
            <Brain className="w-7 h-7 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                🧠 স্বয়ংক্রিয় এআই মেমরি ও স্ব-শিক্ষা ইঞ্জিন (Autonomous Self-Learning AI)
              </h2>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ৩s সিঙ্ক সাইকেল #{pulseCount}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              সাইটের প্রতিটি সিগন্যালে স্বয়ংক্রিয়ভাবে ভার্চুয়াল এন্ট্রি নিয়ে ৩ সেকেন্ড পরপর লাইভ মার্কেটে লাভ/ক্ষতি নোট করে এবং নিজের ভুল ও সাফল্য থেকে শিখে সিগন্যাল নির্ভুল করে তোলে।
            </p>
          </div>
        </div>

        {/* Action Controls & Live Ingestion Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          {/* Add Live Trade Button */}
          <button
            type="button"
            onClick={() => setShowAddLiveModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 border border-amber-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/25"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            ➕ লাইভ ট্রেড যোগ করুন
          </button>

          {/* 1-Click Top 3 Live Signals Auto-Add */}
          <button
            type="button"
            onClick={handleAutoAddTopLiveSignals}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="বর্তমান লাইভ মার্কেট থেকে টপ ৩টি শক্তিশালী কয়েনের ট্রেড ১-ক্লিকে যুক্ত করুন"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            ⚡ টপ ৩ লাইভ সিঙ্ক
          </button>

          {/* Sync All With Live Prices Button */}
          <button
            type="button"
            onClick={handleSyncWithLivePrices}
            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="সমস্ত ট্রেডের দাম বাইবিট বর্তমান লাইভ প্রাইজে তাৎক্ষণিকভাবে রি-অ্যাঙ্কর করুন"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
            🔄 লাইভ প্রাইজ সিঙ্ক
          </button>

          {/* Auto Ingest Switch Button */}
          <button
            type="button"
            onClick={handleToggleAutoIngest}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${
              autoIngest
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {autoIngest ? (
              <ToggleRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-500" />
            )}
            <span>
              {autoIngest ? 'অটো-এন্ট্রি: সক্রিয়' : 'অটো-এন্ট্রি: বন্ধ'}
            </span>
          </button>

          {/* AI Optimizer */}
          <button
            type="button"
            onClick={handleOptimizeMemory}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
            title="EMA + RSI + BB (10, 2.0) কনফ্লুয়েন্স রুলস দিয়ে লাইভ প্রাইজ সিঙ্ক"
          >
            <Sparkles className="w-3.5 h-3.5" />
            এআই অপ্টিমাইজার
          </button>

          {/* Tamper-Proof 24/7 Protected Storage Badge */}
          <div
            className="px-3 py-2 rounded-xl bg-slate-950 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-help"
            title="সার্ভার ব্যাকএন্ডে ২৪ ঘণ্টা ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে রানিং ও ডেটা ডিলিট-সুরক্ষিত"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">🔒 ২৪/৭ স্থায়ী মেমরি</span>
            <span className="sm:hidden">🔒 ২৪/৭ রানিং</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationToast && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notificationToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="text-slate-400 hover:text-slate-100 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real-time Live Market Feed Banner */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            বাইবিট লাইভ প্রাইজ সংযুক্ত ({tickers.length} পেয়ার)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            প্রতি ৩ সেকেন্ডে স্বয়ংক্রিয় মূল্যায়ন
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11.5px] flex-wrap">
          {tickers.slice(0, 4).map((t) => (
            <span key={t.symbol} className="text-slate-300 flex items-center gap-1">
              <span className="text-amber-400 font-black">{t.baseCoin || t.symbol.replace('USDT', '')}:</span>
              <span className="text-slate-100 font-bold">${formatPrice(t.lastPrice)}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Triple Layer Strategy Confluence Banner */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ৩-লেয়ার কনফার্মেশন সক্রিয়
          </span>
          <span className="text-slate-300 font-sans text-[11.5px]">
            <strong className="text-amber-300">EMA 50/100/200</strong> + <strong className="text-cyan-300">RSI (৮৫/২০)</strong> + <strong className="text-purple-300">BB (10, 2.0)</strong> বাইরের ক্যান্ডেল কনফ্লুয়েন্স
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          🛡️ ট্রেইলিং ব্রেক-ইভেন প্রটেকশন (০% ক্যাপিটাল ড্রডাউন)
        </span>
      </div>

      {/* Real-time Status Pulse Bar */}
      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isScanning ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
          <span className="text-slate-300 font-medium">
            লাইভ ৩-সেকেন্ড ভেরিফিকেশন স্ট্যাটাস:
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            {isScanning ? 'রিয়েল-টাইম প্রাইজ টিক হিসাব হচ্ছে...' : 'সক্রিয় (প্রতি ৩ সেকেন্ডে টিক বিশ্লেষণ)'}
          </span>
        </div>

        <div className="text-slate-400 text-[11px] font-mono flex items-center gap-2">
          <span>মোট হিস্ট্রি: {records.length} টি ট্রেড</span>
          <span>•</span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>শেষ আপডেট: {lastEvaluatedAt.toLocaleTimeString('bn-BD')}</span>
        </div>
      </div>

      {/* 4 Accumulated AI Knowledge Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Win Rate */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-1.5">
          <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            অর্জিত উইন রেট (Win Rate)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {stats.winRate}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.winRate))}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {stats.tpCount} লাভ / {stats.slCount} লস অনুপাত
          </span>
        </div>

        {/* Total Evaluated Trades */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            মোট ট্র্যাক করা ট্রেড সংখ্যা
          </span>
          <div className="text-2xl font-black font-mono text-slate-100">
            {stats.totalTradesCount} টি
          </div>
          <span className="text-[10px] text-amber-400 block font-mono">
            ⚡ {stats.activeCount} টি বর্তমানে লাইভ রানিং
          </span>
        </div>

        {/* Successful TP Hits */}
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-1.5">
          <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            সফল প্রফিট টার্গেট (TP Hit)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {stats.tpCount} টি
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            গড় প্রফিট: +{stats.avgProfitPercent}% / ট্রেড
          </span>
        </div>

        {/* Stop Losses */}
        <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 space-y-1.5">
          <span className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            স্টপ লস সুরক্ষা (SL Hit)
          </span>
          <div className="text-2xl font-black font-mono text-red-400">
            {stats.slCount} টি
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            লসের কারণ বিশ্লেষণ করে স্ব-শিক্ষা সংরক্ষিত
          </span>
        </div>
      </div>

      {/* 🎓 12-13 Year Institutional Professional Trader Intelligence & Site Autonomous Development Engine */}
      {(() => {
        const veteran = VeteranTraderIntelligence.getVeteranKnowledgeState();

        return (
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl border-2 border-amber-500/50 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                      <span>🎓 ১২-১৩ বছরের প্রাতিষ্ঠানিক এআই প্রফেশনাল ট্রেডার ইঞ্জিন</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[11px] font-black shadow-sm">
                      অভিজ্ঞতা: {veteran.experienceYearsEquivalent} বছর
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    {veteran.evolutionLevel} • অতীত সত্য ফলাফল ও এক্সনেস সিগন্যাল থেকে স্ব-উন্নয়নশীল
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-mono text-xs font-black border border-emerald-500/30 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>গড় প্রফিট মাল্টিপ্লায়ার: {veteran.averageProfitMultiplier}x</span>
                </span>
              </div>
            </div>

            {/* Core Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  🚀 উচ্চতর প্রফিট রানার
                </span>
                <div className="text-xl font-black font-mono text-amber-400">
                  +{((veteran.averageProfitMultiplier - 1) * 100).toFixed(0)}% বেশি
                </div>
                <span className="text-[9px] text-slate-500 block">
                  TP১ এ প্রফিট রেখে TP২/TP৩ ট্রেইল
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  🛡️ ড্র-ডাউন লস প্রতিরোধ
                </span>
                <div className="text-xl font-black font-mono text-emerald-400">
                  {veteran.drawdownSavedPercent}% হ্রাস
                </div>
                <span className="text-[9px] text-slate-500 block">
                  +১৫ পিপসে জিরো-রিস্ক ব্রেক-ইভেন
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  🎯 TP এক্সটেনশন সাকসেস
                </span>
                <div className="text-xl font-black font-mono text-cyan-400">
                  {veteran.tpExtensionSuccessRate}%
                </div>
                <span className="text-[9px] text-slate-500 block">
                  লিকুইডিটি রিটেস্ট কনফার্মড
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  🧠 স্থায়ী লার্নিং মেমোরি
                </span>
                <div className="text-xl font-black font-mono text-slate-200">
                  {veteran.totalLearnedTrades} টি ট্রেড
                </div>
                <span className="text-[9px] text-slate-500 block">
                  অক্ষুণ্ণ ও টেম্পার-প্রুফ হিস্ট্রি
                </span>
              </div>
            </div>

            {/* Autonomous Improvements Applied to Site Signals (সাইট নিজে নিজে কীভাবে ডেভেলপ হচ্ছে) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>সাইটের সিগন্যাল স্বয়ংক্রিয় উন্নয়ন (Autonomous Site Evolution):</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">
                  ২৪/৭ লাইভ মার্কেট টেস্টে সক্রিয়
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {veteran.autonomousImprovements.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-100 font-mono">
                        {item.asset}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.winRateBoost}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      {item.insightBn}
                    </p>
                    <div className="pt-1 border-t border-slate-800/80 text-[10px] text-amber-300 font-mono">
                      ⚡ {item.developmentActionBn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Core Institutional Rules Grid */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>১২-১৩ বছরের প্রাতিষ্ঠানিক হেজফান্ড রুলস (Institutional Rulebook):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {veteran.coreRules.map((cr, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 text-xs">{cr.title}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                        {cr.impactBn}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {cr.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* AI Self-Correction & Formulated Rules Section (কীভাবে সাইট আরও নিখুঁত হচ্ছে) */}
      <div className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-amber-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-100">
              🛠️ এআই এর স্ব-উন্নয়ন ও সংশোধিত রুলস (AI Self-Corrected Rules)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            সাইটের সিগন্যাল অ্যালগরিদমে সরাসরি কার্যকর
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {stats.selfCorrectedRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-400 font-sans">
                  {rule.title}
                </span>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {rule.impact}
                </span>
              </div>
              <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Symbol-by-Symbol Accuracy Matrix (কয়েনভিত্তিক নির্ভুলতা) */}
      {stats.symbolPerformance && stats.symbolPerformance.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>কয়েনভিত্তিক এআই নির্ভুলতা ও হিস্ট্রি মেট্রিক্স:</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              ট্রেড সংখ্যার ভিত্তিতে র‍্যাংকড
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {stats.symbolPerformance.map((sym) => {
              const base = sym.symbol.replace('USDT', '');
              const isHighAcc = sym.winRate >= 80;
              return (
                <div
                  key={sym.symbol}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-100 font-mono">{base}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isHighAcc
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sym.winRate}% WIN
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>মোট: {sym.total}টি</span>
                    <span className="text-emerald-400 font-mono">+{sym.avgProfit}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Trade Memory History Table */}
      <div className="space-y-3">
        {/* Table Controls & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'ALL', label: `সব ট্রেড (${records.length})` },
              { id: 'ACTIVE', label: `লাইভ রানিং (${stats.activeCount})` },
              { id: 'TP_HIT', label: `লাভজনক TP (${stats.tpCount})` },
              { id: 'SL_HIT', label: `স্টপ লস (${stats.slCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  filterStatus === tab.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Source Selector Filter */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs text-slate-400">উৎস:</span>
            <select
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">সকল ট্রেড মেমরি (All Sources)</option>
              <option value="EXNESS_ALL">👑 সব Exness সিগন্যাল (Gold/Forex/Indices)</option>
              <option value="EXNESS_GOLD">👑 Exness গোল্ড (XAU/USD)</option>
              <option value="EXNESS_FOREX">🌍 Exness ফরেক্স পেয়ার</option>
              <option value="EXNESS_INDICES">📈 Exness ইনডাইসেস (US30, NAS100)</option>
              <option value="EXNESS_CRYPTO">⚡ Exness ক্রিপ্টো CFD</option>
              <option value="TOP_10">টপ ১০ বাইবিট সিগন্যাল</option>
              <option value="GROWING_BULLS">পাম্প স্ক্যানার</option>
              <option value="MEME_RADAR">মীম রাডার</option>
              <option value="RECOVERY_PLAN">লস রিকভারি</option>
              <option value="MANUAL">ম্যানুয়াল টেস্ট</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">স্ট্যাটাস ও পেয়ার</th>
                <th className="p-3">দিক ও সোর্স</th>
                <th className="p-3">এন্ট্রি প্রাইজ</th>
                <th className="p-3 text-emerald-400">🔴 লাইভ মার্কেট প্রাইজ</th>
                <th className="p-3">টার্গেট (TP1/TP2)</th>
                <th className="p-3">স্টপ লস (SL)</th>
                <th className="p-3">লাভ / ক্ষতি (PnL)</th>
                <th className="p-3">এআই শিক্ষা ও প্রাতিষ্ঠানিক লজিক</th>
                <th className="p-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-sans">
                    কোনো ট্রেড পাওয়া যায়নি। &quot;👑 এক্সনেস সিগন্যাল&quot; ট্যাব থেকে সিগন্যালে ক্লিক করে ডেমো ট্রেড শুরু করুন অথবা উপরের বাটন ব্যবহার করুন।
                  </td>
                </tr>
              ) : (
                filteredRecords.map((trade) => {
                  const isLong = trade.direction === 'LONG';
                  const isTp = trade.status === 'TP_HIT';
                  const isSl = trade.status === 'SL_HIT';
                  const isActive = trade.status === 'ACTIVE';

                  const pnl = isActive
                    ? trade.floatingPnlPercent || 0
                    : trade.realizedPnlPercent || 0;
                  const isPnlPositive = pnl >= 0;

                  const isExnessGold = trade.source === 'EXNESS_GOLD' || trade.category === 'GOLD' || trade.symbol === 'XAU/USD';
                  const isExnessForex = trade.source === 'EXNESS_FOREX' || trade.category === 'FOREX';
                  const isExnessIndices = trade.source === 'EXNESS_INDICES';
                  const isExnessCrypto = trade.source === 'EXNESS_CRYPTO';
                  const isAnyExness = isExnessGold || isExnessForex || isExnessIndices || isExnessCrypto || trade.source?.startsWith('EXNESS');

                  const displaySymbol = trade.symbol.includes('/')
                    ? trade.symbol
                    : `${trade.baseCoin || trade.symbol.replace('USDT', '')}/USDT`;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Status & Symbol */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isTp && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {isSl && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                          {isActive && <Activity className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />}
                          <div>
                            <span className="font-black text-slate-100 block">
                              {displaySymbol}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold inline-block ${
                                  isTp
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isSl
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {isTp ? 'TP হিট (মুনাফা)' : isSl ? 'SL হিট' : '⚡ লাইভ রানিং'}
                              </span>
                              {trade.veteranEnhancement && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold">
                                  ১২-১৩Y AI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Direction & Source */}
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded border inline-block ${
                            isLong
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}
                        >
                          {isLong ? '🟢 BUY / LONG' : '🔴 SELL / SHORT'}
                        </span>
                        <div className="mt-1">
                          {isExnessGold ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 inline-block font-sans">
                              👑 Exness গোল্ড
                            </span>
                          ) : isExnessForex ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 inline-block font-sans">
                              🌍 Exness ফরেক্স
                            </span>
                          ) : isExnessIndices ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 inline-block font-sans">
                              📈 Exness ইনডেক্স
                            </span>
                          ) : isExnessCrypto ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 inline-block font-sans">
                              ⚡ Exness ক্রিপ্টো
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-400 block font-sans">
                              {trade.sourceNameBn}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Entry Price */}
                      <td className="p-3 text-slate-200">
                        <div className="font-bold text-slate-100 font-mono text-[13px]">
                          ${formatPrice(trade.entryPrice)}
                        </div>
                        <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                          {new Date(trade.openedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Live Market Price Column */}
                      <td className="p-3 font-mono">
                        {trade.currentPrice ? (
                          <div>
                            <div className="flex items-center gap-1.5 font-black text-slate-100 text-[13px]">
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                              )}
                              ${formatPrice(trade.currentPrice)}
                            </div>
                            {(() => {
                              const diffPcnt =
                                trade.entryPrice > 0
                                  ? ((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100
                                  : 0;
                              const isPositive = diffPcnt >= 0;
                              return (
                                <span
                                  className={`text-[10px] font-bold block mt-0.5 ${
                                    isPositive ? 'text-emerald-400' : 'text-red-400'
                                  }`}
                                >
                                  {isPositive ? '▲ +' : '▼ '}
                                  {diffPcnt.toFixed(2)}%
                                </span>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-sans">সিঙ্কিং...</span>
                        )}
                      </td>

                      {/* TP1 & TP2 */}
                      <td className="p-3 text-emerald-400 font-bold">
                        <div>TP1: ${formatPrice(trade.tp1)}</div>
                        <div className="text-[10px] text-slate-300 font-normal">
                          TP2: ${formatPrice(trade.tp2)}
                        </div>
                        {trade.veteranEnhancement && (
                          <div className="text-[9.5px] text-amber-400 font-mono font-bold mt-0.5">
                            🚀 প্রাতিষ্ঠানিক TP২: ${formatPrice(trade.veteranEnhancement.veteranExtendedTp2)}
                          </div>
                        )}
                        {trade.pipTarget && (
                          <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                            🎯 +{trade.pipTarget} pips
                          </div>
                        )}
                      </td>

                      {/* SL */}
                      <td className="p-3 text-red-400">
                        <div>${formatPrice(trade.sl)}</div>
                        {trade.isBreakEvenLocked && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.2 rounded block mt-0.5 w-max">
                            🛡️ ব্রেক-ইভেন লক (জিরো-রিস্ক)
                          </span>
                        )}
                        {trade.pipRisk && (
                          <div className="text-[9px] text-red-400 font-mono mt-0.5">
                            ঝুঁকি: {trade.pipRisk} pips
                          </div>
                        )}
                      </td>

                      {/* PnL */}
                      <td className="p-3">
                        <span
                          className={`text-sm font-black ${
                            isPnlPositive ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isPnlPositive ? '+' : ''}
                          {pnl.toFixed(2)}%
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {isActive ? '(ফ্লোটিং)' : '(অর্জিত)'}
                        </span>
                      </td>

                      {/* Learning Note & Institutional Rationale */}
                      <td className="p-3 max-w-xs font-sans text-xs">
                        <p className="text-slate-300 leading-snug line-clamp-2">
                          {trade.learningNoteBn}
                        </p>
                        {trade.veteranEnhancement ? (
                          <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-1 mt-1 font-sans">
                            🎓 <strong>১২-১৩Y নোট:</strong> {trade.veteranEnhancement.wisdomSummaryBn}
                          </div>
                        ) : trade.aiCorrectionRuleBn ? (
                          <span className="text-[10px] text-amber-400 block mt-1 line-clamp-1 font-semibold">
                            💡 {trade.aiCorrectionRuleBn}
                          </span>
                        ) : null}
                      </td>

                      {/* Action */}
                      <td className="p-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!isAnyExness && (
                            <button
                              type="button"
                              onClick={() => {
                                const coin = tickers.find((t) => t.symbol === trade.symbol);
                                if (coin) onSelectCoin(coin);
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="চার্ট দেখুন"
                            >
                              চার্ট &rarr;
                            </button>
                          )}
                          <span
                            className="px-2 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono flex items-center gap-1 shrink-0"
                            title="সিগন্যালের সঠিক এন্ট্রি, TP১, TP২ ও SL ১০০% অপরিবর্তিত ও সুরক্ষিত"
                          >
                            <Lock className="w-3 h-3 text-amber-400" />
                            সিগন্যাল লকড
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Live Trade Interactive Modal */}
      {showAddLiveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl relative space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-100 flex items-center gap-2">
                    লাইভ কয়েন থেকে ট্রেড যুক্ত করুন
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      🔴 রিয়েল-টাইম
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    বাইবিট বর্তমান লাইভ মার্কেট ডাটা ব্যবহার করে ভার্চুয়াল এআই ট্রেড মেমোরিতে যুক্ত করুন।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLiveModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmAddLiveTrade} className="space-y-4">
              {/* Coin Quick Selector & Search */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  কয়েন নির্বাচন করুন:
                </label>
                {/* Popular Quick Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'SUIUSDT', 'PEPEUSDT'].map(
                    (sym) => {
                      const isSelected = selectedCoinSymbol === sym;
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => setSelectedCoinSymbol(sym)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                              : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {sym.replace('USDT', '')}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Search / Dropdown */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="অন্যান্য কয়েন খুঁজুন (উদা: ADA, LINK, NEAR)..."
                      value={coinSearchQuery}
                      onChange={(e) => setCoinSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <select
                    value={selectedCoinSymbol}
                    onChange={(e) => setSelectedCoinSymbol(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {tickers
                      .filter((t) =>
                        coinSearchQuery
                          ? t.symbol.toLowerCase().includes(coinSearchQuery.toLowerCase())
                          : true
                      )
                      .map((t) => (
                        <option key={t.symbol} value={t.symbol}>
                          {t.baseCoin || t.symbol.replace('USDT', '')} (${formatPrice(t.lastPrice)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Selected Coin Live Stats Card */}
              {currentModalCoin && (
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[11px]">বাইবিট বর্তমান লাইভ প্রাইজ:</span>
                    <span className="text-base font-black text-amber-400">
                      ${formatPrice(currentModalCoin.lastPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">২৪ ঘণ্টার পরিবর্তন:</span>
                    <span
                      className={`font-bold ${
                        (currentModalCoin.price24hPcnt || 0) >= 0
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }`}
                    >
                      {(currentModalCoin.price24hPcnt || 0) >= 0 ? '+' : ''}
                      {((currentModalCoin.price24hPcnt || 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Direction: LONG vs SHORT */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">ট্রেডের দিক (Direction):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModalDirection('LONG')}
                    className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border ${
                      modalDirection === 'LONG'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    🟢 LONG (বাই)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalDirection('SHORT')}
                    className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border ${
                      modalDirection === 'SHORT'
                        ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/20'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    🔴 SHORT (সেল)
                  </button>
                </div>
              </div>

              {/* Targets: Entry, TP1, TP2, SL */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    এন্ট্রি প্রাইজ ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customEntryPrice}
                    onChange={(e) => setCustomEntryPrice(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-400 block mb-1">
                    TP1 টার্গেট ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customTp1}
                    onChange={(e) => setCustomTp1(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                    TP2 টার্গেট ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customTp2}
                    onChange={(e) => setCustomTp2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-red-400 block mb-1">
                    স্টপ লস SL ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customSl}
                    onChange={(e) => setCustomSl(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-red-400 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              {/* Swing SL Support/Resistance Explanation Note */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  🛡️ <strong>সুইং বাফার:</strong> সাপোর্ট/রেজিস্ট্যান্স লেভেলের সামান্য নিচে (১.৮% - ২.৫% বাফার) অটোমেটিক স্টপ লস সেট করা হয়েছে যাতে সহজে লিকুইডিটি উইক হিট না করে।
                </span>
              </div>

              {/* Trade Note / Reason */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  ট্রেডের কারণ / স্ট্র্যাটেজি নোট:
                </label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLiveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/25"
                >
                  <Zap className="w-4 h-4" />
                  🚀 মেমোরিতে লাইভ ট্রেড শুরু করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
