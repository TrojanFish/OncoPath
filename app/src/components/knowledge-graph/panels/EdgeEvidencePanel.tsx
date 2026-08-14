import React from 'react';
import type { EdgeEvidence } from '@/lib/knowledgeGraphData';
import { MiniForestPlot } from '../MiniForestPlot';

export function EdgeEvidencePanel({ edgeKey, evidence, onClose }: { edgeKey: string; evidence: EdgeEvidence; onClose: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-200/80 flex-1 overflow-y-auto max-h-[550px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-blue-700 bg-blue-50 font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
              ⚡ 循证因果关联
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm">{evidence.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-6 h-6 rounded-full flex items-center justify-center transition-colors text-lg leading-none cursor-pointer ml-2 flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Description */}
      <p className="text-slate-600 text-xs leading-relaxed mb-4">{evidence.description}</p>

      {/* Key Metric */}
      {evidence.metric && (
        <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100 mb-4">
          <div className="text-slate-500 text-xs font-medium mb-0.5">{evidence.metric.label}</div>
          <div className="text-2xl font-black text-blue-900">{evidence.metric.value}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
            <span>{evidence.metric.ci}</span>
            <span className="font-medium text-blue-700">{evidence.metric.p}</span>
          </div>
        </div>
      )}

      {/* Mini Forest Plot */}
      {evidence.forestData && evidence.forestData.length > 0 && (
        <div className="mb-4">
          <MiniForestPlot data={evidence.forestData} />
        </div>
      )}

      {/* Literature List */}
      {evidence.studies && evidence.studies.length > 0 && (
        <div>
          <p className="text-slate-700 text-xs font-bold mb-2 flex items-center gap-1.5">
            <span>📚</span> 核心文献依据与同行评审出处
          </p>
          <div className="space-y-3">
            {evidence.studies.map((study, i) => (
              <div key={i} className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
                <p className="text-slate-900 text-xs font-bold leading-snug mb-1">{study.title}</p>
                <div className="flex gap-2 text-xs text-slate-500 mb-1.5 font-medium">
                  <span className="text-teal-700 font-semibold">{study.journal}</span>
                  <span>({study.year})</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed mb-2">{study.conclusion}</p>
                {study.doi && (
                  <a
                    href={study.doi.startsWith('http') ? study.doi : `https://doi.org/${study.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline inline-flex items-center gap-1"
                  >
                    DOI: {study.doi}
                    <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
