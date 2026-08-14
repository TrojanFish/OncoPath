import React from 'react';
import type { KnowledgeNode } from '@/lib/knowledgeGraphData';
import { typeColors, typeLabels } from '@/lib/knowledgeGraphData';

export function NodeInfoPanel({ node }: { node: KnowledgeNode }) {
  const colors = typeColors[node.type] || typeColors.factor;

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 border flex-1" style={{ borderColor: colors.border }}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colors.dot }} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">{node.label.replace("\n", " ")}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: colors.text, backgroundColor: colors.bg }}>
            {typeLabels[node.type]}
          </span>
        </div>
      </div>

      <p className="text-slate-600 text-xs leading-relaxed mb-4">{node.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
          <div className="text-xl font-bold text-slate-900">{node.studies}</div>
          <div className="text-slate-500 text-xs mt-0.5">相关研究论文</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
          <div className="flex justify-center gap-0.5 mb-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < node.evidence ? "currentColor" : "none"} stroke="currentColor" className={i < node.evidence ? "text-amber-500" : "text-slate-200"}>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
              </svg>
            ))}
          </div>
          <div className="text-slate-500 text-xs">循证评级</div>
        </div>
      </div>

      {node.connections.length > 0 && (
        <div>
          <p className="text-slate-500 text-xs mb-2 font-medium">
            关联因果路径 <span className="text-teal-600 font-normal">（点击连线徽章可查看文献）</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {node.connections.map((c) => (
              <span key={c} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-md font-medium border border-slate-200">
                ➔ {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
