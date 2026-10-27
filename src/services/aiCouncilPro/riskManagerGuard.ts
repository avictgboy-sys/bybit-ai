// Risk Manager Guard & Drawdown Shield Engine for AI Council Pro
// Enforces mathematical position sizing, R:R thresholds, liquidation distance, and drawdown circuit breakers.

export type RiskVerdictStatus = 'PASSED_APPROVED' | 'WARNING_ADJUST_SL' | 'REJECTED_LOW_RR' | 'REJECTED_OVERLEVERAGED' | 'HALTED_DAILY_DRAWDOWN';

export interface UserRiskProfile {
  accountBalanceUsd: number;
  riskPerTradePcnt: number; // e.g. 1.0, 1.5, 2.0%
  maxDailyDrawdownPcnt: number; // e.g. 3.0%, 5.0%
  currentDailyLossUsd: number;
  consecutiveLosses: number;
  isDrawdownHalted: boolean;
  preferredMarginMode: 'ISOLATED' | 'CROSS';
}

export interface PositionCalculationResult {
  accountBalanceUsd: number;
  dollarRisk: number; // Amount lost if SL hit
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  slDistancePcnt: number;
  tpDistancePcnt: number;
  riskRewardRatioNumber: number; // e.g. 2.4
  riskRewardRatioLabel: string; // e.g. "1:2.4"
  recommendedPositionSizeUsd: number;
  positionQuantity: number; // Units of asset
  requiredMarginUsd: number;
  leverage: number;
  maxSafeLeverage: number;
  estimatedLiquidationPrice: number;
  liquidationBufferPcnt: number; // Distance between SL and Liquidation
  isLiquidationSafe: boolean; // SL hit before Liquidation?
  status: RiskVerdictStatus;
  verdictTitleBn: string;
  verdictMessageBn: string;
  actionChecklistBn: string[];
}

const RISK_STORAGE_KEY = 'ai_council_risk_manager_profile';

export class RiskManagerGuardService {
  /**
   * Get user risk profile
   */
  public static getUserRiskProfile(): UserRiskProfile {
    try {
      const saved = localStorage.getItem(RISK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.accountBalanceUsd === 'number') {
          return parsed;
        }
      }
    } catch (e) {}

