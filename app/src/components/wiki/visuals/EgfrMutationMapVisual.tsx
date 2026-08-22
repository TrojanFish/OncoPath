"use client";

import { useState } from "react";
import { Dna, Target } from "lucide-react";

type ExonId = "19del" | "L858R" | "20ins" | "rare";

export function EgfrMutationMapVisual() {
  const [selectedExon, setSelectedExon] = useState<ExonId>("19del");

  const exonDetails = {
    "19del": {
      title: "19 号外显子缺失突变 (Exon 19del)",
      prevalence: "约占 EGFR 突变总数 45% ~ 50%",
      type: "经典敏感突变 · 黄金靶点",
      typeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      drugs: "三代 TKI 首选：奥希替尼、阿美替尼、伏美替尼",
      features: "对第三代 EGFR-TKI 具有极其卓越的响应率和中枢神经系统（脑部）高保护率，ADAURA 术后辅助治疗降低 83% 复发转移风险。",
    },
    "L858R": {
      title: "21 号外显子 L858R 点突变",
      prevalence: "约占 EGFR 突变总数 40% ~ 45%",
      type: "经典敏感突变 · 黄金靶点",
      typeColor: "text-sky-400 bg-sky-500/10 border-sky-500/30",
      drugs: "三代 TKI 首选：奥希替尼、阿美替尼、伏美替尼",
      features: "与 19del 同属最经典的敏感突变类型，三代靶向药物长期控制率极高，术后辅助治疗大幅延缓疾病复发。",
    },
    "20ins": {
      title: "20 号外显子插入突变 (Exon 20ins)",
      prevalence: "约占 EGFR 突变总数 4% ~ 9%",
      type: "难治性/特异性突变",
      typeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      drugs: "特异性新药：舒沃替尼 (Sunvozertinib)、埃万妥单抗 (Amivantamab)",
      features: "由于空间构象改变，传统一、二、三代常规 TKI 响应有限。近年来特异性 Exon 20 靶向药（舒沃替尼等）上市，大幅突破了治疗瓶颈！",
    },
    "rare": {
      title: "罕见敏感突变 (G719X / L861Q / S768I)",
      prevalence: "约占 EGFR 突变总数 3% ~ 5%",
      type: "罕见非经典敏感突变",
      typeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      drugs: "二代阿法替尼 (Afatinib) 或 三代 TKI 加量/常规",
      features: "分布于 18 号外显子（G719X）、20 号外显子（S768I）及 21 号外显子（L861Q），国际指南首选二代阿法替尼或三代靶向药治疗。",
    },
  };

  const active = exonDetails[selectedExon];

  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
          <Dna className="w-3.5 h-3.5 text-sky-400" />
          <span>EGFR 酪氨酸激酶区突变位点全景图谱</span>
        </span>
        <span className="text-[10px] text-slate-400">外显子 18 ~ 21 靶点分布</span>
      </div>

      {/* Exon Domain SVG Visual */}
      <svg viewBox="0 0 240 70" className="w-full h-auto mb-3">
        <rect width="240" height="70" fill="#0b1120" rx="8" />

        {/* Protein Backbone Bar */}
        <line x1="15" y1="35" x2="225" y2="35" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

        {/* Exon 18 */}
        <g onClick={() => setSelectedExon("rare")} className="cursor-pointer">
          <rect
            x="20"
            y="20"
            width="42"
            height="30"
            rx="4"
            fill={selectedExon === "rare" ? "#8b5cf6" : "#4c1d95"}
            stroke={selectedExon === "rare" ? "#c4b5fd" : "#6d28d9"}
            strokeWidth={selectedExon === "rare" ? "1.5" : "0.8"}
          />
          <text x="41" y="34" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">
            Exon 18
          </text>
          <text x="41" y="43" textAnchor="middle" fill="#ddd6fe" fontSize="3.5">
            G719X (罕见)
          </text>
        </g>

        {/* Exon 19 (Classical 19del) */}
        <g onClick={() => setSelectedExon("19del")} className="cursor-pointer">
          <rect
            x="68"
            y="17"
            width="48"
            height="36"
            rx="4"
            fill={selectedExon === "19del" ? "#10b981" : "#065f46"}
            stroke={selectedExon === "19del" ? "#6ee7b7" : "#059669"}
            strokeWidth={selectedExon === "19del" ? "1.5" : "0.8"}
          />
          <text x="92" y="33" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold">
            Exon 19
          </text>
          <text x="92" y="44" textAnchor="middle" fill="#a7f3d0" fontSize="4" fontWeight="bold">
            19del (~45%)
          </text>
        </g>

        {/* Exon 20 (20ins / T790M) */}
        <g onClick={() => setSelectedExon("20ins")} className="cursor-pointer">
          <rect
            x="122"
            y="20"
            width="46"
            height="30"
            rx="4"
            fill={selectedExon === "20ins" ? "#f59e0b" : "#78350f"}
            stroke={selectedExon === "20ins" ? "#fde68a" : "#b45309"}
            strokeWidth={selectedExon === "20ins" ? "1.5" : "0.8"}
          />
          <text x="145" y="34" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="bold">
            Exon 20
          </text>
          <text x="145" y="43" textAnchor="middle" fill="#fef3c7" fontSize="3.5">
            20ins (~6%)
          </text>
        </g>

        {/* Exon 21 (Classical L858R) */}
        <g onClick={() => setSelectedExon("L858R")} className="cursor-pointer">
          <rect
            x="174"
            y="17"
            width="48"
            height="36"
            rx="4"
            fill={selectedExon === "L858R" ? "#0284c7" : "#0c4a6e"}
            stroke={selectedExon === "L858R" ? "#7dd3fc" : "#0369a1"}
            strokeWidth={selectedExon === "L858R" ? "1.5" : "0.8"}
          />
          <text x="198" y="33" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold">
            Exon 21
          </text>
          <text x="198" y="44" textAnchor="middle" fill="#bae6fd" fontSize="4" fontWeight="bold">
            L858R (~40%)
          </text>
        </g>
      </svg>

      {/* Exon Quick Selection Pills */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {(["19del", "L858R", "20ins", "rare"] as ExonId[]).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedExon(key)}
            className={`text-[11px] py-1 px-1 rounded-lg font-semibold transition-all cursor-pointer ${
              selectedExon === key
                ? "bg-slate-700 text-sky-300 shadow-sm ring-1 ring-sky-400"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {key === "19del" ? "19 缺失" : key === "L858R" ? "21 L858R" : key === "20ins" ? "20 插入" : "罕见突变"}
          </button>
        ))}
      </div>

      {/* Selected Details Card */}
      <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-bold text-white">{active.title}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${active.typeColor}`}>
            {active.type} · {active.prevalence}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">
          {active.features}
        </p>

        <div className="text-[11px] bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-sky-300 flex items-start gap-1.5">
          <Target className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
          <span><strong>首选用药策略：</strong> {active.drugs}</span>
        </div>
      </div>
    </div>
  );
}
