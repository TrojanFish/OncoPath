这一章将设计 LungEvidence 最核心的输出能力：

**AI如何生成一份患者报告。**

包括：

* Prompt架构；
* RAG流程；
* 医学证据引用；
* 报告模板；
* 如何避免幻觉；
* 如何解释你的IA1/GGO/STAS这类复杂病例。

完成后，LungEvidence 的核心闭环：

> 数据 → 分析 → AI解释 → 患者报告

就完整了。

* * *

**You:**

下一步

* * *

**ChatGPT:**

继续。

这一章是 LungEvidence 的**核心智能模块设计**。

前面的：

* 数据库 → 保存医学事实；
* API → 提供调用能力；
* 前端 → 展示结果；

但是患者真正感受到价值的地方是：

> “为什么我的情况属于这个范围？依据是什么？我应该如何理解？”

因此 AI Report Engine 是整个产品的核心。

这里必须强调：

LungEvidence 的 AI **不是医生替代系统**。

它的定位：

> **Evidence Interpreter（医学证据解释器）**

不是：

> Diagnosis Engine（诊断引擎）。

---

#