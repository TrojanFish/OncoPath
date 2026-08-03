// Shared type definitions for LungEvidence
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
  histology: string[];
  egfr: "positive" | "negative" | "unknown" | "not_tested";
  lymphNodes: "N0" | "N1" | "N2";
  margin: "negative" | "positive";
  surgeryType: "lobectomy" | "segmentectomy" | "wedge" | "unknown";
  notes?: string;
}
