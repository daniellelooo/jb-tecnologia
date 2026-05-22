'use client'

import { useState, useMemo, useRef } from 'react'
import { ShoppingCart, Search, Plus, Minus, Trash2, Check, Loader2, CreditCard, Banknote, X, Receipt, TrendingUp } from 'lucide-react'
import { formatCOP } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Seller { id: string; name: string; commission_rate: number }
interface Product { id: string; name: string; price: number; sku: string; stock: number; brand: string }
interface CartItem { product: Product; qty: number }
interface TodaySale {
  id: string; order_number: string; customer_name: string; total: number
  payment_method: string; sale_channel: string; created_at: string
  sellers: { name: string } | null
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo_en_tienda: 'Efectivo', transferencia: 'Transferencia',
  nequi: 'Nequi', daviplata: 'Daviplata', contraentrega: 'Contraentrega'
}

interface Props {
  sellers: Seller[]
  products: Product[]
  todaySales: TodaySale[]
  cajaHoy: Record<string, number>
}

export function PosClient({ sellers, products, todaySales: initialSales, cajaHoy: initialCaja }: Props) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [sellerId, setSellerId] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [payment, setPayment] = useState<string>('efectivo_en_tienda')
  const [paymentRef, setPaymentRef] = useState('')
  const [processing, setProcessing] = useState(false)
  const [todaySales, setTodaySales] = useState(initialSales)
  const [cajaHoy, setCajaHoy] = useState(initialCaja)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return products.slice(0, 20)
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [search, products])

  const subtotal = cart.reduce((s, i) => s + Number(i.product.price) * i.qty, 0)
  const selectedSeller = sellers.find((s) => s.id === sellerId)
  const commission = selectedSeller ? subtotal * (selectedSeller.commission_rate / 100) : 0

  function addToCart(p: Product) {
    setCart((prev) => {
      const ex = prev.find((i) => i.product.id === p.id)
      if (ex) return prev.map((i) => i.product.id === p.id ? { ...i, qty: Math.min(i.qty + 1, p.stock) } : i)
      return [...prev, { product: p, qty: 1 }]
    })
    setSearch('')
    searchRef.current?.focus()
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => prev.flatMap((i) => {
      if (i.product.id !== id) return [i]
      const newQty = i.qty + delta
      if (newQty <= 0) return []
      return [{ ...i, qty: Math.min(newQty, i.product.stock) }]
    }))
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== id))
  }

  async function handleCheckout() {
    if (cart.length === 0) { toast.error('El carrito está vacío'); return }
    if (!customerName.trim()) { toast.error('Ingresa el nombre del cliente'); return }
    if (!customerPhone.trim()) { toast.error('Ingresa el teléfono del cliente'); return }
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/pos-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          sellerId: sellerId || null,
          paymentMethod: payment,
          paymentReference: paymentRef.trim() || null,
          items: cart.map((i) => ({ productId: i.product.id, qty: i.qty, price: i.product.price })),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      toast.success(`Venta registrada · ${json.order_number}`, {
        description: selectedSeller ? `Comisión ${selectedSeller.name}: ${formatCOP(commission)}` : undefined,
      })
      setTodaySales((prev) => [json, ...prev])
      setCajaHoy((prev) => ({ ...prev, [payment]: (prev[payment] ?? 0) + subtotal }))
      // Reset
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
      setPaymentRef('')
      setSellerId('')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error registrando la venta')
    } finally { setProcessing(false) }
  }

  const totalCaja = Object.values(cajaHoy).reduce((s, v) => s + v, 0)

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Punto de Venta</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Registrar Venta</h1>
      </div>

      {/* Caja del día */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 rounded-3xl border border-neutral-700 bg-neutral-900 p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Caja hoy</div>
          <div className="text-2xl font-bold tabular-nums">{formatCOP(totalCaja)}</div>
          <div className="text-[11px] text-neutral-500 mt-1">{todaySales.length} {todaySales.length === 1 ? 'venta' : 'ventas'}</div>
        </div>
        {Object.entries(PAYMENT_LABELS).filter(([k]) => cajaHoy[k]).map(([k, label]) => (
          <div key={k} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">{label}</div>
            <div className="text-lg font-bold tabular-nums">{formatCOP(cajaHoy[k] ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Izquierda: buscador + historial */}
        <div className="space-y-6">
          {/* Buscador de productos */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2"><Search className="h-4 w-4 text-neutral-400" strokeWidth={1.5} /> Agregar productos</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" strokeWidth={1.5} />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, SKU o marca..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {filtered.map((p) => (
                <button key={p.id} onClick={() => addToCart(p)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800 text-left transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                    <div className="text-[11px] text-neutral-500">{p.brand} · SKU {p.sku} · Stock: {p.stock}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums shrink-0">{formatCOP(Number(p.price))}</div>
                  <Plus className="h-4 w-4 text-neutral-400 group-hover:text-white shrink-0 transition-colors" strokeWidth={1.5} />
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">Sin resultados</p>}
            </div>
          </div>

          {/* Historial de hoy */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-neutral-400" strokeWidth={1.5} /> Ventas de hoy</h2>
            {todaySales.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No hay ventas registradas hoy.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {todaySales.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/60">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-neutral-500">{s.order_number}</span>
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                          s.sale_channel === 'pos' ? 'bg-blue-900/60 text-blue-300' : 'bg-neutral-700 text-neutral-300')}>
                          {s.sale_channel === 'pos' ? 'POS' : s.sale_channel}
                        </span>
                      </div>
                      <div className="text-sm font-medium truncate">{s.customer_name}</div>
                      <div className="text-[11px] text-neutral-500">
                        {PAYMENT_LABELS[s.payment_method] ?? s.payment_method}
                        {s.sellers && ` · ${s.sellers.name}`}
                        {' · '}{format(new Date(s.created_at), 'HH:mm', { locale: es })}
                      </div>
                    </div>
                    <div className="font-bold tabular-nums text-sm shrink-0">{formatCOP(Number(s.total))}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Derecha: carrito + formulario */}
        <div className="space-y-4">
          {/* Carrito */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-neutral-400" strokeWidth={1.5} /> Carrito
              {cart.length > 0 && <span className="ml-auto text-[10px] bg-neutral-800 px-2 py-0.5 rounded-full font-bold">{cart.length} ítems</span>}
            </h2>
            {cart.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-6">Agrega productos buscando arriba</p>
            ) : (
              <div className="space-y-2 mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium line-clamp-1">{item.product.name}</div>
                      <div className="text-[11px] text-neutral-500 tabular-nums">{formatCOP(Number(item.product.price))}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => updateQty(item.product.id, -1)} className="h-6 w-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <Minus className="h-3 w-3" strokeWidth={2} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold tabular-nums">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="h-6 w-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <Plus className="h-3 w-3" strokeWidth={2} />
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="h-6 w-6 rounded-lg text-neutral-500 hover:text-red-400 flex items-center justify-center transition-colors ml-1">
                        <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="border-t border-neutral-800 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="font-bold tabular-nums">{formatCOP(subtotal)}</span>
                </div>
                {selectedSeller && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-green-400">Comisión {selectedSeller.name}</span>
                    <span className="font-bold tabular-nums text-green-400">{formatCOP(commission)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Datos de venta */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
            <h2 className="font-bold text-sm">Datos de la venta</h2>

            {/* Vendedor */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">
                <TrendingUp className="inline h-3 w-3 mr-1" strokeWidth={1.5} />Vendedor
              </label>
              <select value={sellerId} onChange={(e) => setSellerId(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors">
                <option value="">— Sin asignar —</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.commission_rate}%)</option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Nombre *</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="Nombre cliente" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Teléfono *</label>
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="3001234567" />
              </div>
            </div>

            {/* Pago */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">
                <CreditCard className="inline h-3 w-3 mr-1" strokeWidth={1.5} />Método de pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PAYMENT_LABELS).map(([k, label]) => (
                  <button key={k} onClick={() => setPayment(k)}
                    className={cn('flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors border',
                      payment === k ? 'bg-white text-black border-white' : 'border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:text-white')}>
                    {k === 'efectivo_en_tienda' ? <Banknote className="h-3 w-3" strokeWidth={1.5} /> : <CreditCard className="h-3 w-3" strokeWidth={1.5} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {payment !== 'efectivo_en_tienda' && (
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Referencia</label>
                <input value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                  placeholder="# de transacción o referencia" />
              </div>
            )}

            <button onClick={handleCheckout} disabled={processing || cart.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 bg-white text-black rounded-xl py-3 text-sm font-bold hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2} />}
              {processing ? 'Procesando...' : `Registrar venta · ${formatCOP(subtotal)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
