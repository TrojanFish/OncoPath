"use client";

import React, { useState } from "react";

type SurgicalMode = "wedge" | "segment" | "lobe";

const MODES = [
  {
    id: "wedge" as SurgicalMode,
    label: "楔形切除",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    barColor: "#f59e0b",
    lung: 93,
    rfs: "适用 AIS/MIA（CTR=0）",
    os: "5年 OS ≈ 100%",
    note: "仅适用于外周1/3极小纯磨玻璃结节；非解剖性切除，不清扫段淋巴管",
  },
  {
    id: "segment" as SurgicalMode,
    label: "肺段切除",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    barColor: "#10b981",
    lung: 90,
    rfs: "CTR ≤ 0.5 早期肺癌（≤2cm）",
    os: "5年 OS 94.3% (JCOG0802)",
    note: "解剖性切除，保留90%+肺功能；切缘 ≥2cm；已成为早期肺癌首选术式",
  },
  {
    id: "lobe" as SurgicalMode,
    label: "肺叶切除",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    barColor: "#3b82f6",
    lung: 82,
    rfs: "CTR > 0.5 / 实性结节 >2cm",
    os: "5年 OS 91.1% (JCOG0802)",
    note: "根治性标准金标准；完整切除肺叶+所属淋巴结；术后代偿期恢复80~85%肺功能",
  },
];

function LungSVG({ mode }: { mode: SurgicalMode }) {
  const isLobe = mode === "lobe";
  const isSeg = mode === "segment";

  const rUpper = isLobe ? "#ef4444" : "#cbd5e1";
  const rMid = isLobe ? "#ef4444" : isSeg ? "#f97316" : "#cbd5e1";
  const rLower = isLobe ? "#ef4444" : "#cbd5e1";
  const lUpper = isLobe ? "#3b82f6" : "#cbd5e1";
  const lLower = isLobe ? "#3b82f6" : "#cbd5e1";

  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-[240px] mx-auto">
      {/* Right lung outline */}
      <ellipse cx="122" cy="82" rx="50" ry="65" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Right upper */}
      <path d="M122,22 Q152,18 168,52 Q155,56 122,56 Z" fill={rUpper} opacity="0.82" />
      {/* Right middle */}
      <path d="M122,56 Q162,56 170,82 Q156,86 122,86 Z" fill={rMid} opacity="0.82" />
      {/* Right lower */}
      <path d="M122,86 Q162,90 160,132 Q146,146 122,146 Z" fill={rLower} opacity="0.82" />
      {/* Dividers */}
      <line x1="122" y1="56" x2="170" y2="68" stroke="white" strokeWidth="1.2" opacity="0.7" />
      <line x1="122" y1="86" x2="170" y2="96" stroke="white" strokeWidth="1.2" opacity="0.7" />

      {/* Left lung outline */}
      <ellipse cx="78" cy="82" rx="45" ry="65" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Left upper */}
      <path d="M78,22 Q48,18 36,56 Q52,60 78,60 Z" fill={lUpper} opacity="0.82" />
      {/* Left lower */}
      <path d="M78,60 Q40,66 36,132 Q54,146 78,146 Z" fill={lLower} opacity="0.82" />
      <line x1="78" y1="60" x2="36" y2="74" stroke="white" strokeWidth="1.2" opacity="0.7" />

      {/* Wedge cut marker */}
      {mode === "wedge" && (
        <g>
          <polygon points="148,24 168,44 150,50" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" opacity="0.95" />
          <text x="153" y="36" fontSize="6.5" fill="#78350f" fontWeight="bold">楔切</text>
        </g>
      )}

      {/* Segment highlight on right middle */}
      {isSeg && (
        <g>
          <text x="142" y="75" fontSize="6.5" fill="white" fontWeight="bold">段切</text>
        </g>
      )}

      {/* Heart */}
      <ellipse cx="99" cy="102" rx="8" ry="9" fill="#fca5a5" stroke="#f87171" strokeWidth="1" />

      {/* Labels */}
      <text x="122" y="156" fontSize="8" textAnchor="middle" fill="#64748b">右肺（3叶）</text>
      <text x="78" y="156" fontSize="8" textAnchor="middle" fill="#64748b">左肺（2叶）</text>
    </svg>
  );
}

export function SurgicalApproachesVisual() {
  const [active, setActive] = useState<SurgicalMode>("segment");
  const curr = MODES.find((m) => m.id === active)!;

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Tab row */}
      <div className="flex gap-1.5 sm:gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-lg text-xs sm:text-sm font-semibold border-2 transition-all duration-200 ${
              active === m.id
                ? `${m.border} ${m.bg} ${m.color} shadow-sm scale-[1.02]`
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Lung SVG */}
        <div className={`rounded-xl border-2 ${curr.border} ${curr.bg} p-2.5 sm:p-4 flex flex-col items-center justify-center`}>
          <LungSVG mode={active} />
          <p className={`mt-2 text-xs font-semibold ${curr.color} text-center`}>
            {active === "wedge" && "🟡 楔形切除 — 非解剖性"}
            {active === "segment" && "🟢 肺段切除 — 解剖性保肺首选"}
            {active === "lobe" && "🔵 肺叶切除 — 根治性金标准"}
          </p>
        </div>

        {/* Data panels */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Lung function bar */}
          <div className={`rounded-xl border ${curr.border} ${curr.bg} p-2.5 sm:p-3`}>
            <div className="text-xs text-slate-500 mb-1.5">术后肺功能保留率（代偿后）</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${curr.lung}%`, backgroundColor: curr.barColor }}
                />
              </div>
              <span className={`text-sm font-bold ${curr.color} min-w-[36px]`}>{curr.lung}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 space-y-2">
            <div className="flex items-start gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">适用：</span>
              <span className="text-xs font-semibold text-slate-700">{curr.rfs}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">循证：</span>
              <span className={`text-xs font-bold ${curr.color}`}>{curr.os}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">{curr.note}</div>
          </div>

          {/* JCOG0802 callout */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-2.5 sm:p-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>JCOG0802（Lancet 2022）：</strong>
              对于 ≤2cm 且 CTR≤0.5 早期肺癌，肺段切除 5年OS <strong>94.3%</strong> 优于肺叶切除 91.1%（HR=0.663，P=0.0082），已成为国际指南首推术式。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
