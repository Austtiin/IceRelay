export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://icerelay.net');

export const publicPagePaths = [
  '/',
  '/near-me/',
  '/map/',
  '/contribute/',
  '/community-ice-reports/',
  '/report-poor-ice-conditions/',
  '/resources/',
  '/safety-guide/',
  '/about/',
  '/contact/',
  '/acceptable-use/',
  '/disclaimer/',
  '/privacy-policy/',
  '/terms/',
  '/cookie-policy/',
] as const;
