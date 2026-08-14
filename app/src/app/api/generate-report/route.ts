import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { SANDBOX_NODES } from '@/lib/knowledgeGraphData';

const REPORT_PROMPT = `
你是一位顶级的肿瘤学教授与病理学专家。你的任务是根据提供的患者癌症病理档案特征，以及后台知识图谱提供的循证文献，为患者撰写一份极其详尽、排版极其优美、充满人文关怀的【个人专属深度循证解读报告】。

【严格医学安全与合规规则】：
1. 严禁生存期预测：严禁对患者寿命作确定性预言（例如绝不可说"你还有X年寿命"）。仅可引用公开发表的临床队列统计数据（例如"在针对相似人群的 JCOG0804 研究中，5年无复发生存率达到98.2%"）。
2. 严禁越权处方：严禁直接下达具体用药剂量或处方指令。所有治疗建议应表述为"建议与主治医生重点沟通的决策方向与问诊清单"。
3. 严格循证溯源：所有风险因子与预后判断必须基于现代病理学指南（AJCC 8th/9th、IASLC）及下方提供的研究文献，尽可能引用文献的具体数据（如 Hazard Ratio HR 风险比、5年生存率等）。
4. 语言风格：专业、严谨、温暖且富有建设性，消除未知恐惧，给予明确的随访行动路径。

【排版美学与结构规范】：
使用标准 Markdown 格式输出。严禁生成全篇代码块包裹符 (即不用 \`\`\`markdown 包裹全文)。
请严格按照以下四大板块组织内容，善用加粗、分点列表与引用块（>），使重点一目了然：

## 1. 🏥【病情定性：您的病理全景】
- 用最通俗易懂的语言，解释当前的病理状态是什么、分期定义及危险度层级。
- 明确说明手术切缘状态（如切缘阴性 R0 切除）的积极外科意义。
- 逐层拆解 T / N / M 分期的构成依据，消除患者对期别的盲目恐惧。

## 2. 🔬【复发风险拆解：关键病理指标的真正含义】
- 逐项分析各项病理指标（如分化程度 Grade、气道播散 STAS、胸膜侵犯 VPI、脉管癌栓 LVI、淋巴结状态等）在临床上的真实意义。
- 引用提供的文献统计（如 STAS 的 HR 风险比），客观平衡地指出哪些是高危因素、哪些是保护性/良性指标。

## 3. 📋【辅助治疗方向与门诊问诊清单】
- 结合国际前沿研究（如 ADAURA、NCCN/CSCO 规范），明确指出下一步治疗决策的重点考量（如是否需要驱动基因检测、辅助化疗、辅助靶向等）。
- 提供结构化、高价值的 **【向主治医生的问诊清单】**，用清单格式清晰呈现患者就医时可直接出示的具体问题。

## 4. 📅【日常随访日历：长程健康管理计划】
- 给出清晰的分阶段随访时间表（术后 0-2 年高危期、2-5 年稳定期、5 年以上康复期）。
- 明确指出不同阶段推荐的检查项目（如低剂量胸部 CT、脑部 MRI 筛查等）及出现何种异常症状需立即就医。

以下是该患者的数字档案：
{PROFILE_JSON}

以下是系统匹配到的针对该患者的顶级临床研究证据库：
{EVIDENCE_BASE}
`;

