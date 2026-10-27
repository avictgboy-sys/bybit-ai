import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Lock,
  Wallet,
  X,
  Sliders,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { BybitTradingService, BybitApiConfig } from '../services/bybitTradingService';
import { UserAccount } from '../services/authService';

interface BybitApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onOpenAuth?: () => void;
}

export const BybitApiConfigModal: React.FC<BybitApiConfigModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [isTestnet, setIsTestnet] = useState<boolean>(false);
  const [defaultLeverage, setDefaultLeverage] = useState<number>(10);
  const [riskPercent, setRiskPercent] = useState<number>(2);
  const [autoExecute, setAutoExecute] = useState<boolean>(false);

  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStatus, setVerifyStatus] = useState<{
    success: boolean;
    balance?: number;
    accountType?: string;
    message?: string;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load existing configuration on modal open
  useEffect(() => {
    if (isOpen) {
      const config = BybitTradingService.getConfig(currentUser?.email);
      if (config) {
        setApiKey(config.apiKey || '');
        setApiSecret(config.apiSecret || '');
        setIsTestnet(Boolean(config.isTestnet));
        setDefaultLeverage(config.defaultLeverage || 10);
        setRiskPercent(config.riskPercentPerTrade || 2);
        setAutoExecute(Boolean(config.autoExecuteHighWin));

        if (config.lastWalletBalance !== undefined) {
          setVerifyStatus({
            success: true,
            balance: config.lastWalletBalance,
            accountType: config.accountType,
            message: 'পূর্বে সফলভাবে সংযুক্ত করা হয়েছে',
          });
        }
      } else {
        setVerifyStatus(null);
      }
      setSavedSuccess(false);
    }
  }, [isOpen, currentUser?.email]);

  if (!isOpen) return null;

  const isConnected = verifyStatus?.success;

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setVerifyStatus({
        success: false,
        message: 'অনুগ্রহ করে API Key এবং API Secret উভয়টি পূরণ করুন।',
      });
      return;
    }

    setIsVerifying(true);
    setVerifyStatus(null);

    const res = await BybitTradingService.verifyKeys(apiKey, apiSecret, isTestnet);
    setIsVerifying(false);

    if (res.success) {
      setVerifyStatus({
        success: true,
        balance: res.balance,
        accountType: res.accountType,
        message: `সংযোগ সফল! বাইবিট ওয়ালেট ব্যালেন্স: $${(res.balance ?? 0).toFixed(2)} USDT`,
      });
    } else {
      setVerifyStatus({
        success: false,
        message: res.error || 'বাইবিট কানেকশন ব্যর্থ হয়েছে। কী ও পারমিশন চেক করুন।',
      });
    }
  };

  const handleSave = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setVerifyStatus({
        success: false,
        message: 'সংরক্ষণ করার আগে API Key এবং Secret প্রদান করুন।',
      });
      return;
    }

    const config: BybitApiConfig = {
      apiKey: apiKey.trim(),
      apiSecret: apiSecret.trim(),
      isTestnet,
      defaultLeverage,
      riskPercentPerTrade: riskPercent,
      autoExecuteHighWin: autoExecute,
      lastWalletBalance: verifyStatus?.balance,
      accountType: (verifyStatus?.accountType as any) || 'UNIFIED',
      lastTestedAt: Date.now(),
      status: isConnected ? 'connected' : 'disconnected',
    };

    BybitTradingService.saveConfig(config, currentUser?.email);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDisconnect = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে বাইবিট API Key মুছে ফেলতে চান?')) {
      BybitTradingService.removeConfig(currentUser?.email);
      setApiKey('');
      setApiSecret('');
      setVerifyStatus(null);
      setSavedSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-black text-lg">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-100 font-mono">
                  Bybit V5 ট্রেডিং বট সেটআপ
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  REST API
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                আপনার বাইবিট অ্যাকাউন্টে নিরাপদ স্বয়ংক্রিয় অর্ডার প্লেসমেন্ট
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* User Status / Login Banner */}
          {!currentUser ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-300 text-[11px]">
                <LogIn className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  আপনি বর্তমানে গেস্ট হিসেবে আছেন। অ্যাকাউন্টে লগইন করলে Bybit কী নিরাপদে প্রোফাইলে সিঙ্ক থাকবে।
                </span>
              </div>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs whitespace-nowrap hover:bg-amber-400 shrink-0"
                >
                  লগইন করুন
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
              <span className="text-slate-300">
                ব্যবহারকারী: <strong className="text-amber-400 font-mono">{currentUser.name}</strong> ({currentUser.email})
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                প্রোফাইল সিঙ্ক সক্রিয়
              </span>
            </div>
          )}

          {/* Connection Status Indicator */}
          {verifyStatus && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                verifyStatus.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              {verifyStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-bold text-xs">
                  {verifyStatus.success ? 'বাইবিট সার্ভার সংযুক্ত' : 'সংযোগ ত্রুটি'}
                </div>
                <div className="text-[11px] opacity-90">{verifyStatus.message}</div>
                {verifyStatus.balance !== undefined && (
                  <div className="text-xs font-mono font-black text-emerald-300 mt-1 flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" />
                    উপলব্ধ ব্যালেন্স: ${verifyStatus.balance.toFixed(2)} USDT ({verifyStatus.accountType || 'UNIFIED'})
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Environment Switcher: Mainnet vs Testnet */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <label className="text-slate-300 font-bold text-xs flex items-center justify-between">
              <span>ট্রেডিং এনভায়রনমেন্ট</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {isTestnet ? '🧪 টেস্টনেট (ফ্রি ডেমো ট্রেড)' : '🚀 মেইননেট (আসল ফান্ড)'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsTestnet(false)}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  !isTestnet
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>মেইননেট (Real Live)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTestnet(true)}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  isTestnet
                    ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>টেস্টনেট (Demo Paper)</span>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold text-xs flex items-center justify-between">
              <span>Bybit API Key *</span>
              <a
                href="https://www.bybit.com/app/user/api-management"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>কী কোথায় পাবেন?</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="যেমন: eXampleKey890123abc..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* API Secret Input */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold text-xs flex items-center justify-between">
              <span>Bybit API Secret *</span>
              <span className="text-[10px] text-slate-500">ব্রাউজারে সুরক্ষিত থাকবে</span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                placeholder="API Secret পেস্ট করুন..."
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Risk Management & Automation Settings */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>ট্রেড রিস্ক ও অটোমেশন কন্ট্রোল</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Default Leverage */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">ডিফল্ট লেভারেজ (Leverage)</label>
                <select
                  value={defaultLeverage}
                  onChange={(e) => setDefaultLeverage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value={3}>3x (খুব নিরাপদ)</option>
                  <option value={5}>5x (স্ট্যান্ডার্ড)</option>
                  <option value={10}>10x (রেকমেন্ডেড)</option>
                  <option value={15}>15x</option>
                  <option value={20}>20x (উচ্চ ঝুঁকি)</option>
                </select>
              </div>

              {/* Max Risk % per trade */}
              <div className="space-y-1">
                <label className="text-slate-300 text-[11px] block">প্রতি ট্রেডে সর্বোচ্চ মার্জিন %</label>
                <select
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>ব্যালেন্সের 1% (ক্যাপিটাল প্রটেকশন)</option>
                  <option value={2}>ব্যালেন্সের 2% (আদর্শ ট্রেডার রুল)</option>
                  <option value={5}>ব্যালেন্সের 5%</option>
                  <option value={10}>ব্যালেন্সের 10%</option>
                </select>
              </div>
            </div>

            {/* Auto Execute High Win Signals */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-200 block">
                  হাই-উইন সিগন্যালে অটো এক্সিকিউট বাটন
                </span>
                <span className="text-[10px] text-slate-400 block">
                  টপ ১০ সিগন্যাল কার্ড থেকে ১-ক্লিকে Bybit অর্ডার সাবমিট করার সুবিধা
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoExecute}
                onChange={(e) => setAutoExecute(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Safety & Permission Guidelines */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Lock className="w-3.5 h-3.5" />
              <span>নিরাপত্তা নির্দেশিকা:</span>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Bybit এ কী তৈরির সময় শুধুমাত্র <strong className="text-slate-200">Contract (Orders & Positions)</strong> এবং <strong className="text-slate-200">Read</strong> পারমিশন দিন।</li>
              <li><strong className="text-rose-400">⚠️ কখনোই "Withdrawal" (উত্তোলন) পারমিশন অন করবেন না।</strong></li>
              <li>স্টপ লস (SL) সবসময় সাপোর্ট জোনের ২%-৫% নিচে স্বয়ংক্রিয়ভাবে প্লেস হবে।</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isVerifying || !apiKey || !apiSecret}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isVerifying ? 'যাচাই করা হচ্ছে...' : '🔌 কানেকশন ও ব্যালেন্স টেস্ট'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccess ? 'সংরক্ষিত হয়েছে! ✓' : '💾 সংরক্ষণ ও সক্রিয় করুন'}</span>
            </button>
          </div>

          {/* Delete Keys Option */}
          {(apiKey || isConnected) && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-[11px] text-rose-400 hover:text-rose-300 underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Bybit API Key মুছে ফেলুন (সংযোগ বিচ্ছিন্ন)</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
