import React from 'react';
import { SANDBOX_NODES } from '@/lib/knowledgeGraphData';

export function SandboxPanel({ sandboxActive, onToggle, onExit }: { sandboxActive: Set<string>, onToggle: (id: string) => void, onExit: () => void }) {
  const activeNodes = Array.from(sandboxActive);
  
  return (
    <div className="bg-amber-50/60 rounded-2xl shadow-sm p-6 border border-amber-300/60 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-amber-600 flex items-center gap-2">
          ⚗️ 沙盘推演控制面板
        </h3>
        <button 
          onClick={onExit} 
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center text-lg leading-none transition-colors cursor-pointer"
        >×</button>
      </div>
      
      <p className="text-slate-600 text-xs leading-relaxed mb-6">
        请选择下方治疗方案（干预节点），观察它们如何切断或削弱复发/转移风险链条。
      </p>
      
      <div className="flex flex-col gap-4 flex-1">
        {Object.entries(SANDBOX_NODES).map(([id, nodeData]) => {
          const isActive = sandboxActive.has(id);
          return (
            <div
              key={id}
              onClick={() => onToggle(id)}
              onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); onToggle(id); }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-100 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                  : "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isActive ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                    {isActive && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium text-sm ${isActive ? 'text-amber-700' : 'text-slate-800'}`}>{nodeData.label}</span>
                </div>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-2">{nodeData.mechanism}</p>
              {isActive && (
                <div className="mt-3 pt-3 border-t border-amber-300/50">
                  <div className="text-amber-600 text-xs font-semibold mb-1">干预效果：</div>
                  <p className="text-amber-700 text-xs">{nodeData.hrReduction}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {activeNodes.length === 0 && (
        <div className="mt-6 text-center border-t border-slate-200 pt-4">
          <p className="text-slate-400 text-xs">暂未激活任何干预方案</p>
        </div>
      )}
      
      <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-slate-500 text-[11px] leading-relaxed">
          <strong>⚠️ 免责声明：</strong> 沙盘推演仅用于展示大规模临床试验（如 {Object.values(SANDBOX_NODES).map(n => n.trialName).join('、')}）的统计学结论，展示的风险降低比例不代表对您个人的疗效承诺。请务必与主治医生共同讨论制定最终治疗方案。
        </p>
      </div>
    </div>
  );
}
