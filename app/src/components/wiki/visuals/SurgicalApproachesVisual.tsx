"use client";

import React, { useState } from "react";

type SurgicalMode = "wedge" | "segment" | "lobe";

const MODES = [
  {
    id: "wedge" as SurgicalMode,
    label: "楔形切除 (局部)",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    barColor: "#f59e0b",
    lung: 95,
    scope: "仅切除外周微小楔形局部",
    rfs: "适用 AIS/MIA 极小纯磨玻璃结节（CTR=0）",
    os: "5年 OS ≈ 100%",
    note: "非解剖性切除，支气管树完全不动；仅切除病灶周围 1~2cm 安全边界，保留整叶及全部肺段",
  },
  {
    id: "segment" as SurgicalMode,
    label: "肺段切除 (保肺首选)",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    barColor: "#10b981",
    lung: 90,
    scope: "仅切除 1 个肺段（如右上叶 S1 尖段）",
    rfs: "CTR ≤ 0.5 早期肺癌（≤2cm）",
    os: "5年 OS 94.3% (JCOG0802)",
    note: "解剖性切除，精细离断段支气管与段血管；保留同叶其余 2 段及全肺其余 4 叶，保留 90%+ 肺功能",
  },
  {
    id: "lobe" as SurgicalMode,
    label: "肺叶切除 (根治金标准)",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    barColor: "#3b82f6",
    lung: 82,
    scope: "切除右上叶整叶（其余 4 叶完好）",
    rfs: "CTR > 0.5 或实性成分 >2cm 浸润性肺癌",
    os: "5年 OS 91.1% (JCOG0802)",
    note: "完整切除受累单侧单叶（全肺 5 叶中的 1 叶）及对应淋巴结；右中下叶与左肺 2 叶全部完好保留",
  },
];

