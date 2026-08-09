"use client";

import React, { useState } from "react";
import type { PatientProfile } from "@/lib/types";

interface ReportUploaderProps {
  onParsed: (data: any) => void;
}

export default function ReportUploader({ onParsed }: ReportUploaderProps) {
  const [reportText, setReportText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(null);

  const handleParse = async () => {
    if (!reportText.trim()) return;
    setIsParsing(true);
    setError("");

    try {
      const res = await fetch("/api/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText }),
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
      onParsed(parsedData);
    }
  };

  if (parsedData) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl">
            🛡️
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">人工校验 (Human-in-the-loop)</h2>
            <p className="text-text-secondary text-sm">AI 已完成提取，请人工确认核心医学特征是否有误。这是保护您医疗安全的最后一道防线。</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">患者年龄</label>
            <input 
              type="number" 
              value={parsedData.age || ""} 
              onChange={e => setParsedData({...parsedData, age: parseInt(e.target.value) || 55})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">患者性别</label>
            <select 
              value={parsedData.sex || "unknown"} 
              onChange={e => setParsedData({...parsedData, sex: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="male">男性</option>
              <option value="female">女性</option>
              <option value="unknown">未知</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">T分期 (肿瘤大小)</label>
            <select 
              value={parsedData.tStage || ""} 
              onChange={e => setParsedData({...parsedData, tStage: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">未提及</option>
              <option value="T1a">T1a</option>
              <option value="T1b">T1b</option>
              <option value="T1c">T1c</option>
              <option value="T2a">T2a</option>
              <option value="T2b">T2b</option>
              <option value="T3">T3</option>
              <option value="T4">T4</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">N分期 (淋巴结)</label>
            <select 
              value={parsedData.nStage || ""} 
              onChange={e => setParsedData({...parsedData, nStage: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">未提及</option>
              <option value="N0">N0 (无转移)</option>
              <option value="N1">N1 (肺门淋巴结转移)</option>
              <option value="N2">N2 (纵隔淋巴结转移)</option>
              <option value="N3">N3 (对侧或锁骨上)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">STAS (气道播散)</label>
            <select 
              value={parsedData.stas || "negative"} 
              onChange={e => setParsedData({...parsedData, stas: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="negative">无 / 阴性</option>
              <option value="positive">有 / 阳性</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">LVI (脉管内癌栓)</label>
            <select 
              value={parsedData.lvi || "negative"} 
              onChange={e => setParsedData({...parsedData, lvi: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="negative">无 / 阴性</option>
              <option value="positive">有 / 阳性</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">VPI (胸膜侵犯)</label>
            <select 
              value={parsedData.vpi || "negative"} 
              onChange={e => setParsedData({...parsedData, vpi: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="negative">无 / 阴性</option>
              <option value="positive">有 / 阳性</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">切缘状态</label>
            <select 
              value={parsedData.marginStatus || "negative"} 
              onChange={e => setParsedData({...parsedData, marginStatus: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="negative">阴性 (R0 切除)</option>
              <option value="positive">阳性 (R1/R2)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1">手术方式</label>
            <select 
              value={parsedData.surgeryType || ""} 
              onChange={e => setParsedData({...parsedData, surgeryType: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">未提及</option>
              <option value="lobectomy">肺叶切除</option>
              <option value="segmentectomy">肺段切除</option>
              <option value="wedge">楔形切除</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button 
            onClick={() => setParsedData(null)}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            重新提取
          </button>
          <button 
            onClick={handleConfirm}
            className="btn-primary px-6 py-2 rounded-lg text-sm font-semibold"
          >
            无误，生成医疗档案
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">
          🤖
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">AI 报告智能解析</h2>
          <p className="text-text-secondary text-sm">粘贴您的病理或影像报告，AI 将自动提取核心医学特征并建立档案</p>
        </div>
      </div>

      <div className="mt-6">
        <textarea
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          placeholder="例如：右肺下叶切除标本：浸润性腺癌（腺泡型 80%，贴壁型 20%）。肿瘤最大径 1.5cm。可见气道播散 (STAS阳性)。支气管切缘阴性。淋巴结未见转移 (0/12)..."
          className="input-artifact w-full h-48 p-4 rounded-xl resize-none text-sm leading-relaxed"
          disabled={isParsing}
        />
        
        {error && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-text-muted max-w-xs">
            * 本系统仅进行医学实体抽取，不提供诊断结论。您的数据不会被保留或用于训练。
          </div>
          <button
            onClick={handleParse}
            disabled={!reportText.trim() || isParsing}
            className={`btn-primary px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${isParsing ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isParsing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在结构化提取...
              </span>
            ) : (
              "一键解析"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
