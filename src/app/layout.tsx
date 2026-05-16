import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: {
    template: '%s · JB Tecnología MED',
    default: 'JB Tecnología MED — Líderes en tecnología en Medellín',
  },
  description:
    'Especialistas en las mejores marcas del mercado. Portátiles, computadores de escritorio, monitores, componentes, periféricos y servicio técnico. Centro Comercial Monterrey, El Poblado, Medellín.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jbtecnologiamed.com'
  ),
  openGraph: {
    siteName: 'JB Tecnología MED',
    locale: 'es_CO',
    type: 'website',
    title: 'JB Tecnología MED — Líderes en tecnología',
    description: 'Especialistas en las mejores marcas del mercado: Lenovo, ASUS, HP, ACER, MSI, AMD, Intel, NVIDIA y más.',
  },
  twitter: { card: 'summary_large_image', title: 'JB Tecnología MED' },
  keywords: ['JB Tecnología', 'JB Tecnología Med', 'tecnología Medellín', 'portátiles Medellín', 'computadores Medellín', 'Lenovo ASUS HP Medellín', 'servicio técnico PC Medellín'],
  authors: [{ name: 'JB Tecnología MED' }],
  category: 'shopping',
  formatDetection: { telephone: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
