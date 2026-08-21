"use client";

import { useMemo } from "react";
import { TimelineEventItem } from "@/lib/timelineTypes";

interface TimelineGrowthChartProps {
  events: TimelineEventItem[];
}

export default function TimelineGrowthChart({ events }: TimelineGrowthChartProps) {
  // Filter only imaging events with sizeMm
  const imagingPoints = useMemo(() => {
    return events
      .filter((e) => e.category === "imaging" && e.keyFindings?.sizeMm !== undefined)
      .map((e) => ({
        date: e.eventDate,
        title: e.title,
        sizeMm: Number(e.keyFindings?.sizeMm || 0),
        ctr: Number(e.keyFindings?.ctr || 0),
        noduleType: e.keyFindings?.noduleType || "GGN",
        location: e.keyFindings?.location || "",
        vdtDays: e.keyFindings?.vdtDays,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  // Find surgery date if any
  const surgeryEvent = useMemo(() => {
    return events.find((e) => e.subType === "Surgery" || e.category === "milestone");
  }, [events]);

  if (imagingPoints.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500 text-xs">
        暂无影像结节尺寸时序数据，录入 2 次以上 CT 报告即可自动绘制生长曲线。
      </div>
    );
  }

  const maxSize = Math.max(...imagingPoints.map((p) => p.sizeMm), 10);
  const chartHeight = 160;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-base">
            📈
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              肺部病灶长程生长与 CTR 实性成分演变曲线
            </h3>
            <p className="text-[11px] text-slate-500">
              结节直径 (mm) 及实性成分占比 (CTR) 动态监测 · 早期微浸润筛查
            </p>
          </div>
        </div>

        {surgeryEvent && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
            <span>⚡ {surgeryEvent.eventDate}</span>
            <span>已行微创根治术</span>
          </div>
        )}
      </div>

      {/* Visual Chart Canvas */}
      <div className="relative pt-6 pb-2">
        {/* Y Axis Grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>{maxSize.toFixed(1)} mm</span>
            <span>警戒阈值 (8mm 介入参考)</span>
          </div>
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>{(maxSize / 2).toFixed(1)} mm</span>
            <span>基线参考</span>
          </div>
          <div className="border-b border-slate-100">
            <span>0.0 mm (术后完全缓解)</span>
          </div>
        </div>

        {/* Nodes Flow */}
        <div className="relative z-10 grid grid-flow-col auto-cols-fr gap-3 sm:gap-6 pt-4 pb-4">
          {imagingPoints.map((pt, idx) => {
            const isSurgeryAfter = surgeryEvent && new Date(pt.date) > new Date(surgeryEvent.eventDate);
            const heightPercent = Math.min(100, Math.max(10, (pt.sizeMm / maxSize) * 100));

            return (
              <div key={idx} className="flex flex-col items-center group relative">
                {/* Size Pill Value */}
                <div
                  className={`text-xs font-black px-2.5 py-1 rounded-xl shadow-xs transition-transform group-hover:scale-110 mb-2 ${
                    pt.sizeMm === 0
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold"
                      : pt.sizeMm >= 8
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}
                >
                  {pt.sizeMm === 0 ? "0 mm (清空)" : `${pt.sizeMm} mm`}
                </div>

                {/* Vertical Bar Indicator */}
                <div className="w-4 h-24 sm:h-28 bg-slate-100 rounded-full relative overflow-hidden flex flex-col justify-end p-0.5">
                  <div
                    className={`w-full rounded-full transition-all duration-700 ${
                      pt.sizeMm === 0
                        ? "bg-emerald-500"
                        : pt.ctr && pt.ctr > 0.2
                        ? "bg-gradient-to-t from-amber-500 to-rose-500"
                        : "bg-gradient-to-t from-blue-500 to-sky-400"
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>

                {/* Date and CTR Info */}
                <div className="text-center mt-2 space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-800 font-mono">
                    {pt.date.substring(0, 7)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {pt.ctr ? `CTR ${(pt.ctr * 100).toFixed(0)}%` : pt.sizeMm === 0 ? "术后清晰" : "纯磨玻璃"}
                  </div>
                </div>

                {/* Floating Tooltip on Hover */}
                <div className="absolute bottom-full mb-3 hidden group-hover:block z-30 w-48 p-2.5 bg-slate-900/95 text-white rounded-xl text-[11px] shadow-xl pointer-events-none animate-fade-in">
                  <div className="font-bold text-sky-400">{pt.title}</div>
                  <div className="mt-1 space-y-0.5 text-slate-300">
                    <div>日期：{pt.date}</div>
                    <div>部位：{pt.location || "肺部"}</div>
                    <div>实性成分 (CTR)：{(pt.ctr * 100).toFixed(0)}%</div>
                    {pt.vdtDays && pt.vdtDays < 9000 && (
                      <div>倍增时间 (VDT)：{pt.vdtDays} 天</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Footer Highlights */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50/70 p-3 rounded-2xl">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>纯磨玻璃成分 (惰性低风险)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>实性成分 (CTR) 增多</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>术后完全缓解 (0 mm)</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          遵循 Fleischner 2024 / CSCO 肺结节随访指南
        </span>
      </div>
    </div>
  );
}
