# 项目长期备忘：OncoPath (LungEvidence)

## 项目身份
- 名称：OncoPath（仓库内也叫 LungEvidence）
- 定位：基于证据的肿瘤学 AI Agent 平台，肺癌优先（NSCLC）
- 原则：Evidence-First, AI-Second；规则硬编码，LLM 不做诊断，RAG 检索文献

## 技术栈关键点
- 前端 Next.js 16.2 + React 19 + Tailwind v4（版本很新，注意生态兼容）
- 后端 FastAPI 0.109 + SQLAlchemy 2.0 + OpenAI SDK（gpt-4-turbo + ada-002）
- DB：pgvector（生产）/ SQLite（MVP）
- 部署：docker-compose，端口 38030/38080/35432/36379

## 目录约定
- `app/` 前端，`backend/` 后端，`docs/` 设计文档（50 份），`data/` 证据数据
- `mGGO肺癌预后分析.md`（350KB）肺癌预后资料
- `app_src/` 前端核心文件源备份

## 用户偏好
- 沟通风格：简洁专业（默认；用户未明确指定）
- Bootstrap 流程：首次交互时跳过，身份文件未更新，BOOTSTRAP.md 保留
