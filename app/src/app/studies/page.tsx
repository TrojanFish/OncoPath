"use client";

import Link from "next/link";
import { FEATURED_STUDIES } from "@/lib/evidence-data";
import StudyCard from "@/components/StudyCard";
import PubMedSearch from "@/components/PubMedSearch";

export default function StudiesPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Navbar Minimal */}
      <nav className="sticky top-0 z-50 bg-[#0a0e1a]/70 backdrop-blur-lg border-b border-white/5 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-teal flex items-center justify-center text-white font-bold text-sm">
              O
            </div>
            <span className="font-semibold text-text-primary">
              Onco<span className="text-gradient">Path</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              返回首页
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-16 pb-12 px-6 text-center">
        <h1 className="display-md mb-4">全部国际研究库</h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
          OncoPath 收录了所有支撑系统结论的顶级期刊文献。
          这些研究是我们分析预后的循证基石。
        </p>
      </header>

      {/* Studies Grid */}
      <main className="max-w-7xl mx-auto px-6">
        <PubMedSearch />
        
        <div className="flex items-center justify-between mb-8">
          <div className="text-text-muted text-sm">
            共收录 <span className="text-accent-blue font-semibold">{FEATURED_STUDIES.length}</span> 篇核心研究
          </div>
          <div className="flex gap-2">
            <select className="input-dark px-3 py-1.5 rounded-lg text-sm appearance-none cursor-pointer">
              <option value="all">所有证据等级</option>
              <option value="5">⭐⭐⭐⭐⭐ (Meta/前瞻性)</option>
              <option value="4">⭐⭐⭐⭐ (多中心回顾性)</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_STUDIES.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      </main>
    </div>
  );
}
