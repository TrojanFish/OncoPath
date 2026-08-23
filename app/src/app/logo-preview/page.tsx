"use client";

import { useState } from "react";
import Link from "next/link";
import SubpageNavbar from "@/components/SubpageNavbar";
import { Check, Copy, ArrowRight, ShieldCheck, Sparkles, Compass } from "lucide-react";

export default function LogoPreviewPage() {
  const [selectedConcept, setSelectedConcept] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  const concepts = [
    {
      id: 1,
      name: "方案一：双叶导航光环 (Luminous Lung & Guidance Path)",
      tag: "推荐 · 最契合 OncoPath 品牌定义",
      desc: "将肺叶轮廓解构为两条向上延伸的治愈青绿（Healing Teal）与信赖蓝（Trust Blue）柔光莫比乌斯航道，中央镶嵌一颗循证决策导航星标。象征平台带领患者穿越病理迷雾，走向 5 年临床治愈。",
      file: "/logo-candidates/concept-1-path.svg",
      highlights: ["Apple iOS 级圆角 Squircle", "青蓝渐变呼吸微光", "向上升腾的治愈感与确定性"],
    },
    {
      id: 2,
      name: "方案二：循证罗盘与神经支气管 (Evidence Compass & Bronchial Tree)",
      tag: "科技感 · 顶刊科研公信力",
      desc: "深邃蓝黑底色融合 4D 循证导航罗盘与支气管神经网络光节点。突出 JTO / Lancet 顶刊真实世界队列计算与 IASLC 9th 分期标准算法的严密科学性。",
      file: "/logo-candidates/concept-2-compass.svg",
      highlights: ["深海科技深邃蓝背景", "光纤节点与神经网络", "4D 导航罗盘同心环"],
    },
    {
      id: 3,
      name: "方案三：守护之盾与生命之翼 (Protective Shield & Healing Wings)",
      tag: "极简纯白 · 安全守护感",
      desc: "极简几何黄金分割。将肺部抽象为向外舒展的生命之翼，并环抱中央的 OncoPath (O-P) 品牌路径盾牌，传达全病程安全防护与抗焦虑心理铠甲。",
      file: "/logo-candidates/concept-3-shield.svg",
      highlights: ["极简现代扁平矢量", "安全防护盾牌构图", "O-P 品牌字母微标"],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-500 selection:text-white">
      <SubpageNavbar />

      <main className="max-w-6xl mx-auto px-4 pt-28 md:pt-32 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1 rounded-full text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>OncoPath 全新品牌 Logo 设计候选方案</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            请预览并确认您偏好的 Logo 设计
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            为您定制了 3 款兼具<strong>医学严谨度、抗焦虑治愈感与苹果/现代科技质感</strong>的矢量 Logo 方案。请点击卡片选择您最中意的一款。
          </p>
        </div>

        {/* 3 Candidates Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {concepts.map((c) => {
            const isSelected = selectedConcept === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConcept(c.id)}
                className={`bg-white rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? "border-blue-600 shadow-xl ring-4 ring-blue-100 -translate-y-1"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-5">
                  {/* Tag */}
                  <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.tag}
                  </span>

                  {/* Logo Display (Square) */}
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 p-6 flex items-center justify-center border border-slate-200/80 shadow-inner group-hover:scale-102 transition-transform duration-300">
                    <img src={c.file} alt={c.name} className="w-full h-full object-contain drop-shadow-md" />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.desc}</p>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    {c.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isSelected ? "已选定当前方案" : "点击选择该方案"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Navbar Preview Simulation */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">实景应用效果预览（导航栏 Navbar 尺寸模拟）</h3>
              <p className="text-xs text-slate-500 mt-0.5">当前选定方案在顶部导航栏 32x32px 尺寸下的实际呈现效果：</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              方案 {selectedConcept}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between max-w-lg mx-auto shadow-inner">
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-xs bg-white">
                <img
                  src={concepts.find((c) => c.id === selectedConcept)?.file}
                  alt="Navbar Logo Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-base">
                Onco<span className="text-blue-600 font-extrabold">Path</span>
              </span>
            </div>

            <span className="text-xs text-slate-400 font-medium">← 真实导航栏展示模拟</span>
          </div>
        </div>
      </main>
    </div>
  );
}
