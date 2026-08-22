"use client";

import React from "react";
import { Microscope, Info } from "lucide-react";

export function StasAirwayVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
          <Microscope className="w-3.5 h-3.5 text-sky-400" />
          <span>气道播散 (STAS) 显微切片概念图解</span>
        </span>
        <span className="text-[10px] text-slate-400">病理学微观形态</span>
      </div>

      <svg viewBox="0 0 200 110" className="w-full h-auto">
        <rect width="200" height="110" fill="#0b1120" rx="8" />

        {/* Normal Alveoli Grid (Background) */}
        <g stroke="#1e293b" strokeWidth="0.8" fill="none">
          <circle cx="30" cy="30" r="14" />
          <circle cx="55" cy="30" r="14" />
          <circle cx="80" cy="30" r="14" />
          <circle cx="105" cy="30" r="14" />
          <circle cx="130" cy="30" r="14" />
          <circle cx="155" cy="30" r="14" />
          
          <circle cx="30" cy="60" r="14" />
          <circle cx="55" cy="60" r="14" />
          <circle cx="80" cy="60" r="14" />
          <circle cx="105" cy="60" r="14" />
          <circle cx="130" cy="60" r="14" />
          <circle cx="155" cy="60" r="14" />
          
          <circle cx="30" cy="90" r="14" />
          <circle cx="55" cy="90" r="14" />
          <circle cx="80" cy="90" r="14" />
          <circle cx="105" cy="90" r="14" />
          <circle cx="130" cy="90" r="14" />
          <circle cx="155" cy="90" r="14" />
        </g>

        {/* Main Tumor Mass (Left) */}
        <path
          d="M 5 20 C 35 15, 65 35, 60 70 C 55 95, 25 105, 5 100 Z"
          fill="#be123c"
          opacity="0.8"
        />
        <text x="32" y="60" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="bold">
          主肿瘤实性区
        </text>

        {/* STAS Clusters (Floating micropapillary / solid nests in alveolar spaces) */}
        <g transform="translate(85, 45)">
          <circle cx="0" cy="0" r="3.5" fill="#f43f5e" stroke="#fda4af" strokeWidth="0.8" />
          <circle cx="-2" cy="-1.5" r="1.5" fill="#fda4af" />
          <circle cx="1.5" cy="1" r="1.2" fill="#fda4af" />
        </g>
        <g transform="translate(110, 35)">
          <circle cx="0" cy="0" r="2.8" fill="#f43f5e" stroke="#fda4af" strokeWidth="0.8" />
          <circle cx="-1" cy="-1" r="1.2" fill="#fda4af" />
        </g>
        <g transform="translate(100, 75)">
          <circle cx="0" cy="0" r="3.2" fill="#f43f5e" stroke="#fda4af" strokeWidth="0.8" />
          <circle cx="1" cy="1.2" r="1.4" fill="#fda4af" />
        </g>

        {/* Annotation Arrow for Floating STAS Nests */}
        <path d="M 98 25 L 88 40" stroke="#fbbf24" strokeWidth="1" />
        <text x="122" y="22" textAnchor="middle" fill="#fbbf24" fontSize="5" fontWeight="bold">
          STAS 游离细胞团 (&gt;1个肺泡间距)
        </text>

        {/* Lobectomy / Wide Margin Encompassing Safety Line */}
        <path
          d="M 145 10 L 145 100"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="4,2"
        />
        <text x="170" y="55" textAnchor="middle" fill="#34d399" fontSize="5" fontWeight="bold">
          标准肺叶切除
        </text>
        <text x="170" y="63" textAnchor="middle" fill="#a7f3d0" fontSize="4">
          (已彻底带出干净)
        </text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        <span className="inline-flex items-center gap-1 font-bold text-sky-300 mr-1">
          <Info className="w-3.5 h-3.5" />
          <span>图解要点：</span>
        </span>
        STAS 细胞仅飘散在主肿瘤周边的微小气腔内。只要手术达到绿色虚线所示的<strong>安全切除边界（如标准肺叶切除）</strong>，连同散在细胞在内的整个肺叶被整体移出，复发风险即被彻底切除阻断。
      </div>
    </div>
  );
}
