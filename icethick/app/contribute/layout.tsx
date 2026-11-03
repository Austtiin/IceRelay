import { createPageMetadata } from '../../lib/metadata';

export const metadata = createPageMetadata(
  'Help Report Ice Thickness Near You | Community Reporting Guide | Ice Relay',
  'Help other lake visitors with a firsthand ice thickness measurement. Learn GPS and reporting requirements, what to include, and how to share local observations.',
  '/contribute/',
);

export default function ContributeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
