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
  
  // Report Modality & Detection
  reportType?: "ct_imaging" | "pathology" | "comprehensive" | string;
  noduleLocation?: string;       // e.g. "右肺上叶尖后段"
  imagingFeatures?: string[];    // e.g. ["分叶征", "毛刺征", "胸膜牵拉", "血管集束征", "空泡征"]
  lungRads?: string;             // e.g. "3", "4A", "4B", "4X"
  malignancyRisk?: "low" | "moderate" | "high" | string;
  clinicalRecommendation?: string; // e.g. "建议3个月薄层CT随访" 或 "建议胸外科微创手术评估"

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

  // Systemic Metastasis Staging & Organ Exclusion (M0 Confirmation)
  brainMri?: "negative" | "positive" | "not_performed" | string;
  abdominalUltrasound?: "negative" | "benign_findings" | "positive" | "not_performed" | string;
  boneScan?: "negative" | "positive" | "not_performed" | string;
  neckLymphNodes?: "negative" | "positive" | "not_performed" | string;
  petCt?: "negative" | "positive" | "not_performed" | string;
  benignFindings?: string[]; // e.g. ["肝囊肿", "肺钙化灶", "胆囊息肉", "肾囊肿"]
  systemicStagingConfirmed?: boolean;

  // Pathological High-Risk Factors
  stas: "negative" | "positive" | "unknown";
  lvi: "negative" | "positive" | "unknown";
  vpi: "negative" | "positive" | "unknown";
  margin: "negative" | "positive";
  marginStatus?: "negative" | "positive" | string;
  iaslcGrade?: "1" | "2" | "3" | "unknown" | string;
  grade?: "1" | "2" | "3" | "unknown" | string;
  ki67?: number | string; // Ki-67 proliferation index (%) e.g. 5, 15, 30
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
