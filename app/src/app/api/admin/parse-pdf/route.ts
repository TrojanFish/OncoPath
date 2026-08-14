import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { verifyAdminRequest } from '@/lib/adminAuth';

const PDF_EXTRACTION_PROMPT = `
你是一位资深的肿瘤学医学信息学专家与生物统计学家。你的任务是从上传的医学学术论文/临床试验报告（PDF格式）中，精确提取结构化的临床证据指标，并严格输出为 JSON 格式。

请尽可能提取以下核心字段。如果文献中没有明确提及某字段，请填入合理的值或 null，不要伪造数据：
{
  "title": String (论文的完整英文或中文标题),
  "journal": String | null (发表期刊名称，例如 "Journal of Thoracic Oncology", "JCO", "Lancet Oncology", "Chest"),
  "year": Number | null (发表年份，四位数如 2022),
  "authors": String | null (例如 "Kadota K, et al." 或主要作者),
  "doi": String | null (论文 DOI 标识符，例如 "10.1200/JCO.2017.74.8871"),
  "pubmedId": String | null (PubMed PMID 如有),
  "studyType": "rct" | "meta_analysis" | "prospective_multicenter" | "retrospective_multicenter" | "retrospective",
  "evidenceLevel": 1 | 2 | 3 | 4 | 5 (5为最高级别RCT/Meta，4为多中心回顾/前瞻，3为单中心，2为小型病例，1为观点),
  "patientN": Number | null (研究涉及的患者总样本量/队列人数，例如 1113),
  "applicableStages": Array of String (适用的肺癌分期，如 ["IA", "IB", "IIIA"] 等),
  "relevantFactors": Array of String (相关的病理与临床特征，如 ["STAS", "CTR", "VPI", "LVI", "EGFR", "wedge", "lobectomy", "segmentectomy"]),
  "hr": Number | null (主要终点如复发或死亡的 Hazard Ratio 风险比数值，例如 1.87 或 2.86),
  "ciLow": Number | null (95% CI 下限，如 1.52),
  "ciHigh": Number | null (95% CI 上限，如 2.29),
  "rfs5Year": String | null (5年无复发生存率数据，例如 "98.2%" 或 "68.5%"),
  "biomarkerDetails": String | null (分子靶点与生物标志物亚型，如 "EGFR 19del/L858R", "PD-L1 TPS>=50%", "KRAS G12C"),
  "interventionArm": String | null (治疗干预组 vs 对照组对比，如 "试验组: 奥希替尼 80mg vs 对照组: 安慰剂"),
  "riskReduction": String | null (相对风险降低率，如 "-77% (HR=0.23)"),
  "summary": String (100-200字的研究背景、队列设计与主要方法总结),
  "conclusion": String (100-200字的核心临床结论与用药/手术预后指导),
  "keywords": String (以英文逗号分隔的关键词列表，例如 "STAS, lung adenocarcinoma, sublobar resection, prognosis")
}

规则：
1. 输出必须为合法纯 JSON 格式，不要包含任何 Markdown 代码块包裹符。
2. 提取数据必须忠实于 PDF 原文，统计数据（样本量、HR值、百分比）力求高度准确。
`;

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "未授权的访问：请先登录管理员账户" }, { status: 401 });
    }

    const { pdfBase64, fileName } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "系统未配置 GEMINI_API_KEY 环境变量" }, { status: 500 });
    }

    if (!pdfBase64) {
      return NextResponse.json({ success: false, error: "未上传任何 PDF 文件数据" }, { status: 400 });
    }

    // Call Gemini 2.5 Flash with native PDF multimodal support
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: pdfBase64,
            mimeType: 'application/pdf',
          }
        },
        "请完整阅读并解析该医学研究论文，按要求提取结构化临床证据指标（含分子靶点、干预对照组、风险降低率）。"
      ],
      config: {
        systemInstruction: PDF_EXTRACTION_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    let cleanedText = (response.text || "").trim();
    if (!cleanedText) {
      throw new Error("模型返回为空，可能 PDF 文件过大或无法读取");
    }

    // Regex match JSON object if surrounded by markdown fences
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const extracted = JSON.parse(cleanedText);

    // Provide safe defaults
    const resultData = {
      title: extracted.title || fileName || "未命名医学研究论文",
      journal: extracted.journal || "Unknown Journal",
      year: extracted.year || new Date().getFullYear(),
      authors: extracted.authors || "Unknown Authors",
      doi: extracted.doi || "",
      pubmedId: extracted.pubmedId || "",
      studyType: extracted.studyType || "retrospective",
      evidenceLevel: extracted.evidenceLevel || 4,
      patientN: extracted.patientN || 0,
      applicableStages: Array.isArray(extracted.applicableStages) ? extracted.applicableStages : ["IA", "IB"],
      relevantFactors: Array.isArray(extracted.relevantFactors) ? extracted.relevantFactors : ["STAS", "prognosis"],
      hr: extracted.hr !== undefined ? Number(extracted.hr) : null,
      ciLow: extracted.ciLow !== undefined ? Number(extracted.ciLow) : null,
      ciHigh: extracted.ciHigh !== undefined ? Number(extracted.ciHigh) : null,
      rfs5Year: extracted.rfs5Year || "",
      biomarkerDetails: extracted.biomarkerDetails || "",
      interventionArm: extracted.interventionArm || "",
      riskReduction: extracted.riskReduction || "",
      url: extracted.url || (extracted.doi ? `https://doi.org/${extracted.doi}` : (extracted.pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${extracted.pubmedId}/` : "")),
      summary: extracted.summary || "基于上传 PDF 提取的研究背景与方法。",
      conclusion: extracted.conclusion || "基于上传 PDF 提取的临床预后结论。",
      keywords: extracted.keywords || "lung cancer, oncology, evidence",
      pdfFileName: fileName || "uploaded_paper.pdf",
    };

    return NextResponse.json({ success: true, data: resultData });
  } catch (error: any) {
    console.error('Error parsing PDF paper via Gemini:', error);
    return NextResponse.json({ success: false, error: error.message || "PDF 解析失败" }, { status: 500 });
  }
}
