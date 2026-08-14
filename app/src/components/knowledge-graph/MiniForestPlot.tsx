import React from 'react';
import type { EdgeEvidence } from '@/lib/knowledgeGraphData';

export function MiniForestPlot({ data }: { data: NonNullable<EdgeEvidence["forestData"]> }) {
  if (!data || data.length === 0) return null;
  const maxHR = Math.max(...data.map((d) => d.ciHigh), 5);
  const minHR = Math.min(...data.map((d) => d.ciLow), 0.2);
  const range = Math.max(maxHR - minHR, 1);
  const toX = (hr: number) => ((hr - minHR) / range) * 75 + 15;

  return (
    <div className="mb-4">
      <p className="text-slate-700 text-xs mb-2 font-bold flex items-center gap-1">
        <span>📊</span> 森林图（风险比 Hazard Ratio）
      </p>
      <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-2.5">
        <svg viewBox="0 0 100 40" className="w-full select-none" style={{ height: Math.max(data.length * 28 + 15, 60) }}>
          {/* Reference line at HR=1 */}
          <line x1={toX(1)} y1="4" x2={toX(1)} y2="34" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1,1" />
          <text x={toX(1)} y="38" fontSize="2.4" fill="#64748b" fontWeight="600" textAnchor="middle">HR=1.0</text>

          {data.map((d, i) => {
            const y = i * 11 + 9;
            const cx = toX(d.hr);
            const x1 = Math.max(toX(d.ciLow), 4);
            const x2 = Math.min(toX(d.ciHigh), 96);
            return (
              <g key={d.study}>
                <text x="2" y={y - 1} fontSize="2.5" fontWeight="600" fill="#334155">{d.study} ({d.year})</text>
                <text x="98" y={y - 1} fontSize="2.3" fontWeight="bold" fill="#dc2626" textAnchor="end">HR={d.hr.toFixed(2)}</text>
                {/* 95% CI Whisker */}
                <line x1={x1} y1={y + 3} x2={x2} y2={y + 3} stroke="#f87171" strokeWidth="0.6" />
                <line x1={x1} y1={y + 1.5} x2={x1} y2={y + 4.5} stroke="#f87171" strokeWidth="0.4" />
                <line x1={x2} y1={y + 1.5} x2={x2} y2={y + 4.5} stroke="#f87171" strokeWidth="0.4" />
                {/* Point estimate marker */}
                <rect x={cx - 1} y={y + 1.8} width="2" height="2.4" rx="0.4" fill="#dc2626" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
