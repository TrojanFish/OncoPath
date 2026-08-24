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

  it('should evaluate multi-marker panels (CYFRA21-1, NSE, SCC, ProGRP) simultaneously', () => {
    const results = evaluateTumorMarkers({
      cea: 3.1,
      cyfra211: 4.5, // mildly elevated (ref 3.3)
      nse: 12.0,    // normal (ref 16.3)
      scc: 0.9,     // normal (ref 1.5)
      proGrp: 150.0 // significantly elevated (ref 65.0, >130)
    });

    expect(results.length).toBe(5);

    const cyfra = results.find(r => r.key === 'cyfra211')!;
    expect(cyfra.status).toBe('mildly_elevated');

    const nse = results.find(r => r.key === 'nse')!;
    expect(nse.status).toBe('normal');

    const proGrp = results.find(r => r.key === 'proGrp')!;
    expect(proGrp.status).toBe('significantly_elevated');
  });
});
