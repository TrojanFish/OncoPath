import { describe, it, expect } from 'vitest';
import { computeClinicalTnmStage, getClinicalCohortForProfile, StagingInput } from '../lib/staging';


describe('AJCC 8th/9th Edition & IASLC TNM Staging Engine', () => {
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

  describe('Lymph Node & Distant Metastasis Rules (N and M Stages)', () => {
    it('should stage N1 involvement with T1a as Stage IIB', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.0,
        nStage: 'N1',
        mStage: 'M0'
      });
      expect(result.stage).toBe('IIB');
    });

    it('should stage N2 involvement (ipsilateral mediastinal) as Stage IIIA', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.5,
        nStage: 'N2',
        mStage: 'M0'
      });
      expect(result.stage).toBe('IIIA');
    });

    it('should stage N3 involvement (contralateral mediastinal/supraclavicular) as Stage IIIB', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 1.5,
        nStage: 'N3',
        mStage: 'M0'
      });
      expect(result.stage).toBe('IIIB');
    });

    it('should stage any M1 distant metastasis as Stage IV', () => {
      const result = computeClinicalTnmStage({
        noduleType: 'pure_solid',
        tumorSize: 0.8,
        nStage: 'N0',
        mStage: 'M1a'
      });
      expect(result.stage).toBe('IV');
    });
  });

  describe('Dynamic Multi-Cohort Prognosis & Survival Matching Engine (getClinicalCohortForProfile)', () => {
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
      expect(cohort.rfs5Year).toBe('98.8%');
      expect(cohort.os5Year).toBe('99.5%');
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
      expect(cohort.rfs5Year).toBe('92.5%');
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
      expect(cohort.rfs5Year).toBe('95.6%');
      expect(cohort.os5Year).toBe('97.2%');
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
      expect(cohort.rfs5Year).toBe('84.5%');
      expect(cohort.os5Year).toBe('88.0%');
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
      expect(cohort.rfs5Year).toBe('52.0%');
      expect(cohort.os5Year).toBe('60.5%');
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
      expect(cohort.rfs5Year).toBe('99.7%');
      expect(cohort.source).toContain('JCOG0804');
    });
  });
});

