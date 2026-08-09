import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { SANDBOX_NODES } from '@/lib/knowledgeGraphData';

const REPORT_PROMPT = `
你是一位顶级的肿瘤学教授与病理学专家。你的任务是根据提供的患者癌症病理档案特征，以及后台知识图谱提供的循证文献，为患者撰写一份极其详尽、充满人文关怀的【个人专属深度循证解读报告】。

格式要求：
使用 Markdown 格式。严禁生成 Markdown 代码块包裹符 (即不用 \`\`\`markdown 包裹全文)。
请按照以下四大板块组织报告：
1. 【病情定性】：用大白话解释当前的病理状态是什么，有多严重，消除未知恐惧。
2. 【复发风险拆解】：分析各个危险因素（如 STAS, 淋巴结等）在临床上的真正含义。
3. 【辅助治疗建议】：结合循证数据（请务必引用我给你的研究数据，如 JCOG0804, ADAURA 等），给出专业的下一步建议。
4. 【日常随访日历】：给出一个明确的时间表，比如术后第几个月该做什么检查。

语气要求：
专业、坚定、温暖。就像一位经验丰富的老教授面对面对患者讲话。不要使用模棱两可的推辞词，要给出直接的行动指令。

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
