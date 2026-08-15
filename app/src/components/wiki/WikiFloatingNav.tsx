"use client";

import { useState, useEffect } from "react";
import type { WikiCategory } from "@/lib/wikiData";
import { WIKI_CATEGORIES } from "@/lib/wikiData";

interface WikiFloatingNavProps {
  activeCategory: WikiCategory | "all";
  onSelectCategory: (category: WikiCategory | "all") => void;
  totalTopics: number;
  categoryCounts: Record<WikiCategory, number>;
}

export function WikiFloatingNav({
  activeCategory,
  onSelectCategory,
  totalTopics,
  categoryCounts,
}: WikiFloatingNavProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Smooth scroll helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories: Array<{ id: WikiCategory | "all"; label: string; icon: string; count: number }> = [
    { id: "all", label: "全部词条", icon: "🌐", count: totalTopics },
    { id: "nodule", label: WIKI_CATEGORIES.nodule.label, icon: WIKI_CATEGORIES.nodule.icon, count: categoryCounts.nodule || 0 },
    { id: "pathology", label: WIKI_CATEGORIES.pathology.label, icon: WIKI_CATEGORIES.pathology.icon, count: categoryCounts.pathology || 0 },
    { id: "genetics", label: WIKI_CATEGORIES.genetics.label, icon: WIKI_CATEGORIES.genetics.icon, count: categoryCounts.genetics || 0 },
    { id: "recovery", label: WIKI_CATEGORIES.recovery.label, icon: WIKI_CATEGORIES.recovery.icon, count: categoryCounts.recovery || 0 },
  ];

  return (
    <aside
      aria-label="百科专区快速电梯导轨"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-1.5 p-2 rounded-3xl bg-white/85 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 transition-all duration-300 select-none animate-fade-in"
    >
      {/* Category Fast Switcher Items */}
      {categories.map((item) => {
        const isActive = activeCategory === item.id;
        return (
          <div key={item.id} className="relative group">
            <button
              type="button"
              onClick={() => {
                onSelectCategory(item.id);
                scrollToSection("wiki-topics-section");
              }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105 ring-2 ring-blue-400/40 font-bold"
                  : "bg-slate-100/60 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 hover:scale-105"
              }`}
              aria-label={`切换至 ${item.label}`}
            >
              <span>{item.icon}</span>
            </button>

            {/* Left Hover Floating Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 flex items-center gap-2 z-50">
              <span>{item.icon}</span>
              <span>{item.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {item.count}
              </span>
              {isActive && <span className="text-emerald-400 text-[10px]">● 已激活</span>}
              {/* Right Caret Arrow */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95" />
            </div>
          </div>
        );
      })}

      {/* Divider */}
      <div className="w-6 h-px bg-slate-200 my-1" />

      {/* Quick Jump: Visual Interactive Lab */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => scrollToSection("wiki-visual-lab-section")}
          className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 hover:scale-105 flex items-center justify-center text-base transition-all cursor-pointer border border-amber-200/60 shadow-2xs"
          aria-label="快速跳转至视觉实验室"
        >
          <span>🎛️</span>
        </button>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 flex items-center gap-1.5 z-50">
          <span>🎛️ 交互式视觉实验室</span>
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95" />
        </div>
      </div>

      {/* Quick Jump: Scroll To Top */}
      <div className="relative group">
        <button
          type="button"
          onClick={scrollToTop}
          className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white hover:scale-105 flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-2xs"
          aria-label="返回顶部"
        >
          <span>↑</span>
        </button>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 flex items-center gap-1 z-50">
          <span>回到顶部</span>
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95" />
        </div>
      </div>
    </aside>
  );
}
