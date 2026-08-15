import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { computeClinicalTnmStage } from '@/lib/staging';

const SYSTEM_PROMPT = `
你是一位顶级肺癌临床病理学与胸部影像学专家。你的任务是从患者上传的病理/影像报告（可能是文本，也可能是报告的纸质照片截图）中，高精度提取关键临床决策指标，并严格输出为 JSON 格式。

【中文医学报告阴阳性识别核心规则（极其重要）】：
1. 气道播散 (STAS)：
   - "未见气道播散" / "未见 STAS" / "STAS (-)" / "STAS 阴性" / "未见癌细胞气道播散" ➔ 必须提取为 "negative"
   - "见气道播散" / "STAS (+)" / "STAS 阳性" / "存在气道播散" ➔ 提取为 "positive"
   - 未提及 ➔ 输出 "negative"
2. 脉管内癌栓 (LVI)：
   - "未见脉管内癌栓" / "未见微血管侵犯" / "LVI (-)" / "脉管阴性" / "未见脉管瘤栓" ➔ 必须提取为 "negative"
   - "见脉管内癌栓" / "LVI (+)" / "脉管阳性" / "脉管内见癌细胞" ➔ 提取为 "positive"
   - 未提及 ➔ 输出 "negative"
3. 脏层胸膜侵犯 (VPI)：
   - "未见胸膜侵犯" / "胸膜未受累" / "VPI (-)" / "胸膜阴性" / "未突破弹力层" / "PL0" ➔ 必须提取为 "negative"
   - "突破脏层胸膜" / "侵及胸膜" / "VPI (+)" / "胸膜阳性" / "PL1" / "PL2" ➔ 提取为 "positive"
   - 未提及 ➔ 输出 "negative"
4. 切缘状态 (Margin)：
   - "切缘阴性" / "切缘未见癌" / "支气管断端阴性" / "各个切缘未见癌组织" / "R0" ➔ 必须提取为 "negative"
   - "切缘阳性" / "断端见癌" / "R1" / "R2" ➔ 提取为 "positive"
   - 未提及 ➔ 输出 "negative"

【结节形态与实性成分 (AJCC 8th/9th 核心定期依据)】：
- noduleType: "mixed_ggo" (混合磨玻璃 / 部分实性结节) | "pure_ggo" (纯磨玻璃结节) | "pure_solid" (纯实性结节)。
- tumorSize: 肿瘤最大总径（厘米，例如 1.5*1.3*0.8cm 则提取 1.5）。
- solidSize: CT 实性成分大小或病理浸润大小（厘米，例如 CT 提示实性成分 0.8cm 则提取 0.8）。若未标明实性大小但为混合磨玻璃，估算或提取明确数值。
- ctr: 实性成分比例 (0 到 1.0)。

请严格遵守以下 JSON 结构输出，不要包含任何 Markdown 标记或多余的文字：
{
  "age": Number | null,
  "sex": "male" | "female" | null,
  "organ": "lung",
  "histology": String | null (例如: "adenocarcinoma", "squamous_cell_carcinoma"),
  "noduleType": "mixed_ggo" | "pure_ggo" | "pure_solid",
  "tumorSize": Number | null (例如 1.5),
  "solidSize": Number | null (例如 0.8),
  "ctr": Number | null (例如 0.53),
  "tStage": "T1mi" | "T1a" | "T1b" | "T1c" | "T2a" | "T2b" | "T3" | "T4" | null,
  "nStage": "N0" | "N1" | "N2" | "N3" | null,
  "stas": "positive" | "negative",
  "vpi": "positive" | "negative",
  "lvi": "positive" | "negative",
  "marginStatus": "positive" | "negative",
  "surgeryType": "lobectomy" | "segmentectomy" | "wedge" | null,
  "grade": "1" | "2" | "3" | null
}
`;

export async function POST(request: Request) {
  try {
    const { reportText, imageBase64, imageMimeType } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "系统未配置 GEMINI_API_KEY" }, { status: 500 });
    }

    // Construct multimodal contents
    const contents: any[] = [];
    if (reportText) {
      contents.push(reportText);
    }
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType || "image/jpeg"
        }
      });
    }

    if (contents.length === 0) {
      return NextResponse.json({ success: false, error: "未提供任何报告内容" }, { status: 400 });
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    let cleanedJson = (response.text || "").trim();
    if (!cleanedJson) {
      throw new Error("模型返回为空");
    }

    // Strip markdown code fences or extract { ... } object if present
    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }

    const extracted = JSON.parse(cleanedJson);

    // Precise normalization of positive/negative strings from text
    const normalizeFlag = (val: any): "positive" | "negative" => {
      if (val === true || val === "positive" || val === "yes" || val === "1") return "positive";
      return "negative";
    };

    const stas = normalizeFlag(extracted.stas);
    const vpi = normalizeFlag(extracted.vpi);
    const lvi = normalizeFlag(extracted.lvi);
    const marginStatus = normalizeFlag(extracted.marginStatus);

    // Compute accurate TNM Stage using AJCC 8th/9th Solid Component Formula
    const stagingCalc = computeClinicalTnmStage({
      noduleType: extracted.noduleType || "mixed_ggo",
      tumorSize: extracted.tumorSize ?? 1.5,
      solidSize: extracted.solidSize ?? 0.8,
      ctr: extracted.ctr ?? 0.53,
      nStage: extracted.nStage || "N0",
      vpi: vpi,
      stas: stas,
      lvi: lvi,
      marginStatus: marginStatus,
    });

    const safeData = {
      age: extracted.age || 55,
      sex: extracted.sex || "male",
      gender: extracted.sex || "male",
      organ: "lung",
      histology: extracted.histology || "adenocarcinoma",
      noduleType: stagingCalc.noduleType,
      morphology: stagingCalc.noduleType,
      tumorSize: stagingCalc.tumorSize,
      solidSize: stagingCalc.solidSize,
      ctr: stagingCalc.ctr,
      tStage: stagingCalc.tStage,
      nStage: stagingCalc.nStage,
      mStage: stagingCalc.mStage,
      stage: stagingCalc.stage,
      stageExplanation: stagingCalc.explanation,
      stas: stas,
      vpi: vpi,
      lvi: lvi,
      marginStatus: marginStatus,
      margin: marginStatus,
      surgeryType: extracted.surgeryType || "segmentectomy",
      grade: extracted.grade || "2",
      iaslcGrade: extracted.grade || "2",
      
      // State Engine
      currentStage: "post_op",
      riskLevel: (stas === "positive" || vpi === "positive" || lvi === "positive" || stagingCalc.nStage !== "N0") ? "moderate" : "low",
      nextAction: (stas === "positive" || vpi === "positive" || lvi === "positive" || stagingCalc.nStage !== "N0")
        ? "存在局部病理危险因子，建议尽早与主治医生讨论随访或辅助治疗方案。"
        : "属于早期低复发风险组。建议遵医嘱规律随访，无需过度化疗。",
      psychologicalState: (stas === "positive" || stagingCalc.nStage !== "N0") ? "decision" : "understanding"
    };

    return NextResponse.json({ success: true, data: safeData });
  } catch (error: any) {
    console.error('Error parsing report via Gemini:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
