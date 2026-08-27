import { describe, it, expect } from 'vitest';
import { checkDrugInteractions, TARGETED_DRUGS, ALL_CHRONIC_DRUGS } from '../lib/ddiData';

describe('DDI (Drug-Drug Interactions) Pharmacovigilance Engine', () => {
  it('should list targeted drugs and chronic drugs correctly', () => {
    expect(TARGETED_DRUGS.length).toBeGreaterThanOrEqual(8);
    expect(ALL_CHRONIC_DRUGS.length).toBeGreaterThanOrEqual(20);
  });

  it('should detect SEVERE contraindication when combining Osimertinib with Grapefruit or Rifampin', () => {
    const result = checkDrugInteractions('osimertinib', ['grapefruit', 'rifampin', 'amlodipine']);
    expect(result.overallStatus).toBe('danger');
    expect(result.severeCount).toBe(2);
    expect(result.safeCount).toBe(1);
    
    const grapefruitInteraction = result.interactions.find(i => i.chronicDrug.id === 'grapefruit');
    expect(grapefruitInteraction?.rule.riskLevel).toBe('severe_contraindication');
    expect(grapefruitInteraction?.rule.riskLabel).toContain('绝对禁忌');

    const rifampinInteraction = result.interactions.find(i => i.chronicDrug.id === 'rifampin');
    expect(rifampinInteraction?.rule.riskLevel).toBe('severe_contraindication');
    expect(rifampinInteraction?.rule.title).toContain('利福平强效诱导 CYP3A4');
  });

  it('should detect timing caution when combining Gefitinib with Omeprazole (PPI) and Hydrotalcite (Antacid)', () => {
    const result = checkDrugInteractions('gefitinib', ['omeprazole', 'hydrotalcite']);
    expect(result.overallStatus).toBe('warning');
    expect(result.severeCount).toBe(0);
    expect(result.cautionCount).toBe(2);

    const ppi = result.interactions.find(i => i.chronicDrug.id === 'omeprazole');
    expect(ppi?.rule.riskLevel).toBe('timing_caution');
    expect(ppi?.rule.title).toContain('质子泵抑制剂 (PPI)');

    const antacid = result.interactions.find(i => i.chronicDrug.id === 'hydrotalcite');
    expect(antacid?.rule.riskLevel).toBe('timing_caution');
    expect(antacid?.rule.timingRecommendation).toContain('错峰');
  });

  it('should detect SAFE compatibility when combining Osimertinib with Valsartan and Metoprolol', () => {
    const result = checkDrugInteractions('osimertinib', ['valsartan', 'metoprolol']);
    expect(result.overallStatus).toBe('safe');
    expect(result.severeCount).toBe(0);
    expect(result.cautionCount).toBe(0);
    expect(result.safeCount).toBe(2);
    expect(result.summaryText).toContain('均处于安全相容区间');
  });

  it('should generate structured daily medication schedule correctly', () => {
    const result = checkDrugInteractions('osimertinib', ['amlodipine', 'hydrotalcite', 'atorvastatin']);
    expect(result.dailySchedulePlan.length).toBeGreaterThanOrEqual(2);
    
    // Morning slot should have Osimertinib & Amlodipine
    const morning = result.dailySchedulePlan.find(s => s.timeSlot.includes('晨间'));
    expect(morning?.drugs.some(d => d.includes('奥希替尼'))).toBe(true);

    // Afternoon slot should have Hydrotalcite (Antacid)
    const afternoon = result.dailySchedulePlan.find(s => s.timeSlot.includes('下午'));
    expect(afternoon?.drugs.some(d => d.includes('铝碳酸镁'))).toBe(true);

    // Evening slot should have Atorvastatin (Statin)
    const evening = result.dailySchedulePlan.find(s => s.timeSlot.includes('晚间'));
    expect(evening?.drugs.some(d => d.includes('阿托伐他汀'))).toBe(true);
  });
});
