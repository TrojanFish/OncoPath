import type { KnowledgeNode, EdgeEvidence } from './knowledgeGraphData';

export const DEFAULT_GRAPH_NODES: KnowledgeNode[] = [
  {
    id: "STAS",
    label: "气道播散\nSTAS",
    type: "factor",
    x: 18,
    y: 28,
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
    id: "CTR",
    label: "实性成分\nCTR",
    type: "factor",
    x: 18,
    y: 65,
    connections: ["STAGING", "SURGERY", "RECURRENCE"],
    connectionTypes: {
      STAGING: "guides",
      SURGERY: "guides",
      RECURRENCE: "risk"
    },
    studies: 22,
    evidence: 5,
    description: "实性成分比例（Consolidation-to-Tumor Ratio）。CTR ≤ 0.5 提示惰性微浸润（JCOG0804 5年无复发率 99.7%），CTR > 0.5 侵袭性升高。"
  },
  {
    id: "IASLC",
    label: "病理分级\nIASLC",
    type: "factor",
    x: 42,
    y: 18,
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
    x: 42,
    y: 50,
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
    x: 42,
    y: 82,
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
    x: 68,
    y: 18,
    connections: ["TARGETED", "ADJUVANT"],
    connectionTypes: {
      TARGETED: "guides",
      ADJUVANT: "guides"
    },
    studies: 28,
    evidence: 5,
    description: "表皮生长因子受体突变（19del / L858R）：亚裔非吸烟肺腺癌占比高达 50%+，为第三代 EGFR-TKI 靶向治疗的核心获益靶点。"
  },
  {
    id: "STAGING",
    label: "TNM 分期\n系统 (AJCC 8th)",
    type: "guideline",
    x: 42,
    y: 66,
    connections: ["SURGERY", "ADJUVANT"],
    connectionTypes: {
      SURGERY: "guides",
      ADJUVANT: "guides"
    },
    studies: 35,
    evidence: 5,
    description: "AJCC / UICC 第 8/9 版国际肺癌分期指南：基于解剖肿瘤大小 (T)、淋巴结侵犯 (N) 及远处转移 (M) 确立基础预后分层。"
  },
  {
    id: "SURGERY",
    label: "手术术式\n决策 (肺叶/肺段)",
    type: "guideline",
    x: 18,
    y: 85,
    connections: ["RECURRENCE"],
    connectionTypes: {
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
    x: 82,
    y: 38,
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
    label: "辅助化疗\n/ 全身治疗",
    type: "guideline",
    x: 68,
    y: 58,
    connections: ["RECURRENCE", "METASTASIS"],
    connectionTypes: {
      RECURRENCE: "protective",
      METASTASIS: "protective"
    },
    studies: 26,
    evidence: 5,
    description: "含铂双药辅助化疗：针对 II-IIIA 期或伴有高危病理因素 (IASLC Grade 3 / VPI+) 患者杀灭循环残余微转移，提高 5 年总生存率。"
  },
  {
    id: "RECURRENCE",
    label: "术后复发\n/ 局部进展",
    type: "outcome",
    x: 75,
    y: 88,
    connections: [],
    studies: 40,
    evidence: 5,
    description: "临床结局节点：局部断端复发、同侧肺门/纵隔淋巴结转移或胸膜播散，需根据危险分层制定严密随访时间表。"
  },
  {
    id: "METASTASIS",
    label: "远处微转移\n(脑/骨/肾上腺)",
    type: "outcome",
    x: 90,
    y: 72,
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
  }
};
