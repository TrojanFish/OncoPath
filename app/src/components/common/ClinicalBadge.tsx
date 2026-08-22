"use client";

import React from "react";
import { ShieldCheck, AlertCircle, AlertTriangle, Info, Check, X, Sparkles, Activity } from "lucide-react";

export type ClinicalStatus = "safe" | "warning" | "danger" | "info" | "neutral" | "highlight";

interface ClinicalBadgeProps {
  status?: ClinicalStatus;
  label: React.ReactNode;
  icon?: "shield" | "alert" | "warning" | "info" | "check" | "x" | "sparkles" | "activity" | "none";
  size?: "sm" | "md" | "lg";
  variant?: "subtle" | "outline" | "solid" | "dot";
  className?: string;
}

export default function ClinicalBadge({
  status = "info",
  label,
  icon,
  size = "md",
  variant = "subtle",
  className = "",
}: ClinicalBadgeProps) {
  // Styles based on 60-30-10 healthcare palette (Emerald / Amber / Rose / Sky / Slate)
  const statusStyles: Record<ClinicalStatus, { subtle: string; outline: string; solid: string; text: string; dot: string }> = {
    safe: {
      subtle: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      outline: "bg-transparent text-emerald-700 border-emerald-300",
      solid: "bg-emerald-600 text-white border-emerald-600",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    warning: {
      subtle: "bg-amber-50 text-amber-800 border-amber-200/80",
      outline: "bg-transparent text-amber-700 border-amber-300",
      solid: "bg-amber-600 text-white border-amber-600",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    danger: {
      subtle: "bg-rose-50 text-rose-800 border-rose-200/80",
      outline: "bg-transparent text-rose-700 border-rose-300",
      solid: "bg-rose-600 text-white border-rose-600",
      text: "text-rose-700",
      dot: "bg-rose-500",
    },
    info: {
      subtle: "bg-sky-50 text-sky-800 border-sky-200/80",
      outline: "bg-transparent text-sky-700 border-sky-300",
      solid: "bg-sky-600 text-white border-sky-600",
      text: "text-sky-700",
      dot: "bg-sky-500",
    },
    neutral: {
      subtle: "bg-slate-100 text-slate-700 border-slate-200/80",
      outline: "bg-transparent text-slate-600 border-slate-300",
      solid: "bg-slate-600 text-white border-slate-600",
      text: "text-slate-600",
      dot: "bg-slate-400",
    },
    highlight: {
      subtle: "bg-teal-50 text-teal-800 border-teal-200/80",
      outline: "bg-transparent text-teal-700 border-teal-300",
      solid: "bg-teal-600 text-white border-teal-600",
      text: "text-teal-700",
      dot: "bg-teal-500",
    },
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
    lg: "px-3 py-1 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  const currentStatus = statusStyles[status] || statusStyles.info;

  const renderIcon = () => {
    if (icon === "none") return null;

    const iconClass = `${iconSizes[size]} shrink-0 ${variant === "solid" ? "text-white" : currentStatus.text}`;

    if (icon) {
      switch (icon) {
        case "shield": return <ShieldCheck className={iconClass} />;
        case "alert": return <AlertCircle className={iconClass} />;
        case "warning": return <AlertTriangle className={iconClass} />;
        case "info": return <Info className={iconClass} />;
        case "check": return <Check className={iconClass} />;
        case "x": return <X className={iconClass} />;
        case "sparkles": return <Sparkles className={iconClass} />;
        case "activity": return <Activity className={iconClass} />;
      }
    }

    // Default icon based on status if not specified
    switch (status) {
      case "safe": return <ShieldCheck className={iconClass} />;
      case "warning": return <AlertTriangle className={iconClass} />;
      case "danger": return <AlertCircle className={iconClass} />;
      case "highlight": return <Sparkles className={iconClass} />;
      case "info": return <Info className={iconClass} />;
      default: return null;
    }
  };

  if (variant === "dot") {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium ${currentStatus.text} ${sizeStyles[size]} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
        <span>{label}</span>
      </span>
    );
  }

  const variantClass = variant === "solid" 
    ? currentStatus.solid 
    : variant === "outline" 
    ? currentStatus.outline 
    : currentStatus.subtle;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border shadow-xs transition-colors ${sizeStyles[size]} ${variantClass} ${className}`}
    >
      {renderIcon()}
      <span>{label}</span>
    </span>
  );
}
