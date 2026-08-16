"use client";

export function VacuoleSignVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-teal-400">🧀 空泡征与支气管充气征 (Vacuole / Air Bronchogram)</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Left: Vacuole Sign (Tiny round air-containing alveolar spaces < 5mm) */}
        <g transform="translate(10, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#2dd4bf" fontSize="6.5" fontWeight="bold">
            空泡征 (小气孔)
          </text>
          
          {/* Main GGO nodule mass */}
          <circle cx="47.5" cy="55" r="20" fill="#0d9488" opacity="0.75" />

          {/* Unfilled Patent Alveolar Lucencies (Vacuoles) */}
          <circle cx="40" cy="48" r="3.2" fill="#090d16" stroke="#5eead4" strokeWidth="0.8" />
          <circle cx="54" cy="52" r="2.8" fill="#090d16" stroke="#5eead4" strokeWidth="0.8" />
          <circle cx="44" cy="62" r="2.5" fill="#090d16" stroke="#5eead4" strokeWidth="0.8" />

          <text x="47.5" y="78" textAnchor="middle" fill="#ccfbf1" fontSize="4.5">
            未闭合的小肺泡腔 (&lt; 5mm)
          </text>
          <text x="47.5" y="85" textAnchor="middle" fill="#99f6e4" fontSize="4">
            (贴壁生长早期·保留骨架)
          </text>
        </g>

        {/* Right: Air Bronchogram (Patent Bronchus running through nodule) */}
        <g transform="translate(115, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="bold">
            支气管充气征 (管腔通畅)
          </text>

          {/* Main GGO nodule mass */}
          <circle cx="47.5" cy="55" r="20" fill="#0284c7" opacity="0.7" />

          {/* Patent Bronchus Branch passing smoothly through without destruction */}
          <path
            d="M 25 35 C 38 45, 55 58, 70 75"
            fill="none"
            stroke="#090d16"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 25 35 C 38 45, 55 58, 70 75"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          <text x="47.5" y="78" textAnchor="middle" fill="#e0f2fe" fontSize="4.5">
            细支气管自然通畅穿行
          </text>
          <text x="47.5" y="85" textAnchor="middle" fill="#bae6fd" fontSize="4">
            (管壁未被完全破坏闭塞)
          </text>
        </g>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 空泡征就像瑞士奶酪里的气孔。它代表肿瘤细胞沿着肺泡壁“单层贴壁爬行”，<strong>并没有把肺泡完全填实堵死，内部依然保留着正常含气的呼吸微结构</strong>。在磨玻璃结节中出现空泡征，往往提示病灶处于极其早期的惰性生长阶段！
      </div>
    </div>
  );
}
