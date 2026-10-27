// Trade Style Analyzer & User Profile Customizer for AI Council Pro
// Supports: Scalping, Day Trading, Swing Trading, Position Trading

export type TradeStyleMode = 'SCALPING' | 'DAY_TRADING' | 'SWING_TRADING' | 'POSITION_TRADING';

export interface TradeStyleConfig {
  id: TradeStyleMode;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  primaryTimeframe: string;
  secondaryTimeframe: string;
  confirmationTimeframe: string;
  holdingDurationBn: string;
  recommendedLeverageRange: string;
  maxRiskPerTradePcnt: number; // e.g. 1%, 2%
  defaultRiskRewardRatio: string; // e.g. 1:2
  stopLossDistancePcntRange: [number, number]; // [min%, max%]
  takeProfit1DistancePcntRange: [number, number];
  takeProfit2DistancePcntRange: [number, number];
  councilFocusPriorityBn: string;
  descriptionBn: string;
}

export type SlBufferMode = 'TIGHT' | 'SAFE_STRUCTURAL' | 'WIDE_CUSHION';

export interface SlBufferConfig {
  id: SlBufferMode;
  labelBn: string;
  multiplier: number;
  descriptionBn: string;
}

export const SL_BUFFER_PRESETS: Record<SlBufferMode, SlBufferConfig> = {
  TIGHT: {
    id: 'TIGHT',
    labelBn: 'টাইট (Aggressive)',
    multiplier: 0.9,
    descriptionBn: 'টাইট বাফার। শুধুমাত্র নিশ্চিত মোমেন্টাম ব্রেকআউটে কার্যকর।',
  },
  SAFE_STRUCTURAL: {
    id: 'SAFE_STRUCTURAL',
    labelBn: '🛡️ সাপোর্ট থেকে ২-৫% নিচে নিরাপদ (প্রস্তাবিত)',
    multiplier: 1.35,
    descriptionBn: 'কী-সাপোর্ট লেভেলের ৩.৫% নিচে নিরাপদ কাঠামোগত বাফার। সকালের উইক ও ফেকআউট লিকুইডিটি হান্ট প্রটেকশন।',
  },
  WIDE_CUSHION: {
    id: 'WIDE_CUSHION',
    labelBn: '🌊 অতিরিক্ত কুশন (Extra Safe)',
    multiplier: 1.75,
    descriptionBn: 'ভোলাটাইল ও হাই-অ্যাক্টিভিটি মার্কেটের জন্য সাপোর্ট থেকে ৫% নিচে সর্বোচ্চ দূরত্বের সুরক্ষাবলয়।',
  },
};

