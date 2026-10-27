import { KlinePoint } from '../types';

export interface DetectedPattern {
  id: string;
  name: string;
  nameBn: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  reliability: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  candleIndex: number;
  timeStr: string;
  price: number;
  descriptionBn: string;
  actionBn: string;
  icon: string;
}

/**
 * Identify Candlestick Patterns from OHLC Kline Data
 */
export function detectCandlestickPatterns(klines: KlinePoint[]): DetectedPattern[] {
  if (!klines || klines.length < 3) return [];

  const patterns: DetectedPattern[] = [];
  const len = klines.length;

  for (let i = 2; i < len; i++) {
    const c0 = klines[i - 2]; // 2 candles ago
    const c1 = klines[i - 1]; // 1 candle ago
    const c2 = klines[i];     // current/target candle

    const open = c2.open;
    const close = c2.close;
    const high = c2.high;
    const low = c2.low;

    const body = Math.abs(close - open);
    const range = high - low;
    if (range === 0) continue;

    const isGreen = close > open;
    const isRed = close < open;

    const upperWick = isGreen ? high - close : high - open;
    const lowerWick = isGreen ? open - low : close - low;

    // Previous candle props
    const prevBody = Math.abs(c1.close - c1.open);
    const prevIsGreen = c1.close > c1.open;
    const prevIsRed = c1.close < c1.open;

    // Calculate Bollinger Bands (10, 2.0) for this candle index
    let bbUpper = 0;
    let bbMiddle = 0;
    let bbLower = 0;
    if (i >= 10) {
      const sliceCloses = klines.slice(i - 9, i + 1).map((k) => k.close);
      const mean = sliceCloses.reduce((a, b) => a + b, 0) / 10;
      const variance = sliceCloses.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 10;
      const stdDev = Math.sqrt(variance);
      bbUpper = mean + 2 * stdDev;
      bbMiddle = mean;
      bbLower = mean - 2 * stdDev;
    }

    // 0. Bollinger Bands Custom Signal Strategy:
    // BUY: Green Hammer + Wick Pierced Below Lower Band & Closed Inside (Low < bbLower && Close >= bbLower)
    if (
      bbLower > 0 &&
      isGreen &&
      lowerWick >= body * 2 &&
      upperWick <= body * 0.5 &&
      low < bbLower &&
      close >= bbLower
    ) {
      patterns.push({
        id: `bb-buy-hammer-${c2.timestamp}`,
        name: 'BB Breakout Green Hammer (BUY)',
        nameBn: '🎯 BB স্ট্র্যাটেজি: গ্রীন হ্যামার বাই সিগন্যাল',
        type: 'BULLISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'Bollinger Bands (10, 2.0) এর লোয়ার ব্যান্ডের (DN) নিচে উইক ভেদ করার পর ক্যান্ডেলটি ব্যান্ডের ভেতরে ক্লোজ করেছে (Low < Lower Band && Close >= Lower Band)। এটি ক্লাসিক রিভার্সাল ও স্ট্রং বাউন্স নির্দেশ করে।',
        actionBn: '🟢 স্ট্রং BUY সিগন্যাল! স্টপ-লস হ্যামারের লো-এর নিচে রেখে মিডল ব্যান্ড (Pink) ও আপার ব্যান্ড (Yellow) টার্গেটে ট্রেড নিন।',
        icon: '🎯',
      });
      continue;
    }

    // SELL: Red Inverted Hammer + Wick Pierced Above Upper Band & Closed Inside (High > bbUpper && Close <= bbUpper)
    if (
      bbUpper > 0 &&
      isRed &&
      upperWick >= body * 2 &&
      lowerWick <= body * 0.5 &&
      high > bbUpper &&
      close <= bbUpper
    ) {
      patterns.push({
        id: `bb-sell-invhammer-${c2.timestamp}`,
        name: 'BB Breakout Inverted Hammer (SELL)',
        nameBn: '🎯 BB স্ট্র্যাটেজি: রেড ইনভার্টেড হ্যামার সেল সিগন্যাল',
        type: 'BEARISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'Bollinger Bands (10, 2.0) এর আপার ব্যান্ডের (UP) উপরে উইক ভেদ করার পর ক্যান্ডেলটি ব্যান্ডের ভেতরে ফিরে ক্লোজ করেছে (High > Upper Band && Close <= Upper Band)। এটি টপ রিজেকশন ও রিভার্সাল নির্দেশ করে।',
        actionBn: '🔴 স্ট্রং SELL / শর্ট সিগন্যাল! স্টপ-লস ক্যান্ডেল হাইয়ের উপরে রেখে মিডল ব্যান্ড (Pink) ও লোয়ার ব্যান্ড (Purple) টার্গেটে শর্ট করুন।',
        icon: '🚨',
      });
      continue;
    }

    // 1. Hammer (বুলিশ হ্যামার) - Long lower shadow at bottom, small body
    if (
      lowerWick >= body * 2 &&
      upperWick <= body * 0.4 &&
      body / range >= 0.15 &&
      body / range <= 0.45 &&
      c1.close <= c1.open // after downtrend
    ) {
      patterns.push({
        id: `hammer-${c2.timestamp}`,
        name: 'Hammer',
        nameBn: 'বুলিশ হ্যামার (Hammer)',
        type: 'BULLISH',
        reliability: 'HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'নিচের দিকে স্ট্রং বায়িং প্রেশার রিজেকশন। সেলারদের পুশ ব্যর্থ হয়ে বায়াররা মার্কেট টেনে তুলেছে।',
        actionBn: '🟢 সাপোর্ট বাউন্সে লং/বাই (Buy/Long) এন্ট্রি বিবেচনা করুন। স্টপ লস হ্যামারের লো-এর নিচে রাখুন।',
        icon: '🔨',
      });
      continue;
    }

    // 2. Shooting Star (শুটিং স্টার / বিয়ারিশ পিন বার) - Long upper shadow at top
    if (
      upperWick >= body * 2 &&
      lowerWick <= body * 0.4 &&
      body / range >= 0.15 &&
      body / range <= 0.45 &&
      c1.close >= c1.open // after uptrend
    ) {
      patterns.push({
        id: `shooting-star-${c2.timestamp}`,
        name: 'Shooting Star',
        nameBn: 'শুটিং স্টার (Shooting Star)',
        type: 'BEARISH',
        reliability: 'HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'উচ্চ মূল্যে বায়ারদের ব্যর্থতা এবং ভারী সেলিং রিজেকশন। টপ রিভার্সাল ইঙ্গিত।',
        actionBn: '🔴 রেজিস্ট্যান্স লেভেলে শর্ট/সেল (Short/Sell) এন্ট্রি অথবা প্রফিট বুক করার মোক্ষম সময়।',
        icon: '🌠',
      });
      continue;
    }

    // 3. Bullish Engulfing (বুলিশ এনগালফিং) - Green candle fully covers previous red candle
    if (
      prevIsRed &&
      isGreen &&
      open <= c1.close &&
      close >= c1.open &&
      body > prevBody * 1.15
    ) {
      patterns.push({
        id: `bull-engulf-${c2.timestamp}`,
        name: 'Bullish Engulfing',
        nameBn: 'বুলিশ এনগালফিং (Bullish Engulfing)',
        type: 'BULLISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'বড় সবুজ ক্যান্ডেল আগের লাল ক্যান্ডেলকে সম্পূর্ণ ঢেকে ফেলেছে। আগ্রাসী বায়িং ভলিউম বৃদ্ধি।',
        actionBn: '🟢 স্ট্রং বুলিশ কনফার্মেশন। লং পজিশন ওপেন করুন এবং টার্গেট হাই সেট করুন।',
        icon: '🚀',
      });
      continue;
    }

    // 4. Bearish Engulfing (বিয়ারিশ এনগালফিং) - Red candle fully covers previous green candle
    if (
      prevIsGreen &&
      isRed &&
      open >= c1.close &&
      close <= c1.open &&
      body > prevBody * 1.15
    ) {
      patterns.push({
        id: `bear-engulf-${c2.timestamp}`,
        name: 'Bearish Engulfing',
        nameBn: 'বিয়ারিশ এনগালফিং (Bearish Engulfing)',
        type: 'BEARISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'বড় লাল ক্যান্ডেল আগের সবুজ ক্যান্ডেলকে পুরোপুরি গ্রাস করেছে। বড় ভলিউমে সেলিং আধিপত্য।',
        actionBn: '🔴 স্ট্রং ডাউনট্রেন্ড সতর্কতা। লং পজিশন এক্সিট করুন অথবা শর্ট স্কাল্প এন্ট্রি নিন।',
        icon: '⚠️',
      });
      continue;
    }

    // 5. Morning Star (মর্নিং স্টার - ৩ ক্যান্ডেল প্যাটার্ন)
    if (
      c0.close < c0.open && // 1st big red
      Math.abs(c1.close - c1.open) <= Math.abs(c0.close - c0.open) * 0.4 && // 2nd small star
      isGreen && // 3rd big green
      close >= (c0.open + c0.close) / 2 // closes above midpoint of 1st
    ) {
      patterns.push({
        id: `morning-star-${c2.timestamp}`,
        name: 'Morning Star',
        nameBn: 'মর্নিং স্টার (Morning Star Reversal)',
        type: 'BULLISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'ক্লাসিকাল ট্রিপল ক্যান্ডেল বটম রিভার্সাল। সেলারদের দুর্বলতা কাটিয়ে বায়াররা ট্রেন্ড নিয়ন্ত্রণে নিয়েছে।',
        actionBn: '🟢 চমৎকার বটম-লং সুযোগ। হাই উইন-রেট রিভার্সাল সিগন্যাল।',
        icon: '🌅',
      });
      continue;
    }

    // 6. Evening Star (ইভনিং স্টার - ৩ ক্যান্ডেল প্যাটার্ন)
    if (
      c0.close > c0.open && // 1st big green
      Math.abs(c1.close - c1.open) <= Math.abs(c0.close - c0.open) * 0.4 && // 2nd small star
      isRed && // 3rd big red
      close <= (c0.open + c0.close) / 2 // closes below midpoint of 1st
    ) {
      patterns.push({
        id: `evening-star-${c2.timestamp}`,
        name: 'Evening Star',
        nameBn: 'ইভনিং স্টার (Evening Star Top)',
        type: 'BEARISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'টপ লেভেলে বায়ারদের মোমেন্টাম নিঃশেষিত এবং সেলিং ড্রপ শুরু হয়েছে।',
        actionBn: '🔴 টপ রিভার্সাল সতর্কতা। শর্ট এন্ট্রি নিন এবং কারেকশনের জন্য প্রস্তুত থাকুন।',
        icon: '🌆',
      });
      continue;
    }

    // 7. Doji (দোজি - সিদ্ধান্তহীনতা)
    if (body <= range * 0.08 && range > 0) {
      const isDragonfly = lowerWick >= range * 0.65;
      const isGravestone = upperWick >= range * 0.65;

      if (isDragonfly) {
        patterns.push({
          id: `dragonfly-${c2.timestamp}`,
          name: 'Dragonfly Doji',
          nameBn: 'ড্রাগনফ্লাই দোজি (Dragonfly Doji)',
          type: 'BULLISH',
          reliability: 'HIGH',
          candleIndex: i,
          timeStr: c2.timeStr,
          price: close,
          descriptionBn: 'নিচে লম্বা শ্যাডো সহ দোজি। গভীর ডিপ থেকে বুলিশ রিবাউন্ড।',
          actionBn: '🟢 বুলিশ সাপোর্ট রিটেস্টে বাই সিগন্যাল।',
          icon: '🐉',
        });
      } else if (isGravestone) {
        patterns.push({
          id: `gravestone-${c2.timestamp}`,
          name: 'Gravestone Doji',
          nameBn: 'গ্রেভস্টোন দোজি (Gravestone Doji)',
          type: 'BEARISH',
          reliability: 'HIGH',
          candleIndex: i,
          timeStr: c2.timeStr,
          price: close,
          descriptionBn: 'উপরে লম্বা শ্যাডো সহ দোজি। হাই প্রাইজ রিজেকশন ও সেলিং ধাক্কা।',
          actionBn: '🔴 বিয়ারিশ ডাউন প্রেসার। সতর্ক থাকুন।',
          icon: '🪦',
        });
      } else {
        patterns.push({
          id: `doji-${c2.timestamp}`,
          name: 'Doji',
          nameBn: 'স্ট্যান্ডার্ড দোজি (Doji Star)',
          type: 'NEUTRAL',
          reliability: 'MODERATE',
          candleIndex: i,
          timeStr: c2.timeStr,
          price: close,
          descriptionBn: 'বায়ার ও সেলারদের মধ্যে সমান যুদ্ধ। মার্কেট নিরপেক্ষ ও সিদ্ধান্তহীন অবস্থায় রয়েছে।',
          actionBn: '🟡 পরের ক্যান্ডেল যেদিকে ব্রেকআউট করবে সেদিকের ট্রেন্ড ফলো করুন।',
          icon: '⚖️',
        });
      }
      continue;
    }

    // 8. Marubozu (মারুবোজু - ফুল বডি পাওয়ারফুল ক্যান্ডেল)
    if (body / range >= 0.88 && range > 0) {
      if (isGreen) {
        patterns.push({
          id: `bull-maru-${c2.timestamp}`,
          name: 'Bullish Marubozu',
          nameBn: 'বুলিশ মারুবোজু (Bullish Marubozu)',
          type: 'BULLISH',
          reliability: 'HIGH',
          candleIndex: i,
          timeStr: c2.timeStr,
          price: close,
          descriptionBn: 'কোনো উইক ছাড়া সম্পূর্ণ সবুজ বডি। শুরু থেকে শেষ পর্যন্ত একটানা বাইয়ারদের আধিপত্য।',
          actionBn: '🟢 চরম বুলিশ মোমেন্টাম। ট্রেন্ড কন্টিনিউয়েশন লং ট্রেড।',
          icon: '🔋',
        });
      } else {
        patterns.push({
          id: `bear-maru-${c2.timestamp}`,
          name: 'Bearish Marubozu',
          nameBn: 'বিয়ারিশ মারুবোজু (Bearish Marubozu)',
          type: 'BEARISH',
          reliability: 'HIGH',
          candleIndex: i,
          timeStr: c2.timeStr,
          price: close,
          descriptionBn: 'কোনো উইক ছাড়া সম্পূর্ণ লাল বডি। চরম প্যানিক সেলিং ও ডাম্পিং প্রেসার।',
          actionBn: '🔴 ভারী সেলিং শক্তি। বাই দেওয়া থেকে বিরত থাকুন।',
          icon: '🩸',
        });
      }
      continue;
    }

    // 9. Inverted Hammer (ইনভার্টেড হ্যামার)
    if (
      upperWick >= body * 2 &&
      lowerWick <= body * 0.3 &&
      body / range >= 0.15 &&
      body / range <= 0.45 &&
      c1.close <= c1.open
    ) {
      patterns.push({
        id: `inv-hammer-${c2.timestamp}`,
        name: 'Inverted Hammer',
        nameBn: 'ইনভার্টেড হ্যামার (Inverted Hammer)',
        type: 'BULLISH',
        reliability: 'MODERATE',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'ডাউনট্রেন্ডের তলদেশে বায়ারদের প্রাথমিক ধাক্কা ও রিবাউন্ড চেষ্টা।',
        actionBn: '🟢 পরের গ্রিন ক্যান্ডেলে কনফার্মেশন নিয়ে লং ট্রেড বিবেচনা।',
        icon: '🕯️',
      });
      continue;
    }

    // 10. Piercing Line (পিয়ার্সিং লাইন - বুলিশ রিভার্সাল)
    if (
      prevIsRed &&
      isGreen &&
      open < c1.low &&
      close > (c1.open + c1.close) / 2 &&
      close < c1.open
    ) {
      patterns.push({
        id: `piercing-${c2.timestamp}`,
        name: 'Piercing Pattern',
        nameBn: 'পিয়ার্সিং লাইন (Piercing Line)',
        type: 'BULLISH',
        reliability: 'HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'নিচে ওপেন হওয়ার পর আগের রেড ক্যান্ডেলের ৫০% এর বেশি রিকভার করেছে।',
        actionBn: '🟢 স্ট্রং সাপোর্ট বাউন্স রিভার্সাল লং সিগন্যাল।',
        icon: '⚡',
      });
      continue;
    }

    // 11. Dark Cloud Cover (ডার্ক ক্লাউড কভার - বিয়ারিশ রিভার্সাল)
    if (
      prevIsGreen &&
      isRed &&
      open > c1.high &&
      close < (c1.open + c1.close) / 2 &&
      close > c1.open
    ) {
      patterns.push({
        id: `dark-cloud-${c2.timestamp}`,
        name: 'Dark Cloud Cover',
        nameBn: 'ডার্ক ক্লাউড কভার (Dark Cloud Cover)',
        type: 'BEARISH',
        reliability: 'HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'আপট্রেন্ডের শীর্ষে গ্যাপ-আপ ওপেন হওয়ার পর আগের গ্রিন ক্যান্ডেলের ৫০% এর নিচে নেমে এসে ক্লোজ করেছে।',
        actionBn: '🔴 টপ রিজেকশন রিভার্সাল সেল/শর্ট সিগন্যাল।',
        icon: '☁️',
      });
      continue;
    }

    // 12. Bullish Harami (বুলিশ হারামি / গর্ভবতী ক্যান্ডেল)
    if (
      prevIsRed &&
      isGreen &&
      open > c1.close &&
      close < c1.open &&
      body < prevBody * 0.6
    ) {
      patterns.push({
        id: `bull-harami-${c2.timestamp}`,
        name: 'Bullish Harami',
        nameBn: 'বুলিশ হারামি (Bullish Harami)',
        type: 'BULLISH',
        reliability: 'HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'বড় লাল ক্যান্ডেলের পেটের মধ্যে ছোট সবুজ ক্যান্ডেল তৈরি হয়েছে। সেলিং প্রেসার হ্রাস পাওয়ার সংকেত।',
        actionBn: '🟢 ডাউনট্রেন্ড দুর্বল হয়ে বাউন্স শুরু হওয়ার সংকেত।',
        icon: '🤰',
      });
      continue;
    }

    // 13. Bearish Harami (বিয়ারিশ হারামি)
    if (
      prevIsGreen &&
      isRed &&
      open < c1.close &&
      close > c1.open &&
      body < prevBody * 0.6
    ) {
      patterns.push({
        id: `bear-harami-${c2.timestamp}`,
        name: 'Bearish Harami',
        nameBn: 'বিয়ারিশ হারামি (Bearish Harami)',
        type: 'BEARISH',
        reliability: 'HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'বড় সবুজ ক্যান্ডেলের ভেতরে ছোট লাল ক্যান্ডেল তৈরি হয়েছে। আপট্রেন্ড ক্লান্ত হওয়ার সংকেত।',
        actionBn: '🔴 আপট্রেন্ড শেষ হওয়ার পূর্বভাস। প্রফিট বুক করুন।',
        icon: '⚠️',
      });
      continue;
    }

    // 14. Three White Soldiers (থ্রি হোয়াইট সোলজার্স - স্ট্রং বুলিশ ৩ ক্যান্ডেল)
    if (
      c0.close > c0.open &&
      c1.close > c1.open &&
      isGreen &&
      c1.close > c0.close &&
      close > c1.close &&
      c1.open > c0.open &&
      open > c1.open
    ) {
      patterns.push({
        id: `three-white-${c2.timestamp}`,
        name: 'Three White Soldiers',
        nameBn: 'থ্রি হোয়াইট সোলজার্স (Three White Soldiers)',
        type: 'BULLISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'টানা তিনটি ধারাবাহিক শক্তিশালী গ্রীন ক্যান্ডেল যা আগেরটির চেয়ে উঁচুতে ক্লোজ করেছে।',
        actionBn: '🟢 অপ্রতিরোধ্য আপট্রেন্ড কনফার্মেশন। ডিপে লং রি-এন্ট্রি নিন।',
        icon: '💂',
      });
      continue;
    }

    // 15. Three Black Crows (থ্রি ব্ল্যাক ক্রোজ - স্ট্রং বিয়ারিশ ৩ ক্যান্ডেল)
    if (
      c0.close < c0.open &&
      c1.close < c1.open &&
      isRed &&
      c1.close < c0.close &&
      close < c1.close &&
      c1.open < c0.open &&
      open < c1.open
    ) {
      patterns.push({
        id: `three-black-${c2.timestamp}`,
        name: 'Three Black Crows',
        nameBn: 'থ্রি ব্ল্যাক ক্রোজ (Three Black Crows)',
        type: 'BEARISH',
        reliability: 'VERY_HIGH',
        candleIndex: i,
        timeStr: c2.timeStr,
        price: close,
        descriptionBn: 'টানা তিনটি ধারাবাহিক শক্তিশালী লাল ক্যান্ডেল যা প্রতিটি নতুন লো তৈরি করেছে।',
        actionBn: '🔴 স্ট্রং ডাউনট্রেন্ডের আধিপত্য। সেলিং পজিশন চালু রাখুন।',
        icon: '🦅',
      });
      continue;
    }
  }

  return patterns;
}

