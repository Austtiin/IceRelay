import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "About Ice Relay | Community Ice Thickness & Lake Ice Safety Reports",
  description:
    "Learn about Ice Relay, a community-driven platform for sharing unverified ice thickness reports across Upper Midwest lakes.",
  alternates: {
    canonical: "/about/",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
