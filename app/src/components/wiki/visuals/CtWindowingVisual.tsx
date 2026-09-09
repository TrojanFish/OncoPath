"use client";

import React, { useState, useMemo } from "react";
import {
  Scan,
  Eye,
  Columns2,
  Ruler,
  Layers,
  Sparkles,
  ShieldCheck,
  Info,
  Crosshair,
  Compass
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export interface CtWindowingVisualProps {
  initialWindowType?: "lung" | "mediastinal";
}

type WindowMode = "lung" | "mediastinal" | "dual";

interface ClinicalPreset {
  id: string;
  name: string;
  badge: string;
  totalMm: number;
  solidMm: number;
  ctrPercent: number;
  desc: string;
}

const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: "pggo",
    name: "纯磨玻璃 (pGGO)",
    badge: "0期 / Tis",
    totalMm: 12,
    solidMm: 0,
    ctrPercent: 0,
    desc: "纵隔窗完全隐形 · 原位贴壁生长 · 惰性无转移",
  },
  {
    id: "mia",
    name: "微浸润 (mGGO)",
    badge: "IA1 / T1mi",
    totalMm: 16,
    solidMm: 3,
    ctrPercent: 19,
    desc: "实性成分 ≤ 5mm · JCOG0804 5年RFS 99.7%",
  },
  {
    id: "early_iac",
    name: "早期浸润 (mGGO)",
    badge: "IA / T1a",
    totalMm: 18,
    solidMm: 7,
    ctrPercent: 39,
    desc: "CTR ≤ 0.5 · JCOG0802 段切保留肺功能黄金指征",
  },
  {
    id: "solid_iac",
    name: "实性为主结节",
    badge: "IA2 / T1b",
    totalMm: 22,
    solidMm: 16,
    ctrPercent: 73,
    desc: "CTR > 0.5 · 实性侵袭主导 · 需规范根治与清扫",
  },
];

