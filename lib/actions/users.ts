'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types'
import { revalidatePath } from 'next/cache'

// ============================================================
// Helpers
// ============================================================

async function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

// ============================================================
// Queries
// ============================================================

export async function getPendingUsers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('rol', 'pendiente')
        .order('created_at', { ascending: false })

    return { data, error: error?.message }
}

export async function getActiveUsers() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('rol', 'in', '("pendiente")')
        .order('created_at', { ascending: false })

    return { data, error: error?.message }
}

// ============================================================
// Mutations
// ============================================================

export async function approveUser(userId: string, newRole: UserRole) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('profiles')
        .update({ rol: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

    revalidatePath('/dashboard/admin')
    return { error: error?.message }
}

export async function rejectUser(userId: string) {
    // Need admin client to delete auth user
    const adminClient = await getAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    revalidatePath('/dashboard/admin')
    return { error: error?.message }
}

export async function deleteUser(userId: string) {
    const adminClient = await getAdminClient()
    const { error } = await adminClient.auth.admin.deleteUser(userId)

    revalidatePath('/dashboard/admin')
    return { error: error?.message }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('profiles')
        .update({ rol: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

    revalidatePath('/dashboard/admin')
    return { error: error?.message }
}

export async function updateProfile(data: { nombre_completo: string }) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { error: 'No autenticado' }

    const { error } = await supabase
        .from('profiles')
        .update({ nombre_completo: data.nombre_completo, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    revalidatePath('/dashboard/configuracion')
    return { error: error?.message }
}

export async function changePassword(newPassword: string) {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: error?.message }
}
