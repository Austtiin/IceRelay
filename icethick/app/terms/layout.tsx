import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | User Agreement & Guidelines | Ice Relay',
  description: 'Ice Relay terms of service outlining user responsibilities, content guidelines, and usage terms for our community-driven ice thickness reporting platform.',
  keywords: [
    'terms of service',
    'user agreement',
    'ice relay terms',
    'service terms',
    'user responsibilities',
    'ice safety terms',
    'community guidelines'
  ],
  alternates: {
    canonical: 'https://www.icerelay.app/terms/',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
