"use client";

import React, { useState, useMemo } from "react";
import {
  Pill,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Search,
  Check,
  X,
  AlertOctagon,
  Sparkles,
  Info,
  Calendar,
  ChevronRight
} from "lucide-react";
import {
  TARGETED_DRUGS,
  CHRONIC_DRUG_CATEGORIES,
  ALL_CHRONIC_DRUGS,
  checkDrugInteractions,
  TargetedDrug
} from "@/lib/ddiData";

export interface DdiCheckerVisualProps {
  initialTargetDrugId?: string;
  initialChronicDrugIds?: string[];
  patientName?: string;
  geneInfo?: string;
  isModalMode?: boolean;
  onClose?: () => void;
}

export function DdiCheckerVisual({
  initialTargetDrugId,
  initialChronicDrugIds,
  patientName,
  geneInfo,
  isModalMode = false,
  onClose,
}: DdiCheckerVisualProps = {}) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(initialTargetDrugId || "osimertinib");
  const [selectedChronicIds, setSelectedChronicIds] = useState<string[]>(
    initialChronicDrugIds && initialChronicDrugIds.length > 0 
      ? initialChronicDrugIds 
      : ["omeprazole", "atorvastatin", "amlodipine"]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const selectedTarget = useMemo(() => {
    return TARGETED_DRUGS.find(d => d.id === selectedTargetId) || TARGETED_DRUGS[0];
  }, [selectedTargetId]);

  const analysisResult = useMemo(() => {
    return checkDrugInteractions(selectedTargetId, selectedChronicIds);
  }, [selectedTargetId, selectedChronicIds]);

  const filteredChronicDrugs = useMemo(() => {
    let list = ALL_CHRONIC_DRUGS;
    if (activeCategory !== "all") {
      list = list.filter(d => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.aliases.some(a => a.toLowerCase().includes(q)) ||
        d.categoryLabel.toLowerCase().includes(q) ||
        d.typicalUse.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery]);

  const toggleChronicDrug = (id: string) => {
    setSelectedChronicIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const applyPreset = (ids: string[]) => {
    setSelectedChronicIds(ids);
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-3.5 sm:p-6 text-white border border-slate-800 shadow-xl select-none space-y-5">
      {/* Patient Profile Linked Banner */}
      {geneInfo && (
        <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-700/80 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-200 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>
              已根据患者档案【<strong>{geneInfo}</strong>】自动一键关联靶向药：
              <strong className="text-white ml-1">{selectedTarget.genericName} ({selectedTarget.brandName})</strong>
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 shrink-0 font-bold self-start sm:self-auto">
            ✓ 档案精准互联
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>靶向药与日常慢病用药相互作用 (DDI) 动态自检</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    临床药学级
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  覆盖 EGFR / ALK / KRAS 靶向药 vs 抑酸胃药、降压降脂、抗凝抗栓及日常西柚饮食
                </p>
              </div>
            </div>

            {isModalMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            常见组合:
          </span>
          <button
            type="button"
            onClick={() => applyPreset(["omeprazole", "atorvastatin", "amlodipine"])}
            className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all cursor-pointer"
          >
            三高+胃反酸
          </button>
          <button
            type="button"
            onClick={() => applyPreset(["grapefruit", "rifampin"])}
            className="text-[10px] px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800/80 transition-all cursor-pointer font-bold"
          >
            高危禁忌测试
          </button>
          <button
            type="button"
            onClick={() => applyPreset(["valsartan", "rosuvastatin", "famotidine"])}
            className="text-[10px] px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 rounded-lg border border-emerald-800/80 transition-all cursor-pointer"
          >
            安全黄金搭档
          </button>
        </div>
      </div>

      {/* Step 1: Target Drug Selection */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs">1</span>
            <span className="font-bold">第一步：选择您目前服用的抗肿瘤靶向药</span>
          </div>
          <span className="text-[11px] text-blue-400 font-mono font-normal">
            当前: {selectedTarget.genericName} ({selectedTarget.standardDosage})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {TARGETED_DRUGS.map(d => {
            const isSelected = d.id === selectedTargetId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedTargetId(d.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-blue-600/30 border-blue-400 shadow-md ring-1 ring-blue-400/50"
                    : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-700/80 text-blue-300">
                      {d.target}
                    </span>
                    <span className="text-[9px] text-slate-400">{d.generation}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{d.brandName.split(" / ")[0]}</div>
                  <div className="text-[10px] text-slate-400 truncate">{d.genericName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Chronic Drugs Selector */}
      <div className="space-y-2.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs">2</span>
            <span>第二步：勾选您日常同时服用的慢病药、保健品或饮食（已选 {selectedChronicIds.length} 种）</span>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索药物名 (如: 胃药、降压药、他汀)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
              activeCategory === "all"
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            全部分类 ({ALL_CHRONIC_DRUGS.length})
          </button>
          {CHRONIC_DRUG_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white font-bold"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.title.split(" / ")[0]} ({cat.drugs.length})
            </button>
          ))}
        </div>

        {/* Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1 bg-slate-950/40 rounded-2xl border border-slate-800/80">
          {filteredChronicDrugs.map(drug => {
            const isSelected = selectedChronicIds.includes(drug.id);
            return (
              <button
                key={drug.id}
                type="button"
                onClick={() => toggleChronicDrug(drug.id)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-start justify-between gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600/30 border-indigo-400 text-white shadow-xs"
                    : "bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate">{drug.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{drug.categoryLabel}</div>
                </div>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? "bg-indigo-500 text-white" : "border border-slate-600 bg-slate-700/50"
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Analysis Results Banner */}
      <div className="space-y-4 pt-2">
        <div className="text-xs font-bold text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs">3</span>
            <span className="font-bold">第三步：临床相互作用排查报告与服药时钟</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] self-start sm:self-auto">
            <span className="text-rose-400 font-bold">禁忌: {analysisResult.severeCount}</span>
            <span className="text-amber-400 font-bold">需错峰: {analysisResult.cautionCount}</span>
            <span className="text-emerald-400 font-bold">安全: {analysisResult.safeCount}</span>
          </div>
        </div>

        {/* Overall Status Box */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 ${
          analysisResult.overallStatus === "danger"
            ? "bg-rose-950/70 border-rose-500/80 text-rose-100"
            : analysisResult.overallStatus === "warning"
            ? "bg-amber-950/60 border-amber-500/80 text-amber-100"
            : "bg-emerald-950/60 border-emerald-500/80 text-emerald-100"
        }`}>
          {analysisResult.overallStatus === "danger" ? (
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          ) : analysisResult.overallStatus === "warning" ? (
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
              <span>{analysisResult.summaryText}</span>
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">
              基于 {selectedTarget.genericName} 药品说明书及 CYP450 肝药酶代谢动力学模型，请遵照以下细则管理服药节点。
            </p>
          </div>
        </div>

        {/* Detailed Cards Grid */}
        <div className="space-y-2.5">
          {analysisResult.interactions.map((item, idx) => {
            const { chronicDrug, rule } = item;
            const isSevere = rule.riskLevel === "severe_contraindication";
            const isCaution = rule.riskLevel === "timing_caution";
            const isSafe = rule.riskLevel === "compatible_safe";

            return (
              <div
                key={chronicDrug.id + idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSevere
                    ? "bg-rose-950/40 border-rose-500/60 shadow-xs"
                    : isCaution
                    ? "bg-amber-950/30 border-amber-500/50 shadow-xs"
                    : "bg-slate-800/40 border-slate-700/60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      isSevere
                        ? "bg-rose-500 text-white"
                        : isCaution
                        ? "bg-amber-500 text-slate-950"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}>
                      {rule.riskLabel}
                    </span>
                    <h4 className="text-xs font-bold text-white">
                      {selectedTarget.brandName.split(" / ")[0]} + {chronicDrug.name}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono self-start sm:self-auto">
                    证据来源: {rule.evidenceLevel}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold text-slate-300">
                    <strong className="text-slate-100">{rule.title}</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">机制解析：</span>
                    {rule.mechanism}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-blue-200 leading-relaxed">
                    <span className="font-bold text-blue-300">💡 临床用药指引：</span>
                    {rule.clinicalGuidance}
                  </div>
                  {rule.timingRecommendation && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>错峰建议：{rule.timingRecommendation}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Daily Schedule Plan */}
        {analysisResult.dailySchedulePlan.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>个性化 24 小时服药时钟规划建议表</span>
              </span>
              <span className="text-[10px] text-slate-400">避开胃药/降压药代谢高峰</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {analysisResult.dailySchedulePlan.map((slot, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-indigo-400">{slot.timeSlot}</div>
                    <div className="space-y-1 mt-1.5">
                      {slot.drugs.map((d, dIdx) => (
                        <div key={dIdx} className="text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-tight">
                    {slot.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
