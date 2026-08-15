"use client";

import React from "react";
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

  const categories: Array<{
    id: WikiCategory | "all";
    label: string;
    count: number;
    icon: React.ReactNode;
    activeTheme: string;
  }> = [
    {
      id: "all",
      label: "全部词条",
      count: totalTopics,
      activeTheme: "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/30 ring-blue-400/40",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
    },
    {
      id: "nodule",
      label: WIKI_CATEGORIES.nodule.label,
      count: categoryCounts.nodule || 0,
      activeTheme: "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-emerald-500/30 ring-emerald-400/40",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v7" />
          <path d="M12 8c-2.5-2-6-2-8 1-2.5 3.5-1 9.5 2.5 11 3.5 1.5 5.5-2 5.5-5" />
          <path d="M12 8c2.5-2 6-2 8 1 2.5 3.5 1 9.5-2.5 11-3.5 1.5-5.5-2-5.5-5" />
        </svg>
      ),
    },
    {
      id: "pathology",
      label: WIKI_CATEGORIES.pathology.label,
      count: categoryCounts.pathology || 0,
      activeTheme: "bg-gradient-to-tr from-blue-600 to-cyan-600 text-white shadow-blue-500/30 ring-blue-400/40",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18h8" />
          <path d="M3 22h18" />
          <path d="M14 22a7 7 0 1 0-14 0" />
          <path d="M9 14h2" />
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
      ),
    },
    {
      id: "genetics",
      label: WIKI_CATEGORIES.genetics.label,
      count: categoryCounts.genetics || 0,
      activeTheme: "bg-gradient-to-tr from-purple-600 to-fuchsia-600 text-white shadow-purple-500/30 ring-purple-400/40",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 15c6.667-6 13.333 0 20-6" />
          <path d="M2 9c6.667 6 13.333 0 20 6" />
          <path d="m15 2-3.5 3.5" />
          <path d="m9 22 3.5-3.5" />
          <path d="M20 9l-2 2" />
          <path d="M6 13l-2 2" />
        </svg>
      ),
    },
    {
      id: "recovery",
      label: WIKI_CATEGORIES.recovery.label,
      count: categoryCounts.recovery || 0,
      activeTheme: "bg-gradient-to-tr from-amber-600 to-orange-600 text-white shadow-amber-500/30 ring-amber-400/40",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      aria-label="百科专区快速电梯导轨"
      className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-2 p-2 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-slate-900/10 transition-all duration-300 select-none animate-fade-in"
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
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${item.activeTheme} shadow-md scale-105 ring-2 font-bold`
                  : "bg-slate-100/70 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900 hover:scale-105 active:scale-95"
              }`}
              aria-label={`切换至 ${item.label}`}
            >
              {item.icon}
            </button>

            {/* Left Hover Floating Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 flex items-center gap-2 z-50">
              <span className="text-slate-300">{item.icon}</span>
              <span>{item.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                {item.count}
              </span>
              {isActive && <span className="text-emerald-400 text-[10px]">● 当前激活</span>}
              {/* Right Caret Arrow */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95" />
            </div>
          </div>
        );
      })}

      {/* Divider */}
      <div className="w-5 h-px bg-slate-200/90 my-0.5" />

      {/* Quick Jump: Visual Interactive Lab */}
      <div className="relative group">
        <button
          type="button"
          onClick={() => scrollToSection("wiki-visual-lab-section")}
          className="w-9 h-9 rounded-2xl bg-amber-50/80 text-amber-700 hover:bg-amber-100 hover:scale-105 flex items-center justify-center transition-all cursor-pointer border border-amber-200/70 shadow-2xs active:scale-95"
          aria-label="快速跳转至视觉实验室"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21v-7" />
            <path d="M4 10V3" />
            <path d="M12 21v-9" />
            <path d="M12 8V3" />
            <path d="M20 21v-5" />
            <path d="M20 12V3" />
            <path d="M1 14h6" />
            <path d="M9 8h6" />
            <path d="M17 16h6" />
          </svg>
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
          className="w-9 h-9 rounded-2xl bg-slate-100/70 text-slate-600 hover:bg-slate-900 hover:text-white hover:scale-105 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
          aria-label="返回顶部"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 flex items-center gap-1 z-50">
          <span>回到顶部</span>
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900/95" />
        </div>
      </div>
    </aside>
  );
}
