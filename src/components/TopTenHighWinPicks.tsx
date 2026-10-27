import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Trophy,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Filter,
  DollarSign,
  Gauge,
  Target,
  BarChart2,
  Search,
  Star,
  Send,
  Bot,
  Radio,
  Mail,
  Lock,
  Unlock,
  Coins,
  Crown,
  PlayCircle,
  Gift,
  Megaphone,
  Clock,
} from 'lucide-react';
import { TickerData } from '../types';
import { formatPrice, formatFixedPrecisionPrice } from '../utils/formatters';
import { TelegramService } from '../services/telegramService';
import { telegramBotService } from '../services/telegramBot';
import { getTopTenUnifiedSignals, UnifiedSignalResult } from '../utils/unifiedSignals';
import { calculateSlEfficiency } from '../utils/slEfficiency';
import { StopLossEfficiencyMeter, SlDistanceVolatilityIcon } from './StopLossEfficiencyMeter';
import { AuthService, UserAccount, AdminSystemConfig } from '../services/authService';
import { RewardedAdModal } from './RewardedAdModal';
import { AdBannerViewer } from './AdBannerViewer';
import { TradeSignalTarget } from './BybitTradeConfirmModal';

interface TopTenHighWinPicksProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
  onOpenTelegramModal?: () => void;
  onOpenGmailModal?: () => void;
  onOpenAuth?: () => void;
  onExecuteBybitTrade?: (signal: TradeSignalTarget) => void;
  currentUser?: UserAccount | null;
}

export type HighWinSignal = UnifiedSignalResult;

