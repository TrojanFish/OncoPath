/**
 * OncoPath Clinical Pharmacovigilance & Drug-Drug Interactions (DDI) Engine
 * Covers EGFR, ALK, KRAS, ROS1, MET targeted therapies vs common chronic drugs, OTC medicines, and foods.
 */

export interface TargetedDrug {
  id: string;
  genericName: string;
  brandName: string;
  generation: string;
  target: "EGFR" | "ALK" | "KRAS" | "ROS1" | "MET" | "RET";
  standardDosage: string;
  metabolismPathway: string;
  phDependent: boolean; // Is absorption reduced by elevated gastric pH (PPI/H2RA)
}

export interface ChronicDrug {
  id: string;
  name: string;
  aliases: string[];
  category: "gastric_acid" | "cardiovascular_lipid" | "anticoagulant" | "neuro_psychiatric" | "anti_infective" | "diet_supplements";
  categoryLabel: string;
  typicalUse: string;
}

export interface DdiRule {
  targetDrugIds: string[]; // Or '*' for all
  chronicDrugId: string;
  riskLevel: "severe_contraindication" | "timing_caution" | "compatible_safe";
  riskLabel: string;
  title: string;
  mechanism: string;
  clinicalGuidance: string;
  evidenceLevel: "FDA/NMPA说明书" | "权威前瞻临床研究" | "药代动力学PK证据";
  timingRecommendation?: string; // Specific time-staggering advice
}

export interface DdiAnalysisResult {
  targetedDrug: TargetedDrug | null;
  selectedChronicDrugs: ChronicDrug[];
  totalChecked: number;
  severeCount: number;
  cautionCount: number;
  safeCount: number;
  overallStatus: "danger" | "warning" | "safe";
  summaryText: string;
  interactions: Array<{
    chronicDrug: ChronicDrug;
    rule: DdiRule;
  }>;
  dailySchedulePlan: Array<{
    timeSlot: string;
    drugs: string[];
    note: string;
  }>;
}

// 1. Target Drugs Directory
export const TARGETED_DRUGS: TargetedDrug[] = [
  {
    id: "osimertinib",
    genericName: "甲磺酸奥希替尼片",
    brandName: "泰瑞沙 / Osimertinib",
    generation: "第三代 EGFR-TKI",
    target: "EGFR",
    standardDosage: "80mg 口服 每日一次 (QD)",
    metabolismPathway: "主要经肝脏 CYP3A4 / CYP3A5 酶代谢",
    phDependent: false, // Osimertinib is relatively less pH dependent compared to 1st gen, but antacids may cause chelation
  },
  {
    id: "aumolertinib",
    genericName: "甲磺酸阿美替尼片",
    brandName: "阿美乐 / Aumolertinib",
    generation: "第三代 EGFR-TKI",
    target: "EGFR",
    standardDosage: "110mg 口服 每日一次 (QD)",
    metabolismPathway: "主要经肝脏 CYP3A4 代谢",
    phDependent: false,
  },
  {
    id: "furmonertinib",
    genericName: "甲磺酸伏美替尼片",
    brandName: "艾弗沙 / Furmonertinib",
    generation: "第三代 EGFR-TKI (含20-ins)",
    target: "EGFR",
    standardDosage: "80mg 或 160mg 口服 每日一次 (QD)",
    metabolismPathway: "主要经肝脏 CYP3A4 代谢",
    phDependent: false,
  },
  {
    id: "gefitinib",
    genericName: "吉非替尼片",
    brandName: "易瑞沙 / Iressa",
    generation: "第一代 EGFR-TKI",
    target: "EGFR",
    standardDosage: "250mg 口服 每日一次 (QD)",
    metabolismPathway: "CYP3A4 与 CYP2D6 代谢",
    phDependent: true, // Severely pH dependent, PPI drops AUC by 40-50%
  },
  {
    id: "erlotinib",
    genericName: "盐酸厄洛替尼片",
    brandName: "特罗凯 / Tarceva",
    generation: "第一代 EGFR-TKI",
    target: "EGFR",
    standardDosage: "150mg 口服 每日一次 (QD)",
    metabolismPathway: "CYP3A4 与 CYP1A2 代谢",
    phDependent: true,
  },
  {
    id: "alectinib",
    genericName: "盐酸阿来替尼胶囊",
    brandName: "安圣莎 / Alecensa",
    generation: "第二代 ALK-TKI",
    target: "ALK",
    standardDosage: "600mg 口服 每日两次 (BID, 随餐)",
    metabolismPathway: "主要经肝脏 CYP3A4 酶代谢转化为活性代谢产物 M4",
    phDependent: false,
  },
  {
    id: "lorlatinib",
    genericName: "劳拉替尼片",
    brandName: "博瑞纳 / Lorviqua",
    generation: "第三代 ALK/ROS1-TKI",
    target: "ALK",
    standardDosage: "100mg 口服 每日一次 (QD)",
    metabolismPathway: "CYP3A4 与 UGT1A4 代谢，兼具 CYP3A4 中度自身诱导作用",
    phDependent: false,
  },
  {
    id: "sotorasib",
    genericName: "索托拉西布片",
    brandName: "Lumakras / Sotorasib",
    generation: "KRAS G12C 靶向抑制剂",
    target: "KRAS",
    standardDosage: "960mg 口服 每日一次 (QD)",
    metabolismPathway: "CYP3A4 及非酶解代谢",
    phDependent: true, // PPIs significantly reduce Sotorasib absorption
  },
  {
    id: "savolitinib",
    genericName: "赛沃替尼片",
    brandName: "沃瑞沙 / Orpathys",
    generation: "MET 外显子14跳跃突变抑制剂",
    target: "MET",
    standardDosage: "400mg 或 600mg 口服 每日一次 (QD)",
    metabolismPathway: "CYP3A4 与 CYP1A2 代谢",
    phDependent: true,
  }
];

