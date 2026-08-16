<div align="center">
  <img src="https://raw.githubusercontent.com/TrojanFish/OncoPath/main/app/public/logo.png" width="100" alt="OncoPath Logo">
  <h1>OncoPath (肺癌循证知识与临床决策导航平台)</h1>
  <p><strong>Evidence-Based Oncology AI Agent & Clinical Navigation OS</strong></p>
  <p><em>基于已发表国际顶级临床研究、AJCC/IASLC 指南与真实队列数据的肺癌病理智能解读与循证推演系统</em></p>

  <p>
    <a href="README.md"><strong>English</strong></a> |
    <a href="README.zh-CN.md"><strong>中文说明</strong></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2.12-blue?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Nginx-SSE_Streaming-009639?style=flat-square&logo=nginx" alt="Nginx" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/PIPL-Privacy_Compliant-10b981?style=flat-square" alt="PIPL" />
    <img src="https://img.shields.io/badge/Docker-Production_Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## 🌟 核心理念与医学原则 (Vision)

OncoPath 旨在打破医学前沿与患者理解之间的信息壁垒，坚持 **“循证优先，AI 辅助 (Evidence-First, AI-Second)”** 铁律：
1. **杜绝 AI 幻觉与确定性算命**：核心分期与风险规则硬编码入库，严禁大模型擅自预测患者寿命或下达越权处方。
2. **100% 顶刊出处可溯**：所有风险比（HR）、5年无复发生存率（RFS）均来自 JTO、Lancet、JCO、Chest 等同行评审真实队列研究，每条结论均带 DOI/PubMed 直达链接。
3. **知情同意与门诊协同**：输出标准化就医问诊便签卡，助力患者与家属在门诊复查时与主管医生高效沟通。

---

## ✨ 核心特性与生产架构 (Key Features)

- 🩺 **Telemedicine 黄金比例就医工作台**：现代医疗天青色高亮风格，内置实景多模态推演沙盘与实时数据看板。
- 🔬 **AI 多模态病理智能提取**：支持手机拍照上传或文本粘贴，毫秒级提取 TNM、STAS、VPI、LVI、IASLC 分级与分子靶点。
- 🗺️ **4D 肺癌循证知识图谱**：动态可视化病理危险因子与临床预后之间的因果推演网络。
- 🖼️ **极速 2x Retina 门诊问诊便签卡**：基于独立矢量卡片模板，毫秒级生成适配微信发送与相册保存的就诊便签卡。
- 🛡️ **PIPL 个人隐私脱敏与被遗忘权**：内置 PII 脱敏引擎自动屏蔽身份证/手机号/住院号；提供一键彻底销毁与注销档案闭环。
- ⚡ **生产级 Nginx 流式代理调优**：专为 Server-Sent Events 流式打字机关闭内部缓冲，配置 1 年静态资源强缓存与 IP 防刷限流。

---

## 🐳 VPS 生产环境服务器部署实战指南 (VPS Runbook)

### 一、 生产环境一键部署流程 (Production Deployment)

#### 1. 服务器基础环境准备 (以 Ubuntu / Debian 为例)
登录您的 Linux VPS 终端，安装 Git 与 Docker 容器引擎：

```bash
# 1.1 更新系统软件源
sudo apt update && sudo apt upgrade -y

# 1.2 安装基础依赖与 Docker
sudo apt install -y git curl wget docker.io docker-compose-v2

# 1.3 启动 Docker 并设置开机自启
sudo systemctl enable docker
sudo systemctl start docker
```

#### 2. 云服务器安全组 / 防火墙端口放行
请前往您的云厂商控制台（阿里云 / 腾讯云 / 华为云 / AWS 等），在**安全组入方向规则**中放行：
* **`38000`** (TCP) - **OncoPath 生产级 Nginx 接入端口**（必须放行）

#### 3. 克隆代码仓库
```bash
# 3.1 克隆仓库到服务器
git clone https://github.com/TrojanFish/OncoPath.git

# 3.2 进入项目根目录
cd OncoPath
```

#### 4. 配置生产环境变量 (`.env`)
```bash
# 4.1 从模板生成 .env 文件
cp .env.example .env

# 4.2 编辑环境变量
nano .env
```

在 `.env` 文件中配置以下参数（按 `Ctrl + O` 保存，`Ctrl + X` 退出 nano）：
```env
# 必填：Google Gemini API Key (用于多模态病理解析、PDF 文献提取与专属报告生成)
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere

# 选填：管理员中台凭据
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourStrongAdminPassword2026!
ADMIN_SECRET=your_production_secret_key_2026

# 选填：生产端口配置 (默认 38000)
PROD_HTTP_PORT=38000
```

