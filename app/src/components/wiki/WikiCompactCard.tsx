"use client";

import React from "react";
import { Microscope, Dna, Stethoscope, Activity } from "lucide-react";
import type { WikiTopic, WikiCategory } from "@/lib/wikiData";
import { RISK_LEVEL_CONFIG, WIKI_CATEGORIES } from "@/lib/wikiData";
import WikiTopicIcon from "./WikiTopicIcon";

interface WikiCompactCardProps {
  topic: WikiTopic;
  isMatchedProfile?: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
}

/** 风险等级对应的左侧色条 */
const RISK_ACCENT: Record<string, string> = {
  high:     "border-l-rose-500",
  moderate: "border-l-amber-500",
  low:      "border-l-emerald-500",
  safe:     "border-l-teal-500",
};

/** 风险等级对应的 dot 颜色 */
const RISK_DOT: Record<string, string> = {
  high:     "bg-rose-500",
  moderate: "bg-amber-400",
  low:      "bg-emerald-500",
  safe:     "bg-teal-500",
};

export function WikiCompactCard({
  topic,
  isMatchedProfile,
  isHighlighted,
  onClick,
}: WikiCompactCardProps) {
  const riskCfg = RISK_LEVEL_CONFIG[topic.riskLevel];
  const catCfg  = WIKI_CATEGORIES[topic.category];
  const accentBorder = RISK_ACCENT[topic.riskLevel] ?? "border-l-slate-300";
  const dotColor     = RISK_DOT[topic.riskLevel] ?? "bg-slate-400";

  return (
    <button
      type="button"
      id={`topic-${topic.id}`}
      onClick={onClick}
      className={`
        group relative w-full text-left rounded-2xl border-l-[3px] bg-white
        border border-slate-200/90 shadow-sm
        hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300
        active:scale-[0.98] active:shadow-sm
        transition-all duration-200 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
        ${accentBorder}
        ${isHighlighted
          ? "ring-2 ring-blue-500/50 border-blue-300 shadow-blue-100 bg-blue-50/30"
          : ""}
        ${isMatchedProfile && !isHighlighted
          ? "ring-1 ring-teal-400/40 border-teal-200 bg-teal-50/20"
          : ""}
      `}
      aria-label={`查看 ${topic.title} 详细解读`}
    >
      {/* 个人档案匹配角标 */}
      {isMatchedProfile && (
        <span className="absolute -top-2 right-3 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
          档案相关
        </span>
      )}

      <div className="p-4 sm:p-5 flex flex-col gap-2.5">
        {/* 头部：图标 + 标题 + 风险胶囊 */}
        <div className="flex items-start gap-3">
          {/* 图标 */}
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:border-slate-300 transition-colors">
            <WikiTopicIcon icon={topic.icon} topicId={topic.id} size={18} />
          </div>

          <div className="flex-1 min-w-0">
            {/* 分类小标签 */}
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catCfg.badgeBg}`}>
                {topic.subcategory || catCfg.label}
              </span>
              {topic.visualComponent && (
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-sky-400 inline-block" />
                  图解
                </span>
              )}
            </div>
            {/* 标题 */}
            <h3 className="text-sm sm:text-[15px] font-black text-slate-900 tracking-tight leading-tight truncate pr-1">
              {topic.title}
            </h3>
          </div>

          {/* 风险等级胶囊（右上角） */}
          <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${riskCfg.bg} ${riskCfg.color} ${riskCfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
            <span className="hidden sm:inline">{riskCfg.label.split("·")[0].trim()}</span>
            <span className="sm:hidden">{topic.riskLevel === "high" ? "高危" : topic.riskLevel === "moderate" ? "中危" : topic.riskLevel === "low" ? "低危" : "基石"}</span>
          </span>
        </div>

        {/* 生活比喻（1 行，截断） */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-600 transition-colors pl-12">
          {topic.metaphor}
        </p>

        {/* 底部：关键指标 + 展开提示 */}
        <div className="flex items-center justify-between gap-2 pl-12 pt-0.5">
          {topic.keyMetric ? (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] text-slate-400 shrink-0">{topic.keyMetric.label}</span>
              <span className="text-[11px] font-bold text-blue-700 truncate">{topic.keyMetric.value.slice(0, 28)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">{topic.faq?.length ? `${topic.faq.length} 条高频问答` : ""}</span>
          )}
          <span className="flex-shrink-0 text-[10px] font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-0.5 transition-colors">
            深度解读
            <svg className="w-3 h-3 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}
