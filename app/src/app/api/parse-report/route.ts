import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { computeClinicalTnmStage } from '@/lib/staging';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeClinicalText } from '@/lib/privacy';
import { logEvent } from '@/lib/logger';

const SYSTEM_PROMPT = `
你是一位国际顶级胸部肿瘤多学科诊疗 (MDT) 专家，精通【放射科胸部 CT 影像学诊断】、【病理组织学诊断】、【全身转移排查影像学（脑MRI、腹部B超、骨扫描、PET-CT）】与【血液肿瘤标志物检验】。
你的任务是从患者上传的医学报告（可能是术前胸部CT影像报告、术后病理报告、脑部MRI、腹部/浅表B超、骨显像ECT、PET-CT、血液化验单、或多张纸质报告照片截图）中，高精度提取关键临床决策指标，并严格输出为 JSON 格式。

【重要说明：多报告联合跨模态解析】
患者可能同时上传了多张图片或多段文本（例如：第1张为术前胸部CT，第2张为脑部MRI，第3张为血液化验单，第4张为术后病理）。你必须综合所有图片与文本的医学信息进行交叉融合提取！

【第一步：智能判断报告模态 (reportType)】
- "ct_imaging": 术前/体检胸部 CT、低剂量 CT、高分辨薄层 CT 影像报告。
- "pathology": 术后手术标本病理组织学诊断、穿刺活检、免疫组化报告。
- "systemic_staging": 脑部 MRI、腹部/浅表超声、骨扫描 ECT、全身 PET-CT 等全身转移排查报告。
- "comprehensive": 同时包含 CT 影像、病理或全身排查的多张联合报告或出院小结。

【第二步：CT 影像学特征、主病灶与多发结节 (Multiple Nodules) 提取规则】：
1. 主病灶认定（决定分期与恶性风险的核心）：
   - 提取最大、最可疑或实性成分最高的结节作为主病灶（noduleLocation, noduleType, tumorSize, solidSize, ctr）。
   - noduleLocation: 主结节所在肺叶与肺段（例如 "右肺上叶尖段"、"左肺下叶背段"）。
   - noduleType: "mixed_ggo" (混合磨玻璃) | "pure_ggo" (纯磨玻璃) | "pure_solid" (纯实性)。
   - tumorSize: 主结节全径厘米 (例如 1.5)。
   - solidSize: CT 实性成分最大径厘米 (例如 0.8；纯磨玻璃为 0；纯实性等同于 tumorSize)。
   - ctr: 实性成分比例 (solidSize ÷ tumorSize)。
   - imagingFeatures: 恶性影像征象数组 (如 ["分叶征", "毛刺征", "胸膜牵拉征", "空泡征", "血管集束征", "磨玻璃晕征", "支气管充气征"])。
   - lungRads: 放射科 Lung-RADS 分级 (如 "3", "4A", "4B", "4X"；若未提及填 null)。
   - malignancyRisk: 恶性概率预估 ("low" | "moderate" | "high")。
   - clinicalRecommendation: 随访或手术建议。
2. 多发性结节与伴随微小结节提取 (isMultipleNodules & secondaryNodules)：
   - 若报告中提及“双肺多发结节”、“另见数个微小结节”等，设 isMultipleNodules 为 true。
   - secondaryNodules 数组提取除主病灶外的其他次要结节，每项结构为：
     { "id": "sec_1", "location": "右肺下叶", "sizeMm": 4, "type": "pure_ggo" | "solid" | "calcification", "isBenignTendency": true, "note": "微小纯磨玻璃结节，考虑炎性或良性随访" }
3. 检查日期与时序随访提取 (reportDate & followUpHistory)：
   - reportDate: 提取报告上的检查日期 (如 "2024-03-12" 或 "2024-03"；若未提及填 null)。
   - 若报告中包含了历史多次对比数据（例如“2023-05月片示6mm，2024-03月片示8mm”），请提取至 followUpHistory 数组中。

【第三步：血液肿瘤标志物提取规则 (Tumor Markers)】：
若报告包含血液生化化验，提取数值（若未检测或未提及填 null）：
- cea: 癌胚抗原数值 (ng/mL，例如 2.8)
- cyfra211: 细胞角蛋白19片段 (ng/mL，例如 1.9)
- nse: 神经元特异性烯醇化酶 (ng/mL，例如 12.5)
- scc: 鳞状细胞癌抗原 (ng/mL，例如 0.8)
- proGrp: 胃泌素释放肽前体 (pg/mL，例如 35.2)

【第四步：全身转移排查与伴发良性病变识别规则（M0 定心丸核心）】：
- 脑部增强 MRI (brainMri): "未见异常/未见转移" ➔ "negative"; "见转移灶/占位" ➔ "positive"; 未提及 ➔ "not_performed"
- 腹部与肾上腺超声/CT (abdominalUltrasound): "未见异常" ➔ "negative"; "见肝囊肿/血管瘤/胆囊息肉/肾囊肿等良性病变" ➔ "benign_findings"; "提示可疑转移" ➔ "positive"; 未提及 ➔ "not_performed"
- 全身骨显像 ECT (boneScan): "未见异常骨代谢/骨质完整" ➔ "negative"; "见转移骨破坏" ➔ "positive"; 未提及 ➔ "not_performed"
- 颈部/锁骨上淋巴结 (neckLymphNodes): "未见肿大淋巴结" ➔ "negative"; "提示转移 (N3)" ➔ "positive"; 未提及 ➔ "not_performed"
- 全身 PET-CT (petCt): "未见远处异常高代谢" ➔ "negative"; "提示远处转移 (M1)" ➔ "positive"; 未提及 ➔ "not_performed"
- 伴发良性病变提取 (benignFindings): 字符串数组，如 ["肝囊肿", "肝内钙化灶", "胆囊息肉", "肾囊肿", "甲状腺结节TI-RADS 2类", "肺内陈旧性纤维钙化灶"]
- 全身排查确认 (systemicStagingConfirmed): 若脑部、腹部或骨扫描中有至少一项确认阴性且无任何阳性转移，设为 true。

【第五步：病理报告阴阳性识别规则（术后确诊报告核心）】：
- 气道播散 (STAS): "未见" / "STAS (-)" ➔ "negative"; "见" / "STAS (+)" ➔ "positive"; 未提及 ➔ "negative"
- 脉管内癌栓 (LVI): "未见" / "LVI (-)" ➔ "negative"; "见" / "LVI (+)" ➔ "positive"; 未提及 ➔ "negative"
- 脏层胸膜侵犯 (VPI): "未见" / "PL0" ➔ "negative"; "突破脏层胸膜" / "PL1" / "PL2" ➔ "positive"; 未提及 ➔ "negative"
- 切缘状态 (Margin): "切缘阴性" / "切缘未见癌" / "R0" ➔ "negative"; "切缘阳性" / "R1" ➔ "positive"; 未提及 ➔ "negative"

请严格遵守以下 JSON 结构输出，不要包含任何 Markdown 标记或多余的文字：
{
  "reportType": "ct_imaging" | "pathology" | "systemic_staging" | "comprehensive",
  "reportDate": String | null,
  "noduleLocation": String | null,
  "noduleType": "mixed_ggo" | "pure_ggo" | "pure_solid",
  "tumorSize": Number (主结节全径厘米，例如 1.5),
  "solidSize": Number (实性成分最大径厘米，例如 0.8),
  "ctr": Number (实性成分最大径除以磨玻璃最大径，例如 0.53),
  "imagingFeatures": ["分叶征", "毛刺征", ...],
  "lungRads": String | null,
  "malignancyRisk": "low" | "moderate" | "high",
  "clinicalRecommendation": String,
  "isMultipleNodules": Boolean,
  "secondaryNodules": [
    {
      "id": "sec_1",
      "location": "右肺下叶",
      "sizeMm": 4,
      "type": "pure_ggo",
      "isBenignTendency": true,
      "note": "微小纯磨玻璃灶，考虑良性/定期随访"
    }
  ],
  "followUpHistory": [
    {
      "id": "hist_1",
      "date": "2023-05-10",
      "tumorSize": 1.2,
      "solidSize": 0.4,
      "ctr": 0.33,
      "note": "初次体检发现"
    }
  ],
  "tumorMarkers": {
    "cea": Number | null,
    "cyfra211": Number | null,
    "nse": Number | null,
    "scc": Number | null,
    "proGrp": Number | null,
    "testDate": String | null
  },
  "brainMri": "negative" | "positive" | "not_performed",
  "abdominalUltrasound": "negative" | "benign_findings" | "positive" | "not_performed",
  "boneScan": "negative" | "positive" | "not_performed",
  "neckLymphNodes": "negative" | "positive" | "not_performed",
  "petCt": "negative" | "positive" | "not_performed",
  "benignFindings": ["肝囊肿", ...],
  "systemicStagingConfirmed": Boolean,
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
  "grade": "1" | "2" | "3" | null,
  "ki67": Number | String | null
}
`;

