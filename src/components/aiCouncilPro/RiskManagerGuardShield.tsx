import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  DollarSign,
  Percent,
  Sliders,
  Scale,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  RiskManagerGuardService,
  UserRiskProfile,
  PositionCalculationResult
} from '../../services/aiCouncilPro/riskManagerGuard';
import { formatPrice } from '../../utils/formatters';

interface RiskManagerGuardShieldProps {
  currentPrice: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  assetSymbol?: string;
  isLong?: boolean;
}

export const RiskManagerGuardShield: React.FC<RiskManagerGuardShieldProps> = ({
  currentPrice,
  stopLossPrice,
  takeProfitPrice,
  assetSymbol = 'BTCUSDT',
  isLong = true,
}) => {
  // Load initial user profile
  const [profile, setProfile] = useState<UserRiskProfile>(() =>
    RiskManagerGuardService.getUserRiskProfile()
  );

  const [balanceInput, setBalanceInput] = useState<string>(profile.accountBalanceUsd.toString());
  const [leverage, setLeverage] = useState<number>(3);
  const [riskPcnt, setRiskPcnt] = useState<number>(profile.riskPerTradePcnt);

  // Dynamic or fallback SL / TP
  const effectivePrice = currentPrice > 0 ? currentPrice : 90000;
  const effectiveSL = stopLossPrice || (isLong ? effectivePrice * 0.98 : effectivePrice * 1.02);
  const effectiveTP = takeProfitPrice || (isLong ? effectivePrice * 1.05 : effectivePrice * 0.95);

  const balanceNumber = parseFloat(balanceInput) || 1000;

  // Run audit through RiskManagerGuardService
  const calculation: PositionCalculationResult = useMemo(() => {
    return RiskManagerGuardService.auditTradeRisk({
      accountBalanceUsd: balanceNumber,
      riskPerTradePcnt: riskPcnt,
      entryPrice: effectivePrice,
      stopLossPrice: effectiveSL,
      takeProfitPrice: effectiveTP,
      leverage,
      isLong,
    });
  }, [balanceNumber, riskPcnt, effectivePrice, effectiveSL, effectiveTP, leverage, isLong]);

  // Handle balance change
  const handleBalanceChange = (newBalance: number) => {
    setBalanceInput(newBalance.toString());
    const updated: UserRiskProfile = {
      ...profile,
      accountBalanceUsd: newBalance,
    };
    setProfile(updated);
    RiskManagerGuardService.saveUserRiskProfile(updated);
  };

  const handleRiskChange = (newRisk: number) => {
    setRiskPcnt(newRisk);
    const updated: UserRiskProfile = {
      ...profile,
      riskPerTradePcnt: newRisk,
    };
    setProfile(updated);
    RiskManagerGuardService.saveUserRiskProfile(updated);
  };

  const isApproved = calculation.status === 'PASSED_APPROVED';
  const isWarning = calculation.status === 'WARNING_ADJUST_SL';

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-6 shadow-2xl">
      {/* 1. Header with CRO Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-100">
                রিস্ক ম্যানেজার গার্ড ও ড্র-ডাউন শিল্ড (Risk Guard & Position Sizer)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                CRO GATEKEEPER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              অ্যাকাউন্ট ক্যাপিটাল সুরক্ষা, গাণিতিক পজিশন সাইজিং ও লিকুইডেশন শিল্ড ভ্যালিডেশন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">মার্জিন মোড:</span>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                const updated = { ...profile, preferredMarginMode: 'ISOLATED' as const };
                setProfile(updated);
                RiskManagerGuardService.saveUserRiskProfile(updated);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                profile.preferredMarginMode === 'ISOLATED'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400'
              }`}
            >
              ISOLATED
            </button>
            <button
              type="button"
              onClick={() => {
                const updated = { ...profile, preferredMarginMode: 'CROSS' as const };
                setProfile(updated);
                RiskManagerGuardService.saveUserRiskProfile(updated);
              }}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition ${
                profile.preferredMarginMode === 'CROSS'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400'
              }`}
            >
              CROSS
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Input Controls: Balance, Risk %, Leverage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
        {/* Account Balance */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>অ্যাকাউন্ট ব্যালান্স (USDT)</span>
            <span className="text-[10px] text-slate-500 font-mono">Live Capital</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => {
                setBalanceInput(e.target.value);
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) handleBalanceChange(val);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono font-bold text-sm focus:border-rose-500 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {[200, 500, 1000, 2500, 5000, 10000].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => handleBalanceChange(b)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition ${
                  balanceNumber === b
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ${b}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Per Trade */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>প্রতি ট্রেডে ঝুঁকি (% Risk)</span>
            <span className="text-xs font-mono font-bold text-rose-400">
              ${calculation.dollarRisk.toFixed(2)}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[0.5, 1.0, 1.5, 2.0].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRiskChange(r)}
                className={`py-2 rounded-xl text-xs font-mono font-bold transition ${
                  riskPcnt === r
                    ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            প্রাতিষ্ঠানিক নিয়ম: কোনো সিঙ্গেল ট্রেডে ১.৫%-এর বেশি ঝুঁকি নেওয়া অনুচিত।
          </p>
        </div>

        {/* Leverage Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>সিলেক্টেড লেভারেজ</span>
            <span className="text-[10px] text-slate-500 font-mono">
              সর্বোচ্চ নিরাপদ: {calculation.maxSafeLeverage}x
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 5, 10].map((lev) => {
              const isOver = lev > calculation.maxSafeLeverage;
              return (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition ${
                    leverage === lev
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : isOver
                      ? 'bg-slate-900/60 text-slate-500 border border-slate-800'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-slate-100'
                  }`}
                >
                  {lev}x
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            লিকুইডেশন বাফার: {calculation.liquidationBufferPcnt.toFixed(1)}% (স্টপ লসের অনেক দূরে)
          </p>
        </div>
      </div>

      {/* 3. Uncompromising Verdict Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isApproved
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : isWarning
            ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {isApproved ? (
            <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
          ) : isWarning ? (
            <AlertTriangle className="w-6 h-6 shrink-0 text-amber-400" />
          ) : (
            <ShieldAlert className="w-6 h-6 shrink-0 text-rose-400" />
          )}
          <div>
            <h4 className="text-sm sm:text-base font-black tracking-tight">
              {calculation.verdictTitleBn}
            </h4>
            <p className="text-xs opacity-90 leading-snug">
              {calculation.verdictMessageBn}
            </p>
          </div>
        </div>

        <div className="shrink-0 font-mono text-xs font-bold px-3 py-1 rounded-xl bg-black/40 border border-white/10">
          R:R {calculation.riskRewardRatioLabel}
        </div>
      </div>

      {/* 4. Mathematical Outputs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Output 1: Recommended Position Size */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">প্রস্তাবিত পজিশন সাইজ</div>
          <div className="text-base sm:text-lg font-black text-slate-100 font-mono">
            ${calculation.recommendedPositionSizeUsd.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            ≈ {calculation.positionQuantity.toFixed(4)} {assetSymbol.replace('USDT', '')}
          </div>
        </div>

        {/* Output 2: Required Margin */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">প্রয়োজনীয় মার্জিন ({leverage}x)</div>
          <div className="text-base sm:text-lg font-black text-indigo-300 font-mono">
            ${calculation.requiredMarginUsd.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            অ্যাকাউন্টের {((calculation.requiredMarginUsd / balanceNumber) * 100).toFixed(1)}% মার্জিন
          </div>
        </div>

        {/* Output 3: Max Dollar Risk */}
        <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-1">
          <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>সর্বোচ্চ লস (SL হিট হলে)</span>
          </div>
          <div className="text-base sm:text-lg font-black text-rose-300 font-mono">
            -${calculation.dollarRisk.toFixed(2)}
          </div>
          <div className="text-[10px] text-rose-400 font-mono">
            ঠিক {riskPcnt}% মূলধন কাটা যাবে
          </div>
        </div>

        {/* Output 4: Estimated Liquidation Price */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>আনুমানিক লিকুইডেশন</span>
          </div>
          <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
            ${formatPrice(calculation.estimatedLiquidationPrice)}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>SL আগে হিট করবে</span>
          </div>
        </div>
      </div>

      {/* 5. CRO Audit Checklist */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>চিফ রিস্ক অফিসার (CRO) অডিট চেকলিস্ট</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {calculation.actionChecklistBn.map((item, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 flex items-center gap-2"
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
