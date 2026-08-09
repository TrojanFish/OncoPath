"use client";

import type { Study } from "@/lib/evidence-data";
import { STUDY_TYPE_LABELS } from "@/lib/evidence-data";

interface StudyCardProps {
  study: Study;
  compact?: boolean;
}

const studyTypeColors: Record<string, string> = {
  rct: "text-green-400 border-green-500/30 bg-green-500/10",
  meta_analysis: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  prospective_multicenter: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  retrospective_multicenter: "text-teal-400 border-teal-500/30 bg-teal-500/10",
  retrospective: "text-gray-500 border-gray-200 bg-gray-50",
};

const evidenceLevelLabels: Record<number, string> = {
  5: "最高证据",
  4: "高证据",
  3: "中等证据",
  2: "低证据",
  1: "专家意见",
};

export default function StudyCard({ study, compact = false }: StudyCardProps) {
  const typeColor = studyTypeColors[study.studyType] || studyTypeColors.retrospective;

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
            {STUDY_TYPE_LABELS[study.studyType]}
          </span>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>{study.patientN.toLocaleString()}例</span>
            <EvidenceStars count={study.evidenceLevel} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm card-hover border border-gray-200">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-accent-blue font-bold text-sm">{study.journal}</span>
            <span className="text-text-muted text-sm">{study.year}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${typeColor}`}>
              {STUDY_TYPE_LABELS[study.studyType]}
            </span>
          </div>
          <h3 className="text-text-primary text-sm font-medium leading-relaxed">{study.title}</h3>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xl font-bold text-gray-900">{study.patientN.toLocaleString()}</div>
          <div className="text-text-muted text-xs">例患者</div>
        </div>
      </div>

      {/* Evidence level */}
      <div className="flex items-center gap-2 mb-4">
        <EvidenceStars count={study.evidenceLevel} />
        <span className="text-text-muted text-xs">{evidenceLevelLabels[study.evidenceLevel]}</span>
      </div>

      {/* Key conclusions */}
      <div className="space-y-2">
        <h4 className="text-text-muted text-xs font-medium uppercase tracking-wider">关键结论</h4>
        {study.keyConclusions.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-accent-teal mt-1 flex-shrink-0">→</span>
            <span className="text-text-secondary leading-relaxed">{c}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {study.relevantFactors.slice(0, 3).map((f) => (
            <span key={f} className="bg-gray-50 text-gray-500 text-xs px-2 py-0.5 rounded border border-gray-200">
              {f}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {study.doi && (
            <a
              id={`study-doi-${study.id}`}
              href={`https://doi.org/${study.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-teal text-xs hover:underline flex items-center gap-1"
            >
              DOI
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          {study.pubmedId && (
            <a
              id={`study-pubmed-${study.id}`}
              href={`https://pubmed.ncbi.nlm.nih.gov/${study.pubmedId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue text-xs hover:underline flex items-center gap-1"
            >
              PubMed
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="12" height="12" viewBox="0 0 24 24"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          className={i < count ? "text-amber-400" : "text-gray-200"}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}
