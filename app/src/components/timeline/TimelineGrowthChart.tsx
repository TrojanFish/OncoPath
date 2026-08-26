"use client";

import { useMemo } from "react";
import { TrendingUp, Zap, ShieldCheck, Activity, Eye } from "lucide-react";
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
        暂无影像结节尺寸时序数据，录入 2 次以上 CT 报告即可自动绘制生长与术后随访曲线。
      </div>
    );
  }

  const maxSize = Math.max(...imagingPoints.map((p) => p.sizeMm), 10);

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200/90 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              肺部病灶长程演变与手术前后随访图谱
            </h3>
            <p className="text-[11px] text-slate-500">
              术前生长演变监测 (VDT/CTR) ➔ 微创根治切除 ➔ 术后防复发长程影像随访
            </p>
          </div>
        </div>

        {surgeryEvent && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>{surgeryEvent.eventDate} 已行微创根治术</span>
          </div>
        )}
      </div>

      {/* Clinical Phase Guide Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="flex items-start gap-2">
          <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">术前阶段（生长与倍增监测）：</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              重点随访原发病灶全径增长速度 (VDT) 与实性浸润成分 (CTR) 扩大趋势。
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900">术后阶段（原灶清空 · 防复发随访）：</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              原病灶已获物理根治（尺寸归零），随访焦点转为<strong>术区代偿、吻合钉通畅及防复发排查</strong>；伴随微小结节独立良性观察。
            </p>
          </div>
        </div>
      </div>

      {/* Visual Chart Canvas */}
      <div className="relative pt-6 pb-2 overflow-x-auto custom-scrollbar">
        {/* Y Axis Grid lines */}
        <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono min-w-[380px] sm:min-w-0">
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>{maxSize.toFixed(1)} mm</span>
            <span>警戒阈值 (8mm 介入参考)</span>
          </div>
          <div className="border-b border-slate-100 flex justify-between pr-2">
            <span>{(maxSize / 2).toFixed(1)} mm</span>
            <span>基线参考</span>
          </div>
          <div className="border-b border-slate-100">
            <span>0.0 mm (术后物理根治切除)</span>
          </div>
        </div>

        {/* Nodes Flow */}
        <div className="relative z-10 grid grid-flow-col auto-cols-fr gap-3 sm:gap-6 pt-4 pb-4 min-w-[380px] sm:min-w-0">
          {imagingPoints.map((pt, idx) => {
            const isSurgeryAfter = surgeryEvent && new Date(pt.date) >= new Date(surgeryEvent.eventDate);
            const heightPercent = pt.sizeMm === 0 ? 8 : Math.min(100, Math.max(12, (pt.sizeMm / maxSize) * 100));

            return (
              <div key={idx} className="flex flex-col items-center group relative">
                {/* Stage Phase Tag */}
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md mb-1.5 ${
                  isSurgeryAfter
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {isSurgeryAfter ? "术后随访" : "术前观察"}
                </span>

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
                  {pt.sizeMm === 0 ? "0 mm (切除根治)" : `${pt.sizeMm} mm`}
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
                    {pt.sizeMm === 0 ? "术区无瘤清晰" : pt.ctr ? `CTR ${(pt.ctr * 100).toFixed(0)}%` : "纯磨玻璃"}
                  </div>
                </div>

                {/* Floating Tooltip on Hover */}
                <div className="absolute bottom-full mb-3 hidden group-hover:block z-30 w-52 p-2.5 bg-slate-900/95 text-white rounded-xl text-[11px] shadow-xl pointer-events-none animate-fade-in">
                  <div className="font-bold text-sky-400">{pt.title}</div>
                  <div className="mt-1 space-y-0.5 text-slate-300">
                    <div>日期：{pt.date}</div>
                    <div>阶段：{isSurgeryAfter ? "术后防复发长程监测" : "术前病灶生长追踪"}</div>
                    {pt.sizeMm === 0 ? (
                      <div className="text-emerald-400 font-bold">原发病灶已根治切除，术区吻合口通畅</div>
                    ) : (
                      <>
                        <div>部位：{pt.location || "肺部"}</div>
                        <div>实性成分 (CTR)：{(pt.ctr * 100).toFixed(0)}%</div>
                        {pt.vdtDays && pt.vdtDays < 9000 && (
                          <div>倍增时间 (VDT)：{pt.vdtDays} 天</div>
                        )}
                      </>
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
            <span>术后根治清空 (0 mm)</span>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          遵循 Fleischner / CSCO / NCCN 肺癌长程随访规范
        </span>
      </div>
    </div>
  );
}

