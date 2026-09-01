"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, AlertCircle, X, LogIn, UserPlus, Lock, Mail } from "lucide-react";
import { login, register } from "@/lib/api";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (token: string, email: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // 1. Check if user is logging in as Admin
        try {
          const adminRes = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email.trim(), password: password.trim() })
          });
          const adminData = await adminRes.json();
          if (adminData.success && adminData.token) {
            localStorage.setItem("oncopath_admin_token", adminData.token);
            localStorage.setItem("email", adminData.admin.username);
            localStorage.setItem("role", "admin");
            window.dispatchEvent(new Event("auth-change"));
            onClose();
            window.location.href = "/admin";
            return;
          }
        } catch {
          // If admin endpoint check throws, fall through to patient login
        }

        // 2. Standard Patient Login
        const data = await login(email, password);
        onSuccess(data.access_token, email);
      } else {
        const data = await register(email, password);
        onSuccess(data.access_token, email);
      }

    } catch (err: any) {
      setError(err.message || "登录或注册失败，请检查网络或凭据");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      {/* 3-Tier Modal Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl relative z-10 animate-fade-in-up text-slate-900 max-h-[92vh] flex flex-col my-auto overflow-hidden"
      >
        {/* Tier 1: Fixed Sticky Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
              {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                {isLogin ? "登录 OncoPath 患者账号" : "免费创建个人循证档案库"}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isLogin ? "安全同步您的临床数字档案与随访生命线" : "支持多设备云端安全同步与隐私加密"}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="关闭窗口 (Esc)"
            title="关闭窗口 (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tier 2: Scrollable Body (Form) */}
        <form id="auth-modal-form" onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>账号 / 邮箱地址 *</span>
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              placeholder="patient@example.com"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>登录密码 *</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              placeholder="••••••••"
            />
          </div>
        </form>

        {/* Tier 3: Fixed Sticky Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-white shrink-0 rounded-b-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.05)] space-y-2.5">
          <button
            type="submit"
            form="auth-modal-form"
            disabled={loading}
            className="w-full btn-primary py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 text-white active:scale-98 transition-all"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>正在验证凭据...</span>
              </>
            ) : (
              <span>{isLogin ? "安全登录" : "立即注册并登录"}</span>
            )}
          </button>

          <div className="text-center pt-1">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-blue-600 hover:text-blue-800 text-xs font-bold transition-colors cursor-pointer"
            >
              {isLogin ? "没有账号？点击切换快速注册" : "已有账号？点击切换直接登录"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
