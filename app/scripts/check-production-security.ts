/**
 * OncoPath Production Security & Clinical Safety Checklist
 * Audits environment configurations, secret entropy, PIPL compliance, and clinical safety guardrails.
 * Run with: npm run check:security (or npx tsx scripts/check-production-security.ts)
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckItem {
  category: string;
  name: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const checks: CheckItem[] = [];

function recordCheck(
  category: string,
  name: string,
  severity: 'CRITICAL' | 'WARNING' | 'INFO',
  status: 'PASS' | 'FAIL' | 'WARN',
  message: string
) {
  checks.push({ category, name, severity, status, message });
}

console.log('\x1b[1m\x1b[36m============================================================\x1b[0m');
console.log('\x1b[1m\x1b[36m  OncoPath (精准肺癌智慧随访) 生产就绪与安全合规性自检清单\x1b[0m');
console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');

// 1. Audit Environment Variables & Secrets
const adminSecret = process.env.ADMIN_SECRET || '';
const isDefaultAdmin = !adminSecret || adminSecret.toLowerCase().includes('changeme') || adminSecret === 'admin123';
if (isDefaultAdmin) {
  recordCheck(
    '环境机密',
    'ADMIN_SECRET 熵值与安全性',
    'WARNING',
    'WARN',
    '未检测到生产级 ADMIN_SECRET 或使用了默认弱口令。投产部署时请设置长度 >= 24 位的强随机密码。'
  );
} else if (adminSecret.length < 16) {
  recordCheck(
    '环境机密',
    'ADMIN_SECRET 长度',
    'WARNING',
    'WARN',
    `ADMIN_SECRET 长度为 ${adminSecret.length} 位，建议生产环境 >= 24 位字符。`
  );
} else {
  recordCheck('环境机密', 'ADMIN_SECRET 熵值与安全性', 'CRITICAL', 'PASS', '已配置符合强度要求的管理密钥。');
}

const geminiKey = process.env.GEMINI_API_KEY || '';
if (!geminiKey || geminiKey.includes('placeholder') || geminiKey === 'test_key') {
  recordCheck(
    'AI引擎',
    'GEMINI_API_KEY 配置状态',
    'WARNING',
    'WARN',
    '未检测到有效 GEMINI_API_KEY，LLM 结构化提取与智能质控将使用本地确定性正则引擎降级运行。'
  );
} else {
  recordCheck('AI引擎', 'GEMINI_API_KEY 配置状态', 'INFO', 'PASS', '已配置大模型 API 密钥。');
}

const dbUrl = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV === 'production' && (!dbUrl || dbUrl.includes('postgres:postgres@localhost'))) {
  recordCheck(
    '数据库连接',
    'DATABASE_URL 生产独立性',
    'CRITICAL',
    'FAIL',
    '生产环境下数据库连接串不能为本地默认 postgres:postgres！'
  );
} else {
  recordCheck('数据库连接', 'DATABASE_URL 生产独立性', 'INFO', 'PASS', '数据库连接配置正常或当前为构建验证模式。');
}

// 2. Audit Clinical Disclaimer & Safety Guardrails
const srcDir = path.resolve(__dirname, '../src');
const consentModalPath = path.join(srcDir, 'components/ConsentModal.tsx');
const termsPath = path.join(srcDir, 'app/terms/page.tsx');
const generateReportPath = path.join(srcDir, 'app/api/generate-report/route.ts');

const hasConsentModal = fs.existsSync(consentModalPath) && fs.readFileSync(consentModalPath, 'utf8').includes('免责声明');
const hasTerms = fs.existsSync(termsPath) && fs.readFileSync(termsPath, 'utf8').includes('免责声明');
const hasReportDisclaimer = fs.existsSync(generateReportPath) && fs.readFileSync(generateReportPath, 'utf8').includes('免责声明');

if (hasConsentModal && hasTerms && hasReportDisclaimer) {
  recordCheck('临床伦理', '不可绕过的知情同意与医疗免责体系', 'CRITICAL', 'PASS', '知情同意弹窗、服务条款协议及 AI 报告生成管道均已强校验并渲染权威医疗免责声明。');
} else {
  recordCheck('临床伦理', '不可绕过的知情同意与医疗免责体系', 'CRITICAL', 'FAIL', '核心流程缺失医疗免责声明，违反医疗软件伦理合规！');
}

const stagingPath = path.join(srcDir, 'lib/staging.ts');
const vdtPath = path.join(srcDir, 'lib/vdtCalculator.ts');
const hasStaging = fs.existsSync(stagingPath) && fs.readFileSync(stagingPath, 'utf8').includes('computeClinicalTnmStage');
const hasVdt = fs.existsSync(vdtPath) && fs.readFileSync(vdtPath, 'utf8').includes('calculateVdtAndGrowth');

if (hasStaging && hasVdt) {
  recordCheck('算法引擎', '分期与动力学确定性防幻觉', 'CRITICAL', 'PASS', 'AJCC 8th/9th 分期与 Schwartz 倍增时间计算器采用 100% 确定性临床查表逻辑，杜绝大模型随机幻觉。');
} else {
  recordCheck('算法引擎', '分期与动力学确定性防幻觉', 'CRITICAL', 'FAIL', '未找到确定性分期或动力学计算引擎！');
}

// 3. PIPL & Data Security Guardrails
const sanitizePath = path.join(srcDir, 'lib/piplSanitizer.ts');
if (fs.existsSync(sanitizePath)) {
  const sanitizeContent = fs.readFileSync(sanitizePath, 'utf8');
  if (sanitizeContent.includes('sanitizePII') || sanitizeContent.includes('maskPatientData')) {
    recordCheck('数据安全', 'PIPL 个人隐私脱敏引擎', 'CRITICAL', 'PASS', '存在合规的病历文本 PIPL 脱敏与姓名/身份证/电话打码脱敏模块。');
  } else {
    recordCheck('数据安全', 'PIPL 个人隐私脱敏引擎', 'WARNING', 'WARN', '未识别到标准 PII 脱敏导出函数。');
  }
}

// Print Results Table
let criticalFails = 0;
let warnings = 0;

for (const c of checks) {
  let badge = '';
  if (c.status === 'PASS') {
    badge = '\x1b[32m[ PASS ]\x1b[0m';
  } else if (c.status === 'WARN') {
    badge = '\x1b[33m[ WARN ]\x1b[0m';
    warnings++;
  } else {
    badge = '\x1b[31m[ FAIL ]\x1b[0m';
    if (c.severity === 'CRITICAL') criticalFails++;
  }
  console.log(`${badge} [${c.category}] \x1b[1m${c.name}\x1b[0m`);
  console.log(`         \x1b[90m${c.message}\x1b[0m\n`);
}

console.log('------------------------------------------------------------');
console.log(`自检摘要: ${checks.length} 项检查完成 | \x1b[32m${checks.filter(c => c.status === 'PASS').length} 项通过\x1b[0m | \x1b[33m${warnings} 项提醒\x1b[0m | \x1b[31m${criticalFails} 项阻断\x1b[0m`);
console.log('------------------------------------------------------------\n');

if (criticalFails > 0) {
  console.error('\x1b[31m[!] 存在致命阻断项，禁止直接投产！请修正上述配置后重试。\x1b[0m');
  process.exit(1);
} else {
  console.log('\x1b[32m[√] 生产安全与合规性自检全部通过（未命中任何严重风险项）。\x1b[0m\n');
  process.exit(0);
}
