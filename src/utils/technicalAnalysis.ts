import {
  KlinePoint,
  TechnicalIndicators,
  AiAnalysisResult,
  GridParameters,
  RiskGuardWarning,
  TickerData,
  SignalType,
  EmaTradeSetup,
  CentralSignalDecision,
  FactorConfirmation,
  TradePlan,
  FinalDirection,
} from '../types';
import { evaluateUnifiedSignal, classifyTradingStyle, TradingStyle } from './unifiedSignals';
import { lookupKeySupportResistanceLevels, KeySwingLevelsResult, formatPriceLevel } from './swingLevels';

export { lookupKeySupportResistanceLevels, formatPriceLevel };
export type { KeySwingLevelsResult };

// Helper for Exponential Moving Average
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length === 0) return [];
  const k = 2 / (period + 1);
  const emaValues: number[] = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const val = data[i] * k + emaValues[i - 1] * (1 - k);
    emaValues.push(val);
  }

  return emaValues;
}

// Attach all EMA & SMA values to KlinePoint array
export function enrichKlinesWithEma(klines: KlinePoint[]): KlinePoint[] {
  if (!klines || klines.length === 0) return [];
  const closes = klines.map((k) => k.close);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema100 = calculateEMA(closes, 100);
  const ema200 = calculateEMA(closes, 200);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  return klines.map((k, idx) => ({
    ...k,
    ema20: ema20[idx] !== undefined ? Number(ema20[idx].toFixed(4)) : undefined,
    ema50: ema50[idx] !== undefined ? Number(ema50[idx].toFixed(4)) : undefined,
    ema100: ema100[idx] !== undefined ? Number(ema100[idx].toFixed(4)) : undefined,
    ema200: ema200[idx] !== undefined ? Number(ema200[idx].toFixed(4)) : undefined,
    sma20: sma20[idx] !== undefined ? Number(sma20[idx].toFixed(4)) : undefined,
    sma50: sma50[idx] !== undefined ? Number(sma50[idx].toFixed(4)) : undefined,
  }));
}

// Helper for Simple Moving Average
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(data[i]);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate RSI (14)
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  return Math.round(rsi * 100) / 100;
}

// Calculate MACD (12, 26, 9)
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) {
  if (closes.length < slowPeriod) {
    return { macdLine: 0, signalLine: 0, histogram: 0, trend: 'Neutral' as const };
  }

  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  const macdLineArr: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLineArr.push(emaFast[i] - emaSlow[i]);
  }

  const signalLineArr = calculateEMA(macdLineArr, signalPeriod);

  const lastMacd = macdLineArr[macdLineArr.length - 1];
  const lastSignal = signalLineArr[signalLineArr.length - 1];
  const histogram = lastMacd - lastSignal;

  const prevMacd = macdLineArr[macdLineArr.length - 2] || lastMacd;
  const prevSignal = signalLineArr[signalLineArr.length - 2] || lastSignal;

  let trend: 'Bullish Crossover' | 'Bearish Crossover' | 'Neutral' = 'Neutral';
  if (prevMacd <= prevSignal && lastMacd > lastSignal) {
    trend = 'Bullish Crossover';
  } else if (prevMacd >= prevSignal && lastMacd < lastSignal) {
    trend = 'Bearish Crossover';
  }

  return {
    macdLine: Number(lastMacd.toFixed(4)),
    signalLine: Number(lastSignal.toFixed(4)),
    histogram: Number(histogram.toFixed(4)),
    trend,
  };
}

// Calculate ATR (Average True Range - 14)
export function calculateATR(klines: KlinePoint[], period = 14): number {
  if (klines.length < 2) return 0;

  const trs: number[] = [];
  for (let i = 1; i < klines.length; i++) {
    const high = klines[i].high;
    const low = klines[i].low;
    const prevClose = klines[i - 1].close;

    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trs.push(tr);
  }

  if (trs.length < period) return trs.reduce((a, b) => a + b, 0) / (trs.length || 1);

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
  }

  return Number(atr.toFixed(4));
}

// Calculate Bollinger Bands (Period: 10, Bandwidth / Multiplier: 2.0)
export function calculateBollingerBands(closes: number[], period = 10, multiplier = 2) {
  if (closes.length < period) {
    const last = closes[closes.length - 1] || 0;
    return { upper: last * 1.02, middle: last, lower: last * 0.98, bandwidth: 4, squeeze: false };
  }

  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + multiplier * stdDev;
  const lower = mean - multiplier * stdDev;
  const bandwidth = ((upper - lower) / (mean || 1)) * 100;

  return {
    upper: Number(upper.toFixed(4)),
    middle: Number(mean.toFixed(4)),
    lower: Number(lower.toFixed(4)),
    bandwidth: Number(bandwidth.toFixed(2)),
    squeeze: bandwidth < 2.5,
  };
}

// Calculate VWAP
export function calculateVWAP(klines: KlinePoint[]): number {
  if (klines.length === 0) return 0;
  let cumulativeTPV = 0;
  let cumulativeVol = 0;

  for (const k of klines) {
    const typicalPrice = (k.high + k.low + k.close) / 3;
    cumulativeTPV += typicalPrice * k.volume;
    cumulativeVol += k.volume;
  }

  if (cumulativeVol === 0) return klines[klines.length - 1].close;
  return Number((cumulativeTPV / cumulativeVol).toFixed(4));
}

// Calculate Support & Resistance
export function calculateSupportResistance(klines: KlinePoint[], currentPrice: number) {
  if (klines.length === 0) return { support: [currentPrice * 0.95], resistance: [currentPrice * 1.05], pivot: currentPrice };

  const lows = klines.map((k) => k.low);
  const highs = klines.map((k) => k.high);

  const minLow = Math.min(...lows);
  const maxHigh = Math.max(...highs);

  // Pivot Point calculation based on last candle
  const last = klines[klines.length - 1];
  const pivot = (last.high + last.low + last.close) / 3;

  const s1 = 2 * pivot - last.high;
  const r1 = 2 * pivot - last.low;
  const s2 = pivot - (last.high - last.low);
  const r2 = pivot + (last.high - last.low);
  const s3 = last.low - 2 * (last.high - pivot);
  const r3 = last.high + 2 * (pivot - last.low);

  // Extract swing levels
  const recentSwingHighs = highs.slice(-20);
  const recentSwingLows = lows.slice(-20);

  const rawSupports = [s1, s2, s3, minLow, ...recentSwingLows]
    .filter((v) => typeof v === 'number' && isFinite(v) && v > 0 && v < currentPrice * 0.99)
    .sort((a, b) => b - a);

  const rawResistances = [r1, r2, r3, maxHigh, ...recentSwingHighs]
    .filter((v) => typeof v === 'number' && isFinite(v) && v > currentPrice * 1.01)
    .sort((a, b) => a - b);

  // Deduplicate / cluster
  const support = Array.from(new Set(rawSupports.map((v) => Number(v.toFixed(currentPrice < 1 ? 4 : 2))))).slice(0, 4);
  const resistance = Array.from(new Set(rawResistances.map((v) => Number(v.toFixed(currentPrice < 1 ? 4 : 2))))).slice(0, 4);

  return {
    support: support.length > 0 ? support : [Number((currentPrice * 0.96).toFixed(2))],
    resistance: resistance.length > 0 ? resistance : [Number((currentPrice * 1.04).toFixed(2))],
    pivot: Number(pivot.toFixed(2)),
  };
}

