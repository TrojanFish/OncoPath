"use client";

import React, { useState, useRef, useEffect } from "react";
import type { PatientProfile } from "@/lib/types";
import { computeClinicalTnmStage } from "@/lib/staging";

interface ReportUploaderProps {
  onParsed: (data: any) => void;
}

interface UploadedReportImage {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
  previewUrl: string;
}

// Comprehensive CT Malignant Imaging Signs with Clinical Plain-Language Definitions
const CT_SIGN_DEFINITIONS: Record<string, { label: string; enName: string; desc: string; clinicalMeaning: string }> = {
  "分叶征": {
    label: "分叶征",
    enName: "Lobulation",
    desc: "结节边缘呈现波浪状或凹凸不平的多个弧形分叶",
    clinicalMeaning: "反映肿瘤各方向细胞浸润生长速度不均，或受周围血管支气管阻挡引起的膨胀性生长"
  },
  "毛刺征": {
    label: "毛刺征",
    enName: "Spiculation",
    desc: "结节边缘向周围正常肺实质伸出放射状排列的细短线状阴影",
    clinicalMeaning: "肺腺癌高度特征性恶性征象，常由肿瘤细胞沿肺泡间隔浸润或局部成纤维收缩引起"
  },
  "胸膜牵拉征": {
    label: "胸膜牵拉/凹陷征",
    enName: "Pleural Indentation",
    desc: "结节邻近脏层胸膜，可见线状水肿或胸膜向结节方向形成帐篷样凹陷",
    clinicalMeaning: "肿瘤内部纤维收缩牵拉胸膜。需在手术和病理切片中重点排查是否突破脏层胸膜(PL1/PL2)"
  },
  "空泡征": {
    label: "空泡征 / 细支气管残腔",
    enName: "Vacuole Sign",
    desc: "结节内部出现 <5mm 的点状、小圆形透亮气体影",
    clinicalMeaning: "并非组织坏死空洞，而是肿瘤生长时保留了未被完全破坏的微小细支气管残腔，多见于早期浸润性腺癌"
  },
  "血管穿行集束征": {
    label: "血管集束 / 血管穿行",
    enName: "Vascular Convergence",
    desc: "周围肺血管受牵拉向结节聚拢汇集，或细小血管直接穿行穿过病灶",
    clinicalMeaning: "反映肿瘤对血供与微血管生成的活跃渴求，是病灶具有生物学活性的征象之一"
  },
  "磨玻璃晕征": {
    label: "磨玻璃晕征",
    enName: "Halo Sign",
    desc: "结节实性核心周围环绕一圈淡薄均匀的磨玻璃影",
    clinicalMeaning: "常代表肿瘤外围由贴壁伏壁生长方式向中心实性浸润演进的过渡带"
  },
  "支气管充气征": {
    label: "支气管充气征",
    enName: "Air Bronchogram",
    desc: "充气细支气管直接穿行于结节内部，管腔管壁可轻度僵硬或扭曲扩张",
    clinicalMeaning: "提示肿瘤细胞沿肺泡壁伏壁浸润排列而未完全压闭支气管腔"
  }
};

