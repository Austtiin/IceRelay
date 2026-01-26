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
  title: "Ice Relay - Ice Thickness Across the Midwest",
  description: "Real-world ice reports from the community. No account required. Get trusted ice thickness data across the Midwest to stay safe this winter season.",
  keywords: ["ice thickness", "midwest lakes", "ice safety", "winter sports", "ice fishing", "ice conditions", "ice relay"],
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
