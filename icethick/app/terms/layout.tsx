import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Terms of Service | User Agreement & Guidelines | Ice Relay',
  'Ice Relay terms of service outlining user responsibilities, content guidelines, and usage terms for our community-driven ice thickness reporting platform.',
  '/terms/',
);

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
