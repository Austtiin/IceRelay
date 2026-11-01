import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Safety Guide | Ice Thickness Reports & Safety Resources | Ice Relay",
  description:
    "Find Minnesota DNR ice safety guidance, Wisconsin and North Dakota resources, and context for community ice thickness reports. Reports are unverified, not safety assessments.",
  alternates: {
    canonical: "/safety-guide/",
  },
};

export default function SafetyGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
