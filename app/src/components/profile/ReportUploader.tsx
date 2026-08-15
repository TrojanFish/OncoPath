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

export default function ReportUploader({ onParsed }: ReportUploaderProps) {
  const [reportText, setReportText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [images, setImages] = useState<UploadedReportImage[]>([]);
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
        stas: parsedData.stas || "negative",
        vpi: parsedData.vpi || "negative",
        lvi: parsedData.lvi || "negative",
        marginStatus: parsedData.marginStatus || "negative",
        surgeryType: parsedData.surgeryType || "segmentectomy",
        iaslcGrade: parsedData.grade || "2",
        sex: parsedData.sex || "female",
        histology: parsedData.histology || "adenocarcinoma",
        reportType: parsedData.reportType || "pathology",
        currentStage: (parsedData.reportType === 'ct_imaging' || parsedData.surgeryType === 'unknown') ? 'evaluation' : 'post_op',
        imagingFeatures: parsedData.imagingFeatures || [],
        noduleLocation: parsedData.noduleLocation || "右肺上叶尖段",
        lungRads: parsedData.lungRads || null,
        malignancyRisk: parsedData.malignancyRisk || "moderate",
        clinicalRecommendation: parsedData.clinicalRecommendation || null,
      };

      onParsed(finalData);
    }
  };

  if (parsedData) {
    const tumorVal = parsedData.tumorSize !== "" && parsedData.tumorSize != null ? parseFloat(String(parsedData.tumorSize)) : 1.5;
    const solidVal = parsedData.solidSize !== "" && parsedData.solidSize != null ? parseFloat(String(parsedData.solidSize)) : 0.8;
    const currentCtr = tumorVal > 0 ? Math.min(1, Math.round((solidVal / tumorVal) * 100) / 100) : 0;

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto w-full animate-fade-in">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1.5">
              <span>✓ 结构化提取就绪</span>
              <span className="text-slate-400">·</span>
              <span>
                {parsedData.reportType === 'ct_imaging' 
                  ? '🩻 放射科胸部 CT 报告' 
                  : parsedData.reportType === 'comprehensive'
                  ? '📑 CT 影像 + 术后病理 联合报告'
                  : '🔬 术后组织病理报告'}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">请核对并确认您的医疗特征指标</h2>
            <p className="text-xs text-slate-500 mt-0.5">AI 已自动计算实性成分比例 (CTR) 并校准分期，您可以按实际报告进行微调</p>
          </div>
          <button 
            onClick={() => setParsedData(null)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto cursor-pointer"
          >
            ← 重新上传
          </button>
        </div>

        {/* CT Features Highlight if CT imaging */}
        {(parsedData.reportType === 'ct_imaging' || parsedData.reportType === 'comprehensive') && (
          <div className="mb-6 p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-sky-900 flex items-center gap-2">
                <span>🩻 放射科 CT 影像关键发现</span>
                {parsedData.lungRads && (
                  <span className="px-2 py-0.5 bg-sky-200/80 text-sky-900 rounded-md font-extrabold text-[11px]">
                    Lung-RADS: {parsedData.lungRads}
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                parsedData.malignancyRisk === 'high' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                parsedData.malignancyRisk === 'low' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                恶性风险：{parsedData.malignancyRisk === 'high' ? '高度可疑' : parsedData.malignancyRisk === 'low' ? '低度风险' : '中度可疑'}
              </span>
            </div>

            {parsedData.imagingFeatures && parsedData.imagingFeatures.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-sky-800 mb-1.5">已识别恶性征象：</div>
                <div className="flex flex-wrap gap-1.5">
                  {parsedData.imagingFeatures.map((feat: string, idx: number) => (
                    <span key={idx} className="bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium shadow-2xs flex items-center gap-1">
                      <span className="text-amber-500 text-xs">⚠️</span>
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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

          {/* Section 2: CT Specific Features (If CT) OR Pathology Red/Green Matrix (If Pathology) */}
          {parsedData.reportType === 'ct_imaging' ? (
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200">
              <div className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>🩻 CT 影像恶性特征与解剖部位</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">结节所在部位</label>
                  <input 
                    type="text" 
                    value={parsedData.noduleLocation || ""} 
                    onChange={e => setParsedData({...parsedData, noduleLocation: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lung-RADS 影像分级</label>
                  <select 
                    value={parsedData.lungRads || "4A"} 
                    onChange={e => setParsedData({...parsedData, lungRads: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="3">3 类 (良性可能)</option>
                    <option value="4A">4A 类 (低度可疑)</option>
                    <option value="4B">4B 类 (中度可疑)</option>
                    <option value="4X">4X 类 (高度可疑)</option>
                  </select>
                </div>
              </div>

              {/* Toggleable CT Imaging Signs */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-2">已发现的 CT 恶性征象（点击切换）</label>
                <div className="flex flex-wrap gap-2">
                  {["分叶征", "毛刺征", "胸膜牵拉征", "血管穿行集束征", "空泡征", "磨玻璃晕征", "支气管充气征"].map(sign => {
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
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs font-bold' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{sign}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Pathology High-Risk Red/Green Factors */
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                🚦 术后高危病理特征 (红绿灯指标)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "stas", label: "气道播散 (STAS)", desc: "标本边缘游离癌细胞" },
                  { key: "vpi", label: "胸膜侵犯 (VPI)", desc: "突破肺脏层胸膜(PL1/2)" },
                  { key: "lvi", label: "脉管瘤栓 (LVI)", desc: "微血管或淋巴管内癌栓" },
                  { key: "marginStatus", label: "切缘状态 (Margin)", desc: "手术边缘切缘干净度" }
                ].map(({ key, label, desc }) => {
                  const isPos = parsedData[key] === "positive";
                  return (
                    <div key={key} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{label}</div>
                        <div className="text-[10px] text-slate-400 leading-tight">{desc}</div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setParsedData({ ...parsedData, [key]: "negative" })}
                          className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                            !isPos ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          阴性 (-)
                        </button>
                        <button
                          type="button"
                          onClick={() => setParsedData({ ...parsedData, [key]: "positive" })}
                          className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                            isPos ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          阳性 (+)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Patient Demographics & Surgery */}
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
              {parsedData.reportType === 'ct_imaging' ? (
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
                  <option value="unknown">尚未手术 / 不确定</option>
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
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100 flex-shrink-0">
          🤖
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI 报告智能提取与实性成分校准</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">支持同时上传多张图片（如 CT 报告 + 病理报告 + 基因检测），AI 交叉融合提取关键指标</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Multi-Image Upload & Preview Area */}
        <div className="space-y-3">
          {images.length > 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>📑 已添加 {images.length} 张医疗报告</span>
                  <span className="text-[11px] text-slate-400 font-normal">（如 CT 影像报告 + 术后病理报告）</span>
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
                  <span className="text-[10px] text-slate-400 mt-0.5">CT / 病理 / 基因</span>
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
                <div className="text-xs text-slate-400 mt-1">可同时选择【胸部 CT 报告】与【术后病理报告】，AI 将自动联合交叉解析</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">或者粘贴报告文本</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="例如：【CT影像】右肺上叶见磨玻璃结节，磨玻璃最大径 1.5cm，CT 实性成分 0.8cm (CTR 0.53)... &#10;【术后病理】浸润性腺癌（腺泡型 80%，贴壁型 20%），切缘未见癌，未见脉管侵犯及气道播散(STAS)..."
          className="w-full h-36 p-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none text-xs sm:text-sm leading-relaxed outline-none transition-all"
          disabled={isParsing}
        />
        
        {error && (
          <div className="text-xs sm:text-sm text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
            ⚠️ {error}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 leading-tight">
            🛡️ 自动依据 AJCC 8th/9th 实性成分规则校准分期，数据全链路匿名保护。
          </div>
          <button
            onClick={handleParse}
            disabled={(!reportText.trim() && images.length === 0) || isParsing}
            className={`w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer ${isParsing ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isParsing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在解析与校准分期...
              </span>
            ) : (
              "一键智能解析"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
