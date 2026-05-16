-- ============================================================
-- generate_order_number(): MPC-YYYY-NNNN sequential per year
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  current_year int;
  next_num int;
BEGIN
  current_year := EXTRACT(YEAR FROM now())::int;
  SELECT COALESCE(MAX(SUBSTRING(order_number FROM '\d+$')::int), 0) + 1
    INTO next_num
    FROM orders
    WHERE order_number LIKE 'MPC-' || current_year || '-%';
  RETURN 'MPC-' || current_year || '-' || LPAD(next_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- create_order_with_items(): atomic order + items + stock decrement
-- ============================================================
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_customer_id_number text,
  p_delivery_type text,
  p_delivery_address text,
  p_delivery_neighborhood text,
  p_subtotal numeric,
  p_delivery_fee numeric,
  p_total numeric,
  p_payment_method text,
  p_notes text,
  p_build_id uuid,
  p_items jsonb
)
RETURNS jsonb AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_item jsonb;
  v_product products%ROWTYPE;
  v_qty int;
BEGIN
  -- Generate order number
  v_order_number := generate_order_number();

  -- Insert order
  INSERT INTO orders (
    order_number, customer_name, customer_phone, customer_email, customer_id_number,
    delivery_type, delivery_address, delivery_neighborhood,
    subtotal, delivery_fee, total, payment_method, notes, build_id, status
  ) VALUES (
    v_order_number, p_customer_name, p_customer_phone, p_customer_email, p_customer_id_number,
    p_delivery_type, p_delivery_address, p_delivery_neighborhood,
    p_subtotal, p_delivery_fee, p_total, p_payment_method, p_notes, p_build_id, 'pendiente'
  ) RETURNING id INTO v_order_id;

  -- Insert items and decrement stock atomically
  FOR v_item IN SELECT jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::int;
    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::uuid FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto no encontrado: %', v_item->>'product_id';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Stock insuficiente para %: solo quedan % unidades', v_product.name, v_product.stock;
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, unit_price, subtotal)
    VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.sku,
      v_qty,
      (v_item->>'unit_price')::numeric,
      (v_item->>'unit_price')::numeric * v_qty
    );

    UPDATE products SET stock = stock - v_qty WHERE id = v_product.id;
  END LOOP;

  -- Initial status history entry
  INSERT INTO order_status_history (order_id, status, note, changed_by)
  VALUES (v_order_id, 'pendiente', 'Pedido creado por el cliente', 'cliente');

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_order_with_items(text, text, text, text, text, text, text, numeric, numeric, numeric, text, text, uuid, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION generate_order_number() TO anon, authenticated, service_role;
