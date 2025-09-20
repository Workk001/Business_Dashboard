import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabase } from '@/lib/supabase'

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            console.log('🔍 SignIn callback triggered:', { user, account, profile })
            
            if (account.provider === 'google') {
                try {
                    console.log('🔍 Google OAuth successful, user:', user.email)
                    
                    // TEMPORARY: Skip database operations to test OAuth
                    console.log('🔍 Skipping database operations for now...')
                    
                    // Check if Supabase is configured
                    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                        console.log('⚠️ Supabase not configured, but allowing sign in for testing')
                        return true
                    }
                    
                    console.log('🔍 Supabase configured, proceeding with database operations...')
                    
                    // Check if user exists in our database
                    const { data: existingUser, error: fetchError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .single()

                    console.log('🔍 Database check result:', { existingUser, fetchError })

                    if (fetchError && fetchError.code !== 'PGRST116') {
                        console.error('❌ Error checking user:', fetchError)
                        console.log('🔍 Allowing sign in despite database check error for debugging...')
                        return true
                    }

                    // If user doesn't exist, create them
                    if (!existingUser) {
                        console.log('🔍 Creating new user:', user.email)
                        
                        // Generate a UUID for the user since Google provides a numeric ID
                        const crypto = require('crypto')
                        const userId = crypto.randomUUID()
                        
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert({
                                id: userId,
                                email: user.email,
                                first_name: user.name?.split(' ')[0] || '',
                                last_name: user.name?.split(' ').slice(1).join(' ') || '',
                                avatar_url: user.image,
                                is_active: true,
                                last_login: new Date().toISOString()
                            })

                        console.log('🔍 User creation result:', { insertError })
                        console.log('🔍 Generated userId:', userId)
                        console.log('🔍 User data being inserted:', {
                            id: userId,
                            email: user.email,
                            first_name: user.name?.split(' ')[0] || '',
                            last_name: user.name?.split(' ').slice(1).join(' ') || '',
                            avatar_url: user.image,
                            is_active: true,
                            last_login: new Date().toISOString()
                        })

                        if (insertError) {
                            console.error('❌ Error creating user:', insertError)
                            console.log('🔍 Allowing sign in despite user creation error for debugging...')
                            return true
                        } else {
                            console.log('✅ User created successfully in database')
                        }

                        // Create default user settings
                        const { error: settingsError } = await supabase
                            .from('user_settings')
                            .insert({
                                user_id: userId,
                                theme: 'light',
                                language: 'en',
                                currency: 'USD',
                                timezone: 'UTC',
                                date_format: 'MM/DD/YYYY'
                            })

                        if (settingsError) {
                            console.error('Error creating user settings:', settingsError)
                        }
                    } else {
                        // Update last login for existing user
                        await supabase
                            .from('users')
                            .update({ last_login: new Date().toISOString() })
                            .eq('id', existingUser.id)
                    }

                    console.log('✅ User authentication successful')
                    // Store the UUID in the token for the session callback
                    return true
                } catch (error) {
                    console.error('❌ Error in signIn callback:', error)
                    console.log('🔍 Allowing sign in despite callback error for debugging...')
                    return true
                }
            }
            console.log('✅ Non-Google authentication successful')
            return true
        },
        async session({ session, token }) {
            console.log('🔍 Session callback triggered:', { session, token })
            
            if (session?.user?.email) {
                // Fetch user data from our database using email
                try {
                    console.log('🔍 Looking for user with email:', session.user.email)
                    
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('id, email, first_name, last_name, avatar_url, is_active')
                        .eq('email', session.user.email)
                        .single()

                    console.log('🔍 User data fetch result:', { userData, error })
                    
                    // Also try a simple count query to test database access
                    const { count, error: countError } = await supabase
                        .from('users')
                        .select('*', { count: 'exact', head: true })
                        .eq('email', session.user.email)
                    
                    console.log('🔍 User count query result:', { count, countError })

                    if (!error && userData) {
                        session.user = { ...session.user, ...userData }
                        console.log('✅ Session updated with user data:', userData)
                    } else {
                        console.log('⚠️ No user data found, using session data only')
                        console.log('🔍 This means the user lookup failed, but user exists in database')
                        console.log('🔍 Error details:', error)
                        // Set a temporary ID for the session if no user data found
                        if (!session.user.id) {
                            session.user.id = 'temp-' + Date.now()
                        }
                    }
                } catch (error) {
                    console.error('❌ Error fetching user data:', error)
                }
            } else {
                console.log('⚠️ No session or email found')
            }
            
            console.log('🔍 Final session:', session)
            return session
        },
        async jwt({ token, user, account }) {
            if (user) {
                // Store the Google user ID in token.googleId
                token.googleId = user.id
                // We'll set token.sub to the UUID in the signIn callback
            }
            return token
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error'
    },
    session: {
        strategy: 'jwt'
    }
})

export { handler as GET, handler as POST }
