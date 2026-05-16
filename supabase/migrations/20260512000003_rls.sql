-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pc_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: categories (active only)
CREATE POLICY "public_read_active_categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- PUBLIC READ: component_slots (all)
CREATE POLICY "public_read_slots"
  ON component_slots FOR SELECT
  USING (true);

-- PUBLIC READ: active products
CREATE POLICY "public_read_active_products"
  ON products FOR SELECT
  USING (is_active = true);

-- PUBLIC READ: product images
CREATE POLICY "public_read_product_images"
  ON product_images FOR SELECT
  USING (true);

-- PC BUILDS: anonymous session-based access
CREATE POLICY "anyone_insert_builds"
  ON pc_builds FOR INSERT
  WITH CHECK (true);

CREATE POLICY "anyone_read_builds"
  ON pc_builds FOR SELECT
  USING (true);

CREATE POLICY "anyone_update_builds"
  ON pc_builds FOR UPDATE
  USING (true);

-- CARTS: public session-based management
CREATE POLICY "public_manage_carts"
  ON carts FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_manage_cart_items"
  ON cart_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- ORDERS: public insert (customers submit), public read (for order status page)
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_read_orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "public_insert_order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "public_read_order_items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "public_read_order_status_history"
  ON order_status_history FOR SELECT
  USING (true);

CREATE POLICY "public_insert_order_status_history"
  ON order_status_history FOR INSERT
  WITH CHECK (true);

-- NOTE: service_role bypasses RLS entirely — used by admin panel for full CRUD
