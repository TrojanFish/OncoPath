"use client";

import React, { useState } from "react";
import type { FollowUpRecord, PatientProfile } from "@/lib/types";
import { calculateVdtAndGrowth } from "@/lib/vdtCalculator";

interface NoduleTimelineChartProps {
  history?: FollowUpRecord[];
  profile?: PatientProfile | null;
  onUpdateHistory?: (newHistory: FollowUpRecord[]) => void;
  isEditable?: boolean;
}

export function NoduleTimelineChart({
  history = [],
  profile,
  onUpdateHistory,
  isEditable = true
}: NoduleTimelineChartProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTumorSize, setNewTumorSize] = useState("");
  const [newSolidSize, setNewSolidSize] = useState("");
  const [newNote, setNewNote] = useState("");

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
        note: "当前检查记录"
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

  const handleAddRecord = () => {
    if (!newDate || !newTumorSize) return;
    const tumorSizeVal = parseFloat(newTumorSize);
    const solidSizeVal = newSolidSize ? parseFloat(newSolidSize) : 0;
    const ctrVal = tumorSizeVal > 0 ? Math.min(1, Math.round((solidSizeVal / tumorSizeVal) * 100) / 100) : 0;

    const record: FollowUpRecord = {
      id: Math.random().toString(36).substring(2, 9),
      date: newDate,
      tumorSize: tumorSizeVal,
      solidSize: solidSizeVal,
      ctr: ctrVal,
      note: newNote || "历史随访复查"
    };

    const updated = [...history, record].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (onUpdateHistory) {
      onUpdateHistory(updated);
    }

    setIsAddingNew(false);
    setNewDate("");
    setNewTumorSize("");
    setNewSolidSize("");
    setNewNote("");
  };

  const handleDeleteRecord = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    if (onUpdateHistory) {
      onUpdateHistory(updated);
    }
  };

  // SVG Chart Geometry
  const svgWidth = 540;
  const svgHeight = 180;
  const paddingX = 45;
  const paddingY = 25;

  const maxTumor = Math.max(2.5, ...sortedHistory.map((h) => h.tumorSize || 1.5)) * 1.15;
  const minTumor = 0;

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
            <span className="text-base">📈</span>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              LONGITUDINAL CT TIMELINE · 结节随访时序生长轨迹
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            动态测算历次 CT 结节体积倍增时间 (VDT) 与实性浸润演变趋势
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
          {isEditable && onUpdateHistory && !isAddingNew && (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
            >
              + 补录历史老片
            </button>
          )}
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
          <span className="text-base mt-0.5">
            {vdtAnalysis.growthCategory === "active_growth" ? "⚠️" : "🛡️"}
          </span>
          <div className="space-y-1">
            <div className="font-extrabold text-slate-900">
              {vdtAnalysis.clinicalInterpretation}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              💡 <strong>临床指引</strong>：{vdtAnalysis.actionGuidance}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Growth Chart */}
      <div className="relative bg-slate-950 rounded-2xl p-3 sm:p-4 overflow-hidden border border-slate-800 shadow-inner">
        {/* Legends */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 pb-2">
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
          <div>单位: 厘米 (cm)</div>
        </div>

        {/* SVG Viewport */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-40 select-none"
          >
            {/* Grid horizontal lines */}
            {[0.5, 1.0, 1.5, 2.0].map((val) => (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={getY(val)}
                  x2={svgWidth - paddingX}
                  y2={getY(val)}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={paddingX - 8}
                  y={getY(val) + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            ))}

            {/* Path: Total Tumor Size */}
            {sortedHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={tumorPoints}
              />
            )}

            {/* Path: Solid Component */}
            {sortedHistory.length > 1 && (
              <polyline
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2"
                strokeDasharray="4 2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={solidPoints}
              />
            )}

            {/* Data Nodes (Points & Badges) */}
            {sortedHistory.map((record, index) => {
              const x = getX(index);
              const yTumor = getY(record.tumorSize);
              const ySolid = getY(record.solidSize || 0);

              return (
                <g key={record.id || index}>
                  {/* Vertical Guideline */}
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={svgHeight - paddingY}
                    stroke="#475569"
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                  />

                  {/* Solid Point */}
                  <circle cx={x} cy={ySolid} r="4" fill="#2dd4bf" stroke="#0f172a" strokeWidth="2" />
                  
                  {/* Tumor Point */}
                  <circle cx={x} cy={yTumor} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />

                  {/* Size Label */}
                  <text
                    x={x}
                    y={yTumor - 8}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {(record.tumorSize * 10).toFixed(0)}mm
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

      {/* History Node List & Management */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-700">📅 随访节点明细清单：</div>
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
              {isEditable && onUpdateHistory && history.some((h) => h.id === item.id) && (
                <button
                  type="button"
                  onClick={() => handleDeleteRecord(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer"
                  title="删除该条记录"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Record Modal / Form */}
      {isAddingNew && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-sky-950 flex items-center justify-between">
            <span>📝 补录历史 CT 影像节点</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-slate-700 text-xs"
            >
              取消
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">检查日期</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">结节全径 (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="例如 0.8"
                value={newTumorSize}
                onChange={(e) => setNewTumorSize(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">实性成分 (cm，纯磨玻璃填0)</label>
              <input
                type="number"
                step="0.1"
                placeholder="例如 0"
                value={newSolidSize}
                onChange={(e) => setNewSolidSize(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">备注说明 (选填)</label>
            <input
              type="text"
              placeholder="例如：2023年体检首次发现，边界清晰"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleAddRecord}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              保存并加入生长曲线
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
