import {
  TickerData,
  KlinePoint,
  FearAndGreedData,
  Timeframe,
  AiAnalysisResult,
  TechnicalIndicators,
} from '../types';

const CACHE_KEYS = {
  TICKERS: 'bybit_ai_pro_tickers_cache',
  FEAR_GREED: 'bybit_ai_pro_fng_cache',
  WATCHLIST: 'bybit_ai_pro_watchlist',
  SETTINGS: 'bybit_ai_pro_settings',
};

// Map timeframes to Bybit API intervals
export function timeframeToBybitInterval(timeframe: Timeframe): string {
  switch (timeframe) {
    case '15m':
      return '15';
    case '1h':
      return '60';
    case '4h':
      return '240';
    case '1d':
      return 'D';
    default:
      return '60';
  }
}

// Direct Browser Fetcher for live prices when server proxies encounter rate limits or IP restrictions
async function fetchDirectCryptoCompareTickers(): Promise<TickerData[] | null> {
  try {
    const coinsList =
      'BTC,ETH,SOL,BNB,AVAX,SUI,XRP,DOGE,NEAR,LINK,PEPE,RNDR,WIF,FET,ARB,OP,ADA,SHIB,DOT,LTC,BCH,APT,INJ,TIA,SEI,TON,FIL,ATOM,TRX,ALGO,UNI,FLOKI,BONK,AAVE,MKR,STX,ORDI,RENDER,GRT,FTM,THETA,IMX,XLM,SAND,MANA,GALA,CHZ,ENS,JUP,ENA,AXS';
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coinsList}&tsyms=USDT`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.RAW) {
      const tickers: TickerData[] = [];
      Object.keys(data.RAW).forEach((base) => {
        const pair = data.RAW[base]?.USDT;
        if (pair) {
          const lastPrice = pair.PRICE || 0;
          const pct = (pair.CHANGEPCT24HOUR || 0) / 100;
          const prevPrice = pair.OPEN24HOUR || (pct !== -1 ? lastPrice / (1 + pct) : lastPrice);
          tickers.push({
            symbol: `${base}USDT`,
            baseCoin: base,
            quoteCoin: 'USDT',
            lastPrice,
            prevPrice24h: prevPrice,
            price24hPcnt: pct,
            highPrice24h: pair.HIGH24HOUR || lastPrice * 1.02,
            lowPrice24h: pair.LOW24HOUR || lastPrice * 0.98,
            turnover24h: pair.VOLUME24HOURTO || 50000000,
            volume24h: pair.VOLUME24HOUR || 100000,
            fundingRate: 0.0001,
          });
        }
      });
      if (tickers.length > 0) return tickers;
    }
  } catch (e) {
    console.warn('Direct browser CryptoCompare fetch error:', e);
  }
  return null;
}

// Direct Browser Fetcher for live Bybit Klines
export async function fetchDirectBybitKlines(
  symbol: string,
  timeframe: Timeframe = '1h',
  limit: number = 100
): Promise<KlinePoint[] | null> {
  const interval = timeframeToBybitInterval(timeframe);
  const urls = [
    `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`,
    `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${interval}&limit=${limit}`,
    `https://api.bytick.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const raw = await res.json();
      if (raw && raw.result && Array.isArray(raw.result.list) && raw.result.list.length > 0) {
        const rawList = [...raw.result.list].reverse();
        const klines: KlinePoint[] = rawList.map((k: any) => {
          const timestamp = parseInt(k[0], 10);
          const open = parseFloat(k[1]);
          const high = parseFloat(k[2]);
          const low = parseFloat(k[3]);
          const close = parseFloat(k[4]);
          const volume = parseFloat(k[5]);
          const turnover = parseFloat(k[6] || '0');
          const date = new Date(timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return { timestamp, timeStr, open, high, low, close, volume, turnover };
        });
        if (klines.length > 0) {
          console.log(`[fetchDirectBybitKlines] Loaded ${klines.length} real klines for ${symbol} from Bybit (${url})`);
          return klines;
        }
      }
    } catch (e) {}
  }
  return null;
}

