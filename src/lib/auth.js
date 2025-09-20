// lib/auth.js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from './supabase'

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === 'google') {
                try {
                    // Check if user exists in our database
                    const { data: existingUser, error: fetchError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('email', user.email)
                        .single()

                    if (fetchError && fetchError.code !== 'PGRST116') {
                        console.error('Error checking user:', fetchError)
                        return false
                    }

                    // If user doesn't exist, create them
                    if (!existingUser) {
                        const { error: insertError } = await supabase
                            .from('users')
                            .insert({
                                id: user.id,
                                email: user.email,
                                first_name: user.name?.split(' ')[0] || '',
                                last_name: user.name?.split(' ').slice(1).join(' ') || '',
                                avatar_url: user.image,
                                is_active: true,
                                last_login: new Date().toISOString()
                            })

                        if (insertError) {
                            console.error('Error creating user:', insertError)
                            return false
                        }

                        // Create default user settings
                        const { error: settingsError } = await supabase
                            .from('user_settings')
                            .insert({
                                user_id: user.id,
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
                            .eq('id', user.id)
                    }

                    return true
                } catch (error) {
                    console.error('Error in signIn callback:', error)
                    return false
                }
            }
            return true
        },
        async session({ session, token }) {
            if (token.sub) {
                session.user.id = token.sub
                
                // Fetch user data from our database
                try {
                    const { data: userData, error } = await supabase
                        .from('users')
                        .select('id, email, first_name, last_name, avatar_url, is_active')
                        .eq('id', token.sub)
                        .single()

                    if (!error && userData) {
                        session.user = { ...session.user, ...userData }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
            }
            return session
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.sub = user.id
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
