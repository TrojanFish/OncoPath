export type WikiCategory = "nodule" | "pathology" | "genetics" | "recovery";

export type RiskLevel = "high" | "moderate" | "low" | "safe";

export interface WikiTopic {
  id: string;
  category: WikiCategory;
  subcategory?: string;
  title: string;
  subtitle?: string;
  icon: string;
  riskLevel: RiskLevel; // high (高危需积极干预) > moderate (中危需密切关注) > low (低危需常规随访) > safe (安全/良好基石)
  priorityOrder: number; // 排序权重：高危在前 (100+), 中危 (50-99), 低危 (20-49), 安全 (1-19)
  
  // 三段式核心内容（生活隐喻 ➔ 临床真相 ➔ 现代医学武器 ➔ 暖心定心丸）
  metaphor: string;
  clinicalTruth: string;
  tactics: string[];
  reassurance: string;
  
  // 循证依据
  keyMetric?: {
    label: string;
    value: string;
    source: string;
  };
  
  // 患者高频 Q&A
  faq: Array<{
    question: string;
    answer: string;
  }>;
  
  // 视觉组件标识
  visualComponent?:
    | "GgoEvolutionSimulator"
    | "FleischnerDecisionTree"
    | "StasAirwayVisual"
    | "VpiPleuraVisual"
    | "LviVesselVisual"
    | "IaslcSubtypeVisual"
    | "LobulationVisual"
    | "SpiculationVisual"
    | "PleuralIndentationVisual"
    | "VacuoleSignVisual"
    | "VascularConvergenceVisual"
    | "IplnLymphVisual"
    | "IhcKi67Visual"
    | "CalcificationVisual"
    | "AdjuvantDecisionTreeVisual"
    | "MediastinalLNMapVisual"
    | "EgfrMutationMapVisual"
    | "PleuralLayersVisual"
    | "LungRadsScaleVisual"
    | "PdL1ImmuneMechanismVisual"
    | "SurgicalApproachesVisual"
    | "FollowupTimelineVisual"
    | "MPLCGGOVisual";
  
  // 关联知识图谱节点 ID
  graphNodeId?: string;
  
  // 搜索关键词（支持中文、英文缩写、常见别名）
  searchKeywords: string[];
}