export async function POST(request: Request) {
  const startTime = Date.now();
  const clientIp = getClientIp(request);

  try {
    // 1. Production Rate Limiting (10 requests per minute per IP for OCR/Multimodal parsing)
    const rateLimit = checkRateLimit(`parse_report_${clientIp}`, { intervalMs: 60 * 1000, maxRequests: 10 });
    if (!rateLimit.success) {
      logEvent({
        level: 'warn',
        endpoint: '/api/parse-report',
        clientIp,
        statusCode: 429,
        action: 'parse_rate_limit_exceeded',
        message: 'Client exceeded report parsing rate limit'
      });
      return NextResponse.json(
        { success: false, error: "解析请求过于频繁，请稍候 1 分钟后重试。" },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { reportText, images, imageBase64, imageMimeType } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      logEvent({
        level: 'error',
        endpoint: '/api/parse-report',
        clientIp,
        statusCode: 500,
        message: 'Missing GEMINI_API_KEY environment variable'
      });
      return NextResponse.json({ success: false, error: "系统未配置 GEMINI_API_KEY" }, { status: 500 });
    }

    // 2. Patient Privacy & PII Sanitization for raw input text
    const sanitizedReportText = reportText ? sanitizeClinicalText(reportText) : "";

    // Construct multimodal contents
    const contents: any[] = [];
    if (sanitizedReportText) {
      contents.push(sanitizedReportText);
    }
    
    // Support multiple images
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img.base64) {
          contents.push({
            inlineData: {
              data: img.base64,
              mimeType: img.mimeType || "image/jpeg"
            }
          });
        }
      }
    } else if (imageBase64) {
      // Backward compatibility for single image
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

    // Process Multiple Nodules
    const isMultipleNodules = Boolean(extracted.isMultipleNodules || (Array.isArray(extracted.secondaryNodules) && extracted.secondaryNodules.length > 0));
    const secondaryNodules = Array.isArray(extracted.secondaryNodules) ? extracted.secondaryNodules.map((sec: any, idx: number) => ({
      id: sec.id || `sec_${idx + 1}`,
      location: sec.location || "伴随结节",
      sizeMm: sec.sizeMm ? parseFloat(String(sec.sizeMm)) : 4,
      type: sec.type || "pure_ggo",
      isBenignTendency: sec.isBenignTendency ?? true,
      imagingFeatures: Array.isArray(sec.imagingFeatures) ? sec.imagingFeatures : [],
      note: sec.note || "微小结节，考虑良性或随访"
    })) : [];

    // Process Follow-up History
    const followUpHistory = Array.isArray(extracted.followUpHistory) ? extracted.followUpHistory.map((hist: any, idx: number) => ({
      id: hist.id || `hist_${idx + 1}`,
      date: hist.date || new Date().toISOString().split('T')[0],
      tumorSize: hist.tumorSize ? parseFloat(String(hist.tumorSize)) : stagingCalc.tumorSize,
      solidSize: hist.solidSize != null ? parseFloat(String(hist.solidSize)) : stagingCalc.solidSize,
      ctr: hist.ctr != null ? parseFloat(String(hist.ctr)) : stagingCalc.ctr,
      noduleType: hist.noduleType || stagingCalc.noduleType,
      lungRads: hist.lungRads || extracted.lungRads || null,
      note: hist.note || ""
    })) : [];

    // Process Tumor Markers
    const rawTm = extracted.tumorMarkers || {};
    const tumorMarkers = {
      cea: rawTm.cea !== undefined && rawTm.cea !== null && rawTm.cea !== "" ? parseFloat(String(rawTm.cea)) : null,
      cyfra211: rawTm.cyfra211 !== undefined && rawTm.cyfra211 !== null && rawTm.cyfra211 !== "" ? parseFloat(String(rawTm.cyfra211)) : null,
      nse: rawTm.nse !== undefined && rawTm.nse !== null && rawTm.nse !== "" ? parseFloat(String(rawTm.nse)) : null,
      scc: rawTm.scc !== undefined && rawTm.scc !== null && rawTm.scc !== "" ? parseFloat(String(rawTm.scc)) : null,
      proGrp: rawTm.proGrp !== undefined && rawTm.proGrp !== null && rawTm.proGrp !== "" ? parseFloat(String(rawTm.proGrp)) : null,
      testDate: rawTm.testDate || extracted.reportDate || null,
      note: rawTm.note || null
    };

    const safeData = {
      reportType: extracted.reportType || "ct_imaging",
      reportDate: extracted.reportDate || null,
      noduleLocation: extracted.noduleLocation || "肺叶结节",
      imagingFeatures: Array.isArray(extracted.imagingFeatures) ? extracted.imagingFeatures : [],
      lungRads: extracted.lungRads || null,
      malignancyRisk: extracted.malignancyRisk || "moderate",
      clinicalRecommendation: extracted.clinicalRecommendation || nextAction,

      // P0-1 Multiple Nodules
      isMultipleNodules,
      secondaryNodules,

      // P0-2 Follow-up History
      followUpHistory,

      // P2-2 Tumor Markers
      tumorMarkers,

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
      ki67: extracted.ki67 || null,
      
      // Systemic Staging & M0 Confirmation
      brainMri: extracted.brainMri || "not_performed",
      abdominalUltrasound: extracted.abdominalUltrasound || "not_performed",
      boneScan: extracted.boneScan || "not_performed",
      neckLymphNodes: extracted.neckLymphNodes || "not_performed",
      petCt: extracted.petCt || "not_performed",
      benignFindings: Array.isArray(extracted.benignFindings) ? extracted.benignFindings : [],
      systemicStagingConfirmed: Boolean(
        extracted.systemicStagingConfirmed || 
        (extracted.brainMri === 'negative' || extracted.abdominalUltrasound === 'negative' || extracted.abdominalUltrasound === 'benign_findings' || extracted.boneScan === 'negative' || extracted.petCt === 'negative')
      ),

      // State Engine
      currentStage: currentStage,
      riskLevel: riskLevel,
      nextAction: nextAction,
      psychologicalState: psychState
    };

    logEvent({
      level: 'info',
      endpoint: '/api/parse-report',
      clientIp,
      durationMs: Date.now() - startTime,
      statusCode: 200,
      aiModel: 'gemini-2.5-flash',
      action: 'report_parsing_completed',
      meta: {
        reportType: safeData.reportType,
        tStage: safeData.tStage,
        nStage: safeData.nStage
      }
    });

    return NextResponse.json({ success: true, data: safeData });
  } catch (error: any) {
    logEvent({
      level: 'error',
      endpoint: '/api/parse-report',
      clientIp,
      durationMs: Date.now() - startTime,
      statusCode: 500,
      error: error.message || 'Unknown parsing error',
      action: 'parse_report_exception'
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
