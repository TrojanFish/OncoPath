"use client";

export function LobulationVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">🌊 分叶征 (Lobulation) 影像原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Left: Shallow Lobulation (Benign tendency e.g. hamartoma/inflammatory) */}
        <g transform="translate(10, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#34d399" fontSize="6.5" fontWeight="bold">
            浅分叶（良性多见）
          </text>
          
          {/* Smooth undulating shape */}
          <path
            d="M 47.5 28 C 65 28, 75 40, 75 55 C 75 70, 60 80, 47.5 80 C 35 80, 20 70, 20 55 C 20 40, 30 28, 47.5 28 Z"
            fill="#059669"
            opacity="0.75"
          />
          <text x="47.5" y="53" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
            边缘平缓起伏
          </text>
          <text x="47.5" y="62" textAnchor="middle" fill="#a7f3d0" fontSize="4.5">
            (错构瘤 / 炎性假瘤)
          </text>
        </g>

        {/* Right: Deep Scalloped Lobulation (Uneven growth rate) */}
        <g transform="translate(115, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#f43f5e" fontSize="6.5" fontWeight="bold">
            深分叶（需密切关注）
          </text>

          {/* Deep scalloped clover-like shape */}
          <path
            d="M 47.5 25 C 60 25, 62 38, 72 45 C 80 50, 76 65, 68 70 C 60 75, 55 82, 45 82 C 35 82, 30 75, 22 68 C 15 62, 18 45, 26 42 C 34 38, 38 25, 47.5 25 Z"
            fill="#be123c"
            opacity="0.85"
          />
          {/* Arrow showing indentation notches */}
          <path d="M 78 40 L 70 47" stroke="#fbbf24" strokeWidth="1" />
          <text x="78" y="36" textAnchor="middle" fill="#fbbf24" fontSize="4.5">深切迹</text>

          <text x="47.5" y="53" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
            各方向生长速度不一
          </text>
          <text x="47.5" y="62" textAnchor="middle" fill="#fecdd3" fontSize="4.5">
            (阻力差异形成的凹凸)
          </text>
        </g>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 分叶是肿瘤各区域细胞增殖速度不同、受周围支气管/血管阻力不均留下的波浪边缘。<strong>浅分叶多见于良性错构瘤或炎性假瘤</strong>，只有伴随实性成分生长的深分叶才提示需要临床重点随访评估。
      </div>
    </div>
  );
}