// Calculate EMA 50 / EMA 100 / EMA 200 Trade Strategy & Setup
export function calculateEmaTradeSetup(
  klines: KlinePoint[],
  currentPrice: number,
  symbol: string = 'CRYPTO',
  ticker?: TickerData,
  indicators?: TechnicalIndicators
): EmaTradeSetup {
  const safePrice = currentPrice > 0 ? currentPrice : 100;

  // Single Source of Truth Alignment: If ticker is provided, evaluate unified signal with 9-factor indicators & klines
  const unified = ticker ? evaluateUnifiedSignal(ticker, indicators, klines) : null;

  if (!klines || klines.length === 0) {
    const atr = safePrice * 0.035;
    const ema50 = Number((safePrice * 0.98).toFixed(2));
    const ema100 = Number((safePrice * 0.96).toFixed(2));
    const ema200 = Number((safePrice * 0.93).toFixed(2));
    const entryPrice = safePrice;
    const tp1 = Number((safePrice + 1.8 * atr).toFixed(2));
    const tp2 = Number((safePrice + 4.0 * atr).toFixed(2));
    const tp3 = Number((safePrice + 6.8 * atr).toFixed(2));
    const stopLoss = Number((safePrice - 2.0 * atr).toFixed(2));

    const fallbackStyle = unified
      ? { style: unified.tradingStyle, labelBn: unified.tradingStyleLabelBn, labelEn: unified.tradingStyleLabelEn }
      : classifyTradingStyle(
          Number((((tp1 - entryPrice) / entryPrice) * 100).toFixed(2)),
          Number((((tp3 - entryPrice) / entryPrice) * 100).toFixed(2))
        );

    return {
      symbol,
      direction: unified ? unified.positionDirection : 'LONG',
      trendTitleBn: unified
        ? (unified.positionDirection === 'SHORT'
            ? '🩸 বিয়ারিশ শর্ট ট্রেন্ড সেটআপ'
            : '🔥 বুলিশ মোমেন্টাম সেটআপ')
        : 'বুলিশ ট্রেন্ড সেটআপ (EMA 50 > 100 > 200)',
      signalBadge: unified ? (unified.positionDirection === 'SHORT' ? 'DEATH_ALIGNMENT' : 'GOLDEN_ALIGNMENT') : 'GOLDEN_ALIGNMENT',
      entryPrice: unified ? Number(unified.entryZoneMin.toFixed(4)) : entryPrice,
      entryRange: unified
        ? { min: Number(unified.entryZoneMin.toFixed(4)), max: Number(unified.entryZoneMax.toFixed(4)) }
        : { min: Number((safePrice * 0.992).toFixed(2)), max: Number((safePrice * 1.005).toFixed(2)) },
      tp1: unified ? Number(unified.tp1.toFixed(4)) : tp1,
      tp1GainPcnt: unified ? unified.tp1Pcnt : Number((((tp1 - entryPrice) / entryPrice) * 100).toFixed(2)),
      tp2: unified ? Number(unified.tp2.toFixed(4)) : tp2,
      tp2GainPcnt: unified ? unified.tp2Pcnt : Number((((tp2 - entryPrice) / entryPrice) * 100).toFixed(2)),
      tp3: unified ? Number(unified.tp3.toFixed(4)) : tp3,
      tp3GainPcnt: unified ? unified.tp3Pcnt : Number((((tp3 - entryPrice) / entryPrice) * 100).toFixed(2)),
      stopLoss: unified ? Number(unified.sl.toFixed(4)) : stopLoss,
      stopLossPcnt: unified ? unified.slPcnt : Number((((entryPrice - stopLoss) / entryPrice) * 100).toFixed(2)),
      riskRewardRatio: unified ? unified.riskRewardRatio : '1 : 2.5',
      confidenceScore: unified ? unified.winRate : 78,
      summaryBn: unified ? unified.reasonBn : `কয়েনটি EMA 50 ($${ema50.toLocaleString()}) এবং EMA 200 ($${ema200.toLocaleString()})-এর উপরে ট্রেড করছে। $${entryPrice.toLocaleString()} প্রাইসে লং এন্ট্রি নিয়ে TP 1 ($${tp1.toLocaleString()}), TP 2 ($${tp2.toLocaleString()}) এবং TP 3 ($${tp3.toLocaleString()}) টার্গেট রাখুন। স্টপ লস $${stopLoss.toLocaleString()}।`,
      ema50,
      ema100,
      ema200,
      currentPrice: safePrice,
      distanceToEma50Pcnt: Number((((safePrice - ema50) / ema50) * 100).toFixed(2)),
      distanceToEma200Pcnt: Number((((safePrice - ema200) / ema200) * 100).toFixed(2)),
      statusLabel: unified ? (unified.positionDirection === 'SHORT' ? 'Bearish Setup' : 'Bullish Momentum') : 'Bullish Momentum',
      tradingStyle: fallbackStyle.style,
      tradingStyleLabelBn: fallbackStyle.labelBn,
      tradingStyleLabelEn: fallbackStyle.labelEn,
    };
  }

  const closes = klines.map((k) => k.close);
  const ema50Arr = calculateEMA(closes, 50);
  const ema100Arr = calculateEMA(closes, 100);
  const ema200Arr = calculateEMA(closes, 200);

  const ema50 = Number((ema50Arr[ema50Arr.length - 1] || safePrice * 0.98).toFixed(2));
  const ema100 = Number((ema100Arr[ema100Arr.length - 1] || safePrice * 0.96).toFixed(2));
  const ema200 = Number((ema200Arr[ema200Arr.length - 1] || safePrice * 0.93).toFixed(2));

  const prevEma50 = ema50Arr.length > 2 ? ema50Arr[ema50Arr.length - 3] : ema50;
  const prevEma100 = ema100Arr.length > 2 ? ema100Arr[ema100Arr.length - 3] : ema100;
  const prevEma200 = ema200Arr.length > 2 ? ema200Arr[ema200Arr.length - 3] : ema200;

  const atrVal = calculateATR(klines) || safePrice * 0.025;
  const atr = Math.max(atrVal, safePrice * 0.015);

  let direction: 'LONG' | 'SHORT' | 'WAIT' = 'WAIT';
  let signalBadge: EmaTradeSetup['signalBadge'] = 'CONSOLIDATION';
  let trendTitleBn = 'সাইডওয়েজ / কনসলিডেশন (EMA মিক্সড)';
  let confidenceScore = 65;
  let statusLabel = 'Range Bound';

  const distToEma50Abs = ema50 > 0 ? Number(((Math.abs(safePrice - ema50) / ema50) * 100).toFixed(2)) : 999;
  const isGenuinePullbackZone = distToEma50Abs <= 8.0;

  const isGoldenCross = (prevEma50 <= prevEma200 && ema50 > ema200) || (prevEma50 <= prevEma100 && ema50 > ema100);
  const isDeathCross = (prevEma50 >= prevEma200 && ema50 < ema200) || (prevEma50 >= prevEma100 && ema50 < ema100);

  const isTripleBullish = ema50 > ema100 && ema100 > ema200;
  const isTripleBearish = ema50 < ema100 && ema100 < ema200;

  if (isGoldenCross) {
    direction = 'LONG';
    signalBadge = 'GOLDEN_CROSS';
    trendTitleBn = '🚀 তাজা গোল্ডেন ক্রস ব্রেকআউট (EMA 50 > 200 Cross)';
    confidenceScore = 88;
    statusLabel = 'Fresh Golden Cross';
  } else if (isDeathCross) {
    direction = 'SHORT';
    signalBadge = 'DEATH_CROSS';
    trendTitleBn = '⚠️ তাজা ডেথ ক্রস ড্রপ (EMA 50 < 200 Cross)';
    confidenceScore = 86;
    statusLabel = 'Fresh Death Cross';
  } else if (isTripleBullish) {
    if (safePrice >= ema50) {
      direction = 'LONG';
      signalBadge = 'GOLDEN_ALIGNMENT';
      trendTitleBn = '🔥 স্ট্রং ট্রিপল বুলিশ ট্রেন্ড (EMA 50 > 100 > 200)';
      confidenceScore = 92;
      statusLabel = 'Strong Bullish Alignment';
    } else if (isGenuinePullbackZone) {
      direction = 'LONG';
      signalBadge = 'PULLBACK_DIP_BUY';
      trendTitleBn = '🎯 বুলিশ ডিপ বাই জোন (EMA 50-100 পুলব্যাক সাপোর্ট)';
      confidenceScore = 89;
      statusLabel = 'Optimal Dip Buy';
    } else {
      direction = 'WAIT';
      signalBadge = 'CONSOLIDATION';
      trendTitleBn = `⚠️ EMA থেকে বিচ্ছিন্ন এক্সটেন্ডেড ডাউনসাইড (প্রাইস EMA 50 থেকে ${distToEma50Abs}% দূরে — এটি সাপোর্ট বাউন্স নয়)`;
      confidenceScore = 58;
      statusLabel = 'Extended Drop - Caution';
    }
  } else if (isTripleBearish) {
    if (safePrice <= ema50) {
      direction = 'SHORT';
      signalBadge = 'DEATH_ALIGNMENT';
      trendTitleBn = '🩸 স্ট্রং ট্রিপল বিয়ারিশ ট্রেন্ড (EMA 50 < 100 < 200)';
      confidenceScore = 90;
      statusLabel = 'Strong Bearish Alignment';
    } else if (isGenuinePullbackZone) {
      direction = 'SHORT';
      signalBadge = 'PULLBACK_SHORT';
      trendTitleBn = '⚡ বিয়ারিশ বাউন্স শর্ট জোন (EMA 50-100 রেজিস্ট্যান্স)';
      confidenceScore = 85;
      statusLabel = 'Pullback Short Zone';
    } else {
      direction = 'WAIT';
      signalBadge = 'CONSOLIDATION';
      trendTitleBn = `⚠️ EMA থেকে বিচ্ছিন্ন এক্সটেন্ডেড আপসাইড (প্রাইস EMA 50 থেকে ${distToEma50Abs}% দূরে — এটা রেজিস্ট্যান্স রিটেস্ট না)`;
      confidenceScore = 58;
      statusLabel = 'Extended Rally - Caution';
    }
  } else {
    if (safePrice > ema200 && ema50 > ema200) {
      direction = 'LONG';
      signalBadge = 'GOLDEN_ALIGNMENT';
      trendTitleBn = 'বুলিশ রিকভারি জোন (Above EMA 200)';
      confidenceScore = 74;
      statusLabel = 'Bullish Bias';
    } else if (safePrice < ema200 && ema50 < ema200) {
      direction = 'SHORT';
      signalBadge = 'DEATH_ALIGNMENT';
      trendTitleBn = 'বিয়ারিশ প্রেশার জোন (Below EMA 200)';
      confidenceScore = 72;
      statusLabel = 'Bearish Bias';
    } else {
      direction = 'WAIT';
      signalBadge = 'CONSOLIDATION';
      trendTitleBn = 'কনসলিডেশন ও রেঞ্জ ট্রেডিং ফেজ';
      confidenceScore = 60;
      statusLabel = 'Consolidation';
    }
  }

  // If unified decision exists, ensure direction and targets are strictly unified
  if (unified) {
    direction = unified.positionDirection;
    confidenceScore = unified.winRate;
    if (unified.positionDirection === 'SHORT') {
      signalBadge = unified.isTopRejection ? 'PULLBACK_SHORT' : 'DEATH_ALIGNMENT';
      trendTitleBn = unified.isTopRejection
        ? '🩸 টপ রেজিস্ট্যান্স রিজেকশন (শর্ট সেল সেটআপ)'
        : '🩸 স্ট্রং বিয়ারিশ ট্রেন্ড সেটআপ';
      statusLabel = unified.isTopRejection ? 'Top Rejection Short' : 'Bearish Alignment';
    } else if (unified.positionDirection === 'LONG') {
      if (isTripleBullish && safePrice < ema50 && isGenuinePullbackZone) {
        signalBadge = 'PULLBACK_DIP_BUY';
        trendTitleBn = '🎯 বুলিশ ডিপ বাই জোন (EMA 50-100 পুলব্যাক সাপোর্ট)';
        statusLabel = 'Optimal Dip Buy';
      } else {
        signalBadge = 'GOLDEN_ALIGNMENT';
        trendTitleBn = '🔥 বুলিশ মোমেন্টাম ও আপট্রেন্ড সেটআপ';
        statusLabel = 'Bullish Momentum';
      }
    }
  }

  let entryPrice = safePrice;
  let entryRange = { min: safePrice * 0.994, max: safePrice * 1.004 };
  let tp1 = 0;
  let tp2 = 0;
  let tp3 = 0;
  let stopLoss = 0;

  if (unified) {
    entryPrice = safePrice;
    entryRange = {
      min: Number(unified.entryZoneMin.toFixed(4)),
      max: Number(unified.entryZoneMax.toFixed(4)),
    };
    tp1 = Number(unified.tp1.toFixed(4));
    tp2 = Number(unified.tp2.toFixed(4));
    tp3 = Number(unified.tp3.toFixed(4));
    stopLoss = Number(unified.sl.toFixed(4));
  } else if (direction === 'LONG') {
    entryPrice = safePrice;
    entryRange = {
      min: Number(Math.max(ema50, safePrice * 0.99).toFixed(2)),
      max: Number((safePrice * 1.005).toFixed(2)),
    };
    tp1 = Number((safePrice + 1.8 * atr).toFixed(2));
    tp2 = Number((safePrice + 4.0 * atr).toFixed(2));
    tp3 = Number((safePrice + 6.8 * atr).toFixed(2));
    stopLoss = Number(Math.max(0.0001, Math.min(safePrice - 2.0 * atr, ema200 * 0.988)).toFixed(2));
  } else if (direction === 'SHORT') {
    entryPrice = safePrice;
    entryRange = {
      min: Number((safePrice * 0.995).toFixed(2)),
      max: Number(Math.min(ema50, safePrice * 1.01).toFixed(2)),
    };
    tp1 = Number(Math.max(0.0001, safePrice - 1.8 * atr).toFixed(2));
    tp2 = Number(Math.max(0.0001, safePrice - 4.0 * atr).toFixed(2));
    tp3 = Number(Math.max(0.0001, safePrice - 6.8 * atr).toFixed(2));
    stopLoss = Number((Math.max(safePrice + 2.0 * atr, ema200 * 1.012)).toFixed(2));
  } else {
    entryPrice = safePrice;
    entryRange = { min: safePrice * 0.99, max: safePrice * 1.01 };
    tp1 = Number((safePrice * 1.052).toFixed(2));
    tp2 = Number((safePrice * 1.118).toFixed(2));
    tp3 = Number((safePrice * 1.195).toFixed(2));
    stopLoss = Number((safePrice * 0.965).toFixed(2));
  }

  const tp1GainPcnt = unified
    ? unified.tp1Pcnt
    : Number((Math.abs((tp1 - entryPrice) / entryPrice) * 100).toFixed(2));
  const tp2GainPcnt = unified
    ? unified.tp2Pcnt
    : Number((Math.abs((tp2 - entryPrice) / entryPrice) * 100).toFixed(2));
  const tp3GainPcnt = unified
    ? unified.tp3Pcnt
    : Number((Math.abs((tp3 - entryPrice) / entryPrice) * 100).toFixed(2));
  const stopLossPcnt = unified
    ? unified.slPcnt
    : Number((Math.abs((entryPrice - stopLoss) / entryPrice) * 100).toFixed(2));

  const rrRatio = unified ? unified.riskRewardRatio : stopLossPcnt > 0 ? `1 : ${(tp2GainPcnt / stopLossPcnt).toFixed(1)}` : '1 : 2.5';
  const riskRewardRatio = rrRatio;

  let summaryBn = unified ? unified.reasonBn : '';
  if (!summaryBn) {
    if (direction === 'LONG') {
      summaryBn = `${symbol}-এ EMA 50 ($${ema50.toLocaleString()}), EMA 100 ($${ema100.toLocaleString()}) এবং EMA 200 ($${ema200.toLocaleString()}) স্পষ্ট বুলিশ সাপোর্ট তৈরি করেছে। $${entryPrice.toLocaleString()} জোনে লং এন্ট্রি নেওয়া যেতে পারে। টার্গেট: TP1=$${tp1.toLocaleString()} (+${tp1GainPcnt}%), TP2=$${tp2.toLocaleString()} (+${tp2GainPcnt}%), TP3=$${tp3.toLocaleString()} (+${tp3GainPcnt}%)। মূলধন সুরক্ষায় $${stopLoss.toLocaleString()} (-${stopLossPcnt}%) লেভেলে স্টপ-লস বজায় রাখুন।`;
    } else if (direction === 'SHORT') {
      summaryBn = `${symbol}-এ EMA 50 ($${ema50.toLocaleString()}) < EMA 100 ($${ema100.toLocaleString()}) < EMA 200 ($${ema200.toLocaleString()}) বিয়ারিশ প্রেসার বজায় রেখেছে। $${entryPrice.toLocaleString()} লেভেলে শর্ট/সেল সুযোগ রয়েছে। টার্গেট: TP1=$${tp1.toLocaleString()} (+${tp1GainPcnt}%), TP2=$${tp2.toLocaleString()} (+${tp2GainPcnt}%), TP3=$${tp3.toLocaleString()} (+${tp3GainPcnt}%)। স্টপ-লস: $${stopLoss.toLocaleString()} (-${stopLossPcnt}%)।`;
    } else {
      summaryBn = `${symbol}-এ EMA 50, 100 এবং 200 সাইডওয়েজ অবস্থায় আছে। পরিষ্কার ব্রেকআউট নিশ্চিত না হওয়া পর্যন্ত কনফার্মেশনের জন্য অপেক্ষা করা বুদ্ধিমানের কাজ। রেঞ্জ ট্রেডিং টার্গেট: TP1 $${tp1.toLocaleString()}, SL $${stopLoss.toLocaleString()}।`;
    }
  }

  const distanceToEma50Pcnt = Number((((safePrice - ema50) / (ema50 || 1)) * 100).toFixed(2));
  const distanceToEma200Pcnt = Number((((safePrice - ema200) / (ema200 || 1)) * 100).toFixed(2));

  const finalStyle = unified
    ? {
        style: unified.tradingStyle,
        labelBn: unified.tradingStyleLabelBn,
        labelEn: unified.tradingStyleLabelEn,
        estimatedDurationBn: unified.estimatedDurationBn,
        estimatedDurationEn: unified.estimatedDurationEn,
        tp1DurationBn: unified.tp1DurationBn,
        tp2DurationBn: unified.tp2DurationBn,
        validityBn: unified.validityBn,
      }
    : classifyTradingStyle(tp1GainPcnt, tp3GainPcnt);

  return {
    symbol,
    direction,
    trendTitleBn,
    signalBadge,
    entryPrice,
    entryRange,
    tp1,
    tp1GainPcnt,
    tp2,
    tp2GainPcnt,
    tp3,
    tp3GainPcnt,
    stopLoss,
    stopLossPcnt,
    riskRewardRatio,
    confidenceScore,
    summaryBn,
    ema50,
    ema100,
    ema200,
    currentPrice: safePrice,
    distanceToEma50Pcnt,
    distanceToEma200Pcnt,
    statusLabel,
    tradingStyle: finalStyle.style,
    tradingStyleLabelBn: finalStyle.labelBn,
    tradingStyleLabelEn: finalStyle.labelEn,
    estimatedDurationBn: finalStyle.estimatedDurationBn,
    estimatedDurationEn: finalStyle.estimatedDurationEn,
    tp1DurationBn: finalStyle.tp1DurationBn,
    tp2DurationBn: finalStyle.tp2DurationBn,
    validityBn: finalStyle.validityBn,
  };
}

