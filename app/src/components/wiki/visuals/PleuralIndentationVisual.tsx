"use client";

export function PleuralIndentationVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">⛺ 胸膜凹陷/牵拉征 (Pleural Indentation) 原理解析</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 260 110" className="w-full h-auto">
        <rect width="260" height="110" fill="#0b1120" rx="8" />

        {/* Normal Lung Parenchyma (Left Zone) */}
        <text x="35" y="20" textAnchor="middle" fill="#64748b" fontSize="5" fontWeight="bold">
          肺实质内部
        </text>

        {/* Outer Chest Wall (Reference, Right Zone) */}
        <rect x="218" y="10" width="32" height="90" fill="#1e293b" opacity="0.65" rx="3" stroke="#334155" strokeWidth="0.8" />
        <text x="234" y="55" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontWeight="bold" transform="rotate(90 234 55)">
          壁层胸膜 / 胸壁
        </text>

        {/* Clear Pleural Space (No invasion into chest wall!) */}
        <rect x="188" y="10" width="22" height="90" fill="#064e3b" opacity="0.45" rx="3" stroke="#059669" strokeWidth="0.8" strokeDasharray="2,1" />
        <text x="199" y="55" textAnchor="middle" fill="#34d399" fontSize="5" fontWeight="bold" transform="rotate(90 199 55)">
          胸膜腔间隙完整 (未侵犯)
        </text>

        {/* Visceral Pleural Membrane Line (Pulled inwards like a tent) */}
        <path
          d="M 182 5 L 182 28 Q 148 55 182 82 L 182 105"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
        />
        <text x="178" y="18" textAnchor="end" fill="#38bdf8" fontSize="5.5" fontWeight="bold">
          脏层胸膜 (肺表面)
        </text>

        {/* Subpleural Nodule pulling the pleura inwards via fibrous contraction */}
        <circle cx="75" cy="55" r="20" fill="#e11d48" opacity="0.88" />
        <text x="75" y="52" textAnchor="middle" fill="#ffffff" fontSize="5.5" fontWeight="bold">
          近胸膜结节
        </text>
        <text x="75" y="60" textAnchor="middle" fill="#fda4af" fontSize="4.5">
          (内部成纤维收缩)
        </text>

        {/* Physical Contraction Traction Lines */}
        <line x1="95" y1="55" x2="150" y2="55" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3,1.5" />
        <line x1="92" y1="45" x2="162" y2="38" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,1" />
        <line x1="92" y1="65" x2="162" y2="72" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2,1" />

        {/* Inverted V-Shaped Tent Annotation */}
        <path d="M 172 36 L 150 55 L 172 74" fill="none" stroke="#f59e0b" strokeWidth="1.4" />
        <text x="135" y="32" textAnchor="middle" fill="#fbbf24" fontSize="5.5" fontWeight="bold">
          “小帐篷”三角形凹陷
        </text>
        <text x="135" y="39" textAnchor="middle" fill="#fde68a" fontSize="4.5">
          (结节收缩向内牵拉)
        </text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 胸膜牵拉是结节内部成纤维细胞像“瘢痕收缩”一样，把靠近肺表面的薄膜向内拉扯出了一个<strong>三角形小帐篷凹坑</strong>。它是一种纯粹的<strong>物理力学收缩现象</strong>，绝不代表癌细胞长到了胸壁上，陈旧性结核灶也极易造成胸膜牵拉！
      </div>
    </div>
  );
}
