import React, { useState } from 'react';
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Layers,
  Search,
  Zap,
  BarChart2,
  PieChart,
  Users,
  Building2,
  Activity,
  Award,
  HelpCircle,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface FundamentalWebsite {
  id: string;
  name: string;
  url: string;
  category: 'ON_CHAIN' | 'FINANCIALS' | 'LIQUIDITY_DERIVATIVES' | 'TOKENOMICS_UNLOCKS' | 'SOCIAL_WHALES';
  categoryLabelBn: string;
  badge: string;
  descriptionBn: string;
  keyMetricsBn: string[];
  howProTradersUseBn: string;
  isTopRecommendation: boolean;
  logoColor: string;
}

export const FUNDAMENTAL_WEBSITES: FundamentalWebsite[] = [
  {
    id: 'coinglass',
    name: 'CoinGlass',
    url: 'https://www.coinglass.com',
    category: 'LIQUIDITY_DERIVATIVES',
    categoryLabelBn: 'লিকুইডিটি ও ফিউচারস ডাটা',
    badge: 'MUST HAVE #1',
    descriptionBn:
      'ফিউচারস ট্রেডারদের জন্য পৃথিবীর সবচেয়ে জনপ্রিয় ডাটা প্ল্যাটফর্ম। লিকুইডেশন হিটম্যাপ, ফান্ডিং রেট, ওপেন ইন্টারেস্ট (OI) এবং লং/শর্ট রেশিও দেখার জন্য সেরা।',
    keyMetricsBn: [
      'Liquidation Heatmap (কোথায় স্টপলস ক্লিন হবে)',
      'Funding Rates (লং নাকি শর্টদের পে করতে হচ্ছে)',
      'Open Interest (নতুন মানি ইনফ্লো হচ্ছে কিনা)',
      'Long/Short Ratio (খুচরা বনাম হোয়েলদের পজিশন)',
    ],
    howProTradersUseBn:
      'ফান্ডিং রেট খুব বেশি পজিটিভ হলে মার্কেট শর্ট করে অতিরিক্ত লংদের লিকুইডেট করে। হিটম্যাপ দেখে লিকুইডিটি পুলে এন্ট্রি নেওয়া হয়।',
    isTopRecommendation: true,
    logoColor: 'from-amber-500 to-yellow-600',
  },
  {
    id: 'defillama',
    name: 'DefiLlama',
    url: 'https://defillama.com',
    category: 'ON_CHAIN',
    categoryLabelBn: 'অন-চেইন ও টিভিএল (TVL)',
    badge: '100% FREE & BEST',
    descriptionBn:
      'সম্পূর্ণ ফ্রী অন-চেইন এবং ডিফাই (DeFi) ডাটা ট্র্যাকার। সব চেইনের Total Value Locked (TVL), প্রোটোকল ইনকাম, স্ট্যাবলকয়েন ইনফ্লো এবং টোকেন আনলক ট্র্যাক করা যায়।',
    keyMetricsBn: [
      'Total Value Locked (TVL গ্রোথ)',
      'Protocol Revenue & Fees (দৈনিক আসল আয়)',
      'Treasury & Stablecoin Inflows (নতুন ডলার জমা)',
      'Token Unlocks & Vesting (ভবিষ্যত ডাম্প ডেট)',
    ],
    howProTradersUseBn:
      'যে কয়েনের TVL হঠাৎ করে দ্রুত বাড়ছে কিন্তু দাম এখনও বাড়েনি, সেখানে আগেভাগে এন্ট্রি নিয়ে ১০০-২০০% প্রফিট বুক করা হয়।',
    isTopRecommendation: true,
    logoColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'tokenterminal',
    name: 'Token Terminal',
    url: 'https://tokenterminal.com',
    category: 'FINANCIALS',
    categoryLabelBn: 'ফাইন্যান্সিয়াল স্টেটমেন্ট ও রেশিও',
    badge: 'INSTITUTIONAL GRADE',
    descriptionBn:
      'শেয়ার বাজারের Bloomberg Terminal এর মতো ক্রিপ্টোর প্রোটোকল স্টেটমেন্ট। P/E (Price to Earnings) এবং P/S (Price to Sales) রেশিও দিয়ে আন্ডারভ্যালুড কয়েন খোঁজা যায়।',
    keyMetricsBn: [
      'P/E Ratio (দাম বনাম প্রোটোকল প্রফিট)',
      'P/S Ratio (দাম বনাম টোটাল রেভিনিউ)',
      'Active Users & Developer Activity',
      'Revenue per Token Holder',
    ],
    howProTradersUseBn:
      'যে প্রোটোকলের P/E রেশিও কম কিন্তু ইউজার ও রেভিনিউ বেশি, সেগুলো ফান্ডামেন্টালি স্ট্রং ও ঝুঁকিমুক্ত স্কাল্প/হোল্ডিং কয়েন।',
    isTopRecommendation: true,
    logoColor: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'messari',
    name: 'Messari Crypto',
    url: 'https://messari.io',
    category: 'TOKENOMICS_UNLOCKS',
    categoryLabelBn: 'ইনস্টিটিউশনাল রিসার্চ ও টোকেনমিক্স',
    badge: 'RESEARCH TOP',
    descriptionBn:
      'বড় বড় ভেনচার ক্যাপিটাল (VC) এবং ইনস্টিটিউশনাল ফান্ড ট্রেডারদের রিসার্চ হাব। টোকেন ইনফ্লেশন, সাপ্লাই কার্ভ এবং ক্যাপিটাল রেইজ ডাটা নিখুঁতভাবে দেয়।',
    keyMetricsBn: [
      'Initial Supply vs Fully Diluted Valuation (FDV)',
      'Venture Capital Backers (কোথায় বড় ফান্ড বিনিয়োগ আছে)',
      'Quarterly Protocol Financial Reports',
      'Token Emission Rate (বার্ষিক নতুন কয়েন মুদ্রণ)',
    ],
    howProTradersUseBn:
      'যদি FDV মার্কেটক্যাপের চেয়ে ১০ গুণ বড় হয়, তবে প্র ট্রেডাররা দীর্ঘমেয়াদে সেই কয়েন এড়িয়ে চলেন লস কমানোর জন্য।',
    isTopRecommendation: true,
    logoColor: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'dune',
    name: 'Dune Analytics',
    url: 'https://dune.com',
    category: 'ON_CHAIN',
    categoryLabelBn: 'স্মার্ট মানি ও কাস্টম অন-চেইন',
    badge: 'COMMUNITY POWERED',
    descriptionBn:
      'বিশ্বজুড়ে হাজার হাজার অন-চেইন এনালিস্টদের কাস্টম ড্যাশবোর্ড। স্মার্ট মানি ওয়ালেট, DEX ট্রেডিং ভলিউম এবং তিমিদের মুভমেন্ট সরাসরি ধরা যায়।',
    keyMetricsBn: [
      'Smart Money Wallet Tracking (স্মার্ট ট্রেডাররা কি কিনছে)',
      'DEX vs CEX Volume Shift',
      'Airdrop & Staking Activity',
      'Meme Coin Whales Top Holders',
    ],
    howProTradersUseBn:
      'স্মার্ট মানি ওয়ালেটের অ্যাড্রেস ট্র্যাক করে তারা কোন নতুন অল্টকয়েন একিউমুলেট করছে তা দেখে ট্রেড সেটআপ নেওয়া হয়।',
    isTopRecommendation: true,
    logoColor: 'from-orange-500 to-amber-600',
  },
  {
    id: 'glassnode',
    name: 'Glassnode Studio',
    url: 'https://studio.glassnode.com',
    category: 'ON_CHAIN',
    categoryLabelBn: 'অন-চেইন ম্যাক্রো মেট্রিক্স',
    badge: 'MACRO METRICS',
    descriptionBn:
      'বিটকয়েন এবং শীর্ষ অল্টকয়েনগুলোর ম্যাক্রো হেলথ অ্যানালাইসিস ডাটা প্ল্যাটফর্ম। MVRV Z-Score, Realized Cap এবং অন-চেইন প্রফিট সাইকেল ট্র্যাক করে।',
    keyMetricsBn: [
      'MVRV Z-Score (মার্কেট টপ নাকি বটম চেনার মেট্রিক)',
      'Exchange Reserve Inflow/Outflow (বাইন্যান্সে ইনপুট/আউটপুট)',
      'SOPR (Spent Output Profit Ratio - বিক্রি চাপ)',
      'Long-Term Holder vs Short-Term Holder Supply',
    ],
    howProTradersUseBn:
      'MVRV Z-Score লাল জোনে গেলে পুরো পোর্টফোলিও সেল করে দেয়া হয়, আর সবুজ বটম জোনে গেলে একিউমুলেট করা হয়।',
    isTopRecommendation: false,
    logoColor: 'from-emerald-600 to-green-700',
  },
  {
    id: 'cryptoquant',
    name: 'CryptoQuant',
    url: 'https://cryptoquant.com',
    category: 'LIQUIDITY_DERIVATIVES',
    categoryLabelBn: 'এক্সচেঞ্জ রিজার্ভ ও লেভারেজ',
    badge: 'EXCHANGE FLOWS',
    descriptionBn:
      'এক্সচেঞ্জ ইনপুট/আউটপুট এবং ফিউচারস লেভারেজ রেশিও দেখার সেরা সাইট। বিটকয়েন ও অল্টকয়েন ডাম্পের আগে এক্সচেঞ্জে জমা হওয়া কয়েন ট্র্যাক করা যায়।',
    keyMetricsBn: [
      'Exchange Netflow (সবচেয়ে সঠিক বাই/সেল সিগন্যাল)',
      'Estimated Leverage Ratio (মার্কেটে অতিরিক্ত ঝুঁকি আছে কিনা)',
      'Stablecoin Supply Ratio (SSR - কেনাকাটার ক্ষমতা)',
      'Miner Outflow (মাইনাররা বিক্রি করছে কিনা)',
    ],
    howProTradersUseBn:
      'যদি এক্সচেঞ্জে ১০,০০০+ বিটকয়েন ডিপোজিট বা ইনপুট হয়, তবে দাম ডাম্প করবে বুঝে সাথে সাথে লিকুইডেট বা ক্যাশ আউট করা হয়।',
    isTopRecommendation: false,
    logoColor: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'arkham',
    name: 'Arkham Intelligence',
    url: 'https://www.arkhamintelligence.com',
    category: 'SOCIAL_WHALES',
    categoryLabelBn: 'ওয়ালেট ইন্টেলিজেন্স ও তিমি ট্র্যাকার',
    badge: 'WHALE TRACKER',
    descriptionBn:
      'এআই চালিত ব্লকচেইন সার্চ ইঞ্জিন। ফাউন্ডার, ভিসি (VC) ও হোয়েল ওয়ালেটের পরিচিতি উন্মোচন করে তারা কখন কয়েন সেল দিচ্ছে তা দেখায়।',
    keyMetricsBn: [
      'Founder & Dev Wallet Transfers (প্রজেক্ট মালিকদের বিক্রি)',
      'Smart Money Portfolio Real-time Balances',
      'Exchange Deposit Alerts (তাৎক্ষণিক ডাম্প অ্যালার্ট)',
      'Visual Entity Network (টাকা কোথায় ট্রান্সফার হচ্ছে)',
    ],
    howProTradersUseBn:
      'ফাউন্ডার বা টিমের লোক যখন তাদের ওয়ালেট থেকে বাইন্যান্সে কয়েন পাঠায়, প্র ট্রেডাররা সাথে সাথে শর্ট বা এক্সিট পজিশন নেয়।',
    isTopRecommendation: true,
    logoColor: 'from-rose-500 to-pink-600',
  },
  {
    id: 'santiment',
    name: 'Santiment',
    url: 'https://santiment.net',
    category: 'SOCIAL_WHALES',
    categoryLabelBn: 'সোশ্যাল সেন্টিমেন্ট ও ডেভেলপার এক্টিভিটি',
    badge: 'SENTIMENT DATA',
    descriptionBn:
      'টুইটার, টেলিগ্রাম, রেডডিট ও ডিসকর্ড সোশাল সেন্টিমেন্ট ট্র্যাকার। অতিরিক্ত হাইপ বা অতিরিক্ত ভীতি (Fear) পরিমাপ করার প্রফেশনাল টুল।',
    keyMetricsBn: [
      'Social Dominance & Volume (সামাজিক মাধ্যমে আলোচনা)',
      'Crowd Sentiment Index (সোশাল মিডিয়ায় FOMO নাকি Fear)',
      'Development Activity (গিটহাব কমিকস ও আপডেট)',
      'Whale Accumulation Divergence',
    ],
    howProTradersUseBn:
      'যখন সাধারণ মানুষ (Retail) কোনো কয়েন নিয়ে খুব বেশি চেঁচামেচি (FOMO) শুরু করে, তখন স্মার্ট মানি মার্কেট ডাম্প করে প্রফিট তোলে।',
    isTopRecommendation: false,
    logoColor: 'from-violet-500 to-purple-700',
  },
  {
    id: 'coingecko',
    name: 'CoinGecko / CoinMarketCap',
    url: 'https://www.coingecko.com',
    category: 'TOKENOMICS_UNLOCKS',
    categoryLabelBn: 'বেসিক মার্কেট ডাটা ও অল্টকয়েন ক্যাটালগ',
    badge: 'PRIMARY DATA',
    descriptionBn:
      'বিশ্বের প্রধান ২ টি ক্রিপ্টো ইনডেক্সিং ওয়েবসাইট। সকল কয়েনের অফিশিয়াল সাইট, স্মার্ট কন্ট্রাক্ট, সার্কুলেটিং সাপ্লাই ও এক্সচেঞ্জ পেয়ার চেক করার জন্য।',
    keyMetricsBn: [
      'Circulating Supply vs Max Supply Ratio',
      'All-Time High (ATH) & All-Time Low (ATL) Percentage',
      'Verified Smart Contract Address (স্ক্যাম থেকে বাঁচতে)',
      '24h Real Volume & Category Tags',
    ],
    howProTradersUseBn:
      'যেকোনো নতুন কয়েনে এন্ট্রি নেওয়ার আগে অফিশিয়াল চুক্তি এড্রেস এবং সার্কুলেটিং সাপ্লাই ভেরিফাই করার জন্য ব্যবহৃত হয়।',
    isTopRecommendation: false,
    logoColor: 'from-green-500 to-emerald-600',
  },
];

