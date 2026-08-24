"use client";

import React, { useState, useRef, useEffect } from "react";
import { BookOpen, ShieldCheck } from "lucide-react";
import { findGlossaryTerm, type GlossaryTerm } from "@/lib/glossaryData";

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
  className?: string;
  showBadge?: boolean;
}

export function GlossaryTooltip({ term, children, className = "", showBadge = false }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [termData, setTermData] = useState<GlossaryTerm | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const data = findGlossaryTerm(term);
    setTermData(data);
  }, [term]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!termData) {
    return <span className={className}>{children || term}</span>;
  }

  const categoryColors = {
    imaging: "bg-amber-50 text-amber-800 border-amber-200",
    pathology: "bg-purple-50 text-purple-800 border-purple-200",
    benign: "bg-emerald-50 text-emerald-800 border-emerald-200",
    biomarker: "bg-blue-50 text-blue-800 border-blue-200",
    staging: "bg-teal-50 text-teal-800 border-teal-200",
  };

  const badgeColor = categoryColors[termData.category] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1 cursor-pointer transition-all border-b border-dashed border-sky-400 hover:border-sky-600 hover:text-sky-700 font-medium ${className}`}
        title="点击查看临床大白话通俗释义与定心丸"
      >
        <span>{children || term}</span>
        {showBadge && (
          <span className="text-[10px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-normal">
            词典
          </span>
        )}
        <svg className="w-3 h-3 text-sky-500 opacity-70 inline-block" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8h.01M11 12h1v4h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Floating Popover Modal */}
      {isOpen && (
        <div 
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-84 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 text-left animate-in fade-in zoom-in-95 duration-150"
          style={{ maxWidth: "calc(100vw - 32px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">{termData.term}</h4>
                <div className="text-[10px] font-mono text-slate-400">{termData.enName}</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {termData.categoryLabel}
            </span>
          </div>

          {/* Body */}
          <div className="space-y-2 text-xs">
            <div>
              <div className="text-[11px] font-bold text-slate-700 mb-0.5">💡 大白话定义：</div>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100">
                {termData.summary}
              </p>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-700 mb-0.5">🔬 临床医学机制：</div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {termData.clinicalMeaning}
              </p>
            </div>

            {/* Reassurance Pill */}
            <div className="p-2.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-emerald-800 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>患者定心丸：</span>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                {termData.plainLanguageReassurance}
              </p>
            </div>
          </div>

          {/* Close button */}
          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              我知道了
            </button>
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
        </div>
      )}
    </span>
  );
}
