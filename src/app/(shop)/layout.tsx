import { SiteHeader } from '@/components/shop/site-header'
import { SiteFooter } from '@/components/shop/site-footer'
import { CartSidebar } from '@/components/shop/cart-sidebar'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartSidebar />
    </div>
  )
}
