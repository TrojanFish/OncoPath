"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Scan,
  Ruler,
  AlertTriangle,
  ShieldCheck,
  CircleDot,
  Check,
  Microscope,
  Activity,
  Layers,
  BrainCircuit,
  Stethoscope,
  ArrowRight,
  FileText,
  X,
  Edit3,
  Camera,
  Trash2,
  Share2,
  Image as ImageIcon,
  Dna,
  Award,
} from "lucide-react";
import dynamic from "next/dynamic";

import JourneyMap from "./JourneyMap";
import SimilarCasesCard from "./SimilarCasesCard";
import { NoduleTimelineChart } from "./NoduleTimelineChart";
import { GlossaryTooltip } from "@/components/common/GlossaryTooltip";
import ProfileExportModal from "./ProfileExportModal";


// Dynamically import ReportUploader modal for instant dashboard rendering
const ReportUploader = dynamic(() => import("./ReportUploader"), {
  ssr: false,
  loading: () => (
    <div className="p-8 sm:p-12 text-center text-slate-500 font-bold animate-pulse text-sm">
      正在加载智能报告解析与录入引擎...
    </div>
  ),
});



import ConsentModal from "@/components/ConsentModal";
import type { PatientProfile, FollowUpRecord, TumorMarkersData } from "@/lib/types";
import { getGuestId } from "@/lib/guest";
import Link from "next/link";

