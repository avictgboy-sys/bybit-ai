export type Timeframe = '15m' | '1h' | '4h' | '1d';

export * from './types/signal';

export enum SignalDirection {
  LONG = 'LONG',
  SHORT = 'SHORT',
  NEUTRAL = 'NEUTRAL',
}

export type SignalType = 'LONG' | 'SHORT' | 'WAIT' | 'AVOID' | 'NEUTRAL';
export type FinalDirection = 'LONG' | 'SHORT' | 'NEUTRAL' | SignalDirection;

export interface IndicatorWeightConfig {
  emaTrend: number; // e.g. 25
  marketStructure: number; // e.g. 15
  rsi: number; // e.g. 10
  bollingerBands: number; // e.g. 10
  volumeRatio: number; // e.g. 10
  openInterest: number; // e.g. 10
  fundingRate: number; // e.g. 5
  fibonacci: number; // e.g. 10
  liquidationZones: number; // e.g. 5
}

export interface FactorScoreResult {
  factorName: string;
  weight: number;
  direction: SignalDirection | FinalDirection;
  contributionScore: number; // weighted contribution
  status: 'CONFIRMED' | 'RISK' | 'NEUTRAL';
  description: string;
  metricValue?: string | number;
}

export interface FinalSignalResult {
  direction: SignalDirection;
  confidence: number; // 0-100%
  signalQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  marketState: 'BULLISH TREND' | 'BEARISH TREND' | 'RANGE / MIXED' | 'EXTREME VOLATILITY';
  bullishScore: number; // 0-100
  bearishScore: number; // 0-100
  neutralScore: number; // 0-100
  dominantFactor: string;
  factorScores: FactorScoreResult[];
  weightingSchema: IndicatorWeightConfig;
  tradePlan?: TradePlan;
  validitySeconds: number;
  estimatedDuration: string;
  timestamp: number;
  summary: string;
}

export interface FactorConfirmation {
  factor:
    | 'EMA Trend'
    | 'RSI (14)'
    | 'BB Setup'
    | 'Volume'
    | 'Market Structure'
    | 'Funding Rate'
    | 'Open Interest'
    | 'Liquidation Zones'
    | 'Fibonacci';
  status: 'CONFIRMED' | 'RISK' | 'NEUTRAL'; // ✅ | ⚠️ | ⚪
  label: string;
  detail: string;
  weight: number;
  scoreContribution: number; // positive for long, negative for short, or neutral
}

export interface TradePlan {
  direction: FinalDirection;
  entryZone: { min: number; max: number; current: number };
  stopLoss: number;
  stopLossPcnt: number;
  tp1: number;
  tp1GainPcnt: number;
  tp2: number;
  tp2GainPcnt: number;
  tp3: number;
  tp3GainPcnt: number;
  riskRewardRatio: string;
  tradeStatus: 'ACTIVE' | 'WAITING' | 'INVALIDATED';
  invalidationReason?: string;
}

export interface CentralSignalDecision {
  finalSignal: FinalDirection;
  confidence: number; // 0-100%
  signalQuality: 'HIGH' | 'MEDIUM' | 'LOW';
  marketState: 'BULLISH TREND' | 'BEARISH TREND' | 'RANGE / MIXED' | 'EXTREME VOLATILITY';
  bullishScore: number; // 0-100
  bearishScore: number; // 0-100
  neutralScore: number; // 0-100
  confirmations: FactorConfirmation[];
  tradePlan?: TradePlan;
  validityMinutes: number;
  estimatedDuration: string;
  tradingStyle?: 'SCALPING' | 'SWING' | 'POSITION';
  tradingStyleLabelBn?: string;
  tradingStyleLabelEn?: string;
  estimatedDurationBn?: string;
  estimatedDurationEn?: string;
  volatilityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  volatilityPcnt?: number;
  lastAnalysisTimestamp: number;
  nextReanalysisTimestamp: number;
  reasonSummary: string;
}

export interface TickerData {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  lastPrice: number;
  prevPrice24h: number;
  price24hPcnt: number;
  highPrice24h: number;
  lowPrice24h: number;
  turnover24h: number;
  volume24h: number;
  fundingRate?: number;
  openInterest?: number;
  openInterestValue?: number;
  isFavorite?: boolean;
}

export interface KlinePoint {
  timestamp: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
  ema20?: number;
  ema50?: number;
  ema100?: number;
  ema200?: number;
  sma20?: number;
  sma50?: number;
  bollingerUpper?: number;
  bollingerMiddle?: number;
  bollingerLower?: number;
  vwap?: number;
}

