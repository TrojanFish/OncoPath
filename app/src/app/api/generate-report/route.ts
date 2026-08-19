import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizePatientProfile } from '@/lib/privacy';
import { logEvent } from '@/lib/logger';

const POST_OP_PROMPT = `
你是一位国际顶级胸部肿瘤专科主治医生、多学科诊疗 (MDT) 会诊专家与循证医学专家。
请根据该患者的【术后病理组织学数字档案】、【全身转移排查状态 (脑MRI/腹部超声/骨扫描/PET-CT)】与【系统检索到的前瞻性临床研究队列证据】，为患者生成一份极具专业权威性、温情同理心、排版现代优雅的《深度专属临床循证分析报告》。

【严格医学沟通与循证治疗标准规则】：
1. 科学理性与希望并存：若患者处于 II/III 期或伴有高危因素（如 N2 淋巴结转移、STAS 气道播散、VPI 胸膜侵犯），在客观说明复发风险的同时，必须向患者普及**现代精准靶向治疗（如第3代 EGFR-TKI）与免疫治疗带来的跨时代突破**，打消绝望心理，树立规范辅助治疗的抗癌信心。
2. 【全身排查 M0 早期根治定心丸】：
   - 若患者数字档案中脑部 MRI、腹部超声或骨扫描显示阴性（无转移），必须在开篇首要强调：**“全身排查未见转移信号，在临床上确立了绝对的 M0（无远处转移），说明肿瘤完全局限于肺部原发灶，尚未发生全身血行播散，这是实现手术物理根治的最高基石！”**
3. 【伴发良性病变鉴别排雷】：
   - 若患者数字档案中存在伴发良性发现（如肝囊肿、肝内钙化灶、胆囊息肉、肾囊肿、肺内陈旧性纤维钙化点），必须明确向患者说明：**“这些属于人体极其常见的良性囊性或退行性改变，与肺部肿瘤没有任何因果关系，绝非肿瘤转移，请彻底放下包袱。”**
4. 【恶性影像征象（空泡/分叶/胸膜牵拉等）与术后病理的微观对照拆解】：
   - 通俗拆解患者术前影像报告中出现的吓人术语：
     - **空泡征**：说明是肿瘤生长时保留的微小细支气管残腔，多见于早期腺癌；
     - **胸膜牵拉**：说明是纤维收缩牵拉胸膜，只要术后病理证实未突破胸膜（PL0），即依然处于极安全的早期范围；
     - **分叶/毛刺**：说明各方向生长速度不一与局部微浸润，经 R0 完整切除后即可解除威胁。
5. 【极早期 IA 期（IA1/IA2）无高危患者的基因检测与过度医疗红线】：
   - 若患者为 **IA1 / IA2 期（T1a/T1b N0 M0）且无高危病理因素（STAS阴性、VPI阴性、LVI阴性、R0切除）**：
     - **严禁向其推荐常规做驱动基因检测或术后辅助用药**！
     - 必须明确告知患者：**根据 NCCN、CSCO 与 ESMO 国际权威指南，IA 期手术完全切除后 5 年治愈率高达 98%~100%，属于 100% 物理根治，全球所有指南公认【无需任何术后辅助化疗、靶向药或免疫治疗，常规不推荐做驱动基因检测】**。医院病理科会将手术切片与蜡块妥善封存 10~20 年备用。
     - **核心行动指引**：遵从规律随访时间表（每 6~12 个月复查薄层 CT），无需过度检测或盲目吃药，把心放宽回归正常工作与生活！
6. 【中高危患者（IB 期伴高危因素、II 期、III 期）的精准靶向指导】：
   - 若患者处于 IB 期合并高危因素或 II~IIIA 期，应建议完善驱动基因检测（EGFR/ALK 等），以指导是否启动 ADAURA（奥希替尼）或 ALINA（阿来替尼）等术后辅助靶向治疗（降低 70%~83% 复发风险）。

请严格按照以下 4 大核心板块输出（请使用标准 Markdown 格式）：

> 🌟 **【专家组核心研判·一句话全景省流】**
> - **诊断与分期结论**：以温和肯定的语气说明患者目前的病理确诊结论与 AJCC 8th/9th 实际分期。
> - **全身排查与 M0 定心丸**：清晰告知患者全身排查结果、M0 无远处转移的黄金意义及 R0 根治性切除的重大基石价值，彻底消除未知恐惧。
> - **核心行动指引**：提炼最关键的一条医疗建议（IA期低危患者为：规律随访复查，无需过度用药与盲目基因检测；中高危患者为：完善驱动基因检测或多学科会诊 MDT）。

---

## 1. 🏥【病情定性：您的病理全景、影像征象与外科意义】
- **病理分期拆解**：逐层拆解 T（肿瘤实性大小与胸膜侵犯升期逻辑）、N（区域淋巴结哨兵站状态）、M（无远处转移信号）的解剖意义。
- **恶性影像征象病理微观解密**：若患者影像曾见空泡征、分叶征或胸膜牵拉，通俗对照解释其微观病理对应机制，破除术语恐慌。
- **伴发良性病变排雷说明**：对患者伴发的肝囊肿、钙化点等良性表现给予明确的良性定性。
- **外科根治价值**：明确说明切缘阴性（R0 切除）对于防止复发的决定性外科价值。

## 2. 🔬【复发风险拆解：关键病理指标的真正含义】
请逐项客观平衡地分析以下指标（若患者具备则重点展开，若未提及则简要带过）：
- **气道播散 (STAS)**：明确说明阴性/阳性意义，引用文献统计（如 Chest 2021 Meta 分析数据 HR=1.87）。
- **胸膜侵犯 (VPI) 与 脉管癌栓 (LVI)**：说明弹性纤维层突破与微血管状态的真实临床含义。
- **Ki-67 细胞增殖指数**（若患者档案提供了该指标）：
  - 严谨科学地说明 Ki-67 代表的是显微镜下处于增殖分裂活跃周期的细胞百分比（细胞发动机转速表），**绝不等于复发转移概率**；
  - 若 Ki-67 ≤5%，指出其属于极低惰性增殖，恶性生物学活性极弱；
  - 若 Ki-67 较高（>20%~30%），客观说明增殖活跃的细胞对后续辅助药物（含铂化疗/靶向药）具有更强的摄取与杀伤敏感性，打消盲目恐惧。
- **组织学分级 (IASLC Grade)** 与 **驱动基因 / 辅助治疗标准**：
  - 若为 IA 期无高危患者，重点解释“无需辅助治疗、常规不推荐基因检测”的指南共识，打消过度吃药与检测焦虑；
  - 若为 IB 高危/II/III 期患者，重点分析靶向治疗契机（引用 ADAURA 研究，奥希替尼辅助靶向降低复发风险 70%~83%）。

## 3. 📋【向主治医生的门诊问诊清单（就医便签）】
请严格使用标准 Markdown 任务列表格式，每条必须以 \`- [ ] **【关注点】**：具体问题内容...\` 开头，生成 3-4 个高价值问题：
- [ ] **【随访影像规划】**：请教主治医生第一次胸部薄层增强/平扫 CT 推荐在术后第几个月复查？是否需配合腹部超声？
- [ ] **【术后治疗/检测评估】**：（若为 IA 期无高危：请教医生是否确认属于极早期、无需术后吃药及盲目基因检测，只需常规随访？若为 IB 高危/II/III 期：确认本次标本是否需送检 EGFR/ALK 等驱动基因大 Panel 以指导靶向治疗？）
- [ ] **【肺功能康复与日常调适】**：结合当前手术切除范围，术后呼吸训练与日常活动有哪些具体建议？

## 4. 📅【分阶段长程随访日历：您的全身健康管理计划】
请按以下三个阶段给出清晰、可执行的多器官协同检查日历与警示信号：
- 🟢 **【术后 0 - 2 年 · 关键随访期】**：复查周期（如每6个月）、推荐检查项目（胸部薄层CT、腹部超声/浅表淋巴结、必要时脑部MRI）。
- 🟡 **【术后 2 - 5 年 · 稳定康复期】**：复查周期（如每年1次）、推荐检查项目。
- 🔵 **【术后 5 年以上 · 长期健康期】**：常规年度体检与生活方式建议。
- 🚨 **【需提前返院警示信号】**：持续咳嗽加重、痰中带血、不明原因骨痛、头痛等异常时的应对提示。

以下是该患者的数字档案：
{PROFILE_JSON}

以下是系统匹配到的针对该患者的顶级临床研究证据库：
{EVIDENCE_BASE}
`;

