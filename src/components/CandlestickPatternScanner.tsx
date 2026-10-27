import React, { useState, useEffect } from 'react';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Search,
  ChevronRight,
  Activity,
  Layers,
  ArrowRight,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
} from 'lucide-react';
import { TickerData, KlinePoint, Timeframe } from '../types';
import { fetchKlineData } from '../services/api';
import { CandlestickPatternChart } from './CandlestickPatternChart';
import { detectCandlestickPatterns, DetectedPattern } from '../utils/candlestickPatterns';
import { formatPrice } from '../utils/formatters';
import { CandlestickVisual } from './CandlestickVisual';
import { CandlestickLearningModal } from './CandlestickLearningModal';

interface CandlestickPatternScannerProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export const CandlestickPatternScanner: React.FC<CandlestickPatternScannerProps> = ({
  tickers,
  onSelectCoin,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [klines, setKlines] = useState<KlinePoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [showLearningModal, setShowLearningModal] = useState<boolean>(false);
  const [learningPatternId, setLearningPatternId] = useState<string | undefined>(undefined);

  // Top popular coins to scan
  const topSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'PEPEUSDT', 'SUIUSDT'];

  const currentTicker = tickers.find((t) => t.symbol === selectedSymbol) || tickers[0];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchKlineData(selectedSymbol, timeframe, 60)
      .then((data) => {
        if (isMounted) {
          setKlines(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load klines for scanner:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, timeframe]);

  // Detected patterns on active coin
  const detectedPatterns = detectCandlestickPatterns(klines);
  const latestPattern = detectedPatterns.length > 0 ? detectedPatterns[detectedPatterns.length - 1] : null;

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-500/30 p-3.5 sm:p-5 shadow-2xl space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <span className="text-xl">🕯️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                লাইভ ক্যান্ডেলস্টিক প্যাটার্ন স্ক্যানার (Live Candlestick Radar)
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                LIVE OHLC
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              মার্কেটের রিয়েল-টাইম ক্যান্ডেলস্টিক (Open, High, Low, Close) চার্ট, গ্রাফিক্যাল চিত্র ও রিভার্সাল প্যাটার্ন সংকেত
            </p>
          </div>
        </div>

        {/* Action button & Quick Coin Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLearningPatternId(undefined);
              setShowLearningModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-md"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📖 ক্যান্ডেলস্টিক শিখুন (Learn)</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {topSymbols.map((sym) => {
              const t = tickers.find((item) => item.symbol === sym);
              const isSelected = selectedSymbol === sym;
              const isUp = (t?.price24hPcnt || 0) >= 0;
              return (
                <button
                  key={sym}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105'
                      : 'bg-slate-950/80 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{sym.replace('USDT', '')}</span>
                  {t && (
                    <span
                      className={`text-[10px] ${
                        isSelected
                          ? 'text-slate-950 font-black'
                          : isUp
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {((t.price24hPcnt || 0) * 100).toFixed(1)}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Candlestick Chart Display */}
      {isLoading ? (
        <div className="h-72 w-full flex items-center justify-center bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
            <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>{selectedSymbol} ক্যান্ডেলস্টিক ডাটা প্রসেস হচ্ছে...</span>
          </div>
        </div>
      ) : (
        <CandlestickPatternChart
          klines={klines}
          symbol={selectedSymbol}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          height={320}
          showPatterns={true}
          showSMA={true}
          showVolume={true}
        />
      )}

      {/* Candlestick Educational Action Cards Grid with Diagrams */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {/* 1. Bullish Reversals Card */}
        <div
          onClick={() => {
            setLearningPatternId('hammer');
            setShowLearningModal(true);
          }}
          className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 hover:border-emerald-500/60 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <span>🚀</span>
              <span>বুলিশ রিভার্সাল প্যাটার্ন</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              BULL BIAS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-emerald-500/30 shrink-0">
              <CandlestickVisual patternId="hammer" size="xs" />
              <CandlestickVisual patternId="bullish_engulfing" size="xs" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>হ্যামার</strong> ও <strong>বুলিশ এনগালফিং</strong> দেখা দিলে সাপোর্ট লেভেলে বায়ারদের শক্তিশালী রিভার্সাল ঘটে।
            </p>
          </div>

          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 hover:underline">
            <span>ক্যান্ডেলস্টিক অ্যানাটমি ও ট্রেডিং নিয়ম দেখুন</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* 2. Bearish Reversals Card */}
        <div
          onClick={() => {
            setLearningPatternId('shooting_star');
            setShowLearningModal(true);
          }}
          className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2 hover:border-rose-500/60 transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-400 flex items-center gap-1">
              <span>⚠️</span>
              <span>বিয়ারিশ রিভার্সাল প্যাটার্ন</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
              BEAR BIAS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-rose-500/30 shrink-0">
              <CandlestickVisual patternId="shooting_star" size="xs" />
              <CandlestickVisual patternId="bearish_engulfing" size="xs" />
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>শুটিং স্টার</strong> ও <strong>ইভনিং স্টার</strong> রেজিস্ট্যান্স রিজেকশন নির্দেশ করে।
            </p>
          </div>

          <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 hover:underline">
            <span>বিয়ারিশ স্ট্র্যাটেজি ও স্টপ লস নিয়ম দেখুন</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* 3. Open Full Modal Button */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              বিস্তারিত এআই ও টেকনিক্যাল অ্যানালাইসিস
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedSymbol}-এর আরএসআই, ম্যাকডি, লিকুইডিটি ও গ্রিড বট দেখতে ক্লিক করুন
            </p>
          </div>
          <button
            onClick={() => currentTicker && onSelectCoin(currentTicker)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg"
          >
            <span>{selectedSymbol} ফুল ক্যান্ডেলস্টিক প্যানেল খুলুন</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Candlestick Learning Modal */}
      <CandlestickLearningModal
        isOpen={showLearningModal}
        onClose={() => setShowLearningModal(false)}
        initialPatternId={learningPatternId}
      />
    </div>
  );
};
