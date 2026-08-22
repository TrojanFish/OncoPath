"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  BookOpen, 
  Building2, 
  Newspaper, 
  Database, 
  Wrench, 
  AlertTriangle, 
  Lightbulb, 
  Search, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import SubpageNavbar from "@/components/SubpageNavbar";

interface ResourceLink {
  name: string;
  url: string;
  description: string;
  tip?: string;
  lang: "zh" | "en" | "both";
  free: boolean;
}

interface ResourceCategory {
  id: string;
  icon: any;
  level: "beginner" | "intermediate" | "advanced";
  levelLabel: string;
  levelColor: string;
  title: string;
  subtitle: string;
  warning?: string;
  links: ResourceLink[];
}

const CATEGORIES: ResourceCategory[] = [
  {
    id: "guidelines",
    icon: Building2,
    level: "beginner",
    levelLabel: "最推荐 · 患者友好",
    levelColor: "text-teal-600 border-teal-200 bg-teal-50",
    title: "权威临床指南",
    subtitle: "由国际顶尖学术机构出版，结论最为权威，部分提供中文版本，适合患者直接参考。",
    links: [
      {
        name: "NCCN 患者指南（中文版）",
        url: "https://www.nccn.org/patients/guidelines/content/PDF/lung-nsclc-patient.pdf",
        description: "美国国家综合癌症网络（NCCN）发布的非小细胞肺癌患者指南，是全球最权威的肿瘤临床实践指南之一，提供简明的中文翻译版，涵盖分期、手术、随访等核心内容。",
        tip: "建议重点阅读「手术后随访」章节，与你的医生共同制定复查计划。",
        lang: "both",
        free: true,
      },
      {
        name: "ASCO Cancer.Net",
        url: "https://www.cancer.net/cancer-types/lung-cancer-non-small-cell",
        description: "美国临床肿瘤学会（ASCO）专门为患者和家属设计的权威科普平台。内容经肿瘤专家审核，语言通俗易懂，涵盖分期、治疗方案与生活质量建议。",
        tip: "本站支持中文翻译，可在浏览器中开启自动翻译。",
        lang: "en",
        free: true,
      },
      {
        name: "IASLC（国际肺癌研究协会）",
        url: "https://www.iaslc.org/",
        description: "全球最大的专注于肺癌的学术组织，负责制定 TNM 分期系统（OncoPath 使用第九版）。提供最新的分期教育材料和患者手册。",
        tip: "OncoPath 中的「T分期」「N分期」「M分期」定义均来源于此机构。",
        lang: "en",
        free: true,
      },
      {
        name: "中国临床肿瘤学会（CSCO）指南",
        url: "https://www.csco.org.cn/",
        description: "中国本土权威临床肿瘤指南，制定的《非小细胞肺癌诊疗指南》是国内医院的标准参考文件，内容完全基于中国患者数据，更贴合国内实际。",
        lang: "zh",
        free: true,
      },
    ],
  },
  {
    id: "journals",
    icon: Newspaper,
    level: "intermediate",
    levelLabel: "进阶 · 高质量文献",
    levelColor: "text-blue-600 border-blue-200 bg-blue-50",
    title: "顶级学术期刊",
    subtitle: "发表全球最顶尖的肺癌临床研究成果。OncoPath 的核心证据库中的研究均来自这些期刊。",
    warning: "注意：期刊论文面向医生撰写，数据专业且需要医学背景才能正确解读。请勿将单篇研究的结论直接套用于自身情况。",
    links: [
      {
        name: "Journal of Thoracic Oncology (JTO)",
        url: "https://www.jto.org/",
        description: "全球最顶级的胸部肿瘤学专业期刊，IASLC 官方出版物。JCOG0802、JCOG0804 等奠定肺癌手术方式的里程碑研究均发表于此。",
        tip: "OncoPath 中引用的多数关键研究（如肺叶切除 vs. 肺段切除）均来自 JTO。",
        lang: "en",
        free: false,
      },
      {
        name: "The Lancet Oncology",
        url: "https://www.thelancet.com/journals/lanonc/home",
        description: "《柳叶刀·肿瘤学》，全球综合影响力最高的肿瘤学期刊之一，发表改变临床实践的大型随机对照试验（RCT）。",
        lang: "en",
        free: false,
      },
      {
        name: "Journal of Clinical Oncology (JCO)",
        url: "https://ascopubs.org/journal/jco",
        description: "美国临床肿瘤学会（ASCO）官方期刊，是发表临床研究最多的顶级期刊。覆盖肺癌靶向治疗、免疫治疗、预后分析等各领域。",
        lang: "en",
        free: false,
      },
      {
        name: "Chest (胸科学)",
        url: "https://journal.chestnet.org/",
        description: "美国胸科医师学会（ACCP）官方期刊，在早期肺癌手术方式、CT 筛查和影像学研究方面具有重要地位。",
        lang: "en",
        free: false,
      },
    ],
  },
  {
    id: "databases",
    icon: Database,
    level: "advanced",
    levelLabel: "硬核 · 原始数据库",
    levelColor: "text-amber-600 border-amber-200 bg-amber-50",
    title: "学术文献原始数据库",
    subtitle: "全球最大的医学文献检索平台，包含数千万篇论文。适合医学专业背景人士或在家属陪同下深入查阅。",
    warning: "重要提示：数据库中包含大量不同质量的研究，其中部分研究样本量小、结论存在争议，甚至已被更新研究推翻。在没有医学背景的情况下，请务必在专业医生的指导下解读检索结果。",
    links: [
      {
        name: "PubMed / MEDLINE",
        url: "https://pubmed.ncbi.nlm.nih.gov/",
        description: "美国国立医学图书馆（NLM）维护的全球最大、最权威的生物医学文献数据库，收录超过 3500 万篇论文。所有论文均可免费查看摘要，大量论文提供全文免费访问。",
        tip: "推荐搜索词：「lung adenocarcinoma recurrence」「STAS lung cancer prognosis」「GGO lung nodule follow-up」",
        lang: "en",
        free: true,
      },
      {
        name: "Europe PMC",
        url: "https://europepmc.org/",
        description: "欧洲生物医学文献数据库，与 PubMed 数据同源但开放程度更高，提供全文检索，且通过 API 可机器读取（OncoPath 的外部抓取功能即对接此库）。",
        tip: "搜索相同关键词，但 Europe PMC 更容易获取全文内容。",
        lang: "en",
        free: true,
      },
      {
        name: "ClinicalTrials.gov",
        url: "https://clinicaltrials.gov/",
        description: "美国 NIH 维护的全球临床试验注册与结果数据库。如果你想了解某一新型治疗方案是否有进行中的试验，或者寻找入组机会，可在此查询。",
        lang: "en",
        free: true,
      },
      {
        name: "中国知网 CNKI（医学版）",
        url: "https://www.cnki.net/",
        description: "中国最大的学术文献数据库，收录大量国内医院发表的临床研究。对于想了解中国患者数据的用户特别有价值。",
        tip: "搜索词建议：「肺腺癌 复发 影响因素」「磨玻璃结节 预后」",
        lang: "zh",
        free: false,
      },
    ],
  },
  {
    id: "tools",
    icon: Wrench,
    level: "beginner",
    levelLabel: "实用工具",
    levelColor: "text-green-600 border-green-200 bg-green-50",
    title: "患者实用辅助工具",
    subtitle: "帮助患者理解医学概念、管理病情记录、或与医疗团队更有效沟通的实用在线工具。",
    links: [
      {
        name: "WHO 癌症信息页面（中文）",
        url: "https://www.who.int/zh/news-room/fact-sheets/detail/cancer",
        description: "世界卫生组织（WHO）提供的通俗易懂的癌症基础知识。帮助患者从最权威的国际机构角度理解癌症定义、分期和全球治疗现状。",
        lang: "zh",
        free: true,
      },
      {
        name: "中国医学科学院肿瘤医院",
        url: "https://www.cicams.ac.cn/",
        description: "中国权威肿瘤专科医院官网，提供最新的临床诊疗资讯、专家科普文章和就医信息，对于理解国内治疗规范有重要参考价值。",
        lang: "zh",
        free: true,
      },
      {
        name: "丁香园（肿瘤频道）",
        url: "https://oncol.dxy.cn/",
        description: "国内最大的医疗专业人员学习社区，肿瘤频道收录大量前沿指南解读、最新研究汉化资讯。对于想从医生视角了解肺癌最新研究进展的患者家属有重要参考价值。",
        lang: "zh",
        free: true,
      },
    ],
  },
];

