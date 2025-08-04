import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Software Specs Finder",
  description: "Find system requirements for your favorite software",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
