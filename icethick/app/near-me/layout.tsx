import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Thickness Near Me | Minnesota & Midwest Lake Reports | Ice Relay",
  description:
    "View ice thickness near you on Minnesota and Upper Midwest lakes. Search for a specific lake or use your location to see recent community ice reports.",
  alternates: {
    canonical: "https://icerelay.com/near-me/",
  },
};

export default function NearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
