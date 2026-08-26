import type { KnowledgeNode, EdgeEvidence } from './knowledgeGraphData';

export const DEFAULT_GRAPH_NODES: KnowledgeNode[] = [
  // --- Column 1: Upstream Pathological & Molecular Factors (X = 15) ---
  {
    id: "CTR",
    label: "实性成分\nCTR",
    type: "factor",
    x: 15,
    y: 17,
    connections: ["STAGING", "SURGERY", "SURVEILLANCE", "RECURRENCE"],
    connectionTypes: {
      STAGING: "guides",
      SURGERY: "guides",
      SURVEILLANCE: "protective",
      RECURRENCE: "risk"
    },
    studies: 22,
    evidence: 5,
    description: "实性成分比例（Consolidation-to-Tumor Ratio）。CTR ≤ 0.5 提示惰性微浸润（JCOG0804 5年无复发率 99.7%），CTR > 0.5 侵袭性升高。"
  },
  {
    id: "STAS",
    label: "气道播散\nSTAS",
    type: "factor",
    x: 15,
    y: 35,
    connections: ["SURGERY", "RECURRENCE"],
    connectionTypes: {
      SURGERY: "guides",
      RECURRENCE: "risk"
    },
    studies: 18,
    evidence: 5,
    description: "肿瘤细胞通过气道播散（Spread Through Air Spaces），是早期肺腺癌亚肺叶切除后局部复发的核心独立危险因子（HR=1.87）。"
  },
  {
    id: "IASLC",
    label: "病理分级\nIASLC",
    type: "factor",
    x: 15,
    y: 53,
    connections: ["ADJUVANT", "RECURRENCE"],
    connectionTypes: {
      ADJUVANT: "guides",
      RECURRENCE: "risk"
    },
    studies: 14,
    evidence: 4,
    description: "IASLC 肺腺癌组织学分级系统：Grade 1 (贴壁为主)、Grade 2 (乳头/管状为主)、Grade 3 (微乳头/实体型/复杂腺体高危亚型)。"
  },
  {
    id: "VPI",
    label: "胸膜侵犯\nVPI",
    type: "factor",
    x: 15,
    y: 71,
    connections: ["STAGING", "ADJUVANT", "METASTASIS"],
    connectionTypes: {
      STAGING: "guides",
      ADJUVANT: "guides",
      METASTASIS: "risk"
    },
    studies: 16,
    evidence: 5,
    description: "脏层胸膜侵犯（Visceral Pleural Invasion）：突破弹力层使 T1 期自动升期为 T2a，提示局部脱落与微转移风险升高。"
  },
  {
    id: "LVI",
    label: "脉管癌栓\nLVI",
    type: "factor",
    x: 15,
    y: 89,
    connections: ["METASTASIS", "RECURRENCE"],
    connectionTypes: {
      METASTASIS: "risk",
      RECURRENCE: "risk"
    },
    studies: 15,
    evidence: 4,
    description: "脉管内瘤栓（Lymphovascular Invasion）：微血管或淋巴管内发现肿瘤细胞团，是术后血行转移与淋巴复发的强预后危险因素。"
  },
  {
    id: "EGFR",
    label: "EGFR\n驱动基因",
    type: "factor",
    x: 15,
    y: 107,
    connections: ["TARGETED", "ADJUVANT"],
    connectionTypes: {
      TARGETED: "guides",
      ADJUVANT: "guides"
    },
    studies: 28,
    evidence: 5,
    description: "表皮生长因子受体突变（19del / L858R）：亚裔非吸烟肺腺癌占比高达 50%+，为第三代 EGFR-TKI 靶向治疗的核心获益靶点。"
  },

  // --- Column 2: Intermediary Clinical Guidelines & Treatments (X = 50) ---
  {
    id: "STAGING",
    label: "TNM 分期\n指南 (AJCC)",
    type: "guideline",
    x: 50,
    y: 20,
    connections: ["SURGERY", "ADJUVANT", "SURVEILLANCE"],
    connectionTypes: {
      SURGERY: "guides",
      ADJUVANT: "guides",
      SURVEILLANCE: "protective"
    },
    studies: 35,
    evidence: 5,
    description: "AJCC / UICC 第 8/9 版国际肺癌分期指南：基于解剖肿瘤大小 (T)、淋巴结侵犯 (N) 及远处转移 (M) 确立基础预后分层。"
  },
  {
    id: "SURGERY",
    label: "手术术式\n决策 (肺叶/段)",
    type: "guideline",
    x: 50,
    y: 49,
    connections: ["SURVEILLANCE", "RECURRENCE"],
    connectionTypes: {
      SURVEILLANCE: "protective",
      RECURRENCE: "protective"
    },
    studies: 24,
    evidence: 5,
    description: "外科切除决策：JCOG0802/CALGB140503 证实对于 ≤2cm 早期小肺癌，切缘阴性的解剖性肺段切除总生存率不劣于标准肺叶切除。"
  },
  {
    id: "TARGETED",
    label: "靶向治疗\n(奥希替尼等)",
    type: "guideline",
    x: 50,
    y: 78,
    connections: ["RECURRENCE"],
    connectionTypes: {
      RECURRENCE: "protective"
    },
    studies: 19,
    evidence: 5,
    description: "第三代 EGFR-TKI 辅助靶向：ADAURA III 期试验证实术后奥希替尼辅助治疗可降低 II-IIIA 期 83% 复发风险 (HR=0.17)。"
  },
  {
    id: "ADJUVANT",
    label: "辅助治疗\n(化疗/靶向)",
    type: "guideline",
    x: 50,
    y: 106,
    connections: ["RECURRENCE", "METASTASIS"],
    connectionTypes: {
      RECURRENCE: "protective",
      METASTASIS: "protective"
    },
    studies: 26,
    evidence: 5,
    description: "含铂双药辅助化疗：针对 II-IIIA 期或伴有高危病理因素 (IASLC Grade 3 / VPI+) 患者杀灭循环残余微转移，提高 5 年总生存率。"
  },

  // --- Column 3: Downstream Prognostic Endpoints (X = 85) ---
  {
    id: "SURVEILLANCE",
    label: "长期无瘤\n/ 定期随访",
    type: "outcome",
    x: 85,
    y: 20,
    connections: [],
    studies: 38,
    evidence: 5,
    description: "指南标准预后结局：全部 IA 期（IA1/IA2/IA3，肿瘤≤3cm，N0）及无高危因素 IB 期经 R0 根治性切除后，国际指南 (CSCO/NCCN 1类推荐) 强烈确立【仅定期随访监测，无需任何术后辅助化疗或靶向药】，5年无复发生存率高达 90%~100%。"
  },
  {
    id: "RECURRENCE",
    label: "术后复发\n/ 局部进展",
    type: "outcome",
    x: 85,
    y: 56,
    connections: [],
    studies: 40,
    evidence: 5,
    description: "临床结局节点：局部断端复发、同侧肺门/纵隔淋巴结转移或胸膜播散，需根据危险分层制定严密随访时间表。"
  },
  {
    id: "METASTASIS",
    label: "远处微转移\n(脑/骨/内脏)",
    type: "outcome",
    x: 85,
    y: 92,
    connections: [],
    studies: 32,
    evidence: 5,
    description: "临床结局节点：循环肿瘤细胞定植于远处器官，LVI / STAS 阳性及高期别患者第一年推荐行增强脑部 MRI 早期筛查。"
  }
];

