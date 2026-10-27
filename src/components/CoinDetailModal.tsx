import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Brain,
  Grid,
  ShieldAlert,
  Clock,
  RefreshCw,
  Activity,
  Gauge,
  Timer,
  Calendar,
  Target,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TickerData,
  KlinePoint,
  Timeframe,
  TechnicalIndicators,
  AiAnalysisResult,
} from '../types';
import {
  fetchKlineData,
  fetchAiGeminiInsight,
} from '../services/api';
import {
  computeTechnicalIndicators,
  computeAiAnalysis,
  evaluateRiskGuard,
  calculateSMA,
} from '../utils/technicalAnalysis';
import { TechnicalAnalysisTab } from './TechnicalAnalysisTab';
import { AiAnalysisCard } from './AiAnalysisCard';
import { formatPrice } from '../utils/formatters';
import { GridAssistantCard } from './GridAssistantCard';
import { SignalStrengthIndicator } from './SignalStrengthIndicator';
import { CoinEventAndTrendTimer } from './CoinEventAndTrendTimer';
import { LongShortProbabilityMeter } from './LongShortProbabilityMeter';
import { CandlestickPatternChart } from './CandlestickPatternChart';
import { SignalConfirmationConfluenceCard } from './SignalConfirmationConfluenceCard';

interface CoinDetailModalProps {
  coin: TickerData;
  onClose: () => void;
  isWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onOpenInCouncil?: (symbol: string) => void;
}

type DetailTab = 'CONFLUENCE_FACTORS' | 'EVENTS_TIMER' | 'EMA_SETUP' | 'SIGNAL_STRENGTH' | 'AI_ANALYSIS' | 'TECHNICALS' | 'GRID_BOT' | 'RISK_GUARD';

