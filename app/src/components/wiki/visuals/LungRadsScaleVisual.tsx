"use client";

import React, { useState } from "react";
import { Tag, Search, Compass } from "lucide-react";

type LungRadsGrade = "1" | "2" | "3" | "4A" | "4B" | "4X";

export function LungRadsScaleVisual() {
  const [selectedGrade, setSelectedGrade] = useState<LungRadsGrade>("2");

  const gradeInfo = {
    "1": {
      name: "Lung-RADS 1 类 · 阴性 (无结节/明确良性)",
      risk: "恶性概率 < 1%",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
      badgeColor: "bg-emerald-500 text-slate-950",
      findings: "无肺结节，或仅有完全钙化、典型错构瘤、肺内淋巴结等明确良性病变。",
      action: "常规年度低剂量螺旋 CT (LDCT) 体检筛查 (12 个月后)",
    },
    "2": {
      name: "Lung-RADS 2 类 · 良性格局 (极低危险)",
      risk: "恶性概率 < 1%",
      color: "border-teal-500 bg-teal-500/10 text-teal-300",
      badgeColor: "bg-teal-500 text-slate-950",
      findings: "纯磨玻璃结节 (pGGN) < 30mm；或实性结节 < 6mm；或新发实性 < 4mm。",
      action: "继续常规 12 个月后复查 LDCT，无需抗生素，无需过度恐慌",
    },
    "3": {
      name: "Lung-RADS 3 类 · 可能良性 (低危观察)",
      risk: "恶性概率 1% ~ 2%",
      color: "border-sky-500 bg-sky-500/10 text-sky-300",
      badgeColor: "bg-sky-500 text-slate-950",
      findings: "实性结节 6~8mm；或部分实性结节 (PSN) 且实性成分 < 6mm；或纯磨玻璃 ≥30mm。",
      action: "缩短复查间隔至 6 个月后复查薄层 HRCT",
    },
    "4A": {
      name: "Lung-RADS 4A 类 · 可疑病变 (需密切跟踪)",
      risk: "恶性概率 5% ~ 15%",
      color: "border-amber-500 bg-amber-500/10 text-amber-300",
      badgeColor: "bg-amber-500 text-slate-950",
      findings: "实性结节 8~15mm；或部分实性结节实性成分 6~8mm；或气道内可疑结节。",
      action: "3 个月后复查薄层增强 CT 或 行 PET-CT / 经皮肺穿刺评估",
    },
    "4B": {
      name: "Lung-RADS 4B 类 · 高度可疑 (积极干预)",
      risk: "恶性概率 > 15%",
      color: "border-rose-500 bg-rose-500/10 text-rose-300",
      badgeColor: "bg-rose-500 text-white",
      findings: "实性结节 ≥ 15mm；或部分实性结节实性成分 ≥ 8mm；或新发实性结节增大 ≥ 4mm。",
      action: "推荐胸外科与呼吸科多学科会诊 (MDT)，评估活检或胸腔镜微创切除",
    },
    "4X": {
      name: "Lung-RADS 4X 类 · 伴额外高危征象",
      risk: "恶性概率 > 15%",
      color: "border-purple-500 bg-purple-500/10 text-purple-300",
      badgeColor: "bg-purple-500 text-white",
      findings: "3 类或 4 类结节伴有明显毛刺征、胸膜牵拉或淋巴结肿大等高度恶性征象。",
      action: "直接由胸外科专科医生评估微创手术切除或穿刺活检",
    },
  };

  const active = gradeInfo[selectedGrade];

  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-sky-400" />
          <span>ACR Lung-RADS (v2022) 风险分级全色谱</span>
        </span>
        <span className="text-[10px] text-slate-400">美国放射学会指南</span>
      </div>

      {/* Grade Selector Strip */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {(["1", "2", "3", "4A", "4B", "4X"] as LungRadsGrade[]).map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g)}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedGrade === g
                ? `${gradeInfo[g].badgeColor} shadow-md scale-[1.03]`
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {g} 类
          </button>
        ))}
      </div>

      {/* Selected Grade Detail Card */}
      <div className={`p-3 rounded-xl border ${active.color} space-y-2`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-white">{active.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${active.badgeColor}`}>
            {active.risk}
          </span>
        </div>

        <div className="text-[11px] text-slate-300 leading-relaxed">
          <div className="flex items-start gap-1">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-300">影像发现标准：</strong> {active.findings}</span>
          </div>
        </div>

        <div className="text-[11px] text-sky-300 leading-relaxed bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <div className="flex items-start gap-1">
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span><strong className="text-sky-300">推荐临床处置：</strong> {active.action}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
