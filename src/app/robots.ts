import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/static/', '/*.html'],
      }
    ],
    sitemap: 'https://jsonswiss.com/sitemap.xml',
  }
}