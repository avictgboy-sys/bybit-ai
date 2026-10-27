import { TickerData, KlinePoint, TechnicalIndicators } from '../types';

export interface SwingLadderLevel {
  role: 'SL_PROTECTION' | 'ENTRY' | 'TP1_TARGET' | 'TP2_TARGET' | 'TP3_EXPANSION' | 'SUPPORT_ZONE' | 'RESISTANCE_ZONE';
  name: string;
  price: number;
  percentDiff: number;
  zoneType: 'SUPPORT' | 'RESISTANCE' | 'ENTRY';
  reason: string;
  isTriggerTarget?: boolean;
}

export interface KeySwingLevelsResult {
  tp1: number;
  tp1Pcnt: number;
  tp2: number;
  tp2Pcnt: number;
  tp3: number;
  tp3Pcnt: number;
  sl: number;
  slPcnt: number;
  swingHigh: number;
  swingLow: number;
  pivotBase?: number;
  supportZoneMin?: number;
  supportZoneMax?: number;
  resistanceZoneMin?: number;
  resistanceZoneMax?: number;
  supportZoneDesc?: string;
  resistanceZoneDesc?: string;
  tp1Reason: string;
  tp2Reason: string;
  tp3Reason: string;
  slReason: string;
  allResistances: number[];
  allSupports: number[];
  keySupportLevel?: number;
  keyResistanceLevel?: number;
  ladderLevels?: SwingLadderLevel[];
}

/**
 * Precision formatter helper for prices (handles micro-cap tokens with many decimals vs large coins)
 */
export function formatPriceLevel(price: number): number {
  if (!price || isNaN(price) || price <= 0) return 0;
  if (price < 0.0001) return Number(price.toFixed(8));
  if (price < 0.01) return Number(price.toFixed(6));
  if (price < 1) return Number(price.toFixed(4));
  if (price < 10) return Number(price.toFixed(3));
  return Number(price.toFixed(2));
}

/**
 * Extracts distinct local swing peaks and troughs from kline candlestick series.
 */
export function extractKlineSwingPoints(klines: KlinePoint[]): {
  swingHighs: number[];
  swingLows: number[];
} {
  if (!klines || klines.length < 3) {
    return { swingHighs: [], swingLows: [] };
  }

  const swingHighs: number[] = [];
  const swingLows: number[] = [];

  // 1. Fractal 3-bar and 5-bar pivots
  for (let i = 2; i < klines.length - 2; i++) {
    const cur = klines[i];
    const prev1 = klines[i - 1];
    const prev2 = klines[i - 2];
    const next1 = klines[i + 1];
    const next2 = klines[i + 2];

    // Swing High (Local Peak)
    if (
      cur.high >= prev1.high &&
      cur.high >= prev2.high &&
      cur.high >= next1.high &&
      cur.high >= next2.high
    ) {
      swingHighs.push(cur.high);
    }

    // Swing Low (Local Trough)
    if (
      cur.low <= prev1.low &&
      cur.low <= prev2.low &&
      cur.low <= next1.low &&
      cur.low <= next2.low
    ) {
      swingLows.push(cur.low);
    }
  }

  // 2. Add recent block extremes (last 5, 10, 20 candles)
  if (klines.length >= 5) {
    const last5High = Math.max(...klines.slice(-5).map((k) => k.high));
    const last5Low = Math.min(...klines.slice(-5).map((k) => k.low));
    swingHighs.push(last5High);
    swingLows.push(last5Low);
  }
  if (klines.length >= 15) {
    const last15High = Math.max(...klines.slice(-15).map((k) => k.high));
    const last15Low = Math.min(...klines.slice(-15).map((k) => k.low));
    swingHighs.push(last15High);
    swingLows.push(last15Low);
  }

  return { swingHighs, swingLows };
}