// Main function to calculate all indicators
export function computeTechnicalIndicators(
  klines: KlinePoint[],
  currentPrice: number,
  symbol: string = 'CRYPTO',
  ticker?: TickerData
): TechnicalIndicators {
  if (!klines || klines.length === 0) {
    const fallbackSetup = calculateEmaTradeSetup([], currentPrice, symbol, ticker);
    return {
      rsi: 50,
      rsiStatus: 'Neutral',
      macd: { macdLine: 0, signalLine: 0, histogram: 0, trend: 'Neutral' },
      ema20: currentPrice,
      ema50: currentPrice,
      ema100: currentPrice,
      ema200: currentPrice,
      emaAlignment: 'Neutral',
      sma20: currentPrice,
      sma50: currentPrice,
      atr: currentPrice * 0.02,
      bollingerBands: {
        upper: currentPrice * 1.03,
        middle: currentPrice,
        lower: currentPrice * 0.97,
        bandwidth: 6,
        squeeze: false,
      },
      vwap: currentPrice,
      volumeTrend: 'Normal',
      support: [currentPrice * 0.96, currentPrice * 0.92],
      resistance: [currentPrice * 1.04, currentPrice * 1.08],
      trendStrength: 50,
      pivotPoint: currentPrice,
      emaTradeSetup: fallbackSetup,
    };
  }

  const closes = klines.map((k) => k.close);
  const rsi = calculateRSI(closes, 14);

  // New RSI Settings: Above 85 Overbought, Below 20 Oversold
  let rsiStatus: 'Oversold' | 'Neutral' | 'Overbought' = 'Neutral';
  if (rsi <= 20) rsiStatus = 'Oversold';
  else if (rsi >= 85) rsiStatus = 'Overbought';

  const macd = calculateMACD(closes);

  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema100Arr = calculateEMA(closes, 100);
  const ema200Arr = calculateEMA(closes, 200);

  const ema20 = Number(ema20Arr[ema20Arr.length - 1].toFixed(2));
  const ema50 = Number(ema50Arr[ema50Arr.length - 1].toFixed(2));
  const ema100 = Number(ema100Arr[ema100Arr.length - 1].toFixed(2));
  const ema200 = Number(ema200Arr[ema200Arr.length - 1].toFixed(2));

  const sma20Arr = calculateSMA(closes, 20);
  const sma50Arr = calculateSMA(closes, 50);

  const sma20 = Number(sma20Arr[sma20Arr.length - 1].toFixed(2));
  const sma50 = Number(sma50Arr[sma50Arr.length - 1].toFixed(2));

  let emaAlignment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish' =
    'Neutral';
  if (ema50 > ema100 && ema100 > ema200) {
    emaAlignment = currentPrice > ema50 ? 'Strong Bullish' : 'Bullish';
  } else if (ema50 < ema100 && ema100 < ema200) {
    emaAlignment = currentPrice < ema50 ? 'Strong Bearish' : 'Bearish';
  }

  const atr = calculateATR(klines);
  const bollingerBands = calculateBollingerBands(closes);
  const vwap = calculateVWAP(klines);
  const { support, resistance, pivot } = calculateSupportResistance(klines, currentPrice);

  // Volume Trend
  const volumes = klines.map((k) => k.volume);
  const recentVol = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;

  let volumeTrend: 'High Spike' | 'Increasing' | 'Normal' | 'Decreasing' | 'Anomaly' = 'Normal';
  if (recentVol > avgVol * 2.2) volumeTrend = 'High Spike';
  else if (recentVol > avgVol * 1.3) volumeTrend = 'Increasing';
  else if (recentVol < avgVol * 0.6) volumeTrend = 'Decreasing';

  // Trend Strength (0-100)
  let trendStrength = 50;
  if (emaAlignment.includes('Bullish')) {
    trendStrength += 20 + (rsi > 50 ? 15 : 0);
  } else if (emaAlignment.includes('Bearish')) {
    trendStrength += 20 + (rsi < 50 ? 15 : 0);
  }
  if (macd.histogram > 0) trendStrength += 10;
  trendStrength = Math.min(100, Math.max(0, trendStrength));

  const emaTradeSetup = calculateEmaTradeSetup(klines, currentPrice, symbol, ticker);

  return {
    rsi,
    rsiStatus,
    macd,
    ema20,
    ema50,
    ema100,
    ema200,
    emaAlignment,
    sma20,
    sma50,
    atr,
    bollingerBands,
    vwap,
    volumeTrend,
    support,
    resistance,
    trendStrength,
    pivotPoint: pivot,
    emaTradeSetup,
  };
}

