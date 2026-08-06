"use client";

import { useState, useEffect, useRef } from "react";
import AuthModal from "@/components/AuthModal";

export default function UserAvatar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkAuth = () => {
    setUserEmail(localStorage.getItem("email"));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    setUserEmail(null);
    setShowDropdown(false);
    window.dispatchEvent(new Event("auth-change"));
    if (window.location.search.includes("action=dashboard")) {
        window.location.href = "/";
    }
  };

  const handleDashboard = () => {
    window.location.href = "/?action=dashboard";
  };

  return (
    <div className="relative flex items-center pr-4 mr-1 border-r border-white/10 h-8" ref={dropdownRef}>
      {userEmail ? (
        <>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-teal flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all"
            title={userEmail}
          >
            {userEmail.charAt(0).toUpperCase()}
          </button>
          
          {showDropdown && (
            <div className="absolute top-full right-0 mt-3 w-48 glass-strong rounded-xl border border-white/10 shadow-xl overflow-hidden py-1 z-50">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-xs text-text-muted mb-1">已登录为</p>
                <p className="text-sm text-text-primary font-medium truncate">{userEmail}</p>
              </div>
              <button 
                onClick={handleDashboard}
                className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                历史病例
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-accent-amber hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                退出登录
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/10 hover:border-white/20 transition-all"
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
