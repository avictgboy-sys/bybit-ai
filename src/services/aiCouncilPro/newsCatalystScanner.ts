// News & Catalyst Scanner Engine for AI Council Pro
// Scans breaking macro events, ETF flows, token unlocks, regulatory shifts, and coin-specific catalysts

export type CatalystImpact = 'CRITICAL' | 'HIGH' | 'MEDIUM';
export type CatalystSentiment = 'ULTRA_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'HIGH_RISK_DUMP';

export interface NewsCatalystItem {
  id: string;
  title: string;
  titleBn: string;
  summaryBn: string;
  symbol: string; // e.g. 'BTCUSDT', 'ETHUSDT', 'XAU/USD', 'SOLUSDT', 'GLOBAL'
  impact: CatalystImpact;
  sentiment: CatalystSentiment;
  catalystScore: number; // 0 - 100
  category:
    | 'MACRO_ECONOMY'
    | 'ETF_FLOW'
    | 'TOKEN_UNLOCK'
    | 'REGULATORY'
    | 'WHALE_ACCUMULATION'
    | 'ECOSYSTEM_UPGRADE'
    | 'GEOPOLITICAL_GOLD';
  categoryLabelBn: string;
  publishedTime: string;
  source: string;
  tradingDirective: string;
  tradingDirectiveBn: string;
  affectedSymbols: string[];
}

