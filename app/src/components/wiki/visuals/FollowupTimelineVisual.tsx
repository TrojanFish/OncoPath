"use client";

import React, { useState } from "react";

type PeriodId = "y12" | "y35" | "y5plus";

interface PeriodData {
  id: PeriodId;
  label: string;
  sublabel: string;
  interval: string;
  statusText: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
  items: { name: string; required: boolean; desc: string; tag: string }[];
  avoid: string;
  cureRate: string;
}

const PERIODS: PeriodData[] = [
  {
    id: "y12",
    label: "术后 1~2 年",
    sublabel: "复发监测黄金期",
    interval: "每 3~6 个月 1 次",
    statusText: "高频严密监测",
    statusColor: "text-amber-700",
    statusBg: "bg-amber-50",
    statusBorder: "border-amber-300",
    items: [
      { name: "胸部高分辨率薄层 CT (HRCT)", required: true, desc: "推荐 1mm 低剂量平扫，优先在同一机器对比", tag: "核心金标准" },
      { name: "5 项肺癌血清标志物", required: true, desc: "CEA / CYFRA21-1 / NSE / ProGRP / SCC，观察动态走势", tag: "常规抽血" },
      { name: "腹部超声 / 腹部增强 CT", required: true, desc: "排查肝上腺及腹膜后区域", tag: "常规影像" },
      { name: "头部增强 MRI (磁共振)", required: false, desc: "II~IIIA 期高危患者建议每年 1 次；I 期无症状无需常规做", tag: "高危推荐" },
      { name: "血液 ctDNA (微小残留 MRD)", required: false, desc: "NCCN 2024 新推荐：关键节点分子层面监测超早期信号", tag: "前沿选配" },
    ],
    avoid: "无症状常规随访不推荐频繁做全身 PET-CT 或骨扫描（避免过度辐射与花费）",
    cureRate: "平稳度过前 2 年，复发风险呈断崖式下降 70%+",
  },
  {
    id: "y35",
    label: "术后 3~5 年",
    sublabel: "平稳巩固期",
    interval: "每 6~12 个月 1 次",
    statusText: "中度平稳随访",
    statusColor: "text-blue-700",
    statusBg: "bg-blue-50",
    statusBorder: "border-blue-300",
    items: [
      { name: "胸部低剂量薄层 CT (LDCT)", required: true, desc: "监测残肺及纵隔，排查第二原发小结节", tag: "核心金标准" },
      { name: "5 项肺癌血清标志物", required: true, desc: "每半年至一年随访一次，对比基线水平", tag: "常规抽血" },
      { name: "腹部超声", required: true, desc: "常规腹部脏器排查", tag: "常规影像" },
    ],
    avoid: "切忌因前几年正常就完全放弃随访，保持规律年度打卡即可",
    cureRate: "3 年未复发患者，长期无病生存率突破 85%+",
  },
  {
    id: "y5plus",
    label: "术后 5 年以上",
    sublabel: "临床治愈长青期",
    interval: "每年 1 次（年度体检）",
    statusText: "医学临床治愈",
    statusColor: "text-emerald-700",
    statusBg: "bg-emerald-50",
    statusBorder: "border-emerald-300",
    items: [
      { name: "年度胸部低剂量 CT (LDCT)", required: true, desc: "等同于健康人常规年度防癌体检", tag: "年度常规" },
      { name: "常规生化与肿瘤标志物", required: true, desc: "结合年度常规全身体检一并完成", tag: "年度常规" },
    ],
    avoid: "彻底回归正常工作与运动，远离烟草与二手烟即可",
    cureRate: "满 5 年未复发达到医学公认【临床治愈】标准！",
  },
];

export function FollowupTimelineVisual() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodId>("y12");
  const curr = PERIODS.find((p) => p.id === selectedPeriod)!;

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Step buttons */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {PERIODS.map((p, idx) => {
          const isSelected = selectedPeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`p-2 sm:p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? `${p.statusBorder} ${p.statusBg} shadow-sm scale-[1.02]`
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                <span className={`text-xs sm:text-sm font-bold ${isSelected ? p.statusColor : "text-slate-700"}`}>
                  {p.label}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{p.sublabel}</div>
              <div className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block ${isSelected ? p.statusBg + " " + p.statusColor : "bg-slate-100 text-slate-500"}`}>
                {p.interval}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div className={`rounded-xl border-2 ${curr.statusBorder} ${curr.statusBg} p-3 sm:p-4 space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-800">{curr.label} 检查项目清单</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${curr.statusBg} ${curr.statusColor} border ${curr.statusBorder}`}>
              {curr.statusText}
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">频次：{curr.interval}</span>
        </div>

        {/* Item list */}
        <div className="space-y-1.5 sm:space-y-2">
          {curr.items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-lg p-2 sm:p-2.5 border border-slate-200/80 flex items-start gap-2 shadow-xs">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${item.required ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                {item.tag}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-slate-800">{item.name}</div>
                <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Caution and Cure banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">⚠️ 避坑提醒：</span>{curr.avoid}
          </div>
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-800 leading-relaxed">
            <span className="font-bold">🎉 治愈信心：</span>{curr.cureRate}
          </div>
        </div>
      </div>
    </div>
  );
}
