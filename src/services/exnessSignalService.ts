export interface ExnessSignal {
  id: string;
  symbol: string;
  name: string;
  category: 'GOLD' | 'FOREX' | 'INDICES' | 'CRYPTO_CFD';
  timeframe: 'M5' | 'M15' | 'H1' | 'H4' | 'D1';
  type: 'STRONG_BUY' | 'BUY' | 'STRONG_SELL' | 'SELL' | 'WAIT';
  currentPrice: number;
  entryZone: [number, number];
  tp1: number;
  tp2: number;
  tp3: number;
  stopLoss: number;
  pipTarget: number;
  pipRisk: number;
  riskReward: string;
  winRate: number; // 85-96%
  status: 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'TP3_HIT' | 'SL_HIT' | 'EXPIRED';
  leverage: string; // e.g. "1:Unlimited" or "1:500"
  analysisBangla: string;
  strategyMethod?: 'EMA_50_100_200_RSI_BB' | string;
  levelCalculations?: {
    entryReason: string;
    slReason: string;
    tp1Reason: string;
    tp2Reason: string;
    tp3Reason: string;
    ema50: number;
    ema100: number;
    ema200: number;
    bbUpper: number;
    bbMiddle: number;
    bbLower: number;
    rsi: number;
  };
  indicators: {
    rsi: number;
    trend: 'BULLISH' | 'BEARISH' | 'RANGING';
    emaConfluence: string;
    support: number;
    resistance: number;
  };
  recommendedLotSize100Usd: string;
  timestamp: number;
  author: string;
}

export interface ExnessMarketSession {
  name: string;
  city: string;
  bdStartTime: string;
  bdEndTime: string;
  startHourBD: number;
  endHourBD: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  bestPairs: string[];
  descriptionBangla: string;
}

export const EXNESS_SESSIONS: ExnessMarketSession[] = [
  {
    name: 'Sydney Session (সিডনি)',
    city: 'Sydney, Australia',
    bdStartTime: 'ভোর ৪:০০ AM',
    bdEndTime: 'দুপুর ১:০০ PM',
    startHourBD: 4,
    endHourBD: 13,
    volatility: 'LOW',
    bestPairs: ['AUD/USD', 'NZD/USD', 'AUD/JPY'],
    descriptionBangla: 'শান্ত মার্কেট, ছোট স্কেল্পিং ও রেঞ্জ বাউন্ড ট্রেডের জন্য উপযোগী।',
  },
  {
    name: 'Tokyo / Asian Session (টোকিও)',
    city: 'Tokyo, Japan',
    bdStartTime: 'সকাল ৬:০০ AM',
    bdEndTime: 'দুপুর ৩:০০ PM',
    startHourBD: 6,
    endHourBD: 15,
    volatility: 'MEDIUM',
    bestPairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY', 'AUD/USD'],
    descriptionBangla: 'JPY পেয়ারগুলোতে মুভমেন্ট বেশি থাকে। ব্রেকআউটের জন্য অপেক্ষা করুন।',
  },
  {
    name: 'London Session (লন্ডন ইউরোপ)',
    city: 'London, UK',
    bdStartTime: 'দুপুর ১:০০ PM',
    bdEndTime: 'রাত ১০:০০ PM',
    startHourBD: 13,
    endHourBD: 22,
    volatility: 'EXTREME',
    bestPairs: ['XAU/USD (Gold)', 'GBP/USD', 'EUR/USD', 'EUR/GBP'],
    descriptionBangla: '🔥 গোল্ড ও ইউরোপীয় পেয়ারে বিশাল লিকুইডিটি ও ট্রেন্ড ব্রেকআউট ঘটে।',
  },
  {
    name: 'New York Session (নিউ ইয়র্ক US)',
    city: 'New York, USA',
    bdStartTime: 'সন্ধ্যা ৬:০০ PM',
    bdEndTime: 'রাত ৩:০০ AM',
    startHourBD: 18,
    endHourBD: 3, // next day 3 AM
    volatility: 'EXTREME',
    bestPairs: ['XAU/USD (Gold)', 'US30', 'NAS100', 'EUR/USD', 'BTC/USD'],
    descriptionBangla: '🚀 সবচেয়ে বেশি ভোলাটাইল! US News (CPI, NFP, FOMC) ও গোল্ডের বিশাল মুভমেন্ট।',
  },
];

