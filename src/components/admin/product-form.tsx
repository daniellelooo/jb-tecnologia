'use client'

import { useState, useTransition, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Loader2, Trash2, ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Product, Category, ComponentSlot } from '@/types'
import { SpecsEditor, type SpecsMap } from '@/components/admin/specs-editor'
import { ProductImagesEditor, type ImageRow } from '@/components/admin/product-images-editor'

interface FormValues {
  name: string
  slug: string
  sku: string
  category_id: string
  component_slot_id: string
  brand: string
  model: string
  price: number
  compare_price: number | null
  stock: number
  short_description: string
  description: string
  tags: string
  is_active: boolean
  is_featured: boolean
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
  componentSlots: ComponentSlot[]
  images?: ImageRow[]
}

export function ProductForm({ product, categories, componentSlots, images = [] }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const [pending, startTransition] = useTransition()
  const [deleting, setDeleting] = useState(false)
  const [specs, setSpecs] = useState<SpecsMap>((product?.specs as SpecsMap | undefined) ?? {})

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: product?.name ?? '',
      slug: product?.slug ?? '',
      sku: product?.sku ?? '',
      category_id: product?.category_id ?? categories[0]?.id ?? '',
      component_slot_id: product?.component_slot_id ?? '',
      brand: product?.brand ?? '',
      model: product?.model ?? '',
      price: product ? Number(product.price) : 0,
      compare_price: product?.compare_price ? Number(product.compare_price) : null,
      stock: product?.stock ?? 0,
      short_description: product?.short_description ?? '',
      description: product?.description ?? '',
      tags: product?.tags?.join(', ') ?? '',
      is_active: product?.is_active ?? true,
      is_featured: product?.is_featured ?? false,
    },
  })

  const name = watch('name')
  const isActive = watch('is_active')
  const isFeatured = watch('is_featured')

  function onSlugify() {
    if (name && !product) setValue('slug', slugify(name))
  }

  async function onSubmit(data: FormValues) {
    startTransition(async () => {
      const body = {
        name: data.name,
        slug: data.slug || slugify(data.name),
        sku: data.sku,
        category_id: data.category_id,
        component_slot_id: data.component_slot_id || null,
        brand: data.brand,
        model: data.model,
        price: Number(data.price),
        compare_price: data.compare_price ? Number(data.compare_price) : null,
        stock: Number(data.stock),
        short_description: data.short_description,
        description: data.description,
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
        is_active: data.is_active,
        is_featured: data.is_featured,
        specs,
      }
      const res = await fetch(isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Error al guardar'); return }
      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/productos')
      router.refresh()
    })
  }

  async function onDelete() {
    if (!product || !confirm(`¿Eliminar "${product.name}"? Esta acción es irreversible.`)) return
    setDeleting(true)
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Producto eliminado'); router.push('/admin/productos'); router.refresh() }
    else { toast.error('Error al eliminar'); setDeleting(false) }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/productos" className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
              {isEdit ? 'Editar producto' : 'Nuevo producto'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-display">
              {isEdit ? product.name : 'Crear producto'}
            </h1>
            {isEdit && <div className="text-[11px] text-neutral-500 font-mono mt-1">{product.sku}</div>}
          </div>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 text-sm px-4 py-2 hover:bg-neutral-900 hover:text-white hover:border-white transition-all duration-300 ease-premium disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
              Eliminar
            </button>
          )}
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-5 pr-2 py-2 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98] disabled:opacity-50"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
            <span className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center">
              <Check className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-3">
          <Section title="Información básica" desc="Identidad y metadatos del producto">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label>Nombre *</Label>
                <Input {...register('name', { required: true })} onBlur={onSlugify} placeholder="Intel Core i5-13600K" />
                {errors.name && <span className="text-[11px] text-white mt-1 inline-block">Requerido</span>}
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input {...register('slug')} placeholder="intel-core-i5-13600k" />
              </div>
              <div>
                <Label>SKU *</Label>
                <Input {...register('sku', { required: true })} placeholder="CPU-INT-I5-13600K" />
              </div>
              <div>
                <Label>Marca *</Label>
                <Input {...register('brand', { required: true })} placeholder="Intel" />
              </div>
              <div>
                <Label>Modelo</Label>
                <Input {...register('model')} placeholder="Core i5-13600K" />
              </div>
            </div>
          </Section>

          <Section title="Descripción" desc="Texto público del catálogo">
            <Label>Descripción corta (max 160 chars)</Label>
            <Input {...register('short_description')} placeholder="Resumen para las cards del catálogo" />
            <Label className="mt-4">Descripción completa</Label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="Descripción detallada"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-white transition-colors duration-300 ease-premium resize-none"
            />
          </Section>

          <Section title="Especificaciones técnicas" desc="Lista de características que aparecen en la ficha del producto.">
            <SpecsEditor initial={specs} onChange={setSpecs} />
          </Section>

          {isEdit && (
            <Section title="Imágenes" desc="La primera imagen marcada como principal será la que se muestre en el catálogo.">
              <ProductImagesEditor productId={product.id} initial={images} />
            </Section>
          )}
        </div>

        <aside className="space-y-3">
          <Section title="Categoría y slot" desc="">
            <Label>Categoría *</Label>
            <select
              {...register('category_id', { required: true })}
              className="w-full h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm focus:outline-none focus:border-white transition-colors duration-300 ease-premium"
            >
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Label className="mt-3">Slot del configurador</Label>
            <select
              {...register('component_slot_id')}
              className="w-full h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm focus:outline-none focus:border-white transition-colors duration-300 ease-premium"
            >
              <option value="">Sin slot (no es componente)</option>
              {componentSlots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-neutral-500 mt-1.5">Solo asignar a componentes individuales (CPU, mobo, RAM, etc).</p>
          </Section>

          <Section title="Precio y stock" desc="">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Precio (COP) *</Label>
                <Input type="number" min="0" step="1" {...register('price', { required: true, valueAsNumber: true })} />
              </div>
              <div>
                <Label>Precio tachado</Label>
                <Input type="number" min="0" step="1" {...register('compare_price', { valueAsNumber: true })} placeholder="Opcional" />
              </div>
              <div className="col-span-2">
                <Label>Stock *</Label>
                <Input type="number" min="0" step="1" {...register('stock', { required: true, valueAsNumber: true })} />
              </div>
            </div>
          </Section>

          <Section title="Configuración" desc="">
            <Label>Tags (separados por coma)</Label>
            <Input {...register('tags')} placeholder="gaming, oferta, mid-range" />

            <div className="mt-4 space-y-2">
              <Toggle
                active={isActive}
                onChange={(v) => setValue('is_active', v)}
                label="Producto activo"
                desc="Visible en el catálogo público"
              />
              <Toggle
                active={isFeatured}
                onChange={(v) => setValue('is_featured', v)}
                label="Producto destacado"
                desc="Aparece en la home"
              />
            </div>
            <input type="hidden" {...register('is_active')} />
            <input type="hidden" {...register('is_featured')} />
          </Section>
        </aside>
      </div>
    </form>
  )
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold">{title}</h2>
        {desc && <p className="text-[11px] text-neutral-500 mt-0.5">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1.5 ${className}`}>{children}</label>
}

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  const { className, ...rest } = props
  return (
    <input
      ref={ref}
      {...rest}
      className={`w-full h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-white transition-colors duration-300 ease-premium ${className ?? ''}`}
    />
  )
})

function Toggle({ active, onChange, label, desc }: { active: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-300 ease-premium ${
        active ? 'border-white bg-black/[0.03]' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div className={`shrink-0 mt-0.5 w-9 h-5 rounded-full transition-colors duration-300 ${active ? 'bg-black' : 'bg-neutral-300'} relative`}>
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-neutral-900 transition-all duration-300 ease-premium ${active ? 'left-4' : 'left-0.5'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-neutral-500 leading-snug mt-0.5">{desc}</div>
      </div>
    </button>
  )
}
