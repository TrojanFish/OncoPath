"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import * as OpenCC from "opencc-js";

export type LangScript = "cn" | "tw";

const STORAGE_KEY = "oncopath_lang_script";

let s2tConverter: ((text: string) => string) | null = null;
let t2sConverter: ((text: string) => string) | null = null;

function getConverters(): { s2t: (text: string) => string; t2s: (text: string) => string } {
  if (!s2tConverter || !t2sConverter) {
    s2tConverter = OpenCC.Converter({ from: "cn", to: "hk" });
    t2sConverter = OpenCC.Converter({ from: "hk", to: "cn" });
  }
  return { s2t: s2tConverter, t2s: t2sConverter };
}

const IGNORED_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "textarea",
  "input",
  "code",
  "pre"
]);

function shouldIgnoreElement(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (IGNORED_TAGS.has(tag)) return true;
  if (el.getAttribute("data-no-convert") === "true") return true;
  return false;
}

function convertTextNode(node: Node, converter: (text: string) => string) {
  if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
    const val = node.nodeValue;
    if (/[\u4e00-\u9fa5]/.test(val)) {
      const converted = converter(val);
      if (converted !== val) {
        node.nodeValue = converted;
      }
    }
  }
}

export function convertDocument(targetScript: LangScript) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const { s2t, t2s } = getConverters();
  const converter = targetScript === "tw" ? s2t : t2s;

  // Convert page title
  if (document.title && /[\u4e00-\u9fa5]/.test(document.title)) {
    document.title = converter(document.title);
  }

  // Set HTML lang attribute
  document.documentElement.lang = targetScript === "tw" ? "zh-TW" : "zh-CN";

  // Walk text nodes in body
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        let parent = node.parentElement;
        while (parent && parent !== document.body) {
          if (shouldIgnoreElement(parent)) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let current = walker.nextNode();
  while (current) {
    convertTextNode(current, converter);
    current = walker.nextNode();
  }
}

interface LangSwitchProps {
  className?: string;
  showFullLabel?: boolean;
}

export default function LangSwitch({ className = "", showFullLabel = false }: LangSwitchProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<LangScript>("cn");
  const [mounted, setMounted] = useState(false);
  const isConvertingRef = useRef(false);

  // Initialize from storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as LangScript | null;
    if (saved === "tw") {
      setLang("tw");
      const timer = setTimeout(() => {
        convertDocument("tw");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for navigation or dynamic DOM additions when in Traditional mode
  useEffect(() => {
    if (!mounted || lang !== "tw") return;

    // Convert upon route change
    const navTimer = setTimeout(() => {
      convertDocument("tw");
    }, 120);

    const { s2t } = getConverters();

    const observer = new MutationObserver((mutations) => {
      if (isConvertingRef.current) return;
      isConvertingRef.current = true;

      try {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              convertTextNode(node, s2t);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as Element;
              if (!shouldIgnoreElement(el)) {
                const walker = document.createTreeWalker(
                  el,
                  NodeFilter.SHOW_TEXT,
                  {
                    acceptNode(textNode) {
                      let p = textNode.parentElement;
                      while (p && p !== el) {
                        if (shouldIgnoreElement(p)) return NodeFilter.FILTER_REJECT;
                        p = p.parentElement;
                      }
                      return NodeFilter.FILTER_ACCEPT;
                    }
                  }
                );
                let current = walker.nextNode();
                while (current) {
                  convertTextNode(current, s2t);
                  current = walker.nextNode();
                }
              }
            }
          });
        });
      } finally {
        isConvertingRef.current = false;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(navTimer);
      observer.disconnect();
    };
  }, [pathname, lang, mounted]);

  const handleToggle = useCallback(() => {
    const nextLang: LangScript = lang === "cn" ? "tw" : "cn";
    setLang(nextLang);
    localStorage.setItem(STORAGE_KEY, nextLang);
    convertDocument(nextLang);

    // Notify other components if needed
    window.dispatchEvent(
      new CustomEvent("oncopath-lang-change", { detail: { lang: nextLang } })
    );
  }, [lang]);

  if (!mounted) {
    return showFullLabel ? (
      <div className={`h-8 w-24 rounded-xl bg-slate-100 animate-pulse ${className}`} />
    ) : (
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 animate-pulse ${className}`} />
    );
  }

  if (showFullLabel) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`group relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer select-none active:scale-95 ${
          lang === "tw"
            ? "bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100"
            : "bg-slate-50/90 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900"
        } ${className}`}
        title={lang === "cn" ? "點擊切換為繁體中文" : "点击切换为简体中文"}
        aria-label="简繁语言转换 / 簡繁語言轉換"
      >
        <Languages className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${lang === "tw" ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"}`} />
        <span className="font-semibold tracking-tight text-xs">
          {lang === "cn" ? "繁體中文" : "简体中文"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`group relative w-8 h-8 sm:w-9 sm:h-9 rounded-full inline-flex items-center justify-center transition-all border shadow-2xs cursor-pointer select-none active:scale-95 ${
        lang === "tw"
          ? "bg-blue-50/90 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300"
          : "bg-slate-100/90 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900"
      } ${className}`}
      title={lang === "cn" ? "點擊切換為繁體中文" : "点击切换为简体中文"}
      aria-label="简繁语言转换 / 簡繁語言轉換"
    >
      <Languages className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform group-hover:scale-110 ${lang === "tw" ? "text-blue-600" : "text-slate-500 group-hover:text-blue-600"}`} />
      <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 text-[9px] font-extrabold rounded-full bg-slate-800 group-hover:bg-blue-600 text-white flex items-center justify-center leading-none border-2 border-white shadow-2xs transition-colors pointer-events-none">
        {lang === "cn" ? "繁" : "简"}
      </span>
    </button>
  );
}
