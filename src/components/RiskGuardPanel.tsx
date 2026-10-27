import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Zap, Flame, TrendingDown, Bell, Send, Check } from 'lucide-react';
import { RiskGuardWarning, TickerData } from '../types';
import { computeTechnicalIndicators, evaluateRiskGuard } from '../utils/technicalAnalysis';
import { TelegramService } from '../services/telegramService';

interface RiskGuardPanelProps {
  tickers: TickerData[];
  onSelectCoin: (coin: TickerData) => void;
}

export const RiskGuardPanel: React.FC<RiskGuardPanelProps> = ({ tickers, onSelectCoin }) => {
  const [broadcastState, setBroadcastState] = useState<{ [id: string]: boolean }>({});

  const handleBroadcastWarning = async (e: React.MouseEvent, warning: RiskGuardWarning) => {
    e.stopPropagation();
    setBroadcastState((prev) => ({ ...prev, [warning.id]: true }));

    await TelegramService.sendRiskWarningAlert(warning);

    setTimeout(() => {
      setBroadcastState((prev) => ({ ...prev, [warning.id]: false }));
    }, 3000);
  };
  // Aggregate all warnings across top active market pairs
  const allWarnings: { warning: RiskGuardWarning; ticker: TickerData }[] = [];

  tickers.forEach((coin) => {
    const mockKlines = [
      { close: coin.lastPrice * 0.98, high: coin.highPrice24h, low: coin.lowPrice24h, volume: coin.volume24h },
      { close: coin.lastPrice, high: coin.highPrice24h, low: coin.lowPrice24h, volume: coin.volume24h },
    ] as any;
    const indicators = computeTechnicalIndicators(mockKlines, coin.lastPrice);
    const warnings = evaluateRiskGuard(coin, indicators);

    warnings.forEach((w) => {
      allWarnings.push({ warning: w, ticker: coin });
    });
  });

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              AI Risk Guard Dashboard
            </h3>
            <p className="text-[11px] text-slate-400">
              Active anomaly detection for capital protection
            </p>
          </div>
        </div>

        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
          {allWarnings.length} Active Alerts
        </span>
      </div>

      {allWarnings.length === 0 ? (
        <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60 text-slate-400 text-xs">
          <p className="font-semibold text-emerald-400 mb-1">
            ✓ No critical risk anomalies detected
          </p>
          <p className="text-[11px]">
            Market indicators are operating within normal volatility boundaries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allWarnings.map(({ warning, ticker }) => (
            <div
              key={warning.id}
              onClick={() => onSelectCoin(ticker)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${
                warning.severity === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/60'
                  : warning.severity === 'high'
                  ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-xs text-slate-100 uppercase tracking-wide">
                  {warning.title}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-bold">
                  {ticker.symbol}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans mb-2">
                {warning.message}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <div>
                  <span>Price: ${ticker.lastPrice} </span>
                  <span
                    className={ticker.price24hPcnt >= 0 ? 'text-emerald-400' : 'text-red-400'}
                  >
                    ({(ticker.price24hPcnt * 100).toFixed(2)}%)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleBroadcastWarning(e, warning)}
                  title="Broadcast Risk Warning to Telegram"
                  className="px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-bold text-[10px] flex items-center gap-1 transition-all active:scale-95"
                >
                  {broadcastState[warning.id] ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Sent!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3 text-sky-400" />
                      <span>Telegram</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
