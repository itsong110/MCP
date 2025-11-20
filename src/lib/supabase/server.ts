import { createClient } from '@supabase/supabase-js'

const getSupabaseEnv = () => {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return { supabaseUrl, supabaseKey }
}

// Server-side client with service role (fallback to anon key)
export const createServerClient = () => {
  const { supabaseUrl, supabaseKey } = getSupabaseEnv()

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  })
}

