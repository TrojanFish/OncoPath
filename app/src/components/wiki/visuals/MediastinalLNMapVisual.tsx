"use client";

import { useState } from "react";
import { CircleDot, Info } from "lucide-react";

export function MediastinalLNMapVisual() {
  const [selectedStation, setSelectedStation] = useState<string>("7");

  const stationData: Record<string, { name: string; zone: string; nStage: string; desc: string }> = {
    "1": { name: "1组 · 锁骨上淋巴结", zone: "上纵隔区", nStage: "N3 (晚期/对侧或锁骨上)", desc: "位于锁骨上窝及下颈部，若转移属于 N3 分期。" },
    "2": { name: "2组 · 上气管旁淋巴结", zone: "上纵隔区", nStage: "同侧N2 / 对侧N3", desc: "位于主动脉弓上缘或左颈总动脉上缘水平以上的气管两侧。" },
    "3": { name: "3组 · 血管前/后间隙淋巴结", zone: "上纵隔区", nStage: "同侧N2 / 对侧N3", desc: "3A位于大血管前，3P位于食管后/椎体前。" },
    "4": { name: "4组 · 下气管旁淋巴结", zone: "上纵隔区", nStage: "同侧N2 / 对侧N3", desc: "4R（奇静脉弓以下）与 4L（主动脉弓与左肺动脉之间）。" },
    "5": { name: "5组 · 主肺动脉窗淋巴结", zone: "主动脉区", nStage: "左侧N2", desc: "位于动脉韧带外侧，左上肺叶引流的关键纵隔站。" },
    "6": { name: "6组 · 升主动脉旁淋巴结", zone: "主动脉区", nStage: "同侧N2", desc: "位于升主动脉与主动脉弓的前方及外侧。" },
    "7": { name: "7组 · 隆突下淋巴结 (核心汇聚枢纽)", zone: "隆突下区", nStage: "N2 (全肺引流交叉核心)", desc: "位于气管隆突正下方，双侧肺门淋巴液向上纵隔回流的必经关键汇聚站。临床清扫的必查核心！" },
    "8": { name: "8组 · 食管旁淋巴结", zone: "下纵隔区", nStage: "同侧N2", desc: "位于隆突下下方、食管两侧、肺韧带以上的下纵隔组织内。" },
    "9": { name: "9组 · 下肺韧带淋巴结", zone: "下纵隔区", nStage: "同侧N2", desc: "位于下肺韧带内，下叶肿瘤常见引流站点。" },
    "10": { name: "10组 · 肺门淋巴结", zone: "肺门区", nStage: "同侧N1 (早期局限)", desc: "紧贴主支气管周围，属于肺门 N1 站点，完整切除后预后良好。" },
    "11": { name: "11组 · 叶间淋巴结", zone: "肺内区", nStage: "同侧N1 (早期局限)", desc: "位于各肺叶支气管分叉之间。" },
    "12": { name: "12组 · 肺叶淋巴结", zone: "肺内区", nStage: "同侧N1 (早期局限)", desc: "紧贴肺叶支气管外周。" },
  };

  const active = stationData[selectedStation] || stationData["7"];

  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
          <CircleDot className="w-3.5 h-3.5 text-sky-400" />
          <span>国际 IASLC 肺癌胸腔淋巴结站点图谱</span>
        </span>
        <span className="text-[10px] text-slate-400">AJCC 第 8 版 N 分期基准</span>
      </div>

      <svg viewBox="0 0 240 130" className="w-full h-auto mb-2.5">
        <rect width="240" height="130" fill="#0b1120" rx="8" />

        {/* Trachea and Bronchial Tree Outline */}
        <g stroke="#475569" strokeWidth="2.5" fill="none">
          {/* Trachea */}
          <line x1="120" y1="12" x2="120" y2="55" strokeWidth="6" />
          {/* Main Bronchi */}
          <path d="M 120 55 Q 105 72 70 85" strokeWidth="4.5" />
          <path d="M 120 55 Q 135 72 170 85" strokeWidth="4.5" />
          {/* Lobar branches */}
          <path d="M 70 85 Q 50 88 35 100" strokeWidth="3" />
          <path d="M 70 85 Q 60 105 50 120" strokeWidth="3" />
          <path d="M 170 85 Q 190 88 205 100" strokeWidth="3" />
          <path d="M 170 85 Q 180 105 190 120" strokeWidth="3" />
        </g>

        {/* Station Markers */}
        {/* Station 2R/2L */}
        <circle cx="108" cy="25" r="4.5" fill="#38bdf8" onClick={() => setSelectedStation("2")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="108" y="27" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">2R</text>

        {/* Station 4R / 4L */}
        <circle cx="106" cy="45" r="5" fill="#38bdf8" onClick={() => setSelectedStation("4")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="106" y="47" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">4R</text>
        <circle cx="134" cy="48" r="5" fill="#38bdf8" onClick={() => setSelectedStation("4")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="134" y="50" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">4L</text>

        {/* Station 5/6 */}
        <circle cx="145" cy="38" r="4.5" fill="#a855f7" onClick={() => setSelectedStation("5")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="145" y="40" textAnchor="middle" fill="#fff" fontSize="3.5" fontWeight="bold">5</text>

        {/* Station 7 (Subcarinal - Highlighted Heart) */}
        <circle
          cx="120"
          cy="68"
          r="8"
          fill="#e11d48"
          stroke="#fecdd3"
          strokeWidth="1.5"
          onClick={() => setSelectedStation("7")}
          className="cursor-pointer hover:scale-125 transition-transform animate-pulse"
        />
        <text x="120" y="71" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold">7</text>

        {/* Station 8/9 */}
        <circle cx="120" cy="95" r="4.5" fill="#f59e0b" onClick={() => setSelectedStation("8")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="120" y="97" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">8</text>
        <circle cx="120" cy="115" r="4.5" fill="#f59e0b" onClick={() => setSelectedStation("9")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="120" y="117" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">9</text>

        {/* Station 10 (Hilar) */}
        <circle cx="85" cy="78" r="5" fill="#10b981" onClick={() => setSelectedStation("10")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="85" y="80" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">10</text>
        <circle cx="155" cy="78" r="5" fill="#10b981" onClick={() => setSelectedStation("10")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="155" y="80" textAnchor="middle" fill="#000" fontSize="3.5" fontWeight="bold">10</text>

        {/* Station 11/12 (Interlobar / Lobar) */}
        <circle cx="58" cy="94" r="4.5" fill="#059669" onClick={() => setSelectedStation("11")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="58" y="96" textAnchor="middle" fill="#fff" fontSize="3.5" fontWeight="bold">11</text>
        <circle cx="182" cy="94" r="4.5" fill="#059669" onClick={() => setSelectedStation("11")} className="cursor-pointer hover:scale-125 transition-transform" />
        <text x="182" y="96" textAnchor="middle" fill="#fff" fontSize="3.5" fontWeight="bold">11</text>
      </svg>

      {/* Quick Legend & Station Selector */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-2.5 scrollbar-none">
        {["7", "4", "2", "5", "8", "9", "10", "11"].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStation(st)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
              selectedStation === st
                ? st === "7"
                  ? "bg-rose-600 text-white"
                  : "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            第 {st} 组
          </button>
        ))}
      </div>

      {/* Selected Station Info Box */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-white">{active.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
            {active.nStage}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {active.desc}
        </p>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
        <span className="inline-flex items-center gap-1 font-bold text-amber-300 mr-1">
          <Info className="w-3 h-3" />
          <span>临床核心：</span>
        </span>
        外科手术中，规范清扫<strong>至少 3 组纵隔站（必须包含红色标注的第 7 组隆突下淋巴结）且清扫总数 &gt;12 枚</strong>，是确保完全切除（R0）并精确指导术后辅助靶向/化疗的金标准。
      </div>
    </div>
  );
}
