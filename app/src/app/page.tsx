"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Check, 
  BookOpen, 
  TrendingUp, 
  XCircle, 
  CheckCircle2, 
  Scan, 
  Microscope, 
  Dna, 
  HeartPulse, 
  Compass, 
  FileText 
} from "lucide-react";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";
import ConsentModal from "@/components/ConsentModal";
import StatsBanner from "@/components/StatsBanner";
import StudyCard from "@/components/StudyCard";
import { FEATURED_STUDIES } from "@/lib/evidence-data";
import type { PatientProfile } from "@/lib/types";
export type { PatientProfile };

// Dynamically import the heavy 4D Knowledge Graph canvas to drastically slim the initial homepage JS chunk
const KnowledgeMapPreview = dynamic(() => import("@/components/KnowledgeMapPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-3xl bg-slate-100/80 border border-slate-200 animate-pulse flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-600">正在按需加载 4D 循证知识图谱推演引擎...</span>
    </div>
  ),
});

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUserAndProfile = () => {
      if (typeof window === "undefined") return;
      const email = localStorage.getItem("email") || sessionStorage.getItem("email");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const profile = localStorage.getItem("oncopath_profile");
      setUserEmail(email || null);
      setHasProfile(!!profile || !!email || !!token);
    };

    checkUserAndProfile();
    window.addEventListener("auth-change", checkUserAndProfile);
    return () => {
      window.removeEventListener("auth-change", checkUserAndProfile);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <ConsentModal />
      
      {/* Unified Global Floating Island Navigation Bar */}
      <SubpageNavbar />

      <main className="flex-1">
        {/* Act 1: Hero Section (2-Column Split Layout matching Telemedicine Demo) */}
        <section
          ref={heroRef}
          className="relative min-h-[85vh] flex items-center bg-gradient-to-b from-blue-50/40 via-slate-50 to-white overflow-hidden pt-28 pb-16"
        >
          {/* Ambient background glow orbs with pure CSS animation (Zero JS main-thread scroll lag) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl animate-pulse"
              style={{
                background: "radial-gradient(circle, #38bdf8 0%, #0d9488 40%, transparent 70%)",
              }}
            />
            <div
              className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
              style={{
                background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-2.5 sm:px-6 w-full">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            
            {/* Left Column: Headline, Trust Badge & CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full text-xs font-bold text-sky-700 border border-sky-200/80 shadow-xs animate-fade-in-up">
                <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-sky-600" />
                </span>
                <span>已收录 500,000+ 例临床病例 · 100% 顶刊出处可溯</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight animate-fade-in-up stagger-1">
                循证医学，让影像与病理报告
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500">
                  清晰透彻 · 触手可及
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl animate-fade-in-up stagger-2">
                不再面对晦涩冰冷的医学术语盲目焦虑。AI 自动结构化提取 CT 影像征象、TNM 分期与分子靶点，无缝匹配 JTO、Lancet、JCO 顶级期刊真实患者队列与生存数据。
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2 animate-fade-in-up stagger-3">
                <Link
                  href="/profile"
                  className="btn-primary px-7 py-3.5 rounded-2xl text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-5 h-5" />
                  <span>{hasProfile || userEmail ? "进入我的临床数字档案" : "建立临床数字档案"}</span>
                </Link>
                <Link
                  href="/wiki"
                  className="btn-secondary px-6 py-3.5 rounded-2xl text-base font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>探索循证百科</span>
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent-blue flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-accent-blue" />
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
      <section id="workflow" className="py-16 sm:py-24 px-2.5 sm:px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            badge="循证工作流"
            title="3步极简定位你的专属预后"
            subtitle="从一张病理报告，到国际同行评审研究的精准人群匹配"
          />

          {/* 3 Step Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-3.5 sm:p-6 md:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition-all card-hover relative group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-black mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">上传或录入病理报告</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                拍摄上传病理报告照片或填写 TNM、气道播散（STAS）、胸膜侵犯（VPI）与分子靶点等指标。
              </p>
            </div>

            <div className="p-3.5 sm:p-6 md:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all card-hover relative group">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl font-black mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">匹配国际前瞻性队列</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                在 JTO、Chest、Lancet 等数千项多中心研究中检索与您完全吻合的亚群队列，获取客观生存率与复发风险比（HR）。
              </p>
            </div>

            <div className="p-3.5 sm:p-6 md:p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all card-hover relative group">
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
          <div id="difference" className="mt-16 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 rounded-3xl p-3.5 sm:p-8 md:p-12 border border-blue-200/80 shadow-sm">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-3.5 py-1 rounded-full border border-blue-200/60">
                ONCOPATH VS GENERAL AI · 为什么超越通用大模型？
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                这与直接问通用大模型有何本质区别？
              </h3>
              <p className="text-slate-600 text-sm mt-2">
                医疗决策不容容忍 AI 幻觉与概率猜测，每一句解释都必须能够追溯到原始同行评审论文。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* General AI box */}
              <div className="bg-white/80 p-6 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OncoPath 严谨循证医学决策系统</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>100% 文献可溯</strong>：每一句话均带有 DOI 与 PubMed 直达链接。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>严密效应量统计</strong>：依据 HR (95% CI) 与多中心 5yr RFS 真实患者队列。</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>知情同意与门诊协同</strong>：输出红绿灯矩阵与医生问诊清单，科学赋能医患沟通。</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Act 3: Peer-Reviewed International Studies Library */}
      <section id="studies" className="py-16 sm:py-24 px-2.5 sm:px-6 bg-slate-50">
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
              className="btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span>查看国际研究库</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Act 4: 4D Knowledge Graph Sandbox */}
      <section id="knowledge" className="py-16 sm:py-24 px-2.5 sm:px-6 bg-white border-y border-slate-100">
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

      {/* Act 4.5: OncoWiki Patient Evidence-Based Visual Encyclopedia Section */}
      <section id="wiki-showcase" className="py-16 sm:py-24 px-2.5 sm:px-6 bg-gradient-to-b from-white via-sky-50/25 to-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto space-y-14">
          <SectionHeader
            badge="循证视觉百科 · OncoWiki"
            title="大白话破译病理密码 · 从未知恐慌走向从容笃定"
            subtitle="拒绝冰冷晦涩的医学术语与网络谣言。我们用高精 SVG 微观解剖图解、生活化大白话比喻与全球顶级期刊真实队列，为您构筑坚实抗癌定力。"
          />

          {/* 4 Core Scenario Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: 肺结节消恐 */}
            <Link
              href="/wiki#category-nodule"
              className="bg-white rounded-3xl p-3.5 sm:p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                    <Scan className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    结节消恐 · 7个词条
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    我刚体检查出肺结节
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    体检提示磨玻璃、实性成分或毛刺？内含 Fleischner 随访决策树与磨玻璃 CTR 浸润模拟器。
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-xs font-bold text-emerald-700">
                进入结节专区
              </div>
            </Link>

            {/* Card 2: 术后病理密码 */}
            <Link
              href="/wiki#category-pathology"
              className="bg-white rounded-3xl p-3.5 sm:p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                    <Microscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    病理破译 · 6个词条
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    我刚拿到术后病理报告
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    STAS 气道播散、VPI 胸膜侵犯、LVI 脉管癌栓？用“蒲公英播种”等大白话比喻逐一解密。
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-xs font-bold text-blue-700">
                进入病理专区
              </div>
            </Link>

            {/* Card 3: 驱动基因靶向 */}
            <Link
              href="/wiki#category-genetics"
              className="bg-white rounded-3xl p-3.5 sm:p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:scale-110 transition-transform">
                    <Dna className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    驱动基因 · 83%阻断
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    医生让我做基因检测与靶向
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    EGFR 21/19、ALK 突变是什么？第三代靶向药（奥希替尼等）如何精准阻断复发通道。
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-xs font-bold text-purple-700">
                进入基因专区
              </div>
            </Link>

            {/* Card 4: 术后康复随访 */}
            <Link
              href="/wiki#category-recovery"
              className="bg-white rounded-3xl p-3.5 sm:p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                    <HeartPulse className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    康复调适 · 科学心安
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    术后身体恢复与长期随访
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    术后持续咳嗽、胸闷正常吗？肿瘤标志物轻微波动是不是复发了？科学解密指标真相。
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 text-xs font-bold text-amber-700">
                进入康复专区
              </div>
            </Link>
          </div>

          {/* Bottom Action Area */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/wiki"
              className="btn-primary px-8 py-3.5 rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>探索循证百科</span>
            </Link>
            <Link
              href="/resources"
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-600" />
              <span>查阅学术导航</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Act 5: Frequently Asked Questions & Final Conversion CTA */}
      <section className="py-16 sm:py-24 px-2.5 sm:px-6 bg-slate-50">
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
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-3.5 sm:p-8 md:p-12 text-white text-center shadow-xl space-y-6">
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              准备好科学破译您的临床报告了吗？
            </h3>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              只需一分钟，让国际顶级同行评审医学研究为您点亮清晰、从容的科学决策之路。
            </p>
            <div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-extrabold text-base shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <FileText className="w-5 h-5 text-blue-700" />
                <span>建立患者临床档案</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* Unified Global Footer */}
      <Footer maxWidth="max-w-7xl" />
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

const STATIC_PARTICLES = [
  { id: 0, x: 12, y: 18, size: 3, delay: 0.5, duration: 12 },
  { id: 1, x: 28, y: 72, size: 2, delay: 1.2, duration: 15 },
  { id: 2, x: 45, y: 33, size: 4, delay: 2.1, duration: 10 },
  { id: 3, x: 62, y: 85, size: 2.5, delay: 0.8, duration: 14 },
  { id: 4, x: 78, y: 22, size: 3.5, delay: 3.0, duration: 16 },
  { id: 5, x: 89, y: 64, size: 2, delay: 1.8, duration: 11 },
  { id: 6, x: 15, y: 55, size: 3, delay: 2.5, duration: 13 },
  { id: 7, x: 52, y: 14, size: 2.2, delay: 0.2, duration: 17 },
  { id: 8, x: 35, y: 90, size: 3.8, delay: 3.4, duration: 9 },
  { id: 9, x: 70, y: 48, size: 2, delay: 1.5, duration: 15 },
  { id: 10, x: 82, y: 80, size: 3, delay: 2.8, duration: 12 },
  { id: 11, x: 95, y: 30, size: 2.5, delay: 0.6, duration: 14 },
];

function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {STATIC_PARTICLES.map((p) => (
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

