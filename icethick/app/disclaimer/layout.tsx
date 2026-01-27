import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer & Terms of Use | Ice Safety Information | Ice Relay',
  description: 'Important disclaimer and terms of use for Ice Relay. Understand ice safety risks, community-reported ice thickness data limitations, and user responsibilities for Minnesota and Midwest lakes.',
  keywords: [
    'ice safety disclaimer',
    'ice thickness disclaimer',
    'user-submitted ice reports',
    'ice safety responsibility',
    'community ice reports disclaimer',
    'ice fishing safety disclaimer',
    'minnesota ice safety',
    'midwest ice conditions disclaimer'
  ],
  alternates: {
    canonical: 'https://www.icerelay.app/disclaimer/',
  },
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
