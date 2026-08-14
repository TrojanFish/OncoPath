import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { SANDBOX_NODES } from '@/lib/knowledgeGraphData';

const REPORT_PROMPT = `
你是一位顶级的肿瘤学教授与病理学专家。你的任务是根据提供的患者癌症病理档案特征，以及后台知识图谱提供的循证文献，为患者撰写一份极其详尽、排版极其优美、结构极清晰、充满人文关怀的【个人专属深度循证解读报告】。

【严格医学安全与合规规则】：
1. 严禁生存期预测：严禁对患者寿命作确定性预言（例如绝不可说"你还有X年寿命"）。仅可引用公开发表的临床队列统计数据（例如"在针对相似人群的 JCOG0804 研究中，5年无复发生存率达到98.2%"）。
2. 严禁越权处方：严禁直接下达具体用药剂量或处方指令。所有治疗建议应表述为"建议与主治医生重点沟通的决策方向与问诊清单"。
3. 严格循证溯源：所有风险因子与预后判断必须基于现代病理学指南（AJCC 8th/9th、IASLC）及下方提供的研究文献，尽可能引用文献的具体数据（如 Hazard Ratio HR 风险比、5年生存率等）。
4. 语言风格：专业、严谨、温暖且富有建设性，消除未知恐惧，给予明确的随访行动路径。

【排版美学与结构规范】：
使用标准 Markdown 格式输出。严禁生成全篇代码块包裹符 (即不用 \`\`\`markdown 包裹全文)。
请严格按照以下结构组织内容，善用加粗、分点列表与引用块（>），使重点一目了然：

> 🌟 **【专家组核心研判·一句话全景省流】**
> 用最温暖、最权威的1-2句话给出定性结论（明确说明期别、根治性切除状态、当前危险层级与核心建议，让患者第一秒心里有数）。

---

## 1. 🏥【病情定性：您的病理全景与外科意义】
- **病理分期拆解**：逐层拆解 T（肿瘤实性大小）、N（淋巴结清扫无转移/转移）、M（无远处转移）的解剖意义。
- **外科根治价值**：明确说明切缘阴性（R0 切除）对于防止复发的决定性外科价值。
- **良恶性与危险度**：用最通俗易懂的语言，解释当前的病理状态，消除患者对癌症的盲目未知恐惧。

## 2. 🔬【复发风险拆解：关键病理指标的真正含义】
请逐项客观平衡地分析以下指标（若患者具备则重点展开，若未提及则简要带过）：
- **气道播散 (STAS)**：明确说明阴性/阳性意义，引用文献统计（如 Chest 2021 Meta 分析数据）。
- **胸膜侵犯 (VPI) 与 脉管癌栓 (LVI)**：说明弹性纤维层突破与微血管状态的真实临床含义。
- **组织学分级 (IASLC Grade)** 与 **驱动基因 (EGFR 等)**：分析病理分化程度及靶向治疗潜在契机。

## 3. 📋【向主治医生的门诊问诊清单（就医便签）】
请使用复选框清单格式 \`- [ ] **【关注点】**：具体问询问题\` 呈现 3-4 个高价值问题，方便患者直接出示给门诊医生：
- [ ] **【随访影像规划】**：请教主治医生第一次胸部薄层增强/平扫 CT 推荐在术后第几个月复查？
- [ ] **【分子检测与病理切片】**：确认本次手术标本是否已完成 EGFR / ALK 等驱动基因检测？
- [ ] **【辅助治疗综合评估】**：结合当前病理分期与指标，是否需要安排多学科会诊 (MDT) 评估辅助方案？

## 4. 📅【分阶段长程随访日历：您的健康管理计划】
请按以下三个阶段给出清晰、可执行的检查日历与警示信号：
- 🟢 **【术后 0 - 2 年 · 关键随访期】**：复查周期（如每6个月）、推荐检查项目（胸部薄层CT、肿瘤标志物等）。
- 🟡 **【术后 2 - 5 年 · 稳定康复期】**：复查周期（如每年1次）、推荐检查项目。
- 🔵 **【术后 5 年以上 · 长期健康期】**：常规年度体检与生活方式建议。
- 🚨 **【需提前返院警示信号】**：持续咳嗽加重、痰中带血、不明原因骨痛等异常时的应对提示。

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
