import React, { useState } from 'react';
import { Gem, ShieldAlert } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Report from './components/Report';
import LandingPage from './components/LandingPage';
import AnalysisTerminal from './components/AnalysisTerminal';
import { analyzeDocument } from './services/gemini';
import { AnalysisState, ReadinessStatus, AuditResult } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: false,
    isStreaming: false,
    streamText: "",
    error: null,
    result: null,
    pdfUrl: null
  });

  const handleAnalyze = async (file: File | null, url: string | null, useSample: boolean = false) => {
    if (useSample) {
      setAnalysisState({ isLoading: true, isStreaming: false, streamText: "", error: null, result: null });
      // Simulate quick loading for a premium feel
      setTimeout(() => {
        setAnalysisState({
          isLoading: false,
          isStreaming: false,
          streamText: "",
          error: null,
          result: SAMPLE_RESULT,
          pdfUrl: null
        });
        setView('app');
      }, 1500);
      return;
    }

    let pdfUrl = null;
    if (file) pdfUrl = URL.createObjectURL(file);
    
    setAnalysisState({ 
      isLoading: true, 
      isStreaming: true,
      streamText: "",
      error: null, 
      result: null,
      pdfUrl: pdfUrl 
    });

    try {
      let fileBase64: string | null = null;
      let mimeType: string | null = null;

      if (file) {
        const reader = new FileReader();
        fileBase64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const base64Data = fileBase64.split(',')[1];
        fileBase64 = base64Data;
        mimeType = file.type;
      }

      const textInput = url ? `Analyze CSRD for: ${url}` : null;

      const result = await analyzeDocument(
        fileBase64, 
        mimeType, 
        textInput, 
        (chunk) => {
          setAnalysisState(prev => ({ ...prev, streamText: prev.streamText + chunk }));
        }
      );

      setAnalysisState(prev => ({ ...prev, isLoading: false, isStreaming: false, error: null, result }));

    } catch (err: any) {
      setAnalysisState(prev => ({ ...prev, isLoading: false, isStreaming: false, error: err.message || "An unexpected error occurred.", result: null }));
    }
  };

  const handleReset = () => {
    if (analysisState.pdfUrl) URL.revokeObjectURL(analysisState.pdfUrl);
    setAnalysisState({ isLoading: false, isStreaming: false, streamText: "", error: null, result: null, pdfUrl: null });
  };

  const startApp = (useSample: boolean = false) => {
    if (useSample) {
      handleAnalyze(null, null, true);
    } else {
      setView('app');
    }
  };

  if (view === 'landing' && !analysisState.isLoading && !analysisState.result) return <LandingPage onStart={startApp} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 print:bg-white">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-md print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
            <div className="p-1.5 bg-amber-500 rounded-lg"><Gem className="text-white" size={24} /></div>
            <span className="text-lg font-black text-amber-400 tracking-widest uppercase">Audit Crystal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black px-3 py-1 bg-slate-800 text-amber-400 border border-slate-700 rounded-full uppercase tracking-widest">Flash 3 Enterprise</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 print:p-0">
        {analysisState.error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-xl text-red-600"><ShieldAlert size={20} /></div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-red-900 uppercase mb-1">Audit Connection Interrupted</h3>
              <p className="text-sm text-red-700 leading-relaxed">{analysisState.error}</p>
            </div>
          </div>
        )}

        {analysisState.isLoading && analysisState.isStreaming && <AnalysisTerminal streamText={analysisState.streamText} />}
        {analysisState.isLoading && !analysisState.isStreaming && (
           <div className="flex flex-col items-center justify-center py-24 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                <Gem size={64} className="text-amber-500 animate-pulse relative z-10" />
              </div>
              <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-sm">Simulating CSRD Audit Protocol...</p>
           </div>
        )}

        {!analysisState.isLoading && analysisState.result ? (
          <Report data={analysisState.result} pdfUrl={analysisState.pdfUrl} onReset={handleReset} />
        ) : (
          !analysisState.isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Upload Sustainability Report</h1>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                  Analyze your report against ESRS 1-12 standards. 
                  Get a <span className="text-slate-900 font-bold underline decoration-amber-400">Boardroom-Grade</span> gap analysis in seconds.
                </p>
              </div>
              <FileUpload onAnalyze={handleAnalyze} isLoading={analysisState.isLoading} />
            </div>
          )
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 print:hidden">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
          © 2024 Audit Crystal AI • Auditor-Deterministic Compliance
        </div>
      </footer>
    </div>
  );
};

