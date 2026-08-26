"use client";

import React from "react";
import { ShieldCheck, Target, AlertTriangle, CheckCircle2, Award } from "lucide-react";

export function BiopsySafetyVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">CT 引导经皮肺穿刺：针道播散真实概率与防护</h5>
            <span className="text-[10px] text-slate-400 font-mono">国际放射介入学会 (SIR) / 顶级多中心大样本数据</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
          科学辟谣
        </span>
      </div>

      {/* Safety Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/40 text-center space-y-1">
          <div className="text-slate-400 text-[10px] font-medium">针道播散发生率</div>
          <div className="text-xl font-black text-emerald-400 font-mono">0.012% ~ 0.06%</div>
          <p className="text-[10px] text-slate-400">仅万分之几，比严重车祸概率还低</p>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-blue-500/40 text-center space-y-1">
          <div className="text-slate-400 text-[10px] font-medium">同轴套管针保护</div>
          <div className="text-xl font-black text-blue-400 font-mono">100% 外鞘物理隔离</div>
          <p className="text-[10px] text-slate-400">内芯取样全程在套管中抽回，不沾染肺组织</p>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-purple-500/40 text-center space-y-1">
          <div className="text-slate-400 text-[10px] font-medium">基因/病理确诊率</div>
          <div className="text-xl font-black text-purple-400 font-mono">&gt; 95%</div>
          <p className="text-[10px] text-slate-400">明确 EGFR/ALK 分子靶点，换来救命靶向方案</p>
        </div>
      </div>

      {/* Modern Coaxial Technique Illustration */}
      <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-2 text-xs">
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>现代同轴套管针 (Coaxial Needle) 是如何彻底杜绝播散的？</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          医生在 CT 精准引导下先将<strong>外层保护套管</strong>送达病灶边缘（仅穿透胸壁一次）。后续所有活检针均通过该密闭保护套管进出，获取组织后在套管内封存退回。肿瘤细胞<strong>完全被外管隔离</strong>，根本不会接触正常肺野与胸壁针道。
        </p>
      </div>

      {/* Reassurance Footer */}
      <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span><strong>定心丸：</strong>少量穿刺后气胸通常在病房平卧吸氧 24~48 小时即可自行完全吸收，切勿因惧怕穿刺而错过精准靶向治疗机会！</span>
      </div>
    </div>
  );
}
