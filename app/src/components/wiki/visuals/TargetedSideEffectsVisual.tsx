"use client";

import React, { useState } from "react";
import { Sparkles, ShieldCheck, AlertCircle, Pill, ChevronRight } from "lucide-react";

export function TargetedSideEffectsVisual() {
  const [activeTab, setActiveTab] = useState<"rash" | "paronychia" | "diarrhea" | "stomatitis">("paronychia");

  const symptoms = {
    paronychia: {
      title: "甲沟炎 / 指甲嵌甲化脓",
      frequency: "发生率 20%~35%",
      severity: "多见于用药 4~8 周后，拇趾与手指多发",
      ladder: [
        { grade: "1级 (红肿微痛)", action: "温水+白醋(1:1)或稀释碘伏每日浸泡15分钟；外涂复方多粘菌素B/夫西地酸" },
        { grade: "2级 (渗液伴肉芽)", action: "局部鱼石脂软膏拔脓，外用夫西地酸+地奈德交替，修剪指甲避免刺入甲褶" },
        { grade: "3级 (剧痛化脓感染)", action: "皮肤科/甲病外科微创甲旁减压或拔甲，配合口服头孢抗生素，必要时靶向药减量" },
      ],
      tips: "穿宽松软底透气鞋袜，避免赤手接触洗涤剂，指甲平剪勿抠修边缘。"
    },
    rash: {
      title: "皮疹 / 痤疮样皮损",
      frequency: "发生率 35%~50%",
      severity: "面部、头皮、前胸后背红斑丘疹",
      ladder: [
        { grade: "1级 (轻度无症状)", action: "温和无刺激保湿霜（如神经酰胺/维生素E乳），避免皂基洁面与热水烫洗" },
        { grade: "2级 (红斑丘疹伴痒)", action: "外涂夫西地酸乳膏（早）+ 尤卓尔/地奈德乳膏（晚），口服氯雷他定抗过敏" },
        { grade: "3级 (大面积脱屑脓疱)", action: "口服米诺环素/多西环素（100mg bid），皮肤科会诊评估，暂停或下调靶向剂量" },
      ],
      tips: "外出严格物理防晒（防晒伞、宽檐帽），温水洁面，严禁挤压抓挠。"
    },
    diarrhea: {
      title: "靶向药腹泻 / 肠道反应",
      frequency: "发生率 20%~30%",
      severity: "服药后水样便或排便频次增加",
      ladder: [
        { grade: "1级 (每日增<4次)", action: "清淡少渣饮食，暂停生冷油腻与牛奶，饮用口服补液盐(ORS)防电解质紊乱" },
        { grade: "2级 (每日增4~6次)", action: "首剂蒙脱石散(3g)隔开靶向药2小时服用；或口服洛哌丁胺(易蒙停，首剂4mg后每次2mg)" },
        { grade: "3级 (每日增≥7次/脱水)", action: "立即就医静脉补液，暂停靶向药，排除艰难梭菌感染后使用生长抑素类药物" },
      ],
      tips: "严禁擅自使用强效广谱抗生素，排便后温水清洗肛周涂抹红霉素软膏。"
    },
    stomatitis: {
      title: "口腔黏膜炎 / 口腔溃疡",
      frequency: "发生率 10%~20%",
      severity: "唇舌及颊黏膜散在痛性溃疡",
      ladder: [
        { grade: "1级 (轻微痛感不影响进食)", action: "软毛牙刷温和刷牙，饭后使用无刺激生理盐水或康复新液含漱 3~5 次/日" },
        { grade: "2级 (明显疼痛影响硬食)", action: "局部涂抹重组人表皮生长因子凝胶或曲安奈德口腔软膏，餐前利多卡因凝胶止痛" },
        { grade: "3级 (不能进食/大面积溃烂)", action: "营养科静脉营养支持，预防性抗真菌含漱液，靶向药物暂停调整" },
      ],
      tips: "避免辛辣酸烫硬食物，补充复合维生素B族与锌制剂促进黏膜修复。"
    }
  };

  const current = symptoms[activeTab];

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white border border-slate-800 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-100">三代靶向药四大副作用阶梯护理急救箱</h5>
            <span className="text-[10px] text-slate-400 font-mono">奥希替尼 / 伏美替尼 / 阿来替尼 居家外用备药指南</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
          阶梯应对
        </span>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 text-xs">
        <button
          onClick={() => setActiveTab("paronychia")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
            activeTab === "paronychia"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          甲沟炎护理
        </button>
        <button
          onClick={() => setActiveTab("rash")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
            activeTab === "rash"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          皮疹处理
        </button>
        <button
          onClick={() => setActiveTab("diarrhea")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
            activeTab === "diarrhea"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          止泻阶梯
        </button>
        <button
          onClick={() => setActiveTab("stomatitis")}
          className={`py-1.5 px-2 rounded-lg font-bold transition-all text-center cursor-pointer ${
            activeTab === "stomatitis"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-slate-300 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          口腔溃疡
        </button>
      </div>

      {/* Content Body */}
      <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{current.title}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {current.frequency}
            </span>
            <span className="text-[10px] text-slate-400">{current.severity}</span>
          </div>
        </div>

        {/* 3 Grades */}
        <div className="space-y-2">
          {current.ladder.map((step, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-start gap-2.5 text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                idx === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                idx === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {step.grade}
              </span>
              <span className="text-slate-200 leading-relaxed font-medium">
                {step.action}
              </span>
            </div>
          ))}
        </div>

        {/* Home Care Tips */}
        <div className="p-2.5 bg-purple-950/40 rounded-lg border border-purple-500/30 text-[11px] text-purple-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span><strong>日常预防小贴士：</strong>{current.tips}</span>
        </div>
      </div>
    </div>
  );
}