export interface ChronicDrugCategory {
  id: string;
  title: string;
  drugs: ChronicDrug[];
}

// 2. Chronic & OTC Drugs Directory
export const CHRONIC_DRUG_CATEGORIES: ChronicDrugCategory[] = [
  {
    id: "gastric_acid",
    title: "消化系统 / 胃酸抑制剂与胃黏膜保护",
    drugs: [
      { id: "omeprazole", name: "奥美拉唑 (洛赛克)", aliases: ["奥美拉唑胶囊", "洛赛克"], category: "gastric_acid" as const, categoryLabel: "质子泵抑制剂 (PPI)", typicalUse: "胃溃疡、反流性食管炎、胃痛反酸" },
      { id: "rabeprazole", name: "雷贝拉唑 (波利特)", aliases: ["雷贝拉唑钠", "波利特"], category: "gastric_acid" as const, categoryLabel: "质子泵抑制剂 (PPI)", typicalUse: "胃酸过多、十二指肠溃疡" },
      { id: "esomeprazole", name: "埃索美拉唑 (耐信)", aliases: ["艾司奥美拉唑", "耐信"], category: "gastric_acid" as const, categoryLabel: "质子泵抑制剂 (PPI)", typicalUse: "反流性食管炎、胃酸抑制" },
      { id: "famotidine", name: "法莫替丁", aliases: ["高舒达", "信法丁"], category: "gastric_acid" as const, categoryLabel: "H2受体拮抗剂 (H2RA)", typicalUse: "夜间胃酸分泌过多、轻中度胃炎" },
      { id: "hydrotalcite", name: "铝碳酸镁 (达喜)", aliases: ["达喜", "铝碳酸镁咀嚼片"], category: "gastric_acid" as const, categoryLabel: "局部中和抗酸剂", typicalUse: "餐后胃灼热、饱胀不适、保护胃黏膜" },
      { id: "sucralfate", name: "硫糖铝混悬凝胶", aliases: ["硫糖铝", "胃溃宁"], category: "gastric_acid" as const, categoryLabel: "胃黏膜保护剂", typicalUse: "胃溃疡创面物理隔离与保护" },
    ]
  },
  {
    id: "cardiovascular_lipid",
    title: "心脑血管 / 降压药、他汀降脂药与抗心律失常",
    drugs: [
      { id: "amlodipine", name: "苯磺酸氨氯地平 (络活喜)", aliases: ["氨氯地平", "络活喜", "安内真"], category: "cardiovascular_lipid" as const, categoryLabel: "钙通道阻滞剂 (CCB)", typicalUse: "高血压、冠心病心绞痛" },
      { id: "nifedipine", name: "硝苯地平控释片 (拜新同)", aliases: ["硝苯地平", "拜新同"], category: "cardiovascular_lipid" as const, categoryLabel: "钙通道阻滞剂 (CCB)", typicalUse: "中重度原发性高血压" },
      { id: "valsartan", name: "缬沙坦 (代文)", aliases: ["代文", "缬沙坦胶囊"], category: "cardiovascular_lipid" as const, categoryLabel: "ARB 降压药", typicalUse: "原发性高血压、心衰合并高血压" },
      { id: "metoprolol", name: "酒石酸/琥珀酸美托洛尔 (倍他乐克)", aliases: ["倍他乐克", "美托洛尔缓释片"], category: "cardiovascular_lipid" as const, categoryLabel: "β受体阻滞剂", typicalUse: "高血压、快速心律失常、心肌梗死后" },
      { id: "atorvastatin", name: "阿托伐他汀钙 (立普妥)", aliases: ["立普妥", "阿托伐他汀"], category: "cardiovascular_lipid" as const, categoryLabel: "他汀类降脂药", typicalUse: "高胆固醇血症、冠心病动脉粥样硬化" },
      { id: "rosuvastatin", name: "瑞舒伐他汀钙 (可定)", aliases: ["可定", "瑞舒伐他汀"], category: "cardiovascular_lipid" as const, categoryLabel: "他汀类降脂药", typicalUse: "高脂血症、预防心脑血管事件" },
      { id: "simvastatin", name: "辛伐他汀 (舒降之)", aliases: ["舒降之", "辛伐他汀片"], category: "cardiovascular_lipid" as const, categoryLabel: "他汀类降脂药", typicalUse: "高胆固醇血症" },
      { id: "amiodarone", name: "盐酸胺碘酮 (可达龙)", aliases: ["可达龙", "胺碘酮"], category: "cardiovascular_lipid" as const, categoryLabel: "III类抗心律失常药", typicalUse: "房颤、室性心律失常" },
    ]
  },
  {
    id: "anticoagulant",
    title: "抗凝与抗血小板 / 预防血栓药物",
    drugs: [
      { id: "aspirin", name: "阿司匹林肠溶片 (拜阿司匹灵)", aliases: ["阿司匹林", "拜阿司匹灵"], category: "anticoagulant" as const, categoryLabel: "抗血小板聚集", typicalUse: "冠心病、支架术后、脑梗塞二级预防" },
      { id: "clopidogrel", name: "硫酸氢氯吡格雷 (波立维)", aliases: ["波立维", "氯吡格雷", "泰嘉"], category: "anticoagulant" as const, categoryLabel: "P2Y12受体拮抗剂", typicalUse: "支架植入术后抗血小板、动脉粥样硬化" },
      { id: "rivaroxaban", name: "利伐沙班 (拜瑞妥)", aliases: ["拜瑞妥", "利伐沙班片"], category: "anticoagulant" as const, categoryLabel: "新型口服抗凝药 (NOAC)", typicalUse: "下肢深静脉血栓(DVT)、房颤抗凝" },
      { id: "warfarin", name: "华法林钠片", aliases: ["华法林", "信谊华法林"], category: "anticoagulant" as const, categoryLabel: "维生素K拮抗剂", typicalUse: "心脏瓣膜置换术后、房颤抗凝" },
    ]
  },
  {
    id: "neuro_psychiatric",
    title: "神经系统 / 抗癫痫、镇静安眠与抗抑郁",
    drugs: [
      { id: "carbamazepine", name: "卡马西平 (得理多)", aliases: ["得理多", "卡马西平片"], category: "neuro_psychiatric" as const, categoryLabel: "强效 CYP3A4 诱导剂", typicalUse: "三叉神经痛、癫痫部分性发作" },
      { id: "phenytoin", name: "苯妥英钠", aliases: ["大仑丁", "苯妥英钠片"], category: "neuro_psychiatric" as const, categoryLabel: "强效 CYP3A4 诱导剂", typicalUse: "抗癫痫强直阵挛发作" },
      { id: "estazolam", name: "艾司唑仑 (舒乐安定)", aliases: ["舒乐安定", "艾司唑仑片"], category: "neuro_psychiatric" as const, categoryLabel: "苯二氮䓬类镇静催眠", typicalUse: "术前/随访期失眠焦虑、镇静" },
      { id: "sertraline", name: "盐酸舍曲林 (左洛复)", aliases: ["左洛复", "舍曲林"], category: "neuro_psychiatric" as const, categoryLabel: "SSRI 抗抑郁药", typicalUse: "肿瘤相关焦虑抑郁障碍" },
    ]
  },
  {
    id: "anti_infective",
    title: "抗感染 / 抗结核、抗真菌与抗生素",
    drugs: [
      { id: "rifampin", name: "利福平胶囊 (甲哌利福霉素)", aliases: ["利福平", "利福平注射液"], category: "anti_infective" as const, categoryLabel: "强效 CYP3A4 诱导剂 (抗结核)", typicalUse: "肺结核联合治疗、非结核分枝杆菌感染" },
      { id: "ketoconazole", name: "酮康唑 / 伊曲康唑", aliases: ["酮康唑", "伊曲康唑", "斯皮仁诺"], category: "anti_infective" as const, categoryLabel: "强效 CYP3A4 抑制剂 (抗真菌)", typicalUse: "肺曲霉菌感染、深部真菌感染" },
      { id: "clarithromycin", name: "克拉霉素 (利菌沙)", aliases: ["克拉霉素分散片", "利菌沙"], category: "anti_infective" as const, categoryLabel: "强效 CYP3A4 抑制剂 (大环内酯)", typicalUse: "幽门螺杆菌根除、呼吸道非典型感染" },
    ]
  },
  {
    id: "diet_supplements",
    title: "日常饮食、中药提取物与保健品",
    drugs: [
      { id: "grapefruit", name: "西柚 / 葡萄柚 (及其鲜榨果汁)", aliases: ["葡萄柚", "西柚汁", "西柚果肉"], category: "diet_supplements" as const, categoryLabel: "强效不可逆 CYP3A4 抑制剂", typicalUse: "日常水果、饮品" },
      { id: "st_johns_wort", name: "圣约翰草 (贯叶连翘 / 路优泰)", aliases: ["圣约翰草提取物", "贯叶连翘", "路优泰"], category: "diet_supplements" as const, categoryLabel: "强效 CYP3A4 诱导剂", typicalUse: "植物抗抑郁保健品、神经衰弱" },
      { id: "bicyclol", name: "双环醇片 (百赛诺)", aliases: ["双环醇", "百赛诺"], category: "diet_supplements" as const, categoryLabel: "保肝降酶中成药", typicalUse: "抗肿瘤药物相关转氨酶升高" },
      { id: "silymarin", name: "水飞蓟宾胶囊 (水林佳)", aliases: ["水林佳", "水飞蓟宾", "利加隆"], category: "diet_supplements" as const, categoryLabel: "保肝护肝制剂", typicalUse: "脂肪肝、药物性肝损伤辅助保护" },
    ]
  }
];

