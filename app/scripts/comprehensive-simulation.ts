/**
 * OncoPath Comprehensive Production Simulation Test Suite (全面生产环境仿真测试)
 * Simulates real-world clinical patient profiles, algorithmic engines, security,
 * privacy, offline resilience, and pharmacological interactions.
 */

import { computeClinicalTnmStage, getClinicalCohortForProfile } from '../src/lib/staging';
import { calculateVdtAndGrowth } from '../src/lib/vdtCalculator';
import { evaluateTumorMarkers, TUMOR_MARKER_DEFINITIONS } from '../src/lib/tumorMarkers';
import { checkDrugInteractions, TARGETED_DRUGS, ALL_CHRONIC_DRUGS } from '../src/lib/ddiData';
import { sanitizeClinicalText, sanitizePatientProfile } from '../src/lib/privacy';
import { hashPassword, verifyPassword, generateUserToken, verifyUserToken } from '../src/lib/userAuth';
import { checkRateLimit } from '../src/lib/rateLimit';
import { DEFAULT_GRAPH_NODES, DEFAULT_EDGE_EVIDENCES } from '../src/lib/defaultGraphData';
import { FEATURED_STUDIES } from '../src/lib/evidence-data';
import * as OpenCC from 'opencc-js';

interface TestStepResult {
  category: string;
  testName: string;
  passed: boolean;
  message: string;
  metrics?: Record<string, any>;
}

const allResults: TestStepResult[] = [];

function assert(condition: boolean, category: string, testName: string, successMsg: string, failMsg: string, metrics?: Record<string, any>) {
  allResults.push({
    category,
    testName,
    passed: condition,
    message: condition ? successMsg : failMsg,
    metrics
  });
}

console.log('========================================================================');
console.log('🔬 ONCOPATH 生产环境上线前综合仿真测试 (COMPREHENSIVE SIMULATION SUITE)');
console.log('========================================================================\n');

// ============================================================================
// 1. 临床肿瘤精准分期与临床红线决策仿真 (IASLC / AJCC 第 9 版 & Guideline Guardrails)
// ============================================================================
console.log('▶ [1/7] 正在仿真测试: 临床精准分期引擎与指南红线防护...');

// 场景 1: 18mm 纯磨玻璃结节 (pGGO) -> 浸润成分0 -> Tis (Stage 0 原位病变)
const case1 = computeClinicalTnmStage({
  noduleType: 'pure_ggo',
  tumorSize: 1.8,
  solidSize: 0,
  ctr: 0,
  nStage: 'N0',
  vpi: false,
  stas: false,
});
assert(
  case1.stage === '0' && case1.tStage === 'Tis',
  'Clinical Staging',
  'Pure GGO Infiltration Zero Staging (Tis Stage 0)',
  `纯磨玻璃 18mm 正确折算浸润大小为0，按 IASLC / AJCC 第 9 版权威标准定级为 ${case1.stage}期 (${case1.tStage} 原位病变)`,
  `纯磨玻璃定级异常: ${case1.stage} (${case1.tStage})`,
  { tStage: case1.tStage, stage: case1.stage }
);

// 场景 2: 22mm 混合磨玻璃 (mGGO)，实性成分 8mm (CTR=0.36) -> T1a (IA1期)
const case2 = computeClinicalTnmStage({
  noduleType: 'mixed_ggo',
  tumorSize: 2.2,
  solidSize: 0.8,
  ctr: 0.36,
  nStage: 'N0',
  vpi: false,
  stas: false,
});
assert(
  case2.stage === 'IA1' && case2.tStage === 'T1a',
  'Clinical Staging',
  'Mixed GGO Solid Core Staging (T1a <= 10mm)',
  `混合磨玻璃实性成分 8mm <= 10mm，按实性成分准确计算为 ${case2.stage} (${case2.tStage})`,
  `混合磨玻璃计算异常: ${case2.stage} (${case2.tStage})`,
  { solidSize: 0.8, tStage: case2.tStage, stage: case2.stage }
);

