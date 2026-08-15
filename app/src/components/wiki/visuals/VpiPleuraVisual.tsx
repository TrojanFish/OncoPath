"use client";

export function VpiPleuraVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-amber-400">🚪 胸膜分层侵犯 (PL0 - PL2) 原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 200 110" className="w-full h-auto">
        {/* Lung Parenchyma Background */}
        <rect width="200" height="110" fill="#0b1120" rx="8" />

        {/* 3 Zones: Lung Parenchyma, Visceral Pleura, Pleural Cavity */}
        {/* Zone 1: Lung Tissue */}
        <rect x="10" y="10" width="100" height="90" fill="#1e293b" opacity="0.6" rx="4" />
        <text x="60" y="25" textAnchor="middle" fill="#94a3b8" fontSize="6.5" fontWeight="bold">
          肺实质内部 (组织)
        </text>

        {/* Zone 2: Visceral Pleura Layers */}
        {/* Inner Elastic Lamina (PL1 border) */}
        <line x1="115" y1="10" x2="115" y2="100" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,1" />
        <text x="115" y="106" textAnchor="middle" fill="#38bdf8" fontSize="5" fontWeight="bold">
          内弹力层 (PL1)
        </text>

        {/* Outer Surface Layer (PL2 border) */}
        <line x1="145" y1="10" x2="145" y2="100" stroke="#fbbf24" strokeWidth="2.5" />
        <text x="145" y="106" textAnchor="middle" fill="#fbbf24" fontSize="5" fontWeight="bold">
          脏层外表面 (PL2)
        </text>

        {/* Zone 3: Pleural Cavity (Safe space) */}
        <rect x="150" y="10" width="40" height="90" fill="#0f172a" opacity="0.5" />
        <text x="170" y="55" textAnchor="middle" fill="#64748b" fontSize="5.5" transform="rotate(90 170 55)">
          胸膜腔外空间
        </text>

        {/* Tumor Progressions */}
        {/* PL0: Safe */}
        <circle cx="50" cy="50" r="14" fill="#64748b" opacity="0.7" />
        <text x="50" y="52" textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="bold">PL0 (安全)</text>

        {/* PL1: Penetrates Inner Elastic Layer -> Upstages to T2a */}
        <path d="M 85 45 Q 120 40 125 55 Q 120 70 85 65 Z" fill="#f43f5e" opacity="0.85" />
        <circle cx="123" cy="55" r="3" fill="#fb7185" />
        <text x="95" y="57" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
          PL1 穿透
        </text>

        {/* Resection Line encompassing the whole Visceral Pleura */}
        <path d="M 148 5 L 148 105" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="150" y="20" fill="#10b981" fontSize="5" fontWeight="bold">
          手术切除线 (完整取出)
        </text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> VPI 只是肿瘤触碰或穿过了脏层胸膜的“内层壁纸”（内弹力层），导致 T 分期升为 T2a。但手术切除范围包括了整个脏层胸膜，<strong>已经在物理上完整取出了受侵犯的组织</strong>，它绝不等于晚期胸壁转移！
      </div>
    </div>
  );
}
