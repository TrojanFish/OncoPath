// Shared type definitions for OncoPath
export interface HistologyItem {
  type: string;
  percentage?: number;
}

export interface PatientProfile {
  age: number;
  gender: "female" | "male";
  stage: string;
  tumorSize: number;
  solidSize: number;
  ctr: number;
  morphology: "pure_ggo" | "mixed_ggo" | "pure_solid";
  stas: "negative" | "positive" | "unknown";
  lvi: "negative" | "positive" | "unknown";
  vpi: "negative" | "positive" | "unknown";
  iaslcGrade: "1" | "2" | "3" | "unknown";
  histology: HistologyItem[];
  egfr: "positive" | "negative" | "unknown" | "not_tested";
  lymphNodes: "N0" | "N1" | "N2";
  margin: "negative" | "positive";
  surgeryType: "lobectomy" | "segmentectomy" | "wedge" | "unknown";
  notes?: string;

  // New Staging / Demographics fields
  id?: string;
  organ?: string;
  tStage?: string;
  nStage?: string;
  mStage?: string;

  // State Engine (Dynamic Decision Nodes)
  currentStage?: string;
  riskLevel?: string;
  nextAction?: string;
  psychologicalState?: string;
}

