'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './auth'

// Estatus IDs (from DB)
const ESTATUS = {
    PENDIENTE: '73211ac5-f72f-4bb4-a837-6af7d3c83a84',
    CONFIRMADO: '03131b53-1583-418e-a2c5-063e0b8da339',
    EN_TRANSITO: '0c2eb04f-72a2-461b-a548-131fba4436a7',
    LIBERADO: 'aff5374c-2786-4f3e-964b-8b1b43a77e95',
    RECHAZADO: 'da0e4ff9-a5b5-4d23-abcb-2e80a17671b2',
    RECIBIDO: 'd58c275f-7723-43d9-b11a-c6d3a53feab1',
    DEVOLUCION: 'b7d1ab0f-73cb-4a45-bbe6-6493ee47cacb',
}

const ALLOWED_WITH_INSPECTION = [ESTATUS.LIBERADO]
const ALLOWED_WITHOUT_INSPECTION = [ESTATUS.PENDIENTE, ESTATUS.CONFIRMADO, ESTATUS.EN_TRANSITO, ESTATUS.LIBERADO]

export async function confirmarRecepcion(requisicionId: string) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || profile.rol !== 'cedis') {
        return { error: 'Solo CEDIS puede confirmar recepción' }
    }

    // Get requisicion with product info
    const { data: req } = await supabase
        .from('requisiciones')
        .select('estatus_id, producto_id, producto:productos(requiere_inspeccion)')
        .eq('id', requisicionId)
        .single()

    if (!req) return { error: 'Requisición no encontrada' }

    const requiereInspeccion = (req.producto as any)?.requiere_inspeccion !== false
    const allowedStatuses = requiereInspeccion ? ALLOWED_WITH_INSPECTION : ALLOWED_WITHOUT_INSPECTION

    if (!allowedStatuses.includes(req.estatus_id)) {
        return { error: requiereInspeccion
            ? 'Solo se puede confirmar recepción de materiales liberados'
            : 'El estatus actual no permite confirmar recepción'
        }
    }

    // Get previous status name for audit
    const { data: estatusAnterior } = await supabase
        .from('estatus')
        .select('nombre')
        .eq('id', req.estatus_id)
        .single()

    const { error } = await supabase
        .from('requisiciones')
        .update({
            estatus_id: ESTATUS.RECIBIDO,
        })
        .eq('id', requisicionId)

    if (error) return { error: error.message }

    // Audit trail (non-blocking)
    try {
        await supabase.from('requisiciones_historial').insert({
            requisicion_id: requisicionId,
            campo_modificado: 'Estatus',
            valor_anterior: estatusAnterior?.nombre || 'Desconocido',
            valor_nuevo: 'Recibido',
            usuario_id: profile.id,
        })
    } catch {}

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { success: true }
}

export async function confirmarDevolucion(requisicionId: string) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || profile.rol !== 'cedis') {
        return { error: 'Solo CEDIS puede confirmar devoluciones' }
    }

    // Verify status is Rechazado
    const { data: req } = await supabase
        .from('requisiciones')
        .select('estatus_id')
        .eq('id', requisicionId)
        .single()

    if (!req || req.estatus_id !== ESTATUS.RECHAZADO) {
        return { error: 'Solo se puede confirmar devolución de materiales rechazados' }
    }

    const { error } = await supabase
        .from('requisiciones')
        .update({ estatus_id: ESTATUS.DEVOLUCION })
        .eq('id', requisicionId)

    if (error) return { error: error.message }

    // Audit trail
    await supabase.from('requisiciones_historial').insert({
        requisicion_id: requisicionId,
        campo_modificado: 'Estatus',
        valor_anterior: 'Rechazado',
        valor_nuevo: 'Devolución',
        usuario_id: profile.id,
    })

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { success: true }
}
