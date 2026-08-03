# LungEvidence Deployment Architecture and DevOps

**Version:** 1.0
**Status:** Development Ready
**Last Updated:** 2026-08-03
**Classification:** Infrastructure Blueprint

---

> **DevOps Principle:**
> *Infrastructure is a product too. It must be as reliable as the medical evidence it serves.*

---

## 1. Overview

### Purpose

定义 LungEvidence 从代码到真实运行服务的完整工程部署体系，包括：

- 服务器架构
- Docker 容器编排
- 前后端部署
- 数据库运维
- CI/CD 自动化
- 备份与恢复
- 监控与告警
- 日志系统
- 安全加固

### 设计原则

| 原则 | 说明 |
|------|------|
| **Reproducibility** | 任何环境可以从零重建 |
| **Immutability** | 部署单元是 Docker 镜像，不可在生产修改 |
| **Observability** | 系统状态随时可见 |
| **Least Privilege** | 每个组件最小权限 |
| **Graceful Degradation** | 单点故障不影响核心功能 |

---

## 2. Architecture Overview

### 2.1 MVP 架构（Phase 1）

```
Internet
    │
    ▼
Cloudflare (CDN + WAF + DDoS Protection)
    │
    ▼
VPS — Ubuntu 22.04 LTS
    │
    ├── Nginx (Reverse Proxy + SSL Termination)
    │       │
    │       ├── /          → Next.js Frontend (Port 3000)
    │       ├── /api/      → FastAPI Backend (Port 8000)
    │       └── /admin/    → Admin Panel (Port 8001)
    │
    ├── Docker Compose
    │       ├── frontend   (Next.js)
    │       ├── backend    (FastAPI + Python)
    │       ├── worker     (Celery — Background Tasks)
    │       ├── postgres   (PostgreSQL 16 + pgvector)
    │       └── redis      (Cache + Task Queue)
    │
    └── Backup Agent → Object Storage (Daily)
```

### 2.2 Phase 2 架构（生产扩展）

```
Internet
    │
    ▼
Cloudflare
    │
    ▼
Load Balancer
    │
    ├── Web Server × 2 (Active-Active)
    ├── API Server × 2 (Active-Active)
    ├── PostgreSQL Primary + Read Replica × 1
    ├── Redis Cluster
    └── Worker Pool × 2 (PubMed Pipeline)
```

### 2.3 架构选择理由

| 选择 | 原因 |
|------|------|
| **VPS 而非 Serverless** | 医学数据库需要持久连接，Serverless 冷启动不适合 |
| **Docker Compose 而非 K8s** | MVP 阶段单机足够，K8s 过度设计 |
| **PostgreSQL 而非 MongoDB** | 医学数据关系清晰，需要强事务保证 |
| **Cloudflare 免费层** | WAF + CDN + DDoS 防护，0 额外成本 |
| **Nginx** | 配置简单，社区文档完善，适合 MVP |

---

## 3. Infrastructure Specification

### 3.1 MVP Server Specification

| 项目 | 规格 |
|------|------|
| **Provider** | Hetzner Cloud（性价比最高）/ DigitalOcean / Vultr |
| **OS** | Ubuntu 22.04 LTS |
| **CPU** | 4 vCPU |
| **RAM** | 8 GB |
| **Storage** | 80 GB NVMe SSD |
| **Bandwidth** | 5 TB/月 |
| **Location** | Singapore (SG1) — 服务中文用户 |
| **Estimated Cost** | ~$15–20 USD/月 |

### 3.2 Storage Plan

```
/
├── /app/                  # 应用代码 (Docker Volumes)
├── /var/lib/postgresql/   # PostgreSQL 数据
├── /var/log/lungevidence/ # 应用日志
└── /backup/               # 本地备份缓存
```

### 3.3 Object Storage

| 用途 | 方案 |
|------|------|
| 数据库备份 | Cloudflare R2（0 egress fee） |
| 用户上传文件 | Cloudflare R2 |
| 静态资源 | Cloudflare CDN |

---

## 4. Docker Architecture

### 4.1 Docker Compose 结构

