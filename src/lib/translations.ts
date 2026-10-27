export type Language = 'en' | 'bn' | 'es' | 'zh' | 'de' | 'fr';

export const translations = {
  en: {
    // Header
    appName: 'Bybit',
    appPro: 'AI Pro',
    capitalProtectionMode: 'Capital Protection Mode',
    searchPlaceholder: 'Search coin (e.g. BTC, ETH, SOL)...',
    fullDesk: 'Full Desk',
    androidView: 'Android View',
    refreshData: 'Refresh Market Data',

    // Market Overview
    marketOverview: 'Market Overview',
    fearAndGreed: 'Fear & Greed Index',
    topGainer24h: 'Top Gainer (24h)',
    topLoser24h: 'Top Loser (24h)',
    volume24hTotal: '24h Total Volume',
    activeMarketPairs: 'Active Market Pairs',

    // Risk Guard
    riskGuardTitle: 'Capital Protection Risk Guard',
    riskGuardDesc: 'Real-time anomaly detector & liquidation risk alerts',
    noRiskDetected: 'All market metrics operating within safe risk thresholds.',

    // Market Volatility
    marketVolatilityTitle: 'Market Volatility',
    assetsTracked: 'Assets Tracked',
    volatilityDesc: 'Live 24-hour price dispersion, momentum surges & high swing opportunities',
    avgMarketSwing: 'Avg Market Swing',
    highSwingTokens: 'High Swing Tokens (>5%)',
    topSwingers: 'Top Swingers (|%|)',
    topGainers: 'Top Gainers',
    topLosers: 'Top Losers',
    volumeLeaders: 'Volume Leaders',
    show: 'Show:',
    showMore: 'Show More Volatile Coins',

    // Coin List
    allCoins: 'All Coins',
    favorites: 'Favorites',
    topGainersTab: 'Top Gainers',
    topLosersTab: 'Top Losers',
    highVolumeTab: 'High Volume',
    coinColumn: 'Coin',
    priceColumn: 'Last Price',
    change24hColumn: '24h Change',
    high24hColumn: '24h High',
    low24hColumn: '24h Low',
    volume24hColumn: '24h Volume',
    actionColumn: 'Action',

    // Modal & Analysis
    coinDetails: 'Coin Analysis & Grid Trading',
    aiSignal: 'AI Signal',
    technicalAnalysis: 'Technical Analysis',
    gridTrading: 'Grid Bot Assistant',
    targetPrices: 'Target Levels',
    takeProfit: 'Take Profit',
    stopLoss: 'Stop Loss',
    riskLevel: 'Risk Level',

    // Settings
    systemSettings: 'System Settings',
    themeAtmosphere: 'Theme Atmosphere',
    autoRefreshRate: 'Auto Refresh Rate',
    capitalProtectionPriority: 'Capital Protection Priority',
    filtersHighRisk: 'Filters high risk liquidations',
    audioAlerts: 'Audio Alerts',
    language: 'Language',
    clearCache: 'Clear Local Cache',

    // Languages
    english: 'English (US)',
    bangla: 'বাংলা (Bengali)',
  },
  bn: {
    // Header
    appName: 'বাইবিট',
    appPro: 'এআই প্রো',
    capitalProtectionMode: 'মূলধন সুরক্ষা মোড',
    searchPlaceholder: 'কয়েন খুঁজুন (যেমন BTC, ETH, SOL)...',
    fullDesk: 'ফুল ডেস্কটপ',
    androidView: 'অ্যান্ড্রয়েড ভিউ',
    refreshData: 'মার্কেট ডাটা রিফ্রেশ করুন',

    // Market Overview
    marketOverview: 'মার্কেট সামগ্রিক চিত্র',
    fearAndGreed: 'ভয় ও লোভ সূচক (Fear & Greed)',
    topGainer24h: 'সর্বোচ্চ বৃদ্ধি (২৪ ঘণ্টা)',
    topLoser24h: 'সর্বোচ্চ পতন (২৪ ঘণ্টা)',
    volume24hTotal: '২৪ ঘণ্টার মোট ভলিউম',
    activeMarketPairs: 'সক্রিয় মার্কেট জোড়া',

    // Risk Guard
    riskGuardTitle: 'ক্যাপিটাল প্রোটেকশন রিস্ক গার্ড',
    riskGuardDesc: 'লাইভ মার্কেট ঝুঁকি ও সতর্কবার্তা সনাক্তকরণ',
    noRiskDetected: 'বর্তমানে সমস্ত মার্কেট সূচক নিরাপদ সীমার মধ্যে রয়েছে।',

    // Market Volatility
    marketVolatilityTitle: 'মার্কেট অস্থিরতা (Volatility)',
    assetsTracked: 'ট্র্যাক করা কয়েন',
    volatilityDesc: '২৪ ঘণ্টার দামের তারতম্য, গতি ও উচ্চ ঝুঁকির সুযোগ',
    avgMarketSwing: 'গড় মার্কেট দোলনা',
    highSwingTokens: 'উচ্চ অস্থির টোকেন (>৫%)',
    topSwingers: 'শীর্ষ অস্থির কয়েন',
    topGainers: 'শীর্ষ লাভজনক',
    topLosers: 'শীর্ষ ক্ষতিগ্রস্ত',
    volumeLeaders: 'শীর্ষ ভলিউম',
    show: 'দেখাও:',
    showMore: 'আরও অস্থির কয়েন দেখুন',

    // Coin List
    allCoins: 'সকল কয়েন',
    favorites: 'পছন্দের তালিকা',
    topGainersTab: 'শীর্ষ লাভজনক',
    topLosersTab: 'শীর্ষ ক্ষতিগ্রস্ত',
    highVolumeTab: 'উচ্চ ভলিউম',
    coinColumn: 'কয়েন',
    priceColumn: 'বর্তমান দাম',
    change24hColumn: '২৪ ঘণ্টার পরিবর্তন',
    high24hColumn: '২৪ ঘণ্টার সর্বোচ্চ',
    low24hColumn: '২৪ ঘণ্টার সর্বনিম্ন',
    volume24hColumn: '২৪ ঘণ্টার ভলিউম',
    actionColumn: 'অ্যাকশন',

    // Modal & Analysis
    coinDetails: 'কয়েন বিশ্লেষণ ও গ্রিড ট্রেডিং',
    aiSignal: 'এআই ট্রেডিং সিগন্যাল',
    technicalAnalysis: 'টেকনিক্যাল এনালাইসিস',
    gridTrading: 'গ্রিড বট অ্যাসিস্ট্যান্ট',
    targetPrices: 'টার্গেট লেভেল',
    takeProfit: 'টেক প্রফিট (TP)',
    stopLoss: 'স্টপ লস (SL)',
    riskLevel: 'ঝুঁকির মাত্রা',

    // Settings
    systemSettings: 'সিস্টেম সেটিংস',
    themeAtmosphere: 'থিম মোড',
    autoRefreshRate: 'অটো রিফ্রেশ রেট',
    capitalProtectionPriority: 'ক্যাপিটাল প্রোটেকশন মোড',
    filtersHighRisk: 'উচ্চ ঝুঁকিপূর্ণ লিকুইডেশন ফিল্টার করে',
    audioAlerts: 'অডিও অ্যালার্ট',
    language: 'ভাষা (Language)',
    clearCache: 'ক্যাশ ক্লিয়ার করুন',

    // Languages
    english: 'English (US)',
    bangla: 'বাংলা (Bengali)',
  },
};

export function getTranslation(lang: string, key: keyof typeof translations.en): string {
  const selected = (translations as any)[lang] || translations.en;
  return selected[key] || translations.en[key] || '';
}
