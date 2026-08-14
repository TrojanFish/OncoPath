"use client";

import { useEffect, useRef, useState } from "react";

import { fetchStats } from "@/lib/api";

export default function StatsBanner() {
  const [animated, setAnimated] = useState(false);
  const [stats, setStats] = useState([
    { label: "已收录研究", value: 0, suffix: "篇", icon: "📚" },
    { label: "累计患者数据", value: 0, suffix: "例", icon: "👥" },
    { label: "Meta分析", value: 0, suffix: "项", icon: "🔬" },
    { label: "随机对照试验", value: 0, suffix: "项", icon: "⚡" },
  ]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    
    // Fetch dynamic stats
    fetchStats().then(data => {
      if (data) {
        setStats([
          { label: "已收录研究", value: data.total_studies, suffix: "篇", icon: "📚" },
          { label: "累计患者数据", value: data.total_patients, suffix: "例", icon: "👥" },
          { label: "Meta分析", value: data.total_meta_analysis, suffix: "项", icon: "🔬" },
          { label: "随机对照试验", value: data.total_rct, suffix: "项", icon: "⚡" },
        ]);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-y border-slate-200 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <AnimatedStat key={stat.label} stat={stat} animate={animated} />
        ))}
      </div>
    </div>
  );
}

function AnimatedStat({
  stat,
  animate,
}: {
  stat: { label: string; value: number; suffix: string; icon: string };
  animate: boolean;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let start = 0;
    const end = stat.value;
    const duration = 1500;
    const stepTime = 20;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start = Math.min(start + increment, end);
      setDisplayed(Math.round(start));
      if (start >= end) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [animate, stat.value]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all text-center group">
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
        {stat.icon}
      </div>
      <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tabular-nums tracking-tight">
        {animate ? displayed.toLocaleString() : 0}
        <span className="text-sm sm:text-base font-semibold text-slate-500 ml-1">{stat.suffix}</span>
      </div>
      <div className="text-slate-500 text-xs sm:text-sm font-medium">{stat.label}</div>
    </div>
  );
}
