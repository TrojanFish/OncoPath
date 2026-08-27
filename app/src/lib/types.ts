// Shared type definitions for OncoPath
export interface HistologyItem {
  type: string;
  percentage?: number;
}

export interface SecondaryNodule {
  id: string;
  location: string;          // e.g. "右肺下叶背段", "左肺上叶"
  sizeMm: number;            // 结节大小毫米 e.g. 4
  type: "pure_ggo" | "mixed_ggo" | "solid" | "calcification" | string;
  isBenignTendency?: boolean;// 是否具有良性/陈旧倾向
  imagingFeatures?: string[];
  note?: string;             // e.g. "微小钙化结节，考虑陈旧性病灶"
}

export interface FollowUpRecord {
  id: string;
  date: string;              // "2023-08-15" 或 "2024-03"
  tumorSize: number;         // 结节全径 cm
  solidSize: number;         // 实性浸润 cm
  ctr: number;               // CTR 0~1
  noduleType?: string;
  lungRads?: string;
  hospital?: string;
  note?: string;             // e.g. "较前片相仿，未见明显增大"
}

export interface TumorMarkersData {
  id?: string;
  cea?: number | null;       // 癌胚抗原 ng/mL (正常 0~5.0)
  cyfra211?: number | null;  // 细胞角蛋白19片段 ng/mL (正常 0~3.3)
  nse?: number | null;       // 神经元特异性烯醇化酶 ng/mL (正常 0~16.3)
  scc?: number | null;       // 鳞状细胞癌抗原 ng/mL (正常 0~1.5)
  proGrp?: number | null;    // 胃泌素释放肽前体 pg/mL (正常 0~65.0)
  ca125?: number | null;     // 糖类抗原 125 U/mL (正常 0~35.0)
  ca199?: number | null;     // 糖类抗原 19-9 U/mL (正常 0~27.0)
  ca153?: number | null;     // 糖类抗原 15-3 U/mL (正常 0~25.0)
  ferritin?: number | null;  // 血清铁蛋白 ng/mL (正常 20~300)
  testDate?: string | null;  // 化验日期
  hospital?: string | null;  // 化验医院
  note?: string | null;
}

export interface PatientProfile {
  id?: string;
  userId?: string;
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

  // Multiple Nodules Management (P0-1)
  isMultipleNodules?: boolean;
  secondaryNodules?: SecondaryNodule[];

  // Longitudinal Follow-up Growth Tracking (P0-2)
  followUpHistory?: FollowUpRecord[];

  // Tumor Markers Blood Test Panel (Latest Snapshot for /profile)
  tumorMarkers?: TumorMarkersData;
  // Multi-period Longitudinal History (For /timeline trend curves)
  tumorMarkersHistory?: TumorMarkersData[];


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

  // Molecular Biomarkers & Gene Mutations Panel
  molecular?: MolecularPanelData;
  geneMutations?: GeneMutationItem[];
  pdl1Tps?: "<1%" | "1-49%" | ">=50%" | "unknown" | string;

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

export interface GeneMutationItem {
  id: string;
  gene: "EGFR" | "ALK" | "KRAS" | "ROS1" | "BRAF" | "MET" | "RET" | "HER2" | "TP53" | "RB1" | "PIK3CA" | "Other" | string;
  subtype?: string;              // 如 "19del", "L858R", "20-ins", "T790M", "G12C", "EML4-ALK", "Exon 5-8 Missense"
  abundance?: string | number;  // 突变丰度 / VAF (%) 如 "23.5%"
  status?: "positive" | "negative" | "unknown";
  isComutation?: boolean;       // 是否为伴随突变 (如 TP53, RB1)
  note?: string;                // 备注说明
}

export interface MolecularPanelData {
  testStatus: "tested" | "not_tested" | "in_progress" | "not_indicated" | string;
  testMethod?: "NGS_panel" | "PCR" | "IHC_FISH" | "liquid_biopsy" | "other" | string;
  mutations: GeneMutationItem[];
  pdl1Tps?: "<1%" | "1-49%" | ">=50%" | "unknown" | string;
  tmb?: string | number;
  msi?: string;
  rawDetails?: string;
}
