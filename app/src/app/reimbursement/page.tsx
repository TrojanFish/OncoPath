"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  ArrowLeft, 
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
  HeartHandshake
} from "lucide-react";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";

interface DrugPolicy {
  id: string;
  name: string;
  genericName: string;
  target: string;
  originalPrice: number;    // 国谈前月费用(元)
  negotiatedPrice: number;  // 国谈医保后月费用(元)
  inInsurance: boolean;
  indications: string;      // 医保报销限定支付范围
  papProgram: string;       // 慈善赠药政策
  papCondition: string;
}

const DRUG_POLICIES: DrugPolicy[] = [
  {
    id: "osimertinib",
    name: "泰瑞沙",
    genericName: "甲磺酸奥希替尼片 (80mg)",
    target: "EGFR 19del / L858R / T790M",
    originalPrice: 51000,
    negotiatedPrice: 5580,
    inInsurance: true,
    indications: "① 具有EGFR外显子19缺失或L858R突变的局部晚期或转移性NSCLC一线治疗；② 既往EGFR-TKI治疗后T790M突变阳性；③ IB-IIIA期术后辅助治疗（部分省份已纳入门特乙类支付）。",
    papProgram: "中华慈善总会·泰瑞沙慈善援助项目",
    papCondition: "低保患者全额援助；非低保患者自费/医保购买一定周期后提供后续免费援助。"
  },
  {
    id: "fumetinib",
    name: "艾弗沙",
    genericName: "甲磺酸伏美替尼片",
    target: "EGFR 敏感突变 / 20外显子插入",
    originalPrice: 28000,
    negotiatedPrice: 5200,
    inInsurance: true,
    indications: "EGFR 19del/L858R 局部晚期或转移性 NSCLC 一线治疗，以及 T790M 耐药突变后线治疗；术后辅助适应证逐步纳入医保。",
    papProgram: "中国初级卫生保健基金会·艾弗沙援助项目",
    papCondition: "符合医学评估与经济评估标准后可享受买赠周期援助。"
  },
  {
    id: "alectinib",
    name: "安圣莎",
    genericName: "盐酸阿来替尼胶囊",
    target: "ALK 融合阳性",
    originalPrice: 49980,
    negotiatedPrice: 8500,
    inInsurance: true,
    indications: "ALK 阳性的局部晚期或转移性非小细胞肺癌一线治疗；IB-IIIA 期 ALK 阳性术后辅助治疗（ALINA 试验适应证落地中）。",
    papProgram: "中国癌症基金会·安圣莎患者援助项目",
    papCondition: "按周期自付达标后可申请后续赠药，降低长程用药年化支出。"
  },
  {
    id: "lorlatinib",
    name: "博瑞纳",
    genericName: "劳拉替尼片 / 洛拉替尼",
    target: "三代 ALK / ROS1 阳性",
    originalPrice: 42000,
    negotiatedPrice: 12000,
    inInsurance: true,
    indications: "ALK 阳性晚期非小细胞肺癌一线治疗，或既往接受过阿来替尼/塞瑞替尼耐药后进展患者。",
    papProgram: "博瑞纳患者援助项目",
    papCondition: "医学评估证实持续获益且无不可耐受毒性者可申请阶段性援助。"
  },
  {
    id: "durvalumab",
    name: "英飞凡",
    genericName: "度伐利尤单抗注射液",
    target: "PD-L1 免疫检查点",
    originalPrice: 36000,
    negotiatedPrice: 13500,
    inInsurance: true,
    indications: "同步放化疗后未进展的不可切除 III 期 NSCLC 维持巩固治疗（PACIFIC 模式）；广泛期小细胞肺癌一线。",
    papProgram: "中国初级卫生保健基金会·因飞凡项目",
    papCondition: "按买几赠几方案援助，结合各地惠民保可进一步降低个人自付。"
  },
  {
    id: "pembrolizumab",
    name: "可瑞达",
    genericName: "帕博利珠单抗注射液 (K药)",
    target: "PD-1 免疫检查点",
    originalPrice: 35836,
    negotiatedPrice: 17918,
    inInsurance: false,
    indications: "未进国家基本医保目录，但已被全国绝大多数城市“惠民保”与百万医疗险作为特药全额或 80% 纳入报销范围。",
    papProgram: "中国初保基金会·生命之钥慈善援助项目",
    papCondition: "年度方案（如 2+2 或 2+N 模式），封顶自付极大降低实际年支出。"
  }
];

export default function ReimbursementPage() {
  const [selectedDrugId, setSelectedDrugId] = useState<string>("osimertinib");
  const [insuranceType, setInsuranceType] = useState<"urban_employee" | "urban_resident">("urban_employee");
  const [hasHuiminbao, setHasHuiminbao] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const currentDrug = DRUG_POLICIES.find(d => d.id === selectedDrugId) || DRUG_POLICIES[0];

  // Calculation Logic
  const calcReimbursement = () => {
    const monthlyBase = currentDrug.negotiatedPrice;
    if (!currentDrug.inInsurance) {
      // Not in basic insurance (e.g. Keytruda with PAP + Huiminbao)
      const papAnnualCap = 70000; // Typical PAP annual cap approx
      const huiminbaoCoverage = hasHuiminbao ? 0.75 : 0;
      const effectiveAnnual = papAnnualCap * (1 - huiminbaoCoverage);
      const effectiveMonthly = Math.round(effectiveAnnual / 12);
      return {
        monthlyBase,
        insurancePaid: 0,
        personalMonthly: effectiveMonthly,
        reimburseRatio: hasHuiminbao ? "惠民保报销 75%" : "PAP 赠药封顶",
        annualEstimated: Math.round(effectiveAnnual),
        savingsPercent: Math.round((1 - effectiveAnnual / (currentDrug.originalPrice * 12)) * 100)
      };
    }

    // In Basic Medical Insurance (门慢门特统筹支付)
    // 职工医保自付比例通常 15%~25%，居民医保自付比例通常 35%~45%
    const coverageRatio = insuranceType === "urban_employee" ? 0.80 : 0.65;
    const personalRatio = 1 - coverageRatio;
    
    let personalMonthly = Math.round(monthlyBase * personalRatio);
    if (hasHuiminbao && personalMonthly > 500) {
      // 惠民保二次报销自负部分（通常 50%~70%）
      personalMonthly = Math.round(personalMonthly * 0.5);
    }

    const insurancePaid = monthlyBase - personalMonthly;
    const annualEstimated = personalMonthly * 12;
    const savingsPercent = Math.round((1 - annualEstimated / (currentDrug.originalPrice * 12)) * 100);

    return {
      monthlyBase,
      insurancePaid,
      personalMonthly,
      reimburseRatio: insuranceType === "urban_employee" ? "职工门特约 80%" : "居民门特约 65%",
      annualEstimated,
      savingsPercent
    };
  };

  const stats = calcReimbursement();

  const handleCopyChecklist = () => {
    const checklistText = `【肺癌门慢门特与特药报销申办材料清单】
1. 身份证、社保卡（或医保电子凭证二维码）原件及复印件；
2. 盖有医院公章的近半年住院病历、出院小结或门诊病历；
3. 关键病理诊断报告单（明确标明非小细胞肺癌/肺腺癌）；
4. 基因检测报告单（明确标明 EGFR / ALK / ROS1 等对应驱动突变，或 PD-L1 表达检测单）；
5. 主诊主任医师填写的《基本医疗保险门诊慢特病待遇认定申请表》（医院医保办领取盖章）；
6. 选定的“双通道”定点特药零售药房备案回执。`;
    navigator.clipboard.writeText(checklistText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SubpageNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-600">首页</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">肺癌特药医保报销与慈善赠药 (PAP) 落地指南</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>国家医保谈判药 · 门慢门特 · 慈善援助 (PAP) 全流程</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              肺腺癌特药医保报销与慈善赠药落地实操指南
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              破除“靶向药吃不起”的恐惧，全面梳理<strong>国谈医保准入条件</strong>、<strong>门诊慢特病办理 3 步法</strong>、<strong>双通道药房直报</strong>与<strong>慈善基金会 PAP 赠药申请攻略</strong>，帮您把抗癌月自负降至最低。
            </p>
          </div>
        </div>

        {/* Section 1: 4 Core Reimbursement Channels Overview */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>四大核心特药减负报销通道</span>
            </h2>
            <span className="text-xs text-slate-500">层层叠加 · 综合减负</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">国谈医保与门慢门特</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                三代靶向药（奥希替尼等）已降价 80%+ 纳入国家医保乙类。办妥门特后，无需住院即可按 <strong>65%~85%</strong> 报销。
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">“双通道”定点药房</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                医院院内缺药时，凭主诊医生电子处方在定点药房直接刷医保卡购药，享受与医院完全同等的报销待遇。
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">城市定制“惠民保”</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                百元保费、无既往症限制。可对医保报销后的自负部分及部分未进医保特药二次报销 <strong>50%~80%</strong>。
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-900">慈善总会 PAP 赠药</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                中华慈善总会/中国初保基金会设立的患者援助项目。自购达一定周期后，提供后续免费药品援助，极大降低长程总支出。
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Drug Reimbursement Calculator */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>肺腺癌主流特药自负费用估算模拟器</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                选择靶向药品与参保类型，实时测算医保报销后每月与年化实际自负
              </p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-center">
              2024~2025 现行医保目录
            </span>
          </div>

          {/* Calculator Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">1. 选择抗癌特药：</label>
              <select
                value={selectedDrugId}
                onChange={(e) => setSelectedDrugId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-blue-500"
              >
                {DRUG_POLICIES.map((drug) => (
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
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900 focus:outline-blue-500"
              >
                <option value="urban_employee">城镇职工医保 (门特统筹报销约 80%)</option>
                <option value="urban_resident">城乡居民医保 / 新农合 (门特统筹报销约 65%)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">3. 是否参保城市“惠民保”：</label>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setHasHuiminbao(true)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    hasHuiminbao ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  已参保 (二次报销)
                </button>
                <button
                  type="button"
                  onClick={() => setHasHuiminbao(false)}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    !hasHuiminbao ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  未参保
                </button>
              </div>
            </div>
          </div>

          {/* Calculator Results Display Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-blue-400 font-mono font-bold">当前测算药品</span>
                <div className="text-base font-extrabold text-white">
                  {currentDrug.name} · {currentDrug.genericName}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                综合节省约 {stats.savingsPercent}% 费用
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400">国谈前原自费</div>
                <div className="text-sm sm:text-base font-bold text-slate-400 line-through font-mono">
                  ¥{currentDrug.originalPrice}/月
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <div className="text-[10px] text-slate-400">国谈医保基准价</div>
                <div className="text-sm sm:text-base font-bold text-sky-300 font-mono">
                  ¥{currentDrug.negotiatedPrice}/月
                </div>
              </div>

              <div className="p-3 bg-blue-900/60 rounded-xl border border-blue-500/50">
                <div className="text-[10px] text-blue-300">医保统筹报销</div>
                <div className="text-sm sm:text-base font-bold text-blue-200 font-mono">
                  -¥{stats.insurancePaid}/月
                </div>
              </div>

              <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-500/60">
                <div className="text-[10px] text-emerald-300 font-bold">个人实际月自负预估</div>
                <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                  ¥{stats.personalMonthly}
                  <span className="text-xs font-normal text-emerald-200">/月</span>
                </div>
              </div>
            </div>

            {/* PAP & Indications Tip */}
            <div className="p-3.5 bg-slate-800/90 rounded-xl border border-slate-700 text-xs space-y-1.5">
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-400 shrink-0" />
                <span>对应慈善援助 (PAP) 政策：{currentDrug.papProgram}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {currentDrug.papCondition}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: 3-Step Guide to Apply for Chronic Disease Insurance (门慢门特) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>门诊慢特病 (门特) 3 步极速办理实操流程</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                办好门特是享受 80%+ 医保报销的核心前提，绝大多数三甲医院支持“一站式”申办
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
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">主诊医生开具申请表并加盖病案公章</h3>
                <p className="text-slate-600 leading-relaxed">
                  在主治医生处领取《门诊慢特病待遇认定申请表》，由医生填写临床诊断、基因突变分型及用药方案；随后前往医院病案室打印<strong>出院小结</strong>、<strong>病理切片报告</strong>与<strong>基因检测报告</strong>并加盖公章。
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">医院医保办一站式直报（或当地医保 APP 线上申报）</h3>
                <p className="text-slate-600 leading-relaxed">
                  携带材料前往就诊医院的<strong>医保服务办公室</strong>直接提交审核，通常 1~3 个工作日即可审核通过；亦可在“国家医保服务平台”或当地省市医保小程序进行线上“门慢门特申请”拍照上传。
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
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

        {/* Section 4: PAP Patient Assistance Program Application Guide */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-10 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-600" />
              <span>慈善总会 / 基金会 PAP 患者援助项目申请全攻略</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              由中华慈善总会、中国初级卫生保健基金会等官方慈善组织主导的正规用药援助通道
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
              <h3 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>① 医学评估准入条件</span>
              </h3>
              <ul className="space-y-1 text-slate-700 leading-relaxed">
                <li>• 经病理学或细胞学确诊为肺癌，并具有对应靶点突变；</li>
                <li>• 服药后经主诊医生评估证实<strong>疾病控制且无不可耐受毒性</strong>；</li>
                <li>• 符合该项目指定的入组适应证与用药周期要求。</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
              <h3 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>② 经济评估材料准备</span>
              </h3>
              <ul className="space-y-1 text-slate-700 leading-relaxed">
                <li>• <strong>低保患者</strong>：民政部门核发的有效低保证明与低保金发放流水；</li>
                <li>• <strong>非低保患者</strong>：家庭成员收入证明（税务完税/退休金流水）与购药发票；</li>
                <li>• 慈善项目官方公众号/官网注册并提交电子版初审。</li>
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-amber-300">温馨提示：各慈善援助项目官方入口</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                请认准“中华慈善总会”、“中国初级卫生保健基金会”、“中国癌症基金会”等官方认证公众号申请，严防中介收费骗局！
              </div>
            </div>
            <Link
              href="/wiki"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 transition-all text-center"
            >
              返回循证百科
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
