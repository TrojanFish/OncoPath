/**
 * AJCC 8th/9th Edition & IASLC TNM Staging Engine for Lung Adenocarcinoma
 * Handles Subsolid (Mixed GGO), Pure GGO, and Pure Solid nodules with invasive solid component rules.
 */

export interface StagingInput {
  noduleType?: "mixed_ggo" | "pure_ggo" | "pure_solid" | string | null;
  tumorSize?: number | null; // Total gross tumor size in cm
  solidSize?: number | null; // Invasive / solid component size on CT or pathology in cm
  ctr?: number | null; // Consolidation-to-Tumor Ratio (0 to 1)
  tStage?: string | null;
  nStage?: string | null; // N0, N1, N2, N3
  mStage?: string | null; // M0, M1a, M1b, M1c
  vpi?: boolean | string | null; // Visceral pleural invasion (positive / negative / true / false)
  stas?: boolean | string | null;
  lvi?: boolean | string | null;
  marginStatus?: string | null;
}

export interface StagingResult {
  stage: string;       // e.g. "IA1", "IA2", "IA3", "IB", "IIA", "IIB", "IIIA", "IIIB", "IV"
  tStage: string;      // e.g. "Tis", "T1mi", "T1a", "T1b", "T1c", "T2a", "T2b", "T3", "T4"
  nStage: string;      // e.g. "N0", "N1", "N2", "N3"
  mStage: string;      // e.g. "M0", "M1"
  noduleType: string;
  tumorSize: number;
  solidSize: number;
  ctr: number;
  explanation: string;
  isSubsolidAdjusted: boolean;
}

