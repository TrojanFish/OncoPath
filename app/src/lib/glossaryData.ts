export interface GlossaryTerm {
  term: string;
  enName: string;
  category: "imaging" | "pathology" | "benign" | "biomarker" | "staging";
  categoryLabel: string;
  summary: string;                  // 一句话人话核心定义
  clinicalMeaning: string;          // 临床医学机制
  plainLanguageReassurance: string; // 患者定心丸（消除恐慌）
}

export const CLINICAL_GLOSSARY: Record<string, GlossaryTerm> = {
  // ================= 影像学恶性/可疑征象 =================
  "分叶征": {
    term: "分叶征",
    enName: "Lobulation",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "结节边缘呈现波浪状或多个弧形分叶。",
    clinicalMeaning: "反映肿瘤内部各方向细胞浸润生长速度不均，或受周围血管、支气管阻挡而形成的膨胀性生长形态。",
    plainLanguageReassurance: "分叶征提示需要专科评估，但早期磨玻璃伴分叶经微创完整切除后治愈率极高，切勿过度恐慌。"
  },
  "毛刺征": {
    term: "毛刺征",
    enName: "Spiculation",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "结节边缘向周围正常肺组织伸出放射状排列的细短线状阴影。",
    clinicalMeaning: "肺腺癌高度特征性的浸润征象，通常由肿瘤细胞沿肺泡间隔浸润生长或局部成纤维收缩反应引起。",
    plainLanguageReassurance: "毛刺征是胸外科医生判断手术指征的关键信号，提醒尽早就医会诊，早期发现仍属于根治窗口期。"
  },
  "胸膜牵拉征": {
    term: "胸膜牵拉征 / 胸膜凹陷征",
    enName: "Pleural Indentation",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "结节靠近胸膜，可见线状水肿或胸膜向结节方向形成帐篷样凹陷。",
    clinicalMeaning: "肿瘤内部成纤维细胞收缩牵拉邻近的脏层胸膜。需在术后病理中确认是否突破胸膜弹性纤维层（PL0还是PL1）。",
    plainLanguageReassurance: "胸膜牵拉绝不等于胸膜转移！绝大多数早期结节仅为物理机械牵拉，病理切片证实 PL0 即属于极安全范围。"
  },
  "空泡征": {
    term: "空泡征 / 细支气管残腔",
    enName: "Vacuole Sign",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "结节内部出现小于 5 毫米的点状、小圆形透亮气体小孔。",
    clinicalMeaning: "并非组织坏死空洞，而是肿瘤在肺泡壁伏壁生长时，保留了未被完全破坏闭塞的微小细支气管或肺泡腔残腔。",
    plainLanguageReassurance: "空泡征多见于极早期惰性腺癌，不是结节在肺里'烂了'或空洞化，属于早期典型特征。"
  },
  "血管集束征": {
    term: "血管集束征 / 血管穿行征",
    enName: "Vascular Convergence",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "周围正常肺血管受牵拉向结节聚拢，或细小微血管直接穿行于病灶内部。",
    clinicalMeaning: "反映肿瘤对局部血供供应的需求及血管生成活跃度，是病灶具有生物学代谢活性的客观表现之一。",
    plainLanguageReassurance: "说明结节有血供，提醒医生在评估时重点关注其实性成分进展，指导随访或手术时机。"
  },
  "磨玻璃晕征": {
    term: "磨玻璃晕征",
    enName: "Halo Sign",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "结节中心实性核心周围环绕一圈淡薄均匀的磨玻璃影。",
    clinicalMeaning: "代表病灶外围由贴壁伏壁生长方式向中心实性浸润演进的移行过渡区域，或外围微量出血渗出带。",
    plainLanguageReassurance: "提示病灶处于演进期，胸外科医生可通过测量中心实性成分（CTR）来决定最佳随访或手术节点。"
  },
  "支气管充气征": {
    term: "支气管充气征",
    enName: "Air Bronchogram",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "充气的细小支气管直接穿过结节内部，管壁管腔可见轻度僵硬或扩张。",
    clinicalMeaning: "表明肿瘤细胞沿肺泡间隔伏壁生长，尚未形成致密实性肿块完全堵塞压扁细支气管管腔。",
    plainLanguageReassurance: "常提示伏壁生长的早期特性，有助于胸外科医生在术前做 3D 支气管血管重建（3D-CTBA）精准切除。"
  },
  "纯磨玻璃结节": {
    term: "纯磨玻璃结节 (pGGO / pGGN)",
    enName: "Pure Ground-Glass Nodule",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "CT 图像上像磨砂玻璃一样的淡薄浅白色阴影，内部血管纹理仍隐约可见，完全无实性致密成分。",
    clinicalMeaning: "对应病理多为不典型腺瘤样增生 (AAH)、原位腺癌 (AIS) 或良性炎性渗出，无转移侵袭能力。",
    plainLanguageReassurance: "纯磨玻璃结节绝大多数生长极其缓慢（体积倍增时间通常大于 600~800 天），完全处于绝对安全随访窗口期，无需急于手术！"
  },
  "混合磨玻璃结节": {
    term: "混合磨玻璃结节 / 部分实性结节 (mGGO / Part-solid)",
    enName: "Part-Solid / Mixed GGO",
    category: "imaging",
    categoryLabel: "CT 影像征象",
    summary: "既有磨砂玻璃样淡薄阴影，又有把血管完全遮挡的致密实性白点。",
    clinicalMeaning: "实性部分往往代表浸润生长的肿瘤成分。实性成分大小（CTR）是决定良恶性风险与 AJCC 分期的核心依据。",
    plainLanguageReassurance: "只要实性成分小于 5mm（微浸润 MIA），JCOG0804 临床研究显示微创切除后 5 年无复发生存率高达 99.7%，治愈率极高。"
  },
  "条索状影": {
    term: "条索状影 / 条索灶",
    enName: "Linear Fibrotic Opacity",
    category: "imaging",
    categoryLabel: "良性/退行性改变",
    summary: "肺部呈现细长条状、边界清楚的纤维硬化线条影。",
    clinicalMeaning: "绝大多数为既往肺部感染（如肺炎、支气管炎、陈旧性结核）完全吸收治愈后遗留的微小胶原纤维疤痕组织。",
    plainLanguageReassurance: "就像皮肤擦伤愈合后留下的一道小浅痕迹，属于 100% 良性陈旧性改变，绝不会恶变，完全无需治疗。"
  },
  "小叶间隔增厚": {
    term: "小叶间隔增厚",
    enName: "Interlobular Septal Thickening",
    category: "imaging",
    categoryLabel: "良性/间质反应",
    summary: "肺次级小叶边缘的纤维结缔组织间隔在 CT 上变粗显影。",
    clinicalMeaning: "常由于局部微循环充血、水肿、淋巴回流轻度受阻或轻度间质性慢性炎症引起。",
    plainLanguageReassurance: "体检中单发或局灶性小叶间隔增厚多为良性退行性改变或轻微慢性炎症，与恶性肿瘤无直接因果关系。"
  },
  "局灶性肺气肿": {
    term: "局灶性肺气肿 / 肺大疱",
    enName: "Focal Emphysema / Bulla",
    category: "imaging",
    categoryLabel: "良性/生理退行性",
    summary: "部分肺泡壁弹性降低变薄破裂，多个肺泡融合形成含气囊腔。",
    clinicalMeaning: "常见于长期吸烟者、被动吸二手烟者或老年人肺组织退行性生理改变。",
    plainLanguageReassurance: "局灶微小肺气肿不影响肺功能，戒烟并保持呼吸道健康即可，并非肿瘤。"
  },
  "胸膜下小结节": {
    term: "胸膜下小结节",
    enName: "Subpleural Micronodule",
    category: "imaging",
    categoryLabel: "良性/淋巴结反应",
    summary: "紧贴肺表面胸膜下方出现的直径小于 5 毫米的微小圆形/扁圆形结节。",
    clinicalMeaning: "绝大部分（超 90%）为肺内正常的叶间裂或胸膜下微小淋巴结（Intrapulmonary Lymph Node），负责吞噬尘埃颗粒。",
    plainLanguageReassurance: "是人体呼吸系统的正常微型'哨兵过滤站'，形状多扁平三角形，属于良性结构，常规体检随访即可。"
  },
  "纵隔淋巴结钙化": {
    term: "纵隔/肺门淋巴结钙化",
    enName: "Mediastinal Calcified Lymph Node",
    category: "imaging",
    categoryLabel: "良性/陈旧感染",
    summary: "纵隔或肺门淋巴结内部出现高密度石头样白点。",
    clinicalMeaning: "人体很多年前（如童年或青年期）感染过结核杆菌或真菌后，免疫系统将其彻底消灭钙化封印形成的'功勋石碑'。",
    plainLanguageReassurance: "钙化是炎症彻底治愈、病灶失去活性的黄金铁证，说明病灶已经死亡，绝非转移！"
  },

  // ================= 病理学核心危险因子 =================
  "STAS": {
    term: "气道播散 (STAS)",
    enName: "Spread Through Air Spaces",
    category: "pathology",
    categoryLabel: "术后病理指标",
    summary: "显微镜下见极微小的肿瘤细胞团从原发灶脱落，漂浮在主病灶边缘的正常含气肺泡腔内。",
    clinicalMeaning: "是早期肺腺癌微浸润的一种生物学特征。存在 STAS（阳性）时提示局部微复发风险略高，需警惕切缘安全距离。",
    plainLanguageReassurance: "STAS 阴性（未见）是极佳的安全信号；即便阳性，只要手术切除切缘充分（R0 切除）并遵医嘱规律随访，同样能获得极好预后。"
  },
  "VPI": {
    term: "脏层胸膜侵犯 (VPI)",
    enName: "Visceral Pleural Invasion",
    category: "pathology",
    categoryLabel: "术后病理指标",
    summary: "肿瘤细胞穿透浸润了覆盖在肺表面的脏层胸膜弹力纤维层（PL1/PL2）。",
    clinicalMeaning: "根据 AJCC 8th/9th 规则，肿瘤突破脏层胸膜弹性层会使 T1 期升级为 T2a，但依然属于局限性手术可根治范围。",
    plainLanguageReassurance: "病理切片标明 PL0 表示胸膜完全完好无侵犯；若为 PL1，现代胸外科解剖性切除加规律随访也能有效防范风险。"
  },
  "LVI": {
    term: "脉管内癌栓 (LVI)",
    enName: "Lymphovascular Invasion",
    category: "pathology",
    categoryLabel: "术后病理指标",
    summary: "显微镜下在肿瘤周围的微小毛细血管或微淋巴管腔内发现了肿瘤细胞团。",
    clinicalMeaning: "提示局部微小血管有浸润倾向，是临床医生评估是否需要进行辅助靶向治疗或更严密随访的参考因素之一。",
    plainLanguageReassurance: "LVI 阴性说明局部微循环非常干净安全；阳性则为医生制定后续精准辅助方案提供了清晰的科学靶向依据。"
  },
  "R0切除": {
    term: "切缘阴性 (R0 根治性切除)",
    enName: "R0 Complete Resection",
    category: "pathology",
    categoryLabel: "外科病理金标准",
    summary: "显微镜下检查手术切除标本的所有边缘（支气管残端、肺切缘），100% 未发现任何癌细胞残留。",
    clinicalMeaning: "表明外科医生已经在肉眼和显微镜下将肿瘤完整、彻底地从人体物理连根切除，达到了肿瘤外科学的最高根治标准。",
    plainLanguageReassurance: "R0 切除是防止肿瘤复发最关键的决定性基石！只要切缘阴性，就守住了物理治愈的黄金大门。"
  },
  "Ki-67": {
    term: "Ki-67 细胞增殖指数",
    enName: "Ki-67 Proliferation Index",
    category: "pathology",
    categoryLabel: "免疫组化指标",
    summary: "显微镜下处于活跃分裂生长周期的细胞百分比（相当于细胞发动机的转速表）。",
    clinicalMeaning: "数值越低（如 ≤5%）说明肿瘤细胞极其懒惰惰性，生长几乎停滞；数值较高说明细胞分裂较为活跃。",
    plainLanguageReassurance: "Ki-67 绝不等于复发转移概率！早期磨玻璃切除后 Ki-67 通常很低；即使偏高，也意味着细胞对后续辅助药物极其敏感有效。"
  },
  "IASLC分级": {
    term: "IASLC 肺腺癌病理组织学分级",
    enName: "IASLC Histologic Grading",
    category: "pathology",
    categoryLabel: "病理分级",
    summary: "国际肺癌研究协会根据显微镜下腺癌的微观生长亚型结构（贴壁、腺泡、乳头、实体、微乳头）划分的细胞分化等级。",
    clinicalMeaning: "G1 为高分化（以贴壁生长为主，极低度恶性）；G2 为中分化（腺泡/乳头为主）；G3 为低分化（伴实体型或微乳头型）。",
    plainLanguageReassurance: "早期磨玻璃结节手术后病理绝大部分为 G1 或 G2，属于温和亚型，术后预后极为优良。"
  },

  // ================= 伴发良性病变排雷 =================
  "肝囊肿": {
    term: "肝囊肿",
    enName: "Hepatic Cyst",
    category: "benign",
    categoryLabel: "良性排雷定心丸",
    summary: "肝脏表面或内部出现的一个充满清亮液体的微小水泡，外面包裹一层薄薄的良性上皮组织。",
    clinicalMeaning: "属于先天性发育或人体极其常见的良性退行性改变，在 40 岁以上成人中体检检出率高达 15%~20%。",
    plainLanguageReassurance: "就像皮肤上长了个小水泡一样，与肺部结节 100% 毫无因果关系，绝非肿瘤转移！终身无需处理。"
  },
  "肝血管瘤": {
    term: "肝血管瘤",
    enName: "Hepatic Hemangioma",
    category: "benign",
    categoryLabel: "良性排雷定心丸",
    summary: "肝脏内部由大量微小毛细血管错构缠绕形成的一个良性血管团块。",
    clinicalMeaning: "人体最常见的肝脏良性肿瘤，生长极其缓慢或终身不变，不会发生恶变或转移。",
    plainLanguageReassurance: "属于先天性良性血管团，超声和 CT 增强表现典型，绝非恶性转移，安心即可。"
  },
  "胆囊息肉": {
    term: "胆囊息肉 / 胆固醇结晶",
    enName: "Gallbladder Polyp",
    category: "benign",
    categoryLabel: "良性排雷定心丸",
    summary: "胆囊内壁向胆囊腔内隆起生长的微小良性肉芽或胆固醇结晶颗粒。",
    clinicalMeaning: "90% 以上属于胆固醇性良性息肉，由胆汁中胆固醇代谢结晶析出黏附在胆囊黏膜引起。",
    plainLanguageReassurance: "微小胆囊息肉（<10mm）属于消化系统非常普遍的良性发现，与肺部完全无关，定期年度腹部 B 超复查即可。"
  },
  "肾囊肿": {
    term: "肾囊肿",
    enName: "Renal Cyst",
    category: "benign",
    categoryLabel: "良性排雷定心丸",
    summary: "肾脏实质内出现的圆形水泡样良性小液囊。",
    clinicalMeaning: "多为单纯性肾囊肿，随年龄增长在成年人体检中极其多见（类似人体长出的一根白头发）。",
    plainLanguageReassurance: "100% 良性单纯性水泡，不损害肾功能，绝非肺部肿瘤播散，无需任何特殊治疗。"
  },
  "甲状腺结节2类": {
    term: "甲状腺结节 (TI-RADS 2/3类)",
    enName: "Thyroid Nodule (TI-RADS 2/3)",
    category: "benign",
    categoryLabel: "良性排雷定心丸",
    summary: "甲状腺超声检查中发现的微小囊性或实性良性结节。",
    clinicalMeaning: "TI-RADS 2 类属于 100% 良性病变（如单纯胶质囊肿）；3 类恶性概率小于 2%。",
    plainLanguageReassurance: "现代超声分辨率高达 1 毫米，体检中超半数成年人均有甲状腺结节，属于独立良性表现，与肺癌毫不相干。"
  },

  // ================= 血液肿瘤标志物 =================
  "CEA": {
    term: "癌胚抗原 (CEA)",
    enName: "Carcinoembryonic Antigen",
    category: "biomarker",
    categoryLabel: "血液肿瘤标志物",
    summary: "血液中检测的一种糖蛋白指标，正常参考范围通常为 0 ~ 5.0 ng/mL。",
    clinicalMeaning: "主要由胃肠道及肺腺癌细胞分泌。但吸烟、浅表性胃炎、慢性结肠炎、甚至轻微感冒也可引起轻微生理性升高（如 5~10 之间）。",
    plainLanguageReassurance: "正常范围内的数值波动（如 2.1 变 3.5）完全属于正常生理起伏，绝不代表结节恶变或复发！请以胸部薄层 CT 影像为金标准。"
  },
  "CYFRA21-1": {
    term: "细胞角蛋白 19 片段 (CYFRA21-1)",
    enName: "Cytokeratin 19 Fragment",
    category: "biomarker",
    categoryLabel: "血液肿瘤标志物",
    summary: "上皮细胞骨架蛋白的可溶性片段，正常参考值一般在 0 ~ 3.3 ng/mL。",
    clinicalMeaning: "在非小细胞肺癌（尤其是肺鳞癌与腺癌）中有一定表达。然而慢性支气管炎、肺炎康复期也会释放少量片段进入血液。",
    plainLanguageReassurance: "化验指标需结合影像看，单独轻度偏高常由良性气道炎症导致，保持随访即可，切勿盲目恐慌。"
  },
  "NSE": {
    term: "神经元特异性烯醇化酶 (NSE)",
    enName: "Neuron-Specific Enolase",
    category: "biomarker",
    categoryLabel: "血液肿瘤标志物",
    summary: "神经内分泌细胞与红细胞内含有的一种酶，正常参考值一般在 0 ~ 16.3 ng/mL。",
    clinicalMeaning: "小细胞肺癌特异性标志物。抽血时如果标本发生轻微溶血（红细胞破裂）会释放大量 NSE 导致假性偏高。",
    plainLanguageReassurance: "抽血样本轻微溶血是造成 NSE 假阳性升高的最常见原因，若胸部 CT 未见异常，通常在 2~4 周后重新空腹复查即可消除误会。"
  }
};

/**
 * Helper: Find glossary definition by keyword match
 */
export function findGlossaryTerm(name: string): GlossaryTerm | null {
  if (!name) return null;
  const clean = name.trim();
  
  if (CLINICAL_GLOSSARY[clean]) return CLINICAL_GLOSSARY[clean];

  // Direct exact sub-matches
  for (const [key, val] of Object.entries(CLINICAL_GLOSSARY)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }

  return null;
}
