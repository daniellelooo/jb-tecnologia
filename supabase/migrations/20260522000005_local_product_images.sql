-- ============================================================
-- IMÁGENES DE PRODUCTO LOCALES (profesionales, sin telefonazos)
-- ============================================================
-- Reemplaza las URLs externas (Wikimedia) por imágenes
-- profesionales descargadas localmente a public/products/.
-- Estas son fotos product-shot oficiales del catálogo de
-- Newegg (Razer, Logitech, Corsair, NVIDIA FE, etc.).
-- ============================================================

-- ============================================================
-- CPUs (8) — alternamos Intel/AMD según marca
-- ============================================================
UPDATE product_images SET storage_url = '/products/cpu-intel.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000001' AND brand = 'Intel');
UPDATE product_images SET storage_url = '/products/cpu-amd.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000001' AND brand = 'AMD');

-- ============================================================
-- Motherboards (6)
-- ============================================================
UPDATE product_images SET storage_url = '/products/motherboard.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000002');

-- ============================================================
-- RAM (6)
-- ============================================================
UPDATE product_images SET storage_url = '/products/ram.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000003');

-- ============================================================
-- Storage (5)
-- ============================================================
UPDATE product_images SET storage_url = '/products/storage.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000004');

-- ============================================================
-- GPUs (7)
-- ============================================================
UPDATE product_images SET storage_url = '/products/gpu.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000005');

-- ============================================================
-- PSU (4)
-- ============================================================
UPDATE product_images SET storage_url = '/products/psu.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000006');

-- ============================================================
-- Cases (4)
-- ============================================================
UPDATE product_images SET storage_url = '/products/case.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000007');

-- ============================================================
-- Cooling (4)
-- ============================================================
UPDATE product_images SET storage_url = '/products/cooling.webp'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000008');

-- ============================================================
-- Monitores (b1...003) — alterno LG/Samsung
-- ============================================================
UPDATE product_images SET storage_url = '/products/monitor.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000003');

-- Monitores LG específicamente con foto LG
UPDATE product_images SET storage_url = '/products/monitor-lg.webp'
WHERE product_id IN (SELECT id FROM products p WHERE p.category_id = 'b1000000-0000-0000-0000-000000000003' AND p.brand = 'LG');

-- ============================================================
-- Portátiles (b1...002)
-- ============================================================
UPDATE product_images SET storage_url = '/products/laptop.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000002');

-- ============================================================
-- Teclados (b1...041)
-- ============================================================
UPDATE product_images SET storage_url = '/products/keyboard.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000041');

-- ============================================================
-- Mouse (b1...042) — Razer DeathAdder por defecto, Logitech para products Logitech
-- ============================================================
UPDATE product_images SET storage_url = '/products/mouse.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000042');

UPDATE product_images SET storage_url = '/products/mouse-logitech.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000042' AND brand = 'Logitech');

-- ============================================================
-- Headsets (b1...043)
-- ============================================================
UPDATE product_images SET storage_url = '/products/headset.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000043');

-- ============================================================
-- Webcams (b1...044)
-- ============================================================
UPDATE product_images SET storage_url = '/products/webcam.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000044');

-- ============================================================
-- Sillas Gaming (b1...006)
-- ============================================================
UPDATE product_images SET storage_url = '/products/chair.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000006');

-- ============================================================
-- Mousepads (b1...045)
-- ============================================================
UPDATE product_images SET storage_url = '/products/mousepad.webp'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000045');

-- ============================================================
-- Prebuilt PCs JB (5) — fotos únicas reales de gaming desktops
-- ============================================================
UPDATE product_images SET storage_url = '/products/pc-bronze.webp'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-bronze-edition');
UPDATE product_images SET storage_url = '/products/pc-silver.webp'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-silver-edition');
UPDATE product_images SET storage_url = '/products/pc-gold.webp'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-gold-edition');
UPDATE product_images SET storage_url = '/products/pc-workstation.webp'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-workstation-pro');
UPDATE product_images SET storage_url = '/products/pc-ruby.webp'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-ruby-gaming');
