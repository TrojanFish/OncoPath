"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  Scan,
  Globe,
  Microscope,
  Camera,
  Dna,
  User,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  X,
  CircleDot,
  ShieldCheck,
  TrendingUp,
  Activity,
  BrainCircuit,
  Stethoscope,
  Sparkles,
  Check,
  Info,
  Layers,
  TestTube2,
  Award,
} from "lucide-react";
import type { PatientProfile, SecondaryNodule, FollowUpRecord, TumorMarkersData } from "@/lib/types";
import { computeClinicalTnmStage } from "@/lib/staging";
import { GlossaryTooltip } from "@/components/common/GlossaryTooltip";

interface ReportUploaderProps {
  onParsed: (data: any) => void;
  initialData?: any | null;
  existingProfile?: any | null;
  onCancel?: () => void;
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

export default function ReportUploader({ onParsed, initialData, existingProfile, onCancel }: ReportUploaderProps) {
  const [reportText, setReportText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState("");
  const [parsedData, setParsedData] = useState<any | null>(initialData || null);
  const [images, setImages] = useState<UploadedReportImage[]>([]);
  const [activeSignTooltip, setActiveSignTooltip] = useState<string | null>(null);
  const [newBenignInput, setNewBenignInput] = useState("");
  
  // Secondary nodules state
  const [newSecLoc, setNewSecLoc] = useState("");
  const [newSecSize, setNewSecSize] = useState("");
  const [newSecType, setNewSecType] = useState("pure_ggo");

  // Follow-up history records state
  const [newHistDate, setNewHistDate] = useState("");
  const [newHistTumorSize, setNewHistTumorSize] = useState("");
  const [newHistSolidSize, setNewHistSolidSize] = useState("");
  const [newHistNote, setNewHistNote] = useState("");

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

      // Clean Ki-67 value
      const base = existingProfile || initialData || {};
      const cleanKi67 = parsedData.ki67 !== undefined && parsedData.ki67 !== null && parsedData.ki67 !== ""
        ? String(parsedData.ki67).replace(/%/g, "").trim()
        : (base.ki67 || null);

      // Prepare follow-up timeline node
      const prevHistory = Array.isArray(base.followUpHistory) ? [...base.followUpHistory] : [];
      let finalHistory = Array.isArray(parsedData.followUpHistory) && parsedData.followUpHistory.length > 0
        ? [...parsedData.followUpHistory]
        : [...prevHistory];

      // Add current scan to history if it's a CT report and not yet in history
      const reportDate = parsedData.reportDate || new Date().toISOString().split('T')[0];
      const hasDateInHist = finalHistory.some((h: any) => h.date === reportDate);
      if (!hasDateInHist && (parsedData.reportType === 'ct_imaging' || parsedData.tumorSize)) {
        finalHistory.push({
          id: `hist_${Date.now()}`,
          date: reportDate,
          tumorSize: stagingPreview?.tumorSize || tumorVal,
          solidSize: stagingPreview?.solidSize || solidVal,
          ctr: stagingPreview?.ctr ?? calculatedCtr,
          noduleType: parsedData.noduleType || "mixed_ggo",
          lungRads: parsedData.lungRads || null,
          note: parsedData.clinicalRecommendation || "本次检查建档"
        });
      }
      finalHistory.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const finalData = {
        ...base,
        id: base.id,
        userId: base.userId,
        age: parsedData.age !== "" && parsedData.age != null ? parseInt(String(parsedData.age)) || 55 : (base.age || 55),
        tumorSize: stagingPreview?.tumorSize || tumorVal,
        solidSize: stagingPreview?.solidSize || solidVal,
        ctr: stagingPreview?.ctr ?? calculatedCtr,
        stage: stagingPreview?.stage || parsedData.stage || base.stage || "IA1",
        tStage: stagingPreview?.tStage || parsedData.tStage || base.tStage || "T1a",
        noduleType: parsedData.noduleType || base.noduleType || "mixed_ggo",
        nStage: parsedData.nStage || base.nStage || "N0",
        mStage: parsedData.mStage || base.mStage || "M0",
        stas: parsedData.stas !== undefined ? parsedData.stas : (base.stas || "negative"),
        vpi: parsedData.vpi !== undefined ? parsedData.vpi : (base.vpi || "negative"),
        lvi: parsedData.lvi !== undefined ? parsedData.lvi : (base.lvi || "negative"),
        marginStatus: parsedData.marginStatus !== undefined ? parsedData.marginStatus : (base.marginStatus || "negative"),
        margin: parsedData.marginStatus !== undefined ? parsedData.marginStatus : (base.margin || "negative"),
        surgeryType: parsedData.surgeryType || base.surgeryType || "segmentectomy",
        iaslcGrade: parsedData.grade || parsedData.iaslcGrade || base.iaslcGrade || "2",
        grade: parsedData.grade || parsedData.iaslcGrade || base.grade || "2",
        ki67: cleanKi67,
        sex: parsedData.sex || parsedData.gender || base.sex || "female",
        gender: parsedData.sex || parsedData.gender || base.gender || "female",
        histology: parsedData.histology || base.histology || "adenocarcinoma",
        reportType: parsedData.reportType || base.reportType || "pathology",
        currentStage: (parsedData.reportType === 'ct_imaging' || parsedData.surgeryType === 'unknown') ? 'evaluation' : 'treatment',
        imagingFeatures: (Array.isArray(parsedData.imagingFeatures) && parsedData.imagingFeatures.length > 0) ? parsedData.imagingFeatures : (base.imagingFeatures || []),
        noduleLocation: parsedData.noduleLocation || base.noduleLocation || "右肺上叶尖段",
        lungRads: parsedData.lungRads || base.lungRads || null,
        malignancyRisk: parsedData.malignancyRisk || base.malignancyRisk || "moderate",
        clinicalRecommendation: parsedData.clinicalRecommendation || base.clinicalRecommendation || null,

        // P0-1 Multiple Nodules
        isMultipleNodules: Boolean(parsedData.isMultipleNodules || (Array.isArray(parsedData.secondaryNodules) && parsedData.secondaryNodules.length > 0) || base.isMultipleNodules),
        secondaryNodules: Array.isArray(parsedData.secondaryNodules) ? parsedData.secondaryNodules : (base.secondaryNodules || []),

        // P0-2 Follow-up History
        followUpHistory: finalHistory,

        // P2-2 Tumor Markers
        tumorMarkers: parsedData.tumorMarkers || base.tumorMarkers || null,

        // Systemic Staging & M0 Confirmation
        brainMri: parsedData.brainMri || base.brainMri || "not_performed",
        abdominalUltrasound: parsedData.abdominalUltrasound || base.abdominalUltrasound || "not_performed",
        boneScan: parsedData.boneScan || base.boneScan || "not_performed",
        neckLymphNodes: parsedData.neckLymphNodes || base.neckLymphNodes || "not_performed",
        petCt: parsedData.petCt || base.petCt || "not_performed",
        benignFindings: Array.isArray(parsedData.benignFindings) ? parsedData.benignFindings : (base.benignFindings || []),
        systemicStagingConfirmed: Boolean(parsedData.systemicStagingConfirmed ?? isM0Confirmed ?? base.systemicStagingConfirmed),
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

  const handleAddSecondaryNodule = () => {
    if (!newSecLoc.trim() || !newSecSize.trim()) return;
    const current = parsedData.secondaryNodules || [];
    const newItem: SecondaryNodule = {
      id: `sec_${Date.now()}`,
      location: newSecLoc.trim(),
      sizeMm: parseFloat(newSecSize) || 4,
      type: newSecType,
      isBenignTendency: true,
      note: "微小伴随病灶，良性或常规随访"
    };
    setParsedData({
      ...parsedData,
      isMultipleNodules: true,
      secondaryNodules: [...current, newItem]
    });
    setNewSecLoc("");
    setNewSecSize("");
  };

  const handleRemoveSecondaryNodule = (id: string) => {
    const current = parsedData.secondaryNodules || [];
    const filtered = current.filter((item: any) => item.id !== id);
    setParsedData({
      ...parsedData,
      isMultipleNodules: filtered.length > 0,
      secondaryNodules: filtered
    });
  };

  const handleAddHistoryRecord = () => {
    if (!newHistDate || !newHistTumorSize) return;
    const tumorVal = parseFloat(newHistTumorSize) || 1.0;
    const solidVal = newHistSolidSize ? parseFloat(newHistSolidSize) : 0;
    const ctrVal = tumorVal > 0 ? Math.min(1, Math.round((solidVal / tumorVal) * 100) / 100) : 0;

    const current = Array.isArray(parsedData.followUpHistory) ? parsedData.followUpHistory : [];
    const newItem: FollowUpRecord = {
      id: `hist_${Date.now()}`,
      date: newHistDate,
      tumorSize: tumorVal,
      solidSize: solidVal,
      ctr: ctrVal,
      note: newHistNote.trim() || "历史随访复查"
    };

    const updated = [...current, newItem].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    setParsedData({
      ...parsedData,
      followUpHistory: updated
    });

    setNewHistDate("");
    setNewHistTumorSize("");
    setNewHistSolidSize("");
    setNewHistNote("");
  };

  const handleRemoveHistoryRecord = (id: string) => {
    const current = Array.isArray(parsedData.followUpHistory) ? parsedData.followUpHistory : [];
    setParsedData({
      ...parsedData,
      followUpHistory: current.filter((item: any) => item.id !== id)
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
              <span className="flex items-center gap-1">
                {initialData ? <FileText className="w-3 h-3 text-emerald-700" /> : <Check className="w-3 h-3 text-emerald-700" />}
                <span>{initialData ? "档案核对与微调模式" : "全模态结构化提取就绪"}</span>
              </span>
              <span className="text-slate-400">·</span>
              <span className="flex items-center gap-1">
                {parsedData.reportType === 'ct_imaging' ? (
                  <>
                    <Scan className="w-3 h-3 text-sky-600" />
                    <span>放射科胸部 CT 报告</span>
                  </>
                ) : parsedData.reportType === 'systemic_staging' ? (
                  <>
                    <Globe className="w-3 h-3 text-teal-600" />
                    <span>全身转移排查报告 (MRI/超声/骨扫描)</span>
                  </>
                ) : parsedData.reportType === 'comprehensive' ? (
                  <>
                    <Layers className="w-3 h-3 text-indigo-600" />
                    <span>综合多模态联合报告 (CT + 病理 + 全身排查)</span>
                  </>
                ) : (
                  <>
                    <Microscope className="w-3 h-3 text-purple-600" />
                    <span>术后组织病理报告</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {initialData ? "核对并校准您的关键临床指标" : "请核对并确认您的医疗特征指标"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {initialData 
                ? "可直接调整性别、年龄、CTR实性成分、病理指标与全身排查状态，保存即生效" 
                : "AI 已自动计算实性成分比例 (CTR)、校准临床分期并同步全身排查状态"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button 
              type="button"
              onClick={() => setParsedData(null)}
              className="text-xs text-slate-600 hover:text-purple-700 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>改为拍照上传新报告</span>
            </button>
            {onCancel && (
              <button 
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ‹ 返回看板
              </button>
            )}
          </div>
        </div>

        {/* AJCC 8th/9th Solid Component Intelligence Banner */}
        {stagingPreview && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-teal-300/80 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-teal-700" />
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
          
          {/* Section 1: Patient Demographics & Surgery Status (Clinical Anchor & Primary Switch) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>患者基本画像与诊疗状态</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">决定分期计算基准与临床路径分流</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">生物学性别</label>
                <select 
                  value={parsedData.sex || "female"} 
                  onChange={e => setParsedData({...parsedData, sex: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="female">女性 (Female)</option>
                  <option value="male">男性 (Male)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">患者年龄</label>
                <input 
                  type="number" 
                  value={parsedData.age || ""} 
                  onChange={e => setParsedData({...parsedData, age: e.target.value})}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  placeholder="55"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">当前诊疗状态 / 手术术式</label>
                {parsedData.reportType === 'ct_imaging' && parsedData.surgeryType === 'unknown' ? (
                  <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-bold text-sky-900 flex items-center h-[42px] gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>尚未手术 (随访观察 / 术前评估)</span>
                  </div>
                ) : (
                  <select 
                    value={parsedData.surgeryType || "segmentectomy"} 
                    onChange={e => setParsedData({...parsedData, surgeryType: e.target.value})}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="segmentectomy">解剖性肺段切除 (Segmentectomy)</option>
                    <option value="lobectomy">标准肺叶切除 (Lobectomy)</option>
                    <option value="wedge">肺楔形切除 (Wedge Resection)</option>
                    <option value="unknown">尚未手术 / 随访期</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Nodule Morphology & Solid Size & Accurate CTR */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-teal-700" />
                <span>结节形态与 CT 实性成分 (CTR 核心分期依据)</span>
              </span>
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
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  <strong>CTR 计算公式</strong>：<strong>CT 实性成分最大径 ({solidVal}cm) ÷ 磨玻璃最大径 ({tumorVal}cm) = {currentCtr}</strong>
                </span>
              </span>
              <span className="text-teal-700 font-semibold flex items-center gap-1">
                {currentCtr <= 0.5 ? (
                  <>
                    <Check className="w-3 h-3 text-teal-600" />
                    <span>CTR ≤ 0.5 (惰性浸润，5年无复发率高达99.7%)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>CTR &gt; 0.5 (浸润成分较高，需重点评估切缘)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Section 3: CT Malignant Imaging Signs with Plain-Language Definitions */}
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-sky-900 uppercase tracking-wide flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-sky-700" />
                <span>CT 影像恶性征象（点击切换 & 悬浮/点击查看通俗释义）</span>
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
                          ? 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>{sign}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Multiple Pulmonary Nodules Management (P0-1) */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-teal-700" />
                <span>双肺多发病灶协同管理 (主病灶 vs 伴随微小病灶)</span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                parsedData.isMultipleNodules
                  ? "bg-teal-100 text-teal-800 border-teal-300"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {parsedData.isMultipleNodules ? "双肺多发结节" : "单发主病灶"}
              </span>
            </div>

            {/* Reassurance text */}
            <div className="p-3 bg-white rounded-xl border border-teal-200 text-xs text-teal-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>多发结节良性定心丸：</span>
              </div>
              <p className="text-[11px] text-teal-800 leading-relaxed">
                体检中超过 30% 的人群伴有双肺多发微小结节，绝大多数为既往隐匿性感染留下的陈旧良性疤痕，<strong>绝不等于转移扩散</strong>！临床以【主病灶】作为手术或干预评估基准，次要微小灶以常规薄层 CT 随访观察即可。
              </p>
            </div>

            {/* Secondary nodules list */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-700">次要伴随微小结节清单：</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(parsedData.secondaryNodules || []).map((sec: any) => (
                  <div key={sec.id} className="p-2.5 bg-white rounded-xl border border-teal-200 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{sec.location}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-800 rounded font-semibold border border-teal-100">
                          {sec.sizeMm}mm · {sec.type === "pure_ggo" ? "纯磨玻璃" : sec.type === "calcification" ? "钙化灶" : "微小结节"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{sec.note || "良性随访"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSecondaryNodule(sec.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add secondary nodule row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="部位 (如: 右肺下叶)"
                  value={newSecLoc}
                  onChange={(e) => setNewSecLoc(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs flex-1 min-w-[120px]"
                />
                <input
                  type="number"
                  placeholder="大小(mm)"
                  value={newSecSize}
                  onChange={(e) => setNewSecSize(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs w-20"
                />
                <select
                  value={newSecType}
                  onChange={(e) => setNewSecType(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                >
                  <option value="pure_ggo">纯磨玻璃</option>
                  <option value="solid">实性小结节</option>
                  <option value="calcification">钙化灶</option>
                  <option value="mixed_ggo">混合磨玻璃</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSecondaryNodule}
                  className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  + 添加伴随结节
                </button>
              </div>
            </div>
          </div>

          {/* Section: Longitudinal CT Follow-up History Management (P0-2) */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-700" />
                <span>历次 CT 随访时序记录管理 (时序生长折线图与 VDT 测算数据源)</span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                已录入 {(parsedData.followUpHistory || []).length} 次检查记录
              </span>
            </div>

            <p className="text-[11px] text-sky-800 leading-relaxed font-medium">
              系统将按检查日期自动串联各次 CT 的全径与实性成分，计算<strong>体积倍增时间 (VDT)</strong> 并判定生长动力学。您可在此补录往年老片数据：
            </p>

            {/* List of existing records */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(parsedData.followUpHistory || []).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-xl border border-sky-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{item.date}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-800 rounded font-semibold border border-teal-100">
                          全径: {(item.tumorSize * 10).toFixed(0)}mm | 实性: {((item.solidSize || 0) * 10).toFixed(0)}mm
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        CTR: {item.ctr != null ? (item.ctr * 100).toFixed(0) : "0"}%{item.note ? ` · ${item.note}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHistoryRecord(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer"
                      title="移除该条记录"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add history record form */}
              <div className="p-3 bg-white/90 rounded-xl border border-sky-200 space-y-2 pt-2">
                <div className="text-[11px] font-bold text-sky-900">+ 补录既往体检/复查老片数据：</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">检查日期</label>
                    <input
                      type="date"
                      value={newHistDate}
                      onChange={(e) => setNewHistDate(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">结节全径 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="如: 0.8"
                      value={newHistTumorSize}
                      onChange={(e) => setNewHistTumorSize(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">实性成分 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="纯磨玻璃填0"
                      value={newHistSolidSize}
                      onChange={(e) => setNewHistSolidSize(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">备注说明 (选填)</label>
                    <input
                      type="text"
                      placeholder="如: 2024体检初查"
                      value={newHistNote}
                      onChange={(e) => setNewHistNote(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddHistoryRecord}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    + 加入时序随访列表
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Pathology High-Risk Red/Green Factors & Ki-67 (Placed right after CT for clinical coherence) */}
          {(parsedData.reportType === 'pathology' || parsedData.reportType === 'comprehensive' || parsedData.surgeryType !== 'unknown') && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-600" />
                  <span>术后高危病理特征 (红绿灯指标)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">决定辅助治疗与复发风险分层</span>
              </div>
              
              {/* Symmetrical 3-Column Grid: 6 Core Pathology Indicators (2 rows x 3 cols = exactly 6) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                {/* 1. Margin Status */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">切缘状态 (Margin)</div>
                    <div className="text-[11px] text-slate-400">手术残留排查</div>
                  </div>
                  <div className="flex gap-1.5 h-[34px]">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, marginStatus: "negative", margin: "negative" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.marginStatus === "positive" || parsedData.margin === "positive"
                          ? "bg-rose-500 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (有残留)
                    </button>
                  </div>
                </div>

                {/* 2. Lymph Node N-Stage */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">淋巴结分期 (N)</div>
                    <div className="text-[11px] text-slate-400">纵隔/肺门淋巴</div>
                  </div>
                  <div className="flex gap-1.5 h-[34px]">
                    {(["N0", "N1", "N2"] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setParsedData({ ...parsedData, nStage: n, lymphNodes: n })}
                        className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">胸膜侵犯 (VPI)</div>
                    <div className="text-[11px] text-slate-400">脏层胸膜 PL1/2</div>
                  </div>
                  <div className="flex gap-1.5 h-[34px]">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, vpi: "negative" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.vpi !== "positive" ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (PL0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, vpi: "positive" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.vpi === "positive" ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (PL1/2)
                    </button>
                  </div>
                </div>

                {/* 4. STAS */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">气道播散 (STAS)</div>
                    <div className="text-[11px] text-slate-400">气腔微小巢漂移</div>
                  </div>
                  <div className="flex gap-1.5 h-[34px]">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, stas: "negative" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.stas !== "positive" ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (未见)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, stas: "positive" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.stas === "positive" ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (见播散)
                    </button>
                  </div>
                </div>

                {/* 5. LVI */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">脉管癌栓 (LVI)</div>
                    <div className="text-[11px] text-slate-400">微血管/淋巴管</div>
                  </div>
                  <div className="flex gap-1.5 h-[34px]">
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, lvi: "negative" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.lvi !== "positive" ? "bg-emerald-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阴性 (无栓)
                    </button>
                    <button
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, lvi: "positive" })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        parsedData.lvi === "positive" ? "bg-rose-500 text-white shadow-2xs" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      阳性 (有栓)
                    </button>
                  </div>
                </div>

                {/* 6. IASLC Histological Grade */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800">IASLC 病理分级</div>
                    <div className="text-[11px] text-slate-400">高级别成分占比</div>
                  </div>
                  <div className="flex gap-1.5 h-[34px]">
                    {[
                      { val: "1", label: "G1(高分化)" },
                      { val: "2", label: "G2(中分化)" },
                      { val: "3", label: "G3(高级别)" }
                    ].map(({ val, label }) => {
                      const currentGrade = String(parsedData.iaslcGrade || parsedData.grade || "2");
                      const isSelected = currentGrade === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setParsedData({ ...parsedData, grade: val, iaslcGrade: val })}
                          className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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

              {/* Dedicated Full-Width Card: Ki-67 Proliferation Index (%) [Optional IHC Banner] */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-purple-600" />
                      <span>Ki-67 细胞增殖指数</span>
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                      免疫组化 IHC 选填
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    反映细胞分裂增殖转速。若病理报告未包含免疫组化可留空，绝非复发转移概率
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:max-w-xs w-full">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={parsedData.ki67 !== undefined && parsedData.ki67 !== null ? String(parsedData.ki67).replace(/%/g, "") : ""}
                      onChange={e => setParsedData({ ...parsedData, ki67: e.target.value })}
                      placeholder="如 5 或 15"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-purple-400"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold pointer-events-none">%</span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex gap-1">
                    {[
                      { val: "5", label: "≤5% 惰性" },
                      { val: "15", label: "15% 常规" },
                      { val: "30", label: ">30% 活跃" }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setParsedData({ ...parsedData, ki67: preset.val })}
                        className={`px-2 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                          String(parsedData.ki67).replace(/%/g, "") === preset.val
                            ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Section 4: Systemic Staging & M0 Confirmation Matrix (Strict 3-Column Symmetrical Grid: 5 Organs + 1 Benign Findings) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-teal-50/70 border-2 border-indigo-200/80 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-700" />
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
                <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full shadow-2xs flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>全身排查阴性 · 确立 M0 根治窗口</span>
                </span>
              )}
            </div>

            {/* Symmetrical 3-Column Grid (2 rows x 3 cols = exactly 6 cards): No wrapping, No truncation! */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              
              {/* 1. Brain MRI */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-slate-600" />
                    <span>脑部增强 MRI</span>
                  </span>
                  <span className="text-[11px] text-slate-400">排除中枢脑转移</span>
                </div>
                <div className="flex gap-1.5 h-[34px]">
                  {[
                    { val: "negative", label: "未见异常(M0)" },
                    { val: "positive", label: "提示可疑" },
                    { val: "not_performed", label: "未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, brainMri: opt.val })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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

              {/* 2. Abdominal Ultrasound / CT */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                    <span>腹部与肾上腺超声</span>
                  </span>
                  <span className="text-[11px] text-slate-400">排除肝/肾上腺</span>
                </div>
                <div className="flex gap-1.5 h-[34px]">
                  {[
                    { val: "negative", label: "未见异常(M0)" },
                    { val: "positive", label: "提示可疑" },
                    { val: "not_performed", label: "未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, abdominalUltrasound: opt.val })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
                        (parsedData.abdominalUltrasound === "negative" || parsedData.abdominalUltrasound === "benign_findings" ? "negative" : (parsedData.abdominalUltrasound || "not_performed")) === opt.val
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

              {/* 3. Bone Scan ECT */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-slate-600" />
                    <span>全身骨显像 ECT</span>
                  </span>
                  <span className="text-[11px] text-slate-400">排除骨代谢破坏</span>
                </div>
                <div className="flex gap-1.5 h-[34px]">
                  {[
                    { val: "negative", label: "未见异常(M0)" },
                    { val: "positive", label: "提示可疑" },
                    { val: "not_performed", label: "未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, boneScan: opt.val })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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

              {/* 4. Neck / Supraclavicular Lymph Nodes */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                    <span>锁骨上淋巴结B超</span>
                  </span>
                  <span className="text-[11px] text-slate-400">排除 N3 远处淋巴</span>
                </div>
                <div className="flex gap-1.5 h-[34px]">
                  {[
                    { val: "negative", label: "未见肿大(N0)" },
                    { val: "positive", label: "提示肿大" },
                    { val: "not_performed", label: "未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, neckLymphNodes: opt.val })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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

              {/* 5. Whole Body PET-CT */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Scan className="w-3.5 h-3.5 text-slate-600" />
                    <span>全身 PET-CT</span>
                  </span>
                  <span className="text-[11px] text-slate-400">全身代谢一站式</span>
                </div>
                <div className="flex gap-1.5 h-[34px]">
                  {[
                    { val: "negative", label: "无浓聚(M0)" },
                    { val: "positive", label: "见高代谢" },
                    { val: "not_performed", label: "未检查" }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setParsedData({ ...parsedData, petCt: opt.val })}
                      className={`flex-1 text-xs rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center ${
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

              {/* 6. Benign Findings Management Card (Symmetrically Completes the 3x2 Grid!) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between h-[96px] shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>伴发良性发现</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">非肿瘤转移</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 flex gap-1 overflow-x-auto py-0.5 no-scrollbar">
                    {(parsedData.benignFindings || ["肝囊肿", "钙化点"]).map((item: string) => (
                      <span key={item} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-medium shrink-0">
                        <span>{item}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveBenignFinding(item)}
                          className="text-emerald-400 hover:text-emerald-700 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <input 
                      type="text" 
                      value={newBenignInput}
                      onChange={e => setNewBenignInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddBenignFinding()}
                      placeholder="如：息肉"
                      className="w-16 px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] outline-none focus:bg-white focus:border-blue-400"
                    />
                    <button 
                      type="button" 
                      onClick={handleAddBenignFinding}
                      className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section: Blood Tumor Markers (P2-2) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <TestTube2 className="w-3.5 h-3.5 text-indigo-700" />
                <span>血液肿瘤标志物 (选填 · 结合影像综合排雷)</span>
              </div>
              <span className="text-[11px] text-indigo-700">正常范围内波动属生理正常代谢</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CEA 癌胚抗原 (ng/mL，参考 0~5.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 2.5"
                  value={parsedData.tumorMarkers?.cea ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        cea: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CYFRA21-1 (ng/mL，参考 0~3.3)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 1.8"
                  value={parsedData.tumorMarkers?.cyfra211 ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        cyfra211: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  NSE (ng/mL，参考 0~16.3)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 11.2"
                  value={parsedData.tumorMarkers?.nse ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        nse: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  SCC 鳞癌抗原 (ng/mL，参考 0~1.5)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 0.8"
                  value={parsedData.tumorMarkers?.scc ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        scc: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ProGRP 胃泌素释放肽前体 (pg/mL，参考 0~65.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 35.0"
                  value={parsedData.tumorMarkers?.proGrp ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        proGrp: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CA125 糖类抗原 (U/mL，参考 0~35.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 15.6"
                  value={parsedData.tumorMarkers?.ca125 ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        ca125: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CA19-9 糖类抗原 (U/mL，参考 0~27.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 18.2"
                  value={parsedData.tumorMarkers?.ca199 ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        ca199: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CA15-3 糖类抗原 (U/mL，参考 0~25.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 11.4"
                  value={parsedData.tumorMarkers?.ca153 ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        ca153: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ferritin 铁蛋白 (ng/mL，参考 20~300.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如: 145.0"
                  value={parsedData.tumorMarkers?.ferritin ?? ""}
                  onChange={(e) =>
                    setParsedData({
                      ...parsedData,
                      tumorMarkers: {
                        ...(parsedData.tumorMarkers || {}),
                        ferritin: e.target.value ? parseFloat(e.target.value) : null
                      }
                    })
                  }
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                setParsedData(null);
              }
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {onCancel ? "取消并返回看板" : "返回重新识别"}
          </button>
          <button 
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            {initialData ? "保存修改并同步档案" : "确认无误，保存医疗档案"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-8 border border-slate-200 shadow-sm max-w-3xl mx-auto w-full">
      {onCancel && (
        <div className="mb-5 pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200"
          >
            <span>‹ 取消并返回我的档案看板</span>
          </button>
          {existingProfile && (
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
              增量融合模式 · 不抹除已有记录
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3.5 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-100 flex-shrink-0">
          <Sparkles className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI 医疗报告多模态智能提取</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">上传或拍照一份或多份报告，AI 自动提取关键指标并校准分期</p>
        </div>
      </div>

      {/* Supported Modality Strip (Clean & Compact) */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600 bg-slate-50/80 p-2.5 px-3 rounded-2xl border border-slate-200/80 mb-5">
        <span className="font-bold text-slate-700 text-[11px] mr-0.5">支持类型：</span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1">
          <Scan className="w-3 h-3 text-sky-600" />
          <span>薄层 CT</span>
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1">
          <Microscope className="w-3 h-3 text-purple-600" />
          <span>术后病理 / IHC</span>
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1">
          <BrainCircuit className="w-3 h-3 text-indigo-600" />
          <span>脑部增强 MRI</span>
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1">
          <Stethoscope className="w-3 h-3 text-teal-600" />
          <span>腹部与浅表超声</span>
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1">
          <Activity className="w-3 h-3 text-amber-600" />
          <span>骨显像 ECT</span>
        </span>
        <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px] flex items-center gap-1">
          <Scan className="w-3 h-3 text-blue-600" />
          <span>全身 PET-CT</span>
        </span>
      </div>

      <div className="space-y-4">
        {/* Multi-Image Upload & Preview Area */}
        <div className="space-y-3">
          {images.length > 0 ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>已添加 {images.length} 张报告图片</span>
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
                      <X className="w-3.5 h-3.5" />
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
                  <span className="text-xl text-blue-600 mb-0.5">+</span>
                  <span className="text-xs font-bold text-slate-600">继续添加图片</span>
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
              <div className="text-center py-3 pointer-events-none flex flex-col items-center">
                <Camera className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-sm font-bold text-slate-700">点击拍照或从相册选择报告（支持一次多选）</div>
                <div className="text-xs text-slate-400 mt-1">支持同时选择多张不同报告，AI 自动跨模态联合提取</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs text-slate-400 font-medium">或者直接粘贴报告文本</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div>
          <textarea
            rows={5}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="在此粘贴检查报告诊断结论...（系统已启用 PIPL 隐私脱敏，姓名与身份证号将自动掩码）"
            className="w-full p-4 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono"
            disabled={isParsing}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
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
              <Sparkles className="w-4 h-4 text-white" />
              <span>开始 AI 跨模态智能提取</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
