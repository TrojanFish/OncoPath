"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";

export default function UserAvatar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role");
    const adminToken = localStorage.getItem("oncopath_admin_token");
    setUserEmail(email);
    setIsAdmin(role === "admin" || !!adminToken);
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
    setIsAdmin(false);
    setShowDropdown(false);
    window.dispatchEvent(new Event("auth-change"));
    if (window.location.pathname.startsWith("/admin")) {
      window.location.href = "/";
    }
  };

  return (
    <div className="relative flex items-center pr-3 mr-1 border-r border-slate-200 h-8" ref={dropdownRef}>
      {userEmail ? (
        <>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
            title={userEmail}
          >
            {userEmail.charAt(0).toUpperCase()}
          </button>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden py-1.5 z-50 animate-fade-in-up">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                  {isAdmin ? "管理员已就绪" : "已登录患者账号"}
                </p>
                <p className="text-xs text-slate-900 font-bold truncate">{userEmail}</p>
              </div>

              {isAdmin && (
                <Link 
                  href="/admin"
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-4 py-2.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <span>🛠️</span>
                  <span>进入证据管理中台</span>
                </Link>
              )}

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
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer border-t border-slate-100 mt-1"
              >
                <span>🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          title="登录 / 注册"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
          </svg>
        </button>
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
    </div>
  );
}
