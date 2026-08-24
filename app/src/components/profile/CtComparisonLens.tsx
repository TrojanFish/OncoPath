"use client";

import React, { useState, useMemo } from "react";
import { Layers, ArrowRight, TrendingUp, TrendingDown, Minus, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import type { FollowUpRecord, PatientProfile } from "@/lib/types";

interface CtComparisonLensProps {
  records: FollowUpRecord[];
  profile?: PatientProfile | null;
}

export default function CtComparisonLens({ records, profile }: CtComparisonLensProps) {
  // Normalize records
  const allRecords = useMemo(() => {
    let list = [...records];
    if (list.length === 0 && profile?.tumorSize) {
      list = [
        {
          id: "baseline",
          date: new Date().toISOString().split("T")[0],
          tumorSize: profile.tumorSize,
          solidSize: profile.solidSize ?? (profile.noduleType === "pure_ggo" ? 0 : 0.8),
          ctr: profile.ctr ?? 0.53,
          noduleType: profile.noduleType || "mixed_ggo",
          note: "当前基线 CT"
        }
      ];
    }
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, profile]);

  const [baseIndex, setBaseIndex] = useState<number>(0);
  const [targetIndex, setTargetIndex] = useState<number>(Math.max(0, allRecords.length - 1));

  if (allRecords.length < 2) {
    return (
      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 text-center space-y-2">
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Layers className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-800">双期 CT 征象前后对比透视器</h4>
        <p className="text-[11px] text-slate-500 max-w-md mx-auto">
          当前已录入 {allRecords.length} 次 CT 检查。当您录入 2 次及以上随访记录后，系统将自动开启双期滑动对比，直观呈现磨玻璃结节实性成分与 CTR 演进轨迹。
        </p>
      </div>
    );
  }

  const baseRecord = allRecords[baseIndex] || allRecords[0];
  const targetRecord = allRecords[targetIndex] || allRecords[allRecords.length - 1];

  // Calculations
  const diffDays = Math.max(
    1,
    Math.round(
      (new Date(targetRecord.date).getTime() - new Date(baseRecord.date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const diffMonths = (diffDays / 30.4).toFixed(1);

  const tumorBaseMm = (baseRecord.tumorSize || 0) * 10;
  const tumorTargetMm = (targetRecord.tumorSize || 0) * 10;
  const tumorDiffMm = +(tumorTargetMm - tumorBaseMm).toFixed(1);

  const solidBaseMm = (baseRecord.solidSize || 0) * 10;
  const solidTargetMm = (targetRecord.solidSize || 0) * 10;
  const solidDiffMm = +(solidTargetMm - solidBaseMm).toFixed(1);

  const ctrBase = baseRecord.ctr ?? (tumorBaseMm > 0 ? solidBaseMm / tumorBaseMm : 0);
  const ctrTarget = targetRecord.ctr ?? (tumorTargetMm > 0 ? solidTargetMm / tumorTargetMm : 0);
  const ctrDiff = +(ctrTarget - ctrBase).toFixed(2);

  // Clinical Evolution Interpretation
  const isShrinking = tumorDiffMm <= -1.5;
  const isStable = Math.abs(tumorDiffMm) <= 1.0 && Math.abs(solidDiffMm) <= 0.8;
  const isActive = solidDiffMm >= 2.0 || ctrDiff >= 0.25;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
      {/* Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">
              双期 CT 征象前后对比透视器 (Split Comparative Lens)
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              对比间隔：{diffDays} 天 (约 {diffMonths} 个月)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">基线期:</span>
            <select
              value={baseIndex}
              onChange={(e) => setBaseIndex(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {allRecords.map((r, i) => (
                <option key={i} value={i} disabled={i >= targetIndex}>
                  {r.date} ({r.tumorSize}cm)
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium">随访期:</span>
            <select
              value={targetIndex}
              onChange={(e) => setTargetIndex(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 cursor-pointer"
            >
              {allRecords.map((r, i) => (
                <option key={i} value={i} disabled={i <= baseIndex}>
                  {r.date} ({r.tumorSize}cm)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dual Phase Contrast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1: Tumor Size (Total Diameter) */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">磨玻璃最大总径</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              tumorDiffMm > 0 ? "bg-amber-100 text-amber-800" : tumorDiffMm < 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
            }`}>
              {tumorDiffMm > 0 ? `+${tumorDiffMm} mm` : tumorDiffMm < 0 ? `${tumorDiffMm} mm` : "稳定 0mm"}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-slate-900 font-mono">
            <span className="text-xs text-slate-500">{baseRecord.tumorSize} cm</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-black">{targetRecord.tumorSize} cm</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${tumorDiffMm > 0 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(100, (targetRecord.tumorSize / Math.max(3, targetRecord.tumorSize * 1.2)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Solid Invasive Component Size */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">CT 实性浸润成分</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              solidDiffMm >= 2.0 ? "bg-rose-100 text-rose-800" : solidDiffMm > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {solidDiffMm > 0 ? `+${solidDiffMm} mm` : solidDiffMm < 0 ? `${solidDiffMm} mm` : "稳定 0mm"}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-slate-900 font-mono">
            <span className="text-xs text-slate-500">{baseRecord.solidSize ?? 0} cm</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-black text-teal-700">{targetRecord.solidSize ?? 0} cm</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${solidDiffMm >= 2.0 ? "bg-rose-500" : "bg-teal-500"}`}
              style={{ width: `${Math.min(100, ((targetRecord.solidSize || 0) / 2.5) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Consolidation-to-Tumor Ratio (CTR) */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">CTR 实性占比</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              ctrDiff >= 0.2 ? "bg-rose-100 text-rose-800" : ctrDiff > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {ctrDiff > 0 ? `+${Math.round(ctrDiff * 100)}%` : ctrDiff < 0 ? `${Math.round(ctrDiff * 100)}%` : "持平"}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-slate-900 font-mono">
            <span className="text-xs text-slate-500">{Math.round(ctrBase * 100)}%</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-sm font-black text-indigo-700">{Math.round(ctrTarget * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${Math.min(100, ctrTarget * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Clinical Guidance Interpretation Alert */}
      <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
        isShrinking
          ? "bg-emerald-50 text-emerald-950 border-emerald-200"
          : isStable
          ? "bg-sky-50 text-sky-950 border-sky-200"
          : isActive
          ? "bg-rose-50 text-rose-950 border-rose-200"
          : "bg-amber-50 text-amber-950 border-amber-200"
      }`}>
        {isShrinking ? (
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        ) : isStable ? (
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        )}
        <div>
          <span className="font-bold">
            {isShrinking
              ? "🎯 提示良性炎性吸收缩小："
              : isStable
              ? "🌿 提示病灶高度惰性稳定："
              : isActive
              ? "⚡ 提示病灶进入活跃生长期："
              : "⏳ 提示病灶存在缓慢演进："}
          </span>
          <span className="ml-1">
            {isShrinking
              ? `历经 ${diffMonths} 个月随访，结节总径缩小了 ${Math.abs(tumorDiffMm)} mm，强烈提示炎性吸收渗出，恶性概率极低。`
              : isStable
              ? `在 ${diffMonths} 个月随访周期内，实性成分与总径波动均在 1mm 以内，符合典型惰性腺泡/贴壁生长特征，建议遵医嘱按年度常规随访。`
              : isActive
              ? `随访显示实性成分增长达到 ${solidDiffMm} mm (或 CTR 显著提升)，建议携带薄层 CT 影像至胸外科门诊，评估是否探讨微创胸腔镜肺段/肺叶切除指征。`
              : `结节在 ${diffMonths} 个月内呈现轻微增长，建议缩短薄层 CT 复查间隔至 3~6 个月，密切动态监测实性成分是否进一步增粗。`}
          </span>
        </div>
      </div>
    </div>
  );
}
