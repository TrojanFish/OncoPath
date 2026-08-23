import React from 'react';
import { Clock } from 'lucide-react';

export function TimeSlider({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 shadow-xl flex flex-col items-center gap-2 z-10 w-80">
      <div className="flex justify-between w-full text-xs text-slate-600 font-medium px-1">
        <span>术后初始</span>
        <span>1年</span>
        <span>2年</span>
        <span>3年</span>
        <span>4年</span>
        <span>5年+</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="5" 
        step="0.1" 
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        style={{
          background: `linear-gradient(to right, #2563eb ${value * 20}%, #e2e8f0 ${value * 20}%)`
        }}
      />
      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
        <Clock className="w-3 h-3 text-blue-600 shrink-0" />
        <span>拖动时间轴，观察复发与转移风险随时间的衰减</span>
      </div>
    </div>
  );
}
