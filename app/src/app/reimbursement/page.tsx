"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Pill,
  Sparkles,
  HeartHandshake,
  MapPin,
  FileCheck,
  AlertOctagon,
  Search,
  Filter,
  BadgeAlert,
  Layers,
  ArrowUpRight,
  Info,
  Smartphone,
  Lightbulb
} from "lucide-react";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";

interface DrugPolicy {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  target: string;
  categoryTag: "egfr" | "alk_ros1" | "rare_targets" | "immunotherapy";
  originalPrice: number;    // 国谈前月自费(元)
  negotiatedPrice: number;  // 现行国谈医保基准价月费用(元)
  insuranceCategory: "甲类 (全额统筹)" | "乙类 (先行自付5%~15%)" | "未进基本医保 (惠民保/PAP覆盖)";
  inInsurance: boolean;
  officialIndication: string;  // 官方说明书适应证
  reimbursementLimits: string; // 医保限定支付范围（报销红线）
  offLabelNotice?: string;     // 超医保范围自费提醒
  papProgram: string;          // 官方慈善赠药项目名称
  papFoundation: string;       // 主办基金会
  papRule: string;             // 具体买赠/援助规则
}

const DRUG_POLICIES: DrugPolicy[] = [
  // --- EGFR 靶向体系 ---
  {
    id: "osimertinib",
    name: "泰瑞沙",
    genericName: "甲磺酸奥希替尼片 (80mg)",
    manufacturer: "阿斯利康 (AstraZeneca)",
    target: "EGFR 19del / L858R / T790M",
    categoryTag: "egfr",
    originalPrice: 51000,
    negotiatedPrice: 5580,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① EGFR 敏感突变局部晚期或转移性 NSCLC 一线治疗；② 经既往 EGFR-TKI 治疗后进展且 T790M 突变阳性；③ IB-IIIA 期 (AJCC第7版) EGFR 敏感突变术后辅助治疗。",
    reimbursementLimits: "限 EGFR 外显子 19 缺失或 L858R 置换突变的局部晚期或转移性 NSCLC 一线，或既往进展经检验 T790M 突变阳性；术后辅助治疗（IB-IIIA期）已纳保。",
    offLabelNotice: "未行基因检测盲吃、或非小细胞肺癌以外癌种不予医保支付，需完全自费。",
    papProgram: "泰瑞沙慈善援助项目",
    papFoundation: "中华慈善总会 (CCF)",
    papRule: "符合医学条件的低保患者全额免费援助；非低保患者自付达到一定周期后提供后续免费药品援助。"
  },
  {
    id: "fumetinib",
    name: "艾弗沙",
    genericName: "甲磺酸伏美替尼片 (80mg)",
    manufacturer: "江苏艾力斯 (Allist)",
    target: "EGFR 敏感突变 / 20外显子插入",
    categoryTag: "egfr",
    originalPrice: 28000,
    negotiatedPrice: 5200,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① EGFR 19del/L858R 局部晚期或转移性 NSCLC 一线治疗；② 既往 EGFR-TKI 治疗进展后 T790M 突变二线；③ 20外显子插入突变（获批突破性疗法）。",
    reimbursementLimits: "限 EGFR 敏感突变局部晚期/转移性一线及 T790M 突变二线治疗。",
    offLabelNotice: "20 外显子插入突变在部分省份医保报销需个案审核或走惠民保特药通道。",
    papProgram: "生命之光·艾弗沙患者援助项目",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "自费购药达指定周期并经医学评估持续获益且耐受良好者，可申请后续周期药品援助。"
  },
  {
    id: "aumolertinib",
    name: "阿美乐",
    genericName: "甲磺酸阿美替尼片 (55mg/110mg)",
    manufacturer: "江苏豪森 (Hansoh)",
    target: "EGFR 19del / L858R / T790M",
    categoryTag: "egfr",
    originalPrice: 29000,
    negotiatedPrice: 3504,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① EGFR 敏感突变晚期一线治疗；② 既往治疗进展后 T790M 突变晚期治疗。",
    reimbursementLimits: "限 EGFR 外显子 19 缺失或 L858R 突变晚期一线，以及 T790M 突变二线。",
    offLabelNotice: "早期术后辅助尚未完全纳入统筹，多以门诊自费或双通道自付结算。",
    papProgram: "阿美乐患者援助项目",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "针对非医保覆盖或自付压力较大的患者提供买赠周期援助。"
  },
  {
    id: "dacomitinib",
    name: "多泽润",
    genericName: "达可替尼片 (45mg)",
    manufacturer: "辉瑞 (Pfizer)",
    target: "二代 EGFR (强效脑转移控制)",
    categoryTag: "egfr",
    originalPrice: 18000,
    negotiatedPrice: 3880,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "EGFR 敏感突变（19del / L858R）局部晚期或转移性 NSCLC 一线单药治疗。",
    reimbursementLimits: "限 EGFR 外显子 19 缺失或 L858R 突变的局部晚期或转移性 NSCLC 一线治疗。",
    offLabelNotice: "二线进展后或无基因证据者不可报销。",
    papProgram: "多泽润患者关爱项目",
    papFoundation: "中国癌症基金会",
    papRule: "阶梯式用药援助，具体依年度项目公告方案执行。"
  },
  {
    id: "gefitinib",
    name: "易瑞沙 / 吉非替尼",
    genericName: "吉非替尼片 (集采中选)",
    manufacturer: "阿斯利康 / 齐鲁制药等",
    target: "一代 EGFR 敏感突变",
    categoryTag: "egfr",
    originalPrice: 5000,
    negotiatedPrice: 260,
    insuranceCategory: "甲类 (全额统筹)",
    inInsurance: true,
    officialIndication: "EGFR 敏感突变局部晚期或转移性 NSCLC 一线治疗。",
    reimbursementLimits: "国家集中带量采购 (VBP) 药品，纳入门慢门特直接全额统筹报销，个人自付极低（月均仅几十元）。",
    papProgram: "已全额集采医保覆盖（无需 PAP）",
    papFoundation: "国家集中采购保障",
    papRule: "已降至极低基准价，基本医保直接统筹 85%~90%，无需申请慈善赠药。"
  },

  // --- ALK & ROS1 体系 ---
  {
    id: "alectinib",
    name: "安圣莎",
    genericName: "盐酸阿来替尼胶囊 (150mg)",
    manufacturer: "罗氏 (Roche)",
    target: "ALK 融合阳性 (钻石突变)",
    categoryTag: "alk_ros1",
    originalPrice: 49980,
    negotiatedPrice: 8500,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① ALK 阳性局部晚期或转移性 NSCLC 一线治疗；② ALINA 试验 ALK 阳性 IB-IIIA 期术后辅助治疗。",
    reimbursementLimits: "限 ALK 阳性的局部晚期或转移性 NSCLC 患者；术后辅助适应证在各省市医保逐步落实挂网中。",
    offLabelNotice: "术后辅助治疗用药若当地尚未完成系统编码更新，可凭处方走双通道或惠民保二次报销。",
    papProgram: "安圣莎患者援助项目",
    papFoundation: "中国癌症基金会 (CFC)",
    papRule: "自费购药满指定周期（如 4~6 个月）后，经评估无进展提供后续周期的免费药品援助。"
  },
  {
    id: "lorlatinib",
    name: "博瑞纳",
    genericName: "劳拉替尼片 / 洛拉替尼 (100mg)",
    manufacturer: "辉瑞 (Pfizer)",
    target: "三代 ALK / ROS1 难治脑转移",
    categoryTag: "alk_ros1",
    originalPrice: 42000,
    negotiatedPrice: 11800,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① ALK 阳性晚期 NSCLC 一线治疗；② 经阿来替尼/塞瑞替尼耐药进展后的后线治疗。",
    reimbursementLimits: "限 ALK 阳性晚期非小细胞肺癌患者的一线或后线治疗。",
    offLabelNotice: "ROS1 突变后线在部分省份属于超说明书用药，建议走惠民保特药通道申报。",
    papProgram: "博瑞纳患者援助项目",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "针对自付负担较重且持续获益的患者提供阶梯式赠药援助。"
  },
  {
    id: "entrectinib",
    name: "罗圣全",
    genericName: "恩曲替尼胶囊 (200mg)",
    manufacturer: "罗氏 (Roche)",
    target: "ROS1 融合 / NTRK 广谱突变",
    categoryTag: "alk_ros1",
    originalPrice: 37000,
    negotiatedPrice: 8900,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① ROS1 阳性局部晚期或转移性 NSCLC；② NTRK 融合阳性泛癌种晚期实体瘤。",
    reimbursementLimits: "限 ROS1 阳性晚期非小细胞肺癌，或 NTRK 阳性实体瘤。",
    papProgram: "罗圣全患者援助项目",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "符合入组标准的 ROS1 突变肺癌患者可申请买赠周期支持。"
  },

  // --- 罕见靶点 & ADC 体系 ---
  {
    id: "savolitinib",
    name: "沃瑞沙",
    genericName: "赛沃替尼片 (200mg)",
    manufacturer: "和黄医药 / 阿斯利康",
    target: "MET 14号外显子跳跃突变 / MET 扩增",
    categoryTag: "rare_targets",
    originalPrice: 19800,
    negotiatedPrice: 4800,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "含铂化疗后进展或不耐受标准含铂化疗的 MET 外显子 14 跳跃突变局部晚期或转移性 NSCLC。",
    reimbursementLimits: "限 MET 外显子 14 跳跃突变的局部晚期或转移性 NSCLC。",
    offLabelNotice: "EGFR-TKI 耐药后的 MET 扩增双靶联合在部分地区属于超医保限定，需自费或走特药理赔。",
    papProgram: "沃瑞沙患者援助项目",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "按买赠周期援助，大幅减轻罕见突变家庭负担。"
  },
  {
    id: "selpercatinib",
    name: "睿妥",
    genericName: "塞普替尼胶囊 (80mg)",
    manufacturer: "礼来 (Eli Lilly)",
    target: "RET 融合阳性 (强效高选择性)",
    categoryTag: "rare_targets",
    originalPrice: 32000,
    negotiatedPrice: 9500,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "RET 融合阳性局部晚期或转移性 NSCLC 成人患者。",
    reimbursementLimits: "限 RET 融合阳性的局部晚期或转移性非小细胞肺癌。",
    papProgram: "睿妥患者关爱援助项目",
    papFoundation: "中国癌症基金会",
    papRule: "经医学评估证实持续获益的 RET 突变患者享受赠药支持。"
  },
  {
    id: "fulzerasib",
    name: "达伯特",
    genericName: "氟泽雷塞片 (KRAS G12C抑制剂)",
    manufacturer: "信达生物 / 劲方医药",
    target: "KRAS G12C 突变突破",
    categoryTag: "rare_targets",
    originalPrice: 22000,
    negotiatedPrice: 12000,
    insuranceCategory: "未进基本医保 (惠民保/PAP覆盖)",
    inInsurance: false,
    officialIndication: "既往经至少一种系统治疗进展的 KRAS G12C 突变局部晚期或转移性 NSCLC。",
    reimbursementLimits: "2024 年全新获批，暂未进入国家基本医保目录，已被全国多地城市惠民保纳入门诊特药 0 免赔报销 70%+！",
    papProgram: "达伯特患者援助项目 (筹备启动中)",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "购药达指定疗程可申请阶段性免费赠药，结合城市惠民保二次报销自负低至 2000 元/月左右。"
  },
  {
    id: "enhertu",
    name: "优赫得",
    genericName: "注射用德曲妥珠单抗 (DS-8201 / HER2 ADC)",
    manufacturer: "第一三共 / 阿斯利康",
    target: "HER2 (ERBB2) 突变晚期肺癌",
    categoryTag: "rare_targets",
    originalPrice: 36000,
    negotiatedPrice: 18000,
    insuranceCategory: "未进基本医保 (惠民保/PAP覆盖)",
    inInsurance: false,
    officialIndication: "既往接受过系统治疗的 HER2 (ERBB2) 突变不可切除或转移性 NSCLC。",
    reimbursementLimits: "尚未纳入国家基本医保目录。已 100% 纳入上海沪惠保、北京普惠保、穗岁康等全国绝大部分城市商业补充险（惠民保）特药责任。",
    papProgram: "优赫得患者援助项目",
    papFoundation: "中国癌症基金会",
    papRule: "惠民保报销 60%~80% 叠加慈善赠药，年自负降幅超 75%。"
  },

  // --- 免疫治疗体系 (PD-1 / PD-L1) ---
  {
    id: "tislelizumab",
    name: "百泽安",
    genericName: "替雷利珠单抗注射液 (200mg)",
    manufacturer: "百济神州 (BeiGene)",
    target: "PD-1 免疫检查点 (国产四小龙)",
    categoryTag: "immunotherapy",
    originalPrice: 10688,
    negotiatedPrice: 1250,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "① 联合化疗一线治疗晚期鳞状/非鳞状 NSCLC；② 经治晚期 NSCLC 单药二线；③ II-IIIA 期术后辅助免疫治疗。",
    reimbursementLimits: "晚期非鳞状/鳞状 NSCLC 一线联合化疗全部纳保；单药治疗纳保。统筹后每 3 周个人自负仅约 200~300 元！",
    papProgram: "已全额医保乙类高比例统筹（自负极低）",
    papFoundation: "国家医保统筹直接覆盖",
    papRule: "每次输注经门慢门特报销后仅需自负数百元，无需繁琐申办 PAP。"
  },
  {
    id: "sintilimab",
    name: "达伯舒",
    genericName: "信迪利单抗注射液 (100mg)",
    manufacturer: "信达生物 (Innovent) / 礼来",
    target: "PD-1 免疫检查点",
    categoryTag: "immunotherapy",
    originalPrice: 9800,
    negotiatedPrice: 1080,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "联合培美曲塞和铂类一线治疗 EGFR/ALK 阴性不可手术的局部晚期或转移性非鳞状 NSCLC。",
    reimbursementLimits: "非鳞状及鳞状 NSCLC 一线治疗全适应证纳入国家医保乙类。",
    papProgram: "国家医保统筹直接报销",
    papFoundation: "国家医保统筹保障",
    papRule: "门特统筹报销 80% 左右，每周期自负 200 余元。"
  },
  {
    id: "durvalumab",
    name: "英飞凡",
    genericName: "度伐利尤单抗注射液 (500mg)",
    manufacturer: "阿斯利康 (AstraZeneca)",
    target: "PD-L1 (PACIFIC 模式巩固治疗)",
    categoryTag: "immunotherapy",
    originalPrice: 36000,
    negotiatedPrice: 13500,
    insuranceCategory: "乙类 (先行自付5%~15%)",
    inInsurance: true,
    officialIndication: "同步放化疗后未出现疾病进展的不可切除、局部晚期 (III期) NSCLC 巩固治疗；广泛期小细胞肺癌一线。",
    reimbursementLimits: "限同步放化疗后未进展的不可切除 III 期 NSCLC 维持巩固治疗（严格符合 PACIFIC 研究模式）。",
    offLabelNotice: "IV 期初治联合双免疫若超医保限定，需走自费或惠民保特药。",
    papProgram: "因飞凡患者援助项目",
    papFoundation: "中国初级卫生保健基金会",
    papRule: "买几赠几阶段性援助方案，有效降低 III 期维持 1 年全疗程总费用。"
  },
  {
    id: "pembrolizumab",
    name: "可瑞达 (K药)",
    genericName: "帕博利珠单抗注射液 (100mg)",
    manufacturer: "默沙东 (MSD)",
    target: "PD-1 免疫检查点 (进口金标准)",
    categoryTag: "immunotherapy",
    originalPrice: 35836,
    negotiatedPrice: 17918,
    insuranceCategory: "未进基本医保 (惠民保/PAP覆盖)",
    inInsurance: false,
    officialIndication: "① PD-L1 TPS ≥1% EGFR/ALK 阴性晚期一线单药；② 联合培美曲塞和铂类晚期一线；③ 早期术后辅助治疗。",
    reimbursementLimits: "目前未进国家基本医保目录。已被全国绝大多数城市“惠民保”纳入特药报销 60%~80%！",
    papProgram: "生命之钥·肿瘤免疫治疗患者援助项目",
    papFoundation: "中国初级卫生保健基金会 (CPBPCF)",
    papRule: "执行【2+2 ➔ 2+N】年度方案：自费购买 2 周期赠 2 周期，之后再自费购买 2 周期赠药至疾病进展（最多 2 年封顶），年自负降幅超 75%。"
  }
];