```yaml
# docker-compose.yml (概念结构)
version: "3.9"

services:

  frontend:
    image: lungevidence/frontend:${VERSION}
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=/api
    restart: always
    depends_on:
      - backend

  backend:
    image: lungevidence/backend:${VERSION}
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SECRET_KEY=${SECRET_KEY}
    restart: always
    depends_on:
      - postgres
      - redis

  worker:
    image: lungevidence/backend:${VERSION}
    command: celery -A app.worker worker --loglevel=info
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    restart: always
    depends_on:
      - postgres
      - redis

  postgres:
    image: pgvector/pgvector:pg16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=lungevidence
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: always

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always

volumes:
  postgres_data:
  redis_data:
```

### 4.2 Docker Image Strategy

| 镜像 | 基础层 | 大小目标 |
|------|--------|----------|
| frontend | node:20-alpine | < 300 MB |
| backend | python:3.11-slim | < 500 MB |
| worker | 复用 backend 镜像 | — |

### 4.3 Multi-stage Build — Frontend

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4.4 Multi-stage Build — Backend

```dockerfile
FROM python:3.11-slim AS deps
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim AS runner
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 5. Nginx Configuration

### 5.1 主配置

```nginx
server {
    listen 80;
    server_name lungevidence.org www.lungevidence.org;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name lungevidence.org www.lungevidence.org;

    ssl_certificate     /etc/letsencrypt/live/lungevidence.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lungevidence.org/privkey.pem;

    # 安全 Headers
    add_header X-Frame-Options           "SAMEORIGIN";
    add_header X-Content-Type-Options    "nosniff";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # API 后端
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header X-Real-IP $remote_addr;
        limit_req zone=api burst=20 nodelay;
    }

    client_max_body_size 10M;
}
```

### 5.2 Rate Limiting

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m  rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
}
```

---

## 6. CI/CD Pipeline

### 6.1 工具选择

| 工具 | 用途 |
|------|------|
| **GitHub Actions** | CI/CD 主流程 |
| **Docker Hub / GHCR** | 镜像仓库 |
| **SSH Deploy** | 生产部署触发 |
| **GitHub Secrets** | 密钥管理 |

### 6.2 CI Pipeline（代码提交时）

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint Frontend
        run: cd frontend && npm ci && npm run lint
      - name: Lint Backend
        run: cd backend && pip install ruff && ruff check .

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: lungevidence_test
    steps:
      - uses: actions/checkout@v4
      - name: Backend Tests
        run: cd backend && pip install -r requirements.txt && pytest tests/ -v --cov=app

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and Push Images
        run: |
          docker build -t lungevidence/frontend:${{ github.sha }} ./frontend
          docker build -t lungevidence/backend:${{ github.sha }} ./backend
          docker push lungevidence/frontend:${{ github.sha }}
          docker push lungevidence/backend:${{ github.sha }}
```

### 6.3 CD Pipeline（合并到 main 自动部署）

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /app/lungevidence
            export VERSION=${{ github.sha }}
            docker compose pull
            docker compose up -d --no-deps
            docker compose exec backend python -m alembic upgrade head
            docker system prune -f
```

### 6.4 部署流程

```
Developer Push
      │
      ▼
GitHub Actions: Lint → Test → Build Image
      │
      ▼ (仅 main 分支)
Push Image to Registry
      │
      ▼
SSH into Production Server
      │
      ▼
docker compose pull → up -d (零停机滚动更新)
      │
      ▼
Database Migration (alembic upgrade head)
      │
      ▼
Health Check → Deployment Complete ✅
```

---

## 7. Environment Management

### 7.1 环境分层

| 环境 | 用途 |
|------|------|
| **Development** | 本地开发，docker compose up |
| **Staging** | 上线前验证，独立服务器 |
| **Production** | 真实用户服务 |

### 7.2 环境变量规范

```bash
# .env.production（不可提交 Git）
DATABASE_URL=postgresql://user:password@localhost:5432/lungevidence
REDIS_URL=redis://:password@localhost:6379/0
SECRET_KEY=your-256-bit-secret-key
OPENAI_API_KEY=sk-...
PUBMED_API_KEY=...
R2_BUCKET=lungevidence-uploads
R2_ACCESS_KEY=...
R2_SECRET_KEY=...
ALLOWED_ORIGINS=https://lungevidence.org
```

### 7.3 Secrets 安全规范

```
❌ 禁止：
  - 环境变量硬编码在代码中
  - .env 文件提交 Git
  - 日志中打印 API Key

✅ 正确：
  - GitHub Secrets → CI/CD 注入
  - 服务器 /etc/lungevidence/.env (chmod 600)
  - 敏感值只在 Runtime 读取
```

---

## 8. Database Operations

### 8.1 数据库初始化

