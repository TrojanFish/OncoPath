import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { verifyAdminRequest } from '@/lib/adminAuth';

const CLINICAL_EXTRACTION_PROMPT = `
你是一位资深的肿瘤学医学信息学专家与生物统计学家。你的任务是从提供的医学学术论文摘要或详情（来自 PubMed / Europe PMC）中，精确提取结构化的临床证据指标，并严格输出为 JSON 格式。

请提取以下字段：
{
  "title": String (论文标题),
  "journal": String | null (期刊名称),
  "year": Number | null (发表年份),
  "authors": String | null (作者),
  "doi": String | null (DOI 标识符),
  "pubmedId": String | null (PMID),
  "studyType": "rct" | "meta_analysis" | "prospective_multicenter" | "retrospective_multicenter" | "retrospective",
  "evidenceLevel": 1 | 2 | 3 | 4 | 5,
  "patientN": Number | null (受试者总样本量/队列人数),
  "applicableStages": Array of String (如 ["IA", "IB", "IIIA"]),
  "relevantFactors": Array of String (如 ["STAS", "CTR", "EGFR", "VPI", "wedge", "lobectomy"]),
  "hr": Number | null (主要终点 Hazard Ratio 数值),
  "ciLow": Number | null (95% CI 下限),
  "ciHigh": Number | null (95% CI 上限),
  "rfs5Year": String | null (5年无复发生存率如 "98.2%"),
  "biomarkerDetails": String | null (分子靶点与生物标志物亚型，如 "EGFR 19del/L858R", "PD-L1 TPS>=50%", "KRAS G12C"),
  "interventionArm": String | null (治疗干预组 vs 对照组对比，如 "试验组: 奥希替尼 80mg vs 对照组: 安慰剂"),
  "riskReduction": String | null (相对风险降低率，如 "-77% (HR=0.23)"),
  "summary": String (100-200字的研究背景与方法总结),
  "conclusion": String (100-200字的核心临床结论与预后指导),
  "keywords": String (关键词列表，英文逗号分隔)
}
`;

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ success: false, error: "未授权的访问：请先登录管理员账户" }, { status: 401 });
    }

    const body = await request.json();
    const { action = "search", query, pmid, doi, article } = body;

    // Action 1: Search Europe PMC / PubMed
    if (action === "search") {
      let searchQuery = (query || "").trim();
      if (pmid) {
        searchQuery = `EXT_ID:${pmid.trim()} SRC:MED`;
      } else if (doi) {
        searchQuery = `DOI:"${doi.trim()}"`;
      }

      if (!searchQuery) {
        return NextResponse.json({ success: false, error: "请输入检索关键词、PMID 或 DOI" }, { status: 400 });
      }

      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
        searchQuery
      )}&format=json&pageSize=6&resultType=core`;

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        throw new Error(`Europe PMC API 请求失败 (${res.status})`);
      }

      const data = await res.json();
      const rawList = data.resultList?.result || [];

      const results = rawList.map((item: any) => ({
        id: item.id || item.pmid || item.doi,
        title: item.title?.replace(/<[^>]*>?/gm, '') || "Untitled Study",
        journal: item.journalTitle || item.journalInfo?.journal?.title || "",
        year: item.pubYear ? parseInt(item.pubYear) : null,
        authors: item.authorString || "",
        doi: item.doi || "",
        pmid: item.pmid || "",
        abstractText: item.abstractText?.replace(/<[^>]*>?/gm, '') || "无公开摘要文本",
        isOpenAccess: item.isOpenAccess === "Y",
      }));

      return NextResponse.json({ success: true, results });
    }

    // Action 2: Extract structured indicators from an article via Gemini
    if (action === "extract") {
      if (!article || !article.title) {
        return NextResponse.json({ success: false, error: "缺少文献数据" }, { status: 400 });
      }

      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ success: false, error: "系统未配置 GEMINI_API_KEY" }, { status: 500 });
      }

      const inputText = `
【论文标题】：${article.title}
【发表期刊】：${article.journal} (${article.year})
【作者群】：${article.authors}
【DOI / PMID】：${article.doi || "无"} / ${article.pmid || "无"}
【论文摘要与正文文本】：
${article.abstractText || ""}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          inputText,
          "请从以上论文摘要及信息中提取 17 项结构化临床证据指标（含分子靶点、干预对照组、风险降低率）。"
        ],
        config: {
          systemInstruction: CLINICAL_EXTRACTION_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      let cleaned = (response.text || "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) cleaned = match[0];

      const extracted = JSON.parse(cleaned);

      const structuredResult = {
        title: extracted.title || article.title,
        journal: extracted.journal || article.journal || "Unknown Journal",
        year: extracted.year || article.year || new Date().getFullYear(),
        authors: extracted.authors || article.authors || "Unknown Authors",
        doi: extracted.doi || article.doi || "",
        pubmedId: extracted.pubmedId || article.pmid || "",
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
        summary: extracted.summary || article.abstractText?.slice(0, 200) || "无摘要",
        conclusion: extracted.conclusion || "基于 PubMed 摘要提取的临床结论。",
        keywords: extracted.keywords || "lung cancer, evidence, prognosis",
      };

      return NextResponse.json({ success: true, data: structuredResult });
    }

    return NextResponse.json({ success: false, error: "未知的 action 操作" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in fetch-pubmed route:", error);
    return NextResponse.json({ success: false, error: error.message || "PubMed 检索抓取失败" }, { status: 500 });
  }
}