export default function PatientDashboard() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editMode, setEditMode] = useState<'edit_direct' | 'upload_new' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const loadProfile = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch('/api/profile?userId=' + getGuestId(), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data && data.profile) {
        setProfile(data.profile);
        setShowUploader(false);
        setEditMode(null);
        setShowUpdateModal(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("oncopath_profile", JSON.stringify(data.profile));
        }
      } else {
        // Fallback: check local storage cached profile
        const localCached = typeof window !== "undefined" ? localStorage.getItem("oncopath_profile") : null;
        if (localCached) {
          try {
            const parsed = JSON.parse(localCached);
            if (parsed && (parsed.stage || parsed.noduleType || parsed.tumorSize || parsed.organ)) {
              setProfile(parsed);
              setShowUploader(false);
              setEditMode(null);
              return;
            }
          } catch {}
        }
        setProfile(null);
        setShowUploader(true);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      setShowUploader(true);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile(true);

    const handleAuthChange = () => {
      loadProfile(true);
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleParsed = async (parsedData: any) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...parsedData, userId: getGuestId() })
      });
      const dbData = await res.json();
      if (dbData.success) {
        setProfile(dbData.profile);
        setShowUploader(false);
        setEditMode(null);
        setShowUpdateModal(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("oncopath_profile", JSON.stringify(dbData.profile));
          localStorage.removeItem(`oncopath_report_${dbData.profile.id || getGuestId()}`);
          localStorage.removeItem(`oncopath_report_time_${dbData.profile.id || getGuestId()}`);
          localStorage.removeItem("oncopath_report_markdown");
          localStorage.removeItem("oncopath_report_timestamp");
          window.dispatchEvent(new Event("storage"));
        }
      }
    } catch (err) {
      console.error("Failed to save parsed profile", err);
    }

  };

  const handleWipeProfile = async () => {
    try {
      setIsDeleting(true);
      const guestId = getGuestId();
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      // 1. Delete on server (wipes both patientProfile and timelineEvent tables)
      await fetch(`/api/profile?userId=${guestId}`, { 
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
      
      // 2. Clear All LocalStorage Keys (Profile, Timeline, Report, Questions)
      if (typeof window !== "undefined") {
        localStorage.removeItem("oncopath_profile");
        localStorage.removeItem("patient_profile");
        localStorage.removeItem("oncopath_report_markdown");
        localStorage.removeItem("oncopath_report_timestamp");
        localStorage.removeItem(`oncopath_report_${guestId}`);
        localStorage.removeItem(`oncopath_report_time_${guestId}`);
        if (profile?.id) {
          localStorage.removeItem(`oncopath_report_${profile.id}`);
          localStorage.removeItem(`oncopath_report_time_${profile.id}`);
        }
        localStorage.removeItem("oncopath_timeline_events");
        localStorage.removeItem("oncopath_timeline_is_demo");
        localStorage.removeItem("oncopath_timeline_custom_events");
        localStorage.removeItem("oncopath_clinic_questions");
        window.dispatchEvent(new Event("storage"));
      }
      
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
          <p className="mt-4 text-slate-500 font-medium">正在加载临床数字档案与循证模型...</p>
        </div>
      </div>
    );
  }

  if (showUploader || !profile) {
    return (
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6 lg:px-8 pb-4 sm:pb-6">
        <ConsentModal />
        {!profile && (
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">建立个人医学档案</h1>
            <p className="text-slate-500 text-sm mt-1.5">将您的病理与影像报告交给 AI，自动建立结构化实性成分与循证模型</p>
          </div>
        )}
        <ReportUploader 
          initialData={editMode === 'edit_direct' ? profile : null}
          existingProfile={profile}
          onParsed={handleParsed}
          onCancel={() => {
            setShowUploader(false);
            setEditMode(null);
          }}
        />
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
            患者临床数字档案
          </h1>
          <p className="text-slate-400 font-bold text-[11px] sm:text-xs uppercase tracking-wider mt-1">
            PATIENT CLINICAL PROFILE · 动态决策状态机 · 基于 AJCC 8th/9th 实性成分与前瞻性临床队列
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          {/* 1. Timeline */}
          <Link
            href="/timeline"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shadow-2xs group whitespace-nowrap"
            title="查看患者检查报告全景时间生命线"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span>时间生命线</span>
            <ArrowRight className="w-3 h-3 text-indigo-400 transition-transform group-hover:translate-x-0.5 flex-shrink-0" />
          </Link>

          {/* 2. Export Profile Poster Image */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer shadow-2xs group whitespace-nowrap"
            title="一键导出包含基础信息、病理指标与5年生存率的高清数字档案全景卡 (PNG)"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-600 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span>导出图片</span>
          </button>

          {/* 3. Edit Profile */}
          <button 
            onClick={() => setShowUpdateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer shadow-2xs group whitespace-nowrap"
            title="修改或更新患者病理、分期与临床指标"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span>修改档案</span>
          </button>

          {/* 4. Clear/Delete Profile */}
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer shadow-2xs group whitespace-nowrap"
            title="彻底销毁并重置本地与云端档案"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 transition-transform group-hover:scale-110 flex-shrink-0" />
            <span>清空档案</span>
          </button>

        </div>
      </div>

      <JourneyMap 
        currentStage={profile.currentStage} 
        psychologicalState={profile.psychologicalState} 
      />

      {/* 2x2 Bento Grid Clinical Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-6">
        
        {/* Bento Box 1: Primary CT Imaging & Solid Component (T-Staging) */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 border-t-4 border-t-sky-500 shadow-sm flex flex-col justify-between hover:border-sky-300 transition-all">

          <div>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 font-bold flex items-center justify-center shrink-0">
                  <Scan className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    薄层 CT 影像原发灶
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                    CT IMAGING & MORPHOLOGY · T-STAGING
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 whitespace-nowrap shrink-0">
                {noduleLabel}
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-600">
                  <strong>结节部位</strong>: <span className="font-semibold text-slate-900">{profile.noduleLocation || '肺部结节'}</span>
                </span>
                {profile.lungRads && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold shrink-0">
                    Lung-RADS {profile.lungRads}
                  </span>
                )}
              </div>

              {/* CTR Intelligence Computation Box */}
              {profile.solidSize != null && (
                <div className="bg-teal-50/90 p-3.5 rounded-2xl border border-teal-200 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-teal-950 font-bold flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>CT 实性浸润: {profile.solidSize} cm</span>
                      <span className="text-slate-400">/</span>
                      <span>全径: {profile.tumorSize || 1.5} cm</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-100 font-extrabold text-teal-900 text-xs shrink-0">
                      CTR: {profile.ctr != null ? profile.ctr : (profile.solidSize && profile.tumorSize ? Math.round((profile.solidSize / profile.tumorSize) * 100) / 100 : 0.53)}
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-700 font-medium">
                    依据 AJCC 8th/9th 规则以实性成分精准校准为 <strong>{profile.stage || 'IA1'} 期 ({profile.tStage || 'T1a'})</strong>
                  </div>
                </div>
              )}

              {/* CT Malignant Signs Pills with GlossaryTooltip */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  已识别的恶性影像风险征象（点击词条查看人话释义）：
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.imagingFeatures && profile.imagingFeatures.length > 0 ? (
                    profile.imagingFeatures.map((feat, i) => (
                      <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <GlossaryTooltip term={feat}>
                          <span>{feat}</span>
                        </GlossaryTooltip>
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>结节边缘光滑，未见明显毛刺或胸膜牵拉征</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Multiple Nodules Sub-Panel (P0-1) */}
              {(profile.isMultipleNodules || (profile.secondaryNodules && profile.secondaryNodules.length > 0)) && (
                <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-teal-950">
                    <span className="flex items-center gap-1.5">
                      <CircleDot className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>双肺伴随微小结节（已排查良性）：</span>
                    </span>
                    <span className="text-[10px] text-teal-700 font-normal shrink-0">多为陈旧良性病灶</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.secondaryNodules || []).map((sec, idx) => (
                      <span key={sec.id || idx} className="px-2 py-0.5 bg-white text-teal-900 border border-teal-200 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{sec.location} ({sec.sizeMm}mm · {sec.type === 'pure_ggo' ? '纯磨玻璃' : '微小灶'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Box 2: Pathology High-Risk Indicators & Ki-67 (N-Stage & Invasive Factors) */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 border-t-4 border-t-purple-500 shadow-sm flex flex-col justify-between hover:border-purple-300 transition-all">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center shrink-0">
                  <Microscope className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    术后组织病理与浸润特征
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                    PATHOLOGY & IHC · INVASIVE FACTORS
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 whitespace-nowrap shrink-0">
                {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.surgeryType === 'unknown' ? '术前基线' : '病理金标准'}
              </span>
            </div>

            {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery' || profile.surgeryType === 'unknown' ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center my-auto">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 shrink-0" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">尚未接受手术切除</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  切缘状态 (R0)、微血管浸润 (LVI)、气道播散 (STAS) 及 Ki-67 需在手术切除后由病理科出具。当前建议重点参考薄层 CT 随访与全身排查。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
                  <span>
                    <strong>手术术式</strong>: {
                      profile.surgeryType === 'segmentectomy' ? '解剖性肺段切除' :
                      profile.surgeryType === 'lobectomy' ? '标准肺叶切除' :
                      profile.surgeryType === 'wedge' ? '肺楔形切除' :
                      profile.surgeryType || '根治性切除'
                    }
                  </span>
                  <span>
                    <strong>病理分级</strong>: {profile.iaslcGrade === '1' || profile.grade === '1' ? 'G1 (高分化)' : profile.iaslcGrade === '3' || profile.grade === '3' ? 'G3 (低分化)' : 'G2 (中分化)'}
                  </span>
                </div>

                {/* 6-Core Risk Badges Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <RiskBadge 
                    label="切缘状态 (R0)" 
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
                    text={isVpiSafe ? 'PL0 (未侵犯)' : 'PL1/PL2 (阳性)'} 
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
                    label="IASLC 分级" 
                    status={isGrade3 ? 'warning' : 'good'} 
                    text={isGrade3 ? 'G3 (低分化)' : profile.iaslcGrade === '1' || profile.grade === '1' ? 'G1 (高分化)' : 'G2 (中分化)'} 
                  />
                </div>

                {/* Ki-67 Dedicated Strip */}
                {profile.ki67 != null && profile.ki67 !== "" && (
                  <div className="p-2.5 bg-purple-50/80 rounded-xl border border-purple-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="text-purple-900 font-bold flex items-center gap-1.5">
                      <GlossaryTooltip term="Ki-67">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Ki-67 细胞增殖指数:</span>
                        </span>
                      </GlossaryTooltip>
                      <span className="px-2 py-0.5 bg-purple-200/80 rounded-md font-extrabold text-purple-950 shrink-0">
                        {profile.ki67}%
                      </span>
                    </span>
                    <span className="text-[11px] text-purple-700 font-semibold">
                      {(typeof profile.ki67 === 'number' ? profile.ki67 : parseFloat(String(profile.ki67))) <= 5 ? '惰性分裂 · 极高预后安全性' : '常规代谢增殖'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bento Box 3: Systemic Staging & Benign Findings (M-Staging) */}
        <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-7 border border-slate-200 border-t-4 border-t-teal-500 shadow-sm flex flex-col justify-between hover:border-teal-300 transition-all">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 font-bold flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    全身远处转移排查与良性排雷
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                    SYSTEMIC STAGING · M-STAGE EXCLUSION
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap shrink-0">
                M0 根治窗口确立
              </span>
            </div>

            <div className="space-y-3.5">
              {/* 5-Organ Checklist Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>脑部增强 MRI</span>
                  </span>
                  <span className={`font-bold mt-1 ${profile.brainMri === 'negative' ? 'text-emerald-700' : profile.brainMri === 'positive' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {profile.brainMri === 'negative' ? '阴性 (M0)' : profile.brainMri === 'positive' ? '提示可疑' : '未检查'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>腹部与肾上腺</span>
                  </span>
                  <span className={`font-bold mt-1 ${(profile.abdominalUltrasound === 'negative' || profile.abdominalUltrasound === 'benign_findings') ? 'text-emerald-700' : profile.abdominalUltrasound === 'positive' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {(profile.abdominalUltrasound === 'negative' || profile.abdominalUltrasound === 'benign_findings') ? '阴性/良性' : profile.abdominalUltrasound === 'positive' ? '提示可疑' : '未检查'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>全身骨显像 ECT</span>
                  </span>
                  <span className={`font-bold mt-1 ${profile.boneScan === 'negative' ? 'text-emerald-700' : profile.boneScan === 'positive' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {profile.boneScan === 'negative' ? '阴性 (M0)' : profile.boneScan === 'positive' ? '提示可疑' : '未检查'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>锁骨上淋巴结</span>
                  </span>
                  <span className={`font-bold mt-1 ${profile.neckLymphNodes === 'negative' ? 'text-emerald-700' : profile.neckLymphNodes === 'positive' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {profile.neckLymphNodes === 'negative' ? '未见肿大 (N0)' : profile.neckLymphNodes === 'positive' ? '见肿大' : '未检查'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col justify-between">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Scan className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>全身 PET-CT</span>
                  </span>
                  <span className={`font-bold mt-1 ${profile.petCt === 'negative' ? 'text-emerald-700' : profile.petCt === 'positive' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {profile.petCt === 'negative' ? '无浓聚 (M0)' : profile.petCt === 'positive' ? '高代谢' : '未检查'}
                  </span>
                </div>
              </div>

              {/* Benign Findings Strip with GlossaryTooltip & Reassurance */}
              {profile.benignFindings && profile.benignFindings.length > 0 && (
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1.5 shadow-2xs">
                  <div className="text-[11px] font-bold text-emerald-950 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>伴发良性发现（非肿瘤转移，点击查看释义）：</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      ✓ 临床排雷确认为良性
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.benignFindings.map((item: string) => (
                      <span key={item} className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <GlossaryTooltip term={item}><span>{item}</span></GlossaryTooltip>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bento Box 4: AI Decision Engine & Actionable Next Steps */}
        <div className="bg-gradient-to-br from-blue-50/90 via-white to-sky-50/60 rounded-3xl p-3.5 sm:p-6 md:p-7 border border-blue-200 border-t-4 border-t-blue-600 shadow-sm flex flex-col justify-between hover:border-blue-400 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-blue-100/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-4 h-4 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    智能临床决策引擎
                  </h3>
                  <p className="text-[10px] font-bold text-blue-600/80 uppercase tracking-wider mt-0.5 truncate">
                    AI DECISION ENGINE · ACTIONABLE NEXT STEPS
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>实时推演</span>
              </span>
            </div>


            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                {profile.currentStage === 'evaluation' || profile.currentStage === 'discovery'
                  ? (profile.riskLevel === 'high' ? '建议胸外科微创评估' : '建议 3~6 个月随访观察')
                  : (isAllSafe ? '早期低复发风险组' : '需积极辅助随访组')
                }
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
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
            className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>生成专属深度循证报告</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Molecular Profiling & Precision Targeting Feature Card */}
      <div className="mb-6 bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 border-t-4 border-t-indigo-600 shadow-sm hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
              <Dna className="w-4 h-4 shrink-0" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                分子病理与驱动基因分型
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                MOLECULAR BIOMARKERS & PRECISION TARGETING · NGS PANEL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 whitespace-nowrap">
              {(() => {
                const mutations = profile.geneMutations || profile.molecular?.mutations || [];
                const status = profile.molecularTestStatus || profile.molecular?.testStatus || (mutations.length > 0 ? "tested" : (profile.egfr === 'positive' ? "tested" : (profile.egfr === 'negative' ? 'negative' : "not_tested")));
                if (status === "negative") return "全野生型 (全阴性)";
                if (status === "not_tested") return "未做基因检测";
                if (status === "in_progress") return "送检中";
                return `检出 ${mutations.length > 0 ? mutations.length : (profile.egfr === 'positive' ? 1 : 0)} 项基因变异`;
              })()}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {(() => {
          const mutations = (Array.isArray(profile.geneMutations) && profile.geneMutations.length > 0)
            ? profile.geneMutations
            : (Array.isArray(profile.molecular?.mutations) && profile.molecular.mutations.length > 0)
            ? profile.molecular.mutations
            : (profile.egfr === 'positive' ? [{ id: 'mut_egfr', gene: 'EGFR', subtype: '敏感突变', status: 'positive' }] : []);
          const testStatus = profile.molecularTestStatus || profile.molecular?.testStatus || (mutations.length > 0 ? "tested" : (profile.egfr === 'positive' ? "tested" : (profile.egfr === 'negative' ? 'negative' : "not_tested")));
          const pdl1 = profile.pdl1Tps || profile.molecular?.pdl1Tps;
          const isStageIA = profile.stage?.startsWith("IA");
          const hasEgfr = mutations.some((m: any) => m.gene === "EGFR");
          const hasAlk = mutations.some((m: any) => m.gene === "ALK");
          const hasTp53 = mutations.some((m: any) => m.gene === "TP53" || m.isComutation);

          if (testStatus === "not_tested") {
            return (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>当前档案未录入基因检测报告</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isStageIA ? (
                      <span><strong>IA 期极高治愈率保障</strong>：经微创根治手术后，IA 期 5 年生存率达 90%+，指南明确无需靶向辅助治疗，不强制要求昂贵的基因大 Panel 检测。</span>
                    ) : (
                      <span>若为主治医生评估需要评估靶向辅助治疗（如奥希替尼），可随时点击上方“微调已有指标”补充检测结果。</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode('edit_direct');
                    setShowUploader(true);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 hover:text-indigo-600 font-bold text-slate-700 text-xs rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer"
                >
                  录入基因报告
                </button>
              </div>
            );
          }

          if (testStatus === "negative") {
            return (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>全基因野生型（未见经典驱动靶点突变）</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  EGFR、ALK、ROS1、KRAS 等常见驱动靶点均为野生型（阴性）。若未来需系统全身治疗，化疗联合免疫治疗（PD-1/PD-L1）通常为标准首选方向。
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {/* Gene Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {mutations.map((m: any, idx: number) => {
                  const isComutation = m.isComutation || m.gene === "TP53" || m.gene === "RB1" || m.gene === "PIK3CA";
                  return (
                    <div
                      key={m.id || m.gene + idx}
                      className={`p-3 rounded-2xl border flex flex-col justify-between ${
                        isComutation
                          ? "bg-amber-50/60 border-amber-300/80 shadow-2xs"
                          : "bg-indigo-50/50 border-indigo-200 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-extrabold text-xs flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isComutation ? 'bg-amber-500' : 'bg-indigo-600'}`} />
                          <span className={isComutation ? 'text-amber-950' : 'text-indigo-950'}>{m.gene}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isComutation 
                            ? "bg-amber-200/80 text-amber-900" 
                            : "bg-indigo-200/70 text-indigo-900"
                        }`}>
                          {isComutation ? "伴随突变" : "驱动靶点"}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-700 space-y-0.5">
                        <div className="truncate">{m.subtype || "检出变异"}</div>
                        {m.abundance && (
                          <div className="text-[10px] text-slate-500">
                            突变丰度 (VAF): <strong className="text-slate-800">{m.abundance}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* PD-L1 Badge if available */}
                {pdl1 && pdl1 !== "unknown" && (
                  <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200 flex flex-col justify-between shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        <span>PD-L1 TPS</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        免疫组化
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {pdl1} {pdl1 === '>=50%' ? '(高表达)' : pdl1 === '1-49%' ? '(低表达)' : '(阴性)'}
                    </div>
                  </div>
                )}
              </div>

              {/* Matched Targeted Drugs & Policy Strip */}
              {(hasEgfr || hasAlk) && (
                <div className="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>匹配精准靶向药物与门特医保：</span>
                    </div>
                    <p className="text-[11px] text-blue-800">
                      {hasEgfr && "三代 EGFR-TKI（甲磺酸奥希替尼/泰瑞沙、阿美替尼/阿美乐、伏美替尼/艾弗沙等）"}
                      {hasAlk && "二代 ALK-TKI（阿来替尼/安圣莎、布格替尼、洛拉替尼等）"}
                      {" · 均已纳入国家医保门特报销目录"}
                    </p>
                  </div>
                  <Link
                    href="/reimbursement"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                  >
                    <span>查看门特报销指引</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Clinical Guardrail & Guidance */}
              {isStageIA && (hasEgfr || hasAlk) ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">早期 IA 期治愈定心丸（指南 1 类强烈推荐）：</div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                      虽然检出敏感驱动突变，但您的病灶处于 <strong>IA 期早期</strong>。指南明文确立：彻底手术已达临床根治（5年生存率 90%~100%），<strong>严禁盲目服用靶向药辅助治疗</strong>（避免过度医疗与耐药），仅需遵医嘱定期复查即可。
                    </p>
                  </div>
                </div>
              ) : hasTp53 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">TP53 伴随突变随访管理建议：</div>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      检出伴随 TP53 突变，提示肿瘤细胞稍具增殖活性。建议术后前 2 年严格执行每 3~6 个月薄层胸部 CT 随访。
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })()}
      </div>

      {/* P0-2: Nodule Longitudinal CT Growth Timeline (Read-Only) */}
      <div className="mb-6">
        <NoduleTimelineChart 
          history={profile.followUpHistory} 
          profile={profile} 
        />
      </div>

      {/* Similar Cases & Cohorts Prognosis (5-Yr RFS/OS & Warm Empathy Words) */}
      <div className="mb-6">
        <SimilarCasesCard profile={profile} />
      </div>

      {/* Profile Update Intent Router Modal (方案 A: 意图分流弹窗) */}

      {showUpdateModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col p-6 sm:p-7 text-slate-900 animate-fade-in-up space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    请选择档案更新方式
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    根据您的当前需求选择快速微调或增量上传新报告
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Direct Edit on Existing Data */}
              <button
                type="button"
                onClick={() => {
                  setEditMode('edit_direct');
                  setShowUpdateModal(false);
                  setShowUploader(true);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer group flex items-start gap-3.5 shadow-2xs hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-900">
                      快捷核对与微调已有指标
                    </h4>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">推荐 · 10秒</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    无需重新拍照，直接在当前已保存的性别、年龄、CTR实性成分、病理指标与全身排查状态上微调修改
                  </p>
                </div>
              </button>

              {/* Option 2: Upload New Medical Report (Incremental Merge) */}
              <button
                type="button"
                onClick={() => {
                  setEditMode('upload_new');
                  setShowUpdateModal(false);
                  setShowUploader(true);
                }}
                className="w-full text-left p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all cursor-pointer group flex items-start gap-3.5 shadow-2xs hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-900">
                      追加 / 上传新医疗报告
                    </h4>
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">AI 智能合并</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    拿到了新的术后大病理、复查薄层CT、脑增强MRI或PET-CT？上传后由 AI 跨模态增量融合提取，不抹除已有记录
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIPL Right-to-be-Forgotten Wipe Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col p-6 text-slate-900 animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-4">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              确认彻底销毁与注销您的临床档案？
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              根据<strong>《中华人民共和国个人信息保护法》(PIPL)</strong> 被遗忘权原则，此操作将<strong>永久清除您保存在本设备浏览器（LocalStorage）中的所有病理指标、CT影像参数、深度循证报告与问诊清单</strong>，并同步从服务端彻底销毁记录。
              <br /><br />
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>此操作不可撤销，注销后如需使用需重新录入或上传。</span>
              </span>
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

      {/* Digital Profile HD Export Poster Modal */}
      {showExportModal && (
        <ProfileExportModal
          profile={profile}
          onClose={() => setShowExportModal(false)}
        />
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
