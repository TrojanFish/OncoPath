"use client";

import React from "react";

interface JourneyMapProps {
  currentStage?: string; // 'discovery' | 'evaluation' | 'post_op' | 'follow_up'
  psychologicalState?: string; // 'fear' | 'understanding' | 'decision' | 'confidence'
}

export default function JourneyMap({ currentStage = "evaluation", psychologicalState = "understanding" }: JourneyMapProps) {
  const medicalStages = [
    { id: "discovery", label: "发现结节" },
    { id: "evaluation", label: "术前评估/诊断" },
    { id: "post_op", label: "病理确诊/治疗" },
    { id: "follow_up", label: "长期随访" },
  ];

  const psychStages = [
    { id: "fear", label: "焦虑与迷茫" },
    { id: "understanding", label: "理解自身情况" },
    { id: "decision", label: "参与医疗决策" },
    { id: "confidence", label: "建立长期信心" },
  ];

  const getStageIndex = (stages: any[], id: string) => stages.findIndex(s => s.id === id);
  const medIndex = getStageIndex(medicalStages, currentStage);
  const psychIndex = getStageIndex(psychStages, psychologicalState);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
      <h3 className="text-lg font-semibold text-text-primary mb-6">双轨状态导航 (Cancer Journey Map)</h3>
      
      {/* Medical Track */}
      <div className="mb-8">
        <div className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">医学干预轨迹</div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-accent-blue -translate-y-1/2 rounded transition-all duration-500" 
            style={{ width: `${(Math.max(0, medIndex) / (medicalStages.length - 1)) * 100}%` }} 
          />
          <div className="relative flex justify-between">
            {medicalStages.map((stage, i) => {
              const isActive = i === medIndex;
              const isPast = i < medIndex;
              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white relative z-10 transition-colors
                    ${isActive ? "border-accent-blue ring-4 ring-accent-blue/20" : 
                      isPast ? "border-accent-blue bg-accent-blue" : "border-gray-300"}`}
                  >
                    {isActive ? <div className="w-2 h-2 bg-accent-blue rounded-full" /> : 
                     isPast ? <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> : null}
                  </div>
                  <div className={`text-[10px] md:text-xs mt-2 font-medium text-center max-w-[60px] md:max-w-none ${isActive ? "text-accent-blue" : "text-text-muted"}`}>
                    {stage.label}
                  </div>
                  {isActive && (
                    <div className="absolute -top-8 bg-accent-blue text-white text-[10px] px-2 py-1 rounded shadow-sm whitespace-nowrap animate-fade-in-up">
                      您在这里
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Psychological Track */}
      <div>
        <div className="text-xs text-text-muted mb-2 uppercase tracking-wider font-semibold">心理重建轨迹</div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-accent-teal -translate-y-1/2 rounded transition-all duration-500" 
            style={{ width: `${(Math.max(0, psychIndex) / (psychStages.length - 1)) * 100}%` }} 
          />
          <div className="relative flex justify-between">
            {psychStages.map((stage, i) => {
              const isActive = i === psychIndex;
              const isPast = i < psychIndex;
              return (
                <div key={stage.id} className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white relative z-10 transition-colors
                    ${isActive ? "border-accent-teal ring-4 ring-accent-teal/20" : 
                      isPast ? "border-accent-teal bg-accent-teal" : "border-gray-200"}`}
                  >
                     {isPast && <svg width="8" height="8" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
                  </div>
                  <div className={`text-[10px] md:text-xs mt-2 text-center max-w-[60px] md:max-w-none ${isActive ? "text-accent-teal font-medium" : "text-gray-400"}`}>
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
}
