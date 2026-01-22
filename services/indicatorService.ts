
import { KLineData, MATrend } from '../types';

export const getMATrend = (data: KLineData): MATrend => {
  const { ma5, ma10, ma20 } = data;
  if (!ma5 || !ma10 || !ma20) return 'tangled';
  if (ma5 > ma10 && ma10 > ma20) return 'long';
  if (ma5 < ma10 && ma10 < ma20) return 'short';
  return 'tangled';
};

export const calculateIndicators = (data: KLineData[]): KLineData[] => {
  if (data.length === 0) return [];
  const results = [...data];

  // Moving Averages
  const calculateMA = (period: number, key: string) => {
    for (let i = 0; i < results.length; i++) {
      if (i < period - 1) continue;
      const sum = results.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr.close, 0);
      (results[i] as any)[key] = sum / period;
    }
  };

  calculateMA(5, 'ma5');
  calculateMA(10, 'ma10');
  calculateMA(20, 'ma20');
  calculateMA(60, 'ma60');

  // EMA for MACD
  const calculateEMA = (period: number, prices: number[]) => {
    const k = 2 / (period + 1);
    let ema = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
      ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
  };

  const closes = results.map(d => d.close);
  const ema12 = calculateEMA(12, closes);
  const ema26 = calculateEMA(26, closes);
  const dif = ema12.map((e12, i) => e12 - ema26[i]);
  const dea = calculateEMA(9, dif);
  
  for (let i = 0; i < results.length; i++) {
    results[i].dif = dif[i];
    results[i].dea = dea[i];
    results[i].macd = 2 * (dif[i] - dea[i]);
  }

  // RSI (Standard 14 period)
  const rsiPeriod = 14;
  for (let i = rsiPeriod; i < results.length; i++) {
    let gains = 0;
    let losses = 0;
    for (let j = i - rsiPeriod + 1; j <= i; j++) {
      const change = results[j].close - results[j - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / rsiPeriod;
    const avgLoss = losses / rsiPeriod;
    results[i].rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
  }

  // Bollinger Bands
  const bbPeriod = 20;
  for (let i = bbPeriod - 1; i < results.length; i++) {
    const slice = results.slice(i - bbPeriod + 1, i + 1);
    const avg = slice.reduce((acc, curr) => acc + curr.close, 0) / bbPeriod;
    const variance = slice.reduce((acc, curr) => acc + Math.pow(curr.close - avg, 2), 0) / bbPeriod;
    const stdDev = Math.sqrt(variance);
    results[i].bbMiddle = avg;
    results[i].bbUpper = avg + 2 * stdDev;
    results[i].bbLower = avg - 2 * stdDev;
  }

  return results;
};

export const resampleData = (data: KLineData[], period: 'W' | 'M'): KLineData[] => {
  const resampled: KLineData[] = [];
  const step = period === 'W' ? 5 : 20;
  for (let i = 0; i < data.length; i += step) {
    const chunk = data.slice(i, i + step);
    if (chunk.length === 0) continue;
    resampled.push({
      date: chunk[chunk.length - 1].date,
      open: chunk[0].open,
      high: Math.max(...chunk.map(c => c.high)),
      low: Math.min(...chunk.map(c => c.low)),
      close: chunk[chunk.length - 1].close,
      volume: chunk.reduce((acc, c) => acc + c.volume, 0)
    });
  }
  return calculateIndicators(resampled);
};
