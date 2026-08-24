"use client";

import { useMemo, useState } from "react";
import { TestTube2, ShieldCheck, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { TimelineEventItem } from "@/lib/timelineTypes";

interface TumorMarkerTrendChartProps {
  events: TimelineEventItem[];
}

export default function TumorMarkerTrendChart({ events }: TumorMarkerTrendChartProps) {
  const [showBenignFactors, setShowBenignFactors] = useState(false);

  const serologyPoints = useMemo(() => {
    return events
      .filter((e) => e.category === "serology" && e.keyFindings?.cea !== undefined)
      .map((e) => ({
        date: e.eventDate,
        title: e.title,
        cea: Number(e.keyFindings?.cea || 0),
        cyfra211: e.keyFindings?.cyfra211 !== undefined ? Number(e.keyFindings.cyfra211) : null,
        nse: e.keyFindings?.nse !== undefined ? Number(e.keyFindings.nse) : null,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events]);

  if (serologyPoints.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-slate-500 text-xs">
        暂无血清肿瘤标志物时序记录，录入抽血化验单后将自动生成 CEA / CYFRA21-1 动态生理安全带波动图。
      </div>
    );
  }

  // Safe reference ceilings
  const CEA_CEILING = 5.0;
  const CYFRA_CEILING = 3.3;

  // Check if all recent markers are safely within normal band
  const latestPt = serologyPoints[serologyPoints.length - 1];
  const isAllSafe = latestPt.cea <= CEA_CEILING && (latestPt.cyfra211 === null || latestPt.cyfra211 <= CYFRA_CEILING);

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 160;
  const paddingX = 45;
  const paddingY = 25;
  const maxCea = Math.max(6.5, ...serologyPoints.map((p) => p.cea)) * 1.15;

  const getX = (idx: number) => {
    if (serologyPoints.length <= 1) return svgWidth / 2;
    return paddingX + (idx * (svgWidth - paddingX * 2)) / (serologyPoints.length - 1);
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxCea, val));
    return svgHeight - paddingY - (clamped / maxCea) * (svgHeight - paddingY * 2);
  };

  const safeBandY = getY(CEA_CEILING);
  const bottomY = svgHeight - paddingY;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-5 hover:border-indigo-300 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center">
              <TestTube2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                血清肿瘤标志物时序排雷与生理安全带监测
              </h3>
              <p className="text-[11px] text-slate-500">
                CEA（癌胚抗原）与 CYFRA21-1 动态演进 · 区分生理良性波动与恶性信号
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${
            isAllSafe 
              ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAllSafe ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span>{isAllSafe ? "指标处于生理代谢安全带" : "指标轻度偏高 · 建议随访"}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-full">
            共 {serologyPoints.length} 次生化随访
          </span>
        </div>
      </div>

      {/* Safety Band Golden Principle Reassurance Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 shadow-2xs">
        <div className="font-bold flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-900 font-extrabold">临床定心丸 · 生理代谢波动铁律</span>
          </div>
          <button 
            onClick={() => setShowBenignFactors(!showBenignFactors)}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 cursor-pointer bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200"
          >
            <span>{showBenignFactors ? "收起良性因素" : "查看良性波动原因"}</span>
            {showBenignFactors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed font-medium">
          在正常参考区间（CEA 0 ~ 5.0 ng/mL，CYFRA21-1 0 ~ 3.3 ng/mL）内的任何微幅起伏，<strong>均属于人体自然生理代谢、饮食排毒与实验室批次正常波动，绝无复发或恶变意义，请完全放心！</strong>
        </p>

        {showBenignFactors && (
          <div className="pt-2.5 mt-2 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900 animate-fade-in">
            <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
              <span className="font-bold block text-emerald-800">🚬 生活习惯因素</span>
              <span>长期或二手烟暴露、饮酒、熬夜均可引起 CEA 短暂轻度生理上升。</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
              <span className="font-bold block text-emerald-800">🫁 良性炎症反应</span>
              <span>慢性支气管炎、轻微胃肠炎、息肉或脂肪肝会产生微量非特异性分泌。</span>
            </div>
            <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
              <span className="font-bold block text-emerald-800">🧪 检验批次系统差</span>
              <span>不同医院（罗氏/雅培/贝克曼）检测试剂与校准批次可能存在 ±1.0 的正常测量差。</span>
            </div>
          </div>
        )}
      </div>

      {/* Visual Chart with Semi-Transparent Green Safety Band */}
      {serologyPoints.length > 1 && (
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <span>📈 CEA 动态长程轨迹</span>
              <span className="text-[10px] text-slate-400 font-normal">(绿色阴影为正常生理代谢安全带 0~5.0 ng/mL)</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                <span>生理安全带</span>
              </span>
              <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span>CEA 实测点</span>
              </span>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 min-w-[420px] overflow-visible">
              {/* Semi-transparent Green Safety Band Area (0 ~ 5.0 ng/mL) */}
              <rect
                x={paddingX}
                y={safeBandY}
                width={svgWidth - paddingX * 2}
                height={bottomY - safeBandY}
                fill="rgba(16, 185, 129, 0.08)"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeDasharray="4 4"
                rx="4"
              />
              <text
                x={paddingX + 6}
                y={safeBandY + 12}
                fill="#059669"
                fontSize="10"
                fontWeight="bold"
                className="select-none"
              >
                ✓ 生理代谢安全带 (≤ 5.0 ng/mL)
              </text>

              {/* Grid Baseline */}
              <line
                x1={paddingX}
                y1={bottomY}
                x2={svgWidth - paddingX}
                y2={bottomY}
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={serologyPoints.map((p, i) => `${getX(i)},${getY(p.cea)}`).join(" ")}
              />

              {/* Data points */}
              {serologyPoints.map((p, i) => {
                const cx = getX(i);
                const cy = getY(p.cea);
                const isPtSafe = p.cea <= CEA_CEILING;

                return (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={isPtSafe ? "#10b981" : "#f59e0b"}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={cx}
                      y={cy - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={isPtSafe ? "#047857" : "#b45309"}
                    >
                      {p.cea}
                    </text>
                    <text
                      x={cx}
                      y={bottomY + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="monospace"
                    >
                      {p.date.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Grid Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {serologyPoints.map((pt, idx) => {
          const ceaRatio = (pt.cea / CEA_CEILING) * 100;
          const isSafe = pt.cea <= CEA_CEILING;

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 font-mono">
                  {pt.date}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isSafe ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isSafe ? "✓ 正常安全" : "轻度偏高"}
                </span>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-semibold">CEA</span>
                  <span className={`text-sm font-extrabold font-mono ${isSafe ? "text-emerald-700" : "text-amber-700"}`}>
                    {pt.cea} <span className="text-[10px] font-normal text-slate-400">ng/mL</span>
                  </span>
                </div>

                {/* Progress bar vs ceiling */}
                <div className="w-full h-2 bg-emerald-50 border border-emerald-200/60 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSafe ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(100, ceaRatio)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>0</span>
                  <span className="font-bold text-emerald-600">安全线: 5.0</span>
                </div>
              </div>

              {pt.cyfra211 !== null && (
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">CYFRA21-1</span>
                  <span className={`font-bold font-mono ${pt.cyfra211 <= CYFRA_CEILING ? "text-emerald-700" : "text-amber-700"}`}>
                    {pt.cyfra211} <span className="text-[9px] text-slate-400">ng/mL</span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
