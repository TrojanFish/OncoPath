"use client";

import type { WikiCategory } from "@/lib/wikiData";

interface WikiScenarioEntryProps {
  onSelectCategory: (category: WikiCategory) => void;
}

export function WikiScenarioEntry({ onSelectCategory }: WikiScenarioEntryProps) {
  const scenarios = [
    {
      category: "nodule" as WikiCategory,
      title: "🫁 我刚体检查出肺结节",
      subtitle: "体检报告提示磨玻璃结节、实性结节或毛刺，我很慌，该怎么办？",
      badge: "结节消恐 · 随访时间表",
      gradient: "from-emerald-50 to-teal-50 hover:from-emerald-100/70 hover:to-teal-100/70 border-emerald-200/80 text-emerald-950",
      iconBg: "bg-emerald-500 text-white",
      tagColor: "text-emerald-700 bg-emerald-100/60 border-emerald-300",
    },
    {
      category: "pathology" as WikiCategory,
      title: "🔬 我刚拿到术后病理报告",
      subtitle: "报告上写着 STAS、VPI、LVI、微乳头、切缘等各种生僻词，不知吉凶？",
      badge: "病理密码破译 · 战术武器",
      gradient: "from-blue-50 to-indigo-50 hover:from-blue-100/70 hover:to-indigo-100/70 border-blue-200/80 text-blue-950",
      iconBg: "bg-blue-600 text-white",
      tagColor: "text-blue-700 bg-blue-100/60 border-blue-300",
    },
    {
      category: "genetics" as WikiCategory,
      title: "🧬 医生让我做基因检测 / 靶向治疗",
      subtitle: "EGFR、ALK、KRAS 是什么意思？第三代靶向药（奥希替尼）怎么帮我？",
      badge: "驱动基因 · 83% 复发阻断",
      gradient: "from-purple-50 to-fuchsia-50 hover:from-purple-100/70 hover:to-fuchsia-100/70 border-purple-200/80 text-purple-950",
      iconBg: "bg-purple-600 text-white",
      tagColor: "text-purple-700 bg-purple-100/60 border-purple-300",
    },
    {
      category: "recovery" as WikiCategory,
      title: "🌿 术后身体恢复与长期随访",
      subtitle: "术后咳喘、胸闷正常吗？肿瘤标志物轻微波动是不是复发了？",
      badge: "康复调适 · 标志物真相",
      gradient: "from-amber-50 to-orange-50 hover:from-amber-100/70 hover:to-orange-100/70 border-amber-200/80 text-amber-950",
      iconBg: "bg-amber-500 text-white",
      tagColor: "text-amber-700 bg-amber-100/60 border-amber-300",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 px-1">
        <span>💬 请选择最符合您当前处境的情景，直达破译专区：</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {scenarios.map((s) => (
          <button
            key={s.category}
            onClick={() => onSelectCategory(s.category)}
            className={`text-left p-4 sm:p-5 rounded-3xl bg-gradient-to-br border transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between ${s.gradient}`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${s.tagColor}`}>
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
              <span>立即查看该专区</span>
              <span className="text-sm">➔</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