export function CtWindowingVisual({
  initialWindowType = "lung",
}: CtWindowingVisualProps = {}) {
  const [windowMode, setWindowMode] = useState<WindowMode>(initialWindowType);
  const [currentSlice, setCurrentSlice] = useState<number>(4); // Slices 1 to 8 (4 is equatorial center)
  const [caliperTotalMm, setCaliperTotalMm] = useState<number>(18);
  const [caliperSolidMm, setCaliperSolidMm] = useState<number>(7);
  const [showCalipers, setShowCalipers] = useState<boolean>(true);
  const [hoveredProbe, setHoveredProbe] = useState<{ hu: number; label: string } | null>(null);

  // Compute CTR ratio
  const ctr = useMemo(() => {
    if (caliperTotalMm <= 0) return 0;
    return Math.min(1.0, Number((caliperSolidMm / caliperTotalMm).toFixed(2)));
  }, [caliperTotalMm, caliperSolidMm]);

  // Clinical staging & path deduction based on measured CTR and solid size
  const clinicalAssessment = useMemo(() => {
    if (caliperSolidMm === 0 || ctr === 0) {
      return {
        category: "纯磨玻璃结节 (pGGO)",
        pathology: "原位腺癌 (AIS) 或 不典型腺瘤样增生 (AAH)",
        stage: "Tis (0期 原位癌)",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
        solidInfiltrationRule: "纵隔窗完全消失（实性径 0mm），按实性成分分期为 Tis (0期)。",
        surgicalGuidance: "JCOG0804 证实 5 年无复发生存率 (RFS) 接近 100%，推荐随访或微创亚肺叶切除，绝不盲目扩大切除。",
      };
    } else if (caliperSolidMm <= 5 && ctr <= 0.5) {
      return {
        category: "微浸润腺癌高度可疑 (mGGO)",
        pathology: "微浸润腺癌 (MIA) 早期",
        stage: "T1mi / IA1期",
        badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
        solidInfiltrationRule: `全径达 ${caliperTotalMm}mm，但纵隔窗实性浸润仅 ${caliperSolidMm}mm (≤5mm)，按 AJCC 标准准确核定为 T1mi。`,
        surgicalGuidance: "侵袭极微，术后 5 年治愈率 >98%。微创楔形或解剖性段切即可达到根治目标，最大化保留患者肺功能。",
      };
    } else if (ctr <= 0.5) {
      return {
        category: "部分实性磨玻璃 (mGGO 贴壁主导)",
        pathology: "早期浸润性腺癌 (IAC, 贴壁生长为主型)",
        stage: `T1a (IA1期) - 实性 ${caliperSolidMm}mm`,
        badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40",
        solidInfiltrationRule: `全径 ${caliperTotalMm}mm，纵隔窗实性核心 ${caliperSolidMm}mm (CTR ${(ctr * 100).toFixed(0)}% ≤ 50%)，定级取决于实性径 ${caliperSolidMm}mm。`,
        surgicalGuidance: "JCOG0802 顶刊里程碑证实：对此类病灶，解剖性肺段切除总生存期优于传统肺叶切除，是保肺黄金指征。",
      };
    } else {
      return {
        category: "实性为主型结节 (CTR > 0.5)",
        pathology: "浸润性腺癌 (IAC, 腺泡/乳头/实体型)",
        stage: `T1b / T1c - 实性 ${caliperSolidMm}mm`,
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        solidInfiltrationRule: `纵隔窗实性侵袭成分明显 (${caliperSolidMm}mm, CTR ${(ctr * 100).toFixed(0)}%)，反映基质侵犯与成纤维反应。`,
        surgicalGuidance: "实性占比高提示需警惕微血管浸润 (LVI) 及气道播散 (STAS)，推荐规范化解剖性切除与淋巴结采样清扫。",
      };
    }
  }, [caliperTotalMm, caliperSolidMm, ctr]);

  // Slice scale factor: slice 4 is equatorial center (1.0), edges are smaller (0.45)
  const sliceScale = useMemo(() => {
    const distFromCenter = Math.abs(currentSlice - 4);
    return Math.max(0.45, 1.0 - distFromCenter * 0.14);
  }, [currentSlice]);

  const loadPreset = (preset: ClinicalPreset) => {
    triggerHaptic("light");
    setCaliperTotalMm(preset.totalMm);
    setCaliperSolidMm(preset.solidMm);
  };

  /**
   * Renders high-fidelity anatomical thoracic CT cross-section via SVG
   */
  const renderThoracicCanvas = (type: "lung" | "mediastinal") => {
    // Lesion geometry
    const totalRadius = Math.max(8, caliperTotalMm * 1.55 * sliceScale);
    const solidRadius = caliperSolidMm === 0 ? 0 : Math.max(3, caliperSolidMm * 1.55 * sliceScale);
    const noduleCx = 125;
    const noduleCy = 145;

    const isLung = type === "lung";

    return (
      <div className="relative w-full aspect-[4/3] bg-black rounded-xl border border-slate-800 overflow-hidden select-none group shadow-inner">
        {/* PACS Reticle & Background Ambient */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full border border-slate-700/40 grid grid-cols-6 grid-rows-4" />
        </div>

        {/* Anatomical Orientation Tags */}
        <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">
          A (前)
        </span>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">
          P (后)
        </span>
        <span className="absolute top-1/2 left-2 -translate-y-1/2 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">
          R (右肺)
        </span>
        <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[9px] font-mono text-slate-500 font-bold pointer-events-none">
          L (左肺)
        </span>

        {/* Top Viewport Header HUD */}
        <div className="absolute top-1.5 left-2.5 right-2.5 flex items-center justify-between text-[9px] font-mono pointer-events-none z-20">
          <span className={`px-1.5 py-0.5 rounded font-bold border ${
            isLung 
              ? "bg-cyan-950/80 text-cyan-300 border-cyan-700/50" 
              : "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
          }`}>
            {isLung ? "肺窗 (WL: -600 / WW: 1500)" : "纵隔窗 (WL: 40 / WW: 400)"}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            HRCT 1.0mm · 120kVp
          </span>
        </div>

        {/* SVG Thoracic CT Cross-Section Canvas */}
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          onMouseLeave={() => setHoveredProbe(null)}
        >
          <defs>
            {/* GGO Cloudy Halo Gradient */}
            <radialGradient id={`ggo-grad-${type}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#cbd5e1" stopOpacity="0.55" />
              <stop offset="85%" stopColor="#94a3b8" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.05" />
            </radialGradient>

            {/* Solid Core Gradient */}
            <radialGradient id={`solid-grad-${type}`} cx="45%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="70%" stopColor="#e2e8f0" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* 1. Outer Thoracic Body Wall & Subcutaneous Contour */}
          <ellipse
            cx="200"
            cy="150"
            rx="180"
            ry="125"
            fill={isLung ? "#1e293b" : "#334155"}
            stroke="#475569"
            strokeWidth="2"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredProbe({ hu: 45, label: "胸壁软组织 / 肋间肌群 (+45 HU)" })}
          />

          {/* Subcutaneous Fat Layer */}
          <ellipse
            cx="200"
            cy="150"
            rx="174"
            ry="119"
            fill={isLung ? "#0f172a" : "#1e293b"}
            stroke="#334155"
            strokeWidth="1.5"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredProbe({ hu: -90, label: "皮下脂肪层 (-90 HU)" })}
          />

          {/* 2. Rib Cage (Paired Rib Cross-sections with Cortical White Rim) */}
          <g className="cursor-crosshair" onMouseEnter={() => setHoveredProbe({ hu: 850, label: "肋骨骨皮质 (+850 HU 高密度)" })}>
            {/* Right Ribs */}
            <ellipse cx="65" cy="95" rx="8" ry="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" transform="rotate(-25 65 95)" />
            <ellipse cx="42" cy="145" rx="9" ry="4.5" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="62" cy="198" rx="8" ry="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" transform="rotate(25 62 198)" />
            <ellipse cx="105" cy="242" rx="9" ry="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" transform="rotate(45 105 242)" />

            {/* Left Ribs */}
            <ellipse cx="335" cy="95" rx="8" ry="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" transform="rotate(25 335 95)" />
            <ellipse cx="358" cy="145" rx="9" ry="4.5" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="338" cy="198" rx="8" ry="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" transform="rotate(-25 338 198)" />
            <ellipse cx="295" cy="242" rx="9" ry="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" transform="rotate(-45 295 242)" />
          </g>

          {/* Anterior Sternum */}
          <path
            d="M 188 34 L 212 34 L 208 42 L 192 42 Z"
            fill="#cbd5e1"
            stroke="#ffffff"
            strokeWidth="1"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredProbe({ hu: 820, label: "胸骨柄 (+820 HU)" })}
          />

          {/* Posterior Thoracic Vertebra & Canal */}
          <g className="cursor-crosshair" onMouseEnter={() => setHoveredProbe({ hu: 780, label: "胸椎椎体及附件 (+780 HU)" })}>
            <ellipse cx="200" cy="254" rx="22" ry="15" fill="#94a3b8" stroke="#ffffff" strokeWidth="1.2" />
            <ellipse cx="200" cy="242" rx="7" ry="5.5" fill="#020617" stroke="#475569" strokeWidth="1" />
            <path d="M 200 269 L 200 286" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 182 258 L 165 268" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <path d="M 218 258 L 235 268" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* 3. Bilateral Lung Fields (Parenchyma Cavities) */}
          {/* Right Lung Field */}
          <path
            d="M 188 65 C 160 55, 90 65, 55 105 C 38 128, 38 175, 58 208 C 80 235, 140 245, 175 230 C 182 220, 185 180, 185 140 C 185 100, 186 75, 188 65 Z"
            fill={isLung ? "#09101d" : "#000000"}
            stroke={isLung ? "#334155" : "#0f172a"}
            strokeWidth="1.5"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredProbe({ hu: -820, label: "含气肺实质 (低密度肺泡 -820 HU)" })}
          />

          {/* Left Lung Field */}
          <path
            d="M 212 65 C 240 55, 310 65, 345 105 C 362 128, 362 175, 342 208 C 320 235, 260 245, 225 230 C 218 220, 215 180, 215 140 C 215 100, 214 75, 212 65 Z"
            fill={isLung ? "#09101d" : "#000000"}
            stroke={isLung ? "#334155" : "#0f172a"}
            strokeWidth="1.5"
            className="cursor-crosshair"
            onMouseEnter={() => setHoveredProbe({ hu: -820, label: "含气肺实质 (低密度肺泡 -820 HU)" })}
          />

          {/* 4. Mediastinal Soft Tissue & Heart Silhouette */}
          <g className="cursor-crosshair" onMouseEnter={() => setHoveredProbe({ hu: 42, label: "纵隔心血管结构 / 主动脉弓 (+42 HU)" })}>
            <path
              d="M 188 65 C 195 62, 205 62, 212 65 C 216 95, 218 135, 228 175 C 235 205, 220 230, 200 232 C 180 230, 165 205, 172 175 C 182 135, 184 95, 188 65 Z"
              fill={isLung ? "#cbd5e1" : "#475569"}
              stroke={isLung ? "#f1f5f9" : "#64748b"}
              strokeWidth="1"
            />
            {/* Ascending & Descending Aorta & Pulmonary Artery in Mediastinal Window */}
            {!isLung && (
              <>
                <circle cx="192" cy="115" r="14" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
                <circle cx="210" cy="148" r="16" fill="#64748b" stroke="#94a3b8" strokeWidth="1" />
                <circle cx="195" cy="180" r="11" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              </>
            )}
          </g>

          {/* Trachea & Main Bronchi Bifurcation (Air Density -1000 HU) */}
          <g className="cursor-crosshair" onMouseEnter={() => setHoveredProbe({ hu: -980, label: "主支气管腔内空气 (-980 HU)" })}>
            <ellipse cx="200" cy="98" rx="6" ry="5" fill="#000000" stroke="#94a3b8" strokeWidth="1" />
            {isLung && (
              <>
                <path d="M 196 102 Q 185 115 174 125" stroke="#000000" strokeWidth="3.5" fill="none" />
                <path d="M 204 102 Q 215 115 226 125" stroke="#000000" strokeWidth="3.5" fill="none" />
              </>
            )}
          </g>

          {/* 5. Bronchovascular Tree (Pulmonary Markings) - Radiating Branches */}
          {isLung && (
            <g opacity="0.65" stroke="#38bdf8" fill="none" strokeLinecap="round">
              {/* Right lung vascular bundles */}
              <path d="M 175 130 Q 150 135 125 145" strokeWidth="2.2" />
              <path d="M 125 145 Q 100 150 75 160" strokeWidth="1.4" />
              <path d="M 125 145 Q 110 120 85 105" strokeWidth="1.2" />
              <path d="M 150 135 Q 130 105 100 90" strokeWidth="1.5" />
              <path d="M 160 155 Q 140 185 115 210" strokeWidth="1.8" />
              <path d="M 115 210 Q 90 220 75 225" strokeWidth="1.1" />

              {/* Left lung vascular bundles */}
              <path d="M 225 130 Q 255 135 285 140" strokeWidth="2.2" />
              <path d="M 285 140 Q 315 145 335 155" strokeWidth="1.4" />
              <path d="M 255 135 Q 275 105 305 90" strokeWidth="1.5" />
              <path d="M 240 155 Q 260 185 285 210" strokeWidth="1.8" />
            </g>
          )}

          {/* 6. TARGET NODULE RENDERING (Right Mid-Periphery at 125, 145) */}
          <g>
            {/* Outer Ground Glass Opacity (GGO) Halo */}
            {isLung ? (
              // Lung Window: Beautiful misty semi-transparent halo
              <circle
                cx={noduleCx}
                cy={noduleCy}
                r={totalRadius}
                fill={`url(#ggo-grad-${type})`}
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="3,2"
                className="cursor-crosshair transition-all duration-300"
                onMouseEnter={() =>
                  setHoveredProbe({
                    hu: -620,
                    label: `磨玻璃晕征 (GGO, -620 HU) · 伏壁贴壁肿瘤细胞 · 全径 ${caliperTotalMm}mm`,
                  })
                }
              />
            ) : (
              // Mediastinal Window: GGO IS COMPLETELY INVISIBLE! (0 opacity)
              showCalipers && (
                <circle
                  cx={noduleCx}
                  cy={noduleCy}
                  r={totalRadius}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="2,3"
                  opacity="0.4"
                  className="pointer-events-none"
                />
              )
            )}

            {/* Vascular Structure traversing the GGO (Hallmark of AIS/MIA) in Lung Window */}
            {isLung && (
              <path
                d={`M ${noduleCx - totalRadius + 4} ${noduleCy - 3} Q ${noduleCx} ${noduleCy} ${noduleCx + totalRadius - 3} ${noduleCy + 4}`}
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeOpacity="0.7"
                fill="none"
                className="pointer-events-none"
              />
            )}

            {/* Central Solid Invasive Core - VISIBLE IN BOTH WINDOWS */}
            {solidRadius > 0 && (
              <circle
                cx={noduleCx}
                cy={noduleCy}
                r={solidRadius}
                fill={isLung ? `url(#solid-grad-${type})` : "#cbd5e1"}
                stroke={isLung ? "#ffffff" : "#f1f5f9"}
                strokeWidth={isLung ? 1.5 : 1.2}
                className="cursor-crosshair transition-all duration-300"
                filter={isLung ? "drop-shadow(0 0 4px rgba(255,255,255,0.4))" : undefined}
                onMouseEnter={() =>
                  setHoveredProbe({
                    hu: 38,
                    label: `实性浸润灶 (+38 HU) · 真性侵袭成纤维成分 · 径长 ${caliperSolidMm}mm`,
                  })
                }
              />
            )}
          </g>

          {/* 7. ELECTRONIC VERNIER CALIPERS (PACS Style) */}
          {showCalipers && (
            <g className="pointer-events-none">
              {/* Cyan Caliper: Total Lesion Diameter (Horizontal) */}
              {isLung ? (
                <g className="transition-all">
                  {/* Laser Measurement Line */}
                  <line
                    x1={noduleCx - totalRadius}
                    y1={noduleCy - totalRadius - 8}
                    x2={noduleCx + totalRadius}
                    y2={noduleCy - totalRadius - 8}
                    stroke="#06b6d4"
                    strokeWidth="1.2"
                    strokeDasharray="3,1"
                  />
                  {/* Left & Right End Ticks |---| */}
                  <line
                    x1={noduleCx - totalRadius}
                    y1={noduleCy - totalRadius - 13}
                    x2={noduleCx - totalRadius}
                    y2={noduleCy - totalRadius - 3}
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={noduleCx + totalRadius}
                    y1={noduleCy - totalRadius - 13}
                    x2={noduleCx + totalRadius}
                    y2={noduleCy - totalRadius - 3}
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                  />
                  {/* Cyan Caliper Label Badge */}
                  <rect
                    x={noduleCx - 32}
                    y={noduleCy - totalRadius - 22}
                    width="64"
                    height="12"
                    rx="3"
                    fill="#083344"
                    stroke="#06b6d4"
                    strokeWidth="0.8"
                  />
                  <text
                    x={noduleCx}
                    y={noduleCy - totalRadius - 13}
                    textAnchor="middle"
                    fill="#22d3ee"
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    全径: {caliperTotalMm}mm
                  </text>
                </g>
              ) : (
                /* In Mediastinal Window: Ghost Caliper Indicating GGO Vanished */
                <g opacity="0.5">
                  <text
                    x={noduleCx}
                    y={noduleCy - totalRadius - 10}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="7"
                    fontFamily="monospace"
                  >
                    (磨玻璃已隐形 · 无法测量全径)
                  </text>
                </g>
              )}

              {/* Amber Caliper: Solid Infiltration Core (Vertical) */}
              {solidRadius > 0 && (
                <g className="transition-all">
                  <line
                    x1={noduleCx + solidRadius + 10}
                    y1={noduleCy - solidRadius}
                    x2={noduleCx + solidRadius + 10}
                    y2={noduleCy + solidRadius}
                    stroke="#f59e0b"
                    strokeWidth="1.4"
                  />
                  {/* Top & Bottom Diamond Endpoints ◆---◆ */}
                  <polygon
                    points={`${noduleCx + solidRadius + 10},${noduleCy - solidRadius - 3} ${noduleCx + solidRadius + 13},${noduleCy - solidRadius} ${noduleCx + solidRadius + 10},${noduleCy - solidRadius + 3} ${noduleCx + solidRadius + 7},${noduleCy - solidRadius}`}
                    fill="#f59e0b"
                  />
                  <polygon
                    points={`${noduleCx + solidRadius + 10},${noduleCy + solidRadius - 3} ${noduleCx + solidRadius + 13},${noduleCy + solidRadius} ${noduleCx + solidRadius + 10},${noduleCy + solidRadius + 3} ${noduleCx + solidRadius + 7},${noduleCy - solidRadius}`}
                    fill="#f59e0b"
                  />
                  {/* Amber Badge */}
                  <rect
                    x={noduleCx + solidRadius + 14}
                    y={noduleCy - 6}
                    width="66"
                    height="12"
                    rx="3"
                    fill="#451a03"
                    stroke="#f59e0b"
                    strokeWidth="0.8"
                  />
                  <text
                    x={noduleCx + solidRadius + 47}
                    y={noduleCy + 3}
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    实性: {caliperSolidMm}mm
                  </text>
                </g>
              )}
            </g>
          )}

          {/* Scale Legend (1cm physical scale marker) */}
          <g className="pointer-events-none">
            <line x1="330" y1="280" x2="380" y2="280" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="330" y1="276" x2="330" y2="284" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="380" y1="276" x2="380" y2="284" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="355" y="275" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
              10 mm
            </text>
          </g>
        </svg>

        {/* Bottom Viewport HUD Information */}
        <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-[9px] font-mono text-slate-400 pointer-events-none z-20">
          <div>
            <span className="text-cyan-400 font-bold">全径: {caliperTotalMm}mm</span>
            <span className="mx-1 text-slate-600">|</span>
            <span className="text-amber-400 font-bold">
              实性: {type === "mediastinal" && caliperSolidMm === 0 ? "0 (隐形)" : `${caliperSolidMm}mm`}
            </span>
          </div>
          <div>
            <span className="text-slate-400">
              切面: {currentSlice}/8 ({currentSlice === 4 ? "中心最大径" : "边缘分层"})
            </span>
          </div>
        </div>

        {/* Real-time HU Density Probe Floating HUD Tooltip */}
        {hoveredProbe && (
          <div className="absolute top-7 left-2.5 right-2.5 bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-cyan-500/60 shadow-lg text-[10px] font-mono z-30 pointer-events-none flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-1.5 text-slate-200">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow shrink-0" />
              <span className="truncate">{hoveredProbe.label}</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800 shrink-0 ml-2">
              {hoveredProbe.hu > 0 ? `+${hoveredProbe.hu}` : hoveredProbe.hu} HU
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      {/* 1. Header Bar: Aligned with standard Wiki visual component design */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
          <Scan className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>薄层 CT 窗位与实性浸润测量 (HRCT 1.0mm)</span>
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          DICOM 交互工作站
        </span>
      </div>

      {/* 2. Clinical Case Presets Bar (Quick Loading) */}
      <div className="mb-3.5">
        <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>典型临床病例一键载入对比：</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {CLINICAL_PRESETS.map((preset) => {
            const isActive =
              caliperTotalMm === preset.totalMm && caliperSolidMm === preset.solidMm;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className={`px-2 py-1.5 rounded-lg text-left transition-all border cursor-pointer ${
                  isActive
                    ? "bg-blue-600/30 border-blue-500 text-white shadow-xs"
                    : "bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold truncate">{preset.name}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900/80 font-mono text-sky-300 shrink-0">
                    {preset.badge}
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                  全{preset.totalMm} / 实{preset.solidMm}mm
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Window Preset Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/90">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setWindowMode("lung");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              windowMode === "lung"
                ? "bg-blue-600 text-white shadow-xs border border-blue-500 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scan className="w-3 h-3" />
            <span>肺窗 (Lung)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setWindowMode("mediastinal");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              windowMode === "mediastinal"
                ? "bg-blue-600 text-white shadow-xs border border-blue-500 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>纵隔窗 (Mediastinal)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("medium");
              setWindowMode("dual");
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              windowMode === "dual"
                ? "bg-indigo-600 text-white shadow-xs border border-indigo-500 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Columns2 className="w-3 h-3" />
            <span>同屏双窗对比</span>
          </button>
        </div>

        {/* Caliper Display Toggle */}
        <button
          type="button"
          onClick={() => setShowCalipers(!showCalipers)}
          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 border ${
            showCalipers
              ? "bg-slate-800 text-cyan-300 border-cyan-800"
              : "bg-slate-900 text-slate-500 border-slate-800"
          }`}
        >
          <Ruler className="w-3 h-3" />
          <span>{showCalipers ? "卡尺: 开启" : "卡尺: 隐藏"}</span>
        </button>
      </div>

      {/* 4. Main CT Canvas Viewport: Single or Dual Split Screen */}
      <div className="mb-3.5">
        {windowMode === "dual" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1 flex items-center gap-1">
                <Scan className="w-3 h-3" />
                <span>左屏：肺窗 (GGO 磨玻璃完整显示)</span>
              </div>
              {renderThoracicCanvas("lung")}
            </div>
            <div>
              <div className="text-[10px] font-mono text-indigo-400 font-bold mb-1 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>右屏：纵隔窗 (磨玻璃瞬间隐形，仅显实性浸润)</span>
              </div>
              {renderThoracicCanvas("mediastinal")}
            </div>
          </div>
        ) : (
          renderThoracicCanvas(windowMode)
        )}
      </div>

      {/* 5. Precision Sliders (Calipers & Tomographic Slice Stack) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 mb-3.5">
        {/* Slider 1: Total Diameter (D_total) */}
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-300 mb-1">
            <span className="flex items-center gap-1 font-bold text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
              <span>病灶全径 (含磨玻璃)</span>
            </span>
            <span className="font-mono text-cyan-300 font-bold">{caliperTotalMm} mm</span>
          </div>
          <input
            type="range"
            min="5"
            max="32"
            step="1"
            value={caliperTotalMm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCaliperTotalMm(val);
              if (caliperSolidMm > val) setCaliperSolidMm(val);
            }}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Slider 2: Solid Core Diameter (D_solid) */}
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-300 mb-1">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              <span>实性核心 (浸润成分)</span>
            </span>
            <span className="font-mono text-amber-300 font-bold">{caliperSolidMm} mm</span>
          </div>
          <input
            type="range"
            min="0"
            max={caliperTotalMm}
            step="1"
            value={caliperSolidMm}
            onChange={(e) => setCaliperSolidMm(Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Slider 3: Slice Tomography Scroller */}
        <div>
          <div className="flex justify-between items-center text-[10px] text-slate-300 mb-1">
            <span className="flex items-center gap-1 font-bold text-slate-300">
              <Layers className="w-3 h-3 text-blue-400" />
              <span>层厚切片 (第 {currentSlice} / 8 层)</span>
            </span>
            <span className="font-mono text-blue-300 font-bold">
              {currentSlice === 4 ? "最大赤道层" : "分层截面"}
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
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* 6. Clinical Assessment & JCOG Surgical Guidance Card */}
      <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5 mb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {clinicalAssessment.category}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              实性占比 (CTR): {(ctr * 100).toFixed(0)}%
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${clinicalAssessment.badgeColor}`}>
            AJCC 分期: {clinicalAssessment.stage}
          </span>
        </div>

        {/* CTR Gauge Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all duration-300 ${
              ctr === 0
                ? "bg-emerald-500"
                : ctr <= 0.25
                ? "bg-teal-400"
                : ctr <= 0.5
                ? "bg-sky-400"
                : "bg-amber-500"
            }`}
            style={{ width: `${Math.round(ctr * 100)}%` }}
          />
        </div>

        {/* Clinical Interpretation Detail Lines */}
        <div className="text-[11px] text-slate-300 leading-relaxed space-y-1.5 pt-1">
          <div className="flex items-start gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-200">AJCC 分期浸润定级法则：</strong>{" "}
              {clinicalAssessment.solidInfiltrationRule}
            </span>
          </div>
          <div className="flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-emerald-300">JCOG 国际循证手术指引：</strong>{" "}
              {clinicalAssessment.surgicalGuidance}
            </span>
          </div>
        </div>
      </div>

      {/* 7. Bottom Radiologist Golden Rule Callout (Matching Wiki Standard) */}
      <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 sm:p-3 rounded-xl border border-slate-700">
        <span className="inline-flex items-center gap-1 font-bold text-sky-300 mr-1">
          <Info className="w-3.5 h-3.5" />
          <span>图解核心要点：</span>
        </span>
        磨玻璃结节 (GGO) 的浸润性大小<strong>严禁按肺窗外周全径粗暴计算</strong>！在 AJCC 8th/9th 国际分期标准中，T 分期严格取决于<strong>纵隔窗实性浸润核心大小 (Solid Core)</strong>。在纵隔窗中“瞬间隐形”的磨玻璃成分属于原位伏壁惰性生长，切除后 5 年无复发生存率接近 100%，千万不要被肺窗的大尺寸吓倒。
      </div>
    </div>
  );
}