export const INITIAL_NEWS_CATALYSTS: NewsCatalystItem[] = [
  {
    id: 'cat-btc-etf-inflow',
    title: 'Institutional Spot Bitcoin ETFs Record Over $480M Single-Day Net Inflow',
    titleBn: 'ইউএস স্পট বিটকয়েন ইটিএফ-এ একদিনেই $৪৮০ মিলিয়নেরও বেশি নতুন প্রাতিষ্ঠানিক ক্যাপিটাল ইনফ্লো',
    summaryBn: 'ব্ল্যাকরক এবং ফিডেলিটির ইটিএফ-এ ধারাবাহিক ভলিউম বৃদ্ধি প্রাতিষ্ঠানিক আস্থার স্পষ্ট প্রমাণ। এটি ক্রিপ্টো মার্কেটে স্ট্রং বেস সাপোর্ট তৈরি করছে।',
    symbol: 'BTCUSDT',
    impact: 'CRITICAL',
    sentiment: 'ULTRA_BULLISH',
    catalystScore: 95,
    category: 'ETF_FLOW',
    categoryLabelBn: '🏦 ইটিএফ ও প্রাতিষ্ঠানিক ফান্ড',
    publishedTime: '১৫ মিনিট আগে',
    source: 'Bloomberg Terminal / Farside Investors',
    tradingDirective: 'Bullish Continuation on Intraday Retest',
    tradingDirectiveBn: 'ইন্ট্রাডে পুলব্যাকে স্ট্রং বুলিশ কন্টিনিউয়েশন বাই সেটআপ কার্যকর।',
    affectedSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'],
  },
  {
    id: 'cat-gold-geopolitical',
    title: 'Central Banks Accelerate Physical Gold Purchases Amid Global De-dollarization & Geopolitical Tension',
    titleBn: 'বিশ্বব্যাপী ডি-ডলারাইজেশন ও ভূরাজনৈতিক উত্তেজনায় সেন্ট্রাল ব্যাংকগুলোর গোল্ড রিজার্ভ বৃদ্ধি রেকর্ড উচ্চতায়',
    summaryBn: 'চীনের পিপলস ব্যাংকসহ বিশ্বজুড়ে কেন্দ্রীয় ব্যাংকগুলোর ফিজিক্যাল গোল্ড কেনা বৃদ্ধি স্পট গোল্ডের (XAU/USD) দীর্ঘমেয়াদী বুলিশ ট্র্যাক অক্ষুণ্ণ রেখেছে।',
    symbol: 'XAU/USD',
    impact: 'CRITICAL',
    sentiment: 'ULTRA_BULLISH',
    catalystScore: 92,
    category: 'GEOPOLITICAL_GOLD',
    categoryLabelBn: '👑 সেন্ট্রাল ব্যাংক ও গোল্ড ম্যাক্রো',
    publishedTime: '৩৫ মিনিট আগে',
    source: 'World Gold Council / Reuters Macro',
    tradingDirective: 'Long Gold on Dips Above Support',
    tradingDirectiveBn: 'কী সাপোর্ট জোনে গোল্ডে (XAU/USD) ডিপ বাই এবং হেজিং স্ট্র্যাটেজি অগ্রাধিকার দিন।',
    affectedSymbols: ['XAU/USD', 'BTCUSDT', 'EUR/USD'],
  },
  {
    id: 'cat-eth-pectra-upgrade',
    title: 'Ethereum Pectra Upgrade Enters Final Testnet Deployment with Account Abstraction Features',
    titleBn: 'ইথেরিয়াম পেকট্রা (Pectra) আপগ্রেড চূড়ান্ত টেস্টনেটে প্রবেশ—গ্যাস অপ্টিমাইজেশন ও অ্যাকাউন্ট অ্যাবস্ট্রাকশন সক্রিয়',
    summaryBn: 'পেকট্রা আপগ্রেডের মাধ্যমে স্মার্ট কন্ট্রাক্ট ওয়ালেট এবং ভ্যালিডেটর লিমিট বৃদ্ধি পাওয়ায় নেটওয়ার্ক ইউটিলিটি উল্লেখযোগ্যভাবে বৃদ্ধি পাবে।',
    symbol: 'ETHUSDT',
    impact: 'HIGH',
    sentiment: 'BULLISH',
    catalystScore: 86,
    category: 'ECOSYSTEM_UPGRADE',
    categoryLabelBn: '⚡ প্রোটোকল ও ইকোসিস্টেম আপগ্রেড',
    publishedTime: '১ ঘণ্টা আগে',
    source: 'Ethereum Foundation Tech Briefing',
    tradingDirective: 'Accumulate Near Major EMAs',
    tradingDirectiveBn: 'ডেইলি EMA-50 ও EMA-20 এর নিকটে অ্যাকুমুলেশন পজিশন পর্যবেক্ষণ করুন।',
    affectedSymbols: ['ETHUSDT', 'LDOUSDT', 'OPUSDT', 'ARBUSDT'],
  },
  {
    id: 'cat-sol-dex-volume',
    title: 'Solana DEX 24h Trading Volume Surpasses All Competitors Led by Stablecoin Inflows',
    titleBn: 'সোলোনা ডেক্স ভলিউম সব রেকর্ড অতিক্রম করে শীর্ষে—স্টেবলকয়েন ও মেমকয়েন লিকুইডিটি বিস্ফোরণ',
    summaryBn: 'সোলোনা নেটওয়ার্কে দৈনিক অ্যাক্টিভ ওয়ালেট ও ট্রান্সফার ফি জেনারেশন শীর্ষ অবস্থান ধরে রেখেছে, যা SOL টোকেনের তাৎক্ষণিক স্পট চাহিদা বৃদ্ধি করছে।',
    symbol: 'SOLUSDT',
    impact: 'HIGH',
    sentiment: 'BULLISH',
    catalystScore: 89,
    category: 'WHALE_ACCUMULATION',
    categoryLabelBn: '🌊 চেইন অ্যাক্টিভিটি ও ভলিউম সার্জ',
    publishedTime: '২ ঘণ্টা আগে',
    source: 'DeFiLlama On-chain Intelligence',
    tradingDirective: 'Breakout Momentum Scalp',
    tradingDirectiveBn: 'লোয়ার টাইমফ্রেম কনসোলিডেশন ব্রেকআউটে স্ক্যাল্প ও সুইং লং সেটআপ।',
    affectedSymbols: ['SOLUSDT', 'JTOUSDT', 'RAYUSDT', 'JUPUSDT'],
  },
  {
    id: 'cat-fed-rate-cut-forecast',
    title: 'Fed Minutes Signal Balanced Inflation Data With Higher Probability of Yield Reductions',
    titleBn: 'ফেড মিনিটস ও মুদ্রাস্ফীতি সূচকে ভারসাম্য—সুদের হার কমানোর সম্ভাবনা শক্তিশালী',
    summaryBn: 'বন্ড ইয়েল্ড এবং ইউএস ডলার ইনডেক্স (DXY) চাপ মুখে থাকায় গ্লোবাল রিস্ক-অন অ্যাসেট (ক্রিপ্টো ও গোল্ড)-এর জন্য অনুকূল লিকুইডিটি পরিবেশ তৈরি হচ্ছে।',
    symbol: 'GLOBAL',
    impact: 'HIGH',
    sentiment: 'BULLISH',
    catalystScore: 84,
    category: 'MACRO_ECONOMY',
    categoryLabelBn: '🏛️ ফেড সুদের হার ও ম্যাক্রো অর্থনীতি',
    publishedTime: '৩ ঘণ্টা আগে',
    source: 'Federal Reserve Open Market Committee / WSJ',
    tradingDirective: 'Risk-On Asset Expansion',
    tradingDirectiveBn: 'ডলার ইনডেক্স উইকনেসে ক্রিপ্টো ও গোল্ডে পজিটিভ এক্সপোজার বজায় রাখুন।',
    affectedSymbols: ['BTCUSDT', 'XAU/USD', 'EUR/USD', 'ETHUSDT'],
  },
  {
    id: 'cat-major-unlock-warning',
    title: 'Upcoming Cliff Token Unlocks Scheduled Over Next 72 Hours for High-FDV Layer-1/2s',
    titleBn: 'আগামী ৭২ ঘণ্টায় একাধিক হাই-FDV অল্টকয়েনে বিশাল টোকেন আনলক—সেল প্রেসার অ্যালার্ট',
    summaryBn: 'প্রাতিষ্ঠানিক ও ভিসিদের আনলক প্রেসারের কারণে শর্ট-টার্ম লিকুইডিটি পুলে ডাম্প রিস্ক তৈরি হতে পারে। ব্রেকআউটে অতিরিক্ত ফোমো এড়িয়ে চলুন।',
    symbol: 'SUIUSDT',
    impact: 'MEDIUM',
    sentiment: 'BEARISH',
    catalystScore: 72,
    category: 'TOKEN_UNLOCK',
    categoryLabelBn: '⏳ টোকেন আনলক ও সাপ্লাই ইনফ্লো',
    publishedTime: '৪ ঘণ্টা আগে',
    source: 'TokenUnlocks App Data Radar',
    tradingDirective: 'Wait For Support Test / Short Hedges',
    tradingDirectiveBn: 'আনলকের আগে হাই লেভারেজ লং এড়িয়ে চলুন, সাপোর্ট কনফার্মেশনের জন্য অপেক্ষা করুন।',
    affectedSymbols: ['SUIUSDT', 'APTUSDT', 'OPUSDT'],
  },
];

