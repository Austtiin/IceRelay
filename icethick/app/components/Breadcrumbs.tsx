import Link from 'next/link';
import { siteUrl } from '../../lib/site';

export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).href,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        {items.map((item, index) => (
          <span key={item.path}>
            {index > 0 && <span aria-hidden="true"> / </span>}
            {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.path}>{item.name}</Link>}
          </span>
        ))}
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </>
  );
}
