import nodemailer from 'nodemailer'

// ============================================================
// Transporter — Gmail SMTP
// Variables requeridas en .env.local:
//   GMAIL_USER=tucorreo@gmail.com
//   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  (App Password de Google)
//   ADMIN_NOTIFY_EMAIL=tucorreo@gmail.com   (a quién llegan las notificaciones)
// ============================================================
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// ============================================================
// Helpers de formato
// ============================================================
function formatCOP(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo_en_tienda: 'Efectivo en tienda',
  transferencia: 'Transferencia bancaria',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  contraentrega: 'Contraentrega',
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo_para_retiro: 'Listo para retiro',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

// ============================================================
// Plantilla base HTML
// ============================================================
function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>JB Tecnología MED</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F7;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0C1014;border-radius:16px 16px 0 0;padding:28px 32px;">
          <p style="margin:0;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">JB Tecnología MED</p>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.45);font-size:11px;">Centro Comercial Monterrey · El Poblado · Medellín</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">© 2026 JB Tecnología MED · Todos los derechos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ============================================================
// 1. Notificación al ADMIN — pedido nuevo
// ============================================================
interface OrderNotifyData {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string | null
  deliveryType: string
  deliveryAddress?: string | null
  paymentMethod: string
  total: number
  items: { product_name: string; quantity: number; unit_price: number; total_price: number }[]
  notes?: string | null
  adminUrl?: string
}

export async function sendAdminNewOrderEmail(data: OrderNotifyData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('[email] GMAIL_USER o GMAIL_APP_PASSWORD no configurados — correo omitido')
    return
  }

  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${i.product_name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;font-weight:600;">${formatCOP(Number(i.total_price))}</td>
    </tr>`).join('')

  const content = `
    <!-- Alerta -->
    <div style="background:#0C1014;border-radius:10px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <span style="font-size:24px;">🛍️</span>
      <div>
        <p style="margin:0;color:#ffffff;font-size:15px;font-weight:700;">Nuevo pedido recibido</p>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:12px;font-family:monospace;">${data.orderNumber}</p>
      </div>
    </div>

    <!-- Info cliente -->
    <h3 style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;">Cliente</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f9f9f9;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #eee;"><b>Nombre</b></td><td style="padding:10px 16px;font-size:13px;">${data.customerName}</td></tr>
      <tr><td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #eee;"><b>Teléfono</b></td><td style="padding:10px 16px;font-size:13px;">${data.customerPhone}</td></tr>
      ${data.customerEmail ? `<tr><td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #eee;"><b>Email</b></td><td style="padding:10px 16px;font-size:13px;">${data.customerEmail}</td></tr>` : ''}
      <tr><td style="padding:10px 16px;font-size:13px;color:#333;border-bottom:1px solid #eee;"><b>Entrega</b></td><td style="padding:10px 16px;font-size:13px;">${data.deliveryType === 'retiro_en_tienda' ? '🏪 Retiro en tienda' : `🚚 Domicilio — ${data.deliveryAddress ?? ''}`}</td></tr>
      <tr><td style="padding:10px 16px;font-size:13px;color:#333;"><b>Pago</b></td><td style="padding:10px 16px;font-size:13px;">${PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod}</td></tr>
    </table>

    <!-- Productos -->
    <h3 style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;">Productos</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #f0f0f0;">
      <thead><tr style="background:#f5f5f5;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Producto</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Cant.</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Total -->
    <div style="background:#0C1014;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <span style="color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;">TOTAL</span>
      <span style="color:#ffffff;font-size:22px;font-weight:700;">${formatCOP(data.total)}</span>
    </div>

    ${data.notes ? `<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-bottom:24px;font-size:13px;color:#92400e;"><b>Nota del cliente:</b> ${data.notes}</div>` : ''}

    <!-- CTA -->
    ${data.adminUrl ? `<div style="text-align:center;"><a href="${data.adminUrl}" style="display:inline-block;background:#0C1014;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:100px;font-size:13px;font-weight:600;">Ver pedido en el admin →</a></div>` : ''}
  `

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"JB Tecnología MED" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_NOTIFY_EMAIL ?? process.env.GMAIL_USER,
    subject: `🛍️ Nuevo pedido ${data.orderNumber} — ${data.customerName}`,
    html: baseTemplate(content),
  })
}

// ============================================================
// 2. Confirmación al CLIENTE
// ============================================================
interface CustomerConfirmData {
  orderNumber: string
  customerName: string
  customerEmail: string
  deliveryType: string
  paymentMethod: string
  total: number
  items: { product_name: string; quantity: number; total_price: number }[]
}

export async function sendCustomerConfirmationEmail(data: CustomerConfirmData) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return
  if (!data.customerEmail) return

  const itemRows = data.items.map((i) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;">${i.product_name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right;font-weight:600;">${formatCOP(Number(i.total_price))}</td>
    </tr>`).join('')

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0C1014;">¡Gracias por tu compra, ${data.customerName.split(' ')[0]}! 🎉</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.6;">Recibimos tu pedido y estamos procesándolo. Te contactaremos pronto para coordinar.</p>

    <div style="background:#f9f9f9;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;">Número de pedido</p>
      <p style="margin:6px 0 0;font-size:20px;font-weight:700;font-family:monospace;color:#0C1014;">${data.orderNumber}</p>
    </div>

    <h3 style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888;">Tu pedido</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #f0f0f0;">
      <thead><tr style="background:#f5f5f5;">
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Producto</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;color:#888;">Cant.</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;color:#888;">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="background:#0C1014;border-radius:10px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
      <span style="color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;">TOTAL</span>
      <span style="color:#ffffff;font-size:22px;font-weight:700;">${formatCOP(data.total)}</span>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f9f9f9;border-radius:10px;overflow:hidden;">
      <tr><td style="padding:10px 16px;font-size:13px;border-bottom:1px solid #eee;"><b>Entrega:</b></td><td style="padding:10px 16px;font-size:13px;">${data.deliveryType === 'retiro_en_tienda' ? '🏪 Retiro en tienda — C.C. Monterrey, El Poblado' : '🚚 Envío a domicilio'}</td></tr>
      <tr><td style="padding:10px 16px;font-size:13px;"><b>Pago:</b></td><td style="padding:10px 16px;font-size:13px;">${PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod}</td></tr>
    </table>

    <div style="background:#f0fdf4;border-left:3px solid #22c55e;padding:14px 16px;border-radius:6px;margin-bottom:24px;font-size:13px;color:#166534;line-height:1.6;">
      ¿Tienes preguntas? Escríbenos por WhatsApp al <b>+57 318 245 5186</b> o responde este correo.
    </div>
  `

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"JB Tecnología MED" <${process.env.GMAIL_USER}>`,
    to: data.customerEmail,
    subject: `✅ Pedido ${data.orderNumber} confirmado — JB Tecnología MED`,
    html: baseTemplate(content),
  })
}

