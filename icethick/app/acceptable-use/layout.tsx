import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Acceptable Use Policy - Ice Relay',
  'Ice Relay Acceptable Use Policy outlining permitted and prohibited content. Learn about our community standards, content moderation, and compliance with Google AdSense policies.',
  '/acceptable-use/',
);

export default function AcceptableUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
