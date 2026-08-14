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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <SubpageNavbar />

      {/* Header */}
      <header className="pt-28 md:pt-32 pb-10 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-accent-blue bg-blue-50 border border-blue-200 mb-3">
          <span>📚 权威循证医学库</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse"></span>
          <span>Peer-Reviewed Evidence</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          全部已收录国际研究库
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
          OncoPath 严格收录所有支撑临床分期、预后评估与辅助治疗决策的同行评审顶级期刊论文。
          所有结论均可直接溯源至原始研究原文。
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
