-- ============================================================
-- LIMPIEZA DE IMÁGENES — solo product shots profesionales
-- ============================================================
-- Reemplaza las imágenes inconsistentes/random (fotos en
-- estación de tren, archivos en chino/polaco/alemán) por una
-- sola imagen profesional por categoría. Repetir es aceptable.
-- ============================================================

-- CPUs (8) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AMD_Ryzen_9_7900X.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000001');

-- Motherboards (6) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Asus-ROG-Strix-Z390-F-Gaming-Motherboard_20201120_DSC6025.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000002');

-- RAM (6) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/16_GiB-DDR4-RAM-Riegel_RAM019FIX_Small_Crop_90_PCNT.png?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000003');

-- Storage (5) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/1TB_2280_NVME_SSD.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000004');

-- GPUs (7) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/RTX_3090_Founders_Edition.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000005');

-- PSU (4) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ATX_Computer_power_supply_unit.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000006');

-- Cases (4) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Computer_case_-_Full_Tower.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000007');

-- Cooling (4) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/CPU-cooler-14_hg.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE component_slot_id = 'a1000000-0000-0000-0000-000000000008');

-- ============================================================
-- Productos sin component_slot_id (periféricos, monitores, laptops, chairs, prebuilts)
-- Los actualizamos por categoría
-- ============================================================

-- Monitores (b1...003) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/NEC_MONITOR_E2206XG.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000003');

-- Portátiles (b1...002) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/MSI_Gaming_Laptop_on_wood_floor.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000002');

-- Teclados (b1...041) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Razer_BlackWidow_Ultimate_2014_Elite_Mechanical_Gaming_Keyboard.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000041');

-- Mouse (b1...042) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Logitech_MX518_Gaming_Mouse_%284777334208%29.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000042');

-- Headsets (b1...043) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Afterglow_AGU.1_Wireless_Headphones.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000043');

-- Webcams (b1...044) → 1 product shot limpio
UPDATE product_images
  SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Webcam_%28Logitech_c922%29.jpg?width=800'
WHERE product_id IN (SELECT id FROM products WHERE category_id = 'b1000000-0000-0000-0000-000000000044');

-- ============================================================
-- Prebuilt PCs JB (5) — estos sí tenían fotos profesionales únicas,
-- las dejamos pero reasignamos para asegurarnos que cada PC tiene
-- una foto distinta (la migración anterior estaba bien).
-- ============================================================
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2493-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-bronze-edition');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2505-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-silver-edition');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2511-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-gold-edition');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2520-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-workstation-pro');
UPDATE product_images SET storage_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gaming-PC_20240426_HOF2508-HDR_RAW-Export.png?width=800'
  WHERE product_id = (SELECT id FROM products WHERE slug = 'jb-ruby-gaming');
