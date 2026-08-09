"use client";

import { useEffect, useState, useMemo } from "react";
import type { PatientProfile } from "@/lib/types";
import { analyzePatientProfile, EVIDENCE_FACTORS, FEATURED_STUDIES, STUDY_TYPE_LABELS, type PatientMatchResult } from "@/lib/evidence-data";
import { generateReport } from "@/lib/api";
import StudyCard from "./StudyCard";
import KnowledgeMapPreview from "./KnowledgeMapPreview";

interface EvidenceReportProps {
  profile: PatientProfile;
  onBack: () => void;
  initialReportJson?: any;
}

export default function EvidenceReport({ profile, onBack, initialReportJson }: EvidenceReportProps) {
  const result = useMemo(() => analyzePatientProfile({
      stage: profile.stage,
      ctr: profile.ctr,
      stas: profile.stas,
      lvi: profile.lvi,
      vpi: profile.vpi,
      iaslcGrade: profile.iaslcGrade,
      histology: profile.histology,
      egfr: profile.egfr,
      lymphNodes: profile.lymphNodes,
  }), [profile]);

  const [loading, setLoading] = useState(!initialReportJson);
  const [activeTab, setActiveTab] = useState<"overview" | "factors" | "studies" | "followup">("overview");
  const [showGraphOverlay, setShowGraphOverlay] = useState(false);

  const [llmReport, setLlmReport] = useState<any>(initialReportJson || null);

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

  if (loading) return <LoadingScreen />;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
      {/* Knowledge Graph Overlay */}
      {showGraphOverlay && (
        <div
          className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex flex-col p-4 md:p-8"
          onClick={(e) => { if (e.target === e.currentTarget) setShowGraphOverlay(false); }}
        >
          {/* Overlay Header */}
          <div className="bg-white border-b border-gray-200 rounded-t-2xl px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0 w-full max-w-6xl mx-auto mt-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
              <span className="text-text-primary font-semibold text-sm md:text-base">专属路径图谱</span>
              <span className="text-text-muted text-xs md:text-sm hidden sm:inline">— 根据您的病理特征高亮显示</span>
            </div>
            <button
              onClick={() => setShowGraphOverlay(false)}
              className="text-text-muted hover:text-text-primary transition-colors text-2xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            >
              &times;
            </button>
          </div>
          {/* Overlay Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-8">
            <div className="max-w-6xl mx-auto">
              <KnowledgeMapPreview profile={profile} />
            </div>
          </div>
          {/* Bottom hint */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-white/5 text-center">
            <span className="text-text-muted text-xs">点击连线可查看文献依据 · 点击背景关闭</span>
          </div>
        </div>
      )}

      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 px-6 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            id="report-back-btn"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回修改
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
            <span className="text-text-secondary text-sm">循证分析报告</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Knowledge Graph shortcut */}
            <button
              id="report-graph-btn"
              onClick={() => setShowGraphOverlay(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-accent-teal/40 text-accent-teal bg-accent-teal/5 hover:bg-accent-teal/10 transition-all cursor-pointer"
              title="查看专属路径图谱"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="5" cy="5" r="2"/>
                <circle cx="19" cy="5" r="2"/>
                <circle cx="12" cy="19" r="2"/>
                <line x1="7" y1="5" x2="17" y2="5"/>
                <line x1="5" y1="7" x2="12" y2="17"/>
                <line x1="19" y1="7" x2="12" y2="17"/>
              </svg>
              图谱
            </button>
            <button
              id="report-share-btn"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: "OncoPath 循证分析报告", url });
                } else {
                  navigator.clipboard.writeText(url).then(() => alert("页面链接已复制！可将链接分享给家属或医生。"));
                }
              }}
              className="btn-secondary px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-1.5"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              分享
            </button>
            <button
              id="report-print-btn"
              onClick={() => window.print()}
              className="btn-secondary px-4 py-2 rounded-lg text-sm cursor-pointer"
            >
              导出报告
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Hero Summary Card */}
        <div className="artifact-container mb-6 p-5 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/30 to-accent-teal/30 flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <h1 className="text-xl font-bold text-text-primary">循证分析结果</h1>
                  <p className="text-text-muted text-sm">
                    {profile.stage} · {profile.morphology === "mixed_ggo" ? "混合磨玻璃" : profile.morphology === "pure_ggo" ? "纯磨玻璃" : "纯实性"} · CTR {profile.ctr}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="text-accent-blue font-medium mb-3 flex items-center gap-2">
                  <span>🧠</span> 智能综合解析 (由 RAG 模型生成)
                </h3>
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {llmReport?.evidence_summary || result.summaryZh}
                </p>
              </div>
            </div>
            <div className="md:w-56 flex flex-col items-center">
              <span className={`text-5xl font-black ${riskColorMap[result.riskLevel]} mb-1`}>
                {result.riskLabel}
              </span>
              <span className={`text-sm px-4 py-1.5 rounded-full border ${riskBgMap[result.riskLevel]} mb-3`}>
                {result.riskPercentile}
              </span>
              <div className="text-center text-xs text-text-muted">
                基于 {result.matchedStudies.length} 项研究
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <StatBlock
              label="5年RFS"
              value={`${Math.round(result.rfs5yrRange[0] * 100)}–${Math.round(result.rfs5yrRange[1] * 100)}%`}
              sub="无复发生存率"
              color="teal"
            />
            <StatBlock
              label="相似患者"
              value={`${result.similarPatientCount.toLocaleString()}+`}
              sub="例已纳入研究"
              color="blue"
            />
            <StatBlock
              label="匹配研究"
              value={`${result.matchedStudies.length}篇`}
              sub="顶级期刊来源"
              color="purple"
            />
          </div>
        </div>

        {/* Authority & AI Disclaimer Banner */}
        <div className="rounded-xl mb-6 overflow-hidden border border-amber-200">
          <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center gap-2">
            <span className="text-amber-400 text-base">⚠️</span>
            <span className="text-amber-400 font-semibold text-sm">使用前请阅读重要声明</span>
          </div>
          <div className="bg-amber-50/50 px-5 py-4 space-y-2 text-sm">
            <p className="text-text-secondary leading-relaxed">
              📚 <span className="text-text-primary font-medium">数据来源：</span>本报告中所有统计数据均来自 Lancet、NEJM、JCO、Chest 等权威期刊的已发表学术研究，并非本平台自行生成。
            </p>
            <p className="text-text-secondary leading-relaxed">
              🤖 <span className="text-text-primary font-medium">本报告由 AI 辅助整理：</span>文字部分由大语言模型根据检索到的文献自动整理，不代表医生诊断意见。请务必和您的主治医生探讨。
            </p>
            <p className="text-text-secondary leading-relaxed">
              📊 <span className="text-text-primary font-medium">RFS 数据说明：</span>无复发生存率（RFS）数据基于历史研究群体的统计结果，<strong className="text-text-primary">不代表您个人的预后判断</strong>。相同病理的患者在实际中结果可能差异很大。
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white shadow-sm rounded-xl p-1 mb-6 border border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {(["overview", "factors", "studies", "followup"] as const).map((tab) => (
            <button
              key={tab}
              id={`report-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-accent-blue/20 text-accent-blue"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {tab === "overview" ? "📊 风险概览" : tab === "factors" ? "🔬 因素分析" : tab === "studies" ? "📚 匹配研究" : "📅 随访建议"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab result={result} profile={profile} riskColorMap={riskColorMap} />}
        {activeTab === "factors" && <FactorsTab result={result} />}
        {activeTab === "studies" && <StudiesTab result={result} />}
        {activeTab === "followup" && <FollowupTab result={result} profile={profile} />}
      </div>
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

function FactorsTab({ result }: { result: PatientMatchResult }) {
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {result.keyFactors.map((factor) => {
        const isExpanded = expandedFactor === factor.factorId;
        const evidenceFactor = EVIDENCE_FACTORS.find(f => f.id === factor.factorId);

        return (
          <div
            key={factor.factorId}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden card-hover"
          >
            <button
              id={`factor-expand-${factor.factorId}`}
              onClick={() => setExpandedFactor(isExpanded ? null : factor.factorId)}
              className="w-full p-5 text-left cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    factor.riskDirection === "protective" ? "bg-green-500/10"
                    : factor.riskDirection === "risk" ? "bg-red-500/10"
                    : "bg-gray-50"
                  }`}>
                    {factor.riskDirection === "protective" ? "🛡️" : factor.riskDirection === "risk" ? "⚠️" : "ℹ️"}
                  </div>
                  <div>
                    <h3 className="font-medium text-text-primary">{factor.factorName}</h3>
                    <span className={`text-sm ${
                      factor.riskLevel === "very_low" || factor.riskLevel === "low"
                        ? "text-accent-green"
                        : factor.riskLevel === "moderate"
                        ? "text-accent-amber"
                        : "text-accent-red"
                    }`}>
                      {factor.statusLabel}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <EvidenceStars count={factor.evidenceLevel} />
                  <svg
                    width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-gray-200 pt-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                  <p className="text-text-secondary text-sm leading-relaxed">{factor.explanation}</p>
                </div>

                {evidenceFactor && (
                  <>
                    <h4 className="text-text-muted text-xs font-medium uppercase tracking-wider mb-3">
                      关键研究发现
                    </h4>
                    <div className="space-y-2">
                      {evidenceFactor.keyFindings.map((finding, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                          <p className="text-text-primary text-sm mb-2">{finding.finding}</p>
                          <div className="flex items-center gap-4 text-xs text-text-muted">
                            {finding.hr && (
                              <span className="text-accent-amber">HR {finding.hr} ({finding.ciLower}–{finding.ciUpper})</span>
                            )}
                            {finding.rfs5yr && (
                              <span className="text-accent-teal">5年RFS {Math.round(finding.rfs5yr * 100)}%</span>
                            )}
                            <span>{finding.patientN.toLocaleString()}例</span>
                            <EvidenceStars count={finding.evidenceLevel} />
                          </div>
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

function StudiesTab({ result }: { result: PatientMatchResult }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
        <p className="text-text-secondary text-sm">
          以下 {result.matchedStudies.length} 项研究与你的病理特征最为相关，
          共涵盖约 {result.matchedStudies.reduce((sum, s) => sum + s.patientN, 0).toLocaleString()} 例患者的数据。
        </p>
      </div>
      {result.matchedStudies.map((study) => (
        <StudyCard key={study.id} study={study} />
      ))}
    </div>
  );
}

function FollowupTab({ result, profile }: { result: PatientMatchResult; profile: PatientProfile }) {
  const isLowRisk = result.riskLevel === "very_low" || result.riskLevel === "low";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-white/5">
        <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
          <span>📅</span> 随访建议参考
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
          <span>🔍</span> 需要特别关注的信号
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
              <span className="text-accent-red mt-0.5">●</span>
              <span className="text-text-secondary">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {profile.egfr === "positive" && (
        <div className="artifact-container p-6 border-blue-200">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>💊</span> EGFR 阳性辅助治疗参考
          </h3>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-text-secondary text-sm leading-relaxed">
              ADAURA 研究（NEJM 2023，n=682）显示：EGFR 突变 II–IIIA 期患者术后奥希替尼治疗 3 年，5 年 DFS 达 65% vs 26%（HR 0.27）。
              IA 期患者的获益数据请咨询医生。
            </p>
          </div>
          <p className="text-text-muted text-xs mt-3">
            ⚠️ 辅助治疗决策需综合分期、基因状态、手术情况，由医生判断。
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
          <div className="text-3xl flex-shrink-0">🕸️</div>
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
            <span className="text-accent-blue text-xl">🔬</span>
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
