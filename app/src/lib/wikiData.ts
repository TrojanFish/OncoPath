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
  visualComponent?: "GgoEvolutionSimulator" | "FleischnerDecisionTree" | "StasAirwayVisual" | "VpiPleuraVisual" | "LviVesselVisual" | "IaslcSubtypeVisual";
  
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
    metaphor: "像主树干成熟掉落的几颗小蒲公英种子——它们仅仅飘散在主肿瘤附近的微小肺泡里，并未进入血管；只要手术切除的安全边界足够宽，或者术后配合辅助治疗，就能彻底打扫干净。",
    clinicalTruth: "气道播散（STAS）是指肿瘤细胞以微乳头小巢或单个细胞的形式，游离并存在于主肿瘤边界以外的肺泡腔内。它并不等于全身转移，而是提示在进行'亚肺叶切除（楔形/段切）'时，若切除边缘不足容易发生局部切缘残留复发。",
    tactics: [
      "若已行标准肺叶切除（Lobectomy）且切缘阴性，STAS 的复发风险已在手术阶段被大部分消除",
      "若为亚肺叶切除且切缘距离 <2cm，建议评估是否需扩大切除或行放疗防护",
      "结合 EGFR 突变状态，规范评估术后第三代靶向药物（如奥希替尼）辅助治疗，降低 83% 复发可能",
    ],
    reassurance: "如果您的手术是标准的根治性肺叶切除，病理切缘为阴性（R0），说明医生已经在物理上把包含散在细胞的整个肺叶全部完整取出！请不要把 STAS 想象成全身扩散，它只是指导术后是否需要多上一道药物安全锁的依据。",
    keyMetric: {
      label: "亚肺叶切除复发风险比",
      value: "HR = 1.87 (肺叶切除可消除)",
      source: "Kadota et al., JTO (国际肺癌研究协会官方期刊)",
    },
    faq: [
      {
        question: "STAS 阳性是不是意味着手术白做了，癌细胞已经跑了？",
        answer: "绝对不是！STAS 描述的是微观切片下主肿瘤边缘局部的细胞分布状态，绝大多数漂浮细胞局限在主肿瘤几毫米范围内，随手术标本整体移出体内，不代表远处转移。"
      },
      {
        question: "STAS 阳性必须做化疗吗？",
        answer: "不一定。是否需要术后辅助治疗需综合病理分期（如 IA/IB/II/IIIA）、肿瘤实性大小及基因检测结果。如果是 IA 期且做了肺叶切除，通常仍以定期随访为主；若合并其他高危因素，现代口服靶向药往往比传统化疗耐受性更好。"
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
    metaphor: "好比房间的内层墙纸被肿瘤轻轻顶穿了（突破脏层胸膜弹力层）——由于肺表面胸膜富含淋巴微网，这提示我们需要加强局部巡逻，但整个脏层胸膜在手术中已经连同肺叶一起被完整切除移出。",
    clinicalTruth: "胸膜侵犯（VPI）是指肿瘤穿透了肺表面脏层胸膜的弹力纤维层（PL1 或 PL2）。根据国际 AJCC 第 8/9 版分期标准，哪怕肿瘤很小（≤3cm），一旦伴有 VPI 阳性，T 分期会自动由 T1 期升级为 T2a 期（即整体分期升至 IB 期起步）。",
    tactics: [
      "根治性手术已将受侵犯的脏层胸膜连同肺组织一并切除（R0切缘）",
      "对于升期为 IB/II 期的患者，重点评估基因检测，EGFR 阳性者优选术后辅助靶向治疗（ADAURA 方案）",
      "术后定期复查胸部增强 CT，重点监测胸膜腔与纵隔区域",
    ],
    reassurance: "胸膜侵犯不是'胸膜转移'！胸膜转移是指癌细胞脱落到了胸壁（壁层胸膜）并产生恶性胸水（属 IV 期），而 VPI 只是肿瘤长到了自己的外皮（脏层胸膜）。手术已经切除了这层外皮，您仍然处于可治愈的早中期根治阶段！",
    keyMetric: {
      label: "AJCC 8th 分期影响",
      value: "T1 (≤3cm) 自动升期为 T2a",
      source: "Travis et al., JTO / AJCC 8th Staging Manual",
    },
    faq: [
      {
        question: "病理报告写 PL1 和 PL2 有什么区别？",
        answer: "PL0 代表未侵犯弹力层（安全阴性）；PL1 代表穿透脏层胸膜内弹力层但未到表面；PL2 代表到达脏层胸膜外表面。PL1 和 PL2 在临床分期上均定义为 VPI 阳性（T2a），处理原则一致。"
      },
      {
        question: "胸膜侵犯会导致胸痛或者胸水吗？",
        answer: "早期脏层胸膜侵犯通常没有神经痛感，也不会引起恶性胸水。术后的轻度胸壁隐痛多为手术切口及胸壁肋间神经恢复期的正常牵拉反应，不必过度恐慌。"
      }
    ],
    visualComponent: "VpiPleuraVisual",
    graphNodeId: "VPI",
    searchKeywords: ["VPI", "胸膜侵犯", "xiongmoqinfan", "PL1", "PL2", "弹力纤维层", "胸膜受累"],
  },
  {
    id: "lvi",
    category: "pathology",
    subcategory: "高危病理指标",
    title: "脉管癌栓 (LVI 阳性)",
    subtitle: "Lymphovascular Invasion",
    icon: "🚗",
    riskLevel: "high",
    priorityOrder: 95,
    metaphor: "像少数狡猾的肿瘤细胞企图坐上人体的'微型高速公路'（微细血管或毛细淋巴管）——这提示我们要加强全身哨卡巡逻防线，通过辅助药物或严密血液监测把潜在的微小苗头扑灭在萌芽状态。",
    clinicalTruth: "脉管癌栓（LVI）是指在肿瘤周边的微小血管腔或淋巴管腔内发现了肿瘤细胞团。它是肿瘤具有潜在血行转移或淋巴道扩散倾向的病理学特征，是指导术后是否需要增加全身性辅助治疗（化疗/靶向）的重要参考指标。",
    tactics: [
      "完善驱动基因（EGFR/ALK/ROS1等）全套 NGS 检测，锁定针对性的精准靶向药物",
      "对于 II-IIIA 期合并 LVI 患者，积极讨论术后辅助靶向（奥希替尼）或辅助铂类化疗",
      "动态监测术后血液 ctDNA 微小残留病灶（MRD），若 ctDNA 持续阴性则提示体内无活跃微转移",
    ],
    reassurance: "看到'癌栓'两个字千万不要以为血管被堵住了或者已经转移了！病理切片上的脉管是微米级的毛细血管，绝大部分企图进入循环的肿瘤细胞会被人体免疫细胞消灭或被术后辅助药物精准杀死。规范治疗是阻断复发的王牌！",
    keyMetric: {
      label: "术后辅助治疗复发阻断率",
      value: "奥希替尼辅助治疗复发风险 ↓83%",
      source: "ADAURA Trial, NEJM (新英格兰医学杂志)",
    },
    faq: [
      {
        question: "脉管癌栓阳性是不是代表晚期了？",
        answer: "不是！病理分期是根据肿瘤大小(T)、淋巴结转移(N)和远处转移(M)决定的。只要淋巴结无转移且无远处转移，您依然属于早期（I期或II期）可根治阶段，脉管癌栓只是一个生物学高危特征。"
      }
    ],
    visualComponent: "LviVesselVisual",
    graphNodeId: "LVI",
    searchKeywords: ["LVI", "脉管癌栓", "maiguanaishan", "血管癌栓", "淋巴管癌栓", "微血管侵犯"],
  },
  {
    id: "iaslc-grade3",
    category: "pathology",
    subcategory: "高危病理指标",
    title: "IASLC 高危病理分级 (Grade 3 / 微乳头与实体型)",
    subtitle: "Micropapillary & Solid Subtypes",
    icon: "🧱",
    riskLevel: "high",
    priorityOrder: 92,
    metaphor: "细胞生长排列比较密集混乱，不像规则的腺泡结构那么听话。但这类活跃细胞通常对现代化学药物和靶向药物更加敏感，只要用药精准，打击效果往往非常显著。",
    clinicalTruth: "国际肺癌研究协会（IASLC）组织学分级系统将浸润性肺腺癌分为 3 级：Grade 1 为贴壁为主（低危，5年生存率近100%）；Grade 2 为腺泡/乳头为主（中危）；Grade 3 为微乳头型或实体型占比 ≥20%（高危）。微乳头和实体型具有较高的侵袭性与淋巴转移潜能。",
    tactics: [
      "即使是 IB 期，若含有较高比例的微乳头或实体型成分，指南也建议积极考虑术后辅助治疗",
      "靶向药物（如三代 EGFR-TKI）对微乳头及实体型腺癌同样具备极强的疾病控制率",
      "缩短术后第 1~2 年的随访间隔（建议每 3~4 个月复查一次胸部薄层 CT 与肿瘤标志物）",
    ],
    reassurance: "很多患者病理报告写着'微乳头型5%'就吓得睡不着觉，其实微乳头成分只要比例较低（<20%），且分级仍以腺泡或贴壁型为主，整体预后依然非常良好。现代多学科综合治疗手段极其丰富，完全能够有效防护！",
    keyMetric: {
      label: "IASLC 分级标准",
      value: "微乳头/实体型 ≥20% 为 Grade 3",
      source: "Moreira et al., JTO (IASLC Grading System)",
    },
    faq: [
      {
        question: "病理报告上写了几种亚型（如腺泡60%，贴壁30%，实体10%），到底看哪个？",
        answer: "肺腺癌绝大多数是混合亚型。病理医生会根据占比最高的主导亚型以及是否含有 ≥20% 的高危亚型来综合评定分级。只要实体/微乳头成分占比低，就依然属于 Grade 2 中危甚至更低分级。"
      }
    ],
    visualComponent: "IaslcSubtypeVisual",
    graphNodeId: "IASLC",
    searchKeywords: ["IASLC", "微乳头", "实体型", "weirutou", "shitixing", "病理分级", "Grade 3", "高危亚型"],
  },
  {
    id: "lymph-node-n2",
    category: "pathology",
    subcategory: "中高危分期指标",
    title: "纵隔淋巴结转移 (N2 站阳性)",
    subtitle: "Mediastinal Lymph Node Metastasis",
    icon: "🟡",
    riskLevel: "high",
    priorityOrder: 90,
    metaphor: "像敌人突破了第一道边境哨卡（肺门N1站），走到了交通枢纽站（纵隔N2站）。虽然关卡升级了，但手术已经对这些纵隔淋巴结进行了系统性解剖清扫，术后再通过精准药物建立第二道坚固防线。",
    clinicalTruth: "N2 淋巴结是指同侧纵隔内或隆突下的淋巴结（如第 2、4、7 组等）发生了癌细胞转移。N2 转移代表病理分期进入 IIIA 期。IIIA 期不是晚期（IV期），依然属于通过手术完整切除联合术后辅助治疗追求临床治愈的关键阶段。",
    tactics: [
      "确保术中实施了规范的系统性纵隔淋巴结清扫（至少清扫 3 组纵隔站，包括第 7 组）",
      "术后必须接受辅助治疗：EGFR 突变阳性首选奥希替尼辅助治疗；突变阴性首选含铂双药辅助化疗 ± 免疫辅助治疗",
      "定期进行全身增强 CT 及头部磁共振（MRI）随访",
    ],
    reassurance: "IIIA 期患者在当今靶向治疗与免疫治疗时代，生存期和无复发率相比十年前有了翻天覆地的飞跃！*ADAURA* 研究显示，即使是 IIIA 期伴 N2 转移的患者，术后口服靶向药 3 年无病生存率仍高达 70% 以上！请坚定抗癌信心！",
    keyMetric: {
      label: "IIIA 期靶向辅助治疗无病生存率",
      value: "3年 DFS 提升至 70% (NEJM)",
      source: "ADAURA Phase III Trial (NEJM 2023)",
    },
    faq: [
      {
        question: "淋巴结清扫了 15 个，其中 2 个阳性，剩下的 13 个阴性代表什么？",
        answer: "这代表纵隔清扫非常彻底！阴性淋巴结越多，说明周边正常防线没有被突破。清扫总数 >12 枚且切缘阴性是高质量根治手术的标志，为后续辅助治疗奠定了最佳基石。"
      }
    ],
    graphNodeId: "METASTASIS",
    searchKeywords: ["N2", "纵隔淋巴结", "zonggelinbajie", "淋巴结转移", "IIIA期", "淋巴清扫", "第7组淋巴结", "第4组淋巴结"],
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
    subtitle: "Ground-Glass Opacity & Consolidation Ratio",
    icon: "🫁",
    riskLevel: "low",
    priorityOrder: 40,
    metaphor: "纯磨玻璃结节（pGGN）就像清晨肺泡里的一团淡薄水雾，没有凝固成冰块（实性）；混合磨玻璃（mGGO）像刚下锅的荷包蛋，中间稍微凝结了一点实性蛋黄。只要实性成分不大，它的生长速度往往极其缓慢。",
    clinicalTruth: "磨玻璃结节（GGO）是指 CT 图像上呈现密度轻度增高、但内部仍能隐约看清支气管和血管纹理的结节。CTR（实性成分比 = 实性径 ÷ 总径）是判断良恶性与浸润性的金标准。CTR ≤ 0.5 提示极大概率为原位或微浸润腺癌（惰性病变），5 年无复发生存率接近 100%。",
    tactics: [
      "纯磨玻璃结节（CTR=0）首次发现绝不推荐急于开刀，必须经历 3~6 个月随访观察排除感染性水肿",
      "CTR ≤ 0.5 的早期结节即使手术，首选解剖性肺段切除（Segmentectomy）或楔形切除，最大程度保留肺功能",
      "根据 JCOG0804/0802 国际顶级临床研究，CTR ≤ 0.5 切除后 5 年无复发率高达 99.7%",
    ],
    reassurance: "查出磨玻璃结节千万不要自己吓自己！数据显示体检发现的磨玻璃结节超过 95% 为良性或极早期惰性状态。纯磨玻璃结节的倍增时间通常在 600~1000 天以上，哪怕观察 1~2 年也完全处于安全治疗窗口期！",
    keyMetric: {
      label: "CTR ≤ 0.5 术后5年无复发率",
      value: "99.7% (JCOG0804 顶级循证)",
      source: "Suzuki et al., Lancet Respiratory Medicine (JCOG0804)",
    },
    faq: [
      {
        question: "我的磨玻璃结节 8mm，医生为什么让我 6 个月后再复查，而不是立即开刀？",
        answer: "因为相当一部分首次发现的磨玻璃结节是由普通肺部炎症、过敏或微出血引起的，经过几个月可能会自行吸收缩小。如果立即开刀不仅挨了一刀白白切除肺组织，还可能误切良性病变。定期复查是最严谨负责的医学做法！"
      },
      {
        question: "随访期间磨玻璃结节会不会突然在几个月内转移到全身？",
        answer: "绝对不会！纯磨玻璃结节的生物学特性是贴壁生长，没有突破基底膜进入血管和淋巴管的能力，不具备任何远处转移的生物学通道。"
      }
    ],
    visualComponent: "GgoEvolutionSimulator",
    graphNodeId: "CTR",
    searchKeywords: ["GGO", "磨玻璃结节", "mobolijiejie", "pGGN", "mGGO", "实性成分比", "CTR", "荷包蛋征", "肺结节"],
  },
  {
    id: "fleischner-guide",
    category: "nodule",
    subcategory: "随访指南",
    title: "国际 Fleischner 肺结节科学随访决策树",
    subtitle: "Fleischner Society Guidelines for Lung Nodules",
    icon: "🧭",
    riskLevel: "low",
    priorityOrder: 35,
    metaphor: "一套由全球顶级胸外科与放射学专家制定的'红绿灯通行法则'——结节多大、什么质地，该等3个月、6个月还是1年，都有明确精准的科学时间表，绝不需要凭感觉焦虑猜测。",
    clinicalTruth: "国际 Fleischner 学会与中华医学会呼吸病学分会指南明确指出：对于 <6mm 的实性结节或 <6mm 的孤立纯磨玻璃结节，常规不需要进行任何常规随访；对于 6~8mm 的结节，建议 6~12 个月复查薄层 CT；只有持续增大或实性成分明显进展的结节才考虑干预。",
    tactics: [
      "严格使用 1mm 以下的高分辨率薄层 CT（HRCT）进行靶扫描对比，避免不同机器层厚误差导致的误判",
      "切忌频繁（如每个月）做 CT 检查，不仅徒增辐射，而且短期内无法观察到惰性肿瘤的体积倍增变化",
      "复查时务必携带既往电子胶片进行三维体积精准对比（Volume Doubling Time）",
    ],
    reassurance: "指南是全球数十万例随访病例大数据总结出的最优解。只要严格遵从指南的时间表随访，绝不会耽误任何治疗时机！把专业的事情交给指南，把安心的生活留给自己。",
    keyMetric: {
      label: "<6mm 孤立纯磨玻璃结节恶性率",
      value: "< 1% (指南建议无需过度复查)",
      source: "MacMahon et al., Radiology (Fleischner Society Guidelines)",
    },
    faq: [
      {
        question: "每次去不同医院复查，结节报告大小差了 1~2mm 是不是长大了？",
        answer: "不一定！CT 扫描时呼吸深浅、不同切片层厚以及不同放射科医生的测量游标习惯都会带来 1~2mm 的测量测量偏差。关键看三维体积和内部密度是否改变，建议在同一家三甲医院同一台机器上做薄层复查对比。"
      }
    ],
    visualComponent: "FleischnerDecisionTree",
    searchKeywords: ["Fleischner", "随访指南", "suifang", "结节复查时间", "结节随访", "6mm结节", "8mm结节"],
  },
  {
    id: "nodule-signs",
    category: "nodule",
    subcategory: "影像特征破译",
    title: "CT 报告上的征象词解密 (毛刺/分叶/胸膜牵拉/空泡)",
    subtitle: "CT Imaging Signs Decryption",
    icon: "🔍",
    riskLevel: "moderate",
    priorityOrder: 45,
    metaphor: "像侦探看脚印——分叶是肿瘤各部分生长速度不一留下的波浪边；毛刺是周边微小纤维牵拉的细线；胸膜牵拉是结节收缩时把附近的胸膜拉了一个小凹陷。它们是综合判断的参考，不是恶性的绝对铁证。",
    clinicalTruth: "CT 报告中常出现的恶性概率征象包括：分叶征（Lobulation）、短细毛刺征（Spiculation）、胸膜凹陷征（Pleural Indentation）、空泡征/支气管充气征。但部分慢性炎症、结核球、炎性假瘤同样可以出现毛刺和胸膜牵拉征象，必须由胸外科或放射科医生结合动态随访综合评定。",
    tactics: [
      "单看某一个征象不能断定良恶性，需结合结节密度（CTR）、边缘清晰度及倍增时间综合评分",
      "对于伴有多项可疑恶性征象且直径 >8mm 的部分实性结节，可考虑行增强 CT、PET-CT 或多学科会诊（MDT）",
      "若评估手术，早中期胸腔镜微创手术创伤小、恢复快（通常术后 3~5 天出院）",
    ],
    reassurance: "看到报告上写了'分叶'或'牵拉'不要惊慌失措。很多陈旧性肺结核灶或纤维化瘢痕在修复过程中也会牵拉胸膜产生毛刺。找经验丰富的胸外科专家阅片，他们一眼就能分辨是'炎症瘢痕'还是'活跃病灶'！",
    keyMetric: {
      label: "微创胸腔镜手术平均住院日",
      value: "3 ~ 5 天 (快速康复 ERAS)",
      source: "Chinese Thoracic Surgery Expert Consensus 2024",
    },
    faq: [
      {
        question: "CT 报告写了'不除外早期浸润可能'，是不是意味着已经是恶性了？",
        answer: "放射科报告的'不除外'属于描述性防御性用词，意为不能 100% 排除，提示需要临床医生关注。这绝不等于最终确诊，最终定性必须依赖病理活检或长期随访对比。"
      }
    ],
    searchKeywords: ["毛刺征", "分叶征", "胸膜牵拉", "空泡征", "maoci", "fenye", "CT征象", "结节恶性征象"],
  },

  // ==================== 3. 驱动基因与靶向治疗 (按风险高低排序) ====================
  {
    id: "egfr-targeted",
    category: "genetics",
    subcategory: "核心驱动基因",
    title: "EGFR 驱动基因突变与第三代靶向药 (奥希替尼等)",
    subtitle: "EGFR Mutations (19del / L858R) & 3rd-Gen TKIs",
    icon: "🎯",
    riskLevel: "moderate",
    priorityOrder: 70,
    metaphor: "EGFR 突变就像癌细胞表面多装了一把疯狂接收生长信号的'异常开关'；而第三代靶向药物（如奥希替尼、阿美替尼、伏美替尼）就像一把高精度的专用钥匙，严密锁死这个开关，断绝癌细胞生长的能量来源。",
    clinicalTruth: "表皮生长因子受体（EGFR）突变在亚裔非吸烟肺腺癌患者中检出率高达 50% 左右，最常见的突变类型为 19 号外显子缺失（19del）和 21 号外显子 L858R 突变（合称经典敏感突变）。EGFR 阳性患者在术后辅助治疗以及晚期治疗中具有极高的靶向药响应率和卓越的生存获益。",
    tactics: [
      "术后病理标本务必行 NGS 基因检测，明确是否存在 EGFR 19del 或 L858R 敏感突变",
      "对于 IB-IIIA 期术后 EGFR 阳性患者，依据 ADAURA 试验指南，术后口服奥希替尼辅助治疗可降低 83% 复发风险",
      "第三代靶向药具备极佳的血脑屏障透过率，可强效预防肺癌脑转移发生",
    ],
    reassurance: "如果您的基因检测查出了 EGFR 突变，在肿瘤学上被称作'上帝赠予的靶点'！因为这意味着您拥有全球研发最成熟、疗效最强劲、副作用远低于传统化疗的口服靶向武器！每天仅需口服一片药，生活质量极佳！",
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
        answer: "术后辅助治疗的目的是杀灭术后残留的微小细胞以实现根治，与晚期带瘤吃药的耐药机制不同。在完全切除状态下，体内肿瘤负荷极低，发生耐药突变的概率大幅降低。"
      }
    ],
    graphNodeId: "TARGETED",
    searchKeywords: ["EGFR", "奥希替尼", "靶向药", "aoxitini", "19del", "L858R", "阿美替尼", "伏美替尼", "基因检测"],
  },
  {
    id: "rare-mutations",
    category: "genetics",
    subcategory: "其他靶向基因",
    title: "ALK / ROS1 / KRAS / RET 等罕见靶点",
    subtitle: "ALK Fusion, ROS1, KRAS G12C, RET, MET Exon 14",
    icon: "🧬",
    riskLevel: "moderate",
    priorityOrder: 65,
    metaphor: "非小细胞肺癌就像一把拥有数十种不同锁眼的锁——除了最常见的 EGFR 锁眼，还有 ALK（钻石靶点）、ROS1、KRAS 等锁眼。现代医学已经为几乎每一个突变研发了专属的定制钥匙。",
    clinicalTruth: "ALK 融合突变（占比约 5~7%，多见于年轻非吸烟患者）被称为'钻石突变'，阿来替尼、洛拉替尼等靶向药具备超长无进展生存期（ALINA 试验确立了术后辅助地位）；KRAS G12C、RET 融合、MET 14 外显子跳跃突变等也有针对性的特异性抑制剂上市。",
    tactics: [
      "推荐使用大 Panel NGS 基因检测，一次性覆盖 EGFR、ALK、ROS1、KRAS、RET、MET、HER2 等数十个核心驱动基因",
      "ALK 阳性患者根据 ALINA 试验，术后口服阿来替尼辅助治疗同样可大幅降低复发风险（HR=0.24）",
      "突变全阴性患者（野生型）重点评估 PD-L1 表达状态，为后续可能的免疫治疗储备依据",
    ],
    reassurance: "无论检测出哪种基因突变，现代精准肿瘤学都拥有层出不穷的新药武器。即使所有基因均为阴性（野生型），免疫治疗（如 PD-1 抑制剂）联合化疗也为患者带来了前所未有的长期生存奇迹！",
    keyMetric: {
      label: "ALK 术后辅助靶向复发风险降低",
      value: "HR = 0.24 (复发风险 ↓76%)",
      source: "ALINA Phase III Trial (NEJM 2024)",
    },
    faq: [
      {
        question: "基因检测做多少个基因合适？几百个基因的套餐有必要吗？",
        answer: "对于肺腺癌初诊患者，涵盖 10~50 个肺癌核心指南推荐基因的标准 Panel 已经能够满足 98% 以上的临床用药指导需求。几百个基因的超大套餐多用于罕见耐药机制研究，常规初诊按临床医生建议选择标准套餐即可。"
      }
    ],
    searchKeywords: ["ALK", "阿来替尼", "KRAS", "ROS1", "RET", "MET", "基因检测", "钻石靶点"],
  },

  // ==================== 4. 术后康复与长期随访 (按风险高低排序) ====================
  {
    id: "tumor-markers",
    category: "recovery",
    subcategory: "血液指标认知",
    title: "肿瘤标志物轻度波动认知 (CEA / CYFRA21-1)",
    subtitle: "Understanding Tumor Marker Fluctuations",
    icon: "📈",
    riskLevel: "low",
    priorityOrder: 25,
    metaphor: "像人体的体温计——感冒发烧时体温会升高，天气热或剧烈运动后也会轻微波动。抽烟、慢性胃炎、支气管炎都会让指标轻微晃动，只要影像学 CT 检查没有新病灶，单次轻度升高绝不代表复发！",
    clinicalTruth: "癌胚抗原（CEA）和细胞角蛋白19片段（CYFRA21-1）是肺癌随访中常用的血液监测指标。然而，肿瘤标志物的特异性并非 100%。吸烟、慢性胃炎、结肠息肉、良性肺部感染或检测仪器批次差异都会导致其在正常参考值上下波动。临床判断复发始终以薄层 CT 影像学检查为金标准。",
    tactics: [
      "单次轻度升高（如正常值 0~5，查出 5.6）切忌恐慌，建议间隔 1 个月在同一家医院原仪器复查观察趋势",
      "只有出现'进行性、成倍持续翻倍升高'（如从 5 升到 15 再升到 50）才提示需要进行胸腹部增强 CT 或全身 PET-CT 排查",
      "戒烟可显著降低假阳性干扰并大幅保护剩余健康肺组织",
    ],
    reassurance: "门诊中 80% 因为指标轻度偏高吓得痛哭流涕的患者，复查 CT 后均证实没有任何问题。标志物只是哨兵的一声偶发喷嚏，影像学 CT 才是真正的法官。放下每天看指标数值的焦虑！",
    keyMetric: {
      label: "肿瘤标志物单次升高假阳性率",
      value: "约 15 ~ 30% (良性因素导致)",
      source: "Clinical Chemistry / CSCO Guidelines 2024",
    },
    faq: [
      {
        question: "我的 CEA 术前是 2.1 正常，术后 3 个月复查变成 4.8（依然在 5 以内），这算升高吗？",
        answer: "在正常参考值范围内的数值波动（2.1 ➔ 4.8）完全属于人体的正常生理代谢和检测仪器误差，没有任何临床病理学意义，请完全放心！"
      }
    ],
    searchKeywords: ["CEA", "CYFRA21-1", "肿瘤标志物", "zhongliubiaozhiwu", "癌胚抗原", "指标偏高", "标志物波动"],
  },
  {
    id: "postop-symptoms",
    category: "recovery",
    subcategory: "身体恢复",
    title: "术后咳喘、胸闷与切口隐痛的科学调适",
    subtitle: "Postoperative Cough, Tightness & Pain Management",
    icon: "🫁",
    riskLevel: "low",
    priorityOrder: 20,
    metaphor: "房子刚做完结构装修改造，管道重新连接、墙壁电线需要重新适应。切除部分肺叶后，剩余的健康肺组织需要几个月时间慢慢膨胀填补空隙，神经末梢也在悄悄修复连接。",
    clinicalTruth: "肺部手术后 1~6 个月内，患者常出现阵发性刺激性干咳（支气管残端缝合刺激及气道神经敏感）、胸部发紧束带感（肋间神经损伤修复）以及活动后轻度气促（残肺代偿膨胀期）。这些均为肺切除术后的正常生理恢复过程，随时间推移大多会显著改善。",
    tactics: [
      "术后早期使用呼吸训练器（吹三色球），每日规律练习深呼吸与腹式呼吸，促进残肺充分复张",
      "刺激性干咳可在医生指导下短期使用温和镇咳药（如复方甲氧那明、右美沙芬）或雾化吸入治疗",
      "适度进行散步、慢走等有氧运动，循序渐进提高肺活量，切忌长期卧床不动",
    ],
    reassurance: "胸闷和咳嗽是身体在努力自我修复的信号，而不是疾病复发的表现。给身体一点耐心和时间，绝大多数患者在术后半年到一年都能完全恢复正常的工作与运动生活！",
    keyMetric: {
      label: "残肺代偿复张黄金恢复期",
      value: "术后 3 ~ 6 个月",
      source: "ERAS Guidelines for Perioperative Care in Thoracic Surgery",
    },
    faq: [
      {
        question: "术后咳嗽吃抗生素（消炎药）管用吗？",
        answer: "通常不管用！术后咳嗽多为支气管残端神经敏感引起的无菌性物理刺激反射，而不是细菌感染。除非伴有高热、咳黄脓痰，否则不应盲目滥用抗生素。"
      }
    ],
    searchKeywords: ["术后咳嗽", "胸闷", "伤口疼", "shuhoukesou", "肋间神经痛", "吹气球", "肺功能恢复"],
  },
];
