# LungEvidence Security Privacy and Medical Compliance

**Version:** 1.0
**Status:** Development Ready
**Last Updated:** 2026-08-03
**Classification:** Compliance & Governance Blueprint

---

## 1. Overview

### Purpose

定义 LungEvidence 的：

- 数据安全架构
- 隐私保护机制
- 医疗责任边界
- AI 安全规范
- 合规框架

### 背景

医疗类产品最大的风险不是代码错误，而是：

- 用户隐私泄露
- AI 过度表达（制造恐慌或给出错误保证）
- 用户误认为 AI 输出等同于诊断
- 医疗责任边界不清

---

## 2. Product Positioning（产品定位声明）

LungEvidence 的法律定位：

> **Medical Education & Evidence Interpretation Platform**
> 医学教育与循证解释平台

**不是：**

| ❌ 禁止定位 | 原因 |
|------------|------|
| 诊断系统 | 涉及医疗器械监管 |
| 治疗决策系统 | 超出患者教育范畴 |
| 医生替代系统 | 法律责任风险 |

**核心声明（必须出现在所有页面）：**

> LungEvidence 帮助用户理解医学研究和个人病例特征，不替代医生诊断和治疗建议。

---

## 3. Data Classification（数据分级）

| 级别 | 类型 | 示例 | 存储原则 |
|------|------|------|----------|
| **Level 0** | 公开医学数据 | 论文、指南 | 无限制 |
| **Level 1** | 匿名病例数据 | 35岁/男/IA1 | 可存储，无需加密 |
| **Level 2** | 个人健康数据 | 检查报告、病理报告 | 加密存储 |
| **Level 3** | 身份关联数据 | 姓名、联系方式 | **尽量不收集** |

**设计原则：** 系统尽量避免存储 Level 3 数据。

---

## 4. Personal Data Minimization（最小化原则）

### 不需要收集

```
❌ 身份证号
❌ 真实姓名
❌ 家庭地址
❌ 电话号码
❌ 医院病历号
```

### 需要收集

```
✅ 年龄范围（如：35–40岁）
✅ 性别
✅ 医学信息（病理报告内容）
✅ 邮箱（用于账号，可选）
```

---

## 5. Database Security

### 5.1 加密

| 数据类型 | 加密方案 |
|----------|----------|
| 医疗报告字段 | AES-256 |
| 上传文件 | AES-256（对象存储侧加密） |
| 传输层 | TLS 1.3 |

### 5.2 密码安全

```
❌ 禁止：明文保存密码
✅ 要求：bcrypt（cost factor ≥ 12）或 Argon2id
```

### 5.3 数据库访问控制

```
应用程序    ──→ 专用 DB 用户（最小权限）
管理员      ──→ 审计日志记录每次操作
开发环境    ──→ 禁止使用生产数据库
```

---

## 6. Authentication Security

### JWT + Refresh Token 方案

```
Access Token:
  有效期：15 分钟
  内容：user_id, role, exp

Refresh Token:
  有效期：7 天
  存储：httpOnly Cookie（防 XSS）
  可撤销：存储 token_id 到 Redis
```

### 未来功能

- 2FA（两步验证）
- 第三方登录（微信、Google）

---

## 7. Authorization Model（RBAC）

| 角色 | 权限 |
|------|------|
| **Patient** | 查看自己的病例和报告 |
| **Reviewer** | 审核 Evidence 候选 |
| **Admin** | 系统管理、用户管理 |

**关键规则：** User A 不能访问 User B 的病例数据。

---

## 8. Medical Report Security

报告属于患者私密数据。

### 访问要求

```
❌ 错误：公开 URL
  /report/123456

✅ 正确：私有 Token URL
  /report/private/a8f2c9d1e4b7-random-token
```

### 访问控制

```
查看报告 = Login + Authorization Check + Token验证
```

---

## 9. AI Safety Framework

这是 LungEvidence 最重要的合规规则。

### Rule 1：禁止诊断性语言

| 禁止 | 允许 |
|------|------|
| ❌ "你一定不会复发" | ✅ "相关研究中，这类患者总体表现较好" |
| ❌ "你的预后很好" | ✅ "目前的病理特征在研究中通常与较好结果相关" |

### Rule 2：禁止个人预测

| 禁止 | 允许 |
|------|------|
| ❌ "你的 10 年生存率 98%" | ✅ "类似研究人群显示长期结果较好" |
| ❌ "你属于低风险" | ✅ "目前信息中未发现部分高风险因素" |

### Rule 3：必须引用来源

任何医学结论：

```
结论 → Evidence 来源 → PMID / DOI
```

没有来源的结论：禁止输出。

---

## 10. AI Output Filtering Pipeline

