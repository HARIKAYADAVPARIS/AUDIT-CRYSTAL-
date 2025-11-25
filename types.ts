
export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface RoadmapItem {
  priority: 'High' | 'Medium' | 'Low';
  action: string;
  deadline?: string;
}

export interface DisclosureStatus {
  item: string;
  status: 'Met' | 'Missing';
  notes?: string;
}

// Schema 1: PDF/Content Extraction
export interface ExtractionData {
  companyName: string;
  reportType: string;
  doubleMaterialityIndicators: string[];
}

// Schema 2: Gap Analysis
export interface GapAnalysisData {
  mandatoryDisclosures: DisclosureStatus[];
  missingKeySections: string[];
}

// Schema 3: Scoring Rubric
export interface ScoringData {
  readinessScore: 'Ready' | 'Partially Ready' | 'Not Ready';
  scoreColor: string;
  scoreReasoning: string;
  checklist: { criterion: string; met: boolean }[];
}

// Schema 4: Summary Report
export interface SummaryData {
  executiveSummary: string;
  roadmap: RoadmapItem[];
}

export interface CSRDReport {
  extraction: ExtractionData;
  gapAnalysis: GapAnalysisData;
  scoring: ScoringData;
  summary: SummaryData;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}
