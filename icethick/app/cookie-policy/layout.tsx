import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Cookie Policy | Data Storage & Browser Settings | Ice Relay',
  'Ice Relay cookie policy explaining how we use cookies, tracking technologies, and how to manage your cookie preferences for our ice thickness reporting platform.',
  '/cookie-policy/',
);

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
