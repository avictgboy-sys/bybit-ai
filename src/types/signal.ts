import { SignalDirection, FinalDirection, TradePlan } from '../types';

export interface IndicatorScore {
  bullishScore: number;
  bearishScore: number;
  neutralScore: number;
  maxPossibleScore?: number;
  dominantDirection?: SignalDirection | FinalDirection;
  confluenceRatio?: number;
  reasoning?: string[];
}

export interface FactorWeightMapping {
  factor: string;
  weight: number;
  score: IndicatorScore;
  indicatorKey: string;
  metricValue?: string | number;
  status: 'CONFIRMED' | 'RISK' | 'NEUTRAL';
}

export interface WeightedConfluenceBreakdown {
  totalBullish: number;
  totalBearish: number;
  totalNeutral: number;
  netScore: number;
  leadMargin: number;
  passedThreshold: boolean;
  factors: FactorWeightMapping[];
}
