"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  className?: string;
  hideHeader?: boolean;
}

/**
 * OncoPath 全局统一基础模态框容器 (3-Tier Standard Architecture)
 * 1. 顶部 Header (固定吸顶)
 * 2. 中间 Body (flex-1 弹性滚动)
 * 3. 底部 Footer (实体纯白吸底操作栏)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-2xl",
  showCloseButton = true,
  className = "",
  hideHeader = false,
}: ModalProps) {
  // 监听 Escape 键自动关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 模态框打开时锁定底层页面滚动条，关闭时还原
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
    >
      {/* 标准高质感毛玻璃遮罩 */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 弹窗主体卡片 (3-Tier Structure) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-white rounded-3xl border border-slate-200 shadow-2xl z-10 animate-fade-in-up text-slate-900 max-h-[92vh] flex flex-col my-auto overflow-hidden ${className}`}
      >
        {/* Tier 1: 顶部标题栏 (固定吸顶) */}
        {!hideHeader && (title || showCloseButton) && (
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4 bg-white shrink-0">
            <div className="space-y-0.5 min-w-0 flex-1">
              {title && (
                <h3 id="modal-title" className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shrink-0 flex items-center justify-center cursor-pointer active:scale-95"
                aria-label="关闭弹窗"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Tier 2: 弹窗中间内容区域 (弹性滚动) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6">
          {children}
        </div>

        {/* Tier 3: 底部吸底操作栏 (实体纯白固定) */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 bg-white shrink-0 rounded-b-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.05)] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
