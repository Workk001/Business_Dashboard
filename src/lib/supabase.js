import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Supabase config:', {
    url: supabaseUrl ? 'Set' : 'Not set',
    key: supabaseAnonKey ? 'Set' : 'Not set'
})

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase environment variables not configured!')
    throw new Error('Supabase environment variables not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