function LungSVG({ mode }: { mode: SurgicalMode }) {
  // Normal healthy lobe colors
  const healthyLobe = "#e2e8f0";
  const healthyStroke = "#94a3b8";

  // Mode highlights applied ONLY to Right Upper Lobe (RUL)
  const isWedge = mode === "wedge";
  const isSeg = mode === "segment";
  const isLobe = mode === "lobe";

  return (
    <svg viewBox="0 0 280 200" className="w-full max-w-[280px] mx-auto select-none">
      {/* Background grid / subtitle */}
      <defs>
        <pattern id="cutStripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#f59e0b" strokeWidth="2" opacity="0.8" />
        </pattern>
        <pattern id="segStripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeWidth="2" opacity="0.8" />
        </pattern>
        <pattern id="lobeStripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#3b82f6" strokeWidth="2" opacity="0.8" />
        </pattern>
      </defs>

      {/* Trachea and Bronchial Tree */}
      <g stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round">
        {/* Main Trachea */}
        <line x1="140" y1="12" x2="140" y2="46" strokeWidth="4.5" stroke="#475569" />
        {/* Carina bifurcation */}
        <path d="M140,46 Q140,55 160,65" /> {/* Right main bronchus */}
        <path d="M140,46 Q140,55 120,65" /> {/* Left main bronchus */}

        {/* Right lobar bronchi */}
        <path d="M160,65 Q180,68 195,58" strokeWidth={isLobe ? "2.5" : "2"} stroke={isLobe ? "#ef4444" : "#64748b"} /> {/* RUL bronchus */}
        <path d="M160,65 Q178,82 188,96" strokeWidth="2" /> {/* RML bronchus */}
        <path d="M160,65 Q168,95 174,130" strokeWidth="2" /> {/* RLL bronchus */}

        {/* RUL Segmental bronchi (S1, S2, S3) */}
        {isSeg && (
          <>
            <path d="M195,58 Q202,48 206,38" stroke="#10b981" strokeWidth="2" strokeDasharray="2,2" /> {/* S1 apical */}
            <path d="M195,58 Q210,60 216,62" stroke="#64748b" strokeWidth="1.5" /> {/* S2 post */}
            <path d="M195,58 Q200,70 205,76" stroke="#64748b" strokeWidth="1.5" /> {/* S3 ant */}
          </>
        )}

        {/* Left lobar bronchi */}
        <path d="M120,65 Q95,68 80,62" strokeWidth="2" /> {/* LUL bronchus */}
        <path d="M120,65 Q105,95 98,130" strokeWidth="2" /> {/* LLL bronchus */}
      </g>

      {/* ================= RIGHT LUNG (3 Lobes) ================= */}
      {/* 1. Right Upper Lobe (RUL) */}
      {isLobe ? (
        // Entire RUL Resected Highlight
        <g>
          <path
            d="M152,38 C175,22 215,22 228,52 C230,68 220,80 188,82 C168,82 152,65 152,38 Z"
            fill="url(#lobeStripe)"
            stroke="#2563eb"
            strokeWidth="2"
            strokeDasharray="4,2"
          />
          <path
            d="M152,38 C175,22 215,22 228,52 C230,68 220,80 188,82 C168,82 152,65 152,38 Z"
            fill="#3b82f6"
            opacity="0.25"
          />
          {/* Resection marker */}
          <circle cx="195" cy="58" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
          <text x="190" y="32" fontSize="8" fill="#1d4ed8" fontWeight="bold">右上叶（整叶切除）</text>
        </g>
      ) : isSeg ? (
        // RUL with S1 (Apical) segment resected, S2/S3 preserved
        <g>
          {/* Preserved S2 & S3 segments of RUL */}
          <path
            d="M165,58 C185,58 226,62 228,70 C222,82 188,82 158,80 C154,68 160,58 165,58 Z"
            fill={healthyLobe}
            stroke={healthyStroke}
            strokeWidth="1.5"
          />
          <text x="190" y="74" fontSize="6.5" fill="#64748b">保留S2/S3段</text>

          {/* S1 Apical Segment (Resected) */}
          <path
            d="M152,38 C175,22 215,22 228,52 C210,58 175,58 152,38 Z"
            fill="url(#segStripe)"
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="3,2"
          />
          <path
            d="M152,38 C175,22 215,22 228,52 C210,58 175,58 152,38 Z"
            fill="#10b981"
            opacity="0.3"
          />
          {/* Resection marker on S1 bronchus */}
          <circle cx="202" cy="46" r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
          <text x="186" y="32" fontSize="7.5" fill="#047857" fontWeight="bold">S1 尖段（段切）</text>
        </g>
      ) : (
        // Wedge mode: RUL intact with small triangular wedge excised at peripheral top-right
        <g>
          <path
            d="M152,38 C175,22 215,22 228,52 C230,68 220,80 188,82 C168,82 152,65 152,38 Z"
            fill={healthyLobe}
            stroke={healthyStroke}
            strokeWidth="1.5"
          />
          {/* Wedge slice at peripheral edge */}
          <polygon
            points="218,26 230,42 212,45"
            fill="url(#cutStripe)"
            stroke="#d97706"
            strokeWidth="2"
            strokeDasharray="3,1"
          />
          <polygon points="218,26 230,42 212,45" fill="#f59e0b" opacity="0.35" />
          <circle cx="220" cy="37" r="2" fill="#b45309" />
          <text x="180" y="32" fontSize="7" fill="#64748b">右上叶 (整叶保留)</text>
          <text x="232" y="28" fontSize="7" fill="#b45309" fontWeight="bold">楔切</text>
        </g>
      )}

      {/* 2. Right Middle Lobe (RML - Always Preserved) */}
      <path
        d="M154,84 C175,84 218,84 225,98 C222,112 185,116 156,110 C150,98 152,86 154,84 Z"
        fill={healthyLobe}
        stroke={healthyStroke}
        strokeWidth="1.5"
      />
      <text x="185" y="102" fontSize="6.5" fill="#64748b" textAnchor="middle">右中叶 (保留)</text>

      {/* 3. Right Lower Lobe (RLL - Always Preserved) */}
      <path
        d="M155,112 C185,118 220,114 220,140 C210,165 168,172 148,162 C146,140 150,118 155,112 Z"
        fill={healthyLobe}
        stroke={healthyStroke}
        strokeWidth="1.5"
      />
      <text x="185" y="145" fontSize="6.5" fill="#64748b" textAnchor="middle">右下叶 (保留)</text>

      {/* ================= LEFT LUNG (2 Lobes - Always Preserved) ================= */}
      {/* 1. Left Upper Lobe (LUL) */}
      <path
        d="M128,38 C105,22 65,22 52,55 C48,78 60,95 90,98 C112,98 126,75 128,38 Z"
        fill={healthyLobe}
        stroke={healthyStroke}
        strokeWidth="1.5"
      />
      <text x="92" y="65" fontSize="6.5" fill="#64748b" textAnchor="middle">左上叶 (完好保留)</text>

      {/* 2. Left Lower Lobe (LLL) */}
      <path
        d="M124,100 C95,97 55,98 58,135 C65,166 110,172 130,162 C132,138 128,110 124,100 Z"
        fill={healthyLobe}
        stroke={healthyStroke}
        strokeWidth="1.5"
      />
      <text x="92" y="136" fontSize="6.5" fill="#64748b" textAnchor="middle">左下叶 (完好保留)</text>

      {/* Heart Silhouette in Center */}
      <ellipse cx="138" cy="115" rx="10" ry="14" fill="#fda4af" opacity="0.6" stroke="#f43f5e" strokeWidth="1" />
      <text x="138" y="118" fontSize="5.5" fill="#e11d48" textAnchor="middle" fontWeight="bold">心</text>

      {/* Bottom Labels */}
      <text x="185" y="185" fontSize="8.5" textAnchor="middle" fill="#334155" fontWeight="bold">
        右肺 (3叶: 上/中/下)
      </text>
      <text x="92" y="185" fontSize="8.5" textAnchor="middle" fill="#334155" fontWeight="bold">
        左肺 (2叶: 上/下)
      </text>
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
        {/* Lung SVG Panel */}
        <div className={`rounded-xl border-2 ${curr.border} ${curr.bg} p-2.5 sm:p-4 flex flex-col items-center justify-center`}>
          <LungSVG mode={active} />
          <div className="mt-2 text-center">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${curr.bg} ${curr.color} border ${curr.border}`}>
              {curr.scope}
            </span>
          </div>
        </div>

        {/* Data panels */}
        <div className="space-y-2.5 sm:space-y-3">
          {/* Lung function bar */}
          <div className={`rounded-xl border ${curr.border} ${curr.bg} p-2.5 sm:p-3`}>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
              <span>术后整体肺功能保留率（代偿后）</span>
              <span className={`text-sm font-bold ${curr.color}`}>{curr.lung}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${curr.lung}%`, backgroundColor: curr.barColor }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 space-y-2">
            <div className="flex items-start gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">适用范围：</span>
              <span className="text-xs font-semibold text-slate-700">{curr.rfs}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-xs text-slate-400 shrink-0">循证数据：</span>
              <span className={`text-xs font-bold ${curr.color}`}>{curr.os}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              <strong>解剖要点：</strong>{curr.note}
            </div>
          </div>

          {/* JCOG0802 callout */}
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-2.5 sm:p-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>JCOG0802（Lancet 2022 重磅数据）：</strong>
              对于 ≤2cm 且 CTR≤0.5 的外周早期肺癌，肺段切除 5 年 OS <strong>94.3%</strong> 优于肺叶切除 91.1%，在彻底根治的同时最大化挽救健康肺泡！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
