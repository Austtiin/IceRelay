import { createPageMetadata } from "../../lib/metadata";
import React from "react";

export const metadata = createPageMetadata(
  "Ice Safety Guide | Ice Thickness Reports & Safety Resources | Ice Relay",
  "Find Minnesota DNR ice safety guidance, Wisconsin and North Dakota resources, and context for community ice thickness reports. Reports are unverified, not safety assessments.",
  "/safety-guide/",
);

export default function SafetyGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
