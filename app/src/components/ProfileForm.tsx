"use client";

import { useState } from "react";
import { Check, ClipboardList, Microscope, Scan, AlertTriangle } from "lucide-react";
import type { PatientProfile } from "@/lib/types";

interface ProfileFormProps {
  onSubmit: (profile: PatientProfile) => void;
  initialData?: PatientProfile;
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
    histology: [{ type: "papillary" }, { type: "acinar" }],
  });

  const totalSteps = 3;

  const updateForm = (key: keyof PatientProfile, value: PatientProfile[keyof PatientProfile]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    return true;
  };

  const handleSubmit = () => {
    const profile: PatientProfile = {
      age: form.age || 50,
      gender: form.gender || "female",
      stage: form.stage || "IA1",
      tumorSize: (form.tumorSize || 15) / 10,
      solidSize: (form.solidSize || 6) / 10,
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
    <div className="max-w-2xl mx-auto px-2.5 sm:px-6">
      {/* Progress */}
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-text-secondary text-sm">步骤 {step} / {totalSteps}</span>
          <span className="text-text-muted text-xs hidden sm:inline">
            {step === 1 ? "你的基本情况" : step === 2 ? "医生告诉你的" : "CT报告上的"}
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
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                i + 1 < step
                  ? "bg-accent-teal text-white"
                  : i + 1 === step
                  ? "bg-accent-blue text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {i + 1 < step ? <Check className="w-4 h-4 text-white" /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={`h-px w-12 mx-1 ${i + 1 < step ? "bg-accent-teal" : "bg-border-color"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-sm border border-slate-200">
        {step === 1 && <Step1 form={form} updateForm={updateForm} />}
        {step === 2 && <Step2 form={form} updateForm={updateForm} />}
        {step === 3 && <Step3 form={form} updateForm={updateForm} />}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              id="form-back-btn"
              className="btn-secondary px-6 py-3 rounded-lg font-medium flex-1 cursor-pointer"
            >
              上一步
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              id={`form-next-step-${step}`}
              className={`px-6 py-3 rounded-lg font-medium flex-1 transition-all ${
                canProceed() ? "btn-primary cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed()}
              id="form-submit-btn"
              className={`px-6 py-3 rounded-lg font-medium flex-1 flex items-center justify-center gap-2 transition-all ${
                canProceed() ? "btn-primary cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
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
      <p className="mt-6 text-center text-text-muted text-xs leading-relaxed max-w-md mx-auto flex items-center justify-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>本分析仅供教育参考，不构成医疗建议。所有结论均来自已发表的医学研究。请咨询您的主治医生做出医疗决策。</span>
      </p>
    </div>
  );
}

// ======= Step Components =======

function Step1({ form, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <span>你的基本情况</span>
        </h2>
        <p className="text-text-secondary text-sm">这些信息帮助系统在已发表的研究中找到与你情况相似的患者群体</p>
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
            className="input-artifact w-full px-4 py-3 rounded-lg"
          />
        </FormField>
        <FormField label="性别">
          <div className="flex gap-2">
            {(["female", "male"] as const).map((g) => (
              <button
                key={g}
                id={`gender-${g}`}
                onClick={() => updateForm("gender", g)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  form.gender === g
                    ? "bg-blue-50 border border-blue-500 text-blue-600"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {g === "female" ? "女性" : "男性"}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <FormField label="手术类型" tooltip="不同手术方式对预后的影响已有大量研究。切除范围越小，手术风险越低，但需达到安全切除的标准">
        <select
          id="input-surgery-type"
          value={form.surgeryType || ""}
          onChange={(e) => updateForm("surgeryType", e.target.value as PatientProfile["surgeryType"])}
          className="input-artifact w-full px-4 py-3 rounded-lg"
        >
          <option value="lobectomy">肺叶切除（切除整个肺叶）</option>
          <option value="segmentectomy">肺段切除（切除一个或多个肺段）</option>
          <option value="wedge">楚形切除（切除局部小块肺组织）</option>
          <option value="unknown">不确定 / 尚未手术</option>
        </select>
      </FormField>

      <FormField label="淋巴结状态" tooltip="手术中所清扫的淋巴结。N0表示没有淋巴结转移，是最理想的结果。这个数据在你的手术活检报告中可以找到">
        <div className="flex gap-2">
          {(["N0", "N1", "N2"] as const).map((n) => (
            <button
              key={n}
              id={`lymph-${n}`}
              onClick={() => updateForm("lymphNodes", n)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                form.lymphNodes === n
                  ? "bg-blue-50 border border-blue-500 text-blue-600"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {n}
              <div className="text-xs mt-0.5 opacity-70">
                {n === "N0" ? "无转移" : n === "N1" ? "同侧淋巴结" : "纵隔淋巴结"}
              </div>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="手术切缘情况" tooltip="手术后切缘是否有癌细胞残留。阴性（R0）表示切除干净，是我们期望的结果。如果你的报告中没有相关记录，选“阴性”">
        <div className="flex gap-2">
          {(["negative", "positive"] as const).map((m) => (
            <button
              key={m}
              id={`margin-${m}`}
              onClick={() => updateForm("margin", m)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                form.margin === m
                  ? m === "negative"
                    ? "bg-green-50 border border-green-500 text-green-600"
                    : "bg-red-50 border border-red-500 text-red-600"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              切缘{m === "negative" ? "阴性（切干净 R0）" : "阳性（有癌细胞残留）"}
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
    const exists = current.some((h: any) => h.type === val);
    if (exists) {
      updateForm("histology", current.filter((h: any) => h.type !== val));
    } else {
      updateForm("histology", [...current, { type: val }]);
    }
  };

  const updateHistologyPercentage = (val: string, percentage: string) => {
    const current = form.histology || [];
    const num = parseInt(percentage);
    const validNum = isNaN(num) ? undefined : num;
    updateForm("histology", current.map((h: any) => h.type === val ? { ...h, percentage: validNum } : h));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-1 flex items-center gap-2">
          <Microscope className="w-5 h-5 text-blue-600" />
          <span>医生告诉你的</span>
        </h2>
        <p className="text-text-secondary text-sm">这些来自手术后病理报告，不记得的项目可以选“未知”</p>
      </div>

      <FormField label="TNM 分期" tooltip="分期是医生评估肿瘤进展的方式。其中 Tis (原位癌) 和 MIA (微浸润) 属于极早期，IA1是最早期浸润癌，数字越大表示进展越晚。在病理报告第一页一般可以找到">
        <div className="grid grid-cols-4 gap-2">
          {["Tis", "MIA", "IA1", "IA2", "IA3", "IB", "IIA", "IIB"].map((s) => (
            <button
              key={s}
              id={`stage-${s}`}
              onClick={() => updateForm("stage", s)}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                form.stage === s
                  ? "bg-blue-50 border border-blue-500 text-blue-600"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FormField>

      <FormField
        label="STAS — 气道播散"
        tooltip="STAS 是较新的病理指标。表示癌细胞是否沿小气管扩散到主肿瘤之外的肖泡中。如果 STAS 阳性，复发风险会增加，这个指标在病理报告中应该有明确描述">
        <ThreeWayToggle
          id="stas"
          value={form.stas || "unknown"}
          onChange={(v) => updateForm("stas", v as PatientProfile["stas"])}
          labels={["阴性", "阳性", "未知"]}
          values={["negative", "positive", "unknown"]}
          colors={["green", "red", "gray"]}
        />
      </FormField>

      <FormField label="LVI — 淋巴血管侵犯" tooltip="LVI表示癌细胞是否侵入小血管或淋巴管（就像进入了身体的运输通道）。阳性表示远处转移风险增加。在病理报告中应该有描述">
        <ThreeWayToggle
          id="lvi"
          value={form.lvi || "unknown"}
          onChange={(v) => updateForm("lvi", v as PatientProfile["lvi"])}
          labels={["阴性", "阳性", "未知"]}
          values={["negative", "positive", "unknown"]}
          colors={["green", "red", "gray"]}
        />
      </FormField>

      <FormField label="VPI — 脏层胸膜侵犯" tooltip="VPI表示癌细胞是否林穿脏层胸膜（包裹山的一层薄膜）。VPI阳性会将 T 分期提高，影响分期判断。在病理报告中应有记录">
        <ThreeWayToggle
          id="vpi"
          value={form.vpi || "unknown"}
          onChange={(v) => updateForm("vpi", v as PatientProfile["vpi"])}
          labels={["阴性", "阳性", "未知"]}
          values={["negative", "positive", "unknown"]}
          colors={["green", "red", "gray"]}
        />
      </FormField>

      <FormField label="IASLC 病理分级" tooltip="这是 IASLC（国际肺癌研究学会）提出的分级系统，将癌细胞的“恶性程度”分为 1-3 级。Grade 1 最温和，Grade 3 相对侵进。在病理报告的“组织学”部分应该有记载">
        <div className="flex gap-2">
          {(["1", "2", "3", "unknown"] as const).map((g) => (
            <button
              key={g}
              id={`grade-${g}`}
              onClick={() => updateForm("iaslcGrade", g)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                form.iaslcGrade === g
                  ? "bg-accent-blue/20 border border-accent-blue text-accent-blue"
                  : "bg-white shadow-sm border border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {g === "unknown" ? "未知" : `Grade ${g}`}
              <div className="text-xs mt-0.5 opacity-70">
                {g === "1" ? "高分化" : g === "2" ? "中分化" : g === "3" ? "低分化" : ""}
              </div>
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="病理亚型（可多选）" tooltip="如果病理报告中写了各亚型的百分比，可以在选中后填写。如果没有写，留空即可。微乳头型和实体型属于容易复发的不良亚型">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(pathologyOptions).map(([val, label]) => {
            const histItem = (form.histology || []).find((h: any) => h.type === val);
            const isSelected = !!histItem;
            return (
              <div
                key={val}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? "bg-teal-50 border border-teal-500 text-teal-600"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <button
                  id={`histology-${val}`}
                  onClick={() => toggleHistology(val)}
                  className="flex-1 text-sm text-left py-1 cursor-pointer outline-none"
                >
                  {label}
                </button>
                {isSelected && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={histItem.percentage === undefined ? "" : histItem.percentage}
                      onChange={(e) => updateHistologyPercentage(val, e.target.value)}
                      placeholder="选填"
                      className="w-[52px] h-7 bg-white border border-gray-300 rounded text-center text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-accent-teal/70">%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FormField>

      <FormField label="EGFR 基因突变" tooltip="EGFR是一种基因。如果突变，则可以使用“靶向药”（如奄沙替尼）等口服药。中国肺癌患者阳性率约40–60%。在基因检测报告或就诊评估中可以找到">
        <div className="flex gap-2">
          {(["positive", "negative", "not_tested", "unknown"] as const).map((e) => (
            <button
              key={e}
              id={`egfr-${e}`}
              onClick={() => updateForm("egfr", e)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                form.egfr === e
                  ? "bg-blue-50 border border-blue-500 text-blue-600"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {e === "positive" ? "阳性（有突变）" : e === "negative" ? "阴性（无突变）" : e === "not_tested" ? "未检测" : "未知"}
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
        <h2 className="text-xl font-semibold text-text-primary mb-1 flex items-center gap-2">
          <Scan className="w-5 h-5 text-teal-600" />
          <span>CT 报告上的</span>
        </h2>
        <p className="text-text-secondary text-sm">这些数据在放射科报告中可以找到，对于精准评估复发风险至关重要</p>
      </div>

      <FormField label="结节形态">
        <div className="flex gap-2">
          {(["pure_ggo", "mixed_ggo", "pure_solid"] as const).map((m) => (
            <button
              key={m}
              id={`morphology-${m}`}
              onClick={() => updateForm("morphology", m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                form.morphology === m
                  ? "bg-blue-50 border border-blue-500 text-blue-600"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {m === "pure_ggo" ? "纯磨玻璃" : m === "mixed_ggo" ? "混合磨玻璃" : "纯实性"}
            </button>
          ))}
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="CT 磨玻璃最大径（mm）">
          <input
            id="input-tumor-size"
            type="number"
            step="1"
            min="1"
            max="150"
            value={form.tumorSize !== undefined && form.tumorSize !== null ? form.tumorSize : ""}
            onChange={(e) => {
              const str = e.target.value;
              const v = str === "" ? 0 : parseFloat(str);
              updateForm("tumorSize", isNaN(v) ? 0 : v);
              if (form.solidSize && v > 0) {
                updateForm("ctr", Math.round((form.solidSize / v) * 100) / 100);
              }
            }}
            placeholder="例如：20"
            className="input-artifact w-full px-4 py-3 rounded-lg"
          />
        </FormField>
        <FormField label="CT 实性成分最大径（mm）">
          <input
            id="input-solid-size"
            type="number"
            step="1"
            min="0"
            max="150"
            value={form.solidSize !== undefined && form.solidSize !== null ? form.solidSize : ""}
            onChange={(e) => {
              const str = e.target.value;
              const v = str === "" ? 0 : parseFloat(str);
              updateForm("solidSize", isNaN(v) ? 0 : v);
              if (form.tumorSize && form.tumorSize > 0) {
                updateForm("ctr", Math.round((v / form.tumorSize) * 100) / 100);
              }
            }}
            placeholder="例如：8"
            className="input-artifact w-full px-4 py-3 rounded-lg"
          />
        </FormField>
      </div>

      {/* CTR Display */}
      {form.tumorSize && form.solidSize && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary text-sm">
              CTR（实性成分比例 = 实性成分最大径 ÷ 磨玻璃最大径）
            </span>
          <div className="text-2xl font-bold text-gray-900">{computedCTR}</div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${computedCTR * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>纯GGO (0)</span>
            <span>
              {computedCTR <= 0.25
                ? "极低风险"
                : computedCTR <= 0.5
                ? "低风险"
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
          className="input-artifact w-full px-4 py-3 rounded-lg resize-none"
        />
      </FormField>

      {/* Summary preview */}
      <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
        <h4 className="text-teal-800 text-sm font-bold mb-3 flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4 text-teal-700" />
          <span>信息摘要预览</span>
        </h4>
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
    green: "bg-green-50 border-green-500 text-green-600",
    red: "bg-red-50 border-red-500 text-red-600",
    gray: "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
  };

  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <button
          key={v}
          id={`${id}-${v}`}
          onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
            value === v
              ? colorClasses[colors[i]]
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
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
    <div className="flex justify-between items-center py-1 border-b border-gray-200">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  );
}
