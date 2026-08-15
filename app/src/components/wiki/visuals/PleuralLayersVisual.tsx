"use client";

import { useState } from "react";

type PlGrade = "PL0" | "PL1" | "PL2" | "PL3";

export function PleuralLayersVisual() {
  const [selectedPl, setSelectedPl] = useState<PlGrade>("PL3");

  const plInfo = {
    PL0: {
      name: "PL0 · 弹力层未累及 (阴性)",
      stage: "T 分期不升期 (T1保持T1)",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      desc: "肿瘤局限在肺实质内部，未触及或未穿透脏层胸膜的内弹力层，属于胸膜侵犯阴性，预后极佳。",
    },
    PL1: {
      name: "PL1 · 突破内弹力层",
      stage: "T1 (≤3cm) 自动升期为 T2a (IB期起步)",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "肿瘤穿透了脏层胸膜的内弹力纤维层，但未到达脏层胸膜外表面。标准肺叶切除已将该层连同肺叶完整切除。",
    },
    PL2: {
      name: "PL2 · 到达脏层胸膜外表面",
      stage: "T1 (≤3cm) 自动升期为 T2a (IB期起步)",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "肿瘤延伸至脏层胸膜的最外层间皮表面。根治性肺叶切除（R0）已将整层脏层胸膜完整移出体外。",
    },
    PL3: {
      name: "PL3 · 侵犯壁层胸膜与胸壁",
      stage: "直接定为 T3 分期 (需整块 En-bloc 切除)",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      desc: "肿瘤跨过胸膜腔，直接浸润到胸壁的壁层胸膜、肋间肌肉或肋骨。外科需行整块胸壁扩大切除（En-bloc 切除）以确保切缘彻底干净（R0）。",
    },
  };

  const active = plInfo[selectedPl];

  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">🚪 胸膜解剖层次与 PL0 ~ PL3 侵犯深度</span>
        <span className="text-[10px] text-slate-400">AJCC 第 8/9 版分期标准</span>
      </div>

      {/* Layer Depth Interactive SVG */}
      <svg viewBox="0 0 240 125" className="w-full h-auto mb-2.5">
        <rect width="240" height="125" fill="#0b1120" rx="8" />

        {/* 1. Lung Parenchyma (Bottom) */}
        <rect x="10" y="85" width="220" height="35" fill="#1e293b" opacity="0.8" rx="4" />
        <text x="18" y="105" fill="#94a3b8" fontSize="4.5" fontWeight="bold">
          肺实质 (Lung Parenchyma)
        </text>

        {/* 2. Visceral Pleural Elastic Lamina (PL1) */}
        <line x1="10" y1="80" x2="230" y2="80" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="3,1" />
        <text x="18" y="77" fill="#38bdf8" fontSize="4" fontWeight="bold">
          脏层胸膜内弹力层 (Internal Elastic Lamina)
        </text>

        {/* 3. Visceral Pleural Outer Surface (PL2) */}
        <line x1="10" y1="68" x2="230" y2="68" stroke="#38bdf8" strokeWidth="1.5" />
        <text x="18" y="65" fill="#7dd3fc" fontSize="4">
          脏层胸膜外表面 (Visceral Mesothelial Surface)
        </text>

        {/* 4. Pleural Cavity (Potential Space) */}
        <rect x="10" y="52" width="220" height="14" fill="#0f172a" stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />
        <text x="120" y="61" textAnchor="middle" fill="#64748b" fontSize="4">
          ── 胸膜腔潜在间隙 (Pleural Cavity) ──
        </text>

        {/* 5. Parietal Pleura (PL3 Entrance) */}
        <line x1="10" y1="50" x2="230" y2="50" stroke="#f43f5e" strokeWidth="1.8" />
        <text x="18" y="47" fill="#fb7185" fontSize="4" fontWeight="bold">
          壁层胸膜 (Parietal Pleura) ➔ PL3 起点
        </text>

        {/* 6. Chest Wall Muscles & Ribs (PL3 Deep) */}
        <rect x="10" y="10" width="220" height="35" fill="#4c0519" opacity="0.6" rx="4" />
        <text x="18" y="24" fill="#fda4af" fontSize="4.5" fontWeight="bold">
          胸壁组织 (肋间肌 Intercostal Muscles / 肋骨 Ribs)
        </text>

        {/* Dynamic Tumor Mass Indicator Based on selectedPl */}
        {selectedPl === "PL0" && (
          <path d="M 120 115 Q 110 95 120 90 Q 130 95 120 115 Z" fill="#10b981" />
        )}
        {selectedPl === "PL1" && (
          <path d="M 120 115 Q 105 85 120 76 Q 135 85 120 115 Z" fill="#f59e0b" />
        )}
        {selectedPl === "PL2" && (
          <path d="M 120 115 Q 105 80 120 68 Q 135 80 120 115 Z" fill="#f59e0b" />
        )}
        {selectedPl === "PL3" && (
          <g>
            <path d="M 120 115 Q 95 60 120 25 Q 145 60 120 115 Z" fill="#e11d48" opacity="0.9" />
            <text x="120" y="32" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">
              PL3 侵及胸壁
            </text>
            <line x1="85" y1="12" x2="85" y2="118" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2" />
            <line x1="155" y1="12" x2="155" y2="118" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3,2" />
            <text x="160" y="20" fill="#34d399" fontSize="4" fontWeight="bold">
              En-bloc 整块切除边界
            </text>
          </g>
        )}
      </svg>

      {/* PL Level Selection Tabs */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {(["PL0", "PL1", "PL2", "PL3"] as PlGrade[]).map((pl) => (
          <button
            key={pl}
            onClick={() => setSelectedPl(pl)}
            className={`text-[11px] py-1 rounded-lg font-semibold transition-all ${
              selectedPl === pl
                ? pl === "PL3"
                  ? "bg-rose-600 text-white ring-1 ring-rose-400"
                  : pl === "PL0"
                  ? "bg-emerald-600 text-white ring-1 ring-emerald-400"
                  : "bg-amber-600 text-white ring-1 ring-amber-400"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {pl} 深度
          </button>
        ))}
      </div>

      {/* Selected PL Details Box */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-white">{active.name}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${active.badgeColor}`}>
            {active.stage}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {active.desc}
        </p>
      </div>
    </div>
  );
}