export interface EmaTradeSetup {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'WAIT';
  trendTitleBn: string;
  signalBadge:
    | 'GOLDEN_ALIGNMENT'
    | 'GOLDEN_CROSS'
    | 'DEATH_CROSS'
    | 'DEATH_ALIGNMENT'
    | 'PULLBACK_DIP_BUY'
    | 'PULLBACK_SHORT'
    | 'CONSOLIDATION';
  entryPrice: number;
  entryRange: { min: number; max: number };
  tp1: number;
  tp1GainPcnt: number;
  tp2: number;
  tp2GainPcnt: number;
  tp3: number;
  tp3GainPcnt: number;
  stopLoss: number;
  stopLossPcnt: number;
  riskRewardRatio: string;
  confidenceScore: number;
  summaryBn: string;
  ema50: number;
  ema100: number;
  ema200: number;
  currentPrice: number;
  distanceToEma50Pcnt: number;
  distanceToEma200Pcnt: number;
  statusLabel: string;
  tradingStyle?: 'SCALPING' | 'SWING' | 'POSITION';
  tradingStyleLabelBn?: string;
  tradingStyleLabelEn?: string;
  estimatedDurationBn?: string;
  estimatedDurationEn?: string;
  tp1DurationBn?: string;
  tp2DurationBn?: string;
  validityBn?: string;
}

export interface TechnicalIndicators {
  rsi: number; // 0-100
  rsiStatus: 'Oversold' | 'Neutral' | 'Overbought';
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    trend: 'Bullish Crossover' | 'Bearish Crossover' | 'Neutral';
  };
  ema20: number;
  ema50: number;
  ema100: number;
  ema200: number;
  emaAlignment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  sma20: number;
  sma50: number;
  atr: number; // Average True Range
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number; // percentage
    squeeze: boolean;
  };
  vwap: number;
  volumeTrend: 'High Spike' | 'Increasing' | 'Normal' | 'Decreasing' | 'Anomaly';
  support: number[];
  resistance: number[];
  trendStrength: number; // 0-100
  pivotPoint: number;
  emaTradeSetup?: EmaTradeSetup;
}

export interface AiAnalysisResult {
  signal: SignalType;
  finalSignal: FinalDirection;
  longScore: number; // 0-100
  shortScore: number; // 0-100
  riskScore: number; // 1-10
  confidence: number; // 0-100%
  signalQuality?: 'HIGH' | 'MEDIUM' | 'LOW';
  marketState?: 'BULLISH TREND' | 'BEARISH TREND' | 'RANGE / MIXED' | 'EXTREME VOLATILITY';
  expectedReturnMin: number; // %
  expectedReturnMax: number; // %
  summary: string;
  tradingStyle?: 'SCALPING' | 'SWING' | 'POSITION';
  tradingStyleLabelBn?: string;
  tradingStyleLabelEn?: string;
  estimatedDuration?: string;
  estimatedDurationBn?: string;
  estimatedDurationEn?: string;
  volatilityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  volatilityPcnt?: number;
  keyFactors: {
    title: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
  centralDecision?: CentralSignalDecision;
  geminiInsight?: string;
}

export interface GridParameters {
  investmentUsdt: number;
  leverage: number;
  gridCount: number;
  lowerPrice: number;
  upperPrice: number;
  gridStepUsdt: number;
  profitPerGridPcnt: number;
  suggestedTakeProfit: number;
  suggestedStopLoss: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
}

export interface RiskGuardWarning {
  id: string;
  symbol: string;
  type:
    | 'Funding Rate Extreme'
    | 'Volume Spike'
    | 'Open Interest Spike'
    | 'Pump Alert'
    | 'Dump Alert'
    | 'High Volatility'
    | 'Possible Short Squeeze'
    | 'Possible Long Squeeze';
  severity: 'critical' | 'high' | 'medium' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

export interface HistoricalFearAndGreedPoint {
  value: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  timestamp: number;
  dateLabel: string;
}

export interface FearAndGreedData {
  value: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  timestamp: string;
  history?: HistoricalFearAndGreedPoint[];
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  direction: 'ABOVE' | 'BELOW';
  createdAt: number;
  triggered: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'price_alert' | 'risk_warning' | 'market_trend';
  read: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  refreshIntervalMs: number; // e.g. 10000
  language: string;
  showMobileFrame: boolean;
  soundAlerts: boolean;
  capitalProtectionMode: boolean;
}
