"use client";

import React, { useState, useEffect } from "react";
import type { PatientProfile } from "@/lib/types";

interface SimilarCasesCardProps {
  profile: PatientProfile;
}

export default function SimilarCasesCard({ profile }: SimilarCasesCardProps) {
  const [cohort, setCohort] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilarCases() {
      try {
        const res = await fetch("/api/similar-cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        if (data.success) {
          setCohort(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch similar cases", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilarCases();
  }, [profile]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse h-48 flex items-center justify-center">
        <div className="text-text-muted text-sm flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          正在检索循证队列与相似病例...
        </div>
      </div>
    );
  }

  if (!cohort) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group">
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br from-accent-blue/5 to-accent-teal/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-1">相似病例群体预后 (Similar Cases)</h3>
          <p className="text-gray-900 font-bold text-lg">为您匹配到 {cohort.cohortSize.toLocaleString()} 例特征相似患者</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-muted mb-1">证据置信度 (Confidence)</div>
          <div className="flex items-center gap-1 justify-end">
            <span className="text-amber-400 text-sm">{cohort.confidenceRating}</span>
            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{cohort.confidenceLevel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
          <div className="text-xs text-text-secondary font-medium mb-1">5年无复发生存率 (RFS)</div>
          <div className="text-3xl font-bold text-accent-blue">{cohort.rfs5Year}</div>
        </div>
        <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/50">
          <div className="text-xs text-text-secondary font-medium mb-1">5年总生存率 (OS)</div>
          <div className="text-3xl font-bold text-accent-teal">{cohort.os5Year}</div>
        </div>
      </div>

      <div className="relative z-10 border-t border-gray-100 pt-4">
        <p className="text-sm text-text-secondary leading-relaxed mb-2">
          {cohort.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">数据源:</span>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            {cohort.source}
          </span>
        </div>
      </div>
    </div>
  );
}
