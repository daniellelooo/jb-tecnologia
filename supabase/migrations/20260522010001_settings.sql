-- ============================================================
-- SETTINGS — key/value store editable desde el panel admin
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

INSERT INTO settings (key, value) VALUES
  ('meta_pixel_id',         ''),
  ('ga4_measurement_id',    ''),
  ('whatsapp_phone',        ''),
  ('default_delivery_fee',  '0')
ON CONFLICT (key) DO NOTHING;

-- Lectura pública (no expone secretos, solo IDs de tracking + datos de contacto)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage settings"
  ON settings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
