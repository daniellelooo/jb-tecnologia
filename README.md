# JB Tecnología MED

E-commerce y configurador de PC para **JB Tecnología MED** — tienda especializada en
tecnología en el Centro Comercial Monterrey, El Poblado, Medellín.

Stack: **Next.js 14 (App Router)** · **TypeScript** · **Tailwind CSS** · **Supabase**
(Postgres + Auth + Storage) · **Zustand** · **shadcn/ui**.

---

## Setup rápido

### 1. Requisitos previos

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (corriendo)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
  - macOS: `brew install supabase/tap/supabase`
  - Linux/Windows: ver doc oficial

### 2. Clonar e instalar

```bash
git clone https://github.com/daniellelooo/jb-tecnologia.git
cd jb-tecnologia
npm install
cp .env.example .env.local
```

### 3. Levantar la base de datos

El proyecto usa **Supabase local** (Postgres + Auth + Storage + Studio) que se
orquesta como un stack de Docker. La forma canónica es la CLI de Supabase:

```bash
supabase start
```

Esto levanta ~12 contenedores y aplica automáticamente las migrations
(`supabase/migrations/`) más el seed (`supabase/seed.sql`).

URLs locales que expone:

| Servicio          | URL                          |
| ----------------- | ---------------------------- |
| API (Kong)        | http://127.0.0.1:54421       |
| Postgres          | postgresql://...:54422       |
| Studio (UI de BD) | http://127.0.0.1:54423       |
| Inbucket (emails) | http://127.0.0.1:54424       |

> **Nota:** Si solo necesitás Postgres (sin auth/storage/studio), existe un
> `docker-compose.yml` minimalista en la raíz con la BD aislada. Pero para
> usar la app completa hay que tener el stack de Supabase corriendo.

### 4. Crear el usuario admin

```bash
npx tsx scripts/create-admin.ts
```

Credenciales por defecto (sobrescribibles vía `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

- **Email:** `admin@jbtecnologia.local`
- **Password:** `jbtecnologia2026`

### 5. Levantar el dev server

```bash
npm run dev
```

App en [http://localhost:3000](http://localhost:3000) · Admin en
[http://localhost:3000/admin/login](http://localhost:3000/admin/login).

---

## Comandos útiles

```bash
# Detener el stack de Supabase (los datos persisten en volúmenes)
supabase stop

# Resetear la BD: borra datos, re-aplica migrations y seed
supabase db reset

# Aplicar cambios de schema a producción (cuando se conecte a Supabase Cloud)
supabase db push

# Logs de Postgres
docker logs supabase_db_jbtecnologiamed -f

# Build de producción
npm run build && npm start
```

---

## Estructura del proyecto

```
.
├── public/                  # Estáticos (logo, favicon)
├── scripts/
│   └── create-admin.ts      # Bootstrap del usuario admin
├── src/
│   ├── app/                 # Rutas (App Router)
│   │   ├── (shop)/          # Tienda pública
│   │   ├── admin/           # Panel admin protegido
│   │   └── api/             # Route handlers
│   ├── components/
│   │   ├── shop/            # UI de la tienda
│   │   ├── admin/           # UI del admin
│   │   └── configurator/    # Configurador de PC (slots, presets, etc.)
│   ├── lib/
│   │   ├── stores/          # Zustand (carrito, configurador)
│   │   ├── queries/         # Acceso a datos (Supabase)
│   │   └── configurator/    # Lógica de compatibilidad
│   └── types/               # Tipos generados de la BD
├── supabase/
│   ├── config.toml          # Config del stack local
│   ├── migrations/          # SQL versionado
│   └── seed.sql             # Datos demo (categorías, productos, etc.)
├── docker-compose.yml       # Postgres aislado (alternativa a supabase CLI)
├── .env.example             # Variables de entorno
└── README.md
```

---

## Features

- **Catálogo público** con búsqueda, filtros por categoría y por stock.
- **Configurador de PC** con:
  - 4 plantillas pre-armadas (Oficina, Gaming 1080p, Gaming 1440p, Workstation 4K).
  - Validación de compatibilidad en tiempo real (socket CPU↔mobo, RAM, form-factor, watts).
  - Calculadora de consumo con sugerencia de fuente mínima.
  - Resumen flotante con barra de progreso y total parcial.
- **Carrito + checkout** con flujo a WhatsApp o pago tradicional.
- **Panel admin** con:
  - Gestión de productos (CRUD, imágenes, stock inline).
  - Pedidos y builds.
  - Reporte de ventas exportable a CSV o PDF.

---

## Deploy a producción

El proyecto está pensado para deployar en **Vercel** con un **Supabase Cloud**
como BD. Pasos:

1. Crear proyecto en [supabase.com](https://supabase.com).
2. `supabase link --project-ref <ref>` y `supabase db push` para aplicar el schema.
3. Conectar el repo a Vercel y configurar las 3 env vars de Supabase + el WhatsApp.
4. Para los datos iniciales: correr `psql $DB_URL -f supabase/seed.sql` (opcional).
5. Crear el admin en producción con `npx tsx scripts/create-admin.ts` apuntando a las
   URLs/keys de producción.

---

## Licencia

Privado · JB Tecnología MED © 2026
