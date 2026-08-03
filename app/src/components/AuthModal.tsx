"use client";

import { useState } from "react";
import { login, register } from "@/lib/api";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (token: string, email: string) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(email, password);
        onSuccess(data.access_token, email);
      } else {
        await register(email, password);
        // Auto-login after registration
        const data = await login(email, password);
        onSuccess(data.access_token, email);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 border border-accent-blue/20 animate-fade-in-up relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <h2 className="text-2xl font-semibold text-text-primary mb-6 text-center">
          {isLogin ? "登录 OncoPath" : "注册新账号"}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">邮箱</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-field p-3 rounded-xl text-text-primary"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">密码</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full input-field p-3 rounded-xl text-text-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-xl font-medium mt-2 disabled:opacity-50"
          >
            {loading ? "处理中..." : (isLogin ? "登录" : "注册")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-accent-blue hover:text-accent-blue-light text-sm transition-colors"
          >
            {isLogin ? "没有账号？点击注册" : "已有账号？点击登录"}
          </button>
        </div>
      </div>
    </div>
  );
}
