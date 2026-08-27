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
  onBackgroundClick?: () => void;
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
  onEdgeHover,
  onBackgroundClick
}: GraphRendererProps) {

  // Sandbox Protective Edges
  const activeProtectiveEdges = Array.from(sandboxActive).flatMap((id) =>
    SANDBOX_NODES[id]?.protectiveEdges.map(pe => ({ from: id, to: pe.target, label: pe.label })) || []
  );

  return (
    <svg
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full relative z-10 select-none"
    >
      {/* Arrow marker & filter definitions for Causal DAG Standard */}
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
        <marker id="arrow-warning" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" />
        </marker>
        
        {/* Soft Drop Shadows & Radiant Glows */}
        <filter id="node-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.8" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.16" />
        </filter>
        <filter id="badge-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0.6" stdDeviation="1" floodColor="#0f172a" floodOpacity="0.18" />
        </filter>
        <filter id="glow-active" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.2" floodColor="#2563eb" floodOpacity="0.5" />
        </filter>
        <filter id="glow-primary" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.4" floodColor="#16a34a" floodOpacity="0.55" />
        </filter>
        <filter id="glow-warning" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.0" floodColor="#f59e0b" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Grid Pattern Background for Medical Visual Polish */}
      <pattern id="grid-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f1f5f9" strokeWidth="0.3" />
      </pattern>
      <rect 
        width="100" 
        height="140" 
        fill="url(#grid-pattern)" 
        onClick={() => onBackgroundClick?.()}
        onTouchEnd={(e) => { e.stopPropagation(); onBackgroundClick?.(); }}
        style={{ cursor: "default" }}
      />

      {/* 3-Column Causal DAG Visual Header Banners */}
      <g className="pointer-events-none opacity-85">
        {/* Column 1: Upstream Pathology */}
        <rect x="3" y="3" width="24" height="6" rx="3" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.3" />
        <text x="15" y="7" textAnchor="middle" fontSize="2.1" fontWeight="bold" fill="#1e40af">
          1. 上游病理与特征
        </text>

        {/* Column 2: Intermediary Guidelines */}
        <rect x="37" y="3" width="26" height="6" rx="3" fill="#f0fdfa" stroke="#99f6e4" strokeWidth="0.3" />
        <text x="50" y="7" textAnchor="middle" fontSize="2.1" fontWeight="bold" fill="#0f766e">
          2. 临床决策与指南
        </text>

        {/* Column 3: Downstream Endpoints */}
        <rect x="73" y="3" width="24" height="6" rx="3" fill="#fef2f2" stroke="#fecaca" strokeWidth="0.3" />
        <text x="85" y="7" textAnchor="middle" fontSize="2.1" fontWeight="bold" fill="#991b1b">
          3. 下游预后结局
        </text>
      </g>

      {/* Smooth Cubic Bézier Connection Lines */}
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

          // Personal mode edge logic with multi-tiered hierarchy
          const srcActivation = personalMode && profile ? getNodeActivation(node.id, profile) : "normal";
          const tgtActivation = personalMode && profile ? getNodeActivation(targetId, profile) : "normal";
          
          const isPersonalPrimary = personalMode && (srcActivation === "primary" || tgtActivation === "primary");
          const isPersonalWarning = personalMode && (tgtActivation === "warning" || (srcActivation === "warning" && tgtActivation === "active"));
          const isPersonalHighlight = personalMode && (srcActivation === "active" || srcActivation === "primary") && (tgtActivation === "active" || tgtActivation === "primary");
          const isPersonalDim = personalMode && (srcActivation === "dim" || tgtActivation === "dim");

          // Time slider attenuation logic
          let timeOpacityAdjust = 1;
          let timeWidthAdjust = 1;
          if (relType === "risk" && timeYears > 0) {
            timeOpacityAdjust = Math.max(0.2, 1 - (timeYears * 0.16));
            timeWidthAdjust = Math.max(0.4, 1 - (timeYears * 0.14));
          }

          // Compute smooth Cubic Bézier Curve endpoints with node radii offsets
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const offset = 4.8;
          const x1 = node.x + (dx / len) * offset;
          const y1 = node.y + (dy / len) * offset;
          const x2 = target.x - (dx / len) * offset;
          const y2 = target.y - (dy / len) * offset;
          
          // Cubic Bézier Control Points for smooth S-curve flow & vertical collision avoidance
          const isSameColumn = Math.abs(dx) < 4;
          let cx1: number, cy1: number, cx2: number, cy2: number;
          let midX: number, midY: number;

          if (isSameColumn) {
            // Gracefully curve out to the right for vertical connections (e.g. STAGING -> SURGERY)
            const curveOffset = 9;
            cx1 = x1 + curveOffset;
            cy1 = y1 + (y2 - y1) * 0.25;
            cx2 = x2 + curveOffset;
            cy2 = y2 - (y2 - y1) * 0.25;
            midX = node.x + curveOffset * 0.72;
            midY = 0.5 * (y1 + y2);
          } else {
            const curvature = Math.max(Math.abs(x2 - x1) * 0.5, 8);
            cx1 = x1 + curvature;
            cy1 = y1;
            cx2 = x2 - curvature;
            cy2 = y2;
            midX = 0.5 * (x1 + x2);
            midY = 0.5 * (y1 + y2);
          }

          const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

          let strokeColor: string;
          let strokeWidth: string;
          let markerId: string;
          let strokeOpacity = "1";

          if (isEdgeSelected || isEdgeHovered) {
            strokeColor = "#2563eb";
            strokeWidth = "0.9";
            markerId = "arrow-active";
          } else if (isPersonalPrimary && (targetId === "SURVEILLANCE" || node.id === "SURVEILLANCE" || targetId === "SURGERY")) {
            // Mainline dominant cure/surveillance pathway (90%-100%)
            strokeColor = "#16a34a";
            strokeWidth = String(0.9 * timeWidthAdjust);
            markerId = "arrow-protect";
            strokeOpacity = String(1 * timeOpacityAdjust);
          } else if (isPersonalWarning && targetId === "RECURRENCE") {
            // Secondary watchful alert pathway (0%-10%)
            strokeColor = "#f59e0b";
            strokeWidth = String(0.65 * timeWidthAdjust);
            markerId = "arrow-warning";
            strokeOpacity = String(0.9 * timeOpacityAdjust);
          } else if (isPersonalHighlight) {
            strokeColor = relType === "risk" ? "#dc2626" : "#0d9488";
            strokeWidth = String(0.75 * timeWidthAdjust);
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
            strokeColor = relType === "risk" ? "#f87171" : relType === "guides" ? "#2dd4bf" : relType === "protective" ? "#4ade80" : "#94a3b8";
            strokeWidth = String(0.45 * timeWidthAdjust);
            markerId = relType === "risk" ? "arrow-risk" : relType === "guides" ? "arrow-guides" : relType === "protective" ? "arrow-protect" : "arrow-default";
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
          } else if (relType === "protective") {
            badgeText = "保护";
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
              {/* Base Smooth Cubic Bézier Curve */}
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={relType === "guides" && !isEdgeSelected && !isEdgeHovered && !isPersonalPrimary ? "2,1.2" : "none"}
                markerEnd={`url(#${markerId})`}
                style={{ transition: "all 0.3s" }}
              />

              {/* Dynamic Animated Flowing Streams for Active Highlighted Paths */}
              {isPersonalPrimary && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#86efac"
                  strokeWidth={String(Number(strokeWidth) * 0.8)}
                  strokeDasharray="4,3"
                  strokeLinecap="round"
                  opacity="0.9"
                  className="pointer-events-none"
                >
                  <animate attributeName="stroke-dashoffset" values="21; 0" dur="1.2s" repeatCount="indefinite" />
                </path>
              )}

              {isPersonalWarning && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#fde68a"
                  strokeWidth="0.6"
                  strokeDasharray="3,2"
                  strokeLinecap="round"
                  opacity="0.85"
                  className="pointer-events-none"
                >
                  <animate attributeName="stroke-dashoffset" values="15; 0" dur="1.5s" repeatCount="indefinite" />
                </path>
              )}

              {isPersonalHighlight && !isPersonalPrimary && !isPersonalWarning && (
                <path
                  d={pathData}
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="0.6"
                  strokeDasharray="4,2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                  className="pointer-events-none"
                >
                  <animate attributeName="stroke-dashoffset" values="18; 0" dur="1.3s" repeatCount="indefinite" />
                </path>
              )}

              {/* Interactive Middle Evidence Badge */}
              {badgeText && (
                <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer">
                  <rect
                    x="-4"
                    y="-1.6"
                    width="8"
                    height="3.2"
                    rx="1.6"
                    fill={isEdgeSelected || isEdgeHovered ? "#2563eb" : "#ffffff"}
                    stroke={isEdgeSelected || isEdgeHovered ? "#1d4ed8" : relType === "risk" ? "#fca5a5" : relType === "protective" ? "#86efac" : "#99f6e4"}
                    strokeWidth="0.3"
                    filter="url(#badge-shadow)"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="1.5"
                    fontWeight="bold"
                    fill={isEdgeSelected || isEdgeHovered ? "#ffffff" : relType === "risk" ? "#dc2626" : relType === "protective" ? "#16a34a" : "#0f766e"}
                  >
                    {badgeText}
                  </text>
                </g>
              )}

              {/* Generous Invisible Click Area along Cubic Bézier Curve */}
              <path
                d={pathData}
                fill="none"
                stroke="rgba(0,0,0,0.001)"
                strokeWidth="8"
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
        const curvature = Math.max(Math.abs(x2 - x1) * 0.5, 8);
        const pathData = `M ${x1} ${y1} C ${x1 + curvature} ${y1}, ${x2 - curvature} ${y2}, ${x2} ${y2}`;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={`protect-${pe.from}-${pe.to}`}>
            <path
              d={pathData}
              fill="none"
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

      {/* Nodes (Always Visible, High-Contrast Typography & Rich SVG Native Dynamic Animations) */}
      {currentNodes.map((node) => {
        const colors = node.id === "SURVEILLANCE" 
          ? { bg: "#f0fdf4", border: "#86efac", text: "#15803d", dot: "#16a34a" }
          : (typeColors[node.type] || typeColors.factor);
        const isActive = activeNode?.id === node.id;
        const isHovered = hoveredNode?.id === node.id;

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
        const isPrimary = personalMode && activation === "primary";
        const isWarning = personalMode && activation === "warning";
        const isPersonalActive = personalMode && activation === "active";

        // Sandbox visual state
        const isSandboxNode = sandboxMode && !!SANDBOX_NODES[node.id];
        const isSandboxOn = sandboxMode && sandboxActive.has(node.id);
        const isAiNode = node.id === "ctDNA";

        // Split multi-line labels
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
            onTouchEnd={(e) => {
              // bypass react-zoom-pan-pinch touch interception on mobile
              e.stopPropagation();
              e.preventDefault();
              onNodeHover(null);
              onNodeClick(node);
            }}
            onMouseEnter={() => onNodeHover(node)}
            onMouseLeave={() => onNodeHover(null)}
            opacity={nodeOpacity}
            style={{ transition: "opacity 0.3s, transform 0.2s" }}
          >
            {/* Generous Hit Area for Mobile Touch Reliability */}
            <rect x="-8" y="-6" width="16" height="18" fill="rgba(0,0,0,0.001)" style={{ pointerEvents: "all" }} />

            {/* AI Node Pulse Indicator */}
            {isAiNode && (
              <g>
                <circle r="7.5" fill="none" stroke="#0d9488" strokeWidth="0.4" strokeDasharray="2,1">
                  <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                </circle>
                <circle r="6.0" fill="#0d9488">
                  <animate attributeName="r" values="5.2; 7.0; 5.2" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.12; 0.3; 0.12" dur="2.2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* 1. PRIMARY Dominant Mainline Dynamic Radar Ripple Halo (90%-100% Cure Baseline) */}
            {isPrimary && (
              <g className="pointer-events-none">
                {/* Expanding Radar Wave 1 */}
                <circle r="4.2" fill="none" stroke="#16a34a" strokeWidth="0.85">
                  <animate attributeName="r" values="4.2; 12.5" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95; 0" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="0.9; 0.1" dur="2.4s" repeatCount="indefinite" />
                </circle>
                {/* Expanding Radar Wave 2 (Phase Delayed for seamless continuity) */}
                <circle r="4.2" fill="none" stroke="#16a34a" strokeWidth="0.85">
                  <animate attributeName="r" values="4.2; 12.5" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.95; 0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="0.9; 0.1" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                </circle>
                {/* Radiant Breathing Emerald Glow */}
                <circle r="7.5" fill="#22c55e">
                  <animate attributeName="r" values="6.8; 9.8; 6.8" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.18; 0.42; 0.18" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* 2. SECONDARY Warning Caution Dynamic Radar Pulse (0%-10% Risk Branch) */}
            {isWarning && (
              <g className="pointer-events-none">
                {/* Caution Ripple Wave 1 */}
                <circle r="4.2" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3,1.5">
                  <animate attributeName="r" values="4.2; 10.2" dur="2.0s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9; 0" dur="2.0s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="0.8; 0.1" dur="2.0s" repeatCount="indefinite" />
                </circle>
                {/* Caution Ripple Wave 2 */}
                <circle r="4.2" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3,1.5">
                  <animate attributeName="r" values="4.2; 10.2" dur="2.0s" begin="1.0s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9; 0" dur="2.0s" begin="1.0s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="0.8; 0.1" dur="2.0s" begin="1.0s" repeatCount="indefinite" />
                </circle>
                {/* Soft Amber Breathing Glow */}
                <circle r="6.5" fill="#f59e0b">
                  <animate attributeName="r" values="5.8; 8.0; 5.8" dur="2.0s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.12; 0.32; 0.12" dur="2.0s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* 3. ACTIVE Path Highlight Dynamic Radar Ripples (CTR, STAS, STAGING, SURGERY, VPI, LVI, EGFR, etc.) */}
            {(isPersonalActive || isActive || isHovered) && !isPrimary && !isWarning && (
              <g className="pointer-events-none">
                {/* Dynamic Radiating Wave 1 */}
                <circle r="4.0" fill="none" stroke={isActive || isHovered ? "#2563eb" : (colors.dot || "#2563eb")} strokeWidth="0.75">
                  <animate attributeName="r" values="4.0; 9.2" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85; 0" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="0.8; 0.1" dur="2.2s" repeatCount="indefinite" />
                </circle>
                {/* Dynamic Radiating Wave 2 */}
                <circle r="4.0" fill="none" stroke={isActive || isHovered ? "#2563eb" : (colors.dot || "#2563eb")} strokeWidth="0.75">
                  <animate attributeName="r" values="4.0; 9.2" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85; 0" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="0.8; 0.1" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                </circle>
                {/* Core Ambient Breathing Glow */}
                <circle r="6.0" fill={isActive || isHovered ? "#2563eb" : (colors.dot || "#2563eb")}>
                  <animate attributeName="r" values="5.2; 7.2; 5.2" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.14; 0.35; 0.14" dur="2.2s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* Sandbox Active Glow */}
            {isSandboxOn && (
              <g className="pointer-events-none">
                <circle r="4.0" fill="none" stroke="#d97706" strokeWidth="0.75">
                  <animate attributeName="r" values="4.0; 9.0" dur="2.0s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.85; 0" dur="2.0s" repeatCount="indefinite" />
                </circle>
                <circle r="6.2" fill="#d97706">
                  <animate attributeName="r" values="5.5; 7.4; 5.5" dur="2.0s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.15; 0.35; 0.15" dur="2.0s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* Node Background Base Capsule with Shadow */}
            <circle
              r={isActive || isHovered ? "4.2" : isPrimary ? "4.1" : "3.8"}
              fill={isSandboxOn ? "#fffbeb" : isAiNode ? "#f0fdfa" : isPrimary ? "#f0fdf4" : isWarning ? "#fffbeb" : colors.bg}
              stroke={isActive || isHovered ? "#2563eb" : isPrimary ? "#16a34a" : isWarning ? "#f59e0b" : isPersonalActive ? colors.dot : isSandboxOn ? "#d97706" : colors.border}
              strokeWidth={isActive || isHovered ? "0.85" : isPrimary ? "0.85" : isWarning ? "0.6" : isPersonalActive || isSandboxOn ? "0.65" : "0.4"}
              filter={isActive || isHovered ? "url(#glow-active)" : isPrimary ? "url(#glow-primary)" : isWarning ? "url(#glow-warning)" : "url(#node-shadow)"}
              style={{ transition: "all 0.2s" }}
            />

            {/* Inner Indicator Core (Breathing for Primary/Active nodes) */}
            {isPrimary ? (
              <circle r="1.7" fill="#16a34a">
                <animate attributeName="r" values="1.5; 2.2; 1.5" dur="2.4s" repeatCount="indefinite" />
              </circle>
            ) : isWarning ? (
              <circle r="1.6" fill="#f59e0b">
                <animate attributeName="r" values="1.4; 1.9; 1.4" dur="2.0s" repeatCount="indefinite" />
              </circle>
            ) : isPersonalActive || isActive || isHovered ? (
              <circle r="1.6" fill={isActive || isHovered ? "#2563eb" : (colors.dot || "#2563eb")}>
                <animate attributeName="r" values="1.4; 1.9; 1.4" dur="2.2s" repeatCount="indefinite" />
              </circle>
            ) : (
              <circle 
                r="1.6" 
                fill={isSandboxOn ? "#d97706" : isAiNode ? "#0d9488" : colors.dot} 
                opacity={0.85} 
              />
            )}

            {/* Primary Mainline Top Floating Badge (Harmonized 90%~100% Cure Probability) */}
            {isPrimary && (
              <g transform="translate(0, -6.6)">
                <rect x="-8.8" y="-1.8" width="17.6" height="3.6" rx="1.8" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.35" filter="url(#badge-shadow)" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="1.3" fill="#15803d" fontWeight="bold">主导归宿 90%~100%</text>
              </g>
            )}

            {/* Secondary Warning Top Floating Badge (Harmonized 0%~10% Risk Caution) */}
            {isWarning && (
              <g transform="translate(0, -6.6)">
                <rect x="-8.2" y="-1.8" width="16.4" height="3.6" rx="1.8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.35" filter="url(#badge-shadow)" />
                <text textAnchor="middle" dominantBaseline="central" fontSize="1.3" fill="#b45309" fontWeight="bold">警示支线 0%~10%</text>
              </g>
            )}

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
              fill={isActive || isHovered ? "#2563eb" : isPrimary ? "#15803d" : isWarning ? "#b45309" : isPersonalActive ? colors.text : "#1e293b"}
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
              fill={isActive || isHovered ? "#1d4ed8" : isPrimary ? "#16a34a" : isWarning ? "#d97706" : isPersonalActive ? colors.dot : "#64748b"}
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
