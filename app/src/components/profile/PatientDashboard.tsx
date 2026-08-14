"use client";

import React, { useState, useEffect } from "react";
import JourneyMap from "./JourneyMap";
import ReportUploader from "./ReportUploader";
import SimilarCasesCard from "./SimilarCasesCard";
import ConsentModal from "@/components/ConsentModal";
import type { PatientProfile } from "@/lib/types";
import { getGuestId } from "@/lib/guest";

export default function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    // Try to load existing profile from DB
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile?userId=' + getGuestId());
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setShowUploader(true); // If no profile, show uploader
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setShowUploader(true);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleParsed = async (parsedData: any) => {
    // Save to DB
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsedData, userId: getGuestId() })
      });
      const dbData = await res.json();
      if (dbData.success) {
        setProfile(dbData.profile);
        setShowUploader(false);
      }
    } catch (err) {
      console.error("Failed to save parsed profile", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-accent-blue rounded-full animate-spin"></div>
          <p className="mt-4 text-text-secondary font-medium">正在加载癌症档案...</p>
        </div>
      </div>
    );
  }

  if (showUploader || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <ConsentModal />
        <div className="text-center mb-10">
          <h1 className="display-sm text-text-primary">建立个人医学档案</h1>
          <p className="text-text-secondary mt-2">将您的病理报告交给 AI，自动建立结构化循证模型</p>
        </div>
        <ReportUploader onParsed={handleParsed} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
      <ConsentModal />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="display-sm text-text-primary">患者医疗档案 (Patient Profile)</h1>
          <p className="text-text-secondary mt-1">
            动态决策状态机 · 基于您的真实病理与影像特征
          </p>
        </div>
        <button 
          onClick={() => setShowUploader(true)}
          className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
        >
          更新档案
        </button>
      </div>

      <JourneyMap 
        currentStage={profile.currentStage} 
        psychologicalState={profile.psychologicalState} 
      />

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Core Identity Card */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">当前诊断画像</h3>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-text-primary border border-gray-300">
              <span className="text-xs text-text-muted">年龄</span>
              <span className="font-bold">{profile.age}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">早期原发性肺腺癌</h2>
                <span className="px-2 py-1 rounded bg-blue-50 text-accent-blue border border-blue-200 text-xs font-bold">
                  {profile.stage} 期
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                手术方式: {profile.surgeryType === 'segmentectomy' ? '肺段切除术' : profile.surgeryType} · 
                病理分级: 中分化 (IASLC Grade {profile.iaslcGrade})
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-medium text-text-primary mb-3">红绿灯风险矩阵</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <RiskBadge label="淋巴结转移" status={profile.nStage === 'N0' ? 'good' : 'warning'} text={profile.nStage || "未测"} />
              <RiskBadge label="脉管侵犯 (LVI)" status={profile.lvi === 'negative' ? 'good' : 'warning'} text={profile.lvi === 'negative' ? '无' : '阳性'} />
              <RiskBadge label="气道播散 (STAS)" status={profile.stas === 'negative' ? 'good' : 'warning'} text={profile.stas === 'negative' ? '无' : '阳性'} />
              <RiskBadge label="切缘状态" status={profile.margin === 'negative' ? 'good' : 'warning'} text={profile.margin === 'negative' ? '阴性(安全)' : '阳性'} />
            </div>
          </div>
        </div>

        {/* Action Engine Card */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 border border-blue-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">决策引擎建议</h3>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${profile.riskLevel === 'low' ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="font-bold text-gray-900">
                {profile.riskLevel === 'low' ? '低复发风险组' : '中高复发风险组'}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              您的优势因素（N0, 无 STAS）显著降低了局部复发的概率。
            </p>
            
            <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue" />
              <div className="text-xs text-accent-blue font-bold mb-1">下一步行动计划</div>
              <div className="text-sm text-gray-900 font-medium">
                {profile.nextAction}
              </div>
            </div>
          </div>
          
          <a href="/profile/report" className="w-full mt-4 btn-primary py-3 rounded-xl text-sm font-semibold shadow-sm block text-center">
            生成详细循证报告 →
          </a>
        </div>
      </div>

      <SimilarCasesCard profile={profile} />
      
    </div>
  );
}

function RiskBadge({ label, status, text }: { label: string, status: 'good' | 'warning', text: string }) {
  const isGood = status === 'good';
  return (
    <div className={`rounded-lg p-3 border ${isGood ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className={`text-xs font-semibold mb-1 ${isGood ? 'text-green-700' : 'text-amber-700'}`}>
        {isGood ? '✅' : '⚠️'} {label}
      </div>
      <div className={`text-sm font-bold ${isGood ? 'text-green-900' : 'text-amber-900'}`}>
        {text}
      </div>
    </div>
  );
}
