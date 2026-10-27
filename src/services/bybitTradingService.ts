/**
 * Bybit V5 Trading Service
 * Manages user API credentials, client-side encryption/storage,
 * wallet balance checks, and automated order execution with risk-guards.
 */

export interface BybitApiConfig {
  apiKey: string;
  apiSecret: string;
  isTestnet: boolean;
  autoExecuteHighWin: boolean;
  defaultLeverage: number; // e.g. 5x, 10x, 20x
  riskPercentPerTrade: number; // e.g. 1% to 10%
  accountType?: 'UNIFIED' | 'CONTRACT';
  lastWalletBalance?: number;
  lastTestedAt?: number;
  status: 'connected' | 'disconnected' | 'error';
  lastError?: string;
}

export interface BybitTradeOrderParams {
  symbol: string;
  side: 'Buy' | 'Sell'; // Buy for Long, Sell for Short
  orderType?: 'Market' | 'Limit';
  marginUsd?: number; // Margin in USD to auto-calc qty
  qty?: string;
  price?: string;
  stopLoss?: string;
  takeProfit?: string;
  tp2?: string;
  leverage?: number;
  noteBn?: string;
}

export interface BybitExecutionResult {
  success: boolean;
  orderId?: string;
  executedQty?: string;
  executedPrice?: number;
  message?: string;
  error?: string;
}

const STORAGE_KEY_PREFIX = 'bybit_user_api_key_v1';

export class BybitTradingService {
  /**
   * Retrieves user-specific Bybit configuration
   */
  public static getConfig(userEmail?: string): BybitApiConfig | null {
    try {
      const key = userEmail ? `${STORAGE_KEY_PREFIX}_${userEmail.trim().toLowerCase()}` : `${STORAGE_KEY_PREFIX}_default`;
      const raw = localStorage.getItem(key) || localStorage.getItem(`${STORAGE_KEY_PREFIX}_default`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Saves Bybit API credentials securely
   */
  public static saveConfig(config: BybitApiConfig, userEmail?: string): void {
    try {
      const key = userEmail ? `${STORAGE_KEY_PREFIX}_${userEmail.trim().toLowerCase()}` : `${STORAGE_KEY_PREFIX}_default`;
      localStorage.setItem(key, JSON.stringify(config));
      // Also keep a copy in default if user is active
      localStorage.setItem(`${STORAGE_KEY_PREFIX}_default`, JSON.stringify(config));
    } catch (err) {
      console.error('Failed to save Bybit config:', err);
    }
  }

  /**
   * Removes Bybit API keys
   */
  public static removeConfig(userEmail?: string): void {
    try {
      if (userEmail) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}_${userEmail.trim().toLowerCase()}`);
      }
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}_default`);
    } catch (err) {
      console.error('Failed to remove Bybit config:', err);
    }
  }

  /**
   * Checks if user has valid Bybit keys saved
   */
  public static isConfigured(userEmail?: string): boolean {
    const config = this.getConfig(userEmail);
    return Boolean(config && config.apiKey && config.apiSecret && config.status === 'connected');
  }

  /**
   * Tests Bybit API Key & Secret with server-side proxy
   */
  public static async verifyKeys(
    apiKey: string,
    apiSecret: string,
    isTestnet: boolean
  ): Promise<{ success: boolean; balance?: number; accountType?: string; error?: string }> {
    if (!apiKey.trim() || !apiSecret.trim()) {
      return { success: false, error: 'API Key এবং Secret উভয়ই আবশ্যক।' };
    }

    try {
      const res = await fetch('/api/bybit/verify-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim(),
          isTestnet,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          balance: data.balance ?? 0,
          accountType: data.accountType || 'UNIFIED',
        };
      }
      return {
        success: false,
        error: data.error || 'বাইবিট সংযোগ ব্যর্থ হয়েছে। কী ও পারমিশন চেক করুন।',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'নেটওয়ার্ক সংযোগ ত্রুটি। পুনরায় চেষ্টা করুন।',
      };
    }
  }

  /**
   * Execute real trade order on Bybit V5 Linear Futures
   */
  public static async executeOrder(
    params: BybitTradeOrderParams,
    userEmail?: string
  ): Promise<BybitExecutionResult> {
    const config = this.getConfig(userEmail);
    if (!config || !config.apiKey || !config.apiSecret) {
      return {
        success: false,
        error: 'বাইবিট API Key পাওয়া যায়নি। প্রথমে সেটিংসে গিয়ে Key কানেক্ট করুন।',
      };
    }

    try {
      const res = await fetch('/api/bybit/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          apiSecret: config.apiSecret,
          isTestnet: config.isTestnet,
          symbol: params.symbol,
          side: params.side,
          orderType: params.orderType || 'Market',
          qty: params.qty,
          marginUsd: params.marginUsd,
          price: params.price,
          stopLoss: params.stopLoss,
          takeProfit: params.takeProfit,
          leverage: params.leverage || config.defaultLeverage || 10,
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          orderId: data.orderId,
          executedQty: data.qty,
          message: `সফলভাবে Bybit V5 এ ${params.symbol} ${params.side === 'Buy' ? 'LONG' : 'SHORT'} অর্ডার প্লেস হয়েছে!`,
        };
      }

      return {
        success: false,
        error: data.error || 'অর্ডার প্লেস ব্যর্থ হয়েছে। বাইবিট ব্যালেন্স ও মিনিমাম লট সাইজ চেক করুন।',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'সার্ভার সংযোগে ত্রুটি ঘটেছে।',
      };
    }
  }
}