// Flat list for easy search
export const ALL_CHRONIC_DRUGS: ChronicDrug[] = CHRONIC_DRUG_CATEGORIES.flatMap(c => c.drugs);

// 3. Clinical Rules Matrix
export const DDI_RULES: DdiRule[] = [
  // ================= 绝对严重禁忌 (RED) =================
  {
    targetDrugIds: ["*"],
    chronicDrugId: "grapefruit",
    riskLevel: "severe_contraindication",
    riskLabel: "绝对禁忌 (严禁食用)",
    title: "西柚/葡萄柚抑制肠道 CYP3A4 导致靶向药毒性爆发",
    mechanism: "西柚中富含呋喃香豆素，能不可逆破坏小肠上皮细胞中的 CYP3A4 代谢酶。合用会使三代奥希替尼、阿来替尼等血药浓度暴增 3~5 倍，严重诱发致死性腹泻、皮疹、肝衰竭及心电图 QTc 极度延长。",
    clinicalGuidance: "在靶向治疗期间，必须绝对杜绝食用西柚、红心柚子、西柚汁及含塞维利亚苦橙成分的饮料和果酱。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "rifampin",
    riskLevel: "severe_contraindication",
    riskLabel: "绝对禁忌 (靶向药浓度骤降80%)",
    title: "利福平强效诱导 CYP3A4 导致靶向药完全失效",
    mechanism: "利福平是人体最强的 CYP3A4 代谢酶与 P-gp 转运体诱导剂。临床研究证实与奥希替尼合用时，奥希替尼的血药浓度曲线下面积 (AUC) 暴跌 82%，使抗癌药物完全无法达到治疗窗，导致肿瘤快速进展失控。",
    clinicalGuidance: "靶向治疗期间严禁联用利福平或利福布汀。如合并活动性结核需抗痨治疗，必须由呼吸科与肿瘤科专家多学科会诊调整方案（如选用异烟肼+乙胺丁醇+吡嗪酰胺等非强诱导剂组合）。",
    evidenceLevel: "权威前瞻临床研究"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "carbamazepine",
    riskLevel: "severe_contraindication",
    riskLabel: "严重禁忌 (显著降低药效)",
    title: "卡马西平 / 苯妥英钠强效诱导代谢降低靶向药浓度",
    mechanism: "强效 CYP3A4 酶诱导作用会使奥希替尼、阿来替尼在肝脏内被极速降解排出，血药浓度下降 60%~75%。",
    clinicalGuidance: "抗癫痫或治疗神经痛患者，强烈建议在神经内科医师指导下更换为对 CYP3A4 无诱导作用的新一代药物（如左乙拉西坦、加巴喷丁、普瑞巴林）。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "phenytoin",
    riskLevel: "severe_contraindication",
    riskLabel: "严重禁忌 (显著降低药效)",
    title: "苯妥英钠诱导肝药酶导致靶向药浓度显著不足",
    mechanism: "强效激活 CYP3A4，大幅加快靶向药物清除速率。",
    clinicalGuidance: "建议遵神经内科医嘱换用左乙拉西坦（开浦兰）或丙戊酸钠等非酶诱导型抗癫痫药物。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "st_johns_wort",
    riskLevel: "severe_contraindication",
    riskLabel: "绝对禁忌 (草本诱导剂)",
    title: "圣约翰草 (贯叶连翘) 植物诱导剂降低靶向药血药浓度",
    mechanism: "其所含金丝桃素是强效 CYP3A4 诱导剂，可使口服靶向药暴露量减半。",
    clinicalGuidance: "服用任何靶向药期间，严禁摄入含有圣约翰草（St. John's Wort / 贯叶连翘 / 路优泰）成分的保健品、安神茶或植物提取物。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["osimertinib", "lorlatinib", "crizotinib"],
    chronicDrugId: "amiodarone",
    riskLevel: "severe_contraindication",
    riskLabel: "严重预警 (双重 QTc 间期延长)",
    title: "胺碘酮与靶向药协同延长心电图 QTc 间期",
    mechanism: "奥希替尼与克唑替尼本身具有轻度心肌复极延迟作用（发生率约 2%~4%），与 III 类抗心律失常药胺碘酮合用，会显著放大尖端扭转型室速 (TdP) 及严重室性心律失常风险。",
    clinicalGuidance: "若必须合用，需在心内科与肿瘤科联合监护下进行，定期复查 12 导联心电图（监测 QTc 间期）及血清钾/镁离子水平。如 QTc > 500ms 需立即暂停靶向药。",
    evidenceLevel: "权威前瞻临床研究"
  },

  // ================= 需错峰服药 / 调整方案 (YELLOW) =================
  {
    targetDrugIds: ["gefitinib", "erlotinib", "sotorasib", "savolitinib"],
    chronicDrugId: "omeprazole",
    riskLevel: "timing_caution",
    riskLabel: "需调整用药 (pH吸收障碍)",
    title: "质子泵抑制剂 (PPI) 显著降低一代 EGFR/KRAS 靶向药吸收",
    mechanism: "一代吉非替尼、厄洛替尼及索托拉西布的溶解度高度依赖胃内酸性环境。奥美拉唑等 PPI 强效持久升高胃内 pH，导致靶向药吸收减少 40%~50%，AUC 严重下降。",
    clinicalGuidance: "推荐策略：1) 优先在消化科医师指导下停用 PPI，改用局部黏膜保护剂；2) 若必须抑酸，可换用法莫替丁，并必须在服用法莫替丁前 2 小时或后 10 小时服用靶向药；3) 若为第三代奥希替尼，受 PPI 影响较轻微，但仍建议错峰 2 小时服药。",
    evidenceLevel: "药代动力学PK证据",
    timingRecommendation: "靶向药空腹/餐后固定时段服用，胃药错开 2~4 小时后服用"
  },
  {
    targetDrugIds: ["gefitinib", "erlotinib", "sotorasib", "savolitinib"],
    chronicDrugId: "rabeprazole",
    riskLevel: "timing_caution",
    riskLabel: "需调整用药 (pH吸收障碍)",
    title: "雷贝拉唑升高胃内 pH 抑制靶向药溶出",
    mechanism: "胃内弱酸/中性环境导致靶向药物结晶析出，生物利用度受损。",
    clinicalGuidance: "避免长期大剂量联用，必要时换用法莫替丁错开时段服用。",
    evidenceLevel: "药代动力学PK证据",
    timingRecommendation: "早晨服靶向药，午后或睡前按需用法莫替丁替代"
  },
  {
    targetDrugIds: ["gefitinib", "erlotinib", "sotorasib", "savolitinib"],
    chronicDrugId: "esomeprazole",
    riskLevel: "timing_caution",
    riskLabel: "需调整用药 (pH吸收障碍)",
    title: "埃索美拉唑升高胃内 pH 影响靶向药暴露量",
    mechanism: "持久抑制胃酸分泌，降低 pH 依赖型抗癌药物的溶解度。",
    clinicalGuidance: "遵医嘱评估是否更换抑酸方案或改用中和性抗酸药错开 2 小时服用。",
    evidenceLevel: "药代动力学PK证据"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "hydrotalcite",
    riskLevel: "timing_caution",
    riskLabel: "需错峰 2 小时 (物理吸附螯合)",
    title: "铝碳酸镁 (达喜) 需与靶向药严格间隔 2 小时以上",
    mechanism: "铝碳酸镁在胃内具有网状晶体结构并能快速中和胃酸，易物理吸附螯合靶向药分子并阻碍其在肠道吸收。",
    clinicalGuidance: "【必须错峰服药】：靶向药服用前 2 小时内或服用后 2 小时内，严禁口服铝碳酸镁咀嚼片或硫糖铝凝胶。",
    evidenceLevel: "FDA/NMPA说明书",
    timingRecommendation: "必须错峰服用：如早晨 8:00 口服靶向药，达喜可在上午 10:30 或午餐后嚼服"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "sucralfate",
    riskLevel: "timing_caution",
    riskLabel: "需错峰 2 小时 (物理包裹阻碍)",
    title: "硫糖铝凝胶需与靶向药间隔 2 小时以上",
    mechanism: "硫糖铝在胃黏膜表面形成的糊状保护膜会阻碍靶向药物的胃黏膜穿透与吸收。",
    clinicalGuidance: "必须间隔 2 小时以上分别服用，不可同杯水吞服。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "ketoconazole",
    riskLevel: "timing_caution",
    riskLabel: "需警惕毒性 (靶向药浓度升高)",
    title: "酮康唑/伊曲康唑强效抑制 CYP3A4 增加靶向药毒性",
    mechanism: "抑制肝药酶代谢，使奥希替尼、阿来替尼在体内的清除减慢，AUC 上升约 1.5~2 倍，腹泻与皮疹发生率上升。",
    clinicalGuidance: "如必须抗真菌治疗，建议密切监测患者皮肤、肝肾功能与腹泻程度；必要时在医生指导下微调靶向药剂量或优先选用氟康唑等中弱度抑制剂。",
    evidenceLevel: "权威前瞻临床研究"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "clarithromycin",
    riskLevel: "timing_caution",
    riskLabel: "需警惕毒性 (靶向药暴露量增加)",
    title: "克拉霉素强效抑制 CYP3A4 酶",
    mechanism: "大环内酯类抗生素抑制 CYP3A4 代谢通道，增加靶向药物体内蓄积。",
    clinicalGuidance: "呼吸道或幽门螺杆菌抗感染时，可优先选用阿莫西林、头孢类或阿奇霉素（阿奇霉素对 CYP3A4 抑制极微弱）。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "atorvastatin",
    riskLevel: "timing_caution",
    riskLabel: "需监测肌酶 (CYP3A4底物重叠)",
    title: "阿托伐他汀 / 辛伐他汀与靶向药代谢通道竞争",
    mechanism: "阿托伐他汀与辛伐他汀高度依赖 CYP3A4 代谢。与奥希替尼等合用可能轻度提升他汀浓度，潜在增加肌肉酸痛与肌酸激酶 (CK) 升高风险。",
    clinicalGuidance: "可以合用，但建议定期随访化验肝功能与心肌/骨骼肌肌酸激酶 (CK)。若出现无诱因下肢酸胀无力，及时就医。亦可咨询心内科换用不经 CYP3A4 代谢的瑞舒伐他汀或匹伐他汀。",
    evidenceLevel: "权威前瞻临床研究",
    timingRecommendation: "靶向药晨起服用，他汀类降脂药建议固定于每晚睡前服用"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "simvastatin",
    riskLevel: "timing_caution",
    riskLabel: "需监测肌酶 (CYP3A4底物重叠)",
    title: "辛伐他汀与靶向药合用建议监测肌酶",
    mechanism: "辛伐他汀几乎完全依赖 CYP3A4 代谢，酶竞争效应较显著。",
    clinicalGuidance: "建议每 1~3 个月复查血脂与 CK。可考虑换用瑞舒伐他汀。",
    evidenceLevel: "权威前瞻临床研究"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "aspirin",
    riskLevel: "timing_caution",
    riskLabel: "关注胃肠黏膜 (潜在出血风险)",
    title: "阿司匹林抗血小板药与靶向药胃肠道反应管理",
    mechanism: "靶向药常伴随轻度腹泻或便秘（黏膜屏障轻度水肿），阿司匹林可能刺激胃肠道。二者合用无直接代谢酶冲突，但需关注大便颜色与消化道出血征象。",
    clinicalGuidance: "可以合用。建议选用肠溶剂型并在餐后服用。若出现黑便、柏油样便或牙龈持续出血，应及时复查便潜血与血常规。",
    evidenceLevel: "权威前瞻临床研究"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "clopidogrel",
    riskLevel: "timing_caution",
    riskLabel: "注意观察 (出血风险与便潜血)",
    title: "氯吡格雷与靶向药合用注意事项",
    mechanism: "无显著 CYP3A4 代谢抑制，但需关注抗血小板协同下的皮肤黏膜出血点。",
    clinicalGuidance: "心脑血管支架术后患者必须规律服用，切勿擅自停药！只需日常留意刷牙出血、皮下紫癜情况即可。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "warfarin",
    riskLevel: "timing_caution",
    riskLabel: "需紧密监测 INR (凝血功能)",
    title: "华法林与靶向药合用需紧密监测凝血 INR",
    mechanism: "EGFR-TKI 可能轻度竞争血浆蛋白结合率，导致游离华法林浓度出现轻微波动。",
    clinicalGuidance: "合用期间应比平时更密切地监测国际标准化比值 (INR，目标通常 2.0~3.0)，根据化验结果微调华法林每日片数。",
    evidenceLevel: "FDA/NMPA说明书"
  },

  // ================= 允许合用 / 安全相容 (GREEN) =================
  {
    targetDrugIds: ["*"],
    chronicDrugId: "amlodipine",
    riskLevel: "compatible_safe",
    riskLabel: "安全相容 (允许合用)",
    title: "氨氯地平 (络活喜) 降压药与靶向药安全相容",
    mechanism: "氨氯地平虽然部分经 CYP3A4 代谢，但临床常规治疗剂量下与奥希替尼等靶向药不存在临床显著的相互作用。",
    clinicalGuidance: "高血压患者可完全正常合用，遵医嘱按时规律服用降压药，每日保持晨起量血压习惯。",
    evidenceLevel: "权威前瞻临床研究",
    timingRecommendation: "早晨固定时间按医嘱服用即可"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "nifedipine",
    riskLevel: "compatible_safe",
    riskLabel: "安全相容 (允许合用)",
    title: "硝苯地平控释片 (拜新同) 与靶向药安全相容",
    mechanism: "控释剂型缓慢平稳释放，无显著代谢酶恶性竞争。",
    clinicalGuidance: "整片吞服，切勿嚼碎，按原降压医嘱稳定服用。",
    evidenceLevel: "权威前瞻临床研究"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "valsartan",
    riskLevel: "compatible_safe",
    riskLabel: "安全相容 (理想降压搭档)",
    title: "缬沙坦 (代文) 不经 CYP450 酶代谢，与靶向药极度相容",
    mechanism: "缬沙坦主要以原形经胆汁排泄，几乎不依赖肝脏 CYP3A4 代谢，与各类肺癌靶向药无任何代谢通道冲突。",
    clinicalGuidance: "高血压合并肺腺癌患者非常理想的降压药物选择，安全相容。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "metoprolol",
    riskLevel: "compatible_safe",
    riskLabel: "安全相容 (允许合用)",
    title: "美托洛尔 (倍他乐克) 与靶向药安全相容",
    mechanism: "美托洛尔主要经 CYP2D6 代谢，与主要经 CYP3A4 代谢的三代 EGFR-TKI/ALK-TKI 无通道抢占。",
    clinicalGuidance: "按原心内科医嘱规律服用，有助于控制心率与平稳血压。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "rosuvastatin",
    riskLevel: "compatible_safe",
    riskLabel: "优选用药 (低代谢竞争)",
    title: "瑞舒伐他汀钙 (可定) 主要经 CYP2C9 代谢，相容性优于阿托伐他汀",
    mechanism: "瑞舒伐他汀仅约 10% 经 CYP2C9 微量代谢，绝大部分以原形排泄，几乎不经过 CYP3A4，与奥希替尼等靶向药的代谢冲突极低。",
    clinicalGuidance: "靶向治疗患者伴高脂血症时非常推荐的降脂药物，安全性高。",
    evidenceLevel: "权威前瞻临床研究",
    timingRecommendation: "固定于每晚睡前口服一片"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "rivaroxaban",
    riskLevel: "compatible_safe",
    riskLabel: "相对安全 (规律随访)",
    title: "利伐沙班新型口服抗凝药与靶向药",
    mechanism: "部分经 CYP3A4 与 P-gp 代谢。在无肝肾严重损伤前提下，标准剂量合用较为安全。",
    clinicalGuidance: "遵血管外科医嘱按时服用，注意观察牙龈与皮肤黏膜即可。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "famotidine",
    riskLevel: "compatible_safe",
    riskLabel: "推荐抑酸替代 (相容性良好)",
    title: "法莫替丁 (H2RA) 是靶向治疗患者最理想的抑酸选择之一",
    mechanism: "法莫替丁对胃内 pH 的升高幅度温和且时效明确，对三代奥希替尼吸收几乎无影响；对一代吉非替尼只需错峰 2 小时即可安全化解。",
    clinicalGuidance: "如患者有胃部不适反酸，可在医生指导下优先将强效 PPI 替换为法莫替丁，安全性显著提高。",
    evidenceLevel: "药代动力学PK证据",
    timingRecommendation: "早晨服靶向药，如有夜间胃痛可睡前服用法莫替丁"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "estazolam",
    riskLevel: "compatible_safe",
    riskLabel: "安全相容 (改善失眠焦虑)",
    title: "艾司唑仑 (舒乐安定) 与靶向药安全相容",
    mechanism: "短期小剂量改善肿瘤患者术后或随访期的失眠焦虑，无直接药理拮抗。",
    clinicalGuidance: "遵医嘱睡前半小时按需服用，帮助保持充足睡眠与良好免疫力。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "sertraline",
    riskLevel: "compatible_safe",
    riskLabel: "安全相容 (抗抑郁抗焦虑)",
    title: "舍曲林 (左洛复) 与靶向药安全相容",
    mechanism: "主要经肝脏脱甲基代谢，对 CYP3A4 的抑制作用极弱，与靶向药相容性良好。",
    clinicalGuidance: "遵心身医学科医嘱规律服药，有效缓解肿瘤带来的情绪压力。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "bicyclol",
    riskLevel: "compatible_safe",
    riskLabel: "保肝相容 (错峰服用)",
    title: "双环醇片 (百赛诺) 保肝降酶与靶向药相容",
    mechanism: "清除自由基、保护肝细胞膜，对 CYP450 酶无显著诱导或抑制，有助于缓解靶向药相关轻度转氨酶升高。",
    clinicalGuidance: "遵医嘱餐后服用，建议与靶向药间隔 1 小时服用以便各自充分吸收。",
    evidenceLevel: "FDA/NMPA说明书"
  },
  {
    targetDrugIds: ["*"],
    chronicDrugId: "silymarin",
    riskLevel: "compatible_safe",
    riskLabel: "保肝相容 (错峰服用)",
    title: "水飞蓟宾胶囊 (水林佳) 与靶向药相容",
    mechanism: "天然植物类保肝制剂，稳定肝细胞膜，相容性良好。",
    clinicalGuidance: "餐后随水吞服，建议与靶向药错开 1 小时。",
    evidenceLevel: "FDA/NMPA说明书"
  }
];

