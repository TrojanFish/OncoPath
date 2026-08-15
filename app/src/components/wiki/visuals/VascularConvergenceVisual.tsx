"use client";

export function VascularConvergenceVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-rose-400">🌿 血管集束征 (Vascular Convergence) 原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Central Nodule Mass */}
        <circle cx="110" cy="55" r="18" fill="#e11d48" opacity="0.85" />
        <text x="110" y="53" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
          结节病灶
        </text>
        <text x="110" y="60" textAnchor="middle" fill="#fecdd3" fontSize="4.5">
          (代谢活跃区)
        </text>

        {/* Converging Pulmonary Blood Vessels coming from multiple directions */}
        {/* Vessel 1 from Top-Left */}
        <path d="M 20 20 C 50 30, 80 40, 94 48" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 20 20 C 50 30, 80 40, 94 48" fill="none" stroke="#fb7185" strokeWidth="1.2" strokeLinecap="round" />

        {/* Vessel 2 from Bottom-Left */}
        <path d="M 25 90 C 55 80, 80 70, 95 62" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />

        {/* Vessel 3 from Right (passing straight into nodule) */}
        <path d="M 200 55 C 160 55, 140 55, 128 55" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        <path d="M 200 55 C 160 55, 140 55, 128 55" fill="none" stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round" />

        {/* Vessel 4 from Top-Right */}
        <path d="M 185 20 C 160 30, 140 40, 125 47" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />

        {/* Convergence arrows and annotations */}
        <text x="50" y="32" fill="#fda4af" fontSize="4.5">肺血管分支向病灶汇聚 ➔</text>
        <text x="160" y="70" fill="#fda4af" fontSize="4.5">⬅ 供血通道牵拉聚集</text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 血管集束征就像附近的小水渠被引流汇聚到了病变区域。不仅恶性肿瘤需要供血，<strong>局部急慢性炎症充血、肉芽肿机化同样会导致周边血管受牵拉或增粗汇聚</strong>。抗炎后随访观察血管有无退缩是临床鉴别的重要手段。
      </div>
    </div>
  );
}
