"use client";

import React, { useState } from "react";
import type { TumorMarkersData } from "@/lib/types";
import { evaluateTumorMarkers, TUMOR_MARKER_DEFINITIONS } from "@/lib/tumorMarkers";
import { GlossaryTooltip } from "@/components/common/GlossaryTooltip";

interface TumorMarkersCardProps {
  markers?: TumorMarkersData | null;
  onUpdateMarkers?: (newMarkers: TumorMarkersData) => void;
  isEditable?: boolean;
}

export function TumorMarkersCard({
  markers,
  onUpdateMarkers,
  isEditable = true
}: TumorMarkersCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<TumorMarkersData>(markers || {});

  const evaluations = evaluateTumorMarkers(markers);
  const hasData = evaluations.length > 0;

  const handleSave = () => {
    if (onUpdateMarkers) {
      onUpdateMarkers(editForm);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-5 hover:border-indigo-300 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base">🧪</span>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TUMOR BIOMARKERS · 血液肿瘤标志物监测与排雷
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            结构化分析 CEA、CYFRA21-1、NSE 等血检指标，排查生理性波动因素
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasData && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              已录入 {evaluations.length} 项生化指标
            </span>
          )}
          {isEditable && onUpdateMarkers && (
            <button
              type="button"
              onClick={() => {
                setEditForm(markers || {});
                setIsEditing(!isEditing);
              }}
              className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
            >
              {isEditing ? "取消" : hasData ? "修改指标" : "+ 录入血检化验单"}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {!hasData && !isEditing ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <div className="text-2xl">🩸</div>
          <div className="text-xs font-bold text-slate-800">暂未录入血液肿瘤标志物</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            若您的体检或就诊化验单中包含 <strong>CEA (癌胚抗原)</strong> 或 <strong>CYFRA21-1</strong>，可点击右上角录入，系统将为您自动进行良恶性排雷与生理波动定性。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Medical Principle Banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span>🛡️ 临床定心丸黄金铁律：</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed font-medium">
              在正常参考区间（如 CEA &lt; 5.0 ng/mL）内的任何数值变化均属于<strong>人体正常生理代谢波动</strong>（吸烟、轻微胃肠炎、感冒均可引起轻度起伏），绝不代表病情恶化或复发！临床决策始终以<strong>胸部薄层 CT 影像为金标准</strong>。
            </p>
          </div>

          {/* Marker Gauges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {evaluations.map((evalItem) => {
              const maxGauge = evalItem.refMax * 1.8;
              const percent = Math.min(100, (evalItem.value / maxGauge) * 100);
              const isNormal = evalItem.status === "normal";

              return (
                <div
                  key={evalItem.key}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <GlossaryTooltip term={evalItem.key === "cea" ? "CEA" : evalItem.key === "cyfra211" ? "CYFRA21-1" : "NSE"}>
                          <span>{evalItem.nameZh}</span>
                        </GlossaryTooltip>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">参考范围: {evalItem.refRange}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-black font-mono ${
                        isNormal ? "text-emerald-700" : "text-amber-700"
                      }`}>
                        {evalItem.value} <span className="text-xs font-normal text-slate-500">{evalItem.unit}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isNormal
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      }`}>
                        {evalItem.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Visual Range Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isNormal ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>0</span>
                      <span className="text-emerald-700 font-bold">参考上限: {evalItem.refMax}</span>
                      <span>{maxGauge.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Plain Language Reassurance */}
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
                    {evalItem.reassuranceText}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inline Edit Form */}
      {isEditing && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-3 animate-in fade-in">
          <div className="text-xs font-bold text-indigo-950 flex items-center justify-between">
            <span>📝 录入/修改血液肿瘤标志物数值</span>
            <span className="text-[11px] font-normal text-indigo-700">（未检测的项可留空）</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                CEA 癌胚抗原 (ng/mL，参考 0~5.0)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="例如 2.8"
                value={editForm.cea ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, cea: e.target.value ? parseFloat(e.target.value) : null })
                }
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                CYFRA21-1 (ng/mL，参考 0~3.3)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="例如 1.9"
                value={editForm.cyfra211 ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, cyfra211: e.target.value ? parseFloat(e.target.value) : null })
                }
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                NSE (ng/mL，参考 0~16.3)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="例如 12.4"
                value={editForm.nse ?? ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, nse: e.target.value ? parseFloat(e.target.value) : null })
                }
                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              保存标志物数据
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