export default function ReportUploader({ onParsed }: ReportUploaderProps) {
  const [reportText, setReportText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [images, setImages] = useState<UploadedReportImage[]>([]);
  const [activeSignTooltip, setActiveSignTooltip] = useState<string | null>(null);
  const [newBenignInput, setNewBenignInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic staging calculation result for human-in-the-loop preview
  const [stagingPreview, setStagingPreview] = useState<any>(null);

  useEffect(() => {
    if (parsedData) {
      const tumorVal = parsedData.tumorSize !== "" && parsedData.tumorSize != null ? parseFloat(String(parsedData.tumorSize)) : 1.5;
      const solidVal = parsedData.solidSize !== "" && parsedData.solidSize != null ? parseFloat(String(parsedData.solidSize)) : 0.8;
      const calc = computeClinicalTnmStage({
        noduleType: parsedData.noduleType || "mixed_ggo",
        tumorSize: isNaN(tumorVal) ? 1.5 : tumorVal,
        solidSize: isNaN(solidVal) ? 0.8 : solidVal,
        ctr: parsedData.ctr ? parseFloat(String(parsedData.ctr)) : (tumorVal > 0 ? Math.min(1, Math.round((solidVal / tumorVal) * 100) / 100) : null),
        nStage: parsedData.nStage || "N0",
        vpi: parsedData.vpi,
        stas: parsedData.stas,
        lvi: parsedData.lvi,
        marginStatus: parsedData.marginStatus,
      });
      setStagingPreview(calc);
    }
  }, [
    parsedData?.noduleType,
    parsedData?.tumorSize,
    parsedData?.solidSize,
    parsedData?.ctr,
    parsedData?.nStage,
    parsedData?.vpi,
    parsedData?.stas,
    parsedData?.lvi,
    parsedData?.marginStatus,
  ]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Client-side image scaling to ensure smooth mobile upload & optimal Gemini OCR resolution
        const img = new Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
            const base64 = compressedDataUrl.split(',')[1];
            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substring(2, 9),
                name: file.name,
                base64: base64,
                mimeType: "image/jpeg",
                previewUrl: compressedDataUrl,
              },
            ]);
          } else {
            const [prefix, base64] = result.split(',');
            const mimeType = prefix.match(/:(.*?);/)?.[1] || "image/jpeg";
            setImages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substring(2, 9),
                name: file.name,
                base64: base64,
                mimeType: mimeType,
                previewUrl: result,
              },
            ]);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const clearAllImages = () => {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleParse = async () => {
    if (!reportText.trim() && images.length === 0) return;
    setIsParsing(true);
    setError("");

    try {
      const res = await fetch("/api/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reportText, 
          images: images.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
          imageBase64: images[0]?.base64, 
          imageMimeType: images[0]?.mimeType 
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setParsedData(data.data);
      } else {
        setError(data.error || "解析失败，请重试");
      }
    } catch (err: any) {
      setError("网络错误: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      const tumorVal = parsedData.tumorSize !== "" && parsedData.tumorSize != null ? parseFloat(String(parsedData.tumorSize)) || 1.5 : 1.5;
      const solidVal = parsedData.solidSize !== "" && parsedData.solidSize != null ? parseFloat(String(parsedData.solidSize)) || 0.8 : 0.8;
      const calculatedCtr = tumorVal > 0 ? Math.min(1, Math.round((solidVal / tumorVal) * 100) / 100) : 0;

      // Systemic M0 confirmation logic
      const isM0Confirmed = 
        parsedData.brainMri === 'negative' || 
        parsedData.abdominalUltrasound === 'negative' || 
        parsedData.abdominalUltrasound === 'benign_findings' || 
        parsedData.boneScan === 'negative' || 
        parsedData.petCt === 'negative';

      const finalData = {
        ...parsedData,
        age: parsedData.age !== "" && parsedData.age != null ? parseInt(String(parsedData.age)) || 55 : 55,
        tumorSize: stagingPreview?.tumorSize || tumorVal,
        solidSize: stagingPreview?.solidSize || solidVal,
        ctr: stagingPreview?.ctr ?? calculatedCtr,
        stage: stagingPreview?.stage || parsedData.stage || "IA1",
        tStage: stagingPreview?.tStage || parsedData.tStage || "T1a",
        noduleType: parsedData.noduleType || "mixed_ggo",
        nStage: parsedData.nStage || "N0",
        mStage: parsedData.mStage || "M0",
        stas: parsedData.stas || "negative",
        vpi: parsedData.vpi || "negative",
        lvi: parsedData.lvi || "negative",
        marginStatus: parsedData.marginStatus || "negative",
        surgeryType: parsedData.surgeryType || "segmentectomy",
        iaslcGrade: parsedData.grade || "2",
        sex: parsedData.sex || "female",
        gender: parsedData.sex || "female",
        histology: parsedData.histology || "adenocarcinoma",
        reportType: parsedData.reportType || "pathology",
        currentStage: (parsedData.reportType === 'ct_imaging' || parsedData.surgeryType === 'unknown') ? 'evaluation' : 'post_op',
        imagingFeatures: parsedData.imagingFeatures || [],
        noduleLocation: parsedData.noduleLocation || "右肺上叶尖段",
        lungRads: parsedData.lungRads || null,
        malignancyRisk: parsedData.malignancyRisk || "moderate",
        clinicalRecommendation: parsedData.clinicalRecommendation || null,

        // Systemic Staging & M0 Confirmation
        brainMri: parsedData.brainMri || "not_performed",
        abdominalUltrasound: parsedData.abdominalUltrasound || "not_performed",
        boneScan: parsedData.boneScan || "not_performed",
        neckLymphNodes: parsedData.neckLymphNodes || "not_performed",
        petCt: parsedData.petCt || "not_performed",
        benignFindings: Array.isArray(parsedData.benignFindings) ? parsedData.benignFindings : [],
        systemicStagingConfirmed: Boolean(parsedData.systemicStagingConfirmed ?? isM0Confirmed),
      };

      onParsed(finalData);
    }
  };

  const handleAddBenignFinding = () => {
    if (!newBenignInput.trim()) return;
    const current = parsedData.benignFindings || [];
    if (!current.includes(newBenignInput.trim())) {
      setParsedData({
        ...parsedData,
        benignFindings: [...current, newBenignInput.trim()],
        abdominalUltrasound: parsedData.abdominalUltrasound === "not_performed" ? "benign_findings" : parsedData.abdominalUltrasound
      });
    }
    setNewBenignInput("");
  };

  const handleRemoveBenignFinding = (item: string) => {
    const current = parsedData.benignFindings || [];
    setParsedData({
      ...parsedData,
      benignFindings: current.filter((f: string) => f !== item)
    });
  };

  if (parsedData) {
    const tumorVal = parsedData.tumorSize !== "" && parsedData.tumorSize != null ? parseFloat(String(parsedData.tumorSize)) : 1.5;
    const solidVal = parsedData.solidSize !== "" && parsedData.solidSize != null ? parseFloat(String(parsedData.solidSize)) : 0.8;
    const currentCtr = tumorVal > 0 ? Math.min(1, Math.round((solidVal / tumorVal) * 100) / 100) : 0;

    const isSystemicM0 = 
      parsedData.brainMri === 'negative' || 
      parsedData.abdominalUltrasound === 'negative' || 
      parsedData.abdominalUltrasound === 'benign_findings' || 
      parsedData.boneScan === 'negative' || 
      parsedData.petCt === 'negative';

    return (
      <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto w-full animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5">
              <span>✓ 全模态结构化提取就绪</span>
              <span className="text-slate-400">·</span>
              <span>
                {parsedData.reportType === 'ct_imaging' 
                  ? '🩻 放射科胸部 CT 报告' 
                  : parsedData.reportType === 'systemic_staging'
                  ? '🌐 全身转移排查报告 (MRI/超声/骨扫描)'
                  : parsedData.reportType === 'comprehensive'
                  ? '📑 综合多模态联合报告 (CT + 病理 + 全身排查)'
                  : '🔬 术后组织病理报告'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">请核对并确认您的医疗特征指标</h2>
            <p className="text-xs text-slate-500 mt-0.5">AI 已自动计算实性成分比例 (CTR)、校准临床分期并同步全身排查状态</p>
          </div>
          <button 
            onClick={() => setParsedData(null)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
          >
            ← 重新上传
          </button>
        </div>

        {/* AJCC 8th/9th Solid Component Intelligence Banner */}
        {stagingPreview && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-teal-300/80 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🧬</span>
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                  AJCC 8th/9th 临床分期智能校准
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-xs">
                {parsedData.reportType === 'ct_imaging' ? '影像临床拟定' : '实际病理'}：{stagingPreview.stage} 期 ({stagingPreview.tStage}{stagingPreview.nStage}{stagingPreview.mStage})
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {stagingPreview.explanation}
            </p>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Section 1: Nodule Morphology & Solid Size & Accurate CTR */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>🫁 结节形态与 CT 实性成分 (CTR 核心分期依据)</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                当前 CTR: {currentCtr}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">结节形态/类型</label>
                <select 
                  value={parsedData.noduleType || "mixed_ggo"} 
                  onChange={e => setParsedData({...parsedData, noduleType: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mixed_ggo">混合磨玻璃结节 (mGGO 部分实性)</option>
                  <option value="pure_ggo">纯磨玻璃结节 (pGGO 实性=0, CTR=0)</option>
                  <option value="pure_solid">纯实性结节 (Pure Solid, CTR=1.0)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  磨玻璃最大径 (cm)
                </label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={parsedData.tumorSize !== undefined && parsedData.tumorSize !== null ? parsedData.tumorSize : ""} 
                  onChange={e => setParsedData({...parsedData, tumorSize: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="如 1.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  CT 实性成分最大径 (cm)
                </label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  value={parsedData.solidSize !== undefined && parsedData.solidSize !== null ? parsedData.solidSize : ""} 
                  onChange={e => setParsedData({...parsedData, solidSize: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="如 0.8"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  <strong>CTR 计算公式</strong>：<strong>CT 实性成分最大径 ({solidVal}cm) ÷ 磨玻璃最大径 ({tumorVal}cm) = {currentCtr}</strong>
                </span>
              </span>
              <span className="text-teal-700 font-semibold">
                {currentCtr <= 0.5 ? "✓ CTR ≤ 0.5 (惰性浸润，5年无复发率高达99.7%)" : "⚠️ CTR > 0.5 (浸润成分较高，需重点评估切缘)"}
              </span>
            </div>
          </div>

          {/* Section 2: CT Malignant Imaging Signs with Plain-Language Definitions */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🩻 CT 影像恶性征象（点击切换 & 悬浮/点击查看通俗释义）</span>
              </div>
              {parsedData.lungRads && (
                <span className="px-2 py-0.5 bg-sky-200/80 text-sky-900 rounded-md font-extrabold text-[11px]">
                  Lung-RADS: {parsedData.lungRads}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">结节解剖部位</label>
                <input 
                  type="text" 
                  value={parsedData.noduleLocation || ""} 
                  onChange={e => setParsedData({...parsedData, noduleLocation: e.target.value})}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="如：右肺上叶尖后段"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lung-RADS 影像分级</label>
                <select 
                  value={parsedData.lungRads || "4A"} 
                  onChange={e => setParsedData({...parsedData, lungRads: e.target.value})}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="3">3 类 (良性可能)</option>
                  <option value="4A">4A 类 (低度可疑恶性)</option>
                  <option value="4B">4B 类 (中度可疑恶性)</option>
                  <option value="4X">4X 类 (高度可疑恶性)</option>
                </select>
              </div>
            </div>

            {/* Interactive Sign Pills */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700">已识别的危险征象（点击增删，点击右侧查看白话医学解释）：</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CT_SIGN_DEFINITIONS).map(sign => {
                  const isSelected = (parsedData.imagingFeatures || []).includes(sign);
                  return (
                    <button
                      key={sign}
                      type="button"
                      onClick={() => {
                        const current = parsedData.imagingFeatures || [];
                        if (isSelected) {
                          setParsedData({...parsedData, imagingFeatures: current.filter((f: string) => f !== sign)});
                        } else {
                          setParsedData({...parsedData, imagingFeatures: [...current, sign]});
                        }
                        setActiveSignTooltip(activeSignTooltip === sign ? null : sign);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected 
                          ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-2xs' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{sign}</span>
                      <span className="text-[10px] text-slate-400">ℹ️</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Sign Definition Callout */}
              {activeSignTooltip && CT_SIGN_DEFINITIONS[activeSignTooltip] && (
                <div className="p-3 bg-white rounded-xl border border-sky-200 text-xs shadow-2xs space-y-1 animate-fade-in">
                  <div className="font-bold text-sky-950 flex items-center justify-between">
                    <span>📖 {CT_SIGN_DEFINITIONS[activeSignTooltip].label} ({CT_SIGN_DEFINITIONS[activeSignTooltip].enName})</span>
                    <button 
                      type="button"
                      onClick={() => setActiveSignTooltip(null)} 
                      className="text-slate-400 hover:text-slate-600 text-[11px]"
                    >
                      关闭 ✕
                    </button>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {CT_SIGN_DEFINITIONS[activeSignTooltip].desc}
                  </p>
                  <p className="text-amber-800 font-medium">
                    💡 临床意义：{CT_SIGN_DEFINITIONS[activeSignTooltip].clinicalMeaning}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: NEW! Systemic Staging & M0 Confirmation Matrix */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-teal-50/70 border-2 border-indigo-200/80 space-y-4 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌐</span>
                <div>
                  <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    全身转移排查与 M0 早期根治窗口确认矩阵
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    排查中枢神经、肝脏、肾上腺与骨质，确立无远处转移 (M0) 黄金手术窗口
                  </p>
                </div>
              </div>

              {isSystemicM0 && (
                <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-2xs flex items-center gap-1">
                  <span>🏆 全身排查阴性 · 确立 M0 根治窗口</span>
                </span>
              )}
            </div>

            {/* Organ Check Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              
              {/* Brain MRI */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🧠 脑部增强 MRI</span>
                  <span className="text-[10px] text-slate-400">排除中枢脑转移</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { val: "negative", label: "未见异常(M0)" },
                    { val: "positive", label: "见异常(M1)" },
                    { val: "not_performed", label: "尚未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, brainMri: opt.val })}
                      className={`flex-1 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                        (parsedData.brainMri || "not_performed") === opt.val
                          ? opt.val === "negative"
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : opt.val === "positive"
                            ? "bg-rose-500 text-white shadow-2xs"
                            : "bg-slate-700 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Abdominal Ultrasound / CT */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🩺 腹部/肾上腺超声</span>
                  <span className="text-[10px] text-slate-400">排除肝/肾上腺</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { val: "negative", label: "未见异常" },
                    { val: "benign_findings", label: "良性囊肿" },
                    { val: "positive", label: "提示可疑" },
                    { val: "not_performed", label: "尚未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, abdominalUltrasound: opt.val })}
                      className={`flex-1 py-1 text-[10px] rounded-lg font-bold transition-all cursor-pointer ${
                        (parsedData.abdominalUltrasound || "not_performed") === opt.val
                          ? opt.val === "negative"
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : opt.val === "benign_findings"
                            ? "bg-teal-600 text-white shadow-2xs"
                            : opt.val === "positive"
                            ? "bg-rose-500 text-white shadow-2xs"
                            : "bg-slate-700 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bone Scan ECT */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🦴 全身骨显像 ECT</span>
                  <span className="text-[10px] text-slate-400">排除骨质破坏</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { val: "negative", label: "未见骨破坏(M0)" },
                    { val: "positive", label: "异常代谢" },
                    { val: "not_performed", label: "尚未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, boneScan: opt.val })}
                      className={`flex-1 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                        (parsedData.boneScan || "not_performed") === opt.val
                          ? opt.val === "negative"
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : opt.val === "positive"
                            ? "bg-rose-500 text-white shadow-2xs"
                            : "bg-slate-700 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neck / Supraclavicular Lymph Nodes */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🩺 锁骨上淋巴结B超</span>
                  <span className="text-[10px] text-slate-400">排除 N3 远处淋巴</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { val: "negative", label: "未见肿大(N0)" },
                    { val: "positive", label: "见肿大(N3)" },
                    { val: "not_performed", label: "尚未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, neckLymphNodes: opt.val })}
                      className={`flex-1 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                        (parsedData.neckLymphNodes || "not_performed") === opt.val
                          ? opt.val === "negative"
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : opt.val === "positive"
                            ? "bg-rose-500 text-white shadow-2xs"
                            : "bg-slate-700 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Whole Body PET-CT */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🌟 全身 PET-CT</span>
                  <span className="text-[10px] text-slate-400">全身代谢一站式</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { val: "negative", label: "无远处浓聚(M0)" },
                    { val: "positive", label: "远处高代谢" },
                    { val: "not_performed", label: "尚未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, petCt: opt.val })}
                      className={`flex-1 py-1 text-[11px] rounded-lg font-bold transition-all cursor-pointer ${
                        (parsedData.petCt || "not_performed") === opt.val
                          ? opt.val === "negative"
                            ? "bg-emerald-500 text-white shadow-2xs"
                            : opt.val === "positive"
                            ? "bg-rose-500 text-white shadow-2xs"
                            : "bg-slate-700 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Benign Findings List & Management */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">🛡️ 伴发良性发现（非转移）</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">消除虚惊</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(parsedData.benignFindings || ["肝囊肿", "肺内良性钙化点"]).map((item: string) => (
                    <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                      <span>✓ {item}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveBenignFinding(item)}
                        className="text-emerald-400 hover:text-emerald-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <input 
                    type="text" 
                    value={newBenignInput}
                    onChange={e => setNewBenignInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddBenignFinding()}
                    placeholder="如：胆囊息肉、肾囊肿"
                    className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] outline-none focus:bg-white focus:border-blue-400"
                  />
                  <button 
                    type="button"
                    onClick={handleAddBenignFinding}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    +添加
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 4: Pathology High-Risk Red/Green Factors (When Pathology or Comprehensive) */}
          {(parsedData.reportType === 'pathology' || parsedData.reportType === 'comprehensive' || parsedData.surgeryType !== 'unknown') && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>🚦 术后高危病理特征 (红绿灯指标)</span>
                <span className="text-[11px] font-normal text-slate-400">决定辅助治疗与复发风险分层</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Margin Status */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">切缘状态 (Margin)</div>
                    <div className="text-[10px] text-slate-400 leading-tight">手术切缘病理残留情况</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, marginStatus: "negative", margin: "negative" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.marginStatus !== "positive" && parsedData.margin !== "positive"
                          ? "bg-emerald-500 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (R0安全)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, marginStatus: "positive", margin: "positive" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.marginStatus === "positive" || parsedData.margin === "positive"
                          ? "bg-rose-500 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (残留)
                    </button>
                  </div>
                </div>

                {/* 2. Lymph Node N-Stage */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">淋巴结转移 (N分期)</div>
                    <div className="text-[10px] text-slate-400 leading-tight">纵隔与肺门淋巴结状态</div>
                  </div>
                  <div className="flex gap-1">
                    {(["N0", "N1", "N2"] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setParsedData({ ...parsedData, nStage: n, lymphNodes: n })}
                        className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                          (parsedData.nStage || "N0") === n
                            ? n === "N0"
                              ? "bg-emerald-500 text-white shadow-2xs"
                              : n === "N1"
                              ? "bg-amber-500 text-white shadow-2xs"
                              : "bg-rose-500 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {n === "N0" ? "N0(无)" : n === "N1" ? "N1(肺门)" : "N2(纵隔)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. VPI */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">胸膜侵犯 (VPI)</div>
                    <div className="text-[10px] text-slate-400 leading-tight">突破脏层胸膜(PL1/PL2)</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, vpi: "negative" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.vpi !== "positive" ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (PL0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, vpi: "positive" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.vpi === "positive" ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (PL1/2)
                    </button>
                  </div>
                </div>

                {/* 4. STAS */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">气道播散 (STAS)</div>
                    <div className="text-[10px] text-slate-400 leading-tight">肿瘤微小巢气腔漂移</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, stas: "negative" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.stas !== "positive" ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (未见)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, stas: "positive" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.stas === "positive" ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (见播散)
                    </button>
                  </div>
                </div>

                {/* 5. LVI */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">脉管癌栓 (LVI)</div>
                    <div className="text-[10px] text-slate-400 leading-tight">微血管/淋巴管内癌栓</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, lvi: "negative" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.lvi !== "positive" ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (无栓)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, lvi: "positive" })}
                      className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                        parsedData.lvi === "positive" ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (有栓)
                    </button>
                  </div>
                </div>

                {/* 6. IASLC Histological Grade */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <div className="text-xs font-bold text-slate-800">IASLC 病理分级</div>
                    <div className="text-[10px] text-slate-400 leading-tight">微乳头/实体高级别成分占比</div>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { val: "1", label: "Grade 1(高分化)" },
                      { val: "2", label: "Grade 2(中分化)" },
                      { val: "3", label: "Grade 3(高级别)" }
                    ].map(({ val, label }) => {
                      const currentGrade = String(parsedData.iaslcGrade || parsedData.grade || "2");
                      const isSelected = currentGrade === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setParsedData({ ...parsedData, grade: val, iaslcGrade: val })}
                          className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                            isSelected
                              ? val === "1"
                                ? "bg-emerald-500 text-white shadow-2xs"
                                : val === "2"
                                ? "bg-blue-500 text-white shadow-2xs"
                                : "bg-rose-500 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Patient Demographics & Surgery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">患者年龄</label>
              <input 
                type="number" 
                value={parsedData.age || ""} 
                onChange={e => setParsedData({...parsedData, age: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
                placeholder="55"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">生物学性别</label>
              <select 
                value={parsedData.sex || "female"} 
                onChange={e => setParsedData({...parsedData, sex: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
              >
                <option value="female">女性</option>
                <option value="male">男性</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">手术术式</label>
              {parsedData.reportType === 'ct_imaging' && parsedData.surgeryType === 'unknown' ? (
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                  尚未手术 (待随访/微创评估)
                </div>
              ) : (
                <select 
                  value={parsedData.surgeryType || "segmentectomy"} 
                  onChange={e => setParsedData({...parsedData, surgeryType: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
                >
                  <option value="segmentectomy">解剖性肺段切除</option>
                  <option value="lobectomy">标准肺叶切除</option>
                  <option value="wedge">肺楔形切除</option>
                  <option value="unknown">尚未手术 / 随访期</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-slate-100">
          <button 
            onClick={() => setParsedData(null)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            返回
          </button>
          <button 
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            确认无误，保存医疗档案
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100 flex-shrink-0">
          🤖
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI 报告智能提取与全景多模态解析</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">支持同时勾选多张照片（CT 影像 + 术后病理 + 脑核磁 + 腹部超声 + 骨扫描），AI 自动跨模态融合提取</p>
        </div>
      </div>

      {/* Supported Modality Chips Banner */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 mb-5 space-y-2">
        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>📋 现已全面支持以下 6 大类报告联合解析：</span>
          <span className="text-[11px] text-teal-700 font-semibold">支持一次多选上传</span>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">🩻 胸部薄层 CT</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">🔬 术后组织病理与 IHC</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">🧠 脑部增强 MRI</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">🩺 腹部与浅表超声</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">🦴 全身骨显像 ECT</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">🌟 全身 PET-CT / NGS 基因</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Multi-Image Upload & Preview Area */}
        <div className="space-y-3">
          {images.length > 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>📑 已添加 {images.length} 张医疗报告</span>
                  <span className="text-[11px] text-slate-400 font-normal">（如 CT 报告 + 术后病理 + 脑核磁）</span>
                </span>
                <button
                  onClick={clearAllImages}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  清空全部
                </button>
              </div>

              {/* Thumbnails Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white aspect-[4/3] shadow-xs">
                    <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/75 text-white text-[10px] font-bold backdrop-blur-xs">
                      报告 #{idx + 1}
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                      title="移除此图片"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                <div className="relative rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center aspect-[4/3] cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/heic,image/heif,image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isParsing}
                  />
                  <span className="text-xl text-blue-600 mb-1">+</span>
                  <span className="text-xs font-bold text-slate-600">添加更多图片</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">CT / 病理 / 脑核磁</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/20 transition-all relative cursor-pointer">
              <input 
                type="file" 
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg,image/heic,image/heif,image/*" 
                onChange={handleImageUpload} 
                ref={fileInputRef}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isParsing}
              />
              <div className="text-center py-3 pointer-events-none">
                <div className="text-3xl mb-2">📷</div>
                <div className="text-sm font-bold text-slate-700">点击从相册多选或拍照上传（支持多张报告）</div>
                <div className="text-xs text-slate-400 mt-1">可同时选择【胸部 CT】+【术后病理】+【脑核磁/B超】，AI 将自动跨模态联合解析</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400 font-medium">或者粘贴报告文字内容</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div>
          <textarea
            rows={5}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="在此粘贴影像报告（CT/MRI/超声）或术后病理报告诊断结论...&#10;（系统已启用 PIPL 金融级隐私脱敏，姓名与身份证号将自动掩码）"
            className="w-full p-4 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono"
            disabled={isParsing}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={isParsing || (!reportText.trim() && images.length === 0)}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isParsing || (!reportText.trim() && images.length === 0)
              ? "bg-slate-300 cursor-not-allowed text-slate-500 shadow-none"
              : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-[0.99]"
          }`}
        >
          {isParsing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>正在多模态跨报告解析与 CTR 实性成分校准...</span>
            </>
          ) : (
            <>
              <span>✨ 开始 AI 跨模态智能提取</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
