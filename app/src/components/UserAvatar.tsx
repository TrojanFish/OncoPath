"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";

export default function UserAvatar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    const email = localStorage.getItem("email");
    setUserEmail(email);
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

  const handleLogout = () => {
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
        /* Logged-in State: Single Refined User Capsule (No Duplicate CTA Button) */
        <div className="relative flex items-center" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
            title={userEmail}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-[11px] shadow-2xs">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[110px] truncate">{userEmail.split('@')[0]}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="已云端同步"></span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden py-1.5 z-50 animate-fade-in-up">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
                <span>📋</span>
                <span>我的临床数字档案</span>
              </Link>

              <Link 
                href="/profile/report"
                onClick={() => setShowDropdown(false)}
                className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:text-teal-600 hover:bg-teal-50/60 font-semibold transition-colors flex items-center gap-2"
              >
                <span>📑</span>
                <span>我的专属循证报告</span>
              </Link>

              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
              >
                <span>🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Guest / Unauthenticated State: Circular Avatar Button + Pure Text CTA Button */
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="登录 / 注册"
            aria-label="登录或注册"
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
            </svg>
          </button>

          <Link
            href="/profile"
            className="btn-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm"
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
