import { TelegramService, TelegramConfig } from './telegramService';
import { TickerData } from '../types';

export interface HighWinSignalData {
  coin: TickerData;
  rank: number;
  winRate: number; // e.g. 80 - 98
  positionDirection: 'LONG' | 'SHORT';
  signalType: string;
  entryZoneMin: number;
  entryZoneMax: number;
  tp1: number;
  tp1Pcnt: number;
  tp2: number;
  tp2Pcnt: number;
  sl: number;
  slPcnt: number;
  riskRewardRatio: string;
  recommendedLeverage: string;
  reasonBn: string;
  tradingStyle?: string;
  tradingStyleLabelBn?: string;
}

export interface TelegramBotLog {
  id: string;
  timestamp: number;
  type: 'AUTO_DISPATCH' | 'MANUAL_DISPATCH' | 'SYSTEM_ALERT' | 'ERROR';
  coinSymbol?: string;
  message: string;
  success: boolean;
}

export interface TelegramBotStatus {
  isRunning: boolean;
  isConfigured: boolean;
  autoSendEnabled: boolean;
  pollingIntervalMs: number;
  totalPushedCount: number;
  lastPushedTimestamp: number | null;
  lastHash: string;
  lastError: string | null;
  logs: TelegramBotLog[];
}

class TelegramBotService {
  private timerId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private pollingIntervalMs: number = 30000; // 30 seconds check cycle
  private totalPushedCount: number = 0;
  private lastPushedTimestamp: number | null = null;
  private lastSentHash: string = '';
  private lastError: string | null = null;
  private logs: TelegramBotLog[] = [];
  private sentSignalHashes: Set<string> = new Set();

  constructor() {
    this.addLog('SYSTEM_ALERT', 'Telegram Bot Monitor background service initialized.', true);
  }

  // Get current status of the background bot monitor
  public getStatus(): TelegramBotStatus {
    const config = TelegramService.getConfig();
    return {
      isRunning: this.isRunning,
      isConfigured: TelegramService.isConfigured(),
      autoSendEnabled: Boolean(config.enabled && config.autoSendSignals),
      pollingIntervalMs: this.pollingIntervalMs,
      totalPushedCount: this.totalPushedCount,
      lastPushedTimestamp: this.lastPushedTimestamp,
      lastHash: this.lastSentHash,
      lastError: this.lastError,
      logs: this.logs.slice(-50), // return last 50 logs
    };
  }

