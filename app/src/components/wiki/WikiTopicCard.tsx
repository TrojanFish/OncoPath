"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  HeartPulse,
  Crosshair,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { WikiTopic } from "@/lib/wikiData";
import { RISK_LEVEL_CONFIG, WIKI_CATEGORIES } from "@/lib/wikiData";
import WikiTopicIcon from "./WikiTopicIcon";
import { StasAirwayVisual } from "./visuals/StasAirwayVisual";
import { VpiPleuraVisual } from "./visuals/VpiPleuraVisual";
import { LviVesselVisual } from "./visuals/LviVesselVisual";
import { IaslcSubtypeVisual } from "./visuals/IaslcSubtypeVisual";
import { GgoEvolutionSimulator } from "./visuals/GgoEvolutionSimulator";
import { FleischnerDecisionTree } from "./visuals/FleischnerDecisionTree";
import { LobulationVisual } from "./visuals/LobulationVisual";
import { SpiculationVisual } from "./visuals/SpiculationVisual";
import { PleuralIndentationVisual } from "./visuals/PleuralIndentationVisual";
import { VacuoleSignVisual } from "./visuals/VacuoleSignVisual";
import { VascularConvergenceVisual } from "./visuals/VascularConvergenceVisual";
import { IplnLymphVisual } from "./visuals/IplnLymphVisual";
import { IhcKi67Visual } from "./visuals/IhcKi67Visual";
import { CalcificationVisual } from "./visuals/CalcificationVisual";
import { AdjuvantDecisionTreeVisual } from "./visuals/AdjuvantDecisionTreeVisual";
import { MediastinalLNMapVisual } from "./visuals/MediastinalLNMapVisual";
import { EgfrMutationMapVisual } from "./visuals/EgfrMutationMapVisual";
import { PleuralLayersVisual } from "./visuals/PleuralLayersVisual";
import { LungRadsScaleVisual } from "./visuals/LungRadsScaleVisual";
import { PdL1ImmuneMechanismVisual } from "./visuals/PdL1ImmuneMechanismVisual";
import { SurgicalApproachesVisual } from "./visuals/SurgicalApproachesVisual";
import { FollowupTimelineVisual } from "./visuals/FollowupTimelineVisual";
import { MPLCGGOVisual } from "./visuals/MPLCGGOVisual";

interface WikiTopicCardProps {
  topic: WikiTopic;
  isMatchedProfile?: boolean;
  isHighlighted?: boolean;
}

function copyTextSafe(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const fallback = () => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.select();
        textArea.setSelectionRange(0, 99999);
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        resolve(success);
      } catch (err) {
        console.error("Fallback copy failed:", err);
        resolve(false);
      }
    };

    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => resolve(true))
        .catch(() => fallback());
    } else {
      fallback();
    }
  });
}

