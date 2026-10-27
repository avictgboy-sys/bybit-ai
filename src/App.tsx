import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TickerData,
  FearAndGreedData,
  AppSettings,
  PriceAlert,
  NotificationItem,
} from './types';
import {
  fetchMarketTickers,
  fetchFearAndGreed,
  getSavedWatchlist,
  saveWatchlist,
} from './services/api';
import { soundService } from './services/soundService';
import { Header } from './components/Header';
import { FearAndGreedGauge } from './components/FearAndGreedGauge';
import { MarketOverviewCard } from './components/MarketOverviewCard';
import { CoinList } from './components/CoinList';
import { MarketVolatility } from './components/MarketVolatility';
import { BengaliTradeEvaluator } from './components/BengaliTradeEvaluator';
import { ChartUploadAnalyzer } from './components/ChartUploadAnalyzer';
import { AiSelfLearningMemory } from './components/AiSelfLearningMemory';
import { BybitTopPickCard } from './components/BybitTopPickCard';
import { DailyTenLoserPortfolioStrategy } from './components/DailyTenLoserPortfolioStrategy';
import { CoinDetailModal } from './components/CoinDetailModal';
import { RiskGuardPanel } from './components/RiskGuardPanel';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SettingsModal } from './components/SettingsModal';
import { MobileFrame } from './components/MobileFrame';
import { UserAuthModal } from './components/UserAuthModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { UserPortfolioModal } from './components/UserPortfolioModal';
import { MobileAppDeploymentHub } from './components/MobileAppDeploymentHub';
import { TelegramWebhookModal } from './components/TelegramWebhookModal';
import { GmailAlertModal } from './components/GmailAlertModal';
import { BybitApiConfigModal } from './components/BybitApiConfigModal';
import { BybitTradeConfirmModal, TradeSignalTarget } from './components/BybitTradeConfirmModal';
import { MainNavigationTabs, MainTabType } from './components/MainNavigationTabs';
import { VolumeCategoryViewer } from './components/VolumeCategoryViewer';
import { BotModeAdvisorPanel } from './components/BotModeAdvisorPanel';
import { MemeCoinLiveRadar } from './components/MemeCoinLiveRadar';
import { GrowingBullsScanner } from './components/GrowingBullsScanner';
import { MarketTimeZoneGuide } from './components/MarketTimeZoneGuide';
import { MarketSentimentTrend } from './components/MarketSentimentTrend';
import { MarketHeatmap } from './components/MarketHeatmap';
import { CandlestickPatternScanner } from './components/CandlestickPatternScanner';
import { EmaTradeSetupHub } from './components/EmaTradeSetupHub';
import { TopTenHighWinPicks } from './components/TopTenHighWinPicks';
import { AiCouncilProTab } from './components/aiCouncilPro/AiCouncilProTab';
import { AiCouncilProDashboardBanner } from './components/AiCouncilProDashboardBanner';
import { ExnessSignalsTab } from './components/ExnessSignalsTab';
import { CoinGlassLiquidityTracker } from './components/CoinGlassLiquidityTracker';
import { FundamentalAnalysisHub } from './components/FundamentalAnalysisHub';
import { MarketPsychologyNewsRadar } from './components/MarketPsychologyNewsRadar';
import { AuthService, UserAccount, AdminSystemConfig, PlatformAnnouncement } from './services/authService';
import { generateTopTenSignals } from './utils/signalGenerator';
import { evaluateCoin9FactorConfluence } from './utils/factorScanner';
import { TradingMemoryService } from './services/tradingMemory';
import { bybitWs, BybitTickerUpdate } from './services/bybitWebSocket';
import { CentralPriceStore } from './services/aiCouncilPro/centralPriceStore';
import { Shield, Sparkles, RefreshCw, AlertTriangle, Wifi, Bell, ShieldAlert, Wrench } from 'lucide-react';

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<MainTabType>('dashboard');

  // State
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [fearAndGreed, setFearAndGreed] = useState<FearAndGreedData>({
    value: 62,
    classification: 'Greed',
    timestamp: new Date().toISOString(),
  });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<TickerData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [systemConfig, setSystemConfig] = useState<AdminSystemConfig>(AuthService.getSystemConfig());
  const [announcements, setAnnouncements] = useState<PlatformAnnouncement[]>(AuthService.getAnnouncements());

  // Modals / Drawers State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState<boolean>(false);
  const [isMobileHubOpen, setIsMobileHubOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState<boolean>(false);
  const [isBybitConfigOpen, setIsBybitConfigOpen] = useState<boolean>(false);
  const [isTradeConfirmOpen, setIsTradeConfirmOpen] = useState<boolean>(false);
  const [selectedTradeSignal, setSelectedTradeSignal] = useState<TradeSignalTarget | null>(null);

  // AI Council Pro Navigation State
  const [councilInitialView, setCouncilInitialView] = useState<'COUNCIL_ROOM' | 'OPPORTUNITIES' | 'NEWS_CATALYST' | 'TRADE_STYLE' | 'RISK_GUARD' | 'JOURNAL_TELEGRAM' | 'ALL_ASSETS'>('COUNCIL_ROOM');
  const [councilTargetSymbol, setCouncilTargetSymbol] = useState<string>('BTCUSDT');

  const handleExecuteBybitTrade = (target: TradeSignalTarget) => {
    setSelectedTradeSignal(target);
    setIsTradeConfirmOpen(true);
  };

  // User Auth & Session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Notifications & Custom Price Alerts
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const priceAlertsRef = useRef<PriceAlert[]>([]);
  priceAlertsRef.current = priceAlerts;

  const lastNotifiedConfluenceRef = useRef<Record<string, number>>({});
  const [factorThreshold, setFactorThreshold] = useState<number>(5); // Default 5 out of 9 factors required

  // Check 9-Factor Confluence Signals (e.g. 5+ factors confirmed)
  const checkFactorConfluenceAlerts = (latestTickers: TickerData[]) => {
    if (!latestTickers || latestTickers.length === 0) return;
    const now = Date.now();
    const minCooldownMs = 15 * 60 * 1000; // 15-minute cooldown per coin to prevent spam

    const validTickers = latestTickers
      .filter((t) => t.symbol.endsWith('USDT') && !['USDCUSDT', 'BUSDUSDT', 'FDUSDUSDT', 'DAIUSDT'].includes(t.symbol))
      .slice(0, 40); // Scan top 40 liquid Bybit pairs

    for (const t of validTickers) {
      const lastAlertTime = lastNotifiedConfluenceRef.current[t.symbol] || 0;
      if (now - lastAlertTime < minCooldownMs) continue;

      const evalResult = evaluateCoin9FactorConfluence(t, factorThreshold);
      if (evalResult && evalResult.matchedCount >= factorThreshold) {
        const factorNames = evalResult.matchedFactors.map((f) => f.factor).join(', ');
        const dirEmoji = evalResult.direction === 'LONG' ? '🟢 LONG' : '🔴 SHORT';

        const newNotif: NotificationItem = {
          id: `confluence-${t.symbol}-${now}`,
          title: `🎯 ${t.symbol}: ${evalResult.matchedCount}/9 রিকোয়ারমেন্ট ম্যাচ হয়েছে! (${dirEmoji})`,
          message: `${t.baseCoin} কয়েনটি ৯টির মধ্যে ${evalResult.matchedCount}টি টেকনিক্যাল ফ্যাক্টর পাস করেছে (${factorNames})। কনফিডেন্স: ${evalResult.confidence}%। দাম: $${evalResult.price.toLocaleString()}`,
          timestamp: now,
          type: 'risk_warning',
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
        lastNotifiedConfluenceRef.current[t.symbol] = now;

        // Play pleasant chime
        soundService.playPriceAlertSound();
        break; // Max 1 notification per tick cycle to keep smooth
      }
    }
  };

  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    refreshIntervalMs: 15000,
    language: 'en',
    showMobileFrame: false,
    soundAlerts: true,
    capitalProtectionMode: true,
  });

  // Load Initial Cache, Watchlist & Session
  useEffect(() => {
    setWatchlist(getSavedWatchlist());

    // Initialize Auth Service & Load Session
    AuthService.init();
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Check for direct Admin URL parameter access (?admin=true or ?admin=1 or #admin)
    const urlParams = new URLSearchParams(window.location.search);
    const adminQuery = urlParams.get('admin');
    if (adminQuery === 'true' || adminQuery === '1' || adminQuery === 'login' || window.location.hash === '#admin') {
      if (user?.role === 'admin') {
        setIsAdminOpen(true);
      } else {
        setIsAuthOpen(true);
      }
    }

    // Load initial tickers & fear & greed
    loadData();
  }, []);

  // Fetching data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [tickerRes, fngRes] = await Promise.all([
        fetchMarketTickers(),
        fetchFearAndGreed(),
      ]);

      if (tickerRes && tickerRes.length > 0) {
        setTickers(tickerRes);
        CentralPriceStore.ingestRestTickers(tickerRes);

        // Check price alerts against live tickers
        checkPriceAlerts(tickerRes);

        // Check 9-Factor Confluence signals (e.g. 5/9 factors matched)
        checkFactorConfluenceAlerts(tickerRes);
      }
      if (fngRes) {
        setFearAndGreed(fngRes);
      }
    } catch (err) {
      console.warn('Error loading market data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Check Price Alerts
  const checkPriceAlerts = (latestTickers: TickerData[]) => {
    priceAlertsRef.current.forEach((alert) => {
      if (alert.triggered) return;
      const coin = latestTickers.find((t) => t.symbol === alert.symbol);
      if (!coin) return;

      let triggered = false;
      if (alert.direction === 'ABOVE' && coin.lastPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.direction === 'BELOW' && coin.lastPrice <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        const newNotif: NotificationItem = {
          id: `alert-${Date.now()}`,
          title: `🎯 Price Alert Triggered!`,
          message: `${alert.symbol} has crossed $${alert.targetPrice} (Current: $${coin.lastPrice}).`,
          timestamp: Date.now(),
          type: 'price_alert',
          read: false,
        };
        setNotifications((prev) => [newNotif, ...prev]);

        // Play browser-based alert tone
        soundService.playPriceAlertSound();

        // Mark alert as triggered
        setPriceAlerts((prev) =>
          prev.map((pa) => (pa.id === alert.id ? { ...pa, triggered: true } : pa))
        );
      }
    });
  };

  // Real-time Bybit WebSocket Global Stream Subscription
  useEffect(() => {
    // Listen for live ticker updates from Bybit WebSocket
    const unsub = bybitWs.onGlobalTicker((update: BybitTickerUpdate) => {
      setTickers((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          if (item.symbol === update.symbol) {
            changed = true;
            return {
              ...item,
              lastPrice: update.lastPrice ?? item.lastPrice,
              prevPrice24h: update.prevPrice24h ?? item.prevPrice24h,
              price24hPcnt: update.price24hPcnt ?? item.price24hPcnt,
              highPrice24h: update.highPrice24h ?? item.highPrice24h,
              lowPrice24h: update.lowPrice24h ?? item.lowPrice24h,
              turnover24h: update.turnover24h ?? item.turnover24h,
              volume24h: update.volume24h ?? item.volume24h,
            };
          }
          return item;
        });

        return changed ? next : prev;
      });

      // If modal is open for this coin, keep it in sync with live Bybit price cleanly
      if (update.lastPrice) {
        setSelectedCoin((cur) => {
          if (cur && cur.symbol === update.symbol) {
            return {
              ...cur,
              lastPrice: update.lastPrice!,
              price24hPcnt: update.price24hPcnt ?? cur.price24hPcnt,
              highPrice24h: update.highPrice24h ?? cur.highPrice24h,
              lowPrice24h: update.lowPrice24h ?? cur.lowPrice24h,
            };
          }
          return cur;
        });
      }
    });

    return unsub;
  }, []);

  // When tickers change or are loaded, subscribe the top coins to Bybit WebSocket
  useEffect(() => {
    if (tickers.length > 0) {
      const topSymbols = tickers.slice(0, 30).map((t) => t.symbol);
      bybitWs.subscribeTopCoins(topSymbols);
    }
  }, [tickers.length]);

  // Auto-refresh timer for full list and fear & greed
  useEffect(() => {
    if (settings.refreshIntervalMs <= 0) return;
    const interval = setInterval(() => {
      loadData();
    }, settings.refreshIntervalMs);

    return () => clearInterval(interval);
  }, [settings.refreshIntervalMs, loadData]);

  // Autonomous AI Self-Learning Engine: Real-time Signal Ingestion & Live Evaluation
  useEffect(() => {
    if (!tickers || tickers.length === 0) return;

    // 1. Evaluate any open virtual active trades against latest live ticker prices
    TradingMemoryService.evaluateActiveTrades(
      tickers.map((t) => ({
        symbol: t.symbol,
        lastPrice: t.lastPrice,
        baseCoin: t.baseCoin,
      }))
    );

    // 2. Automatically ingest newly spotted signals from Top 10 High Win into Memory
    if (TradingMemoryService.isAutoIngestEnabled()) {
      const topSignals = generateTopTenSignals(tickers);
      if (topSignals.length > 0) {
        const payloads = topSignals.slice(0, 6).map((sig) => ({
          symbol: sig.coin.symbol,
          baseCoin: sig.coin.baseCoin || sig.coin.symbol.replace('USDT', ''),
          direction: sig.positionDirection,
          entryPrice: sig.coin.lastPrice,
          tp1: sig.tp1,
          tp2: sig.tp2,
          sl: sig.sl,
          source: 'TOP_10' as const,
          sourceNameBn: 'টপ ১০ সিগন্যাল হাব',
          reasonBn: sig.reasonBn,
        }));
        TradingMemoryService.autoIngestSignals(payloads);
      }
    }
  }, [tickers]);

  // Toggle Watchlist item
  const handleToggleWatchlist = (symbol: string) => {
    let updated: string[] = [];
    if (watchlist.includes(symbol)) {
      updated = watchlist.filter((s) => s !== symbol);
    } else {
      updated = [...watchlist, symbol];
    }
    setWatchlist(updated);
    saveWatchlist(updated);
  };

  // Add Custom Price Alert
  const handleAddPriceAlert = (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `pa-${Date.now()}`,
      createdAt: Date.now(),
      triggered: false,
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
  };

  // Delete Price Alert
  const handleDeletePriceAlert = (id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Get BTC and ETH tickers for highlights safely
  const btcTicker =
    tickers.find((t) => t.symbol === 'BTCUSDT' || t.baseCoin === 'BTC') ||
    tickers.find((t) => t.symbol.includes('BTC')) ||
    (tickers.length > 0 ? tickers[0] : undefined);

  const ethTicker =
    tickers.find((t) => t.symbol === 'ETHUSDT' || t.baseCoin === 'ETH') ||
    tickers.find((t) => t.symbol.includes('ETH')) ||
    (tickers.length > 1 && tickers[1]?.symbol.includes('ETH') ? tickers[1] : undefined) ||
    {
      symbol: 'ETHUSDT',
      baseCoin: 'ETH',
      quoteCoin: 'USDT',
      lastPrice: 3495.2,
      prevPrice24h: 3380.0,
      price24hPcnt: 0.0341,
      highPrice24h: 3520.0,
      lowPrice24h: 3320.0,
      turnover24h: 1850000000,
      volume24h: 531000,
      fundingRate: 0.00012,
    };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden ${
        settings.theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100 font-sans'
      } transition-colors duration-200`}
    >
      <MobileFrame enabled={settings.showMobileFrame}>
        {/* Navigation Bar Header */}
        <Header
          settings={settings}
          onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          onOpenSearch={() => {
            if (activeTab !== 'coins') setActiveTab('coins');
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationCount={unreadCount}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim().length > 0 && activeTab !== 'coins') {
              setActiveTab('coins');
            }
          }}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onOpenPortfolio={() => setIsPortfolioOpen(true)}
          onOpenMobileHub={() => setIsMobileHubOpen(true)}
          onOpenTelegramWebhook={() => setIsTelegramModalOpen(true)}
          onOpenGmailModal={() => setIsGmailModalOpen(true)}
          onOpenBybitConfig={() => setIsBybitConfigOpen(true)}
          onLogout={() => {
            AuthService.logout();
            setCurrentUser(null);
          }}
          tickers={tickers}
          onSelectCoin={setSelectedCoin}
          onSelectTab={setActiveTab}
        />

        {/* Main Sticky Navigation Bar for Separate Views */}
        <MainNavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 pt-3 sm:pt-6 pb-28 sm:pb-24 space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
          {/* Admin Emergency Alert Banner */}
          {systemConfig.emergencyAlert && systemConfig.emergencyAlert.trim() !== '' && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-3 animate-pulse shadow-lg shadow-red-500/10">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <span className="font-black text-red-400 uppercase tracking-wide mr-2">🚨 এডমিন ফ্ল্যাশ অ্যালার্ট:</span>
                <span className="font-semibold text-slate-100">{systemConfig.emergencyAlert}</span>
              </div>
            </div>
          )}

          {/* Admin Maintenance Mode Banner */}
          {systemConfig.maintenanceMode && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-3">
              <Wrench className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <div>
                <span className="font-black text-amber-400 uppercase tracking-wide mr-2">⚠️ সিস্টেম রক্ষণাবেক্ষণ চলছে:</span>
                <span>বাইবিট এআই প্রো প্ল্যাটফর্মে সিগন্যাল সার্ভার অপ্টিমাইজেশন কার্যক্রম চলমান রয়েছে।</span>
              </div>
            </div>
          )}

          {/* TAB 1: Dashboard Overview (Lightweight & Super Fast Load) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              {/* Top Banner & Fear/Greed Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
                {/* Market Overview Card */}
                <div className="lg:col-span-2">
                  <MarketOverviewCard
                    btcTicker={btcTicker}
                    ethTicker={ethTicker}
                    tickers={tickers}
                    onSelectCoin={setSelectedCoin}
                  />
                </div>

                {/* Fear & Greed Gauge */}
                <div>
                  <FearAndGreedGauge data={fearAndGreed} />
                </div>
              </div>

              {/* AI COUNCIL PRO: 12 Institutional Traders & Master Decision Featured Hub Banner */}
              <AiCouncilProDashboardBanner
                onOpenCouncilPro={(viewMode) => {
                  if (viewMode) setCouncilInitialView(viewMode);
                  setActiveTab('ai_council_pro');
                }}
                tickers={tickers}
              />

              {/* Bybit Top Gainers & Losers AI Best Profit Pick (Prominently Placed on Top) */}
              <BybitTopPickCard
                tickers={tickers}
                onSelectCoin={setSelectedCoin}
                language={settings.language}
                onExecuteBybitTrade={handleExecuteBybitTrade}
              />

              {/* Real-time Japanese Candlestick Chart & Pattern Radar Scanner */}
              <CandlestickPatternScanner tickers={tickers} onSelectCoin={setSelectedCoin} />

              {/* EMA 50 / 100 / 200 Trade Strategy & Setup Hub for All Coins */}
              <EmaTradeSetupHub tickers={tickers} onSelectCoin={setSelectedCoin} />

              {/* Market 7-Day Sentiment Trend & Sparkline */}
              <MarketSentimentTrend data={fearAndGreed} />

              {/* Real-time Market Volume & Percentage Change Heatmap */}
              <MarketHeatmap tickers={tickers} onSelectCoin={setSelectedCoin} />
            </div>
          )}

          {/* TAB: AI COUNCIL PRO (12 Senior Institutional AI Traders & Master Decision) */}
          {activeTab === 'ai_council_pro' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <AiCouncilProTab
                tickers={tickers}
                onSelectCoin={setSelectedCoin}
                currentUser={currentUser}
                onExecuteBybitTrade={handleExecuteBybitTrade}
                initialViewMode={councilInitialView}
                initialSymbol={councilTargetSymbol || selectedCoin?.symbol || 'BTCUSDT'}
              />
            </div>
          )}

          {/* TAB 2: Top 10 High Win Signals (80-100% Probability) */}
          {activeTab === 'top10_high_win' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <TopTenHighWinPicks
                tickers={tickers}
                onSelectCoin={setSelectedCoin}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
                onOpenGmailModal={() => setIsGmailModalOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onExecuteBybitTrade={handleExecuteBybitTrade}
                currentUser={currentUser}
              />
            </div>
          )}

          {/* TAB: Exness Gold & Forex Precision Signals */}
          {activeTab === 'exness_signals' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <ExnessSignalsTab
                currentUser={currentUser}
                onOpenAuth={() => setIsAuthOpen(true)}
              />
            </div>
          )}

          {/* TAB 3: CoinGlass Liquidity Tracker (Inflow / Outflow / Founder Injections) */}
          {activeTab === 'coinglass_liquidity' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <CoinGlassLiquidityTracker
                tickers={tickers}
                onSelectCoin={setSelectedCoin}
              />
            </div>
          )}

          {/* TAB: Fundamental Analysis Data Sources & Loss Recovery Hub */}
          {activeTab === 'fundamental_hub' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <FundamentalAnalysisHub
                onSelectCoinSymbol={(sym) => {
                  const found = tickers.find((t) => t.symbol === sym || t.symbol === `${sym}USDT`);
                  if (found) setSelectedCoin(found);
                }}
              />
            </div>
          )}

          {/* TAB: Fundamental News & Market Psychology Decoder */}
          {activeTab === 'market_psychology' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <MarketPsychologyNewsRadar />
            </div>
          )}

          {/* TAB 3: GrowingBulls Live Crypto Scanner */}
          {activeTab === 'bulls_scanner' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <GrowingBullsScanner tickers={tickers} onSelectCoin={setSelectedCoin} />
            </div>
          )}

          {/* TAB 3: Volume Analysis (Volatile vs Stable Separation) */}
          {activeTab === 'volume' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              {/* Separated Volatile vs Stable Volume Categorization */}
              <VolumeCategoryViewer tickers={tickers} onSelectCoin={setSelectedCoin} />

              {/* Market Heatmap and Volatility Visualizer */}
              <MarketVolatility
                tickers={tickers}
                onSelectCoin={setSelectedCoin}
                language={settings.language}
              />
            </div>
          )}

          {/* TAB 4: Meme Coin High-Profit Radar */}
          {activeTab === 'meme_radar' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <MemeCoinLiveRadar tickers={tickers} onSelectCoin={setSelectedCoin} />
            </div>
          )}

          {/* TAB 5: BD Time & Global Market Session Guide */}
          {activeTab === 'time_zones' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <MarketTimeZoneGuide />
            </div>
          )}

          {/* TAB 6: Daily $10 Strategy & Trade Evaluator */}
          {activeTab === 'strategy' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              {/* Bengali Trade Run Evaluator */}
              <BengaliTradeEvaluator tickers={tickers} onSelectCoin={setSelectedCoin} />

              {/* Daily $1,000 Portfolio Strategy */}
              <DailyTenLoserPortfolioStrategy tickers={tickers} onSelectCoin={setSelectedCoin} />
            </div>
          )}

          {/* TAB 7: Risk Guard & Anomaly Filter */}
          {activeTab === 'risk_guard' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <RiskGuardPanel tickers={tickers} onSelectCoin={setSelectedCoin} />
              <BotModeAdvisorPanel tickers={tickers} onSelectCoin={setSelectedCoin} />
            </div>
          )}

          {/* TAB 8: AI Chart Screenshot Upload & Analyzer */}
          {activeTab === 'chart_analyzer' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <ChartUploadAnalyzer />
            </div>
          )}

          {/* TAB 9: All Coins Table & Search */}
          {activeTab === 'coins' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <CoinList
                tickers={tickers}
                watchlist={watchlist}
                onToggleWatchlist={handleToggleWatchlist}
                onSelectCoin={setSelectedCoin}
                searchQuery={searchQuery}
              />
            </div>
          )}

          {/* TAB 10: AI Autonomous Memory Engine */}
          {activeTab === 'ai_memory' && (
            <div className="space-y-4 sm:space-y-6 animate-fadeIn">
              <AiSelfLearningMemory tickers={tickers} onSelectCoin={setSelectedCoin} />
            </div>
          )}
        </main>

        {/* Footer info */}
        <footer className="border-t border-slate-900/80 py-4 text-center text-xs text-slate-400 max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Bybit AI Pro</strong> — Priority 1 Capital Protection & Non-Custodial Market Analytics
              </span>
            </div>
            <span className="text-[10px]">
              Public API V5 Data • Zero Trade Placement Risk
            </span>
          </div>
        </footer>

        {/* Coin Detail Modal Overlay */}
        {selectedCoin && (
          <CoinDetailModal
            coin={selectedCoin}
            onClose={() => setSelectedCoin(null)}
            isWatchlist={watchlist.includes(selectedCoin.symbol)}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenInCouncil={(symbol) => {
              setSelectedCoin(null);
              setCouncilTargetSymbol(symbol);
              setCouncilInitialView('COUNCIL_ROOM');
              setActiveTab('ai_council_pro');
            }}
          />
        )}

        {/* Notifications & Price Alert Drawer */}
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onClearNotifications={() => setNotifications([])}
          priceAlerts={priceAlerts}
          onAddPriceAlert={handleAddPriceAlert}
          onDeletePriceAlert={handleDeletePriceAlert}
          tickers={tickers}
          factorThreshold={factorThreshold}
          onSetFactorThreshold={setFactorThreshold}
        />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
          onClearCache={() => {
            localStorage.clear();
            loadData();
            alert('Offline data cache cleared successfully.');
          }}
          onOpenTelegramWebhook={() => setIsTelegramModalOpen(true)}
          onOpenBybitConfig={() => setIsBybitConfigOpen(true)}
        />

        {/* Bybit API V5 Configuration Modal */}
        <BybitApiConfigModal
          isOpen={isBybitConfigOpen}
          onClose={() => setIsBybitConfigOpen(false)}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Bybit Trade Order Confirmation Modal */}
        <BybitTradeConfirmModal
          isOpen={isTradeConfirmOpen}
          onClose={() => {
            setIsTradeConfirmOpen(false);
            setSelectedTradeSignal(null);
          }}
          signal={selectedTradeSignal}
          currentUser={currentUser}
          onOpenBybitConfig={() => setIsBybitConfigOpen(true)}
        />

        {/* Telegram Webhook Integration Modal */}
        <TelegramWebhookModal
          isOpen={isTelegramModalOpen}
          onClose={() => setIsTelegramModalOpen(false)}
        />

        {/* User Login & Registration Panel */}
        <UserAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin' || user.email.toLowerCase() === 'avictgboy@gmail.com' || user.email.toLowerCase() === 'admin@bybitai.com') {
              setIsAdminOpen(true);
            }
          }}
        />

        {/* Administrator Control Panel & User Registration List Panel */}
        <AdminDashboardModal
          isOpen={isAdminOpen}
          onClose={() => {
            setIsAdminOpen(false);
            setSystemConfig({ ...AuthService.getSystemConfig() });
            setAnnouncements([...AuthService.getAnnouncements()]);
          }}
          currentUser={currentUser}
        />

        {/* User Crypto Portfolio Management Modal */}
        <UserPortfolioModal
          isOpen={isPortfolioOpen}
          onClose={() => setIsPortfolioOpen(false)}
          currentUser={currentUser}
          tickers={tickers}
          onUserUpdate={(updatedUser) => setCurrentUser({ ...updatedUser })}
        />

        {/* Mobile App & Google Play Store Deployment Hub */}
        <MobileAppDeploymentHub
          isOpen={isMobileHubOpen}
          onClose={() => setIsMobileHubOpen(false)}
        />

        {/* Gmail Signal Alert Modal */}
        <GmailAlertModal
          isOpen={isGmailModalOpen}
          onClose={() => setIsGmailModalOpen(false)}
          topTenSignals={generateTopTenSignals(tickers)}
        />
      </MobileFrame>
    </div>
  );
}