  // Add structured log entry
  private addLog(
    type: 'AUTO_DISPATCH' | 'MANUAL_DISPATCH' | 'SYSTEM_ALERT' | 'ERROR',
    message: string,
    success: boolean,
    coinSymbol?: string
  ): void {
    const newLog: TelegramBotLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      type,
      message,
      success,
      coinSymbol,
    };
    this.logs.unshift(newLog);
    if (this.logs.length > 200) {
      this.logs = this.logs.slice(0, 200);
    }
  }

  // Generate unique signature hash for signal list to detect changes
  public generateSignalsHash(signals: HighWinSignalData[]): string {
    if (!signals || signals.length === 0) return '';
    return signals
      .slice(0, 10)
      .map(
        (s) =>
          `${s.coin.symbol}_${s.positionDirection}_${s.winRate}_${s.entryZoneMin.toFixed(
            2
          )}_${s.sl.toFixed(2)}`
      )
      .join('|');
  }

  // Process and push the Top 10 High Win signal list to Telegram automatically
  public async processAndPushSignals(
    signals: HighWinSignalData[],
    force: boolean = false
  ): Promise<{ success: boolean; dispatchedCount: number; error?: string }> {
    if (!TelegramService.isConfigured()) {
      const err = 'Telegram Bot configuration missing or disabled.';
      this.lastError = err;
      return { success: false, dispatchedCount: 0, error: err };
    }

    if (!signals || signals.length === 0) {
      return { success: true, dispatchedCount: 0 };
    }

    const currentHash = this.generateSignalsHash(signals);

    // If already sent this exact signal batch and not forcing, skip duplicate push
    if (!force && this.lastSentHash === currentHash) {
      return { success: true, dispatchedCount: 0 };
    }

    try {
      const topTen = signals.slice(0, 10);
      const res = await TelegramService.sendTopTenHighWinSignals(topTen);

      if (res.success) {
        this.lastSentHash = currentHash;
        this.totalPushedCount += topTen.length;
        this.lastPushedTimestamp = Date.now();
        this.lastError = null;

        // Cache individual signal hashes
        topTen.forEach((s) => {
          const sigHash = `${s.coin.symbol}_${s.positionDirection}_${s.winRate}`;
          this.sentSignalHashes.add(sigHash);
        });

        this.addLog(
          force ? 'MANUAL_DISPATCH' : 'AUTO_DISPATCH',
          `Successfully pushed ${topTen.length} High-Win signals to Telegram channel.`,
          true
        );

        return { success: true, dispatchedCount: topTen.length };
      } else {
        this.lastError = res.error || 'Failed to dispatch to Telegram API.';
        this.addLog(
          'ERROR',
          `Telegram notice: ${this.lastError}`,
          false
        );
        return { success: false, dispatchedCount: 0, error: this.lastError };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Unexpected exception during Telegram auto-dispatch.';
      this.lastError = errorMsg;
      this.addLog('ERROR', errorMsg, false);
      return { success: false, dispatchedCount: 0, error: errorMsg };
    }
  }

  // Push a single high win signal to Telegram
  public async pushSingleSignal(
    signal: HighWinSignalData
  ): Promise<{ success: boolean; error?: string }> {
    if (!TelegramService.isConfigured()) {
      return { success: false, error: 'Telegram Bot is not configured.' };
    }

    try {
      const res = await TelegramService.sendSingleHighWinSignal(signal);
      if (res.success) {
        this.totalPushedCount += 1;
        this.lastPushedTimestamp = Date.now();
        this.addLog(
          'MANUAL_DISPATCH',
          `Single signal for $${signal.coin.symbol} pushed to Telegram.`,
          true,
          signal.coin.symbol
        );
        return { success: true };
      } else {
        this.addLog(
          'ERROR',
          `Failed to push $${signal.coin.symbol}: ${res.error}`,
          false,
          signal.coin.symbol
        );
        return { success: false, error: res.error };
      }
    } catch (err: any) {
      const msg = err.message || 'Error pushing single signal.';
      this.addLog('ERROR', msg, false, signal.coin.symbol);
      return { success: false, error: msg };
    }
  }

  // Start background auto-monitoring with a signal supplier function
  public startAutoMonitoring(
    getSignalsCallback: () => HighWinSignalData[],
    intervalMs: number = 30000
  ): void {
    if (this.isRunning) {
      this.stopAutoMonitoring();
    }

    this.pollingIntervalMs = intervalMs;
    this.isRunning = true;
    this.addLog('SYSTEM_ALERT', `Background signal monitor started (Interval: ${intervalMs / 1000}s).`, true);

    // Initial check
    const initialSignals = getSignalsCallback();
    if (initialSignals && initialSignals.length > 0) {
      this.processAndPushSignals(initialSignals, false);
    }

    // Polling loop
    this.timerId = setInterval(() => {
      if (!this.isRunning) return;
      try {
        const freshSignals = getSignalsCallback();
        if (freshSignals && freshSignals.length > 0) {
          this.processAndPushSignals(freshSignals, false);
        }
      } catch (err: any) {
        console.error('[TelegramBotMonitor Loop Error]', err);
      }
    }, this.pollingIntervalMs);
  }

  // Stop background auto-monitoring
  public stopAutoMonitoring(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    this.addLog('SYSTEM_ALERT', 'Background signal monitor paused.', true);
  }
}

export const telegramBotService = new TelegramBotService();
export default telegramBotService;
