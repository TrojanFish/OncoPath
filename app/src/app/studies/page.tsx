"use client";

import React, { useState, useEffect } from "react";
import StudyCard, { StudyItem } from "@/components/StudyCard";
import SubpageNavbar from "@/components/SubpageNavbar";

export default function StudiesPage() {
  const [studies, setStudies] = useState<StudyItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const loadStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/studies?q=${encodeURIComponent(searchQuery)}&level=${selectedLevel}`);
      const data = await res.json();
      if (data.success) {
        setStudies(data.studies);
        setTotalCount(data.totalCount);
      }
    } catch (e) {
      console.error("Failed to load studies", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudies();
  }, [searchQuery, selectedLevel]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-blue-500 selection:text-white">
      <SubpageNavbar />

      {/* Hero Header */}
      <header className="pt-28 md:pt-32 pb-8 px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-4">
        {/* Unified Top Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200/80 shadow-xs">
          <span>📚 国际顶刊同行评审文献库</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>100% DOI 原始出处可溯</span>
        </div>

        {/* Unified H1 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          汇聚全球顶刊 · <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-teal-600">严谨循证文献矩阵</span>
        </h1>

        {/* Unified Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          严格收录 <strong>Lancet、JCO、JTO</strong> 等顶级期刊发表的多中心 RCT 与 Meta 分析。为每一项临床分期、术后辅助治疗与随访决策提供<strong>可验证、可溯源的坚实数据支撑</strong>。
        </p>
      </header>

      {/* Studies Main Area */}
      <main className="max-w-7xl mx-auto px-6">
        
        {/* Search and Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-slate-500">
              当前展示 <span className="text-accent-blue font-bold text-sm">{studies.length}</span> 篇文献
              {totalCount > 0 && <span className="text-slate-400"> (共收录 {totalCount} 篇)</span>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search query */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索标题、期刊、因子 (如 STAS, ADAURA)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              />
            </div>

            {/* Level filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer focus:bg-white"
              >
                <option value="all">全部证据等级</option>
                <option value="5">⭐⭐⭐⭐⭐ (最高级 RCT/Meta)</option>
                <option value="4">⭐⭐⭐⭐ (多中心高级别)</option>
                <option value="3">⭐⭐⭐ (单中心临床研究)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Studies Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-accent-blue" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>正在加载已收录文献...</span>
          </div>
        ) : studies.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200 p-8">
            <div className="text-3xl mb-2">🔍</div>
            <div className="font-semibold text-slate-700 mb-1">未找到符合条件的已收录研究</div>
            <p className="text-xs text-slate-400">请尝试更换检索关键词或重置筛选条件。</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