```bash
docker compose exec postgres psql -U postgres -c "CREATE DATABASE lungevidence;"
docker compose exec postgres psql -U postgres -d lungevidence -c "CREATE EXTENSION vector;"
docker compose exec backend python -m alembic upgrade head
docker compose exec backend python -m app.scripts.seed_data
```

### 8.2 Migration 策略（Alembic）

```bash
# 创建迁移
alembic revision --autogenerate -m "add_studies_table"

# 执行
alembic upgrade head

# 回滚一步
alembic downgrade -1
```

### 8.3 数据库维护计划

| 任务 | 频率 |
|------|------|
| VACUUM ANALYZE | 每周 |
| 索引重建 | 每月 |
| 连接池监控 | 实时（pgBouncer） |
| 慢查询日志审查 | 每日（阈值 1000ms） |

---

## 9. Backup and Recovery

### 9.1 备份策略

```
每日备份     → 保留 30 天 → Cloudflare R2
每周备份     → 保留 3 个月 → B2 + 本地
每月备份     → 保留 12 个月 → 冷存储归档
```

### 9.2 自动备份脚本

```bash
#!/bin/bash
# /opt/scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="lungevidence_${DATE}.sql.gz"

docker compose exec -T postgres pg_dump -U postgres lungevidence \
    | gzip > /backup/${BACKUP_FILE}

rclone copy /backup/${BACKUP_FILE} r2:lungevidence-backup/daily/
find /backup/ -name "*.sql.gz" -mtime +7 -delete

echo "[$(date)] Backup completed: ${BACKUP_FILE}"
```

```bash
# Crontab — 每日 03:00 自动备份
0 3 * * * /opt/scripts/backup.sh >> /var/log/lungevidence/backup.log 2>&1
```

### 9.3 恢复流程

```bash
# Step 1: 停止应用
docker compose stop frontend backend worker

# Step 2: 恢复数据库
gunzip < lungevidence_20260803_030000.sql.gz \
    | docker compose exec -T postgres psql -U postgres lungevidence

# Step 3: 验证完整性
docker compose exec backend python -m app.scripts.verify_data

# Step 4: 重启应用
docker compose start frontend backend worker
```

### 9.4 RTO / RPO 目标

| 指标 | 目标 |
|------|------|
| **RTO** (Recovery Time Objective) | < 2 小时 |
| **RPO** (Recovery Point Objective) | < 24 小时 |

---

## 10. Monitoring and Alerting

### 10.1 监控栈（MVP）

| 工具 | 用途 | 成本 |
|------|------|------|
| **Uptime Robot** | HTTPS 可用性，每 5 分钟检查 | 免费 |
| **Grafana + Prometheus** | 系统指标可视化 | 开源自托管 |
| **Sentry** | 应用错误追踪（Frontend + Backend） | 免费层 |

### 10.2 核心监控指标

**系统级**

| 指标 | 告警阈值 |
|------|----------|
| CPU 使用率 | > 80% 持续 5 分钟 |
| 内存使用率 | > 85% |
| 磁盘使用率 | > 90% |
| 网络延迟 P95 | > 500ms |

**应用级**

| 指标 | 告警阈值 |
|------|----------|
| API 响应时间 P95 | > 3s |
| API 错误率 | > 1% |
| 数据库连接池 | > 80% 使用 |
| Worker 队列积压 | > 100 任务 |

**医学数据级**

| 指标 | 频率 |
|------|------|
| PubMed 同步状态 | 每日检查 |
| Evidence 审核队列积压 | 每日告警 |
| Knowledge Graph 节点数 | 每周统计 |

### 10.3 告警通知链

```
告警触发
    │
    ▼
Telegram Bot (即时通知) / PagerDuty
    │
    ▼
开发者处理（15 分钟内响应）
    │
    ▼
事后复盘（Post-Mortem 文档）
```

---

## 11. Logging System

### 11.1 日志分层

```
应用日志      → FastAPI 请求 / Worker 任务 / AI 调用
系统日志      → Nginx Access / Docker 容器 / PostgreSQL 慢查询
安全日志      → 认证失败 / 异常访问 / 数据访问审计
```

### 11.2 日志格式标准（JSON）

```json
{
  "timestamp": "2026-08-03T12:00:00Z",
  "level": "INFO",
  "service": "backend",
  "request_id": "uuid-xxxx",
  "user_id": "anonymous",
  "action": "case_analysis",
  "duration_ms": 234,
  "status": "success"
}
```

