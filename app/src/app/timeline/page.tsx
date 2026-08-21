import type { Metadata } from "next";
import SubpageNavbar from "@/components/SubpageNavbar";
import ClinicalTimelineView from "@/components/timeline/ClinicalTimelineView";
import Link from "next/link";
import { LogoMark } from "@/components/SubpageNavbar";

export const metadata: Metadata = {
  title: "检查报告时间生命线 - OncoPath 肺癌全景时序诊疗管理",
  description:
    "按时间轴与临床类别结构化归集历次薄层CT、手术大体病理、靶向基因测序（NGS）与血液肿瘤标志物，提供病灶生长曲线、实性占比演变与一键名医就诊清单导出。",
};

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <SubpageNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            首页
          </Link>
          <span>/</span>
          <Link href="/profile" className="hover:text-blue-600 transition-colors">
            患者数字档案
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">检查报告时间生命线</span>
        </div>

        {/* Master Timeline View Container */}
        <ClinicalTimelineView />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-4 sm:px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <LogoMark />
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap justify-center md:justify-start">
              <Link href="/about" className="hover:text-blue-600 font-medium transition-colors text-blue-700">
                关于我们与初衷
              </Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-blue-600 font-medium transition-colors">
                服务协议与免责声明
              </Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-blue-600 font-medium transition-colors">
                隐私政策 (PIPL)
              </Link>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-center md:text-right space-y-1">
            <div>© 2026 OncoPath · 严格同行评审肺癌循证知识与决策导航系统</div>
            <div>所有数据均可追溯至 JTO、Lancet、JCO、Chest 等国际顶级学术期刊。</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
