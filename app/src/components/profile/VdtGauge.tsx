"use client";

import React from "react";
import { Activity, ShieldCheck, AlertTriangle, Clock } from "lucide-react";

interface VdtGaugeProps {
  vdtDays: number | null;
  growthCategory: string;
  categoryLabel: string;
  recordCount: number;
  sizeChangeMm?: number;
}

export default function VdtGauge({
  vdtDays,
  growthCategory,
  categoryLabel,
  recordCount,
  sizeChangeMm = 0,
}: VdtGaugeProps) {
  // Normalize VDT days to Gauge percentage (0 to 100)
  // VDT < 200 => 10% (High risk fast growth)
  // VDT = 365 => 30% (Threshold for active growth)
  // VDT = 400 => 45% (Moderate evolution)
  // VDT = 600 => 65% (Indolent slow evolution)
  // VDT >= 800 or stable / shrinking => 90% (Extremely indolent / stable)
  let gaugePercent = 85;
  if (growthCategory === "shrinking" || growthCategory === "stable") {
    gaugePercent = 90;
  } else if (vdtDays !== null) {
    if (vdtDays < 180) gaugePercent = 12;
    else if (vdtDays < 365) gaugePercent = 20 + ((vdtDays - 180) / 185) * 15;
    else if (vdtDays < 400) gaugePercent = 35 + ((vdtDays - 365) / 35) * 15;
    else if (vdtDays < 800) gaugePercent = 50 + ((vdtDays - 400) / 400) * 30;
    else gaugePercent = Math.min(95, 80 + ((vdtDays - 800) / 400) * 15);
  }

  // Needle angle: -140 deg (left/active) to +40 deg (right/stable)
  // Or SVG semi-circle from 180 deg to 0 deg
  const needleAngle = -90 + (gaugePercent / 100) * 180;

  const isSafe = growthCategory === "stable" || growthCategory === "shrinking" || (vdtDays !== null && vdtDays >= 400);

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              VDT 肿瘤倍增时间仪表盘 (Schwartz 动力学模型)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              基于历次薄层 CT 三维体积测算结节生长速度
            </span>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          isSafe
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {categoryLabel}
        </span>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative w-56 h-28 overflow-hidden">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background Arc: Red (Fast growth 0-30%) */}
            <path
              d="M 20 100 A 80 80 0 0 1 56 44"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Background Arc: Amber (Moderate 30-50%) */}
            <path
              d="M 58 42 A 80 80 0 0 1 100 20"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="14"
            />
            {/* Background Arc: Light Green (Slow Indolent 50-75%) */}
            <path
              d="M 102 20 A 80 80 0 0 1 144 42"
              fill="none"
              stroke="#34d399"
              strokeWidth="14"
            />
            {/* Background Arc: Emerald Green (Ultra-stable / Shrinking 75-100%) */}
            <path
              d="M 146 44 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Needle Pivot Base */}
            <circle cx="100" cy="100" r="8" fill="#1e293b" />
            <circle cx="100" cy="100" r="4" fill="#ffffff" />

            {/* Needle */}
            <g transform={`rotate(${needleAngle}, 100, 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="34"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <polygon points="97,42 103,42 100,28" fill="#0f172a" />
            </g>
          </svg>
        </div>

        {/* Gauge Scale Labels */}
        <div className="w-56 flex justify-between text-[10px] text-slate-400 font-bold px-1 -mt-1">
          <span className="text-rose-600">活跃倍增(&lt;365天)</span>
          <span className="text-amber-600">中度观察</span>
          <span className="text-emerald-700">惰性稳定(&gt;800天)</span>
        </div>
      </div>

      {/* Numerical Readout Grid */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200/70">
        <div className="bg-white p-2 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-400">测算倍增时间</div>
          <div className="text-sm font-black font-mono text-slate-900">
            {growthCategory === "shrinking"
              ? "吸收缩小"
              : growthCategory === "stable"
              ? "> 800 天"
              : vdtDays !== null
              ? `${Math.round(vdtDays)} 天`
              : "基线单次"}
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-400">实性/总径变化</div>
          <div className={`text-sm font-black font-mono ${sizeChangeMm > 0 ? "text-amber-700" : sizeChangeMm < 0 ? "text-emerald-700" : "text-slate-900"}`}>
            {sizeChangeMm > 0 ? `+${sizeChangeMm} mm` : sizeChangeMm < 0 ? `${sizeChangeMm} mm` : "0.0 mm"}
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-100">
          <div className="text-[10px] text-slate-400">随访跨度</div>
          <div className="text-sm font-black font-mono text-slate-900">
            {recordCount > 1 ? `${recordCount} 次检查` : "首次基线"}
          </div>
        </div>
      </div>
    </div>
  );
}
