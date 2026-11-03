import type { Metadata } from "next";
import React from "react";
import { createPageMetadata } from "../../lib/metadata";

export const metadata: Metadata = {
  ...createPageMetadata(
    "Ice Thickness Map | Community Lake Observations | Ice Relay",
    "Interactive map of community-submitted ice thickness reports across the Upper Midwest. Reports are unverified and do not determine whether ice is safe.",
    "/map/",
  ),
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
