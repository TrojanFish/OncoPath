这一章进入工程实现层：

* PostgreSQL 数据模型
* Knowledge Graph 表结构
* Patient Profile Schema
* Evidence Schema
* Paper Schema
* Vector Database Schema
* 数据关系设计

这会是 Codex 开始写后端代码前最重要的一份文档。

* * *

**You:**

下一步

* * *

**ChatGPT:**

继续。

从这一章开始，Blueprint 从**产品和AI设计层**进入**工程实现层**。

这一部分对于 Codex 非常重要，因为 AI Coding 最大的问题不是不会写代码，而是不知道：

* 数据应该如何组织；
* 哪些对象是核心资产；
* 哪些字段未来不能轻易修改；
* 哪些关系需要提前设计。

LungEvidence 最核心的资产不是网页，而是：

> **Patient Data + Evidence Data + Knowledge Graph Data**

所以数据库设计必须优先。

---

#