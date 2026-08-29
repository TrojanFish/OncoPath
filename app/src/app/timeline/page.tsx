import type { Metadata } from "next";
import SubpageNavbar from "@/components/SubpageNavbar";
import ClinicalTimelineView from "@/components/timeline/ClinicalTimelineView";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "检查报告时间生命线 - OncoPath 肺癌全景时序诊疗管理",
  description:
    "按时间轴与临床类别结构化归集历次薄层CT、手术大体病理、靶向基因测序（NGS）与血液肿瘤标志物，提供病灶生长曲线、实性占比演变与一键名医就诊清单导出。",
};

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <SubpageNavbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-2.5 sm:px-6 pt-24 sm:pt-28 pb-16">
        {/* Master Timeline View Container */}
        <ClinicalTimelineView />
      </main>

      <Footer maxWidth="max-w-5xl" />
    </div>
  );
}

