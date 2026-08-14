"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";

export function LogoMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
        <img src="/logo.png" alt="OncoPath Logo" className="w-full h-full object-cover" />
      </div>
      <span className="font-semibold text-text-primary">
        Onco<span className="text-gray-900 font-bold">Path</span>
      </span>
    </div>
  );
}

const NAV_LINKS = [
  { label: "首页", href: "/" },
  { label: "知识图谱", href: "/knowledge" },
  { label: "国际研究库", href: "/studies" },
  { label: "学术导航", href: "/resources" },
];

export default function SubpageNavbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <LogoMark />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-accent-blue"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <UserAvatar />
          <Link
            href="/profile"
            className="btn-primary px-5 py-2 rounded-xl text-sm font-medium transition-all"
          >
            建立档案 / 分析
          </Link>
        </div>
      </div>
    </nav>
  );
}