export function computeClinicalTnmStage(input: StagingInput): StagingResult {
  const noduleType = input.noduleType || "mixed_ggo";
  const tumorSize = input.tumorSize != null && !isNaN(Number(input.tumorSize)) ? Number(input.tumorSize) : 1.5;
  
  // Calculate solid size and CTR
  let solidSize: number;
  if (input.solidSize != null && !isNaN(Number(input.solidSize))) {
    solidSize = Number(input.solidSize);
  } else if (input.ctr != null && !isNaN(Number(input.ctr))) {
    solidSize = Math.round(tumorSize * Number(input.ctr) * 10) / 10;
  } else if (noduleType === "pure_ggo") {
    solidSize = 0;
  } else if (noduleType === "mixed_ggo") {
    solidSize = Math.min(tumorSize, 0.8); // Reasonable clinical default for mGGO
  } else {
    solidSize = tumorSize;
  }

  const ctr = tumorSize > 0 ? Math.min(1, Math.round((solidSize / tumorSize) * 100) / 100) : 0;
  const nStage = input.nStage || "N0";
  const mStage = input.mStage || "M0";
  const isVpi = input.vpi === true || input.vpi === "positive";

  let effectiveT = "T1a";
  let explanation = "";
  let isSubsolidAdjusted = false;

  // 1. AJCC 8th/9th T-Staging Rules
  if (noduleType === "pure_ggo" || solidSize === 0) {
    effectiveT = "Tis";
    explanation = `纯磨玻璃结节 (实性成分=0cm) ➔ 判定为原位/微浸润 Tis/T1mi (0期/IA1期)`;
    isSubsolidAdjusted = true;
  } else if (noduleType === "mixed_ggo" || (ctr > 0 && ctr < 1)) {
    isSubsolidAdjusted = true;
    if (solidSize <= 0.5) {
      effectiveT = "T1mi";
      explanation = `混合磨玻璃结节 (总径 ${tumorSize}cm，CT实性浸润 ≤0.5cm) ➔ 依据 AJCC 8th 实性成分判定为 T1mi (IA1期)`;
    } else if (solidSize <= 1.0) {
      effectiveT = "T1a";
      explanation = `混合磨玻璃结节 (总径 ${tumorSize}cm，CT实性浸润 ${solidSize}cm ≤1.0cm) ➔ 依据 AJCC 8th 实性成分判定为 T1a (IA1期)，非大体总径对应的 IA2期`;
    } else if (solidSize <= 2.0) {
      effectiveT = "T1b";
      explanation = `混合磨玻璃结节 (实性浸润 ${solidSize}cm ≤2.0cm) ➔ 判定为 T1b (IA2期)`;
    } else if (solidSize <= 3.0) {
      effectiveT = "T1c";
      explanation = `混合磨玻璃结节 (实性浸润 ${solidSize}cm ≤3.0cm) ➔ 判定为 T1c (IA3期)`;
    } else if (solidSize <= 4.0) {
      effectiveT = "T2a";
      explanation = `混合磨玻璃结节 (实性浸润 ${solidSize}cm ≤4.0cm) ➔ 判定为 T2a (IB期)`;
    } else if (solidSize <= 5.0) {
      effectiveT = "T2b";
      explanation = `混合磨玻璃结节 (实性浸润 ${solidSize}cm ≤5.0cm) ➔ 判定为 T2b (IIA期)`;
    } else if (solidSize <= 7.0) {
      effectiveT = "T3";
      explanation = `混合磨玻璃结节 (实性浸润 ${solidSize}cm >5.0cm) ➔ 判定为 T3 (IIB期)`;
    } else {
      effectiveT = "T4";
      explanation = `混合磨玻璃结节 (实性浸润 >7.0cm) ➔ 判定为 T4 (IIIA期)`;
    }
  } else {
    // Pure Solid
    if (tumorSize <= 1.0) {
      effectiveT = "T1a";
      explanation = `纯实性结节 (总径 ${tumorSize}cm ≤1.0cm) ➔ 判定为 T1a (IA1期)`;
    } else if (tumorSize <= 2.0) {
      effectiveT = "T1b";
      explanation = `纯实性结节 (总径 ${tumorSize}cm ≤2.0cm) ➔ 判定为 T1b (IA2期)`;
    } else if (tumorSize <= 3.0) {
      effectiveT = "T1c";
      explanation = `纯实性结节 (总径 ${tumorSize}cm ≤3.0cm) ➔ 判定为 T1c (IA3期)`;
    } else if (tumorSize <= 4.0) {
      effectiveT = "T2a";
      explanation = `纯实性结节 (总径 ${tumorSize}cm ≤4.0cm) ➔ 判定为 T2a (IB期)`;
    } else if (tumorSize <= 5.0) {
      effectiveT = "T2b";
      explanation = `纯实性结节 (总径 ${tumorSize}cm ≤5.0cm) ➔ 判定为 T2b (IIA期)`;
    } else if (tumorSize <= 7.0) {
      effectiveT = "T3";
      explanation = `纯实性结节 (总径 ${tumorSize}cm ≤7.0cm) ➔ 判定为 T3 (IIB期)`;
    } else {
      effectiveT = "T4";
      explanation = `纯实性结节 (总径 ${tumorSize}cm >7.0cm) ➔ 判定为 T4`;
    }
  }

  // 2. Visceral Pleural Invasion (VPI) Upstaging Rule (PL1/PL2 automatically upstages T1 to T2a)
  if (isVpi && (effectiveT === "Tis" || effectiveT === "T1mi" || effectiveT === "T1a" || effectiveT === "T1b" || effectiveT === "T1c")) {
    effectiveT = "T2a";
    explanation += ` (⚠️ 伴有脏层胸膜侵犯 VPI+，依据指南自动升期为 T2a)`;
  }

  // 3. Compute Group TNM Stage
  let stage = "IA1";
  if (mStage.startsWith("M1")) {
    stage = "IV";
  } else if (nStage === "N3") {
    stage = "IIIB";
  } else if (nStage === "N2") {
    stage = "IIIA";
  } else if (nStage === "N1") {
    if (effectiveT === "T1a" || effectiveT === "T1b" || effectiveT === "T1c" || effectiveT === "T2a") {
      stage = "IIB";
    } else if (effectiveT === "T2b") {
      stage = "IIB";
    } else {
      stage = "IIIA";
    }
  } else {
    // N0 M0
    if (effectiveT === "Tis") stage = "0";
    else if (effectiveT === "T1mi" || effectiveT === "T1a") stage = "IA1";
    else if (effectiveT === "T1b") stage = "IA2";
    else if (effectiveT === "T1c") stage = "IA3";
    else if (effectiveT === "T2a") stage = "IB";
    else if (effectiveT === "T2b") stage = "IIA";
    else if (effectiveT === "T3") stage = "IIB";
    else if (effectiveT === "T4") stage = "IIIA";
  }

  return {
    stage,
    tStage: effectiveT,
    nStage,
    mStage,
    noduleType,
    tumorSize,
    solidSize,
    ctr,
    explanation,
    isSubsolidAdjusted
  };
}
