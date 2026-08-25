"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import Footer from "@/components/Footer";


export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span>返回首页</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">生效日期：2026年8月16日</span>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-slate-200 space-y-10">
          
          {/* Header */}
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>个人信息保护法 (PIPL) 合规认证</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              OncoPath 隐私政策与医疗数据安全说明
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
              OncoPath（以下简称“本平台”）深知个人健康医疗数据对您的极端重要性。我们严格遵守《中华人民共和国个人信息保护法》(PIPL)、《中华人民共和国数据安全法》以及国际医疗数据去标识化标准，承诺对您的病理、影像及就诊档案提供金融与医疗级的隐私安全保护。
            </p>
          </div>

          {/* Core Sections (Unified Design System) */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">1</span>
                <span>我们如何收集与使用您的信息</span>
              </h2>
              <p>
                为了为您提供高精度的循证医学文献匹配、4D知识图谱导航及专属就诊问诊便签服务，我们仅在您主动上传或输入时处理以下必要临床特征：
              </p>
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>病理与解剖特征</strong>：肿瘤实性大小 (cm)、CTR 浸润比、TNM 分期、切缘状态 (R0)、淋巴结转移状态 (N分期)；</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>高危分子与组织学特征</strong>：气道播散 (STAS)、脏层胸膜侵犯 (VPI)、脉管瘤栓 (LVI)、IASLC 病理分级及驱动基因状态 (EGFR/ALK等)；</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>非身份识别基础信息</strong>：年龄段、生理性别、手术切除方式（如肺叶/肺段）。</span>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">2</span>
                <span>医疗数据“去标识化与脱敏”机制（核心安全锁）</span>
              </h2>
              <p>
                本平台内置<strong>智能医疗 PII 隐私脱敏引擎</strong>：当您上传纸质报告照片或粘贴病历文本时，系统在客户端与网关层会自动对患者<strong>真实姓名、身份证号码、电话号码、医院住院号/病案流水号</strong>执行不可逆掩码脱敏。
              </p>
              <div className="bg-sky-50/70 p-4 sm:p-5 rounded-2xl border border-sky-200/80 text-xs sm:text-sm text-sky-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-sky-900">
                  <Lock className="w-3.5 h-3.5 text-sky-700" />
                  <span>自动掩码规则示例</span>
                </div>
                <p className="text-sky-800 leading-relaxed">
                  身份证号自动处理为 <code>110101********1234</code>，手机号处理为 <code>138****5678</code>，真实姓名处理为 <code>张*峰</code>。发送给 AI 循证引擎的所有上下文均为去标识化后的纯粹临床参数。
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">3</span>
                <span>数据存储方式与“本地优先 (Local-First)”架构</span>
              </h2>
              <p>
                本平台采用<strong>端侧本地优先存储</strong>架构。您的病理档案、循证分析记录与问诊清单默认保存在您所使用设备的浏览器本地缓存（LocalStorage）中。若您使用免登录访客模式，系统仅分配匿名生成的设备随机标识符（Guest ID），不与任何第三方实名身份进行关联。
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">4</span>
                <span>绝不向第三方共享或商业化出售数据</span>
              </h2>
              <p>
                我们做出严格承诺：<strong>绝不向任何医药企业、商业保险机构、广告商或数据中介出售、出租或非法共享您的健康档案与个人信息</strong>。所有数据仅用于为您实时生成基于循证指南的学术解读与辅助便签。
              </p>
            </section>

            {/* Section 5 (Special PIPL Right-to-be-Forgotten Alert) */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-xs font-black shrink-0">5</span>
                <span>您的权利：随时彻底删除与被遗忘权</span>
              </h2>
              <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200/80 text-xs sm:text-sm text-amber-900 space-y-2">
                <p>
                  您对自己的健康数据拥有完全的自主控制权。您可以随时前往【个人档案】页面点击<strong>“清空/注销档案”</strong>，一键彻底物理销毁本地与云端暂存的所有数据记录。
                </p>
              </div>
            </section>

          </div>

          {/* Quick Sub-Links */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>© 2026 OncoPath 隐私安全保护体系</div>
            <div className="flex items-center gap-3">
              <Link href="/about" className="text-blue-600 hover:underline font-medium">关于我们与初衷</Link>
              <span>·</span>
              <Link href="/terms" className="text-blue-600 hover:underline font-medium">查看《服务协议与免责声明》</Link>
            </div>
          </div>

        </div>

      </div>

      {/* Unified Global Footer */}
      <div className="mt-16 -mx-4 sm:-mx-6 lg:-mx-8 -mb-10 sm:-mb-14">
        <Footer maxWidth="max-w-4xl" />
      </div>
    </div>
  );
}