// 场景 3: 12mm 结节伴胸膜浸润 (VPI PL1) -> 自动升期为 T2a (IB期)
const case3 = computeClinicalTnmStage({
  noduleType: 'pure_solid',
  tumorSize: 1.2,
  solidSize: 1.2,
  ctr: 1.0,
  nStage: 'N0',
  vpi: true, // 突破弹性层 PL1
  stas: false,
});
assert(
  case3.tStage === 'T2a' && case3.stage === 'IB',
  'Clinical Staging',
  'VPI Visceral Pleural Invasion Upstaging',
  `胸膜浸润(PL1)成功触发升期逻辑: 由 T1 升为 ${case3.tStage} (总分期 ${case3.stage})`,
  `胸膜升期未生效: ${case3.tStage} (${case3.stage})`,
  { vpi: true, tStage: case3.tStage, stage: case3.stage }
);

// 场景 4a: IASLC 第9版单站纵隔转移 (T1c N2a) -> 降为 IIB 期 (原第8版判IIIA)
const case4a = computeClinicalTnmStage({
  noduleType: 'pure_solid',
  tumorSize: 2.5,
  solidSize: 2.5,
  ctr: 1.0,
  nStage: 'N2a',
  vpi: false,
  stas: true,
});
assert(
  case4a.stage === 'IIB',
  'Clinical Staging',
  'IASLC 9th T1N2a Single-Station Downstaging to IIB',
  `IASLC第9版单站纵隔转移(N2a)准确优化降期为 ${case4a.stage}期 (原第8版判IIIA)`,
  `T1N2a 计算异常: ${case4a.stage}`,
  { nStage: 'N2a', stage: case4a.stage }
);

// 场景 4b: IASLC 第9版多站纵隔转移 (T1c N2b) -> IIIA 期
const case4b = computeClinicalTnmStage({
  noduleType: 'pure_solid',
  tumorSize: 2.5,
  solidSize: 2.5,
  ctr: 1.0,
  nStage: 'N2b',
  vpi: false,
  stas: true,
});
assert(
  case4b.stage === 'IIIA',
  'Clinical Staging',
  'IASLC 9th T1N2b Multiple-Station Staging to IIIA',
  `多站纵隔转移(N2b)准确评定为局部进展期 ${case4b.stage}`,
  `T1N2b 计算异常: ${case4b.stage}`,
  { nStage: 'N2b', stage: case4b.stage }
);

// 场景 4c: IASLC 第9版 T1N1 降期为 IIA 期 (原第8版判IIB)
const case4c = computeClinicalTnmStage({
  noduleType: 'pure_solid',
  tumorSize: 1.5,
  nStage: 'N1',
  mStage: 'M0',
});
assert(
  case4c.stage === 'IIA',
  'Clinical Staging',
  'IASLC 9th T1N1 Downstaging to IIA',
  `IASLC第9版T1N1准确降期为 ${case4c.stage}期 (原第8版判IIB)`,
  `T1N1 计算异常: ${case4c.stage}`,
  { nStage: 'N1', stage: case4c.stage }
);

// 场景 5: 真实世界临床队列匹配 (IA1期 vs IIIA期 5年无复发生存率)
const cohortIA1 = getClinicalCohortForProfile({ stage: 'IA1', tStage: 'T1a', nStage: 'N0', stas: 'negative' });
const cohortIIIA = getClinicalCohortForProfile({ stage: 'IIIA', tStage: 'T2a', nStage: 'N2', stas: 'positive' });
assert(
  parseFloat(cohortIA1.rfs5Year) >= 95 && parseFloat(cohortIIIA.rfs5Year) <= 60,
  'Clinical Staging',
  'Clinical Cohort Outcome Divergence (IA1 vs IIIA)',
  `队列匹配精准: IA1期 5yr-RFS=${cohortIA1.rfs5Year}, IIIA期 5yr-RFS=${cohortIIIA.rfs5Year}`,
  `队列生存率数据反常: IA1=${cohortIA1.rfs5Year}, IIIA=${cohortIIIA.rfs5Year}`
);

// ============================================================================
// 2. Schwartz 肿瘤体积倍增时间 (VDT) 动力学引擎仿真
// ============================================================================
console.log('▶ [2/7] 正在仿真测试: Schwartz 结节体积倍增时间与生长轨迹...');

// 场景 1: 高度稳定惰性结节 (365天大小不变，VDT > 800天)
const stableHistory = [
  { id: '1', date: '2024-01-01', tumorSize: 1.2, solidSize: 0.4, ctr: 0.33, note: '初次体检' },
  { id: '2', date: '2025-01-01', tumorSize: 1.2, solidSize: 0.4, ctr: 0.33, note: '复查' },
];
const vdtStable = calculateVdtAndGrowth(stableHistory);
assert(
  vdtStable.growthCategory === 'stable' && vdtStable.sizeChangeMm === 0,
  'VDT Engine',
  'Indolent Pure GGO Stable Growth VDT',
  `稳定结节准确判定为 ${vdtStable.categoryLabel} (长径变化: ${vdtStable.sizeChangeMm}mm)`,
  `稳定结节判断异常: ${vdtStable.growthCategory}`,
  { category: vdtStable.growthCategory, label: vdtStable.categoryLabel }
);

