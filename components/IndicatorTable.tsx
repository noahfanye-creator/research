
import React from 'react';
import { KLineData, MATrend } from '../types';
import { getMATrend } from '../services/indicatorService';

interface Props {
  data: KLineData;
  title: string;
}

const IndicatorTable: React.FC<Props> = ({ data, title }) => {
  const maTrend = getMATrend(data);
  const rsi = data.rsi || 50;

  const getMAColor = (trend: MATrend) => {
    if (trend === 'long') return 'text-red-500 font-bold';
    if (trend === 'short') return 'text-green-500 font-bold';
    return 'text-gray-500';
  };

  const getRSIBadge = (val: number) => {
    if (val > 70) return <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold">超买风险</span>;
    if (val < 30) return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-bold">超卖机会</span>;
    return <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">数值适中</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-gray-700 uppercase">{title} 诊断</h4>
        <span className="text-[10px] text-gray-400 font-mono">{data.date}</span>
      </div>
      
      <div className="space-y-4">
        {/* Price Section */}
        <div className="flex items-end justify-between border-b border-gray-50 pb-2">
          <span className="text-xs text-gray-500">现价 (Close)</span>
          <span className="text-lg font-black text-gray-900">{data.close.toFixed(2)}</span>
        </div>

        {/* MA System */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 font-medium">均线系统</span>
            <span className={getMAColor(maTrend)}>
              {maTrend === 'long' ? '多头排列' : maTrend === 'short' ? '空头排列' : '相互缠绕'}
            </span>
          </div>
          <div className="flex gap-2 text-[10px] font-mono text-gray-400">
            <span>5: {data.ma5?.toFixed(2)}</span>
            <span>10: {data.ma10?.toFixed(2)}</span>
            <span>20: {data.ma20?.toFixed(2)}</span>
          </div>
        </div>

        {/* MACD */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500 font-medium">MACD (12,26,9)</span>
            <span className={(data.macd || 0) > 0 ? 'text-red-500' : 'text-green-500'}>
              {(data.macd || 0) > 0 ? '强势区' : '弱势区'}
            </span>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                <div 
                  className={(data.macd || 0) > 0 ? 'bg-red-400' : 'bg-green-400'} 
                  style={{ width: `${Math.min(Math.abs((data.macd || 0) * 10), 100)}%` }}
                />
             </div>
             <span className="text-[10px] font-mono text-gray-500">{data.macd?.toFixed(3)}</span>
          </div>
        </div>

        {/* RSI */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs items-center">
            <span className="text-gray-500 font-medium">RSI (14)</span>
            {getRSIBadge(rsi)}
          </div>
          <div className="flex items-center gap-2">
             <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute left-[30%] right-[30%] h-full border-x border-gray-300 bg-gray-200/50" />
                <div 
                  className={rsi > 70 ? 'bg-red-500' : rsi < 30 ? 'bg-blue-500' : 'bg-blue-400'} 
                  style={{ width: `${rsi}%` }}
                />
             </div>
             <span className="text-[10px] font-mono text-gray-500">{rsi.toFixed(1)}</span>
          </div>
        </div>

        {/* Bollinger */}
        <div className="flex flex-col gap-1">
           <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">布林带位置</span>
              <span className="text-gray-900 font-semibold">
                {data.close > (data.bbUpper || 0) ? '突破上轨' : data.close < (data.bbLower || 0) ? '跌破下轨' : '中轨震荡'}
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorTable;
