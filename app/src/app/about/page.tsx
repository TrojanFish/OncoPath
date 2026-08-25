"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  HeartHandshake, 
  BookOpen, 
  Microscope, 
  ClipboardList, 
  AlertTriangle, 
  MessageCircle, 
  QrCode, 
  Coffee, 
  Mail, 
  Check, 
  Copy, 
  X, 
  ZoomIn 
} from "lucide-react";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";

export default function AboutPage() {


  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);
  const contactEmail = "contact@oncopath.org";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <main className="flex-1 max-w-4xl mx-auto w-full space-y-8 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <span>返回首页</span>
          </Link>
          <span className="text-xs text-slate-400 font-mono">OncoPath · 创作者初衷</span>
        </div>

        {/* Main Article Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-slate-200 space-y-10">
          
          {/* Header Banner */}
          <div className="space-y-4 border-b border-slate-100 pb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-blue-600" />
              <span>创作者自白 · 致同行者</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              因为淋过雨，<br className="hidden sm:inline" />
              所以想为同样迷茫的你撑一把伞
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              —— 一个早期肺癌亲历者的心路历程与 OncoPath 循证平台的诞生始末
            </p>
          </div>

          {/* Narrative Content (Unified Harmonious 3-Act Structure) */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-700">
            
            {/* Act 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">1</span>
                <span>那张冰冷的病理报告，与漫长的黑夜</span>
              </h2>
              <p>
                几个月前，当我自己拿到那份印着<strong>“浸润性肺腺癌”、“实性成分”、“气道播散 (STAS)”、“脏层胸膜侵犯 (VPI)”</strong>等专业字眼的病理组织学诊断书时，内心同样被巨大的未知、恐慌与手足无措所吞没。
              </p>
              <p>
                在术后漫长的康复与求医历程中，我日夜穿梭在各大医学论坛、患者交流群和文献数据库里。我看到了太多病友和家属在深夜的帖子里辗转难眠：
              </p>
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>有人因为搜索到网络碎片化言论，误将极早期的原位/微浸润当成绝症，整日惶惶不可终日；</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>有人拿着复杂的病理指标，不知道该不该做基因检测、要不要做辅助化疗；</span>
                </div>
                <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                  <span className="text-slate-400 font-bold">•</span>
                  <span>有人面对大医院专家短短几分钟的面诊时间，因为紧张而手足无措，走出诊室才发现最关键的问题一个都没来得及问。</span>
                </div>
              </div>
            </section>

            {/* Act 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">2</span>
                <span>为什么做 OncoPath —— 用理性的证据，消解不必要的恐惧</span>
              </h2>
              <p>
                恐慌往往来源于对未知的想象。随着我深入研读了数百篇国际同行评审的前瞻性临床队列研究（如日本 JCOG0804/JCOG0802 系列研究、ADAURA 第三代靶向研究、AJCC 第 8/9 版 TNM 分期指南），我发现：<strong>现代胸部肿瘤医学对早期肺癌的根治率、高危病理特征以及规范随访路径，已经有了极为清晰、严谨的统计学定论。</strong>
              </p>
              <p>
                作为一名技术开发者，我决定搭建 <strong>OncoPath</strong> 这个纯粹的公益工具：
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>医学信息平权</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">把晦涩的顶刊论文翻译成患者和家属能轻松看懂的白话解读。</div>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>杜绝算命式推测</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">每一个风险指标均可追溯至公开的 PubMed 顶刊文献，拒绝主观臆断。</div>
                </div>
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>赋能门诊高效沟通</span>
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">生成一目了然的便签卡与问诊清单，让患者在面诊时不漏掉任何关键决策点。</div>
                </div>
              </div>
            </section>

            {/* Act 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-xs font-black shrink-0">3</span>
                <span>谦逊求教与专业共建声明</span>
              </h2>
              <p>
                我必须坦诚地向大家说明：<strong>我并非专业的执业临床医师，而是一名与你们走在同一条康复道路上的技术病友。</strong>
              </p>
              <p>
                尽管平台内的所有病理分期逻辑、影像 CTR 计算模型与文献均经过权威指南的严格校验，但医学领域浩瀚深邃，个体病情千差万别，平台内容难免存在理解局限或需要改进之处。
              </p>
              <div className="bg-amber-50/80 p-4 sm:p-5 rounded-2xl border border-amber-200/80 text-xs sm:text-sm text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>重要声明</strong>：本平台提供的所有数据与建议<strong>仅供患者知情参考与就医辅助，绝不构成任何个性化临床诊断结论或处方指令</strong>。具体的治疗方案与随访检查，请务必以线下正规三甲医院主治医生的综合研判为准。
                </div>
              </div>
            </section>

          </div>

          {/* Connect & Sponsorship Cards Section */}
          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">同路相伴 · 交流与支持</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                本平台承诺所有核心功能对病友<strong>永久免费且无任何商业广告</strong>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Card 1: WeChat Community QR */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center flex flex-col items-center justify-between space-y-4 hover:border-teal-300 transition-colors">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>病友交流与互助</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">微信扫码入群 / 添加作者</h4>
                  <p className="text-xs text-slate-500">与同路人互相打气、分享康复经验，抗癌路上不再孤单</p>
                </div>

                {/* QR Slot */}
                <div 
                  onClick={() => setPreviewImage({ src: "/wechat_qr.png", title: "微信交流二维码" })}
                  className="w-48 h-48 rounded-2xl bg-white p-3 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-teal-400 hover:shadow-md transition-all"
                  title="点击放大查看 / 微信扫码"
                >
                  <img 
                    src="/wechat_qr.png" 
                    alt="微信交流二维码" 
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fallback = document.getElementById('wechat-qr-placeholder');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div id="wechat-qr-placeholder" className="hidden flex-col items-center justify-center text-slate-400 text-center p-2">
                    <QrCode className="w-10 h-10 text-slate-400 mb-1.5" />
                    <span className="text-xs font-bold text-slate-600">微信交流二维码</span>
                    <span className="text-[10px] text-slate-400 mt-1">（待添加 wechat_qr.png）</span>
                  </div>
                  <div className="absolute inset-0 bg-teal-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" />
                      <span>点击放大</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  扫码请注明来意：“OncoPath 病友”
                </div>
              </div>

              {/* Card 2: Server Support Tip / Sponsorship */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center flex flex-col items-center justify-between space-y-4 hover:border-blue-300 transition-colors">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>支持服务器与算力支出</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">自愿赞助一杯清茶</h4>
                  <p className="text-xs text-slate-500">所有赞助将全部用于覆盖 VPS 服务器、域名与大模型 Token 成本</p>
                </div>

                {/* QR Slot */}
                <div 
                  onClick={() => setPreviewImage({ src: "/sponsor_qr.png", title: "赞赏支持二维码" })}
                  className="w-48 h-48 rounded-2xl bg-white p-3 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
                  title="点击放大查看 / 微信扫码"
                >
                  <img 
                    src="/sponsor_qr.png" 
                    alt="赞赏支持二维码" 
                    className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fallback = document.getElementById('sponsor-qr-placeholder');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div id="sponsor-qr-placeholder" className="hidden flex-col items-center justify-center text-slate-400 text-center p-2">
                    <Coffee className="w-10 h-10 text-slate-400 mb-1.5" />
                    <span className="text-xs font-bold text-slate-600">自愿赞赏支持码</span>
                    <span className="text-[10px] text-slate-400 mt-1">（待添加 sponsor_qr.png）</span>
                  </div>
                  <div className="absolute inset-0 bg-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1">
                      <ZoomIn className="w-3 h-3" />
                      <span>点击放大</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  金额随心 · 感谢每一份让公益平台长久活下去的温暖鼓励
                </div>
              </div>

            </div>

            {/* Email Contact & Bug Report */}
            <div className="bg-gradient-to-r from-blue-50/70 to-teal-50/70 p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-blue-900 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-700" />
                  <span>专业建议与纠错反馈</span>
                </div>
                <p className="text-xs text-slate-600">
                  欢迎胸外科、病理科、肿瘤内科医师及病友提出宝贵指正。每一封邮件我都会认真研读并持续迭代系统。
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyEmail}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>已复制邮箱</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制联系邮箱</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Sign-off */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="italic text-slate-600">
              “愿每一个认真了解疾病的灵魂，都能在理性和科学的光芒中重获笃定与安宁。”
            </div>
            <div className="font-bold text-slate-700">
              —— OncoPath 创作者 · 与您并肩同行
            </div>
          </div>

        </div>

      {/* Full-Screen QR Preview Modal */}
      {previewImage && (

        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl flex flex-col items-center text-center space-y-4 animate-fade-in-up"
          >
            <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-900">{previewImage.title}</span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                aria-label="关闭预览"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="w-64 h-64 p-2 bg-white rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
              <img 
                src={previewImage.src} 
                alt={previewImage.title} 
                className="w-full h-full object-contain rounded-xl" 
              />
            </div>
            
            <p className="text-xs text-slate-500">
              在手机上可<strong>长按图片</strong>识别二维码或保存到相册
            </p>
          </div>
        </div>
      )}
      </main>

      {/* Unified Global Footer */}
      <Footer maxWidth="max-w-4xl" />
    </div>
  );
}