```
AI Draft Output
      ↓
Safety Keyword Checker
      ↓
危险词替换（自动）
      ↓
Uncertainty Injector（添加不确定性声明）
      ↓
Final Output
```

### 危险词替换表

| 检测词 | 替换为 |
|--------|--------|
| 一定 | 通常 |
| 保证 | 研究显示 |
| 治愈 | 长期管理 |
| 不会复发 | 目前资料中未发现高风险因素 |
| 死亡率 | 相关研究中的结果数据 |

---

## 11. User Upload Security

支持未来用户上传 CT 报告和病理报告。

### 上传处理流程

```
Upload
  ↓
File Type Validation（仅允许 PDF / JPG / PNG）
  ↓
Virus Scan（ClamAV）
  ↓
OCR 文字提取
  ↓
Personal Info Removal（去除姓名、医院、日期等）
  ↓
Encrypted Storage（R2 对象存储）
```

### 文件访问

```
禁止直接暴露存储路径
使用签名 URL（有效期 1 小时）
```

---

## 12. File Storage Structure

```
r2://lungevidence-private/
  └── user/{user_hash}/
        └── case/{case_id}/
              ├── pathology_report.pdf.enc
              └── ct_report.jpg.enc
```

---

## 13. Audit Logging（审计日志）

记录所有敏感操作：

```json
{
  "log_id": "audit_xxxx",
  "user_id_hash": "sha256_anonymized",
  "action": "view_report",
  "resource": "report_id_xxxx",
  "timestamp": "2026-08-03T12:00:00Z",
  "ip_hash": "anonymized",
  "status": "success"
}
```

### 日志规范

- 用户 ID 和 IP 地址：哈希处理（不存储原值）
- 不记录医疗内容本身
- 保留 1 年

---

## 14. Backup Strategy

| 类型 | 频率 | 保留 |
|------|------|------|
| 数据库全量备份 | 每日 | 30 天 |
| 用户文件备份 | 实时（R2 多副本） | 永久 |
| 重要版本快照 | 每次 Evidence 更新 | 长期 |

---

## 15. Data Deletion（用户数据删除权）

```
用户发起：Delete Account
      ↓
系统确认（邮件二次确认）
      ↓
删除：个人数据 + 病例数据 + 报告
      ↓
保留：匿名统计数据（不可关联个人）
      ↓
完成：账号注销确认
```

---

## 16. Privacy Policy Requirements

隐私政策必须说明：

1. **收集什么数据：** 年龄范围、性别、医学信息
2. **数据用途：** 医学教育目的
3. **不会出售数据：** 明确承诺
4. **用户权利：** 查看、修改、删除
5. **数据保存时间：** 注明各类数据保留期限

---

## 17. Regulatory Consideration

### MVP 阶段

定位为**健康教育工具**，不涉及医疗器械监管。

### 未来如果提供以下功能，需要重新评估合规要求：

| 功能 | 潜在监管 |
|------|----------|
| 治疗建议 | 医疗软件 SaMD |
| 风险预测评分 | 临床决策支持软件 |
| 影像 AI 分析 | AI 医疗器械 |

**建议：** 在提供上述功能前，咨询所在地区医疗法律顾问。

---

## 18. International Compliance Considerations

| 地区 | 法规 | 现状 |
|------|------|------|
| 新加坡 | PDPA | MVP 基本兼容 |
| 欧盟 | GDPR | 需要 DPO + 明确同意机制 |
| 美国 | HIPAA | 未来市场时评估 |
| 中国 | PIPL | 数据本地化要求 |

---

## 19. Development Security Checklist

上线前必须完成：

- [ ] HTTPS 全站强制
- [ ] 数据库字段加密
- [ ] 权限隔离测试（User A 不能访问 User B）
- [ ] 日志审计启动
- [ ] 密码哈希验证
- [ ] API 限速配置
- [ ] 文件上传病毒扫描
- [ ] AI 输出安全过滤器测试
- [ ] 隐私政策和免责声明上线
- [ ] 账号删除功能测试

---

## 20. Incident Response Plan

发生数据安全事件时：

```
Detect（检测）
  ↓
Contain（隔离受影响系统）
  ↓
Assess（评估影响范围）
  ↓
Notify（通知受影响用户）
  ↓
Fix（修复漏洞）
  ↓
Review（Post-Mortem 分析）
  ↓
Improve（更新安全策略）
```

---

## 21. MVP Compliance Goal

第一版达到：

```
✅ Medical Education Platform（合规定位）
✅ Strong Privacy Protection（强隐私保护）
✅ AI Safety Boundary（AI 安全边界）
✅ HTTPS + Encryption（传输和存储加密）
✅ Audit Logging（操作审计）
```

---

*LungEvidence Security Privacy and Medical Compliance v1.0*
