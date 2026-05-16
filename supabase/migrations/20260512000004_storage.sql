-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/avif']),
  ('admin-uploads', 'admin-uploads', false, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/avif'])
ON CONFLICT (id) DO NOTHING;

-- Public read policy for product-images bucket
CREATE POLICY "public_read_product_images_storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Service role can write to both buckets (admin operations)
CREATE POLICY "service_role_write_storage"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR auth.role() = 'authenticated'
  );

CREATE POLICY "service_role_update_storage"
  ON storage.objects FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

CREATE POLICY "service_role_delete_storage"
  ON storage.objects FOR DELETE
  USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
