"use client";

import { useState } from "react";
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
  { label: "首页", href: "/", icon: "🏠" },
  { label: "循证百科", href: "/wiki", icon: "💡" },
  { label: "知识图谱", href: "/knowledge", icon: "🗺️" },
  { label: "国际研究库", href: "/studies", icon: "📚" },
  { label: "学术导航", href: "/resources", icon: "📖" },
];

export default function SubpageNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Island Navbar */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-7 py-3 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all duration-300 pointer-events-auto hover:border-slate-300">
          <Link href="/" className="flex-shrink-0 hover:opacity-85 transition-opacity">
            <LogoMark />
          </Link>
          
          {/* Desktop Navigation Links */}
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

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            <UserAvatar />
            
            <Link
              href="/profile"
              className="hidden sm:inline-flex btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
            >
              建立档案 / 分析
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none"
              aria-label="打开移动端导航菜单"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Slide-Over Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col justify-between animate-fade-in-up border-l border-slate-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <LogoMark />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  系统功能导航
                </div>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      pathname === link.href
                        ? "bg-blue-50 text-accent-blue border border-blue-100"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    pathname === "/profile"
                      ? "bg-blue-50 text-accent-blue border border-blue-100"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">📋</span>
                  <span>我的癌症档案</span>
                </Link>
              </div>

              {/* Main Action CTA */}
              <div className="pt-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <span>🔬 立即解析病理报告</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-slate-100 text-center">
              <div className="text-[11px] text-slate-400">
                © 2026 OncoPath · 严格同行评审循证医学知识库
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
