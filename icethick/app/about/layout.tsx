import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "About Ice Relay | Community Ice Thickness & Lake Ice Safety Reports",
  description:
    "Learn about Ice Relay, a community-driven platform for sharing current ice conditions, ice fishing reports, and safe ice thickness across Minnesota and Midwest lakes.",
  keywords: [
    "ice relay about",
    "ice thickness reporting",
    "community ice reports",
    "community reported ice thickness",
    "crowdsourced ice conditions",
    "lake ice safety community",
    "ice fishing community",
    "minnesota ice reports",
    "ice thickness reports",
    "ice thickness mn",
    "ice thickness wi",
    "ice thickness sd",
    "wisconsin ice reports",
    "south dakota ice reports"
  ],
  alternates: {
    canonical: "https://www.icerelay.app/about/",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
