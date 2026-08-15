"use client";

import React from "react";

interface JourneyMapProps {
  currentStage?: string; // 'discovery' | 'evaluation' | 'post_op' | 'follow_up'
  psychologicalState?: string; // 'fear' | 'understanding' | 'decision' | 'confidence'
}

export default function JourneyMap({ 
  currentStage = "post_op", 
  psychologicalState = "understanding" 
}: JourneyMapProps) {
  const medicalStages = [
    { id: "discovery", label: "发现结节", desc: "体检筛查发现" },
    { id: "evaluation", label: "术前评估/诊断", desc: "CT与恶性风险" },
    { id: "post_op", label: "病理确诊/治疗", desc: "手术与病理浸润" },
    { id: "follow_up", label: "长期随访康复", desc: "5年长程管理" },
  ];

  const psychStages = [
    { id: "fear", label: "焦虑与迷茫", desc: "未知恐惧期" },
    { id: "understanding", label: "理解自身情况", desc: "循证科学认知" },
    { id: "decision", label: "参与医疗决策", desc: "主治医患同盟" },
    { id: "confidence", label: "建立长期信心", desc: "回归健康生活" },
  ];

  const normalizeMedicalStage = (stage?: string) => {
    if (!stage) return "post_op";
    const s = String(stage).toLowerCase();
    if (s === "discovery" || s === "nodule_found") return "discovery";
    if (s === "evaluation" || s === "ct_imaging" || s === "pre_op" || s === "imaging") return "evaluation";
    if (s === "post_op" || s === "pathology" || s === "decision" || s === "comprehensive" || s === "treatment" || s === "surgery") return "post_op";
    if (s === "follow_up" || s === "recovery" || s === "surveillance") return "follow_up";
    return "post_op";
  };

  const normalizePsychStage = (stage?: string) => {
    if (!stage) return "understanding";
    const s = String(stage).toLowerCase();
    if (s === "fear" || s === "anxiety") return "fear";
    if (s === "understanding" || s === "cognition") return "understanding";
    if (s === "decision" || s === "action") return "decision";
    if (s === "confidence" || s === "recovery") return "confidence";
    return "understanding";
  };

  const getStageIndex = (stages: any[], id: string, isMedical: boolean = false) => {
    const normalizedId = isMedical ? normalizeMedicalStage(id) : normalizePsychStage(id);
    const idx = stages.findIndex(s => s.id === normalizedId);
    return idx >= 0 ? idx : (isMedical ? 2 : 1);
  };

  const medIndex = getStageIndex(medicalStages, currentStage, true);
  const psychIndex = getStageIndex(psychStages, psychologicalState, false);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🗺️ 双轨状态导航</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Cancer Journey OS
            </span>
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            医学诊疗进度与心理赋能成长双轨并行，记录您的康复全轨迹
          </p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Track 1: Medical Intervention Track (医学干预轨迹) */}
        <TrackRow
          title="医学干预轨迹"
          icon="🏥"
          themeColor="blue"
          stages={medicalStages}
          currentIndex={medIndex}
          activeTag="当前医疗阶段"
        />

        {/* Track 2: Psychological Reconstruction Track (心理重建轨迹) */}
        <TrackRow
          title="心理重建轨迹"
          icon="🌱"
          themeColor="teal"
          stages={psychStages}
          currentIndex={psychIndex}
          activeTag="当前心理状态"
        />

      </div>
    </div>
  );
}

interface TrackRowProps {
  title: string;
  icon: string;
  themeColor: "blue" | "teal";
  stages: Array<{ id: string; label: string; desc: string }>;
  currentIndex: number;
  activeTag: string;
}

function TrackRow({ title, icon, themeColor, stages, currentIndex, activeTag }: TrackRowProps) {
  const isBlue = themeColor === "blue";
  
  const colors = isBlue ? {
    trackBg: "bg-blue-600",
    trackGlow: "shadow-blue-500/20",
    activeRing: "ring-4 ring-blue-500/20 border-blue-600 text-blue-600",
    activeDot: "bg-blue-600",
    badgeBg: "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-blue-500/20",
    textActive: "text-blue-700 font-bold",
    pastCircle: "bg-blue-600 border-blue-600 text-white",
  } : {
    trackBg: "bg-teal-600",
    trackGlow: "shadow-teal-500/20",
    activeRing: "ring-4 ring-teal-500/20 border-teal-600 text-teal-700",
    activeDot: "bg-teal-600",
    badgeBg: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-teal-500/20",
    textActive: "text-teal-800 font-bold",
    pastCircle: "bg-teal-600 border-teal-600 text-white",
  };

  const progressPercentage = (Math.max(0, currentIndex) / (stages.length - 1)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {title}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          第 {currentIndex + 1} / {stages.length} 阶段
        </span>
      </div>

      <div className="relative pt-6 pb-2 px-4 sm:px-6">
        
        {/* Continuous Baseline Track Line */}
        <div className="absolute top-[38px] left-[12%] right-[12%] h-1 bg-slate-100 rounded-full z-0" />

        {/* Active Progress Line */}
        <div
          className={`absolute top-[38px] left-[12%] h-1 ${colors.trackBg} rounded-full transition-all duration-700 ease-out z-0`}
          style={{ width: `${progressPercentage * 0.76}%` }}
        />

        {/* Stage Nodes */}
        <div className="relative flex justify-between items-start z-10">
          {stages.map((stage, i) => {
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;

            return (
              <div key={stage.id} className="flex flex-col items-center relative w-20 sm:w-28 text-center">
                
                {/* Active Tooltip Badge */}
                {isActive && (
                  <div className={`absolute -top-7 ${colors.badgeBg} text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap animate-fade-in-up flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{activeTag}</span>
                  </div>
                )}

                {/* Symmetrical Circle Indicator Node */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xs
                    ${isActive 
                      ? `bg-white ${colors.activeRing}` 
                      : isPast 
                      ? colors.pastCircle 
                      : "bg-white border-slate-200 text-slate-300"
                    }`}
                >
                  {isActive ? (
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.activeDot} animate-pulse`} />
                  ) : isPast ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  )}
                </div>

                {/* Stage Title */}
                <div className={`text-xs sm:text-sm mt-2.5 font-semibold transition-colors ${
                  isActive ? colors.textActive : isPast ? "text-slate-800" : "text-slate-400"
                }`}>
                  {stage.label}
                </div>

                {/* Subtitle Description */}
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden sm:block">
                  {stage.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