### 11.3 医疗日志特殊规范

```
❌ 禁止在日志中记录：
  - 患者姓名
  - 具体病理数值（防止意外泄露）
  - API Key / Token

✅ 允许记录：
  - 匿名用户 ID（哈希后）
  - 操作类型（view_report, analyze_case）
  - 响应状态码
  - 处理耗时
```

### 11.4 日志保留策略

| 日志类型 | 保留时间 | 存储 |
|----------|----------|------|
| 应用日志 | 30 天 | 本地 + R2 |
| 安全审计日志 | 1 年 | R2 归档 |
| 错误日志 | 90 天 | 本地 |

---

## 12. Security Hardening

### 12.1 服务器初始化 Checklist

```bash
# 系统更新
apt update && apt upgrade -y

# 禁止 Root SSH 登录 + 仅允许密钥登录
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 防火墙 UFW
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 自动安全更新
apt install unattended-upgrades -y
dpkg-reconfigure unattended-upgrades

# Fail2Ban — 防暴力破解
apt install fail2ban -y
```

### 12.2 Docker 安全配置

```yaml
services:
  backend:
    security_opt:
      - no-new-privileges:true   # 禁止权限提升
    read_only: true              # 只读文件系统
    tmpfs:
      - /tmp
    user: "1000:1000"            # 非 root 用户运行
    cap_drop:
      - ALL                      # 移除所有 Linux capabilities
```

### 12.3 SSL/TLS

```bash
# Let's Encrypt 证书安装
certbot --nginx -d lungevidence.org -d www.lungevidence.org

# 自动续期
0 0 1 * * certbot renew --quiet
```

---

## 13. Performance Optimization

### 13.1 Frontend

```
Next.js 优化策略：
  ✅ SSG — 医学内容静态页面
  ✅ ISR — Evidence 列表增量更新
  ✅ next/image 图片优化
  ✅ Code Splitting — 自动
  ✅ Cloudflare CDN 静态资源缓存
```

### 13.2 Backend

```
FastAPI 优化策略：
  ✅ asyncpg + SQLAlchemy async 异步数据库连接池
  ✅ Redis 缓存 Case Analysis 结果（TTL: 1 小时）
  ✅ Background Tasks — 不阻塞 API 响应
  ✅ pgvector HNSW Index — 向量相似度查询
```

### 13.3 数据库索引

```sql
CREATE INDEX idx_studies_stage     ON studies(ajcc_stage);
CREATE INDEX idx_studies_histology ON studies(histology);
CREATE INDEX idx_cases_user        ON patient_cases(user_id);
CREATE INDEX idx_evidence_factor   ON evidence_items(factor_type);

-- 向量相似度索引
CREATE INDEX idx_studies_embedding ON studies
    USING hnsw (embedding vector_cosine_ops);
```

---

## 14. Deployment Runbook

### 14.1 首次部署（From Zero）

```bash
# Step 1: 安装依赖
apt install docker.io docker-compose-v2 nginx certbot python3-certbot-nginx -y
systemctl enable docker

# Step 2: 创建部署用户
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# Step 3: 克隆代码
git clone https://github.com/your-org/lungevidence.git /app/lungevidence
cd /app/lungevidence

# Step 4: 配置环境变量
cp .env.example .env.production
chmod 600 .env.production
# 填写真实值...

# Step 5: 启动服务
docker compose --env-file .env.production up -d

# Step 6: 配置 Nginx + SSL
certbot --nginx -d lungevidence.org
nginx -t && systemctl reload nginx

# Step 7: 初始化数据库
docker compose exec backend python -m alembic upgrade head
docker compose exec backend python -m app.scripts.seed_initial_data

# Step 8: 验证
curl https://lungevidence.org/api/health
```

### 14.2 日常部署（更新版本）

```bash
# 由 GitHub Actions 自动触发
# 手动触发时：
cd /app/lungevidence
git pull origin main
docker compose pull
docker compose up -d --no-deps backend
sleep 10
docker compose up -d --no-deps frontend
```

### 14.3 紧急回滚

```bash
docker compose down
docker tag lungevidence/backend:previous lungevidence/backend:current
docker compose up -d

# 数据库回滚（谨慎）
docker compose exec backend python -m alembic downgrade -1
```

---

## 15. Health Check

### 15.1 API Health Check Endpoint

