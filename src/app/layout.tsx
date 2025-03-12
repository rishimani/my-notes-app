import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Notify",
  description: "A simple notes application built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body
        className={`${inter.className} bg-gray-950 text-gray-100`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
