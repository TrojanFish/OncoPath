"use client";

import React, { useState } from "react";

type SurgicalMode = "wedge" | "segment" | "lobe";

const MODES = [
  {
    id: "wedge" as SurgicalMode,
    label: "楔形切除 (局部微创)",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-300",
    barColor: "#f59e0b",
    lung: 95,
    scope: "仅切除外周微小楔形局部（不伤及肺段/支气管）",
    rfs: "适用 AIS/MIA 极小纯磨玻璃结节（CTR=0）",
    os: "5年 OS ≈ 100%",
    note: "非解剖性局部切除；仅切除病灶边缘 1~2cm 安全边界，整叶及所有肺段支气管 100% 完好保留",
  },
  {
    id: "segment" as SurgicalMode,
    label: "肺段切除 (解剖性保肺)",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    barColor: "#10b981",
    lung: 90,
    scope: "仅切除 1 个肺段（如右上叶 S1 尖段）",
    rfs: "CTR ≤ 0.5 早期肺癌（≤2cm）",
    os: "5年 OS 94.3% (JCOG0802)",
    note: "解剖性切除，精细离断单根段支气管与段血管；保留同叶其余 2 个肺段及全肺其余 4 个肺叶，保留 90%+ 肺功能",
  },
  {
    id: "lobe" as SurgicalMode,
    label: "肺叶切除 (根治金标准)",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-300",
    barColor: "#3b82f6",
    lung: 82,
    scope: "切除右上叶整叶（右中/下叶及左肺 2 叶全部完好）",
    rfs: "CTR > 0.5 或实性成分 >2cm 浸润性肺癌",
    os: "5年 OS 91.1% (JCOG0802)",
    note: "完整切除受累单叶（全肺 5 叶中的 1 叶）及引流淋巴结；右中叶、右下叶及左肺 2 叶全部完好保留",
  },
];

