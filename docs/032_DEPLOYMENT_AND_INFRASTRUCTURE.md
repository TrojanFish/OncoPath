# LungEvidence Deployment and Infrastructure

Version: 1.0

Status: Draft

Last Updated: 2026-08-03
1. Overview
Purpose
定义 LungEvidence 生产环境架构。

目标：

建立：

稳定；
安全；
可扩展；
的线上系统。

2. Infrastructure Philosophy
原则：

MVP阶段
不要过度架构。

避免：

❌ Kubernetes

❌ 微服务集群

❌ 自建GPU服务器

采用：

Single VPS

+

Docker

+

Managed AI API

+

Automated Backup
3. Production Architecture
整体：

                 User

                  |

                  ↓

             Cloudflare

                  |

                  ↓

          Nginx Reverse Proxy

                  |

        ---------------------

        |                   |

    Frontend            Backend

    Next.js             FastAPI

        |                   |

        ---------------------

                  |

              PostgreSQL

                  |

        ---------------------

        |                   |

     pgvector          Redis

        |

     Evidence Data
4. Recommended Initial Server
MVP：

一台 VPS。

配置：

CPU:

4 cores


RAM:

16GB


Storage:

200GB SSD
原因：

足够运行：

Next.js；
FastAPI；
PostgreSQL；
Redis。
5. Cloud Provider Options
可选择：

AWS Lightsail
DigitalOcean
Vultr
Hetzner
初期原则：

选择：

稳定 + 便宜。

6. Container Architecture
使用：

Docker Compose。

目录：

deployment/

├── docker-compose.yml

├── nginx/

├── postgres/

├── redis/

└── backups/
7. Services
生产环境：

services:

frontend:

backend:

postgres:

redis:

nginx:

worker:
8. Frontend Deployment
Next.js。

模式：

Production Build。

流程：

npm build

↓

Docker Image

↓

Deploy
9. Backend Deployment
FastAPI。

运行：

Gunicorn

+

Uvicorn Workers
配置：

Workers:

4
10. Database Architecture
PostgreSQL。

扩展：

CREATE EXTENSION vector;
保存：

用户；
病例；
Evidence；
Embedding。
11. Backup Strategy
医学数据：

必须备份。

Database Backup
每日：

pg_dump
保存：

3份：

Daily

Weekly

Monthly
12. Disaster Recovery
目标：

RTO：

24小时。

RPO：

24小时。

即：

最多损失一天数据。

13. AI Infrastructure
不要自己部署大模型。

MVP：

调用：

LLM API。

架构：

Backend

↓

AI Gateway

↓

LLM Provider
优势：

成本低；
易升级；
不维护GPU。
14. AI Cost Control
医学问答成本可能较高。

措施：

Cache
重复问题缓存。

Retrieval First
不要每次：

重新读取全部论文。

Model Routing
简单问题：

小模型。

复杂分析：

大模型。

例如：

Term Explanation

↓

Small Model


Case Report

↓

Large Model
15. Vector Database
MVP：

PostgreSQL + pgvector。

未来：

规模扩大：

考虑：

Qdrant；
Weaviate。
16. Search Infrastructure
论文搜索：

独立Worker。

流程：

Scheduler

↓

Research Worker

↓

Evidence DB
17. Security Architecture
必须：

HTTPS
Cloudflare SSL。

Secrets Management
禁止：

代码保存：

API Key。

使用：

.env

Secret Manager
18. Logging
记录：

Application Log：

API error

AI failure
Medical Audit Log：

Question

Evidence

Answer
19. Monitoring
MVP：

简单：

uptime monitor；
server metrics。
关注：

CPU

RAM

Disk

Database size

20. Scaling Strategy
未来：

用户增加。

阶段1：

单服务器。

阶段2：

拆分：

Frontend

Backend

Database
阶段3：

云原生：

Kubernetes。

21. Deployment Pipeline
GitHub Actions：

流程：

Push Code

↓

Test

↓

Build Image

↓

Deploy

↓

Health Check
22. Environment Separation
三个环境：

Development

↓

Staging

↓

Production
23. Cost Estimate MVP
月成本：

服务器：

约：

$20–50/月

数据库：

自建：

$0

AI：

根据使用量。

预计：

早期：

$50–200/月。

24. First Production Goal
上线版本：

用户可以：

注册

↓

输入肺癌病例

↓

生成Evidence Report

↓

查询研究依据
End
LungEvidence Deployment and Infrastructure v1.0
