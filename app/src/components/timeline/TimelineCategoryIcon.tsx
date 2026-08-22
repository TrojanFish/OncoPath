"use client";

import React from "react";
import { Scan, Microscope, TestTube2, HeartPulse, FileText } from "lucide-react";
import { TimelineCategory } from "@/lib/timelineTypes";

interface TimelineCategoryIconProps {
  category: TimelineCategory | string;
  className?: string;
}

export default function TimelineCategoryIcon({ category, className = "w-4 h-4" }: TimelineCategoryIconProps) {
  switch (category) {
    case "imaging":
    case "Scan":
      return <Scan className={className} />;
    case "pathology":
    case "Microscope":
      return <Microscope className={className} />;
    case "serology":
    case "TestTube2":
      return <TestTube2 className={className} />;
    case "milestone":
    case "HeartPulse":
      return <HeartPulse className={className} />;
    default:
      return <FileText className={className} />;
  }
}
