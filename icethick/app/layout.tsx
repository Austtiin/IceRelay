import type { Metadata } from "next";
import React from "react";
import "./globals.css";
import ThemeProvider from "./components/ThemeProvider";
import AnalyticsProvider from "./components/AnalyticsProvider";
import { siteUrl } from "../lib/site";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": new URL("/#website", siteUrl).href,
  url: new URL("/", siteUrl).href,
  name: "Ice Relay",
  description: "Independent, unverified community ice thickness observations across the Upper Midwest.",
  inLanguage: "en-US",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Ice Relay | Community Ice Thickness Reports Across the Upper Midwest",
  description:
    "Explore community-submitted ice thickness reports across Minnesota, Wisconsin, Michigan, Iowa, North Dakota, and South Dakota. Reports are unverified and are not a safety assessment.",
  alternates: {
    canonical: "/",
  },
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
  openGraph: {
    title: "Ice Relay | Community Ice Thickness Reports Across the Upper Midwest",
    description:
      "Crowdsourced ice thickness reports for Upper Midwest lakes. View recent reports, map views, and local ice safety resources.",
    url: "/",
    siteName: "Ice Relay",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/HomeHero.jpg",
        width: 1519,
        height: 1016,
        alt: "Ice-covered lake in winter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ice Relay | Community Ice Thickness Reports",
    description:
      "See recent community-submitted ice thickness reports across the Upper Midwest. Reports are unverified.",
    images: ["/HomeHero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }}
        />
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
