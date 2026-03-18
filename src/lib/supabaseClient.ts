import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/** Public URL for a cover image in Storage (post-images/covers/). Use when Supabase is configured so all visitors can see images. */
export function getStorageCoverUrl(filename: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined
  if (base) return `${base}/storage/v1/object/public/post-images/covers/${filename}`
  return `/covers/${filename}`
}

