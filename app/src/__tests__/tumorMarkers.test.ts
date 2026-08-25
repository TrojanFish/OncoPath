import { describe, it, expect } from 'vitest';
import { evaluateTumorMarkers, TUMOR_MARKER_DEFINITIONS } from '../lib/tumorMarkers';

describe('Tumor Markers Evaluation & Physiological Fluctuation Engine', () => {
  it('should return empty list when no data is provided', () => {
    expect(evaluateTumorMarkers(null)).toEqual([]);
    expect(evaluateTumorMarkers(undefined)).toEqual([]);
    expect(evaluateTumorMarkers({})).toEqual([]);
  });

  it('should correctly evaluate normal CEA within reference range (0 ~ 5.0 ng/mL)', () => {
    const results = evaluateTumorMarkers({ cea: 2.4 });
    expect(results.length).toBe(1);
    const cea = results[0];
    expect(cea.key).toBe('cea');
    expect(cea.value).toBe(2.4);
    expect(cea.status).toBe('normal');
    expect(cea.statusLabel).toBe('正常安全区间');
    expect(cea.statusColor).toBe('emerald');
    expect(cea.reassuranceText).toContain('属于人体自然生理代谢波动');
  });

  it('should correctly evaluate mildly elevated CEA (5.0 < val <= 10.0)', () => {
    const results = evaluateTumorMarkers({ cea: 6.8 });
    const cea = results[0];
    expect(cea.status).toBe('mildly_elevated');
    expect(cea.statusLabel).toContain('轻度偏高');
    expect(cea.statusColor).toBe('amber');
    expect(cea.benignFactors).toContain('长期吸烟');
  });

  it('should correctly evaluate significantly elevated CEA (val > 10.0 ng/mL)', () => {
    const results = evaluateTumorMarkers({ cea: 15.5 });
    const cea = results[0];
    expect(cea.status).toBe('significantly_elevated');
    expect(cea.statusLabel).toContain('显著升高');
    expect(cea.statusColor).toBe('rose');
    expect(cea.reassuranceText).toContain('建议携带胸部薄层 CT 影像至胸外科/肿瘤科门诊复查');
  });

  it('should evaluate expanded multi-marker panels (CA125, CA19-9, CA15-3, Ferritin) accurately', () => {
    const results = evaluateTumorMarkers({
      cea: 2.1,
      ca125: 18.5,  // normal (ref 35.0)
      ca199: 45.0,  // mildly elevated (ref 27.0)
      ca153: 12.0,  // normal (ref 25.0)
      ferritin: 750.0 // significantly elevated (ref 300.0, >600)
    });

    expect(results.length).toBe(5);

    const ca125 = results.find(r => r.key === 'ca125')!;
    expect(ca125.status).toBe('normal');
    expect(ca125.unit).toBe('U/mL');

    const ca199 = results.find(r => r.key === 'ca199')!;
    expect(ca199.status).toBe('mildly_elevated');
    expect(ca199.benignFactors).toContain('慢性胆囊炎/胆石症');

    const ferritin = results.find(r => r.key === 'ferritin')!;
    expect(ferritin.status).toBe('significantly_elevated');
    expect(ferritin.statusColor).toBe('rose');
  });
});

