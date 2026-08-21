export type TimelineCategory = "imaging" | "pathology" | "serology" | "milestone";

export interface TimelineEventItem {
  id: string;
  userId?: string | null;
  profileId?: string | null;
  eventDate: string; // YYYY-MM-DD
  category: TimelineCategory;
  subType: string; // "CT" | "PET-CT" | "Pathology" | "NGS" | "TumorMarkers" | "Surgery" | "Medication"
  hospital?: string;
  title: string;
  summary: string;
  keyFindings?: {
    sizeMm?: number;
    ctr?: number;
    noduleType?: string; // "pGGN" | "mGGN" | "Solid"
    location?: string; // e.g. "右肺上叶 S1"
    vdtDays?: number; // 体积倍增时间
    densityChange?: string; // e.g. "稳定" | "实性成分轻度增多"
    cea?: number; // ng/mL (Normal < 5.0)
    cyfra211?: number; // ng/mL (Normal < 3.3)
    nse?: number; // ng/mL (Normal < 16.3)
    scc?: number; // ng/mL (Normal < 1.5)
    histology?: string; // e.g. "微浸润腺癌 (MIA) / 贴壁为主型"
    stage?: string; // e.g. "pT1aN0M0 IA1期"
    stas?: boolean;
    vpi?: boolean;
    lvi?: boolean;
    driverGene?: string; // e.g. "EGFR 19del (丰度 18.2%)"
    pdl1Tps?: string; // e.g. "TPS 1~49%"
    surgeryType?: string; // e.g. "单孔胸腔镜右肺上叶后段切除术 (S2) + 淋巴结采样"
    marginStatus?: string; // e.g. "R0 (支气管及实质切缘均阴性，距离病灶 2.3cm)"
    medication?: string; // e.g. "定期随访，暂无需术后辅助靶向/化疗"
    rawText?: string;
    [key: string]: any;
  };
  tags?: string[];
  riskStatus?: "normal" | "watch" | "warning";
  reportFileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineCategoryMeta {
  key: TimelineCategory;
  label: string;
  icon: string;
  badgeColor: string;
  lightBg: string;
  borderColor: string;
  description: string;
}

export const TIMELINE_CATEGORIES: TimelineCategoryMeta[] = [
  {
    key: "imaging",
    label: "影像随访",
    icon: "🩻",
    badgeColor: "bg-blue-500 text-white",
    lightBg: "bg-blue-50/80 text-blue-800 border-blue-200",
    borderColor: "border-blue-500",
    description: "薄层CT、增强CT、PET-CT、MRI 结节长短径与 CTR 演变",
  },
  {
    key: "pathology",
    label: "病理与基因",
    icon: "🔬",
    badgeColor: "bg-purple-500 text-white",
    lightBg: "bg-purple-50/80 text-purple-800 border-purple-200",
    borderColor: "border-purple-500",
    description: "手术切除病理、微观亚型占比、STAS/脉管胸膜侵犯、NGS 突变",
  },
  {
    key: "serology",
    label: "血液化验",
    icon: "🩸",
    badgeColor: "bg-rose-500 text-white",
    lightBg: "bg-rose-50/80 text-rose-800 border-rose-200",
    borderColor: "border-rose-500",
    description: "血清肿瘤标志物五项 (CEA, CYFRA21-1, NSE) 与 MRD 液体活检",
  },
  {
    key: "milestone",
    label: "诊疗里程碑",
    icon: "💊",
    badgeColor: "bg-emerald-500 text-white",
    lightBg: "bg-emerald-50/80 text-emerald-800 border-emerald-200",
    borderColor: "border-emerald-500",
    description: "胸腔镜手术、辅助化疗、靶向药起始/换药、重大综合评估",
  },
];
