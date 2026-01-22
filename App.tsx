import React, { useState } from 'react';
import { Sparkles, Download, FileText, ChevronRight, ArrowLeft, Printer } from 'lucide-react';
import { ReportData } from './types';
import { extractReportFromText } from './services/geminiService';
import ProfessionalReport from './components/ProfessionalReport';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await extractReportFromText(input);
      setReportData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "未知错误，请打开浏览器控制台(F12)查看详情。");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    window.scrollTo(0, 0);
    
    const element = document.getElementById('report-content');
    if (!element || !(window as any).html2pdf) {
      setDownloading(false);
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const stockName = reportData?.meta.companyName || reportData?.meta.ticker || '标的';
    const safeStockName = stockName.replace(/[\\/*?:"<>|]/g, '');
    const filename = `${safeStockName}分析策略报告_${dateStr}.pdf`;

    const opt = {
      margin: 0, 
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
      alert("PDF下载失败，请重试");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    setReportData(null);
  };

  // If report exists, show the "Report Page" (A4 Preview)
  if (reportData) {
    return (
      <div className="min-h-screen bg-slate-200 print:bg-white font-sans">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white; margin: 0; padding: 0; }
            @page { margin: 0; size: A4; }
          }
        `}</style>

        <div className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-3 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <button 
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
             >
                <ArrowLeft className="w-4 h-4" /> 返回编辑
             </button>
             <div className="h-4 w-px bg-slate-300"></div>
             <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                研报预览 Mode
             </span>
           </div>

           <div className="flex items-center gap-3">
             <button 
                onClick={handlePrint}
                className="bg-white text-slate-700 border border-slate-200 px-5 py-2 rounded-lg shadow-sm text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Printer className="w-4 h-4" /> 打印 / 另存为PDF
              </button>

             <button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-slate-900 text-white px-5 py-2 rounded-lg shadow-lg shadow-slate-300 text-sm font-bold flex items-center gap-2 hover:bg-black transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait"
              >
                {downloading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> 下载 PDF (图片版)
                  </>
                )}
              </button>
           </div>
        </div>

        <div className="py-8 overflow-y-auto flex justify-center print:p-0 print:overflow-visible">
          <ProfessionalReport data={reportData} />
        </div>
      </div>
    );
  }

  // Input Page
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4 font-sans flex-col">
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-center">
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-3xl mb-6 shadow-2xl shadow-slate-200 rotate-3 transition-transform hover:rotate-0">
              <Sparkles className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
              IntelliQuant <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Publisher</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto leading-relaxed">
              将您的草稿一键转换为
              <span className="text-slate-900 font-bold mx-1">高盛/瑞银风格</span>
              的专业 PDF 研报
            </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请在此输入内容 (例如：NVIDIA股价今日上涨3%，原因是Blackwell芯片需求强劲...)"
            className="w-full h-64 p-8 text-slate-700 bg-white text-lg leading-relaxed resize-none outline-none font-medium placeholder:text-slate-300 rounded-2xl"
          />
          
          <div className="bg-slate-50/80 backdrop-blur px-8 py-4 border-t border-slate-100 flex justify-end items-center rounded-b-2xl">
              <button
                onClick={handleGenerate}
                disabled={loading || !input.trim()}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-base font-bold hover:bg-black hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2 shadow-lg shadow-slate-300/50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    正在排版...
                  </>
                ) : (
                  <>生成研报 <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center border border-red-100 animate-in fade-in slide-in-from-bottom-2 select-text">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;