import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Sparkles,
  Users,
  Eye,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Compass,
  Target,
  Clock,
  ExternalLink,
  Table,
  LayoutGrid,
} from 'lucide-react';

export interface NewsPsychologyItem {
  id: string;
  headlineBn: string;
  source: string;
  newsTime: string;
  coinSymbol: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category:
    | 'MACRO_ECONOMY'
    | 'REGULATORY_FUD'
    | 'ETF_INSTITUTIONAL'
    | 'TOKEN_UNLOCK'
    | 'EXCHANGE_LIQUIDATION'
    | 'WHALE_TRANSFER';
  categoryLabelBn: string;
  expectedDirection: 'PUMP_BULLISH' | 'DUMP_BEARISH' | 'BULL_TRAP' | 'BEAR_TRAP';
  directionLabelBn: string;
  upProbability: number;

  // Trade Signal parameters
  signalType: 'LONG' | 'SHORT' | 'SPOT_BUY' | 'WAIT_PULLBACK';
  entryZone: string;
  targetTP1: string;
  targetTP2: string;
  stopLoss: string;
  recommendedLeverage: string;

  // Psychology Breakdown
  retailPsychologyBn: string;
  whalePsychologyBn: string;
  psychologyPhase: 'EUPHORIA' | 'FOMO' | 'FEAR' | 'CAPITULATION' | 'DISBELIEF' | 'COMPLACENCY';
  psychologyPhaseLabelBn: string;
  actionableStrategyBn: string;
  riskWarningBn: string;
}

