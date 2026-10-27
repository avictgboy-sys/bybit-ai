import { TickerData, FactorConfirmation, SignalDirection } from '../types';
import { computeTechnicalIndicators, calculateCentralSignalDecision } from './technicalAnalysis';

export interface ConfluenceScanResult {
  symbol: string;
  baseCoin: string;
  price: number;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  matchedCount: number; // e.g. 5, 6, 7, 8, 9
  totalFactors: number; // 9
  matchedFactors: {
    factor: string;
    label: string;
    detail: string;
  }[];
  confidence: number;
  timestamp: number;
}

export function evaluateCoin9FactorConfluence(
  ticker: TickerData,
  requiredMinMatches: number = 5
): ConfluenceScanResult | null {
  if (!ticker || !ticker.lastPrice) return null;

  const indicators = computeTechnicalIndicators([], ticker.lastPrice, ticker.symbol);
  const decision = calculateCentralSignalDecision(ticker, indicators, []);

  // Filter confirmed factors aligned with trade direction
  const confirmedFactors = decision.confirmations.filter(
    (c) => c.status === 'CONFIRMED'
  );

  const matchedCount = confirmedFactors.length;

  if (matchedCount >= requiredMinMatches && decision.finalSignal !== SignalDirection.NEUTRAL) {
    return {
      symbol: ticker.symbol,
      baseCoin: ticker.baseCoin,
      price: ticker.lastPrice,
      direction: decision.finalSignal === SignalDirection.LONG ? 'LONG' : 'SHORT',
      matchedCount,
      totalFactors: 9,
      matchedFactors: confirmedFactors.map((c) => ({
        factor: c.factor,
        label: c.label,
        detail: c.detail,
      })),
      confidence: decision.confidence,
      timestamp: Date.now(),
    };
  }

  return null;
}
