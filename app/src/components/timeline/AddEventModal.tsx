"use client";

import { useState } from "react";
import { TimelineCategory, TimelineEventItem, TIMELINE_CATEGORIES } from "@/lib/timelineTypes";

interface AddEventModalProps {
  onClose: () => void;
  onAdd: (event: Partial<TimelineEventItem>) => Promise<void>;
}

export default function AddEventModal({ onClose, onAdd }: AddEventModalProps) {
  const [category, setCategory] = useState<TimelineCategory>("imaging");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [hospital, setHospital] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [sizeMm, setSizeMm] = useState<string>("");
  const [ctr, setCtr] = useState<string>("");
  const [cea, setCea] = useState<string>("");
  const [cyfra211, setCyfra211] = useState<string>("");
  const [histology, setHistology] = useState("");
  const [stage, setStage] = useState("");
  const [driverGene, setDriverGene] = useState("");
  const [surgeryType, setSurgeryType] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [riskStatus, setRiskStatus] = useState<"normal" | "watch" | "warning">("normal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCategoryChange = (cat: TimelineCategory) => {
    setCategory(cat);
    if (cat === "imaging") {
      setTitle("胸部薄层高分辨 CT 平扫");
      setRiskStatus("watch");
    } else if (cat === "pathology") {
      setTitle("手术切除标本石蜡病理检查");
      setRiskStatus("normal");
    } else if (cat === "serology") {
      setTitle("血清肺癌肿瘤标志物五项全套");
      setRiskStatus("normal");
    } else if (cat === "milestone") {
      setTitle("胸腔镜微创肺段切除术 (VATS)");
      setRiskStatus("normal");
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
      const keyFindings: any = {};
      if (sizeMm) keyFindings.sizeMm = parseFloat(sizeMm);
      if (ctr) keyFindings.ctr = parseFloat(ctr) > 1 ? parseFloat(ctr) / 100 : parseFloat(ctr);
      if (cea) keyFindings.cea = parseFloat(cea);
      if (cyfra211) keyFindings.cyfra211 = parseFloat(cyfra211);
      if (histology) keyFindings.histology = histology.trim();
      if (stage) keyFindings.stage = stage.trim();
      if (driverGene) keyFindings.driverGene = driverGene.trim();
      if (surgeryType) keyFindings.surgeryType = surgeryType.trim();

      const tags = tagsInput
        .split(/[,，\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      await onAdd({
        eventDate,
        category,
        subType: category === "imaging" ? "CT" : category === "pathology" ? "Pathology" : category === "serology" ? "TumorMarkers" : "Surgery",
        hospital: hospital.trim() || "未记录医院",
        title: title.trim(),
        summary: summary.trim() || "记录已归档至时间生命线",
        keyFindings,
        tags: tags.length > 0 ? tags : [title.trim().substring(0, 8)],
        riskStatus,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "添加事件失败，请检查数据");
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
            <span className="text-xl">📅</span>
            <h3 className="text-lg font-bold text-slate-900">录入检查报告 / 诊疗事件</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
            ⚠️ {error}
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
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    category === cat.key
                      ? `${cat.lightBg} ring-2 ring-blue-500 font-extrabold shadow-2xs`
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
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
              <div className="text-xs font-bold text-blue-900">🩻 影像学指标提取</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">病灶长径 (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="例如 8.5"
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
              <div className="text-xs font-bold text-rose-900">🩸 肿瘤标志物指标</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">CEA 癌胚抗原 (ng/mL)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="例如 1.8 (正常<5.0)"
                    value={cea}
                    onChange={(e) => setCea(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">CYFRA21-1 (ng/mL)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="例如 1.4 (正常<3.3)"
                    value={cyfra211}
                    onChange={(e) => setCyfra211(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {category === "pathology" && (
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
              <div className="text-xs font-bold text-purple-900">🔬 病理与基因指标</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">病理组织学结论</label>
                  <input
                    type="text"
                    placeholder="例如 微浸润腺癌 (MIA)"
                    value={histology}
                    onChange={(e) => setHistology(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">基因突变位点 (NGS)</label>
                  <input
                    type="text"
                    placeholder="例如 EGFR 19del"
                    value={driverGene}
                    onChange={(e) => setDriverGene(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

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
              {loading ? "正在保存..." : "确认归档至生命线"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
