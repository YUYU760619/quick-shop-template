import type { Metadata } from "next";
import "./globals.css";
import WalkingDaifu from "./components/walking-daifu";

export const metadata: Metadata = {
  title: "GOOD STUFF｜咕司大福",
  description: "鞋、服飾、生活選物與 NULO CLEAN 專業洗鞋服務。好東西，都在這。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}<WalkingDaifu /></body>
    </html>
  );
}
