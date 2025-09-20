import '@/styles/globals.css'
import ClientProviders from '@/components/ClientProviders'

export const metadata = {
    title: 'Business Dashboard',
    description: 'Simple business management dashboard',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-gray-50">
                <ClientProviders>
                    {children}
                </ClientProviders>
            </body>
        </html>
    )
}