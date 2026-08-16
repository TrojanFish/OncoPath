"use client";

export function SpiculationVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-amber-400">🦔 毛刺征 (Spiculation) 影像原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Left: Long Thick Fibrous Strands (Benign Chronic Inflammation / TB scar) */}
        <g transform="translate(10, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#34d399" fontSize="6.5" fontWeight="bold">
            长粗毛刺（良性/瘢痕多见）
          </text>
          
          {/* Central nodule with long thick fibrous tails */}
          <circle cx="47.5" cy="55" r="15" fill="#047857" opacity="0.8" />
          {/* Long strands */}
          <line x1="33" y1="50" x2="10" y2="40" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          <line x1="62" y1="50" x2="88" y2="35" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="47.5" y1="70" x2="47.5" y2="88" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
          
          <text x="47.5" y="53" textAnchor="middle" fill="#ffffff" fontSize="5" fontWeight="bold">
            陈旧性病灶
          </text>
          <text x="47.5" y="60" textAnchor="middle" fill="#a7f3d0" fontSize="4.5">
            (结核/炎症瘢痕机化)
          </text>
        </g>

        {/* Right: Short Fine Radiating Spicules (Malignant infiltration / microvascular pulling) */}
        <g transform="translate(115, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#f43f5e" fontSize="6.5" fontWeight="bold">
            短细毛刺（放射状细丝）
          </text>

          {/* Central nodule with dense short spicules */}
          <circle cx="47.5" cy="55" r="16" fill="#be123c" opacity="0.9" />
          
          {/* Dense short spicules radiating outwards (1-2mm length) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 47.5 + Math.cos(rad) * 16;
            const y1 = 55 + Math.sin(rad) * 16;
            const x2 = 47.5 + Math.cos(rad) * 22;
            const y2 = 55 + Math.sin(rad) * 22;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#fda4af"
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}

          <text x="47.5" y="53" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
            微血管/纤维浸润
          </text>
          <text x="47.5" y="61" textAnchor="middle" fill="#fecdd3" fontSize="4.5">
            (&lt; 3mm 密集细毛刺)
          </text>
        </g>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 毛刺不能一概而论。<strong>长而粗的索条状毛刺（&gt;5mm）绝大多数是以前肺炎或结核好了之后留下的纤维瘢痕</strong>；只有周边密集的“短细放射状毛刺（&lt;3mm）”才提示需要结合结节大小和 CTR 重点关注。
      </div>
    </div>
  );
}
