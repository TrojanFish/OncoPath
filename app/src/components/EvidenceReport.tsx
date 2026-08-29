import { useEffect, useState, useMemo } from "react";
import {
  User,
  BrainCircuit,
  AlertTriangle,
  BookOpen,
  Bot,
  BarChart2,
  Microscope,
  Calendar,
  ShieldCheck,
  Pill,
  Search,
  Network,
  Info,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { PatientProfile } from "@/lib/types";
import { analyzePatientProfile, EVIDENCE_FACTORS, FEATURED_STUDIES, STUDY_TYPE_LABELS, type PatientMatchResult } from "@/lib/evidence-data";
import { generateReport } from "@/lib/api";
import StudyCard from "./StudyCard";
import KnowledgeMapPreview from "./KnowledgeMapPreview";
import { ReportSkeleton } from "@/components/common/MedicalSkeleton";
import SpeechReaderButton from "@/components/common/SpeechReaderButton";
import EvidenceInspectorDrawer from "@/components/common/EvidenceInspectorDrawer";
import MobileStickyActionBar from "@/components/common/MobileStickyActionBar";
import ClinicalBadge from "@/components/common/ClinicalBadge";
import { showToast } from "@/components/common/Toast";

interface EvidenceReportProps {
  profile: PatientProfile;
  onBack?: () => void;
  onEditProfile?: () => void;
  reportJson?: any;
  initialReportJson?: any;
}

export default function EvidenceReport({
  profile,
  onBack,
  onEditProfile,
  reportJson,
  initialReportJson,
}: EvidenceReportProps) {
  const handleBack = onBack || onEditProfile || (() => {});
  const effectiveReportJson = initialReportJson || reportJson || null;

  const result = useMemo(() => analyzePatientProfile({
      stage: profile.stage || "IA1",
      ctr: profile.ctr ?? 0.53,
      stas: profile.stas || "negative",
      lvi: profile.lvi || "negative",
      vpi: profile.vpi || "negative",
      iaslcGrade: (profile.iaslcGrade || profile.grade || "2") as any,
      histology: profile.histology || [],
      egfr: (profile.egfr || "unknown") as any,
      lymphNodes: (profile.lymphNodes || profile.nStage || "N0") as any,
  }), [profile]);

  const [loading, setLoading] = useState(!effectiveReportJson);
  const [activeTab, setActiveTab] = useState<"overview" | "factors" | "studies" | "followup">("overview");
  const [showGraphOverlay, setShowGraphOverlay] = useState(false);
  const [inspectingStudy, setInspectingStudy] = useState<any | null>(null);

  const [llmReport, setLlmReport] = useState<any>(effectiveReportJson);

  useEffect(() => {
    // If we already have the report (e.g. from Dashboard history), don't fetch it again
    if (initialReportJson) {
      setLoading(false);
      return;
    }

    // Fire the real LLM API call for the dynamic text
    generateReport(profile)
      .then(res => {
        setLlmReport(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("LLM Generation failed:", err);
        setLlmReport({
          risk_level: "Error",
          evidence_summary: "系统未能成功调用大语言模型。这可能是因为尚未配置真实有效的 API_KEY，或网络超时。" + err.message,
          recommendations: ["请检查您的 .env 环境变量", "确保网络可连接至 OpenAI"]
        });
        setLoading(false);
      });
  }, [profile]);

  // Support Esc key to dismiss graph overlay
  useEffect(() => {
    if (!showGraphOverlay) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowGraphOverlay(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showGraphOverlay]);

  if (loading) return <ReportSkeleton />;
  if (!result) return null;

  const riskColorMap: Record<string, string> = {
    very_low: "text-accent-teal",
    low: "text-accent-green",
    moderate: "text-accent-amber",
    high: "text-accent-red",
  };

  const riskBgMap: Record<string, string> = {
    very_low: "risk-badge-very-low",
    low: "risk-badge-low",
    moderate: "risk-badge-moderate",
    high: "risk-badge-high",
  };

  const hasHighRiskFactor = profile.stas === "positive" || profile.vpi === "positive" || profile.lvi === "positive" || profile.iaslcGrade === "3";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Knowledge Graph Overlay */}
      {showGraphOverlay && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex flex-col p-3 sm:p-6 md:p-8 animate-fade-in overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowGraphOverlay(false); }}
        >
          {/* Overlay Header */}
          <div className="bg-white border-b border-slate-200 rounded-t-3xl px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 w-full max-w-6xl mx-auto mt-2">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-slate-900 font-extrabold text-sm md:text-base">专属路径图谱</span>
              <span className="text-slate-500 text-xs md:text-sm hidden sm:inline">— 根据您的病理特征高亮显示</span>
            </div>
            <button
              type="button"
              onClick={() => setShowGraphOverlay(false)}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="关闭窗口"
              title="关闭窗口"
            >
              <span className="text-lg leading-none">✕</span>
            </button>
          </div>
          {/* Overlay Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 bg-slate-900/90 rounded-b-3xl max-w-6xl mx-auto w-full border-x border-b border-slate-800">
            <div className="max-w-6xl mx-auto pt-4">
              <KnowledgeMapPreview profile={profile} />
            </div>
          </div>
          {/* Bottom hint */}
          <div className="flex-shrink-0 px-6 py-3 text-center">
            <span className="text-slate-400 text-xs">点击连线可查看文献依据 · 点击背景或按 Esc 键关闭</span>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            id="report-back-btn"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>返回修改</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-900 font-bold text-xs sm:text-sm">循证分析决策报告</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Knowledge Graph shortcut */}
            <button
              id="report-graph-btn"
              onClick={() => setShowGraphOverlay(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all cursor-pointer"
              title="查看专属路径图谱"
            >
              <Network className="w-3.5 h-3.5" />
              <span>4D图谱</span>
            </button>
            <button
              id="report-share-btn"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: "OncoPath 循证分析报告", url });
                } else {
                  navigator.clipboard.writeText(url).then(() => showToast("✓ 报告链接已复制，可分享给家属或医生", "success"));
                }
              }}
              className="btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1"
            >
              <span>分享</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 py-6 space-y-6">
        {/* Tier 1: 情绪安抚与正向定性结论卡 (Psychological De-escalation Box) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200 shadow-sm space-y-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                      患者病理循证评估与生存获益解析
                    </h1>
                    <p className="text-xs text-slate-500 font-mono">
                      {profile.stage}期 · {profile.morphology === "mixed_ggo" ? "混合磨玻璃 mGGO" : profile.morphology === "pure_ggo" ? "纯磨玻璃 pGGO" : "实性结节"} · CTR {profile.ctr}
                    </p>
                  </div>
                </div>
                {/* 智能语音播报入口 */}
                <SpeechReaderButton
                  text={`病理分期评估结果：${profile.stage || "IA"}期，${llmReport?.evidence_summary || result.summaryZh}`}
                  label="语音播报结论"
                />
              </div>
              
              {/* 白话安心总结 */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 relative space-y-2.5">
                <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                  <BrainCircuit className="w-4 h-4 text-sky-600" />
                  <span>智能循证临床综合解读</span>
                </div>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {llmReport?.evidence_summary || result.summaryZh}
                </p>
              </div>
            </div>

            {/* 风险评级指示 */}
            <div className="md:w-52 flex-shrink-0 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                综合风险分层
              </span>
              <span className={`text-3xl sm:text-4xl font-extrabold ${riskColorMap[result.riskLevel]} mb-1.5`}>
                {result.riskLabel}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${riskBgMap[result.riskLevel]} mb-2`}>
                {result.riskPercentile}
              </span>
              <span className="text-2xs text-slate-400">
                匹配已收录 {result.matchedStudies.length} 项前沿文献队列
              </span>
            </div>
          </div>

          {/* Tier 2: 四维核心数据指标 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100">
            <StatBlock
              label="5年无病生存率 (DFS)"
              value={`${Math.round(result.rfs5yrRange[0] * 100)}–${Math.round(result.rfs5yrRange[1] * 100)}%`}
              sub="基于同病理队列群体统计"
              color="teal"
            />
            <StatBlock
              label="真实世界同类队列"
              value={`${result.similarPatientCount.toLocaleString()}+`}
              sub="例国际顶刊追踪样本"
              color="blue"
            />
            <StatBlock
              label="匹配前沿循证研究"
              value={`${result.matchedStudies.length} 篇`}
              sub="Lancet / JTO / JCO 来源"
              color="purple"
            />
          </div>

          {/* 伴随式就诊行动锦囊 (Contextual Action Kit on High Risk factor) */}
          {hasHighRiskFactor && (
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1 flex-1">
                <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                  💡 伴随式就诊建议与行动指引
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  您的病理报告中包含微转移或侵犯倾向特征（如 STAS/VPI/微乳头成分）。国际多中心研究证实，通过规范化术后辅助治疗或紧密随访，可大幅降低复发风险。建议在复诊时与主治医生进一步确认个性化随访与辅助治疗方案。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 声明卡片 */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-4 sm:p-5 space-y-2 text-xs text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>医学循证与学术透明度说明</span>
          </div>
          <p className="leading-relaxed">
            本报告所有数据均提取自 PubMed、Lancet Oncology、JTO 等国际顶级同行评审期刊。生存率数据反映历史大型研究队列统计学规律，不代表患者个体确切预后。请与您的主治医师共同制定个性化方案。
          </p>
        </div>

        {/* Tier 3: Tabs 详细证据与随访规划 */}
        <div className="flex gap-1.5 bg-white shadow-2xs rounded-2xl p-1.5 border border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {(["overview", "factors", "studies", "followup"] as const).map((tab) => (
            <button
              key={tab}
              id={`report-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale(0.98) ${
                activeTab === tab
                  ? "btn-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {tab === "overview" && <BarChart2 className="w-4 h-4" />}
              {tab === "factors" && <Microscope className="w-4 h-4" />}
              {tab === "studies" && <BookOpen className="w-4 h-4" />}
              {tab === "followup" && <Calendar className="w-4 h-4" />}
              <span>{tab === "overview" ? "风险概览" : tab === "factors" ? "病理因果" : tab === "studies" ? "匹配研究" : "随访建议"}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab result={result} profile={profile} riskColorMap={riskColorMap} />}
        {activeTab === "factors" && <FactorsTab result={result} onInspectStudy={(study) => setInspectingStudy(study)} />}
        {activeTab === "studies" && <StudiesTab result={result} onInspectStudy={(study) => setInspectingStudy(study)} />}
        {activeTab === "followup" && <FollowupTab result={result} profile={profile} />}
      </div>

      {/* 证据检视抽屉 */}
      <EvidenceInspectorDrawer
        isOpen={!!inspectingStudy}
        onClose={() => setInspectingStudy(null)}
        study={inspectingStudy}
      />

      {/* 移动端吸底操作栏 */}
      <MobileStickyActionBar />
    </div>
  );
}

