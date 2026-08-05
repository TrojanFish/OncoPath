"use client";

import Link from "next/link";
import { useState } from "react";
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
  icon: string;
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
    icon: "🏥",
    level: "beginner",
    levelLabel: "最推荐 · 患者友好",
    levelColor: "text-accent-teal border-accent-teal/30 bg-accent-teal/10",
    title: "权威临床指南",
    subtitle: "由国际顶尖学术机构出版，结论最为权威，部分提供中文版本，适合患者直接参考。",
    links: [
      {
        name: "NCCN 患者指南（中文版）",
        url: "https://www.nccn.org/patients/guidelines/content/PDF/lung-nsclc-patient.pdf",
        description: "美国国家综合癌症网络（NCCN）发布的非小细胞肺癌患者指南，是全球最权威的肿瘤临床实践指南之一，提供简明的中文翻译版，涵盖分期、手术、随访等核心内容。",
        tip: "💡 建议重点阅读「手术后随访」章节，与你的医生共同制定复查计划。",
        lang: "both",
        free: true,
      },
      {
        name: "ASCO Cancer.Net",
        url: "https://www.cancer.net/cancer-types/lung-cancer-non-small-cell",
        description: "美国临床肿瘤学会（ASCO）专门为患者和家属设计的权威科普平台。内容经肿瘤专家审核，语言通俗易懂，涵盖分期、治疗方案与生活质量建议。",
        tip: "💡 本站支持中文翻译，可在浏览器中开启自动翻译。",
        lang: "en",
        free: true,
      },
      {
        name: "IASLC（国际肺癌研究协会）",
        url: "https://www.iaslc.org/research-education/library",
        description: "全球最大的专注于肺癌的学术组织，负责制定 TNM 分期系统（OncoPath 使用第九版）。提供最新的分期教育材料和患者手册。",
        tip: "💡 OncoPath 中的「T分期」「N分期」「M分期」定义均来源于此机构。",
        lang: "en",
        free: true,
      },
      {
        name: "中国临床肿瘤学会（CSCO）指南",
        url: "https://www.csco.ac.cn/",
        description: "中国本土权威临床肿瘤指南，制定的《非小细胞肺癌诊疗指南》是国内医院的标准参考文件，内容完全基于中国患者数据，更贴合国内实际。",
        lang: "zh",
        free: true,
      },
    ],
  },
  {
    id: "journals",
    icon: "📰",
    level: "intermediate",
    levelLabel: "进阶 · 高质量文献",
    levelColor: "text-accent-blue border-accent-blue/30 bg-accent-blue/10",
    title: "顶级学术期刊",
    subtitle: "发表全球最顶尖的肺癌临床研究成果。OncoPath 的核心证据库中的研究均来自这些期刊。",
    warning: "⚠️ 注意：期刊论文面向医生撰写，数据专业且需要医学背景才能正确解读。请勿将单篇研究的结论直接套用于自身情况。",
    links: [
      {
        name: "Journal of Thoracic Oncology (JTO)",
        url: "https://www.jto.org/",
        description: "全球最顶级的胸部肿瘤学专业期刊，IASLC 官方出版物。JCOG0802、JCOG0804 等奠定肺癌手术方式的里程碑研究均发表于此。",
        tip: "💡 OncoPath 中引用的多数关键研究（如肺叶切除 vs. 肺段切除）均来自 JTO。",
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
    icon: "🔬",
    level: "advanced",
    levelLabel: "硬核 · 原始数据库",
    levelColor: "text-accent-amber border-accent-amber/30 bg-accent-amber/10",
    title: "学术文献原始数据库",
    subtitle: "全球最大的医学文献检索平台，包含数千万篇论文。适合医学专业背景人士或在家属陪同下深入查阅。",
    warning: "⚠️ 重要提示：数据库中包含大量不同质量的研究，其中部分研究样本量小、结论存在争议，甚至已被更新研究推翻。在没有医学背景的情况下，请务必在专业医生的指导下解读检索结果。",
    links: [
      {
        name: "PubMed / MEDLINE",
        url: "https://pubmed.ncbi.nlm.nih.gov/",
        description: "美国国立医学图书馆（NLM）维护的全球最大、最权威的生物医学文献数据库，收录超过 3500 万篇论文。所有论文均可免费查看摘要，大量论文提供全文免费访问。",
        tip: "💡 推荐搜索词：「lung adenocarcinoma recurrence」「STAS lung cancer prognosis」「GGO lung nodule follow-up」",
        lang: "en",
        free: true,
      },
      {
        name: "Europe PMC",
        url: "https://europepmc.org/",
        description: "欧洲生物医学文献数据库，与 PubMed 数据同源但开放程度更高，提供全文检索，且通过 API 可机器读取（OncoPath 的外部抓取功能即对接此库）。",
        tip: "💡 搜索相同关键词，但 Europe PMC 更容易获取全文内容。",
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
        tip: "💡 搜索词建议：「肺腺癌 复发 影响因素」「磨玻璃结节 预后」",
        lang: "zh",
        free: false,
      },
    ],
  },
  {
    id: "tools",
    icon: "🧰",
    level: "beginner",
    levelLabel: "实用工具",
    levelColor: "text-accent-green border-accent-green/30 bg-accent-green/10",
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
        name: "医脉通（肿瘤频道）",
        url: "https://oncology.medlive.cn/",
        description: "国内面向临床医生的医学资讯平台，肿瘤频道收录大量指南解读、最新研究汉化解读。对于想了解医生视角解读最新研究的患者家属有参考价值。",
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
    <div className="min-h-screen pb-24">
      <SubpageNavbar />

      {/* Hero Header */}
      <header className="pt-16 pb-10 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-accent-teal mb-6 border border-accent-teal/20 bg-accent-teal/5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
          循证导航库 · Beta
        </div>
        <h1 className="display-md mb-4">学术资源导航</h1>
        <p className="text-text-secondary text-lg">
          OncoPath 的数据来源于这些国际权威机构。我们整理了一份「防坑指南」，
          帮助你在正确的地方查到真正可靠的循证医学信息。
        </p>

        {/* Big Disclaimer */}
        <div className="mt-8 p-4 rounded-2xl border border-accent-amber/20 bg-accent-amber/5 text-left">
          <p className="text-accent-amber font-semibold text-sm mb-1">📌 在你开始查阅之前，请阅读这段话</p>
          <p className="text-text-secondary text-sm leading-relaxed">
            医学论文是写给专业医生的，其中充满了统计学术语和置信区间。<strong className="text-text-primary">同一数字对不同患者的意义可能天壤之别。</strong>
            我们在每个资源旁标注了「适合谁阅读」和「注意事项」，请务必先阅读提示，再深入查阅。如有任何疑问，请以你的主治医生的意见为准。
          </p>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-text-muted text-sm">筛选：</span>
          {[
            { key: "all", label: "全部", color: "text-text-primary border-white/10" },
            { key: "beginner", label: "🏥 患者友好", color: "text-accent-teal border-accent-teal/20" },
            { key: "intermediate", label: "📰 核心期刊", color: "text-accent-blue border-accent-blue/20" },
            { key: "advanced", label: "🔬 专业数据库", color: "text-accent-amber border-accent-amber/20" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${f.color} ${
                activeFilter === f.key ? "bg-white/10" : "bg-transparent hover:bg-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <main className="max-w-7xl mx-auto px-6 space-y-16">
        {filtered.map((category) => (
          <section key={category.id}>
            {/* Category Header */}
            <div className="flex items-start gap-4 mb-6">
              <span className="text-4xl mt-1">{category.icon}</span>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-text-primary">{category.title}</h2>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${category.levelColor}`}>
                    {category.levelLabel}
                  </span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
                  {category.subtitle}
                </p>
                {category.warning && (
                  <p className="mt-2 text-xs text-accent-amber leading-relaxed max-w-2xl">
                    {category.warning}
                  </p>
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
                    className="group relative rounded-2xl border border-white/8 bg-[#0f1528]/60 hover:border-white/15 hover:bg-[#141b35]/80 transition-all duration-300 overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div className={`h-0.5 w-full ${
                      category.level === "beginner" ? "bg-gradient-to-r from-accent-teal/60 to-transparent" :
                      category.level === "intermediate" ? "bg-gradient-to-r from-accent-blue/60 to-transparent" :
                      "bg-gradient-to-r from-accent-amber/60 to-transparent"
                    }`} />

                    <div className="p-5">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-text-primary hover:text-accent-blue transition-colors text-sm leading-snug group-hover:underline"
                          >
                            {link.name}
                            <svg className="inline-block ml-1 opacity-50 group-hover:opacity-100 transition-opacity" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </a>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            link.lang === "zh" ? "text-accent-teal border-accent-teal/20 bg-accent-teal/5" :
                            link.lang === "both" ? "text-accent-blue border-accent-blue/20 bg-accent-blue/5" :
                            "text-text-muted border-white/10"
                          }`}>
                            {link.lang === "zh" ? "中文" : link.lang === "both" ? "中/英" : "英文"}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            link.free ? "text-accent-green border-accent-green/20 bg-accent-green/5" : "text-text-muted border-white/10"
                          }`}>
                            {link.free ? "免费" : "部分收费"}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-text-secondary text-xs leading-relaxed mb-3">
                        {link.description}
                      </p>

                      {/* Tip toggle */}
                      {hasTip && (
                        <div>
                          <button
                            onClick={() => toggleTip(tipKey)}
                            className="text-accent-teal text-xs flex items-center gap-1 hover:text-accent-teal/80 transition-colors"
                          >
                            <svg className={`transition-transform ${tipOpen ? "rotate-90" : ""}`} width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {tipOpen ? "收起提示" : "查看使用提示"}
                          </button>
                          {tipOpen && (
                            <div className="mt-2 p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/15 text-xs text-text-secondary leading-relaxed">
                              {link.tip}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visit button */}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        前往访问
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* How to search tutorial */}
        <section>
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl mt-1">📖</span>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-1">如何在 PubMed 高效查找肺癌研究？</h2>
              <p className="text-text-secondary text-sm">三步学会像医生一样检索权威文献，避开低质量信息的陷阱。</p>
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
              <div key={item.step} className="rounded-2xl border border-white/8 bg-[#0f1528]/60 p-5">
                <div className="text-accent-blue font-bold text-3xl opacity-30 mb-3">{item.step}</div>
                <h3 className="font-semibold text-text-primary mb-2 text-sm">{item.title}</h3>
                <p className="text-text-muted text-xs mb-3 leading-relaxed">{item.content}</p>
                <ul className="space-y-1">
                  {item.example.map((e, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                      <span className="text-accent-teal mt-0.5">›</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer disclaimer */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 pb-8 border-t border-white/5">
        <p className="text-text-muted text-xs text-center leading-relaxed max-w-2xl mx-auto">
          ⚠️ 上述所有外部链接均指向独立的第三方学术机构网站，OncoPath 不对这些网站的内容或准确性负责。
          所有医学决策请以主治医生的意见为最终依据。
        </p>
      </div>
    </div>
  );
}
