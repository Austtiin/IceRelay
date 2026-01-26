"use client";

import { useState } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export default function NotFoundPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onNewReport={() => {}}
      />
      <Navigation
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNewReport={() => {}}
      />

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
            We couldn't find that page. Try heading back to the main ice
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
            <a
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
            </a>
            <a
              href="/near-me"
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
              View Ice Near Me
            </a>
            <a
              href="/map"
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
            </a>
          </div>

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

      <Footer />
    </div>
  );
}
