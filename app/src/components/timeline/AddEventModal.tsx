"use client";

import { useState } from "react";
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
  Eye
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

  const [category, setCategory] = useState<TimelineCategory>(initialEvent?.category || "imaging");
  const [eventDate, setEventDate] = useState(
    initialEvent?.eventDate || new Date().toISOString().split("T")[0]
  );
  const [hospital, setHospital] = useState(initialEvent?.hospital || "");
  const [title, setTitle] = useState(initialEvent?.title || "");
  const [summary, setSummary] = useState(initialEvent?.summary || "");
  
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
    if (!isEditMode && !title) {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !eventDate) {
      setError("请填写检查标题和检查日期");
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative z-10 animate-fade-in-up text-slate-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isEditMode ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
            }`}>
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditMode ? "编辑检查报告 / 诊疗事件" : "录入检查报告 / 诊疗事件"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Category Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">检查与事件类别</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIMELINE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategoryChange(cat.key)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    category === cat.key
                      ? `${cat.lightBg} ring-2 ring-blue-500 font-extrabold shadow-2xs`
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  <TimelineCategoryIcon category={cat.key} className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Hospital */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">检查/就诊日期 *</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">就诊/检查医院</label>
              <input
                type="text"
                placeholder="例如：北京协和医院 / 上海市胸科医院"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">报告/事件标题 *</label>
            <input
              type="text"
              required
              placeholder="例如：薄层胸部增强 CT / 术后大体病理"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-bold"
            />
          </div>

          {/* Category-specific fields */}
          {category === "imaging" && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-blue-600" />
                <span>影像学指标提取</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">病灶长径 (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="例如 8.5 (0 代表术后完全切除)"
                    value={sizeMm}
                    onChange={(e) => setSizeMm(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">实性成分比 (CTR %)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="例如 35 (代表 35%)"
                    value={ctr}
                    onChange={(e) => setCtr(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {category === "serology" && (
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <TestTube2 className="w-3.5 h-3.5 text-rose-600" />
                <span>肿瘤标志物指标 (选填已测项目)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">CEA (ng/mL, &lt;5.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 2.1"
                    value={cea}
                    onChange={(e) => setCea(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">CYFRA21-1 (ng/mL, &lt;3.3)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 1.4"
                    value={cyfra211}
                    onChange={(e) => setCyfra211(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">NSE (ng/mL, &lt;16.3)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 10.5"
                    value={nse}
                    onChange={(e) => setNse(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">SCC (ng/mL, &lt;1.5)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 0.8"
                    value={scc}
                    onChange={(e) => setScc(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">CA125 (U/mL, &lt;35.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 14.2"
                    value={ca125}
                    onChange={(e) => setCa125(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">CA19-9 (U/mL, &lt;27.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 16.0"
                    value={ca199}
                    onChange={(e) => setCa199(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">CA15-3 (U/mL, &lt;25.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 11.0"
                    value={ca153}
                    onChange={(e) => setCa153(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">ProGRP (pg/mL, &lt;65.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 32.0"
                    value={proGrp}
                    onChange={(e) => setProGrp(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-600 mb-0.5">铁蛋白 (ng/mL, &lt;300)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="如 120.0"
                    value={ferritin}
                    onChange={(e) => setFerritin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {category === "pathology" && (
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5 text-purple-600" />
                <span>病理与基因指标</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">病理组织学结论</label>
                  <input
                    type="text"
                    placeholder="例如 微浸润腺癌 (MIA) / 浸润性腺癌"
                    value={histology}
                    onChange={(e) => setHistology(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">分期 (AJCC 9th)</label>
                  <input
                    type="text"
                    placeholder="例如 IA1 (pT1aN0M0)"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">驱动基因突变 (NGS)</label>
                  <input
                    type="text"
                    placeholder="例如 EGFR 19del (82%) / 无突变"
                    value={driverGene}
                    onChange={(e) => setDriverGene(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">手术切除方式</label>
                  <input
                    type="text"
                    placeholder="例如 胸腔镜左肺上叶前段切除术 (VATS)"
                    value={surgeryType}
                    onChange={(e) => setSurgeryType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {category === "milestone" && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-3">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                <span>治疗与手术里程碑</span>
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">手术方式 / 治疗方案</label>
                <input
                  type="text"
                  placeholder="例如 单孔胸腔镜解剖性肺段切除术 (R0根治切除)"
                  value={surgeryType}
                  onChange={(e) => setSurgeryType(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Risk Level Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">临床风险评级</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRiskStatus("normal")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  riskStatus === "normal"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>稳定安全</span>
              </button>
              <button
                type="button"
                onClick={() => setRiskStatus("watch")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  riskStatus === "watch"
                    ? "bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-amber-600" />
                <span>随访观察</span>
              </button>
              <button
                type="button"
                onClick={() => setRiskStatus("warning")}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  riskStatus === "warning"
                    ? "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-400"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>手术/警示</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">一句话循证破译结论</label>
            <textarea
              rows={3}
              placeholder="请输入报告的主要结论或关键描述..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">自定义标签 (逗号分隔)</label>
            <input
              type="text"
              placeholder="例如：右肺上叶, 磨玻璃, 较前稳定"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? "正在保存..." : isEditMode ? "保存修改" : "确认归档至生命线"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

