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
      <button onClick={() => zoomIn()} className="glass w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 text-text-primary shadow-lg">＋</button>
      <button onClick={() => zoomOut()} className="glass w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 text-text-primary shadow-lg">－</button>
      <button onClick={() => resetTransform()} className="glass w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/10 text-text-primary shadow-lg text-xs">↺</button>
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
  const activeNode = hoveredNode || selectedNode;
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
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  const handleEdgeClick = (edgeKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(null);
    setSelectedEdge(selectedEdge === edgeKey ? null : edgeKey);
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
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/60">正在加载知识图谱...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Time Slider */}
      <div className="mb-6 flex flex-col items-center max-w-lg mx-auto bg-[#0a0e1a]/50 p-4 rounded-xl border border-white/5 relative h-20">
        <TimeSlider value={timeYears} onChange={setTimeYears} />
      </div>

      {/* Mode Banners */}
      {sandboxMode ? (
        <div className="mb-4 flex items-center justify-between glass rounded-xl px-4 py-2.5 border border-amber-500/30 bg-amber-500/5">
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
        <div className="mb-4 flex items-center justify-between glass rounded-xl px-4 py-2.5 border border-accent-teal/30">
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
                className={`text-xs border px-2 py-1 rounded transition-colors ${aiScanning ? 'text-text-muted border-white/10' : 'text-accent-blue/80 hover:text-accent-blue border-accent-blue/20 hover:border-accent-blue/40 cursor-pointer'} flex items-center gap-1.5`}
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
              className={`text-xs border px-3 py-1.5 rounded-lg transition-colors ${aiScanning ? 'text-text-muted border-white/10' : 'text-accent-blue/80 hover:text-accent-blue border-accent-blue/20 hover:border-accent-blue/40 cursor-pointer'} flex items-center gap-1.5`}
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
          className={`lg:col-span-2 glass rounded-2xl border overflow-hidden relative flex flex-col max-h-[65vh] lg:max-h-[700px] transition-all duration-500 ${
            personalMode && profile
              ? "border-accent-teal/20 shadow-[0_0_30px_rgba(0,212,170,0.08)]"
              : "border-white/5"
          }`}
          style={{ minHeight: 450 }}
          onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
        >
          <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
          
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
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
              />
            </TransformComponent>
          </TransformWrapper>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3">
            {[
              { type: "factor", label: "病理因素", dot: "#4f8ef7" },
              { type: "outcome", label: "临床结局", dot: "#ef4444" },
              { type: "evidence", label: "证据节点", dot: "#f59e0b" },
              { type: "guideline", label: "指南建议", dot: "#00d4aa" },
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.dot, opacity: 0.8 }}
                />
                <span className="text-text-muted text-xs">{item.label}</span>
              </div>
            ))}
            <div className="w-full mt-1 flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-px" style={{ background: "rgba(239,68,68,0.7)" }} />
                <span className="text-text-muted text-xs">风险关联</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-px border-t border-dashed" style={{ borderColor: "rgba(0,212,170,0.7)" }} />
                <span className="text-text-muted text-xs">指南关联</span>
              </div>
              {personalMode && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                  <span className="text-accent-teal text-xs">您的专属路径</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" className="text-text-muted">
                  <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,1"/>
                </svg>
                <span className="text-text-muted text-xs">点击连线查看文献</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel Container */}
        <div className="lg:static relative">
          
          {/* Mobile Overlay Background (only visible when active) */}
          <div 
            className={`lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isPanelActive ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={() => { setSelectedNode(null); setSelectedEdge(null); if(sandboxMode) exitSandbox(); }}
          />

          {/* Drawer / Side Panel */}
          <div className={`
            flex flex-col gap-4 
            lg:relative lg:translate-y-0 lg:h-auto lg:p-0 lg:bg-transparent lg:border-none lg:z-0 lg:shadow-none
            fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/10 p-5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
            transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto
            ${isPanelActive ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
            {/* Mobile Drag Handle */}
            <div className="lg:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

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
              <NodeInfoPanel node={activeNode} />
            ) : (
              <div className="glass rounded-2xl p-6 border border-white/5 flex-col items-center justify-center text-center flex-1 hidden lg:flex">
                <div className="text-4xl mb-3 opacity-50">🕸️</div>
                <p className="text-text-muted text-sm">点击节点查看详细信息</p>
                <p className="text-text-muted text-xs mt-2">点击连线查看文献依据</p>
                {personalMode && activeHighlightNodes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 w-full text-left">
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
            <div className="glass rounded-2xl p-5 border border-white/5 hidden lg:block">
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
