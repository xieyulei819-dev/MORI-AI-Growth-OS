import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "MORI AI Growth OS · AI 美妆增长中台",
  description:
    "MORI 森屿 AI 美妆增长中台（Demo 作品集项目）：把用户洞察、内容策划、素材生产、投放分析与增长决策整合到一个 AI 工作台。所有数据均为模拟业务数据。",
  applicationName: "MORI AI Growth OS",
  authors: [{ name: "MORI Portfolio Demo" }],
  keywords: ["AI 增长", "营销中台", "结构化输出", "Next.js", "Prisma", "作品集"],
};

const THEME_BOOTSTRAP = `(function(){try{var s=localStorage.getItem('mori-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='dark'||s==='light')?s:(m?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
