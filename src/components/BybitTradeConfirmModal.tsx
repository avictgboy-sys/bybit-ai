import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowRight,
  X,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { BybitTradingService, BybitTradeOrderParams, BybitApiConfig } from '../services/bybitTradingService';
import { UserAccount } from '../services/authService';

export interface TradeSignalTarget {
  symbol: string;
  baseCoin: string;
  direction: 'LONG' | 'SHORT';
  currentPrice: number;
  entryZoneMin?: number;
  entryZoneMax?: number;
  tp1: number;
  tp2?: number;
  sl: number;
  tp1Pcnt?: number;
  slPcnt?: number;
  winRate?: number;
  reasonBn?: string;
}

interface BybitTradeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: TradeSignalTarget | null;
  currentUser: UserAccount | null;
  onOpenBybitConfig: () => void;
}

export const BybitTradeConfirmModal: React.FC<BybitTradeConfirmModalProps> = ({
  isOpen,
  onClose,
  signal,
  currentUser,
  onOpenBybitConfig,
}) => {
  const [config, setConfig] = useState<BybitApiConfig | null>(null);
  const [marginUsd, setMarginUsd] = useState<number>(20);
  const [leverage, setLeverage] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = BybitTradingService.getConfig(currentUser?.email);
      setConfig(cfg);
      if (cfg?.defaultLeverage) {
        setLeverage(cfg.defaultLeverage);
      }
      setResult(null);
    }
  }, [isOpen, currentUser?.email]);

  if (!isOpen || !signal) return null;

  const isConfigured = Boolean(config && config.apiKey && config.apiSecret);
  const isLong = signal.direction === 'LONG';
  const positionValueUsd = marginUsd * leverage;
  const estimatedQty = signal.currentPrice > 0 ? (positionValueUsd / signal.currentPrice).toFixed(4) : '0';

  const potentialProfitTp1 = ((marginUsd * (signal.tp1Pcnt || 2.5) * leverage) / 100).toFixed(2);
  const potentialLoss = ((marginUsd * (signal.slPcnt || 1.8) * leverage) / 100).toFixed(2);

  const handleExecuteTrade = async () => {
    if (!isConfigured) {
      onOpenBybitConfig();
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const params: BybitTradeOrderParams = {
      symbol: signal.symbol,
      side: isLong ? 'Buy' : 'Sell',
      orderType: 'Market',
      marginUsd,
      qty: estimatedQty,
      stopLoss: signal.sl.toString(),
      takeProfit: signal.tp1.toString(),
      tp2: signal.tp2?.toString(),
      leverage,
      noteBn: signal.reasonBn,
    };

    const res = await BybitTradingService.executeOrder(params, currentUser?.email);
    setIsSubmitting(false);

    if (res.success) {
      setResult({
        success: true,
        message: res.message || `অর্ডার সফলভাবে Bybit এ প্লেস হয়েছে! OrderID: ${res.orderId || 'V5-LIVE'}`,
      });
    } else {
      setResult({
        success: false,
        error: res.error || 'অর্ডার প্লেস করা সম্ভব হয়নি।',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                isLong ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {isLong ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-100 font-mono">
                  {signal.baseCoin}/USDT Bybit অর্ডার
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isLong ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isLong ? '🟢 LONG (BUY)' : '🔴 SHORT (SELL)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                স্বয়ংক্রিয় সেফটি এসএল ও টিপি সহ Bybit V5 পারপেচুয়াল কন্ট্রাক্ট
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Bybit API Status */}
          {!isConfigured ? (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-amber-300">
                <Lock className="w-5 h-5 shrink-0 text-amber-400" />
                <span className="text-xs">
                  Bybit API Key এখনও কানেক্ট করা হয়নি। অটো-ট্রেড করতে কী সেটআপ করুন।
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBybitConfig();
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shrink-0 whitespace-nowrap shadow-sm"
              >
                কী সেটআপ করুন
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                Bybit অ্যাকাউন্ট সংযুক্ত ({config?.isTestnet ? '🧪 টেস্টনেট' : '🚀 মেইননেট'})
              </span>
              {config?.lastWalletBalance !== undefined && (
                <span className="font-mono text-slate-300 font-bold flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  ব্যালেন্স: ${config.lastWalletBalance.toFixed(2)} USDT
                </span>
              )}
            </div>
          )}

          {/* Trade Parameters Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">বর্তমান দাম</span>
              <span className="text-xs sm:text-sm font-black text-slate-100 font-mono">
                ${signal.currentPrice.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                টার্গেট ১ (TP1)
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                ${signal.tp1.toLocaleString()}
              </span>
            </div>

            {signal.tp2 && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                  টার্গেট ২ (TP2)
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-300 font-mono">
                  ${signal.tp2.toLocaleString()}
                </span>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-950 border border-rose-500/30">
              <span className="text-[10px] text-rose-400 uppercase font-bold block">
                সেফটি এসএল (SL)
              </span>
              <span className="text-xs sm:text-sm font-black text-rose-400 font-mono">
                ${signal.sl.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Capital & Leverage Input */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-slate-200">
                ট্রেডিং মার্জিন (USDT)
              </label>
              <div className="flex gap-1.5">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMarginUsd(val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      marginUsd === val
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="5"
                  max="5000"
                  step="5"
                  value={marginUsd}
                  onChange={(e) => setMarginUsd(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl text-slate-100 font-mono text-xs focus:outline-none"
                />
              </div>

              {/* Leverage selector */}
              <div className="w-32">
                <select
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 focus:border-amber-400 rounded-xl text-slate-200 font-mono text-xs focus:outline-none"
                >
                  <option value={3}>3x Leverage</option>
                  <option value={5}>5x Leverage</option>
                  <option value={10}>10x Leverage</option>
                  <option value={15}>15x Leverage</option>
                  <option value={20}>20x Leverage</option>
                </select>
              </div>
            </div>

            {/* Calculated Position Stats */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">মোট পজিশন ভ্যালু</span>
                <span className="font-mono font-bold text-slate-200">${positionValueUsd}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block">সম্ভাব্য লাভ (TP1)</span>
                <span className="font-mono font-bold text-emerald-400">+${potentialProfitTp1}</span>
              </div>
              <div>
                <span className="text-[10px] text-rose-400 block">সর্বোচ্চ ঝুঁকি (SL)</span>
                <span className="font-mono font-bold text-rose-400">-${potentialLoss}</span>
              </div>
            </div>
          </div>

          {/* Feedback Result */}
          {result && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                result.success
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="text-xs">
                {result.success ? result.message : result.error}
              </div>
            </div>
          )}

          {/* Action Execution Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleExecuteTrade}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition disabled:opacity-50 ${
                isLong
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Bybit এ অর্ডার পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>
                    {!isConfigured
                      ? 'বাইবিট API সেটআপ করুন'
                      : `Bybit এ ${isLong ? 'LONG (BUY)' : 'SHORT (SELL)'} অর্ডার প্লেস করুন`}
                  </span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
