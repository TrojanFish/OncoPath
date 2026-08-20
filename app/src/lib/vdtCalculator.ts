import type { FollowUpRecord } from './types';

export interface VdtAnalysisResult {
  hasHistory: boolean;
  recordCount: number;
  latestRecord: FollowUpRecord | null;
  previousRecord: FollowUpRecord | null;
  daysBetween: number;
  sizeChangeMm: number;        // 全径变化毫米 (正数为增大，负数为缩小)
  solidChangeMm: number;       // 实性成分变化毫米
  ctrChange: number;           // CTR 变化
  vdtDays: number | null;      // 体积倍增时间 (天数)，若为负数或无变化则为 null 或非常大
  growthCategory: "stable" | "slow_indolent" | "active_growth" | "shrinking" | "insufficient_data";
  categoryLabel: string;
  categoryBadgeColor: string;
  clinicalInterpretation: string;
  actionGuidance: string;
}

/**
 * Schwartz formula for Volume Doubling Time (VDT):
 * VDT = (t * ln 2) / (3 * ln(D2 / D1))
 * where t = time elapsed in days, D1 = initial diameter, D2 = final diameter.
 */
export function calculateVdtAndGrowth(history?: FollowUpRecord[] | null, currentTumorSizeCm?: number, currentSolidSizeCm?: number, currentCtr?: number): VdtAnalysisResult {
  const fallbackResult: VdtAnalysisResult = {
    hasHistory: false,
    recordCount: 0,
    latestRecord: null,
    previousRecord: null,
    daysBetween: 0,
    sizeChangeMm: 0,
    solidChangeMm: 0,
    ctrChange: 0,
    vdtDays: null,
    growthCategory: "insufficient_data",
    categoryLabel: "初次基线建档",
    categoryBadgeColor: "slate",
    clinicalInterpretation: "当前为首份基线 CT 记录。建议遵医嘱按期复查薄层 CT，建立长程对比基准。",
    actionGuidance: "遵照当前结节大小与实性成分比，安排下一次薄层高分辨 CT (HRCT) 复查。"
  };

  if (!history || history.length === 0) {
    return fallbackResult;
  }

  // Sort history chronologically by date
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length < 2) {
    const single = sorted[0];
    return {
      ...fallbackResult,
      hasHistory: true,
      recordCount: 1,
      latestRecord: single,
      clinicalInterpretation: `已记录 ${single.date} 的单次基线影像（总径 ${(single.tumorSize * 10).toFixed(0)}mm，实性 ${(single.solidSize * 10).toFixed(0)}mm）。待下一次复查后即可自动生成生长演变趋势图。`
    };
  }

  const prev = sorted[sorted.length - 2];
  const curr = sorted[sorted.length - 1];

  const t1 = new Date(prev.date).getTime();
  const t2 = new Date(curr.date).getTime();
  const days = Math.max(1, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));

  const d1Mm = prev.tumorSize * 10;
  const d2Mm = curr.tumorSize * 10;
  const s1Mm = prev.solidSize * 10;
  const s2Mm = curr.solidSize * 10;

  const sizeDiffMm = Math.round((d2Mm - d1Mm) * 10) / 10;
  const solidDiffMm = Math.round((s2Mm - s1Mm) * 10) / 10;
  const ctrDiff = Math.round((curr.ctr - prev.ctr) * 100) / 100;

  let vdtDays: number | null = null;
  let category: VdtAnalysisResult["growthCategory"] = "stable";
  let label = "🟢 稳定期 (极度惰性)";
  let badgeColor = "emerald";
  let interpretation = "";
  let guidance = "";

  if (d2Mm < d1Mm - 1.5) {
    // Shrinking / absorption (inflammatory)
    category = "shrinking";
    label = "🟢 明显吸收缩小 (炎性倾向)";
    badgeColor = "emerald";
    interpretation = `前后相隔 ${days} 天，结节最大径缩小了 ${Math.abs(sizeDiffMm)} mm。此种短期内明显缩小吸收的形态高度提示既往良性炎性渗出或感染后吸收。`;
    guidance = "炎性吸收属于极其良好的良性转归信号，建议继续保持健康生活习惯，遵医嘱按常规周期复查。";
  } else if (Math.abs(sizeDiffMm) <= 1.0 && Math.abs(solidDiffMm) <= 0.8) {
    // Truly stable
    category = "stable";
    label = "🟢 高度稳定期 (VDT > 800天)";
    badgeColor = "emerald";
    interpretation = `相隔 ${days} 天（约 ${(days / 30).toFixed(1)} 个月），结节总径变化仅 ${sizeDiffMm > 0 ? '+' : ''}${sizeDiffMm} mm，实性成分无明显进展，处于完全惰性静止状态。`;
    guidance = "结节长期保持稳定是磨玻璃结节最常见的良性或惰性生物学特征。完全处于安全随访区间，无需急于手术！";
  } else {
    // Calculation of VDT if growing
    if (d2Mm > d1Mm) {
      vdtDays = Math.round((days * Math.log(2)) / (3 * Math.log(d2Mm / d1Mm)));
    }

    if (solidDiffMm >= 2.0 || ctrDiff >= 0.25 || (vdtDays !== null && vdtDays < 365)) {
      category = "active_growth";
      label = "🔴 活跃进展期 (实性增多)";
      badgeColor = "rose";
      interpretation = `相隔 ${days} 天，结节实性成分增多 ${solidDiffMm} mm (CTR 上升 ${(ctrDiff * 100).toFixed(0)}%)。实性成分的明确增长提示肿瘤细胞侵袭性有所增强。`;
      guidance = "建议近期携带完整前后对比影像至三甲胸外科门诊评估，探讨胸腔镜解剖性肺段/肺叶微创手术的适宜时机。";
    } else {
      category = "slow_indolent";
      label = "🟡 慢速惰性演进期 (VDT 400~800天)";
      badgeColor = "amber";
      interpretation = `相隔 ${days} 天，结节出现微量慢速增大 (${sizeDiffMm > 0 ? '+' : ''}${sizeDiffMm} mm)，但实性成分未见爆发性增多，属于典型的早早期磨玻璃慢速惰性生长。`;
      guidance = "建议适当缩短薄层 CT 随访间隔（如由 12 个月调整为 3~6 个月），重点关注实性成分与边缘征象变化。";
    }
  }

  return {
    hasHistory: true,
    recordCount: sorted.length,
    latestRecord: curr,
    previousRecord: prev,
    daysBetween: days,
    sizeChangeMm: sizeDiffMm,
    solidChangeMm: solidDiffMm,
    ctrChange: ctrDiff,
    vdtDays,
    growthCategory: category,
    categoryLabel: label,
    categoryBadgeColor: badgeColor,
    clinicalInterpretation: interpretation,
    actionGuidance: guidance
  };
}