export default function ReimbursementPage() {
  const [selectedDrugId, setSelectedDrugId] = useState<string>("osimertinib");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [insuranceType, setInsuranceType] = useState<"urban_employee" | "urban_resident">("urban_employee");
  const [hasHuiminbao, setHasHuiminbao] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"calculator" | "reimbursement_table" | "cross_province" | "dual_channel" | "pap_guide" | "faq">("calculator");

  const filteredDrugs = selectedCategory === "all" 
    ? DRUG_POLICIES 
    : DRUG_POLICIES.filter(d => d.categoryTag === selectedCategory);

  const currentDrug = DRUG_POLICIES.find(d => d.id === selectedDrugId) || DRUG_POLICIES[0];

  // Precise Copay Calculation Engine based on NHSA Rules
  const calcReimbursement = () => {
    const monthlyBase = currentDrug.negotiatedPrice;
    
    // Case 1: Drug Not in Basic Insurance (e.g., Enhertu DS-8201 or Keytruda K-drug)
    if (!currentDrug.inInsurance) {
      const papAnnualCap = currentDrug.id === "pembrolizumab" ? 70000 : 80000;
      const huiminbaoCoverageRatio = hasHuiminbao ? 0.75 : 0;
      const effectiveAnnual = papAnnualCap * (1 - huiminbaoCoverageRatio);
      const effectiveMonthly = Math.round(effectiveAnnual / 12);
      return {
        monthlyBase,
        insurancePaid: 0,
        personalMonthly: effectiveMonthly,
        reimburseRatioDesc: hasHuiminbao ? "惠民保特药直报 75% + PAP 赠药" : "官方 PAP 赠药封顶",
        annualEstimated: Math.round(effectiveAnnual),
        savingsPercent: Math.round((1 - effectiveAnnual / (currentDrug.originalPrice * 12)) * 100)
      };
    }

    // Case 2: Drug in Basic Insurance (乙类/甲类 门慢门特统筹支付)
    const coverageRatio = insuranceType === "urban_employee" ? 0.80 : 0.65;
    const personalRatio = 1 - coverageRatio;
    
    let personalMonthly = Math.round(monthlyBase * personalRatio);
    if (hasHuiminbao && personalMonthly > 300) {
      personalMonthly = Math.round(personalMonthly * 0.5);
    }

    const insurancePaid = monthlyBase - personalMonthly;
    const annualEstimated = personalMonthly * 12;
    const savingsPercent = Math.round((1 - annualEstimated / (currentDrug.originalPrice * 12)) * 100);

    return {
      monthlyBase,
      insurancePaid,
      personalMonthly,
      reimburseRatioDesc: insuranceType === "urban_employee" 
        ? (hasHuiminbao ? "职工门特 80% + 惠民保二次报销" : "职工医保门特统筹约 80%") 
        : (hasHuiminbao ? "居民门特 65% + 惠民保二次报销" : "居民医保门特统筹约 65%"),
      annualEstimated,
      savingsPercent
    };
  };

  const stats = calcReimbursement();

  async function copyTextSafe(text: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        console.warn("navigator.clipboard failed, falling back to execCommand", e);
      }
    }

    // Fallback for non-HTTPS / iOS Safari / in-app WebViews
    return new Promise((resolve) => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        resolve(successful);
      } catch (err) {
        console.error("Fallback copy failed:", err);
        resolve(false);
      }
    });
  }

  const handleCopyChecklist = async () => {
    const checklistText = `【肺癌门慢门特与特药报销申办官方材料清单 (医保办核验标准)】
1. 身份凭证：身份证、社保卡原件及复印件（或激活医保电子凭证二维码）；
2. 病历依据：近半年经治三甲医院住院病历、出院小结或门诊病历（须加盖医院病案室鲜章）；
3. 病理报告：明确诊断为原发性非小细胞肺癌/肺腺癌的病理切片报告单（加盖公章）；
4. 分子基因分型：正规基因检测报告（注明 EGFR / ALK / ROS1 / MET / RET / KRAS 等突变或 PD-L1 表达单）；
5. 申请审批表：主诊主任/副主任医师填写的《基本医疗保险门诊慢特病待遇认定申请表》（医院医保办盖章）；
6. 选定定点：选定 1~2 家定点三甲医院及 1 家“双通道”定点零售药房备案回执。`;
    const ok = await copyTextSafe(checklistText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      <SubpageNavbar />

      {/* Unified Hero Header (Aligned with /wiki, /studies, /resources, /knowledge) */}
      <header className="pt-28 md:pt-32 pb-8 px-2.5 sm:px-6 max-w-4xl mx-auto text-center space-y-4">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200/80 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>国家医保谈判药品目录 · 门慢门特 · 官方 PAP 落地指南</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>2024~2025 现行标准</span>
        </div>

        {/* Unified H1 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          破除用药负担 · <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500">特药医保与慈善赠药</span>
        </h1>

        {/* Unified Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          系统梳理 <strong>16 大肺腺癌主流靶向与免疫药物</strong> 官方医保限定支付标准。为您提供<strong>门慢门特 3 步办结、跨省异地直接结算、双通道定点药房刷卡与官方基金会 PAP 免费赠药</strong>的权威实操路径。
        </p>

        {/* Informational Guidance Banner */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs text-left">
          <div className="flex items-start sm:items-center gap-2.5">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-black text-blue-950 text-sm">医保政策落地准则：</span>
              <span className="text-slate-600 ml-1">严格执行国家医保局“就医地目录、参保地政策”与双通道电子处方直报机制。</span>
            </div>
          </div>
          <button
            onClick={handleCopyChecklist}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition-colors cursor-pointer text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "已复制材料清单" : "复制办门特材料"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area (Standard max-w-7xl) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2.5 sm:px-6 pb-16 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "calculator" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>自负费用在线估算器</span>
          </button>
          <button
            onClick={() => setActiveTab("reimbursement_table")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "reimbursement_table" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>16大特药医保限定与红线表</span>
          </button>
          <button
            onClick={() => setActiveTab("cross_province")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "cross_province" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>跨省异地就医与门特结算</span>
          </button>
          <button
            onClick={() => setActiveTab("dual_channel")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dual_channel" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>“双通道”药房与防推诿破局</span>
          </button>
          <button
            onClick={() => setActiveTab("pap_guide")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pap_guide" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>官方 PAP 慈善赠药全攻略</span>
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "faq" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>医保高频避坑 FAQ</span>
          </button>
        </div>

        {/* TAB 1: CALCULATOR & 4 CHANNELS OVERVIEW */}
        {activeTab === "calculator" && (
          <div className="space-y-8 animate-fade-in">
            {/* 4 Core Channels Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900">国谈医保与门慢门特</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  主流三代靶向药已降价 80%+ 纳入国家乙类目录。办妥门特后，无需住院在门诊即可享受 <strong>65%~85%</strong> 统筹报销。
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-teal-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900">“双通道”定点药房</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  医院药房缺药时，凭医生流转处方直接在定点药房刷医保电子凭证取药，享受与三甲医院完全同等的报销比例。
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-purple-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-slate-900">城市定制“惠民保”</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  百元保费、不限既往症。针对医保统筹后的个人自负部分及部分未进医保昂贵特药（如 DS-8201/K药）二次报销 <strong>50%~80%</strong>。
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-amber-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h3 className="text-sm font-bold text-slate-900">官方基金会 PAP 赠药</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  中华慈善总会/中国初保基金会官方项目。低保全免，非低保按周期自费达标后提供后续免费赠药，封顶年总支出。
                </p>
              </div>
            </div>

            {/* Interactive Calculator Section */}
            <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <span>肺腺癌 16 大特药自负费用在线测算模拟器</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    按国家医保局统一标准算法，模拟计算门特统筹支付、个人自负及惠民保/PAP 减负后真实月支出
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-center">
                  2024~2025 现行医保目录
                </span>
              </div>

              {/* Target Category Filter for Drug Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  <span>按靶点大类筛选：</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedCategory === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    全部 16 种特药
                  </button>
                  <button
                    onClick={() => setSelectedCategory("egfr")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedCategory === "egfr" ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    EGFR 靶向 (泰瑞沙/艾弗沙/阿美乐等)
                  </button>
                  <button
                    onClick={() => setSelectedCategory("alk_ros1")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedCategory === "alk_ros1" ? "bg-purple-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    ALK / ROS1 (安圣莎/博瑞纳/罗圣全)
                  </button>
                  <button
                    onClick={() => setSelectedCategory("rare_targets")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedCategory === "rare_targets" ? "bg-teal-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    罕见靶点 MET/RET/KRAS/HER2 ADC
                  </button>
                  <button
                    onClick={() => setSelectedCategory("immunotherapy")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      selectedCategory === "immunotherapy" ? "bg-indigo-600 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    免疫治疗 PD-1/PD-L1 (国产/进口)
                  </button>
                </div>
              </div>

              {/* Calculator Form Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">1. 选择具体药品：</label>
                  <select
                    value={selectedDrugId}
                    onChange={(e) => setSelectedDrugId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-blue-500 focus:bg-white"
                  >
                    {filteredDrugs.map((drug) => (
                      <option key={drug.id} value={drug.id}>
                        {drug.name} ({drug.genericName.split(" ")[0]}) - {drug.target}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">2. 选择基本医保类型：</label>
                  <select
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-blue-500 focus:bg-white"
                  >
                    <option value="urban_employee">城镇职工基本医疗保险 (门特统筹报销约 80%)</option>
                    <option value="urban_resident">城乡居民基本医疗保险 / 新农合 (门特统筹约 65%)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">3. 城市定制型商业险 (惠民保)：</label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setHasHuiminbao(true)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer text-xs ${
                        hasHuiminbao ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      已参保 (二次报销)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasHuiminbao(false)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer text-xs ${
                        !hasHuiminbao ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      未参保
                    </button>
                  </div>
                </div>
              </div>

              {/* Calculator Output Display Card (Dark Theme, Elegant) */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] text-sky-400 font-mono font-bold">
                      {currentDrug.target} · {currentDrug.manufacturer}
                    </span>
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      {currentDrug.name} ({currentDrug.genericName})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {currentDrug.insuranceCategory}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                      综合减负约 {stats.savingsPercent}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">国谈前原自费</div>
                    <div className="text-sm sm:text-base font-bold text-slate-400 line-through font-mono">
                      ¥{currentDrug.originalPrice}/月
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-slate-400">现行医保基准价</div>
                    <div className="text-sm sm:text-base font-bold text-sky-300 font-mono">
                      ¥{currentDrug.negotiatedPrice}/月
                    </div>
                  </div>

                  <div className="p-3 bg-blue-900/60 rounded-xl border border-blue-500/50">
                    <div className="text-[10px] text-blue-300">医保统筹报销预估</div>
                    <div className="text-sm sm:text-base font-bold text-blue-200 font-mono">
                      -¥{stats.insurancePaid}/月
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-500/60">
                    <div className="text-[10px] text-emerald-300 font-bold">个人月自负预估</div>
                    <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                      ¥{stats.personalMonthly}
                      <span className="text-xs font-normal text-emerald-200">/月</span>
                    </div>
                  </div>
                </div>

                {/* Indication Limits & PAP Notice */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 text-slate-200 space-y-1">
                    <div className="font-bold text-sky-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>国家医保限定支付范围（报销红线）：</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {currentDrug.reimbursementLimits}
                    </p>
                    {currentDrug.offLabelNotice && (
                      <p className="text-[11px] text-rose-300 leading-relaxed font-semibold">
                        ⚠️ 报销提示：{currentDrug.offLabelNotice}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 text-slate-200 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>官方慈善援助 (PAP) 政策：{currentDrug.papProgram} ({currentDrug.papFoundation})</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {currentDrug.papRule}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Step Chronic Disease Application Fast-Track */}
            <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>门诊慢特病 (门特) 3 步办结全流程</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    办好门特是享受 80%+ 医保报销的核心前提，绝大多数三甲医院支持“一站式”直办
                  </p>
                </div>
                <button
                  onClick={handleCopyChecklist}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "已复制材料清单" : "一键复制申办材料清单"}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-sm">
                    1
                  </div>
                  <div className="space-y-2 text-xs w-full">
                    <h3 className="font-bold text-slate-900 text-sm">主诊医生开具申请表并加盖公章</h3>
                    <p className="text-slate-600 leading-relaxed">
                      在主治医生处或医院便民服务窗口领取《门诊慢特病待遇认定申请表》，由主治医生填写临床诊断、基因突变分型及用药方案；随后在拿表窗口或病案室加盖公章（用于拍照上传）。
                    </p>

                    {/* 浙一医院拿表与盖章实操示例 */}
                    <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200/80 text-[11px] text-blue-950 flex items-start gap-2 shadow-2xs">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span className="font-bold text-blue-800">浙一医院实操示范：</span>
                        <span>在浙大一院各院区一楼<strong>便民服务中心 / 医保咨询窗口</strong>拿取门特申请表 ➔ 请主治医生填写临床诊断与签名 ➔ 回到拿表处（便民服务中心）<strong>加盖公章</strong> ➔ 手机拍照留存（用于浙里办线上上传）。</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-sm">
                    2
                  </div>
                  <div className="space-y-3 text-xs w-full">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                        <span>医院医保办一站式直报（或当地医保 APP 线上申报）</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          掌上秒办 / 窗口 1~3 工作日
                        </span>
                      </h3>
                      <p className="text-slate-600 leading-relaxed mt-1">
                        携带材料前往就诊医院的<strong>医保服务办公室</strong>直接提交审核；绝大多数省市已支持在政务与医保 APP 进行线上“门慢门特申请”拍照上传审核。
                      </p>
                    </div>

                    {/* 标杆省份实操示例：浙江“浙里办”与浙一医院门特落地流程 */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-blue-50/50 border border-indigo-200/80 space-y-2.5">
                      <div className="flex items-center gap-2 text-indigo-950 font-bold">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="text-xs sm:text-sm font-extrabold text-indigo-900">
                          标杆实操示范 · 浙江“浙里办”APP 线上极速申报与浙大一院（浙一）就医直报
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px] sm:text-xs text-slate-700">
                        <div className="bg-white/90 p-3 rounded-xl border border-indigo-100 space-y-1.5 shadow-2xs">
                          <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>第一步：浙里办 APP 线上便捷申办</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            打开<strong>「浙里办」APP</strong> ➔ 搜索<strong>「浙里医保」</strong> ➔ 点击<strong>「门诊慢特病待遇备案」</strong> ➔ 申请病种精准选择<strong>「肺肿瘤」</strong> ➔ 按提示拍照上传盖好公章的申请表、出院小结与病理报告 ➔ 提交后通常 1 个工作日内即可完成认定生效。
                          </p>
                        </div>

                        <div className="bg-white/90 p-3 rounded-xl border border-indigo-100 space-y-1.5 shadow-2xs">
                          <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>第二步：浙一医院挂号直接享受门特</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            门特备案生效后，在<strong>浙大一院（浙一医院）官方微信公众号 / 支付宝小程序</strong>预约挂号，到院后在<strong>门诊自助机取号时，取号类型直接选择「特殊门诊」</strong>。医生开具靶向药（如奥希替尼等）或复查项目时，系统<strong>自动按门特标准统筹抵扣（报销约 80%~90%）</strong>，仅需支付自负差额！
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-[11px] text-indigo-900 font-medium flex items-center gap-1.5 pt-0.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>其他省市（如江苏“江苏医保云”、上海“随申办”、广东“粤医保”等）流程基本一致，均支持掌上免跑腿线上直认。</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5 hover:border-slate-300 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <h3 className="font-bold text-slate-900 text-sm">选择定点医院与“双通道”定点药房直接联网结算</h3>
                    <p className="text-slate-600 leading-relaxed">
                      认定生效后，选择 1 家常就诊三甲医院及 1 家“双通道”定点特药零售药房备案。后续购药时，凭医生处方直接出示<strong>医保电子凭证码</strong>，系统自动统筹结算，患者仅需支付个人自负部分。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPREHENSIVE 16 DRUGS REIMBURSEMENT LIMITS TABLE */}
        {activeTab === "reimbursement_table" && (
          <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>16 大主流肺腺癌特药国谈医保限定支付与红线全览表</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                依据国家医疗保障局 (NHSA) 现行《国家基本医疗保险药品目录》法定支付范围整理
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3.5">药品名称 / 通用名</th>
                    <th className="p-3.5">靶点 / 代系</th>
                    <th className="p-3.5">医保基准价</th>
                    <th className="p-3.5">医保限定支付范围 (绿灯可报销)</th>
                    <th className="p-3.5">自费红线提示 (红灯需自费)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DRUG_POLICIES.map((drug) => (
                    <tr key={drug.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{drug.name}</div>
                        <div className="text-[11px] text-slate-500">{drug.genericName}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-slate-700 font-semibold">{drug.target}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-blue-600">¥{drug.negotiatedPrice}</div>
                        <span className="text-[10px] text-slate-400 font-normal">/月费用</span>
                      </td>
                      <td className="p-3.5 max-w-xs leading-relaxed text-slate-700">
                        {drug.reimbursementLimits}
                      </td>
                      <td className="p-3.5 max-w-xs leading-relaxed">
                        {drug.offLabelNotice ? (
                          <span className="text-rose-600 font-medium">{drug.offLabelNotice}</span>
                        ) : (
                          <span className="text-slate-400">无基因证据盲吃不予支付</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CROSS-PROVINCE DIRECT SETTLEMENT */}
        {activeTab === "cross_province" && (
          <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <span>跨省异地就医与门慢门特直接联网结算 4 步通</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                依据医保发〔2022〕22号《关于进一步做好基本医疗保险跨省异地就医直接结算工作的通知》
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>就医前完成“异地就医线上备案”</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  手机打开<strong>“国家医保服务平台” APP</strong> 或微信小程序“国家异地就医备案”，选择参保地与就医地（如北京、上海、广州）。选择“异地长期居住”或“跨省临时就医转诊”，拍照上传身份证与医院转诊单，<strong>即时或 1 个工作日内办结生效</strong>。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>牢记国家结算核心原则</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  跨省直接结算遵循<strong>“就医地目录、参保地政策、就医地管理”</strong>：
                  <br />• <strong>就医地目录</strong>：哪些药能报，按就医地医院的医保药品目录为准；
                  <br />• <strong>参保地政策</strong>：报销起付线、报销比例（如80%）与封顶线按您老家的医保政策执行。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>门慢门特跨省直接联网刷卡</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  全国已全面开通恶性肿瘤门诊放化疗与特药跨省联网结算。患者在异地三甲医院门诊开具奥希替尼等靶向药时，直接出示<strong>医保码或社保卡</strong>，系统自动按门特比例直接扣除报销金额，无需垫付现金拿回老家报销。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-2">
                <div className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
                  <span>未提前备案的补救措施</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  若紧急就医未提前备案，可在<strong>出院或结算前完成补备案</strong>；即使全额自费结算，保留好全国统一医疗收费发票、费用清单与病历原件，6 个月内回老家医保经办大厅窗口办理手工零星报销。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DUAL-CHANNEL PHARMACY & BREAKTHROUGH */}
        {activeTab === "dual_channel" && (
          <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span>“双通道”定点药房处方流转与医院推诿破局攻略</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                依据医保发〔2021〕28号《关于建立完善国家医保谈判药品“双通道”管理机制的指导意见》
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                <div className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>什么是“双通道”？</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  “双通道”是指通过<strong>定点医疗机构（医院）</strong>和<strong>定点零售药房（特药药房）</strong>两个渠道，保障患者能买到国谈特药，并享受<strong>完全相同的医保报销待遇</strong>。
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  <span>遇到“医院药房没药 / 医生推诿开不出药”如何破局？</span>
                </div>
                <ul className="space-y-2.5 text-slate-700 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">方案 A (主动要求外配电子处方)：</span>
                    <span>明确告知主诊医生：“请帮我开具医保【双通道外配电子处方】，我直接去医院旁边的定点特药药房刷医保码取药。”这<strong>不计入医院的药占比与次均费用考核</strong>，医生非常愿意开具。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-blue-600">方案 B (处方流转平台取药)：</span>
                    <span>处方开具后，医保系统会自动发送短信或在省医保小程序生成处方码，直接前往指定的双通道药房（如国药控股、大参林、老百姓、思派大药房等），出示医保码直接结算自负部分取药。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFICIAL PAP CHARITY ASSISTANCE */}
        {activeTab === "pap_guide" && (
          <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                <span>官方慈善基金会 PAP 患者援助项目买赠方案明细</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                由中华慈善总会 (CCF)、中国初级卫生保健基金会 (CPBPCF)、中国癌症基金会 (CFC) 官方管理
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                  <div className="font-bold text-purple-900 text-sm">中华慈善总会 (CCF)</div>
                  <div className="text-slate-600 text-[11px]">代表项目：泰瑞沙 (奥希替尼) 援助项目</div>
                  <p className="text-slate-700 leading-relaxed pt-1">
                    官方热线与微信公众号直接提交病历材料初审，全国各省会均设有慈善发药点。
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                  <div className="font-bold text-purple-900 text-sm">中国初保基金会</div>
                  <div className="text-slate-600 text-[11px]">代表项目：生命之钥 (可瑞达)、因飞凡、艾弗沙</div>
                  <p className="text-slate-700 leading-relaxed pt-1">
                    “生命之钥”公众号线上提交发票与随访 RECIST 评估报告，审核通过后顺丰包邮直达。
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                  <div className="font-bold text-purple-900 text-sm">中国癌症基金会 (CFC)</div>
                  <div className="text-slate-600 text-[11px]">代表项目：安圣莎 (阿来替尼)、多泽润、优赫得</div>
                  <p className="text-slate-700 leading-relaxed pt-1">
                    主诊医生入组注册，患者上传基因检测与购药发票，按周期给予后续免费药品。
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>防诈骗严正警示：官方 PAP 赠药全程绝不收取任何“中介费/加速费”！</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  所有官方 PAP 项目申请表格均可在上述基金会官方网站或认证微信公众号免费下载，严禁向任何第三方代办中介转账！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: FAQ */}
        {activeTab === "faq" && (
          <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <span>医保特药报销政策高频避坑问答 (FAQ)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                针对各地窗口政策差异、报销额度、年审与发票报销核心难点解答
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition-all">
                <div className="font-bold text-slate-900 text-sm">Q1：门慢门特有有效期吗？需要每年重新去医院认定吗？</div>
                <p className="text-slate-600 leading-relaxed">
                  绝大多数省市针对<strong>恶性肿瘤门诊慢特病设定为 2~5 年有效期或长期有效</strong>。部分省市每年需在医保 APP 线上进行一次“生存认证”或刷卡一次自动续期，无需重新提供病理切片重复认定。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition-all">
                <div className="font-bold text-slate-900 text-sm">Q2：靶向药在门诊拿和住院拿，哪个报销比例更高？</div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>办好门特后，两者报销比例基本相同（均为 70%~85% 左右）</strong>！而且门诊走门特无需占用昂贵的床位费、诊疗费与住院押金，随开随走，极大节约综合时间与经济成本。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition-all">
                <div className="font-bold text-slate-900 text-sm">Q3：医生开药时说属于“乙类先行自付”，是什么意思？</div>
                <p className="text-slate-600 leading-relaxed">
                  国家医保乙类药品在统筹报销前，按政策需患者<strong>先个人自付一定比例（通常为 5%~15%）</strong>，剩余的 85%~95% 费用再全额进入医保大病统筹按规定比例报销。这是完全正常的国家法定支付机制。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition-all">
                <div className="font-bold text-slate-900 text-sm">Q4：买了“城市惠民保”，怎么申请靶向药报销？</div>
                <p className="text-slate-600 leading-relaxed">
                  微信搜索参保城市的惠民保公众号（如“上海沪惠保”、“北京普惠健康保”、“西湖益联保”），进入【理赔服务 ➔ 特药理赔申请】，拍照上传定点医院处方、病理与基因报告及购药发票，审核通过后 3~5 个工作日直接赔付到银行卡。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2 hover:border-indigo-300 transition-all">
                <div className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Q5：以浙江省（浙里办）和浙大一院（浙一）为例，门特从申请到就医扣款的完整闭环是怎样的？</span>
                </div>
                <div className="space-y-1.5 text-slate-700 text-xs leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-700 shrink-0">1. 开表与盖章：</span>
                    <span>在浙大一院一楼便民服务中心领取门特纸质表 ➔ 请主治医生填写诊断并签字 ➔ 回到便民服务中心（拿表处）加盖公章并手机拍照；</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-700 shrink-0">2. 浙里办线上认定：</span>
                    <span>打开「浙里办」APP 搜索「浙里医保」➔ 进入「门诊慢特病待遇备案」➔ 申请病种精准选择<strong>「肺肿瘤」</strong> ➔ 上传盖章申请表、出院小结及病理报告，通常 1 个工作日内自动秒审生效；</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-700 shrink-0">3. 预约与自助机取号：</span>
                    <span>在浙大一院官方微信公众号或<strong>支付宝小程序</strong>预约挂号，就诊当日在<strong>门诊自助机取号时，取号类型直接选择「特殊门诊」</strong>；</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-700 shrink-0">4. 自动统筹扣款：</span>
                    <span>接诊医生开具靶向药（如奥希替尼等）或检查检验时，结算系统自动按门特标准统筹抵扣（报销约 80%~90%），患者仅需支付个人极少量自负差额！</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer maxWidth="max-w-7xl" />
    </div>
  );
}
