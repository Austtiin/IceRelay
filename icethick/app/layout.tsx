import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import AnalyticsProvider from "./components/AnalyticsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ice Relay | Ice Thickness Near Me in Minnesota & Midwest Lakes",
  description:
    "Check live, community-reported ice thickness near you across Minnesota and the Upper Midwest. See recent lake ice reports to stay safe for ice fishing, skating, and winter travel.",
  keywords: [
    "ice thickness near me",
    "safe ice thickness",
    "ice fishing safety tips",
    "ice fishing ice thickness",
    "current ice conditions",
    "snow depth and ice thickness",
    "ice thickness vs ice safety",
    "minnesota ice thickness",
    "midwest ice thickness",
    "lake ice conditions",
    "ice fishing reports",
    "mn lake ice reports",
    "wisconsin ice thickness",
    "ice safety",
    "winter lake conditions",
    "how thick should ice be",
    "ice thickness for fishing",
    "ice relay"
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here when you get it
    // google: 'your-verification-code',
  },
  openGraph: {
    title: "Ice Relay | Ice Thickness Near Me in Minnesota & Midwest Lakes",
    description:
      "Crowdsourced ice thickness near you for Minnesota and Midwest lakes. View recent ice reports, map views, and safety-focused ice conditions.",
    url: "https://www.icerelay.app/",
    siteName: "Ice Relay",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Ice Relay | Ice Thickness Near Me",
    description:
      "See up-to-date ice thickness near you across Minnesota and the Midwest from real lake reports.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AnalyticsProvider>
            <React.StrictMode>
              {children}
            </React.StrictMode>
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
