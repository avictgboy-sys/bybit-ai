// Central Price Store: Single Source of Truth for all Assets (Crypto, Gold, Forex)
// Priority: Live WebSocket > Verified REST API > Fallback Cache (with Stale Flag)

import { TickerData } from '../../types';
import { bybitWs, BybitTickerUpdate } from '../bybitWebSocket';
import { ExnessLivePriceFeed, LiveMarketTick } from '../exnessLivePriceFeed';

export type PriceSourceType = 'WEBSOCKET_LIVE' | 'REST_VERIFIED' | 'EXNESS_FEED' | 'FALLBACK_CACHED';
export type AssetClassType = 'CRYPTO' | 'COMMODITY' | 'FOREX';

export interface CanonicalPriceRecord {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  price: number;
  bid?: number;
  ask?: number;
  price24hPcnt: number;
  highPrice24h: number;
  lowPrice24h: number;
  volume24h: number;
  turnover24h: number;
  source: PriceSourceType;
  assetClass: AssetClassType;
  lastUpdated: number;
  isStale: boolean;
  precision: number;
}

type PriceListener = (record: CanonicalPriceRecord) => void;
type GlobalListener = (records: Record<string, CanonicalPriceRecord>) => void;

class CentralPriceStoreService {
  private store: Map<string, CanonicalPriceRecord> = new Map();
  private symbolListeners: Map<string, Set<PriceListener>> = new Map();
  private globalListeners: Set<GlobalListener> = new Set();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Subscribe to Live Bybit WebSocket stream
    bybitWs.onGlobalTicker((update: BybitTickerUpdate) => {
      this.handleWebSocketUpdate(update);
    });

    // 2. Subscribe to Exness Gold & Forex live feed
    ExnessLivePriceFeed.init();
    ExnessLivePriceFeed.subscribe((ticks) => {
      Object.values(ticks).forEach((tick) => {
        this.handleExnessTick(tick);
      });
    });

