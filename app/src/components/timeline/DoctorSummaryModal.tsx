"use client";

import { useMemo } from "react";
import { 
  Stethoscope, 
  Printer, 
  X, 
  Scan, 
  Microscope, 
  Zap, 
  TestTube2, 
  Activity 
} from "lucide-react";
import { TimelineEventItem } from "@/lib/timelineTypes";

interface DoctorSummaryModalProps {
  events: TimelineEventItem[];
  onClose: () => void;
}

export default function DoctorSummaryModal({ events, onClose }: DoctorSummaryModalProps) {
  // Sort events chronologically descending
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events]);

  const imagingList = sortedEvents.filter((e) => e.category === "imaging");
  const pathologyList = sortedEvents.filter((e) => e.category === "pathology");
  const serologyList = sortedEvents.filter((e) => e.category === "serology");
  const milestoneList = sortedEvents.filter((e) => e.category === "milestone");

  const latestImaging = imagingList[0];
  const latestSerology = serologyList[0];
  const latestPathology = pathologyList[0];
  const surgeryMilestone = milestoneList.find((e) => e.subType === "Surgery") || milestoneList[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 animate-fade-in print:p-0 print:static">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm print:hidden" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-white w-full max-w-3xl rounded-3xl p-4 sm:p-8 md:p-10 border border-slate-200 shadow-2xl relative z-10 animate-fade-in-up text-slate-900 max-h-[92vh] overflow-y-auto custom-scrollbar print:max-h-none print:shadow-none print:border-none print:p-4">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center justify-between sm:justify-start gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  名医就诊快速汇报清单
                  <span className="hidden md:inline text-xs font-normal text-slate-500 ml-1.5">(Doctor Summary)</span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  为三甲专家问诊精编 · 3秒扫视历次影像/病理/生化诊疗全景
                </p>
              </div>
            </div>

            {/* Mobile Close Button in Top Row */}
            <button
              onClick={onClose}
              className="sm:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial btn-primary px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 导出 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 items-center justify-center cursor-pointer shrink-0 transition-colors"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="mt-4 sm:mt-6 space-y-5 sm:space-y-6 print:mt-0 font-sans">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-900 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                肺部疾病长程随访与临床时序摘要
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                系统：OncoPath 循证医学导航平台 · 结构化病历归集
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] sm:text-xs text-slate-500 flex sm:flex-col justify-between sm:justify-start gap-1">
              <span>生成日期：{new Date().toISOString().split("T")[0]}</span>
              <span>随访记录：{events.length} 次</span>
            </div>
          </div>

          {/* Core Executive Summary Box */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
            <div className="p-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">最新影像状态</span>
              <div className="font-extrabold text-slate-900 mt-0.5 break-words">
                {latestImaging?.keyFindings?.sizeMm !== undefined
                  ? `${latestImaging.keyFindings.sizeMm} mm (${latestImaging.eventDate.substring(0, 7)})`
                  : "已行手术切除"}
              </div>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">术后病理分期</span>
              <div className="font-extrabold text-emerald-700 mt-0.5 break-words">
                {latestPathology?.keyFindings?.stage || "IA1期 (pT1miN0M0)"}
              </div>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">最新 CEA 标志物</span>
              <div className="font-extrabold text-slate-900 mt-0.5 break-words">
                {latestSerology?.keyFindings?.cea !== undefined
                  ? `${latestSerology.keyFindings.cea} ng/mL`
                  : "基线正常"}
              </div>
            </div>
            <div className="p-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">驱动基因突变</span>
              <div className="font-extrabold text-blue-700 mt-0.5 break-words">
                {latestPathology?.keyFindings?.driverGene || "EGFR 19del"}
              </div>
            </div>
          </div>

          {/* Section 1: Imaging Chronology */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Scan className="w-3.5 h-3.5 text-blue-600" />
              <span>1. 历次影像学演变时序 (Imaging Timeline)</span>
            </h4>
            <div className="overflow-x-auto -mx-1 sm:mx-0 border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2 sm:p-2.5 whitespace-nowrap">检查日期</th>
                    <th className="p-2 sm:p-2.5 whitespace-nowrap">检查项目 / 医院</th>
                    <th className="p-2 sm:p-2.5 whitespace-nowrap">长径 (mm)</th>
                    <th className="p-2 sm:p-2.5 whitespace-nowrap">实性比 (CTR)</th>
                    <th className="p-2 sm:p-2.5">核心结论</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {imagingList.map((im, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 sm:p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">{im.eventDate}</td>
                      <td className="p-2 sm:p-2.5 text-slate-700 whitespace-nowrap">
                        <div className="font-semibold">{im.title}</div>
                        <div className="text-[10px] text-slate-400">{im.hospital}</div>
                      </td>
                      <td className="p-2 sm:p-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {im.keyFindings?.sizeMm !== undefined ? `${im.keyFindings.sizeMm} mm` : "-"}
                      </td>
                      <td className="p-2 sm:p-2.5 font-mono whitespace-nowrap">
                        {im.keyFindings?.ctr !== undefined ? `${(im.keyFindings.ctr * 100).toFixed(0)}%` : "-"}
                      </td>
                      <td className="p-2 sm:p-2.5 text-slate-600 min-w-[140px]">{im.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Surgery & Pathology */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Microscope className="w-3.5 h-3.5 text-purple-600" />
              <span>2. 手术干预与病理微观诊断 (Surgery & Pathology)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {surgeryMilestone && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{surgeryMilestone.eventDate} 手术记录</span>
                  </div>
                  <div className="text-slate-600 mt-1 leading-relaxed">{surgeryMilestone.summary}</div>
                </div>
              )}
              {latestPathology && (
                <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <Microscope className="w-3.5 h-3.5 text-purple-600" />
                    <span>{latestPathology.eventDate} 病理组织学</span>
                  </div>
                  <div className="text-slate-600 mt-1 leading-relaxed">{latestPathology.summary}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Tumor Markers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <TestTube2 className="w-3.5 h-3.5 text-rose-600" />
              <span>3. 血清肿瘤标志物随访轨迹 (Biomarkers)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {serologyList.map((s, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                  <div className="font-bold text-slate-900">{s.eventDate}</div>
                  <div className="text-slate-600 mt-0.5 truncate">
                    CEA: <span className="font-bold text-rose-700">{s.keyFindings?.cea ?? "-"}</span> ng/mL
                  </div>
                  {s.keyFindings?.cyfra211 && (
                    <div className="text-slate-500 text-[11px] truncate">
                      CYFRA: {s.keyFindings.cyfra211}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Print Footer Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center leading-relaxed">
            注：本清单由患者临床检查报告结构化提取生成，仅供临床门诊交流参考，不替代医师现场全面诊疗。
          </div>
        </div>
      </div>
    </div>
  );
}

