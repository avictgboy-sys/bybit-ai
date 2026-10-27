import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Zap,
  Sun,
  Waves,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Scale,
  Percent,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import {
  TradeStyleMode,
  SlBufferMode,
  SL_BUFFER_PRESETS,
  TRADE_STYLE_PRESETS,
  TradeStyleAnalyzerService,
  UserTradeProfile
} from '../../services/aiCouncilPro/tradeStyleAnalyzer';

interface TradeStyleSelectorProps {
  onProfileChange?: (profile: UserTradeProfile) => void;
  compact?: boolean;
}

export const TradeStyleSelector: React.FC<TradeStyleSelectorProps> = ({
  onProfileChange,
  compact = false,
}) => {
  const [profile, setProfile] = useState<UserTradeProfile>(() =>
    TradeStyleAnalyzerService.getUserProfile()
  );

  const activeConfig = TRADE_STYLE_PRESETS[profile.activeStyle];

  const handleStyleChange = (style: TradeStyleMode) => {
    const updated: UserTradeProfile = {
      ...profile,
      activeStyle: style,
    };
    setProfile(updated);
    TradeStyleAnalyzerService.saveUserProfile(updated);
    if (onProfileChange) onProfileChange(updated);
  };

  const handleRiskChange = (risk: number) => {
    const updated: UserTradeProfile = {
      ...profile,
      userRiskTolerancePcnt: risk,
    };
    setProfile(updated);
    TradeStyleAnalyzerService.saveUserProfile(updated);
    if (onProfileChange) onProfileChange(updated);
  };

  const handleSlBufferChange = (mode: SlBufferMode) => {
    const updated: UserTradeProfile = {
      ...profile,
      slBufferMode: mode,
    };
    setProfile(updated);
    TradeStyleAnalyzerService.saveUserProfile(updated);
    if (onProfileChange) onProfileChange(updated);
  };

  const styleIcons: Record<TradeStyleMode, React.ElementType> = {
    SCALPING: Zap,
    DAY_TRADING: Sun,
    SWING_TRADING: Waves,
    POSITION_TRADING: Landmark,
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
        {(Object.keys(TRADE_STYLE_PRESETS) as TradeStyleMode[]).map((styleKey) => {
          const cfg = TRADE_STYLE_PRESETS[styleKey];
          const isSelected = profile.activeStyle === styleKey;
          const Icon = styleIcons[styleKey];

          return (
            <button
              key={styleKey}
              type="button"
              onClick={() => handleStyleChange(styleKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cfg.primaryTimeframe}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
              <span>ট্রেড স্টাইল অ্যানালাইজার (Trade Style Mode)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                ACTIVE
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              আপনার পছন্দের স্টাইল সিলেক্ট করুন। ১২ জন সিনিয়র ট্রেডার এই টাইমফ্রেম ও এসএল মডেলে সিগন্যাল তৈরি করবেন।
            </p>
          </div>
        </div>

        {/* Current Active Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-right">
          <div className="text-[9px] text-slate-400 font-bold uppercase">সক্রিয় স্টাইল</div>
          <div className="text-xs font-black text-indigo-400 font-mono">
            {activeConfig.nameBn.split(' ')[0]} • TF: {activeConfig.primaryTimeframe}
          </div>
        </div>
      </div>

      {/* 4 Style Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.keys(TRADE_STYLE_PRESETS) as TradeStyleMode[]).map((styleKey) => {
          const cfg = TRADE_STYLE_PRESETS[styleKey];
          const isSelected = profile.activeStyle === styleKey;
          const Icon = styleIcons[styleKey];

          return (
            <div
              key={styleKey}
              onClick={() => handleStyleChange(styleKey)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900 border-indigo-500 ring-2 ring-indigo-500/25 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>সিলেক্টেড</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-100 group-hover:text-indigo-300 transition-colors">
                    {cfg.nameBn}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {cfg.taglineBn}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>প্রাইমারি TF:</span>
                    <strong className="text-slate-200">{cfg.primaryTimeframe}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>কনফার্মেশন:</span>
                    <strong className="text-slate-300">{cfg.confirmationTimeframe}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>হোল্ডিং সময়:</span>
                    <strong className="text-slate-300 text-[10px]">{cfg.holdingDurationBn}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>রিস্ক-রিওয়ার্ড:</span>
                    <strong className="text-emerald-400">{cfg.defaultRiskRewardRatio}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>লেভারেজ গাইড:</span>
                    <strong className="text-amber-400 text-[10px]">{cfg.recommendedLeverageRange}</strong>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Tolerance & Council Optimization Details */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 max-w-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" />
            <span>কাউন্সিলের ট্রেডিং প্রায়োরিটি ({activeConfig.primaryTimeframe} স্টাইল)</span>
          </div>
          <p className="text-slate-300 font-medium leading-relaxed">
            {activeConfig.councilFocusPriorityBn}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {/* SL Cushion Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs font-bold">SL কুশন:</span>
            {(['TIGHT', 'SAFE_STRUCTURAL', 'WIDE_CUSHION'] as SlBufferMode[]).map((m) => {
              const conf = SL_BUFFER_PRESETS[m];
              const isSelected = (profile.slBufferMode || 'SAFE_STRUCTURAL') === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleSlBufferChange(m)}
                  title={conf.descriptionBn}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'SAFE_STRUCTURAL' ? '🛡️ নিরাপদ' : m === 'WIDE_CUSHION' ? '🌊 ওয়াইড' : 'টাইট'}
                </button>
              );
            })}
          </div>

          {/* Risk % Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs font-bold">ঝুঁকি:</span>
            {[1.0, 1.5, 2.0, 3.0].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRiskChange(r)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  profile.userRiskTolerancePcnt === r
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
