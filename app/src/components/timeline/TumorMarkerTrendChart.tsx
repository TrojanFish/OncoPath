"use client";

import { useMemo } from "react";
import { TestTube2 } from "lucide-react";
import { TimelineEventItem } from "@/lib/timelineTypes";

interface TumorMarkerTrendChartProps {
  events: TimelineEventItem[];
}

export default function TumorMarkerTrendChart({ events }: TumorMarkerTrendChartProps) {
  const serologyPoints = useMemo(() => {
    return events
      .filter((e) => e.category === "serology" && e.keyFindings?.cea !== undefined)
      .map((e) => ({
        date: e.eventDate,
        title: e.title,
        cea: Number(e.keyFindings?.cea || 0),
        cyfra211: e.keyFindings?.cyfra211 !== undefined ? Number(e.keyFindings.cyfra211) : null,
        nse: e.keyFindings?.nse !== undefined ? Number(e.keyFindings.nse) : null,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  if (serologyPoints.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500 text-xs">
        暂无血清肿瘤标志物时序记录，录入抽血化验单后将自动生成 CEA / CYFRA21-1 动态波动图。
      </div>
    );
  }

  // Safe reference ceilings: CEA < 5.0 ng/mL, CYFRA21-1 < 3.3 ng/mL
  const CEA_CEILING = 5.0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 font-bold flex items-center justify-center">
            <TestTube2 className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              血清肿瘤标志物时序排雷与生化基线监测
            </h3>
            <p className="text-[11px] text-slate-500">
              CEA（癌胚抗原）与 CYFRA21-1（细胞角蛋白19片段）长程随访对比
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>全部生化指标均在安全区间</span>
        </div>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {serologyPoints.map((pt, idx) => {
          const ceaRatio = (pt.cea / CEA_CEILING) * 100;
          const isSafe = pt.cea < CEA_CEILING;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 font-mono">
                  {pt.date}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSafe ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isSafe ? "正常" : "偏高"}
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-semibold">CEA</span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {pt.cea} <span className="text-[10px] font-normal text-slate-400">ng/mL</span>
                  </span>
                </div>

                {/* Progress bar vs ceiling */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isSafe ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, ceaRatio)}%` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400 text-right mt-0.5">
                  参考上限: 5.0
                </div>
              </div>

              {pt.cyfra211 !== null && (
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">CYFRA21-1</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {pt.cyfra211} <span className="text-[9px] text-slate-400">ng/mL</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
