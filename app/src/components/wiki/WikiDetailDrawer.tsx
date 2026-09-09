"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Share2,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  HeartPulse,
  Sparkles,
  PlusCircle,
  Image,
  BookmarkCheck,
  ArrowRight,
  Crosshair,
  Layers,
} from "lucide-react";
import dynamic from "next/dynamic";
import type { WikiTopic } from "@/lib/wikiData";
import { RISK_LEVEL_CONFIG, WIKI_CATEGORIES } from "@/lib/wikiData";
import WikiTopicIcon from "./WikiTopicIcon";
import { WikiVisualRenderer } from "./WikiVisualRenderer";

// 海报模态框：仅在用户点击"生成海报"时才加载
const WikiSharePosterModal = dynamic(() => import("./WikiSharePosterModal"), {
  ssr: false,
  loading: () => null,
});

// ── 工具函数 ────────────────────────────────────────────────────────────────
function copyTextSafe(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const fallback = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        resolve(ok);
      } catch {
        resolve(false);
      }
    };
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => resolve(true)).catch(() => fallback());
    } else {
      fallback();
    }
  });
}

// ── 类型与 Props ─────────────────────────────────────────────────────────────
interface WikiDetailDrawerProps {
  topic: WikiTopic | null;
  allTopics: WikiTopic[];       // 用于翻页
  isMatchedProfile?: boolean;
  onClose: () => void;
  onNavigate: (topicId: string) => void; // 翻页回调
}

