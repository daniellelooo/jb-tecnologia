export function buildWhatsAppProductMessage(product: { name: string; sku: string }): string {
  return `Hola JB Tecnología, estoy interesado en el ${product.name} — SKU: ${product.sku}. ¿Está disponible?`
}

export function buildWhatsAppUrl(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573001234567'
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
