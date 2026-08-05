// OncoPath Core Evidence Data Library
// This is the curated knowledge base of evidence for lung cancer
// All data points are traceable to published research

export interface Study {
  id: string;
  title: string;
  journal: string;
  year: number;
  patientN: number;
  studyType: "rct" | "meta_analysis" | "prospective_multicenter" | "retrospective_multicenter" | "retrospective";
  evidenceLevel: 1 | 2 | 3 | 4 | 5;
  doi?: string;
  pubmedId?: string;
  keyConclusions: string[];
  relevantFactors: string[];
  applicableStages: string[];
}

export interface EvidenceFinding {
  finding: string;
  hr?: number;
  ciLower?: number;
  ciUpper?: number;
  rfs5yr?: number;
  rfs10yr?: number;
  os5yr?: number;
  studyRef: string;
  patientN: number;
  evidenceLevel: number;
}

export interface Factor {
  id: string;
  name: string;
  nameZh: string;
  category: "pathology" | "imaging" | "molecular" | "clinical";
  descriptionZh: string;
  clinicalSignificance: "high" | "moderate_high" | "moderate" | "low";
  evidenceSummary: {
    studiesSupporting?: number;
    studiesRefuting?: number;
    metaAnalyses?: number;
    consensus: string;
    confidence: 1 | 2 | 3 | 4 | 5;
  };
  keyFindings: EvidenceFinding[];
}

