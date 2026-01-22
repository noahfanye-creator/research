
import { KLineData, StockInfo, TimePeriod, MarketIndex } from '../types';
import { calculateIndicators, resampleData } from './indicatorService';

export const normalizeCode = (code: string): { normalized: string; market: 'A' | 'HK' } => {
  let clean = code.trim().toLowerCase();
  if (clean.includes('.hk') || clean.endsWith('hk')) {
    return { normalized: clean.replace('.hk', '').replace('hk', '') + 'hk', market: 'HK' };
  }
  if (/^\d{5,6}$/.test(clean)) {
    if (clean.startsWith('6')) return { normalized: `sh${clean}`, market: 'A' };
    if (clean.startsWith('0') || clean.startsWith('3')) return { normalized: `sz${clean}`, market: 'A' };
    if (clean.startsWith('4') || clean.startsWith('8')) return { normalized: `bj${clean}`, market: 'A' };
    if (clean.length === 5) return { normalized: `${clean}hk`, market: 'HK' };
  }
  return { normalized: clean, market: 'A' };
};

export const getMarketIndices = (): MarketIndex[] => [
  { name: '上证指数', price: 3125.42, change: 0.45, rsi: 58.2, macdStatus: 'bullish' },
  { name: '深证成指', price: 9520.11, change: -0.12, rsi: 42.1, macdStatus: 'neutral' },
  { name: '科创 50', price: 785.34, change: 1.22, rsi: 72.5, macdStatus: 'bullish' },
  { name: '创业板指', price: 1842.55, change: 0.33, rsi: 51.8, macdStatus: 'bearish' },
];

const generateMockData = (count: number, basePrice: number, volatility: number = 0.02): KLineData[] => {
  const data: KLineData[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (count - i));
    const change = currentPrice * volatility * (Math.random() - 0.5);
    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * (currentPrice * 0.01);
    const low = Math.min(open, close) - Math.random() * (currentPrice * 0.01);
    const volume = Math.floor(Math.random() * 1000000) + 500000;
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume
    });
    currentPrice = close;
  }
  return data;
};

export const fetchStockData = async (code: string): Promise<{ info: StockInfo; periods: any }> => {
  const { normalized, market } = normalizeCode(code);
  const basePrice = market === 'HK' ? 150 : 30;
  const rawDayData = generateMockData(200, basePrice);
  return {
    info: { code: normalized, name: `${normalized.toUpperCase()} 标的`, market },
    periods: {
      day: calculateIndicators(rawDayData),
      week: resampleData(rawDayData, 'W'),
      month: resampleData(rawDayData, 'M'),
      '30m': calculateIndicators(generateMockData(200, basePrice, 0.005)),
      '5m': calculateIndicators(generateMockData(200, basePrice, 0.002))
    }
  };
};
