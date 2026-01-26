import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Ice Relay',
  description: 'Get in touch with the Ice Relay team. Report bugs, suggest features, or contribute to our open-source ice thickness tracking platform.',
  keywords: 'ice relay contact, ice fishing support, report bugs, contribute, open source ice safety',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
