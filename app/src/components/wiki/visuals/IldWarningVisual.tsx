"use client";

import React from "react";
import { AlertTriangle, Flame, PhoneCall, Stethoscope, Activity, CheckCircle2 } from "lucide-react";

export function IldWarningVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-rose-900/60 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">药物性间质性肺炎 (ILD) 早期预警三联征</h5>
            <span className="text-[10px] text-rose-400 font-mono">发生率 1%~3% · 早识别即早逆转</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
          急症警示
        </span>
      </div>

      {/* Triad of Symptoms */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-rose-500/30 space-y-1">
          <div className="font-extrabold text-rose-400 flex items-center gap-1.5">
            <span className="w-4 h-4 min-w-[16px] rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
            <span>突发剧烈干咳</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            无感冒诱因下出现持续性、刺激性无痰干咳，平卧时加重。
          </p>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-rose-500/30 space-y-1">
          <div className="font-extrabold text-rose-400 flex items-center gap-1.5">
            <span className="w-4 h-4 min-w-[16px] rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
            <span>活动后胸闷气促</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            平地慢走或爬半层楼即感呼吸费力，指夹血氧仪 SpO2 &lt; 93%。
          </p>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-rose-500/30 space-y-1">
          <div className="font-extrabold text-rose-400 flex items-center gap-1.5">
            <span className="w-4 h-4 min-w-[16px] rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
            <span>伴或不伴低热</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            体温在 37.5℃~38.5℃ 之间波动，常规退热药效果欠佳。
          </p>
        </div>
      </div>

      {/* Emergency Action Plan */}
      <div className="p-3.5 bg-rose-950/40 rounded-xl border border-rose-500/40 space-y-2 text-xs">
        <div className="font-bold text-rose-200 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>疑似 ILD 紧急处理三步法（不可拖延至第二天）：</span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-start gap-2 text-slate-200">
            <span className="font-bold text-amber-300 shrink-0">第一步：</span>
            <span><strong>立即停用</strong>当前的靶向药（奥希替尼/伏美替尼等）或 ADC 药物；</span>
          </div>
          <div className="flex items-start gap-2 text-slate-200">
            <span className="font-bold text-amber-300 shrink-0">第二步：</span>
            <span><strong>24小时内就医</strong>急查胸部薄层高分辨 CT (HRCT) 与血气分析，排查双肺毛玻璃样渗出；</span>
          </div>
          <div className="flex items-start gap-2 text-slate-200">
            <span className="font-bold text-amber-300 shrink-0">第三步：</span>
            <span>在呼吸科/肿瘤科指导下启动<strong>糖皮质激素（泼尼松/甲强龙）</strong>抗炎冲击治疗，绝大多数早期发现可完全吸收逆转。</span>
          </div>
        </div>
      </div>
    </div>
  );
}
