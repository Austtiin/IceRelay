'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function ContributePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="site-page">
      <Header onMenuToggle={() => setIsMenuOpen(!isMenuOpen)} />
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <main className="contribution-guide">
        <div className="container">
          <nav aria-label="Breadcrumb" className="breadcrumbs">
            <Link href="/">Home</Link><span aria-hidden="true"> / </span><span>How to contribute</span>
          </nav>
          <div className="guide-heading">
            <h1>Help your lake&apos;s next visitor.</h1>
            <p>Share a firsthand ice thickness report so others can find local observations in one place. No account is required, and your lake does not need to be listed already.</p>
            <Link href="/?newReport=true" className="site-button">Share a report</Link>
          </div>
          <div className="guide-layout">
            <article className="guide-article">
              <section aria-labelledby="before-reporting">
                <h2 id="before-reporting">Before you report</h2>
                <p>Only submit while physically at the lake you are describing. The form uses your device&apos;s location to place the report; location does not verify ice conditions. Enable location permission when prompted and check that the detected lake name is correct.</p>
                <p><strong>Never venture onto uncertain ice to collect a report.</strong> If you are not at the lake or cannot make a firsthand observation, you can still help by sharing Ice Relay with people who already visit it.</p>
                <Link href="/safety-guide/" className="text-link">Read the ice safety guide first</Link>
              </section>
              <section aria-labelledby="useful-report">
                <h2 id="useful-report">What makes a useful report?</h2>
                <dl className="report-details">
                  <div><dt>Lake and location</dt><dd>Confirm the lake name and add local context, such as the access point or part of the lake. One spot does not represent the whole lake.</dd></div>
                  <div><dt>Firsthand thickness measurement</dt><dd>Enter a positive thickness in inches and confirm that you measured it. The current form requires a measurement; do not invent a reading or enter a visual guess.</dd></div>
                  <div><dt>Surface and ice quality</dt><dd>Describe snow cover, slush, clear ice, or other conditions you actually observed. Thickness alone does not establish strength.</dd></div>
                  <div><dt>Factual notes</dt><dd>Include relevant local details without declaring the lake safe. Do not include private information, advertising, or someone else&apos;s report.</dd></div>
                </dl>
              </section>
              <section aria-labelledby="report-process">
                <h2 id="report-process">From observation to community report</h2>
                <ol className="reporting-steps">
                  <li><h3>Set your location and confirm the lake</h3><p>Allow GPS access, verify the suggested lake, or enter the correct lake name.</p></li>
                  <li><h3>Enter ice details and notes</h3><p>Add thickness, method, surface type, and any firsthand context.</p></li>
                  <li><h3>Review and submit</h3><p>Check the location and details before submitting. Wait for the success confirmation; if submission fails, correct the issue and try again.</p></li>
                </ol>
              </section>
              <section>
                <h2>Include poor conditions, not just the number</h2>
                <p>Thin ice, pressure cracks, slush, or other concerns can add useful local context to a measured report. Never take a risk to get a measurement, and do not treat the form as an emergency service.</p>
                <Link href="/report-poor-ice-conditions/" className="text-link">How to describe poor ice conditions</Link>
              </section>
              <section aria-labelledby="report-questions" className="guide-faq">
                <h2 id="report-questions">Common reporting questions</h2>
                <details><summary>What if my lake has no reports?</summary><p>You can enter the lake name in the report form even if it does not appear in search. Confirm the spelling and your location before submitting; lake search coverage depends on community reports.</p></details>
                <details><summary>Should I report a lake that already has observations?</summary><p>A fresh firsthand observation can add context because conditions change over time and across a lake. Submit what you actually observed, not a duplicate or a repost of another person&apos;s reading.</p></details>
                <details><summary>Does a report mean the ice is safe?</summary><p>No. All reports are community-submitted and unverified. They describe an observation at a particular place and time, not permission to go onto the ice. Follow current local guidance and stay off when uncertain.</p></details>
                <details><summary>How can I correct an inaccurate report?</summary><p>Use the <Link href="/contact/">contact page</Link> to flag an issue. Include the lake, report time, and what appears incorrect, without posting private information. Reports are not independently verified.</p></details>
              </section>
            </article>
            <aside className="guide-aside">
              <h2>Not at a lake? You can still help.</h2>
              <p>Introduce Ice Relay to your fishing club, lake association, local bait shop, or community group. Encourage firsthand observations, not claims of safe ice.</p>
              <p>Link to the <Link href="/">homepage</Link> or this reporting guide in a relevant resource list, with the organizer&apos;s permission.</p>
              <p>No paid links or mass posting: a useful recommendation to the right community matters more.</p>
              <Link href="/contact/" className="text-link">Contact the project</Link>
            </aside>
          </div>
          <section className="guide-closing">
            <h2>A shared map starts with one observation.</h2>
            <p>Already at your lake? Help others understand what you observed. Never take a risk to contribute.</p>
            <Link href="/?newReport=true" className="site-button">Share a report</Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
