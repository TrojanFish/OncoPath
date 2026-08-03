# LungEvidence MVP Implementation Task List

Version: 1.0

Status: Ready for Development

Last Updated: 2026-08-03
1. MVP Goal
目标
在最短时间内实现：

一个真实可用的 LungEvidence Demo。

用户能够：

注册账号

↓

输入肺癌术后信息

↓

系统自动分析

↓

生成循证报告

↓

查看相关研究
2. MVP Scope
Included
必须实现：

✅ 用户系统

✅ 病例录入

✅ 肺癌基础分类

✅ IA分期判断

✅ 高危因素管理

✅ Evidence数据库

✅ AI解释报告

Not Included
暂不实现：

❌ CT影像AI

❌ 数字病理AI

❌ 基因预测

❌ 医生协作平台

3. Development Timeline
建议：

12周 MVP。

Phase 0
Project Initialization
时间：

Day 1-3

任务：

T001
创建Repository

输出：

lung-evidence/
T002
初始化：

Frontend

Backend

Database

验收：

docker compose up

成功启动
Phase 1
Core Infrastructure
Week 1

Backend
任务：

T101
创建FastAPI项目。

目录：

backend/

app/

 ├── api

 ├── models

 ├── services

 └── core
T102
配置：

PostgreSQL。

T103
配置：

Redis。

验收：

API：

GET /health
返回：

OK
Phase 2
User System
Week 2

任务：

T201
用户模型。

字段：

id

email

password_hash

created_at
T202
JWT认证。

接口：

POST /register

POST /login
验收：

用户：

可以注册登录。

Phase 3
Medical Data Model
Week 3-4

建立核心数据库。

Patient Table
字段：

age

sex

surgery_date
Tumor Table
字段：

location

radiological_size

invasive_size
Pathology Table
字段：

histology

grade

STAS

VPI

LVI
验收：

可以保存一个完整病例。

Phase 4
Medical Rules Engine
Week 5

实现：

TNM Calculator
输入：

invasive_size

node

metastasis
输出：

T

N

M

Stage
IA Classification
输出：

IA1

IA2

IA3
测试病例：

案例：

1.5cm adenocarcinoma

N0

M0
Phase 5
Evidence Database
Week 6

建立：

Research Model。

字段：

title

pmid

year

population

factor

outcome

confidence
初始化：

100篇研究。

验收：

可以搜索：

STAS

IA1

GGO
Phase 6
AI Report Engine
Week 7-8

实现：

Evidence RAG。

流程：

Patient Data

↓

Retrieve Evidence

↓

LLM

↓

Report
输出：

结构：

你的病例

↓

研究定位

↓

相关因素

↓

参考研究
Phase 7
Frontend
Week 9

页面：

Homepage
介绍。

Dashboard
病例列表。

Case Input
病例录入。

Report
报告展示。

Phase 8
Safety Layer
Week 10

实现：

免责声明。

AI输出过滤。

禁止：

保证治愈

保证不复发
引用检查。

Phase 9
Deployment
Week 11

部署：

Docker

Nginx

HTTPS

Backup

Phase 10
Beta Testing
Week 12

测试：

50个模拟病例。

检查：

分类准确；
报告可理解；
引用正确。
4. Git Workflow
每个任务：

独立Branch。

格式：

feature/T101-fastapi-init
提交：

feat:

fix:

docs:
5. Codex Task Template
每次给Codex：

使用：

You are working on LungEvidence.

Read:

/docs/000-035


Current Task:

T101


Requirements:

...


Acceptance Criteria:

...


Do not modify unrelated files.
6. Definition of Done
任务完成必须：

代码：

✅ 可运行

测试：

✅ 通过

文档：

✅ 更新

医学：

✅ 不改变规则

7. First Codex Session
第一条任务：

不是写代码。

而是：

Read all docs.

Generate:

1. Architecture summary

2. Development plan

3. Potential risks

Do not code.
第二条：

开始：

T001。

8. MVP Success Criteria
完成后：

用户可以：

输入：

男性

35岁

右肺腺癌

IA1

STAS阴性

N0
系统生成：

病例分类

相关研究

风险因素解释

参考文献
End
LungEvidence MVP Implementation Task List v1.0
