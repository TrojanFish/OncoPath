"use client";

import { useState, useEffect } from "react";
import KnowledgeMapPreview from "@/components/KnowledgeMapPreview";
import SubpageNavbar from "@/components/SubpageNavbar";
import type { PatientProfile } from "@/lib/types";

export default function KnowledgePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    // Attempt to read profile from URL hash (e.g., /knowledge#profile=<base64>)
    if (typeof window !== "undefined") {
      try {
        const hash = window.location.hash;
        const match = hash.match(/profile=([^&]+)/);
        if (match) {
          const decoded = JSON.parse(atob(decodeURIComponent(match[1])));
          setProfile(decoded);
        }
      } catch {
        // Silently ignore malformed hash
      }
      setProfileLoaded(true);
    }
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <SubpageNavbar />

      {/* Header */}
      <header className="pt-28 md:pt-32 pb-12 px-6 max-w-7xl mx-auto text-center">
        <h1 className="display-md mb-4">知识图谱</h1>
        <p className="text-text-secondary max-w-2xl mx-auto text-lg">
          {profile
            ? "根据您的病理特征，图谱已高亮显示与您直接相关的风险路径。"
            : "探索肺癌病理特征与临床研究证据之间的复杂网络关系。"}
        </p>
        {profile && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-teal/10 border border-accent-teal/30">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-accent-teal text-sm">专属路径模式已激活</span>
          </div>
        )}
      </header>

      {/* Knowledge Map */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm p-2 border border-border-color shadow-xl shadow-sm">
          {profileLoaded && <KnowledgeMapPreview profile={profile} />}
        </div>
      </main>
    </div>
  );
}
