import PatientDashboard from "@/components/profile/PatientDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的癌症档案 - OncoPath Navigator",
  description: "基于循证医学的个人癌症决策导航平台",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-accent-blue hover:text-accent-blue-light transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-text-primary">
              Onco<span className="text-gray-900 font-bold">Path</span> Navigator
            </span>
          </a>
          <span className="text-text-secondary text-sm">个人医学操作系统 (Patient OS)</span>
        </div>
      </nav>
      
      <PatientDashboard />
    </div>
  );
}
