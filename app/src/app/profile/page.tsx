import PatientDashboard from "@/components/profile/PatientDashboard";
import SubpageNavbar from "@/components/SubpageNavbar";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "患者临床数字档案 - OncoPath Navigator",
  description: "基于循证医学的个人临床决策导航平台",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SubpageNavbar />
      <div className="flex-1 pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12">
        <PatientDashboard />
      </div>
      <Footer maxWidth="max-w-6xl" />
    </div>
  );
}

