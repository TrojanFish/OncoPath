"use client";

import React, { useState } from "react";
import { TrendingUp, AlertTriangle, ShieldCheck, Lightbulb, Calendar, Layers, Activity } from "lucide-react";
import type { FollowUpRecord, PatientProfile } from "@/lib/types";
import { calculateVdtAndGrowth } from "@/lib/vdtCalculator";
import VdtGauge from "./VdtGauge";
import CtComparisonLens from "./CtComparisonLens";

interface NoduleTimelineChartProps {
  history?: FollowUpRecord[];
  profile?: PatientProfile | null;
}

export function NoduleTimelineChart({
  history = [],
  profile
}: NoduleTimelineChartProps) {
  const [activeTab, setActiveTab] = useState<"gauge" | "lens" | "chart">("gauge");

  // Build combined history dataset (including current profile if not in history)
  let combinedHistory = [...history];
  if (combinedHistory.length === 0 && profile?.tumorSize) {
    combinedHistory = [
      {
        id: "current_baseline",
        date: new Date().toISOString().split("T")[0],
        tumorSize: profile.tumorSize,
        solidSize: profile.solidSize ?? (profile.noduleType === "pure_ggo" ? 0 : 0.8),
        ctr: profile.ctr ?? 0.53,
        noduleType: profile.noduleType || "mixed_ggo",
        lungRads: profile.lungRads || undefined,
        note: "当前检查基线"
      }
    ];
  }

  // Sort chronologically
  const sortedHistory = [...combinedHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const vdtAnalysis = calculateVdtAndGrowth(
    sortedHistory,
    profile?.tumorSize,
    profile?.solidSize,
    profile?.ctr
  );

  // SVG Chart Geometry
  const svgWidth = 540;
  const svgHeight = 180;
  const paddingX = 45;
  const paddingY = 25;

  const maxTumor = Math.max(2.5, ...sortedHistory.map((h) => h.tumorSize || 1.5)) * 1.15;

  const getX = (index: number) => {
    if (sortedHistory.length <= 1) return svgWidth / 2;
    return paddingX + (index * (svgWidth - paddingX * 2)) / (sortedHistory.length - 1);
  };

  const getY = (valCm: number) => {
    const clamped = Math.max(0, Math.min(maxTumor, valCm));
    return svgHeight - paddingY - (clamped / maxTumor) * (svgHeight - paddingY * 2);
  };

  // Generate Path D
  const tumorPoints = sortedHistory.map((h, i) => `${getX(i)},${getY(h.tumorSize)}`).join(" ");
  const solidPoints = sortedHistory.map((h, i) => `${getX(i)},${getY(h.solidSize || 0)}`).join(" ");

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-5 hover:border-sky-300 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              LONGITUDINAL CT TIMELINE · 结节随访时序生长轨迹
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            动态测算历次 CT 结节体积倍增时间 (VDT) 与双期实性浸润演变透视
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            vdtAnalysis.growthCategory === "active_growth"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : vdtAnalysis.growthCategory === "slow_indolent"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}>
            {vdtAnalysis.categoryLabel}
          </span>
          <span className="text-[11px] text-slate-400 font-medium px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full">
            已归档 {sortedHistory.length} 次检查
          </span>
        </div>
      </div>

      {/* VDT Interpretation Banner */}
      <div className={`p-4 rounded-2xl border ${
        vdtAnalysis.growthCategory === "active_growth"
          ? "bg-rose-50/80 border-rose-200 text-rose-950"
          : vdtAnalysis.growthCategory === "slow_indolent"
          ? "bg-amber-50/80 border-amber-200 text-amber-950"
          : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
      }`}>
        <div className="flex items-start gap-2.5 text-xs">
          <span className="mt-0.5">
            {vdtAnalysis.growthCategory === "active_growth" ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
          </span>
          <div className="space-y-1">
            <div className="font-extrabold text-slate-900">
              {vdtAnalysis.clinicalInterpretation}
            </div>
            <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span><strong>临床指引</strong>：{vdtAnalysis.actionGuidance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("gauge")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gauge"
              ? "bg-white text-sky-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>VDT 速度仪表盘</span>
        </button>

        <button
          onClick={() => setActiveTab("lens")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "lens"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>双期 CT 对比透视器</span>
        </button>

        <button
          onClick={() => setActiveTab("chart")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "chart"
              ? "bg-white text-indigo-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>长程生长趋势曲线</span>
        </button>
      </div>

      {/* Tab 1: VDT Speedometer Gauge */}
      {activeTab === "gauge" && (
        <VdtGauge
          vdtDays={vdtAnalysis.vdtDays}
          growthCategory={vdtAnalysis.growthCategory}
          categoryLabel={vdtAnalysis.categoryLabel}
          recordCount={sortedHistory.length}
          sizeChangeMm={vdtAnalysis.sizeChangeMm}
        />
      )}

      {/* Tab 2: Dual-Phase Comparative Lens */}
      {activeTab === "lens" && (
        <CtComparisonLens records={sortedHistory} profile={profile} />
      )}

      {/* Tab 3: Full SVG Growth Chart */}
      {activeTab === "chart" && (
        <div className="relative bg-slate-950 rounded-2xl p-3 sm:p-4 overflow-hidden border border-slate-800 shadow-inner space-y-2">
          {/* Legends */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 pb-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>结节全径 (Tumor Size)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span>实性成分 (Solid Core)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500">单位: 厘米 (cm)</div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-44 min-w-[480px] overflow-visible"
            >
              {/* Grid Lines */}
              {[0.5, 1.0, 1.5, 2.0, 3.0].map((level) => {
                if (level > maxTumor) return null;
                const y = getY(level);
                return (
                  <g key={level}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {level}cm
                    </text>
                  </g>
                );
              })}

              {/* Area Fill for Solid Core */}
              {sortedHistory.length > 1 && (
                <polygon
                  points={`${getX(0)},${svgHeight - paddingY} ${solidPoints} ${getX(
                    sortedHistory.length - 1
                  )},${svgHeight - paddingY}`}
                  fill="url(#solidGradient)"
                  opacity="0.25"
                />
              )}

              <defs>
                <linearGradient id="solidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Polyline: Total Tumor Size */}
              {sortedHistory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={tumorPoints}
                />
              )}

              {/* Polyline: Solid Component */}
              {sortedHistory.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="5 3"
                  points={solidPoints}
                />
              )}

              {/* Data Node Anchors */}
              {sortedHistory.map((record, index) => {
                const x = getX(index);
                const yTumor = getY(record.tumorSize);
                const ySolid = getY(record.solidSize || 0);

                return (
                  <g key={record.id || index}>
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={paddingY}
                      x2={x}
                      y2={svgHeight - paddingY}
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />

                    {/* Tumor Circle Point */}
                    <circle
                      cx={x}
                      cy={yTumor}
                      r="5"
                      fill="#38bdf8"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={yTumor - 9}
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {record.tumorSize}cm
                    </text>

                    {/* Solid Core Circle Point */}
                    <circle
                      cx={x}
                      cy={ySolid}
                      r="4"
                      fill="#2dd4bf"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={ySolid + 15}
                      fill="#2dd4bf"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      实性:{record.solidSize || 0}
                    </text>

                    {/* Date Label */}
                    <text
                      x={x}
                      y={svgHeight - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {record.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* History Node List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>历次随访检查节点明细：</span>
          </span>
          {sortedHistory.length <= 1 && (
            <span className="text-[11px] font-normal text-slate-400">
              （如需补录往年老片，可点击页面顶部【修改/校准临床档案】）
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {sortedHistory.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{item.date}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-semibold">
                    CTR: {item.ctr != null ? (item.ctr * 100).toFixed(0) : "0"}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  全径: <strong>{(item.tumorSize * 10).toFixed(0)}mm</strong> | 实性:{" "}
                  <strong>{((item.solidSize || 0) * 10).toFixed(0)}mm</strong>
                  {item.note && ` · ${item.note}`}
                </div>
              </div>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                已核验
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
