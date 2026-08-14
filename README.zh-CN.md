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
    <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PostgreSQL-16%2Bpgvector-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker" alt="Docker" />
    <img src="https://img.shields.io/badge/PWA-Supported-6C5CE7?style=flat-square" alt="PWA" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>
</div>

---

## 🌟 核心理念与医学原则 (Vision)

OncoPath 旨在打破医学前沿与患者理解之间的信息壁垒，坚持 **“循证优先，AI 辅助 (Evidence-First, AI-Second)”** 铁律：
1. **杜绝 AI 幻觉与确定性算命**：核心分期与风险规则硬编码入库，严禁大模型擅自预测患者寿命或下达越权处方。
2. **100% 顶刊出处可溯**：所有风险比（HR）、5年无复发生存率（RFS）均来自 JTO、Lancet、JCO、Chest 等同行评审真实队列研究，每条结论均带 DOI/PubMed 直达链接。
3. **知情同意与门诊协同**：输出标准化问诊清单，助力患者与家属在复查问诊时与主治医生高效沟通。

---

## ✨ 核心特性与架构 (Key Features)

- 🩺 **Telemedicine 黄金比例双列界面**：现代医疗天青色高亮风格，内置实景多模态推演沙盘与实时数据看板。
- 🔬 **AI 多模态病理智能提取**：支持手机拍照上传或文本粘贴，毫秒级提取 TNM、STAS、VPI、LVI、IASLC 分级与分子靶点。
- 🗺️ **4D 肺癌循证知识图谱**：动态可视化病理危险因子与临床预后之间的因果推演网络。
- 📚 **三级智能文献去重中台**：管理员上传 PDF 或抓取 PubMed 时，自动通过 `DOI ➔ PMID ➔ 规范标题` 三级特征进行原地增量更新与去重。
- 📱 **全套 PWA 手机 WebApp 支持**：适配 iOS / Android，支持「添加到主屏幕」全屏独立运行，内置丝滑汉堡包抽屉导航。
- 🔐 **隐蔽式管理员双轨鉴权**：公开前端纯净化隐藏后台链接，管理员在统一登录弹窗输入凭据自动秒级跳转 `/admin` 证据中台。

---

## 🐳 VPS 生产环境服务器部署实战指南 (VPS Runbook)

### 一、 首次全新部署流程 (First-time Deployment)

#### 1. 服务器基础环境准备 (以 Ubuntu / Debian 为例)
登录您的 Linux VPS 终端，安装 Git 与 Docker 容器引擎：

```bash
# 1.1 更新系统软件源
sudo apt update && sudo apt upgrade -y

# 1.2 安装基础依赖与 Docker
sudo apt install -y git curl wget docker.io docker-compose

# 1.3 启动 Docker 并设置开机自启
sudo systemctl enable docker
sudo systemctl start docker

# 1.4 (可选) 验证 Docker 是否就绪
docker --version
docker-compose --version
```

> **如果使用 CentOS / RHEL / Alibaba Cloud Linux**：
> ```bash
> sudo yum install -y git docker
> sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
> sudo chmod +x /usr/local/bin/docker-compose
> sudo systemctl enable --now docker
> ```

#### 2. 云服务器安全组 / 防火墙端口放行
请前往您的云厂商控制台（阿里云 / 腾讯云 / 华为云 / AWS 等），在**安全组入方向规则**中放行以下端口：
* **`38030`** (TCP) - **OncoPath 前端患者与管理访问主端口**（必须放行）
* **`38080`** (TCP) - 后端 API 接口端口（若需外部直接调用 API）

#### 3. 克隆代码仓库
```bash
# 3.1 克隆仓库到服务器
git clone https://github.com/TrojanFish/OncoPath.git

# 3.2 进入项目根目录
cd OncoPath
```

#### 4. 配置生产环境变量 (`.env`)
复制环境变量配置模板并填写您的密钥：

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

# 选填：管理员中台默认凭据 (可自定义修改)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=OncoPath2026!
ADMIN_SECRET=oncopath_evidence_admin_secret_key_2026

