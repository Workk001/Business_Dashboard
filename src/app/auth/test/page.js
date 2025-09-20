'use client'

import { signIn, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')

  const testGoogleAuth = async () => {
    try {
      setResult('Testing Google OAuth...')
      
      const result = await signIn('google', { 
        callbackUrl: '/',
        redirect: false 
      })
      
      setResult(JSON.stringify(result, null, 2))
    } catch (error) {
      setResult(`Error: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Google OAuth Test
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            This page helps debug Google OAuth issues
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Environment Variables Check:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
              <span>NEXTAUTH_URL: Server-side only (not accessible in client)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
              <span>NEXTAUTH_SECRET: Server-side only (not accessible in client)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
              <span>GOOGLE_CLIENT_ID: Server-side only (not accessible in client)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
              <span>GOOGLE_CLIENT_SECRET: Server-side only (not accessible in client)</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> These environment variables are server-side only and wont show in the client. 
              The fact that youre seeing this page means the server is running, but we need to check if the .env.local file exists.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Test Google OAuth:
          </h3>
              <div className="space-y-3">
                <button
                  onClick={testGoogleAuth}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Test Google Sign In
                </button>
                
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/test' })}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Result:
            </h3>
            <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="text-center">
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}
