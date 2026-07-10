import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/staging/'],
    },
    sitemap: 'https://larsva.com/sitemap.xml',
  };
}
