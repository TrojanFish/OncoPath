"use client";

import React from "react";
import { Check, X, AlertTriangle, ShieldCheck, HeartPulse, Leaf } from "lucide-react";

export function TcmBoundaryVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">中西医协同黄金边界与防毒护肝红绿灯</h5>
            <span className="text-[10px] text-slate-400 font-mono">科学协同 · 去伪存真 · 杜绝药物性肝损伤 (DILI)</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
          科学边界
        </span>
      </div>

      {/* Red Light vs Green Light Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Green Box: What TCM CAN Do */}
        <div className="p-3.5 bg-emerald-950/30 rounded-xl border border-emerald-500/40 space-y-2">
          <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>【绿灯 · 科学推荐】中医药辅助调理价值</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>减毒增效：</strong>缓解化疗引起的顽固恶心呕吐、食欲不振、神疲乏力。</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>术后气血重塑：</strong>益气健脾、化痰通络，加速胸腔引流术后体能恢复。</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>正规医院处方：</strong>由三甲中医院肿瘤科辨证论治开具，定期查肝肾功。</span>
            </li>
          </ul>
        </div>

        {/* Red Box: Absolute Red Lines */}
        <div className="p-3.5 bg-rose-950/30 rounded-xl border border-rose-500/40 space-y-2">
          <div className="font-bold text-rose-300 flex items-center gap-1.5 text-xs">
            <X className="w-4 h-4 text-rose-400 shrink-0" />
            <span>【红灯 · 严禁踩雷】三大认知与用药误区</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>严禁替代抗癌主力：</strong>中药绝不能替代手术切除、靶向药与放化疗。</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>严防肝损毒性草药：</strong>盲目服用土三七、何首乌、雷公藤易致急性肝衰竭。</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>杜绝高价保健品迷信：</strong>灵芝孢子粉、冬虫夏草等仅属普通滋补品，无消瘤作用。</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety Guideline */}
      <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700 text-[11px] text-amber-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span><strong>用药安全底线：</strong>服用奥希替尼等靶向药期间，若服用中药，两者服药时间需至少<strong>间隔 2 小时以上</strong>，并每月复查肝功能 (ALT/AST/TBIL)！</span>
      </div>
    </div>
  );
}
