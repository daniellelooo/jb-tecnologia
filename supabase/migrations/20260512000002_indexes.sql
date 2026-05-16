-- GIN index for JSONB specs (compatibility queries: socket, ram_type, form_factor)
CREATE INDEX idx_products_specs ON products USING gin(specs);

-- Standard btree indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slot ON products(component_slot_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_tags ON products USING gin(tags);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id) WHERE is_primary = true;

CREATE INDEX idx_pc_builds_session ON pc_builds(session_id);
CREATE INDEX idx_pc_builds_status ON pc_builds(status);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_phone ON orders(customer_phone);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
