
export interface ReportData {
  meta: {
    ticker: string;
    companyName: string;
    rating: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL' | 'OVERWEIGHT';
    targetPrice: string;
    currentPrice: string;
    date: string;
    analyst: string;
  };
  content: {
    headline: string;
    summary: string;
    investmentThesis: string;
    keyRisks: string;
    valuation: string;
    conclusion: string; // New field for the final emphasized verdict
  };
  keyMetrics: {
    label: string;
    value: string;
  }[];
}

export interface KLineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
  dif?: number;
  dea?: number;
  macd?: number;
  rsi?: number;
  bbMiddle?: number;
  bbUpper?: number;
  bbLower?: number;
}

export type MATrend = 'long' | 'short' | 'tangled';

export interface StockInfo {
  code: string;
  name: string;
  market: string;
}

export type TimePeriod = 'day' | 'week' | 'month' | '30m' | '5m';

export interface MarketIndex {
  name: string;
  price: number;
  change: number;
  rsi: number;
  macdStatus: 'bullish' | 'bearish' | 'neutral';
}
