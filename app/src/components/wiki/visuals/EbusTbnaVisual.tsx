"use client";

import React from "react";
import { Eye, Stethoscope, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export function EbusTbnaVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">超声支气管镜 (EBUS-TBNA) 纵隔微创分期全解析</h5>
            <span className="text-[10px] text-slate-400 font-mono">Endobronchial Ultrasound · 免除开胸纵隔镜探查</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
          无痛微创
        </span>
      </div>

      {/* 3 Core Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-cyan-500/30 space-y-1">
          <div className="font-extrabold text-cyan-300">① 像“潜望镜”穿透气管</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            超声微型探头直接贴在气管内壁，实时看清气管外的 4R、7、11L 组纵隔淋巴结。
          </p>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-cyan-500/30 space-y-1">
          <div className="font-extrabold text-cyan-300">② 彩色多普勒精准避血</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            超声下大血管呈现彩色血流信号，穿刺针精准绕开肺动脉与主动脉，安全性极高。
          </p>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-cyan-500/30 space-y-1">
          <div className="font-extrabold text-cyan-300">③ 无痛静脉镇静体验</div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            像做无痛胃肠镜一样“睡一觉”，20~30分钟完成检查，醒来无开刀伤口。
          </p>
        </div>
      </div>

      {/* Target Lymph Node Stations */}
      <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-2 text-xs">
        <div className="font-bold text-amber-300 flex items-center justify-between">
          <span>核心穿刺分期淋巴结站位：</span>
          <span className="text-[10px] text-slate-400 font-mono">NCCN / IASLC 推荐金标准</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 text-center font-bold text-slate-200">
            4R / 4L (气管旁)
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 text-center font-bold text-slate-200">
            7 组 (隆突下)
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 text-center font-bold text-slate-200">
            10R / 10L (肺门)
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700 text-center font-bold text-slate-200">
            11R / 11L (叶间)
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-cyan-950/40 rounded-lg border border-cyan-500/30 text-[11px] text-cyan-200 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
        <span><strong>临床价值：</strong>EBUS 阴性可百分之百确立 N0/N1 根治手术指征，直接避免了盲目开胸后发现 N2 无法切除的二次创伤！</span>
      </div>
    </div>
  );
}
