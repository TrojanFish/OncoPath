"use client";

import { useState } from "react";

type StationFilter = "ALL" | "N2" | "N1";

export function MediastinalLNMapVisual() {
  const [filter, setFilter] = useState<StationFilter>("ALL");

  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">🫁 国际 IASLC 肺癌胸腔淋巴结站点图谱</span>
        <span className="text-[10px] text-slate-400">N1 与 N2 解剖分界</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-3 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 text-[11px] py-1 rounded-lg font-semibold transition-all ${
            filter === "ALL" ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          全站解剖图 (1~14站)
        </button>
        <button
          onClick={() => setFilter("N2")}
          className={`flex-1 text-[11px] py-1 rounded-lg font-semibold transition-all ${
            filter === "N2" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          高亮 N2 纵隔站 (1~9站)
        </button>
        <button
          onClick={() => setFilter("N1")}
          className={`flex-1 text-[11px] py-1 rounded-lg font-semibold transition-all ${
            filter === "N1" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          高亮 N1 肺内/肺门站 (10~14站)
        </button>
      </div>

      {/* Anatomical SVG */}
      <svg viewBox="0 0 240 160" className="w-full h-auto">
        <defs>
          <linearGradient id="trachea-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>

        <rect width="240" height="160" fill="#0b1120" rx="8" />

        {/* Trachea & Main Bronchi */}
        {/* Main Trachea */}
        <path d="M 112 10 L 112 65 Q 112 72 90 98 L 70 120" fill="none" stroke="url(#trachea-grad)" strokeWidth="14" strokeLinecap="round" />
        <path d="M 128 10 L 128 65 Q 128 72 150 98 L 170 120" fill="none" stroke="url(#trachea-grad)" strokeWidth="14" strokeLinecap="round" />
        
        {/* Cartilage rings texture */}
        <line x1="112" y1="20" x2="128" y2="20" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
        <line x1="112" y1="35" x2="128" y2="35" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
        <line x1="112" y1="50" x2="128" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

        {/* Carina Angle (隆突) */}
        <path d="M 112 65 Q 120 72 128 65" fill="none" stroke="#f1f5f9" strokeWidth="1.5" />
        <text x="120" y="60" textAnchor="middle" fill="#cbd5e1" fontSize="4.5" fontWeight="bold">
          隆突 (Carina)
        </text>

        {/* Lung Contours (Subtle Background) */}
        <path d="M 50 40 Q 15 70 20 140 Q 60 150 80 135 Z" fill="#1e293b" opacity="0.3" />
        <path d="M 190 40 Q 225 70 220 140 Q 180 150 160 135 Z" fill="#1e293b" opacity="0.3" />

        {/* Mediastinum Central Zone Border */}
        <rect x="85" y="8" width="70" height="110" rx="6" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3,2" opacity={filter === "N1" ? "0.2" : "0.7"} />
        <text x="120" y="16" textAnchor="middle" fill="#f59e0b" fontSize="4.5" opacity={filter === "N1" ? "0.3" : "0.9"}>
          纵隔区 (N2站 淋巴结分布带)
        </text>

        {/* ================= N2 Stations (Yellow / Amber) ================= */}
        {/* Station 2R / 4R (Right Paratracheal) */}
        <g opacity={filter === "N1" ? "0.25" : "1"}>
          <circle cx="102" cy="30" r="4.5" fill="#f59e0b" />
          <text x="102" y="32" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">2R</text>
          <circle cx="100" cy="48" r="5" fill="#f59e0b" />
          <text x="100" y="50" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">4R</text>
        </g>

        {/* Station 2L / 4L (Left Paratracheal) */}
        <g opacity={filter === "N1" ? "0.25" : "1"}>
          <circle cx="138" cy="30" r="4.5" fill="#f59e0b" />
          <text x="138" y="32" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">2L</text>
          <circle cx="140" cy="48" r="5" fill="#f59e0b" />
          <text x="140" y="50" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">4L</text>
        </g>

        {/* Station 7 (Subcarinal - KEY N2 STATION) */}
        <g opacity={filter === "N1" ? "0.25" : "1"}>
          <circle cx="120" cy="78" r="6.5" fill="#ef4444" stroke="#fecaca" strokeWidth="1" />
          <text x="120" y="80.5" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">7</text>
          <text x="120" y="91" textAnchor="middle" fill="#f87171" fontSize="4.5" fontWeight="bold">
            第7组 隆突下 (N2必清扫站)
          </text>
        </g>

        {/* Station 8/9 (Paraesophageal / Pulmonary Ligament) */}
        <g opacity={filter === "N1" ? "0.25" : "1"}>
          <circle cx="114" cy="105" r="4" fill="#f59e0b" />
          <text x="114" y="106.5" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">8</text>
          <circle cx="126" cy="112" r="4" fill="#f59e0b" />
          <text x="126" y="113.5" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">9</text>
        </g>

        {/* ================= N1 Stations (Blue / Cyan) ================= */}
        {/* Right Hilar & Lobar (10R, 11R, 12R) */}
        <g opacity={filter === "N2" ? "0.25" : "1"}>
          <circle cx="78" cy="90" r="5" fill="#38bdf8" />
          <text x="78" y="92" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">10R</text>
          <text x="68" y="82" textAnchor="middle" fill="#38bdf8" fontSize="4">
            肺门 (10R)
          </text>

          <circle cx="60" cy="108" r="4.5" fill="#38bdf8" />
          <text x="60" y="109.5" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">11R</text>

          <circle cx="45" cy="125" r="4" fill="#38bdf8" />
          <text x="45" y="126.5" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">12R</text>
        </g>

        {/* Left Hilar & Lobar (10L, 11L, 12L) */}
        <g opacity={filter === "N2" ? "0.25" : "1"}>
          <circle cx="162" cy="90" r="5" fill="#38bdf8" />
          <text x="162" y="92" textAnchor="middle" fill="#000" fontSize="4" fontWeight="bold">10L</text>
          <text x="174" y="82" textAnchor="middle" fill="#38bdf8" fontSize="4">
            肺门 (10L)
          </text>

          <circle cx="180" cy="108" r="4.5" fill="#38bdf8" />
          <text x="180" y="109.5" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">11L</text>

          <circle cx="195" cy="125" r="4" fill="#38bdf8" />
          <text x="195" y="126.5" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">12L</text>
        </g>

        {/* Bottom Legend */}
        <rect x="10" y="142" width="8" height="8" rx="2" fill="#38bdf8" />
        <text x="22" y="148.5" fill="#94a3b8" fontSize="4.5">
          N1站（10~14站 肺门/叶间/肺内）➔ II 期
        </text>

        <rect x="130" y="142" width="8" height="8" rx="2" fill="#f59e0b" />
        <text x="142" y="148.5" fill="#94a3b8" fontSize="4.5">
          N2站（1~9站 同侧纵隔/隆突下）➔ IIIA/IIIB 期
        </text>
      </svg>

      <div className="mt-3 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1">
        <div>
          💡 <strong>临床核心：</strong> 外科手术中，规范清扫<strong>至少 3 组纵隔站（必须包含红色标注的第 7 组隆突下淋巴结）且清扫总数 &gt;12 枚</strong>，是确保完全切除（R0）并精确指导术后辅助靶向/化疗的金标准！
        </div>
      </div>
    </div>
  );
}
