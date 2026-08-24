"use client";

import React from "react";
import { GitBranch, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export function EgfrResistanceVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">三代 EGFR 靶向耐药后多维破局路线图</h5>
            <span className="text-[10px] text-slate-400 font-mono">二次活检 / 血液 NGS 基因检测驱动</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
          多维武器库
        </span>
      </div>

      {/* 3 Main Resistance Pathways and Solutions */}
      <div className="space-y-2.5">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-bold text-amber-300">① MET 扩增 / 旁路激活 (约 15%~25%)</div>
            <div className="text-[11px] text-slate-400">癌细胞绕过 EGFR 激活 MET 旁路信号</div>
          </div>
          <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 shrink-0">
            ↳ 奥希替尼 + 赛沃替尼 / 沃利替尼 双靶联合
          </div>
        </div>

        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-bold text-cyan-300">② EGFR C797S 顺式/反式二次突变 (约 10%~15%)</div>
            <div className="text-[11px] text-slate-400">结合位点修饰导致三代药结合障碍</div>
          </div>
          <div className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/30 shrink-0">
            ↳ 一代/二代联合方案 或 四代新药 (BLU-945等)
          </div>
        </div>

        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-bold text-purple-300">③ 表型转化与无驱动靶点耐药</div>
            <div className="text-[11px] text-slate-400">组织学转化为小细胞或未知通路</div>
          </div>
          <div className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/30 shrink-0">
            ↳ 双抗/ADC 药物 或 培美曲塞化疗+抗血管
          </div>
        </div>
      </div>
    </div>
  );
}
