
import React from 'react';
import { ReportData } from '../types';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface Props {
  data: ReportData;
}

// Premium Financial Highlighter Component
const RichText: React.FC<{ text: string; mode?: 'dark' | 'light' }> = ({ text, mode = 'light' }) => {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const content = part.slice(2, -2);
          // Dark mode uses yellow/gold text for emphasis
          if (mode === 'dark') {
             return (
                <span key={index} className="font-bold text-amber-300 underline decoration-amber-300/50 underline-offset-4 decoration-2">
                    {content}
                </span>
             );
          }
          // Light mode premium indigo highlight
          return (
            <span 
              key={index} 
              className="font-bold text-[#1e1b4b] bg-indigo-50/80 px-[3px] mx-[1px] rounded-[2px] border-b-2 border-indigo-200/60 inline-block leading-tight"
            >
              {content}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const MiniTrendChart: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const chartData = data.map((val, idx) => ({ i: idx, val }));
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#10b981' : '#ef4444'; // Emerald-500 or Red-500

  return (
    <div className="h-12 w-full mt-2 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
          />
          <YAxis domain={['dataMin', 'dataMax']} hide />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProfessionalReport: React.FC<Props> = ({ data }) => {
  const getRatingColor = (r: string) => {
    switch(r.toUpperCase()) {
      case 'BUY': 
      case 'OVERWEIGHT': return 'text-[#0f172a]'; 
      case 'SELL': return 'text-[#be123c]'; 
      default: return 'text-[#b45309]';
    }
  };

  return (
    <div className="w-full flex justify-center bg-gray-100 print:bg-white print:m-0 print:p-0">
      {/* 
        A4 Dimension Control - STRICT Single Page
        Width: 210mm
        Height: 297mm (FIXED, NOT min-height)
        Padding: 12mm (Reduced from 15mm to fit more content)
      */}
      <div 
        id="report-content"
        className="bg-white shadow-2xl print:shadow-none relative box-border mx-auto flex flex-col overflow-hidden"
        style={{ width: '210mm', height: '297mm', padding: '12mm 12mm 10mm 12mm' }}
      >
        {/* --- PREMIUM WATERMARK --- */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <div 
                className="text-slate-900 font-serif font-bold whitespace-nowrap transform -rotate-45 origin-center"
                style={{ fontSize: '80pt', opacity: 0.03 }}
            >
                FELIX RESEARCH
            </div>
            <div className="absolute w-[180mm] h-[180mm] border-[20px] border-slate-900 rounded-full opacity-[0.015] pointer-events-none"></div>
        </div>

        {/* --- HEADER --- */}
        <header className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between items-end relative z-10 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center font-serif font-bold text-base rounded-sm shadow-sm">
                FR
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-wider uppercase font-sans">
                Felix <span className="font-light text-slate-500">Research</span>
              </h1>
            </div>
            <div className="text-[9px] text-slate-500 font-medium tracking-[0.2em] uppercase pl-1">
              Institutional Equity Strategy • Private Client
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 font-sans">{data.meta.date}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">
              {data.meta.analyst || 'Felix Quantitative Team'}
            </div>
          </div>
        </header>

        {/* --- TITLE & META --- */}
        <section className="mb-4 relative z-10 shrink-0">
          <div className="flex justify-between items-start mb-3">
            <div className="w-[78%]">
              <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2 font-serif">
                {data.content.headline}
              </h2>
              <div className="flex gap-4 text-[10px] font-medium text-slate-600 font-sans items-center mt-2">
                 <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold border border-slate-200">{data.meta.ticker}</span>
                 <span>{data.meta.companyName}</span>
                 <span className="text-slate-300">|</span>
                 <span>现价 Current: <strong className="text-slate-900">{data.meta.currentPrice}</strong></span>
              </div>
            </div>
            
            <div className="text-right w-[20%] pt-1">
              <div className={`text-lg font-black font-sans tracking-tight ${getRatingColor(data.meta.rating)}`}>
                {data.meta.rating}
              </div>
              {data.meta.targetPrice && (
                 <div className="text-[10px] font-bold text-slate-500 mt-1 border-t border-slate-200 pt-1">
                   Target: <span className="text-slate-900">{data.meta.targetPrice}</span>
                 </div>
              )}
            </div>
          </div>
        </section>

        {/* --- MAIN BODY (2 Columns) --- */}
        <div className="flex gap-5 flex-1 relative z-10 items-stretch min-h-0">
          
          {/* LEFT: MAIN ANALYSIS - Using flex-col to distribute space */}
          <div className="w-[68%] flex flex-col gap-3 min-h-0">
            
            {/* Dynamic Sections */}
            {data.content.sections.map((section, idx) => (
              <div key={idx} className="shrink-0">
                <h3 className="text-[10px] font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 mb-1.5 font-sans tracking-wider flex items-center gap-2">
                  <span className="w-0.5 h-2.5 bg-slate-900 inline-block"></span>
                  {section.title}
                </h3>
                <p className="text-[9.2pt] text-slate-800 leading-[1.45] text-justify font-serif whitespace-pre-wrap">
                  <RichText text={section.body} />
                </p>
              </div>
            ))}

             {/* THE VERDICT - Pushed to bottom of this column */}
            <div className="mt-auto pt-2 shrink-0">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-sm shadow-md border-l-4 border-indigo-500 relative overflow-hidden">
                     <div className="absolute top-0 right-0 -mt-2 -mr-2 text-slate-800 opacity-20 transform rotate-12">
                        <svg width="50" height="50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                     </div>

                    <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        分析师最终建议 Analyst Verdict
                    </h3>
                    <p className="text-[9.5pt] font-medium font-serif leading-relaxed text-justify opacity-95">
                        <RichText text={data.content.conclusion} mode="dark" />
                    </p>
                </div>
            </div>

          </div>

          {/* RIGHT: SIDEBAR DATA */}
          <div className="w-[32%] flex flex-col gap-4 pt-0 min-h-0">
            
            {/* Key Metrics & Chart */}
            <div className="bg-slate-50 p-3 border-t-2 border-slate-900 shadow-sm shrink-0">
               <h4 className="text-[9px] font-bold text-slate-500 uppercase mb-2 font-sans tracking-widest flex justify-between">
                 <span>关键指标 Key Metrics</span>
                 <span className="text-slate-300">FR-DATA</span>
               </h4>
               <div className="space-y-1.5">
                 {data.keyMetrics.map((metric, i) => (
                   <div key={i} className="flex justify-between items-end text-[10px] border-b border-slate-200 border-dashed pb-0.5 last:border-0">
                     <span className="text-slate-500 font-medium">{metric.label}</span>
                     <span className="font-bold text-slate-900 font-mono text-right">
                         <RichText text={metric.value} />
                     </span>
                   </div>
                 ))}
               </div>
               
               {/* Mini 7-Day Trend Chart */}
               {data.meta.priceTrend && data.meta.priceTrend.length > 0 && (
                 <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="flex justify-between items-center text-[8px] text-slate-400 font-sans mb-1">
                      <span>7-DAY PRICE ACTION</span>
                      <span>TREND CHECK</span>
                    </div>
                    <MiniTrendChart data={data.meta.priceTrend} />
                 </div>
               )}
            </div>

            {/* Risks */}
            <div className="bg-rose-50/50 p-3 border-l-2 border-rose-200 shrink-0">
              <h3 className="text-[10px] font-bold text-[#be123c] uppercase mb-1.5 font-sans tracking-wider flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#be123c]"></span>
                 主要风险 Key Risks
              </h3>
              <ul className="list-disc pl-3 space-y-1">
                 <li className="text-[8.5pt] text-slate-700 italic leading-relaxed font-serif marker:text-[#be123c]">
                    <RichText text={data.content.keyRisks} />
                 </li>
              </ul>
            </div>
            
            {/* Spacer to push footer to very bottom */}
            <div className="flex-grow"></div>
            
            {/* Disclaimer */}
            <div className="shrink-0">
                 <div className="border-t border-slate-200 pt-2">
                    <div className="text-[6px] text-slate-400 leading-tight text-justify font-sans uppercase">
                        <strong className="block mb-1 text-slate-500">Prepared by Felix Research</strong>
                        This document is generated by AI for typesetting demonstration. It does not constitute investment advice. Access to this report is limited to institutional clients of Felix Research.
                    </div>
                 </div>
            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-3 right-8 text-[9px] text-slate-400 font-sans z-10">
           Page 1 of 1 • <span className="font-semibold">Felix Research</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalReport;
