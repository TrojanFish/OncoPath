"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, AlertCircle, X } from "lucide-react";
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
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-white w-full max-w-md rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xl relative z-10 animate-fade-in-up text-slate-900">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="关闭窗口"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isLogin ? "登录 OncoPath" : "注册新账号"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin ? "安全同步您的临床数字档案与随访记录" : "免费创建个人循证档案库"}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl mb-5 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">账号 / 邮箱</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 transition-all"
              placeholder="patient@example.com"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm shadow-md mt-2 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>正在验证凭据...</span>
              </>
            ) : (
              <span>{isLogin ? "安全登录" : "立即注册并登录"}</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-accent-blue hover:text-accent-blue-dark text-xs font-semibold transition-colors cursor-pointer"
          >
            {isLogin ? "没有账号？点击快速注册" : "已有账号？点击直接登录"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