// ========== Tab Components ==========

function OverviewTab({ result, profile, riskColorMap }: { result: PatientMatchResult; profile: PatientProfile; riskColorMap: Record<string, string> }) {
  const [animatedRfs, setAnimatedRfs] = useState(0);

  useEffect(() => {
    const target = (result.rfs5yrRange[0] + result.rfs5yrRange[1]) / 2;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setAnimatedRfs(current);
      if (current >= target) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* RFS Visual */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-text-secondary text-sm mb-4">5年无复发生存率（RFS）范围</h3>
          <div className="text-4xl font-black text-gray-900 font-bold mb-2">
            {Math.round(result.rfs5yrRange[0] * 100)}–{Math.round(result.rfs5yrRange[1] * 100)}%
          </div>
          <p className="text-text-muted text-xs mb-4">
            基于 {result.matchedStudies.length} 项研究的汇总数据
          </p>
          <div className="progress-bar mb-1">
            <div
              className="progress-fill transition-all duration-1000"
              style={{ width: `${animatedRfs * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-text-secondary text-sm mb-4">病理特征雷达图</h3>
          <RadarChart profile={profile} result={result} />
        </div>
      </div>

      {/* Factor Summary */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-white/5">
        <h3 className="text-text-primary font-medium mb-4">关键指标评估</h3>
        <div className="space-y-3">
          {result.keyFactors.map((factor) => (
            <FactorRow key={factor.factorId} factor={factor} />
          ))}
        </div>
      </div>

      {/* Evidence level legend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="text-text-secondary text-sm mb-3">证据等级说明</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {[
            { stars: 5, label: "Meta分析/RCT", color: "text-amber-400" },
            { stars: 4, label: "多中心研究", color: "text-amber-300" },
            { stars: 3, label: "单中心研究", color: "text-amber-200" },
          ].map((item) => (
            <div key={item.stars} className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i < item.stars ? "currentColor" : "none"} stroke="currentColor" className={i < item.stars ? item.color : "text-white/10"}>
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                ))}
              </div>
              <span className="text-text-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FactorsTab({ result, onInspectStudy }: { result: PatientMatchResult; onInspectStudy?: (study: any) => void }) {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {result.keyFactors.map((factor) => {
        const isExpanded = expandedFactor === factor.factorId;
        const evidenceFactor = EVIDENCE_FACTORS.find(f => f.id === factor.factorId);

        return (
          <div
            key={factor.factorId}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden card-hover"
          >
            <button
              id={`factor-expand-${factor.factorId}`}
              onClick={() => setExpandedFactor(isExpanded ? null : factor.factorId)}
              className="w-full p-5 text-left cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    factor.riskDirection === "protective" ? "bg-emerald-500/10 text-emerald-600"
                    : factor.riskDirection === "risk" ? "bg-rose-500/10 text-rose-600"
                    : "bg-gray-50 text-slate-500"
                  }`}>
                    {factor.riskDirection === "protective" ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : factor.riskDirection === "risk" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{factor.factorName}</h3>
                    <span className={`text-sm font-semibold ${
                      factor.riskLevel === "very_low" || factor.riskLevel === "low"
                        ? "text-emerald-700"
                        : factor.riskLevel === "moderate"
                        ? "text-amber-700"
                        : "text-rose-700"
                    }`}>
                      {factor.statusLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EvidenceStars count={factor.evidenceLevel} />
                  <svg
                    width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 mb-4">
                  <p className="text-slate-700 text-sm leading-relaxed">{factor.explanation}</p>
                </div>

                {evidenceFactor && (
                  <>
                    <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">
                      关键研究发现
                    </h4>
                    <div className="space-y-2">
                      {evidenceFactor.keyFindings.map((finding, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-2xs border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-slate-900 text-sm font-medium mb-1">{finding.finding}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {finding.hr && (
                                <span className="text-amber-700 font-bold font-mono">HR {finding.hr} ({finding.ciLower}–{finding.ciUpper})</span>
                              )}
                              {finding.rfs5yr && (
                                <span className="text-emerald-700 font-bold font-mono">5年DFS {Math.round(finding.rfs5yr * 100)}%</span>
                              )}
                              <span>{finding.patientN.toLocaleString()}例队列</span>
                              <EvidenceStars count={finding.evidenceLevel} />
                            </div>
                          </div>
                          {onInspectStudy && (
                            <button
                              type="button"
                              onClick={() => onInspectStudy({
                                title: finding.finding,
                                journal: "顶级肿瘤学期刊",
                                year: 2024,
                                sampleSize: finding.patientN,
                                hazardRatio: finding.hr ? `HR ${finding.hr}` : undefined,
                                ci95: finding.ciLower && finding.ciUpper ? `${finding.ciLower} - ${finding.ciUpper}` : undefined,
                                evidenceLevel: finding.evidenceLevel,
                                summary: factor.explanation,
                              })}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 self-start sm:self-center"
                            >
                              检视证据
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StudiesTab({ result, onInspectStudy }: { result: PatientMatchResult; onInspectStudy?: (study: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-sky-50 rounded-2xl p-4 sm:p-5 border border-sky-100 mb-4 flex items-center justify-between flex-wrap gap-2">
        <p className="text-slate-700 text-xs sm:text-sm">
          以下 <strong className="text-sky-800 font-bold">{result.matchedStudies.length}</strong> 项顶级研究与您的病理特征高度匹配，共涵盖约 <strong className="text-sky-800 font-bold">{result.matchedStudies.reduce((sum, s) => sum + s.patientN, 0).toLocaleString()}</strong> 例真实患者队列。
        </p>
      </div>
      <div className="grid gap-4">
        {result.matchedStudies.map((study) => (
          <div key={study.id} className="relative group">
            <StudyCard study={study} />
            {onInspectStudy && (
              <button
                type="button"
                onClick={() => onInspectStudy({
                  ...study,
                  sampleSize: study.patientN,
                })}
                className="absolute top-4 right-4 sm:right-6 px-2.5 py-1 rounded-xl text-xs font-bold bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white border border-sky-200 transition-all shadow-2xs active:scale(0.96)"
              >
                🔬 证据检视
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowupTab({ result, profile }: { result: PatientMatchResult; profile: PatientProfile }) {
  const isLowRisk = result.riskLevel === "very_low" || result.riskLevel === "low";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-white/5">
        <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-600" />
          <span>随访建议参考</span>
        </h3>
        <p className="text-text-muted text-xs mb-4">
          以下建议基于 NCCN 2025 及相关国际指南，仅供参考。具体方案请与主治医生确认。
        </p>

        <div className="space-y-3">
          <TimelineItem
            period="术后 1–2 年"
            action={isLowRisk ? "每 6 个月 CT 随访" : "每 3–6 个月 CT 随访"}
            note={isLowRisk ? "低风险组，常规监测" : "建议更频繁随访"}
            color={isLowRisk ? "teal" : "amber"}
          />
          <TimelineItem
            period="术后 3–5 年"
            action="每年一次 CT 随访"
            note="进入长期监测阶段"
            color="blue"
          />
          <TimelineItem
            period="术后 5 年以上"
            action="每年一次 CT（可与主治医生商议调整）"
            note={isLowRisk ? "低风险组复发概率已显著降低" : "持续监测仍有必要"}
            color="gray"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-white/5">
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-600" />
          <span>需要特别关注的信号</span>
        </h3>
        <div className="space-y-2">
          {[
            "新出现的持续咳嗽或咯血",
            "不明原因的体重下降",
            "进行性加重的胸痛或背痛",
            "新出现的骨痛或头痛",
            "CT 上残余肺叶新发结节",
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <span className="text-text-secondary">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {profile.egfr === "positive" && (
        <div className="artifact-container p-6 border-blue-200">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <span>EGFR 阳性辅助治疗参考</span>
          </h3>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-text-secondary text-sm leading-relaxed">
              ADAURA 研究（NEJM 2023，n=682）显示：EGFR 突变 II–IIIA 期患者术后奥希替尼治疗 3 年，5 年 DFS 达 65% vs 26%（HR 0.27）。
              IA 期患者的获益数据请咨询医生。
            </p>
          </div>
          <p className="text-text-muted text-xs mt-3 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>辅助治疗决策需综合分期、基因状态、手术情况，由医生判断。</span>
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
        <p className="text-text-muted text-xs">
          以上信息均来自已发表的医学研究和国际指南。本平台不提供个人化医疗建议。
        </p>
      </div>

      {/* Personalized Knowledge Graph CTA */}
      <div className="artifact-container p-6 border-teal-200 bg-teal-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-1">查看您的专属知识图谱</h3>
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              根据您的病理特征，知识图谱将高亮显示与您直接相关的风险路径，并允许您点击每条连线查看真实文献依据。
            </p>
            <button
              onClick={() => {
                try {
                  const encoded = encodeURIComponent(btoa(JSON.stringify(profile)));
                  window.open(`/knowledge#profile=${encoded}`, "_blank");
                } catch {}
              }}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium cursor-pointer inline-flex items-center gap-2"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"/>
              </svg>
              查看专属路径图谱
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== Helper Components ==========

function LoadingScreen() {
  const steps = [
    "正在分析病理特征...",
    "匹配国际研究数据库...",
    "计算风险分层...",
    "生成循证报告...",
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full border-2 border-accent-blue/20 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border-2 border-t-accent-blue border-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-accent-blue/10 flex items-center justify-center">
            <Microscope className="w-6 h-6 text-accent-blue" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">正在生成循证报告</h2>
        <p className="text-accent-teal text-sm animate-pulse">{steps[currentStep]}</p>
        <div className="flex gap-1 justify-center mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i <= currentStep ? "w-8 bg-blue-600" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: "text-accent-teal",
    blue: "text-accent-blue",
    purple: "text-purple-400",
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
      <div className={`text-2xl font-bold ${colorMap[color]} mb-1`}>{value}</div>
      <div className="text-text-primary text-sm font-medium">{label}</div>
      <div className="text-text-muted text-xs">{sub}</div>
    </div>
  );
}

function FactorRow({ factor }: { factor: { factorId: string; factorName: string; statusLabel: string; riskDirection: string; riskLevel: string; evidenceLevel: number } }) {
  const dotColor =
    factor.riskDirection === "protective" ? "bg-accent-green"
    : factor.riskDirection === "risk" ? "bg-accent-red"
    : "bg-text-muted";

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
        <span className="text-gray-500 text-xs uppercase tracking-wide">{factor.factorName}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${
          factor.riskLevel === "very_low" || factor.riskLevel === "low"
            ? "text-accent-green"
            : factor.riskLevel === "moderate"
            ? "text-accent-amber"
            : "text-accent-red"
        }`}>
          {factor.statusLabel}
        </span>
        <EvidenceStars count={factor.evidenceLevel} />
      </div>
    </div>
  );
}

function EvidenceStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="10" height="10" viewBox="0 0 24 24"
          fill={i < count ? "currentColor" : "none"}
          stroke="currentColor"
          className={i < count ? "text-amber-400" : "text-gray-200"}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

function TimelineItem({ period, action, note, color }: { period: string; action: string; note: string; color: string }) {
  const colorMap: Record<string, string> = {
    teal: "border-accent-teal bg-accent-teal/10 text-accent-teal",
    blue: "border-accent-blue bg-accent-blue/10 text-accent-blue",
    amber: "border-accent-amber bg-accent-amber/10 text-accent-amber",
    gray: "border-gray-200 bg-gray-50 text-gray-500",
  };

  return (
    <div className="flex gap-4">
      <div className={`flex-shrink-0 px-3 py-1 rounded-lg border text-xs font-medium ${colorMap[color]}`}>
        {period}
      </div>
      <div>
        <p className="text-text-primary text-sm font-medium">{action}</p>
        <p className="text-text-muted text-xs">{note}</p>
      </div>
    </div>
  );
}

function RadarChart({ profile, result }: { profile: PatientProfile; result: PatientMatchResult }) {
  const size = 160;
  const center = size / 2;
  const radius = 60;

  const dimensions = [
    { label: "CTR", value: 1 - profile.ctr, angle: -90 },
    { label: "STAS", value: profile.stas === "negative" ? 0.95 : profile.stas === "positive" ? 0.2 : 0.5, angle: -18 },
    { label: "LVI", value: profile.lvi === "negative" ? 0.95 : profile.lvi === "positive" ? 0.2 : 0.5, angle: 54 },
    { label: "VPI", value: profile.vpi === "negative" ? 0.9 : profile.vpi === "positive" ? 0.3 : 0.6, angle: 126 },
    { label: "Grade", value: profile.iaslcGrade === "1" ? 0.95 : profile.iaslcGrade === "2" ? 0.7 : profile.iaslcGrade === "3" ? 0.3 : 0.5, angle: 198 },
  ];

  const getPoint = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = dimensions.map((d) => getPoint(d.angle, d.value * radius));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[160px] mx-auto">
      {/* Grid */}
      {gridLevels.map((level) => {
        const gridPoints = dimensions.map((d) => getPoint(d.angle, level * radius));
        const gridPath = gridPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return (
          <path key={level} d={gridPath} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        );
      })}

      {/* Axis lines */}
      {dimensions.map((d) => {
        const end = getPoint(d.angle, radius);
        return (
          <line key={d.label} x1={center} y1={center} x2={end.x} y2={end.y} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        );
      })}

      {/* Data area */}
      <path d={pathD} fill="rgba(79,142,247,0.2)" stroke="rgba(79,142,247,0.6)" strokeWidth="1.5" />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4f8ef7" />
      ))}

      {/* Labels */}
      {dimensions.map((d) => {
        const labelPos = getPoint(d.angle, radius + 15);
        return (
          <text
            key={d.label}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6b7280"
            fontSize="10"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
