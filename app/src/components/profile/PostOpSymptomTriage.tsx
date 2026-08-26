"use client";

import React, { useState } from "react";
import { 
  HeartPulse, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Info, 
  Sparkles,
  Stethoscope,
  ChevronRight,
  Wind,
  Activity,
  Flame,
  Droplets
} from "lucide-react";

export type SymptomCategory = "cough" | "pain" | "breath" | "blood_tinge";

interface SymptomInfo {
  id: SymptomCategory;
  name: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  normalReason: string;
  expectedDuration: string;
  homeCareTips: string[];
  outpatientAdvice: string;
  redFlags: string[];
}

const SYMPTOM_DATABASE: SymptomInfo[] = [
  {
    id: "cough",
    name: "术后阵发性干咳 / 喉咙发痒",
    shortDesc: "说话或深呼吸时刺激性干咳，无痰或少许白黏痰",
    icon: Wind,
    normalReason:
      "肺叶切除或肺段切除后，残余肺组织复张牵拉支气管迷走神经分支，加之术中气管插管刺激引起的气道暂时性高反应性，属于非常普遍的良性神经反射。",
    expectedDuration: "通常在术后 1 ~ 3 个月内逐渐减弱，少数敏感体质约需 6 个月自然完全恢复。",
    homeCareTips: [
      "保持室内湿度 50%~60%，多饮温开水保持呼吸道黏膜湿润；",
      "佩戴口罩避免骤冷空气或油烟、灰尘等刺激性气味直接刺激；",
      "避免用力频繁清嗓，可采取小口慢咽温水的方式抑制反射性干咳。",
    ],
    outpatientAdvice:
      "若干咳频繁影响夜间睡眠，可在门诊复查时向主治医生开具复方甲氧那明、阿斯美或布地奈德雾化吸入剂进行对症平喘止咳。",
    redFlags: [
      "剧烈咳嗽伴大量黄色脓臭痰或高热（体温 > 38.5℃）；",
      "咳嗽加剧伴随突发剧烈撕裂样胸痛或呼吸衰竭感；",
      "持续发作无法平卧，口唇发绀。",
    ],
  },
  {
    id: "pain",
    name: "切口周围麻木 / 肋间刺痛",
    shortDesc: "手术切口附近皮肤触觉迟钝、偶发针刺样或抽痛",
    icon: Flame,
    normalReason:
      "胸腔镜手术穿刺孔或切口需经过肋间肌与肋间神经走向区域，术中拉钩牵拉或神经末梢离断后，神经纤维在再生愈合过程中会产生异常电位传导，表现为麻木、蚁走感或阵发针刺痛。",
    expectedDuration: "皮肤麻木通常在 3 ~ 6 个月内代偿改善，偶发刺痛在创面纤维化成熟后（约半年）基本消失。",
    homeCareTips: [
      "术后 2 周切口完全愈合拆线后，可用温毛巾对切口周围进行局部温热敷（避免水温过高烫伤）；",
      "穿着宽松纯棉内衣，避免硬质衣物接缝直接反复摩擦敏感切口区域；",
      "每日进行适度上肢爬墙与扩胸活动，防止局部肌肉粘连挛缩。",
    ],
    outpatientAdvice:
      "如刺痛明显影响白天生活或睡眠，可向主治医生咨询开具甲钴胺（营养神经）或塞来昔布、加巴喷丁胶囊进行短期神经镇痛对症处理。",
    redFlags: [
      "切口局部出现红肿、灼热、波动感或渗脓性分泌物；",
      "肋骨骨折感或局部剧烈剧痛持续加重，抗生素与止痛药无效；",
      "伴随切口下方大面积皮下气肿（按压有捻发音/捏雪感）。",
    ],
  },
  {
    id: "breath",
    name: "活动后轻度气促 / 爬楼微喘",
    shortDesc: "快走或爬 2~3 层楼时感觉呼吸较术前稍显费力",
    icon: Activity,
    normalReason:
      "肺叶切除后肺容积生理性减少约 15%~20%，剩余肺叶需要 3~6 个月时间进行过度膨胀代偿与肺循环微血管重建，加之术后卧床导致呼吸肌耐力暂时下降。",
    expectedDuration: "坚持呼吸功能锻炼，一般在术后 2 ~ 4 个月肺通气功能可恢复至术前 85%~90% 以上。",
    homeCareTips: [
      "坚持每日进行【腹式深呼吸】与【缩唇呼吸】训练（吸气2秒，噘嘴慢呼气4秒）；",
      "每日规律进行 30~45 分钟平地慢走，以‘微微出汗、说话不喘’为适宜运动强度；",
      "使用便携式三球呼吸训练器，循序渐进提升吸气容积。",
    ],
    outpatientAdvice:
      "在术后 3 个月或 6 个月门诊复查时，可复查一次肺功能测定（FEV1 / FVC），评估残肺代偿程度。",
    redFlags: [
      "静息状态下（坐着不动或平躺时）即出现明显憋气呼吸困难；",
      "突发一侧胸痛伴随进行性加重的呼吸衰竭（需警惕自发性气胸或肺栓塞）；",
      "血氧饱和度监测持续低于 92% 或伴有口唇甲床青紫。",
    ],
  },
  {
    id: "blood_tinge",
    name: "晨起痰中偶带微量淡红血丝",
    shortDesc: "偶尔剧烈咳嗽后痰表面附着 1~2 根细小血丝",
    icon: Droplets,
    normalReason:
      "支气管残端缝合钉周围创面在愈合肉芽形成与脱痂过程中，剧烈咳嗽或气道干燥可能导致局部微毛细血管轻微破裂，属于术后早期恢复阶段偶见现象。",
    expectedDuration: "极少量血丝通常为偶发性质，在术后 2 ~ 4 周内随着黏膜完全上皮化而彻底消失。",
    homeCareTips: [
      "严禁剧烈猛烈咳嗽，咳嗽时轻捂切口，以中等力度轻咳排痰；",
      "保持清淡饮食，避免辛辣烫食刺激咽喉黏膜血管充血；",
      "多吃富含维生素 C 的新鲜蔬菜水果促进毛细血管修复。",
    ],
    outpatientAdvice:
      "若偶发血丝持续超过 2 周未缓解，可在门诊复查胸部薄层 CT 时让主治医生重点观察支气管残端愈合状态。",
    redFlags: [
      "咳出整口鲜血或血块（咯血量 > 20 mL）；",
      "持续不断地咳出鲜红色血液，无停止趋势；",
      "伴随头晕、面色苍白、冷汗或心率明显增快（休克前兆）。",
    ],
  },
];

