import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Thickness Near Me | Safe Ice Fishing Conditions | Ice Relay",
  description:
    "View current ice conditions and safe ice thickness near you on Minnesota and Midwest lakes. Check ice fishing safety reports, snow depth, and ice thickness for safe winter activities.",
  keywords: [
    "ice thickness near me",
    "safe ice thickness",
    "current ice conditions",
    "ice fishing safety",
    "ice fishing ice thickness",
    "lake ice reports near me",
    "ice thickness reports",
    "community reported ice thickness",
    "minnesota ice conditions",
    "ice thickness mn",
    "ice thickness wi",
    "ice thickness sd",
    "wisconsin ice conditions",
    "south dakota ice conditions",
    "ice safety near me",
    "ice thickness chart"
  ],
  alternates: {
    canonical: "https://www.icerelay.app/near-me/",
  },
};

export default function NearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
