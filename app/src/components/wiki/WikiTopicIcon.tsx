"use client";

import React from "react";
import {
  Sparkles,
  CircleDot,
  Spline,
  Triangle,
  GitCommitHorizontal,
  Layers,
  Wind,
  Grid,
  Scissors,
  UtensilsCrossed,
  Microscope,
  Dna,
  HeartPulse,
  Calendar,
  Compass,
  TrendingUp,
  ShieldCheck,
  Network,
  Crosshair,
  Zap,
  Activity,
  Award,
  Tag,
  Scan,
  TestTube2,
  FileBadge2,
  Stethoscope,
  Pill,
  BrainCircuit,
  Info,
} from "lucide-react";

interface WikiTopicIconProps {
  icon?: string;
  topicId?: string;
  className?: string;
  size?: number;
}

export function getWikiIconComponent(icon?: string, topicId?: string) {
  if (topicId) {
    switch (topicId) {
      case "spiculation":
      case "spiculation-sign":
        return { component: Sparkles, color: "text-amber-500" };
      case "vacuole":
      case "vacuole-sign":
        return { component: CircleDot, color: "text-teal-500" };
      case "lobulation":
      case "lobulation-sign":
        return { component: Spline, color: "text-sky-500" };
      case "pleural-indentation":
        return { component: Triangle, color: "text-rose-500" };
      case "lvi":
      case "lvi-vessel":
        return { component: GitCommitHorizontal, color: "text-rose-500" };
      case "vpi":
      case "pleural-layers":
        return { component: Layers, color: "text-amber-500" };
      case "stas":
      case "stas-airway":
        return { component: Wind, color: "text-indigo-500" };
      case "lepidic-growth":
        return { component: Grid, color: "text-emerald-500" };
      case "surgical-approaches":
        return { component: Scissors, color: "text-blue-500" };
      case "nutrition-recovery":
        return { component: UtensilsCrossed, color: "text-emerald-500" };
      case "adjuvant-decision-tree":
        return { component: Network, color: "text-purple-500" };
      case "mplc-ggo":
        return { component: Crosshair, color: "text-emerald-500" };
      case "pdl1-immune":
        return { component: Zap, color: "text-amber-500" };
      case "fleischner-guidelines":
        return { component: Compass, color: "text-blue-500" };
      case "lung-rads":
        return { component: Tag, color: "text-sky-500" };
      case "vdt-growth":
        return { component: TrendingUp, color: "text-amber-500" };
      case "followup-timeline":
        return { component: Calendar, color: "text-slate-600" };
      case "egfr-mutations":
      case "alk-fusion":
        return { component: Dna, color: "text-purple-500" };
      case "ihc-ki67":
        return { component: FileBadge2, color: "text-purple-500" };
      case "tumor-markers":
        return { component: TestTube2, color: "text-rose-500" };
    }
  }

  // Fallback map by raw emoji icon string
  switch (icon) {
    case "🦔": return { component: Sparkles, color: "text-amber-500" };
    case "🧀": return { component: CircleDot, color: "text-teal-500" };
    case "🌊": return { component: Spline, color: "text-sky-500" };
    case "⛺": return { component: Triangle, color: "text-rose-500" };
    case "🚗": return { component: GitCommitHorizontal, color: "text-rose-500" };
    case "🚪": return { component: Layers, color: "text-amber-500" };
    case "🌬️":
    case "🌬": return { component: Wind, color: "text-indigo-500" };
    case "🧱": return { component: Grid, color: "text-emerald-500" };
    case "🔪": return { component: Scissors, color: "text-blue-500" };
    case "🥗": return { component: UtensilsCrossed, color: "text-emerald-500" };
    case "💎": return { component: Sparkles, color: "text-purple-500" };
    case "🫁": return { component: CircleDot, color: "text-teal-600" };
    case "🔬": return { component: Microscope, color: "text-sky-600" };
    case "🧬": return { component: Dna, color: "text-purple-600" };
    case "🌿": return { component: HeartPulse, color: "text-emerald-600" };
    case "🧭": return { component: Compass, color: "text-blue-600" };
    case "🏷️":
    case "🏷": return { component: Tag, color: "text-sky-600" };
    case "📈": return { component: TrendingUp, color: "text-amber-600" };
    case "📅": return { component: Calendar, color: "text-slate-600" };
    case "🎯": return { component: Crosshair, color: "text-rose-600" };
    case "⚡": return { component: Zap, color: "text-amber-500" };
    case "🛡️":
    case "🛡": return { component: ShieldCheck, color: "text-emerald-600" };
    case "🗺️":
    case "🗺": return { component: Network, color: "text-purple-600" };
    case "🤖": return { component: BrainCircuit, color: "text-sky-600" };
    case "🌐": return { component: ShieldCheck, color: "text-slate-500" };
    case "🟡": return { component: Activity, color: "text-amber-500" };
    case "🌰": return { component: CircleDot, color: "text-teal-600" };
    default: return { component: Info, color: "text-slate-500" };
  }
}

export default function WikiTopicIcon({
  icon,
  topicId,
  className = "",
  size = 24,
}: WikiTopicIconProps) {
  const { component: IconComp, color } = getWikiIconComponent(icon, topicId);
  return <IconComp size={size} className={`${color} shrink-0 ${className}`} />;
}
