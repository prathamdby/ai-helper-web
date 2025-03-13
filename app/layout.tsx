import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Helper",
  description: "Real-time question analysis using computer vision and AI",
  metadataBase: new URL("https://ai-helper-web.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-helper-web.vercel.app",
    title: "AI Helper - Real-time Question Analysis",
    description:
      "Analyze questions in real-time using computer vision and multiple AI models",
    siteName: "AI Helper",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Helper - Real-time question analysis using computer vision and AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Helper - Real-time Question Analysis",
    description:
      "Analyze questions in real-time using computer vision and multiple AI models",
    images: ["/images/og-image.jpg"],
    creator: "@prathamdby",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} from-background via-primary/10 to-background min-h-screen bg-gradient-to-b text-white antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
