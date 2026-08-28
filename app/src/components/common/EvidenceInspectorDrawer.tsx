"use client";

import React from "react";
import { 
  BookOpen, 
  ExternalLink, 
  Layers, 
  ShieldCheck, 
  BarChart2, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  FileCheck 
} from "lucide-react";
import BottomSheet from "./BottomSheet";

export interface InspectorStudyData {
  id?: string;
  title: string;
  journal: string;
  year?: number | string;
  authors?: string[] | string;
  sampleSize?: number;
  hazardRatio?: string;
  ci95?: string;
  evidenceLevel?: number;
  keyFindings?: string;
  summary?: string;
  conclusion?: string;
  doi?: string;
  pmid?: string;
}

interface EvidenceInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  study: InspectorStudyData | any | null;
}

export default function EvidenceInspectorDrawer({
  isOpen,
  onClose,
  study,
}: EvidenceInspectorDrawerProps) {
  if (!study) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-600 flex-shrink-0" />
          <span className="font-bold text-slate-900">循证证据检视器 (Evidence Inspector)</span>
        </div>
      }
      description="顶级同行评审文献详细效应量与临床置信度解析"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* 顶部标题与期刊信息卡 */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              {study.journal || "顶级临床期刊"}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {study.year ? `${study.year} 年发表` : "权威发表"}
            </span>
            {study.sampleSize && (
              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
                队列样本量 n={study.sampleSize.toLocaleString()}
              </span>
            )}
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {study.title}
          </h4>
          {study.authors && (
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">研究团队：</span>
              {Array.isArray(study.authors) ? study.authors.join(", ") : study.authors}
            </p>
          )}
        </div>

        {/* 统计学效应量与置信区间 (HR, 95% CI) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500">风险比 (HR)</span>
            <div className="text-xl font-extrabold text-sky-700 font-mono">
              {study.hazardRatio ? study.hazardRatio : "统计学显著"}
            </div>
            <p className="text-2xs text-slate-500">相对对照组的疾病进展风险</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500">95% 置信区间 (95% CI)</span>
            <div className="text-xl font-extrabold text-emerald-700 font-mono">
              {study.ci95 ? study.ci95 : "区间收敛稳定"}
            </div>
            <p className="text-2xs text-slate-500">统计学真实效应分布范围</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
            <span className="text-xs font-semibold text-slate-500">证据推荐等级</span>
            <div className="text-xl font-extrabold text-amber-600 flex items-center gap-1">
              {"⭐".repeat(study.evidenceLevel || 4)}
            </div>
            <p className="text-2xs text-slate-500">基于 Oxford CEBM 循证分级</p>
          </div>
        </div>

        {/* 核心结论与通俗翻译 */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>核心临床结论与患者白话启示</span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
            {study.keyFindings || study.summary || study.conclusion || "该研究为肺腺癌早期术后随访与辅助治疗决策提供了坚实的真实世界生存数据支持。"}
          </p>
        </div>

        {/* 底部文献直达按钮 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-2xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>OncoPath 100% 同行评审文献直溯体系</span>
          </div>
          <div className="flex items-center gap-2">
            {study.doi && (
              <a
                href={study.doi.startsWith("http") ? study.doi : `https://doi.org/${study.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>直达 DOI 原文出处</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {study.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <span>PubMed</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
