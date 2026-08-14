"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import EvidenceReport from "@/components/EvidenceReport";
import KnowledgeMapPreview from "@/components/KnowledgeMapPreview";
import AuthModal from "@/components/AuthModal";
import ConsentModal from "@/components/ConsentModal";
import StatsBanner from "@/components/StatsBanner";
import StudyCard from "@/components/StudyCard";
import DashboardView from "@/components/DashboardView";
import { FEATURED_STUDIES } from "@/lib/evidence-data";
import UserAvatar from "@/components/UserAvatar";
import type { PatientProfile } from "@/lib/types";
export type { PatientProfile };

type AppState = "landing" | "input" | "report" | "dashboard";

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [reportJson, setReportJson] = useState<any>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = () => {
      setUserEmail(localStorage.getItem("email"));
    };
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    return () => window.removeEventListener("auth-change", checkAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProfileSubmit = (profile: PatientProfile) => {
    setPatientProfile(profile);
    setReportJson(null);
    setAppState("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (appState === "report" && patientProfile) {
    return (
      <EvidenceReport
        profile={patientProfile}
        initialReportJson={reportJson}
        onBack={() => {
          setAppState("input");
          setPatientProfile(null);
          setReportJson(null);
        }}
      />
    );
  }

  if (appState === "dashboard") {
    return (
      <DashboardView
        onBack={() => setAppState("landing")}
        onViewReport={(profile, json) => {
          setPatientProfile(profile);
          setReportJson(json);
          setAppState("report");
        }}
      />
    );
  }

  if (appState === "input") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setAppState("landing")}
              className="flex items-center gap-2 text-accent-blue hover:text-accent-blue-light transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <LogoMark />
            </button>
            <span className="text-text-secondary text-sm">输入病理资料</span>
          </div>
        </nav>
        <div className="pt-28 md:pt-32 pb-16 flex justify-center w-full">
          <div className="w-full">
            <ProfileForm onSubmit={handleProfileSubmit} />
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      <ConsentModal />
      
      {/* Floating Island Navigation Bar */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-7 py-3 rounded-2xl sm:rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all duration-300 pointer-events-auto hover:border-slate-300">
          <LogoMark />
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7">
            <NavLink href="#workflow">工作流</NavLink>
            <NavLink href="#difference">循证优势</NavLink>
            <NavLink href="#studies">研究库</NavLink>
            <NavLink href="#knowledge">知识图谱</NavLink>
            <NavLink href="/resources">学术导航</NavLink>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            <UserAvatar />
            
            <Link
              href="/profile"
              id="nav-start-btn"
              className="hidden sm:inline-flex btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-sm"
            >
              建立癌症档案 ➔
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none"
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

      {/* Mobile Slide-Over Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col justify-between animate-fade-in-up border-l border-slate-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <LogoMark />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  系统功能导航
                </div>
                <Link
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span className="text-lg">⚡</span>
                  <span>3步工作流</span>
                </Link>
                <Link
                  href="/knowledge"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span className="text-lg">🗺️</span>
                  <span>4D 知识图谱</span>
                </Link>
                <Link
                  href="/studies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span className="text-lg">📚</span>
                  <span>国际研究库</span>
                </Link>
                <Link
                  href="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span className="text-lg">📖</span>
                  <span>学术导航与防坑</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span className="text-lg">📋</span>
                  <span>我的癌症档案</span>
                </Link>
              </div>

              <div className="pt-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full btn-primary py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  <span>🔬 立即解析病理报告 ➔</span>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center">
              <div className="text-[11px] text-slate-400">
                © 2026 OncoPath · 严格同行评审循证医学知识库
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Act 1: Hero Section (2-Column Split Layout matching Telemedicine Demo) */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-blue-50/40 via-slate-50 to-white overflow-hidden pt-28 pb-16"
      >
        {/* Ambient background glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(circle, #38bdf8 0%, #0d9488 40%, transparent 70%)",
              transform: `translateY(${scrollY * 0.08}px)`,
            }}
          />
          <div
            className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
            style={{
              background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
              transform: `translateY(${scrollY * -0.04}px)`,
            }}
          />
          <FloatingParticles />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Trust Badge & CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200/80 shadow-xs animate-fade-in-up">
                <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-[10px]">✓</span>
                <span>已收录 500,000+ 例临床病例 · 100% 顶刊出处可溯</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight animate-fade-in-up stagger-1">
                循证医学，让病理报告
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500">
                  清晰透彻 · 触手可及
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl animate-fade-in-up stagger-2">
                不再面对晦涩冰冷的医学术语盲目焦虑。AI 自动结构化提取 TNM 分期、STAS 与分子靶点，无缝匹配 JTO、Lancet、JCO 顶级期刊真实患者队列与生存数据。
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 animate-fade-in-up stagger-3">
                <Link
                  href="/profile"
                  id="hero-start-btn"
                  className="btn-primary px-7 py-3.5 rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>立即建立专属档案</span>
                </Link>
                <Link
                  href="/studies"
                  id="hero-learn-btn"
                  className="btn-secondary px-6 py-3.5 rounded-2xl text-base font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <span>📖 浏览国际研究库</span>
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 max-w-lg animate-fade-in-up stagger-4">
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">500,000+</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">循证病例队列</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-blue-600 tabular-nums">3,000+</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">同行评审文献</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-teal-600 tabular-nums">100%</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">DOI 全溯源</div>
                </div>
              </div>

            </div>

            {/* Right Column: High-Impact Telemedicine Clinical Mockup */}
            <div className="lg:col-span-5 relative animate-fade-in-up stagger-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white group">
                
                {/* Hero Consultation Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src="/hero-consultation.jpg"
                    alt="OncoPath 肿瘤循证推演平台"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Top-Right Patient Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div className="text-[11px] font-bold text-slate-800">
                    IA1 期 · STAS 阴性 · 低风险
                  </div>
                </div>

                {/* Floating Bottom-Left Doctor Consultation Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/doctor-avatar.jpg"
                      alt="林美 教授"
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>林美 教授</span>
                        <span className="text-[10px] text-slate-500 font-normal">主任医师 / 肿瘤病理专家</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        正在基于 JCOG0804 队列进行循证推演
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live 推演中
                    </span>
                  </div>
                </div>

              </div>

              {/* Secondary Floating Mini Metric Card */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xl items-center gap-3 z-20">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent-blue flex items-center justify-center text-xl shrink-0">
                  📊
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">JCOG0804 5年无复发率</div>
                  <div className="text-sm font-extrabold text-slate-900 tabular-nums">99.7% (RFS) · 亚肺叶切除获益</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Live Animated Database Stats Banner */}
      <StatsBanner />

      {/* Act 2: 3-Step Clean Workflow & Core Difference vs General AI */}
      <section id="workflow" className="py-24 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="循证工作流"
            title="3步极简定位你的专属预后"
            subtitle="从一张病理报告，到国际同行评审研究的精准人群匹配"
          />

          {/* 3 Step Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all card-hover relative group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">上传或录入病理报告</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                拍摄上传病理报告照片或填写 TNM、气道播散（STAS）、胸膜侵犯（VPI）与分子靶点等指标。
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all card-hover relative group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-black mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">匹配国际前瞻性队列</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                在 JTO、Chest、Lancet 等数千项多中心研究中检索与您完全吻合的亚群队列，获取客观生存率与复发风险比（HR）。
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all card-hover relative group">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl font-black mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">生成门诊就医决策清单</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                输出四维红绿灯风险矩阵与结构化问诊清单，支持一键复制到剪贴板，方便与您的主管医生高效沟通。
              </p>
            </div>
          </div>

          {/* Core Differentiation vs General LLMs Box */}
          <div id="difference" className="mt-16 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 rounded-3xl p-8 sm:p-12 border border-blue-200/80 shadow-sm">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-100/80 px-3 py-1 rounded-full">
                EBM VS GENERAL AI · 为什么超越通用大模型？
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                这与直接问 ChatGPT 有何本质区别？
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                医疗决策不容容忍 AI 幻觉与概率瞎猜，每一句解释都必须能够追溯到原始同行评审论文。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* General AI box */}
              <div className="bg-white/80 p-6 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <span>❌</span>
                  <span>普通通用大模型 (如 ChatGPT / 聊天AI)</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500">•</span>
                    <span>易产生<strong>AI 幻觉</strong>，凭空编造不存在的统计数据或虚构医学文献。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500">•</span>
                    <span>给出的百分比是模糊的概率猜测（如“有20%复发可能”），缺乏样本量与真实队列支持。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500">•</span>
                    <span>容易越权给出误导性的绝对寿命预测，加重患者焦虑。</span>
                  </li>
                </ul>
              </div>

              {/* OncoPath Box */}
              <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span>✅</span>
                  <span>OncoPath 严谨循证医学决策系统</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span><strong>100% 文献可溯</strong>：每一句话均带有 DOI 与 PubMed 直达链接。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span><strong>严密效应量统计</strong>：依据 HR (95% CI) 与多中心 5yr RFS 真实患者队列。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600">✓</span>
                    <span><strong>知情同意与门诊协同</strong>：输出红绿灯矩阵与医生问诊清单，科学赋能医患沟通。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Act 3: Peer-Reviewed International Studies Library */}
      <section id="studies" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="权威研究库"
            title="来自国际顶级期刊的真实研究"
            subtitle="JTO、Chest、Lancet Oncology、JCO 等核心期刊文献，每一条预后结论皆有出处"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {FEATURED_STUDIES.slice(0, 6).map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/studies"
              id="view-all-studies-btn"
              className="btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold inline-flex items-center gap-2 shadow-md"
            >
              <span>查看全部已收录国际研究库 ({FEATURED_STUDIES.length}篇+) ➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Act 4: 4D Knowledge Graph Sandbox */}
      <section id="knowledge" className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="动态推演沙盘"
            title="肺癌循证知识图谱"
            subtitle="点击任意病理特征与靶点，动态推演复发路径与国际前沿治疗方案"
          />

          <div className="mt-14 bg-white rounded-3xl p-2 border border-slate-200 shadow-xl overflow-hidden">
            <KnowledgeMapPreview />
          </div>
        </div>
      </section>

      {/* Act 5: Frequently Asked Questions & Final Conversion CTA */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="患者与家属答疑"
            title="常见问题解答 (FAQ)"
            subtitle="了解如何正确使用 OncoPath 辅助您的诊疗沟通"
          />

          <div className="mt-12 space-y-4">
            <FaqItem
              q="我该如何获取我的病理报告参数？"
              a="在您完成手术或穿刺活检后，医院病理科会出具一份正式的《病理组织学诊断报告》。您只需使用手机拍摄报告全貌，或在个人档案中直接填写报告上注明的 TNM 分期、STAS（气道播散）及分化程度即可。"
            />
            <FaqItem
              q="系统给出的数据会替代主治医生的诊断吗？"
              a="绝对不会。OncoPath 是一个纯粹的循证医学科普与信息平权工具。我们帮助您把艰涩的医学术语翻译为清晰的国际顶级研究数据，并生成一份《门诊就医问诊清单》，帮助您在复查或问诊时与主治医生更加高效地沟通。"
            />
            <FaqItem
              q="如何将 OncoPath 作为手机 App 使用？"
              a="本站已全面支持 PWA (Progressive Web App) 技术。在 iPhone 的 Safari 浏览器中点击底部的【分享】按钮并选择【添加到主屏幕】；在安卓 Chrome 中点击右上角菜单选择【添加到主屏幕】，即可像原生 App 一样全屏沉浸使用。"
            />
          </div>

          {/* Final Action Card */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              准备好理解您的病理档案了吗？
            </h3>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              只需一分钟，让国际顶级医学研究为您点亮清晰、理性的抗癌导航之路。
            </p>
            <div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-extrabold text-base shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>🔬 立即免费建立专属癌症档案 ➔</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <LogoMark />
          <div className="text-xs text-slate-500 text-center md:text-right space-y-1">
            <div>© 2026 OncoPath · 严格同行评审肺癌循证知识与决策导航系统</div>
            <div>所有数据均可追溯至 JTO、Lancet、JCO、Chest 等国际顶级学术期刊。</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LogoMark() {
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-accent-blue transition-colors"
    >
      {children}
    </a>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-blue-50 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 mb-3 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
        {badge}
      </div>
      <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{title}</h2>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{subtitle}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:text-accent-blue transition-colors"
      >
        <span>{q}</span>
        <span className="text-slate-400 text-lg transition-transform duration-200 shrink-0">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100">
          {a}
        </div>
      )}
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 8,
  }));

  return (
    <div className="absolute inset-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-accent-blue/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
