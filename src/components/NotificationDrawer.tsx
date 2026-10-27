import React, { useState } from 'react';
import { X, Bell, ShieldAlert, TrendingUp, Plus, Trash2, CheckCircle, Volume2, VolumeX, Play } from 'lucide-react';
import { PriceAlert, NotificationItem, TickerData } from '../types';
import { soundService } from '../services/soundService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearNotifications: () => void;
  priceAlerts: PriceAlert[];
  onAddPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  onDeletePriceAlert: (id: string) => void;
  tickers: TickerData[];
  factorThreshold: number;
  onSetFactorThreshold: (threshold: number) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  priceAlerts,
  onAddPriceAlert,
  onDeletePriceAlert,
  tickers,
  factorThreshold,
  onSetFactorThreshold,
}) => {
  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [targetPrice, setTargetPrice] = useState<string>('68000');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const [isMuted, setIsMuted] = useState<boolean>(soundService.isMutedState());

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundService.setMuted(nextMute);
  };

  const handleTestSound = () => {
    soundService.playTestSound();
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(targetPrice);
    if (isNaN(val) || val <= 0) return;

    onAddPriceAlert({
      symbol,
      targetPrice: val,
      direction,
    });

    setTargetPrice('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Alerts & Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {/* Sound Alert Settings Bar */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
              </div>
              <div>
                <span className="font-bold text-slate-200 block">🔊 অ্যালার্ট সাউন্ড (Alert Sound)</span>
                <span className="text-[10px] text-slate-400">
                  {isMuted ? 'সাউন্ড অ্যালার্ট মিউট করা আছে' : 'প্রাইজ অ্যালার্টে সাবটল টিউন বাজবে'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestSound}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                title="প্লে করে সাউন্ড টেস্ট করুন"
              >
                <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>টেস্ট টিউন</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition ${
                  isMuted
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isMuted ? 'আনমিউট' : 'মিউট'}
              </button>
            </div>
          </div>

          {/* 9-Factor Technical Auto-Notice Control Panel */}
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    ৯-ফ্যাক্টর সিগন্যাল অটো নোটিশ
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      সক্রিয়
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    ৯টি রিকোয়ারমেন্টের মধ্যে নুন্যতম ম্যাচ হলে নোটিফিকেশন আসবে
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-300 font-semibold">মিনিমাম রিকোয়ারমেন্ট:</span>
              <div className="flex items-center gap-1">
                {[4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => onSetFactorThreshold(num)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition ${
                      factorThreshold === num
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                    }`}
                  >
                    {num}/৯
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-emerald-400/90 italic">
              ⚡ যেকোনো Bybit কয়েন {factorThreshold}টি ফ্যাক্টর (যেমন EMA Trend, RSI, Volume, BB, OI ইত্যাদি) ম্যাচ করলেই তাৎক্ষণিক নোটিশ ও সাউন্ড পাবেন।
            </p>
          </div>

          {/* Create New Price Alert Form */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Create Price Alert
            </h4>

            <form onSubmit={handleAddAlert} className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  {tickers.slice(0, 20).map((t) => (
                    <option key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </option>
                  ))}
                </select>

                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="ABOVE">Rises Above (&gt;)</option>
                  <option value="BELOW">Drops Below (&lt;)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Target Price ($)"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Set</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Custom Price Alerts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Custom Alerts ({priceAlerts.length})
            </h4>

            {priceAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No custom price alerts set.</p>
            ) : (
              priceAlerts.map((pa) => (
                <div
                  key={pa.id}
                  className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-400 mr-2">{pa.symbol}</span>
                    <span className="text-slate-300 font-mono">
                      {pa.direction === 'ABOVE' ? '>' : '<'} ${pa.targetPrice.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeletePriceAlert(pa.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Activity / Risk Notification Feed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Recent Market Feed ({notifications.length})
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={onClearNotifications}
                  className="text-[10px] text-slate-400 hover:text-amber-400"
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No recent system notifications.</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{item.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
