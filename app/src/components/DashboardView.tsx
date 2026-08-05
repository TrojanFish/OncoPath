"use client";

import { useState, useEffect } from "react";
import { getCases } from "@/lib/api";
import type { PatientProfile } from "@/lib/types";

interface DashboardViewProps {
  onBack: () => void;
  onViewReport: (profile: PatientProfile, reportJson: any) => void;
}

export default function DashboardView({ onBack, onViewReport }: DashboardViewProps) {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getCases();
        setCases(data);
      } catch (err: any) {
        setError(err.message || "Failed to load cases");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-grid radial-overlay pt-24 pb-16 px-6">
      <nav className="bg-[#0a0e1a]/70 backdrop-blur-lg border-b border-white/5 fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-accent-blue hover:text-accent-blue-light transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-lg tracking-tight text-text-primary">
              Onco<span className="text-accent-teal">Path</span>
            </span>
          </button>
          <span className="text-text-secondary text-sm">用户中心 / 历史病例</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="text-3xl font-light mb-8 text-text-primary">历史评估报告</h1>
        
        {loading ? (
          <div className="text-center py-20 animate-pulse text-text-secondary">正在加载历史病例...</div>
        ) : error ? (
          <div className="text-center py-20 text-accent-red">{error}</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 text-text-muted glass rounded-xl">暂无历史评估记录</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const tumor = c.tumors && c.tumors.length > 0 ? c.tumors[0] : {};
              const path = tumor.pathology_features || {};
              
              return (
              <div key={c.id} className="glass rounded-xl p-6 hover:shadow-glow-blue transition-all cursor-pointer group" onClick={() => {
                const profile: PatientProfile = {
                  age: c.age || undefined,
                  gender: c.gender || undefined,
                  surgeryType: c.surgery_type || undefined,
                  stage: tumor.stage || undefined,
                  morphology: tumor.morphology || undefined,
                  ctr: tumor.ctr || undefined,
                  solidSize: tumor.solid_size_mm || undefined,
                  tumorSize: tumor.tumor_size_mm || undefined,
                  stas: path.stas || undefined,
                  iaslcGrade: path.iaslc_grade || undefined,
                  lvi: path.lvi || undefined,
                  vpi: path.vpi || undefined,
                  lymphNodes: path.lymph_nodes || undefined,
                  egfr: path.egfr || undefined,
                  margin: path.margin || undefined,
                  histology: []
                };
                onViewReport(profile, c.report_json);
              }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-text-muted font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                    {tumor.stage || "未分期"}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-2 group-hover:text-accent-teal transition-colors">
                  {tumor.morphology || "未知亚型"}
                </h3>
                <div className="text-sm text-text-secondary space-y-1 mb-4">
                  <p>大小: {tumor.tumor_size_mm ? `${tumor.tumor_size_mm}cm` : "-"} (实性 {tumor.solid_size_mm ? `${tumor.solid_size_mm}cm` : "-"})</p>
                  <p>高危因素: {[path.stas === "阳性" && "STAS", path.lvi === "阳性" && "LVI"].filter(Boolean).join(", ") || "无"}</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm text-accent-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  查看完整报告 &rarr;
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