export function WikiTopicCard({ topic, isMatchedProfile, isHighlighted }: WikiTopicCardProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showVisual, setShowVisual] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const riskCfg = RISK_LEVEL_CONFIG[topic.riskLevel];
  const catCfg = WIKI_CATEGORIES[topic.category];

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const directUrl = `${window.location.origin}${window.location.pathname}#topic-${topic.id}`;
      window.history.replaceState(null, "", `#topic-${topic.id}`);
      const ok = await copyTextSafe(directUrl);
      if (ok) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const handleCopyReassurance = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const textToCopy = `【${topic.title} · 临床指引与定心丸】\n[生活比喻] ${topic.metaphor}\n[循证定心丸] ${topic.reassurance}\n— 来源：OncoPath 肺结节与肺癌循证视觉百科`;
    const ok = await copyTextSafe(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id={`topic-${topic.id}`}
      className={`bg-white rounded-3xl p-3.5 sm:p-6 border transition-all duration-500 flex flex-col justify-between relative ${
        isHighlighted
          ? "border-blue-500 ring-4 ring-blue-500/40 shadow-xl bg-gradient-to-b from-blue-50/40 via-white to-white scale-[1.01]"
          : isMatchedProfile
          ? "border-teal-400/80 ring-2 ring-teal-400/20 bg-gradient-to-b from-teal-50/20 to-white shadow-sm hover:shadow-md"
          : "border-slate-200/90 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Matched Profile Badge */}
      {isMatchedProfile && (
        <div className="absolute -top-3 right-6 bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>您的档案存在该特征</span>
        </div>
      )}

      {/* Deep Link Hit Badge */}
      {isHighlighted && !isMatchedProfile && (
        <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1 animate-bounce">
          <Crosshair className="w-3.5 h-3.5" />
          <span>已精准定位该词条</span>
        </div>
      )}

      <div>
        {/* Card Header: Category Tag, Risk Badge & Share Link Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${catCfg.badgeBg}`}>
              {topic.subcategory || catCfg.label}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              title={copiedLink ? "已复制直达链接" : "复制此词条专属直达分享链接"}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                copiedLink
                  ? "bg-emerald-100/90 border-emerald-400 text-emerald-800 font-bold scale-105"
                  : "bg-slate-100/80 border-slate-200 text-slate-500 hover:bg-slate-200/80 hover:text-slate-800"
              }`}
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-700" /> : <Share2 className="w-3 h-3 text-slate-500" />}
              <span className="text-[10px]">{copiedLink ? "已复制直达链接" : "分享"}</span>
            </button>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${riskCfg.bg} ${riskCfg.color} ${riskCfg.border}`}>
            <span>{riskCfg.label}</span>
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <WikiTopicIcon icon={topic.icon} topicId={topic.id} size={24} />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {topic.title}
            </h3>
            {topic.subtitle && (
              <div className="text-xs font-semibold text-slate-400 mt-0.5">
                {topic.subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Section 1: Life Metaphor (大白话生活比喻) */}
        <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 p-4 rounded-2xl border border-amber-200/80 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>生活比喻直观破译：</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            {topic.metaphor}
          </p>
        </div>

        {/* Visual Micro Diagram if configured */}
        {topic.visualComponent && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">视觉微观图解与模拟</span>
              <button
                onClick={() => setShowVisual(!showVisual)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer flex items-center gap-0.5"
              >
                <span>{showVisual ? "收起图解" : "展开图解"}</span>
                {showVisual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            {showVisual && (
              <div className="animate-fade-in">
                {topic.visualComponent === "GgoEvolutionSimulator" && <GgoEvolutionSimulator />}
                {topic.visualComponent === "FleischnerDecisionTree" && <FleischnerDecisionTree />}
                {topic.visualComponent === "StasAirwayVisual" && <StasAirwayVisual />}
                {topic.visualComponent === "VpiPleuraVisual" && <VpiPleuraVisual />}
                {topic.visualComponent === "LviVesselVisual" && <LviVesselVisual />}
                {topic.visualComponent === "IaslcSubtypeVisual" && <IaslcSubtypeVisual />}
                {topic.visualComponent === "LobulationVisual" && <LobulationVisual />}
                {topic.visualComponent === "SpiculationVisual" && <SpiculationVisual />}
                {topic.visualComponent === "PleuralIndentationVisual" && <PleuralIndentationVisual />}
                {topic.visualComponent === "VacuoleSignVisual" && <VacuoleSignVisual />}
                {topic.visualComponent === "VascularConvergenceVisual" && <VascularConvergenceVisual />}
                {topic.visualComponent === "IplnLymphVisual" && <IplnLymphVisual />}
                {topic.visualComponent === "IhcKi67Visual" && <IhcKi67Visual />}
                {topic.visualComponent === "CalcificationVisual" && <CalcificationVisual />}
                {topic.visualComponent === "AdjuvantDecisionTreeVisual" && <AdjuvantDecisionTreeVisual />}
                {topic.visualComponent === "MediastinalLNMapVisual" && <MediastinalLNMapVisual />}
                {topic.visualComponent === "EgfrMutationMapVisual" && <EgfrMutationMapVisual />}
                {topic.visualComponent === "PleuralLayersVisual" && <PleuralLayersVisual />}
                {topic.visualComponent === "LungRadsScaleVisual" && <LungRadsScaleVisual />}
                {topic.visualComponent === "PdL1ImmuneMechanismVisual" && <PdL1ImmuneMechanismVisual />}
                {topic.visualComponent === "SurgicalApproachesVisual" && <SurgicalApproachesVisual />}
                {topic.visualComponent === "FollowupTimelineVisual" && <FollowupTimelineVisual />}
                {topic.visualComponent === "MPLCGGOVisual" && <MPLCGGOVisual />}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Clinical Truth (临床真相深度解读) */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-700 shrink-0" />
            <span>临床真相深度解读：</span>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
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
              return (
                <p key={idx} className="leading-relaxed text-slate-600">
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Section 3: Modern Medical Tactics (现代医学拦截武器) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 mb-4">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>现代医学的精准拦截武器：</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {topic.tactics.map((tactic, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <Check className="w-3.5 h-3.5 text-emerald-600 font-bold mt-0.5 shrink-0" />
                <span>{tactic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Evidence Metric if available */}
        {topic.keyMetric && (
          <div className="bg-blue-50/60 px-4 py-2.5 rounded-2xl border border-blue-100 flex items-center justify-between gap-2 mb-4 text-xs">
            <div>
              <div className="text-[10px] text-blue-700 font-semibold">{topic.keyMetric.label}</div>
              <div className="font-mono font-black text-blue-950 text-sm">{topic.keyMetric.value}</div>
            </div>
            <div className="text-[10px] text-slate-400 text-right">
              出处: {topic.keyMetric.source}
            </div>
          </div>
        )}

        {/* Section 4: Patient High-Frequency FAQ (手风琴) */}
        {topic.faq && topic.faq.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>患者关注的高频疑问：</span>
            </div>
            {topic.faq.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full text-left p-3 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-2 transition-colors cursor-pointer text-xs font-bold text-slate-800"
                >
                  <span>Q: {item.question}</span>
                  <span className="text-slate-400">{expandedFaq === idx ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}</span>
                </button>
                {expandedFaq === idx && (
                  <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line">
                    <span className="font-bold text-blue-700">答：</span> {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Warm Reassurance Box (Mandatory Bottom Safety Shield) */}
      <div className="mt-2 pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
              <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
              <span>暖心定心丸</span>
            </div>
            <button
              type="button"
              onClick={handleCopyReassurance}
              title={copied ? "已复制定心丸金句" : "一键复制定心丸金句"}
              aria-label="复制定心丸金句"
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs flex-shrink-0 ${
                copied
                  ? "bg-emerald-600 border-emerald-600 text-white scale-105"
                  : "bg-white/90 border-teal-300/80 text-teal-800 hover:bg-white hover:border-teal-400 hover:scale-105 active:scale-95"
              }`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-teal-700" />
              )}
            </button>
          </div>
          <div className="text-xs text-teal-950 leading-relaxed whitespace-pre-line">
            {topic.reassurance}
          </div>
        </div>

        {/* Direct Action Links */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1">
          {topic.graphNodeId ? (
            <Link
              href={`/knowledge?node=${encodeURIComponent(topic.graphNodeId)}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>代入知识图谱推演因果链</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/profile"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <span>对比我的档案参数</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
