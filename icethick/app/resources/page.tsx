import Link from 'next/link';
import WebsiteShell from '../components/WebsiteShell';
import Breadcrumbs from '../components/Breadcrumbs';
import { officialIceSafetyResources } from '../../lib/ice-coverage';
import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Lake Ice Reporting Resources & Community Guides | Ice Relay',
  'Find community ice reporting guides, help with local ice thickness reports, poor ice condition reporting, and official Upper Midwest ice safety resources.',
  '/resources/',
);

const guides = [
  { href: '/contribute/', title: 'Help report ice thickness near you', description: 'What to include, GPS and measurement requirements, and how to submit a useful firsthand report.' },
  { href: '/community-ice-reports/', title: 'Understand self-reported ice conditions', description: 'How to interpret report location, age, thickness, and the limits of unverified community observations.' },
  { href: '/report-poor-ice-conditions/', title: 'Describe poor ice conditions', description: 'Adding thin ice, cracks, slush, and factual concerns to a report—and what to do when you cannot measure.' },
  { href: '/safety-guide/', title: 'Start with official ice safety guidance', description: 'Find state agency resources and understand why thickness alone does not establish ice strength.' },
];

export default function ResourcesPage() {
  return (
    <WebsiteShell>
      <main className="resource-index container">
        <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Resources', path: '/resources/' }]} />
        <h1>A better place to start your lake research.</h1>
        <p className="article-lead">Learn to read community observations, contribute a useful ice thickness report, and find official guidance. Ice Relay reports are unverified—not permission to go onto the ice.</p>
        <ul className="resource-directory">
          {guides.map((guide) => <li key={guide.href}><h2><Link href={guide.href}>{guide.title}</Link></h2><p>{guide.description}</p></li>)}
        </ul>
        <section>
          <h2>Official state agency resources</h2>
          <p>These links take you to independent agency websites. Their guidance can change; check the current source. Linking does not imply an endorsement of Ice Relay.</p>
          <ul className="official-resource-links">{officialIceSafetyResources.map((resource) => <li key={resource.state}><a href={resource.url}>{resource.state} ice safety guidance</a></li>)}</ul>
        </section>
        <section className="guide-closing">
          <h2>Bring your local community into the conversation.</h2>
          <p>Lake associations, fishing clubs, and bait shops can introduce people to the reporting guide from a relevant resource page. Share with permission, explain that reports are unverified, and encourage firsthand contributions rather than reposts.</p>
          <Link href="/contact/" className="text-link">Contact Ice Relay</Link>
        </section>
      </main>
    </WebsiteShell>
  );
}
