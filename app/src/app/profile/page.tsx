import PatientDashboard from "@/components/profile/PatientDashboard";
import SubpageNavbar from "@/components/SubpageNavbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的癌症档案 - OncoPath Navigator",
  description: "基于循证医学的个人癌症决策导航平台",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-8 sm:pb-12">
      <SubpageNavbar />
      <div className="pt-24 sm:pt-28 md:pt-32">
        <PatientDashboard />
      </div>
    </div>
  );
}