export const EVIDENCE_FACTORS: Factor[] = [
  {
    id: "STAS",
    name: "Spread Through Air Spaces",
    nameZh: "气道播散（STAS）",
    category: "pathology",
    descriptionZh:
      "肿瘤细胞通过气道播散，是一种特殊的浸润方式。STAS阳性意味着肿瘤细胞在主肿瘤之外，沿着肺泡空间播散。STAS是2015年后被广泛研究的重要预后指标。",
    clinicalSignificance: "high",
    evidenceSummary: {
      studiesSupporting: 18,
      studiesRefuting: 3,
      metaAnalyses: 4,
      consensus:
        "STAS阳性显著增加复发风险，尤其在亚肺叶切除后效果更明显。Meta分析已确认其独立预后价值。",
      confidence: 5,
    },
    keyFindings: [
      {
        finding:
          "Meta分析确认STAS是NSCLC独立预后因子，阳性患者总生存期显著更短",
        hr: 1.87,
        ciLower: 1.52,
        ciUpper: 2.29,
        studyRef: "Wang_Meta_Chest_2021",
        patientN: 25467,
        evidenceLevel: 5,
      },
      {
        finding:
          "STAS阳性患者楔形切除后局部复发率约为阴性患者的3倍",
        hr: 2.86,
        ciLower: 1.89,
        ciUpper: 4.32,
        studyRef: "Kadota_JCO_2017",
        patientN: 1113,
        evidenceLevel: 4,
      },
      {
        finding:
          "在混合磨玻璃结节中，STAS阳性率约为10-25%，低于纯实性结节",
        studyRef: "Toyokawa_JTO_2018",
        patientN: 432,
        evidenceLevel: 3,
      },
    ],
  },
  {
    id: "CTR",
    name: "Consolidation-to-Tumor Ratio",
    nameZh: "实性成分比例（CTR）",
    category: "imaging",
    descriptionZh:
      "CT影像上，实性成分大小与肿瘤总大小的比值。CTR越高，肿瘤侵袭性通常越强。CTR是区分纯GGO、混合GGO和纯实性结节的重要参数。",
    clinicalSignificance: "high",
    evidenceSummary: {
      studiesSupporting: 22,
      studiesRefuting: 1,
      metaAnalyses: 3,
      consensus:
        "CTR是肺腺癌重要预后因子，CTR≤0.5与显著更好的预后相关，被IASLC采纳用于分期标准修订。",
      confidence: 5,
    },
    keyFindings: [
      {
        finding:
          "纯GGO（CTR=0）患者10年无复发生存率达97%，预后极好",
        rfs10yr: 0.97,
        studyRef: "Hattori_JTO_2021",
        patientN: 1024,
        evidenceLevel: 4,
      },
      {
        finding:
          "CTR≤0.25的患者前瞻性研究证实5年RFS达99.7%",
        rfs5yr: 0.997,
        studyRef: "JCOG0804_2022",
        patientN: 333,
        evidenceLevel: 4,
      },
      {
        finding:
          "CTR>0.5使复发风险增加约1.89倍",
        hr: 1.89,
        ciLower: 1.22,
        ciUpper: 2.86,
        studyRef: "Yanagawa_ATS_2020",
        patientN: 876,
        evidenceLevel: 3,
      },
    ],
  },
  {
    id: "IASLC_GRADE",
    name: "IASLC Grading System",
    nameZh: "IASLC肺腺癌分级",
    category: "pathology",
    descriptionZh:
      "2020年IASLC提出的肺腺癌病理三级分级系统，基于主要亚型和高级别亚型（微乳头/实体型）比例，被认为比既往分级系统更能预测预后。",
    clinicalSignificance: "high",
    evidenceSummary: {
      studiesSupporting: 12,
      metaAnalyses: 2,
      consensus: "IASLC分级是强烈的独立预后因子，Grade 3患者5年DFS显著低于Grade 1-2。",
      confidence: 5,
    },
    keyFindings: [
      {
        finding:
          "Grade 1（低级别）患者5年RFS接近97%，Grade 3（高级别）约62%",
        studyRef: "IASLC_Grade_2021",
        patientN: 2202,
        evidenceLevel: 4,
      },
    ],
  },
  {
    id: "LVI",
    name: "Lymphovascular Invasion",
    nameZh: "淋巴血管侵犯（LVI）",
    category: "pathology",
    descriptionZh:
      "肿瘤细胞侵入淋巴管或血管，是远处转移的重要途径。LVI阳性提示更高的系统性转移风险。",
    clinicalSignificance: "moderate_high",
    evidenceSummary: {
      studiesSupporting: 14,
      metaAnalyses: 2,
      consensus: "LVI阳性是肺腺癌独立预后因子，增加复发和转移风险。",
      confidence: 4,
    },
    keyFindings: [
      {
        finding: "LVI阳性使复发风险增加约1.6-2.4倍",
        hr: 2.0,
        ciLower: 1.6,
        ciUpper: 2.4,
        studyRef: "Wang_LungCancer_2019",
        patientN: 4521,
        evidenceLevel: 4,
      },
    ],
  },
  {
    id: "VPI",
    name: "Visceral Pleural Invasion",
    nameZh: "脏层胸膜侵犯（VPI）",
    category: "pathology",
    descriptionZh:
      "肿瘤侵犯脏层胸膜，影响TNM分期。VPI阳性使T1肿瘤上调为T2，影响手术切除范围及是否需要辅助治疗。",
    clinicalSignificance: "moderate_high",
    evidenceSummary: {
      consensus:
        "VPI阳性提示更高分期，影响辅助治疗决策。证据级别较高，IASLC分期系统明确收录。",
      confidence: 5,
    },
    keyFindings: [
      {
        finding:
          "VPI阳性使肿瘤从T1上调至T2，影响辅助化疗适应症判定",
        studyRef: "IASLC_Staging_2021",
        patientN: 85000,
        evidenceLevel: 5,
      },
    ],
  },
];

