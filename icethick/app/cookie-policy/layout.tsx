import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Data Storage & Browser Settings | Ice Relay',
  description: 'Ice Relay cookie policy explaining how we use cookies, tracking technologies, and how to manage your cookie preferences for our ice thickness reporting platform.',
  alternates: {
    canonical: '/cookie-policy/',
  },
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
