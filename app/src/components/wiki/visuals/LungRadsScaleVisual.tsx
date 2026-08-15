"use client";

import { useState } from "react";

type RadsCategory = "1" | "2" | "3" | "4A" | "4B_4X";

export function LungRadsScaleVisual() {
  const [selectedCat, setSelectedCat] = useState<RadsCategory>("2");

  const radsData = {
    "1": {
      name: "Lung-RADS 1 类 · 阴性",
      risk: "< 1% (极低)",
      color: "from-emerald-600 to-teal-700",
      badge: "良性/无病变",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      findings: "未见结节，或仅有明确良性特征（如完全钙化、中心致密钙化、错构瘤脂肪）。",
      action: "维持 12 个月年度低剂量 CT（LDCT）常规健康筛查。",
    },
    "2": {
      name: "Lung-RADS 2 类 · 良性表现",
      risk: "< 1% (良性)",
      color: "from-emerald-500 to-green-600",
      badge: "极低风险",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      findings: "实性结节 <6mm、新发现实性结节 <4mm、或纯磨玻璃结节（pGGN）<30mm（或 ≥30mm 且长期稳定）。",
      action: "继续 12 个月年度低剂量 CT（LDCT）随访，无需提前复查。",
    },
    "3": {
      name: "Lung-RADS 3 类 · 可能良性",
      risk: "1% ~ 2% (极可能良性)",
      color: "from-yellow-500 to-amber-600",
      badge: "短期观察",
      badgeClass: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      findings: "基线实性结节 6~8mm、部分实性结节（mGGO）总径 ≥6mm 且实性成分 <6mm、或纯磨玻璃结节 ≥30mm 首次发现。",
      action: "推荐 6 个月后复查薄层低剂量 CT，评估有无吸收缩小或稳定。",
    },
    "4A": {
      name: "Lung-RADS 4A 类 · 可疑恶性",
      risk: "5% ~ 15% (需重点排查)",
      color: "from-amber-600 to-orange-600",
      badge: "密切关注",
      badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/40",
      findings: "基线实性结节 8~15mm、部分实性结节实性成分 6~8mm、或气道内可疑结节。",
      action: "建议 3 个月后复查薄层 CT，或结合 PET-CT 评估；若实性成分增大考虑胸外科微创活检/切除。",
    },
    "4B_4X": {
      name: "Lung-RADS 4B / 4X 类 · 高度可疑",
      risk: "> 15% (高度关注)",
      color: "from-rose-600 to-red-700",
      badge: "专家 MDT 评估",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      findings: "实性结节 ≥15mm、部分实性结节实性成分 ≥8mm，或伴毛刺、分叶、淋巴结肿大等高危恶性征象（4X）。",
      action: "强烈建议由三甲医院胸外科/呼吸科多学科团队（MDT）专科阅片，评估增强 CT、穿刺活检或直接微创手术切除。",
    },
  };

  const active = radsData[selectedCat];

  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">🏷️ ACR Lung-RADS (v2022) 风险分级全色谱</span>
        <span className="text-[10px] text-slate-400">点击等级查看指征</span>
      </div>

      {/* Visual Color Scale Bar */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {(["1", "2", "3", "4A", "4B_4X"] as RadsCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              selectedCat === cat
                ? "ring-2 ring-white scale-105 shadow-md shadow-sky-500/20 font-bold"
                : "opacity-75 hover:opacity-100"
            } bg-gradient-to-b ${radsData[cat].color}`}
          >
            <div className="text-[11px] font-extrabold text-white">
              {cat === "4B_4X" ? "4B/4X" : `${cat} 类`}
            </div>
            <div className="text-[9px] text-white/90 font-medium">
              {radsData[cat].risk.split(" ")[0]}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Category Details Card */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-white">{active.name}</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${active.badgeClass}`}>
            恶性概率: {active.risk}
          </span>
        </div>

        <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
          <strong className="text-slate-400">🔍 影像发现标准：</strong> {active.findings}
        </div>

        <div className="text-[11px] text-sky-300 leading-relaxed bg-sky-950/30 p-2.5 rounded-lg border border-sky-800/40">
          <strong className="text-sky-400">🧭 推荐临床处置：</strong> {active.action}
        </div>
      </div>
    </div>
  );
}
