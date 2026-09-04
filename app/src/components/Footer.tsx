"use client";

import Link from "next/link";
import { LogoMark } from "@/components/SubpageNavbar";

interface FooterProps {
  maxWidth?: string;
  className?: string;
}

export default function Footer({ maxWidth = "max-w-5xl", className = "" }: FooterProps) {
  return (
    <footer className={`w-full bg-white border-t border-slate-200 py-5 sm:py-8 px-4 sm:px-6 mt-auto print:hidden ${className}`}>
      <div className={`${maxWidth} mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-6`}>
        <div className="flex flex-col items-center md:items-start gap-1.5 sm:gap-2">
          <Link href="/" className="hover:opacity-85 transition-opacity">
            <LogoMark />
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 mt-0.5 flex-wrap justify-center md:justify-start">
            <Link href="/about" className="hover:text-blue-600 font-medium transition-colors text-blue-700">
              关于我们与初衷
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-blue-600 font-medium transition-colors">
              服务协议与免责声明
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-blue-600 font-medium transition-colors">
              隐私政策 (PDPA/PIPL)
            </Link>
          </div>
        </div>
        <div className="text-[10px] sm:text-xs text-slate-500 text-center md:text-right space-y-0.5">
          <div>© 2026 OncoPath · 肺癌循证知识与临床决策操作系统</div>
          <div className="text-[10px] text-slate-400">数据均可追溯至 JTO、Lancet、JCO、NCCN、CSCO 等权威期刊与指南</div>
        </div>
      </div>
    </footer>
  );
}