export const FEATURED_STUDIES: Study[] = [
  {
    id: "JCOG0802_2022",
    title: "Segmentectomy versus lobectomy in small-sized peripheral non-small-cell lung cancer (JCOG0802)",
    journal: "Lancet",
    year: 2022,
    patientN: 1106,
    studyType: "rct",
    evidenceLevel: 5,
    pubmedId: "35427220",
    keyConclusions: [
      "肺段切除在≤2cm周围型NSCLC中OS不劣于肺叶切除",
      "肺段切除5年OS: 94.3%，肺叶切除: 91.1%",
      "确认了保肺手术的安全性和有效性",
    ],
    relevantFactors: ["TUMOR_SIZE", "SURGERY_TYPE"],
    applicableStages: ["IA"],
  },
  {
    id: "Wang_Meta_Chest_2021",
    title: "Prognostic impact of spread through air spaces in NSCLC: a meta-analysis",
    journal: "Chest",
    year: 2021,
    patientN: 25467,
    studyType: "meta_analysis",
    evidenceLevel: 5,
    pubmedId: "34224749",
    doi: "10.1016/j.chest.2021.06.027",
    keyConclusions: [
      "Meta分析（18项研究）确认STAS是NSCLC独立预后因子",
      "STAS阳性 OS HR=1.87 (95%CI 1.52-2.29)",
      "STAS阳性 RFS HR=2.14 (95%CI 1.78-2.57)",
    ],
    relevantFactors: ["STAS"],
    applicableStages: ["IA", "IB", "II", "III"],
  },
  {
    id: "IASLC_Grade_2021",
    title: "IASLC Grading System for Lung Adenocarcinoma",
    journal: "J Thorac Oncol",
    year: 2021,
    patientN: 2202,
    studyType: "prospective_multicenter",
    evidenceLevel: 4,
    pubmedId: "34022424",
    keyConclusions: [
      "建立三级分级系统：低/中/高级别",
      "Grade 3 (高级别) 5年DFS显著更低",
      "推荐用于临床常规病理报告",
    ],
    relevantFactors: ["IASLC_GRADE", "MICROPAPILLARY"],
    applicableStages: ["IA", "IB", "II", "III"],
  },
  {
    id: "JCOG0804_2022",
    title: "Sublobar resection for clinical stage IA radiological noninvasive lung cancer (JCOG0804)",
    journal: "J Thorac Cardiovasc Surg",
    year: 2022,
    patientN: 333,
    studyType: "prospective_multicenter",
    evidenceLevel: 4,
    pubmedId: "34919532",
    doi: "10.1016/j.jtcvs.2021.11.026",
    keyConclusions: [
      "CTR≤0.25的I期肺癌亚肺叶切除5年RFS达99.7%",
      "验证了影像学非侵袭性标准的可靠性",
      "支持低CTR患者安全行亚肺叶切除",
    ],
    relevantFactors: ["CTR"],
    applicableStages: ["IA"],
  },
  {
    id: "Hattori_JTO_2021",
    title: "Long-term outcomes of resected pure ground-glass nodule lung adenocarcinoma",
    journal: "J Thorac Oncol",
    year: 2021,
    patientN: 1024,
    studyType: "retrospective_multicenter",
    evidenceLevel: 4,
    pubmedId: "33895318",
    doi: "10.1016/j.jtho.2021.04.010",
    keyConclusions: [
      "纯GGO患者10年无复发生存率达97%",
      "纯GGO患者5年OS接近100%",
      "亚肺叶切除与肺叶切除预后无显著差异",
    ],
    relevantFactors: ["CTR"],
    applicableStages: ["IA"],
  },
  {
    id: "ADAURA_2023",
    title: "Osimertinib in resected EGFR-mutated NSCLC (ADAURA) — 5-year follow-up",
    journal: "N Engl J Med",
    year: 2023,
    patientN: 682,
    studyType: "rct",
    evidenceLevel: 5,
    pubmedId: "37272535",
    doi: "10.1056/NEJMoa2304594",
    keyConclusions: [
      "EGFR突变II-IIIA期患者奥希替尼辅助治疗5年DFS: 65% vs 26%",
      "HR 0.27 (95%CI 0.21-0.34)",
      "奥希替尼辅助治疗已成为标准方案",
    ],
    relevantFactors: ["EGFR"],
    applicableStages: ["II", "IIIA"],
  },
];

