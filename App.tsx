import React, { useState } from 'react';
import UploadSection from './components/UploadSection';
import ReportView from './components/ReportView';
import { analyzeCSRDReadiness } from './services/geminiService';
import { AppState, CSRDReport, FileData } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [reportData, setReportData] = useState<CSRDReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (file: FileData | null, text: string) => {
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const report = await analyzeCSRDReadiness({
        file: file || undefined,
        text: text || undefined
      });
      setReportData(report);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Analysis failed. Please ensure you have configured your API Key correctly or try a different file.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setReportData(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-audit-200">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-audit-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-sustain-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {appState === AppState.IDLE && (
          <UploadSection onAnalyze={handleAnalyze} isAnalyzing={false} />
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
             <div className="relative">
                <div className="w-24 h-24 border-4 border-slate-200 rounded-full"></div>
                <div className="w-24 h-24 border-4 border-audit-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-audit-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Analysing Document</h3>
                <p className="text-slate-500">Extracting double materiality indicators & gaps...</p>
             </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Analysis Failed</h3>
            <p className="text-slate-500 mb-6">{errorMsg}</p>
            <button 
              onClick={resetApp}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {appState === AppState.COMPLETE && reportData && (
          <ReportView report={reportData} onReset={resetApp} />
        )}
      </main>

      <footer className="relative z-10 py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Audit Crystal. AI-Powered CSRD Assistant.</p>
      </footer>
    </div>
  );
};

export default App;