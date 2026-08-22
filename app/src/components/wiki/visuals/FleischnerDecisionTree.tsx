"use client";

import { useState } from "react";
import { Compass, Calendar, Stethoscope, HeartPulse, CheckCircle2 } from "lucide-react";

type NoduleType = "pggn" | "mggo" | "solid";
type NoduleSize = "small" | "medium" | "large";
type RiskLevel = "low" | "high";

export function FleischnerDecisionTree() {
  const [type, setType] = useState<NoduleType>("pggn");
  const [size, setSize] = useState<NoduleSize>("medium");
  const [isHighRisk, setIsHighRisk] = useState<RiskLevel>("low");

  let interval = "6 ~ 12 个月后复查";
  let malignantRisk = "< 1% (良性率 > 99%)";
  let treatmentAction = "无需手术，无需穿刺，低剂量薄层 CT 随访观察";
  let reassuranceQuote = "纯磨玻璃生长极其缓慢，倍增时间通常在 2 年以上，定期复查处于绝对安全期。";

  if (type === "pggn") {
    if (size === "small") {
      interval = "无需常规随访 / 可在 2~4 年后体检复查";
      malignantRisk = "< 1% (极大概率良性或极惰性)";
      treatmentAction = "不推荐过度检查或干预，常规年度体检即可";
      reassuranceQuote = "<6mm 孤立纯磨玻璃结节几乎不具备侵袭力，把心放宽！";
    } else if (size === "medium") {
      interval = "6 ~ 12 个月首次薄层 CT 复查";
      malignantRisk = "约 1 ~ 3% (极早期惰性)";
      treatmentAction = "若稳定，后续改为每 2 年一次随访直至 5 年";
      reassuranceQuote = "6~8mm 纯磨玻璃即使是极早期病灶，观察 1~2 年也完全不会延误根治时机。";
    } else {
      interval = "3 ~ 6 个月首次薄层 CT 复查";
      malignantRisk = "约 5 ~ 10% (需动态对比)";
      treatmentAction = "复查若持续存在且有实性成分萌芽，建议胸外科专科评估微创亚肺叶切除";
      reassuranceQuote = ">8mm 结节重点观察体积与密度变化，只要不长实性成分依然可安全随访。";
    }
  } else if (type === "mggo") {
    if (size === "small") {
      interval = "无需常规随访，或 12 个月后薄层 CT 复查";
      malignantRisk = "约 2 ~ 5%";
      treatmentAction = "通常为炎性渗出吸收期，复查观察是否吸收消失";
      reassuranceQuote = "微小混合结节很多是局部感染炎症，几个月后常自行吸收消失。";
    } else if (size === "medium") {
      interval = "3 ~ 6 个月薄层 CT 复查";
      malignantRisk = "约 15 ~ 35%";
      treatmentAction = "若持续存在且实性成分无缩小，建议胸外科评估微创手术";
      reassuranceQuote = "此阶段多为微浸润早期，微创切除后治愈率依然接近 100%。";
    } else {
      interval = "积极胸外科专科会诊评估 / 3个月复查";
      malignantRisk = "约 40 ~ 60%";
      treatmentAction = "建议完善增强 CT 或 PET-CT 评估，多学科 MDT 制定微创手术计划";
      reassuranceQuote = "现代微创胸腔镜手术创伤极小（3-5天出院），早发现早切除即可彻底治愈！";
    }
  } else {
    if (size === "small") {
      interval = isHighRisk === "high" ? "12 个月后复查" : "无需常规随访";
      malignantRisk = "< 1%";
      treatmentAction = "绝大多数为良性钙化、错构瘤或淋巴结，无需紧张";
      reassuranceQuote = "<6mm 实性结节良性率超过 99%，不用自己吓自己！";
    } else if (size === "medium") {
      interval = isHighRisk === "high" ? "6 ~ 12 个月薄层 CT 复查" : "12 个月薄层 CT 复查";
      malignantRisk = "约 5 ~ 15%";
      treatmentAction = "对比既往老片观察是否有体积变化，若稳定继续年度随访";
      reassuranceQuote = "很多实性结节是既往感冒肺炎遗留的瘢痕肉芽肿，稳定即是安全。";
    } else {
      interval = "积极就诊专科（胸外科/呼吸科）";
      malignantRisk = "约 30 ~ 65%";
      treatmentAction = "建议行胸部增强 CT、支气管镜或穿刺活检评估，必要时手术干预";
      reassuranceQuote = "即使需要手术，现代外科技术极其成熟，规范治疗永远是最好的保护！";
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5">
      {/* Title Header */}
      <div className="pb-5 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>科学随访决策树</span>
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          国际 Fleischner 肺结节科学随访计算器
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          根据全球数十万例大数据循证指南，输入您的结节特征，3秒获取权威随访周期建议
        </p>
      </div>

      {/* 3 Steps Selector Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Step 1: Nodule Type */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-mono">1</span>
            <span>结节影像性质</span>
          </div>
          <div className="space-y-1.5">
            {[
              { id: "pggn", label: "纯磨玻璃结节 (pGGN)", desc: "淡薄透明如雾" },
              { id: "mggo", label: "混杂磨玻璃结节 (mGGO)", desc: "荷包蛋征·含实性" },
              { id: "solid", label: "纯实性结节 (Solid)", desc: "完全致密白色结节" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setType(item.id as NoduleType)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  type === item.id
                    ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Nodule Size */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-mono">2</span>
            <span>结节最大径</span>
          </div>
          <div className="space-y-1.5">
            {[
              { id: "small", label: "微小结节 (< 6 mm)", desc: "极大概率为良性" },
              { id: "medium", label: "中小结节 (6 ~ 8 mm)", desc: "标准随访观察窗口" },
              { id: "large", label: "较大结节 (> 8 mm)", desc: "需重点关注与评估" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSize(item.id as NoduleSize)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  size === item.id
                    ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: High Risk Factors */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-mono">3</span>
            <span>个人风险背景</span>
          </div>
          <div className="space-y-1.5">
            {[
              { id: "low", label: "普通受检者 (低风险)", desc: "无吸烟史 / 无肿瘤家族史" },
              { id: "high", label: "高危背景 (吸烟/家族史)", desc: "吸烟≥20包年/一二级亲属肿瘤" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setIsHighRisk(item.id as RiskLevel)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  isHighRisk === item.id
                    ? "bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision Output Result Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-700" />
            <span className="font-black text-slate-900 text-base">国际权威临床裁决结果</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-700 border border-blue-200 shadow-2xs">
            <span>恶性风险预估：{malignantRisk}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-white/90 p-3.5 rounded-xl border border-blue-100">
            <div className="text-[11px] font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>建议复查随访周期</span>
            </div>
            <div className="text-base font-black text-blue-900">{interval}</div>
          </div>
          <div className="bg-white/90 p-3.5 rounded-xl border border-blue-100">
            <div className="text-[11px] font-bold text-slate-400 mb-0.5 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              <span>推荐临床处置策略</span>
            </div>
            <div className="text-xs font-bold text-slate-800">{treatmentAction}</div>
          </div>
        </div>

        {/* Comfort Box */}
        <div className="bg-white/95 p-3 rounded-xl border border-emerald-200/80 flex items-start gap-2 text-xs text-emerald-900">
          <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>定心丸：</strong> {reassuranceQuote}
          </p>
        </div>
      </div>
    </div>
  );
}
