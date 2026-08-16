"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200">
        
        {/* Navigation Back */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span>← 返回首页</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">生效日期：2026年8月16日</span>
        </div>

        {/* Title */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <span>🛡️ 个人信息保护法 (PIPL) 合规认证</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            OncoPath 隐私政策与医疗数据安全说明
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            OncoPath（以下简称“本平台”）深知个人健康医疗数据对您的极端重要性。我们严格遵守《中华人民共和国个人信息保护法》(PIPL)、《中华人民共和国数据安全法》以及国际医疗数据去标识化标准，承诺对您的病理、影像及就诊档案提供金融与医疗级的隐私安全保护。
          </p>
        </div>

        {/* Core Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-700">
          
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
              <span>我们如何收集与使用您的信息</span>
            </h2>
            <p>
              为了为您提供高精度的循证医学文献匹配、4D知识图谱导航及专属就诊问诊便签服务，我们仅在您主动上传或输入时处理以下必要临床特征：
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li><strong>病理与解剖特征</strong>：肿瘤实性大小 (cm)、CTR 浸润比、TNM 分期、切缘状态 (R0)、淋巴结转移状态 (N分期)；</li>
              <li><strong>高危分子与组织学特征</strong>：气道播散 (STAS)、脏层胸膜侵犯 (VPI)、脉管瘤栓 (LVI)、IASLC 病理分级及驱动基因状态 (EGFR/ALK等)；</li>
              <li><strong>非身份识别基础信息</strong>：年龄段、生理性别、手术切除方式（如肺叶/肺段）。</li>
            </ul>
          </section>

          <section className="space-y-3 bg-sky-50/60 p-4 sm:p-5 rounded-2xl border border-sky-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-black">2</span>
              <span>医疗数据“去标识化与脱敏”机制（核心安全锁）</span>
            </h2>
            <p className="text-slate-700">
              本平台内置<strong>智能医疗 PII 隐私脱敏引擎</strong>：当您上传纸质报告照片或粘贴病历文本时，系统在客户端与网关层会自动对患者<strong>真实姓名、身份证号码、电话号码、医院住院号/病案流水号</strong>执行不可逆掩码脱敏（例如自动屏蔽为 <code>张*</code>、<code>110101********1234</code>）。发送给 AI 循证引擎的所有上下文均为去标识化后的纯粹临床参数。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">3</span>
              <span>数据存储方式与“本地优先 (Local-First)”架构</span>
            </h2>
            <p>
              本平台采用<strong>端侧本地优先存储</strong>架构。您的病理档案、循证分析记录与问诊清单默认保存在您所使用设备的浏览器本地缓存（LocalStorage）中。若您使用免登录访客模式，系统仅分配匿名生成的设备随机标识符（Guest ID），不与任何第三方实名身份进行关联。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">4</span>
              <span>绝不向第三方共享或商业化出售数据</span>
            </h2>
            <p>
              我们做出严格承诺：<strong>绝不向任何医药企业、商业保险机构、广告商或数据中介出售、出租或非法共享您的健康档案与个人信息</strong>。所有数据仅用于为您实时生成基于循证指南的学术解读与辅助便签。
            </p>
          </section>

          <section className="space-y-3 bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200">
            <h2 className="text-base sm:text-lg font-bold text-amber-950 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">5</span>
              <span>您的权利：随时彻底删除与被遗忘权</span>
            </h2>
            <p className="text-amber-900">
              您对自己的健康数据拥有完全的自主控制权。您可以随时前往【个人档案】页面点击<strong>“清空/重置档案”</strong>，一键彻底销毁本地与云端暂存的所有数据记录。
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p>如对本隐私政策或您的个人数据保护有任何疑问或投诉，请通过系统管理员后台或官方渠道联系技术支持团队。</p>
          </section>

        </div>

      </div>
    </div>
  );
}