    return {
      accountBalanceUsd: 1000,
      riskPerTradePcnt: 1.5,
      maxDailyDrawdownPcnt: 4.0,
      currentDailyLossUsd: 0,
      consecutiveLosses: 0,
      isDrawdownHalted: false,
      preferredMarginMode: 'ISOLATED',
    };
  }

  /**
   * Save user risk profile
   */
  public static saveUserRiskProfile(profile: UserRiskProfile): void {
    try {
      localStorage.setItem(RISK_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {}
  }

  /**
   * Calculate exact position sizing, R:R and liquidation safety
   */
  public static auditTradeRisk(params: {
    accountBalanceUsd: number;
    riskPerTradePcnt: number;
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    leverage?: number;
    isLong?: boolean;
  }): PositionCalculationResult {
    const {
      accountBalanceUsd,
      riskPerTradePcnt,
      entryPrice,
      stopLossPrice,
      takeProfitPrice,
      leverage = 3,
      isLong = entryPrice >= stopLossPrice,
    } = params;

    const safeBalance = Math.max(10, accountBalanceUsd);
    const safeEntry = Math.max(0.000001, entryPrice);
    const safeSL = Math.max(0.000001, stopLossPrice);
    const safeTP = Math.max(0.000001, takeProfitPrice);

    // 1. Calculate Dollar Risk (Capital at risk)
    const dollarRisk = (safeBalance * riskPerTradePcnt) / 100;

    // 2. SL Distance
    const slPriceDiff = Math.abs(safeEntry - safeSL);
    const slDistancePcnt = (slPriceDiff / safeEntry) * 100;

    // 3. TP Distance & R:R
    const tpPriceDiff = Math.abs(safeTP - safeEntry);
    const tpDistancePcnt = (tpPriceDiff / safeEntry) * 100;
    const rrr = slDistancePcnt > 0 ? tpDistancePcnt / slDistancePcnt : 0;
    const rrrRounded = Math.round(rrr * 10) / 10;
    const riskRewardRatioLabel = `1:${rrrRounded.toFixed(1)}`;

    // 4. Exact Position Size ($ and units)
    // Position Size = Dollar Risk / (slDistancePcnt / 100)
    const positionSizeUsd = slDistancePcnt > 0 ? dollarRisk / (slDistancePcnt / 100) : 0;
    const positionQuantity = safeEntry > 0 ? positionSizeUsd / safeEntry : 0;
    const requiredMarginUsd = leverage > 0 ? positionSizeUsd / leverage : positionSizeUsd;

    // 5. Maximum Safe Leverage calculation (ensures maintenance margin buffer)
    // If SL is 2%, max theoretical leverage before SL touches Liq is 100 / 2 = 50x.
    // Safe institutional rule: Max leverage <= 0.65 / SL distance
    const maxSafeLeverage = Math.max(1, Math.min(25, Math.floor(65 / Math.max(0.5, slDistancePcnt))));

    // 6. Estimated Liquidation Price (Isolated Margin)
    // For Long: Entry * (1 - (1/leverage) + 0.005 maintenance margin)
    // For Short: Entry * (1 + (1/leverage) - 0.005)
    let estimatedLiquidationPrice: number;
    if (isLong) {
      estimatedLiquidationPrice = safeEntry * (1 - 1 / leverage + 0.005);
    } else {
      estimatedLiquidationPrice = safeEntry * (1 + 1 / leverage - 0.005);
    }

    // Liquidation Buffer: Check if SL is hit comfortably before Liquidation
    let isLiquidationSafe = false;
    let liquidationBufferPcnt = 0;
    if (isLong) {
      isLiquidationSafe = safeSL > estimatedLiquidationPrice;
      liquidationBufferPcnt = safeSL > 0 ? ((safeSL - estimatedLiquidationPrice) / safeSL) * 100 : 0;
    } else {
      isLiquidationSafe = safeSL < estimatedLiquidationPrice;
      liquidationBufferPcnt = safeSL > 0 ? ((estimatedLiquidationPrice - safeSL) / safeSL) * 100 : 0;
    }

    // 7. Audit Status & Directives
    let status: RiskVerdictStatus = 'PASSED_APPROVED';
    let verdictTitleBn = 'ট্রেড অনুমোদিত (Risk Approved)';
    let verdictMessageBn = `স্টপ লস কাঠামোগতভাবে নিরাপদ। ঝুঁকি ও পজিশন সাইজ প্রাতিষ্ঠানিক মানদণ্ডে শতভাগ উত্তীর্ণ।`;
    const actionChecklistBn: string[] = [];

    if (rrrRounded < 1.5) {
      status = 'REJECTED_LOW_RR';
      verdictTitleBn = 'রিজেক্টেড: অপর্যাপ্ত রিস্ক-রিওয়ার্ড (Low R:R)';
      verdictMessageBn = `বর্তমান R:R ${riskRewardRatioLabel} যা প্রাতিষ্ঠানিক ন্যূনতম মানদণ্ড (১:১.৫)-এর নিচে। টেক প্রফিট বাড়ান অথবা এন্ট্রি আরও অনুকূল লেভেলে নিন।`;
      actionChecklistBn.push('❌ R:R ১:১.৫ এর নিচে হওয়ায় ট্রেড নেওয়া ঝুঁকিপূর্ণ');
    } else {
      actionChecklistBn.push(`✅ স্বাস্থ্যকর রিস্ক-রিওয়ার্ড অনুপাত (${riskRewardRatioLabel})`);
    }

    if (!isLiquidationSafe) {
      status = 'REJECTED_OVERLEVERAGED';
      verdictTitleBn = 'বিপদজনক লেভারেজ: লিকুইডেশন স্টপ লসের ভেতরে!';
      verdictMessageBn = `আপনার সিলেক্টেড লেভারেজ (${leverage}x)-এর কারণে লিকুইডেশন প্রাইস ($${estimatedLiquidationPrice.toFixed(2)}) স্টপ লসের আগেই হিট হবে! অবিলম্বে লেভারেজ কমিয়ে ${maxSafeLeverage}x বা তার নিচে রাখুন।`;
      actionChecklistBn.push(`🚨 লেভারেজ অবিলম্বে ${maxSafeLeverage}x বা তার নিচে নামান`);
    } else if (leverage > maxSafeLeverage) {
      status = 'WARNING_ADJUST_SL';
      verdictTitleBn = 'সতর্কতা: হাই লেভারেজ ওয়ার্নিং';
      verdictMessageBn = `বর্তমান লেভারেজ অনুমোদিত সীমার শীর্ষে। নিরাপদ ট্রেডিংয়ের জন্য ${maxSafeLeverage}x লেভারেজ ব্যবহার করুন।`;
      actionChecklistBn.push(`⚠️ প্রস্তাবিত সর্বোচ্চ নিরাপদ লেভারেজ: ${maxSafeLeverage}x`);
    } else {
      actionChecklistBn.push(`✅ লেভারেজ নিরাপদ (${leverage}x <= সর্বোচ্চ ${maxSafeLeverage}x)`);
    }

    if (slDistancePcnt < 0.25) {
      actionChecklistBn.push('⚠️ স্টপ লস অতিরিক্ত কাছে (Noise Hunt Risk); সামান্য স্প্রেডেই ট্রিগার হতে পারে');
    } else {
      actionChecklistBn.push(`✅ স্টপ লস দূরত্ব যৌক্তিক (${slDistancePcnt.toFixed(2)}%)`);
    }

    actionChecklistBn.push(`🛡️ সর্বোচ্চ ডলার ঝুঁকি: $${dollarRisk.toFixed(2)} (${riskPerTradePcnt}% of $${safeBalance})`);
    actionChecklistBn.push(`💼 রিকমেন্ডেড মার্জিন অ্যালোকেশন: $${requiredMarginUsd.toFixed(2)}`);

    return {
      accountBalanceUsd: safeBalance,
      dollarRisk,
      entryPrice: safeEntry,
      stopLossPrice: safeSL,
      takeProfitPrice: safeTP,
      slDistancePcnt,
      tpDistancePcnt,
      riskRewardRatioNumber: rrrRounded,
      riskRewardRatioLabel,
      recommendedPositionSizeUsd: positionSizeUsd,
      positionQuantity,
      requiredMarginUsd,
      leverage,
      maxSafeLeverage,
      estimatedLiquidationPrice,
      liquidationBufferPcnt,
      isLiquidationSafe,
      status,
      verdictTitleBn,
      verdictMessageBn,
      actionChecklistBn,
    };
  }
}
