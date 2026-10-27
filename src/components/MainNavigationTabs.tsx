import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Activity,
  TrendingDown,
  Camera,
  Coins,
  BrainCircuit,
  Sparkles,
  Zap,
  Flame,
  Globe,
  ShieldAlert,
  Droplets,
  Trophy,
  BookOpen,
  Brain,
  Grid,
  X,
  ChevronUp,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export type MainTabType =
  | 'dashboard'
  | 'ai_council_pro'
  | 'top10_high_win'
  | 'exness_signals'
  | 'coinglass_liquidity'
  | 'fundamental_hub'
  | 'market_psychology'
  | 'bulls_scanner'
  | 'meme_radar'
  | 'volume'
  | 'time_zones'
  | 'strategy'
  | 'risk_guard'
  | 'chart_analyzer'
  | 'coins'
  | 'ai_memory';

interface MainNavigationTabsProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
}

interface TabItem {
  id: MainTabType;
  label: string;
  shortLabel: string;
  subLabel: string;
  category: 'core' | 'signals' | 'analysis' | 'tools';
  icon: React.ElementType;
  badge?: string;
  color?: string;
}

export const MainNavigationTabs: React.FC<MainNavigationTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const tabs: TabItem[] = [
    {
      id: 'dashboard',
      label: 'ড্যাশবোর্ড',
      shortLabel: 'ড্যাশবোর্ড',
      subLabel: 'মার্কেট ওভারভিউ',
      category: 'core',
      icon: LayoutDashboard,
      color: 'text-amber-400',
    },
    {
      id: 'ai_council_pro',
      label: '🧠 AI COUNCIL PRO',
      shortLabel: 'Council Pro',
      subLabel: '১২ সিনিয়র কাউন্সিল ও মাস্টার ডিসিশন',
      category: 'core',
      icon: BrainCircuit,
      badge: 'VIP PRO',
      color: 'text-purple-400',
    },
    {
      id: 'top10_high_win',
      label: 'টপ ১০ সিগন্যাল',
      shortLabel: '১০ সিগন্যাল',
      subLabel: '৮০-১০০% উইন রেট',
      category: 'signals',
      icon: Trophy,
      badge: '90% WIN',
      color: 'text-emerald-400',
    },
    {
      id: 'exness_signals',
      label: 'Exness ফরেক্স ও গোল্ড',
      shortLabel: 'Exness গোল্ড',
      subLabel: 'XAUUSD & Forex VIP',
      category: 'signals',
      icon: Coins,
      badge: '👑 GOLD',
      color: 'text-amber-400',
    },
    {
      id: 'coinglass_liquidity',
      label: 'CoinGlass লিকুইডিটি',
      shortLabel: 'লিকুইডিটি',
      subLabel: 'ইনফ্লো / ড্রেইন ট্র্যাকার',
      category: 'analysis',
      icon: Droplets,
      badge: 'FLOW',
      color: 'text-cyan-400',
    },
    {
      id: 'fundamental_hub',
      label: 'ফান্ডামেন্টাল হাব',
      shortLabel: 'ফান্ডামেন্টাল',
      subLabel: 'ডাটা সোর্স ও লিংকস',
      category: 'analysis',
      icon: BookOpen,
      badge: 'PRO',
      color: 'text-blue-400',
    },
    {
      id: 'market_psychology',
      label: 'নিউজের সাইকোলজি',
      shortLabel: 'সাইকোলজি',
      subLabel: 'আপ/ডাউন ইন্টারপ্রিটেশন',
      category: 'analysis',
      icon: Brain,
      badge: 'RADAR',
      color: 'text-purple-400',
    },
    {
      id: 'bulls_scanner',
      label: 'GrowingBulls',
      shortLabel: 'পাম্প স্ক্যানার',
      subLabel: 'পাম্প ব্রেকআউট স্ক্যানার',
      category: 'signals',
      icon: Zap,
      badge: '🚀 45m',
      color: 'text-amber-400',
    },
    {
      id: 'meme_radar',
      label: 'মীম কয়েন',
      shortLabel: 'মীম রাডার',
      subLabel: 'হাই-প্রফিট রাডার',
      category: 'signals',
      icon: Flame,
      badge: '🔥 HOT',
      color: 'text-rose-400',
    },
    {
      id: 'strategy',
      label: 'লস রিকভারি ও সেফটি',
      shortLabel: 'লস রিকভারি',
      subLabel: 'কম্পাউন্ড প্ল্যান & স্ট্র্যাটেজি',
      category: 'signals',
      icon: TrendingDown,
      badge: 'SAFE',
      color: 'text-emerald-400',
    },
    {
      id: 'volume',
      label: 'ভলিউম অ্যানালাইসিস',
      shortLabel: 'ভলিউম',
      subLabel: 'অস্থির ও স্থির কয়েন',
      category: 'tools',
      icon: Activity,
      badge: 'LIVE',
      color: 'text-yellow-400',
    },
    {
      id: 'time_zones',
      label: 'বিডি টাইম গাইড',
      shortLabel: 'সেশন গাইড',
      subLabel: 'মার্কেট সেশন ও সময়',
      category: 'tools',
      icon: Globe,
      badge: 'BD GMT+6',
      color: 'text-teal-400',
    },
    {
      id: 'risk_guard',
      label: 'রিস্ক গার্ড',
      shortLabel: 'রিস্ক গার্ড',
      subLabel: 'অ্যানোমালি ও সুরক্ষা',
      category: 'tools',
      icon: ShieldAlert,
      badge: 'RISK',
      color: 'text-red-400',
    },
    {
      id: 'chart_analyzer',
      label: 'চার্ট অ্যানালাইজার',
      shortLabel: 'চার্ট AI',
      subLabel: 'ছবি আপলোড ও বিশ্লেষণ',
      category: 'tools',
      icon: Camera,
      badge: 'AI',
      color: 'text-indigo-400',
    },
    {
      id: 'coins',
      label: 'সব কয়েন',
      shortLabel: 'সব কয়েন',
      subLabel: 'মার্কেট তালিকা',
      category: 'core',
      icon: Coins,
      color: 'text-amber-400',
    },
    {
      id: 'ai_memory',
      label: 'এআই সেলফ-লার্নিং মেমরি',
      shortLabel: 'AI মেমরি',
      subLabel: '৩s সেলফ লার্নিং ও লাইভ ট্রেড লগ',
      category: 'tools',
      icon: BrainCircuit,
      badge: '🧠 3s LIVE',
      color: 'text-amber-400',
    },
  ];

  // Auto-scroll active tab into view in the horizontal dock
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeTab]);

  const handleSelect = (tabId: MainTabType) => {
    onSelectTab(tabId);
    setIsMenuOpen(false);
  };

  const activeTabItem = tabs.find((t) => t.id === activeTab) || tabs[0];

  return (
    <>
      {/* 1. Backdrop Overlay for Full Hub Drawer on Mobile */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 transition-opacity animate-fadeIn"
          aria-hidden="true"
        />
      )}

      {/* 2. Expandable Bottom Sheet / Full Hub Grid Drawer */}
      {isMenuOpen && (
        <div
          className="fixed bottom-[68px] sm:bottom-[76px] left-0 right-0 max-w-lg mx-auto bg-slate-900/95 border border-amber-500/30 rounded-t-3xl sm:rounded-2xl shadow-2xl z-50 p-4 pb-5 backdrop-blur-2xl animate-slideUp text-slate-100 max-h-[75vh] overflow-y-auto"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                  সব ট্রেডিং হাব ও টুলস
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono font-bold">
                    ১৪টি হাব
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">এক ক্লিকেই যেকোনো সেকশনে যান</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Grid of All Hubs */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelect(tab.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 border-amber-400 shadow-md font-bold'
                      : 'bg-slate-950/80 hover:bg-slate-800 text-slate-200 border-slate-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 ' + tab.color
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black truncate">{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`text-[8px] font-black uppercase px-1 py-0.2 rounded shrink-0 ${
                            isActive
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] block truncate ${
                        isActive ? 'text-slate-900 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {tab.subLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Bottom-Anchored Persistent Floating Navigation Menu */}
      <nav
        aria-label="Main Navigation"
        className="fixed bottom-0 left-0 right-0 sm:bottom-3 z-40 pointer-events-none flex justify-center px-0 sm:px-4"
      >
        <div
          className="pointer-events-auto w-full sm:max-w-5xl bg-slate-950/95 sm:bg-slate-950/90 backdrop-blur-2xl border-t sm:border border-slate-800/90 sm:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.7)] sm:shadow-2xl flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2"
          style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
        >
          {/* Scrollable Horizontal Icon Dock with Explicit Bengali Labels */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-0.5"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : null}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  aria-label={tab.label}
                  className={`group relative flex flex-col items-center justify-center min-w-[62px] sm:min-w-[74px] px-2 py-1.5 rounded-xl transition-all duration-200 shrink-0 active:scale-95 border ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/25 font-black scale-[1.02]'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800'
                  }`}
                >
                  {/* Badge Notification Indicator */}
                  {tab.badge && (
                    <span
                      className={`absolute -top-1.5 right-0.5 text-[7.5px] font-black uppercase px-1 py-0.2 rounded-full border shadow-sm ${
                        isActive
                          ? 'bg-slate-950 text-amber-400 border-amber-400/50'
                          : 'bg-amber-500/90 text-slate-950 border-amber-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}

                  {/* Icon */}
                  <Icon
                    className={`w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5 transition-transform duration-200 ${
                      isActive
                        ? 'text-slate-950 scale-110'
                        : 'group-hover:scale-110 ' + tab.color
                    }`}
                  />

                  {/* Explicit Text Label for Clarity & One-Handed Reach */}
                  <span
                    className={`text-[9.5px] sm:text-[10.5px] font-bold leading-tight tracking-tight whitespace-nowrap ${
                      isActive ? 'text-slate-950 font-black' : 'text-slate-300'
                    }`}
                  >
                    {tab.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Hub Grid / "More" Drawer Button on Mobile & Desktop */}
          <div className="shrink-0 pl-1 border-l border-slate-800">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label={isMenuOpen ? 'Close all hubs menu' : 'Open all hubs menu'}
              className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[58px] px-2 py-1.5 rounded-xl border transition-all active:scale-95 ${
                isMenuOpen
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 border-amber-500/30'
              }`}
            >
              {isMenuOpen ? (
                <ChevronUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5 rotate-180 transition-transform" />
              ) : (
                <Grid className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5 animate-pulse" />
              )}
              <span className="text-[9.5px] sm:text-[10.5px] font-black whitespace-nowrap">
                {isMenuOpen ? 'বন্ধ' : 'সব হাব'}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
