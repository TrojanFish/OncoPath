"use client";

import { useState } from "react";
import type { PatientProfile } from "@/lib/types";

interface ProfileFormProps {
  onSubmit: (profile: PatientProfile) => void;
}

export default function ProfileForm({ onSubmit }: ProfileFormProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Partial<PatientProfile>>({
    gender: "female",
    stage: "IA1",
    morphology: "mixed_ggo",
    stas: "negative",
    lvi: "negative",
    vpi: "negative",
    iaslcGrade: "2",
    egfr: "unknown",
    lymphNodes: "N0",
    margin: "negative",
    surgeryType: "lobectomy",
    histology: ["papillary", "acinar"],
  });

  const totalSteps = 3;

  const updateForm = (key: keyof PatientProfile, value: PatientProfile[keyof PatientProfile]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const profile: PatientProfile = {
      age: form.age || 50,
      gender: form.gender || "female",
      stage: form.stage || "IA1",
      tumorSize: form.tumorSize || 1.5,
      solidSize: form.solidSize || 0.6,
      ctr: form.ctr || (form.solidSize && form.tumorSize ? form.solidSize / form.tumorSize : 0.4),
      morphology: form.morphology || "mixed_ggo",
      stas: form.stas || "unknown",
      lvi: form.lvi || "unknown",
      vpi: form.vpi || "unknown",
      iaslcGrade: form.iaslcGrade || "unknown",
      histology: form.histology || [],
      egfr: form.egfr || "unknown",
      lymphNodes: form.lymphNodes || "N0",
      margin: form.margin || "negative",
      surgeryType: form.surgeryType || "unknown",
      notes: form.notes,
    };
    onSubmit(profile);
  };

  return (
    <div className="max-w-2xl mx-auto px-6">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">步骤 {step} / {totalSteps}</span>
          <span className="text-text-muted text-xs">
            {step === 1 ? "基本信息" : step === 2 ? "病理报告" : "CT影像"}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                i + 1 < step
                  ? "bg-accent-teal text-white"
                  : i + 1 === step
                  ? "bg-accent-blue text-white"
                  : "glass text-text-muted border border-white/10"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`h-px w-12 mx-1 ${i + 1 < step ? "bg-accent-teal" : "bg-border-color"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="glass rounded-2xl p-8 border border-border-color">
        {step === 1 && <Step1 form={form} updateForm={updateForm} />}
        {step === 2 && <Step2 form={form} updateForm={updateForm} />}
        {step === 3 && <Step3 form={form} updateForm={updateForm} />}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              id="form-back-btn"
              className="btn-secondary px-6 py-3 rounded-xl font-medium flex-1 cursor-pointer"
            >
              上一步
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              id={`form-next-step-${step}`}
              className="btn-primary px-6 py-3 rounded-xl font-medium flex-1 cursor-pointer"
            >
              下一步 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              id="form-submit-btn"
              className="btn-primary px-6 py-3 rounded-xl font-medium flex-1 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              生成循证报告
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-6 text-center text-text-muted text-xs leading-relaxed max-w-md mx-auto">
        ⚠️ 本分析仅供教育参考，不构成医疗建议。所有结论均来自已发表的医学研究。请咨询您的主治医生做出医疗决策。
      </p>
    </div>
  );
}

// ======= Step Components =======

function Step1({ form, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">基本信息</h2>
        <p className="text-text-secondary text-sm">填写基本的患者信息，用于匹配相关研究人群</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="年龄">
          <input
            id="input-age"
            type="number"
            min={18}
            max={100}
            value={form.age || ""}
            onChange={(e) => updateForm("age", parseInt(e.target.value))}
            placeholder="例如：45"
            className="input-dark w-full px-4 py-3 rounded-xl"
          />
        </FormField>
        <FormField label="性别">
          <div className="flex gap-2">
            {(["female", "male"] as const).map((g) => (
              <button
                key={g}
                id={`gender-${g}`}
                onClick={() => updateForm("gender", g)}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  form.gender === g
                    ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                    : "glass border border-white/10 text-text-muted hover:border-white/20"
                }`}
              >
                {g === "female" ? "👩 女性" : "👨 男性"}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <FormField label="手术类型">
        <select
          id="input-surgery-type"
          value={form.surgeryType || ""}
          onChange={(e) => updateForm("surgeryType", e.target.value as PatientProfile["surgeryType"])}
          className="input-dark w-full px-4 py-3 rounded-xl"
        >
          <option value="lobectomy">肺叶切除</option>
          <option value="segmentectomy">肺段切除</option>
          <option value="wedge">楔形切除</option>
          <option value="unknown">未知</option>
        </select>
      </FormField>

      <FormField label="手术后淋巴结状态">
        <div className="flex gap-2">
          {(["N0", "N1", "N2"] as const).map((n) => (
            <button
              key={n}
              id={`lymph-${n}`}
              onClick={() => updateForm("lymphNodes", n)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                form.lymphNodes === n
                  ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              {n}
              <div className="text-xs mt-0.5 opacity-70">
                {n === "N0" ? "无转移" : n === "N1" ? "同侧" : "纵隔"}
              </div>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="切缘状态">
        <div className="flex gap-2">
          {(["negative", "positive"] as const).map((m) => (
            <button
              key={m}
              id={`margin-${m}`}
              onClick={() => updateForm("margin", m)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                form.margin === m
                  ? m === "negative"
                    ? "bg-green-500/20 border border-green-500 text-green-400"
                    : "bg-red-500/20 border border-red-500 text-red-400"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              切缘{m === "negative" ? "阴性" : "阳性"}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function Step2({ form, updateForm }: StepProps) {
  const pathologyOptions: Record<string, string> = {
    lepidic: "贴壁型（Lepidic）",
    acinar: "腺泡型（Acinar）",
    papillary: "乳头型（Papillary）",
    micropapillary: "微乳头型（Micropapillary）",
    solid: "实体型（Solid）",
    mucinous: "黏液型（Mucinous）",
  };

  const toggleHistology = (val: string) => {
    const current = form.histology || [];
    if (current.includes(val)) {
      updateForm("histology", current.filter((h) => h !== val));
    } else {
      updateForm("histology", [...current, val]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">病理报告</h2>
        <p className="text-text-secondary text-sm">输入病理报告中的关键指标，越详细匹配越准确</p>
      </div>

      <FormField label="TNM 分期">
        <div className="grid grid-cols-3 gap-2">
          {["IA1", "IA2", "IA3", "IB", "IIA", "IIB"].map((s) => (
            <button
              key={s}
              id={`stage-${s}`}
              onClick={() => updateForm("stage", s)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                form.stage === s
                  ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="STAS（气道播散）"
        tooltip="肿瘤细胞通过气道播散，重要预后指标"
      >
        <ThreeWayToggle
          id="stas"
          value={form.stas || "unknown"}
          onChange={(v) => updateForm("stas", v as PatientProfile["stas"])}
          labels={["阴性", "阳性", "未知"]}
          values={["negative", "positive", "unknown"]}
          colors={["green", "red", "gray"]}
        />
      </FormField>

      <FormField label="LVI（淋巴血管侵犯）" tooltip="肿瘤细胞侵入淋巴管或血管">
        <ThreeWayToggle
          id="lvi"
          value={form.lvi || "unknown"}
          onChange={(v) => updateForm("lvi", v as PatientProfile["lvi"])}
          labels={["阴性", "阳性", "未知"]}
          values={["negative", "positive", "unknown"]}
          colors={["green", "red", "gray"]}
        />
      </FormField>

      <FormField label="VPI（脏层胸膜侵犯）" tooltip="肿瘤侵犯脏层胸膜，影响T分期">
        <ThreeWayToggle
          id="vpi"
          value={form.vpi || "unknown"}
          onChange={(v) => updateForm("vpi", v as PatientProfile["vpi"])}
          labels={["阴性", "阳性", "未知"]}
          values={["negative", "positive", "unknown"]}
          colors={["green", "red", "gray"]}
        />
      </FormField>

      <FormField label="IASLC 病理分级">
        <div className="flex gap-2">
          {(["1", "2", "3", "unknown"] as const).map((g) => (
            <button
              key={g}
              id={`grade-${g}`}
              onClick={() => updateForm("iaslcGrade", g)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                form.iaslcGrade === g
                  ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              {g === "unknown" ? "未知" : `Grade ${g}`}
              <div className="text-xs mt-0.5 opacity-70">
                {g === "1" ? "低级别" : g === "2" ? "中级别" : g === "3" ? "高级别" : ""}
              </div>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="病理亚型（可多选）">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(pathologyOptions).map(([val, label]) => (
            <button
              key={val}
              id={`histology-${val}`}
              onClick={() => toggleHistology(val)}
              className={`py-2.5 px-3 rounded-xl text-sm text-left transition-all cursor-pointer ${
                (form.histology || []).includes(val)
                  ? "bg-accent-teal/20 border border-accent-teal text-accent-teal"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="EGFR 基因突变">
        <div className="flex gap-2">
          {(["positive", "negative", "not_tested", "unknown"] as const).map((e) => (
            <button
              key={e}
              id={`egfr-${e}`}
              onClick={() => updateForm("egfr", e)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                form.egfr === e
                  ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              {e === "positive" ? "阳性" : e === "negative" ? "阴性" : e === "not_tested" ? "未检测" : "未知"}
            </button>
          ))}
        </div>
      </FormField>
    </div>
  );
}

function Step3({ form, updateForm }: StepProps) {
  const computedCTR =
    form.tumorSize && form.solidSize
      ? Math.round((form.solidSize / form.tumorSize) * 100) / 100
      : form.ctr || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">CT 影像信息</h2>
        <p className="text-text-secondary text-sm">输入 CT 报告中的结节测量数据</p>
      </div>

      <FormField label="结节形态">
        <div className="flex gap-2">
          {(["pure_ggo", "mixed_ggo", "pure_solid"] as const).map((m) => (
            <button
              key={m}
              id={`morphology-${m}`}
              onClick={() => updateForm("morphology", m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                form.morphology === m
                  ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                  : "glass border border-white/10 text-text-muted hover:border-white/20"
              }`}
            >
              {m === "pure_ggo" ? "纯磨玻璃" : m === "mixed_ggo" ? "混合磨玻璃" : "纯实性"}
            </button>
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="肿瘤总大小（cm）">
          <input
            id="input-tumor-size"
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={form.tumorSize || ""}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              updateForm("tumorSize", v);
              if (form.solidSize) {
                updateForm("ctr", Math.round((form.solidSize / v) * 100) / 100);
              }
            }}
            placeholder="例如：2.0"
            className="input-dark w-full px-4 py-3 rounded-xl"
          />
        </FormField>
        <FormField label="实性成分大小（cm）">
          <input
            id="input-solid-size"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={form.solidSize || ""}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              updateForm("solidSize", v);
              if (form.tumorSize) {
                updateForm("ctr", Math.round((v / form.tumorSize) * 100) / 100);
              }
            }}
            placeholder="例如：0.8"
            className="input-dark w-full px-4 py-3 rounded-xl"
          />
        </FormField>
      </div>

      {/* CTR Display */}
      {form.tumorSize && form.solidSize && (
        <div className="glass rounded-xl p-4 border border-accent-blue/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-sm">计算得出 CTR（实性成分比例）</span>
            <span className="text-2xl font-bold text-gradient">{computedCTR}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${computedCTR * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>纯GGO (0)</span>
            <span>
              {computedCTR <= 0.25
                ? "极低风险 ✓"
                : computedCTR <= 0.5
                ? "低风险 ✓"
                : computedCTR <= 0.75
                ? "中等风险"
                : "较高风险"}
            </span>
            <span>纯实性 (1.0)</span>
          </div>
        </div>
      )}

      <FormField label="备注（可选）" tooltip="其他需要说明的病理或临床信息">
        <textarea
          id="input-notes"
          rows={3}
          value={form.notes || ""}
          onChange={(e) => updateForm("notes", e.target.value)}
          placeholder="例如：ki-67 15%，第一秒用力呼气量正常范围..."
          className="input-dark w-full px-4 py-3 rounded-xl resize-none"
        />
      </FormField>

      {/* Summary preview */}
      <div className="glass rounded-xl p-4 border border-accent-teal/20">
        <h4 className="text-accent-teal text-sm font-medium mb-3">📋 信息摘要预览</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <SummaryItem label="分期" value={form.stage || "—"} />
          <SummaryItem label="形态" value={form.morphology === "pure_ggo" ? "纯GGO" : form.morphology === "mixed_ggo" ? "混合GGO" : "纯实性"} />
          <SummaryItem label="CTR" value={computedCTR ? String(computedCTR) : "—"} />
          <SummaryItem label="STAS" value={form.stas === "negative" ? "阴性" : form.stas === "positive" ? "阳性" : "未知"} />
          <SummaryItem label="LVI" value={form.lvi === "negative" ? "阴性" : form.lvi === "positive" ? "阳性" : "未知"} />
          <SummaryItem label="淋巴结" value={form.lymphNodes || "—"} />
        </div>
      </div>
    </div>
  );
}

// ====== Helper Components ======

interface StepProps {
  form: Partial<PatientProfile>;
  updateForm: (key: keyof PatientProfile, value: PatientProfile[keyof PatientProfile]) => void;
}

function FormField({ label, children, tooltip }: { label: string; children: React.ReactNode; tooltip?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-2">
        <label className="text-text-secondary text-sm font-medium">{label}</label>
        {tooltip && (
          <span
            className="text-text-muted text-xs cursor-help tooltip"
            data-tooltip={tooltip}
          >
            ⓘ
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function ThreeWayToggle({
  id, value, onChange, labels, values, colors
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  labels: string[];
  values: string[];
  colors: ("green" | "red" | "gray")[];
}) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-500/20 border-green-500 text-green-400",
    red: "bg-red-500/20 border-red-500 text-red-400",
    gray: "bg-white/5 border-white/20 text-text-muted",
  };

  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <button
          key={v}
          id={`${id}-${v}`}
          onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer border ${
            value === v
              ? colorClasses[colors[i]]
              : "glass border-white/10 text-text-muted hover:border-white/20"
          }`}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}
