import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Data Collection & User Privacy | Ice Relay',
  description: 'Ice Relay privacy policy explaining how we collect, use, and protect your data when reporting ice thickness and using our ice safety platform.',
  alternates: {
    canonical: '/privacy-policy/',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
