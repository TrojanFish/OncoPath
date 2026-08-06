import React from 'react';
import { SANDBOX_NODES } from '@/lib/knowledgeGraphData';

export function SandboxPanel({ sandboxActive, onToggle, onExit }: { sandboxActive: Set<string>, onToggle: (id: string) => void, onExit: () => void }) {
  const activeNodes = Array.from(sandboxActive);
  
  return (
    <div className="glass rounded-2xl p-6 border border-amber-500/30 flex flex-col h-full bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-amber-400 flex items-center gap-2">
          ⚗️ 沙盘推演控制面板
        </h3>
        <button onClick={onExit} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
      </div>
      
      <p className="text-text-secondary text-xs leading-relaxed mb-6">
        请选择下方治疗方案（干预节点），观察它们如何切断或削弱复发/转移风险链条。
      </p>
      
      <div className="flex flex-col gap-4 flex-1">
        {Object.entries(SANDBOX_NODES).map(([id, nodeData]) => {
          const isActive = sandboxActive.has(id);
          return (
            <div
              key={id}
              onClick={() => onToggle(id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "bg-dark/40 border-white/10 hover:border-amber-500/30 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${isActive ? 'bg-amber-500 border-amber-500' : 'border-white/30'}`}>
                    {isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`font-medium ${isActive ? 'text-amber-400' : 'text-text-primary'}`}>{nodeData.label}</span>
                </div>
              </div>
              <p className="text-text-muted text-xs leading-relaxed mb-2">{nodeData.mechanism}</p>
              {isActive && (
                <div className="mt-3 pt-3 border-t border-amber-500/20">
                  <div className="text-amber-400 text-xs font-semibold mb-1">干预效果：</div>
                  <p className="text-amber-400/90 text-xs">{nodeData.hrReduction}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {activeNodes.length === 0 && (
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <p className="text-text-muted text-xs">暂未激活任何干预方案</p>
        </div>
      )}
      
      <div className="mt-6 p-4 rounded-xl bg-[#0a0e1a]/80 border border-white/5">
        <p className="text-text-muted text-[11px] leading-relaxed">
          <strong>⚠️ 免责声明：</strong> 沙盘推演仅用于展示大规模临床试验（如 {Object.values(SANDBOX_NODES).map(n => n.trialName).join('、')}）的统计学结论，展示的风险降低比例不代表对您个人的疗效承诺。请务必与主治医生共同讨论制定最终治疗方案。
        </p>
      </div>
    </div>
  );
}
