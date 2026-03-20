import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CHES Study Hub — York College Health and Human Performance",
  description:
    "Prepare for the Certified Health Education Specialist exam. Assess your knowledge across the 8 Areas of Responsibility.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-york-black min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