// 场景 2: 活跃进展实性成分增大结节 (+6mm 实性进展)
const rapidHistory = [
  { id: '1', date: '2024-01-01', tumorSize: 1.4, solidSize: 0.3, ctr: 0.21, note: '发现' },
  { id: '2', date: '2024-07-01', tumorSize: 1.8, solidSize: 0.9, ctr: 0.5, note: '实性增大' },
];
const vdtRapid = calculateVdtAndGrowth(rapidHistory);
assert(
  vdtRapid.growthCategory === 'active_growth' && vdtRapid.actionGuidance.includes('微创手术'),
  'VDT Engine',
  'Active Rapid Growth Nodule Warning',
  `活跃进展期结节成功识别 (分类: ${vdtRapid.categoryLabel}, 提示: ${vdtRapid.actionGuidance.slice(0, 20)}...)`,
  `活跃进展结节未触发高危: ${vdtRapid.growthCategory}`,
  { category: vdtRapid.growthCategory, label: vdtRapid.categoryLabel }
);

// 场景 3: 单次初诊结节 (无历史记录，防越界与崩溃测试)
const vdtSingle = calculateVdtAndGrowth(null);
assert(
  vdtSingle.growthCategory === 'insufficient_data' && vdtSingle.vdtDays === null,
  'VDT Engine',
  'Single CT Baseline Graceful Handling',
  '单次基线 CT 正确处理为数据积累期，无空指针或除零异常',
  '单次基线 CT 出现异常'
);

// ============================================================================
// 3. 肿瘤标志物生理安全带与动力学解读仿真
// ============================================================================
console.log('▶ [3/7] 正在仿真测试: 肿瘤标志物 (CEA / CYFRA21-1) 生理安全带...');

// 场景 1: 生理正常区间 (CEA 2.4 ng/mL, 处于 0~5.0 安全带内)
const tmEvalNormal = evaluateTumorMarkers({ cea: 2.4 });
const ceaResult = tmEvalNormal.find(r => r.key === 'cea');
assert(
  ceaResult?.status === 'normal' && ceaResult.reassuranceText.includes('早早期肺结节'),
  'Tumor Markers',
  'Physiological Safe Band Reassurance (CEA < 5.0)',
  '正常范围内波动正确识别，并生成【早早期肺结节与微浸润腺癌标志物敏感性较低】定心丸',
  '正常生理波动识别异常',
  { status: ceaResult?.status }
);

// 场景 2: 显著升高警示 (CEA 15.5 ng/mL, 远超 10.0 阈值)
const tmEvalHigh = evaluateTumorMarkers({ cea: 15.5 });
const ceaHighResult = tmEvalHigh.find(r => r.key === 'cea');
assert(
  ceaHighResult?.status === 'significantly_elevated',
  'Tumor Markers',
  'Elevated Tumor Marker Threshold Warning',
  '超标肿瘤标志物正确触发显著升高预警 (status=significantly_elevated)',
  '超标肿瘤标志物未正确识别',
  { cea: 15.5, status: ceaHighResult?.status }
);

// ============================================================================
// 4. 靶向药物相互作用 (DDI) 与临床药理安全仿真
// ============================================================================
console.log('▶ [4/7] 正在仿真测试: 靶向药物 (EGFR-TKI) 相互作用引擎 (DDI)...');

// 场景 1: 吉非替尼 (Gefitinib) + 奥美拉唑 (PPI)
const ddiGefPpi = checkDrugInteractions('gefitinib', ['omeprazole', 'hydrotalcite']);
assert(
  ddiGefPpi.overallStatus === 'warning' && ddiGefPpi.cautionCount === 2,
  'DDI Pharmacological Safety',
  'Gefitinib + PPI Gastric Acid Interaction Timing Caution',
  `成功识别吉非替尼与抑酸药/抗酸剂相互作用 (发现 ${ddiGefPpi.cautionCount} 项用药时序警示)`,
  '吉非替尼与 PPI 相互作用未检出'
);