export const INITIAL_EXNESS_SIGNALS: ExnessSignal[] = [
  {
    id: 'ex-gold-01',
    symbol: 'XAU/USD',
    name: 'Gold Spot (স্বর্ণ XAU/USD)',
    category: 'GOLD',
    timeframe: 'M15',
    type: 'STRONG_BUY',
    currentPrice: 4471.5,
    entryZone: [4462.0, 4476.0],
    tp1: 4492.0,
    tp2: 4520.0,
    tp3: 4560.0,
    stopLoss: 4418.0,
    pipTarget: 885,
    pipRisk: 535,
    riskReward: '1:1.65',
    winRate: 94,
    status: 'ACTIVE',
    leverage: '1:2000 / Unlimited',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'EMA 50 পুলব্যাক এবং Bollinger Bands মিডল ব্যান্ড (SMA 20) রিটেস্ট ডিমান্ড জোন',
      slReason: 'কী-সাপোর্ট ও EMA 200 (4442) এর নিচে ২.৫% কাঠামোগত সেফটি বাফার এসএল (সকালের উইক ও ফেকআউট হান্ট প্রটেক্টেড)',
      tp1Reason: 'Bollinger Bands মিডল-টু-আপার সুইং এক্সটেনশন (1:1 R:R)',
      tp2Reason: 'Upper Bollinger Band (4520) মেজর রেজিস্ট্যান্স জোন (1:2 R:R)',
      tp3Reason: 'RSI 70+ এক্সট্রিম ওভারবট জোন ও ট্রেন্ড রানার এক্সটেনশন (1:2.8+ R:R)',
      ema50: 4465.0,
      ema100: 4454.0,
      ema200: 4442.0,
      bbUpper: 4520.0,
      bbMiddle: 4470.0,
      bbLower: 4442.0,
      rsi: 54.2,
    },
    analysisBangla:
      'EMA 50 (4465) > EMA 100 (4454) > EMA 200 (4442) পারফেক্ট গোল্ডেন অ্যালাইনমেন্ট। কী-সাপোর্ট লেভেলের নিচে নিরাপদ বাফার থাকায় উইক স্টপ-আউট ঝুঁকি শূন্য।',
    indicators: {
      rsi: 54.2,
      trend: 'BULLISH',
      emaConfluence: 'EMA 50 > EMA 100 > EMA 200 Bullish Triple Alignment + BB Mid Bounce',
      support: 4442.0,
      resistance: 4520.0,
    },
    recommendedLotSize100Usd: '0.01 - 0.02 Lots (Max $10 Risk)',
    timestamp: Date.now() - 1000 * 60 * 8,
    author: 'Exness Pro VIP Algorithm',
  },
  {
    id: 'ex-eurusd-02',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'FOREX',
    timeframe: 'H1',
    type: 'BUY',
    currentPrice: 1.0845,
    entryZone: [1.0835, 1.0848],
    tp1: 1.0885,
    tp2: 1.0925,
    tp3: 1.0975,
    stopLoss: 1.0805,
    pipTarget: 80,
    pipRisk: 40,
    riskReward: '1:2.00',
    winRate: 91,
    status: 'ACTIVE',
    leverage: '1:Unlimited',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'H1 EMA 50 ডাইনামিক সাপোর্ট রিটেস্ট ও বোলিঞ্জার লোয়ার ব্যান্ড বাউন্স',
      slReason: 'H1 EMA 200 (1.0812) ও Lower BB এর ২০ পিপস নিচে',
      tp1Reason: 'বোলিঞ্জার মিডল লাইন রিকভারি টার্গেট (1:1 R:R)',
      tp2Reason: 'Upper Bollinger Band (1.0925) ও কি-রেজিস্ট্যান্স (1:2 R:R)',
      tp3Reason: 'RSI 65+ এক্সটেনশন ও H4 সুইং হাই টার্গেট (1:3 R:R)',
      ema50: 1.0838,
      ema100: 1.0825,
      ema200: 1.0810,
      bbUpper: 1.0925,
      bbMiddle: 1.0850,
      bbLower: 1.0815,
      rsi: 51.8,
    },
    analysisBangla:
      'H1 টাইমফ্রেমে EMA 50 > EMA 100 > EMA 200 বুলিশ সিকোয়েন্স বিদ্যমান। RSI 51.8 সেন্ট্রাল লাইনের উপরে মোমেন্টাম দিচ্ছে এবং লোয়ার ব্যান্ড সাপোর্ট ধরে রেখেছে।',
    indicators: {
      rsi: 51.8,
      trend: 'BULLISH',
      emaConfluence: 'EMA 50 / 100 / 200 Stacked Bullish + BB Support',
      support: 1.0805,
      resistance: 1.0925,
    },
    recommendedLotSize100Usd: '0.03 - 0.05 Lots',
    timestamp: Date.now() - 1000 * 60 * 25,
    author: 'Exness Quant Engine',
  },
  {
    id: 'ex-gbpusd-03',
    symbol: 'GBP/USD',
    name: 'Great British Pound / USD',
    category: 'FOREX',
    timeframe: 'M15',
    type: 'STRONG_BUY',
    currentPrice: 1.2945,
    entryZone: [1.293, 1.2952],
    tp1: 1.2995,
    tp2: 1.305,
    tp3: 1.312,
    stopLoss: 1.289,
    pipTarget: 105,
    pipRisk: 55,
    riskReward: '1:1.91',
    winRate: 89,
    status: 'ACTIVE',
    leverage: '1:Unlimited',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'M15 EMA 50 (1.2935) ডাইনামিক পুলব্যাক ও BB মিডল লাইন রিবাউন্ড',
      slReason: 'EMA 200 (1.2898) ও লোয়ার বোলিঞ্জার ব্যান্ডের নিচে',
      tp1Reason: 'বোলিঞ্জার আপার ব্যান্ড টেস্ট (1:1 R:R)',
      tp2Reason: 'ডেইলি রেজিস্ট্যান্স R1 ও সুইং হাই (1:2 R:R)',
      tp3Reason: 'RSI ওভারবট এক্সপানশন রানার (1:3 R:R)',
      ema50: 1.2935,
      ema100: 1.2915,
      ema200: 1.2895,
      bbUpper: 1.3050,
      bbMiddle: 1.2945,
      bbLower: 1.2895,
      rsi: 58.6,
    },
    analysisBangla:
      'লন্ডন সেশনে M15 ক্যান্ডেল EMA 50 সাপোর্ট রিটেস্ট করেছে। EMA 50/100/200 অ্যালাইনমেন্ট বুলিশ এবং RSI 58.6 আপট্রেন্ড মোমেন্টাম নির্দেশ করছে।',
    indicators: {
      rsi: 58.6,
      trend: 'BULLISH',
      emaConfluence: 'M15 EMA 50 / 100 / 200 Dynamic Support Bounce + BB Expand',
      support: 1.289,
      resistance: 1.305,
    },
    recommendedLotSize100Usd: '0.02 - 0.04 Lots',
    timestamp: Date.now() - 1000 * 60 * 42,
    author: 'Exness London Desk',
  },
  {
    id: 'ex-usdjpy-04',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'FOREX',
    timeframe: 'H4',
    type: 'STRONG_SELL',
    currentPrice: 153.25,
    entryZone: [153.4, 153.1],
    tp1: 152.4,
    tp2: 151.5,
    tp3: 150.2,
    stopLoss: 154.2,
    pipTarget: 175,
    pipRisk: 95,
    riskReward: '1:1.84',
    winRate: 93,
    status: 'ACTIVE',
    leverage: '1:Unlimited',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'RSI (14) ভ্যালু ৮৫+ ওভারবট জোন স্পর্শ করার পর বিয়ারিশ রিজেকশন + Upper Bollinger Band পিনবার রিজেকশন',
      slReason: 'H4 EMA 200 (153.95) ও Upper Bollinger Band (154.20) এর উপরে সেফটি বাফার',
      tp1Reason: 'বোলিঞ্জার মিডল লাইন SMA 20 রিটেস্ট (1:1 R:R)',
      tp2Reason: 'Lower Bollinger Band (151.50) মেজর সাপোর্ট (1:2 R:R)',
      tp3Reason: 'RSI < ২০ এক্সট্রিম ওভারসোল্ড ফ্লোর টার্গেট (1:2.5+ R:R)',
      ema50: 153.50,
      ema100: 153.80,
      ema200: 154.10,
      bbUpper: 154.20,
      bbMiddle: 153.20,
      bbLower: 151.50,
      rsi: 86.8,
    },
    analysisBangla:
      'EMA 50 < EMA 100 < EMA 200 বিয়ারিশ ডেথ সিকোয়েন্স। RSI (14) ভ্যালু ৮৫+ ওভারবট লিমিট থেকে শার্প রিভার্সাল দিয়ে ফুল সেল (FULL SELL) সিগন্যাল ট্রিগার করেছে। Upper BB থেকে রিজেকশন নিশ্চিত।',
    indicators: {
      rsi: 86.8,
      trend: 'BEARISH',
      emaConfluence: 'RSI > 85 Overbought Rejection + EMA 50 < 100 < 200 Bearish Sequence + Upper BB Rejection',
      support: 151.5,
      resistance: 154.2,
    },
    recommendedLotSize100Usd: '0.02 - 0.03 Lots',
    timestamp: Date.now() - 1000 * 60 * 65,
    author: 'Exness Tokyo Core',
  },
  {
    id: 'ex-xauusd-sell-07',
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar (Scalp Short)',
    category: 'GOLD',
    timeframe: 'M15',
    type: 'STRONG_SELL',
    currentPrice: 4485.5,
    entryZone: [4488.0, 4483.0],
    tp1: 4455.0,
    tp2: 4425.0,
    tp3: 4390.0,
    stopLoss: 4515.0,
    pipTarget: 955,
    pipRisk: 295,
    riskReward: '1:3.23',
    winRate: 94,
    status: 'ACTIVE',
    leverage: '1:2000 / Unlimited',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'RSI (14) ৮৭.২ এক্সট্রিম ওভারবট জোন হিট করে বিয়ারিশ এনগালফিং তৈরি করেছে + Upper Bollinger Band রিজেকশন',
      slReason: 'অ্যাসসেন্ডিং রেজিস্ট্যান্স ও Upper BB ব্যান্ডের উপরে সেফটি স্টপ (4515.0)',
      tp1Reason: 'EMA 50 ডাইনামিক রিটেস্ট ও মিডল ব্যান্ড (1:1 R:R)',
      tp2Reason: 'EMA 100 সাপোর্ট লেভেল (1:2 R:R)',
      tp3Reason: 'RSI ২০ ওভারসোল্ড ফ্লোর ও Lower Bollinger Band (4390.0) এক্সটেনশন (1:3.2+ R:R)',
      ema50: 4462.0,
      ema100: 4435.0,
      ema200: 4405.0,
      bbUpper: 4492.0,
      bbMiddle: 4460.0,
      bbLower: 4390.0,
      rsi: 87.2,
    },
    analysisBangla:
      'গোল্ডের M15 টাইমফ্রেমে RSI ৮৭.২ চরম ওভারবট (Above 85) ছুঁয়ে রিভার্সাল দিয়েছে। আপার বোলিঞ্জার ব্যান্ডে রিজেকশন উইক তৈরি হওয়ায় দ্রুত প্রফিট টেকিং সেল ড্রপের সম্ভাবনা।',
    indicators: {
      rsi: 87.2,
      trend: 'BEARISH',
      emaConfluence: 'RSI 87.2 Overbought Reversal + Upper BB Band Exhaustion + EMA 50 Retest Short',
      support: 4390.0,
      resistance: 4495.0,
    },
    recommendedLotSize100Usd: '0.01 - 0.02 Lots (Strict Risk Control)',
    timestamp: Date.now() - 1000 * 60 * 18,
    author: 'Exness VIP Metals Desk',
  },
  {
    id: 'ex-us30-05',
    symbol: 'US30',
    name: 'Wall Street 30 (Dow Jones)',
    category: 'INDICES',
    timeframe: 'M15',
    type: 'STRONG_BUY',
    currentPrice: 43850.0,
    entryZone: [43780.0, 43870.0],
    tp1: 44100.0,
    tp2: 44350.0,
    tp3: 44650.0,
    stopLoss: 43380.0,
    pipTarget: 500,
    pipRisk: 470,
    riskReward: '1:1.70',
    winRate: 88,
    status: 'ACTIVE',
    leverage: '1:200 / 1:500',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'M15 EMA 50 (43790) পুলব্যাক ও BB মিডল ব্যান্ড সাপোর্ট বাউন্স',
      slReason: 'কী-সাপোর্ট ও EMA 200 (43620) এর নিচে ২৪০ পয়েন্ট সেফটি বাফার এসএল',
      tp1Reason: 'বোলিঞ্জার আপার ব্যান্ড ফার্স্ট টার্গেট (1:1 R:R)',
      tp2Reason: 'ইনডেক্স কি-রেজিস্ট্যান্স 44350 (1:2 R:R)',
      tp3Reason: 'RSI 70+ বুলিশ সুইং এক্সটেনশন (1:3 R:R)',
      ema50: 43790.0,
      ema100: 43700.0,
      ema200: 43620.0,
      bbUpper: 44350.0,
      bbMiddle: 43850.0,
      bbLower: 43610.0,
      rsi: 61.2,
    },
    analysisBangla:
      'EMA 50 > EMA 100 > EMA 200 আপট্রেন্ড ফ্যান তৈরি হয়েছে। সাপোর্ট থেকে নিরাপদ দূরত্বে এসএল থাকায় উইক হান্টিং অসম্ভব।',
    indicators: {
      rsi: 61.2,
      trend: 'BULLISH',
      emaConfluence: 'EMA 50 > 100 > 200 Golden Alignment + BB Expansion',
      support: 43600.0,
      resistance: 44400.0,
    },
    recommendedLotSize100Usd: '0.01 Lots (High Index Volatility)',
    timestamp: Date.now() - 1000 * 60 * 95,
    author: 'Exness Indices Desk',
  },
  {
    id: 'ex-btcusd-06',
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar (Exness CFD)',
    category: 'CRYPTO_CFD',
    timeframe: 'H1',
    type: 'STRONG_BUY',
    currentPrice: 78780.0,
    entryZone: [78200.0, 78850.0],
    tp1: 80200.0,
    tp2: 82500.0,
    tp3: 84800.0,
    stopLoss: 75400.0,
    pipTarget: 3600,
    pipRisk: 3380,
    riskReward: '1:1.68',
    winRate: 95,
    status: 'ACTIVE',
    leverage: '1:400 / 1:Unlimited',
    strategyMethod: 'EMA_50_100_200_RSI_BB',
    levelCalculations: {
      entryReason: 'H1 EMA 50 (78350) ডাইনামিক রিটেস্ট ও বোলিঞ্জার লোয়ার-টু-মিডল ব্যান্ড রিবাউন্ড',
      slReason: 'কী-সাপোর্ট (77200) ও H1 EMA 200 এর নিচে ২.৩% কাঠামোগত সেফটি বাফার এসএল (উইক ও ফেকআউট হান্ট প্রটেক্টেড)',
      tp1Reason: 'বোলিঞ্জার মিডল লাইন ৮০K সাইকোলজিক্যাল লেভেল (1:1 R:R)',
      tp2Reason: 'Upper Bollinger Band (82.5K) সুইং হাই (1:2 R:R)',
      tp3Reason: 'RSI 75+ অল-টাইম হাই রানার (1:3 R:R)',
      ema50: 78350.0,
      ema100: 77800.0,
      ema200: 77300.0,
      bbUpper: 82500.0,
      bbMiddle: 78800.0,
      bbLower: 77300.0,
      rsi: 59.8,
    },
    analysisBangla:
      'H1 টাইমফ্রেমে EMA 50 > EMA 100 > EMA 200 গোল্ডেন ক্রস অপরিবর্তিত। RSI 59.8 বুলিশ রেঞ্জে এবং Lower Bollinger Band রিজেকশন দিয়ে ৮০K+ টার্গেট করছে।',
    indicators: {
      rsi: 59.8,
      trend: 'BULLISH',
      emaConfluence: 'H1 EMA 50 > 100 > 200 Golden Alignment + BB Lower Bounce',
      support: 77200.0,
      resistance: 83000.0,
    },
    recommendedLotSize100Usd: '0.01 - 0.02 Lots',
    timestamp: Date.now() - 1000 * 60 * 120,
    author: 'Exness Crypto Engine',
  },
];

