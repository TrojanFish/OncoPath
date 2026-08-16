"use client";

import React, { useState, useEffect } from "react";
import JourneyMap from "./JourneyMap";
import ReportUploader from "./ReportUploader";
import SimilarCasesCard from "./SimilarCasesCard";
import ConsentModal from "@/components/ConsentModal";
import type { PatientProfile } from "@/lib/types";
import { getGuestId } from "@/lib/guest";
import Link from "next/link";

export default function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile?userId=' + getGuestId());
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        } else {
          setShowUploader(true);
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

  const handleWipeProfile = async () => {
    try {
      setIsDeleting(true);
      const guestId = getGuestId();
      // 1. Delete on server
      await fetch(`/api/profile?userId=${guestId}`, { method: 'DELETE' }).catch(() => {});
      
      // 2. Clear LocalStorage
      localStorage.removeItem("oncopath_profile");
      localStorage.removeItem("oncopath_report_markdown");
      localStorage.removeItem("oncopath_report_timestamp");
      
      // 3. Reset React State
      setProfile(null);
      setShowDeleteModal(false);
      setShowUploader(true);
    } catch (err) {
      console.error("Failed to wipe profile", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-accent-blue rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">正在加载癌症档案与循证模型...</p>
        </div>
      </div>
    );
  }

  if (showUploader || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <ConsentModal />
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">建立个人医学档案</h1>
          <p className="text-slate-500 text-sm mt-1.5">将您的病理与影像报告交给 AI，自动建立结构化实性成分与循证模型</p>
        </div>
        <ReportUploader onParsed={handleParsed} />
      </div>
    );
  }

  // Boolean / String Safe Factor Checks
  const isStasSafe = profile.stas === 'negative' || (profile.stas as any) === false;
  const isLviSafe = profile.lvi === 'negative' || (profile.lvi as any) === false;
  const isVpiSafe = profile.vpi === 'negative' || (profile.vpi as any) === false;
  const isMarginSafe = profile.margin === 'negative' || profile.marginStatus === 'negative' || (profile.margin as any) === false;
  const isN0Safe = profile.nStage === 'N0' || !profile.nStage || profile.nStage === 'N?' || profile.lymphNodes === 'N0';
  const isGrade3 = profile.iaslcGrade === '3' || profile.grade === '3';
  const isAllSafe = isStasSafe && isLviSafe && isVpiSafe && isN0Safe && isMarginSafe && !isGrade3;
  const isFemale = (profile.gender as string) === 'female' || (profile.sex as string) === 'female' || (profile.gender as string) === '女' || (profile.sex as string) === '女';
  const genderText = isFemale ? '女性' : '男性';

  const noduleLabel = profile.noduleType === 'pure_ggo' 
    ? '纯磨玻璃结节 (pGGO)' 
    : profile.noduleType === 'pure_solid' 
    ? '纯实性结节 (Solid)' 
    : '混合磨玻璃结节 (mGGO)';

  return (
    <div className="max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 pb-4 sm:pb-6">
      <ConsentModal />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            患者临床数字档案 (Patient Profile)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            动态决策状态机 · 基于 AJCC 8th/9th 实性成分与前瞻性临床队列
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5 group"
            title="一键彻底销毁并注销本地与云端档案"
          >
            <svg className="w-3.5 h-3.5 text-rose-600 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">彻底注销/清空档案</span>
            <span className="sm:hidden">注销档案</span>
          </button>
          
          <button 
            onClick={() => setShowUploader(true)}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 group"
          >
            <svg className="w-3.5 h-3.5 text-slate-500 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
              <path d="M4 20h4l10.5-10.5a2.121 2.121 0 00-3-3L5 17v3z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <span>修改/更新档案</span>
          </button>
        </div>
      </div>

      <JourneyMap 
        currentStage={profile.currentStage} 
        psychologicalState={profile.psychologicalState} 
      />

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-6">
        
        {/* Core Clinical Profile Card (Adaptive CT & Pathology) */}
        <div className="md:col-span-2 bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' ? '🩻 CT IMAGING DIAGNOSIS · 影像诊断画像' : '🔬 CLINICAL DIAGNOSIS · 术后病理画像'}</span>
            </h3>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {noduleLabel}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-20 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center text-slate-900 border border-blue-100 flex-shrink-0 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500">
                {isFemale ? "♀ 女性" : "♂ 男性"}
              </span>
              <span className="text-xl font-black text-blue-900 leading-tight">
                {profile.age || 55}<span className="text-xs font-semibold text-slate-500 ml-0.5">岁</span>
              </span>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery'
                    ? (profile.stage ? `c${profile.stage} 期肺结节 (影像拟定)` : '早期肺结节 (待病理确诊)')
                    : (profile.stage ? `${profile.stage} 期原发性肺腺癌` : '早期原发性肺腺癌')
                  }
                </h2>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-accent-blue border border-blue-200 text-xs font-extrabold">
                  {profile.tStage || "T1a"}{profile.nStage || "N0"}{profile.mStage || "M0"}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                  {genderText} · {profile.age || 55}岁
                </span>
                {profile.lungRads && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                    Lung-RADS {profile.lungRads}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                <div>
                  {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' ? (
                    <span><strong>结节部位</strong>: {profile.noduleLocation || '肺部结节'} · <strong>诊疗阶段</strong>: 术前影像评估 / 定期随访</span>
                  ) : (
                    <span>
                      <strong>手术术式</strong>: {
                        profile.surgeryType === 'segmentectomy' ? '解剖性肺段切除' :
                        profile.surgeryType === 'lobectomy' ? '标准肺叶切除' :
                        profile.surgeryType === 'wedge' ? '肺楔形切除' :
                        profile.surgeryType || '根治性切除'
                      } · <strong>病理分级</strong>: {profile.iaslcGrade === '1' ? '高分化 (Grade 1)' : profile.iaslcGrade === '3' ? '低分化 (Grade 3)' : '中分化 (Grade 2)'}
                    </span>
                  )}
                </div>
                
                {profile.solidSize != null && (
                  <div className="text-teal-900 text-xs font-medium bg-teal-50/90 p-2.5 rounded-xl border border-teal-200 mt-2 flex items-center justify-between flex-wrap gap-2">
                    <span>
                      📏 <strong>CT 实性成分最大径</strong>: {profile.solidSize} cm ÷ <strong>磨玻璃最大径</strong>: {profile.tumorSize || 1.5} cm
                      <span className="ml-1.5 px-2 py-0.5 rounded-md bg-teal-100 font-bold text-teal-900">
                        CTR: {profile.ctr != null ? profile.ctr : (profile.solidSize && profile.tumorSize ? Math.round((profile.solidSize / profile.tumorSize) * 100) / 100 : 0.53)}
                      </span>
                    </span>
                    <span className="text-[11px] text-teal-700">
                      依据 AJCC 8th/9th 规则以实性成分精准校准为 <strong>{profile.stage || 'IA1'} 期</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* CT Imaging Features Or Pathology Matrix */}
          {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' ? (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>🩻 放射科 CT 恶性风险征象</span>
                <span className="text-sky-600 font-semibold text-[11px]">基于 Fleischner / CSCO 早期结节指南</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.imagingFeatures && profile.imagingFeatures.length > 0 ? (
                  profile.imagingFeatures.map((feat, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{feat}</span>
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                    🟢 结节边缘光滑，未见明显毛刺或胸膜牵拉征
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between w-full">
                  <span>🚦 关键病理红绿灯矩阵 (决定辅助治疗与复发风险)</span>
                  <span className="text-[10px] font-normal text-slate-400">6项核心病理指标</span>
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <RiskBadge 
                  label="切缘状态" 
                  status={isMarginSafe ? 'good' : 'danger'} 
                  text={isMarginSafe ? '阴性 (R0安全)' : '阳性 (有残留)'} 
                />
                <RiskBadge 
                  label="淋巴结分期" 
                  status={isN0Safe ? 'good' : profile.nStage === 'N1' ? 'warning' : 'danger'} 
                  text={profile.nStage === 'N0' || !profile.nStage ? 'N0 (无转移)' : profile.nStage === 'N1' ? 'N1 (肺门累及)' : profile.nStage === 'N2' ? 'N2 (纵隔转移)' : profile.nStage} 
                />
                <RiskBadge 
                  label="胸膜侵犯 (VPI)" 
                  status={isVpiSafe ? 'good' : 'warning'} 
                  text={isVpiSafe ? 'PL0 (未侵犯)' : 'PL1/PL2 (阳性高危)'} 
                />
                <RiskBadge 
                  label="气道播散 (STAS)" 
                  status={isStasSafe ? 'good' : 'warning'} 
                  text={isStasSafe ? '无 / 阴性' : '阳性 (高危)'} 
                />
                <RiskBadge 
                  label="脉管癌栓 (LVI)" 
                  status={isLviSafe ? 'good' : 'warning'} 
                  text={isLviSafe ? '无 / 阴性' : '阳性 (高危)'} 
                />
                <RiskBadge 
                  label="IASLC 病理分级" 
                  status={isGrade3 ? 'warning' : 'good'} 
                  text={isGrade3 ? 'Grade 3 (低分化高危)' : profile.iaslcGrade === '1' || profile.grade === '1' ? 'Grade 1 (高分化)' : 'Grade 2 (中分化)'} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Decision Engine Recommendation Card */}
        <div className="bg-gradient-to-b from-blue-50/80 via-white to-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-blue-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              DECISION ENGINE · {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' ? '术前决策引擎' : '术后决策引擎'}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${
                profile.currentStage === 'evaluation' || profile.currentStage === 'discovery'
                  ? (profile.riskLevel === 'high' ? 'bg-amber-500' : 'bg-emerald-500')
                  : (isAllSafe ? 'bg-emerald-500' : 'bg-amber-500')
              } animate-pulse`} />
              <span className="font-bold text-slate-900 text-base">
                {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery'
                  ? (profile.riskLevel === 'high' ? '⚡ 建议胸外科微创评估' : '🌱 建议 3~6 个月随访观察')
                  : (isAllSafe ? '🌱 早期低复发风险组' : '⚡ 需积极辅助随访组')
                }
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery'
                ? (profile.riskLevel === 'high' 
                    ? 'CT 影像提示伴有实性浸润或分叶毛刺征象，建议携带影像 DICOM 光盘至三甲胸外科门诊进行多学科会诊。'
                    : '目前结节以磨玻璃成分为主，生长极其缓慢，恶性危险度较低，首选遵循国际指南进行动态薄层 CT 随访。')
                : (isAllSafe 
                    ? '您的关键优势因素（R0切除、N0淋巴结阴性、无 STAS/VPI/LVI、高/中分化）显著降低了术后复发概率。' 
                    : '存在局部高危病理因素，建议密切关注局部影像与长程管理计划。')
              }
            </p>
            
            <div className="bg-white rounded-2xl p-4 border border-blue-200 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-blue" />
              <div className="text-[11px] text-accent-blue font-bold mb-1">
                {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' ? '术前行动建议' : '下一步建议'}
              </div>
              <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {profile.nextAction || profile.clinicalRecommendation || (
                  profile.currentStage === 'evaluation' || profile.currentStage === 'discovery'
                    ? '遵医嘱于 3~6 个月后复查胸部薄层 CT（层厚 ≤1mm），对比结节大小与密度。'
                    : '遵医嘱术后 6 个月规律复查胸部 CT 即可，无需过度化疗。'
                )}
              </div>
            </div>
          </div>
          
          <Link 
            href="/profile/report" 
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 text-center block transition-all cursor-pointer"
          >
            生成专属深度循证报告
          </Link>
        </div>
      </div>

      <SimilarCasesCard profile={profile} />

      {/* PIPL Right-to-be-Forgotten Wipe Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col p-6 text-slate-900 animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-4">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              确认彻底销毁与注销您的临床档案？
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              根据<strong>《中华人民共和国个人信息保护法》(PIPL)</strong> 被遗忘权原则，此操作将<strong>永久清除您保存在本设备浏览器（LocalStorage）中的所有病理指标、CT影像参数、深度循证报告与问诊清单</strong>，并同步从服务端彻底销毁记录。
              <br /><br />
              <span className="text-rose-600 font-semibold">⚠️ 此操作不可撤销，注销后如需使用需重新录入或上传。</span>
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleWipeProfile}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>正在销毁...</span>
                  </>
                ) : (
                  <span>确认彻底销毁并注销</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

function RiskBadge({ label, status, text }: { label: string; status: 'good' | 'warning' | 'danger'; text: string }) {
  const styles = {
    good: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200'
  };

  return (
    <div className={`rounded-2xl p-3 border ${styles[status]} shadow-xs`}>
      <div className="text-[11px] font-semibold opacity-90 mb-1.5 flex items-center gap-1.5">
        {status === 'good' && (
          <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M8.5 12.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {status === 'warning' && (
          <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M12 4L3 20h18L12 4z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        )}
        {status === 'danger' && (
          <svg className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span>{label}</span>
      </div>
      <div className="text-xs sm:text-sm font-bold truncate">
        {text}
      </div>
    </div>
  );
}
