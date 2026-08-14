"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SubpageNavbar from "@/components/SubpageNavbar";

interface IngestedStudy {
  id: string;
  title: string;
  journal?: string;
  year?: number;
  authors?: string;
  studyType?: string;
  evidenceLevel?: number;
  patientN?: number;
  doi?: string;
  pubmedId?: string;
  applicableStages?: string;
  relevantFactors?: string;
  summary?: string;
  conclusion?: string;
  keywords?: string;
  hr?: number;
  ciLow?: number;
  ciHigh?: number;
  rfs5Year?: string;
  biomarkerDetails?: string;
  interventionArm?: string;
  riskReduction?: string;
  pdfFileName?: string;
  createdAt: string;
}

interface EvidenceMetrics {
  totalStudies: number;
  totalPatients: number;
  rctMetaCount: number;
}

interface OnlineSearchResult {
  id: string;
  title: string;
  journal: string;
  year: number | null;
  authors: string;
  doi: string;
  pmid: string;
  abstractText: string;
  isOpenAccess: boolean;
}

export default function AdminPage() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Studio tabs and data states
  const [activeTab, setActiveTab] = useState<"pdf" | "pubmed">("pdf");
  const [studies, setStudies] = useState<IngestedStudy[]>([]);
  const [metrics, setMetrics] = useState<EvidenceMetrics>({ totalStudies: 0, totalPatients: 0, rctMetaCount: 0 });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // PDF Upload & Parsing States
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState<string>("");
  const [parseError, setParseError] = useState("");
  
  // PubMed Online Search States
  const [onlineQuery, setOnlineQuery] = useState("");
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState<OnlineSearchResult[]>([]);
  const [onlineError, setOnlineError] = useState("");
  const [extractingId, setExtractingId] = useState<string | null>(null);

  // Verification & Ingestion States
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAdminToken = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("oncopath_admin_token");
    }
    return null;
  };

  const getAuthHeaders = () => {
    const token = getAdminToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Check auth on mount
  useEffect(() => {
    const token = getAdminToken();
    if (token) {
      // Verify token
      fetch('/api/admin/login', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("oncopath_admin_token");
          setIsAuthenticated(false);
        }
      }).catch(() => {
        setIsAuthenticated(false);
      }).finally(() => {
        setCheckingAuth(false);
      });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError("请输入管理员账号与密码");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem("oncopath_admin_token", data.token);
        setIsAuthenticated(true);
        showToast("🎉 管理员身份验证成功，欢迎进入证据中台！");
      } else {
        setLoginError(data.error || "登录失败，请检查账号密码。");
      }
    } catch (err: any) {
      setLoginError("网络异常: " + err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem("oncopath_admin_token");
    setIsAuthenticated(false);
    showToast("已安全退出管理员账号");
  };

  // Load existing studies from DB
  const loadStudies = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/evidence?q=${encodeURIComponent(searchQuery)}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setStudies(data.studies);
        setMetrics(data.metrics);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to load studies", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStudies();
    }
  }, [isAuthenticated, searchQuery]);

  // Handle PDF File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setParseError("请上传有效的 PDF 格式医学文献文件。");
        return;
      }
      setPdfFile(file);
      setParseError("");
      setExtractedData(null);
    }
  };

  // Trigger Gemini Multimodal PDF Parsing
  const handleParsePdf = async () => {
    if (!pdfFile) return;
    setIsParsing(true);
    setParseError("");
    setParsingStep("正在读取 PDF 二进制数据并编码...");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          
          setParsingStep("正在调用 Gemini 2.5 多模态引擎解析文献与统计数据...");

          const res = await fetch('/api/admin/parse-pdf', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              pdfBase64: base64Data,
              fileName: pdfFile.name
            })
          });

          const json = await res.json();
          if (json.success) {
            setExtractedData(json.data);
            showToast("🎉 文献结构化指标抽取成功！请进行专家核验。");
          } else {
            setParseError(json.error || "PDF 解析失败，请重试。");
          }
        } catch (err: any) {
          setParseError("网络或处理异常: " + err.message);
        } finally {
          setIsParsing(false);
          setParsingStep("");
        }
      };
      reader.readAsDataURL(pdfFile);
    } catch (err: any) {
      setParseError("文件读取失败: " + err.message);
      setIsParsing(false);
    }
  };

  // Search PubMed / Europe PMC Online
  const handleSearchOnline = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onlineQuery.trim()) return;

    setIsSearchingOnline(true);
    setOnlineError("");
    setOnlineResults([]);

    try {
      const res = await fetch('/api/admin/fetch-pubmed', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'search',
          query: onlineQuery.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.results.length === 0) {
          setOnlineError("未找到匹配的文献，请尝试更换关键词、PMID 或 DOI。");
        } else {
          setOnlineResults(data.results);
        }
      } else {
        setOnlineError(data.error || "PubMed 检索失败");
      }
    } catch (err: any) {
      setOnlineError("检索异常: " + err.message);
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Extract from an Online Search Result
  const handleExtractFromArticle = async (article: OnlineSearchResult) => {
    setExtractingId(article.id);
    setOnlineError("");

    try {
      const res = await fetch('/api/admin/fetch-pubmed', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'extract',
          article: article
        })
      });

      const data = await res.json();
      if (data.success) {
        setExtractedData(data.data);
        showToast("🎉 已成功从 PubMed 摘要中提取结构化指标！");
      } else {
        alert("指标提取失败: " + data.error);
      }
    } catch (err: any) {
      alert("提取异常: " + err.message);
    } finally {
      setExtractingId(null);
    }
  };

  // Submit verified data to DB
  const handleSaveEvidence = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/evidence', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(extractedData)
      });
      const data = await res.json();
      if (data.success) {
        showToast("✅ 文献已成功入库并生成向量索引！");
        setExtractedData(null);
        setPdfFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadStudies();
      } else {
        alert("保存失败: " + data.error);
      }
    } catch (err: any) {
      alert("提交异常: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete study
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要从数据库中删除文献《${title}》吗？`)) return;
    try {
      const res = await fetch(`/api/admin/evidence?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        showToast("🗑️ 文献已成功移除");
        loadStudies();
      }
    } catch (err) {
      alert("删除失败");
    }
  };

  // Loading Screen while verifying session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <svg className="animate-spin h-5 w-5 text-accent-blue" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>正在校验管理员安全凭证...</span>
        </div>
      </div>
    );
  }

  // Admin Login Screen (If not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between text-slate-100">
        <SubpageNavbar />

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-accent-blue flex items-center justify-center text-3xl mx-auto mb-4">
                🛡️
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">OncoPath 证据中台</h1>
              <p className="text-xs text-slate-400 mt-1">管理员安全访问受控系统 · Medical Evidence CMS</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">管理员账号 (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">访问密码 (Password)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors"
                />
              </div>

              {loginError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>正在验证...</span>
                  </>
                ) : (
                  <span>安全登录进入证据中台 ➔</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
              <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
                ← 返回 OncoPath 患者主页
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center pb-6 text-xs text-slate-500">
          © 2026 OncoPath · 严格受控医学数据治理平台
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard View
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <SubpageNavbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999] bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-slate-700 text-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="pt-16 pb-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-accent-blue bg-blue-50 border border-blue-200 mb-2">
              <span>🛠️ OncoPath 证据中台</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse"></span>
              <span>Admin Evidence Studio (已鉴权)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              医学文献管理与智能录入工作台
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              支持「本地 PDF 拖拽解析」与「PubMed / Europe PMC 在线检索」双核录入，覆盖 17 项核心与前沿临床指标。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/studies"
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            >
              📖 前台证据库
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              🔒 退出登录
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <StatCard 
            icon="📚" 
            title="已收录文献总数" 
            value={metrics.totalStudies} 
            subtitle="篇前沿期刊论文" 
            color="blue" 
          />
          <StatCard 
            icon="👥" 
            title="累积受试者规模" 
            value={metrics.totalPatients.toLocaleString()} 
            subtitle="例临床患者队列" 
            color="teal" 
          />
          <StatCard 
            icon="🏆" 
            title="前瞻性RCT/Meta" 
            value={metrics.rctMetaCount} 
            subtitle="最高等级循证证据" 
            color="amber" 
          />
          <StatCard 
            icon="🌐" 
            title="数据接入源" 
            value="双核驱动" 
            subtitle="PDF 多模态 + PubMed" 
            color="emerald" 
          />
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Ingestion Studio Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          
          {/* Dual Ingestion Mode Tabs */}
          {!extractedData && (
            <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl max-w-md mb-6">
              <button
                onClick={() => setActiveTab("pdf")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "pdf"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>📄 上传本地 PDF 论文</span>
              </button>
              <button
                onClick={() => setActiveTab("pubmed")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "pubmed"
                    ? "bg-white text-accent-blue shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>🌐 在线检索 PubMed / Europe PMC</span>
              </button>
            </div>
          )}

          {/* Mode A: Local PDF Upload */}
          {!extractedData && activeTab === "pdf" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">PDF 论文多模态深度抽取</h2>
                  <p className="text-xs text-slate-500">直接上传论文 PDF 原文，Gemini 2.5 Flash 将自动结构化提取全文图表与效应量</p>
                </div>
                {pdfFile && !isParsing && (
                  <button
                    onClick={() => { setPdfFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    清空重选
                  </button>
                )}
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  pdfFile 
                    ? "border-accent-blue bg-blue-50/40" 
                    : "border-slate-300 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-400"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,application/pdf" 
                  className="hidden" 
                />
                <div className="flex flex-col items-center">
                  <span className="text-4xl mb-3">{pdfFile ? "📑" : "📤"}</span>
                  {pdfFile ? (
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{pdfFile.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        大小: {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB · 准备就绪
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">点击选择或将 PDF 论文拖拽至此处</div>
                      <div className="text-xs text-slate-400 mt-1">支持 JTO, JCO, Lancet, Chest 等国际期刊 PDF 原文 (最大 30MB)</div>
                    </div>
                  )}
                </div>
              </div>

              {parseError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{parseError}</span>
                </div>
              )}

              {pdfFile && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleParsePdf}
                    disabled={isParsing}
                    className={`btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm ${
                      isParsing ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    {isParsing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{parsingStep || "AI 正在提取医学指标..."}</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 开始 AI 智能结构化抽取</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mode B: Online PubMed / Europe PMC Search */}
          {!extractedData && activeTab === "pubmed" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">PubMed / Europe PMC 在线检索抓取</h2>
                <p className="text-xs text-slate-500">无需下载 PDF，输入研究名称、PMID（如 29190196）或 DOI，秒级检索并智能结构化回填</p>
              </div>

              <form onSubmit={handleSearchOnline} className="flex gap-2">
                <input 
                  type="text" 
                  value={onlineQuery}
                  onChange={e => setOnlineQuery(e.target.value)}
                  placeholder="例如：JCOG0802 segmentectomy 或 29190196 或 10.1200/JCO.2017.74.8871"
                  className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-accent-blue/20"
                />
                <button
                  type="submit"
                  disabled={isSearchingOnline || !onlineQuery.trim()}
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
                >
                  {isSearchingOnline ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>检索中...</span>
                    </>
                  ) : (
                    <span>🔍 在线检索</span>
                  )}
                </button>
              </form>

              {onlineError && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{onlineError}</span>
                </div>
              )}

              {/* Online Results List */}
              {onlineResults.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-slate-500">
                    检索到 {onlineResults.length} 篇候选文献，点击「一键提取」即可加载至专家核验单：
                  </div>

                  <div className="space-y-3">
                    {onlineResults.map(item => (
                      <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-accent-blue/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-accent-blue">{item.journal || "Journal"}</span>
                            {item.year && <span className="text-xs text-slate-400">({item.year})</span>}
                            {item.isOpenAccess && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Open Access</span>}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.title}</h4>
                          <div className="text-xs text-slate-500 line-clamp-1">{item.authors}</div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.abstractText}</p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleExtractFromArticle(item)}
                            disabled={extractingId === item.id}
                            className="px-4 py-2 bg-blue-50 text-accent-blue hover:bg-accent-blue hover:text-white border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            {extractingId === item.id ? (
                              <>
                                <span className="animate-spin text-xs">🌀</span>
                                <span>AI 提取中...</span>
                              </>
                            ) : (
                              <>
                                <span>⚡ 一键提取并核验</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section: Human-in-the-Loop Verification Card (Common to both PDF & PubMed) */}
          {extractedData && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <span>🛡️ 专家核验屏障 (Human-in-the-Loop)</span>
                  <span className="text-emerald-700 font-normal">已完成 17 项指标智能提取，请核对并可微调表单数据，确认无误后录入数据库。</span>
                </div>
                <button
                  onClick={() => setExtractedData(null)}
                  className="text-emerald-700 hover:text-emerald-900 underline text-xs font-semibold"
                >
                  放弃重选
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid md:grid-cols-2 gap-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
                {/* Column 1: Basic Study Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">文献基本信息</h3>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">论文标题 (Title)</label>
                    <input 
                      type="text" 
                      value={extractedData.title || ""} 
                      onChange={e => setExtractedData({...extractedData, title: e.target.value})}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">发表期刊 (Journal)</label>
                      <input 
                        type="text" 
                        value={extractedData.journal || ""} 
                        onChange={e => setExtractedData({...extractedData, journal: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">发表年份 (Year)</label>
                      <input 
                        type="number" 
                        value={extractedData.year || 2023} 
                        onChange={e => setExtractedData({...extractedData, year: parseInt(e.target.value) || 2023})}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">第一作者 / Authors</label>
                      <input 
                        type="text" 
                        value={extractedData.authors || ""} 
                        onChange={e => setExtractedData({...extractedData, authors: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">受试队列样本量 (n=)</label>
                      <input 
                        type="number" 
                        value={extractedData.patientN || 0} 
                        onChange={e => setExtractedData({...extractedData, patientN: parseInt(e.target.value) || 0})}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-accent-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">DOI 标识符</label>
                      <input 
                        type="text" 
                        value={extractedData.doi || ""} 
                        onChange={e => setExtractedData({...extractedData, doi: e.target.value})}
                        placeholder="10.1200/JCO.xxx"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PubMed PMID</label>
                      <input 
                        type="text" 
                        value={extractedData.pubmedId || ""} 
                        onChange={e => setExtractedData({...extractedData, pubmedId: e.target.value})}
                        placeholder="29190196"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Column 2: Clinical Metrics */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">临床效应量与分期</h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">研究类型 (Study Type)</label>
                      <select 
                        value={extractedData.studyType || "retrospective"} 
                        onChange={e => setExtractedData({...extractedData, studyType: e.target.value})}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                      >
                        <option value="rct">随机对照试验 (RCT)</option>
                        <option value="meta_analysis">Meta 分析</option>
                        <option value="prospective_multicenter">多中心前瞻性队列</option>
                        <option value="retrospective_multicenter">多中心回顾性队列</option>
                        <option value="retrospective">单中心回顾性研究</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">证据等级 (1-5星)</label>
                      <select 
                        value={extractedData.evidenceLevel || 4} 
                        onChange={e => setExtractedData({...extractedData, evidenceLevel: parseInt(e.target.value) || 4})}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-amber-600 font-bold"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (最高级 RCT/Meta)</option>
                        <option value="4">⭐⭐⭐⭐ (多中心高级别)</option>
                        <option value="3">⭐⭐⭐ (单中心临床研究)</option>
                        <option value="2">⭐⭐ (小型病例观察)</option>
                        <option value="1">⭐ (专家观点)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Hazard Ratio (HR)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={extractedData.hr || ""} 
                        onChange={e => setExtractedData({...extractedData, hr: parseFloat(e.target.value) || null})}
                        placeholder="如 1.87"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-rose-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">95% CI 下限</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={extractedData.ciLow || ""} 
                        onChange={e => setExtractedData({...extractedData, ciLow: parseFloat(e.target.value) || null})}
                        placeholder="如 1.52"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">95% CI 上限</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={extractedData.ciHigh || ""} 
                        onChange={e => setExtractedData({...extractedData, ciHigh: parseFloat(e.target.value) || null})}
                        placeholder="如 2.29"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">5年无复发生存率 (5yr RFS)</label>
                      <input 
                        type="text" 
                        value={extractedData.rfs5Year || ""} 
                        onChange={e => setExtractedData({...extractedData, rfs5Year: e.target.value})}
                        placeholder="如 98.2%"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">关联病理因子 (逗号隔开)</label>
                      <input 
                        type="text" 
                        value={Array.isArray(extractedData.relevantFactors) ? extractedData.relevantFactors.join(', ') : extractedData.relevantFactors || ""} 
                        onChange={e => setExtractedData({...extractedData, relevantFactors: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        placeholder="STAS, CTR, VPI, wedge"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Advanced Frontier Oncology Fields */}
              <div className="bg-gradient-to-r from-blue-50/70 via-teal-50/70 to-emerald-50/70 p-5 rounded-2xl border border-blue-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">🧬</span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">前沿医学进阶指标 (Biomarkers & Interventions)</h4>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">4D 图谱联动</span>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      分子靶点与生物标志物亚型
                    </label>
                    <input 
                      type="text" 
                      value={extractedData.biomarkerDetails || ""} 
                      onChange={e => setExtractedData({...extractedData, biomarkerDetails: e.target.value})}
                      placeholder="如 EGFR 19del/L858R, PD-L1 TPS>=50%"
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      治疗干预组 vs 对照组对比
                    </label>
                    <input 
                      type="text" 
                      value={extractedData.interventionArm || ""} 
                      onChange={e => setExtractedData({...extractedData, interventionArm: e.target.value})}
                      placeholder="如 试验组: 奥希替尼 80mg vs 对照组: 安慰剂"
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      相对风险降低率 (Risk Reduction %)
                    </label>
                    <input 
                      type="text" 
                      value={extractedData.riskReduction || ""} 
                      onChange={e => setExtractedData({...extractedData, riskReduction: e.target.value})}
                      placeholder="如 -77% (HR=0.23)"
                      className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Textareas */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">核心临床结论与预后指导 (Conclusion)</label>
                  <textarea 
                    rows={3} 
                    value={extractedData.conclusion || ""} 
                    onChange={e => setExtractedData({...extractedData, conclusion: e.target.value})}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">研究背景与队列方法概述 (Summary)</label>
                  <textarea 
                    rows={2} 
                    value={extractedData.summary || ""} 
                    onChange={e => setExtractedData({...extractedData, summary: e.target.value})}
                    className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-600"
                  />
                </div>
              </div>

              {/* Final Confirm Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  * 确认入库后，数据将写入 PostgreSQL 并即时在循证检索与知识图谱中生效。
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => setExtractedData(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEvidence}
                    disabled={isSaving}
                    className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    {isSaving ? "正在写入数据库..." : "💾 确认无误，正式录入知识库"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section: Ingested Evidence Library Table */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">已收录医学证据文献库</h2>
              <p className="text-xs text-slate-500">当前知识图谱与 RAG 检索引用的核心文献列表（含前沿分子靶点与干预特征）</p>
            </div>
            
            {/* Search Input */}
            <div className="w-full sm:w-72">
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索论文标题、期刊、因子、靶点..."
                className="w-full p-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">正在加载文献数据...</div>
          ) : studies.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              暂无已收录文献。请在上方上传 PDF 或通过 PubMed 检索录入。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
                    <th className="pb-3 pr-4">论文标题 & 期刊</th>
                    <th className="pb-3 px-3">队列规模 (n)</th>
                    <th className="pb-3 px-3">证据等级</th>
                    <th className="pb-3 px-3">核心效应量 (HR / 获益)</th>
                    <th className="pb-3 px-3">靶点与干预组</th>
                    <th className="pb-3 pl-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studies.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 pr-4 max-w-sm">
                        <div className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                          {s.title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span className="text-accent-blue font-medium">{s.journal || "Unknown"}</span>
                          <span>·</span>
                          <span>{s.year || "2023"}</span>
                          <span>·</span>
                          <span>{s.authors || "et al."}</span>
                        </div>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 text-xs">
                          {s.patientN ? s.patientN.toLocaleString() : "N/A"}
                        </span>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        <span className="text-xs text-amber-500 font-bold">
                          {"⭐".repeat(s.evidenceLevel || 4)}
                        </span>
                      </td>

                      <td className="py-4 px-3 whitespace-nowrap">
                        {s.hr && (
                          <div className="text-xs font-bold text-rose-600">
                            HR: {s.hr} {s.ciLow && s.ciHigh ? `(${s.ciLow}-${s.ciHigh})` : ""}
                          </div>
                        )}
                        {s.riskReduction && (
                          <div className="text-xs font-bold text-emerald-700">
                            获益: {s.riskReduction}
                          </div>
                        )}
                        {s.rfs5Year && !s.riskReduction && (
                          <div className="text-xs font-bold text-emerald-600">
                            5年RFS: {s.rfs5Year}
                          </div>
                        )}
                        {!s.hr && !s.rfs5Year && !s.riskReduction && <span className="text-xs text-slate-400">定性证据</span>}
                      </td>

                      <td className="py-4 px-3 max-w-[200px]">
                        <div className="space-y-1">
                          {s.biomarkerDetails && (
                            <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded truncate">
                              🧬 {s.biomarkerDetails}
                            </div>
                          )}
                          {s.interventionArm && (
                            <div className="text-[10px] text-slate-600 truncate" title={s.interventionArm}>
                              💊 {s.interventionArm}
                            </div>
                          )}
                          {!s.biomarkerDetails && !s.interventionArm && (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 pl-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {s.doi && (
                            <a
                              href={`https://doi.org/${s.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-accent-blue hover:underline px-2 py-1 bg-blue-50 rounded"
                            >
                              DOI ↗
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(s.id, s.title)}
                            className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, color }: { icon: string; title: string; value: string | number; subtitle: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-[11px] font-semibold text-slate-400">{title}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}
