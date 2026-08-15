import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

const POST_OP_PROMPT = `
你是一位国际顶级胸部肿瘤专科主治医生与循证医学专家。
请根据该患者的【术后病理组织学数字档案】与【系统检索到的前瞻性临床研究队列证据】，为患者生成一份极具专业权威性、温情同理心、排版现代优雅的《深度专属临床循证分析报告》。

请严格按照以下 4 大核心板块输出（请使用标准 Markdown 格式）：

> 💡 **【核心执行摘要 · Executive Summary】**
> - **诊断与分期结论**：以温和肯定的语气说明患者目前的病理确诊结论与 AJCC 8th/9th 实际分期。
> - **核心预后定心丸**：清晰告知患者 5 年无复发生存率与整体治愈预期，彻底消除未知恐惧。
> - **核心行动指引**：提炼最关键的一条医疗建议（如按时随访或多学科会诊）。

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

const PRE_OP_CT_PROMPT = `
你是一位国际顶级胸部影像学专家与胸外科临床专家。
请根据该患者的【胸部 CT 影像学诊断档案】（包括结节部位、大小、CT实性成分CTR、恶性影像征象毛刺/分叶/胸膜牵拉等）与【系统检索到的前瞻性临床研究证据（Fleischner指南 / JCOG0804 / JCOG0802等）】，为患者生成一份极具专业权威性、温情同理心、排版清晰优雅的《肺结节深度影像循证与良恶性决策报告》。

请严格按照以下 4 大核心板块输出（请使用标准 Markdown 格式）：

> 💡 **【核心执行摘要 · Executive Summary】**
> - **影像诊断与恶性风险评估**：客观说明结节形态（纯磨玻璃/部分实性/实性）与良恶性风险评级（低危/中危/高危）。
> - **核心定心丸**：清晰解释肺部磨玻璃结节普遍进展极慢的生物学特性，避免患者过度恐慌与盲目焦虑。
> - **核心行动策略**：提炼最关键的一步决策（如 3-6 个月薄层 CT 随访 vs 评估胸腔镜微创肺段切除）。

---

## 1. 🩻【影像定性：您的肺结节全景与解剖定位】
- **结节解剖与大小拆解**：解读结节所在肺叶肺段，分析大体总径与 CT 实性浸润成分（CTR）的关键意义。
- **恶性影像征象分析**：通俗解释报告中检出的分叶、毛刺、胸膜牵拉、血管集束等征象的临床含义。

## 2. 🔬【良恶性概率与自然病程：国际前瞻性研究证据】
- **Fleischner 学会 / CSCO 早期肺结节临床指南**：基于结节形态和大小，匹配权威指南的推荐干预路径。
- **JCOG0804 / JCOG0802 等磨玻璃结节前瞻性队列**：解释早期磨玻璃结节的惰性生长特点与极高治愈率。

## 3. 📋【向胸外科/呼吸科医生的门诊问诊清单（就医便签）】
请使用复选框清单格式 \`- [ ] **【关注点】**：具体问询问题\` 呈现 3-4 个高价值问题：
- [ ] **【动态变化评估】**：对比以往体检 CT，该结节的大小、密度或实性成分是否有明显增大？
- [ ] **【随访周期规划】**：根据我的结节特征，建议在几月份进行下一次高分辨薄层 CT (HRCT) 复查？
- [ ] **【微创手术指征】**：若实性成分增大，是否满足单孔胸腔镜解剖性肺段切除的手术指征？

## 4. 📅【肺结节全周期科学随访与观察日历】
- 🟢 **【动态监测期】**：薄层 CT 扫描参数要求（层厚 ≤1mm、靶扫描），结节体积倍增时间 (VDT) 观察。
- 🟡 **【生活与体质调理】**：远离二手烟、增强呼吸道免疫力、保持良好心态。
- 🚨 **【需提前就诊的影像或身体信号】**：实性成分明显增多、结节长径增加超过 2mm 或出现伴随症状。

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

    const isCtReport = profile.reportType === "ct_imaging" || profile.currentStage === "evaluation" || profile.currentStage === "discovery";

    // Prepare Evidence Base (Accurate Stage & Factor Aware Semantic Matching)
    const evidenceItems: string[] = [];

    if (isCtReport) {
      evidenceItems.push("【Fleischner Society 2017/2023 肺结节管理指南】：对于部分实性结节 (mGGO) 实性成分 <6mm，建议 3~6 个月后复查薄层 CT；若实性成分持续存在且 ≥6mm，应高度警惕浸润性病变，建议考虑多学科会诊评估手术。");
      evidenceItems.push("【JCOG0804 多中心前瞻性临床研究 (JTO)】：针对 CTR ≤0.25 且肿瘤径 ≤2cm 的早期磨玻璃肺腺癌，亚肺叶切除 5 年无复发生存率 (RFS) 达到 99.7%，病理多为原位腺癌 (AIS) 或微浸润腺癌 (MIA)。");
      evidenceItems.push("【JCOG0802 / WJOG4607L 随机对照 III 期研究 (Lancet 2022)】：对于实性成分比例为主的 ≤2cm 早期肺癌，解剖性肺段切除在保留肺功能的同时，总生存率 (OS) 显著优于传统肺叶切除。");
    } else {
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
    }

    const evidence = evidenceItems.join("\n\n");
    const templatePrompt = isCtReport ? PRE_OP_CT_PROMPT : POST_OP_PROMPT;

    const finalPrompt = templatePrompt
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
          const safetyFooter = `\n\n---\n\n> 🛡️ **OncoPath 循证医学与安全免责声明**：\n> 本报告由 OncoPath 循证 AI 引擎根据您提供的病理/影像档案特征与国际已发表临床研究文献（NCCN/CSCO 指南、Fleischner 学会指南、IASLC、JCOG 系列研究等）汇总生成，仅供患者健康科普与就医参考，**绝不构成任何个性化临床诊断结论或处方指令**。具体的随访检查安排及辅助治疗方案，请务必携带完整影像/病理报告以主管医师或多学科会诊 (MDT) 团队的综合意见为准。\n`;
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
