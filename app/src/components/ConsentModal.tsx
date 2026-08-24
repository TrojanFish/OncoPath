"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-blue-50/70 to-teal-50/70">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center flex-shrink-0 bg-white border border-slate-200">
            <img src="/logo.png" alt="OncoPath Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">使用知情同意与医学免责声明</h2>
            <p className="text-xs text-slate-500">OncoPath 循证肿瘤医学导航平台</p>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-normal font-medium">
            <strong>欢迎使用 OncoPath。</strong> 在您上传检查报告或建立临床数字档案前，请仔细阅读以下医学原则与安全条款：
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-slate-900 block mb-0.5">循证辅助定位，非医疗诊断</strong>
                <p className="text-xs text-slate-500">
                  本系统基于国际已发表的同行评审研究（如 JCOG0804、ADAURA 等）及 AJCC/IASLC 分期指南提供群体统计预后参考，<strong>不构成任何处方建议或临床诊断结论</strong>。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-slate-900 block mb-0.5">决策必须以主治医生为准</strong>
                <p className="text-xs text-slate-500">
                  肿瘤病理具有高度异质性，任何随访检查周期调整或辅助靶向/化疗方案决策，均应在专科医生指导下结合全身情况进行。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-slate-900 block mb-0.5">隐私与数据安全保护</strong>
                <p className="text-xs text-slate-500">
                  系统采用去标识化处理（匿名访客标识），提取数据仅用于当前图谱演算与报告生成，严禁用于商业大模型微调或第三方数据转让。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Consent Checkbox */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-accent-blue focus:ring-accent-blue border-slate-300 transition-colors cursor-pointer"
            />
            <span className="text-xs text-slate-700 font-medium">
              我已完整阅读并同意
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

          <div className="flex justify-end gap-3">
            <button
              onClick={handleConfirm}
              disabled={!agreed}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${
                agreed
                  ? "btn-primary shadow-md cursor-pointer"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              同意并进入平台
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
