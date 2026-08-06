import React from 'react';
import type { EdgeEvidence } from '@/lib/knowledgeGraphData';

export function MiniForestPlot({ data }: { data: NonNullable<EdgeEvidence["forestData"]> }) {
  if (!data || data.length === 0) return null;
  const maxHR = Math.max(...data.map((d) => d.ciHigh), 6);
  const minHR = Math.min(...data.map((d) => d.ciLow), 0.5);
  const range = maxHR - minHR;
  const toX = (hr: number) => ((hr - minHR) / range) * 80 + 10;

  return (
    <div className="mb-4">
      <p className="text-text-muted text-xs mb-2 font-medium">📊 森林图（风险比 HR）</p>
      <svg viewBox="0 0 100 30" className="w-full rounded-lg bg-black/20 px-1 py-1" style={{ height: data.length * 22 + 20 }}>
        {/* Reference line at HR=1 */}
        <line x1={toX(1)} y1="0" x2={toX(1)} y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="1,1" />
        {data.map((d, i) => {
          const y = i * 22 + 12;
          const cx = toX(d.hr);
          const x1 = toX(d.ciLow);
          const x2 = toX(d.ciHigh);
          return (
            <g key={d.study}>
              <text x="2" y={y + 1} fontSize="3" fill="rgba(255,255,255,0.5)">{d.study} {d.year}</text>
              <line x1={x1} y1={y + 8} x2={x2} y2={y + 8} stroke="rgba(239,68,68,0.6)" strokeWidth="0.6" />
              <rect x={cx - 1} y={y + 6} width="2" height="4" fill="rgba(239,68,68,0.9)" />
            </g>
          );
        })}
        <text x={toX(1) - 1} y="100" fontSize="2.5" fill="rgba(255,255,255,0.3)" textAnchor="middle">HR=1</text>
      </svg>
    </div>
  );
}
