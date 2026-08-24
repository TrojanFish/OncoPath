"use client";

import React from "react";
import { Activity, ShieldCheck, Search, ArrowRight } from "lucide-react";

export function MrdCtdnaVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">ctDNA / MRD 动态监测分子雷达</h5>
            <span className="text-[10px] text-slate-400 font-mono">术后分子微残留 vs 传统 CT 影像对比</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
          灵敏度高达 0.01%
        </span>
      </div>

      {/* Dual Scenario Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Scenario A: MRD Negative */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MRD 持续阴性 (Negative)</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
              极低复发风险
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            血液中未检测到肿瘤特异性游离突变，预后极佳，提示手术完全根治，常规辅助治疗可避免盲目过度化疗。
          </p>
          <div className="text-[10px] text-emerald-400 font-mono">
            ↳ 2年无病生存率 (DFS) &gt; 95%
          </div>
        </div>

        {/* Scenario B: MRD Positive */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>MRD 阳性 (Positive)</span>
            </span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
              超早期分子预警
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            比胸部 CT 提前 3 ~ 6 个月在血液中捕捉到微小残留克隆，提供宝贵的“靶向/免疫精准干预黄金窗口”。
          </p>
          <div className="text-[10px] text-amber-400 font-mono">
            ↳ 及时开启针对性靶向可力挽狂澜
          </div>
        </div>
      </div>
    </div>
  );
}
