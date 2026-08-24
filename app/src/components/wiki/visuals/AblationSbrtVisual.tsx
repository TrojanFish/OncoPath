"use client";

import React from "react";
import { Flame, Radio, ShieldCheck, Target } from "lucide-react";

export function AblationSbrtVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">结节微创消融与 SBRT 精准局部根治武器</h5>
            <span className="text-[10px] text-slate-400 font-mono">无法耐受开胸手术者的非侵入根治利器</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
          局部控制率 &gt; 90%
        </span>
      </div>

      {/* 2 Approaches Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Method 1: Microwave Ablation */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>CT 引导下经皮微波消融 (MWA)</span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-1.5 py-0.2 rounded">
              微创穿刺
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            仅需 1~2mm 穿刺针精准置入结节核心，高频微波热场达到 60~100℃，10分钟内让肿瘤细胞产生不可逆凝固性坏死。
          </p>
          <div className="text-[10px] text-amber-300 font-mono">
            ↳ 创伤极小，局麻可做，术后24小时即可出院
          </div>
        </div>

        {/* Method 2: SBRT Radiotherapy */}
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span>立体定向体部放疗 (SBRT / SABR)</span>
            </span>
            <span className="text-[10px] font-bold text-slate-300 bg-slate-700 px-1.5 py-0.2 rounded">
              零切口非侵入
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            利用多束高能 X 射线在呼吸门控追踪下交叉聚焦于肺结节，单次大剂量摧毁肿瘤 DNA，周围正常肺组织受量极低。
          </p>
          <div className="text-[10px] text-sky-300 font-mono">
            ↳ 完全无创，门诊 3~5 次照射即可完成全疗程
          </div>
        </div>
      </div>
    </div>
  );
}
