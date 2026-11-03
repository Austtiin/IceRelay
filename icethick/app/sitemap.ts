import type { MetadataRoute } from 'next';
import { publicPagePaths, siteUrl } from '../lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPagePaths.map((path) => ({ url: new URL(path, siteUrl).href }));
}
