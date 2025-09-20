'use client'

import { createContext, useState, useContext, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

const SettingsContext = createContext()

export const SettingsProvider = ({ children }) => {
    const { data: session } = useSession()
    const [settings, setSettings] = useState({
        theme: 'light',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        notifications: {
            email: true,
            push: false,
            lowStock: true,
            newBills: true
        }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (session?.user?.email) {
            fetchUserSettings()
        }
    }, [session])

    const fetchUserSettings = async () => {
        if (!session?.user?.email) {
            console.log('⚠️ No session or email in SettingsContext')
            return
        }

        console.log('🔍 Fetching user settings for email:', session.user.email)

        try {
            setLoading(true)
            // First get the user ID from the users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', session.user.email)
                .single()

            if (userError || !userData) {
                console.log('⚠️ User not found in database, skipping settings fetch')
                return
            }

            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userData.id)
                .single()

            console.log('🔍 User settings fetch result:', { data, error })

            if (error && error.code !== 'PGRST116') {
                console.error('❌ Error fetching user settings:', error)
                return
            }

            if (error && error.code === 'PGRST116') {
                console.log('ℹ️ No user settings found, using defaults')
            }

            if (data) {
                setSettings({
                    theme: data.theme || 'light',
                    language: data.language || 'en',
                    currency: data.currency || 'USD',
                    timezone: data.timezone || 'UTC',
                    dateFormat: data.date_format || 'MM/DD/YYYY',
                    notifications: data.notifications || {
                        email: true,
                        push: false,
                        lowStock: true,
                        newBills: true
                    }
                })
            }
        } catch (error) {
            console.error('Error fetching user settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateSettings = async (newSettings) => {
        if (!session?.user?.id) return

        try {
            const updatedSettings = { ...settings, ...newSettings }
            setSettings(updatedSettings)

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: session.user.id,
                    theme: updatedSettings.theme,
                    language: updatedSettings.language,
                    currency: updatedSettings.currency,
                    timezone: updatedSettings.timezone,
                    date_format: updatedSettings.dateFormat,
                    notifications: updatedSettings.notifications
                })

            if (error) {
                console.error('Error updating user settings:', error)
                // Revert settings on error
                setSettings(settings)
                throw error
            }
        } catch (error) {
            console.error('Error updating user settings:', error)
            throw error
        }
    }

    const updateTheme = (theme) => {
        updateSettings({ theme })
        // Apply theme to document
        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(theme)
        }
    }

    const updateCurrency = (currency) => {
        updateSettings({ currency })
    }

    const updateLanguage = (language) => {
        updateSettings({ language })
    }

    const updateTimezone = (timezone) => {
        updateSettings({ timezone })
    }

    const updateDateFormat = (dateFormat) => {
        updateSettings({ dateFormat })
    }

    const updateNotifications = (notifications) => {
        updateSettings({ notifications })
    }

    const value = {
        settings,
        loading,
        updateSettings,
        updateTheme,
        updateCurrency,
        updateLanguage,
        updateTimezone,
        updateDateFormat,
        updateNotifications
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
