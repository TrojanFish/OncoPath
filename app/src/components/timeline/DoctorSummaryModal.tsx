"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { 
  Stethoscope, 
  Printer, 
  Download,
  Check,
  X, 
  Scan, 
  Microscope, 
  Zap, 
  TestTube2, 
  Activity,
  Dna,
  ShieldCheck,
  FileText,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Copy,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { TimelineEventItem } from "@/lib/timelineTypes";
import { ONCOPATH_LOGO_DATA_URI } from "@/lib/brandLogo";
import { exportElementToA4Pdf } from "@/lib/pdfExporter";
import { showToast } from "@/components/common/Toast";

interface DoctorSummaryModalProps {
  events: TimelineEventItem[];
  onClose: () => void;
}

type SummaryTab = "overview" | "imaging" | "pathology" | "serology" | "checklist" | "full_print";

export default function DoctorSummaryModal({ events, onClose }: DoctorSummaryModalProps) {
  const [activeTab, setActiveTab] = useState<SummaryTab>("overview");
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<string[]>([]);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  
  const printableDocRef = useRef<HTMLDivElement>(null);

  // Sort events chronologically descending
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }, [events]);

  const imagingList = sortedEvents.filter((e) => e.category === "imaging");
  const pathologyList = sortedEvents.filter((e) => e.category === "pathology");
  const serologyList = sortedEvents.filter((e) => e.category === "serology");
  const milestoneList = sortedEvents.filter((e) => e.category === "milestone");
  const molecularList = sortedEvents.filter((e) => e.category === "molecular" || e.subType === "NGS");
  const latestImaging = imagingList[0];
  const latestSerology = serologyList[0];
  const latestPathology = pathologyList[0];
  const latestMolecular = sortedEvents.find((e) => e.category === "molecular" || e.subType === "NGS");
  const surgeryMilestone = milestoneList.find((e) => e.subType === "Surgery") || milestoneList[0];

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

  const molecularFindings: any = latestMolecular?.keyFindings || {};
  const molecularMuts: any[] = Array.isArray(molecularFindings.mutations) ? molecularFindings.mutations : [];
  const geneSummaryText = molecularMuts.length > 0
    ? molecularMuts.map((m: any) => `${m.gene}${m.subtype ? ` (${m.subtype})` : ''}`).join('、')
    : (molecularFindings.testStatus === "negative" ? "全野生型 (全阴性)" : (latestPathology?.keyFindings?.driverGene || "未做基因检测"));

  // Dynamic clinical questions tailored to patient state
  const consultationQuestions = useMemo(() => {
    const questions: { id: string; category: string; text: string; rationale: string; priority: "high" | "normal" }[] = [];

    if (latestPathology) {
      questions.push({
        id: "q_margin",
        category: "术后切缘",
        text: "病理报告确认切缘为充分的 R0 根治性阴性吗？切缘距肿瘤边缘的安全距离是多少？",
        rationale: "确保病灶完整彻底切除，无显微残留。",
        priority: "high"
      });
      questions.push({
        id: "q_high_risk",
        category: "病理高危",
        text: "病理切片是否排查了 STAS (气道播散)、胸膜侵犯 (VPI) 或脉管癌栓 (LVI)？分级是否为 G1/G2？",
        rationale: "微观浸润指标直接影响术后复发风险分层与随访密度。",
        priority: "high"
      });
      questions.push({
        id: "q_adjuvant",
        category: "辅助治疗",
        text: "依据当前 AJCC 8th/9th 术后分期，指南常规推荐纯规律随访还是需要术后辅助靶向/化疗？",
        rationale: "IA 期通常免化疗靶向过度治疗，IB 以上或高危可评估奥希替尼等靶向干预。",
        priority: "high"
      });
    } else {
      questions.push({
        id: "q_ct_trend",
        category: "影像随访",
        text: "对比往年 CT 老片，当前结节全径与实性成分 (CTR) 是否有明显增大或密度增高？",
        rationale: "评估病灶生长动力学（体积倍增时间 VDT）。",
        priority: "high"
      });
      questions.push({
        id: "q_next_interval",
        category: "随访间隔",
        text: "根据 Fleischner 结节指南，建议下次复查薄层 HRCT 的时间间隔是 3 个月还是 6 个月？",
        rationale: "明确复查节奏，避免过频或漏诊。",
        priority: "normal"
      });
    }

    if (molecularMuts.length > 0) {
      questions.push({
        id: "q_gene_target",
        category: "靶向药物",
        text: `已检出 ${geneSummaryText} 突变，如后续有辅助治疗或随访需求，对应靶向药及医保报销政策如何？`,
        rationale: "提前了解三代 EGFR-TKI 等特药报销与慈善赠药路径。",
        priority: "normal"
      });
    }

    questions.push({
      id: "q_serology",
      category: "血液标志物",
      text: "当前 CEA、CYFRA21-1 等标志物处于基线水平，后续随访是否建议结合 CT 规律联合监测？",
      rationale: "建立个人特异性血清动态监测基准。",
      priority: "normal"
    });

    return questions;
  }, [latestPathology, geneSummaryText, molecularMuts.length]);

  const toggleQuestion = (id: string) => {
    setCheckedQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleCopyQuestions = () => {
    const text = consultationQuestions
      .map((q, idx) => `${idx + 1}. 【${q.category}】${q.text}\n   (目的: ${q.rationale})`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    showToast("✓ 问诊清单已复制到剪贴板，可粘贴至微信或便签", "success");
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printableDocRef.current || isExportingPdf) return;
    try {
      setIsExportingPdf(true);
      const dateStr = new Date().toISOString().split("T")[0];
      const success = await exportElementToA4Pdf(printableDocRef.current, {
        fileName: `OncoPath-门诊就医问诊便签卡-${dateStr}.pdf`,
        headerTitle: "OncoPath 肺结节与肺腺癌临床数字档案 · 门诊就医问诊便签卡",
        reportDate: dateStr,
      });
      if (success) {
        setPdfSuccess(true);
        showToast("✓ 门诊就医问诊便签卡 PDF 已开始下载", "success");
        setTimeout(() => setPdfSuccess(false), 2500);
      }
    } catch (err) {
      console.error("PDF export error:", err);
      showToast("生成 PDF 遇到浏览器限制，建议使用打印选项", "warning");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportImage = async () => {
    if (!printableDocRef.current || isExportingImage) return;
    try {
      setIsExportingImage(true);
      const element = printableDocRef.current;

      if (typeof document !== "undefined" && (document as any).fonts) {
        try {
          await (document as any).fonts.ready;
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 100));

      let imgData = "";
      try {
        const { toPng } = await import("html-to-image");
        imgData = await toPng(element, {
          quality: 0.98,
          pixelRatio: 2,
          skipAutoScale: true,
          fontEmbedCSS: "",
          backgroundColor: "#ffffff",
          cacheBust: true,
        });
      } catch (err1) {
        console.warn("toPng failed, trying html2canvas:", err1);
      }

      if (!imgData || imgData.length < 500) {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        imgData = canvas.toDataURL("image/png");
      }

      if (imgData && imgData.length >= 500) {
        const dateStr = new Date().toISOString().split("T")[0];
        const a = document.createElement("a");
        a.href = imgData;
        a.download = `OncoPath-门诊就医问诊便签卡-${dateStr}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadSuccess(true);
        showToast("✓ 门诊就医问诊便签卡已保存到本地", "success");
        setTimeout(() => setDownloadSuccess(false), 2500);
      } else {
        throw new Error("未能生成问诊便签卡图片数据");
      }
    } catch (err: any) {
      console.error("Export image error:", err);
      showToast("生成图片遇到浏览器限制，建议点击'下载 A4 PDF'或'打印'", "warning");
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-6 animate-fade-in print:p-0 print:static">
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm print:hidden" onClick={onClose} />
      <div className="bg-white w-full max-w-4xl rounded-3xl p-4 sm:p-7 md:p-8 border border-slate-200 shadow-2xl relative z-10 animate-fade-in-up text-slate-900 max-h-[94vh] flex flex-col print:max-h-none print:shadow-none print:border-none print:p-4">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center justify-between sm:justify-start gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight flex items-center gap-2">
                  <span>门诊就医问诊便签卡</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    面诊速览模式
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  专为门诊 3 分钟高效面诊设计 · 结构化归集核心影像、病理与问诊要点
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="sm:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-auto shrink-0">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 transition-all ${
                pdfSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {pdfSuccess ? <Check className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{pdfSuccess ? "已下载 PDF" : isExportingPdf ? "生成中..." : "下载 A4 PDF"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExportingImage}
              className={`flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 transition-all ${
                downloadSuccess
                  ? "bg-emerald-600 text-white"
                  : "btn-primary text-white"
              }`}
            >
              {downloadSuccess ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloadSuccess ? "已存长图" : isExportingImage ? "渲染中..." : "保存图片"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-transform"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 items-center justify-center cursor-pointer shrink-0 transition-colors"
              aria-label="关闭窗口"
              title="关闭窗口"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Segmented Tab Navigation Header (Scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-slate-100 shrink-0 no-scrollbar print:hidden">
          {[
            { id: "overview", label: "📋 3秒速览", icon: Sparkles },
            { id: "imaging", label: "🩻 影像演变", count: imagingList.length, icon: Scan },
            { id: "pathology", label: "🔬 病理与基因", icon: Microscope },
            { id: "serology", label: "🧪 标志物轨迹", count: serologyList.length, icon: TestTube2 },
            { id: "checklist", label: "💬 门诊问诊清单", count: consultationQuestions.length, icon: HelpCircle },
            { id: "full_print", label: "📄 A4全景单", icon: FileText },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SummaryTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? "bg-slate-700 text-slate-200" : "bg-slate-200 text-slate-700"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Segmented Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-2 print:p-0">
          
          {/* Tab 1: 3-Second Executive Overview */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              {/* Executive Summary Four Boxes */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 sm:p-5 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Scan className="w-3 h-3 text-blue-600" />
                    <span>最新影像状态</span>
                  </span>
                  <div className="font-extrabold text-slate-900 mt-1 break-words">
                    {latestImaging?.keyFindings?.sizeMm !== undefined
                      ? `${latestImaging.keyFindings.sizeMm} mm (${latestImaging.eventDate.substring(0, 7)})`
                      : "已行手术切除"}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Microscope className="w-3 h-3 text-emerald-600" />
                    <span>术后病理分期</span>
                  </span>
                  <div className="font-extrabold text-emerald-700 mt-1 break-words">
                    {latestPathology?.keyFindings?.stage || "未行手术切除 (影像随访中)"}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <TestTube2 className="w-3 h-3 text-rose-600" />
                    <span>最新 CEA 标志物</span>
                  </span>
                  <div className="font-extrabold text-slate-900 mt-1 break-words">
                    {latestSerology?.keyFindings?.cea !== undefined
                      ? `${latestSerology.keyFindings.cea} ng/mL`
                      : "未查/基线参考"}
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                    <Dna className="w-3 h-3 text-purple-600" />
                    <span>驱动基因突变</span>
                  </span>
                  <div className="font-extrabold text-blue-700 mt-1 break-words">
                    {geneSummaryText}
                  </div>
                </div>
              </div>

              {/* Clinical Takeaways & Fast Action */}
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>面诊沟通核心抓手：</span>
                </div>
                <p className="leading-relaxed text-sky-900 text-xs">
                  {latestPathology
                    ? `患者已完成胸外科微创切除，病理提示【${latestPathology.keyFindings?.stage || "早期"}】。面诊重点建议与主治医生确认切缘安全距离、STAS气道播散排查情况及后续常规随访复查周期。`
                    : `患者目前处于肺结节动态随访期，最新影像记录结节全径约 ${latestImaging?.keyFindings?.sizeMm || "微小"} mm。面诊重点关注实性成分变化率与体积倍增时间(VDT)。`}
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("checklist")}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <span>查看定制问诊清单 ({consultationQuestions.length} 条)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Imaging Chronology */}
          {activeTab === "imaging" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Scan className="w-4 h-4 text-blue-600" />
                  <span>历次薄层 CT 影像学演变演化轨迹</span>
                </span>
                <span className="text-slate-500">共归集 {imagingList.length} 次影像记录</span>
              </div>

              {imagingList.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2.5 whitespace-nowrap">检查日期</th>
                        <th className="p-2.5 whitespace-nowrap">检查项目 / 医院</th>
                        <th className="p-2.5 whitespace-nowrap">长径 (mm)</th>
                        <th className="p-2.5 whitespace-nowrap">实性比 (CTR)</th>
                        <th className="p-2.5">核心结论</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {imagingList.map((im, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">{im.eventDate}</td>
                          <td className="p-2.5 text-slate-700 whitespace-nowrap">
                            <div className="font-semibold">{im.title}</div>
                            <div className="text-[10px] text-slate-400">{im.hospital}</div>
                          </td>
                          <td className="p-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                            {im.keyFindings?.sizeMm !== undefined ? `${im.keyFindings.sizeMm} mm` : "-"}
                          </td>
                          <td className="p-2.5 font-mono whitespace-nowrap">
                            {im.keyFindings?.ctr !== undefined ? `${(im.keyFindings.ctr * 100).toFixed(0)}%` : "-"}
                          </td>
                          <td className="p-2.5 text-slate-600 min-w-[140px]">{im.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  暂无影像记录，可在时间轴中追加 CT 检查
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Pathology & NGS */}
          {activeTab === "pathology" && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Microscope className="w-4 h-4 text-purple-600" />
                  <span>微创手术干预、病理高危矩阵与分子突变</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {surgeryMilestone && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{surgeryMilestone.eventDate} 手术记录</span>
                    </div>
                    <div className="text-slate-600 leading-relaxed text-xs">{surgeryMilestone.summary}</div>
                  </div>
                )}
                
                {latestPathology && (
                  <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-1">
                    <div className="font-bold text-purple-950 flex items-center gap-1.5">
                      <Microscope className="w-3.5 h-3.5 text-purple-600" />
                      <span>{latestPathology.eventDate} 组织病理学</span>
                    </div>
                    <div className="text-purple-900 leading-relaxed text-xs">{latestPathology.summary}</div>
                  </div>
                )}

                <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
                  <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Dna className="w-3.5 h-3.5 text-indigo-600" />
                    <span>分子驱动基因</span>
                  </div>
                  <div className="text-indigo-900 leading-relaxed font-semibold text-xs">
                    {geneSummaryText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Biomarkers Trajectory */}
          {activeTab === "serology" && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <TestTube2 className="w-4 h-4 text-rose-600" />
                  <span>血清肿瘤标志物随访轨迹 (Biomarkers)</span>
                </span>
                <span className="text-slate-500">归集 {serologyList.length} 次化验数据</span>
              </div>

              {serologyList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {serologyList.map((s, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{s.eventDate}</span>
                      </div>
                      <div className="text-slate-700 mt-1.5 truncate">
                        CEA: <span className="font-bold text-rose-700">{s.keyFindings?.cea ?? "-"}</span> ng/mL
                      </div>
                      {s.keyFindings?.cyfra211 && (
                        <div className="text-slate-500 text-[11px] mt-0.5 truncate">
                          CYFRA: {s.keyFindings.cyfra211}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  暂无肿瘤标志物化验记录
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Doctor Consultation Checklist (Interactive & Actionable) */}
          {activeTab === "checklist" && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs pb-1">
                <div>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>门诊当面请教医生清单 ({consultationQuestions.length} 条)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    点击勾选已解答项目，可一键复制到微信或随身记事本
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyQuestions}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSuccess ? "已复制清单" : "一键复制全部问题"}</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {consultationQuestions.map((q, idx) => {
                  const isChecked = checkedQuestions.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isChecked 
                          ? "bg-slate-50 border-slate-200 opacity-60 line-through" 
                          : "bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-2xs"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center mt-0.5 border shrink-0 transition-colors ${
                        isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-slate-50"
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200">
                            {q.category}
                          </span>
                          {q.priority === "high" && (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                              高优关注
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {idx + 1}. {q.text}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          💡 临床背景与提问目的: {q.rationale}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 6: Full A4 Printable View (Hidden in other tabs or displayed for full view) */}
          {activeTab === "full_print" && (
            <div className="animate-fade-in border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
                <span>📄 以下为 A4 单页打印与 PDF 导出标准排版预览：</span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs cursor-pointer"
                >
                  打印此单
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Ref Element for A4 PDF / Image Export & Print */}
          <div 
            ref={printableDocRef} 
            className={`font-sans p-1 bg-white space-y-5 sm:space-y-6 ${
              activeTab === "full_print" ? "block" : "hidden print:block"
            }`}
          >
            {/* Clinic Header */}
            <div className="border-b-2 border-slate-900 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ONCOPATH_LOGO_DATA_URI} alt="OncoPath Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    肺部疾病长程随访与临床时序摘要
                  </h1>
                  <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                    系统：OncoPath 循证医学导航平台 · 结构化病历归集
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right text-[11px] sm:text-xs text-slate-500 flex sm:flex-col justify-between sm:justify-start gap-1">
                <span>生成日期：{new Date().toISOString().split("T")[0]}</span>
                <span>随访记录：{events.length} 次</span>
              </div>
            </div>

            {/* Core Executive Summary Box */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">最新影像状态</span>
                <div className="font-extrabold text-slate-900 mt-0.5 break-words">
                  {latestImaging?.keyFindings?.sizeMm !== undefined
                    ? `${latestImaging.keyFindings.sizeMm} mm (${latestImaging.eventDate.substring(0, 7)})`
                    : "已行手术切除"}
                </div>
              </div>
              <div className="p-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">术后病理分期</span>
                <div className="font-extrabold text-emerald-700 mt-0.5 break-words">
                  {latestPathology?.keyFindings?.stage || "未行手术切除 (影像随访中)"}
                </div>
              </div>
              <div className="p-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">最新 CEA 标志物</span>
                <div className="font-extrabold text-slate-900 mt-0.5 break-words">
                  {latestSerology?.keyFindings?.cea !== undefined
                    ? `${latestSerology.keyFindings.cea} ng/mL`
                    : "未查/基线参考"}
                </div>
              </div>
              <div className="p-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">驱动基因突变</span>
                <div className="font-extrabold text-blue-700 mt-0.5 break-words">
                  {geneSummaryText}
                </div>
              </div>
            </div>

            {/* Section 1: Imaging Chronology */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <Scan className="w-3.5 h-3.5 text-blue-600" />
                <span>1. 历次影像学演变时序 (Imaging Timeline)</span>
              </h4>
              <div className="overflow-x-auto -mx-1 sm:mx-0 border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left border-collapse min-w-[480px]">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-2 sm:p-2.5 whitespace-nowrap">检查日期</th>
                      <th className="p-2 sm:p-2.5 whitespace-nowrap">检查项目 / 医院</th>
                      <th className="p-2 sm:p-2.5 whitespace-nowrap">长径 (mm)</th>
                      <th className="p-2 sm:p-2.5 whitespace-nowrap">实性比 (CTR)</th>
                      <th className="p-2 sm:p-2.5">核心结论</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {imagingList.map((im, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 sm:p-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">{im.eventDate}</td>
                        <td className="p-2 sm:p-2.5 text-slate-700 whitespace-nowrap">
                          <div className="font-semibold">{im.title}</div>
                          <div className="text-[10px] text-slate-400">{im.hospital}</div>
                        </td>
                        <td className="p-2 sm:p-2.5 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {im.keyFindings?.sizeMm !== undefined ? `${im.keyFindings.sizeMm} mm` : "-"}
                        </td>
                        <td className="p-2 sm:p-2.5 font-mono whitespace-nowrap">
                          {im.keyFindings?.ctr !== undefined ? `${(im.keyFindings.ctr * 100).toFixed(0)}%` : "-"}
                        </td>
                        <td className="p-2 sm:p-2.5 text-slate-600 min-w-[140px]">{im.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Surgery, Pathology & Molecular Biomarkers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <Microscope className="w-3.5 h-3.5 text-purple-600" />
                <span>2. 手术干预、病理与分子靶向 (Surgery, Pathology & NGS)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {surgeryMilestone && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{surgeryMilestone.eventDate} 手术记录</span>
                    </div>
                    <div className="text-slate-600 mt-1 leading-relaxed">{surgeryMilestone.summary}</div>
                  </div>
                )}
                {latestPathology && (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Microscope className="w-3.5 h-3.5 text-purple-600" />
                      <span>{latestPathology.eventDate} 病理组织学</span>
                    </div>
                    <div className="text-slate-600 mt-1 leading-relaxed">{latestPathology.summary}</div>
                  </div>
                )}
                {latestMolecular ? (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                    <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Dna className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{latestMolecular.eventDate} 分子检测</span>
                    </div>
                    <div className="text-indigo-950 mt-1 leading-relaxed font-medium">
                      {latestMolecular.summary}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Dna className="w-3.5 h-3.5 text-slate-500" />
                      <span>驱动基因检测</span>
                    </div>
                    <div className="text-slate-500 mt-1 leading-relaxed">
                      {geneSummaryText}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Tumor Markers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <TestTube2 className="w-3.5 h-3.5 text-rose-600" />
                <span>3. 血清肿瘤标志物随访轨迹 (Biomarkers)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {serologyList.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
                    <div className="font-bold text-slate-900">{s.eventDate}</div>
                    <div className="text-slate-600 mt-0.5 truncate">
                      CEA: <span className="font-bold text-rose-700">{s.keyFindings?.cea ?? "-"}</span> ng/mL
                    </div>
                    {s.keyFindings?.cyfra211 && (
                      <div className="text-slate-500 text-[11px] truncate">
                        CYFRA: {s.keyFindings.cyfra211}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Print Footer Disclaimer */}
            <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center leading-relaxed">
              注：本清单由患者临床检查报告结构化提取生成，仅供临床门诊交流参考，不替代医师现场全面诊疗。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

