#!/usr/bin/env tsx
/**
 * Bootstrap script to create the single admin user for the local Supabase project.
 * Run with: npx tsx scripts/create-admin.ts
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Parse .env.local manually (no extra deps)
const envPath = resolve(process.cwd(), '.env.local')
const envText = readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@jbtecnologia.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'jbtecnologia2026'

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers()
  const found = existing.users.find((u) => u.email === ADMIN_EMAIL)

  if (found) {
    console.log(`Admin user already exists: ${ADMIN_EMAIL} (id: ${found.id})`)
    // Update password and metadata
    await supabase.auth.admin.updateUserById(found.id, {
      password: ADMIN_PASSWORD,
      user_metadata: { role: 'admin', full_name: 'JB Tecnología Admin' },
      email_confirm: true,
    })
    console.log('Password and metadata updated.')
    return
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { role: 'admin', full_name: 'JB Tecnología Admin' },
  })

  if (error) {
    console.error('Failed to create admin user:', error.message)
    process.exit(1)
  }

  console.log(`Admin user created: ${ADMIN_EMAIL} (id: ${data.user.id})`)
  console.log(`Password: ${ADMIN_PASSWORD}`)
  console.log('\nLog in at /admin/login')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