// Direct Browser Fetcher for live Klines from CryptoCompare
async function fetchDirectCryptoCompareKlines(
  symbol: string,
  limit: number = 100
): Promise<KlinePoint[] | null> {
  try {
    const baseCoin = symbol.replace('USDT', '');
    const res = await fetch(
      `https://min-api.cryptocompare.com/data/v2/histohour?fsym=${baseCoin}&tsym=USDT&limit=${limit}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.Data && Array.isArray(data.Data.Data)) {
      const list = data.Data.Data;
      const klines: KlinePoint[] = list.map((item: any) => {
        const timestamp = item.time * 1000;
        const open = item.open;
        const high = item.high;
        const low = item.low;
        const close = item.close;
        const volume = item.volumeto;
        const date = new Date(timestamp);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          timestamp,
          timeStr,
          open,
          high,
          low,
          close,
          volume,
          turnover: volume * close,
        };
      });
      if (klines.length > 0) return klines;
    }
  } catch (e) {
    console.warn(`Direct kline fetch failed for ${symbol}:`, e);
  }
  return null;
}

// Direct Browser Fetcher for Bybit V5 public endpoint
async function fetchDirectBybitTickers(): Promise<TickerData[] | null> {
  const urls = [
    'https://api.bybit.com/v5/market/tickers?category=linear',
    'https://api.bybit.com/v5/market/tickers?category=spot',
  ];
  for (const url of urls) {
    try {
      console.log(`[fetchDirectBybitTickers] Attempting direct browser fetch to ${url}...`);
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[fetchDirectBybitTickers] ${url} returned HTTP ${res.status}`);
        continue;
      }
      const rawData = await res.json();
      if (rawData && rawData.result && Array.isArray(rawData.result.list)) {
        const tickers = rawData.result.list
          .filter(
            (item: any) =>
              item.symbol &&
              item.symbol.endsWith('USDT') &&
              !item.symbol.includes('USDC') &&
              parseFloat(item.turnover24h || '0') > 1000000
          )
          .sort((a: any, b: any) => parseFloat(b.turnover24h || '0') - parseFloat(a.turnover24h || '0'))
          .slice(0, 80)
          .map((item: any) => ({
            symbol: item.symbol,
            baseCoin: item.symbol.replace('USDT', ''),
            quoteCoin: 'USDT',
            lastPrice: parseFloat(item.lastPrice || '0'),
            prevPrice24h: parseFloat(item.prevPrice24h || '0'),
            price24hPcnt: parseFloat(item.price24hPcnt || '0'),
            highPrice24h: parseFloat(item.highPrice24h || '0'),
            lowPrice24h: parseFloat(item.lowPrice24h || '0'),
            turnover24h: parseFloat(item.turnover24h || '0'),
            volume24h: parseFloat(item.volume24h || '0'),
            fundingRate: item.fundingRate ? parseFloat(item.fundingRate) : undefined,
            openInterest: item.openInterest ? parseFloat(item.openInterest) : undefined,
            openInterestValue: item.openInterestValue ? parseFloat(item.openInterestValue) : undefined,
          }));

        if (tickers.length > 0) {
          console.log(`[fetchDirectBybitTickers] Successfully fetched ${tickers.length} tickers directly from Bybit browser call!`);
          return tickers;
        }
      } else {
        console.warn(`[fetchDirectBybitTickers] ${url} payload missing result.list: retCode=${rawData?.retCode}, retMsg=${rawData?.retMsg}`);
      }
    } catch (e: any) {
      console.warn(`[fetchDirectBybitTickers] Direct browser fetch to ${url} failed (CORS or network error):`, e.message);
    }
  }
  return null;
}