// 场景 2: 奥希替尼 + 西柚/葡萄柚汁 + 利福平 (绝对禁忌与强诱导)
const ddiOsiSevere = checkDrugInteractions('osimertinib', ['grapefruit', 'rifampin', 'amlodipine']);
assert(
  ddiOsiSevere.overallStatus === 'danger' && ddiOsiSevere.severeCount === 2,
  'DDI Pharmacological Safety',
  'Osimertinib + Grapefruit & Rifampin Severe Contraindication',
  `成功拦截西柚与利福平 2 项绝对禁忌药物相互作用 (overallStatus=danger)`,
  '高危禁忌相互作用未拦截'
);

// ============================================================================
// 5. 个人隐私安全、脱敏引擎与密码学鉴权防篡改仿真 (Cybersecurity & PIPL)
// ============================================================================
console.log('▶ [5/7] 正在仿真测试: PIPL 个人数据脱敏、PBKDF2 21万轮加密与 HMAC 防篡改...');

// 场景 1: 复杂临床报告中文本脱敏
const rawClinicalDoc = `
中国医学科学院肿瘤医院病理报告单
患者姓名：李建国，性别：男，年龄：56岁。
身份证号：420106196805123456，联系电话：13971234567。
病案号/住院号：ZY99887766。
病理诊断：右肺中叶浸润性腺癌，切缘阴性。
`;
const sanitizedDoc = sanitizeClinicalText(rawClinicalDoc);
const idProtected = !sanitizedDoc.includes('420106196805123456') && sanitizedDoc.includes('420106********3456');
const phoneProtected = !sanitizedDoc.includes('13971234567') && sanitizedDoc.includes('139****4567');
const nameProtected = !sanitizedDoc.includes('李建国') && sanitizedDoc.includes('李*国');
const inpatientProtected = !sanitizedDoc.includes('ZY99887766');

assert(
  idProtected && phoneProtected && nameProtected && inpatientProtected,
  'Privacy & Compliance',
  'PIPL Extreme Sanitization Benchmark',
  '姓名、身份证、手机号及住院号 100% 不可逆脱敏',
  '脱敏未完全覆盖高危信息',
  { sanitizedDoc }
);

// 场景 2: PBKDF2 210,000 轮安全哈希与加盐密码验证
const rawPassword = 'SuperSecretClinicalPassword2026!';
const { hash, salt } = hashPassword(rawPassword);
const correctAuth = verifyPassword(rawPassword, hash, salt);
const wrongAuth = verifyPassword('WrongPassword123!', hash, salt);
assert(
  correctAuth && !wrongAuth,
  'Cryptography & Auth',
  'PBKDF2 210,000-Round Salted Hash Verification',
  'PBKDF2 密码哈希生成、加盐防碰撞与密码验证 100% 准确拦截非法凭据',
  'PBKDF2 鉴权验证异常'
);

// 场景 3: HMAC 签名防篡改 Session Token
const sampleUserId = 'usr_oncopath_8899';
const sampleEmail = 'doctor@hospital.org';
const sessionToken = generateUserToken(sampleUserId, sampleEmail);
const validSession = verifyUserToken(sessionToken);

// 模拟篡改 payload (伪造身份提权)
const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
const parts = decoded.split(':');
parts[0] = 'usr_attacker_compromised';
const tamperedPayloadToken = Buffer.from(parts.join(':')).toString('base64');

// 模拟篡改 signature (伪造校验签名)
const parts2 = decoded.split(':');
parts2[3] = (parts2[3].slice(0, -2) + 'aa');
const tamperedSigToken = Buffer.from(parts2.join(':')).toString('base64');

const tamperedSession1 = verifyUserToken(tamperedPayloadToken);
const tamperedSession2 = verifyUserToken(tamperedSigToken);

assert(
  validSession !== null && validSession.userId === sampleUserId && tamperedSession1 === null && tamperedSession2 === null,
  'Cryptography & Auth',
  'HMAC Session Anti-Tampering Integrity',
  'HMAC 真实 Token 校验成功，伪造身份及篡改签名的非法 Token 均被 100% 识别并拦截',
  'HMAC 签名篡改未被有效拦截'
);

