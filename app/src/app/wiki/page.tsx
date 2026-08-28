"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { BookOpen, User, Search, Layers, Compass, Sparkles } from "lucide-react";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";
import { WIKI_TOPICS, WIKI_CATEGORIES, type WikiCategory, type RiskLevel } from "@/lib/wikiData";

import { WikiScenarioEntry } from "@/components/wiki/WikiScenarioEntry";
import { WikiSearchBar } from "@/components/wiki/WikiSearchBar";
import { WikiTopicCard } from "@/components/wiki/WikiTopicCard";
import { WikiFloatingNav } from "@/components/wiki/WikiFloatingNav";
import { WikiSpotlightSearchModal } from "@/components/wiki/WikiSpotlightSearchModal";
import PostOpSymptomTriage from "@/components/profile/PostOpSymptomTriage";
import type { PatientProfile } from "@/lib/types";


export default function WikiPage() {
  const [activeCategory, setActiveCategory] = useState<WikiCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "all">("all");
  const [userProfile, setUserProfile] = useState<PatientProfile | null>(null);
  const [highlightedTopicId, setHighlightedTopicId] = useState<string | null>(null);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  // Ctrl+K / ⌘K 全局快捷键呼出 Spotlight 搜索
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Spotlight 词条穿梭跳转回调
  const handleSelectTopicFromSpotlight = (topicId: string, category: WikiCategory) => {
    // 切换分类，确保目标卡片在 DOM 中渲染
    setActiveCategory(category);
    setSearchQuery("");
    setSelectedRisk("all");
    setHighlightedTopicId(topicId);

    // URL hash 同步（Deep Link）
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#topic-${topicId}`);
    }

    // 短延迟后平滑滚动，等待 DOM 渲染
    setTimeout(() => {
      const el = document.getElementById(`topic-${topicId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    // 4.5 秒后自动消除高光
    setTimeout(() => setHighlightedTopicId(null), 4500);
  };

  // Load patient profile from localStorage if present
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("oncopath_profile") || localStorage.getItem("patient_profile");
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.error("Failed to load local profile:", e);
    }
  }, []);


  // Deep Linking Handler: Listen to URL Search Params & Hash for direct navigation (#topic-stas or ?category=pathology)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleHashAndParams = () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);

      // 1. Check category param or hash (e.g. ?category=nodule or #category-nodule)
      const catParam = urlParams.get("category");
      if (catParam && (catParam in WIKI_CATEGORIES || catParam === "all")) {
        setActiveCategory(catParam as WikiCategory | "all");
      } else if (hash.startsWith("#category-")) {
        const cat = hash.replace("#category-", "") as WikiCategory;
        if (cat in WIKI_CATEGORIES) {
          setActiveCategory(cat);
        }
      }

      // 2. Check topic param or hash (e.g. ?topic=stas, #topic-stas, or #stas)
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
        const targetTopic = WIKI_TOPICS.find((t) => t.id.toLowerCase() === targetTopicId);
        if (targetTopic) {
          // Ensure topic is not hidden by current filters
          setActiveCategory(targetTopic.category);
          setSelectedRisk("all");
          setSearchQuery("");
          setHighlightedTopicId(targetTopic.id);

          // Smooth scroll to target card with slight delay for DOM mount
          setTimeout(() => {
            const el = document.getElementById(`topic-${targetTopic.id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 200);

          // Dismiss breathing highlight after 4.5 seconds
          setTimeout(() => {
            setHighlightedTopicId(null);
          }, 4500);
        }
      }
    };

    handleHashAndParams();
    window.addEventListener("hashchange", handleHashAndParams);
    return () => window.removeEventListener("hashchange", handleHashAndParams);
  }, []);

  // Category item counts for tabs and floating nav
  const categoryCounts = useMemo(() => {
    return (Object.keys(WIKI_CATEGORIES) as WikiCategory[]).reduce((acc, key) => {
      acc[key] = WIKI_TOPICS.filter((t) => t.category === key).length;
      return acc;
    }, {} as Record<WikiCategory, number>);
  }, []);

  // Filter & Sort topics by Risk Priority (High > Moderate > Low > Safe)
  const filteredTopics = useMemo(() => {
    let list = [...WIKI_TOPICS];

    // 1. Filter by category
    if (activeCategory !== "all") {
      list = list.filter((t) => t.category === activeCategory);
    }

    // 2. Filter by risk level
    if (selectedRisk !== "all") {
      list = list.filter((t) => t.riskLevel === selectedRisk);
    }

    // 3. Filter by search query (keywords + title + metaphor + clinicalTruth)
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

    // 4. Sort strictly by priorityOrder descending (High-risk 100+ first)
    return list.sort((a, b) => b.priorityOrder - a.priorityOrder);
  }, [activeCategory, selectedRisk, searchQuery]);

  // Handler for scenario entrance click
  const handleSelectScenario = (cat: WikiCategory) => {
    setActiveCategory(cat);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#category-${cat}`);
    }
    // Smooth scroll down to topic list
    const el = document.getElementById("wiki-topics-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Profile matching helper
  const isTopicMatchedToProfile = (topicId: string) => {
    if (!userProfile) return false;
    if (topicId === "stas" && userProfile.stas === "positive") return true;
    if (topicId === "vpi" && userProfile.vpi === "positive") return true;
    if (topicId === "lvi" && userProfile.lvi === "positive") return true;
    if (topicId === "ggo-evolution" && (userProfile.ctr > 0 || userProfile.morphology === "mixed_ggo")) return true;
    if (topicId === "egfr-targeted" && userProfile.egfr === "positive") return true;
    if (topicId === "iaslc-grade3" && userProfile.iaslcGrade === "3") return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white relative">
      {/* Top Floating Island Navigation Bar */}
      <SubpageNavbar />

      {/* Main Page Container (Standard max-w-7xl aligned with /knowledge, /studies, /reimbursement, /resources) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 pt-28 md:pt-32 pb-16 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 pb-4">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200 shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>肺结节与肺癌全景循证视觉百科</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span>按风险优先级排序</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            从未知恐慌走向 · <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500">从容笃定</span>
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            拒绝冰冷晦涩的医学术语与网络恐慌谣言。我们用<strong>生活化大白话比喻</strong>、<strong>高精 SVG 微观解剖图解</strong>与<strong>全球顶级循证试验数据</strong>，为您逐一破译病理指标，构筑坚不可摧的抗癌信心。
          </p>

          {/* Profile Matched Notification Bar if profile exists */}
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

        {/* Act 1: Emotion-First Scenario Entrance Cards */}
        <section className="pt-1">
          <WikiScenarioEntry activeCategory={activeCategory} onSelectCategory={handleSelectScenario} />
        </section>

        {/* Act 2: Wiki Encyclopedia Topic Matrix */}
        <section id="wiki-topics-section" className="space-y-6 pt-6">

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
            <button
              onClick={() => {
                setActiveCategory("all");
                if (typeof window !== "undefined") {
                  window.history.replaceState(null, "", window.location.pathname);
                }
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>全部专区 ({WIKI_TOPICS.length})</span>
            </button>

            {(Object.keys(WIKI_CATEGORIES) as WikiCategory[]).map((catKey) => {
              const cat = WIKI_CATEGORIES[catKey];
              const count = WIKI_TOPICS.filter((t) => t.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => {
                    setActiveCategory(catKey);
                    if (typeof window !== "undefined") {
                      window.history.replaceState(null, "", `#category-${catKey}`);
                    }
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    activeCategory === catKey
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[11px] opacity-70 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search & Risk Filter Bar */}
          <WikiSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRisk={selectedRisk}
            onRiskChange={setSelectedRisk}
            totalCount={WIKI_TOPICS.length}
            filteredCount={filteredTopics.length}
          />

          {/* Post-Op Symptom Tri-Color Triage Section (Dedicated to Recovery Category) */}
          {(activeCategory === "recovery" || (activeCategory === "all" && !searchQuery && selectedRisk === "all")) && (
            <div className="animate-fade-in">
              <PostOpSymptomTriage />
            </div>
          )}

          {/* Topics Grid (2 columns on desktop, 1 on mobile) */}
          {filteredTopics.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {filteredTopics.map((topic) => (
                <WikiTopicCard
                  key={topic.id}
                  topic={topic}
                  isMatchedProfile={isTopicMatchedToProfile(topic.id)}
                  isHighlighted={highlightedTopicId === topic.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">未找到与 &quot;{searchQuery}&quot; 相关的破译词条</h3>
              <p className="text-xs text-slate-400">
                请尝试更换关键词，或点击上方「全部」重置筛选条件
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                  setSelectedRisk("all");
                }}
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                重置全部筛选
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Standard Elegant Footer */}
      <Footer maxWidth="max-w-7xl" />


      {/* Right Side Desktop Floating Elevator Navigation Dock */}
      <WikiFloatingNav
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          if (typeof window !== "undefined") {
            if (cat === "all") {
              window.history.replaceState(null, "", window.location.pathname);
            } else {
              window.history.replaceState(null, "", `#category-${cat}`);
            }
          }
        }}
        totalTopics={WIKI_TOPICS.length}
        categoryCounts={categoryCounts}
        onOpenSearch={() => setIsSpotlightOpen(true)}
      />

      {/* Mobile FAB — 右下角悬浮搜索气泡（仅 md 以下可见） */}
      <button
        type="button"
        onClick={() => setIsSpotlightOpen(true)}
        className="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 rounded-full btn-primary text-white shadow-xl shadow-sky-500/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 animate-fade-in"
        aria-label="快速搜索百科词条"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Spotlight 搜索面板 */}
      <WikiSpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        userProfile={userProfile}
        onSelectTopic={handleSelectTopicFromSpotlight}
      />
    </div>
  );
}