// ============================================================
// 3. Notificación cambio de estado al cliente
// ============================================================
export async function sendOrderStatusEmail(data: {
  orderNumber: string
  customerName: string
  customerEmail: string
  status: string
  notes?: string
}) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return
  if (!data.customerEmail) return

  const statusLabel = STATUS_LABELS[data.status] ?? data.status
  const emoji: Record<string, string> = {
    confirmado: '✅', en_preparacion: '📦', listo_para_retiro: '🏪',
    enviado: '🚚', entregado: '🎉', cancelado: '❌',
  }
  const icon = emoji[data.status] ?? '📋'

  const content = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0C1014;">${icon} Tu pedido fue actualizado</h2>
    <p style="margin:0 0 24px;color:#666;font-size:14px;">Hola ${data.customerName.split(' ')[0]}, hay una actualización en tu pedido.</p>

    <div style="background:#0C1014;border-radius:10px;padding:20px 24px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Estado actual</p>
      <p style="margin:10px 0 0;color:#ffffff;font-size:24px;font-weight:700;">${icon} ${statusLabel}</p>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:12px;font-family:monospace;">${data.orderNumber}</p>
    </div>

    ${data.notes ? `<div style="background:#fffbeb;border-left:3px solid #f59e0b;padding:12px 16px;border-radius:6px;margin-bottom:24px;font-size:13px;color:#92400e;line-height:1.6;"><b>Nota:</b> ${data.notes}</div>` : ''}

    <div style="background:#f9f9f9;border-radius:10px;padding:14px 16px;font-size:13px;color:#555;line-height:1.6;">
      ¿Tienes alguna pregunta? Contáctanos por WhatsApp al <b>+57 318 245 5186</b>.
    </div>
  `

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"JB Tecnología MED" <${process.env.GMAIL_USER}>`,
    to: data.customerEmail,
    subject: `${icon} Pedido ${data.orderNumber} — ${statusLabel}`,
    html: baseTemplate(content),
  })
}
