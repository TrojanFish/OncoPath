import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { computeClinicalTnmStage } from '@/lib/staging';

const SYSTEM_PROMPT = `
你是一位国际顶级胸部肿瘤多学科诊疗 (MDT) 专家，精通【放射科胸部 CT 影像学诊断】与【病理组织学诊断】。
你的任务是从患者上传的医学报告（可能是术前胸部CT影像报告、术后病理报告、穿刺活检报告、或其纸质照片截图）中，高精度提取关键临床决策指标，并严格输出为 JSON 格式。

【第一步：智能判断报告模态 (reportType)】
- "ct_imaging": 术前/体检胸部 CT、低剂量 CT、高分辨薄层 CT 影像报告（特点：描述结节大小、磨玻璃、实性成分、毛刺、分叶、胸膜牵拉、Lung-RADS 等）。
- "pathology": 术后手术标本病理组织学诊断、穿刺活检、免疫组化报告（特点：描述腺泡/贴壁/微乳头等组织学亚型、STAS气道播散、LVI脉管瘤栓、胸膜侵犯VPI、切缘R0等）。
- "comprehensive": 同时包含 CT 影像与术后病理的综合出院/会诊报告。

【第二步：CT 影像学特征提取规则】：
1. noduleLocation: 结节所在肺叶与肺段（例如 "右肺上叶尖段"、"左肺下叶背段"、"右肺中叶"）。若未提及填 null。
2. noduleType: 
   - "mixed_ggo": 混合磨玻璃结节 / 部分实性结节 / 混杂磨玻璃 (mGGO / Part-solid)
   - "pure_ggo": 纯磨玻璃结节 (pGGO / Pure ground glass)
   - "pure_solid": 纯实性结节 (Solid nodule)
3. 结节大小与实性浸润大小（单位统一换算为厘米 cm）：
   - tumorSize: 结节大体最大长径（例如 12mm ➔ 1.2，1.5*1.3cm ➔ 1.5）。
   - solidSize: CT 实性/浸润成分大小（例如 "实性成分约 5mm" ➔ 0.5；纯磨玻璃 ➔ 0；纯实性 ➔ 等同于 tumorSize）。
   - ctr: 实性成分比例 (0 到 1.0，如 solidSize / tumorSize)。
4. imagingFeatures: 提取所有出现的恶性影像征象列表（必须是字符串数组，例如 ["分叶征", "毛刺征", "胸膜牵拉征", "血管穿行集束征", "空泡征", "磨玻璃晕征", "支气管充气征"]）。
5. lungRads: 放射科 Lung-RADS 分级（如 "3", "4A", "4B", "4X"；若未提及填 null）。
6. malignancyRisk: 恶性概率预估 ("low" | "moderate" | "high")。
   - "low": <6mm 纯磨玻璃、边界清晰、无毛刺分叶。
   - "moderate": 6-10mm 纯磨玻璃或实性成分 <3mm 的混合磨玻璃。
   - "high": 混合磨玻璃实性成分 ≥5mm、伴分叶毛刺胸膜凹陷、或 Lung-RADS 4A/4B/4X。
7. clinicalRecommendation: 提取报告中的随访或手术建议（例如 "建议3-6个月薄层CT动态复查"、"建议胸外科微创手术会诊评估"）。

【第三步：病理报告阴阳性识别规则（术后确诊报告核心）】：
- 气道播散 (STAS): "未见" / "STAS (-)" ➔ "negative"; "见" / "STAS (+)" ➔ "positive"; 未提及 ➔ "negative"
- 脉管内癌栓 (LVI): "未见" / "LVI (-)" ➔ "negative"; "见" / "LVI (+)" ➔ "positive"; 未提及 ➔ "negative"
- 脏层胸膜侵犯 (VPI): "未见" / "PL0" ➔ "negative"; "突破脏层胸膜" / "PL1" / "PL2" ➔ "positive"; 未提及 ➔ "negative"
- 切缘状态 (Margin): "切缘阴性" / "切缘未见癌" / "R0" ➔ "negative"; "切缘阳性" / "R1" ➔ "positive"; 未提及 ➔ "negative"

请严格遵守以下 JSON 结构输出，不要包含任何 Markdown 标记或多余的文字：
{
  "reportType": "ct_imaging" | "pathology" | "comprehensive",
  "noduleLocation": String | null,
  "noduleType": "mixed_ggo" | "pure_ggo" | "pure_solid",
  "tumorSize": Number (厘米，例如 1.2),
  "solidSize": Number (厘米，例如 0.5),
  "ctr": Number (例如 0.42),
  "imagingFeatures": ["分叶征", "毛刺征", ...],
  "lungRads": String | null,
  "malignancyRisk": "low" | "moderate" | "high",
  "clinicalRecommendation": String,
  "age": Number | null,
  "sex": "male" | "female" | null,
  "organ": "lung",
  "histology": String | null (例如: "adenocarcinoma", "squamous_cell_carcinoma", "unknown"),
  "tStage": "Tis" | "T1mi" | "T1a" | "T1b" | "T1c" | "T2a" | "T2b" | "T3" | "T4" | null,
  "nStage": "N0" | "N1" | "N2" | "N3" | null,
  "stas": "positive" | "negative",
  "vpi": "positive" | "negative",
  "lvi": "positive" | "negative",
  "marginStatus": "positive" | "negative",
  "surgeryType": "lobectomy" | "segmentectomy" | "wedge" | "unknown" | null,
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

    // Precise normalization of positive/negative strings
    const normalizeFlag = (val: any): "positive" | "negative" => {
      if (val === true || val === "positive" || val === "yes" || val === "1") return "positive";
      return "negative";
    };

    const isCtReport = extracted.reportType === "ct_imaging";
    const stas = normalizeFlag(extracted.stas);
    const vpi = normalizeFlag(extracted.vpi);
    const lvi = normalizeFlag(extracted.lvi);
    const marginStatus = normalizeFlag(extracted.marginStatus);

    // Compute accurate TNM Stage using AJCC 8th/9th Solid Component Formula
    const stagingCalc = computeClinicalTnmStage({
      noduleType: extracted.noduleType || "mixed_ggo",
      tumorSize: extracted.tumorSize ?? 1.5,
      solidSize: extracted.solidSize ?? (isCtReport && extracted.noduleType === "pure_ggo" ? 0 : 0.8),
      ctr: extracted.ctr ?? 0.53,
      nStage: extracted.nStage || "N0",
      vpi: vpi,
      stas: stas,
      lvi: lvi,
      marginStatus: marginStatus,
    });

    // Determine State Engine stage & dynamic actions based on report modality
    let currentStage = "post_op";
    let riskLevel = "low";
    let nextAction = "";
    let psychState = "understanding";

    if (isCtReport) {
      currentStage = "evaluation"; // Pre-op CT Evaluation Stage
      riskLevel = extracted.malignancyRisk || "moderate";
      psychState = riskLevel === "high" ? "fear" : "understanding";
      nextAction = extracted.clinicalRecommendation || (
        riskLevel === "high" 
          ? "CT 显示结节具有恶性浸润特征，建议尽早至三甲胸外科门诊进行多学科会诊，评估胸腔镜解剖性肺段/肺叶切除微创手术。"
          : "当前结节恶性度较低或处于早期随访范围。建议遵照 Fleischner 指南于 3~6 个月后复查薄层胸部 CT，对比结节大小与密度变化。"
      );
    } else {
      currentStage = "post_op"; // Post-op Pathology Stage
      const hasHighRiskPathology = stas === "positive" || vpi === "positive" || lvi === "positive" || stagingCalc.nStage !== "N0";
      riskLevel = hasHighRiskPathology ? "moderate" : "low";
      psychState = hasHighRiskPathology ? "decision" : "understanding";
      nextAction = hasHighRiskPathology
        ? "存在局部病理危险因子，建议尽早与主治医生讨论随访或辅助治疗方案。"
        : "属于早期低复发风险组。建议遵医嘱规律随访，无需过度化疗。";
    }

    const safeData = {
      reportType: extracted.reportType || "ct_imaging",
      noduleLocation: extracted.noduleLocation || "肺叶结节",
      imagingFeatures: Array.isArray(extracted.imagingFeatures) ? extracted.imagingFeatures : [],
      lungRads: extracted.lungRads || null,
      malignancyRisk: extracted.malignancyRisk || "moderate",
      clinicalRecommendation: extracted.clinicalRecommendation || nextAction,

      age: extracted.age || 55,
      sex: extracted.sex || "male",
      gender: extracted.sex || "male",
      organ: "lung",
      histology: extracted.histology || (isCtReport ? "adenocarcinoma" : "adenocarcinoma"),
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
      surgeryType: extracted.surgeryType || (isCtReport ? "unknown" : "segmentectomy"),
      grade: extracted.grade || "2",
      iaslcGrade: extracted.grade || "2",
      
      // State Engine
      currentStage: currentStage,
      riskLevel: riskLevel,
      nextAction: nextAction,
      psychologicalState: psychState
    };

    return NextResponse.json({ success: true, data: safeData });
  } catch (error: any) {
    console.error('Error parsing report via Gemini:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
