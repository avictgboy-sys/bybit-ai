import { useState, useEffect } from 'react';
import { CentralPriceStore, CanonicalPriceRecord } from './centralPriceStore';

/**
 * React hook to listen to real-time single-source-of-truth price for a specific asset.
 */
export function useCentralPrice(symbol: string | null | undefined): CanonicalPriceRecord | null {
  const [priceRecord, setPriceRecord] = useState<CanonicalPriceRecord | null>(() => {
    return symbol ? CentralPriceStore.getPrice(symbol) : null;
  });

  useEffect(() => {
    if (!symbol) return;
    const unsub = CentralPriceStore.subscribeSymbol(symbol, (record) => {
      setPriceRecord(record);
    });
    return unsub;
  }, [symbol]);

  return priceRecord;
}

/**
 * React hook to access all live canonical prices
 */
export function useAllCentralPrices(): CanonicalPriceRecord[] {
  const [prices, setPrices] = useState<CanonicalPriceRecord[]>(() => CentralPriceStore.getAllPrices());

  useEffect(() => {
    const unsub = CentralPriceStore.subscribeGlobal((recordsMap) => {
      setPrices(Object.values(recordsMap));
    });
    return unsub;
  }, []);

  return prices;
}