#### 5. 一键启动全新生产集群
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
> 💡 **生产架构说明**：该命令会自动启动 **PostgreSQL 16 独立数据库**、**Next.js 16 Web 引擎** 与 **Nginx 生产反向代理** 三大容器，并在后台自动执行 Prisma 数据库表结构初始化。

#### 6. 验证部署状态与健康探针
```bash
# 查看所有容器健康状态 (状态应为 Up healthy)
docker compose -f docker-compose.prod.yml ps

# 测试系统健康检查接口
curl http://localhost:38000/api/health
```

现在在电脑或手机浏览器打开 **`http://<您的VPS公网IP>:38000`**，即可直接体验 OncoPath 全套生产系统！

---

### 二、 后续日常更新与热重载流程 (Routine Updates)

当 GitHub 代码库有新功能发布时，在 VPS 上执行以下标准命令即可实现秒级无缝平滑更新：

```bash
# 1. 进入项目根目录
cd /opt/OncoPath   # 或您的实际安装路径

# 2. 从 GitHub 拉取最新主干代码
git pull origin main

# 3. 一键平滑重构并重启生产容器 (自动保留数据库数据)
docker compose -f docker-compose.prod.yml up -d --build

# 4. (可选) 清理旧版废弃镜像释放磁盘
docker image prune -f
```

> 💡 **核心区别解析：`up -d --build` 与 `up -d`**：
> - **`up -d --build`（带 `--build`）**：**拉取新代码后必须使用！** 强制重新触发 Next.js 编译打包，将最新修改的代码烧录进新镜像；
> - **`up -d`（不带 `--build`）**：仅用于服务器重启或仅修改了 `.env` 环境变量时，直接复用已有镜像秒级拉起，**不会编译最新代码**。

---

### 三、 常用运维、备份与排查命令清单 (Ops CheatSheet)

| 运维场景 | 推荐命令 | 说明 |
| :--- | :--- | :--- |
| **查看生产全量日志** | `docker compose -f docker-compose.prod.yml logs -f` | 实时追踪 Nginx、Next.js 与数据库状态 |
| **仅查看 Web 应用日志**| `docker compose -f docker-compose.prod.yml logs -f app` | 查看遥测 JSON、API 耗时与报错 |
| **执行数据库自动备份** | `bash scripts/backup-db.sh` | 自动导出 gzip 压缩快照，保留 30 天轮转 |
| **运行 AI 安全红线测试**| `cd app && npm test` | 执行 PII 脱敏与临床指南合规断言测试 |
| **重启生产集群** | `docker compose -f docker-compose.prod.yml restart` | 快速重启所有生产服务 |
| **停止生产集群** | `docker compose -f docker-compose.prod.yml down` | 停止服务（数据卷 `pgdata_prod` 依然安全保留） |

---

### 四、 生产安全与合规保障 (10 大加固维度)

* **🔐 接口限流与防刷**：`/api/generate-report` 限制单 IP 5次/分钟，防止恶意消耗 Token。
* **🛡️ 隐私去标识化 (PIPL)**：自动对身份证号、手机号、病案号执行不可逆掩码脱敏。
* **⚖️ 知情同意与免责声明**：内置 [`/terms`](/terms) 与 [`/privacy`](/privacy) 法律闭环。
* **⚡ Nginx SSE 优化**：关闭代理缓冲，保证打字机流式输出零延迟。
* **🩺 健康探针**：提供 `/api/health` 实时报告系统负载、内存与数据库连通性。

---

## 💻 本地开发环境搭建 (Local Development)

```bash
# 1. 进入前端工程
cd app

# 2. 安装依赖并启动开发服务
npm install
npm run dev

# 3. 运行安全回归测试
npm test
```
访问 `http://localhost:3000` 即可开始本地开发与调试。

---

## 🛡️ 临床合规与医学免责声明 (Disclaimer)

1. OncoPath 严格遵循 **AJCC 第8/9版** 肺癌 TNM 分期及 **IASLC / CSCO / NCCN** 组织学指南。
2. 本平台定位为**循证医学信息平权与科普检索辅助工具**，提供的统计数据来源于公开同行评审文献，**不构成任何临床诊断结论或处方建议**。
3. 任何具体的靶向用药、辅助化疗方案或随访周期调整，均须严格遵循专科主治医生的当面诊断意见。

---

## 📝 开源协议
本项目采用 [MIT License](LICENSE) 授权开源。
