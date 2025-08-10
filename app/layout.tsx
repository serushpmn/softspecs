import type { Metadata } from "next";
import "./globals.css";
import { Vazirmatn } from "next/font/google";

export const metadata: Metadata = {
  title: "Software Specs Finder",
  description: "Find system requirements for your favorite software",
};

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.className} antialiased`}>{children}</body>
    </html>
  );
}
