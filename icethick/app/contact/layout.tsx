import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Contact Us - Ice Relay',
  'Get in touch with the Ice Relay team. Report bugs, suggest features, or contribute to our open-source ice thickness tracking platform.',
  '/contact/',
);

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