function LungSVG({ mode }: { mode: SurgicalMode }) {
  const healthyLobe = "#e2e8f0";
  const healthyStroke = "#94a3b8";

  const isWedge = mode === "wedge";
  const isSeg = mode === "segment";
  const isLobe = mode === "lobe";

  return (
    <svg viewBox="0 0 360 250" className="w-full h-auto max-w-[420px] mx-auto select-none">
      <defs>
        {/* Stripe Patterns for Resected Areas */}
        <pattern id="cutStripeWedge" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#f59e0b" strokeWidth="2.2" opacity="0.85" />
        </pattern>
        <pattern id="cutStripeSeg" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeWidth="2.2" opacity="0.85" />
        </pattern>
        <pattern id="cutStripeLobe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#3b82f6" strokeWidth="2.2" opacity="0.85" />
        </pattern>

        {/* Drop shadow for text pills */}
        <filter id="shadowPill" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Central Trachea and Bronchial Tree */}
      <g stroke="#475569" strokeLinecap="round" fill="none">
        {/* Trachea (气管) */}
        <line x1="180" y1="12" x2="180" y2="48" strokeWidth="5.5" />
        {/* Tracheal rings decoration */}
        <line x1="176" y1="20" x2="184" y2="20" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="176" y1="28" x2="184" y2="28" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="176" y1="36" x2="184" y2="36" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Carina & Main Bronchi (左右主支气管 - 面向患者视向: 左图为患者右肺, 右图为患者左肺) */}
        <path d="M180,48 Q175,60 152,70" strokeWidth="4" /> {/* 右主支气管 (解剖右=图左) */}
        <path d="M180,48 Q185,60 208,70" strokeWidth="4" /> {/* 左主支气管 (解剖左=图右) */}

        {/* 右肺各叶支气管 */}
        <path d="M152,70 Q130,72 108,58" strokeWidth={isLobe ? "3" : "2.5"} stroke={isLobe ? "#ef4444" : "#475569"} /> {/* 右上叶支气管 */}
        <path d="M152,70 Q132,96 112,112" strokeWidth="2.5" /> {/* 右中叶支气管 */}
        <path d="M152,70 Q142,110 135,160" strokeWidth="2.5" /> {/* 右下叶支气管 */}

        {/* 段切时标出 S1 尖段支气管离断 */}
        {isSeg && (
          <>
            <path d="M108,58 Q98,46 92,34" stroke="#10b981" strokeWidth="2.5" strokeDasharray="3,2" /> {/* S1 尖段 */}
            <path d="M108,58 Q88,60 78,64" stroke="#64748b" strokeWidth="1.8" /> {/* S2 后段 */}
            <path d="M108,58 Q100,72 94,82" stroke="#64748b" strokeWidth="1.8" /> {/* S3 前段 */}
          </>
        )}

        {/* 左肺各叶支气管 */}
        <path d="M208,70 Q235,72 255,64" strokeWidth="2.5" /> {/* 左上叶支气管 */}
        <path d="M208,70 Q222,110 228,160" strokeWidth="2.5" /> {/* 左下叶支气管 */}
      </g>

      {/* ================================================================= */}
      {/* 🫁 1. 患者右肺 (图左侧，共 3 叶：右上叶、右中叶、右下叶) */}
      {/* ================================================================= */}

      {/* 【右上叶 (RUL)】 */}
      {isLobe ? (
        // 🔵 肺叶切除：整叶切除高亮
        <g>
          <path
            d="M165,42 C135,20 85,20 62,54 C58,74 72,92 118,94 C145,94 165,72 165,42 Z"
            fill="url(#cutStripeLobe)"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeDasharray="5,2"
          />
          <path
            d="M165,42 C135,20 85,20 62,54 C58,74 72,92 118,94 C145,94 165,72 165,42 Z"
            fill="#3b82f6"
            opacity="0.25"
          />
          {/* 离断切口标记 */}
          <circle cx="108" cy="58" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          
          {/* Label Pill */}
          <g filter="url(#shadowPill)">
            <rect x="52" y="24" width="102" height="20" rx="10" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
            <text x="103" y="38" fontSize="10.5" fill="#1d4ed8" fontWeight="bold" textAnchor="middle">
              右上叶 (整叶切除)
            </text>
          </g>
        </g>
      ) : isSeg ? (
        // 🟢 肺段切除：仅切除 S1 尖段，保留 S2/S3
        <g>
          {/* 保留的 S2/S3 段 */}
          <path
            d="M148,64 C120,64 70,68 64,78 C70,92 118,94 158,92 C162,78 155,64 148,64 Z"
            fill={healthyLobe}
            stroke={healthyStroke}
            strokeWidth="1.8"
          />
          {/* 保留段文字 */}
          <g filter="url(#shadowPill)">
            <rect x="68" y="74" width="76" height="16" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" />
            <text x="106" y="86" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="bold">
              保留 S2/S3 段
            </text>
          </g>

          {/* 切除的 S1 尖段 (Apical Segment) */}
          <path
            d="M165,42 C135,20 85,20 62,54 C88,64 135,64 165,42 Z"
            fill="url(#cutStripeSeg)"
            stroke="#059669"
            strokeWidth="2.5"
            strokeDasharray="4,2"
          />
          <path
            d="M165,42 C135,20 85,20 62,54 C88,64 135,64 165,42 Z"
            fill="#10b981"
            opacity="0.3"
          />
          {/* S1 段支气管离断点 */}
          <circle cx="98" cy="46" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

          {/* S1 Label Pill */}
          <g filter="url(#shadowPill)">
            <rect x="52" y="22" width="105" height="20" rx="10" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1" />
            <text x="104.5" y="36" fontSize="10.5" fill="#047857" fontWeight="bold" textAnchor="middle">
              S1 尖段 (段切)
            </text>
          </g>
        </g>
      ) : (
        // 🟡 楔形切除：整叶完整，仅外周切除微小三角形
        <g>
          {/* 完整的右上叶 */}
          <path
            d="M165,42 C135,20 85,20 62,54 C58,74 72,92 118,94 C145,94 165,72 165,42 Z"
            fill={healthyLobe}
            stroke={healthyStroke}
            strokeWidth="1.8"
          />
          {/* 外周微小楔切边缘 (Wedge slice) */}
          <polygon
            points="76,28 60,48 84,52"
            fill="url(#cutStripeWedge)"
            stroke="#d97706"
            strokeWidth="2.2"
            strokeDasharray="3,1.5"
          />
          <polygon points="76,28 60,48 84,52" fill="#f59e0b" opacity="0.4" />
          {/* 结节微点 */}
          <circle cx="73" cy="43" r="2.5" fill="#b45309" />

          {/* Label Pill */}
          <g filter="url(#shadowPill)">
            <rect x="88" y="24" width="76" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" />
            <text x="126" y="37" fontSize="9" fill="#64748b" textAnchor="middle" fontWeight="bold">
              右上叶 (整叶保留)
            </text>
          </g>
          <g filter="url(#shadowPill)">
            <rect x="42" y="44" width="40" height="16" rx="8" fill="#fef3c7" stroke="#fde68a" strokeWidth="1" />
            <text x="62" y="56" fontSize="9" fill="#92400e" fontWeight="bold" textAnchor="middle">
              楔切
            </text>
          </g>
        </g>
      )}

      {/* 【右中叶 (RML - 永远完好保留)】 */}
      <g>
        <path
          d="M162,98 C135,98 78,98 70,116 C74,134 122,140 160,132 C168,118 165,102 162,98 Z"
          fill={healthyLobe}
          stroke={healthyStroke}
          strokeWidth="1.8"
        />
        <g filter="url(#shadowPill)">
          <rect x="76" y="112" width="78" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" />
          <text x="115" y="125" fontSize="9.5" fill="#475569" textAnchor="middle" fontWeight="bold">
            右中叶 (完好保留)
          </text>
        </g>
      </g>

      {/* 【右下叶 (RLL - 永远完好保留)】 */}
      <g>
        <path
          d="M160,136 C125,142 78,138 78,172 C90,205 145,214 170,202 C172,174 166,146 160,136 Z"
          fill={healthyLobe}
          stroke={healthyStroke}
          strokeWidth="1.8"
        />
        <g filter="url(#shadowPill)">
          <rect x="76" y="168" width="78" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" />
          <text x="115" y="181" fontSize="9.5" fill="#475569" textAnchor="middle" fontWeight="bold">
            右下叶 (完好保留)
          </text>
        </g>
      </g>

      {/* ================================================================= */}
      {/* 🫁 2. 患者左肺 (图右侧，共 2 叶：左上叶、左下叶 - 永远完好保留) */}
      {/* ================================================================= */}

      {/* 【左上叶 (LUL - 永远完好保留)】 */}
      <g>
        <path
          d="M195,42 C225,20 275,20 298,54 C302,84 288,108 248,112 C218,112 198,82 195,42 Z"
          fill={healthyLobe}
          stroke={healthyStroke}
          strokeWidth="1.8"
        />
        <g filter="url(#shadowPill)">
          <rect x="206" y="58" width="80" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" />
          <text x="246" y="71" fontSize="9.5" fill="#475569" textAnchor="middle" fontWeight="bold">
            左上叶 (完好保留)
          </text>
        </g>
      </g>

      {/* 【左下叶 (LLL - 永远完好保留)】 */}
      <g>
        <path
          d="M200,116 C238,112 290,114 285,160 C274,204 218,214 190,202 C188,172 194,136 200,116 Z"
          fill={healthyLobe}
          stroke={healthyStroke}
          strokeWidth="1.8"
        />
        <g filter="url(#shadowPill)">
          <rect x="206" y="156" width="80" height="18" rx="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.95" />
          <text x="246" y="169" fontSize="9.5" fill="#475569" textAnchor="middle" fontWeight="bold">
            左下叶 (完好保留)
          </text>
        </g>
      </g>

      {/* 心脏轮廓 (Central Cardiac Silhouette) */}
      <g>
        <ellipse cx="180" cy="142" rx="14" ry="18" fill="#fda4af" opacity="0.75" stroke="#f43f5e" strokeWidth="1.2" />
        <text x="180" y="146" fontSize="8" fill="#be123c" textAnchor="middle" fontWeight="bold">心</text>
      </g>

      {/* 底部解剖总标注 */}
      <g filter="url(#shadowPill)">
        <rect x="48" y="222" width="134" height="22" rx="11" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
        <text x="115" y="237" fontSize="10.5" textAnchor="middle" fill="#0f172a" fontWeight="bold">
          右肺 (3叶: 上 / 中 / 下)
        </text>
      </g>
      <g filter="url(#shadowPill)">
        <rect x="188" y="222" width="124" height="22" rx="11" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
        <text x="250" y="237" fontSize="10.5" textAnchor="middle" fill="#0f172a" fontWeight="bold">
          左肺 (2叶: 上 / 下)
        </text>
      </g>
    </svg>
  );
}

