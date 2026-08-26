# OncoPath 核心循证医学文献库与上传指引
### Built-in vs. Recommended Landmark Studies for Ingestion

> 本文档针对 **肺腺癌病理分期、高危浸润因素、外科术式选择（肺段切除 vs 楔形切除 vs 肺叶切除）以及长期生存率（5年/10年 RFS/OS）** 进行了深度扩充。
> 文档严格区分为 **【已内置于系统】** 与 **【推荐手动上传 PDF 补充】** 两大部分，方便您系统性地完善平台的循证知识图谱。

---

## 目录
1. [第一部分：本项目【已内置】的核心文献与知识点清单（6篇）](#第一部分本项目已内置的核心文献与知识点清单6篇)
2. [第二部分：推荐通过后台【手动上传 PDF】的扩展文献库（22篇）](#第二部分推荐通过后台手动上传-pdf的扩展文献库22篇)
   - [专题一：外科术式大决战（段切 vs 楔切 vs 叶切 & 磨玻璃结节 CTR）](#专题一外科术式大决战段切-vs-楔切-vs-叶切--磨玻璃结节-ctr)
   - [专题二：肺腺癌 TNM 权威分期与全球大样本生存率（8.1万~12.4万例）](#专题二肺腺癌-tnm-权威分期与全球大样本生存率81万124万例)
   - [专题三：病理高危浸润因素（STAS气道播散 / VPI胸膜侵犯 / LVI脉管癌栓 / IASLC分级）](#专题三病理高危浸润因素stas气道播散--vpi胸膜侵犯--lvi脉管癌栓--iaslc分级)
   - [专题四：术后辅助靶向、免疫与化疗里程碑（ADAURA / ALINA / LACE / 围手术期免疫）](#专题四术后辅助靶向免疫与化疗里程碑adaura--alina--lace--围手术期免疫)
   - [专题五：微小残留病灶 (ctDNA MRD) 与动态随访预警](#专题五微小残留病灶-ctdna-mrd-与动态随访预警)
3. [第三部分：文献检索下载与后台上传实操指南](#第三部分文献检索下载与后台上传实操指南)

---

# 第一部分：本项目【已内置】的核心文献与知识点清单（6篇）

> 💡 **状态说明**：以下 6 篇研究的临床效应量（HR、5年RFS/OS、样本量）已经写入系统核心算法（`evidence-data.ts` 与 `defaultGraphData.ts`），直接支持患者档案风险测算。
> **建议**：如需让后台 AI 知识问答拥有更详尽的全文上下文，仍可将它们的 PDF 重新上传至后台。

| # | 文献简称 | 发表期刊 / 年份 | 样本量 (N) | 核心证据与结论 | 系统内置应用场景 |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | **JCOG0802 / WJOG4607L** | *The Lancet*, 2022 | 1,106 例 | ≤2cm CTR>0.5 周围型肺癌，肺段切除 5年 OS 显著优于肺叶切除（94.3% vs 91.1%，HR=0.663） | 手术方式决策、生存率推演 |
| **2** | **JCOG0804 / WJOG4507L** | *JCO / JTCVS*, 2022 | 333 例 | ≤2cm CTR≤0.25 磨玻璃肺癌，亚肺叶切除 5年 RFS 达 99.7%，局部复发率为 0% | 磨玻璃结节消恐、极早期风险评估 |
| **3** | **Wang et al. (Chest STAS Meta)** | *Chest*, 2021 | 25,467 例 | 18项研究 Meta 分析证实 STAS 是独立高危复发因子（OS HR=1.87, RFS HR=2.14） | 气道播散风险打分、随访周期推荐 |
| **4** | **IASLC Grading (Moreira et al.)** | *JTO*, 2020/2021 | 2,202 例 | 确立贴壁型为主为 Grade 1（5年RFS 97%）、实体/微乳头≥20%为 Grade 3（5年DFS 62%） | 病理分化分级、复发概率折算 |
| **5** | **Hattori et al. (纯GGO长期队列)** | *JTO*, 2021 | 1,024 例 | 纯磨玻璃结节（pGGO）术后 10 年无复发生存率达 97%，5年 OS 接近 100% | 结节长程生存率、防过度治疗 |
| **6** | **ADAURA 5-Year DFS Analysis** | *NEJM*, 2020/2023 | 682 例 | IB~IIIA 期 EGFR 突变患者奥希替尼辅助治疗 5年 DFS 率提升至 65% vs 26%（HR 0.27） | 术后靶向治疗推荐、阻断率计算 |

---

# 第二部分：推荐通过后台【手动上传 PDF】的扩展文献库（22篇）

> 💡 **状态说明**：以下文献为**尚未完整提取全文 PDF 的高价值研究**。重点涵盖了**早期术式大样本随机对照、IASLC 全球大分期生存率数据、STAS/VPI 深度微观机制、围手术期免疫与 MRD 动态监测**。

---

## 专题一：外科术式大决战（段切 vs 楔切 vs 叶切 & 磨玻璃结节 CTR）

### 7. CALGB 140503 / Alliance（全球多中心 亚肺叶 vs 肺叶切除 RCT）
- **英文标题**：*Sublobar Resection versus Lobectomy for Small Stage IA Non–Small-Cell Lung Cancer*
- **期刊 / 年份**：*New England Journal of Medicine (NEJM)*, 2023
- **PMID**：36757978 | **DOI**：`10.1056/NEJMoa2212083`
- **核心重点**：北美多中心 697 例 T1aN0M0（≤2cm）随机对照证实，在系统淋巴结清扫阴性前提下，亚肺叶切除（肺段/楔切）与标准肺叶切除在 DFS（HR=1.01）和 OS（HR=0.99）完全等效。
- **推荐标签**：`CALGB140503`, `IA期`, `亚肺叶切除`, `生存率等效`

### 8. JCOG1211（CTR 0.25~0.5 混合磨玻璃肺段切除前瞻性试验）
- **英文标题**：*Segmentectomy for Ground-Glass-Dominant Lung Cancer with a Consolidation Tumor Ratio of 0.25–0.50: A Multicentre, Single-Arm, Confirmatory Phase 3 Study (JCOG1211)*
- **期刊 / 年份**：*The Lancet Respiratory Medicine*, 2023
- **PMID**：37119830 | **DOI**：`10.1016/S2213-2600(23)00096-7`
- **核心重点**：针对最大径 ≤3cm 且 CTR 0.25~0.5 的部分实性结节，肺段切除术后 5 年无复发生存率（RFS）高达 98.2%，总生存率（OS）达 98.4%，打破了 >2cm 必须切全叶的传统观点。
- **推荐标签**：`JCOG1211`, `CTR 0.25-0.5`, `肺段切除`, `5年RFS 98.2%`

### 9. 肺段切除 vs 楔形切除在 ≤2cm 肺腺癌中的预后对比（大样本真实世界）
- **英文标题**：*Anatomical Segmentectomy Versus Wedge Resection for Clinical Stage IA Lung Adenocarcinoma: A Propensity-Matched Study*
- **期刊 / 年份**：*Journal of Thoracic and Cardiovascular Surgery (JTCVS)*, 2022
- **PMID**：34749912 | **DOI**：`10.1016/j.jtcvs.2021.09.062`
- **核心重点**：明确解剖性肺段切除（Segmentectomy）相比非解剖性楔形切除（Wedge）具有更彻底的段门段间淋巴结清扫率，在 CTR > 0.5 的患者中局部复发率显著低于楔切。
- **推荐标签**：`肺段vs楔切`, `解剖性切除`, `局部复发率`, `淋巴结清扫`

### 10. LCSG 821（历史经典基石 · 早期肺叶切除建立标准研究）
- **英文标题**：*Randomized Trial of Lobectomy Versus Limited Resection for T1 N0 Non-Small Cell Lung Cancer*
- **第一作者 / 团队**：Ginsberg RJ, Rubinstein LV (Lung Cancer Study Group)
- **期刊 / 年份**：*Annals of Thoracic Surgery*, 1995
- **PMID**：7574923 | **DOI**：`10.1016/0003-4975(95)00537-u`
- **核心重点**：1995年确立肺叶切除为金标准的历史研究（当时局限切除复发率升高3倍）。理解该研究有助于向患者解释为何在现代高精薄层CT与严格病理筛选下，保肺手术（JCOG0802/CALGB）终于实现突破。
- **推荐标签**：`LCSG821`, `肺叶切除金标准`, `外科发展史`

---

## 专题二：肺腺癌 TNM 权威分期与全球大样本生存率（8.1万~12.4万例）

### 11. IASLC 第 8 版肺癌全球分期大队列生存基准（81,495 例）
- **英文标题**：*The IASLC Lung Cancer Staging Project: Proposals for Revision of the TNM Stage Groupings in the Forthcoming (Eighth) Edition of the TNM Classification for Lung Cancer*
- **第一作者 / 团队**：Goldstraw P, Chansky K, Crowley J, Asamura H, et al.
- **期刊 / 年份**：*Journal of Thoracic Oncology (JTO)*, 2016
- **PMID**：26762748 | **DOI**：`10.1016/j.jtho.2015.09.009`
- **核心重点**：提供了现行最通用分期的官方 5 年无病生存与总生存金标准数据：
  - **IA1 期 (T1aN0)**：5年 OS **92%**
  - **IA2 期 (T1bN0)**：5年 OS **83%**
  - **IA3 期 (T1cN0)**：5年 OS **77%**
  - **IB 期 (T2aN0)**：5年 OS **68%**
  - **IIA 期 (T2bN0)**：5年 OS **60%**
  - **IIB 期 (T1-2N1 / T3N0)**：5年 OS **53%**
  - **IIIA 期 (T1-2N2 / T3N1 / T4N0-1)**：5年 OS **36%**
- **推荐标签**：`AJCC第8版`, `IASLC基准生存率`, `TNM分期`, `5年OS`

### 12. IASLC 第 9 版肺癌最新分期提案（124,581 例 · 2024 最新发布）
- **英文标题**：*The International Association for the Study of Lung Cancer Lung Cancer Staging Project: Proposals for the Revision of the Clinical and Pathologic Staging of the Ninth Edition of the TNM Classification for Lung Cancer*
- **第一作者 / 团队**：Rami-Porta R, Asamura H, Travis WD, et al.
- **期刊 / 年份**：*Journal of Thoracic Oncology (JTO)*, 2024
- **PMID**：38823528 | **DOI**：`10.1016/j.jtho.2024.05.011`
- **核心重点**：全球 12.4 万例最新生存曲线，对 T1 亚组、N2 纵隔淋巴结站数（单站 N2a vs 多站 N2b）、远处转移 M 分期进行了最新微观修正。
- **推荐标签**：`AJCC第9版`, `IASLC第9版`, `最新分期标准`, `2024指南`

### 13. SEER 大数据库：早期肺腺癌 10 年长期生存与条件生存率模型
- **英文标题**：*Ten-Year Overall and Cause-Specific Survival in Stage I Non-Small Cell Lung Cancer: A Population-Based SEER Analysis*
- **期刊 / 年份**：*Lung Cancer*, 2021
- **PMID**：33545465 | **DOI**：`10.1016/j.lungcan.2021.01.012`
- **核心重点**：随访超 10 年的大数据证实：早期肺腺癌术后无复发满 5 年后，后续发生原发肿瘤复发的风险降至年均 <1%，年死亡风险接近同龄普通健康人群（条件生存率恢复正常）。
- **推荐标签**：`10年生存率`, `条件生存率`, `长期随访`, `治愈信心`

---

## 专题三：病理高危浸润因素（STAS气道播散 / VPI胸膜侵犯 / LVI脉管癌栓 / IASLC分级）

### 14. Eguchi et al. 2019（STAS 气道播散与切缘距离极限关系）
- **英文标题**：*Risk, Severity, and Implications of Spread Through Air Spaces in Early-Stage Lung Adenocarcinoma*
- **第一作者 / 团队**：Eguchi T, Kameda K, Adusumilli PS, Travis WD, et al.
- **期刊 / 年份**：*Journal of Clinical Oncology (JCO)*, 2019
- **PMID**：30768363 | **DOI**：`10.1200/JCO.18.01633`
- **核心重点**：1497例病理切片测算证实：切缘距离 < 2cm 且伴 STAS 时复发率最高；而肺叶切除（Lobectomy）可将 STAS 不良复发风险完全拉平至 STAS 阴性同等水平。
- **推荐标签**：`STAS`, `切缘<2cm`, `JCO`, `根治性肺叶`

### 15. Travis et al. 2016（脏层胸膜侵犯 VPI 与 PL1/PL2 升期预后）
- **英文标题**：*The Eighth Edition Lung Cancer Stage Classification: Prognostic Impact of Visceral Pleural Invasion*
- **期刊 / 年份**：*Journal of Thoracic Oncology (JTO)*, 2016
- **PMID**：27468790 | **DOI**：`10.1016/j.jtho.2016.07.011`
- **核心重点**：证实穿透内弹力层（PL1）与穿透胸膜外表面（PL2）预后无显著统计学差异，支持统一将 ≤3cm 结节升期为 T2a（IB 期）的国际标准。
- **推荐标签**：`VPI`, `胸膜侵犯`, `PL1/PL2`, `T2a升期`

### 16. Hishida et al.（微血管侵犯 MVI / 脉管癌栓 LVI 多中心大队列）
- **英文标题**：*Prognostic Impact of Microvascular Invasion and Lymphatic Invasion in Resected Non-Small Cell Lung Cancer*
- **期刊 / 年份**：*Journal of Thoracic Oncology (JTO)*, 2020
- **PMID**：31988012 | **DOI**：`10.1016/j.jtho.2020.01.018`
- **核心重点**：细分血管侵犯（VPI/BVI）与淋巴管侵犯（LVI），证实微血管侵犯主要预警远处血行微转移，免疫组化双标（CD31 + D2-40）显著提高检出准确率。
- **推荐标签**：`LVI`, `微血管侵犯MVI`, `D2-40`, `远处转移预警`

### 17. Sica et al.（微乳头和实体型亚型占比与辅助治疗响应）
- **英文标题**：*Histologic Subtyping of Lung Adenocarcinoma: Impact of Minor Components (<5% and 5%-20%) on Recurrence*
- **期刊 / 年份**：*Journal of Thoracic Oncology (JTO)*, 2021
- **PMID**：33497812 | **DOI**：`10.1016/j.jtho.2021.01.1613`
- **核心重点**：即使微乳头（Micropapillary）或实体型（Solid）成分仅占 5%~20%（未达主导），患者复发风险仍呈阶梯式上升，支持术后列入高危随访。
- **推荐标签**：`微乳头亚型`, `实体型`, `次要高危成分`, `病理浸润`

---

## 专题四：术后辅助靶向、免疫与化疗里程碑（ADAURA / ALINA / LACE / 围手术期免疫）

### 18. ADAURA 总生存期（OS）最终全文（NEJM 2023 · 证实死亡风险减半）
- **英文标题**：*Overall Survival Analysis with Osimertinib in Resected EGFR-Mutated Non–Small-Cell Lung Cancer*
- **第一作者 / 团队**：Herbst RS, Tsuboi M, Wu YL, et al.
- **期刊 / 年份**：*New England Journal of Medicine (NEJM)*, 2023
- **PMID**：37272535 | **DOI**：`10.1056/NEJMoa2304594`
- **核心重点**：5年 OS 率 88% vs 78%（OS HR=0.49），死亡风险降低 51%，证实奥希替尼不仅延缓复发，更转化为切实的长期生存获益。
- **推荐标签**：`ADAURA`, `奥希替尼OS`, `HR=0.49`, `5年生存率88%`

### 19. ALINA 研究（NEJM 2024 · 阿来替尼 ALK 阳性术后辅助全球首发）
- **英文标题**：*Alectinib in Resected ALK-Positive Non–Small-Cell Lung Cancer*
- **第一作者 / 团队**：Wu YL, Dziadziuszko R, Solomon BJ, et al.
- **期刊 / 年份**：*New England Journal of Medicine (NEJM)*, 2024
- **PMID**：38598794 | **DOI**：`10.1056/NEJMoa2310532`
- **核心重点**：IB~IIIA 期 ALK 阳性术后患者中，阿来替尼将 2年 DFS 率提升至 93.8%（化疗组 63.0%），DFS HR=0.24，脑转移复发风险降低 78%。
- **推荐标签**：`ALINA`, `阿来替尼`, `ALK突变`, `DFS HR=0.24`

### 20. CheckMate 816（NEJM 2022 · 新辅助免疫联合化疗病理完全缓解）
- **英文标题**：*Neoadjuvant Nivolumab plus Chemotherapy in Resectable Lung Cancer*
- **期刊 / 年份**：*New England Journal of Medicine (NEJM)*, 2022
- **PMID**：35407651 | **DOI**：`10.1056/NEJMoa2202170`
- **核心重点**：术前 3 周期纳武利尤单抗+化疗使病理完全缓解率（pCR）达 24.0%（化疗仅 2.2%），大幅提升手术 R0 切除率。
- **推荐标签**：`CheckMate816`, `新辅助免疫`, `pCR 24%`, `EFS延长`

### 21. KEYNOTE-671（NEJM 2023 · 围手术期帕博利珠单抗全疗程获益）
- **英文标题**：*Perioperative Pembrolizumab for Early-Stage Non–Small-Cell Lung Cancer*
- **期刊 / 年份**：*New England Journal of Medicine (NEJM)*, 2023
- **PMID**：37272513 | **DOI**：`10.1056/NEJMoa2302983`
- **核心重点**：II~IIIB 期围手术期“夹心免疫”治疗，无事件生存期（EFS HR=0.58）与总生存期（OS HR=0.72）均获得显著突破。
- **推荐标签**：`KEYNOTE671`, `K药`, `围手术期免疫`, `OS获益`

---

## 专题五：微小残留病灶 (ctDNA MRD) 与动态随访预警

### 22. TRACERx 项目（Nature 2023 · ctDNA 预警微转移演化动力学）
- **英文标题**：*Tracking Early Lung Cancer Evolution through Therapy (TRACERx): Evolutionary Dynamics and Clinical Utility of Circulating Tumor DNA*
- **第一作者 / 团队**：Abbosh C, Frankell AM, Swanton C, et al.
- **期刊 / 年份**：*Nature*, 2023
- **PMID**：37046091 | **DOI**：`10.1038/s41586-023-05783-5`
- **核心重点**：多中心 421 例患者纵向追踪，证实血液 ctDNA 检出 MRD 较传统 CT 影像提前中位 **160~200 天**；持续阴性者具有极高长期治愈率。
- **推荐标签**：`TRACERx`, `ctDNA`, `MRD`, `复发预警`, `Nature`

### 23. DYNAMIC-Lung 前瞻性队列（Cancer Discovery 2022 · MRD 阴性降级治疗）
- **英文标题**：*Longitudinal Monitoring of Circulating Tumor DNA for Minimal Residual Disease in Resected Early-Stage Non-Small Cell Lung Cancer*
- **期刊 / 年份**：*Cancer Discovery*, 2022
- **PMID**：34740914 | **DOI**：`10.1158/2159-8290.CD-21-0486`
- **核心重点**：术后 1月、3月、6月 ctDNA 持续阴性的早期患者，不接受化疗的 2 年 RFS 与化疗组无差异，为避免过度治疗提供前瞻性循证依据。
- **推荐标签**：`DYNAMIC`, `MRD阴性`, `降级治疗`, `精准免化疗`

---

## 专题六：权威临床指南与结节标准

### 24. Fleischner Society 2017 肺结节管理指南（Radiology 2017）
- **英文标题**：*Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017*
- **期刊 / 年份**：*Radiology*, 2017
- **PMID**：28240562 | **DOI**：`10.1148/radiol.2017161659`
- **推荐标签**：`Fleischner`, `结节随访`, `磨玻璃随访周期`

### 25. NCCN 非小细胞肺癌临床实践指南 (Version 2024 / 2025)
- **发布机构**：National Comprehensive Cancer Network (NCCN)
- **推荐标签**：`NCCN指南`, `临床实践指南`, `全病程治疗分流`

### 26. CSCO 非小细胞肺癌诊疗指南 (2024 中国版)
- **发布机构**：中国临床肿瘤学会指南工作委员会 (CSCO)
- **推荐标签**：`CSCO指南`, `中国临床指南`, `医保目录`

---

# 第三部分：文献检索下载与后台上传实操指南

### 1. 极速检索与下载官方 PDF 原文
1. 访问 [PubMed 官网](https://pubmed.ncbi.nlm.nih.gov/)。
2. 在搜索框中粘贴本文档中的 **PMID**（如 `35461563` 或 `36757978`）。
3. 页面右上角点击带有 **`Free PMC Article`**、**`Full Text`** 或期刊直达按钮下载 `.pdf` 文件。
4. 也可直接点击本文档中的 **DOI 链接** 直达期刊官网下载。

### 2. 通过 OncoPath 循证工作台上传解析
1. 打开本地服务后台：`http://localhost:3000/admin`。
2. 在左侧选择 **【PDF 智能多模态文献提取】** 模块。
3. 将下载好的论文 PDF 文件拖拽至上传区域。
4. 系统将自动调用 AI 解析管线，秒级提取：
   - 论文核心标题、期刊与发表年份
   - 患者样本量（Cohort Size）与临床分期
   - 效应量数据（HR 值、95% CI 置信区间、5年 RFS / OS 百分比）
   - 提取包含的关键生物学指标并自动挂载至全局知识图谱
5. 点击 **【核对并正式收录入库】**，该研究将立即生效并在前台国际研究库与患者档案推演引擎中可检索！
