"use client";

import React, { useState, useRef, useEffect } from "react";
import type { PatientProfile } from "@/lib/types";
import { computeClinicalTnmStage } from "@/lib/staging";

interface ReportUploaderProps {
  onParsed: (data: any) => void;
}

export default function ReportUploader({ onParsed }: ReportUploaderProps) {
  const [reportText, setReportText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("");
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
        ctr: parsedData.ctr ? parseFloat(String(parsedData.ctr)) : null,
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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const [prefix, base64] = result.split(',');
        const mimeType = prefix.match(/:(.*?);/)?.[1] || "image/jpeg";
        setImageBase64(base64);
        setImageMimeType(mimeType);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageBase64("");
    setImageMimeType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleParse = async () => {
    if (!reportText.trim() && !imageBase64) return;
    setIsParsing(true);
    setError("");

    try {
      const res = await fetch("/api/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText, imageBase64, imageMimeType }),
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
      const finalData = {
        ...parsedData,
        age: parsedData.age !== "" && parsedData.age != null ? parseInt(String(parsedData.age)) || 55 : 55,
        tumorSize: stagingPreview?.tumorSize || (parsedData.tumorSize !== "" && parsedData.tumorSize != null ? parseFloat(String(parsedData.tumorSize)) || 1.5 : 1.5),
        solidSize: stagingPreview?.solidSize || (parsedData.solidSize !== "" && parsedData.solidSize != null ? parseFloat(String(parsedData.solidSize)) || 0.8 : 0.8),
        ctr: stagingPreview?.ctr || parsedData.ctr || 0.53,
        stage: stagingPreview?.stage || parsedData.stage || "IA1",
        tStage: stagingPreview?.tStage || parsedData.tStage || "T1a",
        noduleType: parsedData.noduleType || "mixed_ggo",
      };
      onParsed(finalData);
    }
  };

  if (parsedData) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-3xl mx-auto w-full">
        
        {/* Verification Header */}
        <div className="flex items-start gap-3.5 mb-6 pb-5 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center text-2xl flex-shrink-0 border border-teal-200">
            🛡️
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              病理特征核对 (Human-in-the-loop)
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
              AI 已为您自动提取关键指标。请确认病理与结节实性成分特征，确保后续循证推演绝对精准。
            </p>
          </div>
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
                实际分期：{stagingPreview.stage} 期 ({stagingPreview.tStage}{stagingPreview.nStage}{stagingPreview.mStage})
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {stagingPreview.explanation}
            </p>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Section 1: Nodule Morphology & Solid Size (Core Feature) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🫁 结节类型与 CT 实性成分 (核心分期依据)</span>
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
                  <option value="pure_ggo">纯磨玻璃结节 (pGGO 实性=0)</option>
                  <option value="pure_solid">纯实性结节 (Pure Solid)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  肿瘤总径 (cm)
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
                  CT 实性/浸润大小 (cm)
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

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span>💡</span>
              <span>
                <strong>医学小知识</strong>：混合磨玻璃结节依据 CT <strong>实性成分大小 (≤1cm 为 T1a/IA1期)</strong> 定期，而非根据包含毛玻璃的总大小定 T1b。
              </span>
            </div>
          </div>

          {/* Section 2: Pathological High-Risk Factors (Red / Green) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🔬 关键病理红绿灯因子</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">气道播散 (STAS)</label>
                <select 
                  value={parsedData.stas || "negative"} 
                  onChange={e => setParsedData({...parsedData, stas: e.target.value})}
                  className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-bold border ${
                    parsedData.stas === 'positive' 
                      ? 'bg-rose-50 text-rose-800 border-rose-300' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <option value="negative">🟢 无 / 阴性</option>
                  <option value="positive">🔴 有 / 阳性 (高危)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">脉管癌栓 (LVI)</label>
                <select 
                  value={parsedData.lvi || "negative"} 
                  onChange={e => setParsedData({...parsedData, lvi: e.target.value})}
                  className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-bold border ${
                    parsedData.lvi === 'positive' 
                      ? 'bg-rose-50 text-rose-800 border-rose-300' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <option value="negative">🟢 无 / 阴性</option>
                  <option value="positive">🔴 有 / 阳性 (高危)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">胸膜侵犯 (VPI)</label>
                <select 
                  value={parsedData.vpi || "negative"} 
                  onChange={e => setParsedData({...parsedData, vpi: e.target.value})}
                  className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-bold border ${
                    parsedData.vpi === 'positive' 
                      ? 'bg-amber-50 text-amber-800 border-amber-300' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <option value="negative">🟢 无 / 阴性</option>
                  <option value="positive">🟡 有 / 阳性 (升至T2a)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">切缘状态</label>
                <select 
                  value={parsedData.marginStatus || "negative"} 
                  onChange={e => setParsedData({...parsedData, marginStatus: e.target.value, margin: e.target.value})}
                  className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-bold border ${
                    parsedData.marginStatus === 'positive' 
                      ? 'bg-rose-50 text-rose-800 border-rose-300' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <option value="negative">🟢 阴性 (R0 根治)</option>
                  <option value="positive">🔴 阳性 (残留)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Demographic & Surgery Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">患者年龄</label>
              <input 
                type="text" 
                inputMode="numeric"
                value={parsedData.age !== undefined && parsedData.age !== null ? parsedData.age : ""} 
                onChange={e => setParsedData({...parsedData, age: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如 55"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">患者性别</label>
              <select 
                value={parsedData.sex || parsedData.gender || "male"} 
                onChange={e => setParsedData({...parsedData, sex: e.target.value, gender: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
              >
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">淋巴结分期 (N)</label>
              <select 
                value={parsedData.nStage || "N0"} 
                onChange={e => setParsedData({...parsedData, nStage: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
              >
                <option value="N0">N0 (无淋巴结转移)</option>
                <option value="N1">N1 (肺门淋巴结受累)</option>
                <option value="N2">N2 (纵隔淋巴结转移)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">手术切除方式</label>
              <select 
                value={parsedData.surgeryType || "segmentectomy"} 
                onChange={e => setParsedData({...parsedData, surgeryType: e.target.value})}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium"
              >
                <option value="segmentectomy">解剖性肺段切除</option>
                <option value="lobectomy">标准肺叶切除</option>
                <option value="wedge">肺楔形切除</option>
              </select>
            </div>
          </div>

        </div>

        <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-slate-100">
          <button 
            onClick={() => setParsedData(null)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            ← 重新上传
          </button>
          <button 
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            确认无误，保存医疗档案 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100 flex-shrink-0">
          🤖
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI 报告智能提取与实性成分校准</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">粘贴您的病理/影像报告文本，或直接拍照上传纸质报告，AI 自动提取并计算实性浸润分期</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Image Upload Area */}
        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50/20 transition-all relative cursor-pointer">
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleImageUpload} 
            ref={fileInputRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isParsing}
          />
          {imageBase64 ? (
            <div className="relative w-full flex flex-col items-center">
              <img src={`data:${imageMimeType};base64,${imageBase64}`} alt="Uploaded Report" className="max-h-48 rounded-xl shadow-md object-contain" />
              <button 
                onClick={(e) => { e.preventDefault(); clearImage(); }} 
                className="mt-3 px-3 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full hover:bg-rose-200 z-10 relative cursor-pointer shadow-xs"
              >
                移除图片
              </button>
            </div>
          ) : (
            <div className="text-center py-5 pointer-events-none">
              <div className="text-3xl mb-2">📷</div>
              <div className="text-sm font-bold text-slate-700">点击拍照或上传病理/影像报告图片</div>
              <div className="text-xs text-slate-400 mt-1">支持 JPG, PNG, WebP 格式</div>
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
          placeholder="例如：右肺下叶切除标本：浸润性腺癌（腺泡型 80%，贴壁型 20%）。肿瘤最大径 1.5cm，CT 实性成分 0.8cm。切缘未见癌，未见脉管侵犯及气道播散(STAS)..."
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
            disabled={(!reportText.trim() && !imageBase64) || isParsing}
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
