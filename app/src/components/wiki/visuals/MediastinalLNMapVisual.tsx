"use client";

import { useState } from "react";
import { CircleDot, Info, Sparkles, ShieldAlert, Layers } from "lucide-react";

export function MediastinalLNMapVisual() {
  const [selectedStation, setSelectedStation] = useState<string>("7");

  const stationData: Record<
    string,
    {
      name: string;
      level: "N2" | "N1" | "N3";
      levelLabel: string;
      zone: string;
      nStage: string;
      desc: string;
      color: string;
      clinicalMeaning: string;
    }
  > = {
    "1": {
      name: "1组 · 锁骨上淋巴结",
      level: "N3",
      levelLabel: "N3 远隔站",
      zone: "上纵隔/颈部区",
      nStage: "N3 (晚期/锁骨上)",
      desc: "位于锁骨上窝及下颈部，若出现转移属于 N3 晚期分期。",
      color: "#ec4899",
      clinicalMeaning: "属于不可直接手术切除范畴，首选系统性化疗/靶向/免疫综合治疗。"
    },
    "2": {
      name: "2组 · 上气管旁淋巴结 (2R / 2L)",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "上纵隔区",
      nStage: "同侧N2 / 对侧N3",
      desc: "位于主动脉弓上缘水平以上的气管两侧，是上叶肿瘤向上纵隔引流的关键站。",
      color: "#38bdf8",
      clinicalMeaning: "若同侧阳性属于 IIIA 期，系统性淋巴清扫必查站点。"
    },
    "3": {
      name: "3组 · 血管前/后间隙淋巴结 (3A / 3P)",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "上纵隔区",
      nStage: "同侧N2 / 对侧N3",
      desc: "3A位于纵隔大血管前，3P位于食管后/胸椎体前。",
      color: "#38bdf8",
      clinicalMeaning: "上叶肿瘤的辅助引流通道，属于纵隔 N2 范围。"
    },
    "4": {
      name: "4组 · 下气管旁淋巴结 (4R / 4L)",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "上纵隔区",
      nStage: "同侧N2 / 对侧N3",
      desc: "4R（奇静脉弓下）与 4L（主动脉弓与左肺动脉之间）。右肺最关键的纵隔引流主干道！",
      color: "#38bdf8",
      clinicalMeaning: "右肺上/中叶肿瘤最常转移的纵隔第一站，手术必须彻底骨骼化清扫。"
    },
    "5": {
      name: "5组 · 主肺动脉窗淋巴结 (AP Window)",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "主动脉区",
      nStage: "左侧N2",
      desc: "位于动脉韧带外侧、主动脉弓下方，左上肺叶特有的核心纵隔引流站。",
      color: "#a855f7",
      clinicalMeaning: "左上叶肺癌手术清扫的特异性必清站点。"
    },
    "6": {
      name: "6组 · 升主动脉旁淋巴结",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "主动脉区",
      nStage: "同侧N2",
      desc: "位于升主动脉与主动脉弓的前方及外侧。",
      color: "#a855f7",
      clinicalMeaning: "左侧前纵隔淋巴引流站，若阳性提示纵隔前部受累。"
    },
    "7": {
      name: "7组 · 隆突下淋巴结 (全肺交叉核心枢纽)",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "隆突下区",
      nStage: "N2 (全肺引流交叉总中枢)",
      desc: "位于气管隆突正下方，双侧肺门淋巴液向上回流的必经关键中枢。全肺任何肺叶切除都必须清扫的核心！",
      color: "#e11d48",
      clinicalMeaning: "【外科黄金准则】无论做哪个肺叶切除，第 7 组必须完整整块清扫，是判断是否达 R0 根治的最高基石。"
    },
    "8": {
      name: "8组 · 食管旁淋巴结",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "下纵隔区",
      nStage: "同侧N2",
      desc: "位于隆突下下方、食管两侧、肺韧带以上的下纵隔深部组织内。",
      color: "#f59e0b",
      clinicalMeaning: "双肺下叶肿瘤向后下纵隔引流的必经站点。"
    },
    "9": {
      name: "9组 · 下肺韧带淋巴结",
      level: "N2",
      levelLabel: "N2 纵隔核心站",
      zone: "下纵隔区",
      nStage: "同侧N2",
      desc: "位于下肺韧带内部，是下叶基底段肿瘤向纵隔引流的最下端关卡。",
      color: "#f59e0b",
      clinicalMeaning: "下叶肺癌切除术中必须游离下肺韧带彻底清扫。"
    },
    "10": {
      name: "10组 · 肺门淋巴结 (Hilar Nodes)",
      level: "N1",
      levelLabel: "N1 肺内对照站",
      zone: "肺门区 (N1界线)",
      nStage: "同侧N1 (早期局限)",
      desc: "紧贴左右主支气管周围，是肿瘤从肺内向纵隔突破的【第一道边境哨卡】。",
      color: "#10b981",
      clinicalMeaning: "10组阳性属于 N1（II期），尚未突破到纵隔 N2，预后显著优于纵隔转移。"
    },
    "11": {
      name: "11组 · 叶间淋巴结 (Interlobar Nodes)",
      level: "N1",
      levelLabel: "N1 肺内对照站",
      zone: "肺内区 (N1)",
      nStage: "同侧N1 (早期局限)",
      desc: "位于各肺叶支气管分叉的叶间裂深部，主刀医生术中会单独剥离送检。",
      color: "#059669",
      clinicalMeaning: "属于肺实质内部淋巴站，切除肺叶时常顺带完整移除。"
    },
    "12": {
      name: "12组 · 肺叶淋巴结 (Lobar Nodes)",
      level: "N1",
      levelLabel: "N1 肺内对照站",
      zone: "肺内区 (N1)",
      nStage: "同侧N1 (早期局限)",
      desc: "紧贴肺叶支气管周围，深入各肺叶内部，由病理科医生在切下的肺标本中解剖取材。",
      color: "#059669",
      clinicalMeaning: "属于最外周的肺内防线，随整叶标本一并切除即可达到完全根治。"
    },
  };

  const active = stationData[selectedStation] || stationData["7"];

  // Helper for interactive node render
  const renderStationNode = (
    stationId: string,
    cx: number,
    cy: number,
    baseRadius: number,
    color: string,
    label: string
  ) => {
    const isSelected = selectedStation === stationId;
    const isAnySelected = Boolean(selectedStation);

    return (
      <g
        key={`${stationId}-${cx}-${cy}`}
        onClick={() => setSelectedStation(stationId)}
        className="cursor-pointer transition-all duration-300 group"
      >
        {/* Animated Glow Rings when selected (Anchored strictly to cx, cy) */}
        {isSelected && (
          <>
            {/* Outer Breathing Halo Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={baseRadius * 2.2}
              fill="none"
              stroke={color}
              strokeWidth="1.2"
              strokeOpacity="0.8"
              className="animate-pulse pointer-events-none"
            />
            {/* Inner Glowing Aura Backing */}
            <circle
              cx={cx}
              cy={cy}
              r={baseRadius * 1.65}
              fill={color}
              fillOpacity="0.3"
              stroke={color}
              strokeWidth="1.5"
              className="animate-pulse pointer-events-none"
            />
          </>
        )}

        {/* Main Station Circle */}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? baseRadius * 1.35 : baseRadius}
          fill={color}
          stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.4)"}
          strokeWidth={isSelected ? 2 : 0.8}
          opacity={isSelected ? 1 : isAnySelected ? 0.35 : 0.85}
          className="transition-all duration-300 group-hover:opacity-100"
        />

        {/* Station Label Text */}
        <text
          x={cx}
          y={cy + (baseRadius > 5 ? 1.8 : 1.2)}
          textAnchor="middle"
          fill={isSelected || color === "#e11d48" || color === "#059669" ? "#ffffff" : "#000000"}
          fontSize={isSelected ? (baseRadius > 5 ? 4.5 : 3.8) : (baseRadius > 5 ? 3.8 : 3.0)}
          fontWeight="900"
          className="pointer-events-none select-none transition-all duration-300"
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-3.5 sm:p-5 text-white select-none border border-slate-800 shadow-xl space-y-3.5">
      {/* Header: Clean Single Row or Natural Wrapped Layout */}
      <div className="space-y-2 pb-2.5 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
              <CircleDot className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span>国际 IASLC 肺癌胸腔淋巴结解剖图谱</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono shrink-0">
                  AJCC 8/9th
                </span>
              </h4>
            </div>
          </div>

          {/* Color Legend Tags */}
          <div className="flex items-center gap-1.5 text-[10px] shrink-0 flex-wrap">
            <span className="flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-900/70 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              N2 纵隔中枢(7组)
            </span>
            <span className="flex items-center gap-1 text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-900/70 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              N2 纵隔站
            </span>
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-900/70 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              N1 肺内对照
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          点击图解圆点或下方分类按键，快速定位各组解剖位置、N分期归属与清扫标准
        </p>
      </div>

      {/* SVG Anatomical Diagram Canvas */}
      <div className="relative bg-[#070d19] rounded-2xl p-2 border border-slate-800/80 overflow-hidden">
        <svg viewBox="0 0 240 145" className="w-full h-auto max-h-[300px]">
          <defs>
            <linearGradient id="tracheaGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <radialGradient id="subcarinalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Grid Accent */}
          <line x1="120" y1="0" x2="120" y2="145" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="0.8" />
          <line x1="0" y1="68" x2="240" y2="68" stroke="#1e293b" strokeDasharray="3,3" strokeWidth="0.8" />

          {/* Subcarinal Ambience Glow */}
          <circle cx="120" cy="68" r="28" fill="url(#subcarinalGlow)" pointerEvents="none" />

          {/* Anatomical Labels */}
          <text x="12" y="14" fill="#64748b" fontSize="3.2" fontWeight="bold">右侧 (Right)</text>
          <text x="228" y="14" textAnchor="end" fill="#64748b" fontSize="3.2" fontWeight="bold">左侧 (Left)</text>
          <text x="120" y="8" textAnchor="middle" fill="#94a3b8" fontSize="3.2" fontWeight="bold">气管 (Trachea)</text>

          {/* Trachea and Bronchial Tree Framework */}
          <g stroke="url(#tracheaGrad)" strokeLinecap="round" fill="none">
            {/* Trachea */}
            <line x1="120" y1="10" x2="120" y2="55" strokeWidth="7" />
            
            {/* Main Bronchi */}
            <path d="M 120 55 Q 105 72 70 85" strokeWidth="5.5" />
            <path d="M 120 55 Q 135 72 170 85" strokeWidth="5.5" />
            
            {/* Lobar branches (Right side) */}
            <path d="M 70 85 Q 50 88 32 102" strokeWidth="3.5" />
            <path d="M 70 85 Q 58 105 45 128" strokeWidth="3.5" />

            {/* Lobar branches (Left side) */}
            <path d="M 170 85 Q 190 88 208 102" strokeWidth="3.5" />
            <path d="M 170 85 Q 182 105 195 128" strokeWidth="3.5" />
          </g>

          {/* N2 / N1 Boundary Dashed Guides */}
          <path d="M 85 70 L 85 92" stroke="#10b981" strokeDasharray="2,2" strokeWidth="0.8" opacity="0.6" />
          <path d="M 155 70 L 155 92" stroke="#10b981" strokeDasharray="2,2" strokeWidth="0.8" opacity="0.6" />
          <text x="82" y="65" textAnchor="end" fill="#10b981" fontSize="2.8" fontWeight="bold">N1/N2 肺门界线</text>
          <text x="158" y="65" textAnchor="start" fill="#10b981" fontSize="2.8" fontWeight="bold">N1/N2 肺门界线</text>

          {/* STATION NODES (Interactive) */}
          {/* Station 2R / 2L (Upper Paratracheal) */}
          {renderStationNode("2", 108, 25, 4.5, "#38bdf8", "2R")}
          {renderStationNode("2", 132, 25, 4.5, "#38bdf8", "2L")}

          {/* Station 4R / 4L (Lower Paratracheal - High Frequency N2) */}
          {renderStationNode("4", 105, 45, 5.2, "#38bdf8", "4R")}
          {renderStationNode("4", 135, 48, 5.2, "#38bdf8", "4L")}

          {/* Station 5 (AP Window) & Station 6 */}
          {renderStationNode("5", 148, 36, 4.5, "#a855f7", "5")}
          {renderStationNode("6", 136, 34, 4.0, "#a855f7", "6")}

          {/* Station 7 (Subcarinal - The Heart & King of Mediastinum) */}
          {renderStationNode("7", 120, 68, 7.5, "#e11d48", "7")}

          {/* Station 8 (Paraesophageal) & Station 9 (Pulmonary Ligament) */}
          {renderStationNode("8", 120, 95, 4.5, "#f59e0b", "8")}
          {renderStationNode("9", 120, 118, 4.5, "#f59e0b", "9")}

          {/* --- N1 BASELINE CONTROL STATIONS (Green) --- */}
          {/* Station 10 (Hilar Nodes) */}
          {renderStationNode("10", 85, 78, 5.0, "#10b981", "10")}
          {renderStationNode("10", 155, 78, 5.0, "#10b981", "10")}

          {/* Station 11 (Interlobar Nodes) */}
          {renderStationNode("11", 58, 94, 4.5, "#059669", "11")}
          {renderStationNode("11", 182, 94, 4.5, "#059669", "11")}

          {/* Station 12 (Lobar Nodes - Complete Intrapulmonary Station) */}
          {renderStationNode("12", 34, 102, 4.0, "#059669", "12")}
          {renderStationNode("12", 46, 126, 4.0, "#059669", "12")}
          {renderStationNode("12", 206, 102, 4.0, "#059669", "12")}
          {renderStationNode("12", 194, 126, 4.0, "#059669", "12")}
        </svg>

        {/* Floating Quick Hint Overlay */}
        <div className="absolute bottom-2 right-2 text-[9px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
          💡 点击图谱圆点或下方按钮即刻高亮
        </div>
      </div>

      {/* Categorized Station Switcher Buttons */}
      <div className="space-y-2">
        {/* N2 Group (Primary Topic Core) */}
        <div className="space-y-1">
          <div className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span>【N2 纵隔核心清扫区 · 本专区研判核心】</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "7", label: "7组 · 隆突下 (交叉核心)", highlight: true },
              { id: "4", label: "4组 · 下气管旁 (高发)", highlight: false },
              { id: "2", label: "2组 · 上气管旁", highlight: false },
              { id: "5", label: "5组 · 主肺动脉窗", highlight: false },
              { id: "6", label: "6组 · 升主动脉旁", highlight: false },
              { id: "8", label: "8组 · 食管旁", highlight: false },
              { id: "9", label: "9组 · 下肺韧带", highlight: false },
              { id: "1", label: "1组 · 锁骨上(N3)", highlight: false },
            ].map((item) => {
              const isSelected = selectedStation === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStation(item.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? item.id === "7"
                        ? "bg-rose-600 text-white ring-2 ring-rose-400/50 scale-105"
                        : "bg-sky-600 text-white ring-2 ring-sky-400/50 scale-105"
                      : "bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* N1 Group (Intrapulmonary Baseline Control) */}
        <div className="space-y-1 pt-1 border-t border-slate-800/80">
          <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>【N1 肺门/肺内站 · 基准线对照】</span>
            <span className="text-[9px] font-normal text-slate-400">(位于肺实质内，随切除肺叶一并切下)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "10", label: "10组 · 肺门淋巴结 (哨卡界线)" },
              { id: "11", label: "11组 · 叶间淋巴结 (叶支气管旁)" },
              { id: "12", label: "12组 · 肺叶淋巴结 (肺内末梢)" },
            ].map((item) => {
              const isSelected = selectedStation === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStation(item.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? "bg-emerald-600 text-white ring-2 ring-emerald-400/50 scale-105"
                      : "bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700/40"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Station Detailed Clinical Card */}
      <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: active.color }}
            />
            <span className="text-xs sm:text-sm font-extrabold text-white">
              {active.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
              active.level === "N2"
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : active.level === "N1"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-pink-500/20 text-pink-300 border-pink-500/40"
            }`}>
              {active.levelLabel}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {active.zone}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          {active.desc}
        </p>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300">临床决策与外科意义：</span>
            <span className="text-slate-300 ml-1">{active.clinicalMeaning}</span>
          </div>
        </div>
      </div>

      {/* Bottom Surgical Guideline Notice */}
      <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-200">权威外科清扫准则：</span>
          国际 CSCO / NCCN 指南明确要求，系统性清扫必须覆盖<strong>至少 3 组纵隔 N2 站（必须包含红色标示的第 7 组隆突下中枢）+ 肺门/叶间 N1 站，清扫总数 ≥12 枚</strong>，切缘阴性（R0）才能确立彻底根治！
        </div>
      </div>
    </div>
  );
}
