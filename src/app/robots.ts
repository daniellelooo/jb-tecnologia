import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jbtecnologiamed.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tienda', '/configurador', '/escritorios', '/portatiles', '/monitores', '/perifericos', '/componentes'],
        disallow: ['/admin', '/api', '/checkout', '/pedido', '/_next'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
