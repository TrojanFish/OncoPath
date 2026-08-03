# LungEvidence Project Charter
**Version:** 1.0  
**Status:** Active  
**Last Updated:** 2026-08-03  
**Classification:** Core Blueprint Document

---

> **Code Rule #1:**  
> *Every medical statement must be traceable to evidence.*  
> — LungEvidence Founding Principle

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | LungEvidence |
| **Full Name** | LungEvidence — Evidence-based Lung Cancer Knowledge Platform |
| **Chinese Name** | 肺癌循证（Evidence Lung） |
| **Domain** | lungevidence.org (proposed) |
| **Stage** | Blueprint v1.0 / Pre-development |
| **Primary Language** | Chinese (Simplified) + English |

---

## 2. Mission Statement

> **帮助肺癌患者理解循证医学，而不是替代医生。**  
> *Help lung cancer patients understand evidence-based medicine, not replace their doctors.*

---

## 3. Problem Statement

每年，全球数百万肺癌患者术后拿到一份病理报告，却不知道这些信息在国际研究中意味着什么：

- 医院会告诉患者：**IA1、中分化、STAS阴性、混合磨玻璃、CTR<0.5**
- 但几乎不会告诉他们：**"像你这样的患者，在近20篇研究中属于前15%的低风险人群"**

这就是 **信息鸿沟**（Information Gap）——患者拥有数据，但缺乏可信的解释框架。

### 现有解决方案的不足

| 现有资源 | 不足之处 |
|----------|----------|
| PubMed | 太专业，普通患者无法理解 |
| ChatGPT / AI问答 | 容易幻觉，无法追溯来源 |
| UpToDate | 面向医生，非患者友好 |
| 百度/医院科普 | 过于简化，缺乏个体化 |
| 无任何工具 | 能把患者放到已发表的研究里面 |

---

## 4. What LungEvidence IS and IS NOT

### ✅ LungEvidence 是什么

- **医学研究翻译器** — 把 SCI 论文翻译成患者能理解的语言
- **患者教育平台** — 帮助患者理解自己的病理信息
- **研究证据导航系统** — 把患者放到已发表的研究中定位
- **个体化医学知识解释工具** — 基于个人病理特征匹配相关研究
- **循证知识图谱** — 可持续积累的证据资产

### ❌ LungEvidence 不是什么

- ❌ AI 医生
- ❌ 在线诊断工具
- ❌ 治疗推荐系统  
- ❌ 替代医生决策
- ❌ 预测寿命的算法
- ❌ 黑盒 AI 评分系统

---

## 5. Core Principles（核心原则）

### Principle 1: Evidence First（证据优先）

任何医学结论必须可以追溯到：

```
结论 → 研究 → 数据 → 证据等级 → 原始论文
```

**实现方式：** 每一条解释文字后面必须关联 Evidence Node，每个 Evidence Node 必须关联具体的 Study。

---

### Principle 2: Explain, Not Decide（解释，不决策）

系统的职责是告诉用户：**"研究显示什么"**  
而不是：**"你应该怎么治疗"**

```
✅ "在包含3,278名患者的研究中，STAS阳性患者的复发风险比STAS阴性高约87%"
❌ "你的STAS阴性，所以不需要担心复发"
```

---

### Principle 3: Transparency（透明度）

用户必须清楚地知道：
- 每条结论的数据来源
- 支持这条结论的研究数量
- 证据质量（★★★★★ 评级）
- 存在的不确定性和争议

---

### Principle 4: Patient-Centered Language（以患者为中心）

- 医生能接受的科学严谨性
- 患者能理解的表达方式
- 避免：恐吓性语言、绝对化表述、制造焦虑

---

### Principle 5: Living Knowledge（持续更新的知识）

- 数据库每日自动从 PubMed 同步
- 每新增一篇高质量研究，知识库自动更新
- 患者看到的不是"静态答案"，而是"当前最佳证据"

---

## 6. Target Users

### Primary User: 肺癌术后患者

**特征：**
- 已完成手术，拥有病理报告
- 高度焦虑，渴望理解自己的情况
- 缺乏医学背景，无法阅读英文论文
- 有大量时间搜索信息，但找不到可信来源

**需求：**
- 理解自己的病理数据意味着什么
- 知道哪些因素真正重要，哪些只是制造焦虑
- 获得有来源的信息，而不是"AI瞎说"

---

### Secondary User: 临床医生

**特征：**
- 门诊时间有限，无法详细解释每个指标
- 需要快速工具辅助患者教育
- 重视循证医学，要求每个结论有来源

**需求：**
- 快速生成患者可理解的报告
- 展示某患者特征对应的研究定位
- 节省门诊科普时间

---

### Tertiary User: 医学研究者

**特征：**
- 需要了解某个因素（如STAS、CTR）的证据全貌
- 希望追踪某研究领域的最新进展

---

## 7. Differentiation（核心差异化）

| 功能 | LungEvidence | ChatGPT | PubMed | UpToDate |
|------|-------------|---------|--------|----------|
| 中文患者友好 | ✅ | 部分 | ❌ | ❌ |
| 每句话可追溯来源 | ✅ | ❌ | ✅ | ✅ |
| 基于个人病理匹配研究 | ✅ | ❌ | ❌ | ❌ |
| 自动日常更新 | ✅ | ❌ | ✅ | ✅ |
| 证据质量可视化 | ✅ | ❌ | ❌ | 部分 |
| 患者相似性定位 | ✅ | ❌ | ❌ | ❌ |
| 知识图谱 | ✅ | ❌ | ❌ | ❌ |
| 免费访问 | ✅ | 部分 | ✅ | ❌ |

---

## 8. Success Metrics（成功指标）

### Phase 1 (MVP)
- [ ] 用户能上传病理报告并获得循证解释
- [ ] 每条解释有可点击的论文来源
- [ ] 知识库收录 ≥ 500 篇肺癌相关研究
- [ ] 中文界面，患者友好

### Phase 2 (Growth)
- [ ] 知识库 ≥ 2,000 篇研究
- [ ] 自动每日同步 PubMed
- [ ] 医生模式上线
- [ ] 月活用户 ≥ 1,000

### Phase 3 (Scale)
- [ ] 扩展至乳腺癌、结直肠癌
- [ ] 研究知识图谱对外开放 API
- [ ] 与医院合作

---

## 9. What We Will NOT Build（明确边界）

为了保持项目聚焦，以下功能**明确排除**在 MVP 之外：

- ❌ 预测具体生存期
- ❌ 推荐具体用药方案
- ❌ 替代病理诊断
- ❌ 实时医生咨询
- ❌ 患者社区/论坛（Phase 1）
- ❌ 付费订阅（Phase 1）

---

## 10. Legal & Medical Disclaimer Requirement

所有页面必须包含：

> **重要声明：** LungEvidence 提供的信息来自已发表的医学研究，仅供教育和参考目的。本平台不提供医疗诊断、治疗建议或替代专业医疗咨询。所有医疗决策请咨询您的主治医生。

---

*This document is the constitutional foundation of LungEvidence. All subsequent design, development, and operational decisions must align with the principles defined here.*
