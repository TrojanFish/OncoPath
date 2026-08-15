"use client";

export function PleuralIndentationVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">⛺ 胸膜凹陷/牵拉征 (Pleural Indentation) 原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 220 110" className="w-full h-auto">
        <rect width="220" height="110" fill="#0b1120" rx="8" />

        {/* Outer Chest Wall (Reference) */}
        <rect x="195" y="5" width="20" height="100" fill="#1e293b" opacity="0.4" rx="2" />
        <text x="205" y="55" textAnchor="middle" fill="#64748b" fontSize="5" transform="rotate(90 205 55)">
          壁层胸膜/胸壁
        </text>

        {/* Visceral Pleural Membrane Line (Pulled inwards like a tent) */}
        <path
          d="M 180 5 L 180 30 Q 155 55 180 80 L 180 105"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        <text x="182" y="18" fill="#38bdf8" fontSize="5.5" fontWeight="bold">
          脏层胸膜 (肺表面)
        </text>

        {/* Clear Pleural Space (No invasion into chest wall!) */}
        <rect x="183" y="25" width="10" height="60" fill="#064e3b" opacity="0.4" rx="2" />
        <text x="188" y="58" textAnchor="middle" fill="#34d399" fontSize="4.5" transform="rotate(90 188 58)">
          胸膜腔间隙完整
        </text>

        {/* Subpleural Nodule pulling the pleura inwards via fibrous contraction */}
        <circle cx="115" cy="55" r="18" fill="#e11d48" opacity="0.85" />
        <text x="115" y="53" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
          近胸膜结节
        </text>
        <text x="115" y="60" textAnchor="middle" fill="#fda4af" fontSize="4.5">
          (内部成纤维收缩)
        </text>

        {/* Physical Contraction Traction Lines */}
        <line x1="133" y1="52" x2="162" y2="52" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,1.5" />
        <line x1="131" y1="46" x2="168" y2="40" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,1" />
        <line x1="131" y1="64" x2="168" y2="70" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,1" />

        {/* Inverted V-Shaped Tent Annotation */}
        <path d="M 175 40 L 160 55 L 175 70" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
        <text x="145" y="38" fill="#fbbf24" fontSize="5" fontWeight="bold">
          “小帐篷”三角形凹陷
        </text>
        <text x="145" y="44" fill="#fde68a" fontSize="4">
          (结节收缩向内牵拉)
        </text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 胸膜牵拉是结节内部成纤维细胞像“瘢痕收缩”一样，把靠近肺表面的薄膜向内拉扯出了一个<strong>三角形小帐篷凹坑</strong>。它是一种纯粹的<strong>物理力学收缩现象</strong>，绝不代表癌细胞长到了胸壁上，陈旧性结核灶也极易造成胸膜牵拉！
      </div>
    </div>
  );
}
