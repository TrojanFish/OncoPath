"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import AuthModal from "@/components/AuthModal";

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
  { label: "首页", href: "/", icon: "🏠", tag: "全景概览" },
  { label: "循证百科", href: "/wiki", icon: "💡", tag: "40+词条破译" },
  { label: "知识图谱", href: "/knowledge", icon: "🗺️", tag: "4D因果推演" },
  { label: "国际研究库", href: "/studies", icon: "📚", tag: "顶刊效应量" },
  { label: "学术导航", href: "/resources", icon: "📖", tag: "指南共识原文" },
];

export default function SubpageNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("email"));
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("oncopath_admin_token");
    setUserEmail(null);
    window.dispatchEvent(new Event("auth-change"));
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Floating Island Navbar */}
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

          {/* Desktop Right Action Area: State-Driven */}
          <div className="hidden md:flex items-center">
            <UserAvatar />
          </div>

          {/* Mobile Right Area: When logged in, show 1-Tap Avatar to /profile + Hamburger Menu */}
          <div className="flex md:hidden items-center gap-2">
            {userEmail && (
              <Link
                href="/profile"
                className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-[11px] shadow-2xs relative"
                title="直达我的临床数字档案"
                aria-label="进入患者临床数字档案"
              >
                {userEmail.charAt(0).toUpperCase()}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none cursor-pointer"
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

      {/* Mobile Slide-Over Drawer Menu (Compact Width max-w-[310px]) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop with Frosted Blur */}
          <div 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel: w-[82%] max-w-[310px] */}
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

              {/* Mobile Identity Card */}
              {userEmail ? (
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-teal-50/90 border border-blue-100 flex items-center justify-between text-xs shadow-2xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 truncate leading-tight">{userEmail}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>已登录 · 云同步就绪</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-rose-600 font-bold px-2 py-1 rounded-lg bg-white/80 border border-rose-100 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-1"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 flex items-center justify-between text-xs transition-all text-left cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-full bg-slate-200 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0 text-xs transition-colors">
                      👤
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 leading-tight">游客模式</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">点击登录开启云同步 ➔</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-600 font-bold px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 shrink-0">
                    登录/注册
                  </span>
                </button>
              )}

              {/* Navigation Links with Compact Mini-Tags */}
              <div className="space-y-1 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  系统功能导航
                </div>
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-100 font-bold shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{link.icon}</span>
                        <span>{link.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${isActive ? "text-blue-500 font-semibold" : "text-slate-400"}`}>
                        {link.tag}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Action CTAs: Direct access to Profile and Report */}
              <div className="pt-2 space-y-1.5">
                {userEmail ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <span>📋 我的临床数字档案 ➔</span>
                    </Link>
                    <Link
                      href="/profile/report"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/90 transition-colors shadow-2xs"
                    >
                      <span>📑 我的专属循证报告 ➔</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>建立临床档案 ➔</span>
                  </Link>
                )}
              </div>

              {/* Secondary Trust & Ethical Mission Link */}
              <div className="pt-0.5">
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-xs font-semibold ${
                    pathname === "/about"
                      ? "bg-sky-50 text-sky-700 border-sky-200 font-bold"
                      : "bg-slate-50/80 hover:bg-slate-100 text-slate-600 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">💡</span>
                    <span>关于我们与初衷</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">医学伦理 ➔</span>
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
                © 2026 OncoPath · 同行评审循证库
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Trigger for Mobile Login Card */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(token, email) => {
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);
            setUserEmail(email);
            setShowAuthModal(false);
            window.dispatchEvent(new Event("auth-change"));
          }}
        />
      )}
    </>
  );
}
