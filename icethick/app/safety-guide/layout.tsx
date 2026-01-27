import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Safety Guide | Safe Ice Thickness & Ice Fishing Safety Tips | Ice Relay",
  description:
    "Comprehensive ice safety guide with safe ice thickness guidelines, ice fishing safety tips, understanding ice types, and winter safety precautions for Minnesota and Midwest lakes.",
  keywords: [
    "ice safety guide",
    "safe ice thickness",
    "ice fishing safety tips",
    "ice thickness chart",
    "how thick should ice be",
    "ice thickness for walking",
    "ice thickness for snowmobile",
    "ice thickness for ATV",
    "ice safety rules",
    "ice fishing safety",
    "winter ice safety",
    "lake ice safety",
    "clear ice vs white ice",
    "ice safety equipment",
    "minnesota ice safety",
    "ice thickness mn",
    "ice thickness wi",
    "ice thickness sd",
    "wisconsin ice safety",
    "south dakota ice safety",
    "ice thickness reports"
  ],
  alternates: {
    canonical: "https://www.icerelay.app/safety-guide/",
  },
};

export default function SafetyGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
