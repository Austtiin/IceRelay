import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Ice Thickness Reports Near Me | Upper Midwest Lakes | Ice Relay",
  description:
    "Search community-submitted ice thickness reports by lake or explore the Upper Midwest map. Reports are unverified and do not determine whether ice is safe.",
  alternates: {
    canonical: "/near-me/",
  },
};

export default function NearMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
