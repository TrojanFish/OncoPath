"use client";

import React from "react";
import { Search, Calendar, FileText, Inbox, ShieldCheck, HelpCircle } from "lucide-react";

export interface EmptyStateProps {
  icon?: "search" | "calendar" | "file" | "inbox" | "shield" | React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

/**
 * OncoPath 全局统一医疗级空状态与缺省占位组件
 * 提供安抚性温和文案、高信赖青蓝图标背景与明确的操作指引
 */
export default function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  className = "",
  compact = false,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const iconClass = compact ? "w-6 h-6 text-sky-600" : "w-8 h-8 text-sky-600";

    switch (icon) {
      case "search":
        return <Search className={iconClass} />;
      case "calendar":
        return <Calendar className={iconClass} />;
      case "file":
        return <FileText className={iconClass} />;
      case "shield":
        return <ShieldCheck className={iconClass} />;
      case "inbox":
      default:
        return <Inbox className={iconClass} />;
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-4 shadow-xs ${
        compact ? "p-6 sm:p-8" : "p-8 sm:p-12 md:p-14"
      } ${className}`}
    >
      {/* 图标发光底座 */}
      <div
        className={`rounded-3xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center shadow-xs animate-fade-in ${
          compact ? "w-12 h-12" : "w-16 h-16"
        }`}
      >
        {renderIcon()}
      </div>

      {/* 标题与描述 */}
      <div className="space-y-1.5 max-w-md mx-auto">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          {title}
        </h4>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      {/* 行动按钮群 */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