export const TRADE_STYLE_PRESETS: Record<TradeStyleMode, TradeStyleConfig> = {
  SCALPING: {
    id: 'SCALPING',
    nameBn: '⚡ স্ক্যাল্পিং (Scalping)',
    nameEn: 'Ultra-Fast Scalping',
    taglineBn: 'কয়েক মিনিট থেকে ১ ঘণ্টার মধ্যে দ্রুত প্রফিট বুকিং',
    primaryTimeframe: '5m',
    secondaryTimeframe: '1m',
    confirmationTimeframe: '15m',
    holdingDurationBn: '৫ মিনিট থেকে ১ ঘণ্টা',
    recommendedLeverageRange: '3x - 10x (কঠোর এসএল সহ)',
    maxRiskPerTradePcnt: 1.0,
    defaultRiskRewardRatio: '1:1.6 - 1:2.2',
    stopLossDistancePcntRange: [2.5, 4.0], // Safe buffer beyond spread & noise
    takeProfit1DistancePcntRange: [4.0, 6.8],
    takeProfit2DistancePcntRange: [6.8, 11.0],
    councilFocusPriorityBn: 'অর্ডারবুক লিকুইডিটি, ৫মি ভলিউম সার্জ এবং মাইক্রো সাপোর্ট রিজেকশন',
    descriptionBn: 'অতি দ্রুত মার্কেট সুইং ও ব্রেকআউটে ছোট মুভ ক্যাপচার করার জন্য তৈরি। এতে ওভারনাইট কোনো রিস্ক থাকে না।',
  },
  DAY_TRADING: {
    id: 'DAY_TRADING',
    nameBn: '☀️ ডে ট্রেডিং (Intraday)',
    nameEn: 'Intraday Trend & Reversal',
    taglineBn: 'দিনের ট্রেড দিনেই সমাপ্ত—ক্লিন ইন্ট্রাডে সেটআপ',
    primaryTimeframe: '15m',
    secondaryTimeframe: '1h',
    confirmationTimeframe: '4h',
    holdingDurationBn: '২ ঘণ্টা থেকে ৮ ঘণ্টা (একই সেশনে ক্লোজ)',
    recommendedLeverageRange: '2x - 5x',
    maxRiskPerTradePcnt: 1.5,
    defaultRiskRewardRatio: '1:2 - 1:3',
    stopLossDistancePcntRange: [4.2, 6.5], // Safe structural swing low distance (2-5% below support floor)
    takeProfit1DistancePcntRange: [7.0, 11.0],
    takeProfit2DistancePcntRange: [11.0, 18.0],
    councilFocusPriorityBn: 'ডেইলি ওপেন/ক্লোজ লেভেল, EMA-20/50 ইন্ট্রাডে ট্রেন্ড ও কী লিকুইডিটি পুল',
    descriptionBn: 'দৈনিক ট্রেন্ড ও রিভার্সাল ক্যাপচার করার জন্য সবচেয়ে ব্যালান্সড স্টাইল। সেশন শেষ হওয়ার আগেই প্রফিট সুরক্ষিত করা হয়।',
  },
  SWING_TRADING: {
    id: 'SWING_TRADING',
    nameBn: '🌊 সুইং ট্রেডিং (Swing Trading)',
    nameEn: 'Multi-Day Swing Expansion',
    taglineBn: 'বড় সাপোর্ট ও রেজিস্ট্যান্স সুইং ক্যাপচার (২ থেকে ৭ দিন)',
    primaryTimeframe: '4h',
    secondaryTimeframe: '1h',
    confirmationTimeframe: '1D',
    holdingDurationBn: '২ দিন থেকে ৭ দিন',
    recommendedLeverageRange: '1x - 3x (বা স্পট ট্রেডিং)',
    maxRiskPerTradePcnt: 2.0,
    defaultRiskRewardRatio: '1:3 - 1:4.5',
    stopLossDistancePcntRange: [5.5, 9.0], // Beyond multi-day swing lows
    takeProfit1DistancePcntRange: [11.0, 18.0],
    takeProfit2DistancePcntRange: [18.0, 32.0],
    councilFocusPriorityBn: '৪-ঘণ্টা মার্কেট স্ট্রাকচার ব্রেক (MSB), ডেইলি কী সাপোর্ট ও ম্যাক্রো ক্যাটালিস্ট',
    descriptionBn: 'নয়েজ মুক্ত বড় মুভমেন্টের জন্য উপযুক্ত। কম ট্রেড কিন্তু প্রতি ট্রেডে সর্বোচ্চ প্রফিট পটেনশিয়াল নিশ্চিত করে।',
  },
  POSITION_TRADING: {
    id: 'POSITION_TRADING',
    nameBn: '🏛️ পজিশন ট্রেডিং (Position / Macro)',
    nameEn: 'Macro Position & Spot Investment',
    taglineBn: 'কয়েক সপ্তাহ থেকে মাসের দীর্ঘমেয়াদী ম্যাক্রো র্যালি',
    primaryTimeframe: '1D',
    secondaryTimeframe: '4h',
    confirmationTimeframe: '1W',
    holdingDurationBn: '২ সপ্তাহ থেকে কয়েক মাস',
    recommendedLeverageRange: 'স্পট (Spot) অথবা 1x - 2x',
    maxRiskPerTradePcnt: 3.0,
    defaultRiskRewardRatio: '1:4 - 1:6+',
    stopLossDistancePcntRange: [10.0, 18.0],
    takeProfit1DistancePcntRange: [22.0, 45.0],
    takeProfit2DistancePcntRange: [45.0, 80.0],
    councilFocusPriorityBn: 'ম্যাক্রো ইকোনমিক সাইকেল, সেন্ট্রাল ব্যাংক পলিসি এবং উইকলি ডিমান্ড জোন',
    descriptionBn: 'দীর্ঘমেয়াদী ট্রেন্ড রাইডারদের জন্য। ঘন ঘন চার্ট দেখার প্রয়োজন নেই, সাইক্লিকাল বটম ও টপে ট্রেড পরিচালিত হয়।',
  },
};

export interface UserTradeProfile {
  activeStyle: TradeStyleMode;
  slBufferMode?: SlBufferMode;
  userRiskTolerancePcnt: number; // 0.5% - 5.0%
  preferredLeverage: number; // 1 - 10
  autoAdjustTargetsByStyle: boolean;
  notifyOnStyleViolation: boolean;
}