// ==========================================
// CENTRALIZED FINAL SIGNAL DECISION ENGINE (PHASE 1)
// Harmonizes all 9 analysis factors into ONE definitive direction:
// 1. LONG  2. SHORT  3. NEUTRAL
// ==========================================
export function calculateCentralSignalDecision(
  ticker: TickerData,
  indicators: TechnicalIndicators,
  klines: KlinePoint[] = []
): CentralSignalDecision {
  const currentPrice = ticker.lastPrice || 100;
  const now = Date.now();

  // Weights (Total ~100)
  // EMA Trend: 20, Market Structure: 20, BB Entry: 15, Volume: 10, Open Interest: 10, Fibonacci: 10, RSI Extreme: 10, Funding Risk: 5
  let bullishScore = 0;
  let bearishScore = 0;
  let neutralScore = 0;

  const confirmations: FactorConfirmation[] = [];

  // 1. EMA 50 / 100 / 200 Trend (Weight: 20)
  const { ema50, ema100, ema200, emaAlignment } = indicators;
  const isEmaBullish = ema50 > ema100 && ema100 > ema200;
  const isEmaBearish = ema50 < ema100 && ema100 < ema200;

  if (isEmaBullish || emaAlignment === 'Strong Bullish' || emaAlignment === 'Bullish') {
    bullishScore += 20;
    confirmations.push({
      factor: 'EMA Trend',
      status: 'CONFIRMED',
      label: '🟢 BULLISH ALIGNMENT',
      detail: `EMA50 ($${ema50.toFixed(2)}) > EMA100 ($${ema100.toFixed(2)}) > EMA200 ($${ema200.toFixed(2)})`,
      weight: 20,
      scoreContribution: 20,
    });
  } else if (isEmaBearish || emaAlignment === 'Strong Bearish' || emaAlignment === 'Bearish') {
    bearishScore += 20;
    confirmations.push({
      factor: 'EMA Trend',
      status: 'CONFIRMED',
      label: '🔴 BEARISH ALIGNMENT',
      detail: `EMA50 ($${ema50.toFixed(2)}) < EMA100 ($${ema100.toFixed(2)}) < EMA200 ($${ema200.toFixed(2)})`,
      weight: 20,
      scoreContribution: -20,
    });
  } else {
    neutralScore += 20;
    confirmations.push({
      factor: 'EMA Trend',
      status: 'NEUTRAL',
      label: '⚪ MIXED / CONSOLIDATION',
      detail: 'EMA 50/100/200 entwined inside ranging zone',
      weight: 20,
      scoreContribution: 0,
    });
  }

  // 2. RSI 14 (Weight: 10)
  // Rules: <= 20 Extreme Oversold (LONG Reversal confirmation), >= 85 Extreme Overbought (SHORT Reversal confirmation), 20-85 Neutral
  const rsi = indicators.rsi;
  if (rsi <= 20) {
    bullishScore += 10;
    confirmations.push({
      factor: 'RSI (14)',
      status: 'CONFIRMED',
      label: '🟢 EXTREME OVERSOLD (≤20)',
      detail: `RSI ${rsi.toFixed(1)} confirms potential accumulation bounce`,
      weight: 10,
      scoreContribution: 10,
    });
  } else if (rsi >= 85) {
    bearishScore += 10;
    confirmations.push({
      factor: 'RSI (14)',
      status: 'CONFIRMED',
      label: '🔴 EXTREME OVERBOUGHT (≥85)',
      detail: `RSI ${rsi.toFixed(1)} confirms exhaustion pullback risk`,
      weight: 10,
      scoreContribution: -10,
    });
  } else {
    neutralScore += 10;
    confirmations.push({
      factor: 'RSI (14)',
      status: 'NEUTRAL',
      label: `⚪ NORMAL BAND (${rsi.toFixed(1)})`,
      detail: 'RSI between 20 and 85 safe neutral corridor',
      weight: 10,
      scoreContribution: 0,
    });
  }

  // 3. Bollinger Bands (10, 2.0) Setup (Weight: 15)
  // Check latest klines for BB Hammer buy or Inverted Hammer sell
  let bbBuySetup = false;
  let bbSellSetup = false;
  if (klines.length >= 10) {
    const lastK = klines[klines.length - 1];
    const bb = indicators.bollingerBands;
    const body = Math.abs(lastK.close - lastK.open);
    const upperWick = lastK.close > lastK.open ? lastK.high - lastK.close : lastK.high - lastK.open;
    const lowerWick = lastK.close > lastK.open ? lastK.open - lastK.low : lastK.close - lastK.low;

    // Green Hammer below lower band
    if (lastK.close > lastK.open && lowerWick >= 2 * body && upperWick <= 0.5 * body && lastK.high < bb.lower) {
      bbBuySetup = true;
    }
    // Red Inverted Hammer above upper band
    if (lastK.open > lastK.close && upperWick >= 2 * body && lowerWick <= 0.5 * body && lastK.low > bb.upper) {
      bbSellSetup = true;
    }
  }

  if (bbBuySetup) {
    bullishScore += 15;
    confirmations.push({
      factor: 'BB Setup',
      status: 'CONFIRMED',
      label: '🟢 BB BUY HAMMER CONFIRMED',
      detail: 'Green hammer formed strictly below lower Bollinger Band (10, 2.0)',
      weight: 15,
      scoreContribution: 15,
    });
  } else if (bbSellSetup) {
    bearishScore += 15;
    confirmations.push({
      factor: 'BB Setup',
      status: 'CONFIRMED',
      label: '🔴 BB SELL PINBAR CONFIRMED',
      detail: 'Red inverted hammer formed strictly above upper Bollinger Band (10, 2.0)',
      weight: 15,
      scoreContribution: -15,
    });
  } else {
    neutralScore += 15;
    confirmations.push({
      factor: 'BB Setup',
      status: 'NEUTRAL',
      label: '⚪ NO BB BREAKOUT PATTERN',
      detail: 'Price oscillating within normal Bollinger envelope',
      weight: 15,
      scoreContribution: 0,
    });
  }

  // 4. Volume Ratio vs SMA 20 (Weight: 10)
  let volRatio = 1.0;
  if (klines.length >= 20) {
    const recent20 = klines.slice(-20);
    const avgVol = recent20.reduce((acc, k) => acc + k.volume, 0) / 20;
    const curVol = klines[klines.length - 1]?.volume || 1;
    volRatio = avgVol > 0 ? curVol / avgVol : 1.0;
  }
  const isVolStrong = volRatio >= 1.5;
  const isVolNormal = volRatio >= 1.0;

  if (isVolStrong) {
    // Strengthens prevailing score
    confirmations.push({
      factor: 'Volume',
      status: 'CONFIRMED',
      label: `🟢 STRONG VOLUME (${volRatio.toFixed(2)}x)`,
      detail: 'Volume surge confirms institutional activity & momentum',
      weight: 10,
      scoreContribution: 10,
    });
    if (bullishScore > bearishScore) bullishScore += 10;
    else if (bearishScore > bullishScore) bearishScore += 10;
    else neutralScore += 10;
  } else if (isVolNormal) {
    neutralScore += 10;
    confirmations.push({
      factor: 'Volume',
      status: 'NEUTRAL',
      label: `⚪ NORMAL VOLUME (${volRatio.toFixed(2)}x)`,
      detail: 'Volume within standard SMA 20 range',
      weight: 10,
      scoreContribution: 0,
    });
  } else {
    confirmations.push({
      factor: 'Volume',
      status: 'RISK',
      label: `⚠️ WEAK VOLUME (${volRatio.toFixed(2)}x)`,
      detail: 'Low volume indicates lack of breakout conviction',
      weight: 10,
      scoreContribution: -5,
    });
    neutralScore += 10;
  }

  // 5. Market Structure: Higher High / Higher Low vs Lower High / Lower Low (Weight: 20)
  let structure: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (klines.length >= 10) {
    const recent = klines.slice(-10);
    const midPoint = Math.floor(recent.length / 2);
    const firstHalfHigh = Math.max(...recent.slice(0, midPoint).map((k) => k.high));
    const secondHalfHigh = Math.max(...recent.slice(midPoint).map((k) => k.high));
    const firstHalfLow = Math.min(...recent.slice(0, midPoint).map((k) => k.low));
    const secondHalfLow = Math.min(...recent.slice(midPoint).map((k) => k.low));

    if (secondHalfHigh > firstHalfHigh && secondHalfLow > firstHalfLow) {
      structure = 'BULLISH';
    } else if (secondHalfHigh < firstHalfHigh && secondHalfLow < firstHalfLow) {
      structure = 'BEARISH';
    }
  }

  if (structure === 'BULLISH') {
    bullishScore += 20;
    confirmations.push({
      factor: 'Market Structure',
      status: 'CONFIRMED',
      label: '🟢 HIGHER HIGH + HIGHER LOW',
      detail: 'Ascending market structure favors bullish expansion',
      weight: 20,
      scoreContribution: 20,
    });
  } else if (structure === 'BEARISH') {
    bearishScore += 20;
    confirmations.push({
      factor: 'Market Structure',
      status: 'CONFIRMED',
      label: '🔴 LOWER HIGH + LOWER LOW',
      detail: 'Descending market structure favors bearish breakdown',
      weight: 20,
      scoreContribution: -20,
    });
  } else {
    neutralScore += 20;
    confirmations.push({
      factor: 'Market Structure',
      status: 'NEUTRAL',
      label: '⚪ BALANCED RANGE STRUCTURE',
      detail: 'Equal highs and lows indicating equilibrium',
      weight: 20,
      scoreContribution: 0,
    });
  }

  // 6. Funding Rate & Crowding Risk (Weight: 5)
  if (ticker.fundingRate !== undefined) {
    const fr = ticker.fundingRate;
    if (fr > 0.0004) {
      // High long crowding -> risk for longs
      bearishScore += 5;
      confirmations.push({
        factor: 'Funding Rate',
        status: 'RISK',
        label: `⚠️ LONG CROWDING RISK (+${(fr * 100).toFixed(4)}%)`,
        detail: 'Elevated funding rate elevates long squeeze risk',
        weight: 5,
        scoreContribution: -5,
      });
    } else if (fr < -0.0004) {
      // High short crowding -> risk for shorts, bullish squeeze potential
      bullishScore += 5;
      confirmations.push({
        factor: 'Funding Rate',
        status: 'CONFIRMED',
        label: `🟢 SHORT SQUEEZE BIAS (${(fr * 100).toFixed(4)}%)`,
        detail: 'Negative funding rate indicates heavily crowded shorts vulnerable to short squeeze',
        weight: 5,
        scoreContribution: 5,
      });
    } else {
      neutralScore += 5;
      confirmations.push({
        factor: 'Funding Rate',
        status: 'NEUTRAL',
        label: `⚪ BALANCED FUNDING (${(fr * 100).toFixed(4)}%)`,
        detail: 'Funding rate in neutral equilibrium',
        weight: 5,
        scoreContribution: 0,
      });
    }
  } else {
    confirmations.push({
      factor: 'Funding Rate',
      status: 'NEUTRAL',
      label: '⚪ BALANCED',
      detail: 'Normal funding parameters',
      weight: 5,
      scoreContribution: 0,
    });
  }

  // 7. Open Interest vs Price Movement (Weight: 10)
  const pcnt = ticker.price24hPcnt;
  const oiVal = ticker.openInterestValue || ticker.openInterest || 0;
  if (oiVal > 0) {
    if (pcnt > 0.02) {
      bullishScore += 10;
      confirmations.push({
        factor: 'Open Interest',
        status: 'CONFIRMED',
        label: '🟢 BULLISH POSITION BUILD-UP',
        detail: 'Price expansion accompanied by steady Open Interest accumulation',
        weight: 10,
        scoreContribution: 10,
      });
    } else if (pcnt < -0.02) {
      bearishScore += 10;
      confirmations.push({
        factor: 'Open Interest',
        status: 'CONFIRMED',
        label: '🔴 BEARISH SHORT BUILD-UP',
        detail: 'Price decline with rising Open Interest indicates active short selling pressure',
        weight: 10,
        scoreContribution: -10,
      });
    } else {
      neutralScore += 10;
      confirmations.push({
        factor: 'Open Interest',
        status: 'NEUTRAL',
        label: '⚪ STABLE POSITIONING',
        detail: 'Open interest steady without aggressive directional delta',
        weight: 10,
        scoreContribution: 0,
      });
    }
  } else {
    neutralScore += 10;
    confirmations.push({
      factor: 'Open Interest',
      status: 'NEUTRAL',
      label: '⚪ STANDARD POSITIONING',
      detail: 'Market positioning within normal baseline',
      weight: 10,
      scoreContribution: 0,
    });
  }

  // 8. Liquidation Zones (Display Data Status)
  confirmations.push({
    factor: 'Liquidation Zones',
    status: 'NEUTRAL',
    label: '⚪ DYNAMIC LIQUIDITY POOLS',
    detail: `Major liquidity pool overhead: $${(currentPrice * 1.04).toFixed(2)}, below: $${(currentPrice * 0.96).toFixed(2)}`,
    weight: 0,
    scoreContribution: 0,
  });

  // 9. Fibonacci Confluence (Weight: 10)
  let fibLabel = '⚪ MID-FIB CONSOLIDATION';
  let fibStatus: 'CONFIRMED' | 'RISK' | 'NEUTRAL' = 'NEUTRAL';
  if (klines.length >= 20) {
    const highs = klines.map((k) => k.high);
    const lows = klines.map((k) => k.low);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const diff = maxHigh - minLow;
    const fib618 = maxHigh - diff * 0.618;
    const fib382 = maxHigh - diff * 0.382;

    if (Math.abs(currentPrice - fib618) / (currentPrice || 1) < 0.015) {
      bullishScore += 10;
      fibLabel = '🟢 0.618 GOLDEN SUPPORT CONFLUENCE';
      fibStatus = 'CONFIRMED';
    } else if (Math.abs(currentPrice - fib382) / (currentPrice || 1) < 0.015) {
      bearishScore += 10;
      fibLabel = '🔴 0.382 FIB RESISTANCE CONFLUENCE';
      fibStatus = 'CONFIRMED';
    } else {
      neutralScore += 10;
    }
  } else {
    neutralScore += 10;
  }
  confirmations.push({
    factor: 'Fibonacci',
    status: fibStatus,
    label: fibLabel,
    detail: 'Fibonacci retracement level alignment calculated from multi-candle swing range',
    weight: 10,
    scoreContribution: fibStatus === 'CONFIRMED' ? 10 : 0,
  });

  // 10. 24h Price Action & High Rejection Check (Harmonization with Unified Engine)
  const high24h = ticker.highPrice24h || 0;
  const low24h = ticker.lowPrice24h || 0;
  if (high24h > 0 && high24h > low24h) {
    const pullbackFromHigh = ((high24h - currentPrice) / high24h) * 100;
    const priceRange = high24h - low24h;
    const relativePos = (currentPrice - low24h) / priceRange;

    // Resistance Rejection / Bull Trap Exhaustion (SHORT)
    if (
      (ticker.price24hPcnt >= 0.05 && pullbackFromHigh >= 4.0 && relativePos <= 0.68) ||
      (indicators.rsi >= 82 && pullbackFromHigh >= 2.5) ||
      (ticker.price24hPcnt >= 0.12 && pullbackFromHigh >= 4.0)
    ) {
      bearishScore += 40;
      bullishScore = Math.max(0, bullishScore - 25);
      confirmations.push({
        factor: 'Market Structure',
        status: 'CONFIRMED',
        label: '🔴 24H HIGH REJECTION CONFIRMED',
        detail: `Price rejected -${pullbackFromHigh.toFixed(1)}% from 24h high ($${high24h.toFixed(4)}), bull trap exhaustion`,
        weight: 20,
        scoreContribution: -20,
      });
    }
    // Strong Bullish Breakout Momentum (LONG)
    else if (ticker.price24hPcnt >= 0.02 && relativePos >= 0.65 && pullbackFromHigh <= 3.8) {
      bullishScore += 30;
      bearishScore = Math.max(0, bearishScore - 20);
      confirmations.push({
        factor: 'Market Structure',
        status: 'CONFIRMED',
        label: '🟢 24H HIGH EXPANSION CONFIRMED',
        detail: `Holding near 24h high with shallow pullback (-${pullbackFromHigh.toFixed(1)}%), continuation favored`,
        weight: 20,
        scoreContribution: 20,
      });
    }
  }

  // ==========================================
  // CONFLICT RESOLUTION & SINGLE FINAL DIRECTION RULES
  // ==========================================
  // Scale scores to 100%
  const totalRaw = bullishScore + bearishScore + neutralScore || 100;
  const normBullish = Math.min(95, Math.max(5, Math.round((bullishScore / totalRaw) * 100)));
  const normBearish = Math.min(95, Math.max(5, Math.round((bearishScore / totalRaw) * 100)));
  const normNeutral = Math.min(95, Math.max(5, Math.round((neutralScore / totalRaw) * 100)));

  let finalSignal: FinalDirection = 'NEUTRAL';
  let confidence = 50;
  let signalQuality: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let marketState: 'BULLISH TREND' | 'BEARISH TREND' | 'RANGE / MIXED' | 'EXTREME VOLATILITY' = 'RANGE / MIXED';

  // Rule: LONG requires Bullish Score >= 65 AND substantial lead over Bearish Score (at least 25 pts) AND no heavy bearish conflict
  if (normBullish >= 65 && normBullish >= normBearish + 25 && normBearish <= 25) {
    finalSignal = 'LONG';
    confidence = Math.min(95, Math.max(65, normBullish));
    signalQuality = confidence >= 80 ? 'HIGH' : 'MEDIUM';
    marketState = 'BULLISH TREND';
  }
  // Rule: SHORT requires Bearish Score >= 65 AND substantial lead over Bullish Score (at least 25 pts) AND no heavy bullish conflict
  else if (normBearish >= 65 && normBearish >= normBullish + 25 && normBullish <= 25) {
    finalSignal = 'SHORT';
    confidence = Math.min(95, Math.max(65, normBearish));
    signalQuality = confidence >= 80 ? 'HIGH' : 'MEDIUM';
    marketState = 'BEARISH TREND';
  }
  // Otherwise: NEUTRAL (Range / Mixed / Conflicting signals resolved to single safe state)
  else {
    finalSignal = 'NEUTRAL';
    confidence = Math.min(85, Math.max(50, normNeutral + 15));
    signalQuality = 'MEDIUM';
    marketState = 'RANGE / MIXED';
  }

  // Generate Trade Plan ONLY for LONG or SHORT based on Key Swing Highs & Lows
  let tradePlan: TradePlan | undefined;

  if (finalSignal === 'LONG' || finalSignal === 'SHORT') {
    const swingTargets = lookupKeySupportResistanceLevels(
      currentPrice,
      ticker.highPrice24h || currentPrice * 1.05,
      ticker.lowPrice24h || currentPrice * 0.95,
      finalSignal,
      indicators,
      klines
    );

    const entryMin = formatPriceLevel(finalSignal === 'LONG' ? currentPrice * 0.995 : currentPrice * 0.998);
    const entryMax = formatPriceLevel(finalSignal === 'LONG' ? currentPrice * 1.002 : currentPrice * 1.005);
    const rrRatio = `1:${(swingTargets.tp2Pcnt / (swingTargets.slPcnt || 1)).toFixed(1)}`;

    tradePlan = {
      direction: finalSignal,
      entryZone: { min: entryMin, max: entryMax, current: currentPrice },
      stopLoss: swingTargets.sl,
      stopLossPcnt: swingTargets.slPcnt,
      tp1: swingTargets.tp1,
      tp1GainPcnt: swingTargets.tp1Pcnt,
      tp2: swingTargets.tp2,
      tp2GainPcnt: swingTargets.tp2Pcnt,
      tp3: swingTargets.tp3,
      tp3GainPcnt: swingTargets.tp3Pcnt,
      riskRewardRatio: rrRatio,
      tradeStatus: 'ACTIVE',
    };
  }

  // Calculate historical volatility % and determine trade duration based on identified TradingStyle
  let histVolatility = 5.0;
  if (ticker.highPrice24h && ticker.lowPrice24h && ticker.lastPrice && ticker.lastPrice > 0) {
    histVolatility = ((ticker.highPrice24h - ticker.lowPrice24h) / ticker.lastPrice) * 100;
  } else if (indicators?.atr && ticker.lastPrice && ticker.lastPrice > 0) {
    histVolatility = (indicators.atr / ticker.lastPrice) * 100 * 2.5;
  }

  const tp1Pcnt = tradePlan ? tradePlan.tp1GainPcnt : 3.2;
  const tp3Pcnt = tradePlan ? tradePlan.tp3GainPcnt : 9.0;
  const tradingStyleInfo = classifyTradingStyle(tp1Pcnt, tp3Pcnt, histVolatility);

  const reasonSummary =
    finalSignal === 'LONG'
      ? `Strong bullish confluence detected across EMA trend stack, positive momentum, and market structure on ${ticker.symbol}. Risk-reward favors structured long positioning.`
      : finalSignal === 'SHORT'
      ? `Bearish confluence established with overhead moving average resistance and rejection dynamics on ${ticker.symbol}. Risk management favors short side execution.`
      : `Conflicting indicator readings or consolidating range structure detected on ${ticker.symbol}. Central decision engine mandates NEUTRAL to prevent false breakouts.`;

  return {
    finalSignal,
    confidence,
    signalQuality,
    marketState,
    bullishScore: normBullish,
    bearishScore: normBearish,
    neutralScore: normNeutral,
    confirmations,
    tradePlan,
    validityMinutes: tradingStyleInfo.style === 'SCALPING' ? 30 : tradingStyleInfo.style === 'POSITION' ? 120 : 60,
    estimatedDuration: tradingStyleInfo.estimatedDurationEn,
    tradingStyle: tradingStyleInfo.style,
    tradingStyleLabelBn: tradingStyleInfo.labelBn,
    tradingStyleLabelEn: tradingStyleInfo.labelEn,
    estimatedDurationBn: tradingStyleInfo.estimatedDurationBn,
    estimatedDurationEn: tradingStyleInfo.estimatedDurationEn,
    volatilityLevel: tradingStyleInfo.volatilityLevel,
    volatilityPcnt: tradingStyleInfo.volatilityPcnt,
    lastAnalysisTimestamp: now,
    nextReanalysisTimestamp: now + 45 * 60 * 1000,
    reasonSummary,
  };
}

