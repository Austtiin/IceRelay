import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Privacy Policy | Data Collection & User Privacy | Ice Relay',
  'Ice Relay privacy policy explaining how we collect, use, and protect your data when reporting ice thickness and using our community reporting website.',
  '/privacy-policy/',
);

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
