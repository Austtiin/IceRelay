import type { Metadata } from 'next';

export function createPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'Ice Relay',
      locale: 'en_US',
      type: 'website',
      images: [{
        url: '/HomeHero.jpg',
        width: 1519,
        height: 1016,
        alt: 'Winter lake scene used by Ice Relay',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/HomeHero.jpg'],
    },
  };
}
