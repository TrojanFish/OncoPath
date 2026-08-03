# Product Overview

## 1. 核心定位 (Core Positioning)
LungEvidence 是一款面向肺癌患者及其家属的循证医学知识匹配工具。它通过解析患者的病理报告和基因检测结果，自动在海量医学文献和指南中寻找高度匹配的证据，生成一份个性化的“循证知识图谱”。

## 2. MVP 功能集 (MVP Feature Set)
- **病理特征解析模块 (Pathology Parsing Module):** 用户可以手动输入或上传病理报告，系统提取关键因子（如 STAS, 淋巴结转移, 肿瘤大小, 基因突变）。
- **智能证据匹配引擎 (Intelligent Evidence Matching Engine):** 基于提取的因子，在后台的 Knowledge Graph 中查询相关的预后数据和生存期曲线。
- **患者友好型报告生成器 (Patient-friendly Report Builder):** 生成包含图表、证据卡片和原始文献链接的综合报告。
- **医学术语词典 (Medical Glossary):** 内置随时可查的肺癌专有词汇表。

## 3. 用户流程 (User Flows)
### 3.1. 主流程：获取循证报告 (Main Flow: Get Evidence Report)
1. **Onboarding:** 用户进入首页，了解平台理念（Evidence > Opinion）。
2. **Profile Input:** 用户进入信息录入页面（ProfileForm）。
   - 用户勾选或输入关键病理特征：如“肿瘤大小 3cm”、“STAS 阳性”、“微乳头亚型 20%”。
3. **Processing:** 屏幕显示 AI 正在进行知识图谱检索和文献匹配（展示匹配进度）。
4. **Report View:** 用户查看生成的个性化循证报告。
   - 报告分为：关键特征解读、相关临床研究、生存期/预后数据统计（仅限群体数据，非个体预测）。
5. **Deep Dive:** 用户点击某一项证据卡片，查看背后的 PubMed 论文摘要和置信度评分。

## 4. 页面详细描述 (Page Descriptions)
### 4.1. 首页 (Home Page)
- **Hero Section:** 强有力的标语：“用数据对抗恐惧，用证据理解疾病”。
- **How it Works:** 3步图解展示平台工作原理。
- **Disclaimer:** 醒目的免责声明，强调本平台不提供医疗诊断。

### 4.2. 患者画像录入页 (Profile Input)
- 分步表单 (Stepper Form)：
  - Step 1: 基本信息（年龄段、性别、吸烟史）。
  - Step 2: 肿瘤特征（TNM分期、肿瘤大小、位置）。
  - Step 3: 组织学特征（腺癌/鳞癌、亚型、STAS、胸膜侵犯）。
  - Step 4: 基因突变（EGFR, ALK, KRAS 等）。

### 4.3. 循证报告页 (Evidence Report)
- **Summary Dashboard:** 雷达图展示各病理因子的风险权重（基于文献提及频率和风险比 HR）。
- **Evidence Timeline:** 以时间轴的形式展示针对该特征的医学研究演进。
- **Study Cards:** 瀑布流展示匹配到的文献卡片。每张卡片包含：
  - 结论一句话总结（中文）
  - 证据等级（如 ★★★★☆ Level II）
  - 样本量（如 N=1024）
  - DOI / PubMed 链接

### 4.4. 研究文献库 (Research Library)
- 允许高级用户（或医生）直接搜索特定的病理因子，查看全平台的文献储备和节点关系。

## 5. 用户所见：Step by Step (What users see step by step)
1. User sees clean, professional interface with dark medical theme.
2. User selects "STAS Positive" from a dropdown.
3. System instantly shows "Found 45 related studies. Highest evidence level: Meta-analysis."
4. User clicks "Generate Report".
5. User reads a clear explanation: "STAS (Spread Through Air Spaces) is found in your report. According to a 2020 meta-analysis (PMID: 3211111), STAS is associated with a higher risk of recurrence in stage I NSCLC treated with sublobar resection."
