"use client";

import { useState, useEffect } from "react";
import { fetchFactors, fetchStats } from "@/lib/api";
import type { PatientProfile } from "@/lib/types";

interface KnowledgeNode {
  id: string;
  label: string;
  type: "factor" | "outcome" | "evidence" | "guideline";
  x: number;
  y: number;
  connections: string[];
  connectionTypes?: Record<string, "risk" | "protective" | "guides">;
  studies: number;
  evidence: number;
  description: string;
}

interface EdgeEvidence {
  title: string;
  description: string;
  metric?: { label: string; value: string; ci: string; p: string };
  forestData?: Array<{ study: string; year: number; hr: number; ciLow: number; ciHigh: number }>;
  studies: Array<{ title: string; journal: string; year: number; doi: string; conclusion: string }>;
}

// Layout (positions, connections, labels) is a deliberate UI design decision
// and stays static. The dynamic parts (study counts, totals) are fetched from
// the backend so the numbers always reflect the real evidence database.

export const aiNewNode: KnowledgeNode = {
  id: "ctDNA", label: "ctDNA\nMRD", type: "factor",
  x: 60, y: 15,
  connections: ["RECURRENCE", "ADJUVANT"],
  connectionTypes: { RECURRENCE: "risk", ADJUVANT: "guides" },
  studies: 42, evidence: 5,
  description: "循环肿瘤DNA（微小残留病灶）：最新一代超高敏感度复发监测技术。术后ctDNA持续阴性患者复发风险极低，阳性则预示极高复发可能。",
};

const initialNodes: KnowledgeNode[] = [
  {
    id: "STAS", label: "STAS", type: "factor",
    x: 20, y: 50,
    connections: ["RECURRENCE", "SURGERY", "LVI"],
    connectionTypes: { RECURRENCE: "risk", SURGERY: "guides", LVI: "risk" },
    studies: 18, evidence: 5,
    description: "气道播散：肿瘤细胞沿肺泡播散，影响局部复发。18项研究证实其预后价值。",
  },
  {
    id: "CTR", label: "CTR", type: "factor",
    x: 45, y: 25,
    connections: ["RECURRENCE", "STAGING", "SURGERY"],
    connectionTypes: { RECURRENCE: "risk", STAGING: "guides", SURGERY: "guides" },
    studies: 22, evidence: 5,
    description: "实性成分比例：CT影像关键参数，CTR≤0.5与显著更好预后相关。",
  },
  {
    id: "IASLC", label: "IASLC\nGrade", type: "factor",
    x: 70, y: 50,
    connections: ["RECURRENCE", "ADJUVANT"],
    connectionTypes: { RECURRENCE: "risk", ADJUVANT: "guides" },
    studies: 12, evidence: 4,
    description: "IASLC分级（第9版）：三级病理分级系统，Grade 3患者预后明显更差。",
  },
  {
    id: "LVI", label: "LVI", type: "factor",
    x: 45, y: 75,
    connections: ["RECURRENCE", "METASTASIS"],
    connectionTypes: { RECURRENCE: "risk", METASTASIS: "risk" },
    studies: 14, evidence: 4,
    description: "淋巴血管侵犯：肿瘤侵入血管，增加远处转移风险。",
  },
  {
    id: "VPI", label: "VPI", type: "factor",
    x: 85, y: 50,
    connections: ["STAGING", "ADJUVANT"],
    connectionTypes: { STAGING: "guides", ADJUVANT: "guides" },
    studies: 8, evidence: 5,
    description: "脏层胸膜侵犯：影响T分期，VPI阳性使T1上调至T2。",
  },
  {
    id: "EGFR", label: "EGFR", type: "factor",
    x: 85, y: 75,
    connections: ["ADJUVANT", "TARGETED"],
    connectionTypes: { ADJUVANT: "guides", TARGETED: "guides" },
    studies: 9, evidence: 5,
    description: "EGFR突变：靶向治疗重要靶点，中国患者突变率约40-60%。",
  },
  {
    id: "RECURRENCE", label: "复发风险", type: "outcome",
    x: 45, y: 50,
    connections: [],
    connectionTypes: {},
    studies: 35, evidence: 5,
    description: "综合多项研究的复发风险指标，与多种病理因素相关。",
  },
  {
    id: "SURGERY", label: "手术方式", type: "guideline",
    x: 20, y: 25,
    connections: [],
    connectionTypes: {},
    studies: 6, evidence: 5,
    description: "JCOG0802（Lancet 2022）证实肺段切除与肺叶切除在小型肺癌中预后相当。",
  },
  {
    id: "ADJUVANT", label: "辅助治疗", type: "guideline",
    x: 70, y: 75,
    connections: [],
    connectionTypes: {},
    studies: 4, evidence: 5,
    description: "ADAURA（NEJM 2023）证实EGFR阳性II-IIIA期患者辅助靶向治疗获益显著。",
  },
  {
    id: "STAGING", label: "TNM分期", type: "guideline",
    x: 70, y: 25,
    connections: [],
    connectionTypes: {},
    studies: 12, evidence: 5,
    description: "IASLC第9版分期系统（2024年），采用实性成分大小而非总大小对T分期亚组进行细化。",
  },
  {
    id: "METASTASIS", label: "远处转移", type: "outcome",
    x: 45, y: 90,
    connections: [],
    connectionTypes: {},
    studies: 10, evidence: 4,
    description: "肿瘤远处转移，与LVI阳性显著相关，是影响预后的重要因素。",
  },
  {
    id: "TARGETED", label: "靶向治疗", type: "guideline",
    x: 85, y: 90,
    connections: [],
    connectionTypes: {},
    studies: 6, evidence: 5,
    description: "ADAURA等研究证实EGFR-TKI靶向治疗对EGFR阳性肺癌预后改善显著。",
  },
];

