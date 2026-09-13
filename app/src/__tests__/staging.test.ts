import { describe, it, expect } from 'vitest';
import { computeClinicalTnmStage, getClinicalCohortForProfile, StagingInput } from '../lib/staging';


describe('IASLC / AJCC 第 9 版 (2024 现行国际金标准) TNM Staging Engine', () => {
  describe('Pure GGO Staging Rules (Tis / 0期)', () => {
    it('should stage pure GGO as Tis / Stage 0 regardless of total tumor size', () => {
      const input: StagingInput = {
        noduleType: 'pure_ggo',
        tumorSize: 2.5,
        solidSize: 0,
        ctr: 0,
        nStage: 'N0',
        mStage: 'M0',
        vpi: false
      };
      const result = computeClinicalTnmStage(input);
      expect(result.tStage).toBe('Tis');
      expect(result.stage).toBe('0');
      expect(result.isSubsolidAdjusted).toBe(true);
      expect(result.ctr).toBe(0);
    });
  });

  describe('Mixed GGO (Subsolid) Invasive Component Staging Rules', () => {
    it('should stage solid component <= 0.5cm as T1mi (Stage IA1)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 1.8,
        solidSize: 0.4,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1mi');
      expect(result.stage).toBe('IA1');
      expect(result.isSubsolidAdjusted).toBe(true);
    });

    it('should stage solid component <= 1.0cm as T1a (Stage IA1)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 2.2,
        solidSize: 0.9,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1a');
      expect(result.stage).toBe('IA1');
    });

    it('should stage solid component <= 2.0cm as T1b (Stage IA2)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 2.8,
        solidSize: 1.6,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1b');
      expect(result.stage).toBe('IA2');
    });

    it('should stage solid component <= 3.0cm as T1c (Stage IA3)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 3.5,
        solidSize: 2.8,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1c');
      expect(result.stage).toBe('IA3');
    });

    it('should stage solid component <= 4.0cm as T2a (Stage IB)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 4.5,
        solidSize: 3.8,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T2a');
      expect(result.stage).toBe('IB');
    });

    it('should stage solid component <= 5.0cm as T2b (Stage IIA)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 5.5,
        solidSize: 4.6,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T2b');
      expect(result.stage).toBe('IIA');
    });

    it('should stage solid component <= 7.0cm as T3 (Stage IIB)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 7.2,
        solidSize: 6.2,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T3');
      expect(result.stage).toBe('IIB');
    });

    it('should stage solid component > 7.0cm as T4 (Stage IIIA)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 8.5,
        solidSize: 7.8,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T4');
      expect(result.stage).toBe('IIIA');
    });
  });

  describe('Pure Solid Nodule Staging Rules', () => {
    it('should stage solid tumor <= 1.0cm as T1a (Stage IA1)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 0.9,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1a');
      expect(result.stage).toBe('IA1');
    });

    it('should stage solid tumor <= 2.0cm as T1b (Stage IA2)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.8,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1b');
      expect(result.stage).toBe('IA2');
    });

    it('should stage solid tumor <= 3.0cm as T1c (Stage IA3)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 2.7,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T1c');
      expect(result.stage).toBe('IA3');
    });
  });

  describe('Visceral Pleural Invasion (VPI / PL1 / PL2) Upstaging Rules', () => {
    it('should automatically upstage T1a with VPI+ to T2a (Stage IB)', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 0.8,
        vpi: true,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T2a');
      expect(result.stage).toBe('IB');
      expect(result.explanation).toContain('脏层胸膜侵犯 VPI+');
    });

    it('should automatically upstage subsolid T1mi with VPI+ to T2a', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 1.5,
        solidSize: 0.4,
        vpi: 'positive',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T2a');
      expect(result.stage).toBe('IB');
    });
  });

  describe('IASLC 9th Edition Lymph Node & Distant Metastasis Rules (N and M Stages)', () => {
    it('should stage N1 involvement according to IASLC 9th edition (T1N1 -> IIA, T2N1 -> IIB)', () => {
      const r1 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.0, // T1a
        nStage: 'N1',
        mStage: 'M0'
      });
      // IASLC 9th Edition Major Update: T1N1 downstaged from IIB to IIA!
      expect(r1.stage).toBe('IIA');
      expect(r1.versionBridgeNotice).toContain('IIA');

      const r2 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 4.5, // T2b
        nStage: 'N1',
        mStage: 'M0'
      });
      expect(r2.stage).toBe('IIB');
    });

    it('should stage N1 involvement with T3/T4 as Stage IIIA', () => {
      const r3 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 6.0, // T3
        nStage: 'N1',
        mStage: 'M0'
      });
      expect(r3.stage).toBe('IIIA');

      const r4 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 8.0, // T4
        nStage: 'N1',
        mStage: 'M0'
      });
      expect(r4.stage).toBe('IIIA');
    });

    it('should stage N2a (single station) according to IASLC 9th Edition (T1N2a -> IIB, T2N2a -> IIIA, T3N2a -> IIIA)', () => {
      const r1 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.5, // T1b
        nStage: 'N2a',
        mStage: 'M0'
      });
      // IASLC 9th Edition: T1N2a is Stage IIB!
      expect(r1.stage).toBe('IIB');
      expect(r1.versionBridgeNotice).toContain('IIB');

      const r2 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 4.5, // T2b
        nStage: 'N2a',
        mStage: 'M0'
      });
      expect(r2.stage).toBe('IIIA');

      const r3 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 6.0, // T3
        nStage: 'N2a',
        mStage: 'M0'
      });
      // IASLC 9th Edition: T3N2a is Stage IIIA (downstaged from IIIB)!
      expect(r3.stage).toBe('IIIA');
      expect(r3.versionBridgeNotice).toContain('IIIA');

      const r4 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 8.0, // T4
        nStage: 'N2a',
        mStage: 'M0'
      });
      expect(r4.stage).toBe('IIIB');
    });

    it('should stage N2b (multiple stations) according to IASLC 9th Edition (T1N2b -> IIIA, T2N2b -> IIIB, T3N2b -> IIIB)', () => {
      const r1 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.5, // T1b
        nStage: 'N2b',
        mStage: 'M0'
      });
      expect(r1.stage).toBe('IIIA');

      const r2 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 3.5, // T2a
        nStage: 'N2b',
        mStage: 'M0'
      });
      expect(r2.stage).toBe('IIIB');

      const r3 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 6.0, // T3
        nStage: 'N2b',
        mStage: 'M0'
      });
      expect(r3.stage).toBe('IIIB');
    });

    it('should stage adjacentLobeInvasion as T2a (Stage IB if N0M0) according to IASLC 9th Edition', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.5, // normally T1b
        adjacentLobeInvasion: true,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('T2a');
      expect(result.stage).toBe('IB');
      expect(result.explanation).toContain('直接侵犯相邻肺叶');
    });

    it('should stage N3 involvement with T1-T2 as Stage IIIB and T3/T4 as Stage IIIC', () => {
      const r1 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.5,
        nStage: 'N3',
        mStage: 'M0'
      });
      expect(r1.stage).toBe('IIIB');

      const r2 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 6.0, // T3
        nStage: 'N3',
        mStage: 'M0'
      });
      expect(r2.stage).toBe('IIIC');
    });

    it('should stage M1 distant metastasis according to IASLC 9th Edition (M1a/M1b -> IVA, M1c1/M1c2 -> IVB)', () => {
      const rM1a = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 0.8,
        nStage: 'N0',
        mStage: 'M1a'
      });
      expect(rM1a.stage).toBe('IVA');

      const rM1b = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 2.0,
        nStage: 'N1',
        mStage: 'M1b'
      });
      expect(rM1b.stage).toBe('IVA');

      const rM1c1 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 2.0,
        nStage: 'N0',
        mStage: 'M1c1'
      });
      expect(rM1c1.stage).toBe('IVB');

      const rM1c2 = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 2.0,
        nStage: 'N2b',
        mStage: 'M1c2'
      });
      expect(rM1c2.stage).toBe('IVB');
    });
  });

  describe('Dynamic Multi-Cohort Prognosis & Survival Matching Engine (getClinicalCohortForProfile)', () => {
    it('should match IIIC cohort correctly', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_solid',
        tumorSize: 6.0,
        stage: 'IIIC',
        nStage: 'N3',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('IIIC期');
      expect(cohort.source).toContain('PACIFIC');
      expect(cohort.description).toContain('PACIFIC 方案');
    });
    it('should calculate 100% RFS and OS for Stage 0 (AIS / AAH)', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_ggo',
        tumorSize: 1.5,
        solidSize: 0,
        stage: '0',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('0期');
      expect(cohort.rfs5Year).toBe('100%');
      expect(cohort.os5Year).toBe('100%');
      expect(cohort.isPreOp).toBe(false);
    });

    it('should calculate accurate survival for Stage IA1 (T1mi/T1a N0 M0)', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'mixed_ggo',
        tumorSize: 1.8,
        solidSize: 0.6,
        stage: 'IA1',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('IA1');
      expect(cohort.rfs5Year).toContain('97.0%');
      expect(cohort.os5Year).toContain('98.5%');
    });

    it('should adjust survival for Stage IA1 when STAS is positive', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'mixed_ggo',
        tumorSize: 1.8,
        solidSize: 0.6,
        stage: 'IA1',
        stas: 'positive',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('伴病理高危因素');
      expect(cohort.rfs5Year).toContain('90.0%');
      expect(cohort.keyFactors).toContain('气道播散 STAS+');
    });

    it('should calculate accurate survival for Stage IA2 (T1b N0 M0)', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_solid',
        tumorSize: 1.8,
        stage: 'IA2',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('IA2');
      expect(cohort.rfs5Year).toContain('94.3%');
      expect(cohort.os5Year).toContain('95.0%');
    });

    it('should calculate accurate survival for Stage IB (T2a N0 M0) referencing ADAURA', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_solid',
        tumorSize: 3.5,
        stage: 'IB',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('IB');
      expect(cohort.rfs5Year).toContain('82.0%');
      expect(cohort.os5Year).toContain('85.0%');
      expect(cohort.source).toContain('ADAURA');
    });

    it('should calculate accurate survival for Stage IIIA with N2 lymph node involvement', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_solid',
        tumorSize: 2.5,
        stage: 'IIIA',
        nStage: 'N2',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('IIIA');
      expect(cohort.rfs5Year).toContain('48.0%');
      expect(cohort.os5Year).toContain('55.0%');
      expect(cohort.source).toContain('ADAURA');
    });

    it('should return pre-operative prediction cohort for CT imaging evaluation mode', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_ggo',
        tumorSize: 1.2,
        reportType: 'ct_imaging',
        currentStage: 'evaluation'
      });
      expect(cohort.isPreOp).toBe(true);
      expect(cohort.rfs5Year).toContain('99.7%');
      expect(cohort.source).toContain('JCOG0804');
    });

    it('should match subsolid subcohort for Stage IA2 with CTR <= 0.5', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'mixed_ggo',
        tumorSize: 1.8,
        solidSize: 0.8,
        ctr: 0.44,
        stage: 'IA2',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('IA2期');
      expect(cohort.stage).toContain('混磨低实性');
      expect(cohort.rfs5Year).toContain('96.5%');
      expect(cohort.source).toContain('JCOG1211');
    });

    it('should match ADAURA targeted cohort for Stage IB with EGFR mutation', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_solid',
        tumorSize: 3.5,
        stage: 'IB',
        egfr: 'positive',
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('ADAURA靶向队列');
      expect(cohort.rfs5Year).toContain('85.0%');
      expect(cohort.description).toContain('奥希替尼');
      expect(cohort.keyFactors).toContain('EGFR 敏感突变');
    });

    it('should match ALINA targeted cohort for Stage IB with ALK fusion', () => {
      const cohort = getClinicalCohortForProfile({
        noduleType: 'pure_solid',
        tumorSize: 3.5,
        stage: 'IB',
        geneMutations: [{ gene: 'ALK', subtype: 'EML4-ALK 融合', status: 'positive' }],
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(cohort.stage).toContain('ALINA靶向队列');
      expect(cohort.rfs5Year).toContain('88.0%');
      expect(cohort.description).toContain('阿来替尼');
      expect(cohort.keyFactors).toContain('ALK 融合突变');
    });
  });

  describe('IASLC / AJCC 第 9 版 Advanced Guardrails & Conflict Detection', () => {
    it('should NOT stage tumor as T1mi if total size exceeds 3.0cm even if solid component <= 0.5cm', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 4.0, // Gross size > 3.0cm
        solidSize: 0.4,
        nStage: 'N0',
        mStage: 'M0'
      });
      // T1mi requires gross size <= 3.0cm; here it must be staged by solid component as T1a, not T1mi
      expect(result.tStage).toBe('T1a');
      expect(result.explanation).toContain('总径>3cm不归入T1mi');
    });

    it('should clamp solid component if it erroneously exceeds total tumor size', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 1.5,
        solidSize: 3.5, // Erroneous input > tumorSize
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(result.solidSize).toBe(1.5);
      expect(result.ctr).toBe(1);
    });

    it('should detect pathological contradiction when Tis is accompanied by N1 nodal metastasis', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_ggo',
        tumorSize: 1.5,
        solidSize: 0,
        nStage: 'N1',
        mStage: 'M0'
      });
      expect(result.tStage).toBe('Tis');
      expect(result.explanation).toContain('病理冲突提示');
    });

    it('should detail IVA/IVB sub-stage guidance for distant metastasis M1', () => {
      const rM1a = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 2.5,
        nStage: 'N0',
        mStage: 'M1a'
      });
      expect(rM1a.stage).toBe('IVA');
      expect(rM1a.explanation).toContain('IVA期');

      const rM1c = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 2.5,
        nStage: 'N0',
        mStage: 'M1c'
      });
      expect(rM1c.stage).toBe('IVB');
      expect(rM1c.explanation).toContain('IVB期');
    });

    it('should stage pT based on pathologyInvasiveSize according to IASLC / AJCC 第 9 版 gold standard', () => {
      // 1. Invasive size 0.3cm, gross size 1.5cm -> pT1mi / Stage IA1
      const rMIA = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        tumorSize: 1.8,
        solidSize: 0.8,
        pathologyTumorSize: 1.5,
        pathologyInvasiveSize: 0.3,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(rMIA.tStage).toBe('T1mi');
      expect(rMIA.stage).toBe('IA1');
      expect(rMIA.pathologyInvasiveSize).toBe(0.3);
      expect(rMIA.pathologyTumorSize).toBe(1.5);
      expect(rMIA.explanation).toContain('pT1mi');

      // 2. Pure in-situ AIS: pathologyInvasiveSize 0cm -> pTis / Stage 0
      const rAIS = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        pathologyTumorSize: 1.2,
        pathologyInvasiveSize: 0,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(rAIS.tStage).toBe('Tis');
      expect(rAIS.stage).toBe('0');

      // 3. Invasive size 0.8cm -> pT1a / Stage IA1
      const rT1a = computeClinicalTnmStage({
        noduleType: 'mixed_ggo',
        pathologyTumorSize: 2.0,
        pathologyInvasiveSize: 0.8,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(rT1a.tStage).toBe('T1a');
      expect(rT1a.stage).toBe('IA1');

      // 4. Invasive size 3.5cm -> pT2a / Stage IB
      const rT2a = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        pathologyTumorSize: 3.5,
        pathologyInvasiveSize: 3.5,
        nStage: 'N0',
        mStage: 'M0'
      });
      expect(rT2a.tStage).toBe('T2a');
      expect(rT2a.stage).toBe('IB');
    });
  });
});