/**
 * Main Analysis Function: Evaluates user's chosen target drug against a list of chronic drugs
 */
export function checkDrugInteractions(targetedDrugId: string, chronicDrugIds: string[]): DdiAnalysisResult {
  const targeted = TARGETED_DRUGS.find(d => d.id === targetedDrugId) || TARGETED_DRUGS[0];
  const selectedChronic = ALL_CHRONIC_DRUGS.filter(d => chronicDrugIds.includes(d.id));

  const interactions: Array<{ chronicDrug: ChronicDrug; rule: DdiRule }> = [];
  let severeCount = 0;
  let cautionCount = 0;
  let safeCount = 0;

  for (const chronic of selectedChronic) {
    // 1. Try matching exact targetDrugId + chronicDrugId
    let matchedRule = DDI_RULES.find(r => 
      (r.targetDrugIds.includes("*") || r.targetDrugIds.includes(targeted.id)) && 
      r.chronicDrugId === chronic.id
    );

    // Default fallback if no specific rule is listed (considered general compatible with monitoring)
    if (!matchedRule) {
      matchedRule = {
        targetDrugIds: ["*"],
        chronicDrugId: chronic.id,
        riskLevel: "compatible_safe",
        riskLabel: "通常安全 (常规监测)",
        title: `${chronic.name} 与 ${targeted.genericName} 未见明确严重代谢冲突`,
        mechanism: "两药在标准临床治疗剂量下未见重大 CYP3A4 通道抢占或吸收阻滞报告。",
        clinicalGuidance: "可按原医嘱遵医嘱服用。用药期间注意常规随访监测肝肾功能即可。",
        evidenceLevel: "FDA/NMPA说明书"
      };
    }

    if (matchedRule.riskLevel === "severe_contraindication") severeCount++;
    else if (matchedRule.riskLevel === "timing_caution") cautionCount++;
    else safeCount++;

    interactions.push({
      chronicDrug: chronic,
      rule: matchedRule
    });
  }

  // Determine overall status
  let overallStatus: "danger" | "warning" | "safe" = "safe";
  let summaryText = "";

  if (severeCount > 0) {
    overallStatus = "danger";
    summaryText = `检测到 ${severeCount} 项严重用药禁忌！存在极高药物失效或毒性剧增风险，请务必立即就医调整用药！`;
  } else if (cautionCount > 0) {
    overallStatus = "warning";
    summaryText = `检测到 ${cautionCount} 项需错峰服药或调整的相互作用。请注意服药时间间隔，避免同杯水同吞。`;
  } else {
    overallStatus = "safe";
    summaryText = `共排查 ${selectedChronic.length} 种日常用药，均处于安全相容区间，可遵医嘱正常规律服用！`;
  }

  // Generate Daily Schedule Plan
  const dailySchedulePlan = generateDailyMedicationSchedule(targeted, interactions);

  return {
    targetedDrug: targeted,
    selectedChronicDrugs: selectedChronic,
    totalChecked: selectedChronic.length,
    severeCount,
    cautionCount,
    safeCount,
    overallStatus,
    summaryText,
    interactions,
    dailySchedulePlan
  };
}