export class NewsCatalystScannerService {
  private static catalysts: NewsCatalystItem[] = [...INITIAL_NEWS_CATALYSTS];

  /**
   * Get all active news catalysts
   */
  public static getAllCatalysts(): NewsCatalystItem[] {
    return this.catalysts;
  }

  /**
   * Get catalysts relevant to a specific coin symbol
   */
  public static getCatalystsForSymbol(symbol: string): NewsCatalystItem[] {
    const cleanSym = symbol.toUpperCase().trim();
    return this.catalysts.filter((cat) => {
      if (cat.symbol === cleanSym) return true;
      if (cat.affectedSymbols && cat.affectedSymbols.includes(cleanSym)) return true;
      if (cat.symbol === 'GLOBAL') return true;
      return false;
    });
  }

  /**
   * Calculate aggregate sentiment score (-100 to +100) for an asset based on catalysts
   */
  public static getSentimentAnalysis(symbol: string): {
    score: number;
    overallSentiment: CatalystSentiment;
    sentimentLabelBn: string;
    criticalNewsCount: number;
    catalysts: NewsCatalystItem[];
  } {
    const relevant = this.getCatalystsForSymbol(symbol);
    if (relevant.length === 0) {
      return {
        score: 10,
        overallSentiment: 'NEUTRAL',
        sentimentLabelBn: 'নিউট্রাল (কোনো বড় ব্রেকিং নিউজ নেই)',
        criticalNewsCount: 0,
        catalysts: [],
      };
    }

    let netPoints = 0;
    let criticalCount = 0;

    relevant.forEach((cat) => {
      const weight = cat.impact === 'CRITICAL' ? 1.5 : cat.impact === 'HIGH' ? 1.0 : 0.6;
      if (cat.impact === 'CRITICAL') criticalCount++;

      switch (cat.sentiment) {
        case 'ULTRA_BULLISH':
          netPoints += 30 * weight;
          break;
        case 'BULLISH':
          netPoints += 18 * weight;
          break;
        case 'NEUTRAL':
          netPoints += 0;
          break;
        case 'BEARISH':
          netPoints -= 18 * weight;
          break;
        case 'HIGH_RISK_DUMP':
          netPoints -= 35 * weight;
          break;
      }
    });

    const normalizedScore = Math.max(-100, Math.min(100, Math.round(netPoints)));

    let overallSentiment: CatalystSentiment = 'NEUTRAL';
    let sentimentLabelBn = 'নিউট্রাল';

    if (normalizedScore >= 45) {
      overallSentiment = 'ULTRA_BULLISH';
      sentimentLabelBn = '🔥 অতিমাত্রায় বুলিশ সেন্টিমেন্ট (Ultra Bullish)';
    } else if (normalizedScore >= 15) {
      overallSentiment = 'BULLISH';
      sentimentLabelBn = '🟢 সামগ্রিক বুলিশ সেন্টিমেন্ট (Bullish)';
    } else if (normalizedScore <= -35) {
      overallSentiment = 'HIGH_RISK_DUMP';
      sentimentLabelBn = '🚨 হাই রিস্ক ডাম্প প্রেসার (Risk Off)';
    } else if (normalizedScore < -10) {
      overallSentiment = 'BEARISH';
      sentimentLabelBn = '🔴 বিয়ারিশ সেন্টিমেন্ট (Bearish)';
    } else {
      overallSentiment = 'NEUTRAL';
      sentimentLabelBn = '⚖️ ব্যালান্সড / নিউট্রাল মার্কেট সেন্টিমেন্ট';
    }

    return {
      score: normalizedScore,
      overallSentiment,
      sentimentLabelBn,
      criticalNewsCount: criticalCount,
      catalysts: relevant,
    };
  }
}