const EXNESS_STORAGE_KEY = 'bybit_exness_signals_v3';
const EXNESS_CONFIG_KEY = 'bybit_exness_config_v3';

export interface ExnessConfig {
  partnerLink: string;
  partnerCode: string;
  supportTelegram: string;
  autoSignalIntervalMinutes: number;
}

const DEFAULT_CONFIG: ExnessConfig = {
  partnerLink: 'https://one.exness-track.com/',
  partnerCode: 'EXNESS_VIP_BD',
  supportTelegram: 'https://t.me/avictgboy',
  autoSignalIntervalMinutes: 30,
};

export class ExnessSignalService {
  private static signals: ExnessSignal[] = [];
  private static config: ExnessConfig = DEFAULT_CONFIG;

  static init() {
    try {
      const stored = localStorage.getItem(EXNESS_STORAGE_KEY);
      if (stored) {
        const parsed: ExnessSignal[] = JSON.parse(stored);
        // Verify and update old cached prices if gold was under 4000
        this.signals = parsed.map((s) => {
          const initMatch = INITIAL_EXNESS_SIGNALS.find((init) => init.symbol === s.symbol);
          if (initMatch && !s.levelCalculations) {
            return {
              ...s,
              strategyMethod: initMatch.strategyMethod,
              levelCalculations: initMatch.levelCalculations,
              analysisBangla: initMatch.analysisBangla,
              indicators: initMatch.indicators,
            };
          }
          if (s.symbol === 'XAU/USD' && (s.currentPrice < 4000 || s.currentPrice > 10000)) {
            return INITIAL_EXNESS_SIGNALS[0];
          }
          if (s.symbol.includes('US30')) {
            return { ...s, symbol: 'US30' };
          }
          if (s.symbol.includes('BTC/USD') && s.currentPrice > 85000) {
            return INITIAL_EXNESS_SIGNALS[5];
          }
          return s;
        });
        this.saveSignals();
      } else {
        this.signals = [...INITIAL_EXNESS_SIGNALS];
        this.saveSignals();
      }

      const storedConfig = localStorage.getItem(EXNESS_CONFIG_KEY);
      if (storedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(storedConfig) };
      }
    } catch (e) {
      this.signals = [...INITIAL_EXNESS_SIGNALS];
    }
  }

  static getSignals(): ExnessSignal[] {
    if (!this.signals || this.signals.length === 0) {
      this.init();
    }
    return this.signals;
  }

  static saveSignals() {
    try {
      localStorage.setItem(EXNESS_STORAGE_KEY, JSON.stringify(this.signals));
    } catch (e) {}
  }

  static getConfig(): ExnessConfig {
    return this.config;
  }

  static updateConfig(newConfig: Partial<ExnessConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(EXNESS_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {}
    return this.config;
  }

  static addSignal(signal: Omit<ExnessSignal, 'id' | 'timestamp'>): ExnessSignal {
    const newSignal: ExnessSignal = {
      ...signal,
      id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    this.signals = [newSignal, ...this.signals];
    this.saveSignals();
    return newSignal;
  }

  static deleteSignal(id: string) {
    this.signals = this.signals.filter((s) => s.id !== id);
    this.saveSignals();
  }

  static updateSignalStatus(id: string, status: ExnessSignal['status']) {
    this.signals = this.signals.map((s) => (s.id === id ? { ...s, status } : s));
    this.saveSignals();
  }

  // Calculate Pip value and recommended Lot Size for MT4 / MT5
  static calculateLotSize(params: {
    balanceUsd: number;
    riskPercent: number;
    stopLossPips: number;
    symbolCategory: 'GOLD' | 'FOREX' | 'INDICES' | 'CRYPTO_CFD';
  }) {
    const { balanceUsd, riskPercent, stopLossPips, symbolCategory } = params;
    const maxRiskAmount = (balanceUsd * riskPercent) / 100;

    let pipValuePerStandardLot = 10; // Standard 1 Lot Forex = $10 per pip
    if (symbolCategory === 'GOLD') {
      pipValuePerStandardLot = 10; // 1 Lot Gold = $10 per 0.1 pip or $100 per 1.0 pt
    } else if (symbolCategory === 'INDICES') {
      pipValuePerStandardLot = 1;
    } else if (symbolCategory === 'CRYPTO_CFD') {
      pipValuePerStandardLot = 1;
    }

    const safePips = Math.max(stopLossPips, 5);
    const rawLotSize = maxRiskAmount / (safePips * pipValuePerStandardLot);
    // Format to 2 decimals, min 0.01
    const lotSize = Math.max(0.01, Math.round(rawLotSize * 100) / 100);

    return {
      lotSize,
      maxRiskAmount: Math.round(maxRiskAmount * 100) / 100,
      pipValuePerStandardLot,
      totalPipRiskValue: Math.round(lotSize * safePips * pipValuePerStandardLot * 100) / 100,
    };
  }

  // Formats signal to 1-Click Telegram / WhatsApp / MT5 copy text
  static formatSignalForCopy(signal: ExnessSignal): string {
    const directionEmoji = signal.type.includes('BUY') ? '🟢 BUY' : '🔴 SELL';
    return `⚡ EXNESS VIP SIGNAL ⚡
━━━━━━━━━━━━━━━━━━
📊 Asset: ${signal.symbol} (${signal.name})
🎯 Action: ${directionEmoji} (${signal.timeframe})
💰 Entry Zone: ${signal.entryZone[0]} - ${signal.entryZone[1]}

🎯 Take Profit 1: ${signal.tp1} (Scalp)
🎯 Take Profit 2: ${signal.tp2} (Intraday)
🎯 Take Profit 3: ${signal.tp3} (Swing Target)
🛑 Stop Loss: ${signal.stopLoss}

📈 Win Rate: ${signal.winRate}%
⚖️ Risk:Reward: ${signal.riskReward}
💼 Rec. Lot (for $100): ${signal.recommendedLotSize100Usd}
━━━━━━━━━━━━━━━━━━
📝 Analysis: ${signal.analysisBangla}
🏦 Broker: Exness MT4 / MT5 (Zero Spread)`;
  }
}