export const PSYCHOLOGY_NEWS_DATABASE: NewsPsychologyItem[] = [
  {
    id: 'fed_rate_cut_decision',
    headlineBn: 'ইউএস ফেড সুদের হার (Fed Interest Rate) ২৫ বেসিস পয়েন্ট হ্রাস করার সিদ্ধান্ত নিয়েছে',
    source: 'Federal Reserve Press / Bloomberg',
    newsTime: '১৫ মিনিট আগে',
    coinSymbol: 'BTC/USDT',
    impactLevel: 'CRITICAL',
    category: 'MACRO_ECONOMY',
    categoryLabelBn: '🏛️ ম্যাক্রো ইকোনমি ও ফেড নীতি',
    expectedDirection: 'BULL_TRAP',
    directionLabelBn: '🚨 বুল ট্র্যাপ (ফেক পাম্পের পর ডাম্প)',
    upProbability: 68,
    signalType: 'WAIT_PULLBACK',
    entryZone: '$64,200 - $64,800 (সাপোর্ট রিটেস্টে)',
    targetTP1: '$66,500',
    targetTP2: '$68,200',
    stopLoss: '$63,100',
    recommendedLeverage: '3x - 5x (কম লেভারেজ)',
    retailPsychologyBn:
      'রিটেইল ট্রেডাররা ভাবছে: "সুদের হার কমেছে মানেই মার্কেট রকেটের মতো পাম্প করবে! এখনই ফুল ১০০x লেভারেজে বাই করতে হবে।" (অন্ধ FOMO)',
    whalePsychologyBn:
      'স্মার্ট মানির চাল: "খবরের আগেই আমরা একিউমুলেশন শেষ করেছি। এখন রিটেইলদের FOMO ক্রিয়েট করে হাই প্রাইসে Sell the News করে প্রফিট বুক করব।"',
    psychologyPhase: 'EUPHORIA',
    psychologyPhaseLabelBn: 'ইউফোরিয়া ও অন্ধ FOMO',
    actionableStrategyBn:
      'খবর প্রকাশের ১-২ ঘন্টার মধ্যে হঠাৎ তৈরি হওয়া গ্রিন ক্যান্ডেলে বাই করবেন না। প্রথম ফেক পাম্পের পর দাম যখন সাপোর্ট রিটেস্ট করবে তখন লং/বাই ট্রেড নিন।',
    riskWarningBn: 'খবরের সময় ১০০x লেভারেজ নিলে লিকুইডিটি স্পাইকে অ্যাকাউন্ট জিরো হতে পারে।',
  },
  {
    id: 'spot_etf_500m_inflow',
    headlineBn: 'ব্ল্যাকরক ও ফিডেলিটির স্পট বিটকয়েন ইটিএফ-এ দৈনিক $৬২০M+ নেট ইনফ্লো',
    source: 'Farside Investors / CoinDesk',
    newsTime: '৩০ মিনিট আগে',
    coinSymbol: 'BTC/USDT',
    impactLevel: 'HIGH',
    category: 'ETF_INSTITUTIONAL',
    categoryLabelBn: '🏦 ইটিএফ ও ইনস্টিটিউশনাল মানি',
    expectedDirection: 'PUMP_BULLISH',
    directionLabelBn: '🚀 টেকসই বুলিশ ট্রেন্ড (Strong Buy)',
    upProbability: 88,
    signalType: 'LONG',
    entryZone: '$65,100 - $65,600',
    targetTP1: '$67,800',
    targetTP2: '$70,500',
    stopLoss: '$64,100',
    recommendedLeverage: '5x - 10x',
    retailPsychologyBn:
      'রিটেইলরা প্রথমে বিশ্বাস করতে চায় না (Disbelief): "এটা হয়তো ফেক পাম্প, আবার নিচে নামবে।" ফলে তারা ট্রেন্ড মিস করে পরে চূড়ায় গিয়ে ফোমোতে বাই করে।',
    whalePsychologyBn:
      'স্মার্ট মানির চাল: "বিলিয়ন ডলারের ওয়াল স্ট্রিট ইনস্টিটিউশনাল ক্রয় আদেশ অনবরত আসছে। বাজারে বিটকয়েনের সাপ্লাই শর্টেজ তৈরি হচ্ছে, তাই প্রাইস টানা উপরে যাবে।"',
    psychologyPhase: 'DISBELIEF',
    psychologyPhaseLabelBn: 'ডিসবিলিফ ও অবিশ্বাসের পাম্প',
    actionableStrategyBn:
      'ইটিএফ ইনফ্লো পজিটিভ থাকলে প্রতিটা ছোটখাটো ডিপে (Pullback) শর্ট করার চেষ্টা করবেন না। ৪ ঘন্টা চার্টের ২০ EMA এর কাছে এলে লং বা স্পটে একিউমুলেট করুন।',
    riskWarningBn: 'শক্তিশালী ইনস্টিটিউশনাল ট্রেন্ডের বিরুদ্ধে কাউন্টার-ট্রেন্ড শর্ট নেওয়া অত্যন্ত ঝুঁকিপূর্ণ।',
  },
  {
    id: 'sec_lawsuit_fud',
    headlineBn: 'বড় অল্টকয়েন ও এক্সচেঞ্জের বিরুদ্ধে SEC নতুন করে সিকিউরিটিজ তদন্তের রিউমার ছড়াচ্ছে',
    source: 'Twitter / CryptoAlerts',
    newsTime: '১ ঘন্টা আগে',
    coinSymbol: 'ETH/USDT',
    impactLevel: 'HIGH',
    category: 'REGULATORY_FUD',
    categoryLabelBn: '⚖️ এফইউডি ও রেগুলেশন',
    expectedDirection: 'BEAR_TRAP',
    directionLabelBn: '🟢 বিয়ার ট্র্যাপ (প্যানিক সেলিং এর পর দ্রুত রিকভারি)',
    upProbability: 76,
    signalType: 'SPOT_BUY',
    entryZone: '$3,180 - $3,220 (প্যানিক উইকের নিচে)',
    targetTP1: '$3,380',
    targetTP2: '$3,520',
    stopLoss: '$3,090',
    recommendedLeverage: 'Spot / 3x Cross',
    retailPsychologyBn:
      'রিটেইল ট্রেডাররা ভয়ে প্যানিক সেল (Panic Sell) দিচ্ছে: "সব শেষ! কয়েনের দাম জিরো হয়ে যাবে, তাড়াতাড়ি লসে বিক্রি করে দিই।"',
    whalePsychologyBn:
      'স্মার্ট মানির চাল: "রিটেইলদের ভয় দেখিয়ে সস্তায় কয়েনগুলো হাতিয়ে নেওয়ার সুযোগ! প্যানিক সেলিং শেষ হলেই আমরা বিশাল ভলিউমে একিউমুলেট করব।"',
    psychologyPhase: 'CAPITULATION',
    psychologyPhaseLabelBn: 'ক্যাপিচুলেশন ও চরম আতঙ্ক (Panic)',
    actionableStrategyBn:
      'FUD খবরের সাথে সাথেই রেড ক্যান্ডেল দেখে শর্ট মারবেন না। দাম যখন সাপোর্ট জোনে এসে নিচে লম্বা উইক (Wicks) তৈরি করবে, তখন স্মার্ট মানির সাথে স্পট বাই করুন।',
    riskWarningBn: 'প্যানিক সেলিং ক্যান্ডেলের একদম নিচে লসে বিক্রি করে দিলে পরে আফসোস করতে হবে।',
  },
  {
    id: 'sui_token_unlock_100m',
    headlineBn: 'আগামী ২৪ ঘন্টায় SUI ও SOL টোকেনের বিশাল টি姆斯 অ্যান্ড ইনভেস্টর আনলক (Token Unlock)',
    source: 'TokenUnlocks / CryptoRank',
    newsTime: '৪৫ মিনিট আগে',
    coinSymbol: 'SUI/USDT',
    impactLevel: 'HIGH',
    category: 'TOKEN_UNLOCK',
    categoryLabelBn: '🔓 টোকেন আনলক ডাম্প',
    expectedDirection: 'DUMP_BEARISH',
    directionLabelBn: '🔴 ডাম্প ও সাপ্লাই প্রেসার (Bearish Signal)',
    upProbability: 28,
    signalType: 'SHORT',
    entryZone: '$1.85 - $1.92 (রেজিস্ট্যান্স রিটেস্টে)',
    targetTP1: '$1.65',
    targetTP2: '$1.48',
    stopLoss: '$2.02',
    recommendedLeverage: '3x - 5x',
    retailPsychologyBn:
      'রিটেইলদের চিন্তা: "কয়েনটির দাম সাপোর্ট পেয়ে গেছে, হয়তো এবার বিশাল পাম্প দেবে।" তারা আনলকের সাপ্লাই প্রেসারের গভীরতা বোঝে না।',
    whalePsychologyBn:
      'স্মার্ট মানি ও ভেনচার ক্যাপিটালের চাল: "আনলক হওয়া মিলিয়ন্স ডলারের টোকেন মার্কেটে বিক্রি করতে হবে। বিক্রি সহজ করতে আগে হালকা পাম্প করিয়ে ভলিউম আনা হবে, তারপর ডাম্প।"',
    psychologyPhase: 'COMPLACENCY',
    psychologyPhaseLabelBn: 'কমপ্লেসেন্সি ও অসচেতনতা',
    actionableStrategyBn:
      'টোকেন আনলকের আগে যদি কৃত্রিম ছোট পাম্প দেয়, তবে রেজিস্ট্যান্স জোন থেকে শর্ট সেটআপ দেখা বুদ্ধিমানের কাজ। স্পট হোল্ডিং থাকলে সাময়িক এক্সিট নিন।',
    riskWarningBn: 'আনলকের সময় স্পট কয়েন বাই করে হোল্ড করা বিপজ্জনক।',
  },
  {
    id: 'liquidation_500m_flush',
    headlineBn: 'মার্কেটে এক ঘন্টায় $৫৫০M+ লং লিকুইডেশন এবং Fear & Greed Index ১৯ এ নেমেছে',
    source: 'Coinglass / CryptoQuant',
    newsTime: '১০ মিনিট আগে',
    coinSymbol: 'SOL/USDT',
    impactLevel: 'CRITICAL',
    category: 'EXCHANGE_LIQUIDATION',
    categoryLabelBn: '⚡ লিকুইডেশন ফ্ল্যাশ ও লেভারেজ ক্র্যাশ',
    expectedDirection: 'PUMP_BULLISH',
    directionLabelBn: '⚡ বটম রিভার্সাল (V-Shape Rebound)',
    upProbability: 82,
    signalType: 'LONG',
    entryZone: '$138.00 - $142.00',
    targetTP1: '$152.00',
    targetTP2: '$164.00',
    stopLoss: '$131.50',
    recommendedLeverage: '3x - 5x',
    retailPsychologyBn:
      'রিটেইলরা নিঃস্ব হয়ে মার্কেট ছেড়ে পালাচ্ছে (Despair): "ক্রিপ্টো একটা স্ক্যাম, আর কোনোদিন ট্রেড করব না।"',
    whalePsychologyBn:
      'স্মার্ট মানির চাল: "সব দুর্বল হাত (Weak Hands) ক্লিন হয়ে গেছে। ফিউচারস লেভারেজ পুরোপুরি হালকা। এখন সামান্য ভলিউমে মার্কেট রকেটের মতো পাম্প করা সম্ভব।"',
    psychologyPhase: 'FEAR',
    psychologyPhaseLabelBn: 'চরম হতাশা ও ক্যাপিচুলেশন',
    actionableStrategyBn:
      'যখন Fear & Greed Index ২০ এর নিচে নামবে এবং বিশাল লিকুইডেশন ওয়াশআউট হবে, তখন ভয় না পেয়ে ভালো কয়েনগুলোতে কম লেভারেজে লং বা স্পট এন্ট্রি নিন।',
    riskWarningBn: 'লিকুইডেশন স্পাইক চলাকালীন মাঝপথে স্টপলেস ছাড়া মার্কেট অর্ডারে না ঢোকাই শ্রেয়।',
  },
  {
    id: 'tether_mint_1b_usdt',
    headlineBn: 'ট্রেজারি থেকে ১ বিলিয়ন নতুন $USDT মিন্ট করা হয়েছে (Whale Liquidity Injection)',
    source: 'Whale Alert / Etherscan',
    newsTime: '৫ মিনিট আগে',
    coinSymbol: 'BTC/USDT',
    impactLevel: 'HIGH',
    category: 'WHALE_TRANSFER',
    categoryLabelBn: '🐋 হোয়েল ট্রান্সফার ও লিকুইডিটি',
    expectedDirection: 'PUMP_BULLISH',
    directionLabelBn: '🚀 পাম্প সিগন্যাল (Bullish Liquidity)',
    upProbability: 84,
    signalType: 'LONG',
    entryZone: '$65,400 - $65,900',
    targetTP1: '$67,500',
    targetTP2: '$69,200',
    stopLoss: '$64,300',
    recommendedLeverage: '5x - 10x',
    retailPsychologyBn:
      'রিটেইলরা খবরটি খেয়াল করেনি এবং মার্কেট সাইডওয়ে মনে করে ঘুমিয়ে রয়েছে।',
    whalePsychologyBn:
      'স্মার্ট মানির চাল: "নতুন $১B স্টেবলকয়েন ইনজেক্ট করা হয়েছে মানে প্রাতিষ্ঠানিক বাই অর্ডার প্রস্তুত। আমরা রাতের মধ্যেই বিটকয়েন ও অল্টকয়েন পাম্প করাব।"',
    psychologyPhase: 'DISBELIEF',
    psychologyPhaseLabelBn: 'সাইডওয়ে থেকে আকস্মিক পাম্প',
    actionableStrategyBn:
      'ইউএসডিটি মিন্টিং খবরের ১-৩ ঘন্টার মধ্যে সাধারণত মার্কেটে বড় পাম্প শুরু হয়। তাই দ্রুত ব্রেকআউট রিটেস্টে লং সিগন্যাল কার্যকর করুন।',
    riskWarningBn: 'বাজারের অতিরিক্ত ভোলাটিলিটিতে স্টপলস না থাকলে ক্ষতি হতে পারে।',
  },
];

