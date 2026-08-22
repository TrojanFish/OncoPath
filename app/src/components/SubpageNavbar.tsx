"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  BookOpen, 
  Network, 
  FileText, 
  Compass, 
  Info, 
  ArrowRight,
  Menu,
  X
} from "lucide-react";
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
  { label: "首页", href: "/", icon: Home, tag: "全景概览" },
  { label: "循证百科", href: "/wiki", icon: BookOpen, tag: "40+词条破译" },
  { label: "知识图谱", href: "/knowledge", icon: Network, tag: "4D因果推演" },
  { label: "国际研究库", href: "/studies", icon: FileText, tag: "顶刊效应量" },
  { label: "学术导航", href: "/resources", icon: Compass, tag: "指南共识原文" },
];

export default function SubpageNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Island Navbar (Desktop & Mobile) */}
      <div className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-2 sm:px-6 pointer-events-none print:hidden">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 transition-all pointer-events-auto hover:border-slate-300">
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
                    ? "text-accent-blue font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Action Area: Avatar (Personal Center for Desktop & Mobile) + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* UserAvatar: Single Home for Login, Profile, Timeline, Report, and Logout */}
            <UserAvatar />

            {/* Mobile Hamburger Button: Dedicated exclusively to Site Navigation */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none cursor-pointer"
              aria-label="打开全站导航菜单"
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

      {/* Mobile Slide-Over Drawer Menu (Pure Site Navigation, Zero Clutter) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop with Frosted Blur */}
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel: Compact Width max-w-[310px] */}
          <div className="fixed top-0 right-0 bottom-0 w-[82%] max-w-[310px] bg-white/98 backdrop-blur-2xl shadow-2xl p-5 flex flex-col justify-between animate-fade-in-up border-l border-slate-200/90 overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <LogoMark />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="关闭菜单"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Links with Compact Mini-Tags */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  系统功能导航
                </div>
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  const IconComp = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-100 font-bold shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                        <span>{link.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${isActive ? "text-blue-500 font-semibold" : "text-slate-400"}`}>
                        {link.tag}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Secondary Trust & Ethical Mission Link */}
              <div className="pt-2">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-semibold ${
                    pathname === "/about"
                      ? "bg-sky-50 text-sky-700 border-sky-200 font-bold"
                      : "bg-slate-50/80 hover:bg-slate-100 text-slate-600 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>关于我们与初衷</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span>医学伦理</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <Link href="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-600 transition-colors">
                  免责声明
                </Link>
                <span>·</span>
                <Link href="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-slate-600 transition-colors">
                  隐私保护
                </Link>
              </div>
              <div className="text-[10px] text-slate-400">
                © 2026 OncoPath · 严格同行评审循证医学库
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
