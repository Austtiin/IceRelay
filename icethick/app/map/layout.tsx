import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Thickness Map | Current Ice Conditions & Safety Reports | Ice Relay",
  description:
    "Interactive map of community-submitted ice thickness reports across the Upper Midwest. Reports are unverified and do not determine whether ice is safe.",
  alternates: {
    canonical: "/map/",
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
