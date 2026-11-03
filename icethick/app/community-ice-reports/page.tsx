import Link from 'next/link';
import WebsiteShell from '../components/WebsiteShell';
import Breadcrumbs from '../components/Breadcrumbs';
import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Self-Reported Ice Conditions | Community Ice Reports | Ice Relay',
  'Understand self-reported lake ice observations: measured thickness, local conditions, report age, and the limits of community ice reports across the Upper Midwest.',
  '/community-ice-reports/',
);

export default function CommunityIceReportsPage() {
  return (
    <WebsiteShell>
      <main className="resource-article container">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources/' }, { name: 'Community ice reports', path: '/community-ice-reports/' }]} />
        <h1>A community ice report is a starting point, not a green light.</h1>
        <p className="article-lead">Self-reported ice conditions bring local observations together. They can tell you what one person reported at one place and time—not whether a lake is safe today.</p>
        <section>
          <h2>What does &ldquo;self-reported&rdquo; mean?</h2>
          <p>Ice Relay reports are submitted by community members, not independently inspected or certified by Ice Relay. Even a report marked measured is the contributor&apos;s own claim. GPS provides location context; it does not verify the reading or identify the limits of an ice sheet.</p>
          <p>Our current submission form asks contributors to confirm they measured the thickness. Older observations may be labeled observed. Neither label is a safety rating.</p>
        </section>
        <section>
          <h2>Read the whole observation</h2>
          <dl className="report-details">
            <div><dt>Location</dt><dd>Look at the reported spot and any access-point notes. Conditions at an inlet, shoreline, or another part of the lake may be different.</dd></div>
            <div><dt>Report time</dt><dd>A report is historical information, even when recently submitted. Weather and currents can change conditions, and the absence of newer reports does not confirm that anything stayed the same.</dd></div>
            <div><dt>Thickness and surface</dt><dd>Consider the reported thickness alongside snow, slush, refrozen ice, and other observations. Thickness alone cannot establish ice strength.</dd></div>
            <div><dt>Conditions and notes</dt><dd>Read the contributor&apos;s notes about cracks, thin ice, access, or other concerns. Treat them as unverified local context, not a comprehensive hazard survey.</dd></div>
          </dl>
        </section>
        <section>
          <h2>No reports near you?</h2>
          <p>Our lake search is based on community submissions, not a complete lake catalog. A missing lake or an empty map is a gap in reporting, not evidence of safe or unsafe ice. State shortcuts move the map; they do not guarantee coverage.</p>
          <p>If you are already at a lake and have a firsthand measurement, you can enter a new lake name in the report form. Never go onto uncertain ice just to fill a gap in the map.</p>
          <Link href="/near-me/" className="text-link">Find ice thickness reports near you</Link>
        </section>
        <section>
          <h2>Build a more useful local record</h2>
          <p>Share your own observation instead of reposting someone else&apos;s reading. Describe where it applies and avoid statements such as &ldquo;safe for everyone.&rdquo; Fresh, factual contributions are more useful than duplicate reports or promotional posts.</p>
          <div className="site-actions"><Link href="/contribute/" className="site-button">Learn how to report ice thickness</Link><Link href="/report-poor-ice-conditions/" className="text-link">Reporting poor ice conditions</Link></div>
        </section>
        <section>
          <h2>Use current official guidance</h2>
          <p>Ice Relay is independent of state agencies and is not an emergency service. Use our <Link href="/safety-guide/">ice safety guide</Link> to find official resources. When uncertain, stay off the ice. If someone is in immediate danger, call 911 rather than submitting a community report.</p>
        </section>
      </main>
    </WebsiteShell>
  );
}
