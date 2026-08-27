"use client";

import { useState, useEffect } from "react";
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
  X,
  CreditCard,
  Search
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import GlobalSearchModal from "@/components/GlobalSearchModal";

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
  { label: "特药医保", href: "/reimbursement", icon: CreditCard, tag: "自负测算·赠药" },
  { label: "知识图谱", href: "/knowledge", icon: Network, tag: "4D因果推演" },
  { label: "国际研究库", href: "/studies", icon: FileText, tag: "顶刊效应量" },
  { label: "学术导航", href: "/resources", icon: Compass, tag: "指南共识原文" },
];

export default function SubpageNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // 全局 ⌘K / Ctrl+K 快捷键唤出搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 全局搜索弹窗 */}
      {searchOpen && <GlobalSearchModal onClose={() => setSearchOpen(false)} />}

      {/* Floating Island Navbar (Desktop & Mobile) */}
      <div className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-2 sm:px-6 pointer-events-none print:hidden">
        <nav className="max-w-5xl mx-auto flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-slate-900/5 transition-all pointer-events-auto hover:border-slate-300">
          <Link href="/" prefetch={true} className="flex-shrink-0 hover:opacity-85 transition-opacity">
            <LogoMark />
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7">

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
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

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-2.5">

            {/* 桌面端搜索药丸按钮 (hidden md:flex) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 text-slate-500 hover:text-slate-700 text-xs font-medium transition-all cursor-pointer group"
              aria-label="全站搜索"
              title="全站搜索 (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="hidden lg:inline text-slate-400 group-hover:text-slate-600 transition-colors">搜索...</span>
              <kbd className="hidden lg:inline px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[10px] font-mono text-slate-400 group-hover:text-slate-500 transition-colors">⌘K</kbd>
            </button>

            {/* 移动端搜索图标按钮 (md:hidden) */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="搜索"
            >
              <Search className="w-4 h-4" />
            </button>

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
                <Link href="/" prefetch={true} onClick={() => setMobileMenuOpen(false)}>
                  <LogoMark />
                </Link>
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

              {/* 移动端抽屉搜索入口 */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer text-left"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">快速搜索全站知识、药品或工具...</span>
              </button>

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
                      prefetch={true}
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
                  prefetch={true}
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
