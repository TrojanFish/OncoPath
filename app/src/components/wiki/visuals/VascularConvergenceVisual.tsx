"use client";

import React from "react";
import { GitCommitHorizontal, Info } from "lucide-react";

export function VascularConvergenceVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
          <GitCommitHorizontal className="w-3.5 h-3.5 text-rose-400" />
          <span>血管集束征 (Vascular Convergence) 原理解析</span>
        </span>
        <span className="text-[10px] text-slate-400">供血与牵拉改变</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Normal Branching Pulmonary Vessels */}
        <path d="M 10 20 Q 70 40 110 55" stroke="#ef4444" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M 20 80 Q 75 65 110 55" stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M 190 25 Q 145 42 110 55" stroke="#ef4444" strokeWidth="3.5" fill="none" opacity="0.6" />
        <path d="M 200 90 Q 140 70 110 55" stroke="#ef4444" strokeWidth="4" fill="none" opacity="0.6" />

        {/* Central Converged Nodule */}
        <circle cx="110" cy="55" r="22" fill="#be123c" opacity="0.85" />
        <text x="110" y="53" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
          代谢活跃结节
        </text>
        <text x="110" y="61" textAnchor="middle" fill="#fda4af" fontSize="4.5">
          (促血管生成素/牵拉)
        </text>

        {/* Flow & Convergence annotations */}
        <text x="50" y="32" fill="#fda4af" fontSize="4.5">肺血管分支向病灶汇聚 →</text>
        <text x="160" y="70" fill="#fda4af" fontSize="4.5">← 供血通道牵拉聚集</text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        <span className="inline-flex items-center gap-1 font-bold text-rose-300 mr-1">
          <Info className="w-3.5 h-3.5" />
          <span>图解要点：</span>
        </span>
        血管集束征代表附近血管受牵拉或汇聚到了病变区域。不仅恶性肿瘤需要供血，<strong>局部急慢性炎症充血、肉芽肿机化同样会导致周边血管受牵拉或增粗汇聚</strong>。抗炎后随访观察血管有无退缩是临床鉴别的重要手段。
      </div>
    </div>
  );
}
