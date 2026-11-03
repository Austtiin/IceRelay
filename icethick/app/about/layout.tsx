import { createPageMetadata } from "../../lib/metadata";
import React from "react";

export const metadata = createPageMetadata(
  "About Ice Relay | Independent Community Ice Reports",
  "Learn about Ice Relay, an independent community project for sharing unverified ice thickness observations across Upper Midwest lakes.",
  "/about/",
);

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
