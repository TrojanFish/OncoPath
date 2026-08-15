"use client";

export function CalcificationVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-amber-400">🛡️ 钙化结节良性特征与爆米花样钙化</span>
        <span className="text-[10px] text-slate-400">CT 影像学特征</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Pattern 1: Popcorn Calcification (Classic Benign Hamartoma) */}
        <g transform="translate(10, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#fbbf24" fontSize="6.5" fontWeight="bold">
            爆米花样钙化 (错构瘤)
          </text>
          
          {/* Nodule Body */}
          <circle cx="47.5" cy="52" r="18" fill="#065f46" opacity="0.75" />

          {/* Popcorn-like dense white calcifications */}
          <circle cx="42" cy="46" r="3.5" fill="#ffffff" stroke="#fef08a" strokeWidth="0.6" />
          <circle cx="53" cy="49" r="4.2" fill="#ffffff" stroke="#fef08a" strokeWidth="0.6" />
          <circle cx="45" cy="58" r="3.2" fill="#ffffff" stroke="#fef08a" strokeWidth="0.6" />
          <circle cx="37" cy="54" r="2.5" fill="#ffffff" stroke="#fef08a" strokeWidth="0.6" />

          <text x="47.5" y="78" textAnchor="middle" fill="#fef08a" fontSize="4.5" fontWeight="bold">
            散在致密高亮钙化点
          </text>
          <text x="47.5" y="85" textAnchor="middle" fill="#d1fae5" fontSize="4">
            (良性错构瘤 100% 特征)
          </text>
        </g>

        {/* Pattern 2: Complete / Concentric Dense Calcification (Old TB/Granuloma scar) */}
        <g transform="translate(115, 10)">
          <rect width="95" height="90" fill="#1e293b" opacity="0.5" rx="6" />
          <text x="47.5" y="16" textAnchor="middle" fill="#34d399" fontSize="6.5" fontWeight="bold">
            完全实心钙化 (陈旧病灶)
          </text>

          {/* Fully calcified stone-like nodule */}
          <circle cx="47.5" cy="52" r="16" fill="#ffffff" stroke="#a7f3d0" strokeWidth="1.5" />
          <circle cx="47.5" cy="52" r="10" fill="#e2e8f0" />
          <circle cx="47.5" cy="52" r="4" fill="#cbd5e1" />

          <text x="47.5" y="78" textAnchor="middle" fill="#6ee7b7" fontSize="4.5" fontWeight="bold">
            “小石头”完全石化
          </text>
          <text x="47.5" y="85" textAnchor="middle" fill="#a7f3d0" fontSize="4">
            (既往结核/感染已愈合)
          </text>
        </g>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 钙化是机体将病变组织“包裹石化”的愈合结痂反应。<strong>爆米花样钙化、同心圆层状钙化以及中心完全钙化，是医学上公认的 100% 良性金标准特征</strong>（如错构瘤或已痊愈的结核球），绝非恶性癌变，无需频繁复查！
      </div>
    </div>
  );
}
