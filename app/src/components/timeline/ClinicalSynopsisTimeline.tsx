"use client";

import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Layers, 
  Pill, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Info,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { TimelineEventItem } from "@/lib/timelineTypes";
import { triggerHaptic } from "@/lib/haptics";

export interface ClinicalSynopsisTimelineProps {
  events: TimelineEventItem[];
  patientName?: string;
}

interface MilestonePoint {
  date: string;
  yearMonth: string;
  cea?: number | null;
  cyfra?: number | null;
  tumorSizeMm?: number | null;
  solidSizeMm?: number | null;
  ctr?: number | null;
  treatmentName?: string;
  treatmentType?: "surgery" | "targeted" | "chemo" | "watchful_waiting";
  treatmentStatus?: "active" | "completed" | "planned";
  adverseEvent?: string;
  eventTitles: string[];
}

export default function ClinicalSynopsisTimeline({
  events,
  patientName = "患者",
}: ClinicalSynopsisTimelineProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Extract structured milestones sorted chronologically
  const milestones: MilestonePoint[] = useMemo(() => {
    if (!events || events.length === 0) {
      // Default demo progression if no records yet
      return [
        {
          date: "2024-03-12",
          yearMonth: "2024.03",
          cea: 2.1,
          cyfra: 1.8,
          tumorSizeMm: 16,
          solidSizeMm: 4,
          ctr: 0.25,
          treatmentName: "基线胸部薄层CT检出磨玻璃结节 (建议随访)",
          treatmentType: "watchful_waiting",
          treatmentStatus: "completed",
          eventTitles: ["基线高分辨胸部薄层CT扫描"],
        },
        {
          date: "2024-09-18",
          yearMonth: "2024.09",
          cea: 2.3,
          cyfra: 1.9,
          tumorSizeMm: 17,
          solidSizeMm: 6,
          ctr: 0.35,
          treatmentName: "MDT会诊讨论：实性成分微增，行胸腔镜微创肺段切除",
          treatmentType: "surgery",
          treatmentStatus: "completed",
          eventTitles: ["术前CT复查", "胸腔镜微创左上肺后段切除术 (JCOG0802规范)"],
        },
        {
          date: "2024-10-05",
          yearMonth: "2024.10",
          cea: 1.6,
          cyfra: 1.4,
          tumorSizeMm: 0,
          solidSizeMm: 0,
          ctr: 0,
          treatmentName: "术后病理确诊微浸润腺癌 (pT1miN0M0 R0切缘安全)，启动术后监测",
          treatmentType: "targeted",
          treatmentStatus: "active",
          adverseEvent: "用药提示：与达喜/胃药需严格错开2小时",
          eventTitles: ["术后常规病理及切缘阴性确认", "基因测序确认 EGFR 19-del 突变"],
        },
        {
          date: "2025-04-10",
          yearMonth: "2025.04",
          cea: 1.8,
          cyfra: 1.5,
          tumorSizeMm: 0,
          solidSizeMm: 0,
          ctr: 0,
          treatmentName: "术后半年规律复查：两肺未见复发转移，血清标志物稳定",
          treatmentType: "targeted",
          treatmentStatus: "active",
          eventTitles: ["术后6个月全胸部薄层CT与血清标志物复查"],
        },
      ];
    }

    // Process actual user events
    const sorted = [...events].sort((a, b) => {
      const dateA = a.eventDate || (a as unknown as { date?: string }).date || "";
      const dateB = b.eventDate || (b as unknown as { date?: string }).date || "";
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

    const map = new Map<string, MilestonePoint>();

    for (const ev of sorted) {
      const d = ev.eventDate || (ev as unknown as { date?: string }).date || "2024-01-01";
      const existing = map.get(d) || {
        date: d,
        yearMonth: d.slice(0, 7).replace("-", "."),
        eventTitles: [],
      };

      existing.eventTitles.push(ev.title);

      // Extract metrics if available
      const kf = ev.keyFindings;
      if (kf?.cea != null) existing.cea = Number(kf.cea);
      if (kf?.cyfra211 != null) existing.cyfra = Number(kf.cyfra211);

      if (kf?.sizeMm != null) {
        existing.tumorSizeMm = Number(kf.sizeMm);
      }
      if (kf?.ctr != null) {
        existing.ctr = Number(kf.ctr);
        if (existing.tumorSizeMm) {
          existing.solidSizeMm = Number((existing.tumorSizeMm * existing.ctr).toFixed(1));
        }
      }

      if (ev.subType === "Surgery" || kf?.surgeryType) {
        existing.treatmentName = kf?.surgeryType || ev.title;
        existing.treatmentType = "surgery";
        existing.treatmentStatus = "completed";
      } else if (ev.subType === "Medication" || kf?.medication) {
        existing.treatmentName = kf?.medication || ev.title;
        existing.treatmentType = "targeted";
        existing.treatmentStatus = "active";
      }

      map.set(d, existing);
    }

    return Array.from(map.values());
  }, [events]);

  const activeMilestone = useMemo(() => {
    if (!hoveredDate) return milestones[milestones.length - 1];
    return milestones.find((m) => m.date === hoveredDate) || milestones[milestones.length - 1];
  }, [hoveredDate, milestones]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
              Clinical Synopsis 3-Track
            </span>
            <span className="text-xs text-slate-300">
              {patientName} 的全病程联动决策图
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-1">
            三轨合一全景时序看板 (生化 · 影像 · 治疗)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            按国际肿瘤中心 (MSKCC/NCCN) 标准，纵向贯通对比抽血标志物、CT实性成分与治疗介入事件
          </p>
        </div>

        {/* Current Active Milestone Pill */}
        {activeMilestone && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/15 text-right flex-shrink-0">
            <div className="text-[11px] text-blue-200 font-medium">当前选中节点</div>
            <div className="text-sm font-bold text-white flex items-center justify-end gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-blue-300" />
              <span>{activeMilestone.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Synopsis Multi-Track Canvas */}
      <div className="p-4 sm:p-6 overflow-x-auto custom-scrollbar">
        <div className="min-w-[700px] space-y-6">

          {/* Time Scale Axis Header */}
          <div className="grid grid-cols-[160px_1fr] items-center border-b border-slate-200 pb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              诊疗时间对齐轴
            </div>
            <div className="flex justify-between items-center px-4">
              {milestones.map((m) => {
                const isHovered = hoveredDate === m.date;
                return (
                  <button
                    key={m.date}
                    type="button"
                    onMouseEnter={() => {
                      triggerHaptic("light");
                      setHoveredDate(m.date);
                    }}
                    className={`flex flex-col items-center group cursor-pointer transition-all ${
                      isHovered ? "scale-110" : ""
                    }`}
                  >
                    <span className={`text-xs font-bold transition-colors ${
                      isHovered ? "text-blue-600" : "text-slate-700 group-hover:text-slate-900"
                    }`}>
                      {m.yearMonth}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{m.date.slice(5)}</span>
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 transition-all ${
                      isHovered 
                        ? "bg-blue-600 ring-4 ring-blue-100" 
                        : "bg-slate-300 group-hover:bg-slate-400"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= TRACK 1: SERUM BIOMARKERS (CEA / CYFRA21-1) ================= */}
          <div className="grid grid-cols-[160px_1fr] items-center py-2 relative">
            {/* Track 1 Label */}
            <div className="pr-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>轨 1：血清标志物</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">CEA / CYFRA 动态监测</p>
              <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/80 inline-block font-medium">
                阈值基线：&lt;5.0 ng/mL
              </div>
            </div>

            {/* Track 1 Data Strip */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 relative flex justify-between items-center px-6 min-h-[90px]">
              {/* Reference Dashed Line (Safe Band) */}
              <div className="absolute left-4 right-4 top-1/2 border-t border-dashed border-emerald-300 pointer-events-none" />

              {milestones.map((m) => {
                const isHovered = hoveredDate === m.date;
                const hasCea = m.cea != null;
                const isElevated = hasCea && (m.cea || 0) > 5.0;

                return (
                  <div 
                    key={m.date}
                    onMouseEnter={() => {
                      triggerHaptic("light");
                      setHoveredDate(m.date);
                    }}
                    className={`flex flex-col items-center relative z-10 transition-transform cursor-pointer ${
                      isHovered ? "scale-115" : ""
                    }`}
                  >
                    {hasCea ? (
                      <div className={`px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs border transition-all ${
                        isElevated
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-white text-emerald-700 border-emerald-200"
                      } ${isHovered ? "ring-2 ring-blue-500 shadow-md" : ""}`}>
                        <div className="text-[10px] text-slate-400 font-normal">CEA</div>
                        <div className="text-xs font-bold">{m.cea} <span className="text-[9px] font-normal">ng/mL</span></div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">未查</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= TRACK 2: CT LESION & CTR INVASION ================= */}
          <div className="grid grid-cols-[160px_1fr] items-center py-2 relative">
            {/* Track 2 Label */}
            <div className="pr-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>轨 2：CT 结节实性占比</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">全径 vs 浸润实性成分</p>
              <div className="mt-2 text-[10px] text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200/80 inline-block font-medium">
                CTR = 实性 / 全径
              </div>
            </div>

            {/* Track 2 Data Strip */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 relative flex justify-between items-center px-6 min-h-[105px]">
              {milestones.map((m) => {
                const isHovered = hoveredDate === m.date;
                const hasCt = m.tumorSizeMm != null && m.tumorSizeMm > 0;
                const isR0PostOp = m.tumorSizeMm === 0;

                return (
                  <div
                    key={m.date}
                    onMouseEnter={() => {
                      triggerHaptic("light");
                      setHoveredDate(m.date);
                    }}
                    className={`flex flex-col items-center relative z-10 transition-transform cursor-pointer ${
                      isHovered ? "scale-115" : ""
                    }`}
                  >
                    {hasCt ? (
                      <div className={`p-2 rounded-xl text-center bg-white border shadow-xs transition-all ${
                        isHovered ? "ring-2 ring-blue-500 border-blue-300 shadow-md" : "border-slate-200"
                      }`}>
                        <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-800">
                          <span>{m.tumorSizeMm}mm</span>
                          {m.solidSizeMm != null && (
                            <span className="text-[10px] text-amber-600 font-semibold">(实性{m.solidSizeMm})</span>
                          )}
                        </div>
                        {m.ctr != null && (
                          <div className="mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold inline-block">
                            CTR {m.ctr.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ) : isR0PostOp ? (
                      <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center">
                        <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600 mb-0.5" />
                        <span className="text-[10px] font-bold">无病灶 (R0切除)</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">未拍片</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= TRACK 3: SYSTEMIC THERAPY & SURGERY ================= */}
          <div className="grid grid-cols-[160px_1fr] items-center py-2 relative">
            {/* Track 3 Label */}
            <div className="pr-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
                <Pill className="w-4 h-4 text-purple-600" />
                <span>轨 3：治疗干预与用药</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">手术 · 靶向药 · DDI预警</p>
              <div className="mt-2 text-[10px] text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200/80 inline-block font-medium">
                临床干预全生命周期
              </div>
            </div>

            {/* Track 3 Data Strip */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 relative flex justify-between items-center px-6 min-h-[90px]">
              {milestones.map((m) => {
                const isHovered = hoveredDate === m.date;
                const isSurgery = m.treatmentType === "surgery";
                const isTargeted = m.treatmentType === "targeted";

                return (
                  <div
                    key={m.date}
                    onMouseEnter={() => {
                      triggerHaptic("light");
                      setHoveredDate(m.date);
                    }}
                    className={`flex flex-col items-center relative z-10 transition-transform cursor-pointer max-w-[130px] text-center ${
                      isHovered ? "scale-110" : ""
                    }`}
                  >
                    {isSurgery ? (
                      <div className="px-2.5 py-1.5 rounded-xl bg-purple-100/90 text-purple-900 border border-purple-300 text-xs font-bold shadow-xs">
                        🔪 微创手术
                        <div className="text-[9px] font-normal text-purple-700 truncate mt-0.5">JCOG0802 R0</div>
                      </div>
                    ) : isTargeted ? (
                      <div className="px-2.5 py-1.5 rounded-xl bg-blue-100/90 text-blue-900 border border-blue-300 text-xs font-bold shadow-xs">
                        💊 靶向辅助
                        <div className="text-[9px] font-normal text-blue-700 truncate mt-0.5">奥希替尼维持</div>
                      </div>
                    ) : (
                      <div className="px-2 py-1 rounded-lg bg-white text-slate-600 border border-slate-200 text-[11px]">
                        🔍 动态随访
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Synchronized Hover Detail Drawer */}
      {activeMilestone && (
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                {activeMilestone.date} 临床决策切片
              </span>
              {activeMilestone.treatmentName && (
                <span className="text-xs font-medium text-slate-700 truncate max-w-md">
                  {activeMilestone.treatmentName}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
              <span>CEA: <strong className="text-slate-900">{activeMilestone.cea ?? "未测"}</strong> ng/mL</span>
              <span>结节全径: <strong className="text-slate-900">{activeMilestone.tumorSizeMm ? `${activeMilestone.tumorSizeMm} mm` : "无残留"}</strong></span>
              {activeMilestone.ctr != null && (
                <span>CTR浸润比: <strong className="text-blue-700">{(activeMilestone.ctr * 100).toFixed(0)}%</strong></span>
              )}
            </div>
          </div>

          {activeMilestone.adverseEvent && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>{activeMilestone.adverseEvent}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
