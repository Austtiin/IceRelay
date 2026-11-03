import type { Metadata } from "next";
import Link from "next/link";
import WebsiteShell from "./components/WebsiteShell";

export const metadata: Metadata = {
  title: "Page Not Found | Ice Relay",
  description: "This page could not be found. Find community lake reports, reporting guides, and Ice Relay resources.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

export default function NotFoundPage() {
  return (
    <WebsiteShell>
      <main style={{ flex: 1, padding: "4rem 0", background: "#fafbfc" }}>
        <div className="container" style={{ maxWidth: "720px", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "var(--primary-dark)",
            }}
          >
            404 Page Not Found
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
            }}
          >
            We couldn&apos;t find that page. Try heading back to the main ice
            report views below.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.75rem",
              justifyContent: "center",
              marginBottom: "2.5rem",
            }}
          >
            <Link
              href="/"
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "0.75rem",
                background: "var(--primary-dark)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
            >
              Back to Home
            </Link>
            <Link
              href="/near-me/"
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--primary-dark)",
                color: "var(--primary-dark)",
                fontWeight: 600,
                fontSize: "0.95rem",
                background: "white",
              }}
            >
              Find lake reports
            </Link>
            <Link
              href="/map/"
              style={{
                padding: "0.8rem 1.6rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--primary-dark)",
                color: "var(--primary-dark)",
                fontWeight: 600,
                fontSize: "0.95rem",
                background: "white",
              }}
            >
              Open Map View
            </Link>
          </div>
          <p style={{ marginBottom: "1.5rem" }}>
            New to Ice Relay? <Link href="/resources/" className="text-link">Explore our reporting resources</Link> or <Link href="/contribute/" className="text-link">learn how to contribute</Link>.
          </p>

          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            If you clicked a broken link, you can always return to the
            homepage and navigate from there.
          </p>
        </div>
      </main>

    </WebsiteShell>
  );
}