const SAMPLE_RESULT: AuditResult = {
  companyName: "GlobalLogistics AG",
  readinessScore: ReadinessStatus.PARTIALLY_READY,
  scoreValue: 78,
  sectorPeerAverage: 65,
  scoreBreakdown: {
    doubleMateriality: 22,
    valueChain: 14,
    dataGranularity: 18,
    strategyGovernance: 16,
    frameworkAlignment: 8
  },
  executiveSummary: "GlobalLogistics AG exhibits a robust alignment with ESRS E1 Climate standards but shows significant gaps in Governance (G1) and Supply Chain Ethics (S2). Analysis detected missing board-level oversight narratives for sustainability risks. Transition plan quantification for 2.0°C scenarios is currently incomplete.",
  timestamp: new Date().toISOString(),
  doubleMaterialityMatrix: [
    { topic: "Climate Change Adaptation", financialScore: 9, impactScore: 8, category: "Environment", reasoning: "High physical risk to logistics hubs in coastal areas." },
    { topic: "Labor Practices", financialScore: 5, impactScore: 9, category: "Social", reasoning: "Critical for retention in the transport sector." },
    { topic: "Business Conduct", financialScore: 7, impactScore: 6, category: "Governance", reasoning: "Compliance with cross-border anti-bribery laws." }
  ],
  financialImpact: {
    estimatedRevenueAtRisk: "€10M - €50M",
    compliancePenaltyExposure: "5% of Turnover",
    marketValuationRisk: "10% Multiple Discount",
    costOfCapitalImpactBps: 50,
    scenarios: [],
    climateScenarios: [
      { temp: '1.5°C', riskLevel: 'Low', revenueImpactMultiplier: 1.0, valuationImpactMultiplier: 1.0, keyRiskDriver: "Carbon pricing transition" },
      { temp: '2.0°C', riskLevel: 'Moderate', revenueImpactMultiplier: 1.12, valuationImpactMultiplier: 1.05, keyRiskDriver: "Resource scarcity and fuel taxes" },
      { temp: '4.0°C', riskLevel: 'Catastrophic', revenueImpactMultiplier: 1.35, valuationImpactMultiplier: 1.25, keyRiskDriver: "Global supply chain collapse" }
    ]
  },
  mandatoryDisclosures: [
    { code: "G1-1", description: "Role of board/management in sustainability oversight", status: "Missing", fixRecommendation: "Draft a formal Supervisory Board charter linking management pay to carbon KPIs." },
    { code: "E1-6", description: "Gross Scope 1, 2, 3 GHG emissions", status: "Present", evidence: { quote: "Total GHG emissions for 2023 were estimated at 840,000 tCO2e.", page: 47 } },
    { code: "S1-1", description: "Policies related to own workforce", status: "Present", evidence: { quote: "Collective bargaining agreements cover 94% of operations.", page: 82 } },
    { code: "S2-1", description: "Policies related to workers in value chain", status: "Missing", fixRecommendation: "Implement a mandatory Supplier Code of Conduct for Tier 2 logistics partners." }
  ],
  roadmap: [
    { phase: "Q1 2025", action: "Formalize Board Oversight", details: "Establish dedicated ESG committee with veto rights on CAPEX.", impactOnScore: 12, financialSavingEstimate: "€10M Protection" },
    { phase: "Q2 2025", action: "Tier 2 Supply Audit", details: "Automate supply chain mapping using ChainScout API.", impactOnScore: 8, financialSavingEstimate: "15bps Cap saving" }
  ],
  detailedFrameworks: [],
  peerBenchmarks: [],
  esrsTopics: [
    { code: "E1", name: "Climate Change", score: 88, status: "Ready" },
    { code: "G1", name: "Governance", score: 32, status: "Critical" },
    { code: "S1", name: "Workforce", score: 92, status: "Ready" }
  ],
  subsidiaries: [
    { name: "GlobalLogistics EU", region: "Europe", readinessScore: 92, status: "Compliant", topGap: "None" },
    { name: "GlobalLogistics Asia", region: "Asia", readinessScore: 45, status: "At Risk", topGap: "Labor Tracking" }
  ]
};

export default App;