export const WIKI_CATEGORIES: Record<WikiCategory, { label: string; icon: string; desc: string; color: string; badgeBg: string }> = {
  nodule: {
    label: "肺结节消恐与随访",
    icon: "🫁",
    desc: "针对刚查出磨玻璃结节或实性结节的受检者，破除'结节=绝症'误区，提供科学随访路线图",
    color: "text-emerald-700",
    badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  pathology: {
    label: "术后病理密码破译",
    icon: "🔬",
    desc: "破译病理报告中的高危指标（STAS/VPI/LVI/分级/切缘），用生活比喻讲透真实风险与应对武器",
    color: "text-blue-700",
    badgeBg: "bg-blue-50 border-blue-200 text-blue-700",
  },
  genetics: {
    label: "驱动基因与精准靶向",
    icon: "🧬",
    desc: "解码 EGFR、ALK、KRAS 等基因检测报告，了解代系靶向药如何精准阻断复发通道",
    color: "text-purple-700",
    badgeBg: "bg-purple-50 border-purple-200 text-purple-700",
  },
  recovery: {
    label: "术后康复与长期随访",
    icon: "🌿",
    desc: "术后咳喘、胸闷应对、肿瘤标志物波动认知、复查计划制定与身心重塑指南",
    color: "text-amber-700",
    badgeBg: "bg-amber-50 border-amber-200 text-amber-700",
  },
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string; border: string; desc: string }> = {
  high: {
    label: "高危指标 · 需积极防护",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    desc: "提示微观侵袭性，需规范扩大切缘或术后辅助治疗进行严密阻断",
  },
  moderate: {
    label: "中危因素 · 需密切评估",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    desc: "存在一定风险权重，通常结合全身状况与基因分型制定辅助方案",
  },
  low: {
    label: "低危/惰性 · 常规随访",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    desc: "生长极其缓慢或预后极佳，遵医嘱定期复查薄层CT即可",
  },
  safe: {
    label: "安全基石 · 良好基底",
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-200",
    desc: "根治性切除（R0）或阴性指标，是术后长期无复发的最重要基石",
  },
};

export const WIKI_TOPICS: WikiTopic[] = [
  // ==================== 1. 术后病理密码破译 (按风险高低排序) ====================
  {
    id: "stas",
    category: "pathology",
    subcategory: "高危病理指标",
    title: "气道播散 (STAS 阳性)",
    subtitle: "Spread Through Air Spaces",
    icon: "🌬️",
    riskLevel: "high",
    priorityOrder: 100,
    metaphor: "像主树干成熟掉落的几颗小蒲公英种子——它们仅仅散落在主肿瘤附近的微小肺泡腔隙内，并未进入血管；只要手术切除的安全边界足够宽，或者术后配合辅助治疗，就能彻底清除潜在隐患。",
    clinicalTruth: "气道播散（STAS）是指肿瘤细胞以微乳头小巢、实性细胞团或单个细胞的形式，游离并存在于主肿瘤边界以外的肺泡腔内。STAS 是独立的病理生物学预后指标。对于'亚肺叶切除（楔形/段切）'且切缘不足（<2cm 或切缘/肿瘤比 <1）者，局部复发风险显著升高；而对于标准的'根治性肺叶切除（Lobectomy）'，绝大部分包含漂浮细胞的肺叶组织已在物理层面被完整切除。",
    tactics: [
      "若已行标准肺叶切除（Lobectomy）且切缘阴性（R0），局部切缘复发风险已被最大程度消除",
      "若为亚肺叶切除且切缘距离 <2cm，建议由多学科团队（MDT）评估是否需追加扩大切除或辅助防护",
      "对于 IB~IIIA 期合并 STAS 的 EGFR 突变患者，ADAURA 顶级试验证实第三代靶向药物（如奥希替尼）辅助治疗可降低 83% 复发风险",
    ],
    reassurance: "如果您的手术是标准的根治性肺叶切除，病理切缘为阴性（R0），说明医生已经在物理上把包含散在细胞的整个肺叶全部完整取出！请不要把 STAS 误解为全身扩散，它只是指导术后是否需要多上一道药物防护锁的重要参考依据。",
    keyMetric: {
      label: "STAS 阳性亚肺叶切除后局部复发风险",
      value: "切缘不足（<2cm 或切缘/肿瘤径比 <1）时局部复发风险显著倍增，肺叶切除可最大程度消除风险",
      source: "Kadota et al., JTO 2015 / Cao et al., JCO 2019 / NCCN NSCLC 2024",
    },
    faq: [
      {
        question: "STAS 阳性是不是意味着手术白做了，癌细胞已经跑了？",
        answer: "绝对不是！STAS 描述的是微观切片下主肿瘤边缘局部的细胞微环境分布，绝大多数漂浮细胞局限在主病灶周边数毫米范围内，随手术标本整体移出体外，绝不等于远处转移。"
      },
      {
        question: "STAS 阳性必须做化疗或靶向吗？",
        answer: "需结合病理 TNM 分期（如 IA/IB/II/IIIA）、肿瘤实性成分大小及驱动基因检测结果。如果是极早期（IA1/IA2期）且做了肺叶切除，通常仍以定期高质量随访为主；若为 IB 期以上或合并其他高危亚型，现代口服靶向药物往往比传统化疗耐受性更好。"
      }
    ],
    visualComponent: "StasAirwayVisual",
    graphNodeId: "STAS",
    searchKeywords: ["STAS", "气道播散", "qidaoboshan", "气道内扩散", "气道漂浮", "Spread Through Air Spaces"],
  },
  {
    id: "vpi",
    category: "pathology",
    subcategory: "高危病理指标",
    title: "胸膜侵犯 (VPI 阳性 / PL1-PL2)",
    subtitle: "Visceral Pleural Invasion",
    icon: "🚪",
    riskLevel: "high",
    priorityOrder: 98,
    metaphor: "好比房间的内层墙纸被肿瘤轻轻顶穿了（突破脏层胸膜弹力层）——由于肺表面胸膜富含淋巴微网，这提示我们需要加强局部与全身巡逻，但在根治手术中，整层脏层胸膜已连同肺叶一起被完整切除移出。",
    clinicalTruth: "胸膜侵犯（VPI）在病理学上分为四级：PL0（肿瘤未侵及内弹力层，阴性）；PL1（肿瘤穿透脏层胸膜内弹力层，但未达外表面）；PL2（肿瘤穿透至脏层胸膜外表面）。根据国际 AJCC 第 8/9 版分期标准，肿瘤最大径 ≤3cm 且伴 PL1/PL2 者，T 分期由 T1 自动升为 T2a（即病理分期升至 IB 期起步）。若肿瘤进一步穿透胸膜腔侵犯至壁层胸膜或胸壁组织，则定义为 PL3（T3 分期）。",
    tactics: [
      "根治性手术已将受侵犯的脏层胸膜连同肺叶组织一并完整切除（R0 切缘）",
      "对于升期为 IB/II 期的患者，重点完善驱动基因检测，EGFR 阳性者优选术后辅助靶向治疗（ADAURA 方案）",
      "术后定期复查胸部增强薄层 CT，重点监测胸膜腔、叶间裂（早期 VPI 复发典型表现为裂旁新发增厚）与纵隔淋巴结区域",
    ],
    reassurance: "胸膜侵犯（PL1/PL2）绝不等于'晚期胸壁/胸膜转移'！胸膜转移是指癌细胞脱落种植在胸壁上伴有恶性胸水（属 IV 期晚期），而 VPI 只是肿瘤长到了自己的外表面被膜（脏层胸膜）。根治手术已将这层被膜完整切除，您依然处于完全可争取长期治愈的早中期根治阶段！",
    keyMetric: {
      label: "AJCC 8th/9th 分期影响",
      value: "T1 (≤3cm) 伴 PL1/PL2 自动升期为 T2a",
      source: "Travis et al., JTO / AJCC 8th Staging Manual",
    },
    faq: [
      {
        question: "病理报告写 PL0、PL1、PL2、PL3 到底有什么区别？",
        answer: "PL0 代表未穿透内弹力层（安全阴性）；PL1 代表穿透内弹力层但未到外表面；PL2 代表到达脏层胸膜外表面。PL1 和 PL2 在临床分期上均定义为 VPI 阳性（T 分期升为 T2a）；PL3 代表侵犯到了壁层胸膜/胸壁骨骼肌肉（升为 T3 期）。"
      },
      {
        question: "胸膜侵犯会导致术后胸痛或者恶性胸水吗？",
        answer: "脏层胸膜缺乏痛觉神经末梢，早期 VPI 不会引起神经痛，也不会引起恶性胸水。术后的轻度胸部发紧隐痛多为手术切口及胸壁肋间神经修复期的正常反应，不必过度恐慌。"
      }
    ],
    visualComponent: "VpiPleuraVisual",
    graphNodeId: "VPI",
    searchKeywords: ["VPI", "胸膜侵犯", "xiongmoqinfan", "PL1", "PL2", "PL0", "PL3", "弹力纤维层", "胸膜受累"],
  },
  {
    id: "vpi-pl3-chestwall",
    category: "pathology",
    subcategory: "局部浸润指标",
    title: "胸壁与壁层胸膜侵犯 (PL3 / T3 分期)",
    subtitle: "Parietal Pleura & Chest Wall Invasion (PL3 / T3 Disease)",
    icon: "🧱",
    riskLevel: "high",
    priorityOrder: 96,
    metaphor: "像病变不仅触碰了内层墙纸，还稍微延伸到了外层砖墙（胸壁骨骼或肋间肌）——手术需要连同受累的这一小块砖墙整体打包切除（整块切除），术后再配合全身系统治疗进行彻底清扫。",
    clinicalTruth: "PL3 是指肿瘤直接穿透胸膜腔侵犯至壁层胸膜或胸壁组织（如肋骨、肋间肌）。依据 AJCC 第 8/9 版分期标准，无论肿瘤原本多小，一旦出现 PL3，T 分期直接定为 T3 期（若 N0 为 IIB 期，若 N1 为 IIIA 期，若 N2 为 IIIB 期）。需要注意：T3 并非仅指胸壁侵犯，AJCC 定义的 T3 还包括：侵犯膈肌、同一肺不同叶的卫星结节、距隆突 <2cm 但未侵犯隆突的中央型肿瘤，这些情形同样直接定为 T3 分期。外科标准治疗原则为整块切除（En-bloc 切除），保证切缘病理阴性（R0），术后依据病理及驱动基因状态常规行辅助靶向/化疗/放疗。",
    tactics: [
      "由经验丰富的高水平胸外科中心实施 En-bloc 扩大切除术，确保胸壁与肺组织完整切除且切缘阴性（R0）",
      "术后需接受多学科团队（MDT）综合评估：EGFR 突变阳性首选第三代靶向药物（如奥希替尼）辅助治疗，野生型患者评估辅助化疗联合免疫或局部放疗",
      "对于 T3N2M0（IIIB 期）患者，NCCN 2024 推荐评估新辅助化疗/免疫联合后手术的进一步决策，请在 MDT 讨论中弹性选择",
      "定期行胸部增强 CT 与骨扫描/头部 MRI 严密随访，监测局部胸壁与远处器官",
    ],
    reassurance: "PL3 虽然属于局部扩展（T3），但它仍然是局限在胸廓局部的病灶，不等于晚期远处扩散（IV期）！通过现代胸外科整块彻底切除技术，联合第三代靶向药或免疫辅助治疗，依然有非常广阔的长期无复发生存和临床治愈机会！",
    keyMetric: {
      label: "AJCC 8th/9th T3分期标准",
      value: "壁层胸膜/胸壁受累直接定为 T3",
      source: "AJCC Cancer Staging Manual 8th/9th Edition",
    },
    faq: [
      {
        question: "PL3 和之前的 PL1、PL2 有什么本质区别？",
        answer: "PL1 和 PL2 仅局限在肺表面的脏层胸膜（T2a 期）；而 PL3 是穿过了胸膜腔进入了外层的壁层胸膜或胸壁肌肉肋骨（T3 期）。处理上 PL3 通常需要切除部分受累胸壁以确保切缘干净。"
      },
      {
        question: "胸壁切除一部分会影响呼吸和胸廓外形吗？",
        answer: "现代胸外科有成熟的胸壁重建材料与微创技术，术后胸廓形态和呼吸功能可得到极佳的保护与代偿，绝大多数患者术后能恢复正常日常活动。"
      }
    ],
    visualComponent: "PleuralLayersVisual",
    searchKeywords: ["PL3", "胸壁侵犯", "壁层胸膜", "T3期", "xiongbaiqinfan", "En-bloc切除", "胸壁切除"],
  },
  {
    id: "lvi",
    category: "pathology",
    subcategory: "高危病理指标",
    title: "脉管癌栓 (LVI 阳性 / 微血管侵犯)",
    subtitle: "Lymphovascular Invasion & Microvascular Invasion (MVI)",
    icon: "🚗",
    riskLevel: "high",
    priorityOrder: 95,
    metaphor: "像少数活跃的肿瘤细胞企图坐上人体的'微型微循环通道'（微细血管或毛细淋巴管）——这提示我们要加强全身哨卡巡逻防线，通过术后辅助药物或动态血液监测把潜在的微小萌芽消灭在摇篮中。",
    clinicalTruth: "脉管癌栓（LVI）是指在肿瘤周边微血管腔或微淋巴管腔内发现了肿瘤细胞团。临床病理学严格区分'淋巴管癌栓（多提示区域淋巴结转移倾向）'与'微血管侵犯（MVI，多提示潜在血行播散风险）'，病理医生通常使用 D2-40（淋巴管特异性标记）与 CD31/CD34（血管特异性标记）进行精确免疫组化鉴别。LVI 是指导术后是否需要追加全身系统性辅助治疗的重要生物学特征。",
    tactics: [
      "完善驱动基因（EGFR/ALK/ROS1等）全套 NGS 检测，为术后精准靶向治疗锁定分子靶标",
      "IB 期合并 LVI 时，NCCN 2024 将辅助化疗列为 2B 类证据（可考虑，非 I 级强制推荐）；EGFR 突变阳性者靶向治疗（奥希替尼）优先；II~IIIA 期患者须规范辅助系统治疗",
      "动态监测术后血液 ctDNA 微小残留病灶（MRD），若 ctDNA 持续阴性则提示体内无活跃微观转移病灶",
    ],
    reassurance: "看到'癌栓'两个字千万不要以为是大血管被堵塞了或者发生晚期转移了！病理切片上的脉管是微米级的毛细血管，绝大部分脱落的散在细胞在进入循环前已被手术切除，剩余潜在细胞也可被人体免疫系统清除或被术后靶向药物精准消灭。规范治疗是阻断复发的最有力武器！",
    keyMetric: {
      label: "术后辅助治疗复发阻断率",
      value: "三代 TKI 辅助治疗复发风险 ↓83%",
      source: "ADAURA Trial, NEJM (新英格兰医学杂志)",
    },
    faq: [
      {
        question: "脉管癌栓阳性是不是代表癌症已经扩散到全身了？",
        answer: "不是！病理分期是根据肿瘤大小(T)、淋巴结转移(N)和远处转移(M)决定的。只要淋巴结无转移且无远处转移，您依然属于早期（I期或II期）可根治阶段，脉管癌栓只是一个提示微观侵袭活性的病理学参数。"
      }
    ],
    visualComponent: "LviVesselVisual",
    graphNodeId: "LVI",
    searchKeywords: ["LVI", "脉管癌栓", "maiguanaishan", "血管癌栓", "淋巴管癌栓", "微血管侵犯", "MVI", "D2-40", "CD34"],
  },
  {
    id: "iaslc-grade3",
    category: "pathology",
    subcategory: "高危病理指标",
    title: "IASLC 高危病理分级 (Grade 3 / 微乳头与实体型)",
    subtitle: "IASLC Grading: Micropapillary, Solid & Complex Glandular",
    icon: "🧱",
    riskLevel: "high",
    priorityOrder: 92,
    metaphor: "细胞生长排列比较密集混乱，不像规则的贴壁或腺泡结构那么听话。但这类分裂活跃的细胞通常对现代化学药物和精准靶向药物更加敏感，用药打击效果往往更为突出。",
    clinicalTruth: "依据国际肺癌研究协会（IASLC 2020）组织学分级系统，浸润性肺腺癌分为 3 级：\n• Grade 1（高分化）：贴壁生长型（Lepidic）为主导，且高级别亚型成分 <20%（5年无复发率 >90%）；\n• Grade 2（中分化）：腺泡型（Acinar）或乳头型（Papillary）为主导，且高级别亚型成分 <20%；\n• Grade 3（低分化）：任何以微乳头型、实体型或复杂腺体为主导亚型，或伴有 ≥20% 的微乳头型/实体型高级别成分。微乳头和实体型具有较高的侵袭性与淋巴转移潜能。",
    tactics: [
      "即使是 IB 期，若含有 ≥20% 的微乳头或实体型成分，指南也建议积极考虑术后辅助治疗（靶向或化疗）",
      "靶向药物（如三代 EGFR-TKI）对微乳头及实体型腺癌同样具备极强的疾病控制与复发阻断率",
      "合理调整术后前 2 年的随访节奏（建议每 3~4 个月复查一次胸部薄层 CT 与肿瘤标志物）",
    ],
    reassurance: "很多患者病理报告写着'微乳头型 5%'就寝食难安，其实只要高危成分占比低于 20%，且主导亚型为腺泡或贴壁型，整体依然归为 Grade 2 中危或 Grade 1 低危分级。现代多学科综合治疗手段极其丰富，完全能够提供严密的安全防护！",
    keyMetric: {
      label: "IASLC 2020 分级标准",
      value: "高危亚型 ≥20% 归为 Grade 3",
      source: "Moreira et al., JTO (IASLC Grading System)",
    },
    faq: [
      {
        question: "病理报告上写了几种亚型（如腺泡60%，贴壁30%，实体10%），到底是几级？",
        answer: "属于 Grade 2（中分化）！因为主导亚型是腺泡型（60%），且高危实体型仅占 10%（未达到 ≥20% 的门槛），预后远好于纯实体型腺癌。"
      }
    ],
    visualComponent: "IaslcSubtypeVisual",
    graphNodeId: "IASLC",
    searchKeywords: ["IASLC", "微乳头", "实体型", "weirutou", "shitixing", "病理分级", "Grade 3", "高危亚型", "复杂腺体"],
  },
  {
    id: "lymph-node-n2",
    category: "pathology",
    subcategory: "中高危分期指标",
    title: "纵隔淋巴结转移 (N2 站阳性与综合治疗)",
    subtitle: "Mediastinal Lymph Node Metastasis (N2 Disease)",
    icon: "🟡",
    riskLevel: "high",
    priorityOrder: 90,
    metaphor: "像敌人突破了第一道边境哨卡（肺门N1站），到达了交通枢纽站（同侧纵隔N2站）。虽然关卡升级了，但手术已经对这些纵隔淋巴结进行了彻底的解剖性清扫，术后再通过精准药物构建第二道坚固城墙。",
    clinicalTruth: "N2 淋巴结是指同侧纵隔内或隆突下区域的淋巴结（如第 2、4、7 组等）出现了癌细胞转移。依据 AJCC 第 8/9 版分期标准：\n• T1~T3 N2 M0 属于 IIIA 期；\n• T4 N2 M0（如肿瘤 >7cm 或侵犯纵隔大血管/气管）属于 IIIB 期。\nN2 属于局部进展期而非远处转移（IV期），依然是通过手术完整切除（R0）联合术后系统性辅助治疗（靶向/化疗/免疫）追求临床治愈的关键阶段。",
    tactics: [
      "确保术中实施了规范的系统性纵隔淋巴结清扫（至少清扫 3 组纵隔站，且必须包括第 7 组隆突下淋巴结）",
      "对于可切除 IIIA 期（N2）：根据 CheckMate 816（NCCN 2024 I 类推荐），术前新辅助纳武利尤单抗联合化疗后再手术，病理完全缓解率（pCR）可达 24%——请主动向医生询问是否适合'新辅助免疫化疗后手术'的新模式",
      "术后必须接受规范系统辅助治疗：EGFR 突变阳性首选奥希替尼辅助靶向治疗（3年）；突变阴性首选含铂双药辅助化疗 ± 免疫辅助治疗（依据 KEYNOTE-091 / IMpower010）",
      "定期进行胸腹部增强 CT 及头部增强磁共振（MRI）严密随访",
    ],
    reassurance: "在当今靶向治疗与免疫治疗时代，N2 伴随患者的生存期和无复发率较传统化疗时代有了质的飞跃！*ADAURA* 国际顶级研究显示，即使是 IIIA 期伴 N2 转移的患者，术后口服靶向药 3 年无病生存率仍高达 70% 以上！请树立坚定的治愈信心！",
    keyMetric: {
      label: "IIIA 期靶向辅助治疗无病生存率",
      value: "3年 DFS 提升至 70%+ (NEJM)",
      source: "ADAURA Phase III Trial (NEJM 2023)",
    },
    faq: [
      {
        question: "淋巴结清扫了 16 个，其中 2 个阳性，剩下的 14 个阴性代表什么？",
        answer: "这代表外科纵隔清扫非常彻底规范！阴性淋巴结越多，说明周边其他防线没有被突破。清扫总数 >12 枚且切缘阴性是高质量根治手术的金标准，为术后辅助治疗奠定了坚实基础。"
      }
    ],
    visualComponent: "MediastinalLNMapVisual",
    graphNodeId: "METASTASIS",
    searchKeywords: ["N2", "纵隔淋巴结", "zonggelinbajie", "淋巴结转移", "IIIA期", "IIIB期", "淋巴清扫", "第7组淋巴结", "第4组淋巴结"],
  },
  {
    id: "ihc-ki67",
    category: "pathology",
    subcategory: "病理免疫组化",
    title: "免疫组化指标破译 (TTF-1 / Napsin A / P40 / Ki-67 增殖指数)",
    subtitle: "Immunohistochemistry (IHC) Panel & Ki-67 Proliferation Index",
    icon: "🧬",
    riskLevel: "moderate",
    priorityOrder: 85,
    metaphor: "TTF-1、CK7 阳性是肿瘤的'户口本与身份证'（证明它属于哪一种细胞宗族）；而 Ki-67 是细胞发动机的'实时转速表'——转速高代表踩了油门，但同时也更容易被靶向药和化疗药物精准锁定！",
    clinicalTruth: "免疫组织化学（IHC）利用抗体特异性结合原理，检测肿瘤细胞表达的特异性蛋白质，是确诊组织学分型的金标准：\n• 肺腺癌特异性标志物：TTF-1(+)、Napsin A(+)、CK7(+)，同时 P40(-)、P63(-)，用于精确排除肺鳞癌或胃肠转移癌（CDX2/CK20）；\n• Ki-67 增殖指数：反映处于细胞分裂活跃周期的比例。在原位/微浸润腺癌中通常极低（<3%~5%）；在常规浸润性腺癌中通常在 10%~40%，分化越低（如实体型/微乳头型）数值越高；在高级别神经内分泌癌/小细胞肺癌中常 >50%~80%+。Ki-67 是肿瘤代谢活性的转速表，绝不是患者的'复发转移概率'！",
    tactics: [
      "若 TTF-1 阳性确诊为肺腺癌，应常规进行驱动基因（EGFR/ALK/ROS1等）NGS 大 Panel 检测以锁定靶向药",
      "若 Ki-67 较高（>30%），提示肿瘤细胞分裂增殖活跃，在需要术后辅助治疗时对含铂化疗与靶向药物更敏感、响应更佳",
      "必须结合病理 TNM 分期与微浸润程度综合评估，切忌脱离分期单看 Ki-67 数值过度恐慌",
    ],
    reassurance: "很多患者看到病理报告上一长串'+'号或者 Ki-67 20% 就吓得魂飞魄散。请记住：免疫组化的'+'号只是在给细胞做分类体检，不是疾病扩散的意思！确诊分型越精准，医生的武器库越强大！",
    keyMetric: {
      label: "TTF-1 肺腺癌诊断特异性",
      value: "> 95% (确诊肺腺癌金标准标记)",
      source: "WHO Classification of Thoracic Tumours 5th Edition",
    },
    faq: [
      {
        question: "病理报告写着 Ki-67(+) 25%，这是不是代表我有 25% 的可能会复发？",
        answer: "完全不是！Ki-67 25% 是指切片中大约有 25% 的细胞处于增殖周期，反映的是细胞生长速度快慢，与您个人的'复发率'没有任何直接数学换算关系。"
      },
      {
        question: "为什么报告里有的指标是(+)有的是(-)？",
        answer: "(+)代表阳性（有该蛋白表达），(-)代表阴性（无该蛋白表达）。比如腺癌典型表现为 TTF-1(+)、Napsin A(+) 且 P40(-)、P63(-)，医生借此精确区分腺癌与鳞癌。"
      }
    ],
    visualComponent: "IhcKi67Visual",
    graphNodeId: "PATHOLOGY",
    searchKeywords: ["免疫组化", "TTF-1", "Ki-67", "mianyizuhua", "Ki67", "Napsin A", "P40", "P63", "CK7", "病理阳性", "增殖指数"],
  },
  {
    id: "margin-r0",
    category: "pathology",
    subcategory: "手术切缘指标",
    title: "切缘阴性 (R0 完全切除)",
    subtitle: "Negative Surgical Margin (R0 Resection)",
    icon: "🛡️",
    riskLevel: "safe",
    priorityOrder: 10,
    metaphor: "好比工匠在雕刻切除病变木材时，在最外围留下了一圈干干净净、完好无损的健康木质边界——肉眼和显微镜下都没有任何肿瘤残留，是手术成功的黄金标志。",
    clinicalTruth: "R0 切除是指在显微镜下检查支气管切缘、血管切缘以及肺实质切缘，均未见肿瘤细胞，实现了真正的解剖学完全切除。R1 代表显微镜下微观切缘阳性，R2 代表肉眼可见肿瘤残留。绝大多数规范肺癌手术均为 R0 切除。",
    tactics: [
      "R0 切除是所有肺癌患者获得长期生存的最核心、最关键的基石",
      "若为 R0 切除，早期患者无需过度追加放疗等局部破坏性治疗",
      "遵从主治医生建议，按时完成定期影像随访即可",
    ],
    reassurance: "如果您的病理报告结论写着'支气管切缘阴性'、'各组切缘未见癌'，请长舒一口气！这意味着主刀医生为您实施了一场非常完美、彻底的根治性手术，肿瘤已经在物理层面被完全消灭！",
    keyMetric: {
      label: "R0 切除患者长期治愈基石",
      value: "根治性标准达成率 >98%",
      source: "NCCN Non-Small Cell Lung Cancer Guidelines 2024",
    },
    faq: [
      {
        question: "切缘阴性是不是就代表 100% 以后不会复发了？",
        answer: "R0 切缘代表局部病灶已被彻底切除干净，局部复发概率极低。是否复发还与肿瘤微观生物学特性（如是否有脉管癌栓、淋巴结转移等）有关，结合分期进行规范随访或辅助治疗即可全面把控风险。"
      }
    ],
    graphNodeId: "SURGERY",
    searchKeywords: ["R0", "切缘阴性", "qieyuan", "切缘安全", "完全切除", "切缘净", "支气管切缘"],
  },

  // ==================== 2. 肺结节消恐与随访 (按风险高低排序) ====================
  {
    id: "ggo-evolution",
    category: "nodule",
    subcategory: "结节类型与演变",
    title: "磨玻璃结节演变与实性占比 (CTR)",
    subtitle: "Ground-Glass Opacity & Consolidation-to-Tumor Ratio",
    icon: "🫁",
    riskLevel: "low",
    priorityOrder: 40,
    metaphor: "纯磨玻璃结节（pGGN）就像清晨肺泡里的一团淡薄水雾，没有凝固成冰块（实性）；混合磨玻璃（mGGO）像刚下锅的荷包蛋，中间稍微凝结了一点实性蛋黄。只要实性成分不大，它的生长速度往往极其缓慢。",
    clinicalTruth: "磨玻璃结节（GGO）是指薄层 CT 上呈现密度轻度增高、但内部仍能隐约看清支气管和血管纹理的结节。CTR（Consolidation-to-Tumor Ratio，实性成分比 = CT 纵隔窗实性成分最大径 ÷ 肺窗病灶整体最大径）是国际公认判断浸润性与制定手术策略的金标准。特别强调：根据国际 AJCC 第 8/9 版分期标准，对于部分实性结节（mGGO），T 分期严格仅由'实性成分最大径'决定，而非病灶总径（例如总径 2.2cm 但实性成分仅 0.8cm，精准分期为 T1a，而非 T1c）！当 CTR ≤ 0.5 时，极大概率为原位癌（AIS）或微浸润腺癌（MIA），5 年无复发生存率接近 100%。",
    tactics: [
      "纯磨玻璃结节（CTR=0）首次发现绝不推荐急于开刀，必须经历 3~6 个月薄层随访观察排除感染吸收性水肿",
      "CTR ≤ 0.25 的纯磨玻璃/至微小实性 GGO：JCOG0804 证实 5 年 RFS 高达 99.7%，预后极佳；CTR 0.25~0.5 的混合型 GGO 预后同样良好，应由胸外科专家针对切除方式个性化定制（段切或楔形）",
      "依据 JCOG0802 / CALGB140503 顶级多中心 RCT，CTR ≤ 0.5 早期肺癌亚肺叶切除后 5 年总生存率与肺叶切除相当，且肺功能保留远优于肺叶切除",
    ],
    reassurance: "查出磨玻璃结节千万不要自己吓自己！数据显示体检发现的磨玻璃结节超过 95% 为良性或极早期惰性状态。纯磨玻璃结节的倍增时间通常在 600~1000 天以上，哪怕观察 1~2 年也完全处于绝对安全的治疗窗口期！",
    keyMetric: {
      label: "AJCC 8th/9th T分期规则",
      value: "仅以 CT 实性成分最大径定 T 期 (CTR ≤ 0.5 5年RFS 99.7%)",
      source: "AJCC Staging Manual 8th/9th / JCOG0804 Trial (Lancet)",
    },
    faq: [
      {
        question: "我的磨玻璃结节 8mm，医生为什么让我 6 个月后再复查，而不是立即开刀？",
        answer: "因为相当一部分首次发现的磨玻璃结节是由普通肺部炎症、过敏或微出血引起的，经过数月随访可能会自行吸收缩小。如果立即开刀不仅挨了一刀白白切除肺组织，还可能误切良性病变。定期复查是最严谨负责的医学做法！"
      },
      {
        question: "随访期间磨玻璃结节会不会突然在几个月内转移到全身？",
        answer: "绝对不会！纯磨玻璃结节的生物学特性是贴壁生长，没有突破基底膜进入血管和淋巴管的能力，不具备任何远处转移的生物学通道。"
      }
    ],
    visualComponent: "GgoEvolutionSimulator",
    graphNodeId: "CTR",
    searchKeywords: ["GGO", "磨玻璃结节", "mobolijiejie", "pGGN", "mGGO", "实性成分比", "CTR", "荷包蛋征", "肺结节", "JCOG0804"],
  },
  {
    id: "fleischner-guide",
    category: "nodule",
    subcategory: "随访指南",
    title: "国际 Fleischner 肺结节科学随访决策树",
    subtitle: "Fleischner Society Guidelines for Lung Nodules (2017/2022)",
    icon: "🧭",
    riskLevel: "low",
    priorityOrder: 35,
    metaphor: "一套由全球顶级胸外科与放射学专家制定的'红绿灯通行法则'——结节多大、什么质地，该等3个月、6个月还是1年，都有明确精准的科学时间表，绝不需要凭感觉焦虑猜测。",
    clinicalTruth: "依据国际 Fleischner Society（2017/2022版）与中华医学会呼吸病学分会指南明确规范：\n• 单发纯磨玻璃结节 <6mm：常规无需随访（恶性概率 <1%）；\n• 单发纯磨玻璃结节 ≥6mm：首次发现建议 6~12 个月复查薄层 CT，若稳定则每 2 年复查一次至 5 年；\n• 部分实性结节（mGGO）：若实性成分 ≥6mm 且持续存在 ≥3 个月，强烈推荐多学科会诊（MDT）评估微创手术切除；\n• 单发实性结节：<6mm 无需常规复查；6~8mm 于 6~12 个月复查；>8mm 评估增强 CT、PET-CT 或多学科评估手术。",
    tactics: [
      "严格使用 1mm 以下的高分辨率薄层 CT（HRCT）进行靶扫描对比，避免不同机器层厚误差导致的误判",
      "【Fleischner 2022 新规则】亚实性结节（mGGO）若实性成分 ≥6mm 且持续存在 ≥3 个月，应由胸外科专家评估微创手术切除指征（而非仅继续观察），这是比 2017 旧版重要的更新",
      "提倡结合 AI 辅助三维体积倍增时间（VDT）对比，体积倍增时间 >600 天提示极其惰性病变",
      "切忌频繁（如每个月）做 CT 检查，不仅徒增辐射，而且短期内无法观察到惰性肿瘤的体积倍增变化",
    ],
    reassurance: "指南是全球数十万例随访病例大数据总结出的最优解。只要严格遵从指南的时间表随访，绝不会耽误任何治疗时机！把专业的事情交给指南，把安心的生活留给自己。",
    keyMetric: {
      label: "<6mm 孤立纯磨玻璃结节恶性率",
      value: "< 1% (指南明确建议无需过度复查)",
      source: "MacMahon et al., Radiology (Fleischner Guidelines)",
    },
    faq: [
      {
        question: "每次去不同医院复查，结节报告大小差了 1~2mm 是不是长大了？",
        answer: "不一定！CT 扫描时呼吸深浅、不同切片层厚以及不同放射科医生的测量游标习惯都会带来 1~2mm 的测量误差。关键看三维体积和内部密度是否改变，建议在同一家三甲医院同一台机器上做薄层复查对比。"
      }
    ],
    visualComponent: "FleischnerDecisionTree",
    searchKeywords: ["Fleischner", "随访指南", "suifang", "结节复查时间", "结节随访", "6mm结节", "8mm结节", "VDT", "体积倍增时间"],
  },
  {
    id: "sign-spiculation",
    category: "nodule",
    subcategory: "CT 影像征象破译",
    title: "短细毛刺征 (Spiculation / 纤维促增生机制)",
    subtitle: "Fine Radiating Spicules & Desmoplastic Reaction",
    icon: "🦔",
    riskLevel: "moderate",
    priorityOrder: 49,
    metaphor: "像板栗外壳上的细密小刺，或者结节收缩时周围纤维组织拉伸出的小细丝。长粗毛刺多为以前肺炎留下的瘢痕，短细密集毛刺才需要关注。",
    clinicalTruth: "毛刺征（Spiculation）是指从结节边缘向周围肺实质呈放射状伸出的小线条，病理学机制截然不同：\n• 短细放射状毛刺（CT 影像上 <1cm，密集纤细）：多因肿瘤细胞沿小叶间隔浸润生长并诱导间质促纤维组织增生（Desmoplasia）收缩牵拉所致，需警惕浸润性活性；\n• 粗长条索状毛刺（CT 影像上 >1cm，稀疏僵直）：多为既往肺炎、肺结核痊愈后遗留的机化纤维条索瘢痕，属于良性病变。单凭毛刺不能直接定性为恶性，需结合实性成分（CTR）和三维体积倍增时间（VDT）综合评估。",
    tactics: [
      "请放射科医生在薄层高分辨率 CT（HRCT）上精准鉴别是'粗长炎性条索'还是'短细放射毛刺'",
      "若为首次发现且伴有长粗毛刺，通常建议 3~6 个月复查薄层 CT 观察是否为陈旧炎性机化灶",
      "若短细毛刺伴随实性成分进行性增多（CTR 升高），由胸外科专家评估微创手术切除指征",
    ],
    reassurance: "看到报告写'见毛刺'千万不要吓慌！我国成年人体检中有相当高比例的人因为以前得过支气管炎、肺炎或隐匿性结核感染，肺部留下了类似'伤疤拉扯'的长粗毛刺，只要长期随访形态稳定，就完全属于无害良性瘢痕！",
    keyMetric: {
      label: "长毛刺与短毛刺鉴别",
      value: "粗长毛刺 (>1cm) 绝大多数为良性机化瘢痕",
      source: "Chinese Expert Consensus on Lung Nodule Evaluation 2024",
    },
    faq: [
      {
        question: "毛刺会不会自己慢慢消失？",
        answer: "如果是急性炎症吸收期的纤维充血毛刺，经过充分休息或抗炎后可能会变淡甚至吸收消失；如果是陈旧性纤维瘢痕，通常会长期稳定存在，只要体积不增大就无需任何干预。"
      }
    ],
    visualComponent: "SpiculationVisual",
    searchKeywords: ["毛刺征", "短细毛刺", "长毛刺", "maoci", "Spiculation", "放射状毛刺", "毛刺状边缘", "促纤维增生"],
  },
  {
    id: "sign-lobulation",
    category: "nodule",
    subcategory: "CT 影像征象破译",
    title: "分叶征 (Lobulation / 浅分叶与深分叶切迹)",
    subtitle: "Scalloped & Lobulated Margins (Notch Depth >2mm vs ≤2mm)",
    icon: "🌊",
    riskLevel: "moderate",
    priorityOrder: 48,
    metaphor: "像生面团在烤箱里不同角落膨胀速度不一样，边缘形成了起伏的波浪小山丘。浅浅的波浪在良性错构瘤中非常多见，深切迹分叶才需要重点随访。",
    clinicalTruth: "分叶征（Lobulation）是指结节轮廓呈现凹凸不平的波浪状或花瓣状弧形边缘。其成因是病灶不同方向细胞增殖速率不同，或受周围肺血管、小叶间隔纤维阻力挤压所致：\n• 浅分叶（切迹深度 ≤2mm，边缘波浪平缓）：良性错构瘤（多达 30%+）、结核球或慢性炎性假瘤极其多见；\n• 深分叶（切迹深度 >2mm，切迹深锐陡峭）：多见于浸润生长较快的恶性病变。需结合内部密度（纯磨玻璃 vs 混合磨玻璃）与三维体积动态对比。",
    tactics: [
      "CT 报告若提示分叶，重点查看是'浅分叶（≤2mm）'还是'深分叶（>2mm）'，并测量内部实性成分占比（CTR）",
      "结合三维重建测量体积倍增时间（VDT），若 1 年以上无体积倍增，倾向良性或极惰性病变",
      "必要时行薄层增强 CT 查看强化幅度（良性错构瘤强化不明显，且常测得负值脂肪成分）",
    ],
    reassurance: "良性肺错构瘤由于含有软骨和脂肪等不同组织，天生就长得像一颗'小花卷'（浅分叶状）。因此报告上出现分叶两个字绝不等于恶性，放平心态找专科医生综合阅片即可！",
    keyMetric: {
      label: "浅分叶在良性病变中占比",
      value: "良性错构瘤/假瘤发生率可达 30%+",
      source: "Radiology & Chest Imaging Diagnostics 2023",
    },
    faq: [
      {
        question: "分叶和毛刺同时出现是不是就很危险？",
        answer: "不一定。这代表结节生长受到解剖微结构的塑形影响。如果是微小结节（<6mm）或纯磨玻璃结节，哪怕形态不规则，其本质依然处于早期惰性阶段，遵从 Fleischner 指南定期随访是绝对安全的。"
      }
    ],
    visualComponent: "LobulationVisual",
    searchKeywords: ["分叶征", "浅分叶", "深分叶", "fenye", "Lobulation", "花瓣状", "波浪边缘", "切迹深度"],
  },
  {
    id: "sign-pleural-indentation",
    category: "nodule",
    subcategory: "CT 影像征象破译",
    title: "胸膜凹陷与牵拉征 (Pleural Indentation)",
    subtitle: "Traction & Pleural Tagging",
    icon: "⛺",
    riskLevel: "moderate",
    priorityOrder: 47,
    metaphor: "像衣服口袋被往里拽了一下，是结节内部纤维瘢痕收缩把旁边的薄膜拉了个三角形小凹坑。这是单纯的物理机械拉扯，绝不代表癌细胞长到了胸壁上。",
    clinicalTruth: "胸膜凹陷征（Pleural Indentation）是指靠近肺表面胸膜的结节，因内部纤维化瘢痕收缩，通过纤维结缔组织束将邻近的脏层胸膜向病灶方向牵拉，在 CT 上呈现类似'小帐篷'状的三角形凹陷。结核球、慢性肺炎瘢痕同样由于纤维组织收缩极易引起胸膜凹陷。需注意鉴别：当伴随实性成分显著（CTR > 0.5）、出现'V/Y字形双索条牵拉'或合并分叶与短毛刺时，恶性浸润风险升高，需由胸外科专家精细阅片。",
    tactics: [
      "严格区分'物理力学牵拉凹陷（Pleural Tagging）'与'真正的病理胸膜侵犯（VPI）'，前者仅为收缩力线，不等于侵犯",
      "若为近胸膜结节且计划手术，微创胸腔镜可极为方便地进行局部切除，手术视野好、恢复快",
      "对比既往老片，若牵拉形态多年无变化，多为既往炎症愈合留下的陈旧索条",
    ],
    reassurance: "很多患者看到'胸膜'两个字就以为是晚期胸膜转移，这是极大的误解！胸膜牵拉就像皮肤伤口愈合结痂时把周围皮肤拉紧了一样，是一种常见的物理收缩力学反应。只要没有胸水，胸膜腔结构完好无损！",
    keyMetric: {
      label: "陈旧炎性瘢痕胸膜牵拉率",
      value: "结核/炎症瘢痕中高达 40%+",
      source: "European Respiratory Journal 2023",
    },
    faq: [
      {
        question: "胸膜牵拉会导致我经常胸口疼吗？",
        answer: "肺脏表面脏层胸膜没有痛觉神经，微小的胸膜牵拉通常没有任何感觉。大多数患者的'胸痛'是因为看到体检报告后精神过度焦虑紧张，导致的肋间神经敏感或心理性放大。"
      }
    ],
    visualComponent: "PleuralIndentationVisual",
    searchKeywords: ["胸膜牵拉", "胸膜凹陷征", "xiongmoqianla", "Pleural Indentation", "胸膜凹陷", "胸膜受拉"],
  },
  {
    id: "sign-vacuole",
    category: "nodule",
    subcategory: "CT 影像征象破译",
    title: "空泡征与支气管充气征 (Vacuole / Air Bronchogram)",
    subtitle: "Patent Air Spaces in Ground-Glass Nodules",
    icon: "🧀",
    riskLevel: "low",
    priorityOrder: 44,
    metaphor: "像瑞士奶酪里留着的透光小气孔，或者正常的小呼吸管道还没被肿瘤填死。它恰恰说明肿瘤细胞保留了原有的肺泡骨架，多见于极早期贴壁生长的惰性阶段。",
    clinicalTruth: "空泡征是指结节内部直径 <5mm 的微小圆形透亮含气低密度区；支气管充气征则是指细支气管在结节内部自然穿行通畅。在磨玻璃结节中，空泡征的存在多表明肿瘤细胞仅仅沿着肺泡壁单层爬行（贴壁生长方式），并未破坏肺泡固有骨架，是早期微浸润或原位阶段的典型特征。",
    tactics: [
      "若结节为纯磨玻璃且伴有小空泡征，提示极大概率属于早期贴壁型生长，预后极佳",
      "定期随访主要观察空泡是否闭合消失或实性结节化（若长期保持空泡透亮，提示生长极惰性）",
      "无需因为'空泡'二字恐慌，定期低剂量薄层 CT 复查即可",
    ],
    reassurance: "空泡征其实是一个'良善信号'！因为如果肿瘤侵袭性很强，很快就会把肺泡组织完全破坏填平（变成纯实性白点）。内部有空泡和通畅的呼吸细支气管，恰恰证明它处于非常早、非常惰性的初始阶段！",
    keyMetric: {
      label: "伴空泡征 GGO 5年根治率",
      value: "贴壁为主型 5yr RFS ≈ 100%",
      source: "Travis et al., WHO Classification of Thoracic Tumours",
    },
    faq: [
      {
        question: "空泡征是不是肺里烂了一个洞（空洞）？",
        answer: "完全不是！'空洞'是指结节内部坏死排出形成的大空腔（通常 >5mm，伴厚壁）；而'空泡'是 <5mm 的正常未充盈小肺泡气隙，两者在病理学上截然不同，空泡征预后远好于空洞。"
      }
    ],
    visualComponent: "VacuoleSignVisual",
    searchKeywords: ["空泡征", "支气管充气征", "kongpaozheng", "Vacuole", "Air Bronchogram", "支气管穿行", "肺泡未闭"],
  },
  {
    id: "sign-vascular-convergence",
    category: "nodule",
    subcategory: "CT 影像征象破译",
    title: "血管集束征 (Vascular Convergence)",
    subtitle: "Vessel Gathering & Convergence",
    icon: "🌿",
    riskLevel: "moderate",
    priorityOrder: 43,
    metaphor: "像附近的小水渠被引流汇聚到了病变田地中央。不仅肿瘤需要供血，局部急慢性炎症充血时周边血管也会出现牵拉增粗，抗炎随访往往会自然退缩。",
    clinicalTruth: "血管集束征（Vascular Convergence）是指一支或多支肺血管（肺动静脉分支）到达结节边缘或穿入结节内部，在病灶周围呈现聚集分布的现象。其机制一方面是病灶释放促血管生成因子引起血管增生，另一方面是病灶纤维化收缩将邻近血管牵引拉直。急慢性炎症充血期同样可见血管集束征。",
    tactics: [
      "高分辨率薄层 CT 靶扫描观察血管是穿行完好还是受浸润截断（管壁完整者良性可能大）",
      "首次发现伴有血管聚集的结节，可遵医嘱规范抗炎 2 周后，间隔 1~3 个月复查对比血管有无改善",
      "若血管周围伴随实性成分进行性增多，建议胸外科门诊评估微创手术指征",
    ],
    reassurance: "看到'血管集束'不要慌以为血管被肿瘤占领了。肺部血管网极其密集，结节在生长或炎症水肿时轻微牵扯邻近小血管是非常自然的解剖现象。规范随访对比是鉴别血管状态最科学的法宝！",
    keyMetric: {
      label: "急性炎症随访血管吸收改善率",
      value: "约 20 ~ 35% (首次随访部分吸收)",
      source: "AJR American Journal of Roentgenology 2023",
    },
    faq: [
      {
        question: "血管穿过结节会不会把癌细胞带走？",
        answer: "肺血管有完整的管壁屏障。在早期磨玻璃阶段，血管只是穿行经过为肺组织供血，肿瘤细胞并没有穿透血管内皮层，不代表发生血液扩散。"
      }
    ],
    visualComponent: "VascularConvergenceVisual",
    searchKeywords: ["血管集束征", "血管增粗", "xueguanjishu", "Vascular Convergence", "血管聚集", "血管穿行"],
  },
  {
    id: "subpleural-ipln",
    category: "nodule",
    subcategory: "良性结构识别",
    title: "胸膜下微结节与叶裂间淋巴结 (IPLN)",
    subtitle: "Subpleural Nodules & Intrapulmonary Lymph Nodes (IPLN)",
    icon: "🛡️",
    riskLevel: "safe",
    priorityOrder: 15,
    metaphor: "像肺部表面天然设立的'微型保安岗亭'——它们天生就喜欢紧贴着肺外表面的胸膜或叶间裂缝隙，形态大多像扁豆、三角形或小菱形，是完全无害的正常淋巴防线组织。",
    clinicalTruth: "体检 CT 报告上极为常见的'胸膜下微小结节（通常 3~6mm）'，绝大多数在病理学上是肺内正常淋巴结（IPLN）。其特征性影像学表现为：好发于隆突水平以下的中下叶胸膜下（距离脏层胸膜 <15mm）或紧贴斜裂/水平裂；形态呈扁椭圆、小三角形或扁菱形（长宽比常 >1.5）；边缘极其锐利光滑，内部密度均匀。这与恶性肿瘤的'胸膜种植转移'在形态学与发生机制上有着本质天壤之别。",
    tactics: [
      "若 CT 报告提示'胸膜下/裂间微小结节（<6mm）'且形态扁平规则，无需恐慌，常规年度体检即可",
      "对比既往体检 CT 胶片，若多年大小形态无变化，即可 100% 确认为良性生理淋巴结构",
      "切忌因为看到'胸膜下'字眼盲目要求穿刺或手术，过度医疗反而增加气胸与出血风险",
    ],
    reassurance: "体检看到'胸膜下'三个字千万别自己吓自己！绝大多数胸膜下微结节就像皮肤上的小痣一样普通正常，是人体健康的微型哨所，和恶性肿瘤没有半毛钱关系！",
    keyMetric: {
      label: "胸膜下微结节良性率",
      value: "> 99% (多为正常生理性 IPLN 淋巴结)",
      source: "European Radiology / Fleischner Society Guidelines",
    },
    faq: [
      {
        question: "报告写胸膜下结节，是不是代表癌细胞已经长在胸膜上了？",
        answer: "绝对不是！'胸膜下'只是一个解剖空间位置描述（指位于肺表面外周），就像说'皮肤下有颗痣'一样，并不代表是恶性转移。正常肺内淋巴结天生就分布在胸膜下与叶间裂区域。"
      }
    ],
    visualComponent: "IplnLymphVisual",
    searchKeywords: ["胸膜下结节", "IPLN", "肺内淋巴结", "xiongmoxia", "裂间结节", "叶裂结节", "胸膜下微结节", "扁豆状结节", "菱形结节"],
  },
  {
    id: "calcification-hamartoma",
    category: "nodule",
    subcategory: "良性结构识别",
    title: "钙化结节与错构瘤 (爆米花钙化与脂肪双铁证)",
    subtitle: "Calcified Nodules & Pulmonary Hamartoma (Popcorn Sign & Fat Density)",
    icon: "💎",
    riskLevel: "safe",
    priorityOrder: 12,
    metaphor: "像身体过去发生轻微炎症或受伤后，机体用钙质水泥浇筑封存的'坚固墓碑'，或者是天生良性的'小软骨肉丸'（错构瘤）。它就像肺里的一颗光滑小石头，坚固而稳定。",
    clinicalTruth: "钙化与错构瘤是医学放射学中公认的'良性金标准'：\n• 良性钙化模式：中心完全致密钙化、同心圆层状钙化、爆米花样粗大钙化（爆米花征）；\n• 肺错构瘤（Hamartoma）双铁证：薄层 CT 上同时测得典型'负值脂肪密度（CT值 -40 ~ -120 HU）'和/或'爆米花样软骨钙化'，具有 100% 良性诊断特异性，终生几乎不恶变，无需任何创伤性切除；\n• ⚠️ 重要鉴别——并非所有钙化都是良性：上述良性定义仅适用于致密完全钙化或典型爆米花样粗大钙化。若为'散在点状微小钙化不均匀分布于磨玻璃结节（GGO）内部'，该类钙化不具备良性定性意义（可见于某些腺癌的营养不良性微钙化），必须由胸外科专科医生结合完整影像进一步评估，切勿自行下'良性'定论。",
    tactics: [
      "薄层 CT 测定结节内部 CT 值（脂肪负值 -40~-120 HU 或钙化高致密 >100~300+ HU）即可一锤定音明确良性",
      "具备中心致密钙化或典型错构瘤表现的结节，指南明确指出无需任何进一步穿刺或过度手术",
      "保持健康生活作息，无需因为良性钙化结节频繁做 CT 接受无谓辐射",
    ],
    reassurance: "看到'钙化'或'错构瘤'两字应该感到庆幸！钙化是机体战胜病原体并将其石化封锁的胜利勋章，是良性病变最铁的证据，彻底放下心理包袱！",
    keyMetric: {
      label: "典型良性钙化/错构瘤恶性概率",
      value: "< 0.1% (放射学公认良性金标准)",
      source: "Radiology / ACR Lung-RADS Guidelines",
    },
    faq: [
      {
        question: "钙化结节以后会不会恶变成为肺癌？",
        answer: "不会。完全钙化的病灶内部已经是失去生物活性的钙盐结晶，没有分裂增殖能力；良性错构瘤也属于极惰性良性间叶组织肿瘤，终生恶变率极低，无需担忧。"
      }
    ],
    visualComponent: "CalcificationVisual",
    searchKeywords: ["钙化", "gaihua", "错构瘤", "爆米花钙化", "钙化灶", "肺钙化", "同心圆钙化", "良性结节", "脂肪CT值"],
  },

  // ==================== 3. 驱动基因与靶向治疗 (按风险高低排序) ====================
  {
    id: "egfr-targeted",
    category: "genetics",
    subcategory: "核心驱动基因",
    title: "EGFR 驱动基因突变与第三代靶向药 (奥希替尼等)",
    subtitle: "EGFR Mutations (19del / L858R / 20ins) & 3rd-Gen TKIs",
    icon: "🎯",
    riskLevel: "moderate",
    priorityOrder: 70,
    metaphor: "EGFR 突变就像癌细胞表面多装了一把疯狂接收生长信号的'异常开关'；而第三代靶向药物（如奥希替尼、阿美替尼、伏美替尼）就像一把高精度的专用钥匙，严密锁死这个开关，断绝癌细胞生长的能量来源。",
    clinicalTruth: "表皮生长因子受体（EGFR）突变在亚裔非吸烟肺腺癌患者中检出率高达 50% 左右。最常见的经典敏感突变为 19 号外显子缺失（19del，约占45%）和 21 号外显子 L858R 点突变（约占40%），对第三代 TKI 具有极其卓越的响应率。对于非经典突变：Exon 20 插入突变（20ins）对传统一二三代 TKI 耐药，需使用舒沃替尼（Sunvozertinib）或埃万妥单抗（Amivantamab）等特异性新药；罕见敏感突变（G719X / L861Q / S768I）首选阿法替尼或三代 TKI 治疗。",
    tactics: [
      "术后病理标本务必行 NGS 大 Panel 基因检测，明确区分是经典突变（19del/L858R）还是非经典/20ins 突变",
      "对于 IB-IIIA 期术后 EGFR 经典突变阳性患者，依据 ADAURA 顶级试验指南，术后口服奥希替尼辅助治疗可降低 83% 复发风险",
      "第三代靶向药具备极佳的血脑屏障透过率，可强效预防肺癌脑转移发生",
    ],
    reassurance: "如果您的基因检测查出了 EGFR 经典突变，在肿瘤学上被称作'上帝赠予的靶点'！因为这意味着您拥有全球研发最成熟、疗效最强劲、副作用远低于传统化疗的口服靶向武器！每天仅需口服一片药，生活质量极佳！",
    keyMetric: {
      label: "术后辅助靶向复发风险降低",
      value: "HR = 0.17 (复发风险 ↓83%)",
      source: "ADAURA Trial (NEJM 2023 / NCCN Guidelines)",
    },
    faq: [
      {
        question: "口服靶向药需要吃几年？会有很大副作用吗？",
        answer: "目前术后辅助靶向标准疗程为 3 年。第三代靶向药耐受性极好，绝大多数患者仅有轻微皮疹、腹泻或甲沟炎，对日常生活和工作几乎没有影响，远比传统化疗轻松安全。"
      },
      {
        question: "靶向药会不会耐药？术后辅助吃耐药了怎么办？",
        answer: "术后辅助治疗的目的是杀灭术后残留的微小细胞以实现根治，与晚期带瘤吃药的耐药机制不同。在完全切除状态下，体内肿瘤负荷极低，发生耐药突变的概率大幅降低。若辅助治疗结束后出现复发，应立即行液体活检（血液 ctDNA）或组织再活检，明确耐药机制（如 T790M、MET 扩增、HER2 扩增等），再针对性换用相应方案，切勿慌张。"
      }
    ],
    visualComponent: "EgfrMutationMapVisual",
    graphNodeId: "TARGETED",
    searchKeywords: ["EGFR", "奥希替尼", "靶向药", "aoxitini", "19del", "L858R", "20ins", "舒沃替尼", "阿美替尼", "伏美替尼", "基因检测"],
  },
  {
    id: "pdl1-immunotherapy",
    category: "genetics",
    subcategory: "免疫生物标志物",
    title: "PD-L1 表达与术后辅助免疫治疗",
    subtitle: "PD-L1 Expression (TPS/CPS) & Adjuvant Immunotherapy",
    icon: "🛡️",
    riskLevel: "moderate",
    priorityOrder: 68,
    metaphor: "PD-L1 就像癌细胞偷偷佩戴的'免疫伪装面具'——欺骗人体的 T 淋巴免疫细胞将其当作正常细胞；而免疫检查点抑制剂（如 PD-1/PD-L1 抑制剂）就像摘掉癌细胞的面具，唤醒人体自身的特种免疫军团将其彻底歼灭。",
    clinicalTruth: "PD-L1（程序性死亡受体-配体 1）是评估非小细胞肺癌对免疫治疗敏感性的核心生物标志物，病理报告常用肿瘤细胞阳性比例评分（TPS）表示：<1% 为阴性，1%~49% 为低表达，≥50% 为高表达。对于驱动基因全阴性（EGFR/ALK 等野生型）的 II~IIIA 期完全切除术后患者，国际顶级临床试验（IMpower010 / KEYNOTE-091）证实，含铂化疗后序贯 PD-L1 抑制剂（阿替利珠单抗）或 PD-1 抑制剂（帕博利珠单抗）辅助治疗，可显著降低复发风险。",
    tactics: [
      "术后病理标本若驱动基因为野生型（阴性），必须常规加做 PD-L1 免疫组化（22C3 或 SP263 平台）",
      "对于 II~IIIA 期且 PD-L1 TPS ≥1% 的术后患者，指南推荐在辅助化疗后序贯使用 1 年免疫辅助治疗（依据中国 NMPA 最新获批适应症与多学科 MDT 综合讨论决定）",
      "对于 PD-L1 TPS ≥50% 的高表达患者，免疫治疗获益幅度最大，复发风险可降低 57%（IMpower010 数据）",
    ],
    reassurance: "如果您的基因检测没有查出 EGFR 或 ALK 等突变，千万不要沮丧！因为这意味着您可能是'免疫治疗的黄金获益人群'！免疫治疗利用的是人体自身强大的免疫杀伤力，一旦起效具有持久的'长尾效应'，同样能够构建牢不可破的抗复发防线！",
    keyMetric: {
      label: "PD-L1 ≥50% 术后免疫辅助复发降低",
      value: "HR = 0.43 (复发风险 ↓57%)",
      source: "IMpower010 Phase III Trial (Lancet / FDA/NMPA 获批)",
    },
    faq: [
      {
        question: "我的 PD-L1 表达是 0%（阴性），是不是就完全不能用免疫药了？",
        answer: "在晚期一线治疗中，即使 PD-L1 为 0%，免疫联合化疗依然显著优于单纯化疗；在术后辅助阶段，PD-L1 ≥1% 获益最明确。若为 0%，可重点通过含铂规范化疗与定期 MRD 监测建立防线。"
      },
      {
        question: "免疫治疗和靶向治疗能同时用吗？",
        answer: "通常不推荐同时联用。EGFR 或 ALK 突变阳性患者首选靶向药物，若盲目联合免疫药不仅疗效不佳，反而容易增加间质性肺炎和肝损伤毒性。严格遵循指南用药最安全！"
      }
    ],
    visualComponent: "PdL1ImmuneMechanismVisual",
    searchKeywords: ["PD-L1", "免疫治疗", "mianyizhiliaol", "阿替利珠单抗", "帕博利珠单抗", "TPS", "IMpower010", "KEYNOTE-091", "免疫检查点"],
  },
  {
    id: "rare-mutations",
    category: "genetics",
    subcategory: "其他靶向基因",
    title: "ALK / ROS1 / KRAS / RET / HER2 / BRAF 靶向武器库",
    subtitle: "Precision Therapies: ALK, ROS1, KRAS G12C, RET, HER2, BRAF V600E",
    icon: "🧬",
    riskLevel: "moderate",
    priorityOrder: 65,
    metaphor: "非小细胞肺癌就像一把拥有数十种不同锁眼的锁——除了最常见的 EGFR 锁眼，还有 ALK（钻石靶点）、ROS1、KRAS 等锁眼。现代医学已经为几乎每一个突变研发了专属的定制高精度钥匙。",
    clinicalTruth: "精准肿瘤学已进入全靶点时代，肺腺癌常见少见/罕见靶点均有成熟特效药：\n• ALK 融合（5~7%）：钻石靶点，阿来替尼（ALINA 试验证实术后辅助复发风险降低 76%）、布格替尼、三代洛拉替尼；\n• ROS1 融合（1~2%）：克唑替尼、恩曲替尼、新一代瑞普替尼（Repotrectinib）；\n• KRAS G12C（3~5%）：氟泽雷塞（达伯特）、格索雷塞、索托拉西布、阿达格拉西布；\n• RET 融合（1~2%）：高选择性普拉替尼（Pralsetinib）、塞珀替尼（Selpercatinib）；\n• HER2 突变（2~4%）：抗体偶联药物（ADC）德曲妥珠单抗（T-DXd / DS-8201）；\n• BRAF V600E（1~2%）：达拉非尼联合曲美替尼（双靶方案）；\n• NTRK 融合（<1%）：拉罗替尼、恩曲替尼（广谱神药，ORR >75%）。",
    tactics: [
      "推荐使用包含 DNA+RNA 的大 Panel NGS 基因检测，一次性覆盖 EGFR/ALK/ROS1/KRAS/RET/MET/HER2/BRAF/NTRK 全部核心驱动基因",
      "ALK 阳性患者根据 ALINA 试验（NEJM 2024 成熟数据）：术后口服阿来替尼辅助治疗（2年），4年DFS高达 76.4% vs 化疗组 41.3%（HR=0.24，复发降低 76%）",
      "⚠️ 重要提示：KRAS G12C 抑制剂（sotorasib / adagrasib / 氟泽雷塞）目前适应症主要为晚期二线治疗，术后辅助阶段尚无 III 期 RCT 支持，请勿自行购药使用",
      "驱动基因全阴性患者（野生型）重点评估 PD-L1 表达，积极储备免疫联合化疗治疗依据",
    ],
    reassurance: "无论检测出哪种基因突变，现代精准肿瘤学都拥有层出不穷的靶向新药武器。即使所有基因均为阴性（野生型），免疫治疗（如 PD-1/PD-L1 抑制剂）联合化疗也为患者带来了前所未有的长期生存与临床治愈奇迹！",
    keyMetric: {
      label: "ALK 术后辅助靶向复发风险降低",
      value: "HR = 0.24 (复发风险 ↓76%)",
      source: "ALINA Phase III Trial (NEJM 2024 / NCCN 2024)",
    },
    faq: [
      {
        question: "基因检测做多少个基因合适？几百个基因的套餐有必要吗？",
        answer: "对于肺腺癌初诊患者，涵盖 10~50 个肺癌核心指南推荐基因的标准 Panel 已经能够满足 98% 以上的临床用药指导需求。几百个基因的超大套餐多用于罕见耐药机制研究，常规初诊按临床医生建议选择标准套餐即可。"
      }
    ],
    searchKeywords: ["ALK", "阿来替尼", "KRAS", "ROS1", "RET", "MET", "HER2", "BRAF", "NTRK", "氟泽雷塞", "德曲妥珠单抗", "基因检测", "钻石靶点"],
  },
  {
    id: "met-exon14-skip",
    category: "genetics",
    subcategory: "其他靶向基因",
    title: "MET 14 外显子跳跃突变与精准靶向新武器",
    subtitle: "MET Exon 14 Skipping Mutation & Highly Selective MET-TKIs",
    icon: "⚡",
    riskLevel: "moderate",
    priorityOrder: 62,
    metaphor: "像细胞生长发动机的'刹车片螺丝松脱了'——原本负责降解发动机信号的 14 号零件被跳过，导致生长信号持续狂飙；高选择性 MET 靶向药就像给这台发动机装上了专用强力刹车片，迅速刹住异常增殖。",
    clinicalTruth: "MET 14 外显子跳跃突变（MET exon 14 skipping）是非小细胞肺癌中明确的强致癌驱动基因，在肺腺癌中发生率约 3%~4%，在肺肉瘤样癌中高达 20%~30%，多见于高龄（>65岁）或女性非吸烟患者。目前已有包括谷美替尼（Glumetinib）、赛沃替尼（Savolitinib）、特泊替尼（Tepotinib）、卡马替尼（Capmatinib）等多款特异性高选择性 MET 抑制剂获批上市，疾病控制率极高。",
    tactics: [
      "NGS 基因检测时务必选择同时覆盖 DNA 与 RNA 水平的 Panel，避免单纯 DNA 测序遗漏剪接位点突变",
      "确诊 MET 14 跳跃突变后，优先选用获批的高选择性 MET-TKI 进行规范精准靶向打击",
      "定期监测肝功能及外周水肿（MET 靶向药主要不良反应，多为轻中度可控）",
    ],
    reassurance: "过去 MET 突变常被认为缺乏特效药，但近年来随着国产与国际高选择性 MET 靶向药物的爆发式获批，MET 14 跳跃突变已经从'难治靶点'彻底转变为'高效可控靶点'！口服靶向治疗响应迅速、耐受良好，带来了极高质量的生存期！",
    keyMetric: {
      label: "MET-TKI 靶向治疗客观缓解率",
      value: "ORR 可达 65% ~ 70%+",
      source: "GLORY / GEOMETRY mono-1 / VISION Trials",
    },
    faq: [
      {
        question: "MET 扩增和 MET 14 外显子跳跃突变是一回事吗？",
        answer: "不是。MET 14 跳跃是原发基因结构的剪接突变，属于特异性驱动基因；MET 扩增则是基因拷贝数增多，常作为三代 EGFR 靶向药耐药后的旁路激活机制。两者临床用药策略有所不同。"
      }
    ],
    searchKeywords: ["MET", "MET14跳跃", "谷美替尼", "赛沃替尼", "卡马替尼", "特泊替尼", "MET exon 14", "MET基因"],
  },

  // ==================== 4. 术后康复与长期随访 (按风险高低排序) ====================
  {
    id: "adjuvant-decision-map",
    category: "recovery",
    subcategory: "多学科决策",
    title: "术后辅助治疗科学决策路线图 (观察 vs 靶向 vs 免疫 vs 化疗)",
    subtitle: "Postoperative Adjuvant Therapy: When, Why & Which?",
    icon: "🗺️",
    riskLevel: "low",
    priorityOrder: 30,
    metaphor: "像建筑完工后的不同级别安保防线——地基极坚固、无任何隐患的早期工程（IA期）只需日常物业巡检（定期随访）；若遇到跨度大或存在局部高危的工程（IB-IIIA期），则需要根据图纸加装定制的红外激光防护锁（靶向/免疫药物）。",
    clinicalTruth: "肺癌术后是否需要辅助治疗有着严格的国际循证指南标准（NCCN / CSCO / ESMO）：\n• IA1 / IA2 / IA3 期（切缘 R0）：5年生存率 >90%~100%，全球所有指南公认**无需任何术后辅助化疗、靶向或放疗**，单纯规律随访就是最优解，盲目过度吃药反而增加肝肾负担；\n• IB 期：不常规推荐化疗；若伴有高危因素（微血管侵犯、STAS、高危IASLC分级、肿瘤实性径接近4cm）且 EGFR 突变阳性，ADAURA 试验证实口服三代靶向药（奥希替尼）辅助治疗可显著降低复发；\n• IIA / IIB / IIIA 期：全套辅助治疗防线核心战场——EGFR 突变阳性首选靶向治疗（3年）；ALK 阳性首选阿来替尼（2年）；驱动基因野生型首选含铂双药化疗 4 周期，序贯 1 年 PD-L1/PD-1 免疫辅助治疗。",
    tactics: [
      "严格依据术后终极病理 TNM 分期与基因检测报告做决定，切忌盲目与病友互相比较或私自滥用药物",
      "IA 期患者应树立纯随访信心，无需焦虑'为什么医生不给我开抗癌药'，不吃药恰恰说明您的病情极早、治愈率极高",
      "需辅助治疗的患者，务必在术后身体恢复良好（通常术后 4~8 周内）开始规范启动",
    ],
    reassurance: "医学的最高境界是'既不治疗不足，也绝不过度医疗'！对于极早期患者，外科手术的物理切除已经达到了 100% 根治目的；对于需要辅助防护的患者，现代靶向和免疫武器能提供极其精准高效的保驾护航！",
    keyMetric: {
      label: "IA 期术后单纯随访 5 年生存率",
      value: "> 92% ~ 100% (无需过度用药)",
      source: "NCCN Non-Small Cell Lung Cancer Guidelines 2024",
    },
    faq: [
      {
        question: "同病房的病友术后口服靶向药，我为什么医生让我什么药都不用吃？",
        answer: "这恰恰是天大的好消息！说明您的病理分期处于极早期（如 IA 期），肿瘤已被手术彻底根治。国际指南数万例临床数据显示，极早期患者单纯规律随访的效果与用药一样完美，不吃药可以完全避免药物副作用与经济负担！"
      }
    ],
    visualComponent: "AdjuvantDecisionTreeVisual",
    searchKeywords: ["辅助治疗", "术后化疗", "术后靶向", "fuzhuzhiliao", "IA期用药", "IB期高危", "ADAURA", "辅助免疫", "术后吃药"],
  },
  {
    id: "lung-rads-screening",
    category: "nodule",
    subcategory: "影像风险分级",
    title: "ACR Lung-RADS 肺结节影像风险分级系统 (1~4X 类)",
    subtitle: "American College of Radiology Lung-RADS Assessment System",
    icon: "🏷️",
    riskLevel: "low",
    priorityOrder: 38,
    metaphor: "像国际通用的'交通安全评级系统'——从绿色畅通（1/2类良性）到黄色减速观察（3类），再到橙红色专家会诊（4类），每一个等级都有全球严谨制定的安全通行准则。",
    clinicalTruth: "美国放射学会（ACR）Lung-RADS 是全球低剂量胸部 CT（LDCT）肺癌筛查的标准化分级工具：\n• 1 类（阴性）：无结节或确定良性钙化/错构瘤（恶性率 <1%），常规 12 个月年度体检；\n• 2 类（良性表现）：<6mm 实性结节或 <30mm 纯磨玻璃结节（恶性率 <1%），继续 12 个月年度筛查；\n• 3 类（可能良性）：6~8mm 实性结节或 ≥6mm 且实性成分 <6mm 的亚实性结节（恶性率 1%~2%），建议 6 个月后复查薄层 CT；\n• 4A 类（可疑恶性）：8~15mm 实性结节或实性成分 ≥6mm 结节（恶性率 5%~15%），建议 3 个月复查或 PET-CT 评估；\n• 4B 类（高度可疑）：≥15mm 实性结节（恶性率 >15%），推荐胸外科门诊进行多学科评估及组织活检/微创切除；\n• 4X 类（附加高危征象）：任何等级的结节伴随高危附加征象（如短细毛刺、纵隔/肺门淋巴结肿大、快速增大超过 1.5mm/月），恶性率显著高于 4B，需立即行专科 MDT 会诊与病理活检/切除。",
    tactics: [
      "若体检报告结论为 Lung-RADS 1 类或 2 类，完全无需焦虑恐慌，严格维持每年一次的常规体检即可",
      "若为 Lung-RADS 3 类，遵医嘱按时于 6 个月后复查薄层 CT，绝大多数在复查中证实为稳定良性",
      "若为 4A 或更高评级，携带完整电子胶片前往三甲医院胸外科门诊进行专科阅片",
    ],
    reassurance: "初次体检筛查中超过 90% 的人被归为 Lung-RADS 1 类或 2 类。哪怕被评为 3 类甚至 4A 类，良性概率依然高达 85%~98%！Lung-RADS 的目的不是'确诊肺癌'，而是帮助放射科医生在保护健康肺脏的前提下，精准规划最经济安全的随访节奏！",
    keyMetric: {
      label: "Lung-RADS 1/2 类恶性概率",
      value: "< 1% (极低风险，按年筛查)",
      source: "ACR Lung-RADS v2022 / National Lung Screening Trial (NLST)",
    },
    faq: [
      {
        question: "报告上写 Lung-RADS 4A 是不是代表我得肺癌了？",
        answer: "完全不是！4A 类代表结节有一定形态特征需要更密切的关注（如 3 个月后复查），在 4A 类人群中，最终证实为良性感染、机化或陈旧病灶的比例仍高达 85%~90% 以上！"
      }
    ],
    visualComponent: "LungRadsScaleVisual",
    searchKeywords: ["Lung-RADS", "肺结节分级", "LungRADS", "4A类结节", "3类结节", "2类结节", "ACR", "低剂量CT筛查"],
  },
  {
    id: "tumor-markers",
    category: "recovery",
    subcategory: "血液指标认知",
    title: "五大肺癌肿瘤标志物轻度波动破译 (CEA / CYFRA21-1 / NSE / ProGRP / SCC)",
    subtitle: "Understanding Tumor Marker Fluctuations & False Positive Factors",
    icon: "📈",
    riskLevel: "low",
    priorityOrder: 25,
    metaphor: "像人体的敏感体温计——感冒发烧时体温会升高，天气炎热或剧烈运动后也会轻微晃动。吸烟、胃炎、溶血或标本批次差异都会让指标轻微起伏；只要胸部 CT 影像学没有新病灶，单次轻度升高绝不代表复发！",
    clinicalTruth: "临床常用的 5 大肺癌血清标志物谱系及其临床特征：\n• CEA（癌胚抗原）：肺腺癌主要标志物，吸烟、慢性胃炎、结肠息肉常引起轻度非特异性假阳性升高；\n• CYFRA21-1（细胞角蛋白19片段）：肺鳞癌/腺癌敏感指标，肾功能不全、间质性肺炎、良性感染可致轻度偏高；\n• NSE（神经元特异性烯醇化酶）：小细胞肺癌/神经内分泌肿瘤标志物，采血标本轻度'红细胞溶血'是临床最常见的假阳性原因；\n• ProGRP（胃泌素释放肽前体）：小细胞肺癌高特异性指标，肾功能减退时代谢减缓可轻度升高；\n• SCC（鳞状细胞癌抗原）：肺鳞癌特异指标，皮肤湿疹、银屑病、皮炎或皮肤汗液污染均可引起假阳性。\n临床判断复发始终以高分辨率薄层 CT 影像学检查为金标准，切忌仅凭一次轻微波动自我吓唬。",
    tactics: [
      "单次轻度升高（如 CEA 参考值 0~5 查出 5.8，或 NSE 18）切忌恐慌，建议间隔 1 个月在同一家医院原仪器复查观察动态趋势",
      "只有出现'进行性、成倍持续翻倍升高'（如 CEA 从 5 升到 18 再升到 50+）才提示需安排胸腹增强 CT、头部 MRI 或 PET-CT 排查",
      "严格戒烟可显著消除 CEA/CYFRA21-1 假阳性干扰，并大幅保护剩余健康肺功能",
    ],
    reassurance: "门诊中 85% 以上因为体检单上指标箭头偏高吓得痛哭流涕的患者，复查 CT 后均证实完全正常。标志物只是血液哨兵的一声偶发咳嗽，影像学 CT 才是真正的最高法官。请彻底放下每天刷指标数值的精神内耗！",
    keyMetric: {
      label: "肿瘤标志物单次升高良性假阳性率",
      value: "约 20 ~ 35% (良性生理/炎症因素引起)",
      source: "Clinical Chemistry / CSCO Non-Small Cell Lung Cancer Guidelines 2024",
    },
    faq: [
      {
        question: "我的 CEA 术前是 2.1 正常，术后 3 个月复查变成 4.8（依然在 5 以内），这算升高吗？",
        answer: "在正常参考值范围内的数值波动（2.1 ➔ 4.8）完全属于人体的正常生理代谢和检测仪器批次系统误差，没有任何临床病理学恶性意义，请完全放心！"
      },
      {
        question: "抽血查出 NSE 偏高（如 21，参考值 <16.3），是不是得了小细胞肺癌？",
        answer: "绝大多数不是！正常红细胞内含有大量 NSE，抽血时只要有轻微溶血（标本运输震荡或拔针挤压），红细胞破裂释放出的 NSE 就会导致数值升高。若无临床症状且 CT 正常，间隔 2~4 周复查即可恢复正常。"
      }
    ],
    searchKeywords: ["CEA", "CYFRA21-1", "NSE", "ProGRP", "SCC", "肿瘤标志物", "zhongliubiaozhiwu", "癌胚抗原", "指标偏高", "溶血假阳性", "标志物波动"],
  },
  {
    id: "postop-symptoms",
    category: "recovery",
    subcategory: "身体恢复",
    title: "术后咳喘、胸闷与切口隐痛的科学调适",
    subtitle: "Postoperative Cough, Tightness & Pulmonary Rehabilitation",
    icon: "🫁",
    riskLevel: "low",
    priorityOrder: 20,
    metaphor: "房子刚做完结构装修改造，管道重新连接、墙壁电线需要重新适应。切除部分肺叶后，剩余的健康肺组织需要几个月时间慢慢膨胀填补空隙，神经末梢也在悄悄修复连接。",
    clinicalTruth: "肺部手术后 1~6 个月内，患者常出现阵发性刺激性干咳（支气管残端缝合刺激及气道神经敏感）、胸部发紧束带感（肋间神经损伤修复）以及活动后轻度气促（残肺代偿膨胀期）。量化临床数据显示：解剖性肺段切除术后可保留术前 90% 以上的肺功能（FEV1/FVC），标准肺叶切除术后代偿期结束后通常可恢复至术前 80%~85% 的肺功能水平，完全不影响日常生活、散步慢跑或轻中度运动。",
    tactics: [
      "术后早期使用呼吸训练器（吹三色球），每日规律练习深呼吸与腹式呼吸，促进残肺充分复张",
      "刺激性干咳可在医生指导下短期使用温和镇咳药（如复方甲氧那明、右美沙芬）或雾化吸入治疗",
      "适度进行散步、太极等有氧运动，循序渐进提高肺活量，切忌长期卧床不动",
    ],
    reassurance: "胸闷和咳嗽是身体在努力自我修复的信号，而不是疾病复发的表现。给身体一点耐心和时间，绝大多数患者在术后半年到一年都能完全恢复正常的工作与运动生活！",
    keyMetric: {
      label: "术后肺功能长期代偿保留率",
      value: "肺段切除保留 >90% / 肺叶切除恢复 80~85%",
      source: "ERAS Guidelines for Thoracic Surgery / JCOG0802",
    },
    faq: [
      {
        question: "术后咳嗽吃抗生素（消炎药）管用吗？",
        answer: "通常不管用！术后咳嗽多为支气管残端神经敏感引起的无菌性物理刺激反射，而不是细菌感染。除非伴有高热、咳黄脓痰，否则不应盲目滥用抗生素。"
      },
      {
        question: "切除一个肺叶后，以后是不是就不能运动了？",
        answer: "完全不是！人体拥有强大的肺代偿储备能力。正常人平时仅动用了约 30% 的肺泡储备。经过 3~6 个月充分代偿复张后，绝大多数患者完全可以正常游泳、慢跑、爬山，与健康人无异！"
      }
    ],
    searchKeywords: ["术后咳嗽", "胸闷", "伤口疼", "shuhoukesou", "肋间神经痛", "吹气球", "肺功能恢复", "肺代偿"],
  },
  {
    id: "surgical-approaches",
    category: "pathology",
    subcategory: "手术方式与肺功能",
    title: "肺部微创手术方式解密 (楔形 vs 肺段 vs 肺叶 vs 袖状切除)",
    subtitle: "Surgical Resections: Wedge, Segmentectomy, Lobectomy & Sleeve",
    icon: "🔪",
    riskLevel: "safe",
    priorityOrder: 75,
    metaphor: "像果树修剪——发现一个小斑点（微小纯磨玻璃），只需轻轻摘掉一两片病叶（楔形或肺段切除），保留整根大树枝的生机；若病灶较深或实性较多，则规范切除整根树枝（肺叶切除），彻底杜绝后患。",
    clinicalTruth: "现代胸外科严格依据结节大小、位置与实性成分（CTR）量体裁衣选择术式：\n• 楔形切除（Wedge）：非解剖性局部切除，仅适用于肺外周 1/3 的微小纯磨玻璃结节（AIS/MIA）或高龄心肺功能极差者；\n• 解剖性肺段切除（Segmentectomy）：JCOG0802 与 CALGB 140503 国际顶级多中心 RCT 证实，对于外周 ≤2cm 且 CTR ≤0.5 的早期肺癌，肺段切除总生存率甚至略优于肺叶切除（5年 OS 94.3% vs 91.1%），并能保留 90%+ 的健康肺功能；\n• 标准肺叶切除（Lobectomy）：实性成分 >2cm 或 CTR >0.5 的浸润性肺癌标准根治金标准；\n• 袖状成形切除（Sleeve）：对于侵犯主支气管或肺动脉干的中央型肺癌，通过袖状吻合成形切除病变，成功避免'全肺切除'，最大化拯救患者心肺功能。",
    tactics: [
      "术前通过三维 CT 支气管血管重建（3D-CTBA）精准规划肺段亚段切除靶区与切缘距离（确保切缘 ≥2cm 或 ≥肿瘤直径）",
      "CTR ≤0.5 的早期结节优先与胸外科专家沟通评估能否行保留更多肺功能的肺段微创切除",
      "术中常规送快速冰冻病理，若证实为微浸润（MIA）或原位癌（AIS），完成亚肺叶切除即达根治",
    ],
    reassurance: "现代胸外科早已告别'一刀切全叶'的粗放时代，进入'毫米级精准保肺'时代！在确保 100% 根治切除的前提下，主刀医生会像雕刻艺术品一样为您尽可能多地挽救每一片健康的肺组织！",
    keyMetric: {
      label: "≤2cm 早期肺癌肺段切除 5 年生存率",
      value: "5年 OS 94.3% (JCOG0802 柳叶刀重磅数据)",
      source: "Asamura et al., Lancet 2022 (JCOG0802/WJOG4607L)",
    },
    faq: [
      {
        question: "肺段切除和肺叶切除相比，会不会切不干净容易复发？",
        answer: "JCOG0802 国际顶级研究历时十余年随访证实：对于 ≤2cm 且 CTR ≤0.5 的外周早期肺癌，肺段切除的局部复发率完全可控，且由于保留了更多肺功能，患者长期总生存率甚至略高于肺叶切除！"
      },
      {
        question: "切除了一个肺叶，以后还会再长出来新的肺叶吗？",
        answer: "切除的肺组织不会再生出新的肺叶，但是剩余的健康肺组织会像海绵一样自然代偿性膨胀，肺泡通气储备能力大幅增强，完全能满足日常工作和运动需求。"
      }
    ],
    visualComponent: "SurgicalApproachesVisual",
    graphNodeId: "SURGERY",
    searchKeywords: ["肺段切除", "楔形切除", "肺叶切除", "袖状切除", "JCOG0802", "shoushufangshi", "亚肺叶切除", "保肺手术", "微创手术"],
  },
  {
    id: "vats-robotic-surgery",
    category: "pathology",
    subcategory: "现代外科技术",
    title: "单孔胸腔镜 (VATS) 与达芬奇机器人手术原理",
    subtitle: "Uniportal VATS & Da Vinci Robotic Thoracic Surgery",
    icon: "🤖",
    riskLevel: "safe",
    priorityOrder: 72,
    metaphor: "像在胸壁上开了一扇仅 2~3 厘米的'微型钥匙孔'，医生通过高清晰度的'电子鹰眼'将胸腔放大 10~15 倍，再通过比人手还灵活的机械微型巧手进行毫米级精细分离，既不切断肋骨也不大动干戈。",
    clinicalTruth: "现代胸部微创外科已全面普及单孔/多孔胸腔镜（VATS）及达芬奇机器人辅助手术（RATS）：\n• 单孔胸腔镜（Uniportal VATS）：仅通过腋下一个 2.5~3.5cm 单一微小切口，利用交叉力线技术完成解剖性切除与淋巴结清扫，不切断肋骨、不撑开肋骨，极大减轻术后神经压迫疼痛；\n• 达芬奇机器人（RATS）：拥有裸眼 3D 超高清双目视野（放大 15 倍）及具有 7 个自由度、540° 旋转能力的 EndoWrist 仿真机械手，完全滤除人手生理震颤，在狭窄深邃的纵隔深处清扫淋巴结时出血量极少、游离极精细；\n• 肿瘤安全保障：切除的肺标本均严格装入特制无菌医用标本袋内完整取出，全程零接触切口，彻底杜绝切口种植转移风险。",
    tactics: [
      "微创手术创伤小，术后 6 小时即可在护士协助下适度下床活动，促进血液循环与胃肠复苏",
      "术后配合多模式镇痛方案（肋间神经阻滞等），无需强忍切口疼痛，保障有效咳嗽排痰",
      "绝大多数规范微创手术患者术后 2~4 天即可达到拔管出院标准（加速康复 ERAS 标准流程）",
    ],
    reassurance: "不用担心切口小会'看不清'或'切不干净'！微创胸腔镜和机器人的高清摄像头能把毛细血管和神经放大数十倍，视野远比几十年前的大开胸肉眼更加清晰逼真！小切口，大根治！",
    keyMetric: {
      label: "微创胸腔镜术后快速康复出院率",
      value: "术后 2~4 天出院率 >90%",
      source: "ERAS Society Guidelines for Thoracic Surgery 2023",
    },
    faq: [
      {
        question: "微创手术会不会因为切口小，肿瘤拿出来的时候被挤破？",
        answer: "绝对不会！切除标本后，主刀医生会先将标本完全套入高强度的医用标本袋并拉紧封口，在完全密封状态下通过微创切口移出体外，标本完全不接触切口周围组织，安全性极高。"
      },
      {
        question: "达芬奇机器人手术是机器自己做，还是医生在操作？",
        answer: "完全是由主刀专家亲自实时操控！医生坐在高精度的操控台前，机器人机械臂精确同步复制医生双手的每一个微动作，并实时过滤手部抖动，本质是顶尖专家的'超级机械神手'。"
      }
    ],
    graphNodeId: "SURGERY",
    searchKeywords: ["胸腔镜", "单孔胸腔镜", "VATS", "达芬奇机器人", "RATS", "weichuang", "小切口", "标本袋", "加速康复"],
  },
  {
    id: "multiple-primary-lung-cancer",
    category: "nodule",
    subcategory: "多发结节管理",
    title: "双肺多发结节与第二原发肺癌 (MPLC vs 转移)",
    subtitle: "Multiple Primary Lung Cancer (MPLC) vs Metastasis",
    icon: "🌱",
    riskLevel: "moderate",
    priorityOrder: 42,
    metaphor: "像一棵苹果树上不同枝头各自长出了几颗小苹果（多发原发），而不是这颗苹果掉下来砸到了另一根树枝（转移扩散）。它们各有各的生长节奏，各自处于极早期，互不相干。",
    clinicalTruth: "体检筛查中约 20%~30% 的磨玻璃结节表现为双肺多发（Multiple GGO）。临床病理学与基因测序已彻底证实：多发 GGO 绝大多数属于**同步多原发肺癌（MPLC）**，即双肺不同部位在致癌微环境下各自独立发生的早期病变，而非'肺内转移'！\n• 鉴别金标准（2022 IASLC / ATS 联合声明更新标准）：优先使用多区域 NGS 克隆来源分析或全外显子组测序（WES）进行分子层面鉴别；若各结节具有不同病理组织亚型（如一处为贴壁型，另一处为腺泡型）或不同驱动基因突变（如一处 EGFR 19del，另一处 L858R 或野生型），即可确认为各自独立的原发病灶；\n• 临床处理核心原则：'抓大放小、主次分明、保护肺功能'——优先切除或干预实性成分显著的主病灶（CTR > 0.5），对其他微小纯磨玻璃结节长期随访观察，切忌一次性做大范围切除导致肺功能严重受损。",
    tactics: [
      "双肺多发 GGO 首次发现切忌恐慌盲目做'双侧大范围切除'，必须经历 3~6 个月系统随访摸清各结节生长速度",
      "由多学科 MDT 团队制定'主病灶微创局部切除 + 次要病灶继续安全随访'的梯度管理方案",
      "术后次要结节若长期稳定（VDT > 600天），终身可能无需任何手术干预",
    ],
    reassurance: "查出多发磨玻璃结节千万不要以为是'癌细胞播散全身了'！多发 GGO 在我国非常普遍，尤其是非吸烟女性群体。它们只是双肺土壤中同时长出的几颗微小幼苗，只要按照指南科学管理，完全可以实现长期的健康与长寿！",
    keyMetric: {
      label: "多发 GGO 同步多原发占比",
      value: "> 95% (各病灶均为独立早期原发，非转移)",
      source: "IASLC / ACCP Guidelines on Multiple Pulmonary Nodules",
    },
    faq: [
      {
        question: "我左肺切除了一颗 8mm 早期腺癌，右肺还有两颗 4mm 纯磨玻璃结节，必须接着做手术吗？",
        answer: "完全不需要立即开刀！右肺 4mm 纯磨玻璃结节属于极惰性的微小原发病灶，恶性度极低。继续规律随访薄层 CT 即可，绝大多数数年甚至终身都不会长大，盲目急于开刀反而白白损伤右肺功能。"
      },
      {
        question: "多发结节是不是代表我体内的基因有'易感体质'？",
        answer: "在亚裔人群中，由于特定微环境和遗传多态性，呼吸道上皮确实可能存在局部的'区域化效应'（Field Cancerization），但只要定期随访，把控住高危主病灶，就不会对寿命造成任何实质威胁。"
      }
    ],
    visualComponent: "MPLCGGOVisual",
    graphNodeId: "CTR",
    searchKeywords: ["多发结节", "多发GGO", "MPLC", "多原发肺癌", "duofajiejie", "双肺结节", "第二原发", "肺内转移鉴别", "区域化"],
  },
  {
    id: "followup-schedule",
    category: "recovery",
    subcategory: "随访规划",
    title: "术后科学复查全周期时间表与检查清单",
    subtitle: "Postoperative Surveillance Schedule: When & What to Check?",
    icon: "📅",
    riskLevel: "safe",
    priorityOrder: 28,
    metaphor: "像新车出厂后的定期保养手册——前 2 年新车磨合期保养稍微密集一点（每半年一次），3~5 年后平稳期每年体检一次。每一次规律盖章打卡，都是为健康长治久安设立的科学安全阀门。",
    clinicalTruth: "依据国际 NCCN / CSCO 非小细胞肺癌术后随访指南，规范的复查时间表与核心检查项目清单如下：\n• 术后第 1~2 年（复发监测黄金期）：每 3~6 个月复查一次胸部薄层 CT 平扫（推荐低剂量 HRCT）、腹部超声/CT 及 5 项肺癌肿瘤标志物；对于 II~IIIA 期高危患者，每年复查一次头部增强磁共振（MRI）；\n• 术后第 3~5 年（平稳巩固期）：每 6~12 个月复查一次胸部薄层 CT 与肿瘤标志物；\n• 术后 5 年以上（临床治愈长青期）：每年进行一次常规胸部低剂量 CT 筛查（同正常人群年度体检）；\n• 循证避坑提醒：无任何临床症状时，**指南不推荐常规做全身 PET-CT 或骨扫描**（避免无谓的巨额花费与超高剂量辐射），CT 发现可疑病变时才按需使用。",
    tactics: [
      "尽量固定在同一家三甲医院的同一台薄层 CT 机器上复查，确保前后影像层厚与密度测量具有最高精度的可比性",
      "建立自己的专属复查电子档案，妥善保存每次出院小结、病理报告与 CT 电子胶片二维码",
      "对于 II~IIIA 期高危患者，NCCN 2024 已将血液 ctDNA（微小残留病灶 MRD）检测列为推荐选项——可在关键随访节点加做液体活检，为最早期复发信号提供分子层面的专属监测",
      "若术后出现持续性骨痛、剧烈头痛或咯血等新发症状，无需等到既定复查日，应及时返院就诊",
    ],
    reassurance: "只要平稳度过术后前 2 年，复发风险就会呈断崖式下降！满 5 年未见复发在医学上即定义为'临床治愈'！遵从指南的节奏去复查，把每一次复查当作给身体做一次安心的年度保养！",
    keyMetric: {
      label: "术后满 5 年无复发临床治愈率",
      value: "早期患者 > 90% (5年即达临床治愈标准)",
      source: "NCCN Post-treatment Surveillance / IASLC Database",
    },
    faq: [
      {
        question: "每次复查做 CT 辐射大不大？会不会致癌？",
        answer: "现代低剂量薄层 CT（LDCT）的单次辐射剂量仅为约 1~1.5 mSv（相当于自然界半年的天然背景辐射），远远低于国家辐射安全警戒线。半年或一年做一次低剂量 CT 极其安全，完全无需担心辐射致病。"
      },
      {
        question: "为什么医生每次只给我开胸部 CT，不开全身 PET-CT？",
        answer: "因为胸部薄层 CT 对肺部微米级结构的显示分辨率远高于 PET-CT（CT 能看清 1mm 结节，PET-CT 对 <8mm 结节假阴性率极高），且没有放射性同位素注射。薄层 CT 才是肺部复查无可争议的第一金标准！"
      }
    ],
    visualComponent: "FollowupTimelineVisual",
    graphNodeId: "RECOVERY",
    searchKeywords: ["复查时间表", "术后复查", "随访清单", "shouhoufucha", "复查项目", "PET-CT必要性", "CT辐射", "5年治愈"],
  },
  {
    id: "postop-nutrition-lifestyle",
    category: "recovery",
    subcategory: "生活重塑",
    title: "术后康复营养与健康生活方式重塑 (破除发物误区)",
    subtitle: "Nutrition, Rehabilitation & Lifestyle Rebuilding",
    icon: "🥗",
    riskLevel: "safe",
    priorityOrder: 18,
    metaphor: "刚修整好的房屋需要优质的钢筋和水泥（充足蛋白质与维生素）来加固地基。盲目忌口只会让身体营养不良、免疫军团断粮，科学均衡地吃好每一顿饭才是抗癌最强大的内生力量。",
    clinicalTruth: "肿瘤营养学与术后加速康复（ERAS）循证指南明确指导：\n• 蛋白质是伤口愈合与残肺代偿的基石：术后建议每日摄入优质蛋白质 1.2~1.5 g/kg 体重（如鸡蛋每日 1~2 个、鱼虾海鲜、去皮禽肉、瘦牛肉、豆制品及优质乳清蛋白粉）；\n• 彻底破除民间'发物'伪科学：现代医学证实牛羊肉、海鲜鸡肉中富含人体必需氨基酸与铁锌微量元素，盲目禁食所谓的'发物'会导致严重的低蛋白血症、切口愈合迟缓和免疫力断崖式暴跌；\n• 远离真正的明确致癌物：严格戒烟、拒吸二手烟、避免厨房高温重油烟（烹饪时保持油烟机开启）、减少腌制熏制及加工肉制品；\n• 运动康复处方：术后循序渐进进行散步、吹气球（呼吸训练器）、八段锦或太极，促进胸腔积液吸收与残肺复张。",
    tactics: [
      "每日保持彩虹饮食：摄入新鲜深色蔬菜与低糖水果（蓝莓、西红柿、西兰花等），补充天然抗氧化植化素",
      "术后 3 个月内避免提举重物（>5kg）或剧烈扩胸冲撞运动，防止肋间神经与伤口深层筋膜过度牵拉",
      "保持每晚 7~8 小时高质量睡眠，良好的生物节律是机体自然杀伤细胞（NK 细胞）维持活性的关键保障",
    ],
    reassurance: "世界上没有单一的'抗癌神药'，最好的抗癌武器就是您自己健康强大的免疫系统！吃得好、睡得香、心情好、多散步，用阳光科学的生活方式拥抱充满希望的崭新生活！",
    keyMetric: {
      label: "充足蛋白质营养对术后并发症影响",
      value: "伤口愈合加速 / 感染风险 ↓45%",
      source: "ESPEN Guidelines on Clinical Nutrition in Surgery 2023",
    },
    faq: [
      {
        question: "听说吃牛肉、海鲜是'发物'会促进肿瘤复发，是真的吗？",
        answer: "毫无科学依据！'发物'是民间伪科学传言。肿瘤细胞生长依赖异常基因突变信号，而不是正常食物。相反，牛羊肉和海鲜富含优质蛋白和血红素铁，是人体免疫 T 细胞和红细胞必不可少的原料，必须保证摄入！"
      },
      {
        question: "术后需要吃灵芝孢子粉、人参、海参等贵重补品吗？",
        answer: "日常平价的鸡蛋、鱼肉、瘦肉和新鲜蔬菜所提供的均衡营养，效果远超任何昂贵保健品。保健品不能替代正餐，且部分成分不明的补品还可能增加肝肾代谢负担。均衡饮食最健康！"
      }
    ],
    graphNodeId: "RECOVERY",
    searchKeywords: ["术后饮食", "发物误区", "蛋白质补充", "shouhouyinshi", "灵芝孢子粉", "戒烟", "海鲜能不能吃", "营养康复", "运动处方"],
  },
  {
    id: "tmb-msi",
    category: "genetics",
    subcategory: "免疫生物标志物",
    title: "肿瘤突变负荷 (TMB) 与微卫星不稳定性 (MSI)",
    subtitle: "Tumor Mutational Burden (TMB-H) & Microsatellite Instability (MSI-H)",
    icon: "🔬",
    riskLevel: "moderate",
    priorityOrder: 66,
    metaphor: "像通缉犯身上留下的纹身与破绽——肿瘤基因突变越多（TMB 越高），细胞表面生成的'异常抗原'就越多，人体 T 淋巴免疫特警就越容易一眼识破并将其精准消灭！",
    clinicalTruth: "TMB（每兆碱基突变数，mut/Mb）与 MSI（微卫星不稳定性）是肿瘤免疫治疗的关键生物标志物：\n• TMB-H（高突变负荷，通常 ≥10 mut/Mb）：KEYNOTE-158 临床试验证实，TMB-H 患者对 PD-1/PD-L1 免疫检查点抑制剂具有更高的客观缓解率（ORR）与更长的无进展生存期（PFS），FDA 已批准帕博利珠单抗用于 TMB-H 实体瘤；\n• MSI-H / dMMR（错配修复缺陷）：在肺癌中发生率较低（<1%~2%），但一旦检出，对免疫单药治疗响应极其强烈且持久；\n• 临床指导价值：对于 EGFR/ALK 等经典驱动基因阴性（野生型）且 PD-L1 表达较低（<1%）的晚期或进展期患者，TMB-H 提供了极为宝贵的免疫治疗获益证据。",
    tactics: [
      "基因检测选择大 Panel NGS（覆盖 >1Mb 编码区），可同时精确测算 TMB 与 MSI 状态",
      "驱动基因野生型患者若测得 TMB-H（≥10 mut/Mb），免疫联合化疗或双免疫治疗具有极佳响应潜力",
      "TMB 评估应结合 PD-L1 表达及驱动基因突变谱综合解读，切忌单看单一指标做激进决策",
    ],
    reassurance: "很多没有查出 EGFR 或 ALK 突变的患者误以为自己'无药可用'，但若检测出 TMB 高表达（TMB-H），说明您的肿瘤是免疫治疗的天然绝佳靶标！人体自身的特警免疫大军将发挥无可替代的长期抗癌力量！",
    keyMetric: {
      label: "TMB-H 实体瘤免疫治疗有效率提升",
      value: "ORR 翻倍 (KEYNOTE-158 FDA 获批依据)",
      source: "Marabelle et al., Lancet Oncology / FDA Biomarker Approval",
    },
    faq: [
      {
        question: "TMB 越高是不是代表病情越严重、恶性度越高？",
        answer: "不是！TMB 只反映肿瘤细胞基因层面的突变数量多寡。TMB 高恰恰意味着肿瘤细胞表面暴露给免疫系统的破绽多，免疫治疗（如 PD-1 抑制剂）起效的概率更高、疗效更持久。"
      },
      {
        question: "抽血（ctDNA）能测 TMB 吗（bTMB）？",
        answer: "可以！现代高通量 NGS 血液液体活检可测定血浆 bTMB（Blood TMB），与组织 tTMB 具有良好的相关性，适合组织标本不足的患者。"
      }
    ],
    searchKeywords: ["TMB", "MSI", "肿瘤突变负荷", "微卫星不稳定性", "TMB-H", "MSI-H", "dMMR", "免疫治疗标志物", "KEYNOTE-158"],
  },
  {
    id: "sclc-vs-nsclc",
    category: "pathology",
    subcategory: "病理组织学分型",
    title: "小细胞肺癌 (SCLC) 与非小细胞肺癌 (NSCLC) 破译",
    subtitle: "Small Cell Lung Cancer (SCLC) vs Non-Small Cell Lung Cancer (NSCLC)",
    icon: "🧬",
    riskLevel: "high",
    priorityOrder: 88,
    metaphor: "像两种性格截然不同的对手——非小细胞肺癌（腺癌/鳞癌，占 85%）像慢跑型选手，早期多表现为磨玻璃结节，适合外科微创切除与口服靶向；小细胞肺癌（占 15%）像短跑冲刺型选手，倍增极快但对化疗和放疗极其敏感！",
    clinicalTruth: "肺癌在病理学上分为两大根本宗族：\n• 非小细胞肺癌（NSCLC，约占 85%）：包含肺腺癌（最常见，占 50%+）、肺鳞癌（约 30%）、大细胞癌。早期通常通过高分辨率薄层 CT 筛查（GGO/实性结节），首选微创根治手术（肺段/肺叶切除），术后依据驱动基因（EGFR/ALK等）实施精准靶向或免疫治疗；\n• 小细胞肺癌（SCLC，约占 15%）：属于高度恶性神经内分泌癌，与重度吸烟高度相关，倍增时间极短（常仅 30~50 天），初诊时多数已有局部或远处微转移。临床分为局限期（LS-SCLC）与广泛期（ES-SCLC）。标准治疗以含铂化疗（EP方案）联合免疫治疗（阿替利珠/度伐利尤单抗）及胸部放疗为主，极早期极少数（<5%）可行手术。",
    tactics: [
      "确诊分型以病理活检及免疫组化（TTF-1/Napsin A/P40/Syn/CgA/CD56/Ki-67）为金标准，彻底明确是 NSCLC 还是 SCLC",
      "NSCLC 早期患者以胸外科根治手术为基石，术后完善大 Panel NGS 基因检测",
      "SCLC 患者应迅速由肿瘤内科/放疗科启动系统性化疗联合免疫治疗，切忌延误治疗黄金时间窗口",
    ],
    reassurance: "体检筛查发现的绝大多数肺磨玻璃结节（GGO）和亚实性结节均属于非小细胞肺癌（腺癌谱系）或良性病变，生长极其缓慢，完全处于可防可控的治愈窗口！即便是小细胞肺癌，现代免疫联合化放疗也已取得了突破性进展！",
    keyMetric: {
      label: "肺癌组织学分型构成比",
      value: "NSCLC 占 85% (腺癌首位) / SCLC 占 15%",
      source: "WHO Classification of Thoracic Tumours 5th Edition",
    },
    faq: [
      {
        question: "我体检发现的 8mm 磨玻璃结节会是小细胞肺癌吗？",
        answer: "极大概率不是！小细胞肺癌几乎从不表现为纯磨玻璃结节（GGO），它通常表现为中央型或纵隔旁快速长大的实性肿块。磨玻璃结节是非小细胞腺癌或良性病变的典型特征。"
      },
      {
        question: "非小细胞肺癌能吃靶向药，小细胞肺癌为什么一般不吃？",
        answer: "因为小细胞肺癌极少携带 EGFR 或 ALK 等经典激酶突变，其致病机制主要为 TP53 和 RB1 抑癌基因失活。因此小细胞肺癌的基石武器是强效化疗、免疫治疗与放疗。"
      }
    ],
    searchKeywords: ["SCLC", "NSCLC", "小细胞肺癌", "非小细胞肺癌", "xiaoxibao", "feixiaoxibao", "腺癌与鳞癌", "局限期", "广泛期", "神经内分泌癌"],
  },
  {
    id: "fev1-dlco-pulmonary-function",
    category: "recovery",
    subcategory: "围手术期功能评估",
    title: "围手术期心肺功能评估与 FEV1 / DLCO 指标破译",
    subtitle: "Preoperative Cardiopulmonary Evaluation: FEV1, DLCO & Surgery Safety",
    icon: "🫁",
    riskLevel: "safe",
    priorityOrder: 22,
    metaphor: "像长途自驾前给车辆测试发动机马力与油耗储备——FEV1 测试的是'主气管排气通畅度'（进出风能力），DLCO 测试的是'肺泡氧气交换吸收率'（燃烧效率）。指标达标，说明您的身体完全具备安全耐受微创切除的充足储备！",
    clinicalTruth: "胸外科术前心肺功能评估遵循国际 ERS/ESTS 肺切除指南标准化阶梯流程：\n• 第一秒用力呼气容积（FEV1）：反映通气功能。术前 FEV1 占预计值百分比（FEV1% pred）>80% 为低风险安全区间；若 >60%~80% 可安全耐受标准肺叶切除；\n• 一氧化碳弥散量（DLCO）：反映肺泡毛细血管膜气体交换能力。DLCO% pred >60% 提示术后气体交换储备良好；\n• 术后预测值（ppoFEV1% / ppoDLCO%）：对于边缘性患者（指标在 40%~60%），胸外科医生通过公式精准计算切除对应肺段/肺叶后剩余健康肺的预测值（ppoFEV1 >40% 且 ppoDLCO >40% 即为安全阈值）；\n• 阶梯测试：若指标偏低，可进一步行心肺运动试验（CPET，测定峰值耗氧量 VO2 max），若 VO2 max >15 ml/kg/min 仍可安全手术。",
    tactics: [
      "术前严格戒烟至少 2~4 周，可显著降低术后气道分泌物黏稠度与肺部感染风险",
      "术前提前使用呼吸训练器（三色球训练器）练习深吸气与吹气，每日练习 3~5 组，显著提升肺活量储备",
      "对于心肺功能轻中度受损者，优先与胸外科专家探讨解剖性肺段切除（保留 90%+ 肺功能）或单孔微创胸腔镜方案",
    ],
    reassurance: "绝大多数体检发现早期肺结节的患者，日常散步慢跑无明显气促，心肺功能测试均处于极佳的安全绿区！即便有慢性支气管炎或轻度吸烟史，现代胸外科微创解剖性肺段切除也能最大化为您守护健康肺功能！",
    keyMetric: {
      label: "肺叶切除安全门槛指标",
      value: "FEV1% pred >60% 且 DLCO% pred >60%",
      source: "ERS/ESTS Clinical Guidelines on Fitness for Radical Lung Cancer Surgery",
    },
    faq: [
      {
        question: "我有轻度哮喘/慢性支气管炎，还能做肺结节手术吗？",
        answer: "完全可以！术前通过规范雾化吸入支气管扩张剂与抗炎调理，待气道炎症控制稳定、肺功能评估达标后即可安全实施微创手术，目前高水平胸外科中心有成熟的围手术期气道管理方案。"
      },
      {
        question: "做肺功能测试时吹气吹不上来会不会影响手术？",
        answer: "肺功能检查需要患者配合全力吹气。如果是由于没有掌握吹气技巧导致的测试偏低，医生会指导您重新练习复测；必要时结合楼梯攀爬试验或心肺运动试验（CPET）综合精确评估。"
      }
    ],
    searchKeywords: ["肺功能", "FEV1", "DLCO", "feigongneng", "术前评估", "吹三色球", "ppoFEV1", "心肺储备", "VO2max", "手术耐受"],
  },
  {
    id: "preop-systemic-staging-workup",
    category: "nodule",
    subcategory: "术前全身排查解密",
    title: "术前全身大检查解密：为什么查肺癌还要做脑核磁、腹部B超与骨扫描？",
    subtitle: "Preoperative Systemic Staging Workup: Brain MRI, Ultrasound & Bone Scan Explained",
    icon: "🌐",
    riskLevel: "safe",
    priorityOrder: 25,
    metaphor: "像在起飞前对整架飞机做全系统安全航检——确认不仅机翼（肺部）完好，雷达导航（大脑）、核心油路（肝脏与肾上腺）及起落架（全身骨骼）也全部安全无碍，才能放心地开启微创手术根治之旅！",
    clinicalTruth: "根据 NCCN、CSCO 与 IASLC 国际胸部肿瘤分期评估指南，术前全身排查（Systemic Clinical Staging）是确立 M0（无远处转移）的强制性标准临床路径：\n• 🧠 脑部增强 MRI（磁共振）：肺腺癌具有亲神经趋向性，头部增强 MRI 分辨率高达 1~2mm，远超普通 CT，是排查中枢神经微转移的金标准；\n• 🩺 腹部与肾上腺超声 / 增强 CT：肺癌血行播散最偏好定植于肝脏与肾上腺，超声能以零辐射快速排查实质脏器；\n• 🩺 颈部与锁骨上浅表淋巴结超声：排查是否存在 N3 远处淋巴结转移。若锁骨上淋巴结阴性，则守住了局部根治的大门；\n• 🦴 全身骨显像 ECT 或 🌟 全身 PET-CT：排查全身骨骼代谢活跃度与隐匿骨质破坏；\n• 🛡️ 伴发良性发现排雷：体检中常见的'肝囊肿、肝血管瘤、胆囊息肉、肾囊肿、肺内钙化灶'均属于人体常见良性退行性改变，与肺癌毫无因果联系，绝非转移！",
    tactics: [
      "术前按照主治医师开具的检查单逐一完成排查，切勿因恐惧或怕麻烦而自行漏检关键的脑部 MRI 或腹部超声",
      "若超声报告提示'肝囊肿'或'胆囊壁息肉'，无需恐慌，这属于正常人群普遍存在的良性生理改变，请医生在 MDT 会诊中快速复核即可",
      "全部排查完成且均为阴性后，您将获得最高等级的'M0 根治手术通行证'，请保持从容心态迎接微创切除"
    ],
    reassurance: "请彻底打消'医生给我开这么多检查是不是怀疑我晚期了'的误解！术前全身大检查是全世界顶级肿瘤中心对每一位拟手术患者实施的【最高等级负责制常规质控】，正是因为全身检查全亮绿灯，才能 100% 确保您能通过手术获得物理根治！",
    keyMetric: {
      label: "M0 确立后早期根治率",
      value: "IA 期物理切除 5年治愈率 98%~100%",
      source: "NCCN Clinical Practice Guidelines in Oncology: Non-Small Cell Lung Cancer",
    },
    faq: [
      {
        question: "我查出 1cm 磨玻璃结节，医生让我做脑部增强核磁，是不是说明已经扩散了？",
        answer: "绝对不是！这是现代胸外科手术前的标准规范化排查流程。正因为早期肺结节治疗目标是'彻底根治'，医生才必须通过脑核磁和腹部超声百分之百确认没有隐匿信号，从而为您安全操刀。"
      },
      {
        question: "腹部 B 超写着'肝内多发囊肿'，会不会是肺转移过去的？",
        answer: "不会！肝囊肿是肝脏内部充满液体的良性囊性水泡，由先天发育或退行性改变引起，内壁衬覆正常上皮细胞，与肺部肿瘤的恶性实质性转移在病理机制和超声回声上有着天壤之别，完全属于良性改变。"
      }
    ],
    searchKeywords: ["术前检查", "脑核磁", "腹部B超", "骨扫描", "PET-CT", "M0分期", "肝囊肿非转移", "supraclavicular", "全身排查", "shuqianjiancha"],
  },
];
