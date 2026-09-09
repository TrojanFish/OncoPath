"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ClipboardList, 
  BookOpen, 
  CreditCard, 
  Activity 
} from "lucide-react";

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "hasProfile";
}

const TABS: TabItem[] = [
  { label: "首页", href: "/", icon: Home },
  { label: "临床档案", href: "/profile", icon: ClipboardList, badgeKey: "hasProfile" },
  { label: "循证百科", href: "/wiki", icon: BookOpen },
  { label: "特药医保", href: "/reimbursement", icon: CreditCard },
  { label: "生命线", href: "/timeline", icon: Activity },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [hasProfile, setHasProfile] = useState(false);

  // Detect whether user has an active clinical profile stored
  useEffect(() => {
    const checkProfile = () => {
      if (typeof window === "undefined") return;
      const profile = localStorage.getItem("oncopath_profile") || localStorage.getItem("patient_profile");
      setHasProfile(!!profile);
    };

    checkProfile();
    window.addEventListener("storage", checkProfile);
    window.addEventListener("auth-change", checkProfile);
    return () => {
      window.removeEventListener("storage", checkProfile);
      window.removeEventListener("auth-change", checkProfile);
    };
  }, []);

  // Hide bottom tab bar in full-screen report or print mode for uninterrupted immersion
  const isReportFullscreen = pathname.startsWith("/profile/report");
  if (isReportFullscreen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden print:hidden pointer-events-none">
      <nav 
        className="w-full bg-white/92 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] pointer-events-auto transition-all"
        style={{
          paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0.4rem))"
        }}
        aria-label="移动端快速导航栏"
      >
        <div className="grid grid-cols-5 items-center max-w-md mx-auto pt-1.5 px-1">
          {TABS.map((tab) => {
            const isActive = tab.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                prefetch={true}
                className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 active:scale-92 cursor-pointer select-none ${
                  isActive 
                    ? "text-blue-600 font-bold" 
                    : "text-slate-500 hover:text-slate-800 font-medium"
                }`}
              >
                {/* Active Indicator Micro-pill */}
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 bg-blue-600 rounded-full animate-fade-in" />
                )}

                {/* Icon Container with optional Notification / Profile Badge */}
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                    }`} 
                  />
                  {tab.badgeKey === "hasProfile" && hasProfile && !isActive && (
                    <span 
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" 
                      title="已建立临床数字档案"
                    />
                  )}
                </div>

                {/* Tab Label */}
                <span className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? "text-blue-600 font-bold" : "text-slate-600"
                }`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
