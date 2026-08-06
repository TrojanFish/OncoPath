import React from 'react';

export function TimeSlider({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-center gap-2 z-10 w-80 shadow-lg shadow-black/20">
      <div className="flex justify-between w-full text-xs text-text-muted font-medium px-1">
        <span>初始</span>
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
        className="w-full h-1.5 bg-dark/50 rounded-lg appearance-none cursor-pointer accent-accent-blue"
        style={{
          background: `linear-gradient(to right, #4f8ef7 ${value * 20}%, rgba(255,255,255,0.1) ${value * 20}%)`
        }}
      />
      <div className="text-[10px] text-text-muted/70 mt-1">
        💡 拖动时间轴，观察复发与转移风险随时间的衰减
      </div>
    </div>
  );
}
