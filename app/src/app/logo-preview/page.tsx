"use client";

import { useState } from "react";
import SubpageNavbar from "@/components/SubpageNavbar";
import { Check, Sparkles } from "lucide-react";

export default function LogoPreviewPage() {
  const [selectedConcept, setSelectedConcept] = useState<string>("a");

  const concepts = [
    {
      id: "a",
      name: "方案 A：莫比乌斯呼吸环 (The Mobius Breath · OP Monogram)",
      tag: "推荐 · 最纯粹现代主义",
      desc: "由一笔流畅、粗细平滑的加粗莫比乌斯回环构成。巧妙将 O 与 P 字母融合，自然勾勒出一侧饱满透亮的肺叶轮廓与核心航标星点。在极小尺寸下依然清晰可辨。",
      file: "/logo-candidates/concept-a.png",
      svg: "/logo-candidates/concept-a-mobius.svg",
      highlights: ["一笔连贯莫比乌斯环", "O 与 P 极简字母同构", "极小尺寸依然极度清晰"],
    },
    {
      id: "b",
      name: "方案 B：双叶几何交叠 (The Intersecting Breath · 双色几何)",
      tag: "先锋 · Linear/Stripe 几何风",
      desc: "治愈青绿与信赖湛蓝两个纯净水滴几何形错落交叠，正中自然留白出一条呼吸气道与纯白智核。象征多学科会诊（MDT）与病理/影像双重循证验证。",
      file: "/logo-candidates/concept-b.png",
      svg: "/logo-candidates/concept-b-intersect.svg",
      highlights: ["双色水滴纯几何重叠", "中央负空间气道留白", "顶级国际 SaaS 极简质感"],
    },
    {
      id: "c",
      name: "方案 C：极简双弧信标 (Minimalist Beacon · 包豪斯线条)",
      tag: "端庄 · 心理安全感",
      desc: "左侧青绿柔弧 + 右侧湛蓝上扬弧线，左右对称环抱，中央托起一颗菱形航标。构图如同双臂守护生命，又如肺叶舒展呼吸，极具包豪斯建筑美感。",
      file: "/logo-candidates/concept-c.png",
      svg: "/logo-candidates/concept-c-beacon.svg",
      highlights: ["包豪斯极简线条构图", "中央菱形指路信标", "极致克制抗焦虑设计"],
    },
    {
      id: "d",
      name: "方案 D：瑞士先锋单环 (Swiss OP Mark · 极简点线)",
      tag: "极致 · 点线面先锋构成",
      desc: "极简主义终极形态：优雅开口呼吸圆环 + 垂直上升中轴导航线 + 启明航标。纯粹由点、线、圆黄金比例构成，象征由混乱到清晰的确定性决策。",
      file: "/logo-candidates/concept-d.png",
      svg: "/logo-candidates/concept-d-swiss.svg",
      highlights: ["纯粹点、线、圆构成", "瑞士现代主义先锋美学", "极高辨识度与现代性"],
    },
  ];

  const currentConcept = concepts.find((c) => c.id === selectedConcept) || concepts[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-500 selection:text-white">
      <SubpageNavbar />

      <main className="max-w-6xl mx-auto px-4 pt-28 md:pt-32 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1 rounded-full text-xs font-bold border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>OncoPath 极致简约（Minimalist）Logo 设计展</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            重新设计的 4 款极致简约 Logo 方案
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            摒弃繁复背景与多余装饰，采用<strong>纯粹几何、负空间与现代单线条</strong>构图，打造国际顶级先锋科技与医疗美学品牌标识。
          </p>
        </div>

        {/* 4 Candidates Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {concepts.map((c) => {
            const isSelected = selectedConcept === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedConcept(c.id)}
                className={`bg-white rounded-3xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected
                    ? "border-blue-600 shadow-xl ring-4 ring-blue-100 -translate-y-1"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tag */}
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {c.tag}
                  </span>

                  {/* Logo Display (Square) */}
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white p-4 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-103 transition-transform duration-300">
                    <img src={c.file} alt={c.name} className="w-full h-full object-contain drop-shadow-sm" />
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{c.name}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{c.desc}</p>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    {c.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isSelected ? "已选定" : "选择该方案"}</span>
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
              <h3 className="text-base font-bold text-slate-900">实景导航栏应用效果预览（Navbar 32×32px 微标测试）</h3>
              <p className="text-xs text-slate-500 mt-0.5">当前选定方案在顶部导航栏极小尺寸下的清晰度呈现：</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              方案 {currentConcept.id.toUpperCase()}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between max-w-md mx-auto shadow-inner">
            <div className="flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center p-1 bg-white">
                <img
                  src={currentConcept.file}
                  alt="Navbar Logo Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-base">
                Onco<span className="text-blue-600 font-extrabold">Path</span>
              </span>
            </div>

            <span className="text-xs text-slate-400 font-medium">← 真实导航栏微标效果</span>
          </div>
        </div>
      </main>
    </div>
  );
}
