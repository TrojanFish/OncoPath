import type { Metadata } from "next";
import { Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OncoPath — 肺癌循证知识平台",
  description:
    "帮助肺癌患者通过已发表的国际研究理解自己的病理情况。每一条结论都有来源，每一个解释都可追溯。",
  keywords: [
    "肺癌",
    "肺腺癌",
    "循证医学",
    "mGGO",
    "磨玻璃结节",
    "STAS",
    "CTR",
    "IASLC",
    "肺癌预后",
    "术后随访",
    "lung cancer",
    "evidence-based medicine",
  ],
  openGraph: {
      title: "OncoPath — 肺癌循证知识平台",
    description:
      "把复杂的医学研究翻译成患者能理解的语言。每一句话都有证据来源。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
