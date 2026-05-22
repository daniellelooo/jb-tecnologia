import { getSettings } from '@/lib/settings'
import { ConfigClient } from './config-client'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const settings = await getSettings()
  return <ConfigClient initial={settings} />
}