const STORAGE_KEY = 'ai_council_trade_style_profile';

export class TradeStyleAnalyzerService {
  /**
   * Get user trade profile from storage or defaults
   */
  public static getUserProfile(): UserTradeProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.activeStyle && TRADE_STYLE_PRESETS[parsed.activeStyle as TradeStyleMode]) {
          return {
            ...parsed,
            slBufferMode: parsed.slBufferMode || 'SAFE_STRUCTURAL',
          };
        }
      }
    } catch (e) {}

    // Default: Day Trading with Safe Structural SL buffer
    return {
      activeStyle: 'DAY_TRADING',
      slBufferMode: 'SAFE_STRUCTURAL',
      userRiskTolerancePcnt: 1.5,
      preferredLeverage: 3,
      autoAdjustTargetsByStyle: true,
      notifyOnStyleViolation: true,
    };
  }

  /**
   * Save updated profile
   */
  public static saveUserProfile(profile: UserTradeProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {}
  }

  /**
   * Get style config
   */
  public static getStyleConfig(style: TradeStyleMode): TradeStyleConfig {
    return TRADE_STYLE_PRESETS[style] || TRADE_STYLE_PRESETS.DAY_TRADING;
  }

  /**
   * Adapt raw trade parameters (Price, Target, SL) dynamically based on user's active trade style
   * and optional SL buffer mode (Tight, Safe Structural, or Wide Cushion)
   */
  public static adaptTradeParameters(
    currentPrice: number,
    bias: 'BUY' | 'SELL' | 'NEUTRAL',
    style: TradeStyleMode,
    slBufferMode: SlBufferMode = 'SAFE_STRUCTURAL'
  ): {
    entryZone: [number, number];
    stopLoss: number;
    stopLossDistancePcnt: number;
    takeProfit1: number;
    takeProfit2: number;
    takeProfit3: number;
    riskRewardRatio: string;
    recommendedLeverage: string;
    timeframe: string;
    slBufferMode: SlBufferMode;
  } {
    const cfg = this.getStyleConfig(style);
    const isLong = bias !== 'SELL';
    const bufferConfig = SL_BUFFER_PRESETS[slBufferMode] || SL_BUFFER_PRESETS.SAFE_STRUCTURAL;
    const multiplier = bufferConfig.multiplier;

    // Base SL range midpoint scaled by buffer multiplier
    const baseSlMid = (cfg.stopLossDistancePcntRange[0] + cfg.stopLossDistancePcntRange[1]) / 2 / 100;
    const slMid = baseSlMid * multiplier;

    // Scale targets so healthy Risk-to-Reward ratio (1:2 - 1:3) is preserved even with wider SL
    const tpScale = multiplier > 1 ? multiplier * 0.95 : 1;
    const tp1Mid = ((cfg.takeProfit1DistancePcntRange[0] + cfg.takeProfit1DistancePcntRange[1]) / 2 / 100) * tpScale;
    const tp2Mid = ((cfg.takeProfit2DistancePcntRange[0] + cfg.takeProfit2DistancePcntRange[1]) / 2 / 100) * tpScale;
    const tp3Mid = tp2Mid * 1.5;

    // Entry zone buffer
    const entryBuffer = slMid * 0.2;
    const entryLow = isLong ? currentPrice * (1 - entryBuffer) : currentPrice;
    const entryHigh = isLong ? currentPrice : currentPrice * (1 + entryBuffer);

    // Stop Loss & Targets
    const stopLoss = isLong ? currentPrice * (1 - slMid) : currentPrice * (1 + slMid);
    const takeProfit1 = isLong ? currentPrice * (1 + tp1Mid) : currentPrice * (1 - tp1Mid);
    const takeProfit2 = isLong ? currentPrice * (1 + tp2Mid) : currentPrice * (1 - tp2Mid);
    const takeProfit3 = isLong ? currentPrice * (1 + tp3Mid) : currentPrice * (1 - tp3Mid);

    return {
      entryZone: [entryLow, entryHigh],
      stopLoss,
      stopLossDistancePcnt: slMid * 100,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      riskRewardRatio: cfg.defaultRiskRewardRatio,
      recommendedLeverage: cfg.recommendedLeverageRange,
      timeframe: cfg.primaryTimeframe,
      slBufferMode,
    };
  }
}
