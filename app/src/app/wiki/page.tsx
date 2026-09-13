"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BookOpen, User, Search } from "lucide-react";
import Footer from "@/components/Footer";
import EmptyState from "@/components/common/EmptyState";
import { WIKI_TOPICS, WIKI_CATEGORIES, type WikiCategory, type RiskLevel } from "@/lib/wikiData";

import { WikiScenarioTabs } from "@/components/wiki/WikiScenarioTabs";
import { WikiSearchBar } from "@/components/wiki/WikiSearchBar";
import { WikiCompactCard } from "@/components/wiki/WikiCompactCard";
import { WikiDetailDrawer } from "@/components/wiki/WikiDetailDrawer";
import { WikiFloatingNav } from "@/components/wiki/WikiFloatingNav";

import type { PatientProfile } from "@/lib/types";

// ── 次要重量级模块全部按需延迟加载 ──────────────────────────────────────────
// WikiSpotlightSearchModal: 具名导出，需 .then 映射
const WikiSpotlightSearchModal = dynamic(
  () => import("@/components/wiki/WikiSpotlightSearchModal").then((m) => ({ default: m.WikiSpotlightSearchModal })),
  { ssr: false, loading: () => null }
);
// PostOpSymptomTriage: 默认导出，直接加载
const PostOpSymptomTriage = dynamic(
  () => import("@/components/profile/PostOpSymptomTriage"),
  { ssr: false, loading: () => null }
);

