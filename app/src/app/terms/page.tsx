"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
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
          <span className="text-xs text-slate-400 font-mono">版本：2026-V1.0</span>
        </div>

        {/* Title */}
        <div className="space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
            <span>⚖️ 平台服务协议与临床知情同意书</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            OncoPath 用户服务协议与医疗免责声明
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            欢迎使用 OncoPath 肺癌全病程精准决策与循证医学支持系统。在您使用本平台提供的任何服务前，请务必审慎阅读并充分理解本协议的全部条款，特别是<strong>免责声明与服务边界</strong>条款。
          </p>
        </div>

        {/* Core Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-700">
          
          <section className="space-y-3 bg-amber-50/80 p-5 rounded-2xl border border-amber-200">
            <h2 className="text-base sm:text-lg font-bold text-amber-950 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>核心医疗免责声明与监管合规界限（首要条款）</span>
            </h2>
            <div className="space-y-2 text-amber-900 text-xs sm:text-sm">
              <p>
                <strong>1. 非互联网诊疗行为</strong>：本平台是一套基于国际公开发表学术文献（包括但不限于 NCCN、CSCO、ESMO、IASLC 诊疗指南及 JCOG 系列前瞻性临床试验数据）构建的<strong>医学学术信息检索与知识图谱导航工具</strong>。本平台<strong>不提供任何互联网医疗诊断、处方开具、远程治疗或任何形式的直接执业医疗行为</strong>。
              </p>
              <p>
                <strong>2. 不替代线下执业医师面诊</strong>：平台所生成的《深度临床循证解读报告》及《门诊就医问诊便签卡》仅供患者知情理解自身病理指标、消除恐惧心理及提高门诊医患沟通效率参考。<strong>任何具体的检查周期安排、术后辅助用药方案及手术决策，必须携带完整病理报告与原始 DICOM 影像至实体正规三甲医院，由具备执业资格的主治医生或多学科会诊 (MDT) 团队最终确立并执行</strong>。
              </p>
              <p>
                <strong>3. 严禁依据本平台自行调整医疗方案</strong>：患者或家属绝不可根据本平台的文献输出自行决定用药、停药、更改药物剂量或拒绝规范诊疗方案。因自行擅改医疗行为所造成的任何直接或间接后果，本平台不承担任何法律责任。
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
              <span>服务内容与学术可溯源性</span>
            </h2>
            <p>
              本平台承诺所有知识图谱节点、危险度评分权重与循证分析逻辑均经过权威专科文献严格对齐。每项临床研判结论均可追溯至对应的 PubMed PMID 国际学术期刊或各大肿瘤学会指南，确保内容的科学性与严谨性。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">3</span>
              <span>知识产权与合法使用</span>
            </h2>
            <p>
              本平台的所有界面设计、4D知识图谱交互体系、微创解剖手绘图解、3D 决策矩阵算法及专属问诊卡排版布局，其知识产权均归 OncoPath 开发团队所有。用户可免费下载个人就医便签卡供个人或向医生展示使用，未经书面许可不得用于任何商业化转售或爬虫逆向工程。
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">4</span>
              <span>协议的修改与更新</span>
            </h2>
            <p>
              随着国际肺癌诊疗指南的更新与国家医疗卫生法规的完善，我们可能会适时修订本协议条款。当协议发生实质性变更时，平台将在首页醒目位置进行公告。
            </p>
          </section>

          <section className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>© 2026 OncoPath 肺癌循证医学决策系统</span>
            <div className="flex items-center gap-3">
              <Link href="/about" className="text-blue-600 hover:underline font-medium">关于我们与初衷</Link>
              <span>·</span>
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">查看《隐私政策》</Link>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
