"use client";

import { useState } from "react";

interface KnowledgeNode {
  id: string;
  label: string;
  type: "factor" | "outcome" | "evidence" | "guideline";
  x: number;
  y: number;
  connections: string[];
  studies: number;
  evidence: number;
  description: string;
}

const nodes: KnowledgeNode[] = [
  {
    id: "STAS", label: "STAS", type: "factor",
    x: 20, y: 35,
    connections: ["RECURRENCE", "SURGERY", "LVI"],
    studies: 18, evidence: 5,
    description: "气道播散：肿瘤细胞沿肺泡播散，影响局部复发。18项研究证实其预后价值。",
  },
  {
    id: "CTR", label: "CTR", type: "factor",
    x: 50, y: 15,
    connections: ["RECURRENCE", "STAGING", "SURGERY"],
    studies: 22, evidence: 5,
    description: "实性成分比例：CT影像关键参数，CTR≤0.5与显著更好预后相关。",
  },
  {
    id: "IASLC", label: "IASLC\nGrade", type: "factor",
    x: 80, y: 35,
    connections: ["RECURRENCE", "ADJUVANT"],
    studies: 12, evidence: 4,
    description: "IASLC分级：三级病理分级系统，Grade 3患者预后明显更差。",
  },
  {
    id: "LVI", label: "LVI", type: "factor",
    x: 15, y: 65,
    connections: ["RECURRENCE", "METASTASIS"],
    studies: 14, evidence: 4,
    description: "淋巴血管侵犯：肿瘤侵入血管，增加远处转移风险。",
  },
  {
    id: "VPI", label: "VPI", type: "factor",
    x: 85, y: 65,
    connections: ["STAGING", "ADJUVANT"],
    studies: 8, evidence: 5,
    description: "脏层胸膜侵犯：影响T分期，VPI阳性使T1上调至T2。",
  },
  {
    id: "EGFR", label: "EGFR", type: "factor",
    x: 50, y: 80,
    connections: ["ADJUVANT", "TARGETED"],
    studies: 9, evidence: 5,
    description: "EGFR突变：靶向治疗重要靶点，中国患者突变率约40-60%。",
  },
  {
    id: "RECURRENCE", label: "复发风险", type: "outcome",
    x: 50, y: 45,
    connections: [],
    studies: 35, evidence: 5,
    description: "综合多项研究的复发风险指标，与多种病理因素相关。",
  },
  {
    id: "SURGERY", label: "手术方式", type: "guideline",
    x: 30, y: 10,
    connections: [],
    studies: 6, evidence: 5,
    description: "JCOG0802（Lancet 2022）证实肺段切除与肺叶切除在小型肺癌中预后相当。",
  },
  {
    id: "ADJUVANT", label: "辅助治疗", type: "guideline",
    x: 75, y: 85,
    connections: [],
    studies: 4, evidence: 5,
    description: "ADAURA（NEJM 2023）证实EGFR阳性II-IIIA期患者辅助靶向治疗获益显著。",
  },
  {
    id: "STAGING", label: "TNM分期", type: "guideline",
    x: 70, y: 12,
    connections: [],
    studies: 12, evidence: 5,
    description: "IASLC第9版分期系统，采用实性成分大小而非总大小分期。",
  },
];

const typeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  factor: { bg: "rgba(79,142,247,0.1)", border: "rgba(79,142,247,0.4)", text: "#4f8ef7", dot: "#4f8ef7" },
  outcome: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.4)", text: "#ef4444", dot: "#ef4444" },
  evidence: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)", text: "#f59e0b", dot: "#f59e0b" },
  guideline: { bg: "rgba(0,212,170,0.1)", border: "rgba(0,212,170,0.4)", text: "#00d4aa", dot: "#00d4aa" },
};

const typeLabels: Record<string, string> = {
  factor: "病理因素",
  outcome: "临床结局",
  evidence: "证据节点",
  guideline: "指南建议",
};

export default function KnowledgeMapPreview() {
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);

  const activeNode = selectedNode || hoveredNode;

  return (
    <div className="mt-12">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div className="lg:col-span-2 glass rounded-2xl border border-white/5 overflow-hidden relative" style={{ minHeight: 400 }}>
          <div className="absolute inset-0 bg-grid opacity-50" />
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ minHeight: 400 }}
          >
            {/* Connection lines */}
            {nodes.map((node) =>
              node.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;
                const isActive = activeNode?.id === node.id || activeNode?.id === targetId;
                return (
                  <line
                    key={`${node.id}-${targetId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isActive ? "rgba(79,142,247,0.5)" : "rgba(255,255,255,0.06)"}
                    strokeWidth={isActive ? "0.5" : "0.3"}
                    strokeDasharray={isActive ? "none" : "1,1"}
                  />
                );
              })
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const colors = typeColors[node.type];
              const isActive = activeNode?.id === node.id;
              const isConnected =
                activeNode?.connections.includes(node.id) ||
                nodes.find((n) => n.id === activeNode?.id)?.connections.includes(node.id);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glow for active */}
                  {isActive && (
                    <circle r="5" fill={colors.dot} opacity="0.2" />
                  )}
                  <circle
                    r="3.5"
                    fill={colors.bg}
                    stroke={isActive ? colors.dot : isConnected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={isActive ? "0.6" : "0.4"}
                  />
                  <circle r="1.5" fill={colors.dot} opacity={isActive ? 1 : 0.7} />
                  <text
                    textAnchor="middle"
                    dy="5.5"
                    fontSize="2.5"
                    fill={isActive ? colors.text : "rgba(255,255,255,0.5)"}
                    fontWeight={isActive ? "bold" : "normal"}
                  >
                    {node.label.split("\n")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3">
            {Object.entries(typeColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors.dot, opacity: 0.8 }}
                />
                <span className="text-text-muted text-xs">{typeLabels[type]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex flex-col gap-4">
          {activeNode ? (
            <NodeInfoPanel node={activeNode} />
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center flex-1">
              <div className="text-4xl mb-3 opacity-50">🕸️</div>
              <p className="text-text-muted text-sm">点击或悬停节点查看详细信息</p>
              <p className="text-text-muted text-xs mt-2">每个节点代表一个循证指标</p>
            </div>
          )}

          {/* Quick facts */}
          <div className="glass rounded-2xl p-5 border border-white/5">
            <h4 className="text-text-secondary text-sm font-medium mb-3">知识图谱统计</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: "因素节点", value: "10个", color: "text-accent-blue" },
                { label: "证据连接", value: "23条", color: "text-accent-teal" },
                { label: "覆盖论文", value: "42篇", color: "text-purple-400" },
                { label: "每日自动更新", value: "PubMed", color: "text-amber-400" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-text-muted">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NodeInfoPanel({ node }: { node: KnowledgeNode }) {
  const colors = typeColors[node.type];

  return (
    <div className="glass rounded-2xl p-5 border flex-1" style={{ borderColor: colors.border }}>
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
        <div className="glass rounded-xl p-3 border border-white/5 text-center">
          <div className="text-xl font-bold text-gradient">{node.studies}</div>
          <div className="text-text-muted text-xs">相关研究</div>
        </div>
        <div className="glass rounded-xl p-3 border border-white/5 text-center">
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
          <p className="text-text-muted text-xs mb-2">关联因素</p>
          <div className="flex flex-wrap gap-1">
            {node.connections.map((c) => (
              <span key={c} className="glass text-text-muted text-xs px-2 py-0.5 rounded border border-white/10">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
