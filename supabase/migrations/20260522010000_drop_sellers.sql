-- ============================================================
-- DROP SELLERS / POS — Se descontinúa el módulo de vendedores y punto de venta
-- ============================================================

DROP INDEX IF EXISTS idx_orders_seller_id;
DROP INDEX IF EXISTS idx_orders_sale_channel;

ALTER TABLE orders DROP COLUMN IF EXISTS seller_id;
ALTER TABLE orders DROP COLUMN IF EXISTS sale_channel;

DROP TABLE IF EXISTS sellers;
