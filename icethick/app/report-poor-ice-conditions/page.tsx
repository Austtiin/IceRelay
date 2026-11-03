import Link from 'next/link';
import WebsiteShell from '../components/WebsiteShell';
import Breadcrumbs from '../components/Breadcrumbs';
import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Report Poor Ice Conditions Near You | Thin Ice & Local Observations | Ice Relay',
  'Learn how to describe thin ice, cracks, slush, and other poor ice conditions in a firsthand community report. Ice Relay is not an emergency or verified hazard service.',
  '/report-poor-ice-conditions/',
);

export default function PoorIceConditionsPage() {
  return (
    <WebsiteShell>
      <main className="resource-article container">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources/' }, { name: 'Poor ice conditions', path: '/report-poor-ice-conditions/' }]} />
        <h1>Report what concerns you. Don&apos;t take a risk to prove it.</h1>
        <p className="article-lead">Looking to report bad ice near you? Firsthand notes about thin ice, cracks, or slush can add important context to a community ice thickness report. They are not verified hazard alerts.</p>
        <div className="resource-warning" role="note"><strong>Immediate danger is not a reporting task.</strong><p>If someone is in danger, call 911. Ice Relay is not continuously monitored, does not dispatch responders, and does not send emergency alerts. Stay off uncertain ice.</p></div>
        <section>
          <h2>Describe the observation, not a lake-wide verdict</h2>
          <p>Use the lake name and specific location to explain where you observed a concern. &ldquo;Slush near the north access&rdquo; is more precise than a claim about the entire lake. Do not report another person&apos;s description as your own or assume an unreported area is safe.</p>
          <ul>
            <li>Select relevant conditions such as thin ice, pressure cracks, or pressure ridges when you observed them firsthand.</li>
            <li>Identify the surface type, including snow cover, slush, or refrozen ice.</li>
            <li>Add factual notes about the part of the lake or access area where the observation applies.</li>
            <li>Avoid promises of safe travel, personal information, and unverified rumors.</li>
          </ul>
        </section>
        <section>
          <h2>What the report form supports</h2>
          <p>The current form requires GPS location and a positive, firsthand thickness measurement, plus confirmation that you measured it. Conditions and notes are optional additions to that report. It is not a separate hazard-only or open-water alert form.</p>
          <p>If you do not already have a measurement, <strong>do not invent a thickness or venture onto unsafe ice to get one.</strong> Contact the relevant local authority about a concern, or use our <Link href="/contact/">contact page</Link> to flag inaccurate site content. Neither option replaces calling 911 in an emergency.</p>
          <Link href="/contribute/" className="text-link">Review the reporting requirements</Link>
        </section>
        <section>
          <h2>How others see your contribution</h2>
          <p>Community observations appear in the report views and map. A report can include surface conditions, condition labels, and notes, but no report is a safety clearance or a comprehensive list of hazards. Reports may be inaccurate or become outdated.</p>
          <p>Check the reported location and time and consult <Link href="/safety-guide/">official ice safety resources</Link>. Multiple reports do not establish that a lake is safe.</p>
        </section>
        <section>
          <h2>Already have a firsthand measurement?</h2>
          <p>Share the measurement with the conditions you actually observed. A useful report is factual, location-specific, and clear about its limits.</p>
          <div className="site-actions"><Link href="/?newReport=true" className="site-button">Share a measured ice report</Link><Link href="/community-ice-reports/" className="text-link">Understanding community reports</Link></div>
        </section>
      </main>
    </WebsiteShell>
  );
}
