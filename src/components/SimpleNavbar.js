'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SimpleNavbar() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const navigation = [
        { name: 'Dashboard', href: '/', current: true },
        { name: 'Products', href: '/products', current: false },
        { name: 'Billing', href: '/billing', current: false },
        { name: 'Reports', href: '/reports', current: false },
        { name: 'AI Insights', href: '/ai', current: false },
        { name: 'Import', href: '/import', current: false },
    ]

    if (status === 'loading') {
        return (
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Business Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    if (!session) {
        return (
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">Business Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="btn-primary"
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-semibold text-gray-900">Business Dashboard</h1>
                        <div className="hidden md:flex space-x-4">
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        item.current
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">
                            Welcome, {session.user?.name || session.user?.email}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth/login' })}
                            className="btn-secondary text-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
