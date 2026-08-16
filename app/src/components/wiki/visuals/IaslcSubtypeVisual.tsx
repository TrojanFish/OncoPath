"use client";

export function IaslcSubtypeVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-purple-400">📊 IASLC 肺腺癌组织学亚型预后阶梯</span>
        <span className="text-[10px] text-slate-400">基于 IASLC / WHO 国际标准</span>
      </div>

      <div className="space-y-2.5">
        {/* Tier 1: Lepidic (Low Risk) */}
        <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">G1</span>
            <div>
              <div className="text-xs font-bold text-emerald-300">贴壁生长型 (Lepidic)</div>
              <div className="text-[10px] text-emerald-400/80">单层细胞沿肺泡壁爬行 · 极惰性</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-emerald-400 font-mono">≈ 100%</div>
            <div className="text-[9px] text-emerald-400/70">5年生存率</div>
          </div>
        </div>

        {/* Tier 2: Acinar & Papillary (Moderate Risk) */}
        <div className="bg-sky-950/60 p-2.5 rounded-xl border border-sky-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">G2</span>
            <div>
              <div className="text-xs font-bold text-sky-300">腺泡型 (Acinar) / 乳头型 (Papillary)</div>
              <div className="text-[10px] text-sky-400/80">最常见的经典肺腺癌形态 · 规范切除预后优</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-sky-400 font-mono">85 ~ 90%</div>
            <div className="text-[9px] text-sky-400/70">5年生存率</div>
          </div>
        </div>

        {/* Tier 3: Micropapillary & Solid (High Risk if >= 20%) */}
        <div className="bg-rose-950/60 p-2.5 rounded-xl border border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">G3</span>
            <div>
              <div className="text-xs font-bold text-rose-300">微乳头型 (Micropapillary) / 实体型 (Solid)</div>
              <div className="text-[10px] text-rose-400/80">密集无极性生长 · 对术后靶向与化疗极敏感</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-rose-400 font-mono">辅助治疗可大幅拉升</div>
            <div className="text-[9px] text-rose-400/70">ADAURA DFS ↑83%</div>
          </div>
        </div>
      </div>

      <div className="mt-2.5 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 绝大多数肺腺癌是混合亚型（如 60% 腺泡 + 20% 贴壁）。微乳头和实体型成分只要占比不高（&lt;20%），就不会被判定为 Grade 3 高危分级，请结合病理报告具体百分比理性看待。
      </div>
    </div>
  );
}
