/**
 * Formats cryptocurrency prices consistently across the application.
 * Prices >= 1 USD are formatted with 2 decimal places and thousands separators (e.g. $3,501.33).
 * Prices < 1 USD use appropriate decimal precision (e.g. $0.5840 or $0.0000112).
 */
export function formatPrice(price: number | undefined | null, includeSymbol: boolean = true): string {
  if (price === undefined || price === null || isNaN(price)) {
    return includeSymbol ? '$0.00' : '0.00';
  }

  const symbol = includeSymbol ? '$' : '';

  if (price >= 1) {
    const formatted = price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${symbol}${formatted}`;
  } else if (price >= 0.0001) {
    return `${symbol}${price.toFixed(4)}`;
  } else {
    // Micro caps / meme coins with low value
    return `${symbol}${price.toFixed(7)}`;
  }
}

/**
 * Formats prices with deterministic, fixed decimal precision and tabular alignment.
 * Prevents UI layout jumping when digits change in live tickers and signal cards.
 */
export function formatFixedPrecisionPrice(
  price: number | undefined | null,
  options?: {
    symbol?: string;
    includeCurrencySign?: boolean;
    decimals?: number;
  }
): string {
  if (price === undefined || price === null || isNaN(price)) {
    return options?.includeCurrencySign ? '$0.00' : '0.00';
  }

  const symbol = options?.symbol ? options.symbol.toUpperCase() : '';
  const includeCurrency = options?.includeCurrencySign ?? false;
  const prefix = includeCurrency ? '$' : '';

  // 1. Explicit decimal places provided
  if (options?.decimals !== undefined) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: options.decimals,
      maximumFractionDigits: options.decimals,
    })}`;
  }

  // 2. Forex JPY pairs (e.g. USDJPY, EURJPY)
  if (symbol.includes('JPY')) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  }

  // 3. Forex Majors (e.g. EURUSD, GBPUSD, AUDUSD, NZDUSD, USDCAD, USDCHF)
  const isForexMajor =
    symbol.includes('EUR') ||
    symbol.includes('GBP') ||
    symbol.includes('AUD') ||
    symbol.includes('NZD') ||
    symbol.includes('CAD') ||
    symbol.includes('CHF');
  if (isForexMajor && price < 10) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    })}`;
  }

  // 4. Gold, Silver, Oil & Indices (e.g. XAUUSD, XAGUSD, US30, NAS100)
  if (
    symbol.includes('XAU') ||
    symbol.includes('GOLD') ||
    symbol.includes('XAG') ||
    symbol.includes('OIL') ||
    symbol.includes('US30') ||
    symbol.includes('NAS') ||
    symbol.includes('SPX')
  ) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // 5. Crypto & General numerical magnitudes
  if (price >= 1000) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else if (price >= 1) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else if (price >= 0.01) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })}`;
  } else if (price >= 0.0001) {
    return `${prefix}${price.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    })}`;
  } else {
    return `${prefix}${price.toFixed(7)}`;
  }
}

export function formatTurnover(turnover: number | undefined | null): string {
  if (!turnover) return '$0.00';
  if (turnover >= 1e9) {
    return `$${(turnover / 1e9).toFixed(2)}B`;
  }
  if (turnover >= 1e6) {
    return `$${(turnover / 1e6).toFixed(2)}M`;
  }
  if (turnover >= 1e3) {
    return `$${(turnover / 1e3).toFixed(2)}K`;
  }
  return `$${turnover.toFixed(2)}`;
}
