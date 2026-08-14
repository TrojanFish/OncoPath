"use client";

import React, { useState, useEffect } from "react";

interface ConsentModalProps {
  onConsentAccepted?: () => void;
}

export default function ConsentModal({ onConsentAccepted }: ConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-blue-50/50 to-teal-50/50">
          <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-accent-blue flex items-center justify-center text-xl flex-shrink-0">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">使用知情同意与医学免责声明</h2>
            <p className="text-xs text-text-secondary">OncoPath 循证肿瘤医学导航平台</p>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-normal">
            <strong>欢迎使用 OncoPath。</strong> 在您上传病理报告或建立癌症档案前，请仔细阅读以下医学原则与安全条款：
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-gray-900 block mb-0.5">循证辅助定位，非医疗诊断</strong>
                <p className="text-xs text-text-secondary">
                  本系统基于国际已发表的同行评审研究（如 JCOG0804、ADAURA 等）及 AJCC/IASLC 分期指南提供群体统计预后参考，<strong>不构成任何处方建议或临床诊断结论</strong>。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-gray-900 block mb-0.5">决策必须以主治医生为准</strong>
                <p className="text-xs text-text-secondary">
                  肿瘤病理具有高度异质性，任何随访检查周期调整或辅助靶向/化疗方案决策，均应在专科医生指导下结合全身情况进行。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-gray-900 block mb-0.5">隐私与数据安全保护</strong>
                <p className="text-xs text-text-secondary">
                  系统采用去标识化处理（匿名访客标识），提取数据仅用于当前图谱演算与报告生成，严禁用于商业大模型微调或第三方数据转让。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Consent Checkbox */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded text-accent-blue focus:ring-accent-blue border-gray-300 transition-colors cursor-pointer"
            />
            <span className="text-xs text-gray-700 font-medium">
              我已完整阅读并知晓上述医学免责条款，确认以知情参考为目的使用本系统
            </span>
          </label>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleConfirm}
              disabled={!agreed}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                agreed
                  ? "btn-primary shadow-md cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              同意并进入平台
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