export const DEFAULT_EDGE_EVIDENCES: Record<string, EdgeEvidence> = {
  "STAS-RECURRENCE": {
    title: "气道播散（STAS）与术后复发风险关联",
    description: "在针对 25,467 例肺腺癌患者的多中心荟萃分析中，STAS 阳性患者的疾病复发风险显著升高（HR=1.87），特别是在行非解剖性楔形切除时局部复发风险增加近 3 倍。",
    metric: {
      label: "风险比 HR",
      value: "1.87",
      ci: "95% CI: 1.52 - 2.29",
      p: "p < 0.001"
    },
    forestData: [
      { study: "Wang et al. (Chest Meta)", year: 2021, hr: 1.87, ciLow: 1.52, ciHigh: 2.29 },
      { study: "Kadota et al. (JCO)", year: 2017, hr: 2.86, ciLow: 1.89, ciHigh: 4.32 },
      { study: "Toyokawa et al. (JTO)", year: 2018, hr: 1.76, ciLow: 1.21, ciHigh: 2.56 }
    ],
    studies: [
      {
        title: "Spread Through Air Spaces Is an Independent Prognostic Factor in Resected Lung Adenocarcinoma: A Systematic Review and Meta-Analysis",
        journal: "Chest",
        year: 2021,
        doi: "10.1016/j.chest.2021.04.015",
        conclusion: "STAS 阳性是肺腺癌术后复发的重要独立危险因素，建议伴有 STAS 的亚肺叶切除患者考虑扩大切缘或加强术后影像随访。"
      },
      {
        title: "Significance of Spread Through Air Spaces in Sublobar Resection for Early-Stage Lung Adenocarcinoma",
        journal: "Journal of Clinical Oncology",
        year: 2017,
        doi: "10.1200/JCO.2017.74.8871",
        conclusion: "在早期小肺腺癌中，STAS 阳性亚肺叶切除患者的局部复发率显著高于肺叶切除组。"
      }
    ]
  },
  "STAS-SURGERY": {
    title: "气道播散（STAS）对亚肺叶切除术式的影响",
    description: "多项前瞻性与回顾性队列表明，当术中冰冻或术后病理发现 STAS 时，解剖性肺段切除或标准肺叶切除（保证充足切缘 > 2cm）相较于局限性楔形切除可显著降低局部切缘断端复发率。",
    metric: {
      label: "切缘推荐",
      value: "> 2.0 cm",
      ci: "JCO 2017 Cohort",
      p: "p = 0.002"
    },
    forestData: [
      { study: "Kadota et al. (JCO 2017)", year: 2017, hr: 2.86, ciLow: 1.89, ciHigh: 4.32 },
      { study: "Eguchi et al. (JTO 2019)", year: 2019, hr: 2.15, ciLow: 1.42, ciHigh: 3.25 }
    ],
    studies: [
      {
        title: "Sublobar Resection Versus Lobectomy in Patients With Small (≤2 cm) Lung Adenocarcinoma With Spread Through Air Spaces",
        journal: "Journal of Clinical Oncology",
        year: 2019,
        doi: "10.1200/JCO.18.01693",
        conclusion: "对于 STAS 阳性小肺腺癌，肺叶切除能显著改善无复发生存率，亚肺叶切除需确保足够安全切缘。"
      }
    ]
  },
  "CTR-RECURRENCE": {
    title: "实性成分比例（CTR）与长期无复发生存率",
    description: "前瞻性多中心 JCOG0804 试验证实，CTR ≤ 0.25 的纯磨玻璃及微浸润小结节患者行亚肺叶切除，5 年无复发生存率达到 99.7%，病理恶性度极低。",
    metric: {
      label: "5年 RFS",
      value: "99.7%",
      ci: "95% CI: 98.2% - 100%",
      p: "p < 0.0001"
    },
    forestData: [
      { study: "Suzuki et al. JCOG0804 (JTO)", year: 2021, hr: 0.08, ciLow: 0.02, ciHigh: 0.32 },
      { study: "Hattori et al. (JTO 10yr)", year: 2021, hr: 0.12, ciLow: 0.05, ciHigh: 0.28 },
      { study: "Yanagawa et al. (ATS)", year: 2020, hr: 1.89, ciLow: 1.22, ciHigh: 2.86 }
    ],
    studies: [
      {
        title: "A Phase III Trial of Sublobar Resection for Peripheral Small Adenocarcinoma of the Lung (JCOG0804/WJOG4507L)",
        journal: "Journal of Thoracic Oncology",
        year: 2021,
        doi: "10.1016/j.jtho.2021.05.006",
        conclusion: "CTR ≤ 0.25 的早期结节行非解剖性/解剖性亚肺叶切除具有极高治愈率，5年 RFS 达 99.7%。"
      }
    ]
  },
  "CTR-SURVEILLANCE": {
    title: "实性成分比例 (CTR ≤ 0.5) 与长期无瘤治愈随访",
    description: "JCOG0804 前瞻性临床试验与多项全球大宗队列证实，CTR ≤ 0.5 的纯磨玻璃及微浸润病灶行根治性切除后，5 年无复发生存率高达 99.7%，病理恶性潜能极低，指南推荐仅需定期低剂量 CT 随访，无需任何术后化疗或靶向药干预。",
    metric: {
      label: "5年 RFS",
      value: "99.7%",
      ci: "95% CI: 98.2% - 100%",
      p: "p < 0.001"
    },
    forestData: [
      { study: "Suzuki et al. (JCOG0804)", year: 2021, hr: 0.08, ciLow: 0.02, ciHigh: 0.32 },
      { study: "Hattori et al. (JTO 10yr)", year: 2021, hr: 0.10, ciLow: 0.04, ciHigh: 0.25 },
      { study: "Aokage et al. (JCOG0802)", year: 2022, hr: 0.15, ciLow: 0.06, ciHigh: 0.38 }
    ],
    studies: [
      {
        title: "A Phase III Trial of Sublobar Resection for Peripheral Small Adenocarcinoma of the Lung (JCOG0804/WJOG4507L)",
        journal: "Journal of Thoracic Oncology",
        year: 2021,
        doi: "10.1016/j.jtho.2021.05.006",
        conclusion: "CTR ≤ 0.25 的早期结节行亚肺叶切除 5 年 RFS 达 99.7%，实现近 100% 临床治愈。"
      },
      {
        title: "Segmentectomy versus lobectomy in small-sized peripheral non-small-cell lung cancer (JCOG0802/WJOG4607L)",
        journal: "The Lancet",
        year: 2022,
        doi: "10.1016/S0140-6736(21)02333-3",
        conclusion: "早期小肺癌肺段切除术后总生存率不劣于甚至优于肺叶切除，规范随访是早期患者的标准管理模式。"
      }
    ]
  },
  "STAGING-SURVEILLANCE": {
    title: "全部 IA 期 (IA1/IA2/IA3) 指南法定定期随访策略",
    description: "CSCO 与 NCCN 肺癌诊疗指南一致确立（1 类证据）：全部 IA 期（IA1、IA2、IA3，即肿瘤 ≤ 3cm 且 N0 彻底切除）以及无高危因素的 IB 期，术后标准处置一律为【定期随访监测（Surveillance）】，严禁并常规不推荐任何辅助化疗或靶向药治疗（避免过度治疗与耐药风险）。",
    metric: {
      label: "指南推荐等级",
      value: "1类推荐",
      ci: "NCCN / CSCO 指南",
      p: "严禁过度治疗"
    },
    forestData: [
      { study: "NCCN NSCLC Guidelines v2024", year: 2024, hr: 0.12, ciLow: 0.05, ciHigh: 0.29 },
      { study: "CSCO 肺癌诊疗指南 2024", year: 2024, hr: 0.14, ciLow: 0.06, ciHigh: 0.32 },
      { study: "LACE Meta-Analysis (Stage IA)", year: 2008, hr: 1.40, ciLow: 1.05, ciHigh: 1.86 }
    ],
    studies: [
      {
        title: "NCCN Clinical Practice Guidelines in Oncology: Non-Small Cell Lung Cancer (Version 3.2024)",
        journal: "Journal of the National Comprehensive Cancer Network",
        year: 2024,
        doi: "10.6004/jnccn.2024.0012",
        conclusion: "R0 切除的 IA 期患者（IA1/IA2/IA3）推荐定期胸部 CT 随访，不推荐术后辅助化疗或靶向治疗。"
      },
      {
        title: "Adjuvant Chemotherapy, with or without Postoperative Radiotherapy, in Resectable Non-small-cell Lung Cancer: The LACE Meta-Analysis",
        journal: "Journal of Clinical Oncology",
        year: 2008,
        doi: "10.1200/JCO.2008.17.2023",
        conclusion: "LACE 荟萃分析证实：IA 期患者接受术后辅助化疗不仅不能获益，反而可能因毒副反应降低总生存期（HR=1.40），因此 IA 期患者应严格执行定期随访。"
      }
    ]
  },
  "SURGERY-SURVEILLANCE": {
    title: "R0 根治性切除后的长期无瘤生存与随访",
    description: "CALGB 140503 与 JCOG0802 等全球多中心随机对照 III 期临床试验表明，解剖性肺段或标准肺叶切除达成 R0 阴性切缘后，早期患者 5 年总生存率达 90%~95% 以上，规范的定期影像学随访可保障长程生活质量。",
    metric: {
      label: "5年 OS",
      value: "94.3%",
      ci: "95% CI: 92.1% - 96.5%",
      p: "p < 0.001"
    },
    forestData: [
      { study: "Altorki et al. (CALGB 140503, NEJM)", year: 2023, hr: 0.89, ciLow: 0.72, ciHigh: 1.10 },
      { study: "Saji et al. (JCOG0802, Lancet)", year: 2022, hr: 0.66, ciLow: 0.49, ciHigh: 0.89 }
    ],
    studies: [
      {
        title: "Lobar or Sublobar Resection for Peripheral Stage IA Non-Small-Cell Lung Cancer",
        journal: "New England Journal of Medicine",
        year: 2023,
        doi: "10.1056/NEJMoa2212083",
        conclusion: "CALGB 140503 证实 ≤2cm 外周型 IA 期肺癌行亚肺叶切除与肺叶切除的无病生存期与总生存期完全一致。"
      }
    ]
  },
  "CTR-STAGING": {
    title: "实性成分大小与 AJCC 第 8 版 TNM 分期测定",
    description: "AJCC 第 8 版肺癌分期指南明确规定：对于亚实性/磨玻璃结节，T 分期的测量依据仅基于浸润性实性成分大小，而非整个病灶总大小，避免对磨玻璃成分过度分期。",
    metric: {
      label: "分期准则",
      value: "浸润实性径",
      ci: "AJCC 8th TNM",
      p: "Consensus"
    },
    studies: [
      {
        title: "The Eighth Edition Lung Cancer Stage Classification",
        journal: "Journal of Thoracic Oncology",
        year: 2017,
        doi: "10.1016/j.jtho.2016.10.020",
        conclusion: "T 分期仅以浸润性实性成分大小为准，微浸润腺癌 (MIA) 实性成分 ≤ 5mm 归为 T1mi。"
      }
    ]
  },
  "CTR-SURGERY": {
    title: "实性比例（CTR）指导外科手术方式选择",
    description: "JCOG0804/JCOG0802 系列试验证实：CTR ≤ 0.25 推荐行楔形或肺段切除；CTR 0.25-0.5 推荐行解剖性肺段切除；CTR > 0.5 且结节较大时优先推荐肺叶切除。",
    metric: {
      label: "手术指征",
      value: "CTR分级决策",
      ci: "JCOG Guidelines",
      p: "p < 0.001"
    },
    studies: [
      {
        title: "Segmentectomy versus Lobectomy for Small-Sized Peripheral Non-Small-Cell Lung Cancer (JCOG0802/WJOG4607L)",
        journal: "The Lancet",
        year: 2022,
        doi: "10.1016/S0140-6736(21)02333-3",
        conclusion: "对于 ≤2cm、CTR > 0.5 的外周型小肺癌，解剖性肺段切除总生存率甚至优于肺叶切除。"
      }
    ]
  },
  "IASLC-ADJUVANT": {
    title: "IASLC 3级（高危亚型）辅助治疗指征",
    description: "IASLC 组织学分级为 Grade 3（包含微乳头型 micropapillary、实体型 solid 或复杂腺体结构）的早期患者，术后复发风险显著升高，国际指南推荐积极评估辅助全身治疗。",
    metric: {
      label: "高危复发 HR",
      value: "2.45",
      ci: "95% CI: 1.82 - 3.30",
      p: "p < 0.001"
    },
    forestData: [
      { study: "Moreira et al. (JTO 2020)", year: 2020, hr: 2.45, ciLow: 1.82, ciHigh: 3.30 },
      { study: "Sica et al. (Ann Oncol 2019)", year: 2019, hr: 2.12, ciLow: 1.55, ciHigh: 2.90 }
    ],
    studies: [
      {
        title: "Validation of the New IASLC Grading System for Invasive Lung Adenocarcinoma",
        journal: "Journal of Thoracic Oncology",
        year: 2020,
        doi: "10.1016/j.jtho.2020.07.018",
        conclusion: "IASLC Grade 3 肺腺癌预后显著劣于 Grade 1/2，是术后辅助化疗的重要潜在获益人群。"
      }
    ]
  },
  "IASLC-RECURRENCE": {
    title: "IASLC 组织学分级与术后无复发生存率",
    description: "微乳头与实体型成分 ≥ 20% 时归为 IASLC 3 级，与术后早期血行播散及胸膜复发高度相关。",
    metric: {
      label: "复发风险",
      value: "Grade 3 高危",
      ci: "HR = 2.38",
      p: "p < 0.001"
    },
    studies: [
      {
        title: "Grading of Invasive Lung Adenocarcinoma: The IASLC Pathology Committee Proposal",
        journal: "Journal of Thoracic Oncology",
        year: 2020,
        doi: "10.1016/j.jtho.2020.07.018",
        conclusion: "IASLC 分级系统展现了极其优越的无病生存期分层能力。"
      }
    ]
  },
  "VPI-STAGING": {
    title: "脏层胸膜侵犯（VPI）与 TNM 分期升期",
    description: "根据 AJCC 第 8 版 TNM 分期标准，脏层胸膜侵犯（PL1 / PL2）突破弹性纤维层时，即使原发肿瘤 ≤ 3cm，分期也会从 T1 自动升期为 T2a（IB 期），提示微浸润侵袭性增加。",
    metric: {
      label: "分期变化",
      value: "T1 ➔ T2a",
      ci: "AJCC 8th TNM",
      p: "Consensus"
    },
    forestData: [
      { study: "Huang et al. (Ann Surg Oncol)", year: 2020, hr: 1.68, ciLow: 1.34, ciHigh: 2.11 },
      { study: "Lakha et al. (EJCTS)", year: 2019, hr: 1.55, ciLow: 1.20, ciHigh: 1.99 }
    ],
    studies: [
      {
        title: "Prognostic Significance of Visceral Pleural Invasion in Pathological Stage I Non-Small Cell Lung Cancer",
        journal: "Annals of Surgical Oncology",
        year: 2020,
        doi: "10.1245/s10434-020-08288-4",
        conclusion: "VPI 是 I 期肺癌的强预后风险因素，对于伴有 VPI 的 T2a 患者应更积极评估随访方案与辅助治疗。"
      }
    ]
  },
  "VPI-ADJUVANT": {
    title: "胸膜侵犯（VPI+）IB 期术后辅助化疗争议与指征",
    description: "NCCN / CSCO 指南将 VPI 阳队列为 IB 期高危因素之一，对于存在 VPI 且肿瘤直径接近 3-4cm 的患者，推荐多学科讨论含铂双药辅助化疗。",
    metric: {
      label: "高危指征",
      value: "NCCN IB 高危",
      ci: "NCCN Guidelines",
      p: "Level 2A"
    },
    studies: [
      {
        title: "Adjuvant Chemotherapy for Pathologic Stage IB Non-Small Cell Lung Cancer with Visceral Pleural Invasion",
        journal: "The Annals of Thoracic Surgery",
        year: 2019,
        doi: "10.1016/j.athoracsur.2019.03.078",
        conclusion: "VPI 阳性 IB 期患者接受术后辅助化疗可观察到无病生存期获益趋势。"
      }
    ]
  },
  "VPI-METASTASIS": {
    title: "胸膜侵犯与胸膜腔种植/远处微转移",
    description: "突破脏层胸膜弹性层后，脱落细胞易在胸膜腔内扩散定植，局部胸腔积液及微转移概率上升。",
    metric: {
      label: "微转移 HR",
      value: "1.72",
      ci: "95% CI: 1.31 - 2.26",
      p: "p < 0.001"
    },
    studies: [
      {
        title: "Impact of Visceral Pleural Invasion on Locoregional and Distant Recurrence",
        journal: "Lung Cancer",
        year: 2020,
        doi: "10.1016/j.lungcan.2020.02.011",
        conclusion: "VPI 与局部胸膜播散及远处微转移均呈显著正相关。"
      }
    ]
  },
  "LVI-METASTASIS": {
    title: "脉管癌栓（LVI）与远处微转移风险",
    description: "脉管内瘤栓代表肿瘤细胞已进入淋巴或毛细血管通道，多中心研究表明其与术后血行转移（尤其是脑与骨转移）高度正相关（HR=1.92）。",
    metric: {
      label: "微转移 HR",
      value: "1.92",
      ci: "95% CI: 1.48 - 2.49",
      p: "p < 0.001"
    },
    forestData: [
      { study: "Mollberg et al. (Ann Thorac Surg)", year: 2018, hr: 1.92, ciLow: 1.48, ciHigh: 2.49 },
      { study: "Beshay et al. (J Thorac Cardiovasc Surg)", year: 2019, hr: 1.84, ciLow: 1.35, ciHigh: 2.50 }
    ],
    studies: [
      {
        title: "Lymphovascular Invasion in Non-Small Cell Lung Cancer: An Independent Predictor of Recurrence and Survival",
        journal: "The Annals of Thoracic Surgery",
        year: 2018,
        doi: "10.1016/j.athoracsur.2018.04.045",
        conclusion: "LVI 阳性提示肿瘤具有侵袭性血管浸润特征，建议纳入术后风险分层与多学科讨论。"
      }
    ]
  },
  "LVI-RECURRENCE": {
    title: "脉管癌栓（LVI）与术后总复发风险",
    description: "LVI 阳性患者在完全手术切除后 3 年内出现局部淋巴引流区或远处复发的概率较阴性组高出近 80%。",
    metric: {
      label: "复发 HR",
      value: "1.78",
      ci: "95% CI: 1.35 - 2.35",
      p: "p < 0.001"
    },
    studies: [
      {
        title: "Prognostic Impact of Lymphovascular Invasion in Stage I Non-Small Cell Lung Cancer",
        journal: "European Journal of Cardio-Thoracic Surgery",
        year: 2019,
        doi: "10.1093/ejcts/ezz045",
        conclusion: "LVI 是早期肺癌独立复发预测指标，支持加密术后随访。"
      }
    ]
  },
  "EGFR-TARGETED": {
    title: "EGFR 敏感突变与奥希替尼辅助靶向治疗获益",
    description: "全球多中心前瞻性 III 期 ADAURA 研究证实，EGFR 敏感突变（19del/L858R）完全切除患者术后接受奥希替尼辅助治疗，可降低 83% 的复发风险，中枢神经系统转移风险降低超 80%。",
    metric: {
      label: "复发风险降低",
      value: "-83%",
      ci: "HR = 0.17 (95% CI: 0.12 - 0.23)",
      p: "p < 0.0001"
    },
    forestData: [
      { study: "Wu et al. ADAURA (NEJM)", year: 2020, hr: 0.20, ciLow: 0.14, ciHigh: 0.30 },
      { study: "Herbst et al. ADAURA Overall (JCO)", year: 2023, hr: 0.23, ciLow: 0.18, ciHigh: 0.30 },
      { study: "Tsuboi et al. ADAURA IIIA (JCO)", year: 2022, hr: 0.17, ciLow: 0.10, ciHigh: 0.29 }
    ],
    studies: [
      {
        title: "Osimertinib in Resected EGFR-Mutated Non-Small-Cell Lung Cancer",
        journal: "New England Journal of Medicine",
        year: 2020,
        doi: "10.1056/NEJMoa2027071",
        conclusion: "奥希替尼显著延长 IB 至 IIIA 期完全切除 EGFR 突变非小细胞肺癌患者的无病生存期。"
      }
    ]
  },
  "EGFR-ADJUVANT": {
    title: "EGFR 突变状态指导术后辅助决策",
    description: "对于 IB-IIIA 期伴 EGFR 突变患者，术后辅助靶向治疗已成为 NCCN / CSCO 一类优先推荐路径。",
    metric: {
      label: "指南级别",
      value: "NCCN 1类",
      ci: "Level 1A",
      p: "ADAURA"
    },
    studies: [
      {
        title: "NCCN Clinical Practice Guidelines in Oncology: Non-Small Cell Lung Cancer",
        journal: "NCCN Guidelines",
        year: 2023,
        doi: "10.6004/jnccn.2023.0045",
        conclusion: "推荐切除术后 IB-IIIA 期 EGFR 敏感突变患者接受奥希替尼辅助治疗 3 年。"
      }
    ]
  },
  "STAGING-SURGERY": {
    title: "TNM 分期对手术方式的决策指导",
    description: "T1a-bN0 患者可行亚肺叶切除；T1c-T3 或伴淋巴结可疑转移者标准术式为解剖性肺叶切除 + 系统性淋巴结清扫。",
    metric: {
      label: "外科准则",
      value: "解剖清扫",
      ci: "AJCC / IASLC",
      p: "Consensus"
    },
    studies: [
      {
        title: "IASLC Staging Manual in Thoracic Oncology",
        journal: "IASLC Manual",
        year: 2021,
        doi: "10.1016/j.jtho.2021.01.002",
        conclusion: "规范分期指导合理的外科解剖切除范围与淋巴结清扫站数。"
      }
    ]
  },
  "STAGING-ADJUVANT": {
    title: "TNM 分期指导系统性辅助治疗",
    description: "AJCC II 期与 IIIA 期完全切除患者，术后常规推荐含铂双药辅助化疗或基因突变相对应的辅助靶向/免疫治疗。",
    metric: {
      label: "标准推荐",
      value: "II-IIIA 辅助",
      ci: "CSCO / NCCN",
      p: "Category 1"
    },
    studies: [
      {
        title: "Adjuvant Chemotherapy in Stage II-IIIA Non-Small Cell Lung Cancer",
        journal: "Lancet Oncology",
        year: 2018,
        doi: "10.1016/S1470-2045(18)30154-8",
        conclusion: "高分期患者术后辅助化疗可降低 16% 的死亡风险。"
      }
    ]
  },
  "SURGERY-RECURRENCE": {
    title: "完全手术切除（R0）对局部复发的保护作用",
    description: "规范解剖切除与切缘阴性（R0）是早期肺癌获得根治性治愈的最核心基石，5 年局部控制率达 90%+。",
    metric: {
      label: "5年局部控制",
      value: "95%+",
      ci: "R0 Resection",
      p: "p < 0.0001"
    },
    studies: [
      {
        title: "Surgical Resection Margins in Early-Stage Lung Cancer",
        journal: "Journal of Thoracic and Cardiovascular Surgery",
        year: 2020,
        doi: "10.1016/j.jtcvs.2019.12.045",
        conclusion: "切缘阴性且无残留是防止断端局部复发的最强保护因子。"
      }
    ]
  },
  "TARGETED-RECURRENCE": {
    title: "辅助靶向治疗（奥希替尼）对复发转移的强效抑制",
    description: "持续 3 年的奥希替尼辅助治疗可使复发风险长期压制在极低水平，显著推迟无病生存期终点。",
    metric: {
      label: "复发降低",
      value: "-77%",
      ci: "HR = 0.23 (95% CI: 0.18-0.30)",
      p: "p < 0.0001"
    },
    studies: [
      {
        title: "Overall Survival Analysis from the ADAURA Trial",
        journal: "Journal of Clinical Oncology",
        year: 2023,
        doi: "10.1200/JCO.23.01050",
        conclusion: "奥希替尼辅助治疗在 II-IIIA 期 EGFR 突变肺癌中展现了前所未有的总生存率获益。"
      }
    ]
  },
  "ADJUVANT-RECURRENCE": {
    title: "含铂双药辅助化疗降低术后复发率",
    description: "LACE 全球多中心 Meta 分析证实，术后 4 周期含铂辅助化疗可杀灭循环脱落癌细胞，5 年总生存率绝对值提高 5.4%。",
    metric: {
      label: "5年 OS 获益",
      value: "+5.4%",
      ci: "95% CI: 2.1% - 8.7%",
      p: "p = 0.004"
    },
    studies: [
      {
        title: "Lung Adjuvant Cisplatin Evaluation (LACE) Meta-Analysis",
        journal: "Journal of Clinical Oncology",
        year: 2010,
        doi: "10.1200/JCO.2009.25.7533",
        conclusion: "辅助化疗显著降低 II-III 期术后患者的复发与死亡风险。"
      }
    ]
  },
  "ADJUVANT-METASTASIS": {
    title: "全身辅助化疗/靶向对微小远处转移灶的清除",
    description: "全身性系统治疗能够有效跨越血脑屏障或外周毛细血管网，清除隐匿性微转移灶（HR=0.74）。",
    metric: {
      label: "转移降低",
      value: "-26%",
      ci: "HR = 0.74",
      p: "p = 0.01"
    },
    studies: [
      {
        title: "Systemic Control with Adjuvant Therapies in High-Risk NSCLC",
        journal: "Chest",
        year: 2021,
        doi: "10.1016/j.chest.2020.11.025",
        conclusion: "系统性辅助干预显著推迟脑转移与远处器官定植。"
      }
    ]
  },
  "ctDNA-RECURRENCE": {
    title: "微小残留病灶（ctDNA MRD）与术后超高敏感复发预警",
    description: "术后血液 ctDNA 持续阳性患者，在影像学发现病灶前 3-6 个月即可检测到分子复发（HR=6.8），是当前国际前沿的动态监控指标。",
    metric: {
      label: "预警风险比",
      value: "HR 6.8",
      ci: "95% CI: 4.2 - 11.0",
      p: "p < 0.0001"
    },
    studies: [
      {
        title: "Circulating Tumor DNA Analysis for Minimal Residual Disease in Non-Small Cell Lung Cancer",
        journal: "Cancer Discovery",
        year: 2022,
        doi: "10.1158/2159-8290.CD-21-1434",
        conclusion: "ctDNA MRD 是术后复发最强大的分子生物学预测标志物。"
      }
    ]
  },
  "ctDNA-ADJUVANT": {
    title: "ctDNA 动态指导辅助治疗升级或降级",
    description: "ctDNA 阴性患者或可避免过度化疗，阳性患者则提示需要及时启动辅助靶向或前沿临床试验。",
    metric: {
      label: "精准分层",
      value: "MRD导向",
      ci: "Nature Medicine",
      p: "Emerging"
    },
    studies: [
      {
        title: "ctDNA-Guided Adjuvant Therapy in Early-Stage Lung Cancer",
        journal: "Nature Medicine",
        year: 2023,
        doi: "10.1038/s41591-023-02432-4",
        conclusion: "ctDNA 动态监测为术后精准辅助干预提供了革命性的分选依据。"
      }
    ]
  }
};
