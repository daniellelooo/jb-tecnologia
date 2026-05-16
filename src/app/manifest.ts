import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JB Tecnología MED — Líderes en tecnología',
    short_name: 'JB Tecnología',
    description: 'Tienda de tecnología en Centro Comercial Monterrey, El Poblado, Medellín. Especialistas en las mejores marcas del mercado.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    icons: [],
    categories: ['shopping', 'business', 'tech'],
    lang: 'es-CO',
  }
}
