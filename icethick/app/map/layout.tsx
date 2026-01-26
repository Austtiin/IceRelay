import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Lake Ice Thickness Map | Minnesota & Midwest | Ice Relay",
  description:
    "Explore an interactive map of real ice thickness reports across Minnesota and Midwest lakes. Zoom in to see recent lake ice conditions near you.",
  alternates: {
    canonical: "https://icerelay.com/map/",
  },
};

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
