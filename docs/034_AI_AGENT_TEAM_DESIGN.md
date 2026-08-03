# LungEvidence AI Agent Team Design

Version: 1.0

Status: Draft

Last Updated: 2026-08-03
1. Overview
Purpose
设计 LungEvidence 的 AI Agent 工作体系。

目标：

建立：

AI Product Team

+

Human Medical Oversight
2. Team Structure
整体：

                 Human Owner

                      |

              Product Manager Agent

                      |

 ------------------------------------------------

 |              |              |              |

Coding       Medical       Data          QA

Agent        Agent          Agent         Agent
3. Product Manager Agent
Role
产品负责人。

职责：

管理需求；
分解任务；
维护Roadmap；
检查方向。
输入：

用户反馈。

医学趋势。

技术变化。

输出：

Feature Request

↓

Development Task
示例：

用户：

想知道自己的IA1和IA2区别。

PM Agent：

生成：

Feature:

IA Comparison Module

Priority:

High
4. Coding Agent
Role
软件工程师。

负责：

前端；
后端；
数据库；
API；
部署。
工作流程：

Read Docs

↓

Plan

↓

Code

↓

Test

↓

Update Docs
规则：

不能：

自行修改医学规则。

5. Medical Research Agent
Role
医学研究员。

负责：

论文发现。

任务：

每日：

搜索：

lung adenocarcinoma

stage IA

STAS

GGO

survival
输出：

Evidence候选。

6. Evidence Extraction Agent
Role
医学数据工程师。

负责：

论文：

↓

结构化。

输出：

{
factor:"STAS",

outcome:"recurrence",

confidence:"moderate"
}
7. Knowledge Graph Agent
Role
医学知识管理员。

负责：

维护：

Factor

↓

Relation

↓

Outcome
例如：

新增：

STAS

↓

Higher recurrence risk
8. QA Agent
Role
质量工程师。

负责：

代码：

测试；
性能。
医学：

引用检查；
安全检查。
检查：

Does answer have evidence?

Is conclusion too strong?
9. Security Agent
Role
安全工程师。

检查：

数据泄露；
权限；
API安全。
重点：

患者病例数据。

10. Content Agent
Role
内容运营。

负责：

生成：

科普文章；
SEO内容；
视频脚本。
例如：

主题：

为什么IA1肺癌术后通常不需要辅助治疗？

生成：

多个版本：

患者版；
医生版；
SEO版。
11. Agent Communication Protocol
所有Agent：

通过：

Task Object
沟通。

格式：

{
task_id:

"LE-1024",

type:

"medical_update",

priority:

"high",

status:

"pending"
}
12. Documentation as Memory
AI团队最大问题：

遗忘。

解决：

Docs作为：

长期记忆。

规则：

任何修改：

必须更新：

/docs
13. Daily AI Workflow
每天：

08:00

Research Agent：

扫描新论文。

09:00

Extraction Agent：

解析。

10:00

Medical Agent：

审核。

12:00

Knowledge Agent：

更新。

晚上：

QA：

检查系统。

14. Human-in-the-loop
医学领域：

必须有人审核。

人负责：

最终判断。

AI负责：

效率。

比例：

未来：

AI 90%

Human 10%
15. Agent Memory
每个Agent：

拥有：

自己的Memory。

例如：

Medical Agent：

保存：

医学规则；
专业术语。
Coding Agent：

保存：

架构；
编码规范。
16. Agent Evaluation
评价：

不是代码量。

指标：

Medical Agent
准确率。

Coding Agent
Bug数量。

Research Agent
有效Evidence数量。

17. Future Autonomous Loop
最终：

New Research

↓

AI Detect

↓

AI Extract

↓

AI Validate

↓

Database Update

↓

Patient Reports Improve
18. Why This Creates Moat
未来大家都有：

GPT。

但区别：

不是模型。

而是：

医学知识资产

+

长期病例结构

+

Evidence Graph

+

用户反馈
End
LungEvidence AI Agent Team Design v1.0
