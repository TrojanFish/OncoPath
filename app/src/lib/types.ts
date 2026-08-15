// Shared type definitions for OncoPath
export interface HistologyItem {
  type: string;
  percentage?: number;
}

export interface PatientProfile {
  id?: string;
  age: number;
  gender: "female" | "male";
  sex?: "female" | "male" | "unknown" | string;
  stage: string;
  organ?: string;
  
  // Imaging & Morphology (AJCC 8th/9th Solid Component Support)
  noduleType?: "mixed_ggo" | "pure_ggo" | "pure_solid" | string;
  morphology?: "pure_ggo" | "mixed_ggo" | "pure_solid" | string;
  tumorSize?: number; // Total gross tumor size in cm
  solidSize?: number; // Invasive / solid component size on CT in cm
  ctr: number;        // Consolidation-to-tumor ratio (0 to 1)
  stageExplanation?: string;

  // Staging
  tStage?: string;
  nStage?: string;
  mStage?: string;
  lymphNodes?: "N0" | "N1" | "N2" | string;

  // Pathological High-Risk Factors
  stas: "negative" | "positive" | "unknown";
  lvi: "negative" | "positive" | "unknown";
  vpi: "negative" | "positive" | "unknown";
  margin: "negative" | "positive";
  marginStatus?: "negative" | "positive" | string;
  iaslcGrade?: "1" | "2" | "3" | "unknown" | string;
  grade?: "1" | "2" | "3" | "unknown" | string;
  histology?: any;
  egfr?: "positive" | "negative" | "unknown" | "not_tested" | string;
  surgeryType: "lobectomy" | "segmentectomy" | "wedge" | "unknown" | string;
  notes?: string;

  // State Engine (Dynamic Decision Nodes)
  currentStage?: string;
  riskLevel?: string;
  nextAction?: string;
  psychologicalState?: string;

  // Persisted Report
  reportMarkdown?: string;
  reportGeneratedAt?: string | Date;
}
