-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text,
  image_url text,
  display_order int NOT NULL DEFAULT 0,
  is_active bool NOT NULL DEFAULT true
);

-- ============================================================
-- COMPONENT SLOTS (static — 8 rows, seeded separately)
-- ============================================================
CREATE TABLE component_slots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_required bool NOT NULL DEFAULT false,
  display_order int NOT NULL,
  help_text text NOT NULL DEFAULT ''
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sku text UNIQUE NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id),
  component_slot_id uuid REFERENCES component_slots(id),
  brand text NOT NULL,
  model text NOT NULL,
  price numeric(12,2) NOT NULL,
  compare_price numeric(12,2),
  stock int NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  specs jsonb NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  is_active bool NOT NULL DEFAULT true,
  is_featured bool NOT NULL DEFAULT false,
  weight_g int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_primary bool NOT NULL DEFAULT false,
  alt_text text
);

-- ============================================================
-- PC BUILDS (configurator sessions)
-- ============================================================
CREATE TABLE pc_builds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id text NOT NULL,
  use_case text,
  budget_hint text,
  cpu_id uuid REFERENCES products(id),
  motherboard_id uuid REFERENCES products(id),
  ram_id uuid REFERENCES products(id),
  storage_id uuid REFERENCES products(id),
  gpu_id uuid REFERENCES products(id),
  psu_id uuid REFERENCES products(id),
  case_id uuid REFERENCES products(id),
  cooling_id uuid REFERENCES products(id),
  total_price numeric(12,2) NOT NULL DEFAULT 0,
  compatibility_issues jsonb NOT NULL DEFAULT '[]',
  is_compatible bool NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','requested','ordered')),
  customer_name text,
  customer_phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CARTS
-- ============================================================
CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_add numeric(12,2) NOT NULL,
  build_id uuid REFERENCES pc_builds(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_id_number text,
  delivery_type text NOT NULL CHECK (delivery_type IN ('retiro_en_tienda','domicilio_medellin')),
  delivery_address text,
  delivery_neighborhood text,
  subtotal numeric(12,2) NOT NULL,
  delivery_fee numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('efectivo_en_tienda','transferencia','nequi','daviplata','contraentrega')),
  payment_reference text,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','confirmado','en_preparacion','listo_para_retiro','enviado','entregado','cancelado')),
  notes text,
  build_id uuid REFERENCES pc_builds(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ORDER ITEMS (snapshot at purchase time)
-- ============================================================
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  product_sku text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL,
  subtotal numeric(12,2) NOT NULL
);

-- ============================================================
-- ORDER STATUS HISTORY
-- ============================================================
CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by text NOT NULL DEFAULT 'system'
);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
