import React from 'react';
import type { KnowledgeNode } from '@/lib/knowledgeGraphData';
import type { PatientProfile } from '@/lib/types';
import { typeColors, typeLabels, getNodeActivation, SANDBOX_NODES } from '@/lib/knowledgeGraphData';
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
      className="w-full h-full relative z-10"
    >
      {/* Arrow marker definitions */}
      <defs>
        <marker id="arrow-risk" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(239,68,68,0.7)" />
        </marker>
        <marker id="arrow-guides" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(0,212,170,0.7)" />
        </marker>
        <marker id="arrow-default" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(79,142,247,0.5)" />
        </marker>
        <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(79,142,247,0.9)" />
        </marker>
        <marker id="arrow-personal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(239,68,68,0.95)" />
        </marker>
        <filter id="glow-teal">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-amber">
          <feGaussianBlur stdDeviation="1.0" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="arrow-protect" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="rgba(34,197,94,0.9)" />
        </marker>
      </defs>

      {/* Connection lines */}
      {currentNodes.map((node) =>
        node.connections.map((targetId) => {
          const target = currentNodes.find((n) => n.id === targetId);
          if (!target) return null;
          const edgeKey = `${node.id}-${targetId}`;
          const isNodeActive = activeNode?.id === node.id || activeNode?.id === targetId;
          const isEdgeSelected = selectedEdge === edgeKey;
          const isEdgeHovered = hoveredEdge === edgeKey;
          const hasEvidence = !!edgeEvidences[edgeKey];
          const relType = (node.connectionTypes || {})[targetId] || "default";
          const isAiEdge = node.id === "ctDNA" || targetId === "ctDNA";

          // Direction 1: personal mode edge logic
          const srcActivation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
          const tgtActivation = personalMode && profile ? getNodeActivation(targetId, profile) : "normal";
          const isPersonalHighlight = personalMode && srcActivation === "active" && tgtActivation === "active";
          const isPersonalDim = personalMode && (srcActivation === "dim" || tgtActivation === "dim");

          // Direction 3: Time slider attenuation logic
          let timeOpacityAdjust = 1;
          let timeWidthAdjust = 1;
          if (relType === "risk" && timeYears > 0) {
            timeOpacityAdjust = Math.max(0.15, 1 - (timeYears * 0.17));
            timeWidthAdjust = Math.max(0.3, 1 - (timeYears * 0.15));
          }

          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const offset = 4.2;
          const x1 = node.x + (dx / len) * offset;
          const y1 = node.y + (dy / len) * offset;
          const x2 = target.x - (dx / len) * offset;
          const y2 = target.y - (dy / len) * offset;

          let strokeColor: string;
          let strokeWidth: string;
          let markerId: string;
          let strokeOpacity = "1";

          if (isEdgeSelected || isEdgeHovered) {
            strokeColor = "rgba(255,255,255,0.9)";
            strokeWidth = "0.7";
            markerId = "arrow-active";
          } else if (isPersonalHighlight) {
            strokeColor = relType === "risk" ? "rgba(239,68,68,0.9)" : "rgba(0,212,170,0.9)";
            strokeWidth = String(0.6 * timeWidthAdjust);
            markerId = relType === "risk" ? "arrow-personal" : "arrow-guides";
            strokeOpacity = String(1 * timeOpacityAdjust);
          } else if (isPersonalDim) {
            strokeColor = "rgba(255,255,255,0.04)";
            strokeWidth = "0.2";
            markerId = "arrow-default";
            strokeOpacity = "0.3";
          } else if (isNodeActive) {
            strokeColor = "rgba(79,142,247,0.85)";
            strokeWidth = "0.55";
            markerId = "arrow-active";
          } else {
            strokeColor = relType === "risk" ? "rgba(239,68,68,0.3)" : relType === "guides" ? "rgba(0,212,170,0.3)" : "rgba(255,255,255,0.06)";
            strokeWidth = String(0.3 * timeWidthAdjust);
            markerId = relType === "risk" ? "arrow-risk" : relType === "guides" ? "arrow-guides" : "arrow-default";
            strokeOpacity = String(1 * timeOpacityAdjust);
          }

          if (isAiEdge) {
            strokeColor = "rgba(0,212,170,0.8)";
            markerId = "arrow-guides";
          }

          return (
            <g key={edgeKey} className={isAiEdge ? "animate-edge-grow" : ""}>
              {/* Visible line */}
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={relType === "guides" && !isEdgeSelected && !isEdgeHovered ? "1.5,1" : "none"}
                markerEnd={`url(#${markerId})`}
                style={{ transition: "stroke 0.3s, stroke-width 0.3s, stroke-opacity 0.3s" }}
              />
              {/* Invisible hit area (Direction 4) */}
              {hasEvidence && (
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="transparent"
                  strokeWidth="3"
                  style={{ cursor: "pointer" }}
                  onClick={(e) => onEdgeClick(edgeKey, e)}
                  onMouseEnter={() => onEdgeHover(edgeKey)}
                  onMouseLeave={() => onEdgeHover(null)}
                />
              )}
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
        const offset = 4.2;
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
              stroke="rgba(34,197,94,0.7)"
              strokeWidth="0.7"
              strokeDasharray="2,1"
              markerEnd="url(#arrow-protect)"
              style={{ filter: "drop-shadow(0 0 2px rgba(34,197,94,0.5))", transition: "all 0.4s" }}
            />
            <text x={mx} y={my - 1.5} textAnchor="middle" fontSize="2.2" fill="rgba(34,197,94,0.9)" fontWeight="bold">{pe.label}</text>
          </g>
        );
      })}

      {/* Nodes */}
      {currentNodes.map((node) => {
        const colors = typeColors[node.type];
        const isActive = activeNode?.id === node.id;
        const isConnected =
          activeNode?.connections.includes(node.id) ||
          currentNodes.find((n) => n.id === activeNode?.id)?.connections.includes(node.id);

        // Direction 1: personal mode visual state
        const activation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
        
        // Direction 3: Node attenuation
        let timeOpacityAdjust = 1;
        if (node.id === "METASTASIS" && timeYears >= 2) {
          timeOpacityAdjust = Math.max(0.3, 1 - ((timeYears - 1) * 0.2));
        } else if (node.id === "RECURRENCE" && timeYears > 0) {
          timeOpacityAdjust = Math.max(0.5, 1 - (timeYears * 0.1));
        }

        const nodeOpacity = (activation === "dim" ? 0.2 : 1) * timeOpacityAdjust;
        const isPersonalActive = personalMode && activation === "active";

        // Sandbox visual state
        const isSandboxNode = sandboxMode && !!SANDBOX_NODES[node.id];
        const isSandboxOn = sandboxMode && sandboxActive.has(node.id);
        const isAiNode = node.id === "ctDNA";

        return (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            className={`${isSandboxNode ? "cursor-pointer" : "cursor-pointer"} ${isAiNode ? "animate-fade-in-up" : ""}`}
            onClick={(e) => { e.stopPropagation(); onNodeClick(node); }}
            onMouseEnter={() => onNodeHover(node)}
            onMouseLeave={() => onNodeHover(null)}
            opacity={nodeOpacity}
            style={{ transition: "opacity 0.4s" }}
          >
            {isAiNode && (
              <circle r="7.5" fill="none" stroke="rgba(0,212,170,0.8)" strokeWidth="0.4"
                style={{ animation: "pulse 1s ease-in-out infinite" }} />
            )}
            {/* Sandbox ON ring — amber pulsing */}
            {isSandboxOn && (
              <circle r="6.5" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.6)" strokeWidth="0.4"
                style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
            )}
            {/* Sandbox interactable ring — amber outline */}
            {isSandboxNode && !isSandboxOn && (
              <circle r="5.5" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="0.35" strokeDasharray="1.5,1" />
            )}
            {/* Personal-mode glow ring */}
            {isPersonalActive && (
              <circle r="6.5" fill="none" stroke={colors.dot} strokeWidth="0.3" opacity="0.5"
                style={{ animation: "pulse 2s ease-in-out infinite" }} />
            )}
            {/* Standard active glow */}
            {isActive && (
              <circle r="5" fill={colors.dot} opacity="0.2" />
            )}
            <circle
              r="3.5"
              fill={isSandboxOn ? "rgba(245,158,11,0.2)" : isAiNode ? "rgba(0,212,170,0.15)" : colors.bg}
              stroke={isSandboxOn ? "rgba(245,158,11,0.8)" : isAiNode ? "rgba(0,212,170,0.9)" : isActive ? colors.dot : isPersonalActive ? colors.dot : isConnected ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}
              strokeWidth={isActive || isPersonalActive || isSandboxOn || isAiNode ? "0.6" : "0.4"}
              filter={isPersonalActive ? "url(#glow-teal)" : isSandboxOn ? "url(#glow-amber)" : undefined}
            />
            <circle r="1.5" fill={isSandboxOn ? "rgba(245,158,11,0.9)" : isAiNode ? "rgba(0,212,170,0.9)" : colors.dot} opacity={isActive || isPersonalActive || isSandboxOn || isAiNode ? 1 : 0.7} />
            
            {isAiNode && (
              <text x="5.5" y="-3.5" fontSize="1.8" fill="rgba(0,212,170,0.9)" fontWeight="bold" className="animate-pulse">
                NEW
              </text>
            )}
            <text
              textAnchor="middle"
              dy="5.5"
              fontSize="2.5"
              fill={isSandboxOn ? "rgba(245,158,11,0.9)" : isAiNode ? "rgba(0,212,170,1)" : isActive || isPersonalActive ? colors.text : "rgba(255,255,255,0.5)"}
              fontWeight={isActive || isPersonalActive || isSandboxOn || isAiNode ? "bold" : "normal"}
            >
              {node.label.split("\n")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
