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

  // Map by semantic identifier string or fallback emoji
  switch (icon) {
    case "sparkles":
    case "spiculation":
    case "🦔": 
      return { component: Sparkles, color: "text-amber-500" };
    case "circle-dot":
    case "vacuole":
    case "🧀":
    case "🌰": 
      return { component: CircleDot, color: "text-teal-500" };
    case "spline":
    case "lobulation":
    case "🌊": 
      return { component: Spline, color: "text-sky-500" };
    case "triangle":
    case "pleural-indentation":
    case "⛺": 
      return { component: Triangle, color: "text-rose-500" };
    case "vessel":
    case "git-commit":
    case "lvi":
    case "🚗": 
      return { component: GitCommitHorizontal, color: "text-rose-500" };
    case "layers":
    case "vpi":
    case "pleura":
    case "🚪": 
      return { component: Layers, color: "text-amber-500" };
    case "wind":
    case "stas":
    case "🌬️":
    case "🌬": 
      return { component: Wind, color: "text-indigo-500" };
    case "grid":
    case "lepidic":
    case "🧱": 
      return { component: Grid, color: "text-emerald-500" };
    case "scissors":
    case "surgery":
    case "🔪": 
      return { component: Scissors, color: "text-blue-500" };
    case "utensils":
    case "nutrition":
    case "🥗": 
      return { component: UtensilsCrossed, color: "text-emerald-500" };
    case "diamond":
    case "calcification":
    case "💎": 
      return { component: Sparkles, color: "text-purple-500" };
    case "lung":
    case "nodule":
    case "🫁": 
      return { component: CircleDot, color: "text-teal-600" };
    case "microscope":
    case "pathology":
    case "🔬": 
      return { component: Microscope, color: "text-sky-600" };
    case "dna":
    case "genetics":
    case "🧬": 
      return { component: Dna, color: "text-purple-600" };
    case "recovery":
    case "heart-pulse":
    case "🌿": 
      return { component: HeartPulse, color: "text-emerald-600" };
    case "compass":
    case "guidelines":
    case "🧭": 
      return { component: Compass, color: "text-blue-600" };
    case "tag":
    case "lung-rads":
    case "🏷️":
    case "🏷": 
      return { component: Tag, color: "text-sky-600" };
    case "trending-up":
    case "vdt":
    case "📈": 
      return { component: TrendingUp, color: "text-amber-600" };
    case "calendar":
    case "followup":
    case "📅": 
      return { component: Calendar, color: "text-slate-600" };
    case "crosshair":
    case "mplc":
    case "🎯": 
      return { component: Crosshair, color: "text-rose-600" };
    case "zap":
    case "immune":
    case "⚡": 
      return { component: Zap, color: "text-amber-500" };
    case "shield":
    case "🛡️":
    case "🛡": 
      return { component: ShieldCheck, color: "text-emerald-600" };
    case "network":
    case "decision-tree":
    case "🗺️":
    case "🗺": 
      return { component: Network, color: "text-purple-600" };
    case "brain":
    case "ai":
    case "🤖": 
      return { component: BrainCircuit, color: "text-sky-600" };
    case "globe":
    case "staging":
    case "🌐": 
      return { component: ShieldCheck, color: "text-slate-500" };
    case "activity":
    case "serology":
    case "🟡": 
      return { component: Activity, color: "text-amber-500" };
    case "sprout":
    case "seed":
    case "🌱": 
      return { component: HeartPulse, color: "text-emerald-600" };
    default: 
      return { component: Info, color: "text-slate-500" };
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
