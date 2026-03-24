import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知海导航 | KnowledgeHub",
  description: "聚焦技术、数据、AI 与财会的个人知识导航门户。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
