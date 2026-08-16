"use client";

import React, { useState } from "react";

type MplcType = "mplc" | "metastasis";

export function MPLCGGOVisual() {
  const [viewType, setViewType] = useState<MplcType>("mplc");

  const isMplc = viewType === "mplc";

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Toggle mode */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewType("mplc")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all duration-200 ${
            isMplc
              ? "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
          }`}
        >
          🌱 同步多原发肺癌 (MPLC - 绝大多数)
        </button>
        <button
          onClick={() => setViewType("metastasis")}
          className={`flex-1 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all duration-200 ${
            !isMplc
              ? "border-rose-400 bg-rose-50 text-rose-800 shadow-sm"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
          }`}
        >
          ⚠️ 肺内转移播散 (极少数/有明显原发灶)
        </button>
      </div>

      {/* SVG & Anatomy schema */}
      <div className={`rounded-xl border-2 p-3 sm:p-4 ${isMplc ? "border-emerald-300 bg-emerald-50/60" : "border-rose-300 bg-rose-50/60"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* Dual Lung Diagram */}
          <div className="flex flex-col items-center">
            <svg viewBox="0 0 220 160" className="w-full max-w-[220px]">
              {/* Right lung */}
              <ellipse cx="140" cy="80" rx="55" ry="68" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Left lung */}
              <ellipse cx="75" cy="80" rx="48" ry="68" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

              {isMplc ? (
                <>
                  {/* MPLC: Independent Nodules with different colors & genes */}
                  {/* Nodule 1: Right upper (Main GGO, CTR 0.6) */}
                  <circle cx="155" cy="45" r="9" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
                  <circle cx="155" cy="45" r="4" fill="#9a3412" />
                  <text x="155" y="62" fontSize="6.5" textAnchor="middle" fill="#9a3412" fontWeight="bold">主病灶 1.2cm</text>
                  <text x="155" y="70" fontSize="5.5" textAnchor="middle" fill="#64748b">EGFR 19del</text>

                  {/* Nodule 2: Left upper (pGGN 5mm) */}
                  <circle cx="65" cy="50" r="5" fill="#34d399" stroke="#059669" strokeWidth="1.2" opacity="0.85" />
                  <text x="65" y="64" fontSize="6" textAnchor="middle" fill="#047857" fontWeight="bold">次结节 5mm</text>
                  <text x="65" y="71" fontSize="5.5" textAnchor="middle" fill="#64748b">EGFR 野生型</text>

                  {/* Nodule 3: Right lower (pGGN 4mm) */}
                  <circle cx="135" cy="120" r="4" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.2" opacity="0.85" />
                  <text x="135" y="132" fontSize="6" textAnchor="middle" fill="#1d4ed8" fontWeight="bold">微结节 4mm</text>
                  <text x="135" y="139" fontSize="5.5" textAnchor="middle" fill="#64748b">极惰性纯磨</text>

                  {/* Independent labels */}
                  <text x="110" y="20" fontSize="7.5" textAnchor="middle" fill="#047857" fontWeight="bold">
                    各病灶基因/亚型不同 ➔ 各自极早期独立原发
                  </text>
                </>
              ) : (
                <>
                  {/* Metastasis: Main solid tumor + identical clone spread */}
                  <circle cx="150" cy="50" r="14" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
                  <text x="150" y="53" fontSize="6.5" textAnchor="middle" fill="white" fontWeight="bold">晚期主癌灶</text>

                  {/* Spread arrows */}
                  <path d="M136,50 Q110,65 85,60" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />
                  <path d="M140,64 Q135,90 120,110" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2" />

                  {/* Sub-metastases (solid, identical gene) */}
                  <circle cx="85" cy="60" r="6" fill="#ef4444" opacity="0.8" />
                  <circle cx="120" cy="110" r="6" fill="#ef4444" opacity="0.8" />
                  <text x="110" y="20" fontSize="7.5" textAnchor="middle" fill="#b91c1c" fontWeight="bold">
                    同源克隆 ➔ 伴淋巴结/血管血行转移通道
                  </text>
                </>
              )}

              {/* Trachea & Heart */}
              <path d="M107,15 L107,35 L95,50 M107,35 L120,50" fill="none" stroke="#64748b" strokeWidth="2" />
              <ellipse cx="108" cy="85" rx="7" ry="9" fill="#fca5a5" opacity="0.7" />
            </svg>
            <p className="text-[11px] text-slate-500 mt-1 text-center">
              {isMplc ? "双肺多发磨玻璃结节（MPLC）示意图" : "恶性肿瘤肺内播散转移示意图"}
            </p>
          </div>

          {/* Comparison explanations */}
          <div className="space-y-2">
            {isMplc ? (
              <>
                <div className="bg-white rounded-lg p-2.5 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <span>🔬 分子生物学真相：</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    2022 IASLC 最新指南证实：双肺多发 GGO 各病灶多具有<strong>不同驱动基因突变或不同病理亚型</strong>，属于各自独立生长的早期病变，非转移扩散。
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <span>🎯 临床处理黄金法则：</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    <strong>抓大放小、保护肺功能：</strong>优先微创切除实性成分明显的主病灶（CTR&gt;0.5），对纯磨玻璃次结节长期薄层随访，绝不盲目做双侧大范围切除。
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-lg p-2.5 border border-rose-200">
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <span>⚠️ 转移灶特征：</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    转移灶多为快速长大的纯实性结节、相同基因型，常伴纵隔淋巴结肿大或胸水。而体检发现的双肺纯磨玻璃结节 <strong>95% 以上均为良性或独立 MPLC</strong>。
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-rose-200">
                  <div className="text-xs font-bold text-rose-800 flex items-center gap-1">
                    <span>🛡️ 鉴别定心丸：</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    纯磨玻璃结节贴壁生长，没有侵入血管的能力，根本不可能在肺内播散！请彻底放下恐慌。
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
