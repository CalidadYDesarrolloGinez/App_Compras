'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './auth'
import type { RequisicionFormData, RequisicionFilters } from '@/types'

export async function createRequisicion(data: RequisicionFormData) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || !['admin', 'coordinadora'].includes(profile.rol)) {
        return { error: 'No tienes permisos para crear requisiciones' }
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuario no autenticado' }

    const { data: result, error } = await supabase
        .from('requisiciones')
        .insert({
            ...data,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { data: result }
}

export async function updateRequisicion(
    id: string,
    data: Partial<RequisicionFormData>,
    camposModificados: Array<{ campo: string; anterior: string; nuevo: string }>
) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || !['admin', 'coordinadora'].includes(profile.rol)) {
        return { error: 'No tienes permisos para editar requisiciones' }
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuario no autenticado' }

    const { data: result, error } = await supabase
        .from('requisiciones')
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) return { error: error.message }

    // Write audit trail
    if (camposModificados.length > 0) {
        await supabase.from('requisiciones_historial').insert(
            camposModificados.map((c) => ({
                requisicion_id: id,
                campo_modificado: c.campo,
                valor_anterior: c.anterior,
                valor_nuevo: c.nuevo,
                usuario_id: user.id,
            }))
        )
    }

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { data: result }
}

export async function deleteRequisicion(id: string) {
    console.log('Iniciando eliminación de requisición:', id)
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    console.log('Perfil obtenido para eliminación:', profile)

    if (!profile || profile.rol !== 'admin') {
        console.error('Permiso denegado: el perfil no es admin o no existe')
        return { error: 'Solo el administrador puede eliminar requisiciones' }
    }

    // Delete history first to avoid foreign key constraints
    console.log('Eliminando historial para:', id)
    const historyResult = await supabase.from('requisiciones_historial').delete().eq('requisicion_id', id)
    if (historyResult.error) {
        console.error('Error al eliminar historial:', historyResult.error)
    }

    console.log('Eliminando requisición de la tabla principal...')
    const { error, count } = await supabase.from('requisiciones').delete().eq('id', id).select()

    console.log('Resultado de eliminación:', { error, count })

    if (error) {
        console.error('Error de base de datos al eliminar:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { success: true }
}

export async function getRequisiciones(filters?: RequisicionFilters) {
    const supabase = await createClient()

    let query = supabase
        .from('requisiciones')
        .select(
            `
      *,
      proveedor:proveedores(id, nombre),
      producto:productos(id, nombre),
      presentacion:presentaciones(id, nombre),
      destino:destinos(id, nombre),
      estatus:estatus(id, nombre, color_hex),
      unidad_cantidad:unidades(id, nombre, abreviatura)
    `
        )
        .order('fecha_recepcion', { ascending: true })

    if (filters?.proveedor_id) {
        query = query.eq('proveedor_id', filters.proveedor_id)
    }
    if (filters?.destino_id) {
        query = query.eq('destino_id', filters.destino_id)
    }
    if (filters?.estatus_id) {
        query = query.eq('estatus_id', filters.estatus_id)
    }
    if (filters?.fecha_desde) {
        query = query.gte('fecha_recepcion', filters.fecha_desde)
    }
    if (filters?.fecha_hasta) {
        query = query.lte('fecha_recepcion', filters.fecha_hasta)
    }

    const { data, error } = await query

    if (error) return { error: error.message }
    return { data: data ?? [] }
}

export async function getCatalogos() {
    const supabase = await createClient()

    const [proveedores, productos, presentaciones, destinos, estatus, unidades] =
        await Promise.all([
            supabase.from('proveedores').select('*').order('nombre'),
            supabase.from('productos').select('*').order('nombre'),
            supabase.from('presentaciones').select('*').order('nombre'),
            supabase.from('destinos').select('*').order('nombre'),
            supabase.from('estatus').select('*').order('nombre'),
            supabase.from('unidades').select('*').order('nombre'),
        ])

    return {
        proveedores: proveedores.data ?? [],
        productos: productos.data ?? [],
        presentaciones: presentaciones.data ?? [],
        destinos: destinos.data ?? [],
        estatus: estatus.data ?? [],
        unidades: unidades.data ?? [],
    }
}

export async function getHistorial(requisicionId?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('requisiciones_historial')
        .select(
            `
      *,
      profiles(id, nombre_completo, rol)
    `
        )
        .order('created_at', { ascending: false })

    if (requisicionId) {
        query = query.eq('requisicion_id', requisicionId)
    }

    const { data, error } = await query
    if (error) return { error: error.message }
    return { data: data ?? [] }
}
