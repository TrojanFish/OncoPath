"use client";

import React, { useState, useEffect } from "react";
import type { PatientProfile } from "@/lib/types";

interface SimilarCasesCardProps {
  profile: PatientProfile;
}

export default function SimilarCasesCard({ profile }: SimilarCasesCardProps) {
  const [cohort, setCohort] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm animate-pulse h-48 flex items-center justify-center">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>正在检索国际顶级临床前瞻性队列与相似病例...</span>
        </div>
      </div>
    );
  }

  if (!cohort) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
      
      {/* Background Soft Ambient Light */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-blue-500/5 via-teal-500/5 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 relative z-10 pb-4 border-b border-slate-100">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <span>SIMILAR CLINICAL COHORTS · 相似病例群体预后</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 normal-case">
              国际顶刊前瞻队列
            </span>
          </div>
          <h3 className="text-slate-900 font-extrabold text-lg sm:text-xl">
            为您匹配到 {cohort.cohortSize.toLocaleString()} 例特征相似的真实世界患者
          </h3>
        </div>

        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
          <div className="text-[11px] text-slate-400 font-medium">循证置信度 (Confidence)</div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 text-sm font-bold">{cohort.confidenceRating}</span>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {cohort.confidenceLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards with Interactive Hover Explanations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
        
        {/* RFS Metric Card */}
        <div 
          className="bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-white rounded-2xl p-5 border border-blue-100 relative transition-all hover:shadow-sm"
          onMouseEnter={() => setHoveredTerm("RFS")}
          onMouseLeave={() => setHoveredTerm(null)}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <span>5年无复发生存率 (RFS)</span>
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] cursor-help font-bold shadow-2xs">
                ?
              </span>
            </div>
            <span className="text-[10px] text-blue-600 font-semibold bg-white/90 px-2 py-0.5 rounded-md border border-blue-200/60 shadow-2xs">
              无瘤生存指标
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
            {cohort.rfs5Year}
          </div>

          {/* RFS Tooltip Hover Popup */}
          {hoveredTerm === "RFS" && (
            <div className="absolute -top-2 left-4 right-4 -translate-y-full z-30 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-xl text-xs leading-relaxed border border-slate-700 animate-fade-in-up">
              <div className="font-bold text-sky-400 mb-1 flex items-center gap-1">
                <span>💡 什么是 5年无复发生存率 (RFS)？</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                <strong>RFS (Relapse-Free Survival)</strong> 指手术完全切除后，5 年内身体<strong>未出现任何局部复发或远处转移</strong>的患者比例。在肿瘤医学中，肺癌术后 5 年未复发通常在临床上视为达到“临床治愈”。
              </p>
            </div>
          )}
        </div>

        {/* OS Metric Card */}
        <div 
          className="bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white rounded-2xl p-5 border border-teal-100 relative transition-all hover:shadow-sm"
          onMouseEnter={() => setHoveredTerm("OS")}
          onMouseLeave={() => setHoveredTerm(null)}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
              <span>5年总生存率 (OS)</span>
              <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] cursor-help font-bold shadow-2xs">
                ?
              </span>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold bg-white/90 px-2 py-0.5 rounded-md border border-teal-200/60 shadow-2xs">
              终极金标准
            </span>
          </div>

          <div className="text-3xl sm:text-4xl font-black text-teal-600 tracking-tight">
            {cohort.os5Year}
          </div>

          {/* OS Tooltip Hover Popup */}
          {hoveredTerm === "OS" && (
            <div className="absolute -top-2 left-4 right-4 -translate-y-full z-30 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-xl text-xs leading-relaxed border border-slate-700 animate-fade-in-up">
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                <span>💡 什么是 5年总生存率 (OS)？</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                <strong>OS (Overall Survival)</strong> 指从确诊或手术开始，<strong>5 年后依然健在的患者百分比</strong>。这是国际公认衡量肿瘤整体长期治疗效果最高权威的“硬终点”。
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Cohort Description & Source */}
      <div className="relative z-10 pb-5 border-b border-slate-100">
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3 font-medium">
          {cohort.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">真实队列来源:</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            📚 {cohort.source}
          </span>
        </div>
      </div>

      {/* Warm Compassionate & Empowerment Banner (暖心抗癌赋能与心理支持) */}
      <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-teal-50/60 border border-amber-200/80 shadow-xs relative z-10">
        {/* Title Row with Compact Inline Sun Badge */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100/90 text-amber-600 flex items-center justify-center text-sm sm:text-base shadow-2xs flex-shrink-0 border border-amber-300/70">
            ☀️
          </div>
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
            给每一位勇敢抗癌伙伴的温暖寄语：数据是群体的历史，而奇迹由您亲自书写
          </h4>
        </div>

        {/* 100% Full-Width Description Paragraph */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3.5">
          医学文献中的生存率是基于成千上万名患者大样本的历史统计概率，但<strong>落到您身上只有 0% 和 100%</strong>。现代肺癌已进入规范化精准诊疗时代，把专业治疗交给医生，把信心与热爱留给生活：
        </p>

        {/* 3 Full-Width Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-white/90 p-3 rounded-xl border border-amber-200/70 shadow-2xs">
            <div className="text-[12px] font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <span>🥦</span>
              <span>营养与强健体魄</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              保证优质蛋白摄入，温和散步或太极八段锦，激活机体杀伤性 T 细胞活力。
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-teal-200/70 shadow-2xs">
            <div className="text-[12px] font-bold text-teal-900 mb-1 flex items-center gap-1.5">
              <span>🌈</span>
              <span>乐观心境与神经免疫</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              研究证实良好情绪能显著降低皮质醇压力激素，为机体细胞修复创造最佳微环境。
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-blue-200/70 shadow-2xs">
            <div className="text-[12px] font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <span>🕊️</span>
              <span>规律随访，坦然从容</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              按时完成胸部 CT 复查，把担忧托付给科学规律，每一天都充满生机与希望。
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
