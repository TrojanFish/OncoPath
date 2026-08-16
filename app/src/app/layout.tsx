import type { Metadata, Viewport } from "next";
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
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "OncoPath — 肺癌循证知识平台",
  description:
    "帮助肺癌患者通过已发表的国际研究理解自己的病理情况。每一条结论都有来源，每一个解释都可追溯。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OncoPath",
  },
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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "OncoPath — 肺癌循证知识平台",
    description:
      "把复杂的医学研究翻译成患者能理解的语言。每一句话都有证据来源。",
    type: "website",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "OncoPath Logo" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${notoSansSC.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