const PRE_OP_CT_PROMPT = `
你是一位国际顶级胸部影像学专家、胸外科临床专家与多学科诊疗 (MDT) 会诊专家。
请根据该患者的【胸部 CT 影像学诊断档案】（包括结节部位、大小、CT实性成分CTR、恶性影像征象毛刺/分叶/胸膜牵拉/空泡征等）、【全身排查状态 (脑MRI/腹部超声/骨扫描)】与【系统检索到的前瞻性临床研究证据（Fleischner指南 / JCOG0804 / JCOG0802等）】，为患者生成一份极具专业权威性、温情同理心、排版清晰优雅的《肺结节深度影像循证与良恶性决策报告》。

请严格按照以下 4 大核心板块输出（请使用标准 Markdown 格式）：

> 💡 **【核心执行摘要 · Executive Summary】**
> - **影像诊断与恶性风险评估**：客观说明结节形态（纯磨玻璃/部分实性/实性）与良恶性风险评级（低危/中危/高危）。
> - **全身排查与 M0 早期定心丸**：清晰解释若全身排查均为阴性，说明病灶纯属局部极早期改变，绝无扩散；同时解释肺部磨玻璃结节普遍进展极慢的生物学特性，避免患者过度恐慌与盲目焦虑。
> - **核心行动策略**：提炼最关键的一步决策（如 3-6 个月薄层 CT 随访 vs 评估胸腔镜微创肺段切除）。

---

## 1. 🩻【影像定性：您的肺结节全景、恶性征象解密与解剖定位】
- **结节解剖与大小拆解**：解读结节所在肺叶肺段，分析大体总径与 CT 实性浸润成分（CTR）的关键意义。
- **恶性影像征象通俗拆解**：逐一通俗解释报告中检出的分叶征、毛刺征、胸膜牵拉征、空泡征、血管集束征等生物学发生机制与临床真实含义。
- **伴发良性病变排雷说明**：对患者伴发的肝囊肿、肺内钙化灶等常见良性表现予以明确澄清，打消转移恐慌。

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
  const startTime = Date.now();
  const clientIp = getClientIp(request);

  try {
    // 1. Production Rate Limiting (5 requests per minute per IP for high-cost LLM calls)
    const rateLimit = checkRateLimit(`gen_report_${clientIp}`, { intervalMs: 60 * 1000, maxRequests: 5 });
    if (!rateLimit.success) {
      logEvent({
        level: 'warn',
        endpoint: '/api/generate-report',
        clientIp,
        statusCode: 429,
        action: 'rate_limit_exceeded',
        message: 'Client exceeded report generation rate limit'
      });
      return NextResponse.json(
        { success: false, error: "您在短时间内请求过于频繁，请稍候 1 分钟后重试。" },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const rawProfile = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      logEvent({
        level: 'error',
        endpoint: '/api/generate-report',
        clientIp,
        statusCode: 500,
        message: 'Missing GEMINI_API_KEY environment variable'
      });
      return NextResponse.json({ success: false, error: "系统未配置 GEMINI_API_KEY" }, { status: 500 });
    }

    // 2. Patient Privacy & PII Sanitization (HIPAA / PIPL compliance)
    const profile = sanitizePatientProfile(rawProfile);

    const isCtReport = profile.reportType === "ct_imaging" || profile.currentStage === "evaluation" || profile.currentStage === "discovery";

    // Prepare Evidence Base (Accurate Stage & Factor Aware Semantic Matching)
    const evidenceItems: string[] = [];

    if (isCtReport) {
      evidenceItems.push("【Fleischner Society 2017/2023 肺结节管理指南】：对于部分实性结节 (mGGO) 实性成分 <6mm，建议 3~6 个月后复查薄层 CT；若实性成分持续存在且 ≥6mm，应高度警惕浸润性病变，建议考虑多学科会诊评估手术。");
      evidenceItems.push("【JCOG0804 多中心前瞻性临床研究 (JTO)】：针对 CTR ≤0.25 且肿瘤径 ≤2cm 的早期磨玻璃肺腺癌，亚肺叶切除 5 年无复发生存率 (RFS) 达到 99.7%，病理多为原位腺癌 (AIS) 或微浸润腺癌 (MIA)。");
      evidenceItems.push("【JCOG0802 / WJOG4607L 随机对照 III 期研究 (Lancet 2022)】：对于实性成分比例为主的 ≤2cm 早期肺癌，解剖性肺段切除在保留肺功能的同时，总生存率 (OS) 显著优于传统肺叶切除。");
    } else {
      // Systemic Staging & M0 Evidence
      if (profile.systemicStagingConfirmed || profile.brainMri === "negative" || profile.abdominalUltrasound === "negative") {
        evidenceItems.push("【NCCN / CSCO 非小细胞肺癌分期评估规范】：完成脑部增强 MRI、腹部超声/CT 及骨显像排查并确立 M0 状态，是保障早期肺癌实施根治性手术 (R0切除) 的首要前提，5年总生存率主要取决于原发灶病理与切缘安全度。");
      }

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
      const isEarlyLowRisk = (profile.tStage === "T1a" || profile.tStage === "T1b" || profile.stage === "IA1" || profile.stage === "IA2" || profile.stage === "IA") && (profile.nStage === "N0" || !profile.nStage) && profile.stas !== "positive" && profile.vpi !== "positive" && profile.lvi !== "positive";
      if (isEarlyLowRisk) {
        evidenceItems.push("【NCCN / CSCO / ESMO 非小细胞肺癌临床指南 (IA1/IA2期)】：IA 期患者 R0 切除后 5 年总生存率高达 98%~100%，属于 100% 物理根治；全球所有权威指南一致明确：无需任何术后辅助化疗、靶向药物或放疗，常规不推荐做驱动基因检测以指导辅助治疗。规范薄层 CT 随访即为最优解。");
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

          logEvent({
            level: 'info',
            endpoint: '/api/generate-report',
            clientIp,
            durationMs: Date.now() - startTime,
            statusCode: 200,
            aiModel: 'gemini-2.5-flash',
            action: 'report_stream_completed',
            meta: {
              reportType: profile.reportType || 'pathology',
              stage: profile.stage || 'unknown'
            }
          });
        } catch (e: any) {
          logEvent({
            level: 'error',
            endpoint: '/api/generate-report',
            clientIp,
            durationMs: Date.now() - startTime,
            error: e.message || 'Stream processing error',
            action: 'report_stream_failed'
          });
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
    logEvent({
      level: 'error',
      endpoint: '/api/generate-report',
      clientIp,
      durationMs: Date.now() - startTime,
      statusCode: 500,
      error: error.message || 'Unknown server error',
      action: 'generate_report_exception'
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
