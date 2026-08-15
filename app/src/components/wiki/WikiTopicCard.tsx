"use client";

import { useState } from "react";
import Link from "next/link";
import type { WikiTopic } from "@/lib/wikiData";
import { RISK_LEVEL_CONFIG, WIKI_CATEGORIES } from "@/lib/wikiData";
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

interface WikiTopicCardProps {
  topic: WikiTopic;
  isMatchedProfile?: boolean;
}

export function WikiTopicCard({ topic, isMatchedProfile }: WikiTopicCardProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showVisual, setShowVisual] = useState<boolean>(true);

  const riskCfg = RISK_LEVEL_CONFIG[topic.riskLevel];
  const catCfg = WIKI_CATEGORIES[topic.category];

  return (
    <div
      id={`topic-${topic.id}`}
      className={`bg-white rounded-3xl p-5 sm:p-7 border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between relative ${
        isMatchedProfile
          ? "border-teal-400/80 ring-2 ring-teal-400/20 bg-gradient-to-b from-teal-50/20 to-white"
          : "border-slate-200/90"
      }`}
    >
      {/* Matched Profile Badge */}
      {isMatchedProfile && (
        <div className="absolute -top-3 right-6 bg-teal-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
          <span>★ 您的档案存在该特征</span>
        </div>
      )}

      <div>
        {/* Card Header: Category Tag & Risk Level Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${catCfg.badgeBg}`}>
            {catCfg.icon} {topic.subcategory || catCfg.label}
          </span>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${riskCfg.bg} ${riskCfg.color} ${riskCfg.border}`}>
            <span>{riskCfg.label}</span>
          </span>
        </div>

        {/* Title */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl flex-shrink-0 shadow-2xs">
            {topic.icon}
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

        {/* 🌰 Section 1: Life Metaphor (大白话生活比喻) */}
        <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 p-4 rounded-2xl border border-amber-200/80 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
            <span>🌰 一句话生活比喻破译：</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
            {topic.metaphor}
          </p>
        </div>

        {/* 🔬 Visual Micro Diagram if configured */}
        {topic.visualComponent && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">🔬 视觉微观图解与模拟</span>
              <button
                onClick={() => setShowVisual(!showVisual)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                {showVisual ? "收起图解 ▲" : "展开图解 ▼"}
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
              </div>
            )}
          </div>
        )}

        {/* 📋 Section 2: Clinical Truth (临床真相大白话) */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <span>📖 临床真相深度解读：</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {topic.clinicalTruth}
          </p>
        </div>

        {/* 🛡️ Section 3: Modern Medical Tactics (现代医学拦截武器) */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 mb-4">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span>🛡️ 现代医学的精准拦截武器：</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {topic.tactics.map((tactic, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>{tactic}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 📊 Key Evidence Metric if available */}
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

        {/* ❓ Section 4: Patient High-Frequency FAQ (手风琴) */}
        {topic.faq && topic.faq.length > 0 && (
          <div className="space-y-2 mb-4">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>❓ 患者最怕的高频疑问：</span>
            </div>
            {topic.faq.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full text-left p-3 bg-slate-50/70 hover:bg-slate-100/80 flex items-center justify-between gap-2 transition-colors cursor-pointer text-xs font-bold text-slate-800"
                >
                  <span>Q: {item.question}</span>
                  <span className="text-slate-400">{expandedFaq === idx ? "▲" : "▼"}</span>
                </button>
                {expandedFaq === idx && (
                  <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    <span className="font-bold text-blue-700">答：</span> {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 💚 Section 5: Warm Reassurance Box (Mandatory Bottom Safety Shield) */}
      <div className="mt-2 pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-2xl border border-teal-200/80 flex items-start gap-2.5">
          <span className="text-teal-600 text-lg leading-none mt-0.5">💚</span>
          <div className="text-xs text-teal-950 leading-relaxed flex-1">
            <strong>暖心定心丸：</strong> {topic.reassurance}
          </div>
        </div>

        {/* Direct Action Links */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-1">
          {topic.graphNodeId ? (
            <Link
              href={`/knowledge`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              <span>代入知识图谱推演因果链 ➔</span>
            </Link>
          ) : (
            <div />
          )}

          <Link
            href="/profile"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            对比我的档案参数 ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
