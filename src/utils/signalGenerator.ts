import { TickerData } from '../types';
import { HighWinSignalData } from '../services/telegramBot';
import { getTopTenUnifiedSignals } from './unifiedSignals';

export function generateTopTenSignals(tickers: TickerData[]): HighWinSignalData[] {
  return getTopTenUnifiedSignals(tickers);
}
