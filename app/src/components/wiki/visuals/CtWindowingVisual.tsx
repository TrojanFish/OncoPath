"use client";

import React, { useState, useMemo } from "react";
import { 
  Layers, 
  Scan, 
  Sliders, 
  Ruler, 
  Info, 
  Eye, 
  ShieldCheck, 
  AlertTriangle,
  Sparkles,
  Maximize2
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export interface CtWindowingVisualProps {
  initialWindowType?: "lung" | "mediastinal";
}

export function CtWindowingVisual({
  initialWindowType = "lung",
}: CtWindowingVisualProps = {}) {
  const [windowType, setWindowType] = useState<"lung" | "mediastinal">(initialWindowType);
  const [currentSlice, setCurrentSlice] = useState<number>(4); // Slice 1 to 8 (slice 4 is center max diameter)
  const [caliperTotalMm, setCaliperTotalMm] = useState<number>(18);
  const [caliperSolidMm, setCaliperSolidMm] = useState<number>(7);
  const [hoveredHu, setHoveredHu] = useState<number | null>(null);
  const [hoveredTissueName, setHoveredTissueName] = useState<string | null>(null);

  // Computed CTR
  const ctr = useMemo(() => {
    if (windowType === "mediastinal") {
      // In mediastinal window, GGO disappears completely, only solid component is visible
      return 1.0;
    }
    if (caliperTotalMm <= 0) return 0;
    return Math.min(1.0, Number((caliperSolidMm / caliperTotalMm).toFixed(2)));
  }, [caliperTotalMm, caliperSolidMm, windowType]);

  // Clinical staging & path deduction based on measured CTR
  const clinicalAssessment = useMemo(() => {
    if (caliperSolidMm === 0 || ctr === 0) {
      return {
        category: "纯磨玻璃结节 (pGGO)",
        pathology: "非典型腺瘤样增生 (AAH) 或 原位腺癌 (AIS)",
        stage: "Tis (0期)",
        riskLevel: "safe",
        guidance: "JCOG0804 前瞻研究证实：纯磨玻璃成分 5 年无复发生存率 (RFS) 接近 100%，常规推荐亚肺叶或随访观测，绝不盲目大动干戈。",
      };
    } else if (caliperSolidMm <= 5 && ctr <= 0.5) {
      return {
        category: "微浸润混合磨玻璃 (mGGO)",
        pathology: "微浸润腺癌 (MIA) 极高度可疑",
        stage: "T1mi / T1a (IA1期)",
        riskLevel: "safe",
        guidance: "实性成分 <= 5mm，侵袭浸润极微弱。按 AJCC 8th/9th 权威标准，仅按实性径定级为 T1mi，术后 5 年生存率高达 98% 以上。",
      };
    } else if (ctr <= 0.5) {
      return {
        category: "部分实性磨玻璃 (mGGO CTR <= 0.5)",
        pathology: "早期浸润性腺癌 (IAC, 贴壁生长为主型)",
        stage: "T1a / T1b (IA期)",
        riskLevel: "caution",
        guidance: "磨玻璃成分仍占主导，预后显著优于纯实性肺癌。可按 JCOG0802 规范优先评估胸腔镜解剖性肺段切除，保留更多肺功能。",
      };
    } else {
      return {
        category: "实性为主结节 (CTR > 0.5 / 纯实性)",
        pathology: "浸润性腺癌 (IAC, 腺泡/乳头/实体型)",
        stage: "T1b / T1c / T2a",
        riskLevel: "danger",
        guidance: "实性侵袭成分明显，需高度警惕微血管浸润 (LVI) 及气道播散 (STAS)。推荐规范化根治性切除及系统淋巴结清扫采样。",
      };
    }
  }, [caliperSolidMm, ctr]);

  // Slice simulation parameters (slice 4 is maximum diameter, slices 1 and 8 are peripheral)
  const sliceScale = useMemo(() => {
    const distFromCenter = Math.abs(currentSlice - 4);
    return Math.max(0.4, 1.0 - distFromCenter * 0.15);
  }, [currentSlice]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden transition-all">
      {/* Workstation Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              DICOM HRCT Simulator
            </span>
            <span className="text-xs text-slate-300">
              胸部薄层高分辨 CT 窗位与卡尺测量台
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white mt-1">
            交互式肺窗 / 纵隔窗与实性浸润 CTR 测量工作站
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            体会临床放射科与胸外科医生阅片逻辑：为何磨玻璃在肺窗清晰，却在纵隔窗“瞬间隐形”？
          </p>
        </div>

        {/* Window Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setWindowType("lung");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              windowType === "lung"
                ? "bg-blue-600 text-white shadow-xs font-extrabold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>肺窗 (WW: 1500 / WL: -600)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setWindowType("mediastinal");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              windowType === "mediastinal"
                ? "bg-blue-600 text-white shadow-xs font-extrabold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>纵隔窗 (WW: 400 / WL: 40)</span>
          </button>
        </div>
      </div>

      {/* Main Workstation Body: Left CT Canvas, Right Clinical Caliper & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 p-4 sm:p-6 items-start">
        
        {/* Left: Interactive CT Canvas Viewer */}
        <div className="space-y-4">
          <div className="relative aspect-square max-w-[420px] mx-auto bg-black rounded-2xl border-4 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center select-none group">
            
            {/* Grid Reticle & Anatomical Orientation */}
            <div className="absolute inset-0 border border-slate-800/40 pointer-events-none grid grid-cols-4 grid-rows-4" />
            <span className="absolute top-2 left-2 text-[10px] font-mono text-slate-500 font-bold">A (前)</span>
            <span className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-500 font-bold">P (后)</span>
            <span className="absolute top-2 right-2 text-[10px] font-mono text-slate-500 font-bold">R (右)</span>
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400">
              {windowType === "lung" ? "LUNG WINDOW [WL:-600 WW:1500]" : "MEDIASTINAL WINDOW [WL:40 WW:400]"}
            </span>

            {/* Simulated Nodule Rendering */}
            <div 
              className="relative rounded-full flex items-center justify-center transition-all duration-300"
              style={{
                width: `${Math.round(caliperTotalMm * 14 * sliceScale)}px`,
                height: `${Math.round(caliperTotalMm * 14 * sliceScale)}px`,
              }}
            >
              {/* Outer Ground Glass Opacity (GGO) Halo - ONLY visible in Lung Window */}
              {windowType === "lung" && (
                <div 
                  onMouseEnter={() => {
                    setHoveredHu(-620);
                    setHoveredTissueName("磨玻璃晕征 (伏壁生长肿瘤细胞，无基质破坏)");
                  }}
                  onMouseLeave={() => {
                    setHoveredHu(null);
                    setHoveredTissueName(null);
                  }}
                  className="absolute inset-0 rounded-full bg-slate-200/50 backdrop-blur-[1px] border border-slate-300/40 shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all cursor-crosshair"
                  title="外周磨玻璃成分 (-620 HU)"
                />
              )}

              {/* Central Solid Core (Invasive Component) - Visible in BOTH Lung and Mediastinal Windows */}
              {caliperSolidMm > 0 && (
                <div 
                  onMouseEnter={() => {
                    setHoveredHu(35);
                    setHoveredTissueName("实性浸润灶 (真性侵袭软组织成分，成纤维增生)");
                  }}
                  onMouseLeave={() => {
                    setHoveredHu(null);
                    setHoveredTissueName(null);
                  }}
                  className="rounded-full bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.5)] border border-white z-10 transition-all cursor-crosshair flex items-center justify-center"
                  style={{
                    width: `${Math.round(caliperSolidMm * 14 * sliceScale)}px`,
                    height: `${Math.round(caliperSolidMm * 14 * sliceScale)}px`,
                  }}
                  title="中央实性浸润成分 (+35 HU)"
                >
                  <span className="text-[9px] font-mono text-slate-800 font-bold opacity-75">
                    {caliperSolidMm}mm
                  </span>
                </div>
              )}

              {/* Normal Lung Parenchyma Probe */}
              <div 
                className="absolute -top-12 -left-12 w-8 h-8 rounded-full border border-dashed border-slate-700/60 flex items-center justify-center cursor-crosshair"
                onMouseEnter={() => {
                  setHoveredHu(-850);
                  setHoveredTissueName("充气肺实质 (含气肺泡)");
                }}
                onMouseLeave={() => {
                  setHoveredHu(null);
                  setHoveredTissueName(null);
                }}
              >
                <span className="text-[8px] text-slate-600 font-mono">肺泡</span>
              </div>
            </div>

            {/* Electronic Caliper Overlay */}
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700 text-right">
              <div className="text-[10px] font-mono text-slate-400">电子卡尺标定</div>
              <div className="text-xs font-mono font-bold text-white">
                全径: {caliperTotalMm}mm | 实性: {windowType === "mediastinal" ? caliperSolidMm : caliperSolidMm}mm
              </div>
            </div>

            {/* Real-time HU Density Probe Floating Readout */}
            {hoveredHu !== null && (
              <div className="absolute top-12 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-cyan-500/50 shadow-lg text-xs font-mono animate-fade-in pointer-events-none">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>CT 值探针探测</span>
                  <span className="text-sm">{hoveredHu > 0 ? `+${hoveredHu}` : hoveredHu} HU</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">{hoveredTissueName}</div>
              </div>
            )}
          </div>

          {/* Slice Depth Scroller */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>层厚扫描截面：第 {currentSlice} / 8 层</span>
              </span>
              <span className="font-mono text-slate-500">
                {currentSlice === 4 ? "最大径中心切面" : "外周渐变层"}
              </span>
            </div>
            <input 
              type="range"
              min="1"
              max="8"
              step="1"
              value={currentSlice}
              onChange={(e) => {
                triggerHaptic("light");
                setCurrentSlice(Number(e.target.value));
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Right: Electronic Caliper Adjusters & Clinical Interpretation */}
        <div className="space-y-4">
          
          {/* Caliper Adjustment Sliders */}
          <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-blue-600" />
                <span>病灶电子卡尺测量</span>
              </span>
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md font-mono">
                CTR: {(ctr * 100).toFixed(0)}%
              </span>
            </div>

            {/* Total Diameter Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>病灶全径 (含外周磨玻璃)</span>
                <strong className="font-mono text-slate-900">{caliperTotalMm} mm</strong>
              </div>
              <input 
                type="range"
                min="5"
                max="35"
                step="1"
                value={caliperTotalMm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCaliperTotalMm(val);
                  if (caliperSolidMm > val) setCaliperSolidMm(val);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Solid Component Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1">
                <span>实性侵袭核心 (浸润成分)</span>
                <strong className="font-mono text-amber-700">{caliperSolidMm} mm</strong>
              </div>
              <input 
                type="range"
                min="0"
                max={caliperTotalMm}
                step="1"
                value={caliperSolidMm}
                onChange={(e) => setCaliperSolidMm(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Clinical Assessment Card */}
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">临床病理类型推断</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {clinicalAssessment.category}
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${
                clinicalAssessment.riskLevel === "safe"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : clinicalAssessment.riskLevel === "caution"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}>
                AJCC: {clinicalAssessment.stage}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>病理倾向：<strong className="text-slate-800">{clinicalAssessment.pathology}</strong></span>
              </div>
              <div className="flex items-start gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed text-slate-600">
                  {clinicalAssessment.guidance}
                </span>
              </div>
            </div>
          </div>

          {/* Expert Clinical Tip Box */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
            <strong>💡 胸外科阅片黄金准则：</strong> 磨玻璃结节（GGO）的浸润性大小<strong>严禁按肺窗外周全径粗暴计算</strong>！在 AJCC 8th/9th 分期标准中，T 分期严格取决于<strong>实性侵袭成分大小 (Solid Core)</strong>。纵隔窗中消失的磨玻璃成分属于原位伏壁生长，切除后几乎不复发。
          </div>

        </div>

      </div>
    </div>
  );
}
