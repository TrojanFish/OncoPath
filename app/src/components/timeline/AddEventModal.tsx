"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  X, 
  AlertTriangle, 
  Scan, 
  TestTube2, 
  Microscope, 
  HeartPulse, 
  Building2,
  Edit3,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Check,
  ChevronRight,
  Sparkles,
  Layers
} from "lucide-react";
import { TimelineCategory, TimelineEventItem, TIMELINE_CATEGORIES } from "@/lib/timelineTypes";
import TimelineCategoryIcon from "./TimelineCategoryIcon";

interface AddEventModalProps {
  onClose: () => void;
  onAdd?: (event: Partial<TimelineEventItem>) => Promise<void>;
  onUpdate?: (event: TimelineEventItem) => Promise<void>;
  initialEvent?: TimelineEventItem;
}

export default function AddEventModal({ onClose, onAdd, onUpdate, initialEvent }: AddEventModalProps) {
  const isEditMode = Boolean(initialEvent);

  // Support Esc key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Base info
  const [category, setCategory] = useState<TimelineCategory>(initialEvent?.category || "imaging");
  const [eventDate, setEventDate] = useState(
    initialEvent?.eventDate || new Date().toISOString().split("T")[0]
  );
  const [hospital, setHospital] = useState(initialEvent?.hospital || "");
  const [title, setTitle] = useState(initialEvent?.title || "");
  
  // Step 2: Category Quantitative Metrics
  // Imaging fields
  const [sizeMm, setSizeMm] = useState<string>(
    initialEvent?.keyFindings?.sizeMm != null ? String(initialEvent.keyFindings.sizeMm) : ""
  );
  const [ctr, setCtr] = useState<string>(
    initialEvent?.keyFindings?.ctr != null
      ? String(initialEvent.keyFindings.ctr > 1 ? initialEvent.keyFindings.ctr : Math.round(initialEvent.keyFindings.ctr * 100))
      : ""
  );

  // Serology fields (9 markers)
  const [cea, setCea] = useState<string>(
    initialEvent?.keyFindings?.cea != null ? String(initialEvent.keyFindings.cea) : ""
  );
  const [cyfra211, setCyfra211] = useState<string>(
    initialEvent?.keyFindings?.cyfra211 != null ? String(initialEvent.keyFindings.cyfra211) : ""
  );
  const [nse, setNse] = useState<string>(
    initialEvent?.keyFindings?.nse != null ? String(initialEvent.keyFindings.nse) : ""
  );
  const [scc, setScc] = useState<string>(
    initialEvent?.keyFindings?.scc != null ? String(initialEvent.keyFindings.scc) : ""
  );
  const [proGrp, setProGrp] = useState<string>(
    initialEvent?.keyFindings?.proGrp != null ? String(initialEvent.keyFindings.proGrp) : ""
  );
  const [ca125, setCa125] = useState<string>(
    initialEvent?.keyFindings?.ca125 != null ? String(initialEvent.keyFindings.ca125) : ""
  );
  const [ca199, setCa199] = useState<string>(
    initialEvent?.keyFindings?.ca199 != null ? String(initialEvent.keyFindings.ca199) : ""
  );
  const [ca153, setCa153] = useState<string>(
    initialEvent?.keyFindings?.ca153 != null ? String(initialEvent.keyFindings.ca153) : ""
  );
  const [ferritin, setFerritin] = useState<string>(
    initialEvent?.keyFindings?.ferritin != null ? String(initialEvent.keyFindings.ferritin) : ""
  );

  // Pathology & Surgery fields
  const [histology, setHistology] = useState(initialEvent?.keyFindings?.histology || "");
  const [stage, setStage] = useState(initialEvent?.keyFindings?.stage || "");
  const [driverGene, setDriverGene] = useState(initialEvent?.keyFindings?.driverGene || "");
  const [surgeryType, setSurgeryType] = useState(initialEvent?.keyFindings?.surgeryType || "");
  
  // Step 3: Risk & Summary
  const [summary, setSummary] = useState(initialEvent?.summary || "");
  const [tagsInput, setTagsInput] = useState(
    initialEvent?.tags ? initialEvent.tags.join(", ") : ""
  );
  const [riskStatus, setRiskStatus] = useState<"normal" | "watch" | "warning">(
    initialEvent?.riskStatus || "normal"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryChange = (cat: TimelineCategory) => {
    setCategory(cat);
    if (!isEditMode && (!title || title.includes("CT") || title.includes("病理") || title.includes("标志物") || title.includes("切除"))) {
      if (cat === "imaging") {
        setTitle("胸部薄层高分辨 CT 平扫");
        setRiskStatus("watch");
      } else if (cat === "pathology") {
        setTitle("手术切除标本石蜡病理检查");
        setRiskStatus("normal");
      } else if (cat === "serology") {
        setTitle("血清肺癌肿瘤标志物检测报告");
        setRiskStatus("normal");
      } else if (cat === "milestone") {
        setTitle("胸腔镜微创肺段切除术 (VATS)");
        setRiskStatus("normal");
      }
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!title.trim() || !eventDate) {
        setError("请填写检查标题和检查日期");
        return;
      }
    }
    setError("");
    setCurrentStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
  };

  const handlePrevStep = () => {
    setError("");
    setCurrentStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setError("请填写检查标题和检查日期");
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const keyFindings: any = { ...(initialEvent?.keyFindings || {}) };
      if (sizeMm !== "") keyFindings.sizeMm = parseFloat(sizeMm);
      if (ctr !== "") keyFindings.ctr = parseFloat(ctr) > 1 ? parseFloat(ctr) / 100 : parseFloat(ctr);
      if (cea !== "") keyFindings.cea = parseFloat(cea);
      if (cyfra211 !== "") keyFindings.cyfra211 = parseFloat(cyfra211);
      if (nse !== "") keyFindings.nse = parseFloat(nse);
      if (scc !== "") keyFindings.scc = parseFloat(scc);
      if (proGrp !== "") keyFindings.proGrp = parseFloat(proGrp);
      if (ca125 !== "") keyFindings.ca125 = parseFloat(ca125);
      if (ca199 !== "") keyFindings.ca199 = parseFloat(ca199);
      if (ca153 !== "") keyFindings.ca153 = parseFloat(ca153);
      if (ferritin !== "") keyFindings.ferritin = parseFloat(ferritin);

      if (histology) keyFindings.histology = histology.trim();
      if (stage) keyFindings.stage = stage.trim();
      if (driverGene) keyFindings.driverGene = driverGene.trim();
      if (surgeryType) keyFindings.surgeryType = surgeryType.trim();

      const tags = tagsInput
        .split(/[,，\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const eventPayload = {
        eventDate,
        category,
        subType: category === "imaging" ? "CT" : category === "pathology" ? "Pathology" : category === "serology" ? "TumorMarkers" : "Surgery",
        hospital: hospital.trim() || "未记录医院",
        title: title.trim(),
        summary: summary.trim() || "记录已归档至时间生命线",
        keyFindings,
        tags: tags.length > 0 ? tags : [title.trim().substring(0, 8)],
        riskStatus,
      };

      if (isEditMode && initialEvent) {
        if (onUpdate) {
          await onUpdate({
            ...initialEvent,
            ...eventPayload,
          });
        }
      } else {
        if (onAdd) {
          await onAdd(eventPayload);
        }
      }

      onClose();
    } catch (err: any) {
      setError(err.message || "保存事件失败，请检查数据");
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryObj = TIMELINE_CATEGORIES.find(c => c.key === category) || TIMELINE_CATEGORIES[0];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto"
    >
      {/* Modal Card (3-Tier Window Architecture) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-3xl border border-slate-200 shadow-2xl relative z-10 animate-fade-in-up text-slate-900 max-h-[92vh] flex flex-col my-auto overflow-hidden"
      >
        {/* 1. Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
              isEditMode ? "bg-purple-50 text-purple-600 border border-purple-100" : "bg-blue-50 text-blue-600 border border-blue-100"
            }`}>
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                {isEditMode ? "编辑检查报告 / 诊疗事件" : "录入检查报告 / 诊疗事件"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                3步向导式智能归档 · 自动同步至垂直时序生命线与名医问诊清单
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label="关闭窗口"
            title="关闭窗口"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. 3-Step Wizard Navigation Stepper */}
        <div className="px-5 sm:px-6 pt-3 pb-2 bg-slate-50/80 border-b border-slate-200/80 shrink-0">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { step: 1, title: "1. 类别与基本信息", desc: currentCategoryObj.label },
              { step: 2, title: "2. 核心量化指标", desc: category === "imaging" ? "长径 & CTR" : category === "serology" ? "9大肿瘤标志物" : category === "pathology" ? "病理与基因" : "手术方案" },
              { step: 3, title: "3. 风险定级与备忘", desc: riskStatus === "normal" ? "稳定安全" : riskStatus === "watch" ? "随访观察" : "警示关注" },
            ].map((item) => {
              const isActive = currentStep === item.step;
              const isDone = currentStep > item.step;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    if (item.step === 1 || (item.step === 2 && title.trim() && eventDate) || (item.step === 3 && title.trim() && eventDate)) {
                      setCurrentStep(item.step as 1 | 2 | 3);
                    }
                  }}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between min-w-0 overflow-hidden ${
                    isActive
                      ? "bg-white text-blue-950 font-bold shadow-xs border border-blue-300 ring-2 ring-blue-400/20"
                      : isDone
                      ? "bg-blue-50/60 text-blue-900 border border-blue-200/60"
                      : "bg-transparent text-slate-400 hover:bg-slate-100/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between min-w-0 w-full">
                    <span className="font-bold text-[11px] sm:text-xs truncate">
                      {item.title}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {item.step}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5 w-full">
                    {item.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-1.5 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 3. Form Body (Segmented Views) */}
        <form id="add-event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          
          {/* STEP 1: Basic Information & Category */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. 选择检查与就医事件类别：
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIMELINE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategoryChange(cat.key)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        category === cat.key
                          ? `${cat.lightBg} ring-2 ring-blue-500 font-extrabold shadow-xs border-blue-300 text-blue-950`
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <TimelineCategoryIcon category={cat.key} className="w-5 h-5" />
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Hospital */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. 检查 / 就诊日期 *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. 就诊 / 检查医院
                  </label>
                  <input
                    type="text"
                    placeholder="例如：北京协和医院 / 上海胸科医院"
                    value={hospital}
                    onChange={(e) => setHospital(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. 报告 / 事件标题 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：薄层胸部高分辨 CT 平扫 / 手术切除病理"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>

              {/* Step 1 Quick Guide Box */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>智能分流指引：</strong> 下一步将根据您选定的 <strong>[{currentCategoryObj.label}]</strong> 自动展开专属指标量化录入卡片。
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Category Quantitative Metrics */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Category 1: Imaging (CT / MRI) */}
              {category === "imaging" && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-blue-200/70 pb-2">
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <Scan className="w-4 h-4 text-blue-600" />
                      <span>🩻 影像学病灶精细指标 (CT / MRI)</span>
                    </div>
                    <span className="text-[10px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full font-bold">
                      薄层高分辨参数
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        病灶最大长径 (mm)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="例如 8.5 (0 代表已切除)"
                        value={sizeMm}
                        onChange={(e) => setSizeMm(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        用于自动生成病灶倍增时间 (VDT) 动力学
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        实性成分比 (CTR %)
                      </label>
                      <input
                        type="number"
                        step="1"
                        placeholder="例如 35 (代表 35%)"
                        value={ctr}
                        onChange={(e) => setCtr(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        CTR &le; 50% 提示惰性微浸润腺癌 (MIA)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Category 2: Serology (9 Tumor Markers) */}
              {category === "serology" && (
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-rose-200/70 pb-2">
                    <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <TestTube2 className="w-4 h-4 text-rose-600" />
                      <span>🧪 血清肺癌肿瘤标志物 9 项量化指标</span>
                    </div>
                    <span className="text-[10px] text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full font-bold">
                      选填已检测项目
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { key: "cea", label: "CEA 癌胚抗原", ref: "<5.0 ng/mL", val: cea, setVal: setCea, placeholder: "如 2.1" },
                      { key: "cyfra211", label: "CYFRA21-1", ref: "<3.3 ng/mL", val: cyfra211, setVal: setCyfra211, placeholder: "如 1.4" },
                      { key: "nse", label: "NSE 神经元特异", ref: "<16.3 ng/mL", val: nse, setVal: setNse, placeholder: "如 10.5" },
                      { key: "scc", label: "SCC 鳞癌抗原", ref: "<1.5 ng/mL", val: scc, setVal: setScc, placeholder: "如 0.8" },
                      { key: "ca125", label: "CA125 糖类抗原", ref: "<35.0 U/mL", val: ca125, setVal: setCa125, placeholder: "如 14.2" },
                      { key: "ca199", label: "CA19-9 消化系统", ref: "<27.0 U/mL", val: ca199, setVal: setCa199, placeholder: "如 16.0" },
                      { key: "ca153", label: "CA15-3 糖类抗原", ref: "<25.0 U/mL", val: ca153, setVal: setCa153, placeholder: "如 11.0" },
                      { key: "proGrp", label: "ProGRP 胃泌素", ref: "<65.0 pg/mL", val: proGrp, setVal: setProGrp, placeholder: "如 32.0" },
                      { key: "ferritin", label: "血清铁蛋白", ref: "<300 ng/mL", val: ferritin, setVal: setFerritin, placeholder: "如 120.0" },
                    ].map((m) => (
                      <div key={m.key} className="bg-white p-2.5 rounded-xl border border-rose-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-slate-800">{m.label}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{m.ref}</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={m.placeholder}
                          value={m.val}
                          onChange={(e) => m.setVal(e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: Pathology */}
              {category === "pathology" && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-purple-200/70 pb-2">
                    <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <Microscope className="w-4 h-4 text-purple-600" />
                      <span>🔬 组织病理学与 NGS 分子基因指标</span>
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full font-bold">
                      金标准依据
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">病理组织学结论</label>
                      <input
                        type="text"
                        placeholder="例如：微浸润腺癌 (MIA) / 浸润性腺癌"
                        value={histology}
                        onChange={(e) => setHistology(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 font-semibold focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">AJCC 9th 分期</label>
                      <input
                        type="text"
                        placeholder="例如：IA1 (pT1aN0M0)"
                        value={stage}
                        onChange={(e) => setStage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">驱动基因突变 (NGS)</label>
                      <input
                        type="text"
                        placeholder="例如：EGFR 19del (82%) / ALK融合 / 无突变"
                        value={driverGene}
                        onChange={(e) => setDriverGene(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono text-slate-900 focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">微创手术切除方式</label>
                      <input
                        type="text"
                        placeholder="例如：单孔胸腔镜右肺上叶前段切除术 (VATS)"
                        value={surgeryType}
                        onChange={(e) => setSurgeryType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Category 4: Milestones / Surgery */}
              {category === "milestone" && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span>❤️ 治疗方案与重大手术里程碑</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-bold">
                      生命线里程碑
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">手术方式 / 关键治疗方案</label>
                    <input
                      type="text"
                      placeholder="例如：单孔胸腔镜解剖性肺段切除术 (R0 根治切除) / 口服奥希替尼辅助治疗"
                      value={surgeryType}
                      onChange={(e) => setSurgeryType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Risk Level, Summary & Tags */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Risk Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. 本次检查临床风险自评定级：
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRiskStatus("normal")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      riskStatus === "normal"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-400/30 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>🟢 稳定安全</span>
                    <span className="text-[10px] text-emerald-700 font-normal">指标完全正常</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskStatus("watch")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      riskStatus === "watch"
                        ? "bg-amber-50 text-amber-900 border-amber-400 ring-2 ring-amber-400/30 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Eye className="w-4 h-4 text-amber-600" />
                    <span>🟡 随访观察</span>
                    <span className="text-[10px] text-amber-700 font-normal">需定期复查对比</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRiskStatus("warning")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      riskStatus === "warning"
                        ? "bg-rose-50 text-rose-900 border-rose-400 ring-2 ring-rose-400/30 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>🔴 手术/警示</span>
                    <span className="text-[10px] text-rose-700 font-normal">需名医面诊评估</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. 一句话循证结论 / 医生叮嘱便签
                </label>
                <textarea
                  rows={3}
                  placeholder="例如：右肺上叶结节较半年前无明显变化，未见新发实性成分，医生建议半年后常规复查..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  3. 快速检索便签 / 标签 (逗号分隔)
                </label>
                <input
                  type="text"
                  placeholder="例如：右肺上叶, 磨玻璃, 较前稳定"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}
        </form>

        {/* 4. Sticky Footer Actions (100% Solid White, Stable Geometry) */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 rounded-b-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.05)]">
          {/* Left: Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            取消
          </button>

          {/* Right: Stepper Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                currentStep === 1
                  ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
              }`}
            >
              ‹ 上一步
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 sm:px-5 py-2 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                下一步 ({currentStep + 1}/3) ›
              </button>
            ) : (
              <button
                type="submit"
                form="add-event-form"
                disabled={loading}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5 active:scale-95 transition-all text-white whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>正在归档...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isEditMode ? "保存修改" : "确认归档至生命线"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

