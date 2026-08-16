"use client";

export function IhcKi67Visual() {
  return (
    <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-4 text-white select-none border border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-purple-400">🧬 免疫组化 (IHC) 标记与 Ki-67 发动机转速表</span>
        <span className="text-[10px] text-slate-400">病理报告解码</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Left Card: IHC Identity Markers (身份证) */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
            <span>🪪 肿瘤组织学身份证 (IHC 阳性)</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200">TTF-1 (+) / Napsin A (+)</span>
                <div className="text-[9px] text-slate-400">肺腺癌特异性标记</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                腺癌身份证
              </span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-200">P40 (+) / P63 (+)</span>
                <div className="text-[9px] text-slate-400">肺鳞癌特异性标记</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                鳞癌身份证
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            💡 “阳性”仅代表细胞上有该蛋白天生标签，用来定性病理分类，绝不代表扩散或转移！
          </div>
        </div>

        {/* Right Card: Ki-67 Proliferation Index (转速表) */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
            <span>⏱️ 细胞增殖活跃度 (Ki-67 转速表)</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-500/30 flex justify-between items-center">
              <span className="text-emerald-300 font-bold">Ki-67 &lt; 5%</span>
              <span className="text-[10px] text-emerald-400">极低速怠速运转 · 极惰性</span>
            </div>
            <div className="bg-sky-950/40 p-1.5 rounded-lg border border-sky-500/30 flex justify-between items-center">
              <span className="text-sky-300 font-bold">Ki-67 5% ~ 25%</span>
              <span className="text-[10px] text-sky-400">中速运转 · 早期经典腺癌常见</span>
            </div>
            <div className="bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/30 flex justify-between items-center">
              <span className="text-rose-300 font-bold">Ki-67 &gt; 30%</span>
              <span className="text-[10px] text-rose-400">高速增殖 · 对化疗/靶向极敏感</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            💡 Ki-67 是增殖期细胞百分比，<strong>绝不等于复发率</strong>！活跃细胞更容易被药物识别杀死。
          </div>
        </div>
      </div>

      <div className="mt-2.5 text-[11px] text-slate-300 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
        💡 <strong>图解要点：</strong> 免疫组化里的 TTF-1、CK7 阳性是病理医生确认肿瘤“姓甚名谁（腺癌还是鳞癌）”的<strong>组织学身份证</strong>；Ki-67 则是反映细胞当下增殖速度的<strong>发动机转速表</strong>，数值高低指导用药敏感性，绝非复发转移的概率裁决！
      </div>
    </div>
  );
}
