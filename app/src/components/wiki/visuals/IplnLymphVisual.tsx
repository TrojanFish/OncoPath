"use client";

export function IplnLymphVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-emerald-400">🛡️ 胸膜下微结节 / 肺内正常淋巴结 (IPLN) 原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Outer Chest Wall & Visceral Pleural Line */}
        <line x1="20" y1="95" x2="200" y2="95" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4,2" />
        <text x="110" y="104" textAnchor="middle" fill="#38bdf8" fontSize="5" fontWeight="bold">
          肺表面胸膜线 (Visceral Pleura)
        </text>

        {/* Fissural Line (Interlobar Fissure) */}
        <line x1="40" y1="10" x2="180" y2="95" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="145" y="60" fill="#64748b" fontSize="4.5" transform="rotate(27 145 60)">
          叶间裂 (Fissure)
        </text>

        {/* Left: Benign IPLN (Typical Lentiform / Triangular shape close to pleura) */}
        <g transform="translate(65, 60)">
          {/* Flat oval / lentiform benign lymph node */}
          <ellipse cx="0" cy="0" rx="14" ry="6" fill="#059669" opacity="0.85" stroke="#34d399" strokeWidth="0.8" />
          <text x="0" y="1.5" textAnchor="middle" fill="#ffffff" fontSize="4.5" fontWeight="bold">
            扁豆状良性淋巴结
          </text>
        </g>

        {/* Right: Round Subpleural Nodule */}
        <g transform="translate(145, 75)">
          <path d="M -8 10 L 0 -5 L 8 10 Z" fill="#059669" opacity="0.85" stroke="#34d399" strokeWidth="0.8" />
          <text x="0" y="6" textAnchor="middle" fill="#ffffff" fontSize="4" fontWeight="bold">
            三角形IPLN
          </text>
        </g>

        {/* Anatomical Feature Labels */}
        <text x="25" y="25" fill="#34d399" fontSize="5.5" fontWeight="bold">
          ✓ 常见良性特征：
        </text>
        <text x="25" y="34" fill="#a7f3d0" fontSize="4.5">
          1. 贴近胸膜下或叶间裂 (&lt; 15mm 范围内)
        </text>
        <text x="25" y="42" fill="#a7f3d0" fontSize="4.5">
          2. 形态多呈扁平形、长椭圆形或三角形（非球形）
        </text>
        <text x="25" y="50" fill="#a7f3d0" fontSize="4.5">
          3. 直径微小 (&lt; 6mm)，边缘光整，长期稳定
        </text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 肺内淋巴结（IPLN）是人体正常的免疫哨所，<strong>天生就紧贴在肺表面胸膜下或叶间裂附近</strong>。在 CT 切面上常呈“小扁豆”或“三角形”，绝大多数在 3~5mm 以内，完全属于无害的正常生理结构，绝非胸膜转移！
      </div>
    </div>
  );
}
