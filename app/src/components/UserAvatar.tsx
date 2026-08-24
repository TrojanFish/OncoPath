"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FileText, Calendar, Sparkles, LogOut, User } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { getCurrentUser, logout } from "@/lib/api";

export default function UserAvatar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = async () => {
    // 1. Immediate local check for instant UI rendering
    const localEmail = typeof window !== "undefined" ? localStorage.getItem("email") : null;
    if (localEmail) {
      setUserEmail(localEmail);
    }

    // 2. Server verification & Session hydration via HttpOnly Cookie
    const user = await getCurrentUser();
    if (user && user.email) {
      setUserEmail(user.email);
      if (typeof window !== "undefined") {
        localStorage.setItem("email", user.email);
        localStorage.setItem("role", user.role || "patient");
      }
    } else if (!user && !localEmail) {
      setUserEmail(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("oncopath_admin_token");
    setUserEmail(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event("auth-change"));
    if (window.location.pathname.startsWith("/admin")) {
      window.location.href = "/";
    }
  };


  return (
    <>
      {userEmail ? (
        /* Logged-in State: Pure Round Avatar with Breathing Green Dot on Top-Right */
        <div className="relative flex items-center" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-teal-500 hover:opacity-90 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer ring-2 ring-white hover:ring-blue-200"
            title={`已登录：${userEmail}`}
            aria-label="打开患者档案与账号菜单"
          >
            {userEmail.charAt(0).toUpperCase()}
            
            {/* Pulsing Breathing Green Light Indicator on Top-Right Corner */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3 pointer-events-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white shadow-2xs"></span>
            </span>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden py-1.5 z-50 animate-fade-in-up">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    已登录患者账号
                  </p>
                </div>
                <p className="text-xs text-slate-900 font-bold truncate mt-0.5">{userEmail}</p>
              </div>

              <Link 
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 font-semibold transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>我的临床数字档案</span>
              </Link>

              <Link 
                href="/timeline"
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 font-semibold transition-colors flex items-center gap-2"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>检查报告时间生命线</span>
              </Link>

              <Link 
                href="/profile/report"
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-teal-600 hover:bg-teal-50/60 font-semibold transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>我的专属循证报告</span>
              </Link>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Guest / Unauthenticated State: Circular Avatar Button + Pure Text CTA Button */
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="登录 / 注册"
            aria-label="登录或注册"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
            </svg>
          </button>

          <Link
            href="/profile"
            className="hidden sm:inline-flex btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            建立临床档案
          </Link>
        </div>
      )}

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
