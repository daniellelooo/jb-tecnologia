-- ============================================================
-- SELLERS — Vendedores con tasa de comisión y canal de venta
-- ============================================================

CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text,
  commission_rate numeric(5,2) NOT NULL DEFAULT 3.00
    CHECK (commission_rate >= 0 AND commission_rate <= 100),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS seller_id uuid REFERENCES sellers(id) ON DELETE SET NULL;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sale_channel text NOT NULL DEFAULT 'web'
    CHECK (sale_channel IN ('web','pos','whatsapp'));

-- Índice para consultas de rendimiento por vendedor
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_sale_channel ON orders(sale_channel);

-- Datos de ejemplo (se pueden borrar en producción)
INSERT INTO sellers (name, email, commission_rate) VALUES
  ('Carlos Ríos',       'carlos@jbtecnologia.local',    3.5),
  ('Valentina López',   'valentina@jbtecnologia.local',  3.5),
  ('Andrés Muñoz',      'andres@jbtecnologia.local',     3.0)
ON CONFLICT DO NOTHING;
