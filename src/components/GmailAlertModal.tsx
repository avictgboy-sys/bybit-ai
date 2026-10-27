import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, Send, LogOut, CheckCircle, AlertCircle, X, Sparkles, RefreshCw } from 'lucide-react';
import { GmailService } from '../services/gmailService';
import { HighWinSignalData } from '../services/telegramBot';
import { auth } from '../lib/firebase';

interface GmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  topTenSignals: HighWinSignalData[];
}

export const GmailAlertModal: React.FC<GmailAlertModalProps> = ({
  isOpen,
  onClose,
  topTenSignals,
}) => {
  const [user, setUser] = useState(auth.currentUser);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [notice, setNotice] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    const checkState = () => {
      setUser(auth.currentUser);
      setIsConnected(GmailService.isConnected());
      if (auth.currentUser?.email && !recipientEmail) {
        setRecipientEmail(auth.currentUser.email);
      }
    };

    checkState();
    const unsubscribe = GmailService.initAuth(
      (u) => {
        setUser(u);
        setIsConnected(true);
        if (u.email && !recipientEmail) setRecipientEmail(u.email);
      },
      () => {
        setIsConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setNotice(null);
    try {
      const res = await GmailService.signInWithGoogle();
      setUser(res.user);
      setIsConnected(true);
      if (res.user.email) setRecipientEmail(res.user.email);
      setNotice({
        type: 'success',
        text: '✅ Google Gmail-এ সফলভাবে লগইন করা হয়েছে!',
      });
    } catch (err: any) {
      setNotice({
        type: 'error',
        text: err.message || 'Google দিয়ে সাইন ইন করা সম্ভব হয়নি।',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDisconnect = async () => {
    await GmailService.disconnect();
    setUser(null);
    setIsConnected(false);
    setNotice({
      type: 'info',
      text: 'Google অ্যাকাউন্ট ডিসকানেক্ট করা হয়েছে।',
    });
  };

  const initiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setNotice({
        type: 'error',
        text: 'অনুগ্রহ করে সঠিক ইমেইল এড্রেস লিখুন।',
      });
      return;
    }

    if (!isConnected) {
      setNotice({
        type: 'error',
        text: 'ইমেইল পাঠাতে আগে Google Gmail একাউন্ট কানেক্ট করুন।',
      });
      return;
    }

    // Trigger mandatory explicit user confirmation before sending email on behalf of user
    setShowConfirmModal(true);
  };

  const confirmAndSendEmail = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    setNotice({
      type: 'info',
      text: `Gmail API-র মাধ্যমে ${recipientEmail} ইমেইলে বার্তা পাঠানো হচ্ছে...`,
    });

    const res = await GmailService.sendTopTenSignalsEmail(recipientEmail, topTenSignals);
    setIsSending(false);

    if (res.success) {
      setNotice({
        type: 'success',
        text: `🎉 সফলভাবে ${topTenSignals.length}টি ক্রিপ্টো সিগন্যাল ${recipientEmail} ঠিকানায় ইমেইল করা হয়েছে!`,
      });
    } else {
      setNotice({
        type: 'error',
        text: res.error || 'ইমেইল পাঠানো ব্যর্থ হয়েছে।',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Google Gmail Signal Alert Engine
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Gmail API
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                সেরা ১০টি ক্রিপ্টো সিগন্যাল সরাসরি ইমেইলে নোটিফিকেশন পাঠান
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Connection Status Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <Mail className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  {isConnected ? user?.displayName || user?.email || 'গুগল কানেক্টেড' : 'Google Gmail কানেক্ট করা নেই'}
                  {isConnected && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">
                      সংযুক্ত
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isConnected ? user?.email : 'ইমেইল পাঠাতে আপনার গুগল অ্যাকাউন্ট সাইন ఇన్ করুন'}
                </div>
              </div>
            </div>

            {isConnected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>লগআউট</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.2 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.3-.8-.4-1.7-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12.3s.7 3.6 1.9 6l3.7-3.5z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z" />
                </svg>
                <span>{isLoggingIn ? 'কানেক্ট হচ্ছে...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>

          {/* Toast Notification Notice */}
          {notice && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border animate-fadeIn ${
                notice.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                  : notice.type === 'error'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                  : 'bg-sky-950/80 text-sky-300 border-sky-500/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {notice.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                {notice.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                {notice.type === 'info' && <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />}
                <span>{notice.text}</span>
              </div>
              <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>
          )}

          {/* Email Dispatch Form */}
          <form onSubmit={initiateSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                প্রাপকের ইমেইল ঠিকানায় সিগন্যাল ইমেইল পাঠান:
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-red-500/50 transition"
                  required
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-400 space-y-1 leading-relaxed">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ইমেইলের সারসংক্ষেপ (Summary):
              </div>
              <p>• মোট {topTenSignals.length}টি হাই উইন রেট (৮০% - ৯৮%) সিগন্যাল রিলে পাঠানো হবে।</p>
              <p>• নিরাপদ এন্ট্রি জোন, টার্গেট (TP1/TP2), স্টপ লস এবং টেকনিক্যাল ইনসাইট যুক্ত থাকবে।</p>
            </div>

            <button
              type="submit"
              disabled={isSending || !isConnected}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/20 disabled:opacity-50"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
              <span>{isSending ? 'ইমেইল পাঠানো হচ্ছে...' : '📧 এখনই Gmail দিয়ে ১০টি সিগন্যাল পাঠান'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog before sending emails */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-100">ইমেইল পাঠানোর নিশ্চিতকরণ (Confirmation)</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি আপনার গুগল জিমেইল অ্যাকাউন্ট ব্যবহার করে <strong className="text-red-400">{recipientEmail}</strong> ঠিকানায়{' '}
              <strong className="text-emerald-400">{topTenSignals.length}টি ক্রিপ্টো ট্রেডিং সিগন্যাল</strong> ইমেইল করতে যাচ্ছেন।
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>• প্রেরক: {user?.email}</div>
              <div>• প্রাপক: {recipientEmail}</div>
              <div>• বিষয়: 🎯 Bybit VIP Signal Alert: Top 10 High-Win Crypto Signals</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                বাতিল করুন (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmAndSendEmail}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md"
              >
                হ্যাঁ, ইমেইল পাঠান (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GmailAlertModal;
