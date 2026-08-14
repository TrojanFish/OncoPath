"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";

export function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-xs">
        <img src="/logo.png" alt="OncoPath Logo" className="w-full h-full object-cover" />
      </div>
      <span className="font-bold text-slate-900 tracking-tight text-base">
        Onco<span className="text-accent-blue font-extrabold">Path</span>
      </span>
    </div>
  );
}

const NAV_LINKS = [
  { label: "首页", href: "/" },
  { label: "知识图谱", href: "/knowledge" },
  { label: "国际研究库", href: "/studies" },
  { label: "学术导航", href: "/resources" },
];

export default function SubpageNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-7 py-3 rounded-2xl sm:rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all duration-300 pointer-events-auto hover:border-slate-300">
        <Link href="/" className="flex-shrink-0 hover:opacity-85 transition-opacity">
          <LogoMark />
        </Link>
        
        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs sm:text-sm font-semibold transition-colors ${
                pathname === link.href
                  ? "text-accent-blue"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <UserAvatar />
          <Link
            href="/profile"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            建立档案 / 分析 ➔
          </Link>
        </div>
      </nav>
    </div>
  );
}
