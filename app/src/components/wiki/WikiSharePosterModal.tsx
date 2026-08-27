"use client";

import React, { useState, useRef, useEffect } from "react";

import { X, Download, Share2, Check, Sparkles, HeartPulse, ShieldCheck, BookOpen, HelpCircle } from "lucide-react";
import { toPng } from "html-to-image";
import type { WikiTopic } from "@/lib/wikiData";
import { RISK_LEVEL_CONFIG, WIKI_CATEGORIES } from "@/lib/wikiData";
import { ONCOPATH_LOGO_DATA_URI } from "@/lib/brandLogo";
import WikiTopicIcon from "./WikiTopicIcon";
import { WikiVisualRenderer } from "./WikiVisualRenderer";

interface WikiSharePosterModalProps {
  topic: WikiTopic;
  visualDomHtml?: string;
  onClose: () => void;
}

export default function WikiSharePosterModal({ topic, visualDomHtml, onClose }: WikiSharePosterModalProps) {

  const [isExporting, setIsExporting] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const offscreenPosterRef = useRef<HTMLDivElement>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const riskCfg = RISK_LEVEL_CONFIG[topic.riskLevel];
  const catCfg = WIKI_CATEGORIES[topic.category];

  const handleGenerateImage = async () => {
    if (!offscreenPosterRef.current || isExporting) return;
    try {
      setIsExporting(true);
      setGenerationError(null);

      const element = offscreenPosterRef.current;
      
      if (typeof document !== "undefined" && (document as any).fonts) {
        try {
          await (document as any).fonts.ready;
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 150));

      const fullWidth = 520;
      const fullHeight = element.scrollHeight;

      let imgData = "";
      try {
        imgData = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2,
          skipAutoScale: true,
          fontEmbedCSS: "",
          width: fullWidth,
          height: fullHeight,
          canvasWidth: fullWidth * 2,
          canvasHeight: fullHeight * 2,
          backgroundColor: "#0f172a",
          cacheBust: true,
          style: {
            position: "static",
            display: "block",
            overflow: "visible",
            maxHeight: "none",
            height: "auto",
            transform: "none",
          },
        });
      } catch (primaryErr) {
        console.warn("Primary html-to-image failed, trying html2canvas fallback:", primaryErr);
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#0f172a",
          logging: false,
          width: fullWidth,
          height: fullHeight,
          windowWidth: fullWidth,
          windowHeight: fullHeight,
          x: 0,
          y: 0,
          scrollY: 0,
        });
        imgData = canvas.toDataURL("image/png");
      }

      if (imgData) {
        setExportedImageUrl(imgData);
      } else {
        throw new Error("生成图片数据为空");
      }
    } catch (err: any) {
      console.error("Failed to generate full wiki share poster:", err);
      setGenerationError("生成微信分享长图遇到浏览器限制，请长按下方卡片文本或使用系统截图。");
    } finally {
      setIsExporting(false);
    }
  };

  // Automatically trigger image generation when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGenerateImage();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    if (!exportedImageUrl) return;
    const link = document.createElement("a");
    link.href = exportedImageUrl;
    link.download = `OncoPath_${topic.id}_${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      {/* 1. Offscreen Unconstrained Rendering Container (Never Clipped) */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: "520px",
          overflow: "visible",
          zIndex: -100,
          pointerEvents: "none",
        }}
      >
        <div
          ref={offscreenPosterRef}
          className="w-[520px] bg-slate-900 text-white rounded-3xl p-7 shadow-2xl border border-slate-800 space-y-5 font-sans relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ONCOPATH_LOGO_DATA_URI} alt="OncoPath Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wider text-white">OncoPath · 肺癌循证决策系统</div>
                <div className="text-[10px] text-slate-400">权威医学百科 · 100% 顶刊出处可溯</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {topic.subcategory || catCfg.label}
            </span>
          </div>

          {/* Title & Badge */}
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-md">
              <WikiTopicIcon icon={topic.icon} topicId={topic.id} size={24} />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <span>{riskCfg.label}</span>
              </div>
              <h2 className="text-xl font-black text-white leading-snug">
                {topic.title}
              </h2>
              {topic.subtitle && (
                <p className="text-[11px] text-slate-400 font-mono">
                  {topic.subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Section 1: Metaphor */}
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-100 space-y-1.5 leading-relaxed">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>生活比喻直观破译：</span>
            </div>
            <p className="text-[11px] leading-relaxed">{topic.metaphor}</p>
          </div>

          {/* Section 2: Visual Micro Diagram (权威医学视觉图解与征象模拟) */}
          {topic.visualComponent && (
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/70 p-3.5 overflow-hidden space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>视觉微观图解与影像征象推演</span>
                </span>
                <span className="text-[10px] text-slate-400">权威循证图谱</span>
              </div>
              {visualDomHtml ? (
                <div
                  className="w-full text-white"
                  dangerouslySetInnerHTML={{ __html: visualDomHtml }}
                />
              ) : (
                <div className="w-full">
                  <WikiVisualRenderer visualComponent={topic.visualComponent} />
                </div>
              )}
            </div>
          )}



          {/* Section 2: Clinical Truth */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
            <div className="font-bold text-sky-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>临床真相深度解读：</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-200 leading-relaxed">
              {topic.clinicalTruth.split("\n").map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith("• ") || trimmed.startsWith("· ")) {
                  return (
                    <div key={idx} className="flex items-start gap-1.5 pl-0.5">
                      <span className="text-sky-400 font-bold leading-none mt-0.5">•</span>
                      <span className="flex-1 text-slate-300">{trimmed.substring(2)}</span>
                    </div>
                  );
                }
                return <p key={idx} className="text-slate-300">{line}</p>;
              })}
            </div>
          </div>

          {/* Section 3: Tactics */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>现代医学精准拦截武器：</span>
            </div>
            <ul className="space-y-1.5 pl-0.5 text-[11px] text-slate-200">
              {topic.tactics.map((tactic, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span className="text-slate-300">{tactic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Key Evidence Metric */}
          {topic.keyMetric && (
            <div className="p-3.5 rounded-2xl bg-blue-950/50 border border-blue-500/40 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between text-blue-300 font-bold gap-2">
                <span>核心循证结论与依据：</span>
                <span className="text-[10px] text-blue-300 font-normal bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-500/30 truncate max-w-[200px]">{topic.keyMetric.label}</span>
              </div>
              <p className="text-xs font-bold text-white leading-relaxed">{topic.keyMetric.value}</p>
              <div className="text-[10px] text-slate-300 leading-relaxed pt-1 border-t border-blue-500/20">
                <span className="text-sky-400 font-medium">循证出处：</span>
                <span className="text-slate-200">{topic.keyMetric.source}</span>
              </div>
            </div>
          )}


          {/* Section 5: Top FAQ */}
          {topic.faq && topic.faq.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>患者高频疑问速答：</span>
              </div>
              {topic.faq.slice(0, 2).map((item, idx) => (
                <div key={idx} className="space-y-1 text-[11px] border-t border-slate-800/80 pt-1.5 first:border-0 first:pt-0">
                  <div className="font-bold text-sky-200">问：{item.question}</div>
                  <div className="text-slate-300 leading-relaxed">答：{item.answer}</div>
                </div>
              ))}
            </div>
          )}

          {/* Section 6: Reassurance Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-950/80 to-emerald-950/80 border border-teal-500/50 space-y-1.5 text-xs text-teal-100 leading-relaxed">
            <div className="font-bold text-teal-300 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-400 shrink-0" />
              <span>暖心定心丸：</span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-100">{topic.reassurance}</p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>© 2026 OncoPath · 严格同行评审临床证据库</span>
            <span>长按识别 / 扫码阅读完整临床指引</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Modal Dialog for User Inspection & Download */}
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col text-slate-900 animate-fade-in-up">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-blue" />
            <h3 className="text-sm font-bold text-slate-900">
              微信高清科普长图（2x 视网膜无损）
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto bg-slate-950 flex flex-col items-center">
          {isExporting && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-300 space-y-3">
              <span className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold">正在全量渲染高清长图，请稍候...</p>
            </div>
          )}

          {generationError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/50 text-xs text-rose-200 text-center">
              {generationError}
            </div>
          )}

          {exportedImageUrl && !isExporting && (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="w-full max-w-[460px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                <img
                  src={exportedImageUrl}
                  alt={topic.title}
                  className="w-full h-auto object-contain block"
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                💡 <strong>长图已全量生成完毕（无截断）</strong>：长按上方图片可直接存入相册或发送微信群。
              </p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            包含微观图解、生活比喻、临床真相、拦截武器、高频问答与暖心定心丸。
          </p>


          <div className="flex items-center gap-2 w-full sm:w-auto">
            {exportedImageUrl ? (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>保存图片至相册 / 本地</span>
              </button>
            ) : (
              <button
                onClick={handleGenerateImage}
                disabled={isExporting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>重新渲染长图</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
