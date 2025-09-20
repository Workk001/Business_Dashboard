'use client'

import { SessionProvider } from 'next-auth/react'
import { UserProvider } from '@/context/UserContext'
import { BusinessProvider } from '@/context/BusinessContext'
import { SettingsProvider } from '@/context/SettingsContext'

export default function ClientProviders({ children }) {
    return (
        <SessionProvider>
            <UserProvider>
                <BusinessProvider>
                    <SettingsProvider>
                        {children}
                    </SettingsProvider>
                </BusinessProvider>
            </UserProvider>
        </SessionProvider>
    )
}
