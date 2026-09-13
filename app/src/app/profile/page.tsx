import PatientDashboard from "@/components/profile/PatientDashboard";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "患者临床数字档案 - OncoPath Navigator",
  description: "基于循证医学的个人临床决策导航平台",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex-1 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] md:pt-28 pb-8 sm:pb-12">
        <PatientDashboard />
      </div>
      <Footer maxWidth="max-w-7xl" />
    </div>
  );
}

