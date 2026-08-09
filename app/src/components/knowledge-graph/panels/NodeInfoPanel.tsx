import React from 'react';
import type { KnowledgeNode } from '@/lib/knowledgeGraphData';
import { typeColors, typeLabels } from '@/lib/knowledgeGraphData';

export function NodeInfoPanel({ node }: { node: KnowledgeNode }) {
  const colors = typeColors[node.type];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border flex-1" style={{ borderColor: colors.border }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.dot }} />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{node.label.replace("\n", " ")}</h3>
          <span className="text-xs" style={{ color: colors.text }}>{typeLabels[node.type]}</span>
        </div>
      </div>

      <p className="text-text-secondary text-sm leading-relaxed mb-4">{node.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-3 border border-white/5 text-center">
          <div className="text-xl font-bold text-gray-900 font-bold">{node.studies}</div>
          <div className="text-text-muted text-xs">相关研究</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3 border border-white/5 text-center">
          <div className="flex justify-center gap-0.5 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < node.evidence ? "currentColor" : "none"} stroke="currentColor" className={i < node.evidence ? "text-amber-400" : "text-white/10"}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
          </div>
          <div className="text-text-muted text-xs">证据等级</div>
        </div>
      </div>

      {node.connections.length > 0 && (
        <div>
          <p className="text-text-muted text-xs mb-2">关联因素 <span className="text-accent-teal/70">（点击连线查看文献）</span></p>
          <div className="flex flex-wrap gap-1">
            {node.connections.map((c) => (
              <span key={c} className="bg-gray-50 text-gray-500 text-xs px-2 py-0.5 rounded border border-gray-200">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
