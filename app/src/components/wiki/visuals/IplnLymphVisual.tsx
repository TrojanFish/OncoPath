"use client";

import React from "react";
import { ShieldCheck, Info, Check } from "lucide-react";

export function IplnLymphVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>胸膜下微结节 / 肺内正常淋巴结 (IPLN) 原理解析</span>
        </span>
        <span className="text-[10px] text-slate-400">良性生理结构</span>
      </div>

      <svg viewBox="0 0 200 100" className="w-full h-auto">
        <rect width="200" height="100" fill="#0b1120" rx="8" />

        {/* Visceral Pleura Surface */}
        <line x1="10" y1="80" x2="190" y2="80" stroke="#0ea5e9" strokeWidth="2" />
        <text x="100" y="92" textAnchor="middle" fill="#38bdf8" fontSize="4.5" fontWeight="bold">
          脏层胸膜 (肺表面)
        </text>

        {/* Subpleural IPLN Lymph Node: Lentiform / Triangular / Polygon < 6mm */}
        <g transform="translate(100, 72)">
          {/* Triangular/Lentiform Polygon */}
          <polygon
            points="0,-12 14,4 -14,4"
            fill="#059669"
            stroke="#34d399"
            strokeWidth="1.2"
          />
          {/* Internal lymphatic capsule marker */}
          <circle cx="0" cy="-2" r="2" fill="#a7f3d0" />
          <text x="0" y="-16" textAnchor="middle" fill="#a7f3d0" fontSize="5" fontWeight="bold">
            正常小淋巴结 (3~5mm)
          </text>
          <text x="0" y="2" textAnchor="middle" fill="#022c22" fontSize="3.5" fontWeight="bold">
            IPLN
          </text>
        </g>

        {/* Benign Characteristic Tag Box */}
        <g transform="translate(10, 15)">
          <rect width="78" height="42" fill="#1e293b" opacity="0.6" rx="4" />
          <text x="5" y="10" fill="#34d399" fontSize="4.5" fontWeight="bold">
            常见良性特征：
          </text>
          <text x="5" y="19" fill="#94a3b8" fontSize="3.8">
            • 紧贴胸膜下(&lt;10mm)或叶间裂
          </text>
          <text x="5" y="27" fill="#94a3b8" fontSize="3.8">
            • 扁豆形 / 三角形 / 菱形边缘
          </text>
          <text x="5" y="35" fill="#94a3b8" fontSize="3.8">
            • 边界极清，常伴细引流线
          </text>
        </g>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        <span className="inline-flex items-center gap-1 font-bold text-emerald-300 mr-1">
          <Info className="w-3.5 h-3.5" />
          <span>图解要点：</span>
        </span>
        肺内淋巴结（IPLN）是人体正常的免疫哨所，<strong>天生就紧贴在肺表面胸膜下或叶间裂附近</strong>。在 CT 切面上常呈“小扁豆”或“三角形”，绝大多数在 3~5mm 以内，完全属于无害的正常生理结构，绝非胸膜转移。
      </div>
    </div>
  );
}
