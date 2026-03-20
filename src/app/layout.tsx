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
      <body className={`${inter.className} antialiased bg-gray-50 text-york-black min-h-screen flex flex-col`}>
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-gray-200 bg-white py-4 mt-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-400">
              CHES Study Hub — Department of Health and Human Performance, York College
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Dr. Erin Jacques · Dr. Nicholas Grosskopf · Dr. Emilia Vignola
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