export const MarketPsychologyNewsRadar: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'CARDS' | 'SUMMARY_TABLE'>('CARDS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customHeadline, setCustomHeadline] = useState<string>('');
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);
  const [customReport, setCustomReport] = useState<{
    direction: string;
    signal: string;
    entry: string;
    tp: string;
    sl: string;
    retailThought: string;
    whaleThought: string;
    advice: string;
    probability: number;
  } | null>(null);

  // Filter List
  const filteredList = PSYCHOLOGY_NEWS_DATABASE.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.headlineBn.toLowerCase().includes(q) ||
        item.categoryLabelBn.toLowerCase().includes(q) ||
        item.coinSymbol.toLowerCase().includes(q) ||
        item.actionableStrategyBn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAnalyzeCustomHeadline = () => {
    if (!customHeadline.trim()) return;
    setIsAnalyzingCustom(true);

    setTimeout(() => {
      const text = customHeadline.toLowerCase();
      let direction = '🟢 সম্ভাব্য বুলিশ (Upward Shift)';
      let signal = '🟢 LONG / SPOT BUY';
      let entry = 'সাপোর্ট রিটেস্টে / ৩-৫% ডিপে এন্ট্রি';
      let tp = '+৮% থেকে +১৫% প্রফিট টার্গেট';
      let sl = 'এন্ট্রি প্রাইসের ৩% নিচে';
      let probability = 75;
      let retailThought =
        'সাধারণ ট্রেডাররা খবরের হেডলাইন দেখে আবেগের বশে অবিলম্বে বাই বা সেল অর্ডার বসাবে।';
      let whaleThought =
        'স্মার্ট মানি আগে লিকুইডিটি পুল (Liquidity Pool) মেপে ট্র্যাপ তৈরি করে বিপরীত দিকে মুভ করাবে।';
      let advice =
        'খবর প্রকাশের সাথে সাথে ট্রেড না নিয়ে ১৫-৩০ মিনিটের ক্যান্ডেল ক্লোজ দেখে সাপোর্ট/রেজিস্ট্যান্সে এন্ট্রি নিন।';

      if (
        text.includes('ban') ||
        text.includes('hack') ||
        text.includes('sec') ||
        text.includes('dump') ||
        text.includes('lawsuit') ||
        text.includes('investigation')
      ) {
        direction = '🔴 প্যানিক ট্র্যাপ ও ডাম্প ঝুঁকি (Bearish FUD)';
        signal = '🔴 SHORT / WAIT SPOT';
        entry = 'রেজিস্ট্যান্স রিটেস্ট বা উইক রিজেকশনে';
        tp = '-১০% থেকে -১৮% প্রফিট টার্গেট';
        sl = 'রেজিস্ট্যান্সের ২.৫% উপরে';
        probability = 35;
        retailThought =
          'রিটেইলরা ভয়ে প্যানিক সেল দিয়ে লস বুক করবে এবং জিরো হয়ে যাওয়ার আশঙ্কায় থাকবে।';
        whaleThought =
          'হোয়েলরা সস্তায় অল্টকয়েন একিউমুলেট করার জন্য FUD ছড়িয়ে লিকুইডিটি শুষে নেবে।';
        advice =
          'প্যানিক সেলিং স্পাইক শেষ হওয়া পর্যন্ত অপেক্ষা করুন। ক্যান্ডেলের নিচে লম্বা উইক তৈরি হলে রিভার্সাল ট্রেড দেখুন।';
      } else if (
        text.includes('etf') ||
        text.includes('approval') ||
        text.includes('partnership') ||
        text.includes('buy') ||
        text.includes('pump')
      ) {
        direction = '🚀 বুলিশ মোমেন্টাম (Bullish Trend)';
        signal = '🚀 LONG (5x-10x)';
        entry = '৪-ঘন্টা চার্টের ২০ EMA রিটেস্টে';
        tp = '+১২% থেকে +২৫% প্রফিট টার্গেট';
        sl = 'সাপোর্ট জোনের নিচে';
        probability = 85;
        retailThought =
          'রিটেইলদের মধ্যে তীব্র FOMO কাজ করবে এবং তারা যেকোনো প্রাইসে চোখ বন্ধ করে কিনবে।';
        whaleThought =
          'হোয়েলরা রেজিস্ট্যান্স জোনে কিছুটা প্রফিট বুক করতে পারে, তবে ম্যাক্রো ট্রেন্ড আপসাইডে থাকবে।';
        advice =
          'ফোমোতে গিয়ে একদম শীর্ষে কিনবেন না। কিছুটা পুলব্যাক (Dip) দিলে ১/২/৪ ঘন্টা চার্টে এন্ট্রি নিন।';
      }

      setCustomReport({
        direction,
        signal,
        entry,
        tp,
        sl,
        probability,
        retailThought,
        whaleThought,
        advice,
      });
      setIsAnalyzingCustom(false);
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans text-xs animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-purple-950/90 via-slate-900 to-indigo-950 p-5 sm:p-7 rounded-2xl border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0 shadow-lg shadow-purple-500/20">
              <Brain className="w-8 h-8 animate-pulse text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  🧠 দৈনিক মার্কেট নিউজ ও সাইকোলজি ট্রেড সিগন্যাল (News & Signal Radar)
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  REAL-TIME NEWS ANALYSIS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                চলতি বাজারের গুরুত্বপূর্ন নিউজ, তার পেছনে তিমির (Whale) মনস্তত্ত্ব এবং নিউজভিত্তিক ট্রেড সিগন্যাল (Entry, TP, Stop Loss)
              </p>
            </div>
          </div>
        </div>

        {/* 3 Core Psychological Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1">
            <span className="text-[11px] text-amber-400 font-sans font-bold flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              ১. "Buy the Rumor, Sell the News"
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              খবরের গুঞ্জন শুনলে স্মার্ট মানি কেনে, আর যখন খবর টিভিতে বা নিউজে চলে আসে তখন তারা রিটেইলদের কাছে বিক্রি করে প্রফিট তোলে।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1">
            <span className="text-[11px] text-purple-400 font-sans font-bold flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              ২. উল্টো সাইকোলজি (Contrarian)
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              যখন সবাই ইউফোরিয়া (Euphoria) বা অতিরিক্ত লোভে অন্ধ, তখন ডাম্পের সময়। যখন সবাই ভয়ে নিঃস্ব (Panic), তখন বাই করার উপযুক্ত সময়।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
            <span className="text-[11px] text-cyan-400 font-sans font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ৩. লিকুইডিটি ট্র্যাপ (Liquidity Trap)
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              বড় খবর আসলে ব্রোকার ও এক্সচেঞ্জগুলো ফেইক উইক (Fake Wicks) দিয়ে রিটেইলদের স্টপলস ক্লিন করে লিকুইডিটি সংগ্রহ করে।
            </p>
          </div>
        </div>
      </div>

      {/* Custom News Psychology & Signal Generator */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-100">
              🔍 আপনি বাজারে দেখা যেকোনো নিউজের সাইকোলজি ও সিগন্যাল ডিকোড করুন (Custom News Signal Generator)
            </h2>
            <p className="text-xs text-slate-400">
              আপনি ফেসবুকে, টেলিগ্রামে বা নিউজে কোনো ক্রিপ্টো খবর দেখলে তা নিচে পেস্ট করুন। এআই নিউজটি বিশ্লেষণ করে ট্রেড সিগন্যাল তৈরি করবে।
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="উদাহরণ: Binance listing news, Fed rate cut, Solana ETF approval, Whale deposit $50M..."
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button
            type="button"
            onClick={handleAnalyzeCustomHeadline}
            disabled={isAnalyzingCustom || !customHeadline.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-lg shadow-indigo-500/20"
          >
            {isAnalyzingCustom ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>সিগন্যাল জেনারেট হচ্ছে...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>সাইকোলজি ও সিগন্যাল বের করুন</span>
              </>
            )}
          </button>
        </div>

        {/* Custom Signal Output Card */}
        {customReport && (
          <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-indigo-500/40 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-800 pb-3">
              <span className="text-sm font-black text-indigo-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                এআই নিউজের ট্রেড সিগন্যাল রিপোর্ট:
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-bold px-3 py-1 rounded-lg">
                সিগন্যাল এক্যুরেসি: {customReport.probability}%
              </span>
            </div>

            {/* Signal Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-sans">সিগন্যাল টাইপ</span>
                <span className="font-bold text-emerald-400">{customReport.signal}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-sans">এন্ট্রি জোন</span>
                <span className="font-bold text-slate-200">{customReport.entry}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-sans">প্রফিট টার্গেট</span>
                <span className="font-bold text-emerald-400">{customReport.tp}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 block font-sans">স্টপ লস (SL)</span>
                <span className="font-bold text-rose-400">{customReport.sl}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 space-y-1">
                <span className="font-bold text-rose-400 text-[11px] block flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  রিটেইলদের মনস্তত্ত্ব (Retail Psychology):
                </span>
                <p className="text-slate-300 font-sans">{customReport.retailThought}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-400 text-[11px] block flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  স্মার্ট মানি / তিমির চাল (Whale Mindset):
                </span>
                <p className="text-slate-300 font-sans">{customReport.whaleThought}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-1">
              <span className="font-bold text-indigo-300 text-[11px] block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                সুরক্ষিত ট্রেডিং টিপস:
              </span>
              <p className="text-slate-200 font-sans font-medium">{customReport.advice}</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs, View Toggle & Filter Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: '🔥 সকল লাইভ নিউজ ও সিগন্যাল' },
            { id: 'MACRO_ECONOMY', label: '🏛️ ফেড ও ম্যাক্রো নিউজ' },
            { id: 'REGULATORY_FUD', label: '⚖️ এফইউডি ও রেগুলেশন' },
            { id: 'ETF_INSTITUTIONAL', label: '🏦 ইটিএফ ও ইনস্টিটিউশন' },
            { id: 'TOKEN_UNLOCK', label: '🔓 টোকেন আনলক ডাম্প' },
            { id: 'EXCHANGE_LIQUIDATION', label: '⚡ লিকুইডেশন ফ্ল্যাশ' },
            { id: 'WHALE_TRANSFER', label: '🐋 হোয়েল ওয়ালেট' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${
                selectedCategory === tab.id
                  ? 'bg-purple-500 text-white border-purple-400 font-black shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'CARDS'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>কার্ড ভিউ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('SUMMARY_TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'SUMMARY_TABLE'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>সমারী টেবিল</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="কয়েন বা নিউজ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Summary Table vs Cards Grid */}
      {viewMode === 'SUMMARY_TABLE' ? (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <th className="p-3.5">কয়েন ও ক্যাটাগরি</th>
                  <th className="p-3.5">নিউজ হেডলাইন</th>
                  <th className="p-3.5">মার্কেট বায়াস (Bias)</th>
                  <th className="p-3.5">সিগন্যাল ও উইন রেট</th>
                  <th className="p-3.5">সাইকোলজিক্যাল অ্যাকশন স্ট্র্যাটেজি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredList.map((item) => {
                  const isBullish =
                    item.expectedDirection === 'PUMP_BULLISH' || item.signalType === 'LONG';
                  const isBearish =
                    item.expectedDirection === 'DUMP_BEARISH' || item.signalType === 'SHORT';

                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-3.5 align-top whitespace-nowrap">
                        <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block w-max">
                          {item.coinSymbol}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {item.categoryLabelBn}
                        </span>
                      </td>

                      <td className="p-3.5 align-top max-w-xs">
                        <p className="font-bold text-slate-100 leading-snug">{item.headlineBn}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          সূত্র: {item.source} ({item.newsTime})
                        </span>
                      </td>

                      <td className="p-3.5 align-top whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-black px-2.5 py-1 rounded-md border inline-block ${
                            isBullish
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isBearish
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {item.directionLabelBn}
                        </span>
                      </td>

                      <td className="p-3.5 align-top whitespace-nowrap font-mono">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded inline-block ${
                            item.signalType === 'LONG'
                              ? 'bg-emerald-500 text-slate-950'
                              : item.signalType === 'SHORT'
                              ? 'bg-rose-500 text-white'
                              : item.signalType === 'SPOT_BUY'
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {item.signalType}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                          উইন রেট: {item.upProbability}%
                        </span>
                      </td>

                      <td className="p-3.5 align-top max-w-sm">
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {item.actionableStrategyBn}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{item.riskWarningBn}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Primary News & Trade Signal Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredList.map((item) => {
          const isBullish =
            item.expectedDirection === 'PUMP_BULLISH' || item.signalType === 'LONG';
          const isBearish =
            item.expectedDirection === 'DUMP_BEARISH' || item.signalType === 'SHORT';

          return (
            <div
              key={item.id}
              className={`bg-slate-950/90 p-5 rounded-2xl border transition-all space-y-4 relative overflow-hidden flex flex-col justify-between shadow-xl ${
                item.expectedDirection === 'BULL_TRAP' || item.expectedDirection === 'BEAR_TRAP'
                  ? 'border-amber-500/50 hover:border-amber-400 shadow-amber-500/5'
                  : isBullish
                  ? 'border-emerald-500/40 hover:border-emerald-400 shadow-emerald-500/5'
                  : 'border-rose-500/40 hover:border-rose-400 shadow-rose-500/5'
              }`}
            >
              {/* Top Meta Info */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.categoryLabelBn}
                    </span>
                    <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.coinSymbol}
                    </span>
                  </div>

                  <span className="text-[10px] font-sans text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.newsTime}
                  </span>
                </div>

                {/* News Headline */}
                <h3 className="text-sm sm:text-base font-black text-slate-100 leading-snug">
                  {item.headlineBn}
                </h3>

                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2.5">
                  <span className="flex items-center gap-1 text-slate-400 font-sans">
                    <ExternalLink className="w-3 h-3 text-purple-400" />
                    সূত্র: <strong className="text-slate-300">{item.source}</strong>
                  </span>
                  <span
                    className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                      isBullish
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isBearish
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {item.directionLabelBn}
                  </span>
                </div>
              </div>

              {/* Trade Signal Parameters Box */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-black border-b border-slate-800/80 pb-2">
                  <span className="text-indigo-300 flex items-center gap-1.5 font-sans">
                    <Target className="w-4 h-4 text-indigo-400" />
                    নিউজের ভিত্তিতে এআই ট্রেড সিগন্যাল:
                  </span>
                  <span
                    className={`font-mono text-xs font-black px-2.5 py-0.5 rounded ${
                      item.signalType === 'LONG'
                        ? 'bg-emerald-500 text-slate-950'
                        : item.signalType === 'SHORT'
                        ? 'bg-rose-500 text-white'
                        : item.signalType === 'SPOT_BUY'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {item.signalType === 'LONG'
                      ? '🟢 LONG SIGNAL'
                      : item.signalType === 'SHORT'
                      ? '🔴 SHORT SIGNAL'
                      : item.signalType === 'SPOT_BUY'
                      ? '💎 SPOT BUY'
                      : '⏳ WAIT FOR PULLBACK'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-sans">এন্ট্রি জোন</span>
                    <span className="font-bold text-slate-200">{item.entryZone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-sans">টার্গেট ১ (TP1)</span>
                    <span className="font-bold text-emerald-400">{item.targetTP1}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-sans">টার্গেট ২ (TP2)</span>
                    <span className="font-bold text-emerald-300">{item.targetTP2}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-sans">স্টপ লস (SL)</span>
                    <span className="font-bold text-rose-400">{item.stopLoss}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-sans">
                  <span>
                    সুপারিশকৃত লেভারেজ: <strong className="text-purple-300">{item.recommendedLeverage}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    উইন রেট সম্ভাবনা: {item.upProbability}%
                  </span>
                </div>
              </div>

              {/* Psychology Breakdown Comparison Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Retail Mindset */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    রিটেইল ট্রেডাররা যা ভাবছে:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {item.retailPsychologyBn}
                  </p>
                </div>

                {/* Whale Mindset */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    স্মার্ট মানি / তিমির আসল চাল:
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {item.whalePsychologyBn}
                  </p>
                </div>
              </div>

              {/* Actionable Strategy & Risk */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-300 block flex items-center gap-1 font-sans">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ট্রেড নেওয়ার সাইকোলজিক্যাল পরামর্শ:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {item.actionableStrategyBn}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-amber-300/90 font-sans px-1 pt-1">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>ঝুঁকি: {item.riskWarningBn}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
