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
    <div className="bg-slate-50/80 rounded-2xl p-3.5 sm:p-5 border border-slate-200 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-4 h-4 text-sky-600" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
              VDT 肿瘤倍增时间仪表盘 (Schwartz 模型)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono block truncate">
              基于历次薄层 CT 三维体积测算结节生长速度
            </span>
          </div>
        </div>

        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto shrink-0 whitespace-nowrap ${
          isSafe
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-rose-50 text-rose-800 border-rose-200"
        }`}>
          {categoryLabel}
        </span>
      </div>

      {/* SVG Semi-Circle Gauge */}
      <div className="flex flex-col items-center justify-center pt-2">
        <div className="relative w-64 h-32 overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 240 130" className="w-full h-full">
            {/* Base Background Track: Light Slate */}
            <path
              d="M 35 115 A 85 85 0 0 1 205 115"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Arc Zone 1: Fast Growth (Rose Red, 0% ~ 25%) */}
            <path
              d="M 35 115 A 85 85 0 0 1 59.9 54.9"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Arc Zone 2: Moderate Evolution (Amber, 25% ~ 50%) */}
            <path
              d="M 59.9 54.9 A 85 85 0 0 1 120 30"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="14"
            />

            {/* Arc Zone 3: Slow Indolent (Teal, 50% ~ 75%) */}
            <path
              d="M 120 30 A 85 85 0 0 1 180.1 54.9"
              fill="none"
              stroke="#14b8a6"
              strokeWidth="14"
            />

            {/* Arc Zone 4: Ultra-Stable & Shrinking (Emerald, 75% ~ 100%) */}
            <path
              d="M 180.1 54.9 A 85 85 0 0 1 205 115"
              fill="none"
              stroke="#10b981"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Subtle Divider Tick Lines on Arc */}
            <line x1="59.9" y1="54.9" x2="55.9" y2="45.2" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="120" y1="30" x2="120" y2="19.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="180.1" y1="54.9" x2="184.1" y2="45.2" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

            {/* Needle Pivot Hub Shadow */}
            <circle cx="120" cy="115" r="10" fill="#0f172a" fillOpacity="0.1" />

            {/* Animated Needle */}
            <g
              transform={`rotate(${needleAngle}, 120, 115)`}
              className="transition-transform duration-700 ease-out"
            >
              {/* Needle Body */}
              <line
                x1="120"
                y1="115"
                x2="120"
                y2="42"
                stroke="#0f172a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Pointer Tip */}
              <polygon points="117,50 123,50 120,34" fill="#0f172a" />
            </g>

            {/* Needle Center Hub */}
            <circle cx="120" cy="115" r="8" fill="#0f172a" />
            <circle cx="120" cy="115" r="3.5" fill="#ffffff" />
          </svg>
        </div>

        {/* Gauge Scale Labels */}
        <div className="w-full max-w-[270px] flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-bold px-1 -mt-1">
          <span className="text-rose-600 flex items-center gap-0.5 shrink-0">
            <span>●</span> 活跃(&lt;365天)
          </span>
          <span className="text-amber-600 px-1 shrink-0">中度观察</span>
          <span className="text-emerald-700 flex items-center gap-0.5 shrink-0">
            稳定(&gt;800天) <span>●</span>
          </span>
        </div>
      </div>

      {/* Numerical Readout Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center pt-1 border-t border-slate-200/70">
        <div className="bg-white p-2 rounded-xl border border-slate-100 min-w-0">
          <div className="text-[10px] text-slate-400 truncate">测算倍增时间</div>
          <div className="text-xs sm:text-sm font-black font-mono text-slate-900 truncate">
            {growthCategory === "shrinking"
              ? "吸收缩小"
              : growthCategory === "stable"
              ? "> 800 天"
              : vdtDays !== null
              ? `${Math.round(vdtDays)} 天`
              : "基线单次"}
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-100 min-w-0">
          <div className="text-[10px] text-slate-400 truncate">实性/总径变化</div>
          <div className={`text-xs sm:text-sm font-black font-mono truncate ${sizeChangeMm > 0 ? "text-amber-700" : sizeChangeMm < 0 ? "text-emerald-700" : "text-slate-900"}`}>
            {sizeChangeMm > 0 ? `+${sizeChangeMm} mm` : sizeChangeMm < 0 ? `${sizeChangeMm} mm` : "0.0 mm"}
          </div>
        </div>

        <div className="bg-white p-2 rounded-xl border border-slate-100 min-w-0">
          <div className="text-[10px] text-slate-400 truncate">随访跨度</div>
          <div className="text-xs sm:text-sm font-black font-mono text-slate-900 truncate">
            {recordCount > 1 ? `${recordCount} 次检查` : "首次基线"}
          </div>
        </div>
      </div>
    </div>
  );
}