const LEVEL_ORDER = ["beginner", "intermediate", "advanced"];

export default function ResourcesPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());

  const filtered = activeFilter === "all"
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.level === activeFilter || c.id === activeFilter);

  const toggleTip = (key: string) => {
    setExpandedTips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-blue-500 selection:text-white">
      <SubpageNavbar />

      {/* Hero Header */}
      <header className="pt-28 md:pt-32 pb-8 px-2.5 sm:px-6 max-w-4xl mx-auto text-center space-y-4">
        {/* Unified Top Pill Badge */}
        <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200/80 shadow-xs">
          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
          <span>全球权威临床指南库</span>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          <span>专业医学循证导航</span>
        </div>

        {/* Unified H1 */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          权威临床指南 · <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600">专业医学循证导航</span>
        </h1>

        {/* Unified Subtitle */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          系统甄选 <strong>CSCO、NCCN、ASCO、IASLC</strong> 等全球权威学术组织官方指南与专业数据库。为您提供直达源头的<strong>防坑查阅指南与患者友好通道</strong>。
        </p>

        {/* Big Disclaimer */}
        <div className="mt-4 p-3.5 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50 text-left shadow-xs">
          <p className="text-amber-900 font-bold text-xs mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>在您开始查阅之前，请阅读这段话</span>
          </p>
          <p className="text-slate-700 text-xs leading-relaxed">
            医学论文与指南是写给专业医生的，其中充满了统计学术语和置信区间。<strong className="text-slate-900">同一数字对不同患者的临床意义可能天壤之别。</strong>
            我们在每个资源旁标注了「适合谁阅读」和「注意事项」，请务必先阅读提示，再深入查阅。如有任何疑问，请以您的主治医生的综合意见为准。
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="text-slate-500 text-xs sm:text-sm">筛选：</span>
          {[
            { key: "all", label: "全部", color: "text-gray-900 border-gray-200 bg-white shadow-sm" },
            { key: "beginner", label: "患者友好", color: "text-teal-700 border-teal-200 bg-white shadow-sm" },
            { key: "intermediate", label: "核心期刊", color: "text-blue-700 border-blue-200 bg-white shadow-sm" },
            { key: "advanced", label: "专业数据库", color: "text-amber-800 border-amber-200 bg-white shadow-sm" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm border transition-all cursor-pointer ${f.color} ${
                activeFilter === f.key ? "bg-gray-100 ring-2 ring-gray-200 font-bold" : "hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 space-y-12 sm:space-y-16">
        {filtered.map((category) => {
          const IconComponent = category.icon;
          return (
            <section key={category.id}>
              {/* Category Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  <IconComponent className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-slate-900">{category.title}</h2>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${category.levelColor}`}>
                      {category.levelLabel}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">
                    {category.subtitle}
                  </p>
                  {category.warning && (
                    <div className="mt-2 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/60 px-3 py-1.5 rounded-xl leading-relaxed max-w-2xl flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{category.warning}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resource Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {category.links.map((link, i) => {
                  const tipKey = `${category.id}-${i}`;
                  const hasTip = !!link.tip;
                  const tipOpen = expandedTips.has(tipKey);
                  return (
                    <div
                      key={i}
                      className="group relative rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 overflow-hidden"
                    >
                      {/* Top accent bar */}
                      <div className={`h-0.5 w-full ${
                        category.level === "beginner" ? "bg-gradient-to-r from-accent-teal/60 to-transparent" :
                        category.level === "intermediate" ? "bg-gradient-to-r from-accent-blue/60 to-transparent" :
                        "bg-gradient-to-r from-accent-amber/60 to-transparent"
                      }`} />

                      <div className="p-3.5 sm:p-5">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-slate-900 hover:text-blue-600 transition-colors text-sm leading-snug group-hover:underline inline-flex items-center gap-1"
                            >
                              <span>{link.name}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                            </a>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {link.lang === "zh" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-slate-500">中文</span>
                            )}
                            {link.lang === "both" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">中/英</span>
                            )}
                            {link.free && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">免费</span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-xs leading-relaxed mb-3">
                          {link.description}
                        </p>

                        {/* Tip accordion */}
                        {hasTip && (
                          <div>
                            <button
                              onClick={() => toggleTip(tipKey)}
                              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer font-medium"
                            >
                              <span>{tipOpen ? "收起阅读建议" : "查看阅读建议"}</span>
                              {tipOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            {tipOpen && (
                              <div className="mt-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-slate-700 leading-relaxed animate-fade-in flex items-start gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                <span>{link.tip}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Visit link CTA */}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3.5 inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-all bg-white font-medium shadow-2xs group-hover:border-blue-200"
                        >
                          <span>前往访问官方主页</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* How to search tutorial */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">如何在 PubMed 高效查找肺癌研究？</h2>
              <p className="text-slate-600 text-sm">三步学会像医生一样检索权威文献，避开低质量信息的陷阱。</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "使用标准医学术语",
                content: "不要使用中文或口语词汇，使用标准英文术语效果最佳。",
                example: ["lung adenocarcinoma recurrence", "STAS prognosis lung cancer", "ground glass nodule follow-up"],
              },
              {
                step: "02",
                title: "关注研究的关键指标",
                content: "打开一篇论文后，首先看这三个核心信息，帮助你快速判断可信度。",
                example: ["样本量 (n=) —— 越大越可靠", "发表年份 —— 优先5年内", "研究类型 —— 优先系统综述/RCT"],
              },
              {
                step: "03",
                title: "不要孤立解读数字",
                content: "把你找到的文献截图或链接带给你的医生，一起讨论，而不是自己对比数据。",
                example: ["「我看到这篇研究说复发率是X%」", "「这与我的情况类似吗？」", "「我需要额外注意什么？」"],
              },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-3.5 sm:p-5">
                <div className="text-blue-600 font-bold text-3xl opacity-30 mb-3">{item.step}</div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">{item.title}</h3>
                <p className="text-slate-500 text-xs mb-3 leading-relaxed">{item.content}</p>
                <ul className="space-y-1">
                  {item.example.map((e, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <span className="text-teal-600 mt-0.5">›</span>
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer disclaimer */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 mt-16 pt-8 pb-8 border-t border-gray-200">
        <p className="text-slate-500 text-xs text-center leading-relaxed max-w-2xl mx-auto flex items-center justify-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>上述所有外部链接均指向独立的第三方学术机构网站，OncoPath 不对这些网站的内容或准确性负责。所有医学决策请以主治医生的意见为最终依据。</span>
        </p>
      </div>
    </div>
  );
}