```json
// GET /api/health
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected",
  "evidence_count": 342,
  "last_pubmed_sync": "2026-08-03T03:00:00Z"
}
```

### 15.2 自动健康检查 Cron

```bash
*/5 * * * * curl -f https://lungevidence.org/api/health \
    || echo "Health check failed" | mail -s "LungEvidence Alert" admin@lungevidence.org
```

---

## 16. Disaster Recovery Plan

### 16.1 故障场景分级

| 场景 | 严重程度 | RTO |
|------|----------|-----|
| 单个容器崩溃 | 低 | Docker auto-restart < 30s |
| 数据库连接中断 | 中 | 10 分钟 |
| 服务器宕机 | 高 | 2 小时（从备份恢复）|
| 数据库损坏 | 严重 | 4 小时（从备份恢复） |
| 数据泄露 | 紧急 | 立即隔离 + 通知用户 |

### 16.2 服务器全损恢复流程

```
Uptime Robot 告警
      │
      ▼
创建新 VPS（< 30 分钟）
      │
      ▼
执行服务器初始化 Checklist
      │
      ▼
从 R2 下载最新备份
      │
      ▼
恢复数据库 + 部署应用
      │
      ▼
更新 Cloudflare DNS 指向新 IP
      │
      ▼
验证功能正常
```

---

## 17. Cost Estimation

### 17.1 MVP 月度成本

| 项目 | 方案 | 月成本 |
|------|------|--------|
| VPS | Hetzner CX31 (4C/8G) | ~$13 USD |
| Object Storage | Cloudflare R2 (10GB) | $0（免费层） |
| CDN | Cloudflare（免费层） | $0 |
| SSL 证书 | Let's Encrypt | $0 |
| 监控 | UptimeRobot + Sentry 免费层 | $0 |
| Domain | lungevidence.org | ~$1/月 |
| **合计** | | **~$15 USD/月** |

### 17.2 Phase 2 预估成本

| 项目 | 规格 | 月成本 |
|------|------|--------|
| VPS × 2 | 8C/16G | ~$80 USD |
| Managed PostgreSQL | 4C/8G | ~$50 USD |
| Redis Cloud | 1GB | ~$15 USD |
| Object Storage | 100GB | ~$5 USD |
| 监控 | Grafana Cloud | ~$0–20 USD |
| **合计** | | **~$150 USD/月** |

---

## 18. Development Environment Setup

### 18.1 本地快速启动

```bash
git clone https://github.com/your-org/lungevidence.git
cd lungevidence

# 启动所有服务
docker compose -f docker-compose.dev.yml up -d

# 数据库初始化
docker compose exec backend python -m alembic upgrade head
docker compose exec backend python -m app.scripts.seed_dev_data

# 前端访问
open http://localhost:3000

# API 文档
open http://localhost:8000/docs
```

### 18.2 本地开发 vs 生产差异

| 配置 | 开发 | 生产 |
|------|------|------|
| 热重载 | ✅ 开启 | ❌ 关闭 |
| Debug Mode | ✅ 开启 | ❌ 关闭 |
| CORS | 允许所有来源 | 仅 HTTPS 白名单 |
| HTTPS | 不需要 | 强制 |
| 数据库 | 本地 Docker | 持久化 Volume |

---

## 19. Phase Deployment Milestones

| 阶段 | 用户规模 | 基础设施 |
|------|----------|----------|
| **Alpha** | 内部测试 | 单 VPS + Docker Compose |
| **Beta** | 100 用户 | 单 VPS + 优化配置 |
| **MVP Launch** | 1,000 用户 | 单 VPS + 完整备份 |
| **Growth** | 10,000 用户 | 双 VPS + Read Replica |
| **Scale** | 100,000 用户 | 多区域 + CDN + K8s |

---

## 20. Acceptance Criteria

部署系统达到以下标准，视为 Phase 1 完成：

- [ ] 代码提交后自动触发 CI（Lint + Test）
- [ ] 合并到 main 自动部署生产
- [ ] HTTPS 全站强制，SSL A+ 评分
- [ ] 每日数据库自动备份并上传 R2
- [ ] 监控覆盖：可用性、API 延迟、错误率
- [ ] 健康检查接口可用
- [ ] 部署文档完整，任何人可按 Runbook 从零部署
- [ ] 恢复演练：模拟故障恢复时间 < 2 小时

---

*LungEvidence Deployment Architecture v1.0 — Infrastructure as a Product.*
