
import React from 'react';
import { ReportData } from '../types';

interface Props {
  data: ReportData;
}

const ProfessionalReport: React.FC<Props> = ({ data }) => {
  const getRatingColor = (r: string) => {
    switch(r.toUpperCase()) {
      case 'BUY': 
      case 'OVERWEIGHT': return 'text-[#0f172a]'; // Dark Slate (High end)
      case 'SELL': return 'text-[#be123c]'; // Rose Red
      default: return 'text-[#b45309]'; // Amber
    }
  };

  return (
    <div className="w-full flex justify-center bg-gray-100 print:bg-white print:m-0 print:p-0">
      {/* 
        A4 Dimension Control 
        Width: 210mm
        Height: 297mm (Minimum)
        This ensures it looks exactly like a paper on screen and prints perfectly.
      */}
      <div 
        id="report-content"
        className="bg-white shadow-2xl print:shadow-none relative box-border mx-auto flex flex-col"
        style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}
      >
        {/* --- HEADER --- */}
        <header className="border-b-2 border-slate-900 pb-4 mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center font-serif font-bold text-lg rounded-sm">
                IQ
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-wider uppercase font-sans">
                IntelliQuant <span className="font-light text-slate-500">Research</span>
              </h1>
            </div>
            <div className="text-[10px] text-slate-500 font-medium tracking-[0.2em] uppercase pl-1">
              Global Equity Strategy • Asia Pacific
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900 font-sans">{data.meta.date}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
              {data.meta.analyst || 'AI Quantitative Analyst'}
            </div>
          </div>
        </header>

        {/* --- TITLE BLOCK --- */}
        <section className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="w-[75%]">
              <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2 font-serif">
                {data.content.headline}
              </h2>
              <div className="flex gap-4 text-xs font-medium text-slate-600 font-sans items-center mt-3">
                 <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-bold">{data.meta.ticker}</span>
                 <span>{data.meta.companyName}</span>
                 <span className="text-slate-300">|</span>
                 <span>现价 Current: <strong className="text-slate-900">{data.meta.currentPrice}</strong></span>
              </div>
            </div>
            
            {/* Rating Box */}
            <div className="text-right w-[20%] pt-1">
              <div className={`text-xl font-black font-sans tracking-tight ${getRatingColor(data.meta.rating)}`}>
                {data.meta.rating}
              </div>
              {data.meta.targetPrice && (
                 <div className="text-xs font-bold text-slate-500 mt-1 border-t border-slate-200 pt-1">
                   目标价 Target: <span className="text-slate-900">{data.meta.targetPrice}</span>
                 </div>
              )}
            </div>
          </div>
        </section>

        {/* --- MAIN LAYOUT (2 Columns) --- */}
        <div className="flex gap-8 flex-1">
          
          {/* LEFT COLUMN (Main Text) */}
          <div className="w-[68%] space-y-6">
            
            {/* Summary */}
            <div className="relative">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2 font-sans tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-slate-900 inline-block"></span>
                投资摘要 Investment Summary
              </h3>
              <p className="text-[10.5pt] text-slate-800 leading-[1.6] text-justify font-serif">
                {data.content.summary}
              </p>
            </div>

            {/* Thesis */}
            <div className="relative">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2 font-sans tracking-wider flex items-center gap-2">
                 <span className="w-1 h-3 bg-slate-900 inline-block"></span>
                 核心逻辑 Investment Thesis
              </h3>
              <p className="text-[10.5pt] text-slate-800 leading-[1.6] text-justify font-serif whitespace-pre-wrap">
                {data.content.investmentThesis}
              </p>
            </div>

            {/* Valuation */}
            <div className="relative">
              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2 font-sans tracking-wider flex items-center gap-2">
                 <span className="w-1 h-3 bg-slate-900 inline-block"></span>
                 估值与技术分析 Valuation & Technicals
              </h3>
              <p className="text-[10.5pt] text-slate-800 leading-[1.6] text-justify font-serif whitespace-pre-wrap">
                {data.content.valuation}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN (Sidebar Data) */}
          <div className="w-[32%] flex flex-col gap-6 pt-1">
            
            {/* Key Metrics Table */}
            <div className="bg-slate-50 p-4 border-t-2 border-slate-900">
               <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 font-sans tracking-widest">
                 关键指标 Key Metrics
               </h4>
               <div className="space-y-2">
                 {data.keyMetrics.map((metric, i) => (
                   <div key={i} className="flex justify-between items-end text-xs border-b border-slate-200 border-dashed pb-1 last:border-0">
                     <span className="text-slate-500 font-medium">{metric.label}</span>
                     <span className="font-bold text-slate-900 font-mono">{metric.value}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Risks */}
            <div>
              <h3 className="text-xs font-bold text-[#be123c] uppercase border-b border-[#be123c] pb-1 mb-2 font-sans tracking-wider">
                主要风险 Key Risks
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                 <li className="text-[9pt] text-slate-600 italic leading-relaxed font-serif marker:text-[#be123c]">
                    {data.content.keyRisks}
                 </li>
              </ul>
            </div>

            {/* Spacer to push footer down */}
            <div className="flex-grow"></div>

            {/* Bottom Disclaimer */}
            <div className="border-t border-slate-200 pt-3">
              <div className="text-[6px] text-slate-400 leading-tight text-justify font-sans uppercase">
                 <strong className="block mb-1 text-slate-500">Disclaimer & Disclosure</strong>
                 This document is generated by IntelliQuant AI for typesetting demonstration purposes. It does not constitute investment advice. Access to this report is limited to institutional clients.
              </div>
            </div>

          </div>
        </div>
        
        {/* Page Footer Number */}
        <div className="absolute bottom-4 right-8 text-[10px] text-slate-400 font-sans">
           Page 1 of 1
        </div>
      </div>
    </div>
  );
};

export default ProfessionalReport;
