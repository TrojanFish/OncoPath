"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Pill, 
  FileText, 
  Activity, 
  Compass, 
  ArrowRight, 
  X, 
  Command, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { triggerHaptic } from "@/lib/haptics";

export interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: "target_drug" | "study" | "clinical_tool" | "tumor_marker";
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Listen for ⌘K or Ctrl+K and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) triggerHaptic("medium");
          return !prev;
        });
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      triggerHaptic("medium");
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Catalog items
  const items: PaletteItem[] = useMemo(() => [
    // 1. Clinical Tools
    {
      id: "tool_profile",
      title: "临床数字档案 (TNM分期与倍增动力学)",
      subtitle: "输入病理/CT参数，秒级计算 8th/9th AJCC 阶段与 Schwartz VDT",
      category: "clinical_tool",
      categoryLabel: "核心工具",
      icon: Activity,
      keywords: ["档案", "分期", "TNM", "倍增时间", "VDT", "磨玻璃", "CTR", "切缘"],
      action: () => router.push("/profile"),
    },
    {
      id: "tool_timeline",
      title: "三轨合一全景随访生命线 (Clinical Synopsis)",
      subtitle: "血清学-CT影像-靶向维持用药多轴联动全景看板",
      category: "clinical_tool",
      categoryLabel: "核心工具",
      icon: Activity,
      keywords: ["生命线", "时间轴", "随访", "全景", "三轨", "synopsis"],
      action: () => router.push("/timeline"),
    },
    {
      id: "tool_report",
      title: "名医就医沟通报告 (一键导出打印)",
      subtitle: "结构化汇总病理分期、证据链与用药禁忌，支持 ⌘P 打印",
      category: "clinical_tool",
      categoryLabel: "核心工具",
      icon: FileText,
      keywords: ["报告", "导出", "打印", "就医", "沟通单", "PDF"],
      action: () => router.push("/profile/report"),
    },
    {
      id: "tool_reimbursement",
      title: "特药医保自负测算与慈善赠药方案",
      subtitle: "2026年国谈双通道落地测算，含奥希替尼、塞普替尼与PAP赠药",
      category: "clinical_tool",
      categoryLabel: "核心工具",
      icon: Compass,
      keywords: ["医保", "特药", "自负", "报销", "国谈", "赠药", "价格"],
      action: () => router.push("/reimbursement"),
    },
    {
      id: "tool_knowledge",
      title: "4D 因果推演与治疗沙盘 (Knowledge Graph)",
      subtitle: "交互式探索肺腺癌驱动基因突变路径与耐药演进图谱",
      category: "clinical_tool",
      categoryLabel: "核心工具",
      icon: Sparkles,
      keywords: ["图谱", "沙盘", "推演", "因果", "知识库", "4D"],
      action: () => router.push("/knowledge"),
    },

    // 2. Targeted Drugs & DDI
    {
      id: "drug_osimertinib",
      title: "甲磺酸奥希替尼片 (泰瑞沙 / 3代EGFR-TKI)",
      subtitle: "主要经 CYP3A4 代谢，严禁合用西柚与利福平，PPI影响轻微",
      category: "target_drug",
      categoryLabel: "靶向药物",
      icon: Pill,
      keywords: ["奥希替尼", "泰瑞沙", "EGFR", "3代", "TKI", "osimertinib", "西柚", "利福平"],
      action: () => router.push("/wiki?tab=all#ddi-checker"),
    },
    {
      id: "drug_selpercatinib",
      title: "塞普替尼胶囊 (睿妥 / Retevmo / RET融合抑制剂)",
      subtitle: "高选择性 RET 抑制剂，pH依赖吸收，合用PPI需随餐或错峰法莫替丁",
      category: "target_drug",
      categoryLabel: "靶向药物",
      icon: Pill,
      keywords: ["塞普替尼", "睿妥", "Retevmo", "RET", "融合", "selpercatinib", "PPI"],
      action: () => router.push("/wiki?tab=all#ddi-checker"),
    },
    {
      id: "drug_glumetinib",
      title: "谷美替尼片 / 赛沃替尼 (沃瑞沙 / MET 14外显子跳突)",
      subtitle: "强效 MET 抑制剂，高度依赖胃酸酸性环境溶出，警惕强效抑酸药",
      category: "target_drug",
      categoryLabel: "靶向药物",
      icon: Pill,
      keywords: ["谷美替尼", "赛沃替尼", "沃瑞沙", "MET", "14跳突", "savolitinib", "glumetinib"],
      action: () => router.push("/wiki?tab=all#ddi-checker"),
    },
    {
      id: "drug_tdxd",
      title: "注射用德曲妥珠单抗 (优赫得 / Enhertu / T-DXd)",
      subtitle: "新一代 HER2-ADC 靶向抗体偶联药物，重度戒备间质性肺炎(ILD)",
      category: "target_drug",
      categoryLabel: "靶向药物",
      icon: Pill,
      keywords: ["德曲妥珠单抗", "优赫得", "Enhertu", "HER2", "ADC", "T-DXd", "ILD", "肺炎"],
      action: () => router.push("/wiki?tab=all#ddi-checker"),
    },
    {
      id: "drug_alectinib",
      title: "盐酸阿来替尼胶囊 (安圣莎 / 2代ALK-TKI)",
      subtitle: "ALK 阳性一线标准治疗，主要经 CYP3A4 代谢，随餐同服",
      category: "target_drug",
      categoryLabel: "靶向药物",
      icon: Pill,
      keywords: ["阿来替尼", "安圣莎", "ALK", "alectinib"],
      action: () => router.push("/wiki?tab=all#ddi-checker"),
    },

    // 3. Seminal Evidence Studies
    {
      id: "study_adaura",
      title: "ADAURA 研究 (NEJM / Lancet Oncol)",
      subtitle: "IB-IIIA期 EGFR 突变术后奥希替尼辅助治疗，降低死亡风险 51%",
      category: "study",
      categoryLabel: "前瞻顶刊",
      icon: FileText,
      keywords: ["ADAURA", "NEJM", "奥希替尼", "术后辅助", "DFS", "OS", "EGFR"],
      action: () => router.push("/studies"),
    },
    {
      id: "study_jcog0802",
      title: "JCOG0802 / WJOG4607L 研究 (Lancet)",
      subtitle: "<=2cm 早期外周型浸润肺腺癌，肺段切除 OS 显著优于肺叶切除",
      category: "study",
      categoryLabel: "前瞻顶刊",
      icon: FileText,
      keywords: ["JCOG0802", "肺段", "肺叶", "亚肺叶", "切缘", "Lancet", "手术"],
      action: () => router.push("/studies"),
    },
    {
      id: "study_jcog0804",
      title: "JCOG0804 / WJOG4507L 研究 (JCO)",
      subtitle: "<=2cm GGO 为主 (CTR<=0.25) 磨玻璃结节楔形切除 5年RFS 99.7%",
      category: "study",
      categoryLabel: "前瞻顶刊",
      icon: FileText,
      keywords: ["JCOG0804", "楔形切除", "磨玻璃", "GGO", "CTR", "安全切缘"],
      action: () => router.push("/studies"),
    },

    // 4. Tumor Markers
    {
      id: "marker_cea",
      title: "癌胚抗原 CEA (正常参考值 < 5.0 ng/mL)",
      subtitle: "早早期磨玻璃多不升高，术后动态基线对齐方具监测意义",
      category: "tumor_marker",
      categoryLabel: "肿瘤标志物",
      icon: Activity,
      keywords: ["CEA", "癌胚抗原", "标志物", "抽血", "生化", "5.0"],
      action: () => router.push("/timeline"),
    },
    {
      id: "marker_cyfra",
      title: "细胞角蛋白19片段 CYFRA21-1 (正常参考值 < 3.3 ng/mL)",
      subtitle: "肺腺癌与鳞癌重要监测指标，结合胸部薄层CT协同判读",
      category: "tumor_marker",
      categoryLabel: "肿瘤标志物",
      icon: Activity,
      keywords: ["CYFRA", "CYFRA21-1", "角蛋白", "鳞癌", "腺癌"],
      action: () => router.push("/timeline"),
    },
  ], [router]);

  // Filter items
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [items, query]);

  // Keyboard navigation within list
  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      triggerHaptic("medium");
      filtered[activeIndex].action();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-slate-900/40 backdrop-blur-md animate-fade-in print:hidden"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="全局医学快捷搜索"
    >
      <div 
        className="w-full max-w-2xl bg-white/95 rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleItemKeyDown}
      >
        {/* Spotlight Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="搜索靶向药 (奥希替尼/塞普替尼)、顶刊 (ADAURA/JCOG)、分期工具或标志物..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
            aria-label="输入搜索关键词"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200 select-none">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar"
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Command className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-slate-600">未找到与 &quot;{query}&quot; 相关的医学词条或工具</p>
              <p className="text-xs text-slate-400 mt-1">支持中文药名、英文通用名、突变基因 (EGFR/RET/MET/HER2) 或研究简称</p>
            </div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === activeIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    triggerHaptic("medium");
                    item.action();
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                    isSelected 
                      ? "bg-blue-50/90 text-blue-900 border border-blue-200/80 shadow-xs" 
                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{item.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                          isSelected ? "bg-blue-200/70 text-blue-800" : "bg-slate-100 text-slate-500"
                        }`}>
                          {item.categoryLabel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${
                    isSelected ? "text-blue-600 translate-x-1" : "text-slate-300"
                  }`} />
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">↓</kbd>
              <span>导航</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-200 shadow-2xs">↵</kbd>
              <span>打开</span>
            </span>
          </div>
          <span className="text-slate-400">OncoPath 全局医学指挥台</span>
        </div>
      </div>
    </div>
  );
}