export async function POST(request: Request) {
  try {
    const profile = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "系统未配置 GEMINI_API_KEY" }, { status: 500 });
    }

    // Prepare Evidence Base (Accurate Stage & Factor Aware Semantic Matching)
    const evidenceItems: string[] = [];

    // Stage III / N2 Advanced Stage Guidelines
    const isStage3 = profile.stage?.includes("III") || profile.nStage === "N2" || profile.nStage === "N3";
    if (isStage3) {
      evidenceItems.push("【NCCN/CSCO 非小细胞肺癌指南 (IIIA/N2期)】：完全切除的 IIIA 期 (N2) 患者，术后推荐含铂双药辅助化疗；鉴于中枢神经系统转移风险，建议术后第一年行脑部增强 MRI 筛查。");
      evidenceItems.push("【ADAURA III期前瞻性临床研究 (NEJM/JCO 2020-2023)】：对于 IB-IIIA 期伴有 EGFR 敏感突变 (19del/L858R) 的完全切除肺癌患者，术后奥希替尼辅助靶向治疗可使 IIIA 期无病生存期 (DFS) 显著获益，疾病复发或死亡风险降低超过 70% (HR=0.23)。");
    }

    // STAS Spread Through Air Spaces Evidence
    if (profile.stas === "positive") {
      evidenceItems.push("【Wang et al. Chest 2021 Meta分析 (n=25,467)】：STAS (气道播散) 是早期肺腺癌术后复发的独立危险因素 (HR=1.87, 95% CI: 1.52-2.29)，存在 STAS 提示需更积极评估全身辅助治疗或加密局部影像随访。");
    }

    // Visceral Pleural Invasion (VPI) Evidence
    if (profile.vpi === "positive") {
      evidenceItems.push("【IASLC 8th/9th TNM 胸膜侵犯专病研究】：脏层胸膜侵犯 (VPI) 突破弹性层使 T1 期自动升期为 T2a，是局部微转移的独立预后风险指标。");
    }

    // EGFR Positive Evidence
    if (profile.egfr === "positive" && !isStage3) {
      evidenceItems.push("【ADAURA 临床研究】：对于完全切除的 EGFR 突变患者，第三代 EGFR-TKI 靶向辅助治疗可显著降低中枢神经系统转移与术后复发风险。");
    }

    // Early Stage T1a/T1b N0 Low Risk Evidence
    const isEarlyLowRisk = (profile.tStage === "T1a" || profile.tStage === "T1b" || profile.stage === "IA1" || profile.stage === "IA2") && profile.nStage === "N0" && profile.stas !== "positive";
    if (isEarlyLowRisk) {
      evidenceItems.push("【JCOG0804 / JCOG0802 多中心前瞻性研究 (JTO/Lancet)】：切缘阴性且无高危病理因素的早期磨玻璃 (CTR≤0.25) 及小结节患者，亚肺叶/解剖性肺段切除 5 年 RFS 超 98.2%，术后以规律随访为主，无需过度化疗。");
    }

    // Stage-aware fallback if no specific study matched
    if (evidenceItems.length === 0) {
      if (isStage3) {
        evidenceItems.push("【NCCN/CSCO 指南】：IIIA期术后建议开展多学科综合评估 (MDT)，评估辅助化疗、靶向药物及基因突变检测方案。");
      } else {
        evidenceItems.push("【NCCN/CSCO 早期肺癌指南】：切缘阴性无高危特征的低风险组，术后规范随访即可达到理想长期生存。");
      }
    }

    const evidence = evidenceItems.join("\n\n");

    const finalPrompt = REPORT_PROMPT
      .replace("{PROFILE_JSON}", JSON.stringify(profile, null, 2))
      .replace("{EVIDENCE_BASE}", evidence);

    // Call Gemini API with streaming
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
    });

    // Create a ReadableStream to stream the response back
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              const text = chunk.text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Safety Appendix
          const safetyFooter = `\n\n---\n\n> 🛡️ **OncoPath 循证医学与安全免责声明**：\n> 本报告由 OncoPath 循证 AI 引擎根据您提供的病理档案特征与国际已发表临床研究文献（NCCN/CSCO 指南、IASLC、JCOG 系列研究等）汇总生成，仅供患者健康科普与就医参考，**绝不构成任何个性化临床诊断结论或处方指令**。具体的随访检查安排及辅助治疗方案，请务必携带完整纸质病理报告以主管医师或多学科会诊 (MDT) 团队的综合意见为准。\n`;
          controller.enqueue(new TextEncoder().encode(safetyFooter));

          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error: any) {
    console.error('Error generating report via Gemini:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
