"use client";

import Link from "next/link";
import KnowledgeMapPreview from "@/components/KnowledgeMapPreview";

export default function KnowledgePage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Navbar Minimal */}
      <nav className="sticky top-0 z-50 glass-strong px-6 py-4 border-b border-border-color shadow-sm">
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
        <h1 className="display-md mb-4">知识图谱</h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
          探索肺癌病理特征与临床研究证据之间的复杂网络关系。
        </p>
      </header>

      {/* Knowledge Map */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-2xl p-2 border border-border-color shadow-xl glow-blue">
          <KnowledgeMapPreview />
        </div>
      </main>
    </div>
  );
}
