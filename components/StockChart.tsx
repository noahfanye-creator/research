
import React from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { KLineData } from '../types';

interface Props {
  data: KLineData[];
  height?: number;
}

const StockChart: React.FC<Props> = ({ data, height = 400 }) => {
  // Prep data for Recharts (handling candlestick representation simplified for line/area)
  // Real candlestick charts usually require customized SVG shapes
  const chartData = data.slice(-60);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 10 }} 
            axisLine={false}
            tickLine={false}
            orientation="right"
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          
          {/* Bollinger Bands */}
          <Area type="monotone" dataKey="bbUpper" stroke="none" fill="#94a3b8" fillOpacity={0.05} />
          <Area type="monotone" dataKey="bbLower" stroke="none" fill="#94a3b8" fillOpacity={0.05} />
          
          {/* Price & MAs */}
          <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
          <Line type="monotone" dataKey="ma5" stroke="#f59e0b" strokeWidth={1} dot={false} />
          <Line type="monotone" dataKey="ma10" stroke="#8b5cf6" strokeWidth={1} dot={false} />
          <Line type="monotone" dataKey="ma20" stroke="#ec4899" strokeWidth={1} dot={false} />
          
          {/* Volume Bar */}
          <Bar dataKey="volume" yAxisId={0} opacity={0.3}>
             {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.close > entry.open ? '#ef4444' : '#22c55e'} />
             ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
