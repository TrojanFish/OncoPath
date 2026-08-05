"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import EvidenceReport from "@/components/EvidenceReport";
import KnowledgeMapPreview from "@/components/KnowledgeMapPreview";
import AuthModal from "@/components/AuthModal";
import StatsBanner from "@/components/StatsBanner";
import StudyCard from "@/components/StudyCard";
import DashboardView from "@/components/DashboardView";
import { FEATURED_STUDIES } from "@/lib/evidence-data";
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
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) setUserEmail(email);
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
      <div className="min-h-screen bg-grid radial-overlay overflow-x-hidden">
        <nav className="glass-strong fixed top-0 left-0 right-0 z-50 px-6 py-4">
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
        <div className="pt-24 pb-16 flex justify-center w-full">
          <div className="w-full">
            <ProfileForm onSubmit={handleProfileSubmit} />
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
          scrollY > 50 ? "glass-strong shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <LogoMark />
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">功能</NavLink>
            <NavLink href="#evidence">证据库</NavLink>
            <NavLink href="#studies">研究</NavLink>
            <NavLink href="#knowledge">知识图谱</NavLink>
          </div>
          <div className="flex items-center gap-4">
            {userEmail ? (
              <div className="hidden md:flex items-center gap-4 border-r border-white/10 pr-4 mr-1">
                  <span className="text-sm text-text-muted">{userEmail}</span>
                  <button
                    onClick={() => setAppState("dashboard")}
                    className="text-sm font-medium text-accent-blue hover:text-accent-blue-light transition-colors"
                  >
                    历史病例
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("email");
                      setUserEmail(null);
                    }}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                  >
                    退出
                  </button>
                </div>
              ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden md:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors border-r border-white/10 pr-4 mr-1"
              >
                登录 / 注册
              </button>
            )}
            <button
              onClick={() => setAppState("input")}
              id="nav-start-btn"
              className="btn-primary px-5 py-2 rounded-lg text-sm font-medium cursor-pointer"
            >
              开始分析
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-grid radial-overlay overflow-hidden pt-24 pb-12"
      >
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #4f8ef7 0%, transparent 70%)",
              transform: `translateY(${scrollY * 0.1}px)`,
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8"
            style={{
              background: "radial-gradient(circle, #00d4aa 0%, transparent 70%)",
              transform: `translateY(${scrollY * -0.05}px)`,
            }}
          />
          <FloatingParticles />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-text-secondary mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span>循证医学知识平台 · 每条结论均有来源</span>
          </div>

          {/* Main headline */}
          <h1 className="display-xl mb-6 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
            理解你的{" "}
            <span className="text-gradient">病理报告</span>
            <br />
            通过已发表的国际研究
          </h1>

          <p className="text-xl text-text-secondary mb-4 max-w-2xl mx-auto animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
            不是 AI 算命。而是把患者放到已经发表的研究里面。
          </p>

          <p className="text-base text-text-muted mb-12 max-w-xl mx-auto animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
            输入你的病理资料，看看国际研究如何评价你的情况。
            每一句解释，都能点进去看论文。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
            <button
              onClick={() => setAppState("input")}
              id="hero-start-btn"
              className="btn-primary px-8 py-4 rounded-xl text-base font-semibold cursor-pointer flex items-center gap-2 animate-pulse-glow"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              输入病理资料
            </button>
            <a
              href="#features"
              id="hero-learn-btn"
              className="btn-secondary px-8 py-4 rounded-xl text-base font-semibold flex items-center gap-2"
            >
              了解更多
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

          {/* Evidence preview card */}
          <EvidencePreviewCard />
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-text-muted">
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* Stats Banner */}
      <StatsBanner />

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-grid">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="核心功能"
            title="循证医学导航"
            subtitle="不是 AI 给你打分，而是国际研究帮你定位"
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            <FeatureCard
              icon="🔬"
              title="病理解析"
              desc="上传病理报告，AI 自动识别关键指标：TNM 分期、STAS、LVI、VPI、IASLC 分级、病理亚型等。"
              color="blue"
            />
            <FeatureCard
              icon="🎯"
              title="国际研究匹配"
              desc="基于你的病理特征，在数千篇已收录的研究中找到与你最相似的患者群体，告诉你他们的预后数据。"
              color="teal"
            />
            <FeatureCard
              icon="📊"
              title="证据可视化"
              desc="用雷达图、时间线、证据等级星标等可视化方式呈现你的风险因素，直观理解每个指标的含义。"
              color="purple"
            />
            <FeatureCard
              icon="📚"
              title="实时研究更新"
              desc="每日自动从 PubMed、Europe PMC 同步最新研究，证据库持续增长，你看到的始终是最新证据。"
              color="amber"
            />
            <FeatureCard
              icon="🔗"
              title="来源可追溯"
              desc="每一句解释后面都标注来自哪篇论文、几例患者、什么证据等级。点击即可查看原文信息。"
              color="green"
            />
            <FeatureCard
              icon="👨‍⚕️"
              title="医生模式"
              desc="医生输入病理信息，一分钟内获得该患者在国际研究中的定位，辅助门诊科普和随访规划。"
              color="red"
            />
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section id="evidence" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="证据库"
            title="每一句话，都有出处"
            subtitle="不是黑盒算法，是真正的循证知识图谱"
          />

          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <EvidenceExampleCard
              factor="STAS（气道播散）"
              type="pathology"
              status="negative"
              statusLabel="阴性"
              statusColor="green"
              summary="在收录的 18 项研究（共 25,467 例患者）中，STAS 阴性与显著更低的复发风险相关。"
              detail="Meta 分析显示 STAS 阳性患者复发风险增加约 1.87 倍（HR=1.87, 95%CI 1.52-2.29）。你的 STAS 阴性状态属于低风险组。"
              sources={[
                { journal: "Chest", year: 2021, type: "Meta分析", patients: 25467, stars: 5 },
                { journal: "J Clin Oncol", year: 2017, type: "多中心", patients: 1113, stars: 4 },
              ]}
            />
            <EvidenceExampleCard
              factor="CTR（实性成分比例）"
              type="imaging"
              status="0.42"
              statusLabel="低CTR"
              statusColor="green"
              summary="CTR < 0.5 属于混合磨玻璃低风险组，在 22 项相关研究中，5 年无复发生存率约 89-98%。"
              detail="JCOG0804 前瞻性研究证实，CTR ≤ 0.25 的患者 5 年 RFS 达 99.7%，支持亚肺叶切除的安全性。"
              sources={[
                { journal: "J Thorac Oncol", year: 2021, type: "多中心前瞻", patients: 1024, stars: 4 },
                { journal: "Chest", year: 2019, type: "多中心回顾", patients: 2153, stars: 4 },
              ]}
            />
          </div>

          {/* Principle box */}
          <div className="mt-12 glass rounded-2xl p-8 border border-accent-blue/20 text-center">
            <div className="text-4xl mb-4">⚖️</div>
            <blockquote className="text-xl font-medium text-text-primary mb-3">
              "每一条医学结论，都必须可以追溯到证据。"
            </blockquote>
            <p className="text-text-secondary">
              — OncoPath 核心设计原则
            </p>
          </div>
        </div>
      </section>

      {/* Studies Section */}
      <section id="studies" className="py-24 px-6 bg-grid">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="研究库"
            title="来自顶级期刊的真实研究"
            subtitle="JTO、Chest、Lancet、JCO 等权威来源，持续更新"
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {FEATURED_STUDIES.slice(0, 6).map((study) => (
              <StudyCard key={study.id} study={study} compact />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/studies"
              id="view-all-studies-btn"
              className="btn-secondary px-6 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
            >
              查看全部研究库
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Knowledge Map Preview */}
      <section id="knowledge" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="知识图谱"
            title="肺癌循证知识图谱"
            subtitle="点击任何因素，查看全部相关研究"
          />
          <KnowledgeMapPreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 radial-overlay" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="display-lg mb-6">
            理解你的情况，
            <span className="text-gradient"> 从循证开始</span>
          </h2>
          <CtaStats />
          <p className="text-base text-text-muted mb-12 max-w-xl mx-auto">
            输入你的病理特征，系统将在已发表的研究中为你精准定位，
            并用可理解的语言解释每一个指标的含义。
          </p>
          <button
            onClick={() => setAppState("input")}
            id="cta-start-btn"
            className="btn-primary px-10 py-5 rounded-2xl text-lg font-semibold cursor-pointer animate-pulse-glow"
          >
            立即开始分析
          </button>
          <p className="mt-6 text-text-muted text-sm">
            完全免费 · 无需注册 · 结论均有文献来源
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-border-color py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <LogoMark />
              <p className="mt-3 text-text-muted text-sm leading-relaxed">
                肺癌循证知识平台。帮助患者理解医学研究，而不是替代医生。
              </p>
            </div>
            <FooterCol title="功能" links={[
              { label: "病理分析", href: "#" },
              { label: "研究匹配", href: "#" },
              { label: "知识图谱", href: "/knowledge" },
              { label: "研究库", href: "/studies" },
            ]} />
            <FooterCol title="关于" links={[
              { label: "项目理念", href: "#" },
              { label: "数据来源", href: "#" },
              { label: "证据方法论", href: "#" },
            ]} />
            <FooterCol title="联系" links={[
              { label: "医生合作", href: "#" },
              { label: "反馈建议", href: "#" },
            ]} />
          </div>
          <div className="evidence-divider mb-6" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-text-muted text-xs">
            <p>© 2026 OncoPath. All rights reserved.</p>
            <p className="text-center max-w-lg">
              ⚠️ 重要声明：本平台提供的信息仅供教育参考，不构成医疗诊断或治疗建议。所有医疗决策请咨询您的主治医生。
            </p>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={(token, email) => {
            localStorage.setItem("token", token);
            localStorage.setItem("email", email);
            setUserEmail(email);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}

// ============ Sub-components ============

function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-teal flex items-center justify-center text-white font-bold text-sm">
        O
      </div>
      <span className="font-semibold text-text-primary">
        Onco<span className="text-gradient">Path</span>
      </span>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-text-secondary hover:text-text-primary transition-colors text-sm"
    >
      {children}
    </a>
  );
}

function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-accent-blue mb-6 border border-accent-blue/20">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
        {badge}
      </div>
      <h2 className="display-md text-text-primary mb-4">{title}</h2>
      <p className="text-text-secondary text-lg max-w-xl mx-auto">{subtitle}</p>
    </div>
  );
}

