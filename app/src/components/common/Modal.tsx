"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  className?: string;
  hideHeader?: boolean;
}

/**
 * OncoPath 全局统一基础模态框容器
 * 统一 Z-Index (z-50)、毛玻璃背景、Escape 关闭监听、滚动条锁定与无障碍属性
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
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

      {/* 弹窗主体卡片 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${maxWidth} bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 shadow-2xl z-10 animate-fade-in-up text-slate-900 max-h-[92vh] flex flex-col my-auto overflow-hidden ${className}`}
      >
        {/* 顶部标题栏 */}
        {!hideHeader && (title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
            <div className="space-y-1 min-w-0 flex-1">
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
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer active:scale-95"
                aria-label="关闭弹窗"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* 弹窗内容区域 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
