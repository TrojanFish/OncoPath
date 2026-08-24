import { describe, it, expect } from 'vitest';
import { calculateVdtAndGrowth } from '../lib/vdtCalculator';
import type { FollowUpRecord } from '../lib/types';

describe('VDT (Volume Doubling Time) & Nodule Growth Calculator', () => {
  it('should return fallback result when history is empty or undefined', () => {
    const res = calculateVdtAndGrowth(null);
    expect(res.hasHistory).toBe(false);
    expect(res.recordCount).toBe(0);
    expect(res.growthCategory).toBe('insufficient_data');
    expect(res.categoryLabel).toBe('初次基线建档');
  });

  it('should handle single baseline scan correctly', () => {
    const history: FollowUpRecord[] = [
      { date: '2025-01-01', tumorSize: 1.2, solidSize: 0.4, ctr: 0.33, note: 'Baseline' }
    ];
    const res = calculateVdtAndGrowth(history);
    expect(res.hasHistory).toBe(true);
    expect(res.recordCount).toBe(1);
    expect(res.clinicalInterpretation).toContain('已记录 2025-01-01 的单次基线影像');
  });

  it('should detect shrinking nodule (inflammatory absorption) when size decreases > 1.5mm', () => {
    const history: FollowUpRecord[] = [
      { date: '2024-01-01', tumorSize: 1.6, solidSize: 0.8, ctr: 0.5 },
      { date: '2024-06-01', tumorSize: 1.2, solidSize: 0.3, ctr: 0.25 } // -4mm total
    ];
    const res = calculateVdtAndGrowth(history);
    expect(res.growthCategory).toBe('shrinking');
    expect(res.categoryLabel).toContain('明显吸收缩小');
    expect(res.badgeColor || res.categoryBadgeColor).toBe('emerald');
    expect(res.sizeChangeMm).toBe(-4);
  });

  it('should detect stable indolent nodule when change is within 1mm (VDT > 800 days)', () => {
    const history: FollowUpRecord[] = [
      { date: '2024-01-01', tumorSize: 1.2, solidSize: 0.4, ctr: 0.33 },
      { date: '2025-01-01', tumorSize: 1.2, solidSize: 0.4, ctr: 0.33 } // 0mm change after 365 days
    ];
    const res = calculateVdtAndGrowth(history);
    expect(res.growthCategory).toBe('stable');
    expect(res.categoryLabel).toContain('高度稳定期');
    expect(res.badgeColor || res.categoryBadgeColor).toBe('emerald');
    expect(res.sizeChangeMm).toBe(0);
  });

  it('should detect slow indolent growing nodule (VDT 400~800 days)', () => {
    const history: FollowUpRecord[] = [
      { date: '2024-01-01', tumorSize: 1.0, solidSize: 0.3, ctr: 0.3 },
      { date: '2025-01-01', tumorSize: 1.2, solidSize: 0.4, ctr: 0.33 } // +2mm after 365 days
    ];
    const res = calculateVdtAndGrowth(history);
    expect(res.growthCategory).toBe('slow_indolent');
    expect(res.categoryLabel).toContain('慢速惰性演进期');
    expect(res.badgeColor || res.categoryBadgeColor).toBe('amber');
    expect(res.vdtDays).toBeGreaterThan(365);
  });

  it('should detect active rapid growth when solid component increases >= 2.0mm', () => {
    const history: FollowUpRecord[] = [
      { date: '2024-01-01', tumorSize: 1.4, solidSize: 0.3, ctr: 0.21 },
      { date: '2024-07-01', tumorSize: 1.8, solidSize: 0.9, ctr: 0.5 } // solid increased by +6mm
    ];
    const res = calculateVdtAndGrowth(history);
    expect(res.growthCategory).toBe('active_growth');
    expect(res.categoryLabel).toContain('活跃进展期');
    expect(res.badgeColor || res.categoryBadgeColor).toBe('rose');
    expect(res.actionGuidance).toContain('探讨胸腔镜解剖性肺段/肺叶微创手术');
  });
});
