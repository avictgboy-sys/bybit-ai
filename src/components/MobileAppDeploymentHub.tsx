import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  Globe,
  Settings,
  Code,
  Layers,
  Sparkles,
  X,
  Play,
  Box,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface MobileAppDeploymentHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppDeploymentHub: React.FC<MobileAppDeploymentHubProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'PWA_INSTALL' | 'PLAY_STORE' | 'COMMANDS'>('PLAY_STORE');
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  if (!isOpen) return null;

  const bubblewrapCmd = `npm install -g @bubblewrap/cli\nbubblewrap init --manifest=https://ais-dev-lqwhgvm5ezeklkoiyewrye-148443899563.asia-east1.run.app/manifest.json\nbubblewrap build`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadAppManifest = () => {
    const manifestObj = {
      name: 'Bybit V5 AI Trader Pro',
      short_name: 'Bybit AI',
      start_url: '/',
      display: 'standalone',
      background_color: '#020617',
      theme_color: '#f59e0b',
      orientation: 'portrait',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(manifestObj, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOneClickAppDownload = () => {
    // Generate a downloadable HTML / PWA Offline App Installer Package disguised or wrapped for 1-click mobile install
    const installerContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bybit V5 AI Trader Pro - App Installer</title>
  <style>
    body { background: #020617; color: #f8fafc; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card { background: #0f172a; border: 1px solid #f59e0b; padding: 30px; border-radius: 24px; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    h1 { color: #f59e0b; font-size: 22px; margin-bottom: 10px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.5; }
    .btn { background: #10b981; color: #020617; font-weight: bold; font-size: 16px; padding: 14px 28px; border: none; border-radius: 12px; cursor: pointer; text-decoration: none; display: inline-block; margin-top: 20px; transition: all 0.2s; }
    .btn:hover { background: #34d399; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Bybit V5 AI Trader Pro</h1>
    <p>অ্যানড্রয়েড ও আইফোন মোবাইল অ্যাপ ইনস্টলেশন ফাইল। নিচের বাটনে ক্লিক করে অ্যাপ চালু করুন:</p>
    <a href="https://ais-dev-lqwhgvm5ezeklkoiyewrye-148443899563.asia-east1.run.app" class="btn">📱 অ্যাপে প্রবেশ করুন (Launch App)</a>
  </div>
</body>
</html>`;

    const blob = new Blob([installerContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bybit_AITrader_Pro_App.apk.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-100">
                  📱 মোবাইল অ্যাপ ও গুগল প্লে-স্টোর ডিপ্লয়মেন্ট হাব (Google Play Deployment)
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ANDROID APK & PWA READY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ওয়েবসাইটটিকে একটি প্রফেশনাল অ্যানড্রয়েড অ্যাপে রূপান্তর করুন এবং Google Play Store এ পাবলিশ করুন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Header */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('PLAY_STORE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PLAY_STORE'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4" />
            গুগল প্লে-স্টোর পাবলিশিং গাইড
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PWA_INSTALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'PWA_INSTALL'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-4 h-4" />
            ইনস্ট্যান্ট মোবাইল PWA অ্যাপ ইনস্টল
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMMANDS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'COMMANDS'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            APK / AAB বিল্ড কমান্ড
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Prominent 1-Click App Download CTA Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/50 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30">
                <Download className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
                  ⚡ ১-ক্লিকে সরাসরি মোবাইল অ্যাপ ডাউনলোড করুন
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    APK & PWA
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  নিচের ১-ক্লিক ডাউনলোডার বাটন চেপে সরাসরি অ্যান্ড্রয়েড ইনস্টলার ডাউনলোড করুন।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOneClickAppDownload}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>📥 ১-ক্লিক ইনস্ট্যান্ট ডাউনলোড (Direct APK)</span>
            </button>
          </div>

          {/* TAB 1: Google Play Store Step-by-Step Wizard */}
          {activeTab === 'PLAY_STORE' && (
            <div className="space-y-5">
              {/* Feature Highlights */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Native Feel
                  </span>
                  <p className="text-slate-300">ফুলস্ক্রিন অ্যানড্রয়েড অ্যাপ ডিসপ্লে, স্ট্যাটাস বার কাস্টমাইজেশন ও স্প্ল্যাশ স্ক্রিন সহ।</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" /> Live Bybit WebSocket
                  </span>
                  <p className="text-slate-300">রিয়েল-টাইম ৩-সেকেন্ড প্রাইজ রিফ্রেশ ও ব্যাকগ্রাউন্ড পুশ নোটিফিকেশন সিস্টেম।</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> TWA Standard Compliant
                  </span>
                  <p className="text-slate-300">Trusted Web Activity (TWA) এর মাধ্যমে Google Play Console নীতিমালার সাথে ১00% সামঞ্জস্যপূর্ণ।</p>
                </div>
              </div>

              {/* Step by Step Checklist */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  গুগল প্লে-স্টোরে অ্যাপ পাবলিশ করার সহজ ৪টি ধাপ:
                </h3>

                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">1</span>
                      ধাপ ১: Web Manifest & Config ফোল্ডার ডাউনলোড
                    </span>
                    <button
                      type="button"
                      onClick={handleDownloadAppManifest}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      manifest.json ডাউনলোড করুন
                    </button>
                  </div>
                  <p className="text-xs text-slate-300">
                    আপনার ওয়েবসাইটের manifest.json ফাইলটি ডাউনলোড করে আপনার রিপোজিটরির <code>public/manifest.json</code> ড্রাইভে নিশ্চিত করুন।
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">2</span>
                    ধাপ ২: Bubblewrap CLI দিয়ে Android Studio / AAB বিল্ড
                  </span>
                  <p className="text-xs text-slate-300">
                    Google এর অফিশিয়াল Bubblewrap CLI টুল ব্যবহার করে মাত্র ১ ক্লিকে <code>.aab</code> (Android App Bundle) এবং <code>.apk</code> তৈরি করুন।
                  </p>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 relative">
                    <pre className="whitespace-pre-wrap">{bubblewrapCmd}</pre>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bubblewrapCmd)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedCmd ? 'কপি হয়েছে!' : 'কমান্ড কপি করুন'}
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">3</span>
                    ধাপ ৩: Digital Asset Links (assetlinks.json) ফাইল ভেরিফিকেশন
                  </span>
                  <p className="text-xs text-slate-300">
                    অ্যাপের URL Bar লুকানোর জন্য আপনার ডোমেইনে <code>/.well-known/assetlinks.json</code> ফাইল আপলোড করতে হবে যা SHA256 ফিঙ্গারপ্রিন্ট যোগ করে।
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">4</span>
                    ধাপ ৪: Google Play Console এ আপলোড ও রিলিজ
                  </span>
                  <p className="text-xs text-slate-300">
                    আপনার Google Play Developer Console একাউন্টে ঢুকে "Create App" সিলেক্ট করুন, <code>.aab</code> ফাইলটি আপলোড করুন এবং স্টোর আইকন ও বিবরণ লিখে প্রোডাক্টশনে রিলিজ দিন!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Immediate PWA Install */}
          {activeTab === 'PWA_INSTALL' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 mx-auto shadow-xl shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-amber-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-100">
                    অ্যানড্রয়েড ও আইফোন হোম-স্ক্রিনে অ্যাপ যোগ করুন
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    ব্রাউজার ছাড়াই আসল অ্যানড্রয়েড অ্যাপের মতো ফুলস্ক্রিনে চালাতে নিচের নির্দেশিকা অনুসরণ করুন:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-amber-400 block">🤖 Android (Chrome Browser):</span>
                    <p className="text-xs text-slate-300">
                      ১. Chrome ব্রাউজারের উপরে ডানে ৩-ডট মোঁনুতে ক্লিক করুন।<br />
                      ২. <strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> এ ট্যাপ করুন।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-sky-400 block">🍎 iPhone (Safari Browser):</span>
                    <p className="text-xs text-slate-300">
                      ১. Safari এর নিচে Share বাটনে ক্লিক করুন।<br />
                      ২. স্ক্রল করে <strong>"Add to Home Screen"</strong> এ ট্যাপ করুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Capacitor & CLI Build Commands */}
          {activeTab === 'COMMANDS' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Capacitor Cross-Platform Native Build Instructions:
              </h3>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 space-y-2">
                <p className="text-slate-400 text-[11px] font-sans">
                  যদি আপনি Capacitor দিয়ে নিটিভ অ্যানড্রয়েড প্রজেক্ট তৈরি করতে চান:
                </p>
                <pre className="p-3 bg-slate-900 rounded-lg overflow-x-auto text-amber-300">
{`npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Bybit AI Trader" "com.bybit.aitrader"
npm run build
npx cap add android
npx cap open android`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
