"use client";

export function StasAirwayVisual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-sky-400">🔬 显微切片概念图解</span>
        <span className="text-[10px] text-slate-400">标注：仅为原理解释，非真实解剖</span>
      </div>

      <svg viewBox="0 0 200 110" className="w-full h-auto">
        <defs>
          <pattern id="alveoli-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 0 8 Q 8 0 16 8 Q 8 16 0 8" fill="none" stroke="#1e293b" strokeWidth="0.6" />
          </pattern>
        </defs>

        {/* Normal Alveoli Background Mesh */}
        <rect width="200" height="110" fill="#0b1120" rx="8" />
        <rect width="200" height="110" fill="url(#alveoli-pattern)" />

        {/* Main Solid Tumor Mass */}
        <path
          d="M 10 10 Q 75 15 80 55 Q 75 95 10 100 Z"
          fill="#be123c"
          opacity="0.85"
        />
        <text x="35" y="58" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
          主肿瘤核心
        </text>

        {/* Safety Margin Dashed Line (Lobectomy Line) */}
        <line x1="130" y1="5" x2="130" y2="105" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,2" />
        <text x="133" y="15" fill="#10b981" fontSize="5.5" fontWeight="bold">
          标准肺叶切除切缘线 (≥ 2cm)
        </text>

        {/* STAS Floating Tumor Cell Nests in Air Spaces */}
        {/* Near Nest 1 */}
        <circle cx="95" cy="35" r="3.5" fill="#fb7185" />
        <circle cx="92" cy="33" r="2" fill="#fda4af" />
        <circle cx="98" cy="36" r="1.8" fill="#fda4af" />

        {/* Near Nest 2 */}
        <circle cx="108" cy="65" r="4" fill="#fb7185" />
        <circle cx="105" cy="62" r="2.2" fill="#fda4af" />
        <circle cx="112" cy="67" r="2" fill="#fda4af" />

        {/* Near Nest 3 */}
        <circle cx="100" cy="85" r="3" fill="#fb7185" />

        {/* Pointer Annotations */}
        <path d="M 108 55 L 108 61" stroke="#f43f5e" strokeWidth="0.8" markerEnd="url(#arrow-red)" />
        <text x="108" y="52" textAnchor="middle" fill="#f43f5e" fontSize="5.5" fontWeight="bold">
          气道内漂浮瘤巢 (STAS)
        </text>

        {/* Clearance Shield Area */}
        <rect x="135" y="60" width="55" height="40" rx="4" fill="#064e3b" opacity="0.6" stroke="#059669" strokeWidth="0.6" />
        <text x="162" y="75" textAnchor="middle" fill="#34d399" fontSize="6" fontWeight="bold">
          健康安全肺组织
        </text>
        <text x="162" y="87" textAnchor="middle" fill="#a7f3d0" fontSize="4.5">
          切除线包绕全部漂浮灶
        </text>
      </svg>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> STAS 细胞仅飘散在主肿瘤周边的微小气腔内。只要手术达到绿色虚线所示的<strong>安全切除边界（如标准肺叶切除）</strong>，连同散在细胞在内的整个肺叶被整体移出，复发风险即被彻底切除阻断！
      </div>
    </div>
  );
}
