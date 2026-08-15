"use client";

import type { WikiCategory } from "@/lib/wikiData";

interface WikiScenarioEntryProps {
  activeCategory?: WikiCategory | "all";
  onSelectCategory: (category: WikiCategory) => void;
}

export function WikiScenarioEntry({ activeCategory = "all", onSelectCategory }: WikiScenarioEntryProps) {
  const scenarios = [
    {
      category: "nodule" as WikiCategory,
      icon: "🫁",
      title: "我刚体检查出肺结节",
      subtitle: "体检报告提示磨玻璃结节、实性结节或毛刺，我很慌，该怎么办？",
      badge: "结节消恐 · 随访时间表",
      gradient: "from-emerald-50 to-teal-50 hover:from-emerald-100/70 hover:to-teal-100/70 border-emerald-200/80 text-emerald-950",
      activeBorder: "border-emerald-600 ring-2 ring-emerald-500/80 shadow-md scale-[1.02] -translate-y-1 bg-gradient-to-br from-emerald-100/80 to-teal-100/80",
      iconBg: "bg-emerald-500 text-white",
      tagColor: "text-emerald-700 bg-emerald-100/60 border-emerald-300",
      activeTagColor: "text-white bg-emerald-700 border-emerald-700 font-bold",
    },
    {
      category: "pathology" as WikiCategory,
      icon: "🔬",
      title: "我刚拿到术后病理报告",
      subtitle: "报告上写着 STAS、VPI、LVI、微乳头、切缘等各种生僻词，不知吉凶？",
      badge: "病理密码破译 · 战术武器",
      gradient: "from-blue-50 to-indigo-50 hover:from-blue-100/70 hover:to-indigo-100/70 border-blue-200/80 text-blue-950",
      activeBorder: "border-blue-600 ring-2 ring-blue-500/80 shadow-md scale-[1.02] -translate-y-1 bg-gradient-to-br from-blue-100/80 to-indigo-100/80",
      iconBg: "bg-blue-600 text-white",
      tagColor: "text-blue-700 bg-blue-100/60 border-blue-300",
      activeTagColor: "text-white bg-blue-700 border-blue-700 font-bold",
    },
    {
      category: "genetics" as WikiCategory,
      icon: "🧬",
      title: "医生让我做基因检测/靶向",
      subtitle: "EGFR、ALK、KRAS 是什么意思？第三代靶向药（奥希替尼）怎么帮我？",
      badge: "驱动基因 · 83% 复发阻断",
      gradient: "from-purple-50 to-fuchsia-50 hover:from-purple-100/70 hover:to-fuchsia-100/70 border-purple-200/80 text-purple-950",
      activeBorder: "border-purple-600 ring-2 ring-purple-500/80 shadow-md scale-[1.02] -translate-y-1 bg-gradient-to-br from-purple-100/80 to-fuchsia-100/80",
      iconBg: "bg-purple-600 text-white",
      tagColor: "text-purple-700 bg-purple-100/60 border-purple-300",
      activeTagColor: "text-white bg-purple-700 border-purple-700 font-bold",
    },
    {
      category: "recovery" as WikiCategory,
      icon: "🌿",
      title: "术后身体恢复与长期随访",
      subtitle: "术后咳喘、胸闷正常吗？肿瘤标志物轻微波动是不是复发了？",
      badge: "康复调适 · 标志物真相",
      gradient: "from-amber-50 to-orange-50 hover:from-amber-100/70 hover:to-orange-100/70 border-amber-200/80 text-amber-950",
      activeBorder: "border-amber-600 ring-2 ring-amber-500/80 shadow-md scale-[1.02] -translate-y-1 bg-gradient-to-br from-amber-100/80 to-orange-100/80",
      iconBg: "bg-amber-500 text-white",
      tagColor: "text-amber-700 bg-amber-100/60 border-amber-300",
      activeTagColor: "text-white bg-amber-700 border-amber-700 font-bold",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700 px-1">
        <span className="flex items-center gap-1.5">
          <span>💬 请选择最符合您当前处境的情景，直达破译专区：</span>
        </span>
        {activeCategory !== "all" && (
          <span className="text-xs text-blue-600 font-semibold hidden sm:inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            已定位专区
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {scenarios.map((s) => {
          const isActive = activeCategory === s.category;
          return (
            <button
              key={s.category}
              onClick={() => onSelectCategory(s.category)}
              className={`text-left p-4 sm:p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col justify-between relative ${
                isActive ? s.activeBorder : `${s.gradient} shadow-xs hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              {/* Active Indicator Pin */}
              {isActive && (
                <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>当前激活专区</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/90 border border-slate-200/60 flex items-center justify-center text-xl shadow-2xs">
                    {s.icon}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                      isActive ? s.activeTagColor : s.tagColor
                    }`}
                  >
                    {s.badge}
                  </span>
                </div>
                <h4 className="font-black text-sm sm:text-base leading-snug tracking-tight mb-1.5">
                  {s.title}
                </h4>
                <p className="text-xs opacity-75 leading-relaxed line-clamp-2">
                  {s.subtitle}
                </p>
              </div>

              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold opacity-90 group">
                {isActive ? (
                  <span className="text-blue-900 font-black flex items-center gap-1">
                    <span>正在浏览该专区</span>
                    <span className="text-xs">●</span>
                  </span>
                ) : (
                  <>
                    <span>立即查看该专区</span>
                    <span className="text-sm transition-transform group-hover:translate-x-0.5">➔</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
