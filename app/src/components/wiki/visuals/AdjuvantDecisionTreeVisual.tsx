"use client";

import { useState } from "react";

type StageOption = "IA" | "IB" | "IIA_IIB" | "IIIA";
type MutationOption = "EGFR" | "ALK" | "WILDTYPE";

export function AdjuvantDecisionTreeVisual() {
  const [selectedStage, setSelectedStage] = useState<StageOption>("IB");
  const [selectedMutation, setSelectedMutation] = useState<MutationOption>("EGFR");
  const [hasHighRisk, setHasHighRisk] = useState<boolean>(true);

  // Decision logic calculation
  const getDecision = () => {
    if (selectedStage === "IA") {
      return {
        strategy: "常规规律随访（无需任何辅助用药）",
        badge: "100% 物理根治基石",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        summary: "根据 NCCN 与 CSCO 国际指南，IA 期完整切除（R0）患者 5 年生存率高达 92%~100%。盲目用药不仅无法增加获益，反而增加肝肾毒性及经济负担。",
        regimen: "每 6 个月复查薄层胸部 CT + 肿瘤标志物，第 3 年起每年一次",
        evidence: "NCCN 2024 / IASLC 8th Edition Staging Big Data",
        riskReduction: "5年总生存率 92% ~ 100%",
      };
    }

    if (selectedStage === "IB") {
      if (selectedMutation === "EGFR") {
        if (hasHighRisk) {
          return {
            strategy: "口服三代 EGFR-TKI 靶向辅助治疗（奥希替尼等 3 年）",
            badge: "ADAURA 国际标准方案",
            badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
            summary: "IB 期合并高危因素（微血管侵犯、STAS、Grade 3 或肿瘤接近 4cm）且 EGFR 敏感突变者，ADAURA 试验确证奥希替尼辅助治疗可降低 83% 术后复发风险。",
            regimen: "口服三代 EGFR-TKI 每天 1 片，标准疗程 3 年，定期监测血常规与心电图",
            evidence: "ADAURA Phase III Trial (NEJM 2023 / NCCN Category 1)",
            riskReduction: "复发风险降低 83% (HR = 0.17)",
          };
        } else {
          return {
            strategy: "严密随访 或 讨论三代 TKI 靶向辅助防护",
            badge: "个体化决策",
            badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
            summary: "无微浸润高危特征的 IB 期 EGFR 突变患者，可依据身体状况及个人意愿，与主治医生共同决定是否口服奥希替尼或严密动态随访（配合 MRD 血液监测）。",
            regimen: "每 3~6 个月胸腹增强 CT + ctDNA-MRD 动态监测",
            evidence: "ADAURA Trial / CSCO 2024 指南",
            riskReduction: "长期无复发生存率 >85%",
          };
        }
      } else if (selectedMutation === "ALK") {
        return {
          strategy: "根据 ALINA 试验及 MDT 讨论决定靶向辅助或随访",
          badge: "ALK 靶向储备",
          badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
          summary: "ALK 阳性患者术后复发主要由微转移驱动。合并高危因素的 IB 期可与 MDT 团队评估口服阿来替尼（ALINA 方案）获益。",
          regimen: "口服阿来替尼 600mg bid 或 规律薄层增强 CT 随访",
          evidence: "ALINA Phase III Trial (NEJM 2024)",
          riskReduction: "DFS 显著延长",
        };
      } else {
        return {
          strategy: "规律随访观察（一般不推荐常规化疗）",
          badge: "标准随访",
          badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
          summary: "IB 期野生型患者，国际指南不推荐常规辅助化疗（毒性大于获益）；伴极高危因素者可经 MDT 评估单药或含铂化疗，或以 ctDNA MRD 指导干预。",
          regimen: "术后 2 年内每 3~6 个月薄层 CT 随访",
          evidence: "LACE Meta-analysis / JCO Guidelines",
          riskReduction: "5年 DFS 约 75% ~ 80%",
        };
      }
    }

    // IIA, IIB, IIIA stages
    if (selectedMutation === "EGFR") {
      return {
        strategy: "第三代 EGFR-TKI 辅助靶向治疗（奥希替尼 3 年）± 辅助化疗",
        badge: "全套靶向防线 · 强效阻断",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        summary: "II~IIIA 期 EGFR 敏感突变患者的最高级别推荐。ADAURA 试验证实三代 TKI 可将 II~IIIA 期 3 年无病生存率（DFS）从 44% 飙升至 85% 以上，并强效预防脑转移！",
        regimen: "奥希替尼 80mg 口服 每日 1 次（共 3 年）± 术后含铂双药化疗 4 周期",
        evidence: "ADAURA Trial (NEJM 2020/2023 / FDA/NMPA 优先获批)",
        riskReduction: "复发死亡风险降低 83% (HR = 0.17)",
      };
    } else if (selectedMutation === "ALK") {
      return {
        strategy: "第二代 ALK-TKI 辅助靶向治疗（阿来替尼 2 年）",
        badge: "ALINA 突破性里程碑",
        badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        summary: "ALINA 顶级 III 期试验证实，在 II~IIIA 期 ALK 阳性患者中，口服阿来替尼 2 年较传统化疗降低 76% 复发转移风险，已被 NCCN/CSCO 升级为 1 类首选推荐！",
        regimen: "阿来替尼 600mg 口服 每日 2 次，随餐服用（共 2 年）",
        evidence: "ALINA Trial (NEJM 2024 / NCCN 2024 Category 1)",
        riskReduction: "复发风险降低 76% (HR = 0.24)",
      };
    } else {
      return {
        strategy: "含铂双药辅助化疗 4 周期 ➔ 序贯 1 年 PD-(L)1 免疫辅助治疗",
        badge: "化疗联合免疫长尾防线",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        summary: "驱动基因野生型（阴性）II~IIIA 期患者的金标准方案。含铂化疗快速歼灭微残留细胞，序贯阿替利珠单抗（IMpower010）或帕博利珠单抗（KEYNOTE-091）建立持久免疫哨兵巡逻。",
        regimen: "培美曲塞/吉西他滨 + 顺铂/卡铂 4 周期 ➔ 阿替利珠/帕博利珠单抗 1 年",
        evidence: "IMpower010 (Lancet) & KEYNOTE-091 (Lancet Oncol)",
        riskReduction: "PD-L1≥50% 人群复发风险降低 57% (HR = 0.43)",
      };
    }
  };

  const decision = getDecision();

  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-sky-400">🗺️ 术后辅助治疗科学决策模拟器</span>
        <span className="text-[10px] text-slate-400">基于 NCCN 2024 / CSCO 肺癌指南</span>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        {/* Step 1: Stage Selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            第 1 步：选择术后病理 TNM 分期
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(["IA", "IB", "IIA_IIB", "IIIA"] as StageOption[]).map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`text-[11px] py-1.5 rounded-lg font-semibold transition-all ${
                  selectedStage === stage
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {stage === "IA" ? "IA 期" : stage === "IB" ? "IB 期" : stage === "IIA_IIB" ? "II 期" : "IIIA 期"}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Mutation Selector */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            第 2 步：选择驱动基因状态
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(["EGFR", "ALK", "WILDTYPE"] as MutationOption[]).map((mut) => (
              <button
                key={mut}
                onClick={() => setSelectedMutation(mut)}
                className={`text-[11px] py-1.5 rounded-lg font-semibold transition-all ${
                  selectedMutation === mut
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {mut === "EGFR" ? "EGFR 突变" : mut === "ALK" ? "ALK 阳性" : "野生型(全阴)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional High Risk Toggle for IB */}
      {selectedStage === "IB" && (
        <div className="flex items-center justify-between bg-amber-950/30 border border-amber-800/50 p-2.5 rounded-xl mb-3">
          <div className="text-[11px] text-amber-200">
            <span className="font-bold">IB 期高危因素核查：</span>
            <span className="text-[10px] text-amber-300/80 ml-1">
              (STAS阳性 / 脉管癌栓 / Grade 3微乳头实体 / 切缘&lt;2cm)
            </span>
          </div>
          <button
            onClick={() => setHasHighRisk(!hasHighRisk)}
            className={`text-[10px] px-2.5 py-1 rounded-md font-bold transition-all ${
              hasHighRisk
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {hasHighRisk ? "存在高危因素 ✓" : "无高危因素 ✕"}
          </button>
        </div>
      )}

      {/* Decision Output Card */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${decision.badgeColor}`}>
            {decision.badge}
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">
            🎯 {decision.riskReduction}
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-white mb-1.5 flex items-center gap-1.5">
          <span>推荐方案：</span>
          <span className="text-sky-300">{decision.strategy}</span>
        </h4>

        <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
          {decision.summary}
        </p>

        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] space-y-1">
          <div className="flex items-start gap-1.5 text-slate-300">
            <span className="text-slate-500 font-bold shrink-0">📋 执行细则:</span>
            <span>{decision.regimen}</span>
          </div>
          <div className="flex items-start gap-1.5 text-slate-400 text-[10px]">
            <span className="text-slate-500 font-bold shrink-0">📚 循证出处:</span>
            <span className="italic">{decision.evidence}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