// Fetch Tickers from Express Proxy / Bybit V5 or Direct Live Endpoints
export async function fetchMarketTickers(): Promise<TickerData[]> {
  console.log('[fetchMarketTickers] Initiating market tickers fetch via Express proxy /api/bybit/tickers...');
  try {
    const res = await fetch('/api/bybit/tickers');
    console.log(`[fetchMarketTickers] Server proxy responded with HTTP status ${res.status}`);

    if (res.ok) {
      const data = await res.json();
      console.log(`[fetchMarketTickers] Proxy payload parsed: status=${data?.status}, source=${data?.source}, count=${data?.tickers?.length}`);

      if (data && Array.isArray(data.tickers) && data.tickers.length > 0) {
        // If server provided real exchange data (source is bybit, okx, cryptocompare, gateio, binance-us, etc.)
        if (data.source && data.source !== 'fallback') {
          console.log(`[fetchMarketTickers] Successfully using live market data from exchange source: '${data.source}' (${data.tickers.length} coins)`);
          try {
            localStorage.setItem(CACHE_KEYS.TICKERS, JSON.stringify(data.tickers));
          } catch (e) {}
          return data.tickers;
        }

        console.warn('[fetchMarketTickers] Server proxy returned fallback data dataset. Attempting direct browser fetch cascades...');
      }
    } else {
      console.warn(`[fetchMarketTickers] Server proxy request failed with HTTP ${res.status}`);
    }
  } catch (err: any) {
    console.warn('[fetchMarketTickers] Server proxy fetch threw exception:', err.message);
  }

  // 1. Direct browser Bybit V5 fetch
  console.log('[fetchMarketTickers] Cascading to 1. Direct Browser Bybit V5 Public Endpoint...');
  const directBybit = await fetchDirectBybitTickers();
  if (directBybit && directBybit.length > 0) {
    try {
      localStorage.setItem(CACHE_KEYS.TICKERS, JSON.stringify(directBybit));
    } catch (e) {}
    return directBybit;
  }

  // 2. Direct browser CryptoCompare live fetch
  console.log('[fetchMarketTickers] Cascading to 2. Direct Browser CryptoCompare Live Endpoint...');
  const directLive = await fetchDirectCryptoCompareTickers();
  if (directLive && directLive.length > 0) {
    console.log(`[fetchMarketTickers] Successfully retrieved ${directLive.length} live tickers from CryptoCompare direct fetch.`);
    try {
      localStorage.setItem(CACHE_KEYS.TICKERS, JSON.stringify(directLive));
    } catch (e) {}
    return directLive;
  }

  // 3. LocalStorage cache fallback
  console.log('[fetchMarketTickers] Cascading to 3. Checking LocalStorage cached tickers...');
  const cached = localStorage.getItem(CACHE_KEYS.TICKERS);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`[fetchMarketTickers] Returning ${parsed.length} cached tickers from LocalStorage.`);
        return parsed;
      }
    } catch (e) {}
  }

  // 4. Default static fallback
  console.warn('[fetchMarketTickers] All live endpoints failed. Returning default static fallback tickers.');
  return getFallbackTickers();
}