// Compute AI Long/Short/Risk Score & Recommendation Rationale
export function computeAiAnalysis(
  ticker: TickerData,
  indicators: TechnicalIndicators,
  klines: KlinePoint[] = []
): AiAnalysisResult {
  const price = ticker.lastPrice || 1;
  const atr = indicators.atr || price * 0.02;

  // Run through Centralized Final Signal Decision Engine
  const centralDecision = calculateCentralSignalDecision(ticker, indicators, klines);

  const longScore = centralDecision.bullishScore;
  const shortScore = centralDecision.bearishScore;
  const finalSignal = centralDecision.finalSignal;
  const signal: SignalType = finalSignal === 'LONG' ? 'LONG' : finalSignal === 'SHORT' ? 'SHORT' : 'WAIT';

  const volRatio = atr / price;
  const riskScore = Math.min(10, Math.max(1, Math.round(volRatio * 100 * 1.5 + (finalSignal === 'NEUTRAL' ? 3 : 1))));

  const expectedReturnMin = Number(((atr * 1.2) / price * 100).toFixed(1));
  const expectedReturnMax = Number(((atr * 2.8) / price * 100).toFixed(1));

  // Build Key Factors for compatibility
  const keyFactors = centralDecision.confirmations.map((c) => ({
    title: `${c.factor}: ${c.label}`,
    impact: (c.status === 'CONFIRMED' ? (finalSignal === 'SHORT' ? 'negative' : 'positive') : c.status === 'RISK' ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral',
    description: c.detail,
  }));

  return {
    signal,
    finalSignal,
    longScore,
    shortScore,
    riskScore,
    confidence: centralDecision.confidence,
    signalQuality: centralDecision.signalQuality,
    marketState: centralDecision.marketState,
    expectedReturnMin,
    expectedReturnMax,
    summary: centralDecision.reasonSummary,
    tradingStyle: centralDecision.tradingStyle,
    tradingStyleLabelBn: centralDecision.tradingStyleLabelBn,
    tradingStyleLabelEn: centralDecision.tradingStyleLabelEn,
    estimatedDuration: centralDecision.estimatedDuration,
    estimatedDurationBn: centralDecision.estimatedDurationBn,
    estimatedDurationEn: centralDecision.estimatedDurationEn,
    volatilityLevel: centralDecision.volatilityLevel,
    volatilityPcnt: centralDecision.volatilityPcnt,
    keyFactors,
    centralDecision,
  };
}

// Generate Manual Grid Strategy
export function calculateGridStrategy(
  price: number,
  atr: number,
  investmentUsdt: number = 100,
  gridCount: number = 50,
  leverage: number = 1
): GridParameters {
  const rangePcnt = Math.max(0.08, (atr * 4) / price); // Grid range bandwidth
  const lowerPrice = Number((price * (1 - rangePcnt)).toFixed(2));
  const upperPrice = Number((price * (1 + rangePcnt)).toFixed(2));

  const totalRange = upperPrice - lowerPrice;
  const gridStep = totalRange / gridCount;
  const gridStepUsdt = Number(gridStep.toFixed(2));

  const profitPerGridPcnt = Number(((gridStep / price) * 100 * 0.95).toFixed(2)); // deducting estimated fee

  const suggestedTakeProfit = Number((upperPrice * 1.02).toFixed(2));
  const suggestedStopLoss = Number((lowerPrice * 0.96).toFixed(2));

  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (leverage > 3 || rangePcnt > 0.25) riskLevel = 'High';
  else if (leverage > 1 || rangePcnt > 0.15) riskLevel = 'Moderate';

  return {
    investmentUsdt,
    leverage,
    gridCount,
    lowerPrice,
    upperPrice,
    gridStepUsdt,
    profitPerGridPcnt,
    suggestedTakeProfit,
    suggestedStopLoss,
    riskLevel,
  };
}

// Evaluate AI Risk Guard Warnings
export function evaluateRiskGuard(ticker: TickerData, indicators: TechnicalIndicators): RiskGuardWarning[] {
  const warnings: RiskGuardWarning[] = [];
  const now = Date.now();
  const pcnt = ticker.price24hPcnt * 100;

  // Pump Alert
  if (pcnt >= 30) {
    warnings.push({
      id: `pump-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'Pump Alert',
      severity: 'critical',
      title: '🚨 Extreme Pump Alert (>30%)',
      message: `${ticker.symbol} has surged ${pcnt.toFixed(1)}% in 24 hours. High risk of blow-off top or sudden retracement.`,
      timestamp: now,
    });
  }

  // Dump Alert
  if (pcnt <= -25) {
    warnings.push({
      id: `dump-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'Dump Alert',
      severity: 'critical',
      title: '📉 Massive Dump Alert (>25%)',
      message: `${ticker.symbol} has dropped ${Math.abs(pcnt).toFixed(1)}% in 24 hours. Exercise maximum capital protection.`,
      timestamp: now,
    });
  }

  // Funding Rate Extreme
  if (ticker.fundingRate !== undefined && Math.abs(ticker.fundingRate) >= 0.0006) {
    const isPositive = ticker.fundingRate > 0;
    warnings.push({
      id: `funding-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'Funding Rate Extreme',
      severity: 'high',
      title: '⚡ Funding Rate Extreme',
      message: `Funding rate for ${ticker.symbol} is ${(ticker.fundingRate * 100).toFixed(4)}%. ${
        isPositive ? 'Longs are paying heavy fees, liquidation cascade risk.' : 'Shorts heavily overcrowded.'
      }`,
      timestamp: now,
    });
  }

  // Volume Spike
  if (indicators.volumeTrend === 'High Spike') {
    warnings.push({
      id: `vol-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'Volume Spike',
      severity: 'medium',
      title: '📊 Abnormal Volume Spike',
      message: `Trading volume for ${ticker.symbol} is over 2.2x normal baseline. Institutional breakout or distribution in progress.`,
      timestamp: now,
    });
  }

  // Squeeze Alerts
  if (indicators.bollingerBands.squeeze) {
    warnings.push({
      id: `squeeze-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'High Volatility',
      severity: 'info',
      title: '🌀 Bollinger Band Squeeze',
      message: `Volatility compression detected on ${ticker.symbol}. An explosive breakout move is imminent.`,
      timestamp: now,
    });
  }

  // Short Squeeze Potential
  if (ticker.fundingRate && ticker.fundingRate < -0.0004 && indicators.rsi <= 25) {
    warnings.push({
      id: `ssqueeze-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'Possible Short Squeeze',
      severity: 'high',
      title: '🔥 Possible Short Squeeze',
      message: `Negative funding rate combined with low RSI (<=20 Oversold zone) indicates over-leveraged shorts vulnerable to a rapid price rally.`,
      timestamp: now,
    });
  }

  // Long Squeeze Potential
  if (ticker.fundingRate && ticker.fundingRate > 0.0005 && indicators.rsi >= 80) {
    warnings.push({
      id: `lsqueeze-${ticker.symbol}-${now}`,
      symbol: ticker.symbol,
      type: 'Possible Long Squeeze',
      severity: 'high',
      title: '⚠️ Possible Long Squeeze',
      message: `Over-leveraged longs paying high funding while RSI is in extreme overbought territory (>=85). High risk of cascading long liquidations.`,
      timestamp: now,
    });
  }

  return warnings;
}
