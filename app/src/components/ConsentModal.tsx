"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShieldCheck, Lock, AlertCircle, FileCheck, Check } from "lucide-react";
import { ONCOPATH_LOGO_DATA_URI } from "@/lib/brandLogo";

interface ConsentModalProps {
  onConsentAccepted?: () => void;
}

export default function ConsentModal({ onConsentAccepted }: ConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem("oncopath_consent_v1");
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    if (!agreed) return;
    localStorage.setItem("oncopath_consent_v1", "true");
    setIsOpen(false);
    if (onConsentAccepted) {
      onConsentAccepted();
    }
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      {/* 3-Tier Window Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 animate-fade-in-up my-auto"
      >
        {/* Tier 1: Fixed Sticky Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 bg-slate-900 border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ONCOPATH_LOGO_DATA_URI} alt="OncoPath Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
              使用知情同意与医学免责声明
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>OncoPath 肺癌循证决策辅助系统 · 临床研究导航</span>
            </p>
          </div>
        </div>

        {/* Tier 2: Scrollable Body (flex-1) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 leading-normal font-medium space-y-1">
            <strong className="block text-blue-900 font-bold text-xs">欢迎使用 OncoPath。</strong>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              在您上传检查报告或建立临床数字档案前，请仔细阅读以下核心医学原则与数据隐私保护条款：
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block mb-0.5 text-xs sm:text-sm">
                  循证辅助定位 · 非独立医疗诊断
                </strong>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  本系统基于国际权威同行评审研究（如 JCOG0802、JCOG0804、ADAURA 等）及 AJCC/IASLC 分期指南提供群体统计学预后参考，<strong>不构成任何处方建议或独立临床诊断结论</strong>。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 block mb-0.5 text-xs sm:text-sm">
                  个体异质性 · 诊疗决策必须以主治医生为准
                </strong>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  肺部结节与肿瘤病理具有高度生物学异质性，任何复查周期调整、手术切除范围或靶向/化疗方案决策，均应在专科医生指导下结合全身实际情况综合制定。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900 block mb-0.5 text-xs sm:text-sm">
                  数据安全合规 (PDPA/PIPL) · 100% 本地脱敏与被遗忘权保护
                </strong>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                  系统采用去标识化处理（匿名访客标识），提取数据仅用于当前图谱演算与报告呈现，支持随时一键彻底注销与销毁，绝不用作商业大模型微调或第三方共享。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: Fixed Sticky Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-col gap-3 shrink-0 rounded-b-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.05)]">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 transition-colors cursor-pointer mt-0.5 shrink-0"
            />
            <span className="text-xs text-slate-700 leading-snug">
              我已完整阅读并知晓
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline hover:text-blue-800 mx-1">
                《用户服务协议与医疗免责声明》
              </a>
              及
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold underline hover:text-blue-800 mx-1">
                《隐私政策》
              </a>
              ，确认以知情参考为目的使用本系统
            </span>
          </label>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!agreed}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              agreed
                ? "btn-primary shadow-md cursor-pointer text-white active:scale-98"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {agreed ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>同意条款并进入系统</span>
              </>
            ) : (
              <span>请先勾选上方免责声明以进入</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
