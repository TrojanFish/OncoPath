import type { PatientProfile } from "@/lib/types";

export interface KnowledgeNode {
  id: string;
  label: string;
  type: "factor" | "outcome" | "evidence" | "guideline";
  x: number;
  y: number;
  connections: string[];
  connectionTypes?: Record<string, "risk" | "protective" | "guides">;
  studies: number;
  evidence: number;
  description: string;
}

export interface EdgeEvidence {
  title: string;
  description: string;
  metric?: { label: string; value: string; ci: string; p: string };
  forestData?: Array<{ study: string; year: number; hr: number; ciLow: number; ciHigh: number }>;
  studies: Array<{ title: string; journal: string; year: number; doi: string; conclusion: string }>;
}

export const aiNewNode: KnowledgeNode = {
  id: "ctDNA", label: "ctDNA\nMRD", type: "factor",
  x: 60, y: 15,
  connections: ["RECURRENCE", "ADJUVANT"],
  connectionTypes: { RECURRENCE: "risk", ADJUVANT: "guides" },
  studies: 42, evidence: 5,
  description: "循环肿瘤DNA（微小残留病灶）：最新一代超高敏感度复发监测技术。术后ctDNA持续阴性患者复发风险极低，阳性则预示极高复发可能。",
};



export const typeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  factor: { bg: "#eff6ff", border: "#60a5fa", text: "#1d4ed8", dot: "#2563eb" },
  outcome: { bg: "#fef2f2", border: "#f87171", text: "#b91c1c", dot: "#dc2626" },
  evidence: { bg: "#fffbeb", border: "#fbbf24", text: "#b45309", dot: "#d97706" },
  guideline: { bg: "#f0fdfa", border: "#2dd4bf", text: "#0f766e", dot: "#0d9488" },
};

export const typeLabels: Record<string, string> = {
  factor: "病理因素",
  outcome: "临床结局",
  evidence: "证据节点",
  guideline: "指南建议",
};

/** Direction 1: map PatientProfile fields to node activation levels */
export function getNodeActivation(nodeId: string, profile: PatientProfile | null): "active" | "dim" | "normal" {
  if (!profile) return "normal";

  switch (nodeId) {
    case "STAS":
      if (profile.stas === "positive") return "active";
      if (profile.stas === "negative") return "dim";
      return "normal";
    case "LVI":
      if (profile.lvi === "positive") return "active";
      if (profile.lvi === "negative") return "dim";
      return "normal";
    case "VPI":
      if (profile.vpi === "positive") return "active";
      if (profile.vpi === "negative") return "dim";
      return "normal";
    case "CTR":
      if (profile.ctr > 0.5) return "active";
      if (profile.ctr <= 0.5 && profile.ctr > 0) return "dim";
      return "normal";
    case "IASLC":
      if (profile.iaslcGrade === "3") return "active";
      if (profile.iaslcGrade === "1") return "dim";
      return "normal";
    case "EGFR":
      if (profile.egfr === "positive") return "active";
      if (profile.egfr === "negative") return "dim";
      return "normal";
    case "RECURRENCE": {
      const riskCount = [
        profile.stas === "positive",
        profile.lvi === "positive",
        profile.ctr > 0.5,
        profile.iaslcGrade === "3",
        profile.vpi === "positive",
      ].filter(Boolean).length;
      if (riskCount >= 2) return "active";
      if (riskCount === 0) return "dim";
      return "normal";
    }
    case "METASTASIS":
      if (profile.lvi === "positive") return "active";
      if (profile.lvi === "negative") return "dim";
      return "normal";
    case "TARGETED":
      if (profile.egfr === "positive") return "active";
      if (profile.egfr === "negative") return "dim";
      return "normal";
    case "ADJUVANT":
      if (profile.egfr === "positive" || profile.iaslcGrade === "3" || profile.vpi === "positive") return "active";
      return "normal";
    case "STAGING":
      if (profile.vpi === "positive" || profile.ctr > 0.5) return "active";
      return "normal";
    case "SURGERY":
      if (profile.stas === "positive" || profile.ctr > 0.25) return "active";
      return "normal";
    default:
      return "normal";
  }
}

export const SANDBOX_NODES: Record<string, {
  label: string;
  mechanism: string;
  effect: string;
  trialName: string;
  hrReduction: string;
  protectiveEdges: Array<{ target: string; label: string }>;
}> = {
  TARGETED: {
    label: "靶向治疗（EGFR-TKI）",
    mechanism: "奥希替尼（第三代EGFR-TKI）通过精准阻断EGFR突变驱动的肿瘤增殖信号，降低术后微转移灶的激活风险。",
    effect: "ADAURA研究证实，EGFR阳性II-IIIA期患者辅助奥希替尼治疗后，3年DFS从29%提升至70%，复发风险降低83%（HR=0.17）。",
    trialName: "ADAURA (NEJM 2023)",
    hrReduction: "HR = 0.17（复发风险↓83%）",
    protectiveEdges: [
      { target: "RECURRENCE", label: "-83%" },
    ],
  },
  ADJUVANT: {
    label: "辅助化疗 / 辅助治疗",
    mechanism: "辅助化疗通过铂类药物杀灭手术后残余的微小转移灶，减少系统性复发；对于IASLC Grade 3或VPI阳性患者尤为重要。",
    effect: "荟萃分析显示，IB-IIIA期NSCLC辅助化疗可提升5年OS约5-8%，IASLC Grade 3亚组获益更为显著。",
    trialName: "LACE Meta-Analysis (JCO 2010)",
    hrReduction: "5年OS +5–8%（高危亚组更优）",
    protectiveEdges: [
      { target: "RECURRENCE", label: "-8%" },
      { target: "METASTASIS", label: "-6%" },
    ],
  },
};