export const TopTenHighWinPicks: React.FC<TopTenHighWinPicksProps> = ({
  tickers,
  onSelectCoin,
  watchlist = [],
  onToggleWatchlist,
  onOpenTelegramModal,
  onOpenGmailModal,
  onOpenAuth,
  onExecuteBybitTrade,
  currentUser: propCurrentUser,
}) => {
  const [filterCategory, setFilterCategory] = useState<
    'ALL' | 'LONG_ONLY' | 'SHORT_ONLY' | 'LOW_RISK' | 'HIGH_MOMENTUM' | 'OVERSOLD'
  >('ALL');
  const [investmentAmount, setInvestmentAmount] = useState<number>(100); // $100 default
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Monetization, Points & Rewarded Ad State
  const [systemConfig, setSystemConfig] = useState<AdminSystemConfig>(() => AuthService.getSystemConfig());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => propCurrentUser || AuthService.getCurrentUser());
  const [userPoints, setUserPoints] = useState<number>(() => AuthService.getUserPoints(currentUser));
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState<boolean>(false);
  const [targetUnlockSymbol, setTargetUnlockSymbol] = useState<string | null>(null);
  const [rewardActionNotice, setRewardActionNotice] = useState<string | null>(null);
  const [bonusClaimedToday, setBonusClaimedToday] = useState<boolean>(false);

  // Telegram Auto-Dispatch State
  const [isTelegramConfigured, setIsTelegramConfigured] = useState<boolean>(() =>
    TelegramService.isConfigured()
  );
  const [autoSendTelegram, setAutoSendTelegram] = useState<boolean>(true);
  const [isSendingTelegram, setIsSendingTelegram] = useState<boolean>(false);
  const [sendingCoinSymbol, setSendingCoinSymbol] = useState<string | null>(null);
  const [telegramNotice, setTelegramNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const lastSentHashRef = useRef<string>('');

  // Listen to system config updates (e.g. monetization toggle from admin)
  useEffect(() => {
    const handleConfigSync = () => {
      setSystemConfig({ ...AuthService.getSystemConfig() });
      refreshUserPoints();
    };
    window.addEventListener('bybit_system_config_updated', handleConfigSync);
    return () => {
      window.removeEventListener('bybit_system_config_updated', handleConfigSync);
    };
  }, []);

  // Sync user state on props change
  useEffect(() => {
    if (propCurrentUser !== undefined) {
      setCurrentUser(propCurrentUser);
      setUserPoints(AuthService.getUserPoints(propCurrentUser));
    }
  }, [propCurrentUser]);

  // Refresh points balance helper
  const refreshUserPoints = () => {
    const freshUser = AuthService.getCurrentUser();
    setCurrentUser(freshUser);
    setUserPoints(AuthService.getUserPoints(freshUser));
  };

  // Claim daily bonus
  const handleClaimDailyBonus = () => {
    const res = AuthService.claimDailyBonus(currentUser);
    if (res.success) {
      refreshUserPoints();
      setBonusClaimedToday(true);
      setRewardActionNotice(`🎉 ${res.message} (+${res.pointsAwarded} Points)`);
      setTimeout(() => setRewardActionNotice(null), 5000);
    } else {
      setRewardActionNotice(`ℹ️ ${res.message}`);
      setTimeout(() => setRewardActionNotice(null), 5000);
    }
  };

  // Direct Point Unlock Action
  const handleUnlockWithPoints = (symbol: string) => {
    const config = AuthService.getSystemConfig();
    const cost = config.pointsCostPerSignal || 10;

    if (userPoints < cost) {
      // Prompt Ad modal to get points
      setTargetUnlockSymbol(symbol);
      setIsRewardedAdOpen(true);
      return;
    }

    const res = AuthService.unlockSignalWithPoints(symbol, currentUser);
    if (res.success) {
      refreshUserPoints();
      setRewardActionNotice(`🔓 ${symbol} সিগন্যালটি সফলভাবে আনলক হয়েছে! (-${cost} Points)`);
      setTimeout(() => setRewardActionNotice(null), 4000);
    } else {
      setTargetUnlockSymbol(symbol);
      setIsRewardedAdOpen(true);
    }
  };

  // Multi-Factor High-Win Calculation Engine (Single Source of Truth)
  const topTenSignals = useMemo(() => {
    return getTopTenUnifiedSignals(tickers);
  }, [tickers]);

  // Filter signals based on tab selection & search
  const filteredSignals = useMemo(() => {
    return topTenSignals.filter((sig) => {
      // Category filter
      if (filterCategory === 'LONG_ONLY' && sig.positionDirection !== 'LONG') return false;
      if (filterCategory === 'SHORT_ONLY' && sig.positionDirection !== 'SHORT') return false;
      if (filterCategory === 'LOW_RISK' && sig.winRate < 90) return false;
      if (
        filterCategory === 'HIGH_MOMENTUM' &&
        sig.signalType !== 'BREAKOUT_MOMENTUM'
      )
        return false;
      if (
        filterCategory === 'OVERSOLD' &&
        sig.signalType !== 'OVERSOLD_RESCUE'
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          sig.coin.symbol.toLowerCase().includes(q) ||
          sig.coin.baseCoin.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [topTenSignals, filterCategory, searchQuery]);

  // Stable signature of top 10 signal symbols and directions so effects only run when signals change
  const signalsSignature = useMemo(() => {
    return topTenSignals.map((s) => `${s.coin.symbol}_${s.positionDirection}`).join('|');
  }, [topTenSignals]);

  // Auto-Dispatch Top 10 High Win Signals to Telegram Channel via Background Bot Service
  useEffect(() => {
    const configured = TelegramService.isConfigured();
    setIsTelegramConfigured((prev) => (prev !== configured ? configured : prev));

    if (!configured || !autoSendTelegram || topTenSignals.length === 0) {
      return;
    }

    telegramBotService.processAndPushSignals(topTenSignals, false).then((res) => {
      if (res.success && res.dispatchedCount > 0) {
        setTelegramNotice({
          type: 'success',
          text: `🟢 ব্যাকগ্রাউন্ড সার্ভিস (telegramBot.ts): নতুন ${res.dispatchedCount}টি সেরা ক্রিপ্টো সিগন্যাল টেলিগ্রাম বটে অটো সেন্ড করা হয়েছে!`,
        });
      } else if (!res.success && res.error) {
        setTelegramNotice({
          type: 'error',
          text: res.error,
        });
      }
    });
  }, [signalsSignature, autoSendTelegram]);

  const handleSendAllToTelegram = async () => {
    if (!TelegramService.isConfigured()) {
      if (onOpenTelegramModal) {
        onOpenTelegramModal();
      } else {
        setTelegramNotice({
          type: 'error',
          text: 'টেলিগ্রাম বটের টোকেন এবং চ্যানেল আইডি কনফিগার করা নেই।',
        });
      }
      return;
    }

    setIsSendingTelegram(true);
    setTelegramNotice({
      type: 'info',
      text: 'টেলিগ্রাম চ্যানেলে সিগন্যাল পোস্ট করা হচ্ছে...',
    });

    const res = await telegramBotService.processAndPushSignals(topTenSignals, true);
    setIsSendingTelegram(false);

    if (res.success) {
      setTelegramNotice({
        type: 'success',
        text: '🎉 সফলভাবে সেরা ১০টি ক্রিপ্টো সিগন্যাল টেলিগ্রাম বটে পাঠানো হয়েছে!',
      });
    } else {
      setTelegramNotice({
        type: 'error',
        text: res.error || 'টেলিগ্রামে বার্তা পাঠানো সম্ভব হয়নি।',
      });
    }
  };

  const handleSendSingleCoinToTelegram = async (sig: HighWinSignal) => {
    if (!TelegramService.isConfigured()) {
      if (onOpenTelegramModal) onOpenTelegramModal();
      else {
        setTelegramNotice({
          type: 'error',
          text: 'টেলিগ্রাম বটের টোকেন সেটআপ করা নেই।',
        });
      }
      return;
    }

    setSendingCoinSymbol(sig.coin.symbol);
    const res = await telegramBotService.pushSingleSignal(sig);
    setSendingCoinSymbol(null);

    if (res.success) {
      setTelegramNotice({
        type: 'success',
        text: `✅ ${sig.coin.symbol} সিগন্যালটি টেলিগ্রাম চ্যানেলে সফলভাবে পাঠানো হয়েছে!`,
      });
    } else {
      setTelegramNotice({
        type: 'error',
        text: res.error || 'পাঠাতে ব্যর্থ হয়েছে।',
      });
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Rank Badge Render Helper
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center gap-1 bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-xl text-xs shadow-lg shadow-amber-500/30 border border-amber-300">
          <Trophy className="w-3.5 h-3.5 fill-slate-950" />
          RANK #1 (TOP PICK)
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center gap-1 bg-slate-300 text-slate-950 font-black px-2.5 py-1 rounded-xl text-xs border border-white">
          <Trophy className="w-3.5 h-3.5 fill-slate-950" />
          RANK #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center gap-1 bg-amber-700 text-amber-100 font-black px-2.5 py-1 rounded-xl text-xs border border-amber-500">
          <Trophy className="w-3.5 h-3.5 fill-amber-100" />
          RANK #3
        </span>
      );
    }
    return (
      <span className="bg-slate-800 text-slate-300 font-extrabold font-mono px-2.5 py-1 rounded-xl text-xs border border-slate-700">
        RANK #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans text-xs animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 p-4 sm:p-6 rounded-2xl border border-amber-500/40 shadow-2xl relative overflow-hidden space-y-3">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 shadow-lg shadow-amber-500/20">
              <Trophy className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                  🎯 ৮০ - ১০০% উইন রেট টপ ১০ ক্রিপ্টো সিগন্যাল (Top 10 High Win Signals)
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  90%+ ACCURACY
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Bybit V5 লাইভ ডাটা, RSI ডাইভারজেন্স, ভলিউম অ্যানোমালি এবং এআই কনফ্লুয়েন্স বিশ্লেষণ করে সেরা ১০টি ঝুঁকিমুক্ত ট্রেড এন্ট্রি জোন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 self-start md:self-auto shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>সিগন্যাল রিফ্রেশ করুন</span>
          </button>
        </div>

        {/* Investment Amount Profit Estimator Input Bar */}
        <div className="bg-slate-950/90 p-3 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                আনুমানিক প্রফিট ক্যালকুলেটর (Profit Calculator)
              </span>
              <span className="text-[10px] text-slate-400">
                আপনার ট্রেড বাজেট ইনপুট দিয়ে সম্ভাব্য লাভ দেখুন:
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold">$</span>
            <input
              type="number"
              min="10"
              max="10000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value) || 10)}
              className="bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs font-black font-mono text-amber-400 w-28 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <span className="text-xs text-slate-400 font-medium">USDT বাজেট</span>
          </div>
        </div>

        {/* Telegram Live Broadcast Control Bar */}
        <div className="bg-slate-950/95 p-3.5 sm:p-4 rounded-xl border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
              <Send className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                  📡 টেলিগ্রাম স্বয়ংক্রিয় সিগন্যাল সেন্ট (Telegram Auto-Dispatch)
                </span>
                {isTelegramConfigured ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    🟢 অটো সেন্ড সক্রিয় (NO ADMIN NEEDED)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    ⚠️ টেলিগ্রাম বট সেটআপ করুন
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {isTelegramConfigured
                  ? 'এখানে আসা ৮০-১০০% উইন রেট সিগন্যালগুলো সাথে সাথেই টেলিগ্রাম চ্যানেলে অটো সেন্ড হবে। অ্যাডমিনকে ম্যানুয়ালি পাঠাতে হবে না।'
                  : 'টেলিগ্রাম চ্যানেলে সিগন্যালগুলো অটোমেটিক পাঠাতে টেলিগ্রাম বটের টোকেন ও চ্যানেল আইডি সেটআপ করুন।'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
            {isTelegramConfigured && (
              <button
                type="button"
                onClick={() => setAutoSendTelegram(!autoSendTelegram)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  autoSendTelegram
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${autoSendTelegram ? 'text-emerald-400 animate-pulse' : ''}`} />
                <span>{autoSendTelegram ? 'অটো-সেন্ড অন' : 'অটো-সেন্ড অফ'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendAllToTelegram}
              disabled={isSendingTelegram}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-sky-500/20 disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTelegram ? 'animate-bounce' : ''}`} />
              <span>{isSendingTelegram ? 'পাঠানো হচ্ছে...' : '📲 টেলিগ্রাম চ্যাট'}</span>
            </button>

            {onOpenGmailModal && (
              <button
                type="button"
                onClick={onOpenGmailModal}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-red-600/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>📧 Gmail ইমেইল অ্যালার্ট</span>
              </button>
            )}

            {onOpenTelegramModal && (
              <button
                type="button"
                onClick={onOpenTelegramModal}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title="টেলিগ্রাম সেটিং কনফিগার করুন"
              >
                <Bot className="w-4 h-4 text-sky-400" />
              </button>
            )}
          </div>
        </div>

        {/* Telegram Status Toast Notice */}
        {telegramNotice && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border animate-fadeIn ${
              telegramNotice.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                : telegramNotice.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                : 'bg-sky-950/90 text-sky-300 border-sky-500/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 shrink-0" />
              <span>{telegramNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setTelegramNotice(null)}
              className="text-slate-400 hover:text-slate-100 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Monetization / Open Access Notice Ribbon */}
      {!systemConfig.monetizationEnabled ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  🔥 ১০০% ফ্রি টেস্ট ও বেটা মোড সক্রিয়
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                  ALL UNLOCKED (FREE)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                সাইট প্রস্তুত ও অপ্টিমাইজেশন চলাকালীন সকল ১০টি প্রিমিয়াম ও ভিআইপি সিগন্যাল সবার জন্য সম্পূর্ণ ফ্রিতে উন্মুক্ত! কোনো পয়েন্ট বা বিজ্ঞাপনের প্রয়োজন নেই।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              🔓 ১০/১০ সিগন্যাল আনলকড
            </span>
          </div>
        </div>
      ) : (
        /* Points & Freemium Access Ribbon */
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">আপনার বর্তমান ব্যালেন্স:</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {userPoints} Points
                </span>
                {currentUser?.isVip && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                    👑 VIP UNLIMITED
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                ফ্রি ইউজাররা অ্যাড দেখে পয়েন্ট বাড়িয়ে প্রতিটি সিগন্যাল আনলক করতে পারবেন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {!currentUser?.isVip && (
              <button
                type="button"
                onClick={handleClaimDailyBonus}
                disabled={bonusClaimedToday}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-98 disabled:opacity-50"
              >
                <Gift className="w-3.5 h-3.5 text-emerald-400" />
                <span>{bonusClaimedToday ? 'বোনাস নেওয়া হয়েছে' : '🎁 ডেইলি বোনাস (+৫ pts)'}</span>
              </button>
            )}

            {!currentUser?.isVip && (
              <button
                type="button"
                onClick={() => {
                  setTargetUnlockSymbol(null);
                  setIsRewardedAdOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-98"
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>📺 অ্যাড দেখে পয়েন্ট নিন (+১০ pts)</span>
              </button>
            )}

            {!currentUser?.isVip && (
              <button
                type="button"
                onClick={() => {
                  setTargetUnlockSymbol(null);
                  setIsRewardedAdOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-md shadow-amber-500/20 active:scale-98"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>ভিআইপি আপগ্রেড</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reward Action Flash Notice */}
      {rewardActionNotice && (
        <div className="p-3 rounded-xl bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span>{rewardActionNotice}</span>
          <button
            type="button"
            onClick={() => setRewardActionNotice(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ad Banner Zone (Coinzilla / A-ADS / Partner Banner) */}
      <AdBannerViewer
        currentUser={currentUser}
        onWatchAdClick={() => {
          setTargetUnlockSymbol(null);
          setIsRewardedAdOpen(true);
        }}
      />

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: '🔥 সেরা ১০ সিগন্যাল (All Top 10)' },
            { id: 'LONG_ONLY', label: '🟢 শুধুমাত্র লং (Long)' },
            { id: 'SHORT_ONLY', label: '🔴 শুধুমাত্র শর্ট (Short)' },
            { id: 'LOW_RISK', label: '🛡️ ৯০%+ উইন অনলি (Ultra Safe)' },
            { id: 'HIGH_MOMENTUM', label: '🚀 ব্রেকআউট মোমেন্টাম (High Profit)' },
            { id: 'OVERSOLD', label: '📉 ডিপ রিবাউন্ড (Dip Rebound)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${
                filterCategory === tab.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative shrink-0 sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="কয়েন সার্চ করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Signals Cards Grid */}
      {filteredSignals.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
          <p className="font-bold text-sm">কোনো ফিল্টার করা সিগন্যাল পাওয়া যায়নি!</p>
          <p className="text-xs">অনুগ্রহ করে ফিল্টার পরিবর্তন করুন বা সার্চ ক্লিয়ার করুন।</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSignals.map((sig) => {
            const coin = sig.coin;
            const pcnt = coin.price24hPcnt * 100;
            const isPos = pcnt >= 0;
            const isWatchlisted = watchlist.includes(coin.symbol);

            // Signal is free for Rank #1 (Top pick) or if unlocked or if user is VIP/Admin or monetization disabled
            const config = AuthService.getSystemConfig();
            const isUnlocked = !config.monetizationEnabled || sig.rank === 1 || AuthService.isSignalUnlocked(coin.symbol, currentUser);

            // Estimated Profits based on investmentAmount
            const profitTp1 = (investmentAmount * (sig.tp1Pcnt / 100)).toFixed(2);
            const profitTp2 = (investmentAmount * (sig.tp2Pcnt / 100)).toFixed(2);
            const maxLoss = (investmentAmount * (sig.slPcnt / 100)).toFixed(2);

            return (
              <div
                key={coin.symbol}
                className="bg-slate-950/90 rounded-2xl border border-slate-800/80 hover:border-amber-500/50 transition-all p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden group"
              >
                {/* Background Accent glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition pointer-events-none" />

                {/* Card Top Row: Rank, Coin Info, Win Probability Gauge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    {renderRankBadge(sig.rank)}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black text-slate-100 font-mono">
                          {coin.baseCoin}/USDT
                        </h3>

                        {/* Prominent LONG vs SHORT Position Badge */}
                        {sig.positionDirection === 'LONG' ? (
                          <span className="flex items-center gap-1.5 bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-xl text-xs shadow-lg shadow-emerald-500/30 animate-pulse border border-emerald-300">
                            <TrendingUp className="w-4 h-4 stroke-[3]" />
                            LONG (ক্যাপচার বাই)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 bg-rose-500 text-white font-black px-3 py-1 rounded-xl text-xs shadow-lg shadow-rose-500/30 animate-pulse border border-rose-300">
                            <TrendingDown className="w-4 h-4 stroke-[3]" />
                            SHORT (ক্যাপচার সেল)
                          </span>
                        )}

                        {/* Trading Style Badge (স্ক্যাল্পিং / সুইং / পজিশন) */}
                        {sig.tradingStyleLabelBn && (
                          <span className="flex items-center gap-1 bg-cyan-950/80 text-cyan-300 font-extrabold px-2.5 py-1 rounded-xl text-xs border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            {sig.tradingStyleLabelBn}
                          </span>
                        )}

                        {/* Duration Badge (কত সময় চলবে) */}
                        {sig.estimatedDurationBn && (
                          <span
                            className="flex items-center gap-1 bg-sky-950/80 text-sky-300 font-extrabold px-2.5 py-1 rounded-xl text-xs border border-sky-500/40 shadow-sm shadow-sky-500/10"
                            title={`সিগন্যালের সম্ভাব্য সময়কাল: ${sig.estimatedDurationBn}`}
                          >
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                            <span>⏱️ সময়: {sig.estimatedDurationBn}</span>
                          </span>
                        )}

                        <span
                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                            isPos
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {pcnt.toFixed(2)}%
                        </span>

                        {!systemConfig.monetizationEnabled ? (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>১০০% ফ্রি ওপেন</span>
                          </span>
                        ) : !isUnlocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Lock className="w-3 h-3" />
                            <span>লকড সিগন্যাল</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>আনলকড</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        বর্তমান প্রাইস: ${formatPrice(coin.lastPrice)} | 24h Vol: $
                        {(coin.turnover24h / 1e6).toFixed(1)}M
                      </span>
                    </div>
                  </div>

                  {/* Win Probability Score Meter */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 uppercase font-sans block">
                        উইন প্রোব্যাবিলিটি
                      </span>
                      <span className="text-xl font-black text-emerald-400 flex items-center justify-end gap-1">
                        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                        {sig.winRate}% WIN
                      </span>
                    </div>

                    <div className="w-16 bg-slate-900 rounded-full h-3 border border-slate-700 overflow-hidden shrink-0">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                        style={{ width: `${sig.winRate}%` }}
                      />
                    </div>

                    {onToggleWatchlist && (
                      <button
                        type="button"
                        onClick={() => onToggleWatchlist(coin.symbol)}
                        className={`p-2 rounded-xl border transition ${
                          isWatchlisted
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-400'
                        }`}
                        title="ওয়াচলিস্টে যোগ করুন"
                      >
                        <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-400' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Signal Content (If unlocked: show parameters; If locked: show Frosted Glass Unlock Prompt) */}
                {isUnlocked ? (
                  <>
                    {/* Signal Parameters Grid (Entry, TP1, TP2, SL, R:R) with Fixed-Precision & Tabular Num Stability */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 font-mono text-xs">
                      {/* Safe Entry Zone */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1 min-w-0">
                        <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase block flex items-center gap-1 truncate">
                          <Target className="w-3 h-3 shrink-0" />
                          নিরাপদ এন্ট্রি (Entry)
                        </span>
                        <div className="text-xs sm:text-sm font-black text-slate-100 font-mono tabular-nums min-w-[76px] truncate">
                          {formatFixedPrecisionPrice(sig.entryZoneMin, { symbol: sig.symbol, includeCurrencySign: true })} - {formatFixedPrecisionPrice(sig.entryZoneMax, { symbol: sig.symbol, includeCurrencySign: true })}
                        </div>
                        <span className="text-[10px] text-emerald-300 font-sans block truncate">
                          বর্তমান দাম: {formatFixedPrecisionPrice(coin.lastPrice, { symbol: sig.symbol, includeCurrencySign: true })}
                        </span>
                      </div>

                      {/* Take Profit 1 */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1 min-w-0">
                        <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase block flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          টার্গেট ১ (TP1 +{sig.tp1Pcnt}%)
                        </span>
                        <div className="text-xs sm:text-sm font-black text-emerald-400 font-mono tabular-nums min-w-[76px] truncate">
                          {formatFixedPrecisionPrice(sig.tp1, { symbol: sig.symbol, includeCurrencySign: true })}
                        </div>
                        <span className="text-[10px] text-emerald-300 font-sans font-bold block truncate">
                          ${investmentAmount} এ লাভ: +${profitTp1}
                        </span>
                        {sig.tp1DurationBn && (
                          <span className="text-[9px] text-sky-300 font-mono flex items-center gap-1 truncate">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            সময়: {sig.tp1DurationBn}
                          </span>
                        )}
                        {sig.tp1Reason && (
                          <span className="text-[9px] text-emerald-400/80 font-sans block truncate" title={sig.tp1Reason}>
                            📍 {sig.tp1Reason}
                          </span>
                        )}
                      </div>

                      {/* Take Profit 2 */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1 min-w-0">
                        <span className="text-[10px] text-emerald-400 font-sans font-bold uppercase block flex items-center gap-1 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          টার্গেট ২ (TP2 +{sig.tp2Pcnt}%)
                        </span>
                        <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono tabular-nums min-w-[76px] truncate">
                          {formatFixedPrecisionPrice(sig.tp2, { symbol: sig.symbol, includeCurrencySign: true })}
                        </div>
                        <span className="text-[10px] text-emerald-300 font-sans font-bold block truncate">
                          ${investmentAmount} এ লাভ: +${profitTp2}
                        </span>
                        {sig.tp2DurationBn && (
                          <span className="text-[9px] text-sky-300 font-mono flex items-center gap-1 truncate">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            সময়: {sig.tp2DurationBn}
                          </span>
                        )}
                        {sig.tp2Reason && (
                          <span className="text-[9px] text-emerald-400/80 font-sans block truncate" title={sig.tp2Reason}>
                            🎯 {sig.tp2Reason}
                          </span>
                        )}
                      </div>

                      {/* Stop Loss (Safely Anchored 2-5% Below Key Support) */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] text-rose-400 font-sans font-bold uppercase flex items-center gap-1 truncate">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            স্টপ-লস (SL -{sig.slPcnt}%)
                          </span>
                          <SlDistanceVolatilityIcon
                            analysis={calculateSlEfficiency(
                              coin,
                              sig.sl,
                              sig.direction as 'LONG' | 'SHORT'
                            )}
                          />
                        </div>
                        <div className="text-xs sm:text-sm font-black text-rose-400 font-mono tabular-nums min-w-[76px] truncate">
                          {formatFixedPrecisionPrice(sig.sl, { symbol: sig.symbol, includeCurrencySign: true })}
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            {sig.direction === 'LONG' ? '🛡️ সাপোর্ট থেকে ২-৫% নিচে বাফার' : '🛡️ রেজিস্ট্যান্স থেকে ২-৫% উপরে বাফার'}
                          </span>
                        </div>
                        <span className="text-[10px] text-rose-300 font-sans block truncate">
                          সর্বোচ্চ ঝুঁকি: -${maxLoss}
                        </span>
                        {sig.slReason && (
                          <span className="text-[9px] text-rose-400/80 font-sans block truncate" title={sig.slReason}>
                            🛡️ {sig.slReason}
                          </span>
                        )}
                      </div>

                      {/* Risk / Reward & Leverage */}
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1 col-span-2 sm:col-span-4 lg:col-span-1 min-w-0">
                        <span className="text-[10px] text-amber-400 font-sans font-bold uppercase block flex items-center gap-1 truncate">
                          <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                          রিস্ক-রিওয়ার্ড ও লেভারেজ
                        </span>
                        <div className="text-xs font-black text-slate-200 font-mono tabular-nums min-w-[76px] truncate">
                          R:R {sig.riskRewardRatio} | {sig.recommendedLeverage}
                        </div>
                        {sig.estimatedDurationBn && (
                          <span className="text-[10px] text-sky-300 font-mono font-bold block flex items-center gap-1 truncate">
                            <Clock className="w-2.5 h-2.5 text-sky-400 shrink-0" />
                            মেয়াদ: {sig.estimatedDurationBn}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stop Loss Efficiency & Volatility Protection Meter */}
                    <StopLossEfficiencyMeter
                      coin={coin}
                      slPrice={sig.sl}
                      tpPrice={sig.tp1}
                      direction={sig.direction as 'LONG' | 'SHORT'}
                    />

                    {/* Bengali AI Reasoning Box & Open Chart Action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 font-sans">
                          <Sparkles className="w-3.5 h-3.5" />
                          কেন এই কয়েনটি {sig.winRate}% উইন পসিবিলিটি দিচ্ছে (বাংলা এআই বিশ্লেষণ):
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {sig.reasonBn}
                        </p>
                        {sig.validityBn && (
                          <div className="flex items-center gap-1.5 text-[11px] text-sky-300 font-mono pt-1">
                            <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span>
                              <strong>⏱️ সিগন্যাল স্থায়িত্ব ও মেয়াদ:</strong> আনুমানিক {sig.estimatedDurationBn} ({sig.validityBn})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleSendSingleCoinToTelegram(sig)}
                          disabled={sendingCoinSymbol === coin.symbol}
                          className="px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                          title="এই সিগন্যালটি টেলিগ্রামে সেন্ড করুন"
                        >
                          <Send className={`w-3.5 h-3.5 ${sendingCoinSymbol === coin.symbol ? 'animate-bounce' : ''}`} />
                          <span>
                            {sendingCoinSymbol === coin.symbol ? 'পাঠানো হচ্ছে...' : '📤 টেলিগ্রাম'}
                          </span>
                        </button>

                        {onExecuteBybitTrade && (
                          <button
                            type="button"
                            onClick={() =>
                              onExecuteBybitTrade({
                                symbol: sig.symbol,
                                baseCoin: sig.coin?.baseCoin || sig.symbol.replace('USDT', ''),
                                direction: sig.positionDirection,
                                currentPrice: coin.lastPrice,
                                entryZoneMin: sig.entryZoneMin,
                                entryZoneMax: sig.entryZoneMax,
                                tp1: sig.tp1,
                                tp2: sig.tp2,
                                sl: sig.sl,
                                tp1Pcnt: sig.tp1Pcnt,
                                slPcnt: sig.slPcnt,
                                winRate: sig.winRate,
                                reasonBn: sig.reasonBn,
                              })
                            }
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 transition shadow-md shadow-amber-500/20"
                            title="বাইবিট অ্যাকাউন্টে স্বয়ংক্রিয় অর্ডার প্লেস করুন"
                          >
                            <Zap className="w-3.5 h-3.5 fill-slate-950" />
                            <span>⚡ Bybit ট্রেড</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectCoin(coin)}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
                        >
                          <span>চার্ট ও বট</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Locked Signal State: Frosted Glass UI */
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 border border-amber-500/30 flex flex-col items-center text-center space-y-3">
                    <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Lock className="w-6 h-6" />
                    </div>

                    <div className="space-y-1 max-w-lg">
                      <h4 className="text-sm sm:text-base font-black text-slate-100">
                        🔒 এই সিগন্যালের এন্ট্রি ও টার্গেট লক করা আছে
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sig.winRate}% উইন রেটের {coin.baseCoin}/USDT সিগন্যালের নির্ভুল এন্ট্রি জোন, TP1, TP2 ও স্টপ-লস দেখতে পয়েন্ট দিয়ে আনলক করুন অথবা ৩০ সেকেন্ডের ৩টি স্পন্সর অ্যাড দেখুন।
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1 w-full sm:w-auto justify-center flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleUnlockWithPoints(coin.symbol)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>১০ পয়েন্ট দিয়ে আনলক করুন ({userPoints} pts আছে)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetUnlockSymbol(coin.symbol);
                          setIsRewardedAdOpen(true);
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                      >
                        <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>📺 ৩০ সেকেন্ড অ্যাড দেখে ফ্রি আনলক</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetUnlockSymbol(null);
                          setIsRewardedAdOpen(true);
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>আনলিমিটেড VIP</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rewarded Ad & VIP Upgrade Modal */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => {
          setIsRewardedAdOpen(false);
          setTargetUnlockSymbol(null);
          refreshUserPoints();
        }}
        currentUser={currentUser}
        targetSignalSymbol={targetUnlockSymbol || undefined}
        onOpenAuth={onOpenAuth}
        onUserLoginSuccess={(user) => {
          refreshUserPoints();
        }}
        onRewardEarned={() => {
          refreshUserPoints();
          if (targetUnlockSymbol) {
            setRewardActionNotice(`🎉 ${targetUnlockSymbol} সিগন্যালটি আনলক হয়েছে এবং পয়েন্ট যোগ করা হয়েছে!`);
            setTimeout(() => setRewardActionNotice(null), 5000);
          }
        }}
      />
    </div>
  );
};
