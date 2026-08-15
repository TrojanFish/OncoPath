"use client";

import { useState } from "react";

export function PdL1ImmuneMechanismVisual() {
  const [isTreated, setIsTreated] = useState<boolean>(true);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">🛡️ PD-1 / PD-L1 免疫检查点阻断机制图解</span>
        <span className="text-[10px] text-slate-400">分子免疫学突触示意</span>
      </div>

      {/* State Toggle Buttons */}
      <div className="flex gap-2 mb-3 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setIsTreated(false)}
          className={`flex-1 text-[11px] py-1.5 rounded-lg font-semibold transition-all ${
            !isTreated ? "bg-rose-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          1. 免疫逃逸状态 (无药：T细胞被刹车)
        </button>
        <button
          onClick={() => setIsTreated(true)}
          className={`flex-1 text-[11px] py-1.5 rounded-lg font-semibold transition-all ${
            isTreated ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          2. 免疫治疗阻断 (用药：抗体解除刹车)
        </button>
      </div>

      {/* SVG Synapse Diagram */}
      <svg viewBox="0 0 240 110" className="w-full h-auto mb-2.5">
        <rect width="240" height="110" fill="#0b1120" rx="8" />

        {/* Left Side: Tumor Cell (Cancer) */}
        <path d="M -10 10 Q 55 10 55 55 Q 55 100 -10 100 Z" fill="#4c0519" stroke="#9f1239" strokeWidth="1" />
        <text x="22" y="52" textAnchor="middle" fill="#fecdd3" fontSize="5.5" fontWeight="bold">
          肿瘤细胞
        </text>
        <text x="22" y="62" textAnchor="middle" fill="#fda4af" fontSize="4">
          (表达 PD-L1 面具)
        </text>

        {/* PD-L1 Receptor Stalk from Tumor Cell */}
        <line x1="55" y1="55" x2="88" y2="55" stroke="#f43f5e" strokeWidth="2.5" />
        <circle cx="92" cy="55" r="4.5" fill="#f43f5e" />
        <text x="92" y="44" textAnchor="middle" fill="#fb7185" fontSize="4.5" fontWeight="bold">
          PD-L1
        </text>

        {/* Right Side: T Lymphocyte (Immune Sentinel) */}
        <path d="M 250 10 Q 185 10 185 55 Q 185 100 250 100 Z" fill={isTreated ? "#064e3b" : "#1e293b"} stroke={isTreated ? "#10b981" : "#475569"} strokeWidth="1" />
        <text x="215" y="52" textAnchor="middle" fill={isTreated ? "#a7f3d0" : "#cbd5e1"} fontSize="5.5" fontWeight="bold">
          T 淋巴细胞
        </text>
        <text x="215" y="62" textAnchor="middle" fill={isTreated ? "#6ee7b7" : "#94a3b8"} fontSize="4">
          {isTreated ? "(已激活并释放穿孔素)" : "(处于耗竭/刹车休眠)"}
        </text>

        {/* PD-1 Receptor Stalk from T Cell */}
        <line x1="185" y1="55" x2="152" y2="55" stroke="#0ea5e9" strokeWidth="2.5" />
        <path d="M 148 49 A 6 6 0 0 0 148 61 Z" fill="#0ea5e9" />
        <text x="148" y="44" textAnchor="middle" fill="#38bdf8" fontSize="4.5" fontWeight="bold">
          PD-1 刹车
        </text>

        {/* Interaction Zone: Untreated vs Treated */}
        {!isTreated ? (
          <g>
            {/* Direct Binding line */}
            <line x1="96" y1="55" x2="142" y2="55" stroke="#ef4444" strokeWidth="2" strokeDasharray="2,2" />
            <rect x="98" y="70" width="44" height="24" rx="4" fill="#7f1d1d" opacity="0.8" />
            <text x="120" y="80" textAnchor="middle" fill="#fee2e2" fontSize="4" fontWeight="bold">
              🚫 伪装结合成功
            </text>
            <text x="120" y="89" textAnchor="middle" fill="#fca5a5" fontSize="3.5">
              T细胞被抑制，无法杀癌
            </text>
          </g>
        ) : (
          <g>
            {/* Antibody Blocking Shield (Y-shaped Antibody) */}
            <path d="M 115 35 L 120 48 L 120 62 M 120 48 L 125 35" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="120" cy="50" r="10" fill="#f59e0b" opacity="0.3" />
            <rect x="94" y="72" width="52" height="25" rx="4" fill="#065f46" opacity="0.85" />
            <text x="120" y="81" textAnchor="middle" fill="#a7f3d0" fontSize="4" fontWeight="bold">
              ⚡ 抗体阻断结合！
            </text>
            <text x="120" y="90" textAnchor="middle" fill="#6ee7b7" fontSize="3.5">
              T细胞苏醒，强效歼灭肿瘤
            </text>
          </g>
        )}
      </svg>

      {/* TPS Score Spectrum Bar */}
      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
        <div className="text-[10px] font-bold text-slate-400">
          📊 术后 PD-L1 表达（TPS 分层）临床获益图谱：
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold">TPS &lt; 1% (阴性)</div>
            <div className="text-[9px] text-slate-500">含铂化疗为主 / MRD监测</div>
          </div>
          <div className="bg-blue-950/40 p-1.5 rounded-lg border border-blue-800/40">
            <div className="text-[10px] text-blue-300 font-bold">TPS 1% ~ 49% (低表达)</div>
            <div className="text-[9px] text-blue-400">化疗后序贯免疫 1 年</div>
          </div>
          <div className="bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/40">
            <div className="text-[10px] text-emerald-300 font-bold">TPS ≥ 50% (高表达)</div>
            <div className="text-[9px] text-emerald-400 font-bold">复发风险降低 57% ⭐</div>
          </div>
        </div>
      </div>
    </div>
  );
}
