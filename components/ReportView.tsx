
import React, { useState } from 'react';
import { CSRDReport, RoadmapItem } from '../types';

interface ReportViewProps {
  report: CSRDReport;
  onReset: () => void;
}

const ScoreBadge: React.FC<{ score: string; color: string }> = ({ score, color }) => (
  <div className="inline-flex items-center px-4 py-2 rounded-full border shadow-sm" style={{ borderColor: color, backgroundColor: `${color}10`, color: color }}>
    <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></span>
    <span className="font-bold uppercase tracking-wide text-sm">{score}</span>
  </div>
);

const RoadmapCard: React.FC<{ item: RoadmapItem; index: number }> = ({ item, index }) => {
  const priorityColor = item.priority === 'High' ? 'text-red-600 bg-red-50' : item.priority === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50';
  
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all bg-white">
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm">
        {index + 1}
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-slate-900">{item.action}</h4>
          <span className={`text-xs font-bold px-2 py-1 rounded-md ${priorityColor}`}>
            {item.priority}
          </span>
        </div>
        {item.deadline && <p className="text-sm text-slate-500">Target: {item.deadline}</p>}
      </div>
    </div>
  );
};

const JsonSection: React.FC<{ title: string; data: any }> = ({ title, data }) => (
  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg mb-6">
    <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
      <h4 className="text-slate-200 font-medium text-sm">{title}</h4>
      <span className="text-xs text-slate-500 font-mono">JSON Schema</span>
    </div>
    <div className="p-4 overflow-x-auto">
      <pre className="text-xs text-green-400 font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  </div>
);

const ReportView: React.FC<ReportViewProps> = ({ report, onReset }) => {
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header / Nav */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-br from-audit-500 to-sustain-500 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-slate-800">Audit Crystal</span>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowJson(!showJson)}
            className={`text-sm font-medium transition-colors ${showJson ? 'text-audit-600 bg-audit-50 px-3 py-1 rounded-lg' : 'text-slate-500 hover:text-audit-600'}`}
          >
            {showJson ? 'Back to Report' : 'View JSON Schemas'}
          </button>
          <button onClick={onReset} className="text-sm text-slate-500 hover:text-audit-600 font-medium">
            ← Start New Analysis
          </button>
        </div>
      </div>

      {showJson ? (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JsonSection title="Schema 1: PDF Extraction" data={report.extraction} />
            <JsonSection title="Schema 3: Scoring Rubric" data={report.scoring} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JsonSection title="Schema 2: Gap Analysis" data={report.gapAnalysis} />
            <JsonSection title="Schema 4: Summary Report" data={report.summary} />
          </div>
        </div>
      ) : (
        <>
          {/* Hero Scorecard - Schema 3: Scoring Rubric */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{report.extraction.companyName || 'Unknown Entity'}</h2>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">{report.extraction.reportType}</span>
                </div>
                <p className="text-slate-500 mb-6">Readiness Assessment Report</p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <ScoreBadge score={report.scoring.readinessScore} color={report.scoring.scoreColor} />
                </div>
                
                <p className="text-slate-700 text-lg leading-relaxed">{report.scoring.scoreReasoning}</p>
                
                {/* Scoring Checklist */}
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {report.scoring.checklist.map((item, idx) => (
                     <div key={idx} className="flex items-center space-x-2">
                       <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.met ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                       <span className={`text-sm ${item.met ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{item.criterion}</span>
                     </div>
                   ))}
                </div>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-bl from-audit-50 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* Schema 4: Summary Report */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-audit-100 font-medium mb-4 uppercase text-xs tracking-wider">Executive Summary</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{report.summary.executiveSummary}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex justify-between items-end">
                    <span className="text-3xl font-bold text-white">{report.gapAnalysis.mandatoryDisclosures.filter(d => d.status === 'Met').length}</span>
                    <span className="text-slate-400 text-sm mb-1">/ {report.gapAnalysis.mandatoryDisclosures.length} Disclosures Met</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Schema 1: Extraction & Roadmap */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-800">Materiality & Roadmap</h3>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wider">Detected Material Topics (ESRS 1)</p>
                {report.extraction.doubleMaterialityIndicators.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {report.extraction.doubleMaterialityIndicators.map((topic, i) => (
                      <span key={i} className="px-3 py-1 bg-audit-50 text-audit-700 rounded-lg text-sm font-medium border border-audit-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400">No clear material topics identified in document.</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {report.summary.roadmap.map((item, i) => (
                  <RoadmapCard key={i} item={item} index={i} />
                ))}
              </div>
            </div>

            {/* Schema 2: Gap Analysis */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-800">Gap Analysis (ESRS 2)</h3>
                <div className="h-px bg-slate-200 flex-grow"></div>
              </div>

              {report.gapAnalysis.missingKeySections.length > 0 && (
                 <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-800 uppercase mb-2">Missing Critical Sections</p>
                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                      {report.gapAnalysis.missingKeySections.map((sec, i) => (
                        <li key={i}>{sec}</li>
                      ))}
                    </ul>
                 </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {report.gapAnalysis.mandatoryDisclosures.map((disc, i) => (
                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${disc.status === 'Met' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {disc.status === 'Met' ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-grow">
                          <p className={`text-sm font-medium ${disc.status === 'Met' ? 'text-slate-900' : 'text-slate-500'}`}>
                            {disc.item}
                          </p>
                          {disc.notes && (
                            <p className="text-xs text-slate-400 mt-1">{disc.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportView;
