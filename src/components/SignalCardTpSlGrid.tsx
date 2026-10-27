import React from 'react';
import { Target, CheckCircle2, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';
import { formatFixedPrecisionPrice } from '../utils/formatters';

export interface SignalCardTpSlGridProps {
  symbol?: string;
  entryZone: [number, number] | number;
  tp1: number;
  tp2?: number;
  tp3?: number;
  stopLoss: number;
  direction?: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  includeCurrencySign?: boolean;
  entryLabel?: string;
  tp1Label?: string;
  tp2Label?: string;
  slLabel?: string;
  className?: string;
}

/**
 * SignalCardTpSlGrid
 * 
 * Production UI component for rendering Entry, Take-Profit (TP1, TP2, TP3),
 * and Stop-Loss (SL) inside signal cards.
 * 
 * Key layout stability features:
 * 1. Fixed-precision formatting (tabular-nums font-mono) to eliminate horizontal jitter.
 * 2. Fixed minimum width value containers (min-w-[82px] sm:min-w-[96px]) to prevent layout jumping.
 * 3. Stable grid alignment (grid-cols-2 sm:grid-cols-4 items-stretch) with uniform min-height.
 */
export const SignalCardTpSlGrid: React.FC<SignalCardTpSlGridProps> = ({
  symbol = '',
  entryZone,
  tp1,
  tp2,
  tp3,
  stopLoss,
  direction,
  includeCurrencySign = true,
  entryLabel = 'এন্ট্রি জোন (Entry)',
  tp1Label = 'TP1 (Scalp)',
  tp2Label,
  slLabel = 'স্টপ লস (SL)',
  className = '',
}) => {
  const isForex =
    symbol.includes('EUR') ||
    symbol.includes('GBP') ||
    symbol.includes('AUD') ||
    symbol.includes('NZD') ||
    symbol.includes('CAD') ||
    symbol.includes('CHF') ||
    symbol.includes('JPY');

  // Forex pairs traditionally don't prefix with '$'
  const showDollar = includeCurrencySign && !isForex;

  // Format Entry
  const formattedEntry = Array.isArray(entryZone)
    ? `${formatFixedPrecisionPrice(entryZone[0], { symbol, includeCurrencySign: showDollar })} - ${formatFixedPrecisionPrice(entryZone[1], { symbol, includeCurrencySign: showDollar })}`
    : formatFixedPrecisionPrice(entryZone, { symbol, includeCurrencySign: showDollar });

  // Format TP1
  const formattedTp1 = formatFixedPrecisionPrice(tp1, {
    symbol,
    includeCurrencySign: showDollar,
  });

  // Format TP2 / TP3
  const formattedTp2 = tp2
    ? formatFixedPrecisionPrice(tp2, { symbol, includeCurrencySign: showDollar })
    : null;
  const formattedTp3 = tp3
    ? formatFixedPrecisionPrice(tp3, { symbol, includeCurrencySign: showDollar })
    : null;

  // Format SL
  const formattedSl = formatFixedPrecisionPrice(stopLoss, {
    symbol,
    includeCurrencySign: showDollar,
  });

  const isBuy = direction === 'BUY' || direction === 'LONG';

  // Dynamic label for TP2 / TP3
  const defaultTp2Label = tp3 ? 'TP2 / TP3' : tp2 ? 'TP2 (Day Trade)' : 'TP2 টার্গেট';
  const effectiveTp2Label = tp2Label || defaultTp2Label;

  return (
    <div
      id="signal-card-tp-sl-container"
      className={`grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 items-stretch ${className}`}
    >
      {/* 1. Safe Entry Zone */}
      <div
        id="signal-card-entry-box"
        className="flex flex-col justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800/70 min-h-[58px] sm:min-h-[64px] min-w-0"
      >
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1 truncate">
          <Target className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{entryLabel}</span>
        </span>
        <div className="w-full min-w-[82px] sm:min-w-[96px] mt-1">
          <span
            className="font-mono tabular-nums text-xs font-black text-cyan-300 tracking-tight block truncate"
            title={formattedEntry}
          >
            {formattedEntry}
          </span>
        </div>
      </div>

      {/* 2. Take Profit 1 (TP1) */}
      <div
        id="signal-card-tp1-box"
        className="flex flex-col justify-between p-2 rounded-lg bg-emerald-950/25 border border-emerald-500/25 min-h-[58px] sm:min-h-[64px] min-w-0"
      >
        <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1 truncate">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{tp1Label}</span>
        </span>
        <div className="w-full min-w-[82px] sm:min-w-[96px] mt-1">
          <span
            className="font-mono tabular-nums text-xs font-black text-emerald-300 tracking-tight block truncate"
            title={formattedTp1}
          >
            {formattedTp1}
          </span>
        </div>
      </div>

      {/* 3. Take Profit 2 / Take Profit 3 */}
      <div
        id="signal-card-tp2-box"
        className="flex flex-col justify-between p-2 rounded-lg bg-emerald-950/25 border border-emerald-500/25 min-h-[58px] sm:min-h-[64px] min-w-0"
      >
        <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1 truncate">
          <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{effectiveTp2Label}</span>
        </span>
        <div className="w-full min-w-[82px] sm:min-w-[96px] mt-1">
          <span
            className="font-mono tabular-nums text-xs font-black text-emerald-300 tracking-tight block truncate"
            title={formattedTp3 ? `${formattedTp2} / ${formattedTp3}` : formattedTp2 || 'N/A'}
          >
            {formattedTp2 && formattedTp3
              ? `${formattedTp2} / ${formattedTp3}`
              : formattedTp2 || formattedTp1}
          </span>
        </div>
      </div>

      {/* 4. Shielded Stop Loss (SL) */}
      <div
        id="signal-card-sl-box"
        className="flex flex-col justify-between p-2 rounded-lg bg-rose-950/25 border border-rose-500/25 min-h-[58px] sm:min-h-[64px] min-w-0"
      >
        <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider flex items-center gap-1 truncate">
          <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="truncate">{slLabel}</span>
        </span>
        <div className="w-full min-w-[82px] sm:min-w-[96px] mt-1">
          <span
            className="font-mono tabular-nums text-xs font-black text-rose-400 tracking-tight block truncate"
            title={formattedSl}
          >
            {formattedSl}
          </span>
        </div>
      </div>
    </div>
  );
};
