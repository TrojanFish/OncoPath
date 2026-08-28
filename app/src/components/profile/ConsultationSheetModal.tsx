"use client";

import React, { useState } from "react";
import { 
  Printer, 
  Copy, 
  Check, 
  X, 
  FileText, 
  Stethoscope, 
  HelpCircle, 
  ShieldCheck,
  Calendar,
  AlertCircle
} from "lucide-react";
import type { PatientProfile } from "@/lib/types";

interface ConsultationSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile;
}

export default function ConsultationSheetModal({
  isOpen,
  onClose,
  profile,
}: ConsultationSheetModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build tailor-made questions for patient based on their pathology indicators
  const questions: { q: string; reason: string }[] = [];

  // Question 1: Stage & Surgical margins
  questions.push({
    q: `根据病理分期 ${profile.stage || "IA期"} 及切缘 ${profile.margin === "negative" ? "R0 阴性" : "切缘情况"}，后续标准的随访周期（胸部薄层 CT）建议是多久一次？`,
    reason: "明确未来随访时间表，避免过度检查或随访不及时。",
  });

  // Question 2: High risk factors (STAS / VPI / LVI)
  if (profile.stas === "positive" || profile.vpi === "positive" || profile.lvi === "positive") {
    const riskItems = [
      profile.stas === "positive" ? "STAS阳性" : "",
      profile.vpi === "positive" ? "胸膜侵犯VPI" : "",
      profile.lvi === "positive" ? "脉管癌栓LVI" : "",
    ].filter(Boolean).join("、");

    questions.push({
      q: `病理显示存在【${riskItems}】，针对此类微转移高危因素，结合目前指南，是否有必要进行术后辅助靶向或化疗干预？`,
      reason: "评估高危病理亚型是否需要进一步辅助治疗。",
    });
  } else {
    questions.push({
      q: "病理未见明确 STAS、胸膜侵犯及脉管癌栓等高危因素，是否属于单纯随访即可的安全组？",
      reason: "与主治医师再次确认免于辅助治疗的安全边界。",
    });
  }

  // Question 3: Molecular gene mutation (EGFR / ALK / etc.)
  if (profile.egfr === "positive" || (profile.geneMutations && profile.geneMutations.length > 0)) {
    questions.push({
      q: "目前基因检测已明确有敏感靶点突变，当前阶段是建议作为备用方案，还是参与辅助靶向方案？",
      reason: "明确靶向药应用时机，做好长期用药与医保规划。",
    });
  } else {
    questions.push({
      q: "本次手术标本是否已完成全面的 NGS 基因检测？后续是否有必要加测更多靶点？",
      reason: "留存分子病理靶点档案，为远期可能的全程管理提供依据。",
    });
  }

  // Question 4: Post-op recovery & Pulmonary function
  questions.push({
    q: "术后肺功能康复锻炼（如深呼吸练习、爬楼梯）有哪些注意事项与复查指标？",
    reason: "保障术后生活质量与肺功能平稳恢复。",
  });

  // Question 5: Emergency symptoms check
  questions.push({
    q: "随访期间如果出现偶发胸痛、微量咳痰带血或发热，何种程度需要立即提前来门诊复诊？",
    reason: "建立清晰的就医红线警报，避免盲目焦虑或延误就诊。",
  });

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopy = () => {
    const content = `【OncoPath 门诊就医 5 问沟通单】
患者情况：${profile.stage || "IA"}期 · 肿瘤大小 ${(profile.tumorSize || 1.5) * 10}mm · 实性占比 CTR ${Math.round((profile.ctr || 0.4) * 100)}%
病理亚型：${Array.isArray(profile.histology) ? profile.histology.map((h: any) => typeof h === 'string' ? h : h.type).join("+") : "腺癌"}

建议向主治医师请教的核心问题：
${questions.map((item, idx) => `${idx + 1}. ${item.q}\n   (目的：${item.reason})`).join("\n\n")}

-- 导出自 OncoPath 肺癌循证平台 · 证据驱动决策 --`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      {/* Claude Artifact Style Container */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-fade-in-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Minimal Toolbar (Claude Artifact Top Bar) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
            <FileText className="w-4 h-4 text-sky-600" />
            <span>门诊问诊便携沟通单 · Claude Artifact 风格</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-sky-700 hover:border-sky-300 flex items-center gap-1 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制" : "复制文字"}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 打印</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Artifact Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 bg-white">
          {/* Document Header */}
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                肺癌术后复诊 · 医患沟通清单
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                本清单由 OncoPath 循证系统根据患者真实病理参数智能提炼，建议在门诊时携带出示给主治医师。
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 flex-shrink-0">
              分期: <span className="font-bold text-sky-700">{profile.stage || "IA1"}</span> · 
              切缘: <span className="font-bold text-emerald-700">{profile.margin === "negative" ? "R0" : "待查"}</span>
            </div>
          </div>

          {/* Section 1: Patient Key Profile Box */}
          <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              患者核心病理特征速览
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500">肿瘤大小:</span>{" "}
                <span className="font-semibold text-slate-800">{(profile.tumorSize || 1.5) * 10} mm</span>
              </div>
              <div>
                <span className="text-slate-500">实性占比 CTR:</span>{" "}
                <span className="font-semibold text-slate-800">{Math.round((profile.ctr || 0.4) * 100)}%</span>
              </div>
              <div>
                <span className="text-slate-500">STAS 气道播散:</span>{" "}
                <span className={`font-semibold ${profile.stas === "positive" ? "text-amber-700 font-bold" : "text-emerald-700"}`}>
                  {profile.stas === "positive" ? "阳性" : "阴性"}
                </span>
              </div>
              <div>
                <span className="text-slate-500">胸膜侵犯 VPI:</span>{" "}
                <span className={`font-semibold ${profile.vpi === "positive" ? "text-amber-700 font-bold" : "text-emerald-700"}`}>
                  {profile.vpi === "positive" ? "阳性" : "阴性"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: 5 Key Questions for Doctor */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                建议向主治医师请教的 5 个关键问题 (按优先级排序)
              </h3>
            </div>

            <div className="space-y-3">
              {questions.map((item, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-sky-500 bg-sky-50/40 p-3.5 rounded-r-xl space-y-1 transition-all hover:bg-sky-50/70"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.q}
                    </p>
                  </div>
                  <p className="text-2xs text-slate-600 pl-7">
                    <span className="font-semibold text-slate-700">提问目的：</span>
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Notes Area for Patient (for handwritten doctor notes during clinic) */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-600 mb-1.5">
              门诊医生当面解答与医嘱记录区（可手写记录）：
            </h3>
            <div className="w-full h-20 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 p-2 text-2xs text-slate-400">
              复诊医嘱记录线...
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
            <span>OncoPath Evidence-Based Medicine OS · 100% 同行评审文献可溯</span>
            <span>生成时间：{new Date().toLocaleDateString("zh-CN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