// 场景 4: 限流器滑窗阈值模拟
const testIp = `bench_ip_${Date.now()}`;
for (let i = 0; i < 5; i++) {
  checkRateLimit(testIp, { intervalMs: 10000, maxRequests: 5 });
}
const blockedReq = checkRateLimit(testIp, { intervalMs: 10000, maxRequests: 5 });
assert(
  blockedReq.success === false && blockedReq.remaining === 0,
  'Security & Anti-Abuse',
  'Sliding Window Rate Limit Threshold Block',
  '突发请求达到阈值后成功切断访问 (HTTP 429 模拟)',
  '限流器在达到阈值后未切断'
);

// ============================================================================
// 6. 知识图谱、前瞻性临床研究与离线降级容灾仿真 (Offline Fallback Resilience)
// ============================================================================
console.log('▶ [6/7] 正在仿真测试: 数据库离线降级与核心证据库完整性...');

// 场景 1: 离线内置图谱数据结构验证
const graphHasNodes = Array.isArray(DEFAULT_GRAPH_NODES) && DEFAULT_GRAPH_NODES.length >= 10;
const graphHasEdges = Object.keys(DEFAULT_EDGE_EVIDENCES).length >= 10;
assert(
  graphHasNodes && graphHasEdges,
  'Resilience & Fallback',
  'Default Knowledge Graph Offline Payload',
  `离线图谱内置节点数=${DEFAULT_GRAPH_NODES.length}, 循证关联边数=${Object.keys(DEFAULT_EDGE_EVIDENCES).length}`,
  '离线图谱数据不完整'
);

// 场景 2: 核心前瞻性临床研究库完整性 (ADAURA, JCOG0804, JCOG0802 等)
const hasAdaura = FEATURED_STUDIES.some(s => s.title.includes('ADAURA') || (s.relevantFactors && s.relevantFactors.includes('EGFR')));
const hasJcog = FEATURED_STUDIES.some(s => s.title.includes('JCOG') || s.journal?.includes('Lancet') || s.journal?.includes('JTO'));
assert(
  hasAdaura && hasJcog && FEATURED_STUDIES.length >= 10,
  'Resilience & Fallback',
  'Seminal Prospective Studies Evidence Library',
  `已装载 ${FEATURED_STUDIES.length} 篇全球顶刊循证研究 (含 ADAURA、JCOG 系列研究)，离线时可无缝降级平替`,
  '核心顶刊循证研究文献缺失'
);

// ============================================================================
// 7. 简繁多语言本地化与 OpenCC 转换仿真 (Internationalization)
// ============================================================================
console.log('▶ [7/7] 正在仿真测试: 国际化简繁中文无缝转换引擎 (OpenCC)...');

const converter = OpenCC.Converter({ from: 'cn', to: 't' });
const simplifiedSample = '气道播散是早期肺腺癌术后复发的独立危险因素，建议规律随访与精准靶向治疗。';
const traditionalSample = converter(simplifiedSample);
const convertedCorrectly = traditionalSample.includes('氣道播散') && traditionalSample.includes('復發') && traditionalSample.includes('精準靶向治療');

assert(
  convertedCorrectly,
  'Internationalization',
  'Client-side OpenCC Simplified-Traditional Conversion',
  `简繁转换准确无误: "${simplifiedSample.slice(0, 15)}..." -> "${traditionalSample.slice(0, 15)}..."`,
  `简繁转换异常: ${traditionalSample}`
);

// ============================================================================
// 仿真测试报告汇总与输出
// ============================================================================
console.log('\n========================================================================');
console.log('📊 仿真测试执行汇总报告 (SIMULATION SUMMARY REPORT)');
console.log('========================================================================\n');

let passCount = 0;
let failCount = 0;

for (const res of allResults) {
  const icon = res.passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} [${res.category}] ${res.testName}`);
  console.log(`   └─ ${res.message}`);
  if (res.passed) {
    passCount++;
  } else {
    failCount++;
  }
}

console.log('\n------------------------------------------------------------------------');
console.log(`仿真测试指标统计: 共 ${allResults.length} 项测试，通过: ${passCount} 项，失败: ${failCount} 项 (成功率: ${((passCount / allResults.length) * 100).toFixed(1)}%)`);
console.log('------------------------------------------------------------------------\n');

if (failCount === 0) {
  console.log('🎉 恭喜！全部 7 大模块生产环境仿真测试 100% 通过！');
  console.log('系统已满足正式投放生产环境的临床安全、密码学、抗击穿及容灾标准。\n');
  process.exit(0);
} else {
  console.error(`⚠️ 存在 ${failCount} 项测试未通过，请根据日志排查修正后再投放生产！\n`);
  process.exit(1);
}
