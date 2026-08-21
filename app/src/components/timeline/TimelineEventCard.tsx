"use client";

import { useState } from "react";
import { TimelineEventItem, TIMELINE_CATEGORIES } from "@/lib/timelineTypes";

interface TimelineEventCardProps {
  event: TimelineEventItem;
  onDelete?: (id: string) => void;
}

export default function TimelineEventCard({ event, onDelete }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const categoryMeta = TIMELINE_CATEGORIES.find((c) => c.key === event.category) || {
    key: event.category,
    label: "检查记录",
    icon: "📄",
    badgeColor: "bg-slate-700 text-white",
    lightBg: "bg-slate-50 text-slate-700 border-slate-200",
    borderColor: "border-slate-400",
    description: "",
  };

  const handleCopy = () => {
    const text = `【${event.eventDate} ${event.title}】\n医院：${event.hospital || "未记录"}\n结论：${event.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pl-6 sm:pl-8 group">
      {/* Vertical Timeline Dot */}
      <div
        className={`absolute left-0 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125 z-10 ${
          event.category === "imaging"
            ? "bg-blue-600 ring-4 ring-blue-100"
            : event.category === "pathology"
            ? "bg-purple-600 ring-4 ring-purple-100"
            : event.category === "serology"
            ? "bg-rose-600 ring-4 ring-rose-100"
            : "bg-emerald-600 ring-4 ring-emerald-100"
        }`}
      />

      {/* Main Card Container */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all space-y-3.5">
        {/* Top Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${categoryMeta.lightBg}`}
            >
              <span>{categoryMeta.icon}</span>
              <span>{categoryMeta.label}</span>
            </span>

            {/* Date Tag */}
            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
              📅 {event.eventDate}
            </span>

            {/* Hospital Tag */}
            {event.hospital && (
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                🏥 {event.hospital}
              </span>
            )}
          </div>

          {/* Risk Level Badge & Actions */}
          <div className="flex items-center gap-1.5">
            {event.riskStatus === "warning" && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                ⚠️ 手术指征
              </span>
            )}
            {event.riskStatus === "watch" && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                👁️ 随访观察
              </span>
            )}
            {event.riskStatus === "normal" && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                🟢 稳定安全
              </span>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors text-xs cursor-pointer"
              title="复制摘要"
            >
              {copied ? "✓ 已复制" : "📋"}
            </button>

            {onDelete && (
              <button
                onClick={() => onDelete(event.id)}
                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-600 transition-colors text-xs cursor-pointer"
                title="删除记录"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-extrabold text-slate-900 leading-snug tracking-tight">
          {event.title}
        </h4>

        {/* Summary Text */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
          {event.summary}
        </p>

        {/* Key Finding Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {event.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Clinical Metrics Drawer */}
        {event.keyFindings && Object.keys(event.keyFindings).length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-bold text-accent-blue hover:text-accent-blue-dark flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{expanded ? "收起临床指标详情" : "展开核验临床指标明细"}</span>
              <span>{expanded ? "▲" : "▼"}</span>
            </button>

            {expanded && (
              <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 text-xs text-slate-800 animate-fade-in">
                <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5">
                  结构化提取指标明细
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {event.keyFindings.sizeMm !== undefined && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500">病灶长径：</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {event.keyFindings.sizeMm} mm
                      </span>
                    </div>
                  )}
                  {event.keyFindings.ctr !== undefined && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500">实性占比 (CTR)：</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {(event.keyFindings.ctr * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {event.keyFindings.histology && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50 sm:col-span-2">
                      <span className="text-slate-500">病理组织学：</span>
                      <span className="font-bold text-purple-700">
                        {event.keyFindings.histology}
                      </span>
                    </div>
                  )}
                  {event.keyFindings.stage && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500">病理分期：</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {event.keyFindings.stage}
                      </span>
                    </div>
                  )}
                  {event.keyFindings.driverGene && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50 sm:col-span-2">
                      <span className="text-slate-500">驱动基因 (NGS)：</span>
                      <span className="font-bold text-blue-700 font-mono">
                        {event.keyFindings.driverGene}
                      </span>
                    </div>
                  )}
                  {event.keyFindings.surgeryType && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50 sm:col-span-2">
                      <span className="text-slate-500">手术切除方式：</span>
                      <span className="font-bold text-slate-900">
                        {event.keyFindings.surgeryType}
                      </span>
                    </div>
                  )}
                  {event.keyFindings.marginStatus && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50 sm:col-span-2">
                      <span className="text-slate-500">切缘状态：</span>
                      <span className="font-bold text-emerald-700">
                        {event.keyFindings.marginStatus}
                      </span>
                    </div>
                  )}
                  {event.keyFindings.cea !== undefined && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500">CEA 标志物：</span>
                      <span className="font-bold text-rose-700 font-mono">
                        {event.keyFindings.cea} ng/mL
                      </span>
                    </div>
                  )}
                  {event.keyFindings.cyfra211 !== undefined && (
                    <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                      <span className="text-slate-500">CYFRA21-1：</span>
                      <span className="font-bold text-rose-700 font-mono">
                        {event.keyFindings.cyfra211} ng/mL
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
