import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Brain,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Radio,
  SlidersHorizontal,
  Lock,
  Send,
  BookmarkPlus,
  Check,
  X,
  Search,
  Activity,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import {
  TwelveCouncilEngineService,
  TwelveCouncilFullVerdict,
  CouncilMemberAnalysis
} from '../../services/aiCouncilPro/twelveCouncilEngine';
import { CanonicalPriceRecord } from '../../services/aiCouncilPro/centralPriceStore';
import {
  TradeStyleMode,
  SlBufferMode,
  SL_BUFFER_PRESETS,
  TradeStyleAnalyzerService
} from '../../services/aiCouncilPro/tradeStyleAnalyzer';
import { formatPrice } from '../../utils/formatters';
import { RiskManagerGuardShield } from './RiskManagerGuardShield';
import { TelegramAlertService } from '../../services/aiCouncilPro/telegramAlertService';
import { TradeJournalService } from '../../services/aiCouncilPro/tradeJournalService';

interface TwelveCouncilInteractiveRoomProps {
  asset: CanonicalPriceRecord;
  availableAssets?: CanonicalPriceRecord[];
  onSelectAsset?: (symbol: string) => void;
  activeTradeStyle?: TradeStyleMode;
  onTradeStyleChange?: (style: TradeStyleMode) => void;
  onExecuteBybitTrade?: (target: any) => void;
}

