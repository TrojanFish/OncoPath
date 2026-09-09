"use client";

import React, { useMemo } from "react";
import { CircleDot, Microscope, Dna, HeartPulse, LayoutGrid } from "lucide-react";
import { WIKI_TOPICS, WIKI_CATEGORIES, type WikiCategory } from "@/lib/wikiData";

interface WikiScenarioTabsProps {
  activeCategory: WikiCategory | "all";
  onSelectCategory: (category: WikiCategory | "all") => void;
}

// 每个分类下高危词条数
function countHighRisk(category: WikiCategory | "all") {
  const list = category === "all" ? WIKI_TOPICS : WIKI_TOPICS.filter((t) => t.category === category);
  return list.filter((t) => t.riskLevel === "high").length;
}

// 情景卡配置表
const SCENARIO_TABS = [
  {
    category: "all" as WikiCategory | "all",
    icon: LayoutGrid,
    headline: "肺癌循证指标全景大盘",
    subline: "覆盖从结节发现到术后全病程",
    badge: "全部词条",
    keywords: "随访 · 病理 · 基因 · 康复",
    theme: {
      active:   "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20",
      inactive: "bg-white border-slate-200 text-slate-800 hover:border-slate-400 hover:shadow-md",
      iconBg:   "bg-slate-100 text-slate-700",
      iconBgActive: "bg-white/15 text-white",
      countColor:   "text-slate-400",
      countColorActive: "text-white/70",
      badgeInactive: "bg-slate-100 text-slate-600 border-slate-200",
      badgeActive:   "bg-white/15 text-white border-white/20",
      dot: "bg-slate-500",
    },
  },
  {
    category: "nodule" as WikiCategory,
    icon: CircleDot,
    headline: "刚体检查出肺结节",
    subline: "磨玻璃/实性/毛刺，不知良恶？",
    badge: "结节消恐 · 随访路线",
    keywords: "GGO · 实性 · 毛刺 · Fleischner",
    theme: {
      active:   "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/25",
      inactive: "bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:shadow-md",
      iconBg:   "bg-emerald-50 text-emerald-600",
      iconBgActive: "bg-white/15 text-white",
      countColor:   "text-emerald-600",
      countColorActive: "text-white/70",
      badgeInactive: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeActive:   "bg-white/15 text-white border-white/20",
      dot: "bg-emerald-500",
    },
  },
  {
    category: "pathology" as WikiCategory,
    icon: Microscope,
    headline: "刚拿到术后病理报告",
    subline: "STAS / VPI / 微乳头不知吉凶？",
    badge: "病理密码破译",
    keywords: "STAS · VPI · LVI · 切缘",
    theme: {
      active:   "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25",
      inactive: "bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:shadow-md",
      iconBg:   "bg-blue-50 text-blue-600",
      iconBgActive: "bg-white/15 text-white",
      countColor:   "text-blue-600",
      countColorActive: "text-white/70",
      badgeInactive: "bg-blue-50 text-blue-700 border-blue-200",
      badgeActive:   "bg-white/15 text-white border-white/20",
      dot: "bg-blue-500",
    },
  },
  {
    category: "genetics" as WikiCategory,
    icon: Dna,
    headline: "医生让我做基因/靶向治疗",
    subline: "EGFR、ALK、奥希替尼怎么帮我？",
    badge: "驱动基因 · 精准靶向",
    keywords: "EGFR · ALK · 奥希替尼 · ADC",
    theme: {
      active:   "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/25",
      inactive: "bg-white border-slate-200 text-slate-800 hover:border-purple-400 hover:shadow-md",
      iconBg:   "bg-purple-50 text-purple-600",
      iconBgActive: "bg-white/15 text-white",
      countColor:   "text-purple-600",
      countColorActive: "text-white/70",
      badgeInactive: "bg-purple-50 text-purple-700 border-purple-200",
      badgeActive:   "bg-white/15 text-white border-white/20",
      dot: "bg-purple-500",
    },
  },
  {
    category: "recovery" as WikiCategory,
    icon: HeartPulse,
    headline: "术后身体恢复与长期随访",
    subline: "咳喘、标志物波动是复发了吗？",
    badge: "康复调适 · 症状分诊",
    keywords: "咳喘 · 标志物 · 复查 · 胸闷",
    theme: {
      active:   "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/25",
      inactive: "bg-white border-slate-200 text-slate-800 hover:border-amber-400 hover:shadow-md",
      iconBg:   "bg-amber-50 text-amber-600",
      iconBgActive: "bg-white/15 text-white",
      countColor:   "text-amber-600",
      countColorActive: "text-white/70",
      badgeInactive: "bg-amber-50 text-amber-700 border-amber-200",
      badgeActive:   "bg-white/15 text-white border-white/20",
      dot: "bg-amber-500",
    },
  },
];

export function WikiScenarioTabs({ activeCategory, onSelectCategory }: WikiScenarioTabsProps) {
  // 各分类词条统计（静态数据，memo 避免重复计算）
  const counts = useMemo(() => {
    const result: Record<string, { total: number; high: number }> = {};
    for (const tab of SCENARIO_TABS) {
      const cat = tab.category;
      const list = cat === "all" ? WIKI_TOPICS : WIKI_TOPICS.filter((t) => t.category === cat);
      result[cat] = { total: list.length, high: list.filter((t) => t.riskLevel === "high").length };
    }
    return result;
  }, []);

  return (
    <div className="w-full">
      {/* PC 端 / 平板：5 列等宽网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {SCENARIO_TABS.map((tab) => {
          const isActive  = activeCategory === tab.category;
          const IconComp  = tab.icon;
          const stat      = counts[tab.category];
          const t         = tab.theme;

          return (
            <button
              key={tab.category}
              type="button"
              onClick={() => onSelectCategory(tab.category)}
              aria-pressed={isActive}
              className={`
                group relative text-left rounded-2xl sm:rounded-3xl border
                px-3.5 py-3 sm:px-4 sm:py-4
                transition-all duration-200 cursor-pointer
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
                active:scale-[0.97]
                ${isActive ? t.active : `${t.inactive}`}
              `}
            >
              {/* 选中态：左上角呼吸激活圆点 */}
              {isActive && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/60 animate-pulse" />
              )}

              {/* 图标 */}
              <div className={`
                w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2.5 sm:mb-3 flex-shrink-0
                transition-colors duration-200
                ${isActive ? t.iconBgActive : t.iconBg}
              `}>
                <IconComp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>

              {/* 标题 */}
              <div className={`text-xs sm:text-sm font-black leading-snug tracking-tight mb-1 ${isActive ? "text-white" : "text-slate-900"}`}>
                {tab.headline}
              </div>

              {/* 副标题 */}
              <div className={`text-[10px] sm:text-xs leading-snug mb-2.5 line-clamp-2 ${isActive ? "text-white/80" : "text-slate-500"}`}>
                {tab.subline}
              </div>

              {/* 底部：Badge + 词条计数 */}
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isActive ? t.badgeActive : t.badgeInactive}`}>
                  {tab.badge}
                </span>
                <span className={`text-[10px] font-mono font-bold tabular-nums flex-shrink-0 ${isActive ? t.countColorActive : t.countColor}`}>
                  {stat.total} 词条
                  {stat.high > 0 && (
                    <span className={`ml-1 ${isActive ? "text-white/60" : "text-rose-500"}`}>
                      · {stat.high} 高危
                    </span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
