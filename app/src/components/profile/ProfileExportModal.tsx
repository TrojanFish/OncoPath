"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  HeartPulse, 
  Scan, 
  Ruler, 
  Microscope, 
  Activity, 
  Layers, 
  BrainCircuit, 
  Calendar,
  AlertTriangle,
  Sun,
  Apple
} from "lucide-react";
import { toPng } from "html-to-image";
import type { PatientProfile } from "@/lib/types";
import { getClinicalCohortForProfile } from "@/lib/staging";

interface ProfileExportModalProps {
  profile: PatientProfile;
  onClose: () => void;
}

export default function ProfileExportModal({ profile, onClose }: ProfileExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const offscreenPosterRef = useRef<HTMLDivElement>(null);

  const cohort = getClinicalCohortForProfile(profile);

  // Safe Factor Checks
  const isStasSafe = profile.stas === 'negative' || (profile.stas as any) === false;
  const isLviSafe = profile.lvi === 'negative' || (profile.lvi as any) === false;
  const isVpiSafe = profile.vpi === 'negative' || (profile.vpi as any) === false;
  const isMarginSafe = profile.margin === 'negative' || profile.marginStatus === 'negative' || (profile.margin as any) === false;
  const isN0Safe = profile.nStage === 'N0' || !profile.nStage || profile.nStage === 'N?' || profile.lymphNodes === 'N0';
  const isGrade3 = profile.iaslcGrade === '3' || profile.grade === '3';
  const isAllSafe = isStasSafe && isLviSafe && isVpiSafe && isN0Safe && isMarginSafe && !isGrade3;
  const isFemale = (profile.gender as string) === 'female' || (profile.sex as string) === 'female' || (profile.gender as string) === '女' || (profile.sex as string) === '女';
  const genderText = isFemale ? '女' : '男';

  const noduleLabel = profile.noduleType === 'pure_ggo' 
    ? '纯磨玻璃结节 (pGGO)' 
    : profile.noduleType === 'pure_solid' 
    ? '纯实性结节 (Solid)' 
    : '混合磨玻璃结节 (mGGO)';

  const currentDateStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).replace(/\//g, "-");

  const handleGenerateImage = async () => {
    if (!offscreenPosterRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setGenerationError(null);

      const element = offscreenPosterRef.current;
      await new Promise((r) => setTimeout(r, 200));

      let imgData = "";
      try {
        imgData = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2,
          cacheBust: true,
        });
      } catch (primaryErr) {
        console.warn("Primary html-to-image failed, trying html2canvas fallback:", primaryErr);
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#020617",
          logging: false,
        });
        imgData = canvas.toDataURL("image/png");
      }

      if (imgData) {
        setExportedImageUrl(imgData);
      } else {
        throw new Error("生成图片数据为空");
      }
    } catch (err: any) {
      console.error("Failed to generate profile export poster:", err);
      setGenerationError("生成长图遇到浏览器限制，请长按下方卡片或使用系统截图。");
    } finally {
      setIsExporting(false);
    }
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerateImage();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    if (!exportedImageUrl) return;
    const a = document.createElement("a");
    a.href = exportedImageUrl;
    a.download = `OncoPath-患者数字档案-${profile.stage || "临床"}-${currentDateStr}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                患者数字档案 · 循证全景高清速览卡
              </h2>
              <p className="text-[11px] text-slate-400">
                可保存为高清长图，便于门诊就医沟通或微信备份
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Image Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[360px]">
          {isExporting && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="text-xs font-bold text-slate-300">
                正在高保真渲染患者数字档案长图...
              </div>
              <div className="text-[11px] text-slate-500">
                已自动整合 T/N/M 临床分期、病理指标与 5 年生存率
              </div>
            </div>
          )}

          {generationError && (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-2xl text-rose-300 text-xs text-center space-y-2 max-w-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400 mx-auto" />
              <p>{generationError}</p>
            </div>
          )}

          {exportedImageUrl && !isExporting && (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl max-h-[60vh] overflow-y-auto">
                <img
                  src={exportedImageUrl}
                  alt="患者临床数字档案全景速览卡"
                  className="w-full h-auto object-contain rounded-2xl"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                💡 手机端可长按上方图片直接保存到相册；电脑端请点击下方下载按钮。
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            关闭
          </button>

          <button
            onClick={handleDownload}
            disabled={!exportedImageUrl || isExporting}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
              downloadSuccess 
                ? "bg-emerald-600 text-white" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20"
            }`}
          >
            {downloadSuccess ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>{downloadSuccess ? "已下载到本地" : "下载高清长图 (PNG)"}</span>
          </button>
        </div>
      </div>

      {/* OFFSCREEN DOM TO RENDER FOR HIGH RES POSTER (Fixed 560px Width, Beautiful Medical Dark Aesthetics) */}
      <div className="absolute left-[-9999px] top-[-9999px] pointer-events-none" aria-hidden="true">
        <div
          ref={offscreenPosterRef}
          className="w-[560px] text-white p-7 font-sans relative overflow-hidden"
          style={{
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e1b4b 100%)",
            boxSizing: "border-box",
            margin: 0,
          }}
        >

          {/* Subtle Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Brand */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-blue-500/30 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="OncoPath Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  <span>OncoPath Navigator</span>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-400/30">
                    循证医学
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  患者临床数字档案 · 循证全景速览卡
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono">
                档案生成日期
              </div>
              <div className="text-xs font-bold text-slate-200 font-mono">
                {currentDateStr}
              </div>
            </div>
          </div>

          {/* SECTION 1: Patient Basic Profile & Clinical Diagnosis */}
          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/70 mb-4 relative z-10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="text-sm font-extrabold text-white">
                  {(profile as any).name || "患者数字档案"}
                </div>
                <span className="text-[11px] text-slate-300 font-semibold px-2 py-0.5 bg-slate-700 rounded-md">
                  {profile.age || 58} 岁 · {genderText}性
                </span>

              </div>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                {profile.stage ? `${profile.stage} 期` : "早期原发灶"} ({profile.tStage || "T1"} {profile.nStage || "N0"} {profile.mStage || "M0"})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Scan className="w-3 h-3 text-sky-400" />
                  <span>结节形态与部位</span>
                </span>
                <div className="font-bold text-slate-200 text-[11px]">
                  {profile.noduleLocation || "肺部病灶"} · {noduleLabel.split(" ")[0]}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-teal-400" />
                  <span>结节全径与实性浸润</span>
                </span>
                <div className="font-bold text-slate-200 text-[11px]">
                  全径 {profile.tumorSize || 1.5} cm / 实性 {profile.solidSize != null ? `${profile.solidSize} cm` : "微小"} (CTR: {profile.ctr ?? 0.5})
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: 5-Year Survival Benchmark (Prognosis High-Light Card) */}
          <div className="bg-gradient-to-br from-blue-950/80 via-slate-900 to-teal-950/80 rounded-2xl p-4.5 border border-teal-500/40 mb-4 relative z-10 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span>SIMILAR CLINICAL COHORTS · 国际顶刊相似队列</span>
                </span>
                <div className="text-xs font-extrabold text-white mt-0.5">
                  匹配到 {cohort.cohortSize.toLocaleString()} 例特征相似的真实世界患者
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                {cohort.confidenceRating} {cohort.confidenceLevel.split(" ")[0]}
              </span>
            </div>

            {/* Large 2-Metric High-Gloss Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 bg-blue-900/40 rounded-xl border border-blue-500/40">
                <div className="text-[10px] text-blue-300 font-bold">5年无复发生存率 (RFS)</div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight my-0.5">
                  {cohort.rfs5Year}
                </div>
                <div className="text-[9px] text-blue-200/80">临床治愈与无瘤生存指标</div>
              </div>

              <div className="p-3.5 bg-emerald-900/40 rounded-xl border border-emerald-500/40">
                <div className="text-[10px] text-emerald-300 font-bold">5年总生存率 (OS)</div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight my-0.5">
                  {cohort.os5Year}
                </div>
                <div className="text-[9px] text-emerald-200/80">长期健在终极金标准</div>
              </div>
            </div>

            <div className="text-[10px] text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">文献来源：</span>
              <strong className="text-sky-300">{cohort.source}</strong> · {cohort.description}
            </div>
          </div>

          {/* SECTION 3: Micro Pathology & Invasive Factors Matrix */}
          <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/70 mb-4 relative z-10 space-y-2.5">
            <div className="text-xs font-bold text-purple-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5 text-purple-400" />
                <span>组织病理与浸润微观指标排查</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {profile.surgeryType ? (profile.surgeryType === 'segmentectomy' ? '解剖性肺段' : '根治术式') : '金标准'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400">切缘状态 (R0)</div>
                <div className={`font-bold text-[11px] mt-0.5 ${isMarginSafe ? "text-emerald-400" : "text-rose-400"}`}>
                  {isMarginSafe ? "R0 阴性安全" : "阳性"}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400">淋巴结 (N分期)</div>
                <div className={`font-bold text-[11px] mt-0.5 ${isN0Safe ? "text-emerald-400" : "text-amber-400"}`}>
                  {isN0Safe ? "N0 无转移" : profile.nStage}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400">胸膜侵犯 (VPI)</div>
                <div className={`font-bold text-[11px] mt-0.5 ${isVpiSafe ? "text-emerald-400" : "text-amber-400"}`}>
                  {isVpiSafe ? "PL0 未侵犯" : "阳性"}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400">气道播散 (STAS)</div>
                <div className={`font-bold text-[11px] mt-0.5 ${isStasSafe ? "text-emerald-400" : "text-amber-400"}`}>
                  {isStasSafe ? "阴性 / 无" : "阳性"}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400">脉管癌栓 (LVI)</div>
                <div className={`font-bold text-[11px] mt-0.5 ${isLviSafe ? "text-emerald-400" : "text-amber-400"}`}>
                  {isLviSafe ? "阴性 / 无" : "阳性"}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[9px] text-slate-400">IASLC 分级</div>
                <div className={`font-bold text-[11px] mt-0.5 ${isGrade3 ? "text-amber-400" : "text-emerald-400"}`}>
                  {profile.iaslcGrade ? `G${profile.iaslcGrade}` : "G1/G2"}
                </div>
              </div>
            </div>

            {profile.ki67 != null && profile.ki67 !== "" && (
              <div className="p-2 bg-purple-950/40 rounded-xl border border-purple-800/50 flex items-center justify-between text-[11px]">
                <span className="text-purple-300 font-semibold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-purple-400" />
                  <span>Ki-67 增殖指数：<strong>{profile.ki67}%</strong></span>
                </span>
                <span className="text-purple-200 text-[10px]">
                  {Number(profile.ki67) <= 5 ? "惰性分裂 · 极高预后安全性" : "常规代谢"}
                </span>
              </div>
            )}
          </div>

          {/* SECTION 4: Decision Engine Next Step */}
          <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/70 mb-4 relative z-10 flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <BrainCircuit className="w-3.5 h-3.5" />
            </div>
            <div className="space-y-0.5 text-xs">
              <div className="font-bold text-sky-300 text-[11px]">
                临床随访与行动建议：
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {profile.nextAction || profile.clinicalRecommendation || "建议遵医嘱于术后 6 个月复查胸部薄层 CT（层厚 ≤1mm），按指南规律随访即可。"}
              </p>
            </div>
          </div>

          {/* SECTION 5: Warm Empathy Banner & Disclaimer Footer */}
          <div className="bg-gradient-to-r from-amber-950/40 to-teal-950/40 rounded-2xl p-3 border border-amber-500/30 text-[10px] text-amber-200/90 leading-relaxed mb-4 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>温暖寄语：</strong>数据是群体的历史，而奇迹由您亲自书写。保持营养摄入与乐观从容的心态，享受充满生机的每一天。
            </span>
          </div>

          {/* Bottom Stamp & Disclaimer */}
          <div className="border-t border-slate-800/80 pt-3 text-[9px] text-slate-500 flex items-center justify-between relative z-10">
            <div>
              <span>免责声明：本卡片基于循证医学文献与个人录入报告生成，供就诊沟通参考。</span>
            </div>
            <div className="font-mono text-slate-400 font-bold">
              ONCOPATH-NAVIGATOR
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