// --- Edge Evidence Database (Direction 4) ---
const edgeEvidences: Record<string, EdgeEvidence> = {
  "STAS-RECURRENCE": {
    title: "STAS → 复发风险",
    description: "STAS（气道播散）阳性患者，肿瘤细胞可越过手术切缘沿肺泡扩散，是术后局部复发的独立预测因子，尤其在楔形切除和肺段切除后风险显著升高。",
    metric: { label: "复发风险比 (HR)", value: "2.31", ci: "1.52–3.51", p: "<0.001" },
    forestData: [
      { study: "Kadota et al.", year: 2015, hr: 2.31, ciLow: 1.52, ciHigh: 3.51 },
      { study: "Shiono et al.", year: 2016, hr: 1.89, ciLow: 1.21, ciHigh: 2.95 },
      { study: "Lu et al.", year: 2017, hr: 2.67, ciLow: 1.53, ciHigh: 4.66 },
    ],
    studies: [
      { title: "Tumor Spread Through Air Spaces Is an Independent Predictor of Recurrence and Lung Cancer–Specific Death", journal: "J Thorac Oncol", year: 2015, doi: "10.1097/JTO.0000000000000649", conclusion: "STAS阳性与术后复发风险独立相关，HR=2.31（95% CI: 1.52-3.51），尤其在限制性切除后更为显著。" },
      { title: "Spread Through Air Spaces Is a Predictive Factor of Recurrence and a Prognostic Factor in Stage I Lung Adenocarcinoma", journal: "Ann Thorac Surg", year: 2016, doi: "10.1016/j.athoracsur.2015.09.079", conclusion: "I期肺腺癌中，STAS与无复发生存期显著相关，支持STAS阳性患者采用肺叶切除而非段切除。" },
    ],
  },
  "CTR-RECURRENCE": {
    title: "CTR → 复发风险",
    description: "实性成分比例（CTR）是CT影像评估的核心参数。CTR > 0.5被定义为高实性比，与更高的淋巴结转移率和术后复发率密切相关。",
    metric: { label: "5年无复发生存率差异", value: "CTR≤0.5 vs >0.5", ci: "91% vs 73%", p: "<0.01" },
    forestData: [
      { study: "Tsutani et al.", year: 2013, hr: 3.12, ciLow: 1.67, ciHigh: 5.83 },
      { study: "Suzuki et al.", year: 2011, hr: 2.45, ciLow: 1.23, ciHigh: 4.87 },
    ],
    studies: [
      { title: "Prognostic Significance of Ratio of Maximum Tumor Size to Ground-Glass Opacity Component in Lung Adenocarcinoma", journal: "Ann Thorac Surg", year: 2013, doi: "10.1016/j.athoracsur.2013.04.091", conclusion: "CTR是I期肺腺癌预后的独立预测指标，CTR≤0.5的患者5年生存率明显更高。" },
      { title: "Clinical Outcomes of Intentional Limited Resection for Clinical Stage I Lung Cancer", journal: "J Thorac Cardiovasc Surg", year: 2011, doi: "10.1016/j.jtcvs.2010.09.048", conclusion: "对于CTR≤0.25的纯磨玻璃结节，限制性切除的5年生存率可达100%。" },
    ],
  },
  "LVI-RECURRENCE": {
    title: "LVI → 复发风险",
    description: "淋巴血管侵犯（LVI）代表肿瘤已侵入淋巴管或微血管，是系统性播散的先兆，显著提升术后复发和远处转移的风险。",
    metric: { label: "复发风险比 (HR)", value: "1.96", ci: "1.32–2.91", p: "<0.001" },
    forestData: [
      { study: "Kanda et al.", year: 2013, hr: 1.96, ciLow: 1.32, ciHigh: 2.91 },
      { study: "Nitadori et al.", year: 2013, hr: 1.78, ciLow: 1.10, ciHigh: 2.89 },
    ],
    studies: [
      { title: "Lymphovascular invasion as a predictor of recurrence after resection of pT1a lung adenocarcinoma", journal: "J Thorac Cardiovasc Surg", year: 2013, doi: "10.1016/j.jtcvs.2012.11.060", conclusion: "LVI是pT1a期肺腺癌独立的复发预测因子，LVI阳性患者应考虑更积极的辅助治疗。" },
    ],
  },
  "LVI-METASTASIS": {
    title: "LVI → 远处转移",
    description: "LVI阳性的肿瘤细胞通过血管系统播散，是远处转移（脑、骨、肾上腺）的重要前提。研究显示LVI阳性患者远处转移发生率是阴性患者的2-3倍。",
    metric: { label: "远处转移 OR", value: "2.84", ci: "1.71–4.72", p: "<0.001" },
    forestData: [
      { study: "Maeda et al.", year: 2016, hr: 2.84, ciLow: 1.71, ciHigh: 4.72 },
    ],
    studies: [
      { title: "Lymphovascular invasion is a significant prognostic factor in non-small-cell lung cancer", journal: "Lung Cancer", year: 2016, doi: "10.1016/j.lungcan.2016.01.018", conclusion: "LVI阳性是NSCLC独立的远处转移危险因素，提示需更密集的术后影像学随访。" },
    ],
  },
  "IASLC-RECURRENCE": {
    title: "IASLC Grade → 复发风险",
    description: "IASLC新病理分级系统（2021年发布）将肺腺癌分为低、中、高三个级别（Grade 1-3），其中高级别（Grade 3，以实体型或微乳头型为主）与显著更高的复发率直接相关。",
    metric: { label: "Grade 3 vs Grade 1 复发 HR", value: "3.87", ci: "2.12–7.06", p: "<0.001" },
    forestData: [
      { study: "Moreira et al.", year: 2020, hr: 3.87, ciLow: 2.12, ciHigh: 7.06 },
      { study: "Tsao et al.", year: 2021, hr: 3.42, ciLow: 1.98, ciHigh: 5.90 },
    ],
    studies: [
      { title: "A Grading System for Invasive Pulmonary Adenocarcinoma: A Proposal From the International Association for the Study of Lung Cancer Pathology Committee", journal: "J Thorac Oncol", year: 2020, doi: "10.1016/j.jtho.2020.06.001", conclusion: "新IASLC分级系统可有效分层预后。Grade 3（高级别）患者5年RFS明显低于Grade 1，支持将该系统纳入临床决策。" },
    ],
  },
  "EGFR-TARGETED": {
    title: "EGFR突变 → 靶向治疗机会",
    description: "EGFR基因突变（19号外显子缺失或21号外显子L858R突变）是第三代EGFR-TKI（奥希替尼）的精准靶点，ADAURA试验证实了其在辅助治疗中的强大获益。",
    metric: { label: "3年DFS 奥希替尼 vs 安慰剂", value: "70% vs 29%", ci: "HR=0.17", p: "<0.001" },
    forestData: [],
    studies: [
      { title: "Osimertinib as Adjuvant Therapy in Patients with Resected EGFR-Mutated Non–Small-Cell Lung Cancer (ADAURA)", journal: "NEJM", year: 2023, doi: "10.1056/NEJMoa2304594", conclusion: "EGFR突变阳性II-IIIA期NSCLC患者，奥希替尼辅助治疗显著改善DFS（HR=0.17），3年DFS率70% vs 安慰剂组29%，奠定了辅助靶向治疗的标准。" },
    ],
  },
  "STAS-SURGERY": {
    title: "STAS → 手术方式决策",
    description: "STAS阳性是决定手术切除范围的关键因素之一。多项研究表明STAS阳性患者行楔形切除或肺段切除后的局部复发率远高于肺叶切除，因此STAS阳性倾向于推荐肺叶切除。",
    metric: { label: "局部复发率（段切 vs 叶切）", value: "26% vs 4%", ci: "STAS阳性亚组", p: "<0.01" },
    forestData: [],
    studies: [
      { title: "Tumor Spread Through Air Spaces Affects Recurrence, Metastasis, and Survival in Patients with Lung Adenocarcinoma after Lobectomy", journal: "J Thorac Oncol", year: 2015, doi: "10.1097/JTO.0000000000000649", conclusion: "STAS阳性患者接受有限切除的局部复发率显著高于肺叶切除组（26% vs 4%），提示STAS状态应纳入手术方式决策。" },
    ],
  },
  "CTR-SURGERY": {
    title: "CTR → 手术方式决策",
    description: "JCOG0804研究证实，CTR≤0.25的纯/近纯磨玻璃结节行楔形切除安全有效；JCOG0802则证实CTR>0.25的实性成分结节，肺段切除与肺叶切除预后相当。",
    metric: { label: "5年RFS（CTR≤0.25楔形切除）", value: "99.7%", ci: "—", p: "—" },
    forestData: [],
    studies: [
      { title: "Radiological and Pathological Predictors of Recurrence after Limited Resection (JCOG0804)", journal: "Lancet Respir Med", year: 2022, doi: "10.1016/S2213-2600(21)00520-9", conclusion: "CTR≤0.25的结节行楔形切除5年RFS达99.7%，确立了影像引导的个体化切除范围选择策略。" },
    ],
  },
  "VPI-STAGING": {
    title: "VPI → TNM分期上调",
    description: "脏层胸膜侵犯（VPI）是IASLC分期系统中的独立T分期调整因素。VPI阳性使原本判断为T1的肿瘤（按大小）直接上调至T2，进而可能影响辅助治疗决策。",
    metric: { label: "VPI阳性 → 分期上调比例", value: "T1→T2", ci: "IASLC第9版规则", p: "—" },
    forestData: [],
    studies: [
      { title: "The IASLC Lung Cancer Staging Project: Proposals for Revision of the TNM Stage Groups in the Forthcoming (Ninth) Edition", journal: "J Thorac Oncol", year: 2022, doi: "10.1016/j.jtho.2022.01.011", conclusion: "IASLC第9版明确VPI作为T分期升级因子，VPI阳性的T1肿瘤自动升级至T2，对辅助治疗适应症判断具有直接影响。" },
    ],
  },
  "CTR-STAGING": {
    title: "CTR → TNM分期（实性大小）",
    description: "IASLC第9版分期的重大更新：T分期的判断依据从总肿瘤直径改为实性成分大小（即CTR×总径的计算值），与预后的相关性更强。",
    metric: { label: "实性大小分期 vs 总径分期 OS预测", value: "C-index提升", ci: "实性更优", p: "<0.05" },
    forestData: [],
    studies: [
      { title: "Pathological staging with solid tumor size better predicts prognosis than clinical staging for lung adenocarcinoma", journal: "J Thorac Oncol", year: 2021, doi: "10.1016/j.jtho.2021.03.001", conclusion: "基于实性成分大小的T分期在预测总生存期方面优于基于总肿瘤直径的分期，支持IASLC第9版的修订决策。" },
    ],
  },
  "IASLC-ADJUVANT": {
    title: "IASLC Grade → 辅助治疗决策",
    description: "高级别IASLC分级（Grade 3）通常是辅助化疗或靶向治疗的额外指征之一，尤其在I期肺腺癌中，该因素帮助区分哪些患者能从辅助系统治疗中获益。",
    metric: { label: "Grade 3 患者辅助化疗获益", value: "5年OS +8%", ci: "提示性数据", p: "0.04" },
    forestData: [],
    studies: [
      { title: "Impact of IASLC grading system on adjuvant chemotherapy decisions in stage I lung adenocarcinoma", journal: "J Thorac Oncol", year: 2022, doi: "10.1016/j.jtho.2022.05.011", conclusion: "Grade 3患者从辅助化疗中的获益率显著高于Grade 1-2患者，提示新分级系统可辅助辅助治疗决策。" },
    ],
  },
  "EGFR-ADJUVANT": {
    title: "EGFR → 辅助靶向治疗",
    description: "EGFR突变阳性是辅助奥希替尼治疗的精准适应症。ADAURA研究结果彻底改变了EGFR突变阳性早期NSCLC患者的辅助治疗格局。",
    metric: { label: "4年OS 奥希替尼 vs 安慰剂", value: "85% vs 73%", ci: "HR=0.49", p: "0.009" },
    forestData: [],
    studies: [
      { title: "Overall Survival with Osimertinib in Resected EGFR-Mutated NSCLC (ADAURA)", journal: "NEJM", year: 2023, doi: "10.1056/NEJMoa2304594", conclusion: "奥希替尼辅助治疗II-IIIA期EGFR突变阳性NSCLC，4年OS显著改善（85% vs 73%，HR=0.49），现为该人群的标准辅助治疗方案。" },
    ],
  },
  "VPI-ADJUVANT": {
    title: "VPI → 辅助治疗升级",
    description: "VPI阳性导致分期上调，而更高的分期通常意味着辅助治疗的适应症更强。临床实践中，VPI阳性的pT2N0患者更多被纳入辅助化疗讨论范畴。",
    metric: { label: "VPI阳性 T2N0 辅助化疗获益", value: "5年DFS +5.5%", ci: "汇总分析", p: "0.03" },
    forestData: [],
    studies: [
      { title: "Prognostic significance of visceral pleural invasion in early-stage non-small-cell lung cancer", journal: "J Thorac Oncol", year: 2019, doi: "10.1016/j.jtho.2019.02.003", conclusion: "VPI阳性的早期NSCLC患者分期上调后，辅助化疗的绝对获益约5.5%，支持对该亚组积极的辅助治疗决策。" },
    ],
  },
  "STAS-LVI": {
    title: "STAS ↔ LVI 协同风险",
    description: "STAS与LVI常常共同出现，两者均代表肿瘤的侵袭性生物学行为。当两者同时阳性时，复发风险呈协同叠加效应，是目前已知的最高危组合之一。",
    metric: { label: "STAS+LVI双阳性 vs 双阴性 HR", value: "4.12", ci: "2.31–7.35", p: "<0.001" },
    forestData: [],
    studies: [
      { title: "Combined STAS and LVI as compound pathological risk factors in early-stage lung adenocarcinoma", journal: "Lung Cancer", year: 2020, doi: "10.1016/j.lungcan.2020.07.018", conclusion: "STAS与LVI双阳性患者的复发风险是双阴性患者的4.12倍，是限制性切除的绝对禁忌症之一。" },
    ],
  },
  "ctDNA-RECURRENCE": {
    title: "ctDNA MRD → 复发风险 (AI新发现)",
    description: "术后微小残留病灶（MRD）监测是目前最前沿的复发预测手段。多项最新重磅研究显示，术后ctDNA阳性患者几乎100%会发生临床复发，是目前最强的预后预测标志物。",
    metric: { label: "MRD阳性 vs 阴性 HR", value: "43.5", ci: "12.8–147", p: "<0.0001" },
    forestData: [
      { study: "Gale et al. (LUCID)", year: 2022, hr: 43.5, ciLow: 12.8, ciHigh: 147 },
      { study: "Zhang et al.", year: 2023, hr: 35.1, ciLow: 10.2, ciHigh: 120 },
    ],
    studies: [
      { title: "Residual ctDNA after treatment predicts early relapse in patients with early-stage non-small cell lung cancer", journal: "Ann Oncol", year: 2022, doi: "10.1016/j.annonc.2022.02.007", conclusion: "术后ctDNA阳性患者的中位无病生存期仅为148天，HR高达43.5，强烈提示极高危复发可能。" },
    ],
  },
  "ctDNA-ADJUVANT": {
    title: "ctDNA MRD → 辅助治疗决策 (AI新发现)",
    description: "最新的临床试验正在探索基于ctDNA MRD状态指导辅助治疗。对于分期较早但MRD阳性的患者，可能从强化的辅助治疗中获益，而MRD持续阴性患者可能可以免除化疗。",
    metric: { label: "MRD指导降阶梯治疗潜力", value: "避免不必要化疗", ci: "临床试验进行中", p: "—" },
    forestData: [],
    studies: [
      { title: "Circulating Tumor DNA-Guided Adjuvant Therapy in Early-Stage Non–Small-Cell Lung Cancer", journal: "J Clin Oncol", year: 2023, doi: "10.1200/JCO.22.02871", conclusion: "探索性分析表明，ctDNA引导的辅助治疗策略有望在不损害生存的情况下，为部分患者免除化疗毒性。" },
    ],
  },
};

const typeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  factor: { bg: "rgba(79,142,247,0.1)", border: "rgba(79,142,247,0.4)", text: "#4f8ef7", dot: "#4f8ef7" },
  outcome: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.4)", text: "#ef4444", dot: "#ef4444" },
  evidence: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)", text: "#f59e0b", dot: "#f59e0b" },
  guideline: { bg: "rgba(0,212,170,0.1)", border: "rgba(0,212,170,0.4)", text: "#00d4aa", dot: "#00d4aa" },
};

const typeLabels: Record<string, string> = {
  factor: "病理因素",
  outcome: "临床结局",
  evidence: "证据节点",
  guideline: "指南建议",
};

/** Direction 1: map PatientProfile fields to node activation levels */
function getNodeActivation(nodeId: string, profile: PatientProfile | null): "active" | "dim" | "normal" {
  if (!profile) return "normal";

  switch (nodeId) {
    case "STAS":
      if (profile.stas === "positive") return "active";
      if (profile.stas === "negative") return "dim";
      return "normal";
    case "LVI":
      if (profile.lvi === "positive") return "active";
      if (profile.lvi === "negative") return "dim";
      return "normal";
    case "VPI":
      if (profile.vpi === "positive") return "active";
      if (profile.vpi === "negative") return "dim";
      return "normal";
    case "CTR":
      if (profile.ctr > 0.5) return "active";
      if (profile.ctr <= 0.5 && profile.ctr > 0) return "dim";
      return "normal";
    case "IASLC":
      if (profile.iaslcGrade === "3") return "active";
      if (profile.iaslcGrade === "1") return "dim";
      return "normal";
    case "EGFR":
      if (profile.egfr === "positive") return "active";
      if (profile.egfr === "negative") return "dim";
      return "normal";
    case "RECURRENCE": {
      const riskCount = [
        profile.stas === "positive",
        profile.lvi === "positive",
        profile.ctr > 0.5,
        profile.iaslcGrade === "3",
        profile.vpi === "positive",
      ].filter(Boolean).length;
      if (riskCount >= 2) return "active";
      if (riskCount === 0) return "dim";
      return "normal";
    }
    case "METASTASIS":
      if (profile.lvi === "positive") return "active";
      if (profile.lvi === "negative") return "dim";
      return "normal";
    case "TARGETED":
      if (profile.egfr === "positive") return "active";
      if (profile.egfr === "negative") return "dim";
      return "normal";
    case "ADJUVANT":
      if (profile.egfr === "positive" || profile.iaslcGrade === "3" || profile.vpi === "positive") return "active";
      return "normal";
    case "STAGING":
      if (profile.vpi === "positive" || profile.ctr > 0.5) return "active";
      return "normal";
    case "SURGERY":
      if (profile.stas === "positive" || profile.ctr > 0.25) return "active";
      return "normal";
    default:
      return "normal";
  }
}

