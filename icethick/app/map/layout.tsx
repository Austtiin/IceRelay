import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Thickness Map | Current Ice Conditions & Safety Reports | Ice Relay",
  description:
    "Interactive map of current ice conditions and ice fishing safety reports across Minnesota and Midwest lakes. View ice thickness, snow depth, and safe ice conditions near you.",
  keywords: [
    "ice thickness map",
    "current ice conditions",
    "ice fishing map",
    "safe ice thickness",
    "minnesota ice map",
    "lake ice conditions map",
    "ice safety map"
  ],
  alternates: {
    canonical: "https://www.icerelay.app/map/",
  },
  other: {
    'mapbox:telemetry': 'false',
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
