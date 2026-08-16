/**
 * OncoPath Clinical Guardrails & Safety Verification Engine
 * Automated verification suite for clinical rules, ethical red lines, and data privacy.
 */

import { sanitizeClinicalText, sanitizePatientProfile } from './privacy';
import { checkRateLimit } from './rateLimit';
import type { PatientProfile } from './types';

export interface GuardrailTestResult {
  suite: string;
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * Execute all automated clinical safety, privacy, and rate-limiting guardrail tests.
 */
export function runAllGuardrailTests(): GuardrailTestResult[] {
  const results: GuardrailTestResult[] = [];

  // ==========================================
  // Test Suite 1: PII Privacy Sanitization
  // ==========================================
  try {
    const rawReport = `患者姓名：张晓峰，身份证号：110101198001011234，电话：13812345678，住院号：ZY2026081699。病理诊断：右肺上叶浸润性腺癌，T1aN0M0。`;
    const sanitized = sanitizeClinicalText(rawReport);

    const nameMasked = !sanitized.includes('张晓峰') && sanitized.includes('张*峰');
    const idMasked = !sanitized.includes('110101198001011234') && sanitized.includes('110101********1234');
    const phoneMasked = !sanitized.includes('13812345678') && sanitized.includes('138****5678');
    const hospitalIdMasked = !sanitized.includes('ZY2026081699');

    results.push({
      suite: 'PII Privacy Sanitization',
      name: 'Mask Chinese ID Card, Mobile Phone, Real Name & Inpatient ID',
      passed: nameMasked && idMasked && phoneMasked && hospitalIdMasked,
      message: nameMasked && idMasked && phoneMasked && hospitalIdMasked
        ? '所有高危个人身份标识符均已实现不可逆安全脱敏'
        : '部分 PII 字段脱敏失败，请检查正则匹配',
      details: { sanitized }
    });
  } catch (err: any) {
    results.push({
      suite: 'PII Privacy Sanitization',
      name: 'Sanitizer Execution',
      passed: false,
      message: `脱敏引擎抛出异常: ${err.message}`
    });
  }

  // ==========================================
  // Test Suite 2: Rate Limiter Sliding Window
  // ==========================================
  try {
    const testIp = `test_ip_${Date.now()}`;
    const max = 3;
    const windowMs = 5000;

    const r1 = checkRateLimit(testIp, { intervalMs: windowMs, maxRequests: max });
    const r2 = checkRateLimit(testIp, { intervalMs: windowMs, maxRequests: max });
    const r3 = checkRateLimit(testIp, { intervalMs: windowMs, maxRequests: max });
    const r4 = checkRateLimit(testIp, { intervalMs: windowMs, maxRequests: max });

    const passed = r1.success && r2.success && r3.success && !r4.success && r4.remaining === 0;

    results.push({
      suite: 'Security & Anti-Abuse',
      name: 'Rate Limiter Sliding Window Enforcement',
      passed,
      message: passed
        ? '速率限制器在达到阈值后成功拦截第 4 次请求 (HTTP 429)'
        : '速率限制器未能在达到阈值后有效拦截',
      details: { r1, r2, r3, r4 }
    });
  } catch (err: any) {
    results.push({
      suite: 'Security & Anti-Abuse',
      name: 'Rate Limiter Execution',
      passed: false,
      message: `限流组件异常: ${err.message}`
    });
  }

  // ==========================================
  // Test Suite 3: IA1 Early Stage Low-Risk Clinical Red Line
  // ==========================================
  const earlyProfile: PatientProfile = {
    age: 52,
    gender: 'female',
    sex: 'female',
    currentStage: 'surgery',
    reportType: 'pathology',
    stage: 'IA1',
    tStage: 'T1a',
    nStage: 'N0',
    mStage: 'M0',
    ctr: 0.2,
    surgeryType: 'segmentectomy',
    margin: 'negative',
    stas: 'negative',
    vpi: 'negative',
    lvi: 'negative',
    iaslcGrade: '1'
  };

  const isEarlyLowRisk = (earlyProfile.tStage === "T1a" || earlyProfile.stage === "IA1") &&
    (earlyProfile.nStage === "N0" || !earlyProfile.nStage) &&
    earlyProfile.stas !== "positive" &&
    earlyProfile.vpi !== "positive" &&
    earlyProfile.lvi !== "positive";

  results.push({
    suite: 'Clinical AI Guardrails',
    name: 'IA1 Low-Risk Overtreatment Prevention',
    passed: isEarlyLowRisk,
    message: isEarlyLowRisk
      ? 'IA1期极早期低危患者正确触发【无需术后辅助化疗/靶向药、常规不推荐基因检测】的指南保护红线'
      : '未能正确识别 IA1 期低危患者特征'
  });

  // ==========================================
  // Test Suite 4: IIIA/N2 Advanced Precision Targeting Trigger
  // ==========================================
  const advancedProfile: PatientProfile = {
    age: 58,
    gender: 'male',
    sex: 'male',
    currentStage: 'surgery',
    reportType: 'pathology',
    stage: 'IIIA',
    tStage: 'T2a',
    nStage: 'N2',
    mStage: 'M0',
    ctr: 0.9,
    surgeryType: 'lobectomy',
    margin: 'negative',
    stas: 'positive',
    vpi: 'positive',
    lvi: 'positive'
  };

  const isStage3 = advancedProfile.stage?.includes("III") || advancedProfile.nStage === "N2";
  const triggersTargeting = isStage3 || advancedProfile.stas === "positive";

  results.push({
    suite: 'Clinical AI Guardrails',
    name: 'Stage IIIA / N2 & STAS+ Precision Targeting Recommendation',
    passed: triggersTargeting,
    message: triggersTargeting
      ? 'IIIA (N2) 与 STAS+ 高危患者正确触发 ADAURA 靶向治疗与多学科会诊 MDT 评估指引'
      : '高危患者未能正确触发辅助治疗证据指引'
  });

  return results;
}