// Fetch Klines for a specific coin and timeframe with multiple real Bybit cascades
export async function fetchKlineData(
  symbol: string,
  timeframe: Timeframe = '1h',
  limit: number = 100
): Promise<KlinePoint[]> {
  const interval = timeframeToBybitInterval(timeframe);

  // 1. First attempt direct browser Bybit V5 endpoint (Fastest & direct connection to Bybit)
  try {
    const directBybit = await fetchDirectBybitKlines(symbol, timeframe, limit);
    if (directBybit && directBybit.length > 0) {
      return directBybit;
    }
  } catch (e) {
    console.warn(`[fetchKlineData] Direct browser Bybit kline failed for ${symbol}:`, e);
  }

  // 2. Second attempt via Express backend proxy
  try {
    const res = await fetch(`/api/bybit/kline?symbol=${symbol}&interval=${interval}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.klines) && data.klines.length > 0) {
        if (data.source && data.source !== 'fallback') {
          return data.klines;
        }
        const directCC = await fetchDirectCryptoCompareKlines(symbol, limit);
        if (directCC && directCC.length > 0) return directCC;
        return data.klines;
      }
    }
  } catch (err) {
    console.warn(`[fetchKlineData] Server proxy kline fetch failed for ${symbol}:`, err);
  }

  // 3. Third attempt via CryptoCompare
  const directKlines = await fetchDirectCryptoCompareKlines(symbol, limit);
  if (directKlines && directKlines.length > 0) return directKlines;

  return generateFallbackKlines(symbol, limit);
}

// Fetch Fear and Greed Index
export async function fetchFearAndGreed(): Promise<FearAndGreedData> {
  try {
    const res = await fetch('/api/fear-and-greed');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.value !== undefined) {
      localStorage.setItem(CACHE_KEYS.FEAR_GREED, JSON.stringify(data));
      return data;
    }
    throw new Error('Invalid fear & greed data');
  } catch (err) {
    console.warn('Fear & Greed fetch failed:', err);
    const cached = localStorage.getItem(CACHE_KEYS.FEAR_GREED);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // ignore
      }
    }
    const defaultValues = [52, 54, 58, 60, 56, 62, 64];
    const defaultHistory = defaultValues.map((val, idx) => {
      const ts = Date.now() - (6 - idx) * 86400000;
      const d = new Date(ts);
      const label = idx === 6 ? 'Today' : idx === 5 ? 'Yesterday' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        value: val,
        classification: (val <= 25 ? 'Extreme Fear' : val <= 45 ? 'Fear' : val <= 55 ? 'Neutral' : val <= 75 ? 'Greed' : 'Extreme Greed') as any,
        timestamp: ts,
        dateLabel: label,
      };
    });

    return {
      value: 64,
      classification: 'Greed',
      timestamp: new Date().toISOString(),
      history: defaultHistory,
    };
  }
}

// Request AI Analysis from Gemini via backend
export async function fetchAiGeminiInsight(
  ticker: TickerData,
  indicators: TechnicalIndicators
): Promise<string | null> {
  try {
    const res = await fetch('/api/ai-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, indicators }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.insight || null;
  } catch (e) {
    console.warn('Gemini AI analysis endpoint offline or key missing, falling back to local engine');
    return null;
  }
}

// Local Storage Watchlist helper
export function getSavedWatchlist(): string[] {
  try {
    const data = localStorage.getItem(CACHE_KEYS.WATCHLIST);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Watchlist read error', e);
  }
  return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'AVAXUSDT', 'SUIUSDT'];
}

export function saveWatchlist(symbols: string[]): void {
  try {
    localStorage.setItem(CACHE_KEYS.WATCHLIST, JSON.stringify(symbols));
  } catch (e) {
    console.warn('Watchlist write error', e);
  }
}

// Default Fallback Tickers for immediate display or offline mode
function getFallbackTickers(): TickerData[] {
  return [
    {
      symbol: 'BTCUSDT',
      baseCoin: 'BTC',
      quoteCoin: 'USDT',
      lastPrice: 64474.9,
      prevPrice24h: 63878.5,
      price24hPcnt: 0.0261,
      highPrice24h: 89100.0,
      lowPrice24h: 85900.0,
      turnover24h: 5845000000,
      volume24h: 67420,
      fundingRate: 0.0001,
      openInterest: 28500,
      openInterestValue: 2520000000,
    },
    {
      symbol: 'ETHUSDT',
      baseCoin: 'ETH',
      quoteCoin: 'USDT',
      lastPrice: 3501.33,
      prevPrice24h: 3380.0,
      price24hPcnt: 0.0359,
      highPrice24h: 3600.0,
      lowPrice24h: 3278.6,
      turnover24h: 2450000000,
      volume24h: 701000,
      fundingRate: 0.00012,
      openInterest: 194000,
      openInterestValue: 679000000,
    },
    {
      symbol: 'SOLUSDT',
      baseCoin: 'SOL',
      quoteCoin: 'USDT',
      lastPrice: 182.4,
      prevPrice24h: 168.0,
      price24hPcnt: 0.0857,
      highPrice24h: 186.5,
      lowPrice24h: 166.2,
      turnover24h: 920000000,
      volume24h: 5200000,
      fundingRate: 0.00025,
      openInterest: 3200000,
      openInterestValue: 580000000,
    },
    {
      symbol: 'SUIUSDT',
      baseCoin: 'SUI',
      quoteCoin: 'USDT',
      lastPrice: 2.15,
      prevPrice24h: 1.82,
      price24hPcnt: 0.1813,
      highPrice24h: 2.22,
      lowPrice24h: 1.79,
      turnover24h: 410000000,
      volume24h: 198000000,
      fundingRate: 0.00045,
      openInterest: 45000000,
      openInterestValue: 96000000,
    },
    {
      symbol: 'AVAXUSDT',
      baseCoin: 'AVAX',
      quoteCoin: 'USDT',
      lastPrice: 28.6,
      prevPrice24h: 30.2,
      price24hPcnt: -0.0529,
      highPrice24h: 30.8,
      lowPrice24h: 28.1,
      turnover24h: 180000000,
      volume24h: 6100000,
      fundingRate: -0.00005,
      openInterest: 1800000,
      openInterestValue: 51000000,
    },
    {
      symbol: 'XRPUSDT',
      baseCoin: 'XRP',
      quoteCoin: 'USDT',
      lastPrice: 0.584,
      prevPrice24h: 0.598,
      price24hPcnt: -0.0234,
      highPrice24h: 0.605,
      lowPrice24h: 0.578,
      turnover24h: 310000000,
      volume24h: 520000000,
      fundingRate: 0.00008,
      openInterest: 120000000,
      openInterestValue: 70000000,
    },
    {
      symbol: 'PEPEUSDT',
      baseCoin: 'PEPE',
      quoteCoin: 'USDT',
      lastPrice: 0.0000112,
      prevPrice24h: 0.0000091,
      price24hPcnt: 0.2307,
      highPrice24h: 0.0000118,
      lowPrice24h: 0.0000089,
      turnover24h: 540000000,
      volume24h: 48000000000,
      fundingRate: 0.00065,
      openInterest: 21000000000,
      openInterestValue: 235000000,
    },
    {
      symbol: 'NEARUSDT',
      baseCoin: 'NEAR',
      quoteCoin: 'USDT',
      lastPrice: 5.42,
      prevPrice24h: 5.15,
      price24hPcnt: 0.0524,
      highPrice24h: 5.58,
      lowPrice24h: 5.08,
      turnover24h: 220000000,
      volume24h: 41000000,
      fundingRate: 0.00015,
      openInterest: 8500000,
      openInterestValue: 46000000,
    },
  ];
}

// Generate smooth Kline points for fallback
function generateFallbackKlines(symbol: string, count: number): KlinePoint[] {
  const result: KlinePoint[] = [];
  let basePrice = symbol.startsWith('BTC')
    ? 88000
    : symbol.startsWith('ETH')
    ? 3500
    : symbol.startsWith('SOL')
    ? 195
    : 10;
  const now = Date.now();
  const stepMs = 3600 * 1000;

  for (let i = count; i >= 0; i--) {
    const time = now - i * stepMs;
    const changePcnt = (Math.random() - 0.48) * 0.015;
    const open = basePrice;
    const close = basePrice * (1 + changePcnt);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = Math.round(1000 + Math.random() * 5000);
    const turnover = volume * close;

    result.push({
      timestamp: time,
      timeStr: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      turnover,
    });

    basePrice = close;
  }

  return result;
}
