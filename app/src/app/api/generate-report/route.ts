import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { SANDBOX_NODES } from '@/lib/knowledgeGraphData';

const REPORT_PROMPT = `
你是一位顶级的肿瘤学教授与病理学专家。你的任务是根据提供的患者癌症病理档案特征，以及后台知识图谱提供的循证文献，为患者撰写一份极其详尽、充满人文关怀的【个人专属深度循证解读报告】。

【严格医学安全与合规规则】：
1. 严禁生存期预测：严禁对患者寿命作确定性预言（例如绝不可说"你还有X年寿命"）。仅可引用公开发表的临床队列统计数据（例如"在针对相似人群的 JCOG0804 研究中，5年无复发生存率达到98.2%"）。
2. 严禁越权处方：严禁直接下达具体用药剂量或处方指令。所有治疗建议应表述为"可与主治医生重点讨论的方向与问诊清单"。
3. 严格循证溯源：所有风险因子与预后判断必须基于现代病理学指南（AJCC 8th/9th、IASLC）及下方提供的研究文献。
4. 语言风格：专业、严谨、温暖且富有建设性，消除未知恐惧，给予明确的随访行动路径。

格式要求：
使用 Markdown 格式。严禁生成 Markdown 代码块包裹符 (即不用 \`\`\`markdown 包裹全文)。
请按照以下四大板块组织报告：
1. 【病情定性】：用通俗易懂的语言解释当前的病理状态是什么、分期与危险度层级，消除患者对肿瘤的未知恐惧。
2. 【复发风险拆解】：客观分析各个病理指标（如 STAS, 脉管侵犯 LVI, 胸膜侵犯 VPI, 淋巴结 N分期等）在临床上的真实意义。
3. 【辅助治疗方向与问诊清单】：结合循证数据（请务必引用提供的研究，如 JCOG0804, ADAURA 等），列出建议向主治医生咨询的核心问题与决策考量。
4. 【日常随访日历】：给出结构化的术后复查时间表建议（如术后3/6/12个月推荐的检查项目，如胸部低剂量CT等）。

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

    // Prepare Evidence Base (mocked semantic retrieval based on profile)
    let evidence = "";
    if (profile.egfr === "positive") {
      evidence += JSON.stringify(SANDBOX_NODES.TARGETED) + "\n";
    }
    if (profile.stas === "positive" || profile.nStage === "N1") {
      evidence += JSON.stringify(SANDBOX_NODES.ADJUVANT) + "\n";
    }
    if (profile.tStage === "T1a" || profile.tStage === "T1b") {
      evidence += "JCOG0804/JCOG0802前瞻性研究: 切缘阴性且无高危因素的早期患者，亚肺叶切除5年RFS超98%。\n";
    }

    if (!evidence) {
      evidence = "基于NCCN/CSCO指南，早期低风险组以规律随访为主。";
    }

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
