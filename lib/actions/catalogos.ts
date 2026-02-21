'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './auth'

export async function createCatalogEntry(table: string, data: any) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || !['admin', 'coordinadora'].includes(profile.rol)) {
        return { error: 'No tienes permisos para modificar catálogos' }
    }

    const { data: result, error } = await supabase
        .from(table)
        .insert({
            ...data,
            activo: true
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/dashboard/catalogos')
    // Also revalidate pages that use these catalogs
    revalidatePath('/dashboard/requisiciones')
    revalidatePath('/dashboard/requisiciones/nueva')

    return { data: result }
}

export async function updateCatalogEntry(table: string, id: string, data: any) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || !['admin', 'coordinadora'].includes(profile.rol)) {
        return { error: 'No tienes permisos para modificar catálogos' }
    }

    const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/dashboard/catalogos')
    return { data: result }
}

export async function toggleCatalogStatus(table: string, id: string, active: boolean) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || !['admin', 'coordinadora'].includes(profile.rol)) {
        return { error: 'No tienes permisos para modificar catálogos' }
    }

    const { error } = await supabase
        .from(table)
        .update({ activo: active })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/catalogos')
    return { success: true }
}

export async function deleteCatalogEntry(table: string, id: string) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || !['admin'].includes(profile.rol)) {
        return { error: 'Solo los administradores pueden eliminar registros permanentemente' }
    }

    const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

    if (error) {
        if (error.code === '23503') {
            return { error: 'No se puede eliminar porque está siendo utilizado en requisiciones existentas. Intente desactivarlo en su lugar.' }
        }
        return { error: error.message }
    }

    revalidatePath('/dashboard/catalogos')
    return { success: true }
}