export const TwelveCouncilInteractiveRoom: React.FC<TwelveCouncilInteractiveRoomProps> = ({
  asset,
  availableAssets = [],
  onSelectAsset,
  activeTradeStyle,
  onTradeStyleChange,
  onExecuteBybitTrade,
}) => {
  const [verdict, setVerdict] = useState<TwelveCouncilFullVerdict | null>(null);
  const [isDeliberating, setIsDeliberating] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CouncilMemberAnalysis | null>(null);
  const [showDebateTranscript, setShowDebateTranscript] = useState(true);
  const [coinSearchQuery, setCoinSearchQuery] = useState('');
  const [isCoinPickerOpen, setIsCoinPickerOpen] = useState(false);

  const [slBufferMode, setSlBufferMode] = useState<SlBufferMode>(() => {
    const profile = TradeStyleAnalyzerService.getUserProfile();
    return profile.slBufferMode || 'SAFE_STRUCTURAL';
  });

  // Quick Action States
  const [tgSending, setTgSending] = useState(false);
  const [tgStatusMessage, setTgStatusMessage] = useState<string | null>(null);
  const [journalSaved, setJournalSaved] = useState(false);

  // Trigger council deliberation: anchors Entry, SL, and TP levels so they stay fixed/stable
  const runDeliberation = (overrideBuffer?: SlBufferMode) => {
    setIsDeliberating(true);
    const bufferToUse = overrideBuffer || slBufferMode;
    setTimeout(() => {
      const res = TwelveCouncilEngineService.runCouncilDeliberation(
        asset,
        activeTradeStyle,
        bufferToUse
      );
      setVerdict(res);
      setIsDeliberating(false);
    }, 350);
  };

  const handleSlBufferChange = (newMode: SlBufferMode) => {
    setSlBufferMode(newMode);
    const profile = TradeStyleAnalyzerService.getUserProfile();
    TradeStyleAnalyzerService.saveUserProfile({
      ...profile,
      slBufferMode: newMode,
    });
    runDeliberation(newMode);
  };

  // Only re-deliberate when the user switches asset symbol or changes trade style.
  // CRITICAL: asset.price is intentionally omitted to keep TP & SL completely stable/fixed (স্থির),
  // preventing fluctuating/jumping values on live websocket price ticks.
  useEffect(() => {
    runDeliberation();
  }, [asset.symbol, activeTradeStyle]);

  if (!verdict) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">
          ১২ জন সিনিয়র ট্রেডার কাউন্সিল যুক্ত হচ্ছেন এবং লাইভ ডাটা অডিট করছেন...
        </p>
      </div>
    );
  }

  const isPositive = asset.price24hPcnt >= 0;
  const isStrongBuy = verdict.overallVerdict === 'STRONG_BUY';
  const isBuy = verdict.overallVerdict === 'BUY';
  const isWait = verdict.overallVerdict === 'WAIT_NO_TRADE';
  const isSell = verdict.overallVerdict === 'SELL' || verdict.overallVerdict === 'STRONG_SELL';

  const verdictColorClass = isStrongBuy || isBuy
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
    : isWait
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
    : 'bg-rose-500/15 text-rose-300 border-rose-500/40';

  const livePrice = asset.price > 0 ? asset.price : verdict.canonicalPrice;

  // Real-time distance percentages from current live market price to fixed TP/SL levels
  const distToSL = livePrice > 0 ? ((verdict.stopLoss - livePrice) / livePrice) * 100 : 0;
  const distToTP1 = livePrice > 0 ? ((verdict.takeProfit1 - livePrice) / livePrice) * 100 : 0;
  const distToTP2 = livePrice > 0 ? ((verdict.takeProfit2 - livePrice) / livePrice) * 100 : 0;
  const distToTP3 = livePrice > 0 ? ((verdict.takeProfit3 - livePrice) / livePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header & Master Verdict Hero Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                <Brain className="w-4 h-4 animate-pulse" />
                <span>১২ সিনিয়র কাউন্সিল ডিসিশন রুম</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                ⭐ ১২ প্রাতিষ্ঠানিক বিশেষজ্ঞ
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>{asset.source === 'WEBSOCKET_LIVE' ? 'LIVE WS (P1)' : asset.source === 'EXNESS_FEED' ? 'EXNESS VIP' : 'REST (P2)'}</span>
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap pt-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono">
                {asset.baseCoin}
                <span className="text-slate-500 text-base sm:text-lg">/{asset.quoteCoin}</span>
              </h2>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                ${formatPrice(asset.price)}
              </span>
              <span
                className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                  isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isPositive ? '+' : ''}{(asset.price24hPcnt * 100).toFixed(2)}%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              সেন্ট্রাল প্রাইস স্টোর ভেরিফায়েড। ১২ জন অভিজ্ঞ ট্রেডারের সমন্বিত টেকনিক্যাল বিশ্লেষণ ও ভোট গ্রহণ সম্পন্ন।
            </p>

            {/* Quick Coin Switcher Bar */}
            {onSelectAsset && (
              <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1 mr-1">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>কুইক সুইচ:</span>
                </span>
                {[
                  { sym: 'BTCUSDT', label: 'BTC' },
                  { sym: 'ETHUSDT', label: 'ETH' },
                  { sym: 'SOLUSDT', label: 'SOL' },
                  { sym: 'XAUUSD', label: '👑 GOLD' },
                  { sym: 'BNBUSDT', label: 'BNB' },
                  { sym: 'DOGEUSDT', label: 'DOGE' },
                  { sym: 'XRPUSDT', label: 'XRP' },
                  { sym: 'PEPEUSDT', label: 'PEPE' },
                  { sym: 'SUIUSDT', label: 'SUI' },
                ].map((item) => {
                  const isActive = asset.symbol === item.sym;
                  return (
                    <button
                      key={item.sym}
                      type="button"
                      onClick={() => onSelectAsset(item.sym)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/20'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* Dropdown / Search for any other coin */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCoinPickerOpen(!isCoinPickerOpen)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition"
                  >
                    <Search className="w-3 h-3" />
                    <span>অন্যান্য কয়েন...</span>
                  </button>

                  {isCoinPickerOpen && (
                    <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-64 p-2 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl z-50 space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={coinSearchQuery}
                          onChange={(e) => setCoinSearchQuery(e.target.value)}
                          placeholder="সার্চ কয়েন (e.g. ADA, AVAX)..."
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                        {availableAssets
                          .filter((a) =>
                            !coinSearchQuery.trim() ||
                            a.symbol.toUpperCase().includes(coinSearchQuery.toUpperCase().trim()) ||
                            a.baseCoin.toUpperCase().includes(coinSearchQuery.toUpperCase().trim())
                          )
                          .slice(0, 15)
                          .map((a) => (
                            <button
                              key={a.symbol}
                              type="button"
                              onClick={() => {
                                onSelectAsset(a.symbol);
                                setIsCoinPickerOpen(false);
                                setCoinSearchQuery('');
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                                a.symbol === asset.symbol
                                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="font-mono font-bold">{a.baseCoin}/{a.quoteCoin}</span>
                              <span className="font-mono text-[11px] text-slate-400">${formatPrice(a.price)}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Re-deliberate Button & Consensus Pill */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right w-full sm:w-auto">
              <div className="text-[10px] text-slate-400 font-bold uppercase">কাউন্সিল কনসেনসাস স্কোর</div>
              <div className="text-xl font-black text-indigo-400 font-mono">
                {verdict.consensusScorePcnt}%
                <span className="text-xs text-slate-500 ml-1">({verdict.buyVotes}/{verdict.totalMembers} ভোট)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={runDeliberation}
              disabled={isDeliberating}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDeliberating ? 'animate-spin' : ''}`} />
              <span>{isDeliberating ? 'কাউন্সিল বিচার করছে...' : 'পুনর্বিচার চালান (Re-Audit)'}</span>
            </button>
          </div>
        </div>

        {/* Master Verdict Banner */}
        <div className={`p-4 rounded-2xl border ${verdictColorClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {verdict.verdictLabelBn}
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-200">
              {verdict.verdictDescriptionBn}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-black/40 border border-white/10 font-mono">
              স্টাইল: {verdict.tradeStyle} ({verdict.timeframe})
            </span>
          </div>
        </div>

        {/* Stable Levels Anchor Notification Bar & SL Buffer Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px]">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="font-black text-emerald-400">🔒 ট্রেড সেটআপ স্থির:</span>
            <span className="text-slate-400">মার্কেট ফ্ল্যাকচুয়েশনেও লেভেল স্থির থাকে।</span>
            <span className="text-slate-500 font-mono text-[10px]">
              অডিট: <strong className="text-slate-300 font-bold">${formatPrice(verdict.canonicalPrice)}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* SL Buffer Mode Controller */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>SL বাফার:</span>
              </span>
              {(['TIGHT', 'SAFE_STRUCTURAL', 'WIDE_CUSHION'] as SlBufferMode[]).map((mode) => {
                const conf = SL_BUFFER_PRESETS[mode];
                const isActive = (verdict.slBufferMode || slBufferMode) === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleSlBufferChange(mode)}
                    disabled={isDeliberating}
                    title={conf.descriptionBn}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{mode === 'SAFE_STRUCTURAL' ? '🛡️ নিরাপদ' : mode === 'WIDE_CUSHION' ? '🌊 অতিরিক্ত' : 'টাইট'}</span>
                    <span className="text-[9px] font-mono opacity-80">({conf.multiplier}x)</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => runDeliberation()}
              disabled={isDeliberating}
              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/30 transition disabled:opacity-50"
              title="বর্তমান লাইভ মার্কেট প্রাইসে নতুন করে লেভেল ক্যালকুলেট করুন"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isDeliberating ? 'animate-spin' : ''}`} />
              <span>নতুন প্রাইসে রি-ক্যালকুলেট</span>
            </button>
          </div>
        </div>

        {/* Executable Architecture Grid: 7 Stable Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">এন্ট্রি জোন</div>
            <div className="text-xs sm:text-sm font-black text-slate-100 font-mono mt-0.5">
              ${formatPrice(verdict.entryZone[0])} - ${formatPrice(verdict.entryZone[1])}
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">স্থির জোন</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 ring-1 ring-rose-500/20">
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>শিল্ডেড SL</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {verdict.stopLossDistancePcnt ? `-${verdict.stopLossDistancePcnt.toFixed(1)}%` : 'নিরাপদ বাফার'}
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-rose-300 font-mono mt-0.5">
              ${formatPrice(verdict.stopLoss)}
            </div>
            <div className="text-[9px] text-rose-400/90 font-mono mt-0.5 flex items-center justify-between">
              <span>বাকি: {distToSL > 0 ? '+' : ''}{distToSL.toFixed(2)}%</span>
              <span className="text-[8px] text-slate-400 font-sans">
                {verdict.slBufferMode === 'WIDE_CUSHION' ? '🌊 কুশন' : verdict.slBufferMode === 'TIGHT' ? 'টাইট' : '🛡️ কাঠামোগত'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">টার্গেট ১ (TP1)</div>
            <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono mt-0.5">
              ${formatPrice(verdict.takeProfit1)}
            </div>
            <div className="text-[9px] text-emerald-400/90 font-mono mt-0.5">
              বাকি: {distToTP1 > 0 ? '+' : ''}{distToTP1.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">টার্গেট ২ (TP2)</div>
            <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono mt-0.5">
              ${formatPrice(verdict.takeProfit2)}
            </div>
            <div className="text-[9px] text-emerald-400/90 font-mono mt-0.5">
              বাকি: {distToTP2 > 0 ? '+' : ''}{distToTP2.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400 font-bold uppercase">টার্গেট ৩ (TP3)</div>
            <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono mt-0.5">
              ${formatPrice(verdict.takeProfit3)}
            </div>
            <div className="text-[9px] text-emerald-400/90 font-mono mt-0.5">
              বাকি: {distToTP3 > 0 ? '+' : ''}{distToTP3.toFixed(2)}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">রিস্ক-রিওয়ার্ড</div>
            <div className="text-xs sm:text-sm font-black text-indigo-400 font-mono mt-0.5">
              {verdict.riskRewardRatio}
            </div>
            <div className="text-[9px] text-slate-500 font-mono mt-0.5">কনজারভেটিভ</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-bold uppercase">লেভারেজ</div>
            <div className="text-xs sm:text-sm font-black text-amber-400 font-mono mt-0.5">
              {verdict.recommendedLeverage}
            </div>
            <div className="text-[9px] text-amber-500/80 font-mono mt-0.5">রিস্ক গাইড</div>
          </div>
        </div>

        {/* Quick Action Bar: Send to Telegram & Save to Trade Journal */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={tgSending}
              onClick={async () => {
                setTgSending(true);
                setTgStatusMessage(null);
                const res = await TelegramAlertService.sendCouncilVerdictAlert(verdict);
                setTgSending(false);
                if (res.success) {
                  setTgStatusMessage(res.simulated ? 'টেলিগ্রামে সিমুলেটেড অ্যালার্ট পাঠানো হয়েছে (Demo mode)' : 'টেলিগ্রামে সরাসরি সিগন্যাল পাঠানো হয়েছে!');
                } else {
                  setTgStatusMessage(res.error || 'টেলিগ্রামে পাঠাতে ব্যর্থ হয়েছে।');
                }
                setTimeout(() => setTgStatusMessage(null), 4000);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/25 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${tgSending ? 'animate-pulse' : ''}`} />
              <span>{tgSending ? 'পাঠানো হচ্ছে...' : 'টেলিগ্রামে সিগন্যাল পাঠান (Send Alert)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                TradeJournalService.addRecordFromCouncil(verdict);
                setJournalSaved(true);
                setTimeout(() => setJournalSaved(false), 3000);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center justify-center gap-2 transition border border-slate-700 shadow"
            >
              {journalSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />}
              <span>{journalSaved ? 'জার্নালে সংরক্ষিত!' : 'জার্নালে সংরক্ষণ (Save to Journal)'}</span>
            </button>

            {/* Bybit 1-Click Trade Execution Button */}
            {onExecuteBybitTrade && (
              <button
                type="button"
                onClick={() => {
                  const currentPrice = asset.price > 0 ? asset.price : verdict.canonicalPrice;
                  const isBuy = verdict.overallVerdict === 'STRONG_BUY' || verdict.overallVerdict === 'BUY';
                  const isSell = verdict.overallVerdict === 'STRONG_SELL' || verdict.overallVerdict === 'SELL';
                  const direction: 'LONG' | 'SHORT' = isBuy ? 'LONG' : isSell ? 'SHORT' : 'LONG';
                  const tp1Pcnt = currentPrice > 0 ? Math.abs((verdict.takeProfit1 - currentPrice) / currentPrice) * 100 : 0;
                  const slPcnt = currentPrice > 0 ? Math.abs((currentPrice - verdict.stopLoss) / currentPrice) * 100 : 0;

                  onExecuteBybitTrade({
                    symbol: asset.symbol,
                    baseCoin: asset.baseCoin,
                    direction,
                    currentPrice,
                    entryZoneMin: verdict.entryZone[0],
                    entryZoneMax: verdict.entryZone[1],
                    tp1: verdict.takeProfit1,
                    tp2: verdict.takeProfit2,
                    sl: verdict.stopLoss,
                    tp1Pcnt,
                    slPcnt,
                    winRate: Math.round(verdict.consensusScorePcnt),
                    reasonBn: `AI Council Pro ১২ জন সিনিয়র বিশেষজ্ঞের কনসেনসাস (${verdict.buyVotes} বাই, ${verdict.waitVotes} ওয়েট, ${verdict.sellVotes} সেল)। রায়: ${verdict.verdictLabelBn}। ট্রেড স্টাইল: ${verdict.tradeStyle}।`,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition shadow-lg shadow-amber-500/25 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>⚡ Bybit এ ১-ক্লিক ট্রেড</span>
              </button>
            )}
          </div>

          {tgStatusMessage && (
            <span className="text-xs text-sky-400 font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tgStatusMessage}</span>
            </span>
          )}

          {journalSaved && !tgStatusMessage && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ট্রেডটি সফলভাবে জার্নালে সংরক্ষিত হয়েছে!</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. 12 Senior Institutional Members Votes Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-black text-slate-100">
              ১২ জন সিনিয়র ট্রেডারের পৃথক ভোট ও অ্যানালাইসিস
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {verdict.buyVotes} বাই • {verdict.waitVotes} ওয়েট • {verdict.sellVotes} সেল
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {verdict.members.map((m) => {
            const isMemberBuy = m.vote === 'BUY';
            const isMemberWait = m.vote === 'WAIT';

            const voteBadgeClass = isMemberBuy
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isMemberWait
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40';

            return (
              <div
                key={m.traderId}
                onClick={() => setSelectedMember(m)}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between group shadow-lg cursor-pointer space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Member Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl ${m.avatarBg} flex items-center justify-center text-white font-bold text-xs shadow-md`}
                      >
                        {m.nameEn.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {m.nameBn}
                        </h4>
                        <div className="text-[10px] text-slate-400">
                          {m.experienceYears} বছর অভিজ্ঞতা • {m.roleBn.split(' ')[0]}
                        </div>
                      </div>
                    </div>

                    {/* Member Vote */}
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono border ${voteBadgeClass}`}
                      >
                        {m.vote}
                      </span>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                        {m.confidenceScore}% কনফিডেন্স
                      </div>
                    </div>
                  </div>

                  {/* Specialty Tag */}
                  <div className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/20 line-clamp-1">
                    🎯 {m.specialtyBn}
                  </div>

                  {/* Technical Reasoning */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {m.technicalReasoningBn}
                  </p>

                  {/* Risk Warning (if any) */}
                  {m.riskWarningBn && (
                    <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                      <span>{m.riskWarningBn}</span>
                    </div>
                  )}
                </div>

                {/* Key Levels Footer */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>সাপোর্ট: ${formatPrice(m.keySupportLevel)}</span>
                  <span>রেজিস্ট্যান্স: ${formatPrice(m.keyResistanceLevel)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Risk Manager Guard & Drawdown Shield */}
      <RiskManagerGuardShield
        currentPrice={verdict.canonicalPrice}
        stopLossPrice={verdict.stopLoss}
        takeProfitPrice={verdict.takeProfit1}
        assetSymbol={verdict.symbol}
        isLong={verdict.overallVerdict !== 'SELL' && verdict.overallVerdict !== 'STRONG_SELL'}
      />

      {/* 4. Interactive Debate Transcript Accordion */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-xl space-y-3">
        <button
          type="button"
          onClick={() => setShowDebateTranscript(!showDebateTranscript)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm sm:text-base font-black text-slate-100">
              কাউন্সিল সরাসরি বিতর্ক ও অডিট ট্রান্সক্রিপ্ট (Live Debate Transcript)
            </h3>
          </div>
          {showDebateTranscript ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showDebateTranscript && (
          <div className="space-y-3 pt-2">
            {verdict.debateTranscript.map((round, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div
                  className={`w-7 h-7 rounded-lg ${round.avatarBg} flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-0.5`}
                >
                  {i + 1}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-black text-slate-200">
                      {round.speakerNameBn}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {round.timestamp} • {round.stage}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {round.statementBn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Institutional Trader Full Audit Modal (When clicking any of the 12 Council members) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl ${selectedMember.avatarBg} flex items-center justify-center text-white text-base font-black shadow-lg`}
                >
                  {selectedMember.nameEn.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-slate-100">
                      {selectedMember.nameBn}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      ({selectedMember.nameEn})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-indigo-400">{selectedMember.roleBn}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedMember.experienceYears}+ বছর অভিজ্ঞতা</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specialist Vote & Confidence Score Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  ব্যক্তিগত ভোটিং ডিসিশন
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 ${
                      selectedMember.vote === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedMember.vote === 'SELL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedMember.vote === 'BUY' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                    {selectedMember.vote === 'SELL' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                    {selectedMember.vote === 'WAIT' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    <span>
                      {selectedMember.vote === 'BUY' ? 'বাই (BUY)' : selectedMember.vote === 'SELL' ? 'সেল (SELL)' : 'অপেক্ষা (WAIT)'}
                    </span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    কনফিডেন্স: <strong className="text-indigo-400 font-bold">{selectedMember.confidenceScore}%</strong>
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold block">অ্যাসেট</span>
                <span className="text-sm font-mono font-black text-slate-200">{asset.baseCoin}/{asset.quoteCoin}</span>
              </div>
            </div>

            {/* Trading Methodology & Specialty */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>ট্রেডিং স্পেশালিটি ও মেথডলজি</span>
              </span>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                {selectedMember.specialtyBn}
              </div>
            </div>

            {/* Detailed Technical Reasoning */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>বিস্তারিত টেকনিক্যাল লজিক ও অডিট রায়</span>
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                <p>{selectedMember.technicalReasoningBn}</p>
              </div>
            </div>

            {/* Key Price Levels */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">সাপোর্ট লেভেল</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                  ${formatPrice(selectedMember.keySupportLevel)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-bold text-rose-400 block uppercase">রেজিস্ট্যান্স</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                  ${formatPrice(selectedMember.keyResistanceLevel)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 block uppercase">ইনভ্যালিডেশন (SL)</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-100">
                  ${formatPrice(selectedMember.invalidationLevel)}
                </span>
              </div>
            </div>

            {/* Risk Warning & Invalidation (if any) */}
            {selectedMember.riskWarningBn && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-200">সতর্কবার্তা ও ঝুঁকি ব্যবস্থাপনা:</span>
                  <p className="mt-0.5 leading-relaxed">{selectedMember.riskWarningBn}</p>
                </div>
              </div>
            )}

            {/* Action Buttons in Modal */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                বন্ধ করুন
              </button>

              {onExecuteBybitTrade && selectedMember.vote !== 'WAIT' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentPrice = asset.price > 0 ? asset.price : verdict?.canonicalPrice || selectedMember.keySupportLevel;
                    const direction: 'LONG' | 'SHORT' = selectedMember.vote === 'BUY' ? 'LONG' : 'SHORT';
                    const targetTP = selectedMember.vote === 'BUY' ? selectedMember.keyResistanceLevel : selectedMember.keySupportLevel;
                    const targetSL = selectedMember.invalidationLevel;
                    const tp1Pcnt = currentPrice > 0 ? Math.abs((targetTP - currentPrice) / currentPrice) * 100 : 0;
                    const slPcnt = currentPrice > 0 ? Math.abs((currentPrice - targetSL) / currentPrice) * 100 : 0;

                    onExecuteBybitTrade({
                      symbol: asset.symbol,
                      baseCoin: asset.baseCoin,
                      direction,
                      currentPrice,
                      tp1: targetTP,
                      sl: targetSL,
                      tp1Pcnt,
                      slPcnt,
                      winRate: selectedMember.confidenceScore,
                      reasonBn: `${selectedMember.nameBn} (${selectedMember.nameEn}) এর বিশেষজ্ঞ মতামত ও ইনভ্যালিডেশন লেভেল অনুযায়ী ট্রেড।`,
                    });
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>⚡ এই স্পেশালিস্টের লেভেলে বাইবিট ট্রেড</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
