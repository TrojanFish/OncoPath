"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

// Global Custom Event name
const TOAST_EVENT = "ONCOPATH_SHOW_TOAST";

/**
 * 全局触发 Toast 提示方法（无需 Context Provider 样板代码，任意组件或普通函数中均可直接调用）
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  duration: number = 3200
) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        message,
        type,
        duration,
      },
    });
    window.dispatchEvent(event);
  }
}

/**
 * 全局 Toast 渲染容器组件（挂载于 Root Layout）
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      if (customEvent.detail) {
        const newToast = customEvent.detail;
        setToasts((prev) => [...prev.slice(-3), newToast]); // 最多同时显示 4 条

        // 自动定时消失
        const duration = newToast.duration || 3200;
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, duration);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    return () => window.removeEventListener(TOAST_EVENT, handleToastEvent);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none max-w-[92vw] sm:max-w-md w-full"
    >
      {toasts.map((toast) => {
        const type = toast.type || "info";

        const typeStyles = {
          success: "bg-white text-slate-800 border-emerald-300 shadow-emerald-950/10",
          error: "bg-white text-slate-800 border-rose-300 shadow-rose-950/10",
          warning: "bg-white text-slate-800 border-amber-300 shadow-amber-950/10",
          info: "bg-white text-slate-800 border-sky-300 shadow-sky-950/10",
        };

        const iconStyles = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          info: <Info className="w-4 h-4 text-sky-600 shrink-0" />,
        };

        const badgeAccent = {
          success: "bg-emerald-50 text-emerald-800 border-emerald-200",
          error: "bg-rose-50 text-rose-800 border-rose-200",
          warning: "bg-amber-50 text-amber-800 border-amber-200",
          info: "bg-sky-50 text-sky-800 border-sky-200",
        };

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full p-3 sm:p-3.5 rounded-2xl border shadow-xl flex items-center justify-between gap-3 animate-fade-in-up bg-white/98 backdrop-blur-md transition-all ${typeStyles[type]}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className={`p-1.5 rounded-xl border shrink-0 ${badgeAccent[type]}`}>
                {iconStyles[type]}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug break-words">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              aria-label="关闭提示"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
