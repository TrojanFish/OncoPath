"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TimelineCategory, TimelineEventItem, TIMELINE_CATEGORIES } from "@/lib/timelineTypes";
import { DEFAULT_TIMELINE_EVENTS } from "@/lib/timelineData";
import TimelineEventCard from "./TimelineEventCard";
import TimelineGrowthChart from "./TimelineGrowthChart";
import TumorMarkerTrendChart from "./TumorMarkerTrendChart";
import AddEventModal from "./AddEventModal";
import DoctorSummaryModal from "./DoctorSummaryModal";

export default function ClinicalTimelineView() {
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
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
        setIsDemoMode(false);
      } else {
        // Fallback to local storage (do NOT auto-populate fake data)
        const local = localStorage.getItem("oncopath_timeline_events");
        if (local) {
          const parsed = JSON.parse(local);
          setEvents(parsed);
          setIsDemoMode(localStorage.getItem("oncopath_timeline_is_demo") === "true");
        } else {
          setEvents([]);
          setIsDemoMode(false);
        }
      }
    } catch {
      const local = localStorage.getItem("oncopath_timeline_events");
      if (local) {
        setEvents(JSON.parse(local));
        setIsDemoMode(localStorage.getItem("oncopath_timeline_is_demo") === "true");
      } else {
        setEvents([]);
        setIsDemoMode(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleLoadDemo = () => {
    setEvents(DEFAULT_TIMELINE_EVENTS);
    setIsDemoMode(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("oncopath_timeline_events", JSON.stringify(DEFAULT_TIMELINE_EVENTS));
      localStorage.setItem("oncopath_timeline_is_demo", "true");
    }
  };

  const handleClearDemo = () => {
    setEvents([]);
    setIsDemoMode(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("oncopath_timeline_events");
      localStorage.removeItem("oncopath_timeline_is_demo");
    }
  };

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
    setIsDemoMode(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("oncopath_timeline_events", JSON.stringify(updated));
      localStorage.removeItem("oncopath_timeline_is_demo");
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
    if (events.length === 0) return { start: "暂无", end: "暂无", spanText: "暂无随访记录" };
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

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 animate-fade-in">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">正在同步您的检查报告时间生命线...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Demo Mode Notice Banner */}
      {isDemoMode && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="font-semibold">
              当前正在预览「3年随访典型微浸润腺癌 (MIA) 临床时序演示数据」，仅供功能体验与参考。
            </span>
          </div>
          <button
            onClick={handleClearDemo}
            className="px-3 py-1 rounded-xl bg-white hover:bg-amber-100 text-amber-800 font-bold border border-amber-300 transition-colors text-xs cursor-pointer self-start sm:self-center shrink-0"
          >
            清空演示数据
          </button>
        </div>
      )}

      {/* 1. Hero Overview Card (OncoPath Signature Clean Light Medical Style) */}
      <div className="bg-gradient-to-br from-blue-50/80 via-white to-sky-50/40 rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-sm text-slate-900 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-bold">
              <span>📅</span>
              <span>长程随访全景档案编年史</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              检查报告时间生命线
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              将历次薄层 CT、手术大体病理、靶向基因测序（NGS）与血液肿瘤标志物，按时间序列与临床分类智能归集，告别零散纸质报告，3秒扫清诊疗因果演变。
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>➕ 录入新检查报告</span>
            </button>
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-4 sm:px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>📑 生成名医就诊清单</span>
            </button>
          </div>
        </div>

        {/* Dynamic Stats Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-200/80">
          <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">随访跨度</span>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono">
              {events.length > 0 ? `${timeSpan.spanText}` : "未开启随访"}
            </div>
          </div>
          <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">归档检查总数</span>
            <div className="text-xs sm:text-sm font-extrabold text-blue-700 mt-1 font-mono">
              {events.length} 次检查
            </div>
          </div>
          <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">最新病灶状态</span>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5 truncate">
              {events.length > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">
                    {surgeryEvent
                      ? "术后完全缓解 (0 mm)"
                      : latestImagingEvent?.keyFindings?.sizeMm !== undefined
                      ? `${latestImagingEvent.keyFindings.sizeMm} mm`
                      : "稳定"}
                  </span>
                </>
              ) : (
                <span className="text-slate-400 font-normal">暂无影像数据</span>
              )}
            </div>
          </div>
          <div className="bg-white/90 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">肿瘤标志物 (CEA)</span>
            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 font-mono truncate">
              {latestSerologyEvent?.keyFindings?.cea !== undefined
                ? `${latestSerologyEvent.keyFindings.cea} ng/mL (${latestSerologyEvent.keyFindings.cea < 5.0 ? "正常" : "偏高"})`
                : events.length > 0 ? "未查" : "暂无生化数据"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Empty State (When user has 0 records) */}
      {events.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-slate-200/90 shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-accent-blue text-3xl flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            🗓️
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              您尚未录入任何检查报告
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              将您的历次薄层 CT、手术大体病理、靶向基因检测与血液化验归档，系统将自动为您生成长程生长曲线、因果推演与一键就诊清单。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto btn-primary px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>➕ 录入第一份检查报告</span>
            </button>
            <Link
              href="/profile"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>📸 拍照上传智能识别</span>
            </Link>
            <button
              onClick={handleLoadDemo}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>✨ 体验 3年随访演示数据</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 3. View Mode Toggle & Category Filter Controls */}
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

          {/* 4. Main Body Content Based on View Mode */}
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
        </>
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
          events={events.length > 0 ? events : DEFAULT_TIMELINE_EVENTS}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
}
