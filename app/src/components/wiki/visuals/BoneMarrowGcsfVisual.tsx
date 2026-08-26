"use client";

import React from "react";
import { Activity, ShieldCheck, AlertCircle, Syringe, Info } from "lucide-react";

export function BoneMarrowGcsfVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Syringe className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">化疗后骨髓抑制低谷期与升白针 (G-CSF) 黄金窗口</h5>
            <span className="text-[10px] text-slate-400 font-mono">培美曲塞 / 顺铂 / 卡铂 辅助化疗周期规律</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
          低谷管理
        </span>
      </div>

      {/* Timeline of Bone Marrow Suppression */}
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70 space-y-1">
            <div className="text-slate-400 font-bold text-[11px]">第 1~6 天 (平稳期)</div>
            <div className="font-extrabold text-emerald-400">白细胞多正常</div>
            <p className="text-[11px] text-slate-300">化疗药物刚进入体内，循环中的成熟中性粒细胞仍在正常工作。</p>
          </div>

          <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40 space-y-1">
            <div className="text-amber-400 font-bold text-[11px]">第 7~14 天 (黄金低谷期)</div>
            <div className="font-extrabold text-amber-300">白细胞达最低值 (Nadir)</div>
            <p className="text-[11px] text-slate-200">中性粒细胞 (ANC) 显著下调，极易发生感染，需隔天查血常规。</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70 space-y-1">
            <div className="text-slate-400 font-bold text-[11px]">第 15~21 天 (恢复回升期)</div>
            <div className="font-extrabold text-sky-400">骨髓造血自愈回升</div>
            <p className="text-[11px] text-slate-300">骨髓造血干细胞重新分化，白细胞自愈或在升白针支持下达标。</p>
          </div>
        </div>
      </div>

      {/* Short-acting vs Long-acting comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
          <div className="font-bold text-sky-300 flex items-center justify-between">
            <span>短效升白针 (rhG-CSF)</span>
            <span className="text-[10px] text-slate-400">皮下注射每日 1 支</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong>使用时机：</strong>化疗后第 7~10 天验血，当中性粒细胞 &lt; 1.5×10^9/L 时启动治疗性注射，连续打 2~4 天至正常后停用。
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1.5">
          <div className="font-bold text-purple-300 flex items-center justify-between">
            <span>长效升白针 (PEG-rhG-CSF)</span>
            <span className="text-[10px] text-slate-400">每周期化疗后 1 针</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            <strong>使用时机：</strong>化疗结束后 24~48 小时单次皮下注射，缓慢缓释保护 14 天，免去频繁往返医院扎针。
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/40 text-[11px] text-rose-200 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <span><strong>红线预警：</strong>化疗后若体温 &ge; 38.0℃ 且白细胞低于正常，属于<strong>粒缺性发热 (FN)</strong> 急症，需立即前往医院急诊输注抗生素，绝不可自行服用退烧药硬抗！</span>
      </div>
    </div>
  );
}
