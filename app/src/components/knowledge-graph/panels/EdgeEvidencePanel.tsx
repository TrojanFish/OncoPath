import React from 'react';
import type { EdgeEvidence } from '@/lib/knowledgeGraphData';
import { MiniForestPlot } from '../MiniForestPlot';

export function EdgeEvidencePanel({ edgeKey, evidence, onClose }: { edgeKey: string; evidence: EdgeEvidence; onClose: () => void }) {
  return (
    <div className="glass rounded-2xl p-5 border border-accent-blue/30 flex-1 overflow-y-auto max-h-[500px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full border border-accent-blue/20">连线证据</span>
          </div>
          <h3 className="font-semibold text-text-primary text-sm">{evidence.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-text-muted hover:text-text-primary transition-colors text-lg leading-none cursor-pointer ml-2 flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Description */}
      <p className="text-text-secondary text-xs leading-relaxed mb-4">{evidence.description}</p>

      {/* Key Metric */}
      {evidence.metric && (
        <div className="glass rounded-xl p-3 border border-accent-blue/20 mb-4">
          <div className="text-text-muted text-xs mb-1">{evidence.metric.label}</div>
          <div className="text-xl font-bold text-gradient">{evidence.metric.value}</div>
          <div className="flex gap-3 mt-1">
            <span className="text-text-muted text-xs">95% CI: {evidence.metric.ci}</span>
            <span className="text-text-muted text-xs">p = {evidence.metric.p}</span>
          </div>
        </div>
      )}

      {/* Mini Forest Plot */}
      {evidence.forestData && evidence.forestData.length > 0 && (
        <MiniForestPlot data={evidence.forestData} />
      )}

      {/* Literature List */}
      <div>
        <p className="text-text-muted text-xs font-medium mb-2">📚 核心文献依据</p>
        <div className="space-y-3">
          {evidence.studies.map((study, i) => (
            <div key={i} className="glass rounded-xl p-3 border border-white/5">
              <p className="text-text-primary text-xs font-medium leading-snug mb-1">{study.title}</p>
              <div className="flex gap-2 text-xs text-text-muted mb-2">
                <span className="text-accent-teal">{study.journal}</span>
                <span>{study.year}</span>
              </div>
              <p className="text-text-secondary text-xs leading-relaxed mb-2">{study.conclusion}</p>
              <a
                href={`https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue text-xs hover:underline flex items-center gap-1"
              >
                DOI: {study.doi}
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