// ── 主组件 ─────────────────────────────────────────────────────────────────
export function WikiDetailDrawer({
  topic,
  allTopics,
  isMatchedProfile,
  onClose,
  onNavigate,
}: WikiDetailDrawerProps) {
  const [expandedFaq, setExpandedFaq]       = useState<number | null>(null);
  const [copied, setCopied]                  = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [toastMessage, setToastMessage]      = useState<string | null>(null);
  const [savedQuestions, setSavedQuestions]  = useState<Record<string, boolean>>({});
  const [isVisible, setIsVisible]            = useState(false);  // 控制入场动效
  const drawerRef                            = useRef<HTMLDivElement>(null);

  // 当 topic 变化时重置展开状态、触发入场动效
  useEffect(() => {
    if (topic) {
      setExpandedFaq(null);
      setCopied(false);
      setSavedQuestions({});
      // 次一帧触发动效（确保 CSS transition 生效）
      requestAnimationFrame(() => setIsVisible(true));
      // 聚焦抽屉（键盘可访问性）
      setTimeout(() => drawerRef.current?.focus(), 300);
    } else {
      setIsVisible(false);
    }
  }, [topic?.id]);

  // Escape 键关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // 锁定背景滚动
  useEffect(() => {
    if (topic) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [topic]);

  // 翻页：找到当前词条在 allTopics 中的位置
  const currentIdx = topic ? allTopics.findIndex((t) => t.id === topic.id) : -1;
  const prevTopic  = currentIdx > 0               ? allTopics[currentIdx - 1] : null;
  const nextTopic  = currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyReassurance = async () => {
    if (!topic) return;
    const text = `【${topic.title} · 临床指引与定心丸】\n[生活比喻] ${topic.metaphor}\n[循证定心丸] ${topic.reassurance}\n— 来源：OncoPath 肺结节与肺癌循证视觉百科`;
    const ok = await copyTextSafe(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToClinicQuestions = (questionText: string, customTitle?: string) => {
    if (!topic || typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("oncopath_clinic_questions");
      let list = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(list)) list = [];
      const newItem = {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: customTitle || topic.title.split("：")[0] || topic.title,
        question: questionText,
        topicId: topic.id,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      if (!list.some((item: any) => item.question === questionText)) {
        list.push(newItem);
        localStorage.setItem("oncopath_clinic_questions", JSON.stringify(list));
      }
      setSavedQuestions((prev) => ({ ...prev, [questionText]: true }));
      triggerToast("✓ 已成功加入门诊就医提问小抄！可在就医便签卡与打印清单中查看。");
    } catch (e) {
      console.error("Failed to save clinic question", e);
    }
  };

  // 若 topic 为 null 且已不可见，渲染 null（完成退出动效后）
  if (!topic && !isVisible) return null;

  const riskCfg = topic ? RISK_LEVEL_CONFIG[topic.riskLevel] : null;
  const catCfg  = topic ? WIKI_CATEGORIES[topic.category]    : null;

  return (
    <>
      {/* ── 背景遮罩 ──────────────────────────────────────────────────────── */}
      <div
        role="presentation"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible && topic ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── 侧滑抽屉主体 ──────────────────────────────────────────────────── */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={topic ? `${topic.title} 详细解读` : "词条详情"}
        className={`
          fixed top-0 right-0 bottom-0 z-50
          w-full sm:w-[600px] lg:w-[680px]
          bg-white shadow-2xl shadow-slate-900/20
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-out
          focus:outline-none
          ${isVisible && topic ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Toast 通知 */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-fade-in max-w-[90%] pointer-events-none">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ── 顶部标题栏 ────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
          {topic && riskCfg && catCfg ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-xs">
                <WikiTopicIcon icon={topic.icon} topicId={topic.id} size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catCfg.badgeBg}`}>
                    {topic.subcategory || catCfg.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${riskCfg.bg} ${riskCfg.color} ${riskCfg.border}`}>
                    {riskCfg.label.split("·")[0].trim()}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                  {topic.title}
                </h2>
              </div>
            </div>
          ) : (
            <div className="h-10 w-48 rounded-xl bg-slate-100 animate-pulse" />
          )}

          {/* 工具栏：海报 + 复制 + 关闭 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {topic && (
              <>
                <button
                  type="button"
                  onClick={() => setShowPosterModal(true)}
                  title="生成微信分享海报"
                  className="w-8 h-8 rounded-xl border border-blue-200 bg-blue-50/80 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <Image className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyReassurance}
                  title={copied ? "已复制" : "一键复制定心丸金句"}
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs ${
                    copied
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭抽屉"
              className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 内容区（可滚动） ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {topic ? (
            <div className="px-5 sm:px-6 py-5 space-y-5">

              {/* 【C 位】专属交互模拟器 ─ 仅下载此 1 个 chunk */}
              {topic.visualComponent && (
                <div className="rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-950/[0.02]">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse inline-block" />
                      视觉微观图解与交互模拟
                    </span>
                  </div>
                  <div className="p-1">
                    <WikiVisualRenderer visualComponent={topic.visualComponent} />
                  </div>
                </div>
              )}

              {/* Section 1: 生活比喻 */}
              <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 p-4 rounded-2xl border border-amber-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>生活比喻直观破译：</span>
                </div>
                <p className="text-sm text-amber-950 font-medium leading-relaxed">
                  {topic.metaphor}
                </p>
              </div>

              {/* Section 2: 临床真相 */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                  <span>临床真相深度解读：</span>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                  {topic.clinicalTruth.split("\n").map((line, idx) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    if (trimmed.startsWith("• ") || trimmed.startsWith("· ")) {
                      return (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                          <span className="text-blue-500 font-bold mt-0.5 shrink-0 text-sm leading-none">•</span>
                          <span className="flex-1 text-slate-600 leading-relaxed">{trimmed.substring(2)}</span>
                        </div>
                      );
                    }
                    return <p key={idx} className="leading-relaxed text-slate-600">{line}</p>;
                  })}
                </div>
              </div>

              {/* Section 3: 医学战术 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>现代医学的精准拦截武器：</span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  {topic.tactics.map((tactic, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-emerald-600 font-bold mt-0.5 shrink-0" />
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 关键循证数据 */}
              {topic.keyMetric && (
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-blue-900">
                    <div className="flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>核心循证结论与依据：</span>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200/60 truncate max-w-[200px]">
                      {topic.keyMetric.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    {topic.keyMetric.value}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1.5 border-t border-blue-100/80 flex items-center gap-1">
                    <span className="text-slate-400">循证出处：</span>
                    <span className="text-slate-700 font-medium">{topic.keyMetric.source}</span>
                  </div>
                </div>
              )}

              {/* Section 4: FAQ 手风琴 */}
              {topic.faq && topic.faq.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>患者关注的高频疑问：</span>
                    </span>
                    <span className="text-[10px] text-slate-400">可一键加入门诊提问清单</span>
                  </div>
                  {topic.faq.map((item, idx) => {
                    const isSaved = savedQuestions[item.question];
                    return (
                      <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          className="w-full text-left p-3 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-2 transition-colors cursor-pointer text-xs font-bold text-slate-800"
                        >
                          <span className="flex-1">Q: {item.question}</span>
                          <span className="text-slate-400">
                            {expandedFaq === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </span>
                        </button>
                        {expandedFaq === idx && (
                          <div className="p-3.5 bg-white text-sm text-slate-600 leading-relaxed border-t border-slate-100 space-y-3">
                            <div className="whitespace-pre-line">
                              <span className="font-bold text-blue-700">答：</span>{item.answer}
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex justify-end">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToClinicQuestions(item.question, topic.title.split("：")[0]);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                                  isSaved
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-white hover:bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300"
                                }`}
                              >
                                {isSaved ? (
                                  <><Check className="w-3.5 h-3.5 text-emerald-600" /><span>已在就医提问清单</span></>
                                ) : (
                                  <><PlusCircle className="w-3.5 h-3.5 text-blue-600" /><span>+ 加入门诊提问小抄</span></>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Section 5: 暖心定心丸 */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                    <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>暖心定心丸</span>
                  </div>
                </div>
                <div className="text-sm text-teal-950 leading-relaxed whitespace-pre-line">
                  {topic.reassurance}
                </div>
              </div>

              {/* 快捷操作区 */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                {topic.graphNodeId ? (
                  <Link
                    href={`/knowledge?node=${encodeURIComponent(topic.graphNodeId)}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <span>代入知识图谱推演因果链</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleAddToClinicQuestions(
                        `请问医生，结合我的报告，关于【${topic.title.split("：")[0]}】有哪些具体注意事项？`,
                        topic.title.split("：")[0]
                      )
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>将此条目加入门诊提问清单</span>
                  </button>
                )}
                <Link
                  href="/profile"
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                >
                  <span>对比我的档案参数</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 底部占位，避免翻页栏遮挡内容 */}
              <div className="h-20" />
            </div>
          ) : (
            // 空状态骨架
            <div className="px-5 py-6 space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-100" />
              ))}
            </div>
          )}
        </div>

        {/* ── 底部翻页导航栏 ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-white/95 backdrop-blur-sm px-5 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* 上一词条 */}
          <button
            type="button"
            onClick={() => prevTopic && onNavigate(prevTopic.id)}
            disabled={!prevTopic}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              prevTopic
                ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95"
                : "border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:block max-w-[120px] truncate">
              {prevTopic ? prevTopic.title.split("：")[0].split("(")[0].trim() : "已是第一条"}
            </span>
            <span className="sm:hidden">上一条</span>
          </button>

          {/* 当前位置指示 */}
          <div className="text-xs text-slate-400 font-mono tabular-nums flex-shrink-0">
            {currentIdx + 1} / {allTopics.length}
          </div>

          {/* 下一词条 */}
          <button
            type="button"
            onClick={() => nextTopic && onNavigate(nextTopic.id)}
            disabled={!nextTopic}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              nextTopic
                ? "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95"
                : "border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed"
            }`}
          >
            <span className="hidden sm:block max-w-[120px] truncate">
              {nextTopic ? nextTopic.title.split("：")[0].split("(")[0].trim() : "已是最后条"}
            </span>
            <span className="sm:hidden">下一条</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 海报模态框（点击后才加载） */}
      {showPosterModal && topic && (
        <WikiSharePosterModal
          topic={topic}
          visualDomHtml={undefined}
          onClose={() => setShowPosterModal(false)}
        />
      )}
    </>
  );
}