export default function PostOpSymptomTriage() {
  const [selectedCategory, setSelectedCategory] = useState<SymptomCategory>("cough");

  const currentSymptom = SYMPTOM_DATABASE.find((s) => s.id === selectedCategory)!;
  const Icon = currentSymptom.icon;

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm space-y-6 hover:border-teal-300 transition-all">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="min-w-0">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                POST-OP TRIAGE · 术后常见症状红绿灯自查分诊器
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                科学化解出院居家康复焦虑 · 区分正常生理恢复反应与紧急返院信号
              </p>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shrink-0 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>24小时居家安心定心丸</span>
        </div>
      </div>


      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {SYMPTOM_DATABASE.map((item) => {
          const ItemIcon = item.icon;
          const isSelected = item.id === selectedCategory;

          return (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isSelected
                  ? "bg-gradient-to-br from-teal-50/90 via-sky-50/60 to-blue-50/50 border-teal-400 shadow-sm ring-2 ring-teal-400/20"
                  : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  <ItemIcon className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                )}
              </div>

              <div>
                <div className={`text-xs font-bold leading-snug ${
                  isSelected ? "text-teal-950" : "text-slate-700"
                }`}>
                  {item.name.split(" / ")[0]}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.name.split(" / ")[1] || "生理恢复"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tri-Color Detailed Triage Card */}
      <div className="space-y-4">
        {/* Active Symptom Title */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
              <Icon className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">{currentSymptom.name}</h4>
              <p className="text-xs text-slate-500">{currentSymptom.shortDesc}</p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
            ⏱️ 自然缓解周期: <strong className="text-teal-700">{currentSymptom.expectedDuration}</strong>
          </div>
        </div>

        {/* 3-Color Hierarchy Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          
          {/* Level 1: Green - Normal Physiology & Home Care */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 sm:p-5 border border-emerald-200/90 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>🟢 正常生理反应 (安心定心丸)</span>
              </div>

              <div className="text-xs text-emerald-950 leading-relaxed font-medium">
                <strong>为什么会发生？</strong><br />
                {currentSymptom.normalReason}
              </div>

              <div className="pt-2 border-t border-emerald-200/60 space-y-1.5 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1 text-emerald-800">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>居家日常舒缓技巧：</span>
                </div>
                <ul className="space-y-1 pl-1 text-[11px]">
                  {currentSymptom.homeCareTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-emerald-700 font-bold bg-white/80 p-2 rounded-xl border border-emerald-200 mt-2">
              ✓ 属于组织修复必经阶段，无需恐慌
            </div>
          </div>

          {/* Level 2: Yellow - Outpatient Management */}
          <div className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/90 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>🟡 门诊对症调理 (若影响生活)</span>
              </div>

              <div className="text-xs text-amber-950 leading-relaxed font-medium">
                <strong>复查时如何向医生提出？</strong><br />
                {currentSymptom.outpatientAdvice}
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-amber-700" />
                  <span>门诊沟通金句：</span>
                </div>
                <p className="italic text-amber-800 leading-tight">
                  “医生，我术后有{currentSymptom.name.split(" / ")[0]}，偶尔影响睡眠，请问是否可以开具针对性的雾化或口服对症药物？”
                </p>
              </div>
            </div>

            <div className="text-[10px] text-amber-800 font-bold bg-amber-100/60 p-2 rounded-xl border border-amber-200 mt-2">
              ⚡ 常规门诊对症调理，遵医嘱用药
            </div>
          </div>

          {/* Level 3: Red - Urgent Warning Red Flags */}
          <div className="bg-rose-50/50 rounded-2xl p-4 sm:p-5 border border-rose-200/90 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                <span>🔴 紧急警示信号 (需立即就医)</span>
              </div>

              <div className="text-xs text-rose-950 leading-relaxed font-medium">
                <strong>若出现以下极端体征，请立即前往医院急诊或胸外科门诊：</strong>
              </div>

              <ul className="space-y-2 pl-1 text-[11px] text-rose-900 font-medium">
                {currentSymptom.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-white/90 p-2 rounded-xl border border-rose-200 leading-snug">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[10px] text-rose-800 font-bold bg-rose-100 p-2 rounded-xl border border-rose-300 mt-2 text-center">
              🚨 出现上述红线体征请勿拖延，立即就近就医
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
