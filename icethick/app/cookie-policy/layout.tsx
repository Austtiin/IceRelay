import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Data Storage & Browser Settings | Ice Relay',
  description: 'Ice Relay cookie policy explaining how we use cookies, tracking technologies, and how to manage your cookie preferences for our ice thickness reporting platform.',
  keywords: [
    'cookie policy',
    'cookies',
    'tracking technology',
    'browser data',
    'user preferences',
    'ice relay cookies'
  ],
  alternates: {
    canonical: 'https://www.icerelay.app/cookie-policy/',
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
