"use client";

import React, { useState, useRef } from "react";
import { X, Download, Share2, Check, Sparkles, HeartPulse, ShieldCheck } from "lucide-react";
import { toPng } from "html-to-image";
import type { WikiTopic } from "@/lib/wikiData";
import { RISK_LEVEL_CONFIG, WIKI_CATEGORIES } from "@/lib/wikiData";

interface WikiSharePosterModalProps {
  topic: WikiTopic;
  onClose: () => void;
}

export default function WikiSharePosterModal({ topic, onClose }: WikiSharePosterModalProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  const riskCfg = RISK_LEVEL_CONFIG[topic.riskLevel];
  const catCfg = WIKI_CATEGORIES[topic.category];

  const handleGenerateImage = async () => {
    if (!posterRef.current || isExporting) return;
    try {
      setIsExporting(true);
      let imgData = "";
      try {
        imgData = await toPng(posterRef.current, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: "#0f172a",
          cacheBust: true,
        });
      } catch (primaryErr) {
        console.warn("Primary html-to-image failed, falling back to html2canvas:", primaryErr);
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(posterRef.current, {
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
      }
    } catch (err) {
      console.error("Failed to generate wiki share poster:", err);
      alert("生成微信分享图遇到浏览器限制，请长按文本复制或直接截图。");
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col text-slate-900 animate-fade-in-up">
        {/* Top Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-blue" />
            <h3 className="text-sm font-bold text-slate-900">
              生成 2x 视网膜高清微信科普长图
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Poster Scrollable Preview Area */}
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto bg-slate-950 flex flex-col items-center">
          {/* Offscreen / Printable Poster DOM Container */}
          <div
            ref={posterRef}
            className="w-full max-w-[500px] bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-5 relative font-sans overflow-hidden"
          >
            {/* Poster Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md">
                  OP
                </div>
                <div>
                  <div className="text-xs font-black tracking-wider text-white">OncoPath · 肺癌循证决策系统</div>
                  <div className="text-[10px] text-slate-400">权威医学百科 · 100% 顶刊出处可溯</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {catCfg.label}
              </span>
            </div>

            {/* Title & Badge */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <span>{riskCfg.label}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {topic.title}
              </h2>
              {topic.subtitle && (
                <p className="text-[11px] text-slate-400 font-mono">
                  {topic.subtitle}
                </p>
              )}
            </div>

            {/* Metaphor Box */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 space-y-1 leading-relaxed">
              <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <span>💡 通俗生活比喻：</span>
              </div>
              <p>{topic.metaphor}</p>
            </div>

            {/* Tactics Box */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>现代医学精准拦截武器：</span>
              </div>
              <ul className="space-y-1 pl-1 text-[11px] text-slate-300">
                {topic.tactics.slice(0, 3).map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reassurance Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-950/60 to-emerald-950/60 border border-teal-500/40 space-y-1 text-xs text-teal-200 leading-relaxed">
              <div className="font-bold text-teal-300 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
                <span>暖心定心丸：</span>
              </div>
              <p className="text-[11px]">{topic.reassurance}</p>
            </div>

            {/* Key Metric if present */}
            {topic.keyMetric && (
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span className="text-blue-300 font-bold">{topic.keyMetric.label}: {topic.keyMetric.value}</span>
                <span className="truncate max-w-[200px]">出处: {topic.keyMetric.source}</span>
              </div>
            )}

            {/* Footer Disclaimer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500">
              <span>© 2026 OncoPath 肿瘤循证决策导航</span>
              <span>长按识别 / 扫码阅读完整临床指引</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            已生成高分辨率 2x 视网膜图像，可保存至相册或直接发送到微信群。
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!exportedImageUrl ? (
              <button
                onClick={handleGenerateImage}
                disabled={isExporting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>正在渲染高清长图...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>生成高清微信长图</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>保存图片至本地</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