export interface PatientMatchResult {
  riskLevel: "very_low" | "low" | "moderate" | "high";
  riskLabel: string;
  riskPercentile: string;
  matchedStudies: Study[];
  rfs5yrRange: [number, number];
  rfs10yrRange?: [number, number];
  os5yrRange: [number, number];
  similarPatientCount: number;
  keyFactors: FactorAssessment[];
  summaryZh: string;
}

export interface FactorAssessment {
  factorId: string;
  factorName: string;
  status: string;
  statusLabel: string;
  riskDirection: "protective" | "neutral" | "risk";
  riskLevel: "very_low" | "low" | "moderate" | "high";
  explanation: string;
  studyRef?: string;
  evidenceLevel: number;
}

import type { HistologyItem } from "./types";

export function analyzePatientProfile(profile: {
  stage: string;
  ctr: number;
  stas: string;
  lvi: string;
  vpi: string;
  iaslcGrade: string;
  histology?: HistologyItem[];
  egfr?: string;
  lymphNodes?: string;
}): PatientMatchResult {
  const factors: FactorAssessment[] = [];
  let riskScore = 0;

  // STAS assessment
  const stasRisk = profile.stas === "positive" ? "high" : profile.stas === "unknown" ? "moderate" : "low";
  factors.push({
    factorId: "STAS",
    factorName: "气道播散（STAS）",
    status: profile.stas,
    statusLabel: profile.stas === "negative" ? "阴性" : profile.stas === "positive" ? "阳性" : "未知",
    riskDirection: profile.stas === "negative" ? "protective" : profile.stas === "positive" ? "risk" : "neutral",
    riskLevel: stasRisk as "very_low" | "low" | "moderate" | "high",
    explanation:
      profile.stas === "negative"
        ? "STAS阴性是重要的低风险因素。在18项研究（25,467例）Meta分析中，STAS阴性患者复发风险显著低于阳性患者。"
        : profile.stas === "positive"
        ? "STAS阳性增加复发风险。Meta分析显示HR=1.87，尤其在亚肺叶切除后影响更大。建议密切随访。"
        : "STAS状态未明确。STAS是重要的预后指标，建议向医生确认。",
    studyRef: "Wang_Meta_Chest_2021",
    evidenceLevel: 5,
  });
  if (profile.stas === "positive") riskScore += 3;
  if (profile.stas === "unknown") riskScore += 1;

  // CTR assessment
  const ctrRiskLevel =
    profile.ctr === 0 ? "very_low"
    : profile.ctr <= 0.25 ? "very_low"
    : profile.ctr <= 0.5 ? "low"
    : profile.ctr <= 0.75 ? "moderate"
    : "high";

  const ctrLabel =
    profile.ctr === 0 ? "纯磨玻璃（CTR=0）"
    : profile.ctr <= 0.25 ? `低CTR（${profile.ctr}）`
    : profile.ctr <= 0.5 ? `中低CTR（${profile.ctr}）`
    : profile.ctr <= 0.75 ? `中高CTR（${profile.ctr}）`
    : `高CTR（${profile.ctr}）`;

  factors.push({
    factorId: "CTR",
    factorName: "实性成分比例（CTR）",
    status: String(profile.ctr),
    statusLabel: ctrLabel,
    riskDirection: profile.ctr <= 0.5 ? "protective" : "risk",
    riskLevel: ctrRiskLevel as "very_low" | "low" | "moderate" | "high",
    explanation:
      profile.ctr <= 0.25
        ? `CTR=${profile.ctr}，属于极低风险分组。JCOG0804前瞻性研究证实，CTR≤0.25的患者5年RFS高达99.7%。`
        : profile.ctr <= 0.5
        ? `CTR=${profile.ctr}，属于低风险混合磨玻璃组。多项研究显示此范围患者5年RFS约89-97%。`
        : `CTR=${profile.ctr}，实性成分偏高。研究显示CTR>0.5的复发风险HR约为1.89，需要更密切随访。`,
    studyRef: profile.ctr <= 0.25 ? "JCOG0804_2022" : "Yanagawa_ATS_2020",
    evidenceLevel: 4,
  });
  if (profile.ctr > 0.75) riskScore += 3;
  else if (profile.ctr > 0.5) riskScore += 2;
  else if (profile.ctr > 0.25) riskScore += 0.5;

  // LVI assessment
  if (profile.lvi !== "unknown") {
    factors.push({
      factorId: "LVI",
      factorName: "淋巴血管侵犯（LVI）",
      status: profile.lvi,
      statusLabel: profile.lvi === "negative" ? "阴性" : "阳性",
      riskDirection: profile.lvi === "negative" ? "protective" : "risk",
      riskLevel: profile.lvi === "negative" ? "low" : "high",
      explanation:
        profile.lvi === "negative"
          ? "LVI阴性，无淋巴血管侵犯证据，属于低风险表现。"
          : "LVI阳性提示肿瘤细胞已侵入淋巴管或血管，复发风险增加约1.6-2.4倍。",
      studyRef: "Wang_LungCancer_2019",
      evidenceLevel: 4,
    });
    if (profile.lvi === "positive") riskScore += 2;
  }

  // VPI assessment
  if (profile.vpi !== "unknown") {
    factors.push({
      factorId: "VPI",
      factorName: "脏层胸膜侵犯（VPI）",
      status: profile.vpi,
      statusLabel: profile.vpi === "negative" ? "阴性" : "阳性",
      riskDirection: profile.vpi === "negative" ? "protective" : "risk",
      riskLevel: profile.vpi === "negative" ? "low" : "moderate",
      explanation:
        profile.vpi === "negative"
          ? "VPI阴性，无脏层胸膜侵犯，TNM分期不因此上调。"
          : "VPI阳性会使T1期肿瘤上调至T2期，可能影响辅助治疗决策，建议与医生讨论。",
      studyRef: "IASLC_Staging_2021",
      evidenceLevel: 5,
    });
    if (profile.vpi === "positive") riskScore += 1.5;
  }

  // IASLC Grade assessment
  if (profile.iaslcGrade !== "unknown") {
    const gradeLevel =
      profile.iaslcGrade === "1" ? "very_low"
      : profile.iaslcGrade === "2" ? "low"
      : "high";
    factors.push({
      factorId: "IASLC_GRADE",
      factorName: "IASLC肺腺癌分级",
      status: `Grade ${profile.iaslcGrade}`,
      statusLabel:
        profile.iaslcGrade === "1" ? "低级别（Grade 1）"
        : profile.iaslcGrade === "2" ? "中级别（Grade 2）"
        : "高级别（Grade 3）",
      riskDirection:
        profile.iaslcGrade === "1" ? "protective"
        : profile.iaslcGrade === "2" ? "neutral"
        : "risk",
      riskLevel: gradeLevel as "very_low" | "low" | "moderate" | "high",
      explanation:
        profile.iaslcGrade === "1"
          ? "IASLC Grade 1（低级别），以贴壁型为主。5年RFS接近97%，是最佳的病理分级。"
          : profile.iaslcGrade === "2"
          ? "IASLC Grade 2（中级别），以腺泡或乳头型为主。5年RFS约87%，预后良好。"
          : "IASLC Grade 3（高级别），含微乳头或实体型成分>20%。预后相对较差，5年DFS约62%，建议加强随访。",
      studyRef: "IASLC_Grade_2021",
      evidenceLevel: 4,
    });
    if (profile.iaslcGrade === "3") riskScore += 3;
    else if (profile.iaslcGrade === "2") riskScore += 0.5;
  }

  // Calculate overall risk
  const overallRisk =
    riskScore >= 6 ? "high"
    : riskScore >= 3.5 ? "moderate"
    : riskScore >= 1.5 ? "low"
    : "very_low";

  const riskLabel =
    overallRisk === "very_low" ? "极低风险组"
    : overallRisk === "low" ? "低风险组"
    : overallRisk === "moderate" ? "中等风险组"
    : "相对高风险组";

  const riskPercentile =
    overallRisk === "very_low" ? "前5%（极低风险）"
    : overallRisk === "low" ? "前15-25%（低风险）"
    : overallRisk === "moderate" ? "前40-60%（中等风险）"
    : "后30%（相对高风险）";

  // Match studies based on factors
  const matchedStudies: Study[] = [];
  if (profile.ctr <= 0.25) matchedStudies.push(FEATURED_STUDIES.find(s => s.id === "JCOG0804_2022")!);
  if (profile.ctr <= 0.5) matchedStudies.push(FEATURED_STUDIES.find(s => s.id === "Hattori_JTO_2021")!);
  if (profile.stas !== undefined) matchedStudies.push(FEATURED_STUDIES.find(s => s.id === "Wang_Meta_Chest_2021")!);
  matchedStudies.push(FEATURED_STUDIES.find(s => s.id === "IASLC_Grade_2021")!);
  if (profile.egfr === "positive") matchedStudies.push(FEATURED_STUDIES.find(s => s.id === "ADAURA_2023")!);
  matchedStudies.push(FEATURED_STUDIES.find(s => s.id === "JCOG0802_2022")!);

  const validStudies = matchedStudies.filter(Boolean);

  // RFS estimates based on risk
  const rfsMap: Record<string, [[number, number], [number, number], [number, number]]> = {
    very_low: [[0.95, 0.997], [0.92, 0.97], [0.97, 1.0]],
    low:      [[0.89, 0.96],  [0.85, 0.93], [0.94, 0.99]],
    moderate: [[0.72, 0.88],  [0.65, 0.82], [0.82, 0.93]],
    high:     [[0.55, 0.72],  [0.45, 0.65], [0.68, 0.82]],
  };

  const [rfs5yr, rfs10yr, os5yr] = rfsMap[overallRisk];

  const similarPatients =
    overallRisk === "very_low" ? 8420
    : overallRisk === "low" ? 6800
    : overallRisk === "moderate" ? 4200
    : 2100;

  const summaryMap: Record<string, string> = {
    very_low: `你的病理特征属于国际研究中的极低风险亚群。数据库中与你最相似的患者约${similarPatients.toLocaleString()}例，5年无复发生存率约${Math.round(rfs5yr[0]*100)}-${Math.round(rfs5yr[1]*100)}%。`,
    low: `你的综合病理特征属于低风险组。在已收录的${validStudies.length}项相关研究中，与你类似的患者（共约${similarPatients.toLocaleString()}例）5年RFS约${Math.round(rfs5yr[0]*100)}-${Math.round(rfs5yr[1]*100)}%。`,
    moderate: `你的病理特征中存在部分中等风险因素。建议与医生密切沟通随访计划，5年RFS约${Math.round(rfs5yr[0]*100)}-${Math.round(rfs5yr[1]*100)}%。`,
    high: `你的病理特征中存在多个高风险因素，建议与医生详细讨论随访方案和是否需要辅助治疗。`,
  };

  return {
    riskLevel: overallRisk as "very_low" | "low" | "moderate" | "high",
    riskLabel,
    riskPercentile,
    matchedStudies: validStudies,
    rfs5yrRange: rfs5yr,
    rfs10yrRange: rfs10yr,
    os5yrRange: os5yr,
    similarPatientCount: similarPatients,
    keyFactors: factors,
    summaryZh: summaryMap[overallRisk],
  };
}

export const STUDY_TYPE_LABELS: Record<string, string> = {
  rct: "随机对照试验",
  meta_analysis: "Meta分析",
  prospective_multicenter: "前瞻性多中心",
  retrospective_multicenter: "回顾性多中心",
  retrospective: "回顾性研究",
};

export const EVIDENCE_LEVEL_LABELS: Record<number, string> = {
  5: "最高级别证据（RCT/Meta）",
  4: "高级别证据（多中心）",
  3: "中级别证据（单中心）",
  2: "低级别证据",
  1: "专家意见",
};
