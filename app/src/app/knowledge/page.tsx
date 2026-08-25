"use client";

import { useState, useEffect } from "react";
import KnowledgeMapPreview from "@/components/KnowledgeMapPreview";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";
import type { PatientProfile } from "@/lib/types";


export default function KnowledgePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    // 1. Attempt to read profile from URL hash (e.g., /knowledge#profile=<base64>)
    if (typeof window !== "undefined") {
      let loadedFromHash = false;
      try {
        const hash = window.location.hash;
        const match = hash.match(/profile=([^&]+)/);
        if (match) {
          const decoded = JSON.parse(atob(decodeURIComponent(match[1])));
          setProfile(decoded);
          loadedFromHash = true;
        }
      } catch {
        // Silently ignore malformed hash
      }

      // 2. Fallback to localStorage saved profile if no URL hash provided
      if (!loadedFromHash) {
        try {
          const cached = localStorage.getItem("oncopath_profile") || localStorage.getItem("patient_profile");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && (parsed.stage || parsed.noduleType || parsed.tumorSize || parsed.organ)) {
              setProfile(parsed);
            }
          }
        } catch {}
      }

      setProfileLoaded(true);
    }
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
      <SubpageNavbar />

      {/* Hero Header */}
      <header className="pt-28 md:pt-32 pb-8 px-2.5 sm:px-6 max-w-4xl mx-auto text-center space-y-4">
        {/* Unified Top Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200/80 shadow-xs">
          <span>🗺️ 4D 动态因果推演引擎</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>交互式多维网络分析</span>
        </div>

        {/* Unified H1 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          推演病理因果 · <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">洞悉 4D 证据网络</span>
        </h1>

        {/* Unified Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          基于全球顶刊队列与临床指南构建的<strong>结构化知识图谱</strong>。动态推演上游浸润特征（CTR / STAS / 分期）到下游预后结局与辅助治疗方案的<strong>完整因果链条</strong>。
        </p>

        {/* Profile Matched Notification Bar if profile exists */}
        {profile && (
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-300 text-teal-950 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>已识别到您的个人数字档案（{profile.stage}期 · {profile.age}岁）· 专属因果推演路径已高亮激活</span>
          </div>
        )}
      </header>

      {/* Knowledge Map */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2.5 sm:px-6 mb-16">

        <div className="bg-white rounded-3xl p-2 border border-slate-200/90 shadow-xl shadow-slate-900/5">
          {profileLoaded && <KnowledgeMapPreview profile={profile} />}
        </div>
      </main>

      <Footer maxWidth="max-w-7xl" />
    </div>
  );
}

