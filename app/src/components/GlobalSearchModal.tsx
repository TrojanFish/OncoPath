"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight, Zap, ArrowUpRight } from "lucide-react";
import {
  searchIndex,
  groupSearchResults,
  HOT_SEARCHES,
  QUICK_TOOLS,
  type GroupedResults,
} from "@/lib/searchIndex";

interface GlobalSearchModalProps {
  onClose: () => void;
}

export default function GlobalSearchModal({ onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupedResults[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // 将分组结果展平为一维数组，用于键盘导航
  const flatResults = groups.flatMap((g) => g.entries);

  // ── 实时搜索（无 debounce，内存计算极速） ────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      setGroups([]);
      setActiveIndex(-1);
      return;
    }
    const raw = searchIndex(query, 20);
    const grouped = groupSearchResults(raw);
    setGroups(grouped);
    setActiveIndex(-1);
  }, [query]);

  // ── 打开时自动聚焦输入框，锁定 body 滚动 ────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // ── Esc / 方向键 / Enter 键盘事件 ────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (!flatResults.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && flatResults[activeIndex]) {
          navigate(flatResults[activeIndex].entry.route);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatResults, activeIndex, onClose]);

  // ── 跳转并关闭弹窗 ────────────────────────────────────────────────────────
  const navigate = useCallback(
    (route: string) => {
      onClose();
      router.push(route);
    },
    [onClose, router]
  );

  // ── 点击热门标签填充输入框 ───────────────────────────────────────────────
  const fillQuery = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  // ── 计算全局条目序号（用于 activeIndex 高亮对比） ────────────────────────
  let globalIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 pb-6 animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      {/* 搜索面板 */}
      <div
        className="bg-white rounded-3xl w-full max-w-2xl border border-slate-200 shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden animate-fade-in-up max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. 顶部输入框（固定，shrink-0） ─────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 shrink-0">
          <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入疾病、基因靶点、药品名或临床试验..."
            className="flex-1 text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent outline-none min-w-0"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0"
              aria-label="清空搜索"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:flex w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="关闭搜索"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── 2. 结果区 / 空状态（独立滚动） ──────────────────────────────────── */}
        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">

          {/* 空状态：热门搜索 + 快捷工具 */}
          {!query.trim() && (
            <div className="p-4 sm:p-5 space-y-5">
              {/* 热门搜索 */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  💡 热门搜索
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOT_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => fillQuery(term)}
                      className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 hover:border-blue-200"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* 快捷工具入口 */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  <Zap className="w-3 h-3 inline mr-1" />
                  快捷工具直达
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_TOOLS.map((tool) => (
                    <button
                      key={tool.route}
                      type="button"
                      onClick={() => navigate(tool.route)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer group text-left"
                    >
                      <span className="text-base">{tool.badge}</span>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 flex-1 min-w-0 truncate">
                        {tool.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 有内容时：分组结果列表 */}
          {query.trim() && groups.length > 0 && (
            <div className="py-2">
              {groups.map((group) => (
                <div key={group.category} className="mb-1">
                  {/* 分组标题 */}
                  <div className="px-4 sm:px-5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.categoryLabel}
                  </div>

                  {/* 条目列表 */}
                  {group.entries.map((result) => {
                    const isActive = globalIdx === activeIndex;
                    const currentIdx = globalIdx++;
                    const entry = result.entry;

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => navigate(entry.route)}
                        onMouseEnter={() => setActiveIndex(currentIdx)}
                        className={`w-full text-left flex items-center gap-3 px-4 sm:px-5 py-2.5 transition-colors cursor-pointer ${
                          isActive
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* 文字区 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-sm font-semibold truncate ${
                                isActive ? "text-blue-700" : "text-slate-900"
                              }`}
                            >
                              {entry.title}
                            </span>
                            {entry.badge && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500">
                                {entry.badge}
                              </span>
                            )}
                          </div>
                          {entry.subtitle && (
                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {entry.subtitle}
                            </div>
                          )}
                        </div>

                        {/* 跳转箭头 */}
                        <ArrowUpRight
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? "text-blue-500" : "text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* 无结果状态 */}
          {query.trim() && groups.length === 0 && (
            <div className="py-10 px-5 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <div className="text-sm font-bold text-slate-700 mb-1">
                未找到与「{query}」相关的内容
              </div>
              <div className="text-xs text-slate-400 mb-4">
                试试其他关键词，或直接浏览下方功能区
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/wiki")}
                  className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                >
                  循证百科
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/studies")}
                  className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                >
                  国际研究库
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/reimbursement")}
                  className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                >
                  特药医保
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 3. 固定底栏：键盘快捷键提示 ─────────────────────────────────────── */}
        <div className="hidden sm:flex items-center justify-between px-5 py-2.5 border-t border-slate-100 shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-[10px] text-slate-500">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-[10px] text-slate-500">↓</kbd>
              <span>选择</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-[10px] text-slate-500">↵</kbd>
              <span>直达</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono text-[10px] text-slate-500">Esc</kbd>
              <span>关闭</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-300 font-mono">
            OncoPath · 全站检索
          </div>
        </div>
      </div>
    </div>
  );
}
