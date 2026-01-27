import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Data Collection & User Privacy | Ice Relay',
  description: 'Ice Relay privacy policy explaining how we collect, use, and protect your data when reporting ice thickness and using our ice safety platform.',
  keywords: [
    'ice relay privacy policy',
    'data privacy',
    'user data collection',
    'location data privacy',
    'ice report privacy',
    'community data sharing'
  ],
  alternates: {
    canonical: 'https://www.icerelay.app/privacy-policy/',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