# 选填：服务器外网访问地址 (替换为您的 VPS 公网 IP 或已解析的域名)
NEXT_PUBLIC_APP_URL=http://<您的VPS公网IP>:38030
NEXT_PUBLIC_API_URL=http://<您的VPS公网IP>:38080/api
```

#### 5. 一键容器化构建并后台启动
```bash
docker-compose up -d --build
```
> 💡 **启动说明**：容器启动时，系统会自动连接 PostgreSQL 数据库，自动执行 Prisma 数据库表结构初始化并自动播种预置的 500,000+ 临床前瞻性队列研究数据。

#### 6. 验证部署状态
```bash
# 查看所有容器运行状态 (应显示 4 个容器状态均为 Up)
docker-compose ps

# 查看前端实时日志
docker-compose logs -f frontend
```

现在在电脑或手机浏览器打开 **`http://<您的VPS公网IP>:38030`**，即可直接体验 OncoPath 全套系统！

---

### 二、 后续日常更新与热重载流程 (Routine Updates)

当代码仓库有新功能发布或修复更新时，在 VPS 上仅需执行以下标准步骤即可实现无缝平滑更新：

#### 1. 标准一键热更新命令
```bash
# 1. 进入项目根目录
cd ~/OncoPath   # 或您的实际安装路径

# 2. 从 GitHub 拉取最新主干代码
git pull origin main

# 3. 重新构建并平滑重启容器 (自动继承持久化数据库)
docker-compose up -d --build
```

#### 2. (推荐) 清理废弃镜像释放磁盘空间
重新构建会产生旧版本的缓存镜像，建议定期运行以下指令释放 VPS 磁盘：
```bash
docker image prune -f
```

---

### 三、 常用运维与故障排查命令清单 (Ops CheatSheet)

| 运维场景 | 推荐命令 | 说明 |
| :--- | :--- | :--- |
| **查看实时全量日志** | `docker-compose logs -f` | 实时追踪所有微服务容器运行状态 |
| **仅查看前端容器日志** | `docker-compose logs -f frontend` | 查看 Next.js 页面与 API 报错 |
| **仅查看后端容器日志** | `docker-compose logs -f backend` | 查看 FastAPI 与 RAG 运行详情 |
| **重启全部服务** | `docker-compose restart` | 不重新编译，快速重启所有容器 |
| **停止并卸载容器** | `docker-compose down` | 停止服务（数据卷 `postgres_data` 依然安全保留） |
| **查看容器资源占用** | `docker stats` | 实时查看 CPU、内存与网络 I/O |
| **重置并清空数据库** | `docker-compose down -v` | ⚠️ **高危**：会连同数据库持久化卷一起删除 |

---

### 四、 数据持久化与安全性说明

* **数据库持久化**：PostgreSQL 数据存储在 Docker 命名卷 `postgres_data` 中，执行 `git pull` 与 `docker-compose up -d --build` **绝不会丢失**管理员已录入的文献、患者历史病例与知识图谱数据。
* **Redis 缓存持久化**：缓存存储在 `redis_data` 卷中，确保高频查询的快速响应。

---

## 💻 本地开发环境搭建 (Local Development)

### 环境要求
- Node.js 20+
- Python 3.11+

```bash
# 1. 运行前端
cd app
npm install
npm run dev

# 2. 运行后端 (可选)
cd ../backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
访问 `http://localhost:3000` 即可开始本地开发与调试。

---

## 🛡️ 临床合规与医学免责声明 (Disclaimer)

1. OncoPath 严格遵循 **AJCC 第8/9版** 肺癌 TNM 分期及 **IASLC** 组织学指南。
2. 本平台定位为**循证医学信息平权与科普检索辅助工具**，提供的统计数据来源于公开医学文献，**不构成任何临床诊断结论或处方建议**。
3. 任何具体的靶向用药、辅助化疗方案或随访周期调整，均须严格遵循专科主治医生的当面诊断意见。

---

## 📝 开源协议
本项目采用 [MIT License](LICENSE) 授权开源。
