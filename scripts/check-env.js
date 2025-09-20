#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Run this script to verify all required environment variables are set
 */

const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
]

const optionalEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
]

console.log('🔍 Checking environment variables...\n')

let hasErrors = false

// Check required variables
console.log('📋 Required Variables:')
requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
        console.log(`✅ ${varName}: Set`)
    } else {
        console.log(`❌ ${varName}: Missing`)
        hasErrors = true
    }
})

console.log('\n📋 Optional Variables:')
optionalEnvVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
        console.log(`✅ ${varName}: Set`)
    } else {
        console.log(`⚠️  ${varName}: Not set (optional)`)
    }
})

console.log('\n' + '='.repeat(50))

if (hasErrors) {
    console.log('❌ Some required environment variables are missing!')
    console.log('Please set the missing variables and try again.')
    process.exit(1)
} else {
    console.log('✅ All required environment variables are set!')
    console.log('Your app should work correctly.')
}

// Additional checks
console.log('\n🔧 Additional Checks:')

// Check if Supabase URL looks valid
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL might be incorrect (should contain "supabase.co")')
}

// Check if NextAuth URL looks valid
const nextAuthUrl = process.env.NEXTAUTH_URL
if (nextAuthUrl && !nextAuthUrl.startsWith('http')) {
    console.log('⚠️  NEXTAUTH_URL should start with "http" or "https"')
}

console.log('\n🚀 Ready to deploy!')
