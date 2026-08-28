import React from "react";

/**
 * 基础骨架块 (含医疗淡蓝微光扫描动画)
 */
export function SkeletonBlock({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      style={style}
    />
  );
}

/**
 * 循证报告页面专用骨架屏 (精准还原报告层级与四维病理卡片)
 */
export function ReportSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in-up">
      {/* 顶部标题与通俗定性结论卡 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <SkeletonBlock className="w-48 h-6" />
              <SkeletonBlock className="w-32 h-4" />
            </div>
          </div>
          <SkeletonBlock className="w-24 h-9 rounded-xl hidden sm:block" />
        </div>
        <SkeletonBlock className="w-full h-16 rounded-xl" />
      </div>

      {/* 四维临床病理指标栅格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
            <SkeletonBlock className="w-16 h-4" />
            <SkeletonBlock className="w-24 h-7" />
            <SkeletonBlock className="w-full h-3" />
          </div>
        ))}
      </div>

      {/* 核心分析正文区 */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <SkeletonBlock className="w-40 h-6" />
          <SkeletonBlock className="w-full h-4" />
          <SkeletonBlock className="w-5/6 h-4" />
          <SkeletonBlock className="w-4/6 h-4" />
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <SkeletonBlock className="w-full h-24 rounded-xl" />
            <SkeletonBlock className="w-full h-24 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
          <SkeletonBlock className="w-32 h-6" />
          <SkeletonBlock className="w-full h-12 rounded-xl" />
          <SkeletonBlock className="w-full h-12 rounded-xl" />
          <SkeletonBlock className="w-full h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/**
 * 国际研究与 PubMed 搜索结果列表专用骨架屏
 */
export function StudyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3.5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="w-20 h-5 rounded-full" />
                <SkeletonBlock className="w-28 h-5 rounded-full" />
              </div>
              <SkeletonBlock className="w-4/5 h-6" />
            </div>
            <SkeletonBlock className="w-20 h-6 rounded-md flex-shrink-0" />
          </div>
          <SkeletonBlock className="w-full h-12 rounded-lg" />
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <SkeletonBlock className="w-36 h-4" />
            <SkeletonBlock className="w-24 h-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 4D 知识图谱画布加载骨架屏
 */
export function GraphSkeleton() {
  return (
    <div className="w-full h-[520px] rounded-3xl bg-slate-100/90 border border-slate-200 p-6 flex flex-col justify-between skeleton-shimmer">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="w-48 h-8 rounded-xl" />
        <div className="flex gap-2">
          <SkeletonBlock className="w-20 h-8 rounded-lg" />
          <SkeletonBlock className="w-20 h-8 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-600">正在按需加载 4D 循证知识图谱推演引擎...</span>
      </div>
      <div className="flex items-center justify-between">
        <SkeletonBlock className="w-64 h-6 rounded-lg" />
        <SkeletonBlock className="w-32 h-6 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * 通用小卡片骨架屏
 */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 ${className}`}>
      <SkeletonBlock className="w-1/3 h-5" />
      <SkeletonBlock className="w-full h-10" />
      <SkeletonBlock className="w-2/3 h-4" />
    </div>
  );
}
