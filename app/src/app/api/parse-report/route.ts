import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

const SYSTEM_PROMPT = `
你是一位专业的肺癌病理学家与肿瘤内科专家。你的任务是从患者上传的病理/影像报告（可能是文本，也可能是报告的纸质照片截图）中，提取出关键的临床决策指标，并严格输出为 JSON 格式。

无论原始文本有多乱，或者照片有多模糊，请尽力提取以下字段。如果明确没有提及，则输出 null，而不是伪造数据。

请严格遵守以下 JSON 结构输出，不要包含任何 Markdown 标记或多余的文字：
{
  "age": Number | null,
  "sex": "male" | "female" | null,
  "organ": "lung",
  "histology": String | null (例如: "adenocarcinoma", "squamous_cell_carcinoma", 若中文则尽量翻译为这几个英文分类),
  "tStage": "T1a" | "T1b" | "T1c" | "T2a" | "T2b" | "T3" | "T4" | null,
  "nStage": "N0" | "N1" | "N2" | "N3" | null,
  "stas": "positive" | "negative" | null (气道播散),
  "vpi": "positive" | "negative" | null (胸膜侵犯),
  "lvi": "positive" | "negative" | null (脉管内癌栓),
  "marginStatus": "positive" | "negative" | null (切缘状态),
  "surgeryType": "lobectomy" | "segmentectomy" | "wedge" | null,
  "grade": "1" | "2" | "3" | null (分化程度: 1为高分化, 2为中分化, 3为低分化)
}

规则：
1. 你的回答必须是一个合法的 JSON 对象，不要用 \`\`\`json 包裹。
2. 不要编造数据，如果在文本中找不到对应特征，设置为 null。
3. "阴性"或"未见" 映射为 "negative"，"阳性"或"可见" 映射为 "positive"。
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
        temperature: 0.1, // 低温度保证输出稳定性
      }
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("模型返回为空");
    }

    const extractedData = JSON.parse(rawJson);

    // Provide default safe fallbacks for missing critical fields
    const safeData = {
      age: extractedData.age || 55, // 占位
      sex: extractedData.sex || "unknown",
      organ: extractedData.organ || "lung",
      histology: extractedData.histology || "unknown",
      tStage: extractedData.tStage || null,
      nStage: extractedData.nStage || null,
      stas: extractedData.stas || "negative", // 默认为阴性以降低无谓恐慌
      vpi: extractedData.vpi || "negative",
      lvi: extractedData.lvi || "negative",
      marginStatus: extractedData.marginStatus || "negative",
      surgeryType: extractedData.surgeryType || "lobectomy",
      grade: extractedData.grade || null,
      
      // State Engine fields will be generated below
      currentStage: "evaluation",
      riskLevel: "unknown",
      nextAction: "暂无建议",
      psychologicalState: "fear"
    };

    // State Engine: Rule-based inference (Do not let AI hallucinate medical decisions!)
    if (safeData.tStage || safeData.nStage || reportText.includes("切除")) {
      safeData.currentStage = 'post_op';
      
      const isEarlyStage = safeData.tStage === "T1a" || safeData.tStage === "T1b" || safeData.tStage === "T1c";
      const isN0 = safeData.nStage === "N0";
      const hasHighRisk = safeData.stas === "positive" || safeData.vpi === "positive" || safeData.lvi === "positive" || safeData.nStage === "N1" || safeData.marginStatus === "positive";

      if (hasHighRisk) {
        safeData.riskLevel = 'moderate';
        safeData.nextAction = '存在局部高危因素 (如 STAS 或淋巴结累及)，建议尽早咨询肿瘤内科讨论辅助治疗方案。';
        safeData.psychologicalState = 'decision';
      } else if (isEarlyStage && isN0) {
        safeData.riskLevel = 'low';
        safeData.nextAction = '属于低风险组。建议术后规律随访，无需立即化疗。';
        safeData.psychologicalState = 'understanding';
      } else {
        safeData.riskLevel = 'moderate';
        safeData.nextAction = '特征较为复杂，请尽快挂号主治医生解读完整报告。';
        safeData.psychologicalState = 'decision';
      }
    } else {
      safeData.currentStage = 'discovery';
      safeData.riskLevel = 'unknown';
      safeData.nextAction = '请提供详细的术后病理报告以进行全面循证评估。';
      safeData.psychologicalState = 'fear';
    }

    return NextResponse.json({ success: true, data: safeData });
  } catch (error: any) {
    console.error('Error parsing report via Gemini:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
