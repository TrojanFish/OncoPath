"use client";

import React from "react";
import { FileText, Volume2, ArrowUp, Sparkles, Share2 } from "lucide-react";

import { showToast } from "./Toast";

interface MobileStickyActionBarProps {
  onTriggerSpeech?: () => void;
  onShare?: () => void;
  isSpeaking?: boolean;
}

export default function MobileStickyActionBar({
  onTriggerSpeech,
  onShare,
  isSpeaking = false,
}: MobileStickyActionBarProps) {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (typeof window !== "undefined") {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: "OncoPath 循证分析报告", url });
      } else {
        navigator.clipboard.writeText(url).then(() => showToast("✓ 页面链接已复制，可分享给家属或医生", "success"));
      }
    }
  };

  return (
    <aside
      aria-label="移动端快捷操作栏"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg shadow-slate-900/10 flex items-center justify-between gap-2 print:hidden"
    >
      {/* 分享报告主按钮 */}
      <button
        type="button"
        onClick={handleShare}
        className="flex-1 btn-primary py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale(0.97)"
      >
        <Share2 className="w-3.5 h-3.5" />
        <span>分享报告</span>
      </button>

      {/* 语音朗读按钮 */}
      {onTriggerSpeech && (
        <button
          type="button"
          onClick={onTriggerSpeech}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 active:scale(0.97) ${
            isSpeaking
              ? "bg-sky-50 text-sky-700 border-sky-300"
              : "bg-white text-slate-700 border-slate-200"
          }`}
          title="语音朗读报告"
        >
          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
          <span className="hidden xs:inline">{isSpeaking ? "播报中" : "朗读"}</span>
        </button>
      )}

      {/* 回到顶部 */}
      <button
        type="button"
        onClick={scrollToTop}
        className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 active:scale(0.97)"
        title="返回顶部"
        aria-label="返回顶部"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </aside>
  );
}