interface FundamentalAnalysisHubProps {
  onSelectCoinSymbol?: (symbol: string) => void;
}

export const FundamentalAnalysisHub: React.FC<FundamentalAnalysisHubProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Checklist state for evaluating a coin's fundamental health
  const [checklist, setChecklist] = useState({
    fdvRatioOk: false, // FDV < 3x Circulating MCap
    tvlGrowing: false, // TVL in uptrend
    exchangeOutflow: false, // Net outflow from exchanges
    realRevenue: false, // Protocol generates real fees
    noMassiveUnlocks: false, // No huge token unlocks in next 30 days
    founderNotSelling: false, // Founder wallets are not dumping
  });

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistScore = Object.values(checklist).filter(Boolean).length;
  let safetyGrade = 'F (উচ্চ ডাম্প ঝুঁকি 🛑)';
  let gradeBg = 'bg-red-500/20 text-red-400 border-red-500/40';

  if (checklistScore >= 5) {
    safetyGrade = 'A+ (উচ্চমানের ফান্ডামেন্টালি সেফ 🟢)';
    gradeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (checklistScore >= 3) {
    safetyGrade = 'B (মাঝারি ক্যাটাগরি - সতর্ক থাকুন 🟡)';
    gradeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  }

  // Filter Websites
  const filteredWebsites = FUNDAMENTAL_WEBSITES.filter((site) => {
    if (selectedCategory !== 'ALL' && site.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        site.name.toLowerCase().includes(q) ||
        site.descriptionBn.toLowerCase().includes(q) ||
        site.categoryLabelBn.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans text-xs animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-5 sm:p-7 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0 shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-8 h-8 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                  🧠 ফান্ডামেন্টাল অ্যানালাইসিস হাব (Fundamental Data Sources)
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  PRO TRADER TOOLS
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                ইনস্টিটিউশনাল ট্রেডার ও এনালিস্টরা যে ডাটা ওয়েবসাইটগুলো ব্যবহার করে লস এড়ান এবং সঠিক সময় এন্ট্রি ও এক্সিট নেন — তার পূর্ণাঙ্গ নির্দেশিকা ও লিংক
              </p>
            </div>
          </div>
        </div>

        {/* Fundamental Core Knowledge Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1">
            <span className="text-[11px] text-indigo-400 font-sans font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              কেন ফান্ডামেন্টাল ডাটা জরুরী?
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              শুধুমাত্র টেকনিক্যাল চার্ট দেখলে ফেক ব্রেকআউট ও হুইপসতে (Whipsaw) লস হয়। ফান্ডামেন্টাল ডাটা দেখলে তিমির আসল বাই/সেল ধরা পড়ে।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
            <span className="text-[11px] text-emerald-400 font-sans font-bold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4" />
              আসল প্রফিটের গোপন রহস্য
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              TVL গ্রোথ, প্রোটোকল রেভিনিউ এবং এক্সচেঞ্জ আউটফ্লো পজিটিভ হলে কয়েনের দাম পাম্প হওয়া সময়ের ব্যাপার মাত্র!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1">
            <span className="text-[11px] text-rose-400 font-sans font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              লস কমানোর উপায়
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              টোকেন আনলক ডেট (Token Unlocks) এবং ফাউন্ডার ওয়ালেট ডিপোজিট চেক করলে বিশাল ডাম্পের হাত থেকে ১০০% বেঁচে থাকা সম্ভব।
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Coin Fundamental Safety Checklist (লস এড়ানোর চেকলিস্ট) */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-100">
                🛡️ ট্রেড নেওয়ার আগের ফান্ডামেন্টাল সেফটি চেকলিস্ট (Pre-Trade Checklist)
              </h2>
              <p className="text-xs text-slate-400">
                যেকোনো কয়েনে বাই পজিশন নেওয়ার আগে নিচের পয়েন্টগুলো মেলাুন। অন্তত ৩-৫ টি টিকমার্ক থাকলে সেফ ট্রেড।
              </p>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl font-bold text-xs border font-mono ${gradeBg}`}>
            সেফটি স্কোর: {checklistScore} / 6 | {safetyGrade}
          </div>
        </div>

        {/* Checklist Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              key: 'fdvRatioOk',
              label: '১. FDV বনাম মার্কেটক্যাপ রেশিও',
              desc: 'FDV যদি মার্কেটক্যাপের ৩ গুণের বেশি না হয় (CoinGecko এ চেক করুন)',
            },
            {
              key: 'tvlGrowing',
              label: '২. TVL আপট্রেন্ড বা স্থির',
              desc: 'DefiLlama তে প্রোটোকলের TVL নিয়মিত বাড়ছে কিনা',
            },
            {
              key: 'exchangeOutflow',
              label: '৩. এক্সচেঞ্জ আউটফ্লো পজিটিভ',
              desc: 'CryptoQuant/CoinGlass এ এক্সচেঞ্জ থেকে কয়েন ওয়ালেটে নেওয়া হচ্ছে',
            },
            {
              key: 'realRevenue',
              label: '৪. প্রোটোকলের আসল আয় (Revenue)',
              desc: 'Token Terminal এ প্রোটোকল দৈনিক আসল ফি উপার্জন করছে',
            },
            {
              key: 'noMassiveUnlocks',
              label: '৫. আগামী ৩০ দিনে বড় টোকেন আনলক নেই',
              desc: 'DefiLlama / TokenUnlocks এ বিশাল আনলক ডাম্পের ঝুঁকি নেই',
            },
            {
              key: 'founderNotSelling',
              label: '৬. ফাউন্ডার বা ভিVs সেল দিচ্ছে না',
              desc: 'Arkham এ টিম ওয়ালেট থেকে বাইন্যান্সে কয়েন পাঠানো হয়নি',
            },
          ].map((item) => {
            const isChecked = checklist[item.key as keyof typeof checklist];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleChecklist(item.key as keyof typeof checklist)}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                  isChecked
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div
                  className={`p-1 rounded-md mt-0.5 shrink-0 ${
                    isChecked
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-slate-200">{item.label}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: '🔥 সকল সেরা সাইট (All Sources)' },
            { id: 'LIQUIDITY_DERIVATIVES', label: '📊 লিকুইডিটি ও ফিউচারস' },
            { id: 'ON_CHAIN', label: '⛓️ অন-চেইন ও TVL' },
            { id: 'FINANCIALS', label: '📈 ফাইন্যান্সিয়াল স্টেটমেন্ট' },
            { id: 'TOKENOMICS_UNLOCKS', label: '🔓 টোকেনমিক্স ও আনলক' },
            { id: 'SOCIAL_WHALES', label: '🐳 তিমি ট্র্যাকার ও সেন্টিমেন্ট' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 border ${
                selectedCategory === tab.id
                  ? 'bg-indigo-500 text-white border-indigo-400 font-black shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0 sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="সাইট বা মেট্রিক সার্চ করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Fundamental Websites List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredWebsites.map((site) => (
          <div
            key={site.id}
            className="bg-slate-950/90 rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 transition-all p-4 sm:p-5 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between group"
          >
            {/* Top Accent Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${site.logoColor}`}
            />

            <div className="space-y-3">
              {/* Header Row: Title, Badge, Direct Link */}
              <div className="flex items-start justify-between gap-3 pt-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-100">
                      {site.name}
                    </h3>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      {site.badge}
                    </span>
                    {site.isTopRecommendation && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-md">
                        ⭐ সেরা সুপারিশ
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-indigo-400 font-medium block mt-0.5">
                    ক্যাটাগরি: {site.categoryLabelBn}
                  </span>
                </div>

                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md shadow-indigo-500/20"
                >
                  <span>ওয়েবসাইটে যান</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {site.descriptionBn}
              </p>

              {/* Key Metrics Bullet Points */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                <span className="text-[11px] font-bold text-indigo-300 block flex items-center gap-1 font-sans">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                  প্রধান যে ফান্ডামেন্টাল মেট্রিক্স এখানে পাবেন:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-300 font-mono">
                  {site.keyMetricsBn.map((m, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* How Pro Traders Use it to Avoid Losses */}
              <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 block flex items-center gap-1 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  প্র ট্রেডাররা কিভাবে লস এড়াতে এটি ব্যবহার করে:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {site.howProTradersUseBn}
                </p>
              </div>
            </div>

            {/* Bottom URL display footer */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="truncate">{site.url}</span>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-1 shrink-0 font-sans font-bold"
              >
                <span>ওপেন লিংক</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
