"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchFactors } from "@/lib/api";
import type { PatientProfile } from "@/lib/types";
import type { KnowledgeNode, EdgeEvidence } from "@/lib/knowledgeGraphData";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { GraphRenderer } from "./knowledge-graph/GraphRenderer";
import { EdgeEvidencePanel } from "./knowledge-graph/panels/EdgeEvidencePanel";
import { NodeInfoPanel } from "./knowledge-graph/panels/NodeInfoPanel";
import { TimeSlider } from "./knowledge-graph/TimeSlider";

interface KnowledgeMapProps {
  profile?: PatientProfile | null;
}

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="inline-flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shadow-2xs flex-shrink-0">
      <button 
        onClick={() => zoomIn()} 
        className="w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-black shadow-2xs active:scale-95 transition-all cursor-pointer"
        title="放大视图"
      >
        ＋
      </button>
      <button 
        onClick={() => zoomOut()} 
        className="w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-black shadow-2xs active:scale-95 transition-all cursor-pointer"
        title="缩小视图"
      >
        －
      </button>
      <button 
        onClick={() => resetTransform()} 
        className="px-2 h-6 sm:h-6.5 flex items-center gap-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
        title="重置视图居中"
      >
        <span>↺</span>
        <span className="hidden md:inline text-[10.5px]">重置</span>
      </button>
    </div>
  );
};

