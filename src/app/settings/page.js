'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import SimpleNavbar from '@/components/SimpleNavbar'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState({
        theme: 'light',
        language: 'en',
        currency: 'USD',
        timezone: 'UTC',
        notifications: {
            email: true,
            push: true,
            sms: false
        }
    })
    const [businesses, setBusinesses] = useState([])
    const [currentBusiness, setCurrentBusiness] = useState(null)
    const [showBusinessForm, setShowBusinessForm] = useState(false)
    const [businessForm, setBusinessForm] = useState({
        name: '',
        description: '',
        industry: '',
        website: '',
        phone: '',
        address: ''
    })

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login')
        } else if (status === 'authenticated') {
            loadBusinesses()
            setLoading(false)
        }
    }, [status, router])

    const loadBusinesses = async () => {
        try {
            const { data, error } = await supabase
                .from('business_members')
                .select(`
                    business_id,
                    role,
                    businesses (
                        id,
                        name,
                        description,
                        industry,
                        website,
                        phone,
                        address,
                        created_at
                    )
                `)
                .eq('user_id', session.user.id)
                .eq('is_active', true)

            if (error) throw error

            const businessList = data.map(item => ({
                ...item.businesses,
                role: item.role
            }))

            setBusinesses(businessList)
            if (businessList.length > 0) {
                setCurrentBusiness(businessList[0])
            }
        } catch (error) {
            console.error('Error loading businesses:', error)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Save settings logic here
        console.log('Saving settings:', settings)
        alert('Settings saved successfully!')
    }

    const handleCreateBusiness = async (e) => {
        e.preventDefault()
        try {
            // Create business
            const businessData = {
                name: businessForm.name,
                description: businessForm.description,
                industry: businessForm.industry,
                website: businessForm.website,
                phone: businessForm.phone,
                address: businessForm.address ? { street: businessForm.address } : {},
                type: 'business', // Add the required type field
                created_by: session.user.id
            }
            
            console.log('Creating business with data:', businessData)
            
            const { data: business, error: businessError } = await supabase
                .from('businesses')
                .insert(businessData)
                .select()
                .single()

            if (businessError) {
                console.error('Supabase business creation error:', businessError)
                throw businessError
            }

            // Add user as business member
            const memberData = {
                business_id: business.id,
                user_id: session.user.id,
                role: 'owner',
                is_active: true
            }
            
            console.log('Creating business member with data:', memberData)
            
            const { error: memberError } = await supabase
                .from('business_members')
                .insert(memberData)

            if (memberError) {
                console.error('Supabase business member creation error:', memberError)
                throw memberError
            }

            // Reset form and reload
            setBusinessForm({
                name: '',
                description: '',
                industry: '',
                website: '',
                phone: '',
                address: ''
            })
            setShowBusinessForm(false)
            loadBusinesses()
            alert('Business created successfully!')
        } catch (error) {
            console.error('Error creating business:', error)
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                stack: error.stack
            })
            
            // Show more detailed error message
            const errorMessage = error.message || 'Unknown error occurred'
            const errorDetails = error.details ? `\nDetails: ${error.details}` : ''
            const errorHint = error.hint ? `\nHint: ${error.hint}` : ''
            
            alert(`Error creating business: ${errorMessage}${errorDetails}${errorHint}\n\nPlease check the console for more details.`)
        }
    }

    const handleUpdateBusiness = async (e) => {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('businesses')
                .update({
                    name: businessForm.name,
                    description: businessForm.description,
                    industry: businessForm.industry,
                    website: businessForm.website,
                    phone: businessForm.phone,
                    address: businessForm.address ? { street: businessForm.address } : {}
                    // Note: type field is not updated as it shouldn't change
                })
                .eq('id', currentBusiness.id)

            if (error) throw error

            setShowBusinessForm(false)
            loadBusinesses()
            alert('Business updated successfully!')
        } catch (error) {
            console.error('Error updating business:', error)
            alert('Error updating business: ' + error.message)
        }
    }

    const handleChange = (field, value) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.')
            setSettings({
                ...settings,
                [parent]: {
                    ...settings[parent],
                    [child]: value
                }
            })
        } else {
            setSettings({
                ...settings,
                [field]: value
            })
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <SimpleNavbar />
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                            <div className="space-y-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="card">
                                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                        <div className="space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!session) {
        return null // Will redirect
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SimpleNavbar />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="mt-2 text-gray-600">Manage your account and application preferences</p>
                    </div>

                    {/* Business Management */}
                    <div className="card mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Business Management</h2>
                            <button
                                onClick={() => {
                                    setShowBusinessForm(true)
                                    setCurrentBusiness(null)
                                    setBusinessForm({
                                        name: '',
                                        description: '',
                                        industry: '',
                                        website: '',
                                        phone: '',
                                        address: ''
                                    })
                                }}
                                className="btn-primary"
                            >
                                {businesses.length === 0 ? 'Create Business' : 'Add Business'}
                            </button>
                        </div>

                        {businesses.length === 0 ? (
                            <div className="text-center py-8">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No businesses found</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by creating your first business.</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowBusinessForm(true)}
                                        className="btn-primary"
                                    >
                                        Create Your First Business
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {businesses.map((business) => (
                                    <div key={business.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-medium text-gray-900">{business.name}</h3>
                                                <p className="text-sm text-gray-500">{business.description}</p>
                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Industry: {business.industry || 'Not specified'}</span>
                                                    <span>Role: {business.role}</span>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setCurrentBusiness(business)
                                                        setBusinessForm({
                                                            name: business.name,
                                                            description: business.description || '',
                                                            industry: business.industry || '',
                                                            website: business.website || '',
                                                            phone: business.phone || '',
                                                            address: business.address || ''
                                                        })
                                                        setShowBusinessForm(true)
                                                    }}
                                                    className="btn-secondary text-sm"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Business Form Modal */}
                    {showBusinessForm && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                                <div className="mt-3">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        {currentBusiness ? 'Edit Business' : 'Create New Business'}
                                    </h3>
                                    <form onSubmit={currentBusiness ? handleUpdateBusiness : handleCreateBusiness}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Business Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={businessForm.name}
                                                    onChange={(e) => setBusinessForm({...businessForm, name: e.target.value})}
                                                    className="input-field"
                                                    placeholder="Enter business name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={businessForm.description}
                                                    onChange={(e) => setBusinessForm({...businessForm, description: e.target.value})}
                                                    className="input-field"
                                                    rows={3}
                                                    placeholder="Brief description of your business"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Industry
                                                </label>
                                                <select
                                                    value={businessForm.industry}
                                                    onChange={(e) => setBusinessForm({...businessForm, industry: e.target.value})}
                                                    className="input-field"
                                                >
                                                    <option value="">Select industry</option>
                                                    <option value="retail">Retail</option>
                                                    <option value="restaurant">Restaurant</option>
                                                    <option value="manufacturing">Manufacturing</option>
                                                    <option value="services">Services</option>
                                                    <option value="technology">Technology</option>
                                                    <option value="healthcare">Healthcare</option>
                                                    <option value="education">Education</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Website
                                                </label>
                                                <input
                                                    type="url"
                                                    value={businessForm.website}
                                                    onChange={(e) => setBusinessForm({...businessForm, website: e.target.value})}
                                                    className="input-field"
                                                    placeholder="https://example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={businessForm.phone}
                                                    onChange={(e) => setBusinessForm({...businessForm, phone: e.target.value})}
                                                    className="input-field"
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Address
                                                </label>
                                                <textarea
                                                    value={businessForm.address}
                                                    onChange={(e) => setBusinessForm({...businessForm, address: e.target.value})}
                                                    className="input-field"
                                                    rows={2}
                                                    placeholder="Business address"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => setShowBusinessForm(false)}
                                                className="btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn-primary"
                                            >
                                                {currentBusiness ? 'Update Business' : 'Create Business'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Profile Settings */}
                        <div className="card">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={session.user?.name?.split(' ')[0] || ''}
                                        className="input-field"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={session.user?.name?.split(' ').slice(1).join(' ') || ''}
                                        className="input-field"
                                        disabled
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={session.user?.email || ''}
                                        className="input-field"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Application Settings */}
                        <div className="card">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Theme
                                    </label>
                                    <select
                                        value={settings.theme}
                                        onChange={(e) => handleChange('theme', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Language
                                    </label>
                                    <select
                                        value={settings.language}
                                        onChange={(e) => handleChange('language', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency
                                    </label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => handleChange('currency', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="CAD">CAD (C$)</option>
                                        <option value="AUD">AUD (A$)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Timezone
                                    </label>
                                    <select
                                        value={settings.timezone}
                                        onChange={(e) => handleChange('timezone', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time</option>
                                        <option value="America/Chicago">Central Time</option>
                                        <option value="America/Denver">Mountain Time</option>
                                        <option value="America/Los_Angeles">Pacific Time</option>
                                        <option value="Europe/London">London</option>
                                        <option value="Europe/Paris">Paris</option>
                                        <option value="Asia/Tokyo">Tokyo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="card">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.email}
                                            onChange={(e) => handleChange('notifications.email', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                                        <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.push}
                                            onChange={(e) => handleChange('notifications.push', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.sms}
                                            onChange={(e) => handleChange('notifications.sms', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button type="submit" className="btn-primary">
                                Save Settings
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}