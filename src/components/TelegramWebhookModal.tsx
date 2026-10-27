import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Bot,
  HelpCircle,
  Sliders,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { TelegramService, TelegramConfig } from '../services/telegramService';

interface TelegramWebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const TelegramWebhookModal: React.FC<TelegramWebhookModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<TelegramConfig>(TelegramService.getConfig());
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(TelegramService.getConfig());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const res = await TelegramService.sendTestNotification(config.botToken, config.chatId);

    setIsTesting(false);
    if (res.success) {
      setTestResult({
        success: true,
        msg: 'সফলভাবে টেলিগ্রাম চ্যানেলে টেস্ট বার্তা পাঠানো হয়েছে! আপনার টেলিগ্রাম চ্যাট চেক করুন।',
      });
    } else {
      setTestResult({
        success: false,
        msg: res.error || 'টেলিগ্রাম বার্তা পাঠাতে ব্যর্থ হয়েছে। বটের টোকেন ও চ্যাট আইডি সঠিক কিনা চেক করুন।',
      });
    }
  };

  const handleSave = () => {
    TelegramService.saveConfig(config);
    setSaveSuccess(true);
    if (onConfigUpdated) onConfigUpdated();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  📡 Telegram Webhook Integration
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    config.enabled && config.botToken && config.chatId
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {config.enabled && config.botToken && config.chatId ? '🟢 ACTIVE' : '⚪ INACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                টেলিগ্রাম চ্যানেলে ট্রেডিং সিগন্যাল ও রিস্ক অ্যালার্ট অটোমেটিক পোস্ট করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Quick Setup Instructions Collapsible */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full p-3 flex items-center justify-between text-left bg-slate-900/60 hover:bg-slate-900 transition-colors"
            >
              <span className="font-bold text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                কীভাবে ৩০ সেকেন্ডে টেলিগ্রাম বট তৈরি ও কানেক্ট করবেন? (Guide)
              </span>
              <span className="text-slate-400 font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded">
                {showInstructions ? 'লুকান ▲' : 'দেখুন ▼'}
              </span>
            </button>

            {showInstructions && (
              <div className="p-4 space-y-2.5 border-t border-slate-800 text-slate-300 leading-relaxed bg-slate-950">
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-400 bg-amber-500/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border border-amber-500/30">
                    1
                  </span>
                  <p>
                    টেলিগ্রাম অ্যাপ খুলুন এবং <b>@BotFather</b> লিখে সার্চ দিন। নতুন বট বানাতে <code>/newbot</code> টাইপ করুন।
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-400 bg-amber-500/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border border-amber-500/30">
                    2
                  </span>
                  <p>
                    বটের নাম বেছে নিলে আপনি একটি <b>HTTP API Bot Token</b> পাবেন (যেমন: <code>123456789:ABCdefGhIJKlm...</code>)। সেটি কপি করে নিচে পেস্ট করুন।
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-400 bg-amber-500/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border border-amber-500/30">
                    3
                  </span>
                  <p>
                    আপনার টেলিগ্রাম চ্যানেল বা গ্রুপে বটটিকে যুক্ত করুন এবং তাকে <b>Administrator</b> হিসেবে মেসেজ পোস্টের পারমিশন দিন।
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-black text-amber-400 bg-amber-500/10 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 border border-amber-500/30">
                    4
                  </span>
                  <p>
                    আপনার চ্যানেলের ইউজারনেম (যেমন: <code>@my_trading_channel</code>) নিচে বসিয়ে <b>"🧪 টেস্ট নোটিফিকেশন পাঠান"</b> বাটনে চাপ দিন!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Main Credentials Form */}
          <div className="space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <Bot className="w-5 h-5 text-sky-400" />
                <div>
                  <span className="font-bold text-slate-100 block">
                    Enable Telegram Webhook System
                  </span>
                  <span className="text-[11px] text-slate-400">
                    হাই-প্রাইওরিটি ট্রেডিং সংকেত অটোমেটিক টেলিগ্রাম চ্যানেলে পুশ করবে
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 accent-sky-400 rounded cursor-pointer"
              />
            </div>

            {/* Bot Token Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300 flex items-center justify-between">
                <span>Telegram Bot Token:</span>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  Get Token via @BotFather <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="password"
                value={config.botToken}
                onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                placeholder="123456789:AAHd88ff93822ndjkf..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Chat ID / Channel Username Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-300">
                Channel Username or Chat ID (যেমন: @my_channel_name)
              </label>
              <input
                type="text"
                value={config.chatId}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                placeholder="@bybit_trading_signals বা -100123456789"
                className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-slate-100 font-mono placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Automation Preferences Grid */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-amber-400">
                <Sliders className="w-3.5 h-3.5" />
                অটোমেশন ও সিগন্যাল ফিল্টার সেটিংস
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Auto Signals */}
                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-200">AI Signals (LONG / SHORT)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoSendSignals}
                    onChange={(e) => setConfig({ ...config, autoSendSignals: e.target.checked })}
                    className="w-4 h-4 accent-emerald-400 rounded"
                  />
                </label>

                {/* Auto Risk Warnings */}
                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-200">Risk Guard Warnings</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoSendRiskWarnings}
                    onChange={(e) =>
                      setConfig({ ...config, autoSendRiskWarnings: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                </label>
              </div>

              {/* Confidence Threshold Slider */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">
                    মিনিমাম AI কনফিডেন্স ফিল্টার:
                  </span>
                  <span className="font-mono font-bold text-sky-400">
                    {config.minConfidence}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="90"
                  step="5"
                  value={config.minConfidence}
                  onChange={(e) => setConfig({ ...config, minConfidence: Number(e.target.value) })}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  শুধুমাত্র {config.minConfidence}% বা তার বেশি কনফিডেন্সের হাই-প্রাইওরিটি সিগন্যাল টেলিগ্রামে অটো-পাঠাবে।
                </span>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !config.botToken || !config.chatId}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    <span>টেলিগ্রাম সার্ভারে বার্তা পাঠানো হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>🧪 কানেকশন টেস্ট করুন (Send Telegram Test Signal)</span>
                  </>
                )}
              </button>
            </div>

            {/* Test Feedback Alerts */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-fadeIn ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.msg}</span>
              </div>
            )}

            {/* Live Telegram Alert Card Preview */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Telegram Channel Message Preview (আপনার চ্যানেলে এভাবে পোস্ট হবে):
              </span>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/20 font-mono text-[11px] text-slate-300 space-y-1 leading-relaxed">
                <p className="text-amber-400 font-bold">🔥 BYBIT AI HIGH-PRIORITY TRADING SIGNAL</p>
                <p>🪙 কোয়েন: $BTCUSDT</p>
                <p>📊 সিগন্যাল: 🚀 LONG (বাই)</p>
                <p>🎯 এন্ট্রি প্রাইস: $88,450.50</p>
                <p>✨ কনফিডেন্স স্কোর: 88%</p>
                <p>🎯 টেক প্রফিট (TP): $91,200.00 | 🛑 স্টপ লস (SL): $87,100.00</p>
                <p className="text-slate-500 italic text-[10px]">
                  ⚡ Bybit V5 AI Trader Pro Webhook Alert
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
          >
            বাতিল
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccess ? 'সংরক্ষিত হয়েছে! ✓' : 'সেভ করুন (Save Settings)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
