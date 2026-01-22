
export interface ReportData {
  meta: {
    ticker: string;
    companyName: string;
    rating: 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL' | 'OVERWEIGHT';
    targetPrice: string;
    currentPrice: string;
    date: string;
    analyst: string;
    priceTrend: number[]; // Array of 7 numbers representing the 7-day trend
  };
  content: {
    headline: string;
    // Changed from fixed fields to dynamic sections to preserve user content structure
    sections: {
      title: string;
      body: string;
    }[];
    keyRisks: string;
    conclusion: string;
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
