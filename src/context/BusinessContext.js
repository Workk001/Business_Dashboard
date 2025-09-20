'use client'

import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

const BusinessContext = createContext()

export const BusinessProvider = ({ children }) => {
    const [businesses, setBusinesses] = useState([])
    const [currentBusiness, setCurrentBusiness] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [loading, setLoading] = useState(true)

    // Fetch user's businesses
    const fetchUserBusinesses = useCallback(async (userId) => {
        try {
            console.log('🔍 Fetching businesses for user ID:', userId)
            console.log('🔍 User ID type:', typeof userId)
            console.log('🔍 User ID length:', userId?.length)
            setLoading(true)
            
            const { data, error } = await supabase
                .from('business_members')
                .select(`
                    business_id,
                    role,
                    businesses (
                        id,
                        name,
                        type,
                        description,
                        currency,
                        timezone,
                        created_at
                    )
                `)
                .eq('user_id', userId)
                .eq('is_active', true)

            console.log('🔍 Business members query result:', { data, error })

            if (error) {
                console.error('❌ Error fetching business members:', error)
                console.error('❌ Error details:', JSON.stringify(error, null, 2))
                // Don't throw the error, just log it and continue
                setBusinesses([])
                return
            }

            const businessList = data.map(item => ({
                ...item.businesses,
                role: item.role
            }))

            console.log('🔍 Processed business list:', businessList)
            setBusinesses(businessList)
            
            // Set first business as current if none selected
            if (businessList.length > 0 && !currentBusiness) {
                setCurrentBusiness(businessList[0])
                setUserRole(businessList[0].role)
            } else {
                console.log('🔍 No businesses found for user')
            }

        } catch (error) {
            console.error('❌ Error fetching businesses:', error)
            console.error('❌ Error details:', JSON.stringify(error, null, 2))
            // Don't throw the error, just log it and continue
            // Set empty businesses array to prevent loading issues
            setBusinesses([])
        } finally {
            setLoading(false)
        }
    }, [currentBusiness])

    // Create a new business
    const createBusiness = async (businessData, userId) => {
        try {
            const { data, error } = await supabase
                .from('businesses')
                .insert({
                    ...businessData,
                    created_by: userId
                })
                .select()
                .single()

            if (error) throw error

            // Refresh businesses list
            await fetchUserBusinesses(userId)
            
            return { data, error: null }
        } catch (error) {
            console.error('Error creating business:', error)
            return { data: null, error }
        }
    }

    // Switch current business
    const switchBusiness = (business) => {
        setCurrentBusiness(business)
        setUserRole(business.role)
    }

    // Add member to business
    const addBusinessMember = async (businessId, userEmail, role) => {
        try {
            // First, get the user by email
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', userEmail)
                .single()

            if (userError) throw userError

            // Add user as business member
            const { data, error } = await supabase
                .from('business_members')
                .insert({
                    business_id: businessId,
                    user_id: user.id,
                    role: role
                })

            if (error) throw error

            return { data, error: null }
        } catch (error) {
            console.error('Error adding business member:', error)
            return { data: null, error }
        }
    }

    const value = {
        businesses,
        currentBusiness,
        userRole,
        loading,
        fetchUserBusinesses,
        createBusiness,
        switchBusiness,
        addBusinessMember
    }

    return (
        <BusinessContext.Provider value={value}>
            {children}
        </BusinessContext.Provider>
    )
}

export const useBusiness = () => {
    const context = useContext(BusinessContext)
    if (!context) {
        throw new Error('useBusiness must be used within a BusinessProvider')
    }
    return context
}
