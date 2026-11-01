import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer & Terms of Use | Ice Safety Information | Ice Relay',
  description: 'Important disclaimer and terms of use for Ice Relay. Understand ice safety risks, community-reported ice thickness data limitations, and user responsibilities for Minnesota and Midwest lakes.',
  alternates: {
    canonical: '/disclaimer/',
  },
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