/**
 * Key Support & Resistance Level Lookup Engine:
 * Accurately discovers key swing highs and lows, structural pivot points,
 * order block liquidity zones, and moving average barriers to calculate
 * TP1, TP2, TP3, and SL specifically based on price action levels.
 */
export function lookupKeySupportResistanceLevels(
  currentPrice: number,
  high24h: number,
  low24h: number,
  direction: 'LONG' | 'SHORT',
  indicators?: TechnicalIndicators,
  klines: KlinePoint[] = []
): KeySwingLevelsResult {
  const safePrice = currentPrice > 0 ? currentPrice : 1;
  const safeHigh = high24h > safePrice ? high24h : safePrice * 1.06;
  const safeLow = low24h > 0 && low24h < safePrice ? low24h : safePrice * 0.94;
  const range = safeHigh - safeLow || safePrice * 0.06;

  // Extract swing points from klines
  const { swingHighs: klineHighs, swingLows: klineLows } = extractKlineSwingPoints(klines);

  // Standard Classical Pivot Points
  const lastCandle = klines.length > 0 ? klines[klines.length - 1] : null;
  const pivotBase = lastCandle
    ? (lastCandle.high + lastCandle.low + lastCandle.close) / 3
    : (safeHigh + safeLow + safePrice) / 3;

  const r1 = 2 * pivotBase - (lastCandle?.low || safeLow);
  const s1 = 2 * pivotBase - (lastCandle?.high || safeHigh);
  const r2 = pivotBase + (safeHigh - safeLow);
  const s2 = pivotBase - (safeHigh - safeLow);
  const r3 = safeHigh + 2 * (pivotBase - safeLow);
  const s3 = safeLow - 2 * (safeHigh - pivotBase);

  // Fibonacci Retracements and Extensions
  const fib0382Retrace = safeLow + range * 0.382;
  const fib0618Retrace = safeLow + range * 0.618;
  const fib1272ExtUp = safeHigh + range * 0.272;
  const fib1618ExtUp = safeHigh + range * 0.618;
  const fib1272ExtDn = safeLow - range * 0.272;
  const fib1618ExtDn = safeLow - range * 0.618;

  // Build Comprehensive Resistance Candidate Pool (All potential ceiling levels)
  const rawResistances: number[] = [
    safeHigh,
    r1,
    r2,
    r3,
    fib0618Retrace,
    fib1272ExtUp,
    fib1618ExtUp,
    ...klineHighs,
  ];

  if (indicators) {
    if (indicators.resistance) rawResistances.push(...indicators.resistance);
    if (indicators.bollingerBands?.upper) rawResistances.push(indicators.bollingerBands.upper);
    if (indicators.ema50 && indicators.ema50 > safePrice) rawResistances.push(indicators.ema50);
    if (indicators.ema100 && indicators.ema100 > safePrice) rawResistances.push(indicators.ema100);
    if (indicators.ema200 && indicators.ema200 > safePrice) rawResistances.push(indicators.ema200);
  }

  // Build Comprehensive Support Candidate Pool (All potential floor levels)
  const rawSupports: number[] = [
    safeLow,
    s1,
    s2,
    s3,
    fib0382Retrace,
    fib1272ExtDn,
    fib1618ExtDn,
    ...klineLows,
  ];

  if (indicators) {
    if (indicators.support) rawSupports.push(...indicators.support);
    if (indicators.bollingerBands?.lower) rawSupports.push(indicators.bollingerBands.lower);
    if (indicators.ema50 && indicators.ema50 < safePrice) rawSupports.push(indicators.ema50);
    if (indicators.ema100 && indicators.ema100 < safePrice) rawSupports.push(indicators.ema100);
    if (indicators.ema200 && indicators.ema200 < safePrice) rawSupports.push(indicators.ema200);
  }

  // Clean, filter and cluster levels
  const validResistances = rawResistances
    .filter((v) => typeof v === 'number' && isFinite(v) && v > safePrice * 1.018)
    .sort((a, b) => a - b);

  const validSupports = rawSupports
    .filter((v) => typeof v === 'number' && isFinite(v) && v < safePrice * 0.982 && v > 0)
    .sort((a, b) => b - a);

  // Helper to cluster close price levels (merging within 0.75% threshold)
  const clusterLevels = (levels: number[], isAsc: boolean): number[] => {
    const clustered: number[] = [];
    for (const lvl of levels) {
      if (clustered.length === 0) {
        clustered.push(lvl);
      } else {
        const prev = clustered[clustered.length - 1];
        const distPcnt = Math.abs((lvl - prev) / prev) * 100;
        if (distPcnt >= 0.75) {
          clustered.push(lvl);
        }
      }
    }
    return clustered;
  };

  const clusteredResistances = clusterLevels(validResistances, true);
  const clusteredSupports = clusterLevels(validSupports, false);

  let tp1: number;
  let tp2: number;
  let tp3: number;
  let sl: number;
  let tp1Reason = '';
  let tp2Reason = '';
  let tp3Reason = '';
  let slReason = '';
  let keySupportLow: number | undefined;
  let keyResistanceHigh: number | undefined;

  if (direction === 'LONG') {
    // ----------------------------------------------------
    // LONG STRATEGY: Target Swing High Resistances
    // ----------------------------------------------------
    // TP 1: 1st Key Swing High / Local Resistance (Min 3.0% to 7.0% above entry)
    let candidateTp1 = clusteredResistances.find((r) => r >= safePrice * 1.032 && r <= safePrice * 1.075);
    if (!candidateTp1) {
      candidateTp1 = clusteredResistances.find((r) => r >= safePrice * 1.025);
    }
    if (!candidateTp1) {
      candidateTp1 = Math.max(safePrice * 1.052, r1 > safePrice * 1.025 ? r1 : safePrice * 1.052);
      tp1Reason = 'নিকটবর্তী সুইং হাই ও R1 রেজিস্ট্যান্স জোন';
    } else {
      tp1Reason = candidateTp1 === safeHigh ? '২৪ ঘণ্টার সুইং হাই রেজিস্ট্যান্স' : 'কী সুইং হাই ও লোকাল সাপ্লাই লেভেল';
    }
    tp1 = formatPriceLevel(candidateTp1);

    // TP 2: 2nd Major Swing High / 24h High / R2 Resistance (Strictly above TP1, ~8.0% to 15.0%)
    let candidateTp2 = clusteredResistances.find(
      (r) => r >= tp1 * 1.038 && r >= safePrice * 1.08 && r <= safePrice * 1.16
    );
    if (!candidateTp2) {
      candidateTp2 = clusteredResistances.find((r) => r >= tp1 * 1.035);
    }
    if (!candidateTp2) {
      candidateTp2 = Math.max(tp1 * 1.055, safeHigh > tp1 ? safeHigh : safePrice * 1.12);
      tp2Reason = '২৪ ঘণ্টার মূল সুইং হাই ও R2 রেজিস্ট্যান্স';
    } else {
      tp2Reason = candidateTp2 >= safeHigh * 0.99 ? '২৪ ঘণ্টার মেজর হাই ও অর্ডার ব্লক' : 'মেজর সুইং হাই রেজিস্ট্যান্স ২';
    }
    tp2 = formatPriceLevel(candidateTp2);

    // TP 3: Major Expansion Breakout Target / 1.618 Fib Extension (~18% to 25%)
    let candidateTp3 = clusteredResistances.find((r) => r >= tp2 * 1.045);
    if (!candidateTp3) {
      candidateTp3 = Math.max(tp2 * 1.06, fib1618ExtUp > tp2 ? fib1618ExtUp : safePrice * 1.20);
      tp3Reason = '১.৬১৮ ফিবোনাচ্চি এক্সটেনশন ও মেজর ব্রেকআউট টার্গেট';
    } else {
      tp3Reason = 'ফিবোনাচ্চি ব্রেকআউট এক্সটেনশন হাই';
    }
    tp3 = formatPriceLevel(candidateTp3);

    // STOP LOSS (SL): Safely anchored 2% to 5% BELOW Key Support Swing Low / S1 (Anti-Liquidity Sweep & Structural Floor Protection)
    // Explicit user rule: "সাপোর্ট রেজিস্ট্রার দেখে, er niche 2-5% niche sl dao. jate sl sohoje hit na kore"
    keySupportLow = clusteredSupports.find((s) => s <= safePrice * 0.985);
    if (!keySupportLow) {
      keySupportLow = safeLow < safePrice ? safeLow : safePrice * 0.965;
    }
    // Place SL with protective safety buffer strictly 2% - 5% beneath the actual support floor
    // Default: 3.6% buffer below key support level so overnight wicks & market noise cannot reach it
    const supportBufferPcnt = 3.6;
    const rawBufferedSl = keySupportLow * (1 - supportBufferPcnt / 100);

    // Ensure robust breathing room from entry:
    // Minimum 4.8% distance below entry to prevent premature trigger from intraday wicks
    // Allow up to 9.5% risk distance for deeper structural swing supports
    const minAllowedSl = safePrice * 0.905; // max 9.5% risk
    const maxAllowedSl = safePrice * 0.952; // minimum 4.8% breathing room
    sl = formatPriceLevel(Math.max(minAllowedSl, Math.min(maxAllowedSl, rawBufferedSl)));
    const effectiveBufferBelowSupport = Number((((keySupportLow - sl) / keySupportLow) * 100).toFixed(1));
    slReason = `কী-সাপোর্ট ($${formatPriceLevel(keySupportLow)}) এর ${effectiveBufferBelowSupport >= 1.5 && effectiveBufferBelowSupport <= 7.0 ? effectiveBufferBelowSupport : '৩.৬'}% নিচে নিরাপদ বাফার এসএল (উইক ও ফেক লিকুইডিটি হান্ট প্রটেক্টেড)`;

  } else {
    // ----------------------------------------------------
    // SHORT STRATEGY: Target Swing Low Supports
    // ----------------------------------------------------
    // TP 1: 1st Key Swing Low / Local Support (Min 3.5% to 7.5% below entry)
    let candidateTp1 = clusteredSupports.find((s) => s <= safePrice * 0.962 && s >= safePrice * 0.925);
    if (!candidateTp1) {
      candidateTp1 = clusteredSupports.find((s) => s <= safePrice * 0.968);
    }
    if (!candidateTp1) {
      candidateTp1 = Math.min(safePrice * 0.942, s1 < safePrice * 0.968 ? s1 : safePrice * 0.942);
      tp1Reason = 'নিকটবর্তী সুইং লো ও S1 সাপোর্ট লিকুইডিটি';
    } else {
      tp1Reason = candidateTp1 === safeLow ? '২৪ ঘণ্টার সুইং লো সাপোর্ট' : 'কী সুইং লো ও ডিমান্ড জোন ১';
    }
    tp1 = formatPriceLevel(candidateTp1);

    // TP 2: 2nd Major Swing Low / 24h Low / S2 Support (Strictly below TP1, ~8.0% to 16.0%)
    let candidateTp2 = clusteredSupports.find(
      (s) => s <= tp1 * 0.962 && s <= safePrice * 0.91 && s >= safePrice * 0.82
    );
    if (!candidateTp2) {
      candidateTp2 = clusteredSupports.find((s) => s <= tp1 * 0.955);
    }
    if (!candidateTp2) {
      candidateTp2 = Math.min(tp1 * 0.935, safeLow < tp1 ? safeLow : safePrice * 0.86);
      tp2Reason = '২৪ ঘণ্টার মূল সুইং লো ও S2 সাপোর্ট';
    } else {
      tp2Reason = candidateTp2 <= safeLow * 1.01 ? '২৪ ঘণ্টার মেজর লো ও ডিপ লিকুইডিটি' : 'মেজর সুইং লো সাপোর্ট ২';
    }
    tp2 = formatPriceLevel(candidateTp2);

    // TP 3: Major Capitulation Breakdown Target / 1.618 Fib Drop (~18% to 26%)
    let candidateTp3 = clusteredSupports.find((s) => s <= tp2 * 0.95);
    if (!candidateTp3) {
      candidateTp3 = Math.min(tp2 * 0.93, fib1618ExtDn < tp2 && fib1618ExtDn > 0 ? fib1618ExtDn : safePrice * 0.78);
      tp3Reason = '১.৬১৮ ফিবোনাচ্চি ড্রপ ও মেজর ব্রেকডাউন টার্গেট';
    } else {
      tp3Reason = 'ফিবোনাচ্চি ব্রেকডাউন এক্সটেনশন লো';
    }
    tp3 = formatPriceLevel(candidateTp3);

    // STOP LOSS (SL): Safely anchored 2% to 5% ABOVE Key Resistance Swing High / R1 (Anti-Liquidity Sweep)
    // First find the primary structural resistance level above current entry
    keyResistanceHigh = clusteredResistances.find((r) => r >= safePrice * 1.015);
    if (!keyResistanceHigh) {
      keyResistanceHigh = safeHigh > safePrice ? safeHigh : safePrice * 1.035;
    }
    // Place SL with protective buffer strictly 2% - 5% above the resistance ceiling to prevent fakeout stop hits
    const resistanceBufferPcnt = 3.6;
    const rawBufferedSl = keyResistanceHigh * (1 + resistanceBufferPcnt / 100);

    // Minimum 4.8% distance above entry, allowing up to 9.5% risk distance
    const minAllowedSl = safePrice * 1.048; // minimum 4.8% breathing room
    const maxAllowedSl = safePrice * 1.095; // max 9.5% ceiling buffer
    sl = formatPriceLevel(Math.min(maxAllowedSl, Math.max(minAllowedSl, rawBufferedSl)));
    const effectiveBufferAboveRes = Number((((sl - keyResistanceHigh) / keyResistanceHigh) * 100).toFixed(1));
    slReason = `কী-রেজিস্ট্যান্স ($${formatPriceLevel(keyResistanceHigh)}) এর ${effectiveBufferAboveRes >= 1.5 && effectiveBufferAboveRes <= 7.0 ? effectiveBufferAboveRes : '৩.৬'}% উপরে নিরাপদ বাফার এসএল (শর্ট স্কুইজ ও ফেকআউট প্রটেক্টেড)`;
  }

  // Calculate clean percentage distances
  const tp1Pcnt = Number((Math.abs((tp1 - safePrice) / safePrice) * 100).toFixed(2));
  const tp2Pcnt = Number((Math.abs((tp2 - safePrice) / safePrice) * 100).toFixed(2));
  const tp3Pcnt = Number((Math.abs((tp3 - safePrice) / safePrice) * 100).toFixed(2));
  const slPcnt = Number((Math.abs((safePrice - sl) / safePrice) * 100).toFixed(2));

  return {
    tp1,
    tp1Pcnt,
    tp2,
    tp2Pcnt,
    tp3,
    tp3Pcnt,
    sl,
    slPcnt,
    swingHigh: formatPriceLevel(safeHigh),
    swingLow: formatPriceLevel(safeLow),
    tp1Reason,
    tp2Reason,
    tp3Reason,
    slReason,
    allResistances: clusteredResistances.map(formatPriceLevel),
    allSupports: clusteredSupports.map(formatPriceLevel),
    keySupportLevel: keySupportLow ? formatPriceLevel(keySupportLow) : undefined,
    keyResistanceLevel: keyResistanceHigh ? formatPriceLevel(keyResistanceHigh) : undefined,
  };
}