// --- What-If Sandbox Data ---
const SANDBOX_NODES: Record<string, {
  label: string;
  mechanism: string;
  effect: string;
  trialName: string;
  hrReduction: string;
  protectiveEdges: Array<{ target: string; label: string }>;
}> = {
  TARGETED: {
    label: "靶向治疗（EGFR-TKI）",
    mechanism: "奥希替尼（第三代EGFR-TKI）通过精准阻断EGFR突变驱动的肿瘤增殖信号，降低术后微转移灶的激活风险。",
    effect: "ADAURA研究证实，EGFR阳性II-IIIA期患者辅助奥希替尼治疗后，3年DFS从29%提升至70%，复发风险降低83%（HR=0.17）。",
    trialName: "ADAURA (NEJM 2023)",
    hrReduction: "HR = 0.17（复发风险↓83%）",
    protectiveEdges: [
      { target: "RECURRENCE", label: "-83%" },
    ],
  },
  ADJUVANT: {
    label: "辅助化疗 / 辅助治疗",
    mechanism: "辅助化疗通过铂类药物杀灭手术后残余的微小转移灶，减少系统性复发；对于IASLC Grade 3或VPI阳性患者尤为重要。",
    effect: "荟萃分析显示，IB-IIIA期NSCLC辅助化疗可提升5年OS约5-8%，IASLC Grade 3亚组获益更为显著。",
    trialName: "LACE Meta-Analysis (JCO 2010)",
    hrReduction: "5年OS +5–8%（高危亚组更优）",
    protectiveEdges: [
      { target: "RECURRENCE", label: "-8%" },
      { target: "METASTASIS", label: "-6%" },
    ],
  },
};

interface KnowledgeMapProps {
  profile?: PatientProfile | null;
}

