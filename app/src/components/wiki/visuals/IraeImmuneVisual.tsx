"use client";

import React, { useState } from "react";
import { Activity, ShieldAlert, Heart, Wind, Droplets, Zap } from "lucide-react";

export function IraeImmuneVisual() {
  const [selectedOrgan, setSelectedOrgan] = useState<"lung" | "thyroid" | "gut" | "heart">("lung");

  const iraeMap = {
    lung: {
      name: "免疫性肺炎 (CIP)",
      onset: "多见于用药后 2~3 个月",
      symptoms: "干咳、活动后喘憋、发热、氧饱和度下降",
      monitoring: "基线与每次输注前常规听诊双肺，出现咳嗽及时查 HRCT",
      management: "1级暂停观察；2级起停用免疫并给予口服泼尼松 (1~2mg/kg/d)"
    },
    thyroid: {
      name: "免疫性甲状腺炎 (最常见)",
      onset: "多见于用药后 4~8 周",
      symptoms: "乏力嗜睡、畏寒浮肿（甲减）或心慌多汗（过性甲亢）",
      monitoring: "每 1~2 周期静脉输注前必查 TSH / FT3 / FT4",
      management: "极少需停免疫药，内分泌科指导下口服左甲状腺素钠片(优甲乐)替代即可正常维持治疗"
    },
    gut: {
      name: "免疫性肠炎 / 结肠炎",
      onset: "多见于用药后 6~8 周",
      symptoms: "大便稀烂带黏液/血便、腹痛腹泻每日≥4次",
      monitoring: "记录每日排便频次与性状，查粪便常规排查感染",
      management: "2级以上停用免疫单抗，静脉使用糖皮质激素，顽固者使用英夫利昔单抗"
    },
    heart: {
      name: "免疫性心肌炎 (极罕见重症)",
      onset: "多见于用药早期 (前 1~2 个周期)",
      symptoms: "心悸胸闷、下肢水肿、极度乏力、晕厥",
      monitoring: "每次用药前筛查高敏肌钙蛋白 (cTnI/cTnT) 与心电图",
      management: "一旦肌钙蛋白成倍升高立即永久停药，入 CCU 启动大剂量激素与免疫球蛋白冲击"
    }
  };

  const organ = iraeMap[selectedOrgan];

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">PD-1/PD-L1 免疫特异性不良反应 (irAEs) 监测网</h5>
            <span className="text-[10px] text-slate-400 font-mono">激活自身 T 细胞后的器官反应预警</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
          器官监测
        </span>
      </div>

      {/* Organ Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
        <button
          onClick={() => setSelectedOrgan("lung")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            selectedOrgan === "lung" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>免疫性肺炎</span>
        </button>
        <button
          onClick={() => setSelectedOrgan("thyroid")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            selectedOrgan === "thyroid" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>甲状腺炎</span>
        </button>
        <button
          onClick={() => setSelectedOrgan("gut")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            selectedOrgan === "gut" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>免疫性肠炎</span>
        </button>
        <button
          onClick={() => setSelectedOrgan("heart")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
            selectedOrgan === "heart" ? "bg-indigo-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>心肌炎预警</span>
        </button>
      </div>

      {/* Detailed Card */}
      <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-2.5 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-extrabold text-indigo-300 text-sm">{organ.name}</span>
          <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
            {organ.onset}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/60 space-y-1">
            <div className="text-slate-400 font-bold">典型早期症状：</div>
            <div className="text-slate-200 leading-relaxed">{organ.symptoms}</div>
          </div>
          <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-700/60 space-y-1">
            <div className="text-slate-400 font-bold">常规监测建议：</div>
            <div className="text-slate-200 leading-relaxed">{organ.monitoring}</div>
          </div>
        </div>

        <div className="p-2.5 bg-indigo-950/40 rounded-lg border border-indigo-500/30 text-[11px] text-indigo-200">
          <strong>临床处置原则：</strong>{organ.management}
        </div>
      </div>
    </div>
  );
}
