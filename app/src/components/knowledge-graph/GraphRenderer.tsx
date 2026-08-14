import React from 'react';
import type { KnowledgeNode } from '@/lib/knowledgeGraphData';
import type { PatientProfile } from '@/lib/types';
import { typeColors, getNodeActivation, SANDBOX_NODES } from '@/lib/knowledgeGraphData';
import type { EdgeEvidence } from '@/lib/knowledgeGraphData';

interface GraphRendererProps {
  currentNodes: KnowledgeNode[];
  activeNode: KnowledgeNode | null;
  hoveredNode: KnowledgeNode | null;
  selectedEdge: string | null;
  hoveredEdge: string | null;
  sandboxMode: boolean;
  sandboxActive: Set<string>;
  personalMode: boolean;
  profile: PatientProfile | null;
  timeYears: number;
  edgeEvidences: Record<string, EdgeEvidence>;
  onNodeClick: (node: KnowledgeNode) => void;
  onNodeHover: (node: KnowledgeNode | null) => void;
  onEdgeClick: (edgeKey: string, e: React.MouseEvent) => void;
  onEdgeHover: (edgeKey: string | null) => void;
}

export function GraphRenderer({
  currentNodes,
  activeNode,
  hoveredNode,
  selectedEdge,
  hoveredEdge,
  sandboxMode,
  sandboxActive,
  personalMode,
  profile,
  timeYears,
  edgeEvidences,
  onNodeClick,
  onNodeHover,
  onEdgeClick,
  onEdgeHover
}: GraphRendererProps) {

  // Sandbox Protective Edges
  const activeProtectiveEdges = Array.from(sandboxActive).flatMap((id) =>
    SANDBOX_NODES[id]?.protectiveEdges.map(pe => ({ from: id, to: pe.target, label: pe.label })) || []
  );

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full relative z-10 select-none"
    >
      {/* Arrow marker & filter definitions for Light Medical Theme */}
      <defs>
        <marker id="arrow-risk" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#ef4444" />
        </marker>
        <marker id="arrow-guides" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#0d9488" />
        </marker>
        <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
        </marker>
        <marker id="arrow-active" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5 z" fill="#2563eb" />
        </marker>
        <marker id="arrow-personal" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5 z" fill="#dc2626" />
        </marker>
        <marker id="arrow-protect" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#16a34a" />
        </marker>
        
        {/* Soft Drop Shadows */}
        <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.8" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
        <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodColor="#0f172a" floodOpacity="0.15" />
        </filter>
        <filter id="glow-active" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Grid Pattern Background for Medical Visual Polish */}
      <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.3" />
      </pattern>
      <rect width="100" height="100" fill="url(#grid-pattern)" />

      {/* Connection lines */}
      {currentNodes.map((node) =>
        node.connections.map((targetId) => {
          const target = currentNodes.find((n) => n.id === targetId);
          if (!target) return null;
          const edgeKey = `${node.id}-${targetId}`;
          const isNodeActive = activeNode?.id === node.id || activeNode?.id === targetId;
          const isEdgeSelected = selectedEdge === edgeKey;
          const isEdgeHovered = hoveredEdge === edgeKey;
          const evidence = edgeEvidences[edgeKey];
          const hasEvidence = !!evidence;
          const relType = (node.connectionTypes || {})[targetId] || "default";
          const isAiEdge = node.id === "ctDNA" || targetId === "ctDNA";

          // Personal mode edge logic
          const srcActivation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
          const tgtActivation = personalMode && profile ? getNodeActivation(targetId, profile) : "normal";
          const isPersonalHighlight = personalMode && srcActivation === "active" && tgtActivation === "active";
          const isPersonalDim = personalMode && (srcActivation === "dim" || tgtActivation === "dim");

          // Time slider attenuation logic
          let timeOpacityAdjust = 1;
          let timeWidthAdjust = 1;
          if (relType === "risk" && timeYears > 0) {
            timeOpacityAdjust = Math.max(0.2, 1 - (timeYears * 0.16));
            timeWidthAdjust = Math.max(0.4, 1 - (timeYears * 0.14));
          }

          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const offset = 4.8;
          const x1 = node.x + (dx / len) * offset;
          const y1 = node.y + (dy / len) * offset;
          const x2 = target.x - (dx / len) * offset;
          const y2 = target.y - (dy / len) * offset;
          
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          let strokeColor: string;
          let strokeWidth: string;
          let markerId: string;
          let strokeOpacity = "1";

          if (isEdgeSelected || isEdgeHovered) {
            strokeColor = "#2563eb";
            strokeWidth = "0.9";
            markerId = "arrow-active";
          } else if (isPersonalHighlight) {
            strokeColor = relType === "risk" ? "#dc2626" : "#0d9488";
            strokeWidth = String(0.7 * timeWidthAdjust);
            markerId = relType === "risk" ? "arrow-personal" : "arrow-guides";
            strokeOpacity = String(1 * timeOpacityAdjust);
          } else if (isPersonalDim) {
            strokeColor = "#cbd5e1";
            strokeWidth = "0.3";
            markerId = "arrow-default";
            strokeOpacity = "0.35";
          } else if (isNodeActive) {
            strokeColor = "#3b82f6";
            strokeWidth = "0.7";
            markerId = "arrow-active";
          } else {
            strokeColor = relType === "risk" ? "#f87171" : relType === "guides" ? "#2dd4bf" : "#94a3b8";
            strokeWidth = String(0.45 * timeWidthAdjust);
            markerId = relType === "risk" ? "arrow-risk" : relType === "guides" ? "arrow-guides" : "arrow-default";
            strokeOpacity = String(0.85 * timeOpacityAdjust);
          }

          if (isAiEdge) {
            strokeColor = "#0d9488";
            markerId = "arrow-guides";
          }

          // Edge badge label if metric exists
          let badgeText = "";
          if (evidence?.metric?.value) {
            badgeText = evidence.metric.value.length > 8 ? evidence.metric.value.slice(0, 7) : evidence.metric.value;
          } else if (relType === "risk") {
            badgeText = "风险";
          } else if (relType === "guides") {
            badgeText = "指导";
          }

          return (
            <g 
              key={edgeKey} 
              className={`transition-all duration-300 ${hasEvidence ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdgeClick(edgeKey, e);
              }}
              onMouseEnter={() => onEdgeHover(edgeKey)}
              onMouseLeave={() => onEdgeHover(null)}
            >
              {/* Visible connecting line */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={relType === "guides" && !isEdgeSelected && !isEdgeHovered ? "2,1.2" : "none"}
                markerEnd={`url(#${markerId})`}
                style={{ transition: "all 0.3s" }}
              />

              {/* Interactive Middle Evidence Badge */}
              {badgeText && (
                <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer">
                  <rect
                    x="-4.5"
                    y="-1.8"
                    width="9"
                    height="3.6"
                    rx="1.8"
                    fill={isEdgeSelected || isEdgeHovered ? "#2563eb" : "#ffffff"}
                    stroke={isEdgeSelected || isEdgeHovered ? "#1d4ed8" : relType === "risk" ? "#fca5a5" : "#99f6e4"}
                    strokeWidth="0.3"
                    filter="url(#badge-shadow)"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="1.6"
                    fontWeight="bold"
                    fill={isEdgeSelected || isEdgeHovered ? "#ffffff" : relType === "risk" ? "#dc2626" : "#0f766e"}
                  >
                    {badgeText}
                  </text>
                </g>
              )}

              {/* Generous Invisible Click/Hover Area (100% clickable) */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,0,0,0.001)"
                strokeWidth="7"
                style={{ cursor: "pointer", pointerEvents: "all" }}
              />
            </g>
          );
        })
      )}

      {/* Sandbox Protective Edges */}
      {activeProtectiveEdges.map((pe) => {
        const fromNode = currentNodes.find((n) => n.id === pe.from);
        const toNode = currentNodes.find((n) => n.id === pe.to);
        if (!fromNode || !toNode) return null;
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const offset = 4.8;
        const x1 = fromNode.x + (dx / len) * offset;
        const y1 = fromNode.y + (dy / len) * offset;
        const x2 = toNode.x - (dx / len) * offset;
        const y2 = toNode.y - (dy / len) * offset;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={`protect-${pe.from}-${pe.to}`}>
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#16a34a"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              markerEnd="url(#arrow-protect)"
              style={{ filter: "drop-shadow(0 0 2px rgba(22,163,74,0.4))" }}
            />
            <g transform={`translate(${mx}, ${my})`}>
              <rect x="-4.5" y="-1.8" width="9" height="3.6" rx="1.8" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.3" filter="url(#badge-shadow)" />
              <text textAnchor="middle" dominantBaseline="central" fontSize="1.6" fill="#15803d" fontWeight="bold">{pe.label}</text>
            </g>
          </g>
        );
      })}

      {/* Nodes (Always Visible, High-Contrast Typography & Visual Glow) */}
      {currentNodes.map((node) => {
        const colors = typeColors[node.type] || typeColors.factor;
        const isActive = activeNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isConnected =
          activeNode?.connections.includes(node.id) ||
          currentNodes.find((n) => n.id === activeNode?.id)?.connections.includes(node.id);

        // Personal mode visual state
        const activation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
        
        // Time attenuation
        let timeOpacityAdjust = 1;
        if (node.id === "METASTASIS" && timeYears >= 2) {
          timeOpacityAdjust = Math.max(0.3, 1 - ((timeYears - 1) * 0.2));
        } else if (node.id === "RECURRENCE" && timeYears > 0) {
          timeOpacityAdjust = Math.max(0.5, 1 - (timeYears * 0.1));
        }

        const nodeOpacity = (activation === "dim" ? 0.35 : 1) * timeOpacityAdjust;
        const isPersonalActive = personalMode && activation === "active";

        // Sandbox visual state
        const isSandboxNode = sandboxMode && !!SANDBOX_NODES[node.id];
        const isSandboxOn = sandboxMode && sandboxActive.has(node.id);
        const isAiNode = node.id === "ctDNA";

        // Split multi-line labels (Line 1: Chinese Title, Line 2: English Abbr/Tag)
        const labelParts = node.label.split("\n");
        const titleZh = labelParts[0];
        const titleEn = labelParts[1] || node.id;

        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            className="cursor-pointer select-none"
            onClick={(e) => { 
              e.stopPropagation(); 
              onNodeClick(node); 
            }}
            onMouseEnter={() => onNodeHover(node)}
            onMouseLeave={() => onNodeHover(null)}
            opacity={nodeOpacity}
            style={{ transition: "opacity 0.3s, transform 0.2s" }}
          >
            {/* AI Node Pulse Indicator */}
            {isAiNode && (
              <circle r="7.5" fill="none" stroke="#0d9488" strokeWidth="0.4" strokeDasharray="2,1" className="animate-spin" />
            )}

            {/* Sandbox Active Glow */}
            {isSandboxOn && (
              <circle r="6.8" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="0.5" className="animate-pulse" />
            )}

            {/* Personal Mode Active Pulse */}
            {isPersonalActive && (
              <circle r="6.5" fill="none" stroke={colors.dot} strokeWidth="0.4" className="animate-ping opacity-30" />
            )}

            {/* Node Background Base Capsule with Shadow */}
            <circle
              r={isActive || isHovered ? "4.2" : "3.8"}
              fill={isSandboxOn ? "#fffbeb" : isAiNode ? "#f0fdfa" : colors.bg}
              stroke={isActive || isHovered ? "#2563eb" : isPersonalActive ? colors.dot : isSandboxOn ? "#d97706" : colors.border}
              strokeWidth={isActive || isHovered ? "0.8" : isPersonalActive || isSandboxOn ? "0.6" : "0.4"}
              filter={isActive || isHovered ? "url(#glow-active)" : "url(#node-shadow)"}
              style={{ transition: "all 0.2s" }}
            />

            {/* Inner Indicator Core */}
            <circle 
              r="1.6" 
              fill={isSandboxOn ? "#d97706" : isAiNode ? "#0d9488" : colors.dot} 
              opacity={isActive || isHovered || isPersonalActive ? 1 : 0.85} 
            />

            {/* AI Node NEW Tag */}
            {isAiNode && (
              <g transform="translate(4, -4.5)">
                <rect x="-2.2" y="-1.2" width="4.4" height="2.4" rx="1.2" fill="#0d9488" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="1.3" fill="#ffffff" fontWeight="bold">NEW</text>
              </g>
            )}

            {/* Primary Chinese Label (Always clearly visible in Slate-800) */}
            <text
              textAnchor="middle"
              y="6.4"
              fontSize="2.3"
              fill={isActive || isHovered ? "#2563eb" : isPersonalActive ? colors.text : "#1e293b"}
              fontWeight="bold"
              style={{ letterSpacing: "-0.01em" }}
            >
              {titleZh}
            </text>

            {/* Secondary English / Code Label (Always visible in colored subtitle) */}
            <text
              textAnchor="middle"
              y="8.8"
              fontSize="1.7"
              fill={isActive || isHovered ? "#1d4ed8" : isPersonalActive ? colors.dot : "#64748b"}
              fontWeight="600"
            >
              {titleEn}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