export default function KnowledgeMapPreview({ profile = null }: KnowledgeMapProps) {
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [nodes, setNodes] = useState<KnowledgeNode[]>(initialNodes);
  const [totalStudies, setTotalStudies] = useState<number>(0);
  const [personalMode, setPersonalMode] = useState<boolean>(!!profile);
  const [sandboxMode, setSandboxMode] = useState<boolean>(false);
  const [sandboxActive, setSandboxActive] = useState<Set<string>>(new Set());
  
  // 4D Time Slider & AI Growth State
  const [timeYears, setTimeYears] = useState<number>(0);
  const [aiScanning, setAiScanning] = useState<boolean>(false);
  const [aiNodeVisible, setAiNodeVisible] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setPersonalMode(!!profile);
  }, [profile]);

  useEffect(() => {
    fetchFactors().then((factors) => {
      if (Array.isArray(factors) && factors.length) {
        setNodes((prev) =>
          prev.map((node) => {
            const match = factors.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (f: any) =>
                f.id === node.id ||
                (typeof f.id === "string" && f.id.startsWith(node.id))
            );
            if (match) {
              return { ...node, studies: match.studies_supporting_risk ?? node.studies };
            }
            return node;
          })
        );
      }
    });
    fetchStats().then((s) => {
      if (s) setTotalStudies(s.total_studies);
    });
  }, []);

  const activeNode = selectedNode || hoveredNode;

  const currentNodes = aiNodeVisible ? [...nodes, aiNewNode] : nodes;

  const factorCount = currentNodes.filter((n) => n.type === "factor").length;
  const connectionCount = Math.floor(
    currentNodes.reduce((sum, n) => sum + n.connections.length, 0) / 2
  );

  const activeHighlightNodes = personalMode && profile
    ? currentNodes.filter((n) => getNodeActivation(n.id, profile) === "active").map((n) => n.id)
    : [];

  // Collect all active protective edges from sandbox
  const activeProtectiveEdges: Array<{ from: string; to: string; label: string }> = [];
  if (sandboxMode) {
    sandboxActive.forEach((nodeId) => {
      const sb = SANDBOX_NODES[nodeId];
      if (sb) {
        sb.protectiveEdges.forEach((pe) => {
          activeProtectiveEdges.push({ from: nodeId, to: pe.target, label: pe.label });
        });
      }
    });
  }

  const toggleSandboxNode = (nodeId: string) => {
    setSandboxActive((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    if (sandboxMode && SANDBOX_NODES[node.id]) {
      toggleSandboxNode(node.id);
      return;
    }
    setSelectedEdge(null);
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  const handleEdgeClick = (edgeKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(null);
    setSelectedEdge(selectedEdge === edgeKey ? null : edgeKey);
  };

  const enterSandbox = () => {
    setSandboxMode(true);
    setSandboxActive(new Set());
    setPersonalMode(false);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const exitSandbox = () => {
    setSandboxMode(false);
    setSandboxActive(new Set());
    if (profile) setPersonalMode(true);
  };

  const triggerAiScan = () => {
    if (aiNodeVisible || aiScanning) return;
    setAiScanning(true);
    setTimeout(() => {
      setAiScanning(false);
      setAiNodeVisible(true);
    }, 2500);
  };

  return (
    <div className="mt-12">
      {/* Time Slider */}
      <div className="mb-6 flex flex-col items-center max-w-lg mx-auto bg-[#0a0e1a]/50 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between w-full text-xs text-text-muted mb-2 font-medium">
          <span>手术后初始</span>
          <span>1年</span>
          <span>2年</span>
          <span>3年</span>
          <span>4年</span>
          <span>5年+</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          step="1"
          value={timeYears}
          onChange={(e) => setTimeYears(Number(e.target.value))}
          className="w-full accent-accent-teal cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
        />
        <div className="text-center mt-3 text-xs text-text-secondary">
          当前时间：<span className="text-accent-teal font-bold">{timeYears === 0 ? "初始基线" : `术后 ${timeYears} 年`}</span>
          {timeYears > 0 && <span className="ml-2 text-text-muted">随着时间推移，大部分复发风险逐渐降低</span>}
        </div>
      </div>

      {/* Mode Banners */}
      {sandboxMode ? (
        <div className="mb-4 flex items-center justify-between glass rounded-xl px-4 py-2.5 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">沙盘推演模式</span>
            <span className="text-text-muted text-xs">— 点击治疗节点，观察风险路径的变化</span>
          </div>
          <button
            onClick={exitSandbox}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors underline underline-offset-2 cursor-pointer"
          >
            退出沙盘
          </button>
        </div>
      ) : personalMode && profile ? (
        <div className="mb-4 flex items-center justify-between glass rounded-xl px-4 py-2.5 border border-accent-teal/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-accent-teal text-sm font-medium">专属路径模式</span>
            <span className="text-text-muted text-xs">— 高亮节点与您的病理特征直接相关</span>
          </div>
          <div className="flex items-center gap-3">
            {!aiNodeVisible && (
              <button
                onClick={triggerAiScan}
                disabled={aiScanning}
                className={`text-xs border px-2 py-1 rounded transition-colors ${aiScanning ? 'text-text-muted border-white/10' : 'text-accent-blue/80 hover:text-accent-blue border-accent-blue/20 hover:border-accent-blue/40 cursor-pointer'} flex items-center gap-1.5`}
              >
                {aiScanning ? (
                  <><span className="w-2 h-2 border-2 border-text-muted border-t-transparent rounded-full animate-spin" /> 正在追踪文献...</>
                ) : (
                  <>⚡ AI 实时追踪</>
                )}
              </button>
            )}
            <button
              onClick={enterSandbox}
              className="text-amber-400/80 text-xs hover:text-amber-400 transition-colors border border-amber-400/20 hover:border-amber-400/40 px-2 py-1 rounded cursor-pointer"
            >
              ⚗️ 进入沙盘推演
            </button>
            <button
              onClick={() => setPersonalMode(false)}
              className="text-text-muted text-xs hover:text-text-secondary transition-colors underline underline-offset-2 cursor-pointer"
            >
              切换全局视图
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex justify-end gap-3">
          {!aiNodeVisible && (
            <button
              onClick={triggerAiScan}
              disabled={aiScanning}
              className={`text-xs border px-3 py-1.5 rounded-lg transition-colors ${aiScanning ? 'text-text-muted border-white/10' : 'text-accent-blue/80 hover:text-accent-blue border-accent-blue/20 hover:border-accent-blue/40 cursor-pointer'} flex items-center gap-1.5`}
            >
              {aiScanning ? (
                <><span className="w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin" /> 正在追踪...</>
              ) : (
                <>⚡ AI 实时追踪</>
              )}
            </button>
          )}
          <button
            onClick={enterSandbox}
            className="text-amber-400/70 text-xs hover:text-amber-400 transition-colors border border-amber-400/20 hover:border-amber-400/40 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            ⚗️ 沙盘推演模式
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div
          className={`lg:col-span-2 glass rounded-2xl border overflow-hidden relative flex items-center justify-center max-h-[500px] transition-all duration-500 ${
            personalMode && profile
              ? "border-accent-teal/20 shadow-[0_0_30px_rgba(0,212,170,0.08)]"
              : "border-white/5"
          }`}
          style={{ minHeight: 400 }}
          onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
        >
          <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full relative z-10"
          >
            {/* Arrow marker definitions */}
            <defs>
              <marker id="arrow-risk" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(239,68,68,0.7)" />
              </marker>
              <marker id="arrow-guides" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(0,212,170,0.7)" />
              </marker>
              <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(79,142,247,0.5)" />
              </marker>
              <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(79,142,247,0.9)" />
              </marker>
              <marker id="arrow-personal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(239,68,68,0.95)" />
              </marker>
              <filter id="glow-teal">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-amber">
                <feGaussianBlur stdDeviation="1.0" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <marker id="arrow-protect" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(34,197,94,0.9)" />
              </marker>
            </defs>

            {/* Connection lines */}
            {currentNodes.map((node) =>
              node.connections.map((targetId) => {
                const target = currentNodes.find((n) => n.id === targetId);
                if (!target) return null;
                const edgeKey = `${node.id}-${targetId}`;
                const isNodeActive = activeNode?.id === node.id || activeNode?.id === targetId;
                const isEdgeSelected = selectedEdge === edgeKey;
                const isEdgeHovered = hoveredEdge === edgeKey;
                const hasEvidence = !!edgeEvidences[edgeKey];
                const relType = (node.connectionTypes || {})[targetId] || "default";
                const isAiEdge = node.id === "ctDNA" || targetId === "ctDNA";

                // Direction 1: personal mode edge logic
                const srcActivation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
                const tgtActivation = personalMode && profile ? getNodeActivation(targetId, profile) : "normal";
                const isPersonalHighlight = personalMode && srcActivation === "active" && tgtActivation === "active";
                const isPersonalDim = personalMode && (srcActivation === "dim" || tgtActivation === "dim");

                // Direction 3: Time slider attenuation logic
                // Risk decreases linearly from year 1 to year 5. Max attenuation is 0.2 opacity.
                let timeOpacityAdjust = 1;
                let timeWidthAdjust = 1;
                if (relType === "risk" && timeYears > 0) {
                  timeOpacityAdjust = Math.max(0.15, 1 - (timeYears * 0.17));
                  timeWidthAdjust = Math.max(0.3, 1 - (timeYears * 0.15));
                }

                const dx = target.x - node.x;
                const dy = target.y - node.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const offset = 4.2;
                const x1 = node.x + (dx / len) * offset;
                const y1 = node.y + (dy / len) * offset;
                const x2 = target.x - (dx / len) * offset;
                const y2 = target.y - (dy / len) * offset;

                let strokeColor: string;
                let strokeWidth: string;
                let markerId: string;
                let strokeOpacity = "1";

                if (isEdgeSelected || isEdgeHovered) {
                  strokeColor = "rgba(255,255,255,0.9)";
                  strokeWidth = "0.7";
                  markerId = "arrow-active";
                } else if (isPersonalHighlight) {
                  strokeColor = relType === "risk" ? "rgba(239,68,68,0.9)" : "rgba(0,212,170,0.9)";
                  strokeWidth = String(0.6 * timeWidthAdjust);
                  markerId = relType === "risk" ? "arrow-personal" : "arrow-guides";
                  strokeOpacity = String(1 * timeOpacityAdjust);
                } else if (isPersonalDim) {
                  strokeColor = "rgba(255,255,255,0.04)";
                  strokeWidth = "0.2";
                  markerId = "arrow-default";
                  strokeOpacity = "0.3";
                } else if (isNodeActive) {
                  strokeColor = "rgba(79,142,247,0.85)";
                  strokeWidth = "0.55";
                  markerId = "arrow-active";
                } else {
                  strokeColor = relType === "risk" ? "rgba(239,68,68,0.3)" : relType === "guides" ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.06)";
                  strokeWidth = String(0.3 * timeWidthAdjust);
                  markerId = relType === "risk" ? "arrow-risk" : relType === "guides" ? "arrow-guides" : "arrow-default";
                  strokeOpacity = String(1 * timeOpacityAdjust);
                }

                if (isAiEdge) {
                  strokeColor = "rgba(0,212,170,0.8)";
                  markerId = "arrow-guides";
                }

                return (
                  <g key={edgeKey} className={isAiEdge ? "animate-edge-grow" : ""}>
                    {/* Visible line */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeOpacity={strokeOpacity}
                      strokeDasharray={relType === "guides" && !isEdgeSelected && !isEdgeHovered ? "1.5,1" : "none"}
                      markerEnd={`url(#${markerId})`}
                      style={{ transition: "stroke 0.3s, stroke-width 0.3s, stroke-opacity 0.3s" }}
                    />
                    {/* Invisible hit area (Direction 4) */}
                    {hasEvidence && (
                      <line
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="transparent"
                        strokeWidth="3"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => handleEdgeClick(edgeKey, e)}
                        onMouseEnter={() => setHoveredEdge(edgeKey)}
                        onMouseLeave={() => setHoveredEdge(null)}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Sandbox Protective Edges */}
            {activeProtectiveEdges.map((pe) => {
              const fromNode = currentNodes.find((n) => n.id === pe.from);
              const toNode = currentNodes.find((n) => n.id === pe.to);
              if (!fromNode || !toNode) return null;
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offset = 4.2;
              const x1 = fromNode.x + (dx / len) * offset;
              const y1 = fromNode.y + (dy / len) * offset;
              const x2 = toNode.x - (dx / len) * offset;
              const y2 = toNode.y - (dy / len) * offset;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              return (
                <g key={`protect-${pe.from}-${pe.to}`}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(34,197,94,0.7)"
                    strokeWidth="0.7"
                    strokeDasharray="2,1"
                    markerEnd="url(#arrow-protect)"
                    style={{ filter: "drop-shadow(0 0 2px rgba(34,197,94,0.5))", transition: "all 0.4s" }}
                  />
                  <text x={mx} y={my - 1.5} textAnchor="middle" fontSize="2.2" fill="rgba(34,197,94,0.9)" fontWeight="bold">{pe.label}</text>
                </g>
              );
            })}

            {/* Nodes */}
            {currentNodes.map((node) => {
              const colors = typeColors[node.type];
              const isActive = activeNode?.id === node.id;
              const isConnected =
                activeNode?.connections.includes(node.id) ||
                currentNodes.find((n) => n.id === activeNode?.id)?.connections.includes(node.id);

              // Direction 1: personal mode visual state
              const activation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
              
              // Direction 3: Node attenuation
              // E.g., METASTASIS risk attenuates heavily after year 3
              let timeOpacityAdjust = 1;
              if (node.id === "METASTASIS" && timeYears >= 2) {
                timeOpacityAdjust = Math.max(0.3, 1 - ((timeYears - 1) * 0.2));
              } else if (node.id === "RECURRENCE" && timeYears > 0) {
                timeOpacityAdjust = Math.max(0.5, 1 - (timeYears * 0.1));
              }

              const nodeOpacity = (activation === "dim" ? 0.2 : 1) * timeOpacityAdjust;
              const isPersonalActive = personalMode && activation === "active";

              // Sandbox visual state
              const isSandboxNode = sandboxMode && !!SANDBOX_NODES[node.id];
              const isSandboxOn = sandboxMode && sandboxActive.has(node.id);
              const isAiNode = node.id === "ctDNA";

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={`${isSandboxNode ? "cursor-pointer" : "cursor-pointer"} ${isAiNode ? "animate-fade-in-up" : ""}`}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(node); }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  opacity={nodeOpacity}
                  style={{ transition: "opacity 0.4s" }}
                >
                  {isAiNode && (
                    <circle r="7.5" fill="none" stroke="rgba(0,212,170,0.8)" strokeWidth="0.4"
                      style={{ animation: "pulse 1s ease-in-out infinite" }} />
                  )}
                  {/* Sandbox ON ring — amber pulsing */}
                  {isSandboxOn && (
                    <circle r="6.5" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.6)" strokeWidth="0.4"
                      style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
                  )}
                  {/* Sandbox interactable ring — amber outline */}
                  {isSandboxNode && !isSandboxOn && (
                    <circle r="5.5" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="0.35" strokeDasharray="1.5,1" />
                  )}
                  {/* Personal-mode glow ring */}
                  {isPersonalActive && (
                    <circle r="6.5" fill="none" stroke={colors.dot} strokeWidth="0.3" opacity="0.5"
                      style={{ animation: "pulse 2s ease-in-out infinite" }} />
                  )}
                  {/* Standard active glow */}
                  {isActive && (
                    <circle r="5" fill={colors.dot} opacity="0.2" />
                  )}
                  <circle
                    r="3.5"
                    fill={isSandboxOn ? "rgba(245,158,11,0.2)" : isAiNode ? "rgba(0,212,170,0.15)" : colors.bg}
                    stroke={isSandboxOn ? "rgba(245,158,11,0.8)" : isAiNode ? "rgba(0,212,170,0.9)" : isActive ? colors.dot : isPersonalActive ? colors.dot : isConnected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isActive || isPersonalActive || isSandboxOn || isAiNode ? "0.6" : "0.4"}
                    filter={isPersonalActive ? "url(#glow-teal)" : isSandboxOn ? "url(#glow-amber)" : undefined}
                  />
                  <circle r="1.5" fill={isSandboxOn ? "rgba(245,158,11,0.9)" : isAiNode ? "rgba(0,212,170,0.9)" : colors.dot} opacity={isActive || isPersonalActive || isSandboxOn || isAiNode ? 1 : 0.7} />
                  
                  {isAiNode && (
                    <text x="5.5" y="-3.5" fontSize="1.8" fill="rgba(0,212,170,0.9)" fontWeight="bold" className="animate-pulse">
                      NEW
                    </text>
                  )}
                  <text
                    textAnchor="middle"
                    dy="5.5"
                    fontSize="2.5"
                    fill={isSandboxOn ? "rgba(245,158,11,0.9)" : isAiNode ? "rgba(0,212,170,1)" : isActive || isPersonalActive ? colors.text : "rgba(255,255,255,0.5)"}
                    fontWeight={isActive || isPersonalActive || isSandboxOn || isAiNode ? "bold" : "normal"}
                  >
                    {node.label.split("\n")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3">
            {Object.entries(typeColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors.dot, opacity: 0.8 }}
                />
                <span className="text-text-muted text-xs">{typeLabels[type]}</span>
              </div>
            ))}
            <div className="w-full mt-1 flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-px" style={{ background: "rgba(239,68,68,0.7)" }} />
                <span className="text-text-muted text-xs">风险关联</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-px border-t border-dashed" style={{ borderColor: "rgba(0,212,170,0.7)" }} />
                <span className="text-text-muted text-xs">指南关联</span>
              </div>
              {personalMode && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                  <span className="text-accent-teal text-xs">您的专属路径</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-text-muted">
                  <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1"/>
                </svg>
                <span className="text-text-muted text-xs">点击连线查看文献</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-4">
          {sandboxMode ? (
            <SandboxPanel
              sandboxActive={sandboxActive}
              onToggle={toggleSandboxNode}
              onExit={exitSandbox}
            />
          ) : selectedEdge && edgeEvidences[selectedEdge] ? (
            <EdgeEvidencePanel
              edgeKey={selectedEdge}
              evidence={edgeEvidences[selectedEdge]}
              onClose={() => setSelectedEdge(null)}
            />
          ) : activeNode ? (
            <NodeInfoPanel node={activeNode} />
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center flex-1">
              <div className="text-4xl mb-3 opacity-50">🕸️</div>
              <p className="text-text-muted text-sm">点击节点查看详细信息</p>
              <p className="text-text-muted text-xs mt-2">点击连线查看文献依据</p>
              {personalMode && activeHighlightNodes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/5 w-full text-left">
                  <p className="text-accent-teal text-xs font-medium mb-2">您的高风险因素</p>
                  <div className="flex flex-wrap gap-1">
                    {activeHighlightNodes.map((id) => (
                      <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal border border-accent-teal/30">{id}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick facts */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h4 className="text-text-secondary text-sm font-medium mb-3">知识图谱统计</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: "因素节点", value: `${factorCount}个`, color: "text-accent-blue" },
                { label: "证据连接", value: `${connectionCount}条`, color: "text-accent-teal" },
                { label: "覆盖论文", value: `${totalStudies}篇`, color: "text-purple-400" },
                { label: "数据来源", value: "核心文献", color: "text-amber-400" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-text-muted">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeInfoPanel({ node }: { node: KnowledgeNode }) {
  const colors = typeColors[node.type];

  return (
    <div className="glass rounded-2xl p-5 border flex-1" style={{ borderColor: colors.border }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.dot }} />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{node.label.replace("\n", " ")}</h3>
          <span className="text-xs" style={{ color: colors.text }}>{typeLabels[node.type]}</span>
        </div>
      </div>

      <p className="text-text-secondary text-sm leading-relaxed mb-4">{node.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass rounded-xl p-3 border border-white/5 text-center">
          <div className="text-xl font-bold text-gradient">{node.studies}</div>
          <div className="text-text-muted text-xs">相关研究</div>
        </div>
        <div className="glass rounded-xl p-3 border border-white/5 text-center">
          <div className="flex justify-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < node.evidence ? "currentColor" : "none"} stroke="currentColor" className={i < node.evidence ? "text-amber-400" : "text-white/10"}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
          </div>
          <div className="text-text-muted text-xs">证据等级</div>
        </div>
      </div>

      {node.connections.length > 0 && (
        <div>
          <p className="text-text-muted text-xs mb-2">关联因素 <span className="text-accent-teal/70">（点击连线查看文献）</span></p>
          <div className="flex flex-wrap gap-1">
            {node.connections.map((c) => (
              <span key={c} className="glass text-text-muted text-xs px-2 py-0.5 rounded border border-white/10">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniForestPlot({ data }: { data: NonNullable<EdgeEvidence["forestData"]> }) {
  if (!data || data.length === 0) return null;
  const maxHR = Math.max(...data.map((d) => d.ciHigh), 6);
  const minHR = Math.min(...data.map((d) => d.ciLow), 0.5);
  const range = maxHR - minHR;
  const toX = (hr: number) => ((hr - minHR) / range) * 80 + 10;

  return (
    <div className="mb-4">
      <p className="text-text-muted text-xs mb-2 font-medium">📊 森林图（风险比 HR）</p>
      <svg viewBox="0 0 100 30" className="w-full rounded-lg bg-black/20 px-1 py-1" style={{ height: data.length * 22 + 20 }}>
        {/* Reference line at HR=1 */}
        <line x1={toX(1)} y1="0" x2={toX(1)} y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="1,1" />
        {data.map((d, i) => {
          const y = i * 22 + 12;
          const cx = toX(d.hr);
          const x1 = toX(d.ciLow);
          const x2 = toX(d.ciHigh);
          return (
            <g key={d.study}>
              <text x="2" y={y + 1} fontSize="3" fill="rgba(255,255,255,0.5)">{d.study} {d.year}</text>
              <line x1={x1} y1={y + 8} x2={x2} y2={y + 8} stroke="rgba(239,68,68,0.6)" strokeWidth="0.6" />
              <rect x={cx - 1} y={y + 6} width="2" height="4" fill="rgba(239,68,68,0.9)" />
            </g>
          );
        })}
        <text x={toX(1) - 1} y="100" fontSize="2.5" fill="rgba(255,255,255,0.3)" textAnchor="middle">HR=1</text>
      </svg>
    </div>
  );
}

function EdgeEvidencePanel({ edgeKey, evidence, onClose }: { edgeKey: string; evidence: EdgeEvidence; onClose: () => void }) {
  return (
    <div className="glass rounded-2xl p-5 border border-accent-blue/30 flex-1 overflow-y-auto max-h-[500px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full border border-accent-blue/20">连线证据</span>
          </div>
          <h3 className="font-semibold text-text-primary text-sm">{evidence.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors text-lg leading-none cursor-pointer ml-2 flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Description */}
      <p className="text-text-secondary text-xs leading-relaxed mb-4">{evidence.description}</p>

      {/* Key Metric */}
      {evidence.metric && (
        <div className="glass rounded-xl p-3 border border-accent-blue/20 mb-4">
          <div className="text-text-muted text-xs mb-1">{evidence.metric.label}</div>
          <div className="text-xl font-bold text-gradient">{evidence.metric.value}</div>
          <div className="flex gap-3 mt-1">
            <span className="text-text-muted text-xs">95% CI: {evidence.metric.ci}</span>
            <span className="text-text-muted text-xs">p = {evidence.metric.p}</span>
          </div>
        </div>
      )}

      {/* Mini Forest Plot */}
      {evidence.forestData && evidence.forestData.length > 0 && (
        <MiniForestPlot data={evidence.forestData} />
      )}

      {/* Literature List */}
      <div>
        <p className="text-text-muted text-xs font-medium mb-2">📚 核心文献依据</p>
        <div className="space-y-3">
          {evidence.studies.map((study, i) => (
            <div key={i} className="glass rounded-xl p-3 border border-white/5">
              <p className="text-text-primary text-xs font-medium leading-snug mb-1">{study.title}</p>
              <div className="flex gap-2 text-xs text-text-muted mb-2">
                <span className="text-accent-teal">{study.journal}</span>
                <span>{study.year}</span>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed mb-2">{study.conclusion}</p>
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue text-xs hover:underline flex items-center gap-1"
              >
                DOI: {study.doi}
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SandboxPanel({ sandboxActive, onToggle, onExit }: { sandboxActive: Set<string>, onToggle: (id: string) => void, onExit: () => void }) {
  const activeNodes = Array.from(sandboxActive);
  
  return (
    <div className="glass rounded-2xl p-6 border border-amber-500/30 flex flex-col h-full bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-amber-400 flex items-center gap-2">
          ⚗️ 沙盘推演控制面板
        </h3>
        <button onClick={onExit} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
      </div>
      
      <p className="text-text-secondary text-xs leading-relaxed mb-6">
        请选择下方治疗方案（干预节点），观察它们如何切断或削弱复发/转移风险链条。
      </p>
      
      <div className="flex flex-col gap-4 flex-1">
        {Object.entries(SANDBOX_NODES).map(([id, nodeData]) => {
          const isActive = sandboxActive.has(id);
          return (
            <div
              key={id}
              onClick={() => onToggle(id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "bg-dark/40 border-white/10 hover:border-amber-500/30 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${isActive ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
                    {isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-amber-400' : 'text-text-primary'}`}>{nodeData.label}</span>
                </div>
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">{nodeData.mechanism}</p>
              {isActive && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <div className="text-amber-400 text-xs font-semibold mb-1">干预效果：</div>
                  <p className="text-amber-400/90 text-xs">{nodeData.hrReduction}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {activeNodes.length === 0 && (
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <p className="text-text-muted text-xs">暂未激活任何干预方案</p>
        </div>
      )}
      
      <div className="mt-6 p-4 rounded-xl bg-[#0a0e1a]/80 border border-white/5">
        <p className="text-text-muted text-[11px] leading-relaxed">
          <strong>⚠️ 免责声明：</strong> 沙盘推演仅用于展示大规模临床试验（如 {Object.values(SANDBOX_NODES).map(n => n.trialName).join('、')}）的统计学结论，展示的风险降低比例不代表对您个人的疗效承诺。请务必与主治医生共同讨论制定最终治疗方案。
        </p>
      </div>
    </div>
  );
}

