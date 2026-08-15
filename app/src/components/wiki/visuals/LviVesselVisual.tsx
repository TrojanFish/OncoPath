"use client";

export function LviVesselVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-rose-400">🚗 脉管通道与全身药物防护机制</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 200 110" className="w-full h-auto">
        <rect width="200" height="110" fill="#0b1120" rx="8" />

        {/* Micro Vessel Tube (Blood / Lymphatic Channel) */}
        <path
          d="M 10 55 C 60 30, 140 80, 190 55"
          fill="none"
          stroke="#991b1b"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <path
          d="M 10 55 C 60 30, 140 80, 190 55"
          fill="none"
          stroke="#ef4444"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Flow Direction Arrows */}
        <path d="M 30 50 L 40 47" stroke="#fca5a5" strokeWidth="1" />
        <path d="M 100 60 L 110 63" stroke="#fca5a5" strokeWidth="1" />
        <path d="M 160 55 L 170 52" stroke="#fca5a5" strokeWidth="1" />

        {/* Tumor Micro-Cluster inside Vessel (LVI) */}
        <g transform="translate(60, 42)">
          <circle cx="0" cy="0" r="4.5" fill="#e11d48" stroke="#ffffff" strokeWidth="0.8" />
          <circle cx="-2.5" cy="-2" r="2.2" fill="#fda4af" />
          <circle cx="2" cy="1.5" r="2" fill="#fda4af" />
          <text x="0" y="-8" textAnchor="middle" fill="#f43f5e" fontSize="5.5" fontWeight="bold">
            微血管内癌栓 (LVI)
          </text>
        </g>

        {/* Systemic Targeted / Chemo Interception Shield (Drug Molecules) */}
        <g transform="translate(135, 65)">
          <circle cx="0" cy="0" r="14" fill="#0284c7" opacity="0.25" />
          <circle cx="0" cy="0" r="9" fill="#0284c7" opacity="0.4" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
          <text x="0" y="2" textAnchor="middle" fill="#38bdf8" fontSize="5.5" fontWeight="bold">
            辅助药物拦截网
          </text>
          <text x="0" y="8" textAnchor="middle" fill="#bae6fd" fontSize="4">
            (奥希替尼/化疗)
          </text>
        </g>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 脉管癌栓是指极少数细胞企图进入微米级毛细血管。现代术后辅助治疗（如第三代靶向药或辅助化疗）就像在全身血液通道布设了<strong>严密的精准巡逻网</strong>，能在微小细胞生长前将其迅速杀灭！
      </div>
    </div>
  );
}
