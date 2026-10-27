import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  Sparkles,
  Coins,
  ShieldCheck,
  Zap,
  ExternalLink,
  Crown,
  Send,
  MessageCircle,
  Copy,
  Clock,
  Flame,
  Award,
  Layers,
  ArrowRight,
  Tv,
  Gift,
  Volume2,
  VolumeX,
  UserPlus,
  LogIn,
  AlertCircle,
  UserCheck,
  Check,
} from 'lucide-react';
import { AuthService, AdminSystemConfig, UserAccount } from '../services/authService';

export interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSymbol?: string;
  targetSignalSymbol?: string;
  currentUser: UserAccount | null;
  onRewardEarned?: (newPoints: number) => void;
  onSuccessReward?: (newPoints: number) => void;
  onOpenAuth?: () => void;
  onUserLoginSuccess?: (user: UserAccount) => void;
}

interface AdItem {
  id: string;
  sponsorTitle: string;
  sponsorBadge: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  imageUrl: string;
  durationSeconds: number; // e.g. 10s each, 3 ads = 30s total
  tags: string[];
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  targetSymbol,
  targetSignalSymbol,
  currentUser,
  onRewardEarned,
  onSuccessReward,
  onOpenAuth,
  onUserLoginSuccess,
}) => {
  const actualTarget = targetSymbol || targetSignalSymbol;
  const [systemConfig, setSystemConfig] = useState<AdminSystemConfig>(AuthService.getSystemConfig());
  
  // Total 30 Seconds Rewarded Session
  const totalSessionSeconds = systemConfig.adWatchDurationSeconds || 30;

  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(totalSessionSeconds);
  const [isPlayingAd, setIsPlayingAd] = useState<boolean>(false);
  const [adFinished, setAdFinished] = useState<boolean>(false);
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'WATCH_AD' | 'VIP_PLAN'>('WATCH_AD');
  
  // Multi-Ad Rotation State (3 Ads sequence adding up to 30s)
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // VIP in-modal fast registration state
  const [regMode, setRegMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regName, setRegName] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // VIP Payment submission state
  const [txHashInput, setTxHashInput] = useState<string>('');
  const [vipSubmitting, setVipSubmitting] = useState<boolean>(false);
  const [vipSubmitSuccess, setVipSubmitSuccess] = useState<string | null>(null);
  const [vipSubmitError, setVipSubmitError] = useState<string | null>(null);

  // Dynamic 3-Ad List sequence (PropellerAds / Monetag 1st)
  const adSequence: AdItem[] = [
    {
      id: 'ad-1',
      sponsorTitle: 'PropellerAds & Monetag Ad Network',
      sponsorBadge: 'MONETAG / PROPELLERADS',
      headline: '🚀 Monetag & PropellerAds High-Yield Web3 & Smart Rewards Zone!',
      description: 'অফিশিয়াল প্রোপেলারএডস ও মনেট্যাগ পার্টনার জোন থেকে ইনস্ট্যান্ট ক্রিপ্টো রিওয়ার্ডস, ডিরেক্ট অফার ও হাই-স্পিড এআই আনলকিং পান।',
      ctaText: 'Monetag / PropellerAds অফার এক্সপ্লোর করুন',
      ctaLink: 'https://monetag.com',
      bgGradient: 'from-purple-600/30 via-slate-900 to-slate-950',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      durationSeconds: Math.floor(totalSessionSeconds / 3), // 0 to 10s
      tags: ['PropellerAds', 'Monetag Official', 'Instant Reward'],
    },
    {
      id: 'ad-2',
      sponsorTitle: 'Bybit Official VIP Partner',
      sponsorBadge: 'BYBIT VIP #1',
      headline: '🔥 Bybit $30,000 ডিপোজিট বোনাস ও 0% মেকার ফি অফার!',
      description: 'আমাদের অফিশিয়াল লিঙ্কে সাইন-আপ করে অ্যাকাউন্ট ভেরিফাই করলেই পাবেন ইনস্ট্যান্ট ট্রেডিং রিওয়ার্ড ও এআই বট কানেক্টিভিটি।',
      ctaText: 'Bybit এ $30,000 বোনাস ক্লেইম করুন',
      ctaLink: systemConfig.customBannerLink || 'https://partner.bybit.com',
      bgGradient: 'from-amber-600/30 via-slate-900 to-slate-950',
      imageUrl: systemConfig.customBannerImgUrl || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
      durationSeconds: Math.floor(totalSessionSeconds / 3), // 10 to 20s
      tags: ['Bybit Official', 'Futures Trading', 'VIP Bonus'],
    },
    {
      id: 'ad-3',
      sponsorTitle: 'Coinzilla & Bybit AI Bot Suite',
      sponsorBadge: 'AUTOMATED 24/7',
      headline: '⚡ দৈনিক ১০ ডলার গ্রিড বট অটোমেশন ও ৯-ফ্যাক্টর প্রিমিয়াম অ্যাক্সেস',
      description: 'স্টপ-লস গার্ড এবং ৯টি কনফ্লুয়েন্স ফ্যাক্টর দিয়ে গঠিত স্বয়ংক্রিয় রোবট ও কোয়েনজিলা ক্রিপ্টো লিকুইডিটি পুল ইনজেকশন রাডার।',
      ctaText: 'অটোমেটেড গ্রিড বট স্ট্র্যাটেজি দেখুন',
      ctaLink: 'https://coinzilla.com',
      bgGradient: 'from-emerald-600/30 via-slate-900 to-slate-950',
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
      durationSeconds: totalSessionSeconds - Math.floor(totalSessionSeconds / 3) * 2, // 20 to 30s
      tags: ['Coinzilla Ads', 'High Win Rate', 'Auto Grid Bot'],
    },
  ];

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      const freshConfig = AuthService.getSystemConfig();
      setSystemConfig(freshConfig);
      const totalSec = freshConfig.adWatchDurationSeconds || 30;
      setTotalSecondsLeft(totalSec);
      setIsPlayingAd(false);
      setAdFinished(false);
      setCurrentAdIndex(0);
      setCopiedWallet(false);
      setVipSubmitSuccess(null);
      setVipSubmitError(null);
      setRegError(null);
      setRegSuccess(null);
    }
  }, [isOpen]);

  // Master 30-second countdown with Multi-Ad sequence rotation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAd && totalSecondsLeft > 0) {
      timer = setTimeout(() => {
        setTotalSecondsLeft((prev) => {
          const nextSec = prev - 1;
          const elapsed = totalSessionSeconds - nextSec;

          // Rotate to next ad every ~10s interval (3 ads in 30s)
          const adDurationUnit = Math.floor(totalSessionSeconds / 3) || 10;
          const nextIndex = Math.min(Math.floor(elapsed / adDurationUnit), adSequence.length - 1);
          if (nextIndex !== currentAdIndex) {
            setCurrentAdIndex(nextIndex);
          }

          if (nextSec <= 0) {
            setAdFinished(true);
            return 0;
          }
          return nextSec;
        });
      }, 1000);
    } else if (isPlayingAd && totalSecondsLeft === 0) {
      setAdFinished(true);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAd, totalSecondsLeft, totalSessionSeconds, currentAdIndex, adSequence.length]);

  if (!isOpen) return null;

  const handleStartWatchAd = () => {
    setIsPlayingAd(true);
    setTotalSecondsLeft(totalSessionSeconds);
    setAdFinished(false);
    setCurrentAdIndex(0);
  };

  const handleClaimPoints = () => {
    const res = AuthService.awardAdRewardPoints(currentUser?.id || currentUser);
    if (res.success) {
      if (actualTarget) {
        AuthService.unlockSignalWithPoints(actualTarget, currentUser?.id || currentUser);
      }
      if (onRewardEarned) {
        onRewardEarned(res.newTotal);
      }
      if (onSuccessReward) {
        onSuccessReward(res.newTotal);
      }
      onClose();
    }
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(systemConfig.adminUsdtAddress || 'TX7nBybitAiOfficialUSDTtrc20SecureWallet');
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 3000);
  };

  // Handle Fast in-modal Registration
  const handleFastRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regEmail || !regPassword) {
      setRegError('ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক।');
      return;
    }

    if (regMode === 'REGISTER') {
      const res = AuthService.register(regEmail, regName || regEmail.split('@')[0], regPassword);
      if (res.success && res.user) {
        setRegSuccess(`স্বাগতম, ${res.user.name}! অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।`);
        if (onUserLoginSuccess) onUserLoginSuccess(res.user);
      } else {
        setRegError(res.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }
    } else {
      const res = AuthService.login(regEmail, regPassword);
      if (res.success && res.user) {
        setRegSuccess(`স্বাগতম, ${res.user.name}! লগইন সফল হয়েছে।`);
        if (onUserLoginSuccess) onUserLoginSuccess(res.user);
      } else {
        setRegError(res.error || 'লগইন ব্যর্থ হয়েছে।');
      }
    }
  };

  // Submit VIP activation request
  const handleSubmitVipRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setVipSubmitError(null);
    setVipSubmitSuccess(null);

    if (!currentUser) {
      setVipSubmitError('ভিআইপি রিকোয়েস্ট পাঠাতে প্রথমে একাউন্ট রেজিস্টার বা লগইন করুন।');
      return;
    }

    if (!txHashInput || txHashInput.trim().length < 4) {
      setVipSubmitError('অনুগ্রহ করে সঠিক USDT (TRC20) ট্রানজেকশন হ্যাশ (TxID) লিখুন।');
      return;
    }

    setVipSubmitting(true);
    const res = AuthService.submitVipRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      whatsapp: currentUser.whatsapp,
      txHash: txHashInput.trim(),
      amountUsdt: systemConfig.vipMonthlyFeeUsdt || 19,
    });
    setVipSubmitting(false);

    if (res.success) {
      setVipSubmitSuccess(`🎉 আপনার ভিআইপি অ্যাক্টিভেশন রিকোয়েস্ট এডমিনের কাছে পাঠানো হয়েছে! ট্রানজেকশন ভেরিফাই করে দ্রুত ভিআইপি সক্রিয় করা হবে।`);
      setTxHashInput('');
    } else {
      setVipSubmitError(res.error || 'রিকোয়েস্ট সাবমিট ব্যর্থ হয়েছে।');
    }
  };

  const pointsReward = systemConfig.pointsRewardPerAd || 10;
  const currentPoints = AuthService.getUserPoints(currentUser?.id || currentUser);
  const activeAd = adSequence[currentAdIndex] || adSequence[0];
  const elapsedSeconds = totalSessionSeconds - totalSecondsLeft;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalSessionSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-100">
                  ৩০ সেকেন্ড রিওয়ার্ডেড অ্যাড ও আনলক
                </h3>
                {actualTarget && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {actualTarget}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                ব্যালেন্স: <strong className="text-amber-400 font-mono">{currentPoints} Points</strong> | রিওয়ার্ড: <strong className="text-emerald-400 font-mono">+{pointsReward} pts</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('WATCH_AD')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'WATCH_AD'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>📺 ৩০ সেকেন্ড অ্যাড দেখুন (+{pointsReward} pts)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('VIP_PLAN')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'VIP_PLAN'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>👑 ভিআইপি মেম্বারশিপ (${systemConfig.vipMonthlyFeeUsdt}/মাস)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {activeTab === 'WATCH_AD' ? (
            <div className="space-y-4">
              {/* Ad Display Interactive TV Frame */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-5 overflow-hidden text-center min-h-[260px] flex flex-col items-center justify-center shadow-inner">
                {/* Background ambient glow */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                {!isPlayingAd && !adFinished ? (
                  <div className="space-y-3.5 max-w-md py-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
                      <Play className="w-8 h-8 ml-1 fill-amber-400/20 text-amber-400" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold mb-1.5">
                        <Layers className="w-3 h-3" />
                        <span>৩টি ইন্টারঅ্যাক্টিভ স্পন্সর অ্যাড (মোট ৩০ সেকেন্ড)</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-slate-100">
                        ৩০ সেকেন্ড অ্যাড দেখে ফ্রি সিগন্যাল আনলক করুন
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        টানা ৩০ সেকেন্ডের ৩টি প্রিমিয়াম স্পন্সর অ্যাড শেষ হলে স্বয়ংক্রিয়ভাবে <strong className="text-amber-400">+{pointsReward} পয়েন্ট</strong> যোগ হবে এবং <strong className="text-emerald-400">{actualTarget || 'সিগন্যালটির'}</strong> পূর্ণ বিবরণ উন্মুক্ত হবে।
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-1 text-[10px] text-slate-400">
                      <div className="p-2 rounded-xl bg-slate-900 border border-purple-500/30 text-center">
                        <span className="block font-black text-purple-400">অ্যাড ১ (০-১০s)</span>
                        <span className="truncate block">Propeller / Monetag</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/30 text-center">
                        <span className="block font-black text-amber-400">অ্যাড ২ (১০-২০s)</span>
                        <span className="truncate block">Bybit VIP $30k</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 text-center">
                        <span className="block font-black text-emerald-400">অ্যাড ৩ (২০-৩০s)</span>
                        <span className="truncate block">Coinzilla & Bot</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartWatchAd}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-98 transition-all"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>৩০ সেকেন্ডের অ্যাড চালু করুন (+{pointsReward} pts)</span>
                    </button>
                  </div>
                ) : isPlayingAd && !adFinished ? (
                  <div className="space-y-4 w-full py-1">
                    {/* Live Ad Display Content with Multi-Ad Rotation */}
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${activeAd.bgGradient} border border-amber-500/40 text-left relative overflow-hidden transition-all duration-500 shadow-xl`}>
                      {/* Top Header inside Ad */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 tracking-wider">
                            {activeAd.sponsorBadge}
                          </span>
                          <span className="text-[11px] font-bold text-amber-300 truncate max-w-[200px]">
                            {activeAd.sponsorTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/30 font-black">
                            অ্যাড {currentAdIndex + 1} / 3
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsAudioMuted(!isAudioMuted)}
                            className="p-1 rounded-md bg-slate-950/60 text-slate-400 hover:text-white"
                          >
                            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                          </button>
                        </div>
                      </div>

                      {/* Main Ad Banner Body */}
                      <div className="flex flex-col sm:flex-row items-center gap-3.5">
                        <img
                          src={activeAd.imageUrl}
                          alt={activeAd.sponsorTitle}
                          className="w-full sm:w-28 h-28 rounded-xl object-cover border border-slate-700/80 shadow-md shrink-0"
                        />
                        <div className="space-y-1.5 flex-1">
                          <h5 className="text-xs sm:text-sm font-black text-slate-100 leading-snug">
                            {activeAd.headline}
                          </h5>
                          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                            {activeAd.description}
                          </p>

                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <a
                              href={activeAd.ctaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-95"
                            >
                              <span>{activeAd.ctaText}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="flex items-center gap-1">
                              {activeAd.tags.map((t, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950/60 text-slate-400 border border-slate-800">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Master 30s Countdown & Multi-Segment Progress Indicator */}
                    <div className="space-y-2 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 animate-spin text-amber-400" />
                            <span>রিওয়ার্ডেড অ্যাড চলছে... (অ্যাড {currentAdIndex + 1}/৩)</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400 text-[11px]">বাকি সময়:</span>
                          <span className="text-amber-400 text-sm font-black px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                            {totalSecondsLeft}s
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar with 3-segment visual markers */}
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                          {/* Segment Dividers at 33% and 66% */}
                          <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-slate-800 z-10" />
                          <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-slate-800 z-10" />
                          
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-1000 ease-linear rounded-full shadow-lg"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500 font-mono px-1">
                          <span className="text-purple-400">০s (Propeller/Monetag)</span>
                          <span className="text-amber-400">১০s (Bybit VIP)</span>
                          <span className="text-emerald-400">২০s (Coinzilla/Bot)</span>
                          <span className="text-emerald-300 font-bold">৩০s (আনলক 🎉)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Ad Finished & Claim Reward Screen */
                  <div className="space-y-3.5 max-w-md py-3 animate-fadeIn">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>৩০ সেকেন্ড সম্পন্ন হয়েছে!</span>
                      </div>
                      <h4 className="text-base font-black text-emerald-400">
                        অভিনন্দন! রিওয়ার্ড আনলক হয়েছে
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        আপনার অ্যাকাউন্টে <strong className="text-amber-400">+{pointsReward} পয়েন্ট</strong> যুক্ত হতে প্রস্তুত। এখনই কালেক্ট করে সিগন্যালের নির্ভুল এন্ট্রি জোন ও টার্গেট দেখুন।
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleClaimPoints}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>+{pointsReward} পয়েন্ট নিন ও {actualTarget || 'সিগন্যাল'} আনলক করুন</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Free Benefits info */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>পয়েন্ট ও ফ্রি আনলক নিয়মাবলী:</span>
                </div>
                <p>• প্রতিটি ৩০ সেকেন্ডের রিওয়ার্ডেড অ্যাড সেশনে ৩টি স্পন্সর অ্যাড ঘুরে ঘুরে প্রদর্শিত হয় এবং শেষে <strong>+{pointsReward} পয়েন্ট</strong> পাওয়া যায়।</p>
                <p>• প্রতিদিন প্রথমবার সাইটে লগইন করলে পাবেন <strong>+{systemConfig.dailyLoginPointsReward || 5} বোনাস পয়েন্ট</strong>।</p>
                <p>• আনলিমিটেড সিগন্যাল ও কোনো বিজ্ঞাপন ছাড়া দেখতে চাইলে ভিআইপিতে আপগ্রেড করুন।</p>
              </div>
            </div>
          ) : (
            /* VIP Plan Section with Registration Requirement */
            <div className="space-y-4">
              {/* VIP Plan Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-950 to-emerald-500/10 border border-amber-500/30 text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                  <Crown className="w-4 h-4" />
                  <span>VIP Trader Subscription</span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-100">
                    ${systemConfig.vipMonthlyFeeUsdt || 19} <span className="text-xs text-slate-400 font-normal">/ মাস (USDT TRC20)</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    কোনো অ্যাড দেখতে হবে না, সকল ১০টি ৯-ফ্যাক্টর সিগন্যাল, এন্ট্রি, TP/SL এবং টেলিগ্রাম ইনস্ট্যান্ট অ্যালার্ট আনলিমিটেড লাইভ পাবেন।
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>সব ১০টি হাই-উইন সিগন্যাল আনলক</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>১০০% অ্যাড-মুক্ত প্রিমিয়াম মোড</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>টেলিগ্রাম অটো-সিগন্যাল ব্রডকাস্ট</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>২৪/৭ এডমিন ডিরেক্ট সাপোর্ট</span>
                  </div>
                </div>
              </div>

              {/* CHECK: USER REGISTRATION REQUIREMENT FOR VIP */}
              {!currentUser ? (
                /* Unregistered / Guest State -> Must Register / Login first */
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-amber-300">
                        👑 ভিআইপি সাবস্ক্রিপশনের জন্য একাউন্ট রেজিস্ট্রেশন বাধ্যতামূলক
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        ভিআইপি মেম্বারশিপ এবং সকল আনলিমিটেড সিগন্যাল আপনার ব্যক্তিগত একাউন্টের সাথে সিকিউরভাবে যুক্ত থাকে। অনুগ্রহ করে প্রথমে একটি ফ্রি একাউন্ট তৈরি করুন অথবা লগইন করুন।
                      </p>
                    </div>
                  </div>

                  {/* Fast In-Modal Registration / Login Form */}
                  <form onSubmit={handleFastRegister} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-200">
                        {regMode === 'REGISTER' ? '📝 ফ্রি একাউন্ট রেজিস্ট্রেশন (১ মিনিটে)' : '🔑 একাউন্টে লগইন করুন'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRegMode(regMode === 'REGISTER' ? 'LOGIN' : 'REGISTER')}
                        className="text-[11px] font-bold text-amber-400 hover:underline"
                      >
                        {regMode === 'REGISTER' ? 'আগে থেকেই একাউন্ট আছে? লগইন করুন' : 'নতুন একাউন্ট খুলতে চান? রেজিস্টার'}
                      </button>
                    </div>

                    {regError && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {regSuccess && (
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{regSuccess}</span>
                      </div>
                    )}

                    {regMode === 'REGISTER' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400">আপনার নাম:</label>
                        <input
                          type="text"
                          required
                          placeholder="আপনার পুরো নাম"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-bold text-slate-400">ইমেইল ঠিকানা:</label>
                      <input
                        type="email"
                        required
                        placeholder="example@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400">পাসওয়ার্ড:</label>
                      <input
                        type="password"
                        required
                        placeholder="গোপন পাসওয়ার্ড"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{regMode === 'REGISTER' ? 'রেজিস্টার করুন ও ভিআইপি পেজে যান' : 'লগইন করুন'}</span>
                      </button>

                      {onOpenAuth && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAuth();
                          }}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                          title="অন্যান্য সাইন-ইন মাধ্যম (WhatsApp/Gmail)"
                        >
                          অন্যান্য মাধ্যম
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              ) : (
                /* Registered User State -> Show Payment & In-App VIP Submission Form */
                <div className="space-y-3.5">
                  {/* Account Badge */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-black text-emerald-300">
                          {currentUser.name} {currentUser.isVip ? '(👑 VIP Active)' : '(Free User)'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {currentUser.email || currentUser.whatsapp} | ID: #{currentUser.id}
                        </div>
                      </div>
                    </div>
                    {currentUser.isVip ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                        ভিআইপি সক্রিয়
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        রেজিস্টার্ড একাউন্ট
                      </span>
                    )}
                  </div>

                  {/* Admin USDT TRC20 Wallet Box */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center justify-between">
                      <span>USDT (TRC20) পেমেন্ট এড্রেস:</span>
                      <span className="text-amber-400 font-mono lowercase">network: trc20</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={systemConfig.adminUsdtAddress || 'TX7nBybitAiOfficialUSDTtrc20SecureWallet'}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyWallet}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1 shrink-0 transition-all"
                      >
                        {copiedWallet ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedWallet ? 'কপি হয়েছে' : 'কপি'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Direct VIP Activation Request Submission Form */}
                  <form onSubmit={handleSubmitVipRequest} className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h5 className="text-xs font-bold text-slate-200">
                        ভিআইপি অ্যাক্টিভেশন রিকোয়েস্ট পাঠান (USDT TxID / Hash):
                      </h5>
                    </div>

                    {vipSubmitError && (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{vipSubmitError}</span>
                      </div>
                    )}

                    {vipSubmitSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{vipSubmitSuccess}</span>
                      </div>
                    )}

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="পেমেন্টের Transaction Hash / TxID লিখুন (যেমন: 8ef621...)"
                        value={txHashInput}
                        onChange={(e) => setTxHashInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={vipSubmitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>{vipSubmitting ? 'রিকোয়েস্ট পাঠানো হচ্ছে...' : 'ভিআইপি অ্যাক্টিভেশন রিকোয়েস্ট সাবমিট করুন'}</span>
                    </button>
                  </form>

                  {/* Contact Admin to Fast Confirm */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href={`https://t.me/${(systemConfig.adminContactTelegram || '@BybitAiAdmin').replace('@', '')}?text=${encodeURIComponent(`Hi Admin, I have registered and paid for VIP ($${systemConfig.vipMonthlyFeeUsdt}/month). My Account Email: ${currentUser.email}, Name: ${currentUser.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>টেলিগ্রামে কনফার্ম করুন ({systemConfig.adminContactTelegram || '@BybitAiAdmin'})</span>
                    </a>

                    <a
                      href={`https://wa.me/${(systemConfig.adminContactWhatsapp || '+8801700000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi Admin, I registered for VIP. Email: ${currentUser.email}, Name: ${currentUser.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
