-- ============================================================
-- REBRAND MPC → JB Tecnología (limpieza de la marca anterior)
-- ============================================================
-- Renombra los 5 PCs prebuilt, ajusta brand, slug y SKU,
-- corrige imagen de Gold (que tenía foto del equipo de MPC)
-- y cambia el prefijo de order_number de MPC- a JB-.
-- ============================================================

-- 1. Productos prebuilt: nombre, slug, SKU, brand
UPDATE products SET
  name = 'JB Bronze Edition',
  slug = 'jb-bronze-edition',
  sku  = 'JB-BRONZE-01',
  brand = 'JB Tecnología',
  short_description = 'PC gaming de entrada: Ryzen 5 5600X + GTX 1650 + 16GB DDR4 + 500GB NVMe.',
  description = 'La JB Bronze Edition es la puerta de entrada al PC gaming. Ensamblada y probada por los técnicos de JB Tecnología, incluye garantía de 6 meses en mano de obra y 1 año en componentes. Perfecta para gaming 1080p en títulos populares.'
WHERE id = 'd1000000-0000-0000-0000-000000000001';

UPDATE products SET
  name = 'JB Silver Edition',
  slug = 'jb-silver-edition',
  sku  = 'JB-SILVER-01',
  brand = 'JB Tecnología',
  short_description = 'PC gaming media gama: i5-13600K + RTX 3060 + 16GB DDR4 + 1TB NVMe.',
  description = 'La JB Silver Edition representa el punto dulce del gaming moderno. Con el i5-13600K y RTX 3060, conquista 1080p Ultra y 1440p High en los títulos más exigentes. Ensamblada y optimizada por JB Tecnología con garantía completa.'
WHERE id = 'd1000000-0000-0000-0000-000000000002';

UPDATE products SET
  name = 'JB Gold Edition',
  slug = 'jb-gold-edition',
  sku  = 'JB-GOLD-01',
  brand = 'JB Tecnología',
  short_description = 'PC gaming entusiasta: Ryzen 7 7700X + RTX 4070 + 32GB DDR5 + 1TB NVMe Gen4.',
  description = 'La JB Gold Edition es para los gamers serios. Plataforma AM5 de última generación con Ryzen 7 7700X y RTX 4070, domina 1440p con frames altísimos y gaming 4K DLSS 3. La inversión que dura 5+ años.'
WHERE id = 'd1000000-0000-0000-0000-000000000003';

UPDATE products SET
  name = 'JB Workstation Pro',
  slug = 'jb-workstation-pro',
  sku  = 'JB-WS-PRO-01',
  brand = 'JB Tecnología',
  short_description = 'Workstation profesional: i7-14700K + RTX 3060 + 64GB DDR4 + 2TB NVMe.',
  description = 'La JB Workstation Pro está diseñada para profesionales creativos. El i7-14700K con 64GB de RAM maneja edición de video 4K, render 3D y diseño gráfico profesional con fluidez. Garantía extendida disponible.'
WHERE id = 'd1000000-0000-0000-0000-000000000004';

UPDATE products SET
  name = 'JB Ruby Gaming',
  slug = 'jb-ruby-gaming',
  sku  = 'JB-RUBY-01',
  brand = 'JB Tecnología',
  short_description = 'PC gaming de alto rendimiento: i5-13600K + RTX 4070 + 32GB DDR4 + 1TB SSD.',
  description = 'La JB Ruby combina el procesador gaming más equilibrado del mercado con la GPU de nueva generación RTX 4070. Gaming 1440p a tasa máxima y 4K DLSS 3, con 32GB de RAM para streaming simultáneo sin compromisos.'
WHERE id = 'd1000000-0000-0000-0000-000000000005';

-- 2. Imagen de Gold Edition: tenía foto del equipo MPC, la cambiamos
--    a la misma imagen de case del Bronze (placeholder hasta que suban foto real).
UPDATE product_images
  SET storage_url = 'https://static.wixstatic.com/media/cf9b63_d22f0ed1ab434415be13f4a97a007e66~mv2.png',
      alt_text = 'JB Gold Edition'
  WHERE product_id = 'd1000000-0000-0000-0000-000000000003';

UPDATE product_images SET alt_text = 'JB Bronze Edition'      WHERE product_id = 'd1000000-0000-0000-0000-000000000001';
UPDATE product_images SET alt_text = 'JB Silver Edition'      WHERE product_id = 'd1000000-0000-0000-0000-000000000002';
UPDATE product_images SET alt_text = 'JB Workstation Pro'     WHERE product_id = 'd1000000-0000-0000-0000-000000000004';
UPDATE product_images SET alt_text = 'JB Ruby Gaming'         WHERE product_id = 'd1000000-0000-0000-0000-000000000005';

-- 3. Order number generator: prefijo MPC- → JB-
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
    WHERE order_number LIKE 'JB-' || current_year || '-%'
       OR order_number LIKE 'MPC-' || current_year || '-%';
  RETURN 'JB-' || current_year || '-' || LPAD(next_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;
