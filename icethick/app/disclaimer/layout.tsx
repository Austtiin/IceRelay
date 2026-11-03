import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Disclaimer & Terms of Use | Ice Safety Information | Ice Relay',
  'Important disclaimer and terms of use for Ice Relay. Understand ice safety risks, community-reported ice thickness data limitations, and user responsibilities for Minnesota and Midwest lakes.',
  '/disclaimer/',
);

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
