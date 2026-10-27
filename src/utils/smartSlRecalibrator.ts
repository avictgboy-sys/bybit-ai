import { KlinePoint, TickerData } from '../types';
import { detectCandlestickPatterns, DetectedPattern } from './candlestickPatterns';
import { calculateSlEfficiency } from './slEfficiency';

export interface SmartSlRecalibrationResult {
  symbol: string;
  currentPrice: number;
  direction: 'LONG' | 'SHORT';
  originalSlPrice: number;
  originalSlPcnt: number;
  recalibratedSlPrice: number;
  recalibratedSlPcnt: number;
  differencePcnt: number;
  isAdjustmentRecommended: boolean;
  adjustmentType: 'EXPAND_BUFFER' | 'TIGHTEN_SAFETY' | 'ALREADY_OPTIMAL';
  
  // Candlestick Pattern Scanner Noise Metrics
  noiseLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  noiseScore: number; // 0 - 100
  avgWickRatioPcnt: number; // % of candle range that is wicks
  maxRecentWickPcnt: number; // maximum wick spike in recent periods
  recentPatterns: DetectedPattern[];
  primaryPatternNameBn?: string;
  primaryPatternNameEn?: string;
  
  // Market Noise Factors
  structuralSupportPrice?: number;
  structuralResistancePrice?: number;
  noiseBufferAddedPcnt: number;
  
  // Explanations
  reasonBn: string;
  reasonEn: string;
  confidenceScore: number; // 0 - 100
}

/**
 * Assess Market Noise Levels from Candlestick OHLC Data and Scanner Patterns
 */
export function assessCandlestickMarketNoise(klines: KlinePoint[]) {
  if (!klines || klines.length < 5) {
    return {
      noiseLevel: 'MODERATE' as const,
      noiseScore: 50,
      avgWickRatioPcnt: 40,
      maxRecentWickPcnt: 1.5,
      recentPatterns: [],
      structuralLow: 0,
      structuralHigh: 0,
      atrPcnt: 2.5,
    };
  }

  const recentKlines = klines.slice(-20);
  const patterns = detectCandlestickPatterns(klines);
  const recentPatterns = patterns.slice(-3);

  let totalWickRatio = 0;
  let maxWickPcnt = 0;
  let totalRange = 0;
  let lowestLow = Number.MAX_VALUE;
  let highestHigh = Number.MIN_VALUE;

  recentKlines.forEach((k) => {
    const range = Math.max(0.000001, k.high - k.low);
    const body = Math.abs(k.close - k.open);
    const isGreen = k.close >= k.open;
    const upperWick = isGreen ? k.high - k.close : k.high - k.open;
    const lowerWick = isGreen ? k.open - k.low : k.close - k.low;
    const wicksTotal = upperWick + lowerWick;

    const wickRatio = (wicksTotal / range) * 100;
    totalWickRatio += wickRatio;

    const candleWickPcnt = (Math.max(upperWick, lowerWick) / (k.close || 1)) * 100;
    if (candleWickPcnt > maxWickPcnt) {
      maxWickPcnt = candleWickPcnt;
    }

    totalRange += range;
    if (k.low < lowestLow) lowestLow = k.low;
    if (k.high > highestHigh) highestHigh = k.high;
  });

  const avgWickRatioPcnt = Math.round(totalWickRatio / recentKlines.length);
  const currentPrice = recentKlines[recentKlines.length - 1].close || 1;
  const avgRange = totalRange / recentKlines.length;
  const atrPcnt = Number(((avgRange / currentPrice) * 100).toFixed(2));

  // Compute composite noise score (0 - 100)
  // Higher wick ratio and ATR indicates strong hunt / market noise
  let noiseScore = Math.round(avgWickRatioPcnt * 0.5 + atrPcnt * 12 + maxWickPcnt * 8);
  noiseScore = Math.min(100, Math.max(10, noiseScore));

  let noiseLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
  if (noiseScore < 35) {
    noiseLevel = 'LOW';
  } else if (noiseScore <= 60) {
    noiseLevel = 'MODERATE';
  } else if (noiseScore <= 82) {
    noiseLevel = 'HIGH';
  } else {
    noiseLevel = 'EXTREME';
  }

  return {
    noiseLevel,
    noiseScore,
    avgWickRatioPcnt,
    maxRecentWickPcnt: Number(maxWickPcnt.toFixed(2)),
    recentPatterns,
    structuralLow: lowestLow,
    structuralHigh: highestHigh,
    atrPcnt,
  };
}

