"use client";

import { useState } from "react";

export function GgoEvolutionSimulator() {
  // ctr value from 0.0 to 1.0 (step 0.05)
  const [ctr, setCtr] = useState<number>(0.35);

  // Derived classification
  let ggoType = "纯磨玻璃结节 (pGGN)";
  let stageLabel = "不典型腺瘤样增生 (AAH) / 原位腺癌 (AIS)";
  let invasiveness = "极低侵袭性 (惰性阶段)";
  let prognosis = "5年无复发生存率接近 100%";
  let followUpAdvice = "无需急于手术！建议 6~12 个月低剂量薄层 CT 复查，观察体积倍增趋势";
  let themeColor = "#10b981"; // emerald

  if (ctr === 0) {
    ggoType = "纯磨玻璃结节 (pGGN)";
    stageLabel = "原位腺癌 (AIS) 或良性炎性渗出";
    invasiveness = "无浸润 (贴壁生长，无转移能力)";
    prognosis = "5年治愈率 ≈ 100%";
    followUpAdvice = "首选定期随访！倍增时间通常 >600 天，完全处于绝对安全窗口期";
    themeColor = "#10b981";
  } else if (ctr <= 0.5) {
    ggoType = "混杂磨玻璃结节 (mGGO / 早期浸润)";
    stageLabel = "微浸润腺癌 (MIA) 早期";
    invasiveness = "微浸润 (实性成分 ≤ 5mm)";
    prognosis = "JCOG0804 5年无复发率 99.7%";
    followUpAdvice = "根据生长速度评估：若持续稳定可继续随访；若手术首选微创亚肺叶（段切/楔切）保全肺功能";
    themeColor = "#0ea5e9"; // sky blue
  } else if (ctr < 0.8) {
    ggoType = "实性为主型结节 (mGGO / 浸润期)";
    stageLabel = "浸润性肺腺癌 (IAC) 早期";
    invasiveness = "明确浸润 (实性成分 > 50%)";
    prognosis = "早期根治性手术后预后优良";
    followUpAdvice = "建议胸外科专科评估手术指征，完善术前分期并评估规范切除";
    themeColor = "#f59e0b"; // amber
  } else {
    ggoType = "纯实性结节 / 高实性结节";
    stageLabel = "浸润性肺腺癌 (IAC)";
    invasiveness = "实性浸润 (完全致密)";
    prognosis = "依病理 TNM 分期及高危因素决定";
    followUpAdvice = "积极行增强 CT 或 PET-CT 评估，多学科 MDT 制定手术与综合诊疗方案";
    themeColor = "#ef4444"; // rose
  }

  // Radius for outer GGO halo & inner solid core
  const outerR = 48;
  const innerR = Math.max(0, outerR * Math.sqrt(ctr));
  const solidOpacity = ctr === 0 ? 0 : Math.min(1, 0.4 + ctr * 0.6);
  const haloOpacity = Math.max(0.15, 0.55 - ctr * 0.35);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-md shadow-slate-900/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 mb-2">
            <span>🔬 交互式影像演变实验室</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            磨玻璃结节演变与实性成分比 (CTR) 模拟器
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            拖动下方滑块调节实性占比，直观观察从“淡薄水雾”到“致密结节”的微观形态演变
          </p>
        </div>

        {/* Current CTR Badge */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[11px] font-bold text-slate-400">实性成分比 (CTR)</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{(ctr * 100).toFixed(0)}%</div>
          </div>
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: themeColor }} />
        </div>
      </div>

      {/* Slider Control */}
      <div className="py-6 space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 px-1">
          <span className="text-emerald-700">纯磨玻璃 (0%)</span>
          <span className="text-sky-700">混合磨玻璃 (50%)</span>
          <span className="text-rose-700">纯实性 (100%)</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={ctr}
          onChange={(e) => setCtr(parseFloat(e.target.value))}
          className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        />
      </div>

      {/* Visual Canvas & Interpretation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
        {/* SVG Micro CT Cross-Section Canvas */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl relative overflow-hidden border border-slate-800 shadow-inner">
          <div className="absolute top-2.5 left-3 text-[10px] font-mono text-slate-400">CT 模拟剖面图 (20mm 结节)</div>
          
          <svg viewBox="0 0 140 140" className="w-48 h-48 my-2 select-none">
            {/* Background Lung Parenchyma Texture */}
            <defs>
              <radialGradient id="ggo-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={haloOpacity} />
                <stop offset="70%" stopColor="#64748b" stopOpacity={haloOpacity * 0.7} />
                <stop offset="100%" stopColor="#334155" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="solid-core" cx="48%" cy="46%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={solidOpacity} />
                <stop offset="65%" stopColor="#e2e8f0" stopOpacity={solidOpacity * 0.95} />
                <stop offset="100%" stopColor="#cbd5e1" stopOpacity={solidOpacity * 0.85} />
              </radialGradient>
              <pattern id="lung-mesh" width="8" height="8" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="0.6" fill="#1e293b" />
              </pattern>
            </defs>

            {/* Dark Lung Background */}
            <rect width="140" height="140" fill="#090d16" />
            <rect width="140" height="140" fill="url(#lung-mesh)" />

            {/* Micro Pulmonary Vessels (Normal lung background) */}
            <path d="M 15 30 Q 50 60 70 70 T 120 115" stroke="#1e293b" strokeWidth="1.2" fill="none" />
            <path d="M 110 20 Q 80 50 70 70 T 30 120" stroke="#1e293b" strokeWidth="0.9" fill="none" />

            {/* Outer GGO Halo (Ground-Glass Opacity) */}
            <circle cx="70" cy="70" r={outerR} fill="url(#ggo-glow)" />
            <circle cx="70" cy="70" r={outerR} stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" fill="none" opacity="0.4" />

            {/* Inner Solid Core (Consolidation) */}
            {innerR > 0 && (
              <circle
                cx="70"
                cy="70"
                r={innerR}
                fill="url(#solid-core)"
                stroke="#ffffff"
                strokeWidth="0.8"
                style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.4))", transition: "all 0.15s ease-out" }}
              />
            )}

            {/* Labels inside Canvas */}
            <text x="70" y="132" textAnchor="middle" fontSize="6.5" fill="#94a3b8" fontWeight="bold">
              {ctr === 0 ? "纯磨玻璃（透亮可见血管）" : ctr <= 0.5 ? "煎蛋征（中心实性核心 ≤ 50%）" : "致密实性浸润灶"}
            </text>
          </svg>

          <div className="text-[10px] text-slate-400 text-center flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400/50" />
            <span>薄雾外圈: 磨玻璃成分</span>
            <span className="w-2 h-2 rounded-full bg-white ml-2" />
            <span>白色核心: 实性成分</span>
          </div>
        </div>

        {/* Clinical Meaning Breakdown Cards */}
        <div className="md:col-span-7 space-y-3.5">
          {/* Main Category Banner */}
          <div className="p-4 rounded-2xl border" style={{ backgroundColor: `${themeColor}0d`, borderColor: `${themeColor}40` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: themeColor }}>当前形态定性</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white shadow-2xs" style={{ color: themeColor }}>
                {ggoType}
              </span>
            </div>
            <div className="text-base font-black text-slate-900 mt-1">{stageLabel}</div>
            <div className="text-xs text-slate-600 mt-1">浸润程度：{invasiveness} · 预后预期：{prognosis}</div>
          </div>

          {/* Expert Clinical Action Guide */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5">
              <span>🩺 权威胸外科临床对策</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {followUpAdvice}
            </p>
          </div>

          {/* Warm Reassurance Box */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex items-start gap-2.5">
            <span className="text-emerald-600 text-base leading-none mt-0.5">💚</span>
            <div className="text-xs text-emerald-900 leading-relaxed">
              <strong>定心丸寄语：</strong>
              {ctr <= 0.5 ? (
                <span> 早期磨玻璃结节生长非常缓慢，完全有充分的时间通过定期复查观察变化，绝不需要过度惊慌或盲目开刀！</span>
              ) : (
                <span> 即使实性成分偏高，现代微创胸腔镜手术可在 3~5 天内完成根治出院，早期治愈率依然处于极高水平！</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
