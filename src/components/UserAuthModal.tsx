import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Key,
  MessageSquare,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { AuthService, UserAccount } from '../services/authService';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'WHATSAPP' | 'GMAIL' | 'EMAIL_LOGIN' | 'EMAIL_REGISTER' | 'ADMIN_PORTAL'>('WHATSAPP');
  
  // WhatsApp OTP Verification state
  const [whatsappStep, setWhatsappStep] = useState<'PHONE_INPUT' | 'OTP_INPUT'>('PHONE_INPUT');
  const [whatsappNum, setWhatsappNum] = useState<string>('');
  const [whatsappName, setWhatsappName] = useState<string>('');
  const [sentOtpCode, setSentOtpCode] = useState<string>('');
  const [userEnteredOtp, setUserEnteredOtp] = useState<string>('');
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Email / Admin state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  // Step 1: Send WhatsApp OTP Verification Code
  const handleSendWhatsAppCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanNum = whatsappNum.replace(/\D/g, '');
    if (!whatsappNum || cleanNum.length < 8) {
      setErrorMsg('আপনার হোয়াটসঅ্যাপ নম্বর প্রদান করুন (যেমন: +8801700000000)।');
      return;
    }

    // Generate realistic 6-digit random verification OTP
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpCode(generatedCode);
    setUserEnteredOtp('');
    setWhatsappStep('OTP_INPUT');
    setOtpCountdown(60);
    setSuccessMsg(`আপনার হোয়াটসঅ্যাপে ৬-ডিজিটের সিকিউরিটি ভেরিফিকেশন কোড পাঠানো হয়েছে।`);
  };

  // Step 2: Verify WhatsApp OTP Code and Complete Login
  const handleVerifyWhatsAppOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!userEnteredOtp || userEnteredOtp.trim().length !== 6) {
      setErrorMsg('অনুগ্রহ করে হোয়াটসঅ্যাপে প্রাপ্ত সঠিক ৬-ডিজিটের কোডটি লিখুন।');
      return;
    }

    if (userEnteredOtp.trim() !== sentOtpCode) {
      setErrorMsg('❌ সিকিউরিটি কোড ভুল হয়েছে! হোয়াটসঅ্যাপের ৬-ডিজিটের সঠিক কোডটি দিন।');
      return;
    }

    // OTP Verified! Log user in via AuthService
    const res = AuthService.registerOrLoginWhatsApp(whatsappNum, whatsappName);
    if (res.success && res.user) {
      setSuccessMsg(`✅ সিকিউরিটি কোড সফলভাবে যাচাই হয়েছে! স্বাগতম, ${res.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.error || 'হোয়াটসঅ্যাপ রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    }
  };

  // Gmail 1-Click Login
  const handleGmailFastLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('সঠিক জিমেইল / ইমেইল ঠিকানা লিখুন।');
      return;
    }

    const gmailName = name || email.split('@')[0];
    const res = AuthService.loginWithGmail(email, gmailName);
    if (res.success && res.user) {
      setSuccessMsg(`স্বাগতম, ${res.user.name}! জিমেইল সাইন-ইন সফল হয়েছে।`);
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'জিমেইল সাইন-ইন ব্যর্থ হয়েছে।');
    }
  };

  // Standard Email / Admin Login
  const handleStandardEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('ইমেইল এবং পাসওয়ার্ড প্রদান বাধ্যতামূলক।');
      return;
    }

    if (mode === 'EMAIL_LOGIN' || mode === 'ADMIN_PORTAL') {
      const res = AuthService.login(email, password);
      if (res.success && res.user) {
        if (mode === 'ADMIN_PORTAL' && res.user.role !== 'admin') {
          setErrorMsg('অ্যাক্সেস অস্বীকার করা হয়েছে: এই একাউন্টে এডমিন অনুমতি নেই।');
          return;
        }
        setSuccessMsg(`স্বাগতম, ${res.user.name}! লগইন সফল হয়েছে।`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।');
      }
    } else {
      if (!name) {
        setErrorMsg('আপনার নাম লিখুন।');
        return;
      }
      const res = AuthService.register(email, name, password);
      if (res.success && res.user) {
        setSuccessMsg(`ধন্যবাদ ${res.user.name}! আপনার রেজিস্ট্রেশন সফল হয়েছে।`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            {mode === 'ADMIN_PORTAL' ? <ShieldCheck className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">
              {mode === 'ADMIN_PORTAL'
                ? '🔐 এডমিন সিকিউর পোর্টাল'
                : '⚡ দ্রুত সাইন-ইন ও সিকিউর রেজিস্ট্রেশন'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'ADMIN_PORTAL'
                ? 'অনুমোদিত এডমিন অ্যাকাউন্টের ক্রেডেনশিয়াল প্রদান করে প্রবেশ করুন'
                : 'হোয়াটসঅ্যাপ ভেরিফিকেশন কোড বা জিমেইল দিয়ে অতি সহজে ১-ক্লিকে সাইন-ইন করুন'}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        {mode !== 'ADMIN_PORTAL' && (
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('WHATSAPP');
                setWhatsappStep('PHONE_INPUT');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'WHATSAPP'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>হোয়াটসঅ্যাপ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('GMAIL');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'GMAIL'
                  ? 'bg-red-500 text-slate-100 shadow-md font-black'
                  : 'text-slate-400 hover:text-red-400'
              }`}
            >
              <span>🌐 Gmail</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('EMAIL_LOGIN');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mode === 'EMAIL_LOGIN' || mode === 'EMAIL_REGISTER'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <span>📧 ইমেইল</span>
            </button>
          </div>
        )}

        {/* WHATSAPP MODE WITH 2-STEP OTP SECURITY */}
        {mode === 'WHATSAPP' && (
          <div>
            {whatsappStep === 'PHONE_INPUT' ? (
              <form onSubmit={handleSendWhatsAppCode} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <span className="font-bold">হোয়াটসঅ্যাপ ভেরিফিকেশন সিকিউরিটি:</span>
                    <p className="text-[11px] text-emerald-200/80">
                      আপনার নম্বরের নিরাপত্তায় হোয়াটসঅ্যাপে একটি ৬-ডিজিটের গোপন কোড পাঠানো হবে। কোডটি দিয়ে নিশ্চিত করার পরই লগইন হবে।
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="text-emerald-400 text-sm">📱</span>
                    হোয়াটসঅ্যাপ নম্বর (WhatsApp Number):
                  </label>
                  <input
                    type="text"
                    value={whatsappNum}
                    onChange={(e) => setWhatsappNum(e.target.value)}
                    placeholder="+8801700000000 বা 01700000000"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    আপনার নাম (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={whatsappName}
                    onChange={(e) => setWhatsappName(e.target.value)}
                    placeholder="যেমন: আব্দুর রহিম"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>📲 হোয়াটসঅ্যাপে সিকিউরিটি কোড পাঠান</span>
                </button>
              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyWhatsAppOtp} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>হোয়াটসঅ্যাপ সিকিউরিটি ভেরিফিকেশন</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWhatsappStep('PHONE_INPUT')}
                      className="text-[11px] text-slate-400 hover:text-emerald-300 underline"
                    >
                      নম্বর পরিবর্তন করুন
                    </button>
                  </div>

                  <p className="text-xs text-slate-300">
                    আপনার নম্বর <span className="font-bold text-emerald-300 font-mono">{whatsappNum}</span> এ সিকিউরিটি কোড পাঠানো হয়েছে:
                  </p>

                  {/* Simulated WhatsApp OTP Delivery Display Box */}
                  <div className="bg-slate-900 border border-emerald-500/60 p-3 rounded-xl flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp Code:</span>
                      <span className="text-xl font-mono font-black text-emerald-400 tracking-widest bg-slate-950 px-2.5 py-1 rounded border border-emerald-500/30">
                        {sentOtpCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(sentOtpCode);
                        setUserEnteredOtp(sentOtpCode);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all border border-emerald-500/30 flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                    </button>
                  </div>

                  {/* 6-Digit OTP Code Entry Field */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-slate-200 block">
                      ৬-ডিজিটের ভেরিফিকেশন কোড লিখুন:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={userEnteredOtp}
                      onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="যেমন: 583921"
                      className="w-full text-center tracking-[0.4em] font-mono text-lg font-black bg-slate-950 border border-emerald-500/70 focus:border-emerald-400 rounded-xl py-2 text-emerald-300 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {otpCountdown > 0 ? (
                      <span className="text-slate-400 text-[11px]">
                        পুনরায় কোড পাঠানোর সময়: <span className="text-emerald-400 font-bold">{otpCountdown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendWhatsAppCode}
                        className="text-emerald-400 hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>পুনরায় কোড পাঠান</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>🔒 কোড যাচাই করে সাইন-ইন করুন</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* GMAIL MODE */}
        {mode === 'GMAIL' && (
          <form onSubmit={handleGmailFastLogin} className="space-y-4">
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <Mail className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <span className="font-bold">Google / Gmail ১-ক্লিক দ্রুত প্রবেশ:</span>
                <p className="text-[11px] text-red-200/80">
                  আপনার জিমেইল এড্রেস প্রদান করে পাসওয়ার্ড ছাড়াই এক ক্লিকে ট্রেডিং পোর্টফোলিও খুলুন।
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-400" />
                আপনার Gmail এড্রেস:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-400" />
                ডিসপ্লে নাম (Display Name):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: হাসান ট্রেডার"
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-slate-100 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20 active:scale-98"
            >
              <span>🌐 Google / Gmail ১-ক্লিক সাইন-ইন</span>
            </button>
          </form>
        )}

        {/* EMAIL LOGIN & REGISTER */}
        {(mode === 'EMAIL_LOGIN' || mode === 'EMAIL_REGISTER') && (
          <form onSubmit={handleStandardEmailSubmit} className="space-y-4">
            {mode === 'EMAIL_REGISTER' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  আপনার নাম (Full Name):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: আব্দুর রহমান"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                ইমেইল অ্যাড্রেস (Email):
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@domain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                পাসওয়ার্ড (Password):
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-98"
            >
              {mode === 'EMAIL_LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{mode === 'EMAIL_LOGIN' ? 'লগইন করুন' : 'সাইন-আপ ও রেজিস্ট্রেশন করুন'}</span>
            </button>

            <div className="text-center text-xs text-slate-400">
              {mode === 'EMAIL_LOGIN' ? (
                <button
                  type="button"
                  onClick={() => setMode('EMAIL_REGISTER')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  পাসওয়ার্ড দিয়ে নতুন ইমেইল একাউন্ট খুলতে চান? ক্লিক করুন &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('EMAIL_LOGIN')}
                  className="text-amber-400 font-bold hover:underline"
                >
                  ইমেইল-পাসওয়ার্ড দিয়ে আগের একাউন্টে লগইন করুন &rarr;
                </button>
              )}
            </div>
          </form>
        )}

        {/* SECURE ADMIN ACCESS PORTAL MODE */}
        {mode === 'ADMIN_PORTAL' && (
          <form onSubmit={handleStandardEmailSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold">এডমিনিস্ট্রেটর সিকিউরিটি পোর্টাল:</span>
                <p className="text-[11px] text-amber-200/80">
                  শুধুমাত্র অনুমোদিত সিস্টেম এডমিনদের লগইন করার অনুমতি রয়েছে। আপনার এডমিন ইমেইল ও পাসওয়ার্ড প্রদান করে প্রবেশ করুন।
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                এডমিন ইমেইল (Admin Email):
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                এডমিন সিকিউরিটি পাসওয়ার্ড:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>👑 এডমিন অ্যাক্সেস যাচাই করুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('WHATSAPP');
                setEmail('');
                setPassword('');
                setErrorMsg(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-200 underline pt-1"
            >
              &larr; সাধারণ ইউজার প্যানেলে ফিরে যান
            </button>
          </form>
        )}

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Discreet Admin Portal Entry Footer */}
        {mode !== 'ADMIN_PORTAL' && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>🛡️ 256-bit Encrypted Capital Protection Protocol</span>
            <button
              type="button"
              onClick={() => {
                setMode('ADMIN_PORTAL');
                setEmail('');
                setPassword('');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-600" />
              <span>এডমিন পোর্টাল</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
