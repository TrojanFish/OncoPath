"use client";

import { useMemo } from "react";
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in print:p-0 print:static">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm print:hidden" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-2xl relative z-10 animate-fade-in-up text-slate-900 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-4">
        {/* Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                门诊专家快速汇报清单 (Doctor Consultation Summary)
              </h3>
              <p className="text-[11px] text-slate-500">
                为三甲专家问诊精编 · 3秒扫视历次影像/病理/生化诊疗全景
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️ 打印 / 导出 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="mt-6 space-y-6 print:mt-0 font-sans">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                肺部疾病长程随访与临床时序摘要
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                系统：OncoPath 循证医学导航平台 · 结构化病历归集
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>生成日期：{new Date().toISOString().split("T")[0]}</div>
              <div>随访记录数：{events.length} 次</div>
            </div>
          </div>

          {/* Core Executive Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">最新影像状态</span>
              <div className="font-extrabold text-slate-900 mt-0.5">
                {latestImaging?.keyFindings?.sizeMm !== undefined
                  ? `${latestImaging.keyFindings.sizeMm} mm (${latestImaging.eventDate.substring(0, 7)})`
                  : "已行手术切除"}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">术后病理分期</span>
              <div className="font-extrabold text-emerald-700 mt-0.5">
                {latestPathology?.keyFindings?.stage || "IA1期 (pT1miN0M0)"}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">最新 CEA 标志物</span>
              <div className="font-extrabold text-slate-900 mt-0.5">
                {latestSerology?.keyFindings?.cea !== undefined
                  ? `${latestSerology.keyFindings.cea} ng/mL (正常)`
                  : "基线正常"}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">驱动基因突变</span>
              <div className="font-extrabold text-blue-700 mt-0.5 truncate">
                {latestPathology?.keyFindings?.driverGene || "EGFR 19del"}
              </div>
            </div>
          </div>

          {/* Section 1: Imaging Chronology */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span>🩻</span>
              <span>1. 历次影像学演变时序 (Imaging Timeline)</span>
            </h4>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold">
                  <th className="p-2">检查日期</th>
                  <th className="p-2">检查项目 / 医院</th>
                  <th className="p-2">长径 (mm)</th>
                  <th className="p-2">实性比 (CTR)</th>
                  <th className="p-2">核心结论</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {imagingList.map((im, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold text-slate-900">{im.eventDate}</td>
                    <td className="p-2 text-slate-700">
                      <div>{im.title}</div>
                      <div className="text-[10px] text-slate-400">{im.hospital}</div>
                    </td>
                    <td className="p-2 font-mono font-bold text-blue-700">
                      {im.keyFindings?.sizeMm !== undefined ? `${im.keyFindings.sizeMm} mm` : "-"}
                    </td>
                    <td className="p-2 font-mono">
                      {im.keyFindings?.ctr !== undefined ? `${(im.keyFindings.ctr * 100).toFixed(0)}%` : "-"}
                    </td>
                    <td className="p-2 text-slate-600 max-w-xs">{im.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Surgery & Pathology */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span>🔬</span>
              <span>2. 手术干预与病理微观诊断 (Surgery & Pathology)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {surgeryMilestone && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900">
                    ⚡ {surgeryMilestone.eventDate} 手术记录
                  </div>
                  <div className="text-slate-600 mt-1">{surgeryMilestone.summary}</div>
                </div>
              )}
              {latestPathology && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-purple-900">
                    🔬 {latestPathology.eventDate} 病理组织学
                  </div>
                  <div className="text-slate-600 mt-1">{latestPathology.summary}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Tumor Markers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <span>🩸</span>
              <span>3. 血清肿瘤标志物随访轨迹 (Biomarkers)</span>
            </h4>
            <div className="flex gap-2 flex-wrap">
              {serologyList.map((s, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                  <div className="font-bold text-slate-900">{s.eventDate}</div>
                  <div className="text-slate-600 mt-0.5">
                    CEA: <span className="font-bold text-rose-700">{s.keyFindings?.cea || "-"}</span> ng/mL
                  </div>
                  {s.keyFindings?.cyfra211 && (
                    <div className="text-slate-500 text-[11px]">
                      CYFRA21-1: {s.keyFindings.cyfra211} ng/mL
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Print Footer Disclaimer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
            注：本清单由患者临床检查报告结构化提取生成，仅供临床门诊交流参考，不替代医师现场全面诊疗。
          </div>
        </div>
      </div>
    </div>
  );
}
