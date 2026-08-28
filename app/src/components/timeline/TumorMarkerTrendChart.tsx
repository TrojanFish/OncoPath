"use client";

import { useMemo, useState } from "react";
import { TestTube2, ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { TimelineEventItem } from "@/lib/timelineTypes";
import { TUMOR_MARKER_DEFINITIONS } from "@/lib/tumorMarkers";

interface TumorMarkerTrendChartProps {
  events: TimelineEventItem[];
  hoveredDate?: string | null;
  onHoverDate?: (date: string | null) => void;
}

export default function TumorMarkerTrendChart({ 
  events,
  hoveredDate,
  onHoverDate 
}: TumorMarkerTrendChartProps) {
  const [showBenignFactors, setShowBenignFactors] = useState(false);
  const [activeMarkerKey, setActiveMarkerKey] = useState<string>("cea");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Extract all serology events that have any keyFindings
  const allSerologyEvents = useMemo(() => {
    return events
      .filter((e) => e.category === "serology" && e.keyFindings)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [events]);

  // Discover which marker keys actually have data in the patient's timeline
  const availableMarkerKeys = useMemo(() => {
    const keys = new Set<string>();
    allSerologyEvents.forEach((e) => {
      if (e.keyFindings) {
        Object.keys(TUMOR_MARKER_DEFINITIONS).forEach((k) => {
          if ((e.keyFindings as any)[k] !== undefined && (e.keyFindings as any)[k] !== null) {
            keys.add(k);
          }
        });
      }
    });
    // Default to 'cea' if nothing found or ensure cea is first
    const list = Array.from(keys);
    return list.length > 0 ? list : ["cea"];
  }, [allSerologyEvents]);

  // Active definition
  const markerDef = TUMOR_MARKER_DEFINITIONS[activeMarkerKey] || TUMOR_MARKER_DEFINITIONS.cea;
  const CEILING = markerDef.refMax;

  // Filter points for active marker
  const markerPoints = useMemo(() => {
    return allSerologyEvents
      .filter((e) => (e.keyFindings as any)?.[activeMarkerKey] !== undefined && (e.keyFindings as any)?.[activeMarkerKey] !== null)
      .map((e) => ({
        date: e.eventDate,
        title: e.title,
        value: Number((e.keyFindings as any)[activeMarkerKey]),
      }));
  }, [allSerologyEvents, activeMarkerKey]);

  if (markerPoints.length === 0 && allSerologyEvents.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500 text-xs">
        暂无血清肿瘤标志物时序记录，录入抽血化验单后将自动生成多指标动态生理安全带波动图。
      </div>
    );
  }

  // Check if latest point is safe
  const latestPt = markerPoints[markerPoints.length - 1];
  const isLatestSafe = latestPt ? latestPt.value <= CEILING : true;

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 160;
  const paddingX = 45;
  const paddingY = 25;
  const maxValue = Math.max(CEILING * 1.3, ...(markerPoints.map((p) => p.value) || [CEILING])) * 1.15;

  const getX = (idx: number) => {
    if (markerPoints.length <= 1) return svgWidth / 2;
    return paddingX + (idx * (svgWidth - paddingX * 2)) / (markerPoints.length - 1);
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxValue, val));
    return svgHeight - paddingY - (clamped / maxValue) * (svgHeight - paddingY * 2);
  };

  const safeBandY = getY(CEILING);
  const bottomY = svgHeight - paddingY;

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-5 hover:border-indigo-300 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
              <TestTube2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                血清肿瘤标志物长程时序趋势与生理安全带
              </h3>
              <p className="text-[11px] text-slate-500">
                动态演进监测 · 区分良恶性与机体代谢波动（已支持 CEA、CYFRA21-1、NSE 等 9 项指标切换）
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* View Mode Toggle */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-2xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("chart")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "chart"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📊 趋势曲线
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📋 数据表格
            </button>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
            isLatestSafe 
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLatestSafe ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{isLatestSafe ? "最新指标处于生理代谢安全带" : "指标轻度偏高 · 建议随访"}</span>
          </span>
        </div>
      </div>

      {/* Marker Selection Tabs */}
      {availableMarkerKeys.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-0.5 no-scrollbar">
          {availableMarkerKeys.map((key) => {
            const def = TUMOR_MARKER_DEFINITIONS[key];
            if (!def) return null;
            const isActive = activeMarkerKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMarkerKey(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {def.nameZh.split(" ")[0]}
              </button>
            );
          })}
        </div>
      )}


      {/* Safety Band Golden Principle Reassurance Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
        <div className="font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-extrabold">
              {markerDef.nameZh} · 临床定心丸与代谢波动铁律
            </span>
          </div>
          <button 
            onClick={() => setShowBenignFactors(!showBenignFactors)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200"
          >
            <span>{showBenignFactors ? "收起良性因素" : "查看良性波动原因"}</span>
            {showBenignFactors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed font-medium">
          在正常参考区间（<strong>{markerDef.refRange}</strong>）内的任何微幅起伏，<strong>均属于人体自然生理代谢、饮食排毒与实验室批次正常波动，绝无复发或恶变意义，请完全放心！</strong>
        </p>

        {showBenignFactors && (
          <div className="pt-2.5 mt-2 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900 animate-fade-in">
            {markerDef.benignFactors.map((factor, idx) => (
              <div key={idx} className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                <span className="font-bold block text-emerald-800">📌 良性因素 {idx + 1}</span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Mode: Chart View */}
      {viewMode === "chart" && (
        <>
          {/* Visual Chart with Semi-Transparent Green Safety Band */}
          {markerPoints.length > 1 && (
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <span>📈 {markerDef.nameZh} 动态长程轨迹</span>
                  <span className="text-[10px] text-slate-400 font-normal">(绿色阴影为生理安全带 {markerDef.refRange})</span>
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                    <span>生理安全带</span>
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    <span>实测点</span>
                  </span>
                </div>
              </div>

              <div className="relative overflow-x-auto">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 min-w-[420px] overflow-visible">
                  {/* Semi-transparent Green Safety Band Area */}
                  <rect
                    x={paddingX}
                    y={safeBandY}
                    width={svgWidth - paddingX * 2}
                    height={bottomY - safeBandY}
                    fill="rgba(16, 185, 129, 0.08)"
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeDasharray="4 4"
                    rx="4"
                  />
                  <text
                    x={paddingX + 6}
                    y={safeBandY + 12}
                    fill="#059669"
                    fontSize="10"
                    fontWeight="bold"
                    className="select-none"
                  >
                    ✓ 生理代谢安全带 (≤ {CEILING} {markerDef.unit})
                  </text>

                  {/* Grid Baseline */}
                  <line
                    x1={paddingX}
                    y1={bottomY}
                    x2={svgWidth - paddingX}
                    y2={bottomY}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  {/* Trend Polyline */}
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={markerPoints.map((p, i) => `${getX(i)},${getY(p.value)}`).join(" ")}
                  />

                  {/* Data points with Crosshair Laser Line */}
                  {markerPoints.map((p, i) => {
                    const cx = getX(i);
                    const cy = getY(p.value);
                    const isPtSafe = p.value <= CEILING;
                    const isSyncedHover = Boolean(hoveredDate && (p.date === hoveredDate || p.date.slice(0, 7) === hoveredDate.slice(0, 7)));

                    return (
                      <g 
                        key={i} 
                        className="cursor-pointer"
                        onMouseEnter={() => onHoverDate?.(p.date)}
                        onMouseLeave={() => onHoverDate?.(null)}
                      >
                        {/* Vertical Laser Crosshair for Synced Date */}
                        {isSyncedHover && (
                          <>
                            <line
                              x1={cx}
                              y1={paddingY}
                              x2={cx}
                              y2={bottomY}
                              stroke="#6366f1"
                              strokeWidth="2"
                              strokeDasharray="3 3"
                            />
                            <circle
                              cx={cx}
                              cy={cy}
                              r="8"
                              fill="#6366f1"
                              fillOpacity="0.3"
                            />
                          </>
                        )}

                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSyncedHover ? "6.5" : "4.5"}
                          fill={isPtSafe ? "#10b981" : "#f59e0b"}
                          stroke={isSyncedHover ? "#4f46e5" : "#ffffff"}
                          strokeWidth={isSyncedHover ? "3" : "2"}
                        />
                        <text
                          x={cx}
                          y={cy - 10}
                          textAnchor="middle"
                          fontSize={isSyncedHover ? "11" : "10"}
                          fontWeight="bold"
                          fill={isSyncedHover ? "#4338ca" : isPtSafe ? "#047857" : "#b45309"}
                        >
                          {p.value}
                        </text>
                        <text
                          x={cx}
                          y={bottomY + 14}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight={isSyncedHover ? "bold" : "normal"}
                          fill={isSyncedHover ? "#4338ca" : "#64748b"}
                          fontFamily="monospace"
                        >
                          {p.date.slice(5)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* Grid Comparison Cards */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            onMouseLeave={() => onHoverDate?.(null)}
          >
            {markerPoints.map((pt, idx) => {
              const ratio = (pt.value / CEILING) * 100;
              const isSafe = pt.value <= CEILING;
              const isSyncedHover = Boolean(hoveredDate && (pt.date === hoveredDate || pt.date.slice(0, 7) === hoveredDate.slice(0, 7)));

              return (
                <div
                  key={idx}
                  onMouseEnter={() => onHoverDate?.(pt.date)}
                  className={`p-3.5 rounded-2xl border space-y-2 transition-all cursor-pointer ${
                    isSyncedHover
                      ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-300 shadow-md scale-102"
                      : "bg-slate-50 border-slate-200/70 hover:bg-white hover:border-indigo-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold font-mono ${isSyncedHover ? "text-indigo-900 underline" : "text-slate-800"}`}>
                      {pt.date}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSyncedHover 
                          ? "bg-indigo-600 text-white" 
                          : isSafe 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isSyncedHover ? "🔗 准线对齐" : isSafe ? "✓ 正常安全" : "轻度偏高"}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500 font-semibold">{markerDef.nameZh.split(" ")[0]}</span>
                      <span className={`text-sm font-extrabold font-mono ${isSafe ? "text-emerald-700" : "text-amber-700"}`}>
                        {pt.value} <span className="text-[10px] font-normal text-slate-400">{markerDef.unit}</span>
                      </span>
                    </div>

                    {/* Progress bar vs ceiling */}
                    <div className="w-full h-2 bg-emerald-50 border border-emerald-200/60 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isSafe ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                      <span>0</span>
                      <span className="font-bold text-emerald-600">安全线: {CEILING}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Mode: Table View (WCAG 2.1 AA Accessible Data Table) */}
      {viewMode === "table" && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">随访日期</th>
                <th className="px-4 py-3">化验检查项目</th>
                <th className="px-4 py-3">实测指标数值</th>
                <th className="px-4 py-3">正常参考区间</th>
                <th className="px-4 py-3">状态判定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {markerPoints.map((pt, idx) => {
                const isSafe = pt.value <= CEILING;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{pt.date}</td>
                    <td className="px-4 py-3 font-sans text-slate-700">{pt.title || markerDef.nameZh}</td>
                    <td className={`px-4 py-3 font-bold text-sm ${isSafe ? "text-emerald-700" : "text-amber-700"}`}>
                      {pt.value} {markerDef.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-sans">{markerDef.refRange}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${
                        isSafe ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {isSafe ? "✓ 处于安全带" : "⚠ 建议复查"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

