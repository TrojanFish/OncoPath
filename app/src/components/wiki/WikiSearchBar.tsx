"use client";

import { Search, X, ShieldCheck } from "lucide-react";
import type { RiskLevel } from "@/lib/wikiData";

interface WikiSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedRisk: RiskLevel | "all";
  onRiskChange: (r: RiskLevel | "all") => void;
  totalCount: number;
  filteredCount: number;
}

export function WikiSearchBar({
  searchQuery,
  onSearchChange,
  selectedRisk,
  onRiskChange,
  totalCount,
  filteredCount,
}: WikiSearchBarProps) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
      {/* Main Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索词条：如 '气道播散'、'STAS'、'磨玻璃'、'胸膜'、'奥希替尼'、'切缘'、'CEA'..."
          className="w-full pl-11 pr-24 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-3 px-2 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <span>清空</span>
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Risk Priority Filters & Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-500 mr-1">风险等级筛选:</span>
          
          <button
            onClick={() => onRiskChange("all")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              selectedRisk === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            全部 ({totalCount})
          </button>

          <button
            onClick={() => onRiskChange("high")}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRisk === "high"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>高危指标优先</span>
          </button>

          <button
            onClick={() => onRiskChange("moderate")}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRisk === "moderate"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>中危关注</span>
          </button>

          <button
            onClick={() => onRiskChange("low")}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRisk === "low"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>低危/惰性</span>
          </button>

          <button
            onClick={() => onRiskChange("safe")}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRisk === "safe"
                ? "bg-teal-700 text-white border-teal-700 shadow-xs"
                : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>安全基石</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          已筛选显示 <span className="font-bold text-slate-700">{filteredCount}</span> 个破译词条
        </div>
      </div>
    </div>
  );
}