const colorMap: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
  teal: "from-teal-500/20 to-teal-600/5 border-teal-500/20",
  purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
  amber: "from-amber-500/20 to-amber-600/5 border-amber-500/20",
  green: "from-green-500/20 to-green-600/5 border-green-500/20",
  red: "from-red-500/20 to-red-600/5 border-red-500/20",
};

function FeatureCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
  return (
    <div className={`card-hover rounded-2xl p-6 border bg-gradient-to-br ${colorMap[color]} relative overflow-hidden`}>
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-semibold text-text-primary mb-2 text-lg">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

import { fetchStats } from "@/lib/api";

function CtaStats() {
  const [stats, setStats] = useState<{ total_studies: number; total_patients: number } | null>(null);
  useEffect(() => {
    fetchStats().then((s) => { if (s) setStats(s); });
  }, []);
  const studiesText = stats ? `${stats.total_studies} 项研究` : "持续更新中";
  const patientsText = stats && stats.total_patients > 0
    ? `${new Intl.NumberFormat("en-US").format(stats.total_patients)}+ 例患者`
    : "覆盖海量患者";
  return (
    <p className="text-xl text-text-secondary mb-4 max-w-2xl mx-auto">
      数据库已收录{" "}
      <span className="text-gradient font-semibold">{studiesText}</span>，覆盖{" "}
      <span className="text-gradient font-semibold">{patientsText}</span>。
    </p>
  );
}

function EvidencePreviewCard() {
  const [stats, setStats] = useState({ studies: 32, patients: "6,800+" });

  useEffect(() => {
    fetchStats().then(data => {
      if (data) {
        setStats({ 
          studies: data.total_studies, 
          // Format patients string e.g. "187,450+"
          patients: new Intl.NumberFormat('en-US').format(data.total_patients) + "+" 
        });
      }
    });
  }, []);

  return (
    <div className="glass rounded-2xl p-6 border border-accent-blue/20 max-w-2xl mx-auto text-left glow-blue animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-teal/20 flex items-center justify-center text-lg">
          👤
        </div>
        <div>
          <div className="font-medium text-text-primary text-sm">示例患者画像</div>
          <div className="text-text-muted text-xs">IA1 期 · 混合磨玻璃 · 女性 · 38岁</div>
        </div>
        <div className="ml-auto">
          <span className="risk-badge-low text-xs px-3 py-1 rounded-full border font-medium">
            低风险组
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "匹配研究", value: `${stats.studies}篇`, sub: "国际顶级期刊" },
          { label: "相似患者", value: stats.patients, sub: "例已纳入研究" },
          { label: "5年RFS", value: "89-98%", sub: "基于现有研究" },
        ].map((item) => (
          <div key={item.label} className="glass rounded-xl p-3 text-center border border-white/5">
            <div className="text-lg font-bold text-gradient">{item.value}</div>
            <div className="text-text-primary text-xs font-medium">{item.label}</div>
            <div className="text-text-muted text-xs">{item.sub}</div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 bg-green-500/5 rounded-xl p-3 border border-green-500/15">
        <span className="text-green-400 mt-0.5">●</span>
        <p className="text-text-secondary text-xs leading-relaxed">
          <span className="text-green-400 font-medium">STAS 阴性 · CTR 0.42 · N0 </span>
          — 在 18 项研究（共 25,467 例）中，属于低复发风险亚群。
          <span className="text-text-muted ml-1">→ Chest 2021 (Meta)</span>
        </p>
      </div>
    </div>
  );
}

function EvidenceExampleCard({
  factor, type, status, statusLabel, statusColor,
  summary, detail, sources
}: {
  factor: string;
  type: string;
  status: string;
  statusLabel: string;
  statusColor: "green" | "amber" | "red";
  summary: string;
  detail: string;
  sources: Array<{ journal: string; year: number; type: string; patients: number; stars: number }>;
}) {
  return (
    <div className="glass rounded-2xl p-6 card-hover border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-text-muted mb-1 uppercase tracking-wider">{type === "pathology" ? "病理指标" : "影像指标"}</div>
          <h3 className="font-semibold text-text-primary">{factor}</h3>
        </div>
        <span className={`risk-badge-${statusColor} text-sm px-3 py-1 rounded-full border font-medium`}>
          {status} · {statusLabel}
        </span>
      </div>
      <p className="text-text-secondary text-sm mb-3 leading-relaxed">{summary}</p>
      <div className="bg-accent-blue/5 rounded-xl p-4 border border-accent-blue/10 mb-4">
        <p className="text-text-primary text-sm leading-relaxed">{detail}</p>
      </div>
      <div className="space-y-2">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-accent-blue font-medium">{s.journal}</span>
              <span className="text-text-muted">{s.year}</span>
              <span className="glass px-2 py-0.5 rounded text-text-muted border border-white/5">{s.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-muted">{s.patients.toLocaleString()}例</span>
              <StarRating count={s.stars} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          className={i < count ? "star-filled" : "star-empty"}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h4 className="font-medium text-text-primary mb-3 text-sm">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-text-muted hover:text-text-secondary transition-colors text-sm">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
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


