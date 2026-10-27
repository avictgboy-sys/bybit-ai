import { TickerData } from '../types';

export interface SlEfficiencyAnalysis {
  currentPrice: number;
  slPrice: number;
  direction: 'LONG' | 'SHORT';
  slDistanceAmount: number;
  slDistancePcnt: number;
  volatility24hPcnt: number;
  volatilityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  isExceptionallyVolatile: boolean; // True if current volatility is exceptionally high compared to standard 24h average
  volatilitySurgeRatio: number; // e.g. 1.6x average
  marketNoiseRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  marketNoiseWarningBn: string;
  marketNoiseWarningEn: string;
  recommendedMinSlPcnt: number;
  efficiencyScore: number; // 0 - 100
  status: 'TOO_TIGHT' | 'MODERATE' | 'OPTIMAL' | 'WIDE_POSITION';
  statusLabelBn: string;
  statusLabelEn: string;
  badgeColor: string;
  badgeBg: string;
  barColor: string;
  isTooTight: boolean;
  warningBn?: string;
  recommendationBn: string;
  recommendationEn: string;
}

export function calculateSlEfficiency(
  coin: TickerData,
  slPrice: number,
  direction: 'LONG' | 'SHORT' | string = 'LONG',
  atr?: number
): SlEfficiencyAnalysis {
  const currentPrice = coin.lastPrice > 0 ? coin.lastPrice : 1;
  const isShort = typeof direction === 'string' && (direction.toUpperCase().includes('SHORT') || direction.toUpperCase().includes('SELL'));
  const normalizedDirection: 'LONG' | 'SHORT' = isShort ? 'SHORT' : 'LONG';
  const high24h = coin.highPrice24h && coin.highPrice24h > 0 ? coin.highPrice24h : currentPrice * 1.03;
  const low24h = coin.lowPrice24h && coin.lowPrice24h > 0 ? coin.lowPrice24h : currentPrice * 0.97;

  // 1. Calculate 24h Intraday Volatility %
  const volatility24hPcnt = Number((((high24h - low24h) / currentPrice) * 100).toFixed(2));

  // Determine volatility categorization
  let volatilityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
  if (volatility24hPcnt < 4.0) {
    volatilityLevel = 'LOW';
  } else if (volatility24hPcnt <= 8.5) {
    volatilityLevel = 'MODERATE';
  } else if (volatility24hPcnt <= 15.0) {
    volatilityLevel = 'HIGH';
  } else {
    volatilityLevel = 'EXTREME';
  }

  // 2. SL Distance
  const slDistanceAmount = Math.abs(currentPrice - slPrice);
  const slDistancePcnt = Number(((slDistanceAmount / currentPrice) * 100).toFixed(2));

  // 3. Exceptionally High Volatility & Market Noise Evaluation
  // Baseline typical 24h volatility in standard conditions is ~4.5% - 5.5%
  // If ATR or 24h high/low range is significantly elevated (or absolute 24h price change is extreme)
  const atrPcnt = atr && atr > 0 ? (atr / currentPrice) * 100 : volatility24hPcnt * 0.25;
  const typicalBaselineVol = 4.8;
  const volatilitySurgeRatio = Number(
    Math.max(1.0, (volatility24hPcnt / typicalBaselineVol + (atrPcnt > 1.8 ? 0.5 : 0))).toFixed(1)
  );

  const isExceptionallyVolatile =
    volatility24hPcnt >= 9.0 ||
    volatilityLevel === 'EXTREME' ||
    (volatilityLevel === 'HIGH' && slDistancePcnt <= 4.2) ||
    (atrPcnt >= 2.2) ||
    (slDistancePcnt <= volatility24hPcnt * 0.40);

  let marketNoiseRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
  if (isExceptionallyVolatile && slDistancePcnt < 3.0) {
    marketNoiseRisk = 'CRITICAL';
  } else if (isExceptionallyVolatile || slDistancePcnt < 3.8) {
    marketNoiseRisk = 'HIGH';
  } else if (volatilityLevel === 'LOW' && slDistancePcnt >= 4.0) {
    marketNoiseRisk = 'LOW';
  }

  const marketNoiseWarningBn = isExceptionallyVolatile
    ? `⚠️ উচ্চ ভোলাটিলিটি নয়েজ সতর্কতা (${volatilitySurgeRatio}x স্বাভাবিকের চেয়ে বেশি): বর্তমান মার্কেট অত্যন্ত চঞ্চল। সাধারণ মার্কেট নয়েজ বা উইক স্পাইকেই আপনার -${slDistancePcnt}% এসএল অকালে ট্রিগার হয়ে যাওয়ার উচ্চ ঝুঁকি রয়েছে!`
    : `স্বাভাবিক মার্কেট ভোলাটিলিটি: এসএল দূরত্ব (-${slDistancePcnt}%) বর্তমান নয়েজ রেঞ্জে সুরক্ষিত।`;

  const marketNoiseWarningEn = isExceptionallyVolatile
    ? `⚠️ High Volatility Noise Warning (${volatilitySurgeRatio}x surge): Market is exceptionally volatile. Standard intraday wicks/noise may trigger your -${slDistancePcnt}% SL prematurely!`
    : `Standard Volatility: SL distance (-${slDistancePcnt}%) is well-buffered against typical noise.`;

  // 3. Volatility-Adjusted Minimum Recommended SL buffer (based on ATR / 24h range)
  // Low Volatility (<4%): needs at least 3.2%
  // Moderate Volatility (4-9%): needs at least 3.8% - 4.5%
  // High Volatility (9-16%): needs at least 4.8% - 6.5%
  // Extreme Volatility (>16%): needs at least 6.5%+
  let recommendedMinSlPcnt = 3.8;
  if (volatilityLevel === 'LOW') {
    recommendedMinSlPcnt = 3.2;
  } else if (volatilityLevel === 'MODERATE') {
    recommendedMinSlPcnt = Number(Math.max(3.8, volatility24hPcnt * 0.48).toFixed(2));
  } else if (volatilityLevel === 'HIGH') {
    recommendedMinSlPcnt = Number(Math.max(4.8, volatility24hPcnt * 0.45).toFixed(2));
  } else {
    recommendedMinSlPcnt = Number(Math.max(6.2, volatility24hPcnt * 0.40).toFixed(2));
  }

  // 4. Efficiency Ratio & Score (0 - 100)
  const ratio = slDistancePcnt / (recommendedMinSlPcnt || 1);
  let efficiencyScore = Math.min(100, Math.max(15, Math.round(ratio * 75)));

  // Status determination
  let status: 'TOO_TIGHT' | 'MODERATE' | 'OPTIMAL' | 'WIDE_POSITION' = 'OPTIMAL';
  let isTooTight = false;
  let statusLabelBn = '🛡️ নিরাপদ এসএল বাফার (Optimal Buffer)';
  let statusLabelEn = 'Optimal SL Buffer';
  let badgeColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let barColor = 'bg-emerald-500';
  let warningBn: string | undefined = undefined;
  let recommendationBn = '';
  let recommendationEn = '';

  if (slDistancePcnt < 2.5 || ratio < 0.65) {
    status = 'TOO_TIGHT';
    isTooTight = true;
    efficiencyScore = Math.min(45, Math.round(ratio * 50));
    statusLabelBn = '⚠️ ঝুঁকিপূর্ণ টাইট এসএল (High Liquidation / Noise Risk)';
    statusLabelEn = 'SL Too Tight (High Noise Risk)';
    badgeColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
    barColor = 'bg-rose-500';
    warningBn = `সতর্কতা: বর্তমান ২৪ ঘণ্টার ভোলাটিলিটি (${volatility24hPcnt}%) অনুযায়ী স্টপ-লস (-${slDistancePcnt}%) খুব কাছে রাখা হয়েছে। মার্কেট সামান্য সাধারণ উইক বা স্পাইক করলেই এসএল অকালে হিট করে আবার কাঙ্ক্ষিত দিকে ফিরে যাওয়ার উচ্চ ঝুঁকি রয়েছে!`;
    recommendationBn = `এসএল অন্তত ${recommendedMinSlPcnt}% দূরত্বে (সাপোর্ট সুইং লো-এর নিচে) সরিয়ে নিন অথবা লেভারেজ কমিয়ে ক্যাপিটাল প্রটেক্ট করুন।`;
    recommendationEn = `Widen SL distance to at least ${recommendedMinSlPcnt}% or lower leverage to avoid premature wick stops.`;
  } else if (slDistancePcnt < recommendedMinSlPcnt * 0.88 || ratio < 0.88) {
    status = 'MODERATE';
    efficiencyScore = Math.min(72, Math.max(50, Math.round(ratio * 70)));
    statusLabelBn = '⚡ মাঝারি এসএল বাফার (Moderate SL Buffer)';
    statusLabelEn = 'Moderate SL Buffer';
    badgeColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    barColor = 'bg-amber-400';
    warningBn = `টিপস: এসএল দূরত্ব (-${slDistancePcnt}%) মাঝারি। কোনো বড় নিউজ বা ভোলাটাইল ক্যান্ডেল উইকে স্টপ হান্টিং থেকে বাঁচতে অতিরিক্ত বাফার বজায় রাখুন।`;
    recommendationBn = `মাঝারি বাফার বিদ্যমান। প্রফিট টার্গেটের সাথে সামঞ্জস্য রেখে ট্রেইলিং স্টপ-লস সক্রিয় রাখুন।`;
    recommendationEn = `Moderate buffer active. Consider trailing SL as target approaches.`;
  } else if (slDistancePcnt > recommendedMinSlPcnt * 1.6) {
    status = 'WIDE_POSITION';
    efficiencyScore = 90;
    statusLabelBn = '🎯 ডিপ সুইং বাফার (Deep Swing / Position Buffer)';
    statusLabelEn = 'Deep Position SL Buffer';
    badgeColor = 'text-cyan-400';
    badgeBg = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    barColor = 'bg-cyan-400';
    recommendationBn = `ওয়াইড ও নিরাপদ এসএল বাফার (-${slDistancePcnt}%)। দীর্ঘমেয়াদী পজিশনে কোনো উইক হান্ট বা স্পাইকে লিকুইডেশনের ভয় নেই।`;
    recommendationEn = `Deep protective SL buffer against volatility spikes. Excellent for swing/position trades.`;
  } else {
    status = 'OPTIMAL';
    efficiencyScore = Math.min(100, Math.max(80, Math.round(80 + (ratio - 1) * 20)));
    statusLabelBn = '🛡️ আদর্শ ও সুরক্ষিত এসএল (Optimal Anti-Wick Buffer)';
    statusLabelEn = 'Optimal SL Buffer';
    badgeColor = 'text-emerald-400';
    badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    barColor = 'bg-emerald-500';
    recommendationBn = `এসএল (-${slDistancePcnt}%) মার্কেট নয়েজ ও ২৪ ঘণ্টার স্বাভাবিক ভোলাটিলিটি (${volatility24hPcnt}%) রেঞ্জের বাইরে চমৎকারভাবে সুরক্ষিত রয়েছে।`;
    recommendationEn = `SL is well-placed outside intraday noise & wick zones. Optimal protection against fakeouts.`;
  }

  return {
    currentPrice,
    slPrice,
    direction: normalizedDirection,
    slDistanceAmount,
    slDistancePcnt,
    volatility24hPcnt,
    volatilityLevel,
    isExceptionallyVolatile,
    volatilitySurgeRatio,
    marketNoiseRisk,
    marketNoiseWarningBn,
    marketNoiseWarningEn,
    recommendedMinSlPcnt,
    efficiencyScore,
    status,
    statusLabelBn,
    statusLabelEn,
    badgeColor,
    badgeBg,
    barColor,
    isTooTight,
    warningBn,
    recommendationBn,
    recommendationEn,
  };
}
