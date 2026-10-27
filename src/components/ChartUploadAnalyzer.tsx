import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Target,
  AlertTriangle,
  RefreshCw,
  X,
  FileText,
  CheckCircle2,
  Zap,
  Info,
  HelpCircle,
  BarChart2,
} from 'lucide-react';

export interface ChartAnalysisResult {
  coinName: string;
  timeframe: string;
  tradeDirection: 'LONG' | 'SHORT' | 'WAIT';
  confidenceScore: number;
  entry: string;
  tp1: string;
  tp2: string;
  tp3: string;
  sl: string;
  riskReward: string;
  recommendedLeverage: string;
  bengaliAnalysis: {
    summary: string;
    chartPattern: string;
    supportResistance: string;
    technicalRationale: string;
    riskWarning: string;
  };
}

export const ChartUploadAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<ChartAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('অনুগ্ৰহ করে একটি সঠিক ছবি (PNG, JPG, WEBP) আপলোড করুন।');
      return;
    }
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('ছবি পড়তে সমস্যা হয়েছে। অনুগ্রহ করে অন্য ছবি নির্বাচন করুন।');
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setErrorMessage('ছবি লোড করা যায়নি। আবার চেষ্টা করুন।');
      };
      img.onload = () => {
        // Resize image to max 1200px to ensure fast upload on mobile
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setSelectedImage(compressedBase64);
          setMimeType('image/jpeg');
          setAnalysisResult(null);
        } else {
          // Fallback to raw data url
          setSelectedImage(event.target?.result as string);
          setMimeType(file.type || 'image/png');
          setAnalysisResult(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAnalyzeChart = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('চার্ট আপলোড করা হচ্ছে...');

    try {
      setTimeout(() => setLoadingStep('১২ বছরের অভিজ্ঞতা দিয়ে ক্যান্ডেলস্টিক রিড করা হচ্ছে...'), 1200);
      setTimeout(() => setLoadingStep('সাপোর্ট/রেজিস্ট্যান্স ও অর্ডার ব্লক যাচাই করা হচ্ছে...'), 2800);
      setTimeout(() => setLoadingStep('এন্ট্রি, TP, SL ও ঝুঁকি-রিওয়ার্ড হিসাব করা হচ্ছে...'), 4200);

      const res = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          userNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'চার্ট অ্যানালাইসিস ব্যর্থ হয়েছে।');
      }

      const data: ChartAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'নেটওয়ার্ক এরর। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  // Preset demo chart loader for quick user testing
  const loadDemoChart = (type: 'BULLISH' | 'BEARISH') => {
    // Generate a clean canvas demo chart placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 350;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 600, 350);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < 600; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 350); ctx.stroke();
      }
      for (let y = 0; y < 350; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(600, y); ctx.stroke();
      }

      // Title
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(type === 'BULLISH' ? 'BTC/USDT 4H Bullish Breakout Chart' : 'ETH/USDT 1H Resistance Reject Chart', 20, 30);

      // Draw Candlesticks
      const candles = type === 'BULLISH'
        ? [
            { open: 220, close: 200, high: 230, low: 190, green: false },
            { open: 200, close: 180, high: 210, low: 175, green: false },
            { open: 180, close: 210, high: 220, low: 170, green: true },
            { open: 210, close: 240, high: 250, low: 200, green: true },
            { open: 240, close: 235, high: 255, low: 225, green: false },
            { open: 235, close: 280, high: 290, low: 230, green: true },
          ]
        : [
            { open: 120, close: 160, high: 170, low: 110, green: true },
            { open: 160, close: 200, high: 215, low: 150, green: true },
            { open: 200, close: 260, high: 270, low: 190, green: true },
            { open: 260, close: 230, high: 280, low: 220, green: false },
            { open: 230, close: 190, high: 240, low: 180, green: false },
            { open: 190, close: 140, high: 200, low: 130, green: false },
          ];

      candles.forEach((c, idx) => {
        const x = 70 + idx * 80;
        ctx.strokeStyle = c.green ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 15, c.high);
        ctx.lineTo(x + 15, c.low);
        ctx.stroke();

        ctx.fillStyle = c.green ? '#10b981' : '#ef4444';
        const bodyY = Math.min(c.open, c.close);
        const bodyH = Math.max(Math.abs(c.close - c.open), 4);
        ctx.fillRect(x, bodyY, 30, bodyH);
      });

      const dataUrl = canvas.toDataURL('image/png');
      setSelectedImage(dataUrl);
      setMimeType('image/png');
      setUserNotes(type === 'BULLISH' ? 'কীভাবে এই বুলিশ ট্রেন্ডে বাই ট্রেড নিব?' : 'এখান থেকে শর্ট সেল ট্রেড নেওয়া কি ঠিক হবে?');
      setAnalysisResult(null);
    }
  };

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl border border-amber-500/30 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <BarChart2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight">
                📸 ১২ বছরের অভিজ্ঞ ট্রেডারের চার্ট হেল্পার (AI Chart Specialist)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                12Y EXP
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              যেকোনো কয়েনের চার্ট স্ক্রিনশট আপলোড করুন — AI আপনাকে এন্ট্রি, SL, TP এবং ট্রেড নেওয়ার সঠিক কারণ বাংলায় বুঝিয়ে দেবে।
            </p>
          </div>
        </div>

        {/* Demo buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">ডেমো চার্ট চেষ্টা করুন:</span>
          <button
            type="button"
            onClick={() => loadDemoChart('BULLISH')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
          >
            📈 বুলিশ ডেমো
          </button>
          <button
            type="button"
            onClick={() => loadDemoChart('BEARISH')}
            className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all"
          >
            📉 বেয়ারিশ ডেমো
          </button>
        </div>
      </div>

      {/* Upload Box & Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Upload Zone (Left Column) */}
        <div className="lg:col-span-7 space-y-3">
          {!selectedImage ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-900/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center min-h-[220px]"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="p-4 rounded-2xl bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 mb-3 transition-transform group-hover:scale-105">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                এখানে ক্লিক করে অথবা চার্ট এর ছবি ড্র্যাগ করে আপলোড করুন
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                TradingView, Bybit, Binance বা যেকোনো এক্সচেঞ্জের চার্ট স্ক্রিনশট সাপোর্ট করে (PNG, JPG, WEBP)
              </p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 p-2">
              <img
                src={selectedImage}
                alt="Uploaded Trading Chart"
                className="w-full max-h-[320px] object-contain rounded-xl bg-slate-900/50"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/90 text-slate-200 hover:text-red-400 border border-slate-700 shadow-lg transition-all"
                title="ছবি সরিয়ে ফেলুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              আপনার কোনো প্রশ্ন বা নোট থাকলে লিখুন (ঐচ্ছিক):
            </label>
            <input
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="যেমন: BTC/USDT 4H চার্ট, আমি কি এখন বাই নিব না রিটেস্টের জন্য অপেক্ষা করব?"
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleAnalyzeChart}
            disabled={!selectedImage || isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              !selectedImage || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{loadingStep || 'অ্যানালাইসিস করা হচ্ছে...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>🤖 ১২ বছরের অভিজ্ঞ AI দিয়ে চার্ট বিশ্লেষণ করুন</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Info & Guidelines Sidebar (Right Column) */}
        <div className="lg:col-span-5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              কীভাবে এই চার্ট হেল্পার আপনাকে সাহায্য করবে?
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>সঠিক এন্ট্রি (Entry):</strong> কোথায় ট্রেডে প্রবেশ করলে লসের ঝুঁকি সর্বনিম্ন থাকবে তা বলবে।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>টেক প্রফিট (TP1, TP2, TP3):</strong> রেজিস্ট্যান্স ও লিকুইডিটি জোন অনুযায়ী লাভ লক করার টার্গেট প্রদান করবে।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>স্টপ লস (SL):</strong> সাপোর্ট ভাঙলে অ্যাকাউন্ট সুরক্ষিত রাখতে সুনির্দিষ্ট স্টপ লস লেভেল দিবে।
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>বাংলা ব্যাখ্যা (Full Logic):</strong> ক্যান্ডেলস্টিক, সাপোর্ট, রিভার্সাল ও চার্ট প্যাটার্নের কারণ সহজ ভাষায় বুঝিয়ে দেবে।
                </span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-200 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              প্রো টিপস:
            </div>
            <p>
              স্পষ্ট ক্যান্ডেলস্টিক, টাইমফ্রেম (যেমন 15m, 1H, 4H) এবং ভলিউম দেখা যায় এমন পরিষ্কার চার্ট আপলোড করলে সর্বোচ্চ নির্ভুল ফলাফল পাওয়া যাবে।
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
          {/* Direction Banner */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border ${
              analysisResult.tradeDirection === 'LONG'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : analysisResult.tradeDirection === 'SHORT'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl`}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                {analysisResult.tradeDirection === 'LONG' && <TrendingUp className="w-7 h-7 text-emerald-400" />}
                {analysisResult.tradeDirection === 'SHORT' && <TrendingDown className="w-7 h-7 text-red-400" />}
                {analysisResult.tradeDirection === 'WAIT' && <Clock className="w-7 h-7 text-amber-400" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    {analysisResult.coinName || 'CHART'} ({analysisResult.timeframe || '1H'})
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold">
                    কনফিডেন্স: {analysisResult.confidenceScore}%
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black mt-0.5">
                  {analysisResult.tradeDirection === 'LONG' && '🟢 বাই / লং (BUY / LONG) ট্রেড নেওয়ার সিগন্যাল'}
                  {analysisResult.tradeDirection === 'SHORT' && '🔴 সেল / শর্ট (SELL / SHORT) ট্রেড নেওয়ার সিগন্যাল'}
                  {analysisResult.tradeDirection === 'WAIT' && '🟡 অপেক্ষা করুন (WAIT) - এখন ট্রেড নেওয়া ঝুঁকিপূর্ণ'}
                </h3>
              </div>
            </div>

            <div className="self-stretch sm:self-auto text-right bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                সুপারিশকৃত লেভারেজ
              </span>
              <span className="text-sm font-black font-mono text-amber-400">
                {analysisResult.recommendedLeverage || '3x - 5x'}
              </span>
            </div>
          </div>

          {/* Key Trade Parameters Grid (Entry, TP, SL, Risk-Reward) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Entry */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                এন্ট্রি প্রাইজ (Entry Zone)
              </span>
              <div className="text-base font-black font-mono text-slate-100">
                {analysisResult.entry}
              </div>
              <span className="text-[10px] text-slate-400 block">
                এই লেভেলে ট্রেড রান করুন
              </span>
            </div>

            {/* Take Profits */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                টেক প্রফিট (Take Profit - TP)
              </span>
              <div className="text-xs font-mono font-bold text-emerald-400">
                TP1: {analysisResult.tp1}
              </div>
              <div className="text-[11px] font-mono text-slate-300">
                TP2: {analysisResult.tp2}
              </div>
              {analysisResult.tp3 && (
                <div className="text-[10px] font-mono text-slate-400">
                  TP3: {analysisResult.tp3}
                </div>
              )}
            </div>

            {/* Stop Loss */}
            <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 space-y-1">
              <span className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                স্টপ লস (Stop Loss - SL)
              </span>
              <div className="text-base font-black font-mono text-red-400">
                {analysisResult.sl}
              </div>
              <span className="text-[10px] text-slate-400 block">
                অ্যাকাউন্ট সুরক্ষায় বাধ্যতামুলক
              </span>
            </div>

            {/* Risk Reward */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                রিস্ক ও রিওয়ার্ড (Risk/Reward)
              </span>
              <div className="text-base font-black font-mono text-amber-400">
                {analysisResult.riskReward}
              </div>
              <span className="text-[10px] text-slate-400 block">
                পজিশন সাইজিং সঠিকভাবে রাখুন
              </span>
            </div>
          </div>

          {/* Detailed Bengali Analysis Breakdown */}
          <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ১২ বছরের অভিজ্ঞ ট্রেডারের চার্ট বিশ্লেষণের বিস্তারিত কারণ (বাংলায়):
            </h3>

            {/* Summary */}
            {analysisResult.bengaliAnalysis?.summary && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-200 text-xs leading-relaxed font-sans">
                <span className="font-bold text-amber-400 block mb-0.5">সংক্ষিপ্ত সারসংক্ষেপ:</span>
                {analysisResult.bengaliAnalysis.summary}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chart Pattern */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                  ক্যান্ডেলস্টিক ও চার্ট প্যাটার্ন:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysisResult.bengaliAnalysis?.chartPattern || 'প্যাটার্ন শনাক্ত করা হয়েছে।'}
                </p>
              </div>

              {/* Support Resistance */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  সাপোর্ট ও রেজিস্ট্যান্স লেভেল:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysisResult.bengaliAnalysis?.supportResistance || 'গুরুত্বপূর্ণ সাপোর্ট ও রেজিস্ট্যান্স জোন।'}
                </p>
              </div>
            </div>

            {/* Technical Rationale (Why this Entry, TP & SL) */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/20 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                কেন এই এন্ট্রি, টেক প্রফিট ও স্টপ লস নির্ধারণ করা হলো (Detailed Rationale):
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {analysisResult.bengaliAnalysis?.technicalRationale || 'বিস্তারিত কারিগরি বিশ্লেষণ।'}
              </p>
            </div>

            {/* Risk Warning */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-red-500/20 text-xs text-slate-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-400 block mb-0.5">মূলধন সুরক্ষা সতর্কবার্তা:</span>
                <p className="font-sans text-slate-300">
                  {analysisResult.bengaliAnalysis?.riskWarning || 'সর্বদা স্টপ লস মেনে ট্রেড পরিচালনা করুন।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
