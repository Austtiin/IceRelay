import { createPageMetadata } from "../../lib/metadata";
import React from "react";

export const metadata = createPageMetadata(
  "Ice Thickness Reports Near Me | Upper Midwest Lakes | Ice Relay",
  "Search community-submitted ice thickness reports by lake or explore the Upper Midwest map. Reports are unverified and do not determine whether ice is safe.",
  "/near-me/",
);

export default function NearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
