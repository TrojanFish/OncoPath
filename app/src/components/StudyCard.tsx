"use client";

import React from "react";
import { Sparkles, Dna, TrendingDown, Pill, ExternalLink, Check } from "lucide-react";
import { STUDY_TYPE_LABELS } from "@/lib/evidence-data";
import { EvidenceRating } from "@/components/common/EvidenceRating";

export interface StudyItem {
  id: string;
  title: string;
  journal: string;
  year: number;
  patientN: number;
  studyType: "rct" | "meta_analysis" | "prospective_multicenter" | "retrospective_multicenter" | "retrospective" | string;
  evidenceLevel: 1 | 2 | 3 | 4 | 5 | number;
  doi?: string;
  pubmedId?: string;
  url?: string;
  keyConclusions: string[];
  relevantFactors: string[];
  applicableStages?: string[];
  biomarkerDetails?: string;
  interventionArm?: string;
  riskReduction?: string;
  isIngested?: boolean;
}

interface StudyCardProps {
  study: StudyItem;
  compact?: boolean;
}

const studyTypeColors: Record<string, string> = {
  rct: "text-emerald-700 border-emerald-200 bg-emerald-50",
  meta_analysis: "text-purple-700 border-purple-200 bg-purple-50",
  prospective_multicenter: "text-blue-700 border-blue-200 bg-blue-50",
  retrospective_multicenter: "text-teal-700 border-teal-200 bg-teal-50",
  retrospective: "text-slate-600 border-slate-200 bg-slate-50",
};

const evidenceLevelLabels: Record<number, string> = {
  5: "最高证据 (RCT/Meta)",
  4: "高证据 (多中心队列)",
  3: "中等证据 (临床研究)",
  2: "低证据 (病例观察)",
  1: "专家意见",
};

export default function StudyCard({ study, compact = false }: StudyCardProps) {
  const typeColor = studyTypeColors[study.studyType] || studyTypeColors.retrospective;
  const sourceUrl = study.url || (study.doi ? `https://doi.org/${study.doi}` : (study.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${study.pubmedId}/` : null));

  if (compact) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm card-hover border border-gray-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-accent-blue font-semibold text-sm">{study.journal}</span>
          <span className="text-text-muted text-xs flex-shrink-0">{study.year}</span>
        </div>
        <p className="text-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">{study.title}</p>
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColor}`}>
            {STUDY_TYPE_LABELS[study.studyType as keyof typeof STUDY_TYPE_LABELS] || study.studyType}
          </span>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{study.patientN.toLocaleString()}例</span>
            <EvidenceRating level={study.evidenceLevel} maxLevel={5} size="sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-5 md:p-6 shadow-sm card-hover border border-slate-200 flex flex-col justify-between transition-all">
      <div>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-accent-blue font-bold text-sm">{study.journal}</span>
              <span className="text-slate-400 text-xs font-medium">({study.year})</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${typeColor}`}>
                {STUDY_TYPE_LABELS[study.studyType as keyof typeof STUDY_TYPE_LABELS] || study.studyType}
              </span>
              {study.isIngested && (
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>官方最新录入</span>
                </span>
              )}
            </div>
            <h3 className="text-slate-900 text-sm font-bold leading-snug">{study.title}</h3>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-lg font-bold text-slate-900">{study.patientN > 0 ? study.patientN.toLocaleString() : "N/A"}</div>
            <div className="text-slate-400 text-[11px]">例患者队列</div>
          </div>
        </div>

        {/* Evidence level */}
        <div className="flex items-center gap-2 mb-4">
          <EvidenceRating level={study.evidenceLevel} maxLevel={5} size="sm" />
          <span className="text-slate-500 text-xs font-medium">{evidenceLevelLabels[study.evidenceLevel] || `等级 ${study.evidenceLevel}`}</span>
        </div>

        {/* Frontier Biomarker & Intervention badges if available */}
        {(study.biomarkerDetails || study.riskReduction || study.interventionArm) && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1.5">
            {study.biomarkerDetails && (
              <div className="text-blue-900 font-semibold flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>靶点亚型: {study.biomarkerDetails}</span>
              </div>
            )}
            {study.riskReduction && (
              <div className="text-emerald-700 font-bold flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>临床获益: {study.riskReduction}</span>
              </div>
            )}
            {study.interventionArm && (
              <div className="text-slate-600 text-[11px] truncate flex items-center gap-1.5" title={study.interventionArm}>
                <Pill className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{study.interventionArm}</span>
              </div>
            )}
          </div>
        )}

        {/* Key conclusions */}
        <div className="space-y-2 mb-4">
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">核心临床结论</h4>
          {study.keyConclusions.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <Check className="w-3.5 h-3.5 text-accent-teal mt-0.5 flex-shrink-0" />
              <span className="text-slate-700 leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with Source URL & Factor Badges */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {study.relevantFactors.slice(0, 3).map((f) => (
            <span key={f} className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded">
              {f}
            </span>
          ))}
        </div>

        {/* Source Link Actions */}
        <div className="flex items-center gap-2">
          {sourceUrl ? (
            <a
              id={`study-source-${study.id}`}
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-accent-blue text-accent-blue hover:text-white border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>查看原文出处</span>
            </a>
          ) : (
            <span className="text-[11px] text-slate-400">已收录于内部医学库</span>
          )}
        </div>
      </div>
    </div>
  );
}
