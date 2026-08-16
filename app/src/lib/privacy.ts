/**
 * OncoPath Patient Privacy & PII (Personally Identifiable Information) Sanitizer
 * Compliant with PIPL (中国个人信息保护法) & Medical Data De-identification Standards.
 */

/**
 * Strips or masks high-risk PII from raw clinical/pathology text before sending to LLMs or storing in logs.
 */
export function sanitizeClinicalText(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText;

  // 1. Mask 18-digit Chinese National ID numbers
  cleaned = cleaned.replace(/\b(\d{6})\d{8}(\d{3}[\dXx])\b/g, '$1********$2');

  // 2. Mask Chinese 11-digit mobile phone numbers
  cleaned = cleaned.replace(/\b(1[3-9]\d)\d{4}(\d{4})\b/g, '$1****$2');

  // 3. Mask Medical Record / Inpatient / Outpatient IDs (e.g., 住院号: 2024081699)
  cleaned = cleaned.replace(/(?:住院号|病案号|门诊号|检查号|放射号|病理号|流水号|申请单号)[\s:：]*([A-Za-z0-9-_]{4,20})/gi, (match, id) => {
    return match.replace(id, id.slice(0, 2) + '****' + id.slice(-2));
  });

  // 4. Mask Patient Names in common medical report formats (e.g. 姓名：张三丰 -> 姓名：张*丰)
  cleaned = cleaned.replace(/(?:姓名|患者姓名|病人姓名|患者)[\s:：]*([\u4e00-\u9fa5]{2,4})/g, (_match, name: string) => {
    if (name.length === 2) {
      return `姓名：${name[0]}*`;
    } else if (name.length === 3) {
      return `姓名：${name[0]}*${name[2]}`;
    } else {
      return `姓名：${name[0]}**${name[3]}`;
    }
  });

  return cleaned;
}

/**
 * Sanitizes a patient profile object before persisting or submitting to AI prompt
 */
export function sanitizePatientProfile<T extends Record<string, any>>(profile: T): T {
  if (!profile) return profile;

  const sanitized: Record<string, any> = { ...profile };

  if (typeof sanitized.rawReportText === 'string') {
    sanitized.rawReportText = sanitizeClinicalText(sanitized.rawReportText);
  }

  if (typeof sanitized.patientName === 'string') {
    const name = sanitized.patientName.trim();
    if (name.length <= 2) {
      sanitized.patientName = name ? `${name[0]}*` : '';
    } else {
      sanitized.patientName = `${name[0]}*${name.slice(-1)}`;
    }
  }

  return sanitized as T;
}