export const CoinDetailModal: React.FC<CoinDetailModalProps> = ({
  coin,
  onClose,
  isWatchlist,
  onToggleWatchlist,
  onOpenInCouncil,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [chartMode, setChartMode] = useState<'CANDLESTICK' | 'AREA'>('CANDLESTICK');
  const [activeTab, setActiveTab] = useState<DetailTab>('AI_ANALYSIS');
  const [klines, setKlines] = useState<KlinePoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(true);
  const [geminiInsight, setGeminiInsight] = useState<string | null>(null);
  const [showSma20, setShowSma20] = useState<boolean>(true);
  const [showSma50, setShowSma50] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingChart(true);

    fetchKlineData(coin.symbol, timeframe, 80)
      .then((data) => {
        if (isMounted) {
          setKlines(data);
          setIsLoadingChart(false);
        }
      })
      .catch((err) => {
        console.warn('Failed to load klines:', err);
        if (isMounted) setIsLoadingChart(false);
      });

    return () => {
      isMounted = false;
    };
  }, [coin.symbol, timeframe]);

  // Compute live indicators & AI
  const indicators: TechnicalIndicators = computeTechnicalIndicators(klines, coin.lastPrice, coin.symbol, coin);
  const aiResult: AiAnalysisResult = computeAiAnalysis(coin, indicators, klines);

  // Compute SMA 20 & SMA 50 series for chart visualization
  const klineCloses = klines.map((k) => k.close);
  const sma20Series = calculateSMA(klineCloses, 20);
  const sma50Series = calculateSMA(klineCloses, 50);

  const chartData = klines.map((k, idx) => ({
    ...k,
    sma20: idx >= 19 ? Number(sma20Series[idx]?.toFixed(2)) : undefined,
    sma50: idx >= 49 ? Number(sma50Series[idx]?.toFixed(2)) : undefined,
  }));

  if (geminiInsight) {
    aiResult.geminiInsight = geminiInsight;
  }

  // Optionally fetch Gemini breakdown on mount
  useEffect(() => {
    fetchAiGeminiInsight(coin, indicators).then((res) => {
      if (res) setGeminiInsight(res);
    });
  }, [coin.symbol]);

  const riskWarnings = evaluateRiskGuard(coin, indicators);
  const isPositive = coin.price24hPcnt >= 0;

  // Calculate 24h price range percentage position
  const rangeSpan = Math.max(coin.highPrice24h - coin.lowPrice24h, 0.000001);
  const rangePct = Math.min(
    Math.max(((coin.lastPrice - coin.lowPrice24h) / rangeSpan) * 100, 0),
    100
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-sm">
              {coin.baseCoin.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">{coin.baseCoin}</h2>
                <span className="text-xs text-slate-400 font-mono">/ USDT</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                  Bybit V5
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs mt-0.5">
                <span className="font-mono font-bold text-slate-200">
                  {formatPrice(coin.lastPrice)}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isPositive ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {(coin.price24hPcnt * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Header Mini Sparkline Chart */}
            <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">
                  Sparkline
                </span>
                <span className="text-[11px] font-mono text-slate-300">
                  {klines.length} pts
                </span>
              </div>
              <div className="w-24 h-8">
                {klines.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={klines} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                      <defs>
                        <linearGradient id="headerSparkGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="0%"
                            stopColor={isPositive ? '#10b981' : '#ef4444'}
                            stopOpacity={0.4}
                          />
                          <stop
                            offset="100%"
                            stopColor={isPositive ? '#10b981' : '#ef4444'}
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <YAxis domain={['dataMin', 'dataMax']} hide />
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={isPositive ? '#10b981' : '#ef4444'}
                        strokeWidth={1.5}
                        fill="url(#headerSparkGrad)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full bg-slate-800/40 rounded animate-pulse" />
                )}
              </div>
            </div>

            {onOpenInCouncil && (
              <button
                type="button"
                onClick={() => {
                  onOpenInCouncil(coin.symbol);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
                title="১২ সিনিয়র এআই কাউন্সিল রুমে বিস্তারিত বিচার দেখুন"
              >
                <Brain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">১২ সিনিয়র কাউন্সিল রুম</span>
                <span className="sm:hidden">Council</span>
              </button>
            )}

            <button
              onClick={() => onToggleWatchlist(coin.symbol)}
              className={`p-2 rounded-xl border transition-all ${
                isWatchlist
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${isWatchlist ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Key Metrics Strip & Sparkline Range Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Left 2 Cols: Metrics Grid */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 text-[10px] block">24H High</span>
                <span className="text-slate-200 font-bold">${coin.highPrice24h}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">24H Low</span>
                <span className="text-slate-200 font-bold">${coin.lowPrice24h}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">24H Volume</span>
                <span className="text-slate-200 font-bold">
                  ${(coin.turnover24h / 1e6).toFixed(2)}M
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Funding Rate</span>
                <span
                  className={`font-bold ${
                    coin.fundingRate && Math.abs(coin.fundingRate) >= 0.0005
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {coin.fundingRate ? (coin.fundingRate * 100).toFixed(4) + '%' : 'N/A'}
                </span>
              </div>
            </div>

            {/* Right Col: 24H High-Low Range Position with Sparkline preview */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 flex items-center gap-1 font-sans">
                  <Activity className="w-3 h-3 text-amber-400" />
                  24H Range Position
                </span>
                <span className="text-amber-400 font-bold">{rangePct.toFixed(0)}% of High</span>
              </div>

              {/* Progress Slider Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/50">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${rangePct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>Low: ${coin.lowPrice24h}</span>
                  <span>High: ${coin.highPrice24h}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Long vs Short Probability Meter Bar */}
          <LongShortProbabilityMeter coin={coin} indicators={indicators} showDetails={false} />

          {/* Live Chart Section (Candlestick Pattern vs Area) */}
          <div className="space-y-3">
            {/* Chart Type Toggle Tabs */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setChartMode('CANDLESTICK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    chartMode === 'CANDLESTICK'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🕯️</span>
                  <span>ক্যান্ডেলস্টিক চার্ট ও প্যাটার্ন (Candlestick)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartMode('AREA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    chartMode === 'AREA'
                      ? 'bg-slate-800 text-slate-100 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>📈</span>
                  <span>লাইন চার্ট (Line/Area)</span>
                </button>
              </div>
            </div>

            {/* Candlestick Pattern Chart Component */}
            {chartMode === 'CANDLESTICK' ? (
              <CandlestickPatternChart
                klines={klines}
                symbol={coin.symbol}
                coin={coin}
                indicators={indicators}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                showPatterns={true}
                showSMA={true}
                showVolume={true}
              />
            ) : (
              <div className="bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-amber-400" />
                      Live Price Area Chart
                    </span>

                    {/* SMA Overlay Toggles & Live Indicator Values */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <button
                        type="button"
                        onClick={() => setShowSma20(!showSma20)}
                        className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                          showSma20
                            ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title="Toggle SMA 20 Overlay"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        SMA 20: ${indicators.sma20 ? indicators.sma20.toLocaleString() : 'N/A'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSma50(!showSma50)}
                        className={`px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 ${
                          showSma50
                            ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title="Toggle SMA 50 Overlay"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                        SMA 50: ${indicators.sma50 ? indicators.sma50.toLocaleString() : 'N/A'}
                      </button>
                    </div>
                  </div>

                  {/* Timeframe Buttons */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {(['15m', '1h', '4h', '1d'] as Timeframe[]).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          timeframe === tf
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tf.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recharts Price & Volume Chart */}
                <div className="h-64 sm:h-72 w-full relative">
                  {isLoadingChart ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-400 font-medium text-xs">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading Bybit V5 klines...</span>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <defs>
                          <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop
                              offset="5%"
                              stopColor={isPositive ? '#10b981' : '#ef4444'}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={isPositive ? '#10b981' : '#ef4444'}
                              stopOpacity={0.0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                        <XAxis
                          dataKey="timeStr"
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                          minTickGap={25}
                        />
                        <YAxis
                          yAxisId="price"
                          orientation="right"
                          domain={['auto', 'auto']}
                          stroke="#64748b"
                          fontSize={10}
                          tickLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <YAxis
                          yAxisId="volume"
                          orientation="left"
                          domain={[0, 'auto']}
                          hide={true}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: '#f8fafc',
                          }}
                          formatter={(val: any, name: any) => [
                            typeof val === 'number' ? `$${val.toLocaleString()}` : val,
                            name,
                          ]}
                        />
                        <Bar
                          yAxisId="volume"
                          dataKey="volume"
                          fill="#334155"
                          opacity={0.4}
                          barSize={4}
                        />
                        <Area
                          yAxisId="price"
                          type="monotone"
                          dataKey="close"
                          stroke={isPositive ? '#10b981' : '#ef4444'}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#priceGradient)"
                          name="Price"
                        />
                        {showSma20 && (
                          <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="sma20"
                            stroke="#f59e0b"
                            strokeWidth={1.5}
                            dot={false}
                            name="SMA 20"
                            isAnimationActive={false}
                          />
                        )}
                        {showSma50 && (
                          <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="sma50"
                            stroke="#3b82f6"
                            strokeWidth={1.5}
                            dot={false}
                            name="SMA 50"
                            isAnimationActive={false}
                          />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sub Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'CONFLUENCE_FACTORS', label: '৯ কনফ্লুয়েন্স ফ্যাক্টর্স ⚡', icon: Target },
              { id: 'EVENTS_TIMER', label: 'Events & Duration ⏱️', icon: Timer },
              { id: 'EMA_SETUP', label: 'EMA 50/100/200 Setup 🎯', icon: Target },
              { id: 'SIGNAL_STRENGTH', label: 'Signal Strength', icon: Gauge },
              { id: 'AI_ANALYSIS', label: 'AI Recommendation', icon: Brain },
              { id: 'TECHNICALS', label: 'Technical Indicators', icon: BarChart2 },
              { id: 'GRID_BOT', label: 'Grid Assistant', icon: Grid },
              { id: 'RISK_GUARD', label: `Risk Guard (${riskWarnings.length})`, icon: ShieldAlert },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DetailTab)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content */}
          {activeTab === 'CONFLUENCE_FACTORS' && (
            <SignalConfirmationConfluenceCard coin={coin} indicators={indicators} />
          )}
          {activeTab === 'EVENTS_TIMER' && (
            <CoinEventAndTrendTimer coin={coin} indicators={indicators} />
          )}
          {activeTab === 'EMA_SETUP' && (
            <TechnicalAnalysisTab indicators={indicators} currentPrice={coin.lastPrice} coin={coin} klines={klines} />
          )}
          {activeTab === 'SIGNAL_STRENGTH' && (
            <SignalStrengthIndicator indicators={indicators} coin={coin} klines={klines} />
          )}
          {activeTab === 'AI_ANALYSIS' && (
            <AiAnalysisCard
              aiResult={aiResult}
              ticker={coin}
              onOpenBotSetup={() => setActiveTab('GRID_BOT')}
            />
          )}
          {activeTab === 'TECHNICALS' && (
            <TechnicalAnalysisTab indicators={indicators} currentPrice={coin.lastPrice} coin={coin} klines={klines} />
          )}
          {activeTab === 'GRID_BOT' && (
            <GridAssistantCard
              ticker={coin}
              indicators={indicators}
              recommendedDirection={aiResult.finalSignal}
            />
          )}
          {activeTab === 'RISK_GUARD' && (
            <div className="space-y-3">
              {riskWarnings.length === 0 ? (
                <div className="p-6 bg-slate-950/50 rounded-xl text-center text-slate-400 text-xs">
                  ✓ No active risk guard warnings for {coin.symbol}.
                </div>
              ) : (
                riskWarnings.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-slate-200 space-y-1"
                  >
                    <div className="font-bold text-red-400 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{w.title}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{w.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
