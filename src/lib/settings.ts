import { createAdminClient } from '@/lib/supabase/admin'

export type SettingKey =
  | 'meta_pixel_id'
  | 'ga4_measurement_id'
  | 'whatsapp_phone'
  | 'default_delivery_fee'

export type SettingsMap = Record<SettingKey, string>

export const SETTING_KEYS: SettingKey[] = [
  'meta_pixel_id',
  'ga4_measurement_id',
  'whatsapp_phone',
  'default_delivery_fee',
]

export async function getSettings(): Promise<SettingsMap> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('settings').select('key, value')
  const map: SettingsMap = {
    meta_pixel_id: '',
    ga4_measurement_id: '',
    whatsapp_phone: '',
    default_delivery_fee: '0',
  }
  for (const row of data ?? []) {
    if (SETTING_KEYS.includes(row.key as SettingKey)) {
      map[row.key as SettingKey] = row.value ?? ''
    }
  }
  return map
}
