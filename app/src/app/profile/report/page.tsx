"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import type { PatientProfile } from "@/lib/types";
import { getGuestId } from "@/lib/guest";

export default function EvidenceReportPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);
  const [cachedTime, setCachedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  
  const hasLoadedRef = useRef(false);
  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [reportMarkdown, isGenerating]);

  // Core Function: Execute Stream Generation & Save to Both LocalStorage and Cloud Database
  const startGeneratingReport = async (currentProfile: PatientProfile) => {
    setIsGenerating(true);
    setReportMarkdown("");
    setError("");
    setIsLoadedFromCache(false);

    try {
      const reportRes = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfile)
      });

      if (!reportRes.ok) {
        const err = await reportRes.json();
        throw new Error(err.error || "报告生成失败");
      }

      const reader = reportRes.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) {
        throw new Error("无数据流返回");
      }

      let accumulatedText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setReportMarkdown((prev) => prev + chunk);
      }

      const nowFormatted = new Date().toLocaleString("zh-CN", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      setCachedTime(nowFormatted);
      setIsLoadedFromCache(true);

      // 1. Save to localStorage (Guest & Instant Cache)
      if (typeof window !== "undefined") {
        localStorage.setItem(`oncopath_report_${currentProfile.id || getGuestId()}`, accumulatedText);
        localStorage.setItem(`oncopath_report_time_${currentProfile.id || getGuestId()}`, nowFormatted);
      }

      // 2. Persist to Cloud Database (PostgreSQL)
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: currentProfile.id,
            userId: getGuestId(),
            reportMarkdown: accumulatedText,
          })
        });
      } catch (dbErr) {
        console.warn("Cloud persistence notice (non-fatal):", dbErr);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Initial Load: Check Local Cache & Database Persistence First (0ms Instant Load)
  useEffect(() => {
    async function loadData() {
      if (hasLoadedRef.current) return;
      hasLoadedRef.current = true;

      try {
        // 1. Fetch Profile from API/DB
        const res = await fetch('/api/profile?userId=' + getGuestId());
        const data = await res.json();
        
        if (!data.profile) {
          setError("未找到患者档案，请先在档案页录入或上传病理报告。");
          return;
        }
        
        const fetchedProfile = data.profile;
        setProfile(fetchedProfile);

        // 2. Check Cloud Database for existing report
        if (fetchedProfile.reportMarkdown) {
          setReportMarkdown(fetchedProfile.reportMarkdown);
          setIsLoadedFromCache(true);
          const timeStr = fetchedProfile.reportGeneratedAt 
            ? new Date(fetchedProfile.reportGeneratedAt).toLocaleString("zh-CN", {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
              })
            : null;
          setCachedTime(timeStr);
          return;
        }

        // 3. Check localStorage for guest offline cache
        const localCached = typeof window !== "undefined" 
          ? localStorage.getItem(`oncopath_report_${fetchedProfile.id || getGuestId()}`)
          : null;
        const localTime = typeof window !== "undefined"
          ? localStorage.getItem(`oncopath_report_time_${fetchedProfile.id || getGuestId()}`)
          : null;

        if (localCached) {
          setReportMarkdown(localCached);
          setIsLoadedFromCache(true);
          setCachedTime(localTime);
          return;
        }

        // 4. No cached report exists -> Trigger first-time generation
        await startGeneratingReport(fetchedProfile);

      } catch (err: any) {
        setError(err.message || "加载数据失败");
      }
    }

    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyChecklist = () => {
    // Extract Section 3 (Consultation Checklist) from markdown text
    const section3Match = reportMarkdown.match(/##?\s*3[\s\S]*?(?=##?\s*4|$)/);
    let textToCopy = "";
    if (section3Match) {
      textToCopy = section3Match[0].trim();
    } else {
      textToCopy = reportMarkdown;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const confirmAndRegenerate = () => {
    setShowRegenConfirm(false);
    if (profile) {
      startGeneratingReport(profile);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 print:bg-white print:pb-0 text-slate-900">
      
      {/* Toast Notification for Copied */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-slate-700 text-sm">
          <span className="text-emerald-400 font-bold">✓</span>
          <span>门诊问诊清单已成功复制到剪贴板！可直接粘贴至微信或备忘录。</span>
        </div>
      )}

      {/* Confirmation Modal for Regeneration */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-4 border border-amber-200">
              🔄
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">确认重新推演生成报告？</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              系统将根据当前最新的病理指标重新检索前瞻性文献并调用大模型重写。<strong>当您修改了病理分期、新增了基因突变或想获取最新版解读时推荐使用</strong>。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRegenConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={confirmAndRegenerate}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                确认重新生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Island Navigation Header */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none print:hidden">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-5 sm:px-7 py-3 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all pointer-events-auto">
          <div className="flex items-center gap-3">
            <Link 
              href="/profile" 
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-accent-blue transition-colors px-2.5 py-1.5 rounded-xl hover:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              返回档案
            </Link>
            <div className="w-px h-4 bg-slate-300"></div>
            <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-500 animate-ping' : 'bg-accent-teal animate-pulse'}`} />
              专属深度循证解读报告
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/knowledge"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all shadow-xs"
            >
              🗺️ 4D图谱
            </Link>

            {!isGenerating && (
              <>
                <button
                  onClick={() => setShowRegenConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer shadow-xs"
                  title="当修改了分期或基因突变时重新生成"
                >
                  🔄 重新推演
                </button>
                <button
                  onClick={handleCopyChecklist}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-accent-blue bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-xs"
                  title="一键提取问诊清单"
                >
                  📋 复制问诊单
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-all shadow-xs cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  打印 / PDF
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 md:pt-32 print:pt-0 print:px-0">
        
        {/* Smart Cache Notification & Regenerate Notice Banner */}
        {isLoadedFromCache && !isGenerating && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-teal-50 border border-sky-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-sky-600 flex items-center justify-center text-base shadow-xs flex-shrink-0 border border-sky-100">
                📋
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>已瞬间加载您的专属深度循证解读报告</span>
                  {cachedTime && (
                    <span className="text-[11px] font-medium text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full">
                      生成于 {cachedTime}
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5">
                  💡 <strong>提示</strong>：当您修改了病理分期、新增了基因突变或想获取最新版解读时，可点击右侧重新推演。
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRegenConfirm(true)}
              className="self-end sm:self-center flex-shrink-0 px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-sky-700 font-bold text-xs border border-sky-300 shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🔄</span>
              <span>重新推演生成</span>
            </button>
          </div>
        )}

        {/* Patient Clinical Overview Hero Card */}
        {profile && (
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm mb-6 print:border-none print:shadow-none print:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                  PATIENT CLINICAL PROFILE · 临床数字档案
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                    {profile.age}岁 · {profile.gender === 'male' ? '男性' : '女性'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-accent-blue border border-blue-200 font-bold text-xs md:text-sm">
                    {profile.tStage || "T?"}{profile.nStage || "N?"}M0
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {profile.surgeryType === 'lobectomy' ? '标准肺叶切除' : profile.surgeryType === 'segmentectomy' ? '解剖性肺段切除' : profile.surgeryType || '手术切除'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden md:inline">风险评级:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  profile.nStage === 'N2' || profile.stas === 'positive' 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {profile.nStage === 'N2' || profile.stas === 'positive' ? '⚡ 需积极辅助治疗' : '🌱 早期低风险随访'}
                </span>
              </div>
            </div>

            {/* 4-Factor Traffic Light Matrix (四维红绿灯风险矩阵) */}
            <div className="mt-4 pt-1">
              <div className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
                <span>🚦 关键病理红绿灯矩阵</span>
                <span className="text-slate-400 font-normal text-[11px]">(决定预后与辅助治疗的核心指标)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <MatrixBadge 
                  label="切缘状态" 
                  value={profile.margin === 'positive' ? '阳性(有残留)' : '阴性(R0安全)'} 
                  type={profile.margin === 'positive' ? 'danger' : 'safe'}
                />
                <MatrixBadge 
                  label="淋巴结状态" 
                  value={profile.nStage === 'N0' ? 'N0 (无转移)' : profile.nStage === 'N1' ? 'N1 (肺门累及)' : profile.nStage === 'N2' ? 'N2 (纵隔转移)' : profile.nStage || '未提及'} 
                  type={profile.nStage === 'N0' ? 'safe' : profile.nStage === 'N1' ? 'warning' : 'danger'}
                />
                <MatrixBadge 
                  label="气道播散 (STAS)" 
                  value={profile.stas === 'positive' ? '阳性 (高危)' : profile.stas === 'negative' ? '阴性 (安全)' : '未提示'} 
                  type={profile.stas === 'positive' ? 'warning' : 'safe'}
                />
                <MatrixBadge 
                  label="脉管癌栓 (LVI)" 
                  value={profile.lvi === 'positive' ? '阳性 (高危)' : profile.lvi === 'negative' ? '阴性 (安全)' : '未提示'} 
                  type={profile.lvi === 'positive' ? 'warning' : 'safe'}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl border border-rose-200 mb-6 print:hidden">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <span>⚠️</span> 生成遇到异常
            </h3>
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {/* Report Content Main Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[60vh] print:border-none print:shadow-none print:m-0 print:p-0">
          
          {/* Top Decorative Gradient Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent-blue via-accent-teal to-accent-blue print:hidden" />
          
          <div className="p-6 md:p-10 print:p-0">
            {!reportMarkdown && isGenerating && (
              <div className="flex flex-col items-center gap-3.5 text-accent-blue font-medium py-16 justify-center animate-pulse print:hidden">
                <svg className="animate-spin h-8 w-8 text-accent-blue" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">正在为您检索海量前瞻性临床研究文献并生成个性化循证报告...</span>
              </div>
            )}
            
            {/* Custom Enhanced ReactMarkdown Rendering */}
            <div className="prose prose-slate max-w-none 
              prose-headings:font-bold prose-headings:text-slate-900
              prose-h2:text-lg md:prose-h2:text-xl prose-h2:pb-2.5 prose-h2:border-b prose-h2:border-slate-100 prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-base md:prose-h3:text-lg prose-h3:text-slate-800 prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-[15px]
              prose-li:text-slate-700 prose-li:text-sm md:prose-li:text-[15px] prose-li:leading-relaxed
              prose-strong:text-slate-900 prose-strong:font-semibold
              prose-blockquote:bg-blue-50/50 prose-blockquote:border-l-4 prose-blockquote:border-accent-blue prose-blockquote:rounded-r-xl prose-blockquote:p-4 prose-blockquote:text-slate-800 prose-blockquote:not-italic prose-blockquote:my-4
              print:prose-p:text-black print:prose-headings:text-black print:text-sm"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => (
                    <h2 className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2.5 mt-8 mb-4 font-bold text-lg md:text-xl" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="bg-slate-50 border-l-4 border-accent-blue rounded-r-xl p-4 my-4 text-slate-800 not-italic shadow-sm text-sm" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="space-y-1.5 my-3 pl-5 list-disc" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-sm" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => (
                    <th className="bg-slate-50 px-4 py-2.5 text-left font-semibold text-slate-700" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-4 py-2.5 border-t border-slate-100 text-slate-600" {...props} />
                  )
                }}
              >
                {reportMarkdown}
              </ReactMarkdown>
            </div>

            {isGenerating && reportMarkdown && (
              <div className="mt-6 flex gap-1.5 items-center justify-center text-accent-blue text-xs font-semibold print:hidden">
                <span className="w-2 h-2 bg-accent-blue rounded-full animate-ping" />
                <span>AI 专家正在持续撰写中...</span>
              </div>
            )}
            
            <div ref={contentEndRef} className="h-4 print:hidden" />
          </div>
        </div>

      </div>
    </div>
  );
}

function MatrixBadge({ label, value, type }: { label: string; value: string; type: 'safe' | 'warning' | 'danger' }) {
  const styles = {
    safe: 'bg-emerald-50/90 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50/90 text-amber-800 border-amber-200',
    danger: 'bg-rose-50/90 text-rose-800 border-rose-200'
  };

  const icons = {
    safe: '✅',
    warning: '⚠️',
    danger: '🚨'
  };

  return (
    <div className={`p-2.5 rounded-xl border ${styles[type]} flex flex-col justify-between transition-all shadow-xs`}>
      <span className="text-[11px] font-medium opacity-80 mb-0.5">{label}</span>
      <span className="text-xs font-bold flex items-center gap-1">
        <span>{icons[type]}</span>
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}
