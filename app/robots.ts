import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/editorial', '/sabores', '/api/'],
    },
    sitemap: 'https://comlupa.com.br/sitemap.xml',
  };
}