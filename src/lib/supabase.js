import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Supabase config:', {
    url: supabaseUrl ? 'Set' : 'Not set',
    key: supabaseAnonKey ? 'Set' : 'Not set'
})

// Create a fallback client for build time
const createSupabaseClient = () => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Supabase environment variables not configured, using fallback client')
        // Return a mock client for build time
        return createClient(
            'https://placeholder.supabase.co',
            'placeholder-key',
            {
                auth: {
                    persistSession: false
                }
            }
        )
    }
    
    return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()
