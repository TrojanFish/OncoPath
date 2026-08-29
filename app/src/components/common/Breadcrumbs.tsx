"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * OncoPath 全局统一轻量面包屑导航组件
 * 提供标准结构：首页 / 一级分类 / 当前页面，支持快速回溯
 */
export default function Breadcrumbs({
  items,
  className = "",
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="页面位置导航"
      className={`flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap scrollbar-hide py-1 ${className}`}
    >
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-sky-600 transition-colors shrink-0"
        title="返回首页"
      >
        <Home className="w-3.5 h-3.5" />
        <span>首页</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-sky-600 transition-colors shrink-0"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`shrink-0 ${
                  isLast ? "text-slate-900 font-bold" : "text-slate-500"
                }`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
