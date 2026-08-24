"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { toPng } from "html-to-image";
import type { PatientProfile } from "@/lib/types";
import { getGuestId } from "@/lib/guest";
import { GlossaryTooltip } from "@/components/common/GlossaryTooltip";
import ReasoningTicker from "@/components/profile/ReasoningTicker";


export default function EvidenceReportPage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);
  const [cachedTime, setCachedTime] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  
  const hasLoadedRef = useRef(false);
  const contentEndRef = useRef<HTMLDivElement>(null);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const consultationCardRef = useRef<HTMLDivElement>(null);

  // Helper: Extract structured questions from Section 3 for the Consultation Card
  const extractChecklistItems = (markdown: string) => {
    if (!markdown) return [];
    const section3Match = 
      markdown.match(/##?\s*(?:3[\.\s、]|三[\.\s、]|【向[^】]*问诊清单[^】]*】)[\s\S]*?(?=##?\s*(?:4[\.\s、]|四[\.\s、]|$))/i) ||
      markdown.match(/##?\s*3[\s\S]*?(?=##?\s*4|$)/) ||
      markdown.match(/【向[^】]*问诊清单】[\s\S]*?(?=##?\s*\d|$)/);

    const text = section3Match ? section3Match[0] : markdown;
    const lines = text.split('\n');
    const items: { title: string; content: string }[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
        const cleaned = trimmed.replace(/^-\s*\[\s*\]\s*/, '').replace(/^[-*]\s+/, '').replace(/^\d+\.\s*/, '');
        const titleMatch = cleaned.match(/\*\*【?([^】*]+)】?\*\*[：:]?\s*(.*)/) || cleaned.match(/【([^】]+)】[：:]?\s*(.*)/);
        if (titleMatch) {
          items.push({
            title: titleMatch[1].trim(),
            content: titleMatch[2].trim() || cleaned.replace(/\*\*.*?\*\*/, '').trim()
          });
        } else if (cleaned.length > 5 && !cleaned.includes('问诊清单') && !cleaned.includes('##')) {
          items.push({
            title: `关注问题 ${items.length + 1}`,
            content: cleaned.replace(/\*\*/g, '').trim()
          });
        }
      }
    }

    // Incorporate custom questions saved by user from Wiki encyclopedia
    if (typeof window !== "undefined") {
      try {
        const savedCustom = localStorage.getItem("oncopath_clinic_questions");
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          if (Array.isArray(parsed)) {
            parsed.forEach((customItem: any) => {
              if (customItem && customItem.question) {
                // Prevent duplicates
                const exists = items.some((it) => it.content === customItem.question);
                if (!exists) {
                  items.push({
                    title: customItem.title ? `[百科] ${customItem.title}` : "百科关注疑问",
                    content: customItem.question,
                  });
                }
              }
            });
          }
        }
      } catch (e) {
        console.error("Failed to load custom clinic questions from wiki", e);
      }
    }

    if (items.length === 0) {
      return [
        { title: "随访影像规划", content: "请教主治医生第一次胸部薄层 CT 推荐在术后第几个月复查？" },
        { title: "术后治疗评估", content: "请教医生是否确认属于早期规范根治，无需过度吃药与盲目基因检测？" },
        { title: "肺功能康复指导", content: "结合当前手术切除范围，术后呼吸训练与日常活动有哪些具体建议？" },
        { title: "异常警示信号", content: "术后出现哪些体征（如发热、胸痛、持续咳痰）需要及时回院复诊？" }
      ];
    }

    return items;
  };

  const checklistItems = extractChecklistItems(reportMarkdown);


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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const reportRes = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
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
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        // 1. Fetch Profile from API/DB (supports both logged-in account and guest)
        const res = await fetch('/api/profile?userId=' + getGuestId(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        
        if (!data.profile) {
          setError("未找到患者档案，请先在档案页录入或上传病理/CT报告。");
          return;
        }
        
        const fetchedProfile = data.profile;
        setProfile(fetchedProfile);
        setError("");

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

    const handleAuthChange = () => {
      hasLoadedRef.current = false;
      loadData();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportImage = async () => {
    if (!consultationCardRef.current || isExportingImage) return;
    try {
      setIsExportingImage(true);

      // Fast, lightweight, pixel-perfect render of the Consultation Pocket Card (560px)
      let imgData = "";
      try {
        imgData = await toPng(consultationCardRef.current, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: "#0f172a",
          cacheBust: true,
        });
      } catch (primaryErr) {
        console.warn("Primary html-to-image engine hit error, trying html2canvas fallback:", primaryErr);
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(consultationCardRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#0f172a",
          logging: false,
        });
        imgData = canvas.toDataURL("image/png");
      }

      if (imgData) {
        setExportedImageUrl(imgData);
      } else {
        throw new Error("未能生成图片数据");
      }
    } catch (err: any) {
      console.error("Failed to generate report image:", err);
      alert("生成问诊卡遇到浏览器限制，请长按文本复制或直接点击'导出PDF'。");
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadImage = () => {
    if (!exportedImageUrl) return;
    const link = document.createElement("a");
    link.href = exportedImageUrl;
    link.download = `OncoPath_门诊就医问诊便签卡_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function copyTextSafe(text: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        console.warn("navigator.clipboard failed, falling back to execCommand", e);
      }
    }

    // Fallback for non-HTTPS / iOS Safari / in-app WebViews
    return new Promise((resolve) => {
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
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        resolve(successful);
      } catch (err) {
        console.error("Fallback copy failed:", err);
        resolve(false);
      }
    });
  }

  const handleCopyChecklist = async () => {
    if (!reportMarkdown) return;

    // Comprehensive regex extraction for Section 3 (Consultation checklist)
    const section3Match = 
      reportMarkdown.match(/##?\s*(?:3[\.\s、]|三[\.\s、]|【向[^】]*问诊清单[^】]*】)[\s\S]*?(?=##?\s*(?:4[\.\s、]|四[\.\s、]|$))/i) ||
      reportMarkdown.match(/##?\s*3[\s\S]*?(?=##?\s*4|$)/) ||
      reportMarkdown.match(/【向[^】]*问诊清单】[\s\S]*?(?=##?\s*\d|$)/);

    let textToCopy = "";
    if (section3Match) {
      textToCopy = section3Match[0].trim();
    } else {
      textToCopy = reportMarkdown;
    }

    const success = await copyTextSafe(textToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } else {
      alert("复制遇到浏览器限制，请长按文本手动选择复制。");
    }
  };

  // Safe Clinical Helpers for Consultation Pocket Card Export
  const isFemale = (profile?.gender as string) === 'female' || (profile?.sex as string) === 'female' || (profile?.gender as string) === '女' || (profile?.sex as string) === '女';
  const genderText = isFemale ? '女性' : '男性';

  const surgeryText = 
    profile?.currentStage === 'evaluation' || profile?.currentStage === 'discovery' || profile?.surgeryType === 'unknown' ? '尚未手术 / 动态随访' :
    profile?.surgeryType === 'segmentectomy' ? '解剖性肺段切除' :
    profile?.surgeryType === 'lobectomy' ? '标准肺叶切除' :
    profile?.surgeryType === 'wedge' ? '肺楔形切除' :
    profile?.surgeryType || '根治性切除';

  const isStasSafe = profile?.stas === 'negative' || (profile?.stas as any) === false;
  const isLviSafe = profile?.lvi === 'negative' || (profile?.lvi as any) === false;
  const isVpiSafe = profile?.vpi === 'negative' || (profile?.vpi as any) === false;
  const isMarginSafe = profile?.margin === 'negative' || profile?.marginStatus === 'negative' || (profile?.margin as any) === false;
  const isN0Safe = profile?.nStage === 'N0' || !profile?.nStage || profile?.nStage === 'N?' || profile?.lymphNodes === 'N0';
  const isGrade3 = profile?.iaslcGrade === '3' || profile?.grade === '3';
  const isAllSafe = isStasSafe && isLviSafe && isVpiSafe && isN0Safe && isMarginSafe && !isGrade3;

  const riskLabel = profile?.currentStage === 'evaluation' || profile?.currentStage === 'discovery'
    ? (profile?.riskLevel === 'high' ? '⚡ 建议胸外科微创评估' : '🌱 建议随访观察 (低危)')
    : (isAllSafe ? '🌱 早期低复发风险组' : '⚡ 需积极辅助治疗');

  const tumorVal = profile?.tumorSize != null ? profile.tumorSize : 2.5;
  const solidVal = profile?.solidSize != null ? profile.solidSize : 0.8;
  const calculatedCtr = profile?.ctr != null ? profile.ctr : (tumorVal > 0 ? Math.round((solidVal / tumorVal) * 100) / 100 : 0.32);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-8 sm:pb-12 print:bg-white print:pb-0 text-slate-900">
      
      {/* Centered Floating Toast Notification for Copied */}
      {copied && (
        <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/95 backdrop-blur-md text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700/80 text-xs sm:text-sm max-w-[90vw] sm:max-w-md text-center pointer-events-none transition-all">
          <span className="text-emerald-400 font-bold text-base flex-shrink-0">✓</span>
          <span className="leading-snug">门诊问诊清单已成功复制到剪贴板！可直接粘贴至微信或备忘录。</span>
        </div>
      )}

      {/* Floating Island Navigation Header */}
      <div className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-2 sm:px-6 pointer-events-none print:hidden">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-2.5 sm:px-6 py-2 sm:py-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 transition-all pointer-events-auto gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 min-w-0">
            <Link 
              href="/profile" 
              className="text-xs sm:text-sm font-bold text-slate-600 hover:text-accent-blue transition-colors px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 whitespace-nowrap flex-shrink-0"
            >
              <span className="sm:hidden">返回</span>
              <span className="hidden sm:inline">返回档案</span>
            </Link>
            <div className="w-px h-3.5 sm:h-4 bg-slate-200 flex-shrink-0"></div>
            <div className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 whitespace-nowrap flex-shrink-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isGenerating ? 'bg-amber-500 animate-ping' : 'bg-accent-teal animate-pulse'}`} />
              <span className="sm:hidden">循证报告</span>
              <span className="hidden sm:inline">专属深度循证解读报告</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Link
              href="/knowledge"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50/80 hover:bg-teal-100/90 border border-teal-200 transition-all shadow-2xs group whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                <circle cx="6" cy="6" r="3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="18" cy="18" r="3" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.75" />
                <circle cx="18" cy="6" r="2.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.75" />
                <path d="M8.5 7h7M18 8.5v7M8.5 7.5l7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span>4D图谱</span>
            </Link>

            {!isGenerating && (
              <>
                <button
                  onClick={handleExportImage}
                  disabled={isExportingImage}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-teal-800 bg-teal-50/90 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer shadow-2xs group whitespace-nowrap disabled:opacity-50"
                  title="生成门诊就医问诊便签卡"
                >
                  {isExportingImage ? (
                    <>
                      <svg className="animate-spin h-3 w-3 sm:h-3.5 sm:w-3.5 text-teal-600 flex-shrink-0" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="sm:hidden">生成中</span>
                      <span className="hidden sm:inline">生成中...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600 transition-transform group-hover:scale-110 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="sm:hidden">问诊卡</span>
                      <span className="hidden sm:inline">导出问诊卡</span>
                    </>
                  )}
                </button>

                <button 
                  onClick={handlePrint}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer group whitespace-nowrap"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:-translate-y-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9V4a1 1 0 011-1h10a1 1 0 011 1v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    <rect x="3" y="9" width="18" height="9" rx="2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.75" />
                    <path d="M7 14h10M7 18h10v3H7v-3z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="sm:hidden">PDF</span>
                  <span className="hidden sm:inline">导出 / 打印PDF</span>
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      <div id="report-printable-area" ref={reportContainerRef} className="max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-22 print:pt-0 print:px-0">
        
        {/* Professional Clinical Report Brand Header (Visible in Exported Long Image & Print) */}
        <div className="hidden print:flex items-center justify-between pb-3 mb-4 border-b border-slate-200 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-black text-blue-700 text-sm tracking-tight">OncoPath</span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-700">肺癌循证医学决策系统 · 临床专属循证解读报告</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            报告时间: {new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>

        {/* Smart Cache Notification Banner (Clean & Informative) */}
        {isLoadedFromCache && !isGenerating && (
          <div className="mb-4 p-3 sm:p-3.5 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50/70 to-teal-50/50 border border-sky-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-600 print:hidden">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
                <path d="M14 3v5h5M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span>
                已载入您的专属深度循证解读报告
                {cachedTime && <span className="font-semibold text-sky-800 ml-1 bg-sky-100/80 px-1.5 py-0.5 rounded-md">生成于 {cachedTime}</span>}
              </span>
            </div>

            <Link
              href="/profile"
              className="self-end sm:self-center flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-white px-2.5 py-1 rounded-lg border border-sky-200 shadow-2xs hover:bg-sky-50 transition-all cursor-pointer"
            >
              <span>若指标有更新，前往档案修改</span>
            </Link>
          </div>
        )}

        {/* Patient Clinical Overview Hero Card */}
        {profile && (
          <div className="bg-white rounded-2xl p-3.5 sm:p-5 md:p-6 border border-slate-200 shadow-sm mb-5 print:border-none print:shadow-none print:mb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900">
                    {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging'
                      ? (profile.stage ? `c${profile.stage} 期肺结节 (CT 影像初估)` : '早期肺结节 (待病理确诊)')
                      : (profile.stage ? `${profile.stage} 期原发性肺腺癌` : '早期原发性肺腺癌')
                    }
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-black">
                    {profile.tStage || "T1a"}{profile.nStage || "N0"}{profile.mStage || "M0"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {profile.age || 55} 岁 · {profile.sex === 'female' ? '女性' : '男性'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging'
                      ? `结节部位: ${profile.noduleLocation || '肺部结节'} (尚未手术)`
                      : (profile.surgeryType === 'lobectomy' ? '标准肺叶切除' : profile.surgeryType === 'segmentectomy' ? '解剖性肺段切除' : profile.surgeryType || '手术切除')
                    }
                  </span>
                </div>
                {profile.solidSize != null && (
                  <div className="text-[11px] sm:text-[12px] text-slate-500 mt-1">
                    📏 磨玻璃最大径: {profile.tumorSize || 1.5} cm · CT 实性成分: <strong className="text-teal-700">{profile.solidSize} cm</strong> (CTR: {profile.ctr ?? (profile.solidSize && profile.tumorSize ? Math.round((profile.solidSize / profile.tumorSize) * 100) / 100 : 0.53)})
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden md:inline">
                  {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging' ? '恶性风险:' : '风险评级:'}
                </span>
                <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold ${
                  profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging'
                    ? (profile.riskLevel === 'high' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200')
                    : (profile.nStage === 'N2' || profile.stas === 'positive' || (profile.stas as any) === true
                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200')
                }`}>
                  {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging'
                    ? (profile.riskLevel === 'high' ? '⚡ 需胸外科微创评估' : '🌱 早期随访观察')
                    : (profile.nStage === 'N2' || profile.stas === 'positive' || (profile.stas as any) === true ? '⚡ 需积极辅助治疗' : '🌱 早期低风险随访')
                  }
                </span>
              </div>
            </div>

            {/* CT Matrix vs Pathology Matrix */}
            {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging' ? (
              <div className="mt-3 sm:mt-4 pt-1">
                <div className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <span>🩻 关键影像学评估矩阵</span>
                  <span className="text-slate-400 font-normal text-[10px] sm:text-[11px]">(基于薄层 CT 恶性征象与实性占比)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MatrixBadge 
                    label="结节形态" 
                    value={profile.noduleType === 'pure_ggo' ? '纯磨玻璃(pGGO)' : profile.noduleType === 'pure_solid' ? '纯实性结节' : '混合磨玻璃(mGGO)'} 
                    type={profile.noduleType === 'pure_solid' ? 'warning' : 'safe'}
                  />
                  <MatrixBadge 
                    label="实性占比 (CTR)" 
                    value={profile.solidSize != null ? `实性 ${profile.solidSize}cm (${Math.round((profile.ctr ?? 0.53)*100)}%)` : '微量实性'} 
                    type={(profile.ctr ?? 0.53) > 0.5 ? 'warning' : 'safe'}
                  />
                  <MatrixBadge 
                    label="高危影像征象" 
                    value={
                      profile.imagingFeatures && profile.imagingFeatures.length > 0
                        ? profile.imagingFeatures.slice(0, 2).join(' / ')
                        : '边缘光滑'
                    } 
                    type={profile.imagingFeatures && profile.imagingFeatures.length > 0 ? 'warning' : 'safe'}
                  />
                  <MatrixBadge 
                    label="Fleischner 指南" 
                    value={(profile.ctr ?? 0.53) >= 0.5 ? 'MDT多学科评估' : '3~6个月薄层CT'} 
                    type={(profile.ctr ?? 0.53) >= 0.5 ? 'warning' : 'safe'}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-1">
                <div className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>🚦 关键病理红绿灯矩阵</span>
                    <span className="text-slate-400 font-normal text-[11px]">(决定预后与辅助治疗的核心指标)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">6项标准化病理特征</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <MatrixBadge 
                    label="切缘状态" 
                    value={profile.margin === 'positive' || profile.marginStatus === 'positive' || (profile.margin as any) === true ? '阳性(有残留)' : '阴性(R0安全)'} 
                    type={profile.margin === 'positive' || profile.marginStatus === 'positive' || (profile.margin as any) === true ? 'danger' : 'safe'}
                  />
                  <MatrixBadge 
                    label="淋巴结状态" 
                    value={profile.nStage === 'N0' || !profile.nStage ? 'N0 (无转移)' : profile.nStage === 'N1' ? 'N1 (肺门累及)' : profile.nStage === 'N2' ? 'N2 (纵隔转移)' : profile.nStage} 
                    type={profile.nStage === 'N0' || !profile.nStage ? 'safe' : profile.nStage === 'N1' ? 'warning' : 'danger'}
                  />
                  <MatrixBadge 
                    label="胸膜侵犯 (VPI)" 
                    value={profile.vpi === 'positive' || (profile.vpi as any) === true ? 'PL1/PL2 (阳性高危)' : 'PL0 (未侵犯)'} 
                    type={profile.vpi === 'positive' || (profile.vpi as any) === true ? 'warning' : 'safe'}
                  />
                  <MatrixBadge 
                    label="气道播散 (STAS)" 
                    value={profile.stas === 'positive' || (profile.stas as any) === true ? '阳性 (高危)' : '阴性 (安全)'} 
                    type={profile.stas === 'positive' || (profile.stas as any) === true ? 'warning' : 'safe'}
                  />
                  <MatrixBadge 
                    label="脉管癌栓 (LVI)" 
                    value={profile.lvi === 'positive' || (profile.lvi as any) === true ? '阳性 (高危)' : '阴性 (安全)'} 
                    type={profile.lvi === 'positive' || (profile.lvi as any) === true ? 'warning' : 'safe'}
                  />
                  <MatrixBadge 
                    label="IASLC 病理分级" 
                    value={profile.iaslcGrade === '3' || profile.grade === '3' ? 'Grade 3 (低分化高危)' : profile.iaslcGrade === '1' || profile.grade === '1' ? 'Grade 1 (高分化)' : 'Grade 2 (中分化)'} 
                    type={profile.iaslcGrade === '3' || profile.grade === '3' ? 'warning' : 'safe'}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-800 p-6 rounded-3xl border border-rose-200 mb-6 print:hidden shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2 text-rose-900">
              <span>⚠️</span> 提示信息
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed">{error}</p>
            <div className="pt-1 flex items-center gap-3 flex-wrap">
              <Link
                href="/profile"
                className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>📋 前往患者临床档案页 ➔</span>
              </Link>
              {profile && (
                <button
                  onClick={() => startGeneratingReport(profile)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-rose-100/60 text-rose-700 font-bold border border-rose-300 transition-colors text-xs cursor-pointer"
                >
                  🔄 重新尝试生成报告
                </button>
              )}
            </div>
          </div>
        )}

        {/* Report Content Main Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[260px] print:border-none print:shadow-none print:m-0 print:p-0">
          
          {/* Top Decorative Gradient Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent-blue via-accent-teal to-accent-blue print:hidden" />
          
          <div className="p-3.5 sm:p-7 md:p-9 print:p-0">
            {!reportMarkdown && isGenerating && (
              <div className="py-4 print:hidden">
                <ReasoningTicker isGenerating={isGenerating} />
              </div>
            )}

            
            {/* Custom Enhanced Medical ReactMarkdown Rendering Engine */}
            <div className="prose prose-slate max-w-none 
              prose-headings:font-bold prose-headings:text-slate-900
              prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-[15px]
              prose-strong:text-slate-900 prose-strong:font-bold
              print:prose-p:text-black print:prose-headings:text-black print:text-sm"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, children, ...props }) => {
                    const text = String(children || "");
                    const isChecklist = text.includes("问诊清单") || text.includes("就医便签") || text.includes("3.");
                    return (
                      <div className="mt-7 mb-4 pt-3 border-t border-slate-100 first:border-none first:pt-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/90 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80">
                          <h2 className="flex items-center gap-2 text-slate-900 font-extrabold text-base sm:text-lg md:text-xl tracking-tight m-0" {...props}>
                            {children}
                          </h2>
                          {isChecklist && (
                            <button
                              type="button"
                              onClick={handleCopyChecklist}
                              className="self-start sm:self-center flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer print:hidden"
                            >
                              <span>📋 一键复制此问诊清单</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  },
                  h3: ({ node, ...props }) => (
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mt-6 mb-2 flex items-center gap-1.5" {...props} />
                  ),
                  blockquote: ({ node, children, ...props }) => {
                    const contentStr = String(children || "");
                    const isSummary = contentStr.includes("核心研判") || contentStr.includes("🌟") || contentStr.includes("Executive Summary");
                    const isDisclaimer = contentStr.includes("免责声明") || contentStr.includes("🛡️");
                    const isWarning = contentStr.includes("警示信号") || contentStr.includes("🚨") || contentStr.includes("提前返院");

                    if (isSummary) {
                      return (
                        <div className="my-6 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/80 to-sky-50 border-2 border-teal-300 shadow-sm text-slate-900">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 mb-2">
                            <span className="text-base">🌟</span>
                            <span>专家组核心研判 · 一句话全景省流</span>
                          </div>
                          <div className="text-sm md:text-[15px] font-medium leading-relaxed text-slate-800">
                            {children}
                          </div>
                        </div>
                      );
                    }

                    if (isWarning) {
                      return (
                        <div className="my-6 p-4 md:p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs text-rose-950">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5">
                            <span>🚨</span>
                            <span>需提前返院检查的警示信号</span>
                          </div>
                          <div className="text-sm leading-relaxed text-rose-900 font-medium">
                            {children}
                          </div>
                        </div>
                      );
                    }

                    if (isDisclaimer) {
                      return (
                        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-2xs">
                          {children}
                        </div>
                      );
                    }

                    return (
                      <blockquote className="bg-blue-50/70 border-l-4 border-blue-500 rounded-r-xl p-4 my-4 text-slate-800 not-italic shadow-xs text-sm" {...props}>
                        {children}
                      </blockquote>
                    );
                  },
                  ul: ({ node, ...props }) => (
                    <ul className="space-y-2 my-3 pl-1 list-none" {...props} />
                  ),
                  li: ({ node, children, className, ...props }) => {
                    const isTaskListItem = className?.includes('task-list-item') || Boolean(node?.children?.some((c: any) => c.tagName === 'input'));
                    if (isTaskListItem) {
                      return (
                        <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all my-2.5 shadow-2xs group" {...props}>
                          <div className="flex-1 text-sm md:text-[15px] text-slate-800 leading-relaxed font-medium">{children}</div>
                        </li>
                      );
                    }
                    return (
                      <li className="flex items-start gap-2.5 text-sm md:text-[15px] text-slate-700 leading-relaxed my-1.5" {...props}>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <div className="flex-1">{children}</div>
                      </li>
                    );
                  },
                  input: ({ node, ...props }) => {
                    if (props.type === 'checkbox') {
                      return (
                        <input 
                          type="checkbox" 
                          defaultChecked={props.checked}
                          className="w-4 h-4 rounded-md text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600 mt-1 flex-shrink-0" 
                        />
                      );
                    }
                    return <input {...props} />;
                  },
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-5 rounded-2xl border border-slate-200 shadow-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-sm" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-slate-100/80" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-4 py-3 border-t border-slate-100 text-slate-700" {...props} />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="my-6 border-slate-200" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong className="font-bold text-slate-900 bg-amber-50/90 text-amber-950 px-1 py-0.5 rounded" {...props} />
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
            
            <div ref={contentEndRef} className="h-0.5 print:hidden" />
          </div>
        </div>

      </div>

      {/* Dedicated Consultation Pocket Card Container (Fixed 560px for Instant Pixel-Perfect 2x Export) */}
      <div
        style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '560px' }}
        aria-hidden="true"
      >
        <div
          ref={consultationCardRef}
          className="w-[560px] bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-700/80 relative overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                OP
              </div>
              <div>
                <div className="text-xs font-black tracking-wider text-white">OncoPath · 肺癌循证决策系统</div>
                <div className="text-[10px] text-slate-400">门诊就医问诊便签卡 · 医患高效协同</div>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {new Date().toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>

          {/* Patient Overview & Clinical Parameters */}
          {profile && (
            <div className="mb-4 bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700/80 relative z-10 space-y-2.5">
              {/* Row 1: Age, Gender, Stage, TNM */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-black text-white">
                    {profile.age || 55}岁 · {genderText}
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    · {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.reportType === 'ct_imaging'
                        ? (profile.stage ? `c${profile.stage} 期肺结节` : '早期肺结节')
                        : (profile.stage ? `${profile.stage} 期原发性肺腺癌` : '早期原发性肺腺癌')
                      }
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-black">
                  {profile.tStage || "T1a"}{profile.nStage || "N0"}{profile.mStage || "M0"}
                </span>
              </div>

              {/* Row 2: Surgery Type & Risk Rating */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs pt-1 border-t border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">手术术式:</span>
                  <span className="font-bold text-white bg-slate-700/80 px-2 py-0.5 rounded-md border border-slate-600/50">
                    {surgeryText}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">风险评级:</span>
                  <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] border ${isAllSafe ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                    {riskLabel}
                  </span>
                </div>
              </div>

              {/* Row 3: CT Tumor Size & CTR Calculation */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60 text-xs flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span>📏</span>
                  <span><strong>磨玻璃最大径</strong>: {tumorVal} cm · <strong>CT 实性成分</strong>: {solidVal} cm</span>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-400/30 font-mono font-bold text-[11px]">
                  CTR: {calculatedCtr}
                </span>
              </div>

              {/* Row 4: 6 Core Pathology Indicators Pills */}
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <div className="bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">切缘状态</span>
                  <span className={`font-bold ${!isMarginSafe ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {!isMarginSafe ? '阳性(残留)' : '阴性(R0)'}
                  </span>
                </div>
                <div className="bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">淋巴结分期</span>
                  <span className={`font-bold ${isN0Safe ? 'text-emerald-400' : profile.nStage === 'N1' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {profile.nStage || 'N0 (无)'}
                  </span>
                </div>
                <div className="bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">胸膜侵犯</span>
                  <span className={`font-bold ${!isVpiSafe ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {!isVpiSafe ? 'PL1/2 (阳性)' : 'PL0 (阴性)'}
                  </span>
                </div>
                <div className="bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">气道播散</span>
                  <span className={`font-bold ${!isStasSafe ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {!isStasSafe ? '阳性(高危)' : '阴性(-)'}
                  </span>
                </div>
                <div className="bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">脉管瘤栓</span>
                  <span className={`font-bold ${!isLviSafe ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {!isLviSafe ? '阳性(高危)' : '阴性(-)'}
                  </span>
                </div>
                <div className="bg-slate-900/90 px-2 py-1.5 rounded-lg border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">病理分级</span>
                  <span className={`font-bold ${isGrade3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isGrade3 ? 'G3(低分化)' : profile.iaslcGrade === '1' || profile.grade === '1' ? 'G1(高分化)' : 'G2(中分化)'}
                  </span>
                </div>
              </div>

              {/* Row 5: Ki-67 Strip if available */}
              {profile.ki67 != null && profile.ki67 !== "" && (
                <div className="bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-800/50 flex items-center justify-between text-[11px]">
                  <span className="text-purple-300 text-[10px]">🔬 Ki-67 细胞增殖指数</span>
                  <span className="font-bold text-purple-200">
                    {profile.ki67}%
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Section 3 Consultation Checklist Items */}
          <div className="space-y-2.5 mb-4 relative z-10">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>📋 向主管医生门诊咨询清单 (建议按序请教)</span>
            </div>

            {checklistItems.map((item, idx) => (
              <div key={idx} className="bg-slate-800/90 rounded-2xl p-3 border border-slate-700/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-white text-xs">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pl-7 font-normal">
                  {item.content}
                </p>
              </div>
            ))}
          </div>

          {/* Footer Tips & Evidence Citation */}
          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between relative z-10">
            <span className="flex items-center gap-1">
              <span>💡</span>
              <span>面诊时可直接出示本便签，高效表达关切</span>
            </span>
            <span className="text-slate-500 font-mono">
              NCCN · CSCO · IASLC
            </span>
          </div>
        </div>
      </div>

      {/* Image Export Preview Modal */}
      {exportedImageUrl && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="text-lg">🖼️</span>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  专属门诊问诊便签卡已生成
                </h3>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  高清 2x Retina
                </span>
              </div>
              <button
                onClick={() => setExportedImageUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tip banner for mobile users */}
            <div className="bg-amber-50/90 px-4 py-2.5 border-b border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
              <span className="text-sm flex-shrink-0">💡</span>
              <span>
                <strong>移动端/微信提示</strong>：在手机端可<strong>【长按图片】</strong>保存至相册或直接发送给主管医生与家属。
              </span>
            </div>

            {/* Scrollable Image Preview Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/70 flex justify-center items-start min-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={exportedImageUrl}
                alt="OncoPath 门诊就医问诊便签卡"
                className="w-full max-w-md rounded-2xl shadow-lg border border-slate-700/80 object-contain"
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
              <button
                onClick={() => setExportedImageUrl(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                关闭
              </button>
              <button
                onClick={handleDownloadImage}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 11l5 5 5-5M12 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>保存 / 下载问诊卡</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MatrixBadge({ label, value, type }: { label: string; value: string; type: 'safe' | 'warning' | 'danger' }) {
  const styles = {
    safe: 'bg-emerald-50/90 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50/90 text-amber-800 border-amber-200',
    danger: 'bg-rose-50/90 text-rose-800 border-rose-200'
  };

  return (
    <div className={`p-2.5 rounded-xl border ${styles[type]} flex flex-col justify-between transition-all shadow-xs`}>
      <span className="text-[11px] font-medium opacity-80 mb-1">
        <GlossaryTooltip term={label}>
          <span>{label}</span>
        </GlossaryTooltip>
      </span>
      <span className="text-xs font-bold flex items-center gap-1.5">
        {type === 'safe' && (
          <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M8.5 12.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {type === 'warning' && (
          <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M12 4L3 20h18L12 4z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
        {type === 'danger' && (
          <svg className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}
