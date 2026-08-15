"use client";

import { useState, useEffect } from "react";
import { fetchFactors } from "@/lib/api";
import type { PatientProfile } from "@/lib/types";
import type { KnowledgeNode, EdgeEvidence } from "@/lib/knowledgeGraphData";
import { aiNewNode, SANDBOX_NODES } from "@/lib/knowledgeGraphData";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { GraphRenderer } from "./knowledge-graph/GraphRenderer";
import { SandboxPanel } from "./knowledge-graph/panels/SandboxPanel";
import { EdgeEvidencePanel } from "./knowledge-graph/panels/EdgeEvidencePanel";
import { NodeInfoPanel } from "./knowledge-graph/panels/NodeInfoPanel";
import { TimeSlider } from "./knowledge-graph/TimeSlider";

interface KnowledgeMapProps {
  profile?: PatientProfile | null;
}

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
      <button onClick={() => zoomIn()} className="bg-white w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm">＋</button>
      <button onClick={() => zoomOut()} className="bg-white w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm">－</button>
      <button onClick={() => resetTransform()} className="bg-white w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-900 shadow-sm text-xs">↺</button>
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
  const [sandboxMode, setSandboxMode] = useState<boolean>(false);
  const [sandboxActive, setSandboxActive] = useState<Set<string>>(new Set());
  const [showMobileLegend, setShowMobileLegend] = useState<boolean>(false);
  
  // 4D Time Slider & AI Growth State
  const [timeYears, setTimeYears] = useState<number>(0);
  const [aiScanning, setAiScanning] = useState<boolean>(false);
  const [aiNodeVisible, setAiNodeVisible] = useState<boolean>(false);

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

  const currentNodes = aiNodeVisible ? [...nodes, aiNewNode] : nodes;
  const activeNode = selectedNode || hoveredNode;
  const isPanelActive = sandboxMode || selectedEdge || activeNode;

  // Directions 1 calculation for highlights
  let activeHighlightNodes: string[] = [];
  if (personalMode && profile) {
    if (profile.stas === "positive") activeHighlightNodes.push("STAS", "SURGERY");
    if (profile.lvi === "positive") activeHighlightNodes.push("LVI", "METASTASIS");
    if (profile.vpi === "positive") activeHighlightNodes.push("VPI", "STAGING", "ADJUVANT");
    if (profile.ctr > 0.5) activeHighlightNodes.push("CTR", "STAGING", "SURGERY");
    if (profile.iaslcGrade === "3") activeHighlightNodes.push("IASLC", "ADJUVANT");
    if (profile.egfr === "positive") activeHighlightNodes.push("EGFR", "TARGETED", "ADJUVANT");
    activeHighlightNodes = Array.from(new Set(activeHighlightNodes));
  }

  const factorCount = currentNodes.filter((n) => n.type === "factor").length;
  const connectionCount = currentNodes.reduce((sum, n) => sum + n.connections.length, 0);

  const toggleSandboxNode = (id: string) => {
    setSandboxActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleNodeClick = (node: KnowledgeNode) => {
    if (sandboxMode && SANDBOX_NODES[node.id]) {
      toggleSandboxNode(node.id);
      return;
    }
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

  const enterSandbox = () => {
    setSandboxMode(true);
    setSandboxActive(new Set());
    setPersonalMode(false);
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const exitSandbox = () => {
    setSandboxMode(false);
    setSandboxActive(new Set());
    if (profile) setPersonalMode(true);
  };

  const triggerAiScan = () => {
    if (aiNodeVisible || aiScanning) return;
    setAiScanning(true);
    setTimeout(() => {
      setAiScanning(false);
      setAiNodeVisible(true);
    }, 2500);
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
    <div className="mt-12">
      {/* Time Slider */}
      <div className="mb-6 flex flex-col items-center max-w-lg mx-auto bg-white shadow-sm p-4 rounded-xl border border-gray-200 relative h-20">
        <TimeSlider value={timeYears} onChange={setTimeYears} />
      </div>

      {/* Mode Banners */}
      {sandboxMode ? (
        <div className="mb-4 flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2.5 border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">沙盘推演模式</span>
            <span className="text-text-muted text-xs">— 点击治疗节点，观察风险路径的变化</span>
          </div>
          <button
            onClick={exitSandbox}
            className="text-text-muted text-xs hover:text-text-secondary transition-colors underline underline-offset-2 cursor-pointer"
          >
            退出沙盘
          </button>
        </div>
      ) : personalMode && profile ? (
        <div className="mb-4 flex items-center justify-between bg-teal-50 rounded-xl px-4 py-2.5 border border-teal-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-accent-teal text-sm font-medium">专属路径模式</span>
            <span className="text-text-muted text-xs">— 高亮节点与您的病理特征直接相关</span>
          </div>
          <div className="flex items-center gap-3">
            {!aiNodeVisible && (
              <button
                onClick={triggerAiScan}
                disabled={aiScanning}
                className={`text-xs border px-2 py-1 rounded transition-colors ${aiScanning ? 'text-gray-500 border-gray-200' : 'text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 cursor-pointer'} flex items-center gap-1.5`}
              >
                {aiScanning ? (
                  <><span className="w-2 h-2 border-2 border-text-muted border-t-transparent rounded-full animate-spin" /> 正在追踪文献...</>
                ) : (
                  <>⚡ AI 实时追踪</>
                )}
              </button>
            )}
            <button
              onClick={enterSandbox}
              className="text-amber-400/80 text-xs hover:text-amber-400 transition-colors border border-amber-400/20 hover:border-amber-400/40 px-2 py-1 rounded cursor-pointer"
            >
              ⚗️ 进入沙盘推演
            </button>
            <button
              onClick={() => setPersonalMode(false)}
              className="text-text-muted text-xs hover:text-text-secondary transition-colors underline underline-offset-2 cursor-pointer"
            >
              切换全局视图
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex justify-end gap-3">
          {!aiNodeVisible && (
            <button
              onClick={triggerAiScan}
              disabled={aiScanning}
              className={`text-xs border px-3 py-1.5 rounded-lg transition-colors ${aiScanning ? 'text-gray-500 border-gray-200' : 'text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 cursor-pointer'} flex items-center gap-1.5`}
            >
              {aiScanning ? (
                <><span className="w-3 h-3 border-2 border-text-muted border-t-transparent rounded-full animate-spin" /> 正在追踪...</>
              ) : (
                <>⚡ AI 实时追踪</>
              )}
            </button>
          )}
          <button
            onClick={enterSandbox}
            className="text-amber-400/70 text-xs hover:text-amber-400 transition-colors border border-amber-400/20 hover:border-amber-400/40 px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            ⚗️ 沙盘推演模式
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graph */}
        <div
          className={`lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden relative flex flex-col max-h-[65vh] lg:max-h-[700px] transition-all duration-500 ${
            personalMode && profile
              ? "border-teal-200 shadow-[0_0_30px_rgba(13,148,136,0.08)]"
              : "border-gray-200"
          }`}
          style={{ minHeight: 450 }}
        >
          <div className="absolute inset-0 bg-gray-50 opacity-50 pointer-events-none" />
          
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
          >
            <ZoomControls />
            <TransformComponent wrapperStyle={{ width: "100%", height: "100%", flex: 1 }} contentStyle={{ width: "100%", height: "100%" }}>
              <GraphRenderer 
                currentNodes={currentNodes}
                activeNode={activeNode}
                hoveredNode={hoveredNode}
                selectedEdge={selectedEdge}
                hoveredEdge={hoveredEdge}
                sandboxMode={sandboxMode}
                sandboxActive={sandboxActive}
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
          </TransformWrapper>

          {/* Mobile Collapsible Legend Toggle Pill (< sm) */}
          <div className="sm:hidden absolute bottom-3 right-3 z-20">
            {!showMobileLegend ? (
              <button
                onClick={() => setShowMobileLegend(true)}
                className="px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-[11px] font-bold text-slate-700 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-accent-blue" />
                <span>图例注解</span>
              </button>
            ) : (
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl max-w-[260px] animate-fade-in text-[11px]">
                <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 font-bold text-slate-800">
                  <span>图谱图例说明</span>
                  <button 
                    onClick={() => setShowMobileLegend(false)}
                    className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs hover:bg-slate-200 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { type: "factor", label: "病理因素", dot: "#2563eb" },
                    { type: "outcome", label: "临床结局", dot: "#dc2626" },
                    { type: "evidence", label: "证据节点", dot: "#d97706" },
                    { type: "guideline", label: "指南建议", dot: "#0d9488" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.dot }} />
                      <span className="text-slate-600 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-0.5 rounded-full bg-rose-500" />
                    <span className="text-slate-600 font-medium">风险关联</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-0.5 border-t border-dashed border-teal-500" />
                    <span className="text-slate-600 font-medium">指南关联</span>
                  </div>
                  {personalMode && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      <span className="text-teal-700 font-semibold">您的专属路径</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Static Legend (Positioned at Bottom-Right with Frosted Glass Badge, hidden on mobile) */}
          <div className="hidden sm:block absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 bg-white/92 backdrop-blur-md p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm max-w-[280px] sm:max-w-xs pointer-events-none">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
              {[
                { type: "factor", label: "病理因素", dot: "#2563eb" },
                { type: "outcome", label: "临床结局", dot: "#dc2626" },
                { type: "evidence", label: "证据节点", dot: "#d97706" },
                { type: "guideline", label: "指南建议", dot: "#0d9488" },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.dot }}
                  />
                  <span className="text-slate-600 font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="w-full mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-0.5 rounded-full bg-rose-500" />
                <span className="text-slate-600 font-medium">风险关联</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3.5 h-0.5 border-t border-dashed border-teal-500" />
                <span className="text-slate-600 font-medium">指南关联</span>
              </div>
              {personalMode && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span className="text-teal-700 font-semibold">您的专属路径</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-slate-400 text-[10px] w-full mt-0.5">
                <span>💡 点击任意连线/药丸徽章查看文献</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel Container */}
        <div className="lg:static relative">
          
          {/* Mobile Overlay Background (only visible when active) */}
          <div 
            className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isPanelActive ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => { setSelectedNode(null); setHoveredNode(null); setSelectedEdge(null); if(sandboxMode) exitSandbox(); }}
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

            {sandboxMode ? (
              <SandboxPanel
                sandboxActive={sandboxActive}
                onToggle={toggleSandboxNode}
                onExit={exitSandbox}
              />
            ) : selectedEdge && edgeEvidences[selectedEdge] ? (
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