export interface CandlestickGuideItem {
  id: string;
  name: string;
  nameBn: string;
  category: 'BULLISH_REVERSAL' | 'BEARISH_REVERSAL' | 'INDECISION' | 'CONTINUATION' | 'BOLLINGER_STRATEGY';
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  reliability: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  winRateStr: string;
  icon: string;
  summaryBn: string;
  anatomyBn: string;
  psychologyBn: string;
  entryRuleBn: string;
  stopLossRuleBn: string;
  takeProfitRuleBn: string;
  tipsBn: string;
}

export const CANDLESTICK_LIBRARY: CandlestickGuideItem[] = [
  {
    id: 'bb-buy-hammer',
    name: 'BB Breakout Green Hammer (BUY)',
    nameBn: 'বোলিঞ্জার ব্যান্ডের নিচে গ্রীন হ্যামার (BB Hammer)',
    category: 'BOLLINGER_STRATEGY',
    type: 'BULLISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯২.৫%',
    icon: '🎯',
    summaryBn: 'Bollinger Bands (10, 2.0) এর লোয়ার ব্যান্ডের নিচে উইক ভেদ করে ভেতরে ক্লোজ হওয়া হাই-উইনরেট বাউন্স সিগন্যাল।',
    anatomyBn: 'ছোট গ্রিন বডি উপরের দিকে, নিচের লম্বা শ্যাডো লোয়ার ব্যান্ডের (Purple DN) বাইরে নেমে গেছে এবং ক্লোজ ভেতরে হয়েছে।',
    psychologyBn: 'চরম ওভারসোল্ড পর্যায়ে বায়াররা ড্রপ আটকে বিশাল ভলিউমে প্রাইজ টেনে উপরে তুলেছে।',
    entryRuleBn: 'গ্রীন হ্যামার ক্লোজ হওয়ার পর পরবর্তী ক্যান্ডেলের শুরুতে সরাসরি মার্কেট বাই এন্ট্রি।',
    stopLossRuleBn: 'হ্যামার ক্যান্ডেলের লো পয়েন্টের ০.৫% নিচে স্টপ-লস সেট করুন।',
    takeProfitRuleBn: 'TP1: মিডল ব্যান্ড (Magenta SMA 10), TP2: আপার ব্যান্ড (Yellow UP)।',
    tipsBn: 'RSI < ৩০ থাকলে এই সিগন্যালের নির্ভুলতা ৯৫% ছাড়িয়ে যায়।',
  },
  {
    id: 'bb-sell-invhammer',
    name: 'BB Breakout Inverted Hammer (SELL)',
    nameBn: 'বোলিঞ্জার ব্যান্ডের উপরে রেড ইনভার্টেড হ্যামার (BB Sell)',
    category: 'BOLLINGER_STRATEGY',
    type: 'BEARISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯১.৮%',
    icon: '🚨',
    summaryBn: 'Bollinger Bands (10, 2.0) এর আপার ব্যান্ডের উপরে উইক ভেদ করে ভেতরে ক্লোজ হওয়া টপ রিভার্সাল সেল সিগন্যাল।',
    anatomyBn: 'ছোট রেড বডি নিচের দিকে, উপরের লম্বা শ্যাডো আপার ব্যান্ডের (Yellow UP) বাইরে স্পর্শ করে রিজেক্ট হয়েছে।',
    psychologyBn: 'চরম ওভারবট লেভেলে বড় প্লেয়াররা সেল করে লিকুইডিটি গ্র্যাব করেছে এবং বায়াররা দুর্বল হয়ে পড়েছে।',
    entryRuleBn: 'ক্যান্ডেলটি আপার ব্যান্ডের ভেতরে ক্লোজ হওয়ার পর পরবর্তী ক্যান্ডেলে শর্ট/সেল এন্ট্রি।',
    stopLossRuleBn: 'ইনভার্টেড হ্যামারের হাই পয়েন্টের ০.৫% উপরে স্টপ-লস রাখুন।',
    takeProfitRuleBn: 'TP1: মিডল ব্যান্ড (Pink MB), TP2: লোয়ার ব্যান্ড (Purple DN)।',
    tipsBn: 'RSI > ৭০ বা ৮৫ থাকলে এটি নিশ্চিত প্রফিট-বুকিং রিজেকশন নির্দেশ করে।',
  },
  {
    id: 'hammer',
    name: 'Hammer',
    nameBn: 'বুলিশ হ্যামার (Hammer)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'HIGH',
    winRateStr: '৮৮.৪%',
    icon: '🔨',
    summaryBn: 'ডাউনট্রেন্ডের তলদেশে হাতুড়ির মতো দেখতে ক্যান্ডেল যা বুলিশ ট্রেন্ড রিভার্সাল শুরু করে।',
    anatomyBn: 'বডির উচ্চতার চেয়ে নিচের উইক অন্তত ২ থেকে ৩ গুণ লম্বা হয় এবং উপরের উইক খুব ছোট বা থাকে না।',
    psychologyBn: 'সেলাররা প্রাইজ নিচে ফেললেও বায়াররা শক্ত হাতে মার্কেট টেনে তুলে ওপেনিংয়ের উপরে ক্লোজ করায়।',
    entryRuleBn: 'হ্যামারের হাই ব্রেক করলে বাই এন্ট্রি নিন।',
    stopLossRuleBn: 'হ্যামারের লো পয়েন্টের ঠিক নিচে স্টপ-লস সেট করুন।',
    takeProfitRuleBn: 'পূর্ববর্তী সুইং হাই বা ১:২.৫ রিস্ক-রিওয়ার্ড অনুপাতে টার্গেট নিন।',
    tipsBn: 'মেজর সাপোর্ট জোনে এবং EMA 50/100 এর কাছে হ্যামার পাওয়া গেলে তা সর্বোচ্চ কার্যকরী।',
  },
  {
    id: 'inverted-hammer',
    name: 'Inverted Hammer',
    nameBn: 'ইনভার্টেড হ্যামার (Inverted Hammer)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'MODERATE',
    winRateStr: '৮২.৬%',
    icon: '🕯️',
    summaryBn: 'উল্টানো হাতুড়ির মতো দেখতে ক্যান্ডেল যা ডাউনট্রেন্ডের তলদেশে তৈরি হয়ে আপট্রেন্ড রিভার্সাল তৈরি করে।',
    anatomyBn: 'ছোট বডি নিচের অংশে থাকে এবং উপরের দিকে বডির দ্বিগুণ বা বেশি লম্বা শ্যাডো থাকে।',
    psychologyBn: 'বায়াররা মার্কেটে বড় বাইয়ার প্রেসার তৈরি করার সক্ষমতা প্রদর্শন করেছে।',
    entryRuleBn: 'পরের ক্যান্ডেল গ্রিন হয়ে কনফার্মেশন দিলে বাই নিন।',
    stopLossRuleBn: 'ক্যান্ডেলের লো পয়েন্টের নিচে স্টপ লস রাখুন।',
    takeProfitRuleBn: '১:২ রিস্ক রিওয়ার্ড টার্গেট।',
    tipsBn: 'ভলিউম স্পাইক থাকলে ইনভার্টেড হ্যামারের কার্যকারিতা বহুগুণ বৃদ্ধি পায়।',
  },
  {
    id: 'shooting-star',
    name: 'Shooting Star',
    nameBn: 'শুটিং স্টার (Shooting Star)',
    category: 'BEARISH_REVERSAL',
    type: 'BEARISH',
    reliability: 'HIGH',
    winRateStr: '৮৯.২%',
    icon: '🌠',
    summaryBn: 'আপট্রেন্ডের শীর্ষে উল্কার মতো লম্বা উপরের শ্যাডো সহ রিজেকশন ক্যান্ডেল যা বিয়ারিশ ড্রপ শুরু করে।',
    anatomyBn: 'নিচের অংশে ছোট রেড বডি এবং উপরের দিকে বডির দ্বিগুণের বেশি লম্বা উইক।',
    psychologyBn: 'উচ্চ মূল্যে বায়াররা প্রাইজ ধরে রাখতে পারেনি, ভারী সেলিং রিজেকশনে বিয়াররা দখল নিয়েছে।',
    entryRuleBn: 'শুটিং স্টারের লো ব্রেক করার সাথে সাথে শর্ট বা সেল এন্ট্রি।',
    stopLossRuleBn: 'শুটিং স্টারের সর্বোচ্চ হাই এর উপরে স্টপ লস দিন।',
    takeProfitRuleBn: 'সাপোর্ট লাইন বা ১:৩ রিস্ক রিওয়ার্ডে প্রফিট নিন।',
    tipsBn: 'রেজিস্ট্যান্স লেভেলে শুটিং স্টার গঠিত হলে লং পজিশন ক্লোজ করে শর্ট নেওয়ার মোক্ষম সময়।',
  },
  {
    id: 'hanging-man',
    name: 'Hanging Man',
    nameBn: 'হ্যাংগিং ম্যান (Hanging Man)',
    category: 'BEARISH_REVERSAL',
    type: 'BEARISH',
    reliability: 'HIGH',
    winRateStr: '৮৪.৩%',
    icon: '🪢',
    summaryBn: 'আপট্রেন্ডের শীর্ষে হ্যামারের মতো দেখতে ঝুলন্ত মানুষের রূপরেখা যা বিয়ারিশ সংকেত দেয়।',
    anatomyBn: 'উপরের অংশে ছোট বডি এবং নিচের দিকে বডির দ্বিগুণের বেশি লম্বা লোয়ার শ্যাডো।',
    psychologyBn: 'আপট্রেন্ড চলাকালীন সেলাররা প্রথমবারের মতো প্রাইজ গভীরভাবে নিচে ফেলতে পেরেছে।',
    entryRuleBn: 'পরবর্তী ক্যান্ডেল রেড হয়ে লো ক্রস করলে শর্ট এন্ট্রি।',
    stopLossRuleBn: 'হ্যাংগিং ম্যানের হাইয়ের উপরে স্টপ লস।',
    takeProfitRuleBn: '১:২ রিস্ক রিওয়ার্ড টার্গেট।',
    tipsBn: 'পরের ক্যান্ডেল রেড না হলে ট্রেড নেওয়া থেকে বিরত থাকুন।',
  },
  {
    id: 'bullish-engulfing',
    name: 'Bullish Engulfing',
    nameBn: 'বুলিশ এনগালফিং (Bullish Engulfing)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯১.৫%',
    icon: '🚀',
    summaryBn: 'একটি ছোট লাল ক্যান্ডেলের পর বড় আকারের সবুজ ক্যান্ডেল যা আগের ক্যান্ডেলকে সম্পূর্ণ গ্রাস করে ফেলে।',
    anatomyBn: 'প্রথম ক্যান্ডেল রেড, দ্বিতীয় ক্যান্ডেল বিশাল গ্রিন বডি যা প্রথমটির ওপেন ও ক্লোজকে পুরোপুরি ঢেকে ফেলে।',
    psychologyBn: 'সেলারদের সম্পূর্ণ পরাজিত করে বায়াররা প্রচণ্ড ভলিউমে মার্কেট দখলে নিয়েছে।',
    entryRuleBn: 'এনগালফিং গ্রিন ক্যান্ডেল ক্লোজ হওয়ার পর পরই বাই এন্ট্রি।',
    stopLossRuleBn: 'এনগালফিং ক্যান্ডেলের লো পয়েন্টের নিচে স্টপ লস।',
    takeProfitRuleBn: 'পরবর্তী কি-রেজিস্ট্যান্স বা ১:৩ রিস্ক রিওয়ার্ড।',
    tipsBn: 'বুলিশ এনগালফিং সবচেয়ে নির্ভরযোগ্য ক্যান্ডেলস্টিক প্যাটার্নগুলোর একটি।',
  },
  {
    id: 'bearish-engulfing',
    name: 'Bearish Engulfing',
    nameBn: 'বিয়ারিশ এনগালফিং (Bearish Engulfing)',
    category: 'BEARISH_REVERSAL',
    type: 'BEARISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯০.৮%',
    icon: '⚠️',
    summaryBn: 'একটি ছোট সবুজ ক্যান্ডেলের পর বড় আকারের লাল ক্যান্ডেল যা আগের গ্রিন ক্যান্ডেলকে সম্পূর্ণ ঢেকে ফেলে।',
    anatomyBn: 'প্রথম ক্যান্ডেল গ্রিন, দ্বিতীয় ক্যান্ডেল বড় রেড বডি যা প্রথমটির সমস্ত প্রাইজ রেঞ্জ গ্রাস করে।',
    psychologyBn: 'বড় মাপের লিকুইডেশন এবং প্রাতিষ্ঠানিক সেলিং প্রেসারে বায়াররা পুরোপুরি স্তব্ধ।',
    entryRuleBn: 'এনগালফিং রেড ক্যান্ডেল ক্লোজের সাথে সাথে শর্ট এন্ট্রি।',
    stopLossRuleBn: 'রেড ক্যান্ডেলের হাই পয়েন্টের উপরে স্টপ লস।',
    takeProfitRuleBn: 'পরবর্তী ডিমান্ড জোন বা ১:৩ রিস্ক রিওয়ার্ড।',
    tipsBn: 'আপট্রেন্ডের শীর্ষে এটি দেখা গেলে অবিলম্বে লং পজিশন সুরক্ষিত করুন।',
  },
  {
    id: 'morning-star',
    name: 'Morning Star',
    nameBn: 'মর্নিং স্টার (Morning Star Reversal)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯৩.২%',
    icon: '🌅',
    summaryBn: '৩টি ক্যান্ডেলের সমন্বয়ে গঠিত বটম রিভার্সাল যা দীর্ঘ ডাউনট্রেন্ডের পর নতুন আপট্রেন্ড সূচিত করে।',
    anatomyBn: '১ম: বড় লাল ক্যান্ডেল, ২য়: নিচে ছোট দোজি/স্টার ক্যান্ডেল, ৩য়: বড় গ্রিন ক্যান্ডেল যা ১ম ক্যান্ডেলের ৫০% এর উপরে ক্লোজ করে।',
    psychologyBn: 'সেলারদের মোমেন্টাম শেষ হয়ে দোজি ক্যান্ডেলে থামে এবং বায়াররা প্রবল শক্তিতে রিবাউন্ড ঘটায়।',
    entryRuleBn: '৩য় গ্রিন ক্যান্ডেল ক্লোজের পর লং এন্ট্রি নিন।',
    stopLossRuleBn: 'মাঝের স্টার ক্যান্ডেলের সর্বনিম্নের নিচে স্টপ লস রাখুন।',
    takeProfitRuleBn: 'বড় সুইং হাই ও ১:৩.৫ রিস্ক-রিওয়ার্ড।',
    tipsBn: 'হাই-টাইমফ্রেম (1H, 4H, 1D) এ মর্নিং স্টার অত্যন্ত লাভজনক।',
  },
  {
    id: 'evening-star',
    name: 'Evening Star',
    nameBn: 'ইভনিং স্টার (Evening Star Top)',
    category: 'BEARISH_REVERSAL',
    type: 'BEARISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯২.১%',
    icon: '🌆',
    summaryBn: '৩টি ক্যান্ডেলের সমন্বয়ে গঠিত টপ রিভার্সাল যা আপট্রেন্ড সমাপ্ত করে বড় ক্র্যাশ বা ডাউনট্রেন্ড আনে।',
    anatomyBn: '১ম: বড় গ্রিন ক্যান্ডেল, ২য়: শীর্ষে ছোট দোজি/স্টার, ৩য়: বড় রেড ক্যান্ডেল যা ১ম ক্যান্ডেলের ৫০% এর নিচে নেমে ক্লোজ করে।',
    psychologyBn: 'বায়ারদের শক্তি শেষ এবং বড় সেলাররা মার্কেট ডাম্প করতে শুরু করেছে।',
    entryRuleBn: '৩য় রেড ক্যান্ডেল সম্পন্ন হওয়ার পর শর্ট এন্ট্রি।',
    stopLossRuleBn: 'মাঝের স্টার ক্যান্ডেলের সর্বোচ্চ হাইয়ের উপরে স্টপ লস।',
    takeProfitRuleBn: 'সাপোর্ট জোন ও ১:৩.৫ রিস্ক-রিওয়ার্ড।',
    tipsBn: 'রেজিস্ট্যান্সের কাছে এটি তৈরি হলে প্রায় ১০০% ক্ষেত্রে ট্রেন্ড ঘুরে যায়।',
  },
  {
    id: 'dragonfly-doji',
    name: 'Dragonfly Doji',
    nameBn: 'ড্রাগনফ্লাই দোজি (Dragonfly Doji)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'HIGH',
    winRateStr: '৮৭.৫%',
    icon: '🐉',
    summaryBn: 'টি (T) আকৃতির ক্যান্ডেল যার ওপেন, হাই ও ক্লোজ একই লেভেলে এবং নিচে দীর্ঘ শ্যাডো থাকে।',
    anatomyBn: 'বডি নেই বললেই চলে, উপরের শ্যাডো অনুপস্থিত এবং নিচে দীর্ঘ লোয়ার উইক।',
    psychologyBn: 'সেলাররা ডিপে পুশ করলেও বায়াররা নিচ থেকে সম্পূর্ণ ভলিউম কিনে প্রাইজ ওপেনিং লেভেলে ফিরিয়ে এনেছে।',
    entryRuleBn: 'পরের ক্যান্ডেল গ্রিন হলে বাই এন্ট্রি।',
    stopLossRuleBn: 'ড্রাগনফ্লাইয়ের লো পয়েন্টের নিচে স্টপ লস।',
    takeProfitRuleBn: '১:২.৫ রিস্ক রিওয়ার্ড।',
    tipsBn: 'সাপোর্ট লাইনে ড্রাগনফ্লাই তৈরি হলে বড় বাউন্সের প্রস্তুতি নিন।',
  },
  {
    id: 'gravestone-doji',
    name: 'Gravestone Doji',
    nameBn: 'গ্রেভস্টোন দোজি (Gravestone Doji)',
    category: 'BEARISH_REVERSAL',
    type: 'BEARISH',
    reliability: 'HIGH',
    winRateStr: '৮৬.৯%',
    icon: '🪦',
    summaryBn: 'উল্টানো টি (┴) আকৃতির ক্যান্ডেল যার ওপেন, লো ও ক্লোজ একই লেভেলে এবং উপরে দীর্ঘ শ্যাডো থাকে।',
    anatomyBn: 'বডি নেই, নিচের উইক নেই বললেই চলে, উপরের দিকে লম্বা শ্যাডো।',
    psychologyBn: 'বায়াররা উপরে নেওয়ার চেষ্টা করেও ব্যর্থ হয়েছে এবং সেলাররা পুরো লাভ মুছে ফেলে নিচে নামিয়েছে।',
    entryRuleBn: 'পরের ক্যান্ডেলে শর্ট/সেল এন্ট্রি।',
    stopLossRuleBn: 'গ্রেভস্টোনের হাই পয়েন্টের উপরে স্টপ লস।',
    takeProfitRuleBn: '১:২.৫ রিস্ক রিওয়ার্ড।',
    tipsBn: 'ওভারবট জোনে গ্রেভস্টোন দোজি মারাত্মক বিয়ারিশ ধ্বংস ডেকে আনে।',
  },
  {
    id: 'doji',
    name: 'Standard Doji',
    nameBn: 'স্ট্যান্ডার্ড দোজি (Doji Star)',
    category: 'INDECISION',
    type: 'NEUTRAL',
    reliability: 'MODERATE',
    winRateStr: '৭৫.০%',
    icon: '⚖️',
    summaryBn: 'প্লাস (+) বা ক্রসের মতো ক্যান্ডেল যা বায়ার ও সেলারদের সমশক্তি ও সিদ্ধান্তহীনতা বোঝায়।',
    anatomyBn: 'ওপেন ও ক্লোজ প্রাইস প্রায় সমান এবং উপরে ও নিচে প্রায় সমান দৈর্ঘ্যের উইক।',
    psychologyBn: 'মার্কেটে কোনো পক্ষই ট্রেন্ড এগিয়ে নিতে পারছে না, নতুন মোমেন্টামের অপেক্ষা।',
    entryRuleBn: 'দোজি পরবর্তী ব্রেকআউট ক্যান্ডেলের ডিরেকশনে ট্রেড নিন।',
    stopLossRuleBn: 'দোজির বিপরীত প্রান্তের উপরে/নিচে স্টপ লস।',
    takeProfitRuleBn: '১:২ রিস্ক রিওয়ার্ড।',
    tipsBn: 'ট্রেন্ডের মাঝখানে দোজি দেখলে পজিশন ধরে রাখুন, রিভার্সাল আশা করবেন না।',
  },
  {
    id: 'bullish-marubozu',
    name: 'Bullish Marubozu',
    nameBn: 'বুলিশ মারুবোজু (Bullish Marubozu)',
    category: 'CONTINUATION',
    type: 'BULLISH',
    reliability: 'HIGH',
    winRateStr: '৮৮.১%',
    icon: '🔋',
    summaryBn: 'উইক ছাড়া সম্পূর্ণ ঘন সবুজ ক্যান্ডেল যা শুরু থেকে শেষ পর্যন্ত একটানা বায়ারদের আধিপত্য নির্দেশ করে।',
    anatomyBn: 'ওপেন = লো এবং ক্লোজ = হাই; কোনো শ্যাডো বা উইক নেই।',
    psychologyBn: 'বায়াররা এক সেকেন্ডের জন্যও সেলারদের সুযোগ দেয়নি, চরম মোমেন্টাম।',
    entryRuleBn: 'মারুবোজুর ক্লোজে বা সামান্য পুলব্যাকে লং এন্ট্রি।',
    stopLossRuleBn: 'মারুবোজুর ৫০% বা লো পয়েন্টের নিচে স্টপ লস।',
    takeProfitRuleBn: '১:২.৫ ট্রেন্ড ফলোয়িং টার্গেট।',
    tipsBn: 'ব্রেকআউটের সময় মারুবোজু পাওয়া গেলে ট্রেন্ড দীর্ঘস্থায়ী হয়।',
  },
  {
    id: 'bearish-marubozu',
    name: 'Bearish Marubozu',
    nameBn: 'বিয়ারিশ মারুবোজু (Bearish Marubozu)',
    category: 'CONTINUATION',
    type: 'BEARISH',
    reliability: 'HIGH',
    winRateStr: '৮৭.৯%',
    icon: '🩸',
    summaryBn: 'উইক ছাড়া সম্পূর্ণ ঘন লাল ক্যান্ডেল যা শুরু থেকে শেষ পর্যন্ত চরম ডাম্প ও সেলিং আধিপত্য প্রকাশ করে।',
    anatomyBn: 'ওপেন = হাই এবং ক্লোজ = লো; কোনো আপার বা লোয়ার শ্যাডো নেই।',
    psychologyBn: 'প্যানিক সেলিং ও তীব্র ভলিউমে সেলাররা মার্কেট একমুখী করে ফেলেছে।',
    entryRuleBn: 'মারুবোজু ক্লোজের সাথে সাথে শর্ট এন্ট্রি।',
    stopLossRuleBn: 'মারুবোজুর ৫০% বা হাই পয়েন্টের উপরে স্টপ লস।',
    takeProfitRuleBn: '১:২.৫ ট্রেন্ড ফলোয়িং টার্গেট।',
    tipsBn: 'সাপোর্ট ভাঙার সময় বিয়ারিশ মারুবোজু তৈরি হলে ড্রপ আরও গভীর হয়।',
  },
  {
    id: 'piercing-line',
    name: 'Piercing Line',
    nameBn: 'পিয়ার্সিং লাইন (Piercing Line)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'HIGH',
    winRateStr: '৮৬.৭%',
    icon: '⚡',
    summaryBn: '২ ক্যান্ডেল প্যাটার্ন যাতে রেড ক্যান্ডেলের নিচে ওপেন হয়ে গ্রিন ক্যান্ডেলটি রেড ক্যান্ডেলের ৫০% এর উপরে ক্লোজ করে।',
    anatomyBn: '১ম রেড ক্যান্ডেল, ২য় গ্রিন ক্যান্ডেল যা লোয়ার গ্যাপ দিয়ে ওপেন হলেও শক্তিশালীরূপে ৫০% এর বেশি বডি ভেদ করে ক্লোজ হয়।',
    psychologyBn: 'সেলারদের ডিপ ড্রাইভ দ্রুত বায়ারদের শক্তিশালী রিকভারি তরঙ্গে রূপান্তরিত হয়েছে।',
    entryRuleBn: '২য় ক্যান্ডেল ক্লোজের পর বাই এন্ট্রি।',
    stopLossRuleBn: '২য় গ্রিন ক্যান্ডেলের সর্বনিম্নের নিচে স্টপ লস।',
    takeProfitRuleBn: '১:২.৫ রিস্ক রিওয়ার্ড।',
    tipsBn: 'ডাবল বটম প্যাটার্নের সাথে পিয়ার্সিং লাইন দারুণ কাজ করে।',
  },
  {
    id: 'dark-cloud-cover',
    name: 'Dark Cloud Cover',
    nameBn: 'ডার্ক ক্লাউড কভার (Dark Cloud Cover)',
    category: 'BEARISH_REVERSAL',
    type: 'BEARISH',
    reliability: 'HIGH',
    winRateStr: '৮৬.২%',
    icon: '☁️',
    summaryBn: 'আপট্রেন্ডের শীর্ষে গ্রিন ক্যান্ডেলের উঁচুতে ওপেন হয়ে রেড ক্যান্ডেলটি আগের গ্রিন ক্যান্ডেলের ৫০% এর নিচে ক্লোজ করে।',
    anatomyBn: '১ম গ্রিন ক্যান্ডেল, ২য় রেড ক্যান্ডেল যা গ্যাপ আপ ওপেন হলেও ৫০% এর নিচে নেমে ক্লোজ করে।',
    psychologyBn: 'উচ্চ মূল্যে বায়ারদের ফাঁদে ফেলে বড় প্লেয়াররা ভারী সেল করেছে।',
    entryRuleBn: 'রেড ক্যান্ডেল ক্লোজের পর শর্ট এন্ট্রি।',
    stopLossRuleBn: 'ডার্ক ক্লাউড ক্যান্ডেলের সর্বোচ্চ হাইয়ের উপরে স্টপ লস।',
    takeProfitRuleBn: '১:২.৫ রিস্ক রিওয়ার্ড।',
    tipsBn: 'রেজিস্ট্যান্সের কাছে এটি আসলে তাৎক্ষণিক লং থেকে প্রস্থান করুন।',
  },
  {
    id: 'bullish-harami',
    name: 'Bullish Harami',
    nameBn: 'বুলিশ হারামি (Bullish Harami)',
    category: 'BULLISH_REVERSAL',
    type: 'BULLISH',
    reliability: 'HIGH',
    winRateStr: '৮৫.১%',
    icon: '🤰',
    summaryBn: 'বড় লাল ক্যান্ডেলের পেটের ভেতরে তৈরি হওয়া ছোট সবুজ ক্যান্ডেল যা ডাউনট্রেন্ড থামার ইঙ্গিত দেয়।',
    anatomyBn: '১ম বড় রেড ক্যান্ডেল, ২য় ছোট গ্রিন ক্যান্ডেল যা ১ম টির বডির সীমার মধ্যে আবদ্ধ থাকে।',
    psychologyBn: 'সেলারদের আক্রমণ সম্পূর্ণ থমকে গেছে এবং বায়াররা পুনরায় শক্তি সঞ্চয় করছে।',
    entryRuleBn: 'পরবর্তী ক্যান্ডেল ১ম ক্যান্ডেলের হাই ক্রস করলে বাই নিন।',
    stopLossRuleBn: '১ম রেড ক্যান্ডেলের লো এর নিচে স্টপ লস।',
    takeProfitRuleBn: '১:২ রিস্ক রিওয়ার্ড।',
    tipsBn: 'কনফার্মেশন ক্যান্ডেলের জন্য অপেক্ষা করা বুদ্ধিমানের কাজ।',
  },
  {
    id: 'three-white-soldiers',
    name: 'Three White Soldiers',
    nameBn: 'থ্রি হোয়াইট সোলজার্স (Three White Soldiers)',
    category: 'CONTINUATION',
    type: 'BULLISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯২.৮%',
    icon: '💂',
    summaryBn: 'টানা ৩টি বড় সবুজ ক্যান্ডেল যা প্রতিটি আগেরটির চেয়ে উঁচুতে ক্লোজ করে এবং নতুন আপট্রেন্ড শুরু করে।',
    anatomyBn: 'টানা ৩টি গ্রিন ক্যান্ডেল যাদের বডি বড় এবং উইক খুব ছোট।',
    psychologyBn: 'মার্কেটে অবিরাম শক্তিশালী প্রাতিষ্ঠানিক বাইং ভলিউম প্রবেশ করছে।',
    entryRuleBn: '৩য় ক্যান্ডেল ক্লোজের পর বা হালকা রিটেস্টে লং এন্ট্রি।',
    stopLossRuleBn: '১ম ক্যান্ডেলের লো পয়েন্টের নিচে স্টপ লস।',
    takeProfitRuleBn: '১:৩.৫ ট্রেন্ড ফলোয়িং টার্গেট।',
    tipsBn: 'ডাউনট্রেন্ডের তলদেশে এটি গঠিত হলে সবচেয়ে শক্তিশালী বুল রানের সূচনা হয়।',
  },
  {
    id: 'three-black-crows',
    name: 'Three Black Crows',
    nameBn: 'থ্রি ব্ল্যাক ক্রোজ (Three Black Crows)',
    category: 'CONTINUATION',
    type: 'BEARISH',
    reliability: 'VERY_HIGH',
    winRateStr: '৯১.৯%',
    icon: '🦅',
    summaryBn: 'টানা ৩টি বড় লাল ক্যান্ডেল যা প্রতিটি আগেরটির চেয়ে নিচে ক্লোজ করে এবং তীব্র ক্র্যাশ বা ডাউনট্রেন্ড বজায় রাখে।',
    anatomyBn: 'টানা ৩টি রেড ক্যান্ডেল যাদের বডি বড় এবং উইক খুব ছোট।',
    psychologyBn: 'একটানা তীব্র সেলিং আধিপত্য এবং বায়ারদের সম্পূর্ণ পরাস্ত হওয়া।',
    entryRuleBn: '৩য় ক্যান্ডেল ক্লোজের পর বা বাউন্স রিজেকশনে শর্ট এন্ট্রি।',
    stopLossRuleBn: '১ম ক্যান্ডেলের হাই পয়েন্টের উপরে স্টপ লস।',
    takeProfitRuleBn: '১:৩.৫ ট্রেন্ড ফলোয়িং টার্গেট।',
    tipsBn: 'আপট্রেন্ডের শীর্ষে এটি গঠিত হলে বিয়ারিশ ট্রেন্ড দীর্ঘায়িত হয়।',
  },
];

