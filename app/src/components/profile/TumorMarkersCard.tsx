"use client";

import React, { useState } from "react";

import { TestTube2, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, ArrowRight, Calendar, Building2 } from "lucide-react";
import Link from "next/link";
import type { TumorMarkersData } from "@/lib/types";
import { evaluateTumorMarkers } from "@/lib/tumorMarkers";
import { GlossaryTooltip } from "@/components/common/GlossaryTooltip";

interface TumorMarkersCardProps {
  markers?: TumorMarkersData | null;
}

export function TumorMarkersCard({
  markers
}: TumorMarkersCardProps) {
  const [showFactors, setShowFactors] = useState(false);
  const evaluations = evaluateTumorMarkers(markers);
  const hasData = evaluations.length > 0;
  const isAllNormal = hasData && evaluations.every((item) => item.status === "normal");

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200 border-t-4 border-t-indigo-500 shadow-sm space-y-5 hover:border-indigo-300 transition-all">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
              <TestTube2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-extrabold text-slate-900">
                  TUMOR BIOMARKERS · 最新单期血清肿瘤标志物排雷
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  当前快照
                </span>
                {markers?.testDate && (
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{markers.testDate}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                包含 CEA、CYFRA21-1、NSE、SCC、ProGRP、CA125、CA19-9、CA15-3 等 9 项全指标生理安全带
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {hasData && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isAllNormal 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}>
              {isAllNormal ? "✓ 全部处于生理安全带" : `已录入 ${evaluations.length} 项生化指标`}
            </span>
          )}
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200 cursor-pointer"
          >
            <span>历次化验趋势</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>


      {/* Main Content */}
      {!hasData ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <div className="flex justify-center mb-1">
            <TestTube2 className="w-8 h-8 text-slate-400" />
          </div>
          <div className="text-xs font-bold text-slate-800">暂未录入血液肿瘤标志物</div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            若您的体检或就诊化验单中包含 <strong>CEA (癌胚抗原)</strong>、<strong>CYFRA21-1</strong> 或 <strong>NSE</strong>，可点击页面顶部【修改/校准临床档案】进行录入，系统将为您自动进行良恶性排雷与生理波动定性。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Key Medical Principle Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
            <div className="font-bold flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 font-extrabold">临床定心丸黄金铁律：</span>
              </div>
              <button 
                onClick={() => setShowFactors(!showFactors)}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200"
              >
                <span>{showFactors ? "收起良性排查" : "查看良性波动原因"}</span>
                {showFactors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed font-medium">
              在正常参考区间（如 CEA &lt; 5.0 ng/mL，CYFRA21-1 &lt; 3.3 ng/mL）内的任何轻微数值起伏，<strong>均属于人体正常生理代谢波动</strong>（吸烟、轻微胃肠炎、感冒均可引起轻度起伏），绝不代表病情恶化或复发！临床决策始终以<strong>胸部薄层 CT 影像为金标准</strong>。
            </p>

            {showFactors && (
              <div className="pt-2.5 mt-2 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900 animate-fade-in">
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold block text-emerald-800">🚬 吸烟与生活习惯</span>
                  <span>长期吸烟者 CEA 生理基线通常为 3.0~5.0 ng/mL，属正常良性状态。</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold block text-emerald-800">🫁 呼吸道与消化道炎症</span>
                  <span>支气管炎、胃炎、结肠息肉均可能引起 CYFRA21-1 或 CEA 轻微上浮。</span>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                  <span className="font-bold block text-emerald-800">🧪 检验机台批次差</span>
                  <span>不同医院化验设备及检测试剂存在 ±1.0 ng/mL 正常系统误差。</span>
                </div>
              </div>
            )}
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
                  className={`p-4 rounded-2xl border space-y-2.5 transition-all ${
                    isNormal 
                      ? "bg-slate-50/80 border-slate-200 hover:border-emerald-300" 
                      : "bg-amber-50/40 border-amber-200 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <GlossaryTooltip term={evalItem.key === "cea" ? "CEA" : evalItem.key === "cyfra211" ? "CYFRA21-1" : "NSE"}>
                          <span>{evalItem.nameZh}</span>
                        </GlossaryTooltip>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">生理安全带范围: {evalItem.refRange}</div>
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

                  {/* Visual Range Bar with Safety Band Highlight */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden relative border border-slate-200/80">
                      {/* Safety Band Marker */}
                      <div
                        className={`h-full rounded-full transition-all ${
                          isNormal ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>0</span>
                      <span className="text-emerald-700 font-bold">生理安全上限: {evalItem.refMax}</span>
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
    </div>
  );
}
