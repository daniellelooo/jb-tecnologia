import { SiteHeader } from '@/components/shop/site-header'
import { SiteFooter } from '@/components/shop/site-footer'
import { CartSidebar } from '@/components/shop/cart-sidebar'
import { AnalyticsScripts } from '@/components/shop/analytics-scripts'
import { getSettings } from '@/lib/settings'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <div className="min-h-screen flex flex-col">
      <AnalyticsScripts
        metaPixelId={settings.meta_pixel_id}
        ga4MeasurementId={settings.ga4_measurement_id}
      />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartSidebar />
    </div>
  )
}
