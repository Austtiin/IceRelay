import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | User Agreement & Guidelines | Ice Relay',
  description: 'Ice Relay terms of service outlining user responsibilities, content guidelines, and usage terms for our community-driven ice thickness reporting platform.',
  alternates: {
    canonical: '/terms/',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
