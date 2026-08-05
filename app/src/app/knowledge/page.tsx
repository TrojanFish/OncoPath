"use client";

import Link from "next/link";
import KnowledgeMapPreview from "@/components/KnowledgeMapPreview";
import SubpageNavbar from "@/components/SubpageNavbar";

export default function KnowledgePage() {
  return (
    <div className="min-h-screen pb-24">
      <SubpageNavbar />

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
