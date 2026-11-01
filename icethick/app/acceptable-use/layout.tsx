import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy - Ice Relay',
  description: 'Ice Relay Acceptable Use Policy outlining permitted and prohibited content. Learn about our community standards, content moderation, and compliance with Google AdSense policies.',
  alternates: {
    canonical: '/acceptable-use/',
  },
};

export default function AcceptableUseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
