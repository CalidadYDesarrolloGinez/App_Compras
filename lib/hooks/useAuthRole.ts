'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types'
import type { User } from '@supabase/supabase-js'

interface UseAuthRoleReturn {
    user: User | null
    profile: Profile | null
    role: UserRole | null
    isAdmin: boolean
    isCoordinadora: boolean
    isLaboratorio: boolean
    isCedis: boolean
    isPendiente: boolean
    isConsulta: boolean
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canViewOnly: boolean
    canManageUsers: boolean
    canAccessAdmin: boolean
    loading: boolean
}

export function useAuthRole(): UseAuthRoleReturn {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchUserAndProfile() {
            setLoading(true)
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser()

                setUser(user)

                if (user) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    setProfile(profileData)
                }
            } catch (error) {
                console.error('Error fetching auth/role:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserAndProfile()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (!session) setProfile(null)
            else fetchUserAndProfile()
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const role = profile?.rol ?? null
    const isAdmin = role === 'admin'
    const isCoordinadora = role === 'coordinadora'
    const isLaboratorio = role === 'laboratorio'
    const isCedis = role === 'cedis'
    const isPendiente = role === 'pendiente'
    const isConsulta = role === 'consulta'

    const canCreate = isAdmin || isCoordinadora
    const canEdit = isAdmin || isCoordinadora
    const canDelete = isAdmin
    const canViewOnly = isLaboratorio || isCedis || isConsulta
    const canManageUsers = isAdmin || isCoordinadora
    const canAccessAdmin = isAdmin || isCoordinadora

    return {
        user,
        profile,
        role,
        isAdmin,
        isCoordinadora,
        isLaboratorio,
        isCedis,
        isPendiente,
        isConsulta,
        canCreate,
        canEdit,
        canDelete,
        canViewOnly,
        canManageUsers,
        canAccessAdmin,
        loading,
    }
}