export function SurgicalApproachesVisual() {
  const [active, setActive] = useState<SurgicalMode>("segment");
  const curr = MODES.find((m) => m.id === active)!;

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Tab Selector Buttons */}
      <div className="flex gap-1.5 sm:gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setActive(m.id)}
            className={`flex-1 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all duration-200 cursor-pointer ${
              active === m.id
                ? `${m.border} ${m.bg} ${m.color} shadow-sm scale-[1.02]`
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
        {/* Left: Lung SVG Panel (Balanced 5:5 with compact padding for maximized diagram) */}
        <div className={`rounded-2xl border-2 ${curr.border} ${curr.bg} p-2 sm:p-2.5 flex flex-col items-center justify-between shadow-xs`}>
          <div className="w-full flex-1 flex items-center justify-center">
            <LungSVG mode={active} />
          </div>
          <div className="mt-1.5 w-full text-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${curr.bg} ${curr.color} border ${curr.border} shadow-xs`}>
              {curr.scope}
            </span>
          </div>
        </div>

        {/* Right: Data & Evidence Panel (Balanced 5:5) */}
        <div className="flex flex-col justify-between space-y-2 sm:space-y-2.5">
          {/* Lung function preservation progress */}
          <div className={`rounded-xl border-2 ${curr.border} ${curr.bg} p-2.5 sm:p-3 shadow-xs`}>
            <div className="flex items-center justify-between text-xs text-slate-700 mb-1 font-bold">
              <span>术后整体肺功能保留率（代偿后）</span>
              <span className={`text-base font-black ${curr.color}`}>{curr.lung}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200/90 rounded-full h-3 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${curr.lung}%`, backgroundColor: curr.barColor }}
                />
              </div>
            </div>
          </div>

          {/* Detailed stats */}
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3 space-y-1.5 flex-1 shadow-xs">
            <div className="flex items-start gap-1.5 text-xs">
              <span className="text-slate-400 font-bold shrink-0">适用指征：</span>
              <span className="font-semibold text-slate-800 leading-snug">{curr.rfs}</span>
            </div>
            <div className="flex items-start gap-1.5 text-xs">
              <span className="text-slate-400 font-bold shrink-0">循证疗效：</span>
              <span className={`font-black ${curr.color}`}>{curr.os}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">解剖学要点：</strong>
              {curr.note}
            </div>
          </div>

          {/* JCOG0802 Trial Gold Standard Banner */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 p-2 sm:p-2.5 text-xs text-blue-900 leading-relaxed shadow-xs">
            <strong className="text-blue-950 block mb-0.5">🏆 JCOG0802（Lancet 2022 重磅循证）：</strong>
            对于 ≤2cm 且 CTR≤0.5 的外周早期肺癌，肺段切除 5 年总生存率 <strong>94.3%</strong> 优于肺叶切除 91.1%，兼顾 100% 根治与极致保肺！
          </div>
        </div>
      </div>
    </div>
  );
}
