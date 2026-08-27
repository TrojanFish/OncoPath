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
  const [activeTargetCategory, setActiveTargetCategory] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const selectedTarget = useMemo(() => {
    return TARGETED_DRUGS.find(d => d.id === selectedTargetId) || TARGETED_DRUGS[0];
  }, [selectedTargetId]);

  const filteredTargetedDrugs = useMemo(() => {
    if (activeTargetCategory === "all") return TARGETED_DRUGS;
    return TARGETED_DRUGS.filter(d => d.target === activeTargetCategory);
  }, [activeTargetCategory]);

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
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 text-slate-900 border border-slate-200 shadow-xl select-none space-y-5">
      {/* Patient Profile Linked Banner */}
      {geneInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-blue-950 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>
              已根据患者档案【<strong>{geneInfo}</strong>】自动一键关联靶向药：
              <strong className="text-blue-700 ml-1">{selectedTarget.genericName} ({selectedTarget.brandName})</strong>
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 shrink-0 font-bold self-start sm:self-auto">
            ✓ 档案精准互联
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <Pill className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>靶向药与日常慢病用药相互作用 (DDI) 动态自检</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                    临床药学级
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  覆盖 EGFR / ALK / KRAS / MET / RET 靶向药 vs 抑酸胃药、降压降脂、抗凝抗栓及日常西柚饮食
                </p>
              </div>
            </div>

            {isModalMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            常见组合:
          </span>
          <button
            type="button"
            onClick={() => applyPreset(["omeprazole", "atorvastatin", "amlodipine"])}
            className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 font-medium transition-all cursor-pointer"
          >
            三高+胃反酸
          </button>
          <button
            type="button"
            onClick={() => applyPreset(["grapefruit", "rifampin"])}
            className="text-[10px] px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all cursor-pointer font-bold"
          >
            高危禁忌测试
          </button>
          <button
            type="button"
            onClick={() => applyPreset(["valsartan", "rosuvastatin", "famotidine"])}
            className="text-[10px] px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-all cursor-pointer font-medium"
          >
            安全黄金搭档
          </button>
        </div>
      </div>

      {/* Step 1: Target Drug Selection */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs">1</span>
            <span className="font-bold text-slate-900">第一步：选择您目前服用的抗肿瘤靶向药（共 {TARGETED_DRUGS.length} 种）</span>
          </div>
          <span className="text-[11px] text-blue-600 font-mono font-medium">
            当前选中: {selectedTarget.genericName} ({selectedTarget.standardDosage.split(" ")[0]})
          </span>
        </div>

        {/* Target Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
          {["all", "EGFR", "ALK", "KRAS", "MET", "RET"].map(targetKey => (
            <button
              key={targetKey}
              type="button"
              onClick={() => setActiveTargetCategory(targetKey)}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
                activeTargetCategory === targetKey
                  ? "bg-blue-600 text-white font-bold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {targetKey === "all" ? `全部靶向药 (${TARGETED_DRUGS.length})` : `${targetKey} 抑制剂 (${TARGETED_DRUGS.filter(d => d.target === targetKey).length})`}
            </button>
          ))}
        </div>

        {/* Scrollable Target Drugs Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1.5 bg-slate-50/80 rounded-2xl border border-slate-200">
          {filteredTargetedDrugs.map(d => {
            const isSelected = d.id === selectedTargetId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedTargetId(d.id)}
                title={`${d.brandName} (${d.genericName})`}
                className={`p-2 sm:p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-w-0 w-full overflow-hidden ${
                  isSelected
                    ? "bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-400/60 text-blue-950"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="min-w-0 w-full">
                  <div className="flex items-center justify-between gap-1 mb-1 min-w-0 w-full">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      isSelected ? "bg-blue-200/80 text-blue-900" : "bg-slate-100 text-slate-600"
                    }`}>
                      {d.target}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium truncate shrink-1 min-w-0">{d.generation}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate w-full min-w-0">{d.brandName.split(" / ")[0]}</div>
                  <div className="text-[10px] text-slate-500 truncate w-full min-w-0 mt-0.5">{d.genericName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Chronic Drugs Selector */}
      <div className="space-y-2.5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs">2</span>
            <span>第二步：勾选您日常同时服用的慢病药、保健品或饮食（已选 <strong className="text-indigo-600 font-bold">{selectedChronicIds.length}</strong> 种）</span>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索药物名 (如: 胃药、降压药、他汀)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Friendly Cognitive Guide Bubble */}
        <div className="p-2.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-[11px] text-indigo-950 flex items-center gap-2 shadow-2xs">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>💡 <strong>智能提示</strong>：系统已在第一步为您选定靶向药，您只需在下方勾选平时服用的胃药、降压降脂药、抗凝药或饮食即可一键排雷。</span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
              activeCategory === "all"
                ? "bg-indigo-600 text-white font-bold shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.title.split(" / ")[0]} ({cat.drugs.length})
            </button>
          ))}
        </div>

        {/* Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto custom-scrollbar p-1.5 bg-slate-50/80 rounded-2xl border border-slate-200">
          {filteredChronicDrugs.map(drug => {
            const isSelected = selectedChronicIds.includes(drug.id);
            return (
              <button
                key={drug.id}
                type="button"
                onClick={() => toggleChronicDrug(drug.id)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-start justify-between gap-1.5 ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-400 text-indigo-950 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-slate-900">{drug.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{drug.categoryLabel}</div>
                </div>
                <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? "bg-indigo-600 text-white shadow-2xs" : "border border-slate-300 bg-white"
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
        <div className="text-xs font-bold text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 min-w-[20px] rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs">3</span>
            <span className="font-bold text-slate-900">第三步：临床相互作用排查报告与服药时钟</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] self-start sm:self-auto">
            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-bold">禁忌: {analysisResult.severeCount}</span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">需错峰: {analysisResult.cautionCount}</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">安全: {analysisResult.safeCount}</span>
          </div>
        </div>

        {/* Overall Status Box */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border flex items-start gap-3 ${
          analysisResult.overallStatus === "danger"
            ? "bg-rose-50 border-rose-300 text-rose-950 shadow-xs"
            : analysisResult.overallStatus === "warning"
            ? "bg-amber-50 border-amber-300 text-amber-950 shadow-xs"
            : "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs"
        }`}>
          {analysisResult.overallStatus === "danger" ? (
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
          ) : analysisResult.overallStatus === "warning" ? (
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-slate-900">
              <span>{analysisResult.summaryText}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
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
                    ? "bg-rose-50/60 border-rose-200 shadow-xs"
                    : isCaution
                    ? "bg-amber-50/50 border-amber-200 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                      isSevere
                        ? "bg-rose-600 text-white"
                        : isCaution
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      {rule.riskLabel}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      {selectedTarget.brandName.split(" / ")[0]} + {chronicDrug.name}
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono self-start sm:self-auto">
                    证据来源: {rule.evidenceLevel}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-900">
                    {rule.title}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="text-slate-800 font-semibold">机制解析：</span>
                    {rule.mechanism}
                  </p>
                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-950 leading-relaxed">
                    <span className="font-bold text-blue-800">💡 临床用药指引：</span>
                    {rule.clinicalGuidance}
                  </div>
                  {rule.timingRecommendation && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
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
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-slate-50 to-blue-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>个性化 24 小时服药时钟规划建议表</span>
              </span>
              <span className="text-[10px] text-slate-500">避开胃药/降压药代谢高峰</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {analysisResult.dailySchedulePlan.map((slot, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="text-[11px] font-bold text-indigo-700">{slot.timeSlot}</div>
                    <div className="space-y-1 mt-1.5">
                      {slot.drugs.map((d, dIdx) => (
                        <div key={dIdx} className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <ChevronRight className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-100 leading-tight">
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
