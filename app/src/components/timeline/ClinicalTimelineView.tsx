"use client";

import { useState, useEffect, useMemo } from "react";
import { TimelineCategory, TimelineEventItem, TIMELINE_CATEGORIES } from "@/lib/timelineTypes";
import { DEFAULT_TIMELINE_EVENTS } from "@/lib/timelineData";
import TimelineEventCard from "./TimelineEventCard";
import TimelineGrowthChart from "./TimelineGrowthChart";
import TumorMarkerTrendChart from "./TumorMarkerTrendChart";
import AddEventModal from "./AddEventModal";
import DoctorSummaryModal from "./DoctorSummaryModal";

export default function ClinicalTimelineView() {
  const [events, setEvents] = useState<TimelineEventItem[]>(DEFAULT_TIMELINE_EVENTS);
  const [activeCategory, setActiveCategory] = useState<TimelineCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "charts">("timeline");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load from API or LocalStorage
  const loadEvents = async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/timeline", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.events && data.events.length > 0) {
        setEvents(data.events);
      } else {
        // Fallback to local storage or defaults
        const local = localStorage.getItem("oncopath_timeline_events");
        if (local) {
          setEvents(JSON.parse(local));
        } else {
          setEvents(DEFAULT_TIMELINE_EVENTS);
        }
      }
    } catch {
      const local = localStorage.getItem("oncopath_timeline_events");
      if (local) {
        setEvents(JSON.parse(local));
      } else {
        setEvents(DEFAULT_TIMELINE_EVENTS);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleAddEvent = async (newEvent: Partial<TimelineEventItem>) => {
    const item: TimelineEventItem = {
      id: `evt-${Date.now()}`,
      eventDate: newEvent.eventDate || new Date().toISOString().split("T")[0],
      category: newEvent.category || "imaging",
      subType: newEvent.subType || "CT",
      hospital: newEvent.hospital || "未记录医院",
      title: newEvent.title || "检查记录",
      summary: newEvent.summary || "",
      keyFindings: newEvent.keyFindings || {},
      tags: newEvent.tags || [],
      riskStatus: newEvent.riskStatus || "normal",
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await fetch("/api/timeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(item),
      });
    } catch {
      // Ignore network errors for guest
    }

    const updated = [item, ...events];
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("oncopath_timeline_events", JSON.stringify(updated));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm("确定删除该条检查记录吗？")) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      await fetch(`/api/timeline?id=${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Ignore
    }

    const updated = events.filter((e) => e.id !== id);
    setEvents(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("oncopath_timeline_events", JSON.stringify(updated));
    }
  };

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (activeCategory !== "all" && e.category !== activeCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = e.title.toLowerCase().includes(q);
          const matchSummary = e.summary.toLowerCase().includes(q);
          const matchHospital = e.hospital?.toLowerCase().includes(q);
          const matchTags = e.tags?.some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchSummary || matchHospital || matchTags;
        }
        return true;
      })
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events, activeCategory, searchQuery]);

  // Group by Year
  const groupedByYear = useMemo(() => {
    const groups: { [year: string]: TimelineEventItem[] } = {};
    filteredEvents.forEach((e) => {
      const year = e.eventDate.substring(0, 4);
      if (!groups[year]) groups[year] = [];
      groups[year].push(e);
    });
    return groups;
  }, [filteredEvents]);

  // Earliest and latest date span calculation
  const timeSpan = useMemo(() => {
    if (events.length === 0) return { start: "2026", end: "2026", totalYears: "1", spanText: "暂无数据" };
    const dates = events.map((e) => new Date(e.eventDate).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const totalMonths = Math.max(
      1,
      (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth())
    );
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    return {
      start: minDate.toISOString().split("T")[0],
      end: maxDate.toISOString().split("T")[0],
      spanText: years > 0 ? `${years}年${months > 0 ? `${months}个月` : ""}` : `${months}个月`,
    };
  }, [events]);

  // Dynamic status indicators
  const latestImagingEvent = useMemo(() => {
    return [...events]
      .filter((e) => e.category === "imaging")
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())[0];
  }, [events]);

  const latestSerologyEvent = useMemo(() => {
    return [...events]
      .filter((e) => e.category === "serology" && e.keyFindings?.cea !== undefined)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())[0];
  }, [events]);

  const surgeryEvent = useMemo(() => {
    return events.find((e) => e.subType === "Surgery" || e.category === "milestone");
  }, [events]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Hero Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <span>📅</span>
              <span>长程随访全景档案编年史</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              检查报告时间生命线 · 疾病演变与康复全景
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              将历次薄层 CT、手术大体病理、靶向基因测序（NGS）与血液肿瘤标志物，按时间序列与临床分类智能归集，告别零散纸质报告，3秒扫清诊疗因果演变。
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>➕ 录入新检查报告</span>
            </button>
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📑 生成名医就诊汇报清单</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase">随访跨度</span>
            <div className="text-sm sm:text-base font-extrabold text-white mt-0.5 font-mono">
              {timeSpan.spanText} ({timeSpan.start.substring(0, 7)} ~ {timeSpan.end.substring(0, 7)})
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase">归档检查总数</span>
            <div className="text-sm sm:text-base font-extrabold text-sky-400 mt-0.5 font-mono">
              {events.length} 次检查
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase">最新病灶状态</span>
            <div className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
              <span className="truncate">
                {surgeryEvent
                  ? "术后完全缓解 (0 mm)"
                  : latestImagingEvent?.keyFindings?.sizeMm !== undefined
                  ? `${latestImagingEvent.keyFindings.sizeMm} mm (随访中)`
                  : "基线稳定"}
              </span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 font-bold uppercase">肿瘤标志物 (CEA)</span>
            <div className="text-sm sm:text-base font-extrabold text-teal-300 mt-0.5 font-mono truncate">
              {latestSerologyEvent?.keyFindings?.cea !== undefined
                ? `${latestSerologyEvent.keyFindings.cea} ng/mL (${latestSerologyEvent.keyFindings.cea < 5.0 ? "正常" : "偏高"})`
                : "基线正常"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. View Mode Toggle & Category Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "timeline"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📅 垂直时序生命线</span>
            </button>
            <button
              onClick={() => setViewMode("charts")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "charts"
                  ? "bg-white text-slate-900 shadow-sm font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📈 多维指标演变图谱</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="搜索检查、基因、医院或结论..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            全部时序 ({events.length})
          </button>

          {TIMELINE_CATEGORIES.map((cat) => {
            const count = events.filter((e) => e.category === cat.key).length;
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isActive
                    ? `${cat.lightBg} ring-2 ring-blue-500 font-extrabold shadow-2xs`
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Body Content Based on View Mode */}
      {viewMode === "charts" ? (
        /* Trend Charts View */
        <div className="space-y-6">
          <TimelineGrowthChart events={events} />
          <TumorMarkerTrendChart events={events} />
        </div>
      ) : (
        /* Vertical Chronological Timeline Feed */
        <div className="space-y-8 relative">
          {/* Continuous Vertical Guide Line */}
          <div className="absolute left-0 sm:left-0 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-slate-200" />

          {Object.keys(groupedByYear).length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm text-slate-500 space-y-3">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-semibold">未找到符合当前筛选条件的检查记录</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
              >
                重置筛选条件
              </button>
            </div>
          ) : (
            Object.keys(groupedByYear)
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => (
                <div key={year} className="space-y-4">
                  {/* Year Anchor Header */}
                  <div className="sticky top-16 z-20 flex items-center gap-3">
                    <div className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-md font-mono flex items-center gap-1.5 border border-slate-700">
                      <span>📌</span>
                      <span>{year} 年度</span>
                    </div>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Events in that year */}
                  <div className="space-y-4">
                    {groupedByYear[year].map((event) => (
                      <TimelineEventCard
                        key={event.id}
                        event={event}
                        onDelete={handleDeleteEvent}
                      />
                    ))}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEvent}
        />
      )}

      {/* Doctor Summary Printable Consultation Modal */}
      {showSummaryModal && (
        <DoctorSummaryModal
          events={events}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}