export default function WikiPage() {
  const [activeCategory,     setActiveCategory]     = useState<WikiCategory | "all">("all");
  const [searchQuery,        setSearchQuery]         = useState<string>("");
  const [selectedRisk,       setSelectedRisk]        = useState<RiskLevel | "all">("all");
  const [userProfile,        setUserProfile]         = useState<PatientProfile | null>(null);
  const [activeDrawerTopicId, setActiveDrawerTopicId] = useState<string | null>(null);
  const [isSpotlightOpen,    setIsSpotlightOpen]     = useState(false);

  // ── 加载用户档案 ─────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem("oncopath_profile") || localStorage.getItem("patient_profile");
      if (saved) setUserProfile(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load local profile:", e);
    }
  }, []);

  // ── Ctrl+K 全局快捷键 ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    const handleCustomOpen = () => setIsSpotlightOpen(true);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("open-command-palette", handleCustomOpen);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  // ── Deep Linking：URL hash / search params 直达抽屉 ──────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashAndParams = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);

      // 1. 分类过滤
      const catParam = urlParams.get("category");
      if (catParam && (catParam in WIKI_CATEGORIES || catParam === "all")) {
        setActiveCategory(catParam as WikiCategory | "all");
      } else if (hash.startsWith("#category-")) {
        const cat = hash.replace("#category-", "") as WikiCategory;
        if (cat in WIKI_CATEGORIES) setActiveCategory(cat);
      }

      // 2. 词条深链接 → 直接打开抽屉
      const topicParam = urlParams.get("topic");
      let targetTopicId = "";
      if (topicParam) {
        targetTopicId = topicParam.toLowerCase();
      } else if (hash.startsWith("#topic-")) {
        targetTopicId = hash.replace("#topic-", "").toLowerCase();
      } else if (hash.length > 1 && !hash.startsWith("#wiki-") && !hash.startsWith("#category-")) {
        const clean = hash.replace("#", "").toLowerCase();
        if (WIKI_TOPICS.some((t) => t.id.toLowerCase() === clean)) {
          targetTopicId = clean;
        }
      }

      if (targetTopicId) {
        const target = WIKI_TOPICS.find((t) => t.id.toLowerCase() === targetTopicId);
        if (target) {
          setActiveCategory(target.category);
          setSelectedRisk("all");
          setSearchQuery("");
          // 短延迟确保分类过滤生效后再打开抽屉
          setTimeout(() => setActiveDrawerTopicId(target.id), 80);
        }
      }
    };

    handleHashAndParams();
    window.addEventListener("hashchange", handleHashAndParams);
    return () => window.removeEventListener("hashchange", handleHashAndParams);
  }, []);

  // ── 打开/关闭抽屉，并同步 URL hash ────────────────────────────────────────
  const openDrawer = useCallback((topicId: string) => {
    setActiveDrawerTopicId(topicId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#topic-${topicId}`);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveDrawerTopicId(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  // ── Spotlight 搜索选中词条 → 滑出抽屉 ────────────────────────────────────
  const handleSelectTopicFromSpotlight = useCallback((topicId: string, category: WikiCategory) => {
    setActiveCategory(category);
    setSearchQuery("");
    setSelectedRisk("all");
    openDrawer(topicId);
  }, [openDrawer]);

  // ── 分类计数 ──────────────────────────────────────────────────────────────
  const categoryCounts = useMemo(() => {
    return (Object.keys(WIKI_CATEGORIES) as WikiCategory[]).reduce((acc, key) => {
      acc[key] = WIKI_TOPICS.filter((t) => t.category === key).length;
      return acc;
    }, {} as Record<WikiCategory, number>);
  }, []);

  // ── 过滤排序 ──────────────────────────────────────────────────────────────
  const filteredTopics = useMemo(() => {
    let list = [...WIKI_TOPICS];
    if (activeCategory !== "all") list = list.filter((t) => t.category === activeCategory);
    if (selectedRisk !== "all") list = list.filter((t) => t.riskLevel === selectedRisk);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.subtitle && t.subtitle.toLowerCase().includes(q)) ||
          t.metaphor.toLowerCase().includes(q) ||
          t.clinicalTruth.toLowerCase().includes(q) ||
          t.searchKeywords.some((kw) => kw.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => b.priorityOrder - a.priorityOrder);
  }, [activeCategory, selectedRisk, searchQuery]);

  // ── 当前打开的词条对象 ────────────────────────────────────────────────────
  const activeDrawerTopic = useMemo(
    () => (activeDrawerTopicId ? WIKI_TOPICS.find((t) => t.id === activeDrawerTopicId) ?? null : null),
    [activeDrawerTopicId]
  );

  // ── 个人档案匹配 ──────────────────────────────────────────────────────────
  const isTopicMatchedToProfile = useCallback((topicId: string) => {
    if (!userProfile) return false;
    if (topicId === "stas"          && userProfile.stas === "positive") return true;
    if (topicId === "vpi"           && userProfile.vpi === "positive") return true;
    if (topicId === "lvi"           && userProfile.lvi === "positive") return true;
    if (topicId === "ggo-evolution" && (userProfile.ctr > 0 || userProfile.morphology === "mixed_ggo")) return true;
    if (topicId === "egfr-targeted" && userProfile.egfr === "positive") return true;
    if (topicId === "iaslc-grade3"  && userProfile.iaslcGrade === "3") return true;
    return false;
  }, [userProfile]);

  // ── 情景/分类 Tab 切换（五位一体） ───────────────────────────────────────
  const handleSelectCategory = useCallback((cat: WikiCategory | "all") => {
    setActiveCategory(cat);
    if (typeof window !== "undefined") {
      if (cat === "all") window.history.replaceState(null, "", window.location.pathname);
      else window.history.replaceState(null, "", `#category-${cat}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white relative">

      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:pt-32 pb-16 space-y-6 sm:space-y-8">

        {/* Hero Section */}
        <section className="text-center space-y-4 pb-4">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>肺结节与肺癌全景循证视觉百科</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            <span>按风险优先级排序</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            从未知恐慌走向 · <span className="text-blue-600">从容笃定</span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            拒绝冰冷晦涩的医学术语与网络恐慌谣言。我们用<strong>生活化大白话比喻</strong>、<strong>高精 SVG 微观解剖图解</strong>与<strong>全球顶级循证试验数据</strong>，为您逐一破译病理指标，构筑坚不可摧的抗癌信心。
          </p>

          {userProfile && (
            <div className="max-w-2xl mx-auto bg-teal-50/90 border border-teal-300 p-3.5 rounded-2xl text-xs text-teal-950 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-left">
                <User className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  已识别到您的个人数字档案（<strong>{userProfile.stage}期 · {userProfile.gender === "female" ? "女性" : "男性"} · {userProfile.age}岁</strong>），已为您智能置顶关联词条。
                </span>
              </div>
              <Link href="/profile" className="flex-shrink-0 font-bold text-teal-700 hover:underline">
                管理档案
              </Link>
            </div>
          )}
        </section>

        {/* ── 五位一体情景 Tab 导航（场景选择 + 分类过滤一体化） ─────────────── */}
        <section className="pt-2">
          <WikiScenarioTabs
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
        </section>

        {/* ── 词条指标大盘 ───────────────────────────────────────────────────── */}
        <section id="wiki-topics-section" className="space-y-4">

          {/* 搜索 & 风险过滤栏 */}
          <WikiSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRisk={selectedRisk}
            onRiskChange={setSelectedRisk}
            totalCount={WIKI_TOPICS.length}
            filteredCount={filteredTopics.length}
          />

          {/* 术后康复症状分诊（recovery 专区或全部默认状态时展示） */}
          {(activeCategory === "recovery" || (activeCategory === "all" && !searchQuery && selectedRisk === "all")) && (
            <div className="animate-fade-in">
              <PostOpSymptomTriage />
            </div>
          )}

          {/* 磁贴大盘（3 列 / 2 列 / 1 列 响应式网格） */}
          {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredTopics.map((topic) => (
                <WikiCompactCard
                  key={topic.id}
                  topic={topic}
                  isMatchedProfile={isTopicMatchedToProfile(topic.id)}
                  isHighlighted={activeDrawerTopicId === topic.id}
                  onClick={() => openDrawer(topic.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search"
              title={`未找到与 "${searchQuery}" 相关的破译词条`}
              description="请尝试更换关键词（支持拼音、中文或英文缩写），或点击下方按钮重置筛选条件。"
              action={
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); setSelectedRisk("all"); }}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  重置全部筛选
                </button>
              }
            />
          )}
        </section>
      </main>

      <Footer maxWidth="max-w-7xl" />

      {/* 悬浮侧边导航 */}
      <WikiFloatingNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        totalTopics={WIKI_TOPICS.length}
        categoryCounts={categoryCounts}
        onOpenSearch={() => setIsSpotlightOpen(true)}
      />

      {/* 移动端 FAB 搜索气泡 */}
      <button
        type="button"
        onClick={() => setIsSpotlightOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 rounded-full btn-primary text-white shadow-xl shadow-sky-500/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in"
        aria-label="快速搜索百科词条"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Spotlight 搜索面板（按需加载） */}
      <WikiSpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        userProfile={userProfile}
        onSelectTopic={handleSelectTopicFromSpotlight}
      />

      {/* ── 侧滑深度阅读抽屉 ──────────────────────────────────────────────── */}
      <WikiDetailDrawer
        topic={activeDrawerTopic}
        allTopics={filteredTopics}
        isMatchedProfile={activeDrawerTopic ? isTopicMatchedToProfile(activeDrawerTopic.id) : false}
        onClose={closeDrawer}
        onNavigate={openDrawer}
      />
    </div>
  );
}
