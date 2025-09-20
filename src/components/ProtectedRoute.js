'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useRoleAccess } from '@/hooks/useRoleAccess'

export default function ProtectedRoute({ 
    children, 
    requiredPermissions = [], 
    fallback = null 
}) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { hasAnyPermission } = useRoleAccess()

    useEffect(() => {
        if (status === 'loading') return

        if (!session) {
            router.push('/auth/login')
            return
        }

        if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
            router.push('/')
            return
        }
    }, [session, status, router, requiredPermissions, hasAnyPermission])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
        return fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Access Denied
                    </h2>
                    <p className="text-gray-600">
                        You don&apos;t have permission to access this page
                    </p>
                </div>
            </div>
        )
    }

    return children
}