    // 3. Periodic Stale Check (Flag records not updated in > 45s)
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        this.checkStaleness();
      }, 5000);
    }
  }

  /**
   * Sync tickers from App's REST loadData() cycle into central store
   */
  public ingestRestTickers(tickers: TickerData[]) {
    if (!tickers || tickers.length === 0) return;
    const now = Date.now();

    tickers.forEach((t) => {
      const existing = this.store.get(t.symbol);

      // Do NOT downgrade a fresh WEBSOCKET_LIVE tick (within 3 seconds) with REST data
      if (existing && existing.source === 'WEBSOCKET_LIVE' && now - existing.lastUpdated < 3000) {
        return;
      }

      const precision = t.lastPrice < 0.0001 ? 8 : t.lastPrice < 1 ? 4 : 2;
      const record: CanonicalPriceRecord = {
        symbol: t.symbol,
        baseCoin: t.baseCoin || t.symbol.replace(/USDT$/, ''),
        quoteCoin: t.quoteCoin || 'USDT',
        price: t.lastPrice,
        price24hPcnt: t.price24hPcnt || 0,
        highPrice24h: t.highPrice24h || t.lastPrice,
        lowPrice24h: t.lowPrice24h || t.lastPrice,
        volume24h: t.volume24h || 0,
        turnover24h: t.turnover24h || 0,
        source: 'REST_VERIFIED',
        assetClass: 'CRYPTO',
        lastUpdated: now,
        isStale: false,
        precision,
      };

      this.store.set(t.symbol, record);
      this.notifySymbol(t.symbol, record);
    });

    this.notifyGlobal();
  }

  /**
   * Process incoming WebSocket ticks from Bybit
   */
  private handleWebSocketUpdate(update: BybitTickerUpdate) {
    if (!update.symbol || !update.lastPrice) return;
    const now = Date.now();
    const existing = this.store.get(update.symbol);

    const precision = update.lastPrice < 0.0001 ? 8 : update.lastPrice < 1 ? 4 : 2;
    const record: CanonicalPriceRecord = {
      symbol: update.symbol,
      baseCoin: existing?.baseCoin || update.symbol.replace(/USDT$/, ''),
      quoteCoin: existing?.quoteCoin || 'USDT',
      price: update.lastPrice,
      price24hPcnt: update.price24hPcnt ?? existing?.price24hPcnt ?? 0,
      highPrice24h: update.highPrice24h ?? existing?.highPrice24h ?? update.lastPrice,
      lowPrice24h: update.lowPrice24h ?? existing?.lowPrice24h ?? update.lastPrice,
      volume24h: update.volume24h ?? existing?.volume24h ?? 0,
      turnover24h: update.turnover24h ?? existing?.turnover24h ?? 0,
      source: 'WEBSOCKET_LIVE',
      assetClass: 'CRYPTO',
      lastUpdated: now,
      isStale: false,
      precision,
    };

    this.store.set(update.symbol, record);
    this.notifySymbol(update.symbol, record);
    this.notifyGlobal();
  }

  /**
   * Process incoming Exness ticks for Gold & Forex
   */
  private handleExnessTick(tick: LiveMarketTick) {
    if (!tick.symbol || !tick.price) return;
    const now = Date.now();
    const isGold = tick.symbol.includes('XAU') || tick.symbol.includes('GOLD');
    const assetClass: AssetClassType = isGold ? 'COMMODITY' : 'FOREX';
    const precision = isGold ? 2 : tick.price > 100 ? 2 : 5;

    const parts = tick.symbol.split('/');
    const baseCoin = parts[0] || tick.symbol;
    const quoteCoin = parts[1] || 'USD';

    const record: CanonicalPriceRecord = {
      symbol: tick.symbol,
      baseCoin,
      quoteCoin,
      price: tick.price,
      bid: tick.bid,
      ask: tick.ask,
      price24hPcnt: (tick.change24h || 0) / 100,
      highPrice24h: tick.high24h || tick.price * 1.01,
      lowPrice24h: tick.low24h || tick.price * 0.99,
      volume24h: 1000000,
      turnover24h: 50000000,
      source: 'EXNESS_FEED',
      assetClass,
      lastUpdated: now,
      isStale: false,
      precision,
    };

    this.store.set(tick.symbol, record);
    this.notifySymbol(tick.symbol, record);
    this.notifyGlobal();
  }

  /**
   * Periodically check if any price hasn't been refreshed
   */
  private checkStaleness() {
    const now = Date.now();
    const staleThreshold = 45000; // 45 seconds
    let changed = false;

    this.store.forEach((record, symbol) => {
      if (!record.isStale && now - record.lastUpdated > staleThreshold) {
        record.isStale = true;
        record.source = 'FALLBACK_CACHED';
        changed = true;
        this.notifySymbol(symbol, record);
      }
    });

    if (changed) {
      this.notifyGlobal();
    }
  }

  /**
   * Get canonical price for a symbol
   */
  public getPrice(symbol: string): CanonicalPriceRecord | null {
    if (!symbol) return null;
    const normalized = symbol.toUpperCase().trim();
    return this.store.get(normalized) || this.store.get(`${normalized}USDT`) || null;
  }

  /**
   * Get all canonical prices
   */
  public getAllPrices(): CanonicalPriceRecord[] {
    return Array.from(this.store.values());
  }

  /**
   * Subscribe to price changes for a specific symbol
   */
  public subscribeSymbol(symbol: string, callback: PriceListener): () => void {
    const norm = symbol.toUpperCase().trim();
    if (!this.symbolListeners.has(norm)) {
      this.symbolListeners.set(norm, new Set());
    }
    this.symbolListeners.get(norm)!.add(callback);

    // Immediately trigger with current price if present
    const current = this.getPrice(norm);
    if (current) {
      callback(current);
    }

    return () => {
      this.symbolListeners.get(norm)?.delete(callback);
    };
  }

  /**
   * Subscribe to all global price updates
   */
  public subscribeGlobal(callback: GlobalListener): () => void {
    this.globalListeners.add(callback);
    return () => {
      this.globalListeners.delete(callback);
    };
  }

  private notifySymbol(symbol: string, record: CanonicalPriceRecord) {
    this.symbolListeners.get(symbol)?.forEach((cb) => {
      try {
        cb(record);
      } catch (err) {
        console.warn(`Error in symbol price listener for ${symbol}:`, err);
      }
    });
  }

  private notifyGlobal() {
    if (this.globalListeners.size === 0) return;
    const recordsMap: Record<string, CanonicalPriceRecord> = {};
    this.store.forEach((val, key) => {
      recordsMap[key] = val;
    });
    this.globalListeners.forEach((cb) => {
      try {
        cb(recordsMap);
      } catch (err) {
        console.warn('Error in global price listener:', err);
      }
    });
  }
}

export const CentralPriceStore = new CentralPriceStoreService();
