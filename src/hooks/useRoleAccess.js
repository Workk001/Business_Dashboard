'use client'

import { useBusiness } from '@/context/BusinessContext'

export const useRoleAccess = () => {
    const { userRole } = useBusiness()

    const permissions = {
        // Product permissions
        canViewProducts: ['owner', 'staff', 'accountant'].includes(userRole),
        canCreateProducts: ['owner', 'staff'].includes(userRole),
        canEditProducts: ['owner', 'staff'].includes(userRole),
        canDeleteProducts: ['owner'].includes(userRole),

        // Bill permissions
        canViewBills: ['owner', 'staff', 'accountant'].includes(userRole),
        canCreateBills: ['owner', 'staff'].includes(userRole),
        canEditBills: ['owner', 'staff'].includes(userRole),
        canDeleteBills: ['owner'].includes(userRole),

        // Business permissions
        canViewBusiness: ['owner', 'staff', 'accountant'].includes(userRole),
        canManageBusiness: ['owner'].includes(userRole),
        canManageMembers: ['owner'].includes(userRole),

        // Reports permissions
        canViewReports: ['owner', 'accountant'].includes(userRole),
        canExportData: ['owner', 'accountant'].includes(userRole),

        // Settings permissions
        canManageSettings: ['owner'].includes(userRole),
        canViewSettings: ['owner', 'staff', 'accountant'].includes(userRole)
    }

    const hasPermission = (permission) => {
        return permissions[permission] || false
    }

    const hasAnyPermission = (permissionList) => {
        return permissionList.some(permission => permissions[permission])
    }

    const hasAllPermissions = (permissionList) => {
        return permissionList.every(permission => permissions[permission])
    }

    return {
        userRole,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions
    }
}
