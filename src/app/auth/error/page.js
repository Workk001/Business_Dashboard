'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error) => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to sign in. This could be due to:',
          reasons: [
            'Your Google account is not added as a test user',
            'The OAuth app is in testing mode and your email is not whitelisted',
            'The OAuth consent screen is not properly configured',
            'The redirect URI is incorrect'
          ],
          solutions: [
            'Add your email to test users in Google Cloud Console',
            'Publish the OAuth app to allow all users',
            'Check the OAuth consent screen configuration',
            'Verify the redirect URI is exactly: http://localhost:3000/api/auth/callback/google'
          ]
        }
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There is a problem with the server configuration.',
          reasons: ['Missing environment variables', 'Incorrect OAuth configuration'],
          solutions: ['Check your .env.local file', 'Verify Google OAuth credentials']
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification token has expired or has already been used.',
          reasons: ['Token expired', 'Token already used', 'Invalid token'],
          solutions: ['Try signing in again', 'Clear browser cache', 'Check your email for new verification link']
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication.',
          reasons: ['Unknown error'],
          solutions: ['Try again', 'Check console for more details', 'Contact support if issue persists']
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {errorInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorInfo.message}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Possible Reasons:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {errorInfo.reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 mt-6">
            Solutions:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {errorInfo.solutions.map((solution, index) => (
              <li key={index}>{solution}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Home
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Error: {error || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
