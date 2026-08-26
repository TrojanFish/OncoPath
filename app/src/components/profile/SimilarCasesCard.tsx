"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  BookOpen,
  Sun,
  Apple,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { PatientProfile } from "@/lib/types";
import { getClinicalCohortForProfile, ClinicalCohortResult } from "@/lib/staging";

interface SimilarCasesCardProps {
  profile: PatientProfile;
}

export default function SimilarCasesCard({ profile }: SimilarCasesCardProps) {
  const [cohort, setCohort] = useState<ClinicalCohortResult>(() => getClinicalCohortForProfile(profile));
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  useEffect(() => {
    // 1. Immediately synchronously update local state on any profile prop change (0ms instant response)
    const localCohort = getClinicalCohortForProfile(profile);
    setCohort(localCohort);

    // 2. Concurrently sync with backend API
    let isMounted = true;
    async function syncSimilarCases() {
      try {
        const res = await fetch("/api/similar-cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        const data = await res.json();
        if (data.success && isMounted && data.data) {
          setCohort(data.data);
        }
      } catch (err) {
        console.error("Notice: API sync for similar cases:", err);
      }
    }
    syncSimilarCases();

    return () => {
      isMounted = false;
    };
  }, [profile]);

  if (!cohort) return null;

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 border-t-4 border-t-emerald-500 shadow-sm relative overflow-hidden group">
      
      {/* Background Soft Ambient Light */}
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-gradient-to-br from-blue-500/5 via-teal-500/5 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 relative z-10 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 shrink-0" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              相似病例群体预后分析
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
              SIMILAR CLINICAL COHORTS · REAL-WORLD EVIDENCE
            </p>
          </div>
        </div>

        {/* Compact Integrated Confidence Pill */}
        <div className="flex items-center gap-2 bg-slate-50/90 border border-slate-200/90 px-3 py-1.5 rounded-full self-start sm:self-auto shrink-0 shadow-2xs">
          <div className="text-[10px] text-slate-400 font-bold whitespace-nowrap">循证置信度</div>
          <div className="text-slate-300">|</div>
          <span className="text-amber-500 text-xs font-bold flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{cohort.confidenceRating}</span>
          </span>
          <span className="text-[10px] sm:text-[11px] font-extrabold text-teal-800 bg-teal-50/90 px-2 py-0.2 rounded-full border border-teal-200 shrink-0 whitespace-nowrap">
            {cohort.confidenceLevel}
          </span>
        </div>
      </div>

      {/* Cohort Feature Badges Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-5 relative z-10">
        <span className="text-[10px] sm:text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 shrink-0 whitespace-nowrap inline-flex items-center gap-1 shadow-2xs">
          <Users className="w-3 h-3 text-indigo-600 shrink-0" />
          <span>已匹配 <strong>{cohort.cohortSize.toLocaleString()}</strong> 例相似特征</span>
        </span>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shrink-0 whitespace-nowrap">
          国际顶刊前瞻队列
        </span>
        {cohort.stage && (
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
            {cohort.stage}
          </span>
        )}
        {cohort.keyFactors && cohort.keyFactors.length > 0 && cohort.keyFactors.map((kf: string, idx: number) => (
          <span key={idx} className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0 whitespace-nowrap">
            {kf}
          </span>
        ))}
      </div>

      {/* Metric Cards with Interactive Hover Explanations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 relative z-10">
        
        {/* RFS Metric Card */}
        <div 
          className="bg-gradient-to-br from-blue-50/70 via-sky-50/40 to-white rounded-2xl p-4 sm:p-5 border border-blue-100 relative transition-all hover:shadow-sm"
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
              {cohort.isPreOp ? "根治治愈潜力" : "无瘤生存指标"}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {cohort.rfs5Year}
          </div>

          {/* RFS Tooltip Hover Popup */}
          {hoveredTerm === "RFS" && (
            <div className="absolute -top-2 left-4 right-4 -translate-y-full z-30 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-xl text-xs leading-relaxed border border-slate-700 animate-fade-in-up">
              <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                <span>什么是 5年无复发生存率 (RFS)？</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                <strong>RFS (Relapse-Free Survival)</strong> 指手术完全切除后，5 年内身体<strong>未出现任何局部复发或远处转移</strong>的患者比例。在肿瘤医学中，肺癌术后 5 年未复发通常在临床上视为达到“临床治愈”。
              </p>
            </div>
          )}
        </div>

        {/* OS Metric Card */}
        <div 
          className="bg-gradient-to-br from-teal-50/70 via-emerald-50/40 to-white rounded-2xl p-4 sm:p-5 border border-teal-100 relative transition-all hover:shadow-sm"
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

          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-teal-600 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {cohort.os5Year}
          </div>

          {/* OS Tooltip Hover Popup */}
          {hoveredTerm === "OS" && (
            <div className="absolute -top-2 left-4 right-4 -translate-y-full z-30 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-xl text-xs leading-relaxed border border-slate-700 animate-fade-in-up">
              <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>什么是 5年总生存率 (OS)？</span>
              </div>
              <p className="text-slate-200 text-[11px] leading-relaxed">
                <strong>OS (Overall Survival)</strong> 指从确诊或手术开始，<strong>5 年后依然健在的患者百分比</strong>。这是国际公认衡量肿瘤整体长期治疗效果最高权威的“硬终点”。
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Cohort Clinical Interpretation & Real-World Source Panel */}
      <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50/90 via-blue-50/20 to-teal-50/20 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
            <Lightbulb className="w-3.5 h-3.5 text-teal-700" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>循证特征解读与随访指引</span>
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.2 rounded-md border border-teal-200/60">
                个体化匹配
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
              {cohort.description}
            </p>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-400">真实队列来源:</span>
            <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-3xs">
              {cohort.source}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Level-1 Evidence · Peer-Reviewed
          </span>
        </div>
      </div>

      {/* Warm Compassionate & Empowerment Banner (暖心抗癌赋能与心理支持) */}
      <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-teal-50/60 border border-amber-200/80 shadow-xs relative z-10">
        {/* Title Row with Compact Inline Sun Badge */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100/90 text-amber-600 flex items-center justify-center text-sm sm:text-base shadow-2xs flex-shrink-0 border border-amber-300/70">
            <Sun className="w-4 h-4 text-amber-600" />
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
              <Apple className="w-3.5 h-3.5 text-amber-700" />
              <span>营养与强健体魄</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              保证优质蛋白摄入，温和散步或太极八段锦，激活机体杀伤性 T 细胞活力。
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-teal-200/70 shadow-2xs">
            <div className="text-[12px] font-bold text-teal-900 mb-1 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-teal-700" />
              <span>乐观心境与神经免疫</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              研究证实良好情绪能显著降低皮质醇压力激素，为机体细胞修复创造最佳微环境。
            </div>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-blue-200/70 shadow-2xs">
            <div className="text-[12px] font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
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
