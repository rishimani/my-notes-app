import "./globals.css";
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Providers } from "./providers";

// Modern serif font for headings - wider and more substantial
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

// Clean sans-serif font for body text
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
    <html
      lang="en"
      className={`dark ${inter.variable} ${sourceSerif.variable}`}
    >
      <body
        className={`${inter.className} bg-gray-950 text-gray-100`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