/**
 * Automatically Recalibrates Stop Loss Distance based on Candlestick Scanner Noise
 */
export function recalibrateSmartStopLoss(
  coin: TickerData,
  currentSlPrice: number,
  direction: 'LONG' | 'SHORT' | string = 'LONG',
  klines: KlinePoint[] = []
): SmartSlRecalibrationResult {
  const currentPrice = coin.lastPrice > 0 ? coin.lastPrice : 1;
  const isShort =
    typeof direction === 'string' &&
    (direction.toUpperCase().includes('SHORT') || direction.toUpperCase().includes('SELL'));
  const normalizedDirection: 'LONG' | 'SHORT' = isShort ? 'SHORT' : 'LONG';

  const origSlDistAmount = Math.abs(currentPrice - currentSlPrice);
  const originalSlPcnt = Number(((origSlDistAmount / currentPrice) * 100).toFixed(2));

  const noiseData = assessCandlestickMarketNoise(klines);
  const efficiency = calculateSlEfficiency(coin, currentSlPrice, normalizedDirection);

  // Derive Smart Noise-Calibrated SL %
  // Base requirement depending on noise level:
  // - LOW noise: 3.2% - 3.8%
  // - MODERATE noise: 4.2% - 4.8%
  // - HIGH noise: 5.2% - 6.2%
  // - EXTREME noise: 6.5% - 7.8%
  let targetSlPcnt = 4.2;

  switch (noiseData.noiseLevel) {
    case 'LOW':
      targetSlPcnt = Math.max(3.2, Number((noiseData.atrPcnt * 1.5).toFixed(1)));
      break;
    case 'MODERATE':
      targetSlPcnt = Math.max(4.2, Number((noiseData.atrPcnt * 1.8 + 0.5).toFixed(1)));
      break;
    case 'HIGH':
      targetSlPcnt = Math.max(5.4, Number((noiseData.atrPcnt * 2.2 + 0.8).toFixed(1)));
      break;
    case 'EXTREME':
      targetSlPcnt = Math.max(6.8, Number((noiseData.atrPcnt * 2.6 + 1.2).toFixed(1)));
      break;
  }

  // Factor in structural wick support / resistance if klines available
  let structuralPrice: number | undefined = undefined;
  let noiseBufferAdded = 0.5;

  if (normalizedDirection === 'LONG') {
    if (noiseData.structuralLow > 0 && noiseData.structuralLow < currentPrice) {
      // Put SL 1.8% - 2.5% below lowest support wick in recent cluster (Anti-liquidity sweep)
      const buffer = noiseData.noiseLevel === 'HIGH' || noiseData.noiseLevel === 'EXTREME' ? 0.025 : 0.018;
      const structuralSl = noiseData.structuralLow * (1 - buffer);
      const structDistPcnt = Number((((currentPrice - structuralSl) / currentPrice) * 100).toFixed(2));
      if (structDistPcnt >= 3.0 && structDistPcnt <= 9.0) {
        targetSlPcnt = Math.max(targetSlPcnt, structDistPcnt);
        structuralPrice = structuralSl;
      }
    }
  } else {
    if (noiseData.structuralHigh > 0 && noiseData.structuralHigh > currentPrice) {
      // Put SL 1.8% - 2.5% above highest resistance wick in recent cluster (Anti-squeeze buffer)
      const buffer = noiseData.noiseLevel === 'HIGH' || noiseData.noiseLevel === 'EXTREME' ? 0.025 : 0.018;
      const structuralSl = noiseData.structuralHigh * (1 + buffer);
      const structDistPcnt = Number((((structuralSl - currentPrice) / currentPrice) * 100).toFixed(2));
      if (structDistPcnt >= 3.0 && structDistPcnt <= 9.0) {
        targetSlPcnt = Math.max(targetSlPcnt, structDistPcnt);
        structuralPrice = structuralSl;
      }
    }
  }

  // Cap target SL between 3.2% and 8.0%
  targetSlPcnt = Number(Math.min(8.0, Math.max(3.2, targetSlPcnt)).toFixed(2));

  // Compute new Recalibrated SL Price
  let recalibratedSlPrice =
    normalizedDirection === 'LONG'
      ? currentPrice * (1 - targetSlPcnt / 100)
      : currentPrice * (1 + targetSlPcnt / 100);

  if (structuralPrice && Math.abs(structuralPrice - currentPrice) > 0) {
    recalibratedSlPrice = structuralPrice;
    targetSlPcnt = Number(((Math.abs(currentPrice - recalibratedSlPrice) / currentPrice) * 100).toFixed(2));
  }

  const differencePcnt = Number((targetSlPcnt - originalSlPcnt).toFixed(2));
  const isAdjustmentRecommended = Math.abs(differencePcnt) >= 0.5 || originalSlPcnt < 3.2;

  let adjustmentType: 'EXPAND_BUFFER' | 'TIGHTEN_SAFETY' | 'ALREADY_OPTIMAL' = 'ALREADY_OPTIMAL';
  if (differencePcnt >= 0.5 || originalSlPcnt < 3.2) {
    adjustmentType = 'EXPAND_BUFFER';
  } else if (differencePcnt <= -1.2 && originalSlPcnt > 7.0 && noiseData.noiseLevel === 'LOW') {
    adjustmentType = 'TIGHTEN_SAFETY';
  }

  const primaryPattern = noiseData.recentPatterns.length > 0 ? noiseData.recentPatterns[noiseData.recentPatterns.length - 1] : undefined;

  // Bengali Reason Formulation
  let reasonBn = '';
  if (adjustmentType === 'EXPAND_BUFFER') {
    reasonBn = `ক্যান্ডেলস্টিক স্ক্যানারে গড় ${noiseData.avgWickRatioPcnt}% উইক নয়েজ এবং ${noiseData.noiseLevel === 'HIGH' || noiseData.noiseLevel === 'EXTREME' ? 'তীব্র লিকুইডিটি হান্ট' : 'মার্কেট চঞ্চলতা'} ধরা পড়েছে। সাধারণ নয়েজে অকালে এসএল ট্রিগার হওয়া ঠেকাতে এসএল দূরত্ব -${originalSlPcnt}% থেকে বাড়িয়ে নিরাপদ -${targetSlPcnt}% এ রিক্যালিব্রেট করা হয়েছে।`;
  } else if (adjustmentType === 'TIGHTEN_SAFETY') {
    reasonBn = `ক্যান্ডেলস্টিক প্যাটার্নে মার্কেট নয়েজ খুব কম (${noiseData.avgWickRatioPcnt}% উইক) এবং ট্রেন্ড স্পষ্ট। অপ্রয়োজনীয় বড় ড্র-ডাউন এড়াতে এসএল কিছুটা টাইট করে -${targetSlPcnt}% নির্ধারণ করা হয়েছে।`;
  } else {
    reasonBn = `বর্তমান এসএল (-${originalSlPcnt}%) ক্যান্ডেলস্টিক প্যাটার্ন স্ক্যানারের নয়েজ লেভেল (${noiseData.noiseScore}/100) অনুযায়ী ইতিমধ্যে অপ্টিমাইজড ও সুরক্ষিত রয়েছে।`;
  }

  const reasonEn =
    adjustmentType === 'EXPAND_BUFFER'
      ? `Candlestick scanner detected ${noiseData.avgWickRatioPcnt}% wick noise and ${noiseData.noiseLevel} market volatility. SL buffer recalibrated from -${originalSlPcnt}% to -${targetSlPcnt}% to prevent false stop-outs from standard market noise.`
      : `SL distance (-${targetSlPcnt}%) is calibrated against current candle wick noise and ATR swing bounds.`;

  return {
    symbol: coin.symbol,
    currentPrice,
    direction: normalizedDirection,
    originalSlPrice: currentSlPrice,
    originalSlPcnt,
    recalibratedSlPrice,
    recalibratedSlPcnt: targetSlPcnt,

    differencePcnt,
    isAdjustmentRecommended,
    adjustmentType,
    noiseLevel: noiseData.noiseLevel,
    noiseScore: noiseData.noiseScore,
    avgWickRatioPcnt: noiseData.avgWickRatioPcnt,
    maxRecentWickPcnt: noiseData.maxRecentWickPcnt,
    recentPatterns: noiseData.recentPatterns,
    primaryPatternNameBn: primaryPattern?.nameBn,
    primaryPatternNameEn: primaryPattern?.name,
    structuralSupportPrice: normalizedDirection === 'LONG' ? structuralPrice : undefined,
    structuralResistancePrice: normalizedDirection === 'SHORT' ? structuralPrice : undefined,
    noiseBufferAddedPcnt: noiseBufferAdded,
    reasonBn,
    reasonEn,
    confidenceScore: Math.min(96, Math.max(75, 80 + (noiseData.recentPatterns.length > 0 ? 10 : 0))),
  };
}