/**
 * Helper to generate smart daily timeline recommendation
 */
function generateDailyMedicationSchedule(
  targeted: TargetedDrug,
  interactions: Array<{ chronicDrug: ChronicDrug; rule: DdiRule }>
): Array<{ timeSlot: string; drugs: string[]; note: string }> {
  const morningSlot: string[] = [];
  const lunchSlot: string[] = [];
  const afternoonSlot: string[] = [];
  const eveningSlot: string[] = [];

  // Targeted drug default: Morning 8:00 AM (or lunch for Alectinib)
  if (targeted.id === "alectinib") {
    morningSlot.push(`${targeted.genericName} (早间 300/600mg 随餐)`);
    eveningSlot.push(`${targeted.genericName} (晚间 300/600mg 随餐)`);
  } else {
    morningSlot.push(`${targeted.genericName} (${targeted.standardDosage.split(" ")[0]})`);
  }

  for (const item of interactions) {
    const { chronicDrug, rule } = item;
    
    if (rule.riskLevel === "severe_contraindication") {
      morningSlot.push(`❌ ${chronicDrug.name} (已禁用，需停用)`);
    } else if (chronicDrug.category === "gastric_acid") {
      if (chronicDrug.id === "famotidine") {
        eveningSlot.push(`${chronicDrug.name} (睡前半小时口服)`);
      } else {
        afternoonSlot.push(`${chronicDrug.name} (下午 14:00~15:00 错峰服用)`);
      }
    } else if (chronicDrug.category === "cardiovascular_lipid") {
      if (chronicDrug.id.includes("statin")) {
        eveningSlot.push(`${chronicDrug.name} (晚间 20:00~21:00 睡前服用)`);
      } else {
        morningSlot.push(`${chronicDrug.name} (晨起餐后 08:30)`);
      }
    } else if (chronicDrug.category === "anticoagulant") {
      morningSlot.push(`${chronicDrug.name} (早晨餐后)`);
    } else if (chronicDrug.category === "diet_supplements") {
      lunchSlot.push(`${chronicDrug.name} (午餐后 12:30)`);
    } else {
      morningSlot.push(chronicDrug.name);
    }
  }

  const schedule = [
    {
      timeSlot: "🌅 晨间 (08:00 ~ 08:30)",
      drugs: morningSlot,
      note: "建议温水送服靶向药，记录每天固定服药时间"
    }
  ];

  if (lunchSlot.length > 0) {
    schedule.push({
      timeSlot: "☀️ 午间 (12:00 ~ 13:00)",
      drugs: lunchSlot,
      note: "餐后服用保肝/常规药物，与晨间靶向药已间隔 4 小时以上"
    });
  }

  if (afternoonSlot.length > 0) {
    schedule.push({
      timeSlot: "☕ 下午 (14:30 ~ 15:30)",
      drugs: afternoonSlot,
      note: "错峰服用胃黏膜保护剂或抗酸药，避免阻碍靶向药晨间吸收"
    });
  }

  if (eveningSlot.length > 0) {
    schedule.push({
      timeSlot: "🌙 晚间 / 睡前 (20:00 ~ 21:30)",
      drugs: eveningSlot,
      note: "他汀类降脂药夜间肝脏合成高峰前服用最佳，安神药物睡前服用"
    });
  }

  return schedule;
}
