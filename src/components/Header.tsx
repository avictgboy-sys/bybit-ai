import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Bell,
  RefreshCw,
  Settings,
  Shield,
  Maximize2,
  Smartphone,
  Globe,
  User,
  ShieldCheck,
  Briefcase,
  LogOut,
  Send,
  Menu,
  X,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Zap,
  Mail,
  BrainCircuit,
} from 'lucide-react';
import { AppSettings, TickerData } from '../types';
import { getTranslation } from '../lib/translations';
import { UserAccount } from '../services/authService';
import { TelegramService } from '../services/telegramService';
import { MainTabType } from './MainNavigationTabs';
import { formatPrice } from '../utils/formatters';

interface HeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenSearch?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenPortfolio: () => void;
  onOpenMobileHub: () => void;
  onOpenTelegramWebhook?: () => void;
  onOpenGmailModal?: () => void;
  onOpenBybitConfig?: () => void;
  onLogout: () => void;
  tickers?: TickerData[];
  onSelectCoin?: (coin: TickerData) => void;
  onSelectTab?: (tab: MainTabType) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onRefresh,
  isRefreshing,
  onOpenSearch,
  onOpenSettings,
  onOpenNotifications,
  unreadNotificationCount,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  onOpenPortfolio,
  onOpenMobileHub,
  onOpenTelegramWebhook,
  onOpenGmailModal,
  onOpenBybitConfig,
  onLogout,
  tickers = [],
  onSelectCoin,
  onSelectTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isBn = settings.language === 'bn';
  const isTelegramActive = TelegramService.isConfigured();

  const toggleLanguage = () => {
    onUpdateSettings({ language: isBn ? 'en' : 'bn' });
  };

  // Close search overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching coins for instant live dropdown
  const matchingCoins = searchQuery.trim()
    ? tickers.filter(
        (t) =>
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.baseCoin.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectCoinResult = (coin: TickerData) => {
    setIsSearchFocused(false);
    if (onSelectCoin) {
      onSelectCoin(coin);
    }
  };

  const handleCreateCustomCoin = (symbolQuery: string) => {
    const upperSymbol = symbolQuery.trim().toUpperCase().replace('USDT', '');
    const newCustomTicker: TickerData = {
      symbol: `${upperSymbol}USDT`,
      baseCoin: upperSymbol,
      quoteCoin: 'USDT',
      lastPrice: 1.0,
      prevPrice24h: 0.98,
      price24hPcnt: 0.0204,
      highPrice24h: 1.05,
      lowPrice24h: 0.95,
      turnover24h: 10000000,
      volume24h: 10000000,
    };
    setIsSearchFocused(false);
    if (onSelectCoin) {
      onSelectCoin(newCustomTicker);
    }
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-3 sm:px-6 py-2 transition-colors duration-200 max-w-full overflow-visible">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Top Bar on Mobile: Brand Logo + Primary Quick Actions */}
        <div className="flex items-center justify-between gap-2 w-full md:w-auto">
          {/* Brand Logo & Capital Protection Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">
                  {getTranslation(settings.language, 'appName')}{' '}
                  <span className="text-amber-400 font-extrabold">
                    {getTranslation(settings.language, 'appPro')}
                  </span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden xs:inline-block">
                  V5 AI
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions for Mobile */}
          <div className="flex items-center gap-1 md:hidden">
            {/* AI Council Pro Mobile Quick Button */}
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab('ai_council_pro')}
                className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/50 text-purple-200 font-bold text-[11px] flex items-center gap-1 min-h-[36px] shadow-sm"
                title="AI Council Pro"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-extrabold text-[10px]">Council Pro</span>
              </button>
            )}

            {/* Admin Direct Button on Mobile */}
            {currentUser && (currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'avictgboy@gmail.com') && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-2 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 min-h-[36px] shadow-sm animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>👑 এডমিন</span>
              </button>
            )}

            {/* User Auth / Profile */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenPortfolio}
                className="px-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[11px] flex items-center gap-1 min-h-[36px]"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[60px] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm min-h-[36px]"
              >
                <User className="w-3.5 h-3.5" />
                <span>লগইন</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="p-2 rounded-lg text-slate-300 hover:text-amber-400 bg-slate-800/80 border border-slate-700 relative min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg text-slate-300 hover:text-amber-400 bg-slate-800/80 border border-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Interactive Search Bar Container */}
        <div ref={searchContainerRef} className="w-full md:flex-1 md:max-w-xs lg:max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="🔍 কয়েন সার্চ করুন (যেমন: BTC, ETH, SOL, DOGE)..."
              value={searchQuery}
              onFocus={() => {
                setIsSearchFocused(true);
                if (onOpenSearch) onOpenSearch();
              }}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setIsSearchFocused(true);
                if (val.trim() && onSelectTab) {
                  onSelectTab('coins');
                }
              }}
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 focus:border-amber-400/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-200 text-xs rounded-full hover:bg-slate-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Live Search Instant Overlay Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-2.5 z-50 max-h-[360px] overflow-y-auto custom-scrollbar animate-fadeIn space-y-1.5">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-800">
                <span>সার্চ এর ফলাফল ({matchingCoins.length})</span>
                <span className="text-amber-400 text-[10px]">এক ক্লিকে ক্লিক করুন</span>
              </div>

              {matchingCoins.length === 0 ? (
                <div className="p-3 text-center space-y-2">
                  <p className="text-xs text-slate-300">
                    '<strong>{searchQuery}</strong>' কয়েনটি বাইবিট লিস্টে পাওয়া যায়নি।
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCreateCustomCoin(searchQuery)}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{searchQuery.toUpperCase()}USDT লাইভ ট্রেড অ্যানালাইসিস শুরু করুন</span>
                  </button>
                </div>
              ) : (
                matchingCoins.slice(0, 8).map((coin) => {
                  const pcnt = coin.price24hPcnt * 100;
                  const isPositive = pcnt >= 0;

                  return (
                    <div
                      key={coin.symbol}
                      onClick={() => handleSelectCoinResult(coin)}
                      className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between gap-2 group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-amber-400 text-xs font-mono">
                          {coin.baseCoin.substring(0, 3)}
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-100 group-hover:text-amber-400 transition-colors">
                            {coin.baseCoin} <span className="text-[10px] text-slate-400">/USDT</span>
                          </div>
                          {/* Volume Flow & Recommendation Bengali Badges */}
                          <div className="flex items-center gap-1 mt-0.5">
                            {isPositive ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                🟢 ভলিউম প্রবেশ করছে
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                                🔴 ভলিউম প্রস্থান করছে
                              </span>
                            )}
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              {isPositive ? '🟢 LONG রেকমেন্ড' : '🔴 SHORT রেকমেন্ড'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black font-mono text-slate-100">
                          {formatPrice(coin.lastPrice)}
                        </div>
                        <div
                          className={`text-[10px] font-bold font-mono ${
                            isPositive ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {pcnt.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Desktop Action Controls OR Mobile Expanded Menu Drawer */}
        <div
          className={`${
            mobileMenuOpen ? 'flex' : 'hidden md:flex'
          } flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80`}
        >
          {/* AI Council Pro Direct Quick Button */}
          {onSelectTab && (
            <button
              type="button"
              onClick={() => {
                onSelectTab('ai_council_pro');
                setMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/25 via-indigo-500/25 to-purple-500/25 hover:from-purple-500/35 hover:to-indigo-500/35 border border-purple-500/50 text-purple-200 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-purple-500/10 group active:scale-95"
              title="১২ প্রাতিষ্ঠানিক এআই কাউন্সেলর ও মাস্টার ডিসিশন রুম"
            >
              <BrainCircuit className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              <span>AI Council Pro</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-500/30 text-purple-300 border border-purple-500/40 uppercase">
                VIP
              </span>
            </button>
          )}

          {/* Telegram Webhook Integration Button */}
          {onOpenTelegramWebhook && (
            <button
              type="button"
              onClick={() => {
                onOpenTelegramWebhook();
                setMobileMenuOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                isTelegramActive
                  ? 'bg-sky-500/15 hover:bg-sky-500/25 border-sky-500/40 text-sky-400'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-sky-400'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram Bot</span>
              <span className={`w-2 h-2 rounded-full ${isTelegramActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            </button>
          )}

          {/* Gmail Signal Alert Button */}
          {onOpenGmailModal && (
            <button
              type="button"
              onClick={() => {
                onOpenGmailModal();
                setMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Mail className="w-3.5 h-3.5 text-red-400" />
              <span>Gmail Alerts</span>
            </button>
          )}

          {/* Bybit API Bot Integration Button */}
          {onOpenBybitConfig && (
            <button
              type="button"
              onClick={() => {
                onOpenBybitConfig();
                setMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              title="বাইবিট API Key ও স্বয়ংক্রিয় ট্রেডিং কনফিগারেশন"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Bybit API</span>
            </button>
          )}

          {/* User Portfolio Button */}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                onOpenPortfolio();
                setMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>মাই পোর্টফোলিও</span>
            </button>
          )}

          {/* Admin Panel Button - ONLY visible to authenticated Admins */}
          {(currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'avictgboy@gmail.com' || currentUser?.email?.toLowerCase() === 'admin@bybitai.com') && (
            <button
              type="button"
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>👑 এডমিন কন্ট্রোল</span>
            </button>
          )}

          {/* User Auth / Profile Badge (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {currentUser ? (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={onOpenPortfolio}
                  className="px-2 py-0.5 text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-[80px] truncate">{currentUser.name}</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  title="লগআউট করুন"
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-md"
              >
                <User className="w-3.5 h-3.5" />
                <span>লগইন / সাইন-আপ</span>
              </button>
            )}
          </div>

          {/* Quick Language Switcher Button (Bengali / English) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Refresh Button (Desktop) */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden md:flex p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 border border-slate-800 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* Notification Bell (Desktop) */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="hidden md:flex p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 border border-slate-800 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Android Mobile Frame Toggle */}
          <button
            type="button"
            onClick={() => {
              onUpdateSettings({ showMobileFrame: !settings.showMobileFrame });
              setMobileMenuOpen(false);
            }}
            className={`p-1.5 sm:p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-medium ${
              settings.showMobileFrame
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {settings.showMobileFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{getTranslation(settings.language, 'fullDesk')}</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>{getTranslation(settings.language, 'androidView')}</span>
              </>
            )}
          </button>

          {/* Settings Modal Toggle */}
          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 border border-slate-800 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Settings className="w-4 h-4" />
            <span className="md:hidden">সেটিংস</span>
          </button>

          {/* Mobile Logout Button if Logged In */}
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                onLogout();
                setMobileMenuOpen(false);
              }}
              className="md:hidden px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