export default function KnowledgeMapPreview({ profile = null }: KnowledgeMapProps) {
  const [hoveredNode, setHoveredNode] = useState<KnowledgeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [edgeEvidences, setEdgeEvidences] = useState<Record<string, EdgeEvidence>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalStudies, setTotalStudies] = useState<number>(0);
  const [personalMode, setPersonalMode] = useState<boolean>(!!profile);
  
  // 4D Time Slider State
  const [timeYears, setTimeYears] = useState<number>(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPersonalMode(!!profile);
  }, [profile]);

  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((data) => {
        if (data.nodes && data.edgeEvidences) {
          setNodes(data.nodes);
          setEdgeEvidences(data.edgeEvidences);
          const total = data.nodes.reduce((sum: number, n: any) => sum + (n.studies || 0), 0);
          setTotalStudies(total > 0 ? total : 142);

          // Deep link: auto-select target node if ?node=... or ?focus=... is provided
          if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const nodeParam = urlParams.get("node") || urlParams.get("focus") || urlParams.get("highlight");
            if (nodeParam) {
              const matchedNode = data.nodes.find(
                (n: KnowledgeNode) => n.id.toLowerCase() === nodeParam.toLowerCase()
              );
              if (matchedNode) {
                setSelectedNode(matchedNode);
              }
            }
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch graph data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const currentNodes = nodes;
  const activeNode = selectedNode || hoveredNode;
  const isPanelActive = !!(selectedEdge || activeNode);

  // Directions 1 calculation for highlights
  let activeHighlightNodes: string[] = [];
  if (personalMode && profile) {
    if (profile.stas === "positive") activeHighlightNodes.push("STAS", "SURGERY");
    if (profile.lvi === "positive") activeHighlightNodes.push("LVI", "METASTASIS");
    if (profile.vpi === "positive") activeHighlightNodes.push("VPI", "STAGING", "ADJUVANT");
    if (profile.ctr > 0.5) activeHighlightNodes.push("CTR", "STAGING", "SURGERY");
    if (profile.iaslcGrade === "3") activeHighlightNodes.push("IASLC", "ADJUVANT");
    if (profile.egfr === "positive") activeHighlightNodes.push("EGFR", "TARGETED", "ADJUVANT");
    
    // Highlight SURVEILLANCE for all Stage IA & CTR <= 0.5 low-risk profiles
    const isStageIA = profile.stage === "IA1" || profile.stage === "IA2" || profile.stage === "IA3" || (profile.stage?.startsWith("IA") ?? false) || profile.stage === "Tis" || profile.stage === "0";
    if (isStageIA || (profile.ctr != null && profile.ctr <= 0.5)) {
      activeHighlightNodes.push("CTR", "SURGERY", "STAGING", "SURVEILLANCE");
    }
    activeHighlightNodes = Array.from(new Set(activeHighlightNodes));
  }

  const factorCount = currentNodes.filter((n) => n.type === "factor").length;
  const connectionCount = currentNodes.reduce((sum, n) => sum + n.connections.length, 0);

  const handleNodeClick = (node: KnowledgeNode) => {
    setSelectedEdge(null);
    setHoveredNode(null);
    setSelectedNode(node);
  };

  const handleEdgeClick = (edgeKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHoveredNode(null);
    setSelectedNode(null);
    setSelectedEdge(edgeKey);
  };

  if (isLoading) {
    return (
      <div className="mt-12 min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin"></div>
          <p className="text-gray-500">正在加载知识图谱...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-10">
      {/* 4D Time Slider */}
      <div className="mb-6 flex flex-col items-center max-w-lg mx-auto bg-white shadow-sm p-3 sm:p-4 rounded-xl border border-gray-200 relative h-20">
        <TimeSlider value={timeYears} onChange={setTimeYears} />
      </div>

      {/* Top Navigation & View Mode Switcher */}
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: View Mode Segmented Switch if profile exists, or Global Knowledge Badge */}
        {profile ? (
          <div className="inline-flex items-center p-1 bg-slate-200/80 rounded-2xl border border-slate-200 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => {
                setPersonalMode(true);
                setSelectedNode(null);
                setSelectedEdge(null);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                personalMode
                  ? "bg-white text-teal-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>👤 您的专属推演路径 ({profile.stage || "术后"}期)</span>
            </button>
            <button
              onClick={() => {
                setPersonalMode(false);
                setSelectedNode(null);
                setSelectedEdge(null);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !personalMode
                  ? "bg-white text-blue-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🌐 全景临床指南图谱</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>🌐 全景临床指南知识图谱 · 基于 AJCC / CSCO / NCCN 循证队列</span>
          </div>
        )}

        {/* Right: Personal Mode Status or Call to Action */}
        {profile && personalMode ? (
          <div className="text-[11px] text-teal-800 font-medium bg-teal-50 px-3.5 py-1.5 rounded-xl border border-teal-200/80 shadow-2xs flex items-center gap-1.5">
            <span>💡 已根据您的病理指标高亮关联因果结局</span>
          </div>
        ) : !profile ? (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-200 shadow-2xs transition-all cursor-pointer"
          >
            <span>＋ 录入病理档案高亮专属路径</span>
          </Link>
        ) : null}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Graph Canvas + Horizontal Legend Strip */}
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
        >
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Graph Canvas Container */}
            <div
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden relative flex flex-col max-h-[65vh] lg:max-h-[700px] transition-all duration-500 ${
                personalMode && profile
                  ? "border-teal-200 shadow-[0_0_30px_rgba(13,148,136,0.08)]"
                  : "border-gray-200"
              }`}
              style={{ minHeight: 450 }}
            >
              <div className="absolute inset-0 bg-gray-50 opacity-50 pointer-events-none" />
              
              <TransformComponent wrapperStyle={{ width: "100%", height: "100%", flex: 1 }} contentStyle={{ width: "100%", height: "100%" }}>
                <GraphRenderer 
                  currentNodes={currentNodes}
                  activeNode={activeNode}
                  hoveredNode={hoveredNode}
                  selectedEdge={selectedEdge}
                  hoveredEdge={hoveredEdge}
                  personalMode={personalMode}
                  profile={profile}
                  timeYears={timeYears}
                  edgeEvidences={edgeEvidences}
                  onNodeClick={handleNodeClick}
                  onNodeHover={setHoveredNode}
                  onEdgeClick={handleEdgeClick}
                  onEdgeHover={setHoveredEdge}
                  onBackgroundClick={() => {
                    setSelectedNode(null);
                    setSelectedEdge(null);
                    setHoveredNode(null);
                  }}
                />
              </TransformComponent>
            </div>

            {/* Clean Horizontal Bottom Legend & Zoom Toolbar (Zero Canvas Overlap) */}
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] select-none">
              {/* Left Group: Node Categories */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                <span className="text-slate-400 font-bold text-[10px] tracking-wider uppercase">节点</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs" />
                  <span className="text-slate-700 font-medium">病理特征</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-600 shadow-xs" />
                  <span className="text-slate-700 font-medium">临床决策</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs" />
                  <span className="text-slate-700 font-medium">根治主导</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-xs" />
                  <span className="text-slate-700 font-medium">复发/进展</span>
                </div>
              </div>

              {/* Desktop Divider */}
              <div className="hidden sm:block h-4 w-px bg-slate-200" />

              {/* Middle Group: Causal Lines */}
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                <span className="text-slate-400 font-bold text-[10px] tracking-wider uppercase">因果链路</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-1 rounded-full bg-emerald-600" />
                  <span className="text-slate-700 font-medium">保护(绿光)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 rounded-full bg-rose-500" />
                  <span className="text-slate-700 font-medium">风险(红)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 border-t border-dashed border-teal-500" />
                  <span className="text-slate-700 font-medium">指南(青)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 border-t border-dashed border-amber-500" />
                  <span className="text-slate-700 font-medium">警示(黄)</span>
                </div>
              </div>

              {/* Right Group: Zoom Controls & Personal Badge */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                {personalMode && (
                  <div className="flex items-center gap-1.5 text-teal-800 font-semibold text-[10.5px]">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse flex-shrink-0" />
                    <span className="hidden xl:inline">专属流光已激活</span>
                  </div>
                )}
                <ZoomControls />
              </div>
            </div>
          </div>
        </TransformWrapper>

        {/* Info Panel Container */}
        <div className="lg:static relative">
          
          {/* Mobile Overlay Background (only visible when active) */}
          <div 
            className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isPanelActive ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => { setSelectedNode(null); setHoveredNode(null); setSelectedEdge(null); }}
          />

          {/* Drawer / Side Panel */}
          <div className={`
            flex flex-col gap-4 
            lg:relative lg:translate-y-0 lg:h-auto lg:p-0 lg:bg-transparent lg:border-none lg:z-0 lg:shadow-none
            fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]
            transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto
            ${isPanelActive ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
            {/* Mobile Drag Handle */}
            <div className="lg:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

            {selectedEdge && edgeEvidences[selectedEdge] ? (
              <EdgeEvidencePanel
                edgeKey={selectedEdge}
                evidence={edgeEvidences[selectedEdge]}
                onClose={() => setSelectedEdge(null)}
              />
            ) : activeNode ? (
              <NodeInfoPanel 
                node={activeNode} 
                onClose={() => {
                  setSelectedNode(null);
                  setHoveredNode(null);
                }}
              />
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex-col items-center justify-center text-center flex-1 hidden lg:flex">
                <div className="text-4xl mb-3 opacity-50">🕸️</div>
                <p className="text-gray-500 text-sm">点击节点查看详细信息</p>
                <p className="text-gray-500 text-xs mt-2">点击连线查看文献依据</p>
                {personalMode && activeHighlightNodes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 w-full text-left">
                    <p className="text-accent-teal text-xs font-medium mb-2">您的高风险因素</p>
                    <div className="flex flex-wrap gap-1">
                      {activeHighlightNodes.map((id) => (
                        <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-accent-teal/10 text-accent-teal border border-accent-teal/30">{id}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick facts - Only show on desktop when panel is not active on mobile to save space, or just always show on desktop */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hidden lg:block">
              <h4 className="text-text-secondary text-sm font-medium mb-3">知识图谱统计</h4>
              <div className="space-y-2 text-sm">
                {[
                  { label: "因素节点", value: `${factorCount}个`, color: "text-accent-blue" },
                  { label: "证据连接", value: `${connectionCount}条`, color: "text-accent-teal" },
                  { label: "覆盖论文", value: `${totalStudies}篇`, color: "text-purple-400" },
                  { label: "数据来源", value: "核心文献", color: "text-amber-400" },
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
    </div>
  );
}
