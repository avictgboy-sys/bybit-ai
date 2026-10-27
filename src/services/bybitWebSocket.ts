import { TickerData, KlinePoint } from '../types';

export interface BybitTradeTick {
  symbol: string;
  price: number;
  size: number;
  side: 'Buy' | 'Sell';
  timestamp: number;
  tradeId: string;
}

export interface BybitTickerUpdate {
  symbol: string;
  lastPrice: number;
  highPrice24h?: number;
  lowPrice24h?: number;
  prevPrice24h?: number;
  price24hPcnt?: number;
  turnover24h?: number;
  volume24h?: number;
  fundingRate?: number;
}

type TradeListener = (tick: BybitTradeTick) => void;
type TickerListener = (ticker: BybitTickerUpdate) => void;
type KlineListener = (kline: KlinePoint) => void;

class BybitWebSocketService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private pingInterval: any = null;
  private reconnectTimeout: any = null;
  private currentEndpointIndex = 0;

  // Bybit V5 Public WebSocket Endpoints
  private endpoints = [
    'wss://stream.bybit.com/v5/public/linear',
    'wss://stream.bytick.com/v5/public/linear',
    'wss://stream.bybit.com/v5/public/spot',
  ];

  // Active Symbol Subscriptions
  private activeSubscriptions = new Set<string>();

  // Event Listeners
  private tradeListeners = new Map<string, Set<TradeListener>>();
  private tickerListeners = new Map<string, Set<TickerListener>>();
  private klineListeners = new Map<string, Set<KlineListener>>();
  private globalTickerListeners = new Set<(ticker: BybitTickerUpdate) => void>();
  private statusListeners = new Set<(connected: boolean) => void>();

  // Throttled Batch Queue for Global Tickers
  private pendingGlobalTickers = new Map<string, BybitTickerUpdate>();
  private globalFlushTimeout: any = null;

  constructor() {
    // Start WebSocket in browser environment
    if (typeof window !== 'undefined') {
      this.connect();
    }
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const endpoint = this.endpoints[this.currentEndpointIndex % this.endpoints.length];
    console.log(`[BybitWebSocket] Connecting to actual Bybit WebSocket endpoint: ${endpoint}`);

    try {
      this.ws = new WebSocket(endpoint);

      this.ws.onopen = () => {
        console.log(`[BybitWebSocket] Connected to real Bybit WebSocket stream (${endpoint})!`);
        this.isConnected = true;
        this.notifyStatus(true);

        // Start ping heartbeat (every 20s as required by Bybit V5)
        this.startPing();

        // Resubscribe to all active topics
        this.resubscribeAll();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.warn('[BybitWebSocket] WebSocket error encountered:', err);
      };

      this.ws.onclose = () => {
        console.log('[BybitWebSocket] WebSocket disconnected. Scheduling auto-reconnect...');
        this.cleanup();
        this.notifyStatus(false);

        // Switch to next backup endpoint and reconnect
        this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
        this.reconnectTimeout = setTimeout(() => {
          this.connect();
        }, 2000);
      };
    } catch (e) {
      console.warn('[BybitWebSocket] Failed to instantiate WebSocket:', e);
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
    }
  }

  private startPing(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ op: 'ping' }));
      }
    }, 20000);
  }

  private cleanup(): void {
    this.isConnected = false;
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private notifyStatus(connected: boolean): void {
    this.statusListeners.forEach((fn) => {
      try {
        fn(connected);
      } catch (e) {}
    });
  }

  public onStatusChange(fn: (connected: boolean) => void): () => void {
    this.statusListeners.add(fn);
    fn(this.isConnected);
    return () => this.statusListeners.delete(fn);
  }

  // Subscribe to real trades and tickers for a specific coin on Bybit
  public subscribeSymbol(
    symbol: string,
    callbacks: {
      onTrade?: TradeListener;
      onTicker?: TickerListener;
      onKline?: KlineListener;
      timeframe?: string;
    } = {}
  ): () => void {
    const sym = symbol.toUpperCase();

    if (callbacks.onTrade) {
      if (!this.tradeListeners.has(sym)) this.tradeListeners.set(sym, new Set());
      this.tradeListeners.get(sym)!.add(callbacks.onTrade);
    }

    if (callbacks.onTicker) {
      if (!this.tickerListeners.has(sym)) this.tickerListeners.set(sym, new Set());
      this.tickerListeners.get(sym)!.add(callbacks.onTicker);
    }

    if (callbacks.onKline) {
      if (!this.klineListeners.has(sym)) this.klineListeners.set(sym, new Set());
      this.klineListeners.get(sym)!.add(callbacks.onKline);
    }

    // Send Bybit V5 subscription topics
    const tradeTopic = `publicTrade.${sym}`;
    const tickerTopic = `tickers.${sym}`;
    const klineInterval = callbacks.timeframe || '1';
    const klineTopic = `kline.${klineInterval}.${sym}`;

    this.sendSubscribe([tradeTopic, tickerTopic, klineTopic]);

    // Return unsubscription cleanup callback
    return () => {
      if (callbacks.onTrade && this.tradeListeners.has(sym)) {
        this.tradeListeners.get(sym)!.delete(callbacks.onTrade);
      }
      if (callbacks.onTicker && this.tickerListeners.has(sym)) {
        this.tickerListeners.get(sym)!.delete(callbacks.onTicker);
      }
      if (callbacks.onKline && this.klineListeners.has(sym)) {
        this.klineListeners.get(sym)!.delete(callbacks.onKline);
      }
    };
  }

  // Subscribe to global ticker stream for all coins
  public onGlobalTicker(fn: (ticker: BybitTickerUpdate) => void): () => void {
    this.globalTickerListeners.add(fn);
    return () => this.globalTickerListeners.delete(fn);
  }

  // Subscribe to top market coin tickers (e.g. BTCUSDT, ETHUSDT, SOLUSDT, XRPUSDT, etc.)
  public subscribeTopCoins(symbols: string[]): void {
    const topics: string[] = [];
    symbols.forEach((sym) => {
      topics.push(`tickers.${sym.toUpperCase()}`);
      topics.push(`publicTrade.${sym.toUpperCase()}`);
    });
    this.sendSubscribe(topics);
  }

  private sendSubscribe(topics: string[]): void {
    topics.forEach((t) => this.activeSubscriptions.add(t));

    if (this.ws && this.ws.readyState === WebSocket.OPEN && topics.length > 0) {
      try {
        this.ws.send(
          JSON.stringify({
            op: 'subscribe',
            args: topics,
          })
        );
      } catch (e) {
        console.warn('[BybitWebSocket] Failed to send subscribe message:', e);
      }
    }
  }

  private resubscribeAll(): void {
    if (this.activeSubscriptions.size > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const args = Array.from(this.activeSubscriptions);
      console.log(`[BybitWebSocket] Resubscribing to ${args.length} topics on Bybit...`);
      this.ws.send(
        JSON.stringify({
          op: 'subscribe',
          args,
        })
      );
    }
  }

  // Handle incoming Bybit V5 JSON message
  private handleMessage(dataStr: string): void {
    try {
      const msg = JSON.parse(dataStr);

      // Handle pong
      if (msg.op === 'pong' || msg.ret_msg === 'pong') {
        return;
      }

      // 1. Handle Bybit Public Trade Ticks: topic = "publicTrade.BTCUSDT"
      if (msg.topic && msg.topic.startsWith('publicTrade.')) {
        const symbol = msg.topic.replace('publicTrade.', '').toUpperCase();
        if (Array.isArray(msg.data)) {
          msg.data.forEach((item: any) => {
            const price = parseFloat(item.p || '0');
            const size = parseFloat(item.v || '0');
            const side: 'Buy' | 'Sell' = item.S === 'Buy' || item.S === 'buy' ? 'Buy' : 'Sell';
            const timestamp = parseInt(item.T || `${Date.now()}`, 10);
            const tradeId = item.i || `${timestamp}-${Math.random()}`;

            if (price > 0) {
              const tradeTick: BybitTradeTick = {
                symbol,
                price,
                size,
                side,
                timestamp,
                tradeId,
              };

              // Dispatch to trade listeners
              const listeners = this.tradeListeners.get(symbol);
              if (listeners) {
                listeners.forEach((fn) => {
                  try {
                    fn(tradeTick);
                  } catch (e) {}
                });
              }
            }
          });
        }
        return;
      }

      // 2. Handle Bybit Tickers: topic = "tickers.BTCUSDT"
      if (msg.topic && msg.topic.startsWith('tickers.')) {
        const symbol = msg.topic.replace('tickers.', '').toUpperCase();
        const data = msg.data;
        if (data) {
          const lastPrice = data.lastPrice ? parseFloat(data.lastPrice) : undefined;
          if (lastPrice && lastPrice > 0) {
            const tickerUpdate: BybitTickerUpdate = {
              symbol,
              lastPrice,
              highPrice24h: data.highPrice24h ? parseFloat(data.highPrice24h) : undefined,
              lowPrice24h: data.lowPrice24h ? parseFloat(data.lowPrice24h) : undefined,
              prevPrice24h: data.prevPrice24h ? parseFloat(data.prevPrice24h) : undefined,
              price24hPcnt: data.price24hPcnt ? parseFloat(data.price24hPcnt) : undefined,
              turnover24h: data.turnover24h ? parseFloat(data.turnover24h) : undefined,
              volume24h: data.volume24h ? parseFloat(data.volume24h) : undefined,
              fundingRate: data.fundingRate ? parseFloat(data.fundingRate) : undefined,
            };

            // Dispatch to symbol ticker listeners immediately
            const listeners = this.tickerListeners.get(symbol);
            if (listeners) {
              listeners.forEach((fn) => {
                try {
                  fn(tickerUpdate);
                } catch (e) {}
              });
            }

            // Queue global ticker update to flush at a smooth, stable 250ms cadence
            this.pendingGlobalTickers.set(symbol, tickerUpdate);
            if (!this.globalFlushTimeout) {
              this.globalFlushTimeout = setTimeout(() => {
                this.globalFlushTimeout = null;
                const updates = Array.from(this.pendingGlobalTickers.values());
                this.pendingGlobalTickers.clear();

                updates.forEach((update) => {
                  this.globalTickerListeners.forEach((fn) => {
                    try {
                      fn(update);
                    } catch (e) {}
                  });
                });
              }, 250);
            }
          }
        }
        return;
      }

      // 3. Handle Bybit Live Kline: topic = "kline.1.BTCUSDT"
      if (msg.topic && msg.topic.startsWith('kline.')) {
        const parts = msg.topic.split('.');
        const symbol = parts[2]?.toUpperCase();
        if (symbol && Array.isArray(msg.data) && msg.data.length > 0) {
          const item = msg.data[0];
          const timestamp = parseInt(item.start || `${Date.now()}`, 10);
          const open = parseFloat(item.open || '0');
          const high = parseFloat(item.high || '0');
          const low = parseFloat(item.low || '0');
          const close = parseFloat(item.close || '0');
          const volume = parseFloat(item.volume || '0');
          const turnover = parseFloat(item.turnover || '0');

          const date = new Date(timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const klinePoint: KlinePoint = {
            timestamp,
            timeStr,
            open,
            high,
            low,
            close,
            volume,
            turnover,
          };

          const listeners = this.klineListeners.get(symbol);
          if (listeners) {
            listeners.forEach((fn) => {
              try {
                fn(klinePoint);
              } catch (e) {}
            });
          }
        }
        return;
      }
    } catch (e) {
      // ignore non-JSON or parsing errors
    }
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }
}

export const bybitWs = new BybitWebSocketService();
