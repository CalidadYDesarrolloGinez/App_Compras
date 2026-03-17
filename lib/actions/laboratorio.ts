'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './auth'

// Estatus IDs (from DB)
const ESTATUS = {
    PENDIENTE: '73211ac5-f72f-4bb4-a837-6af7d3c83a84',
    CONFIRMADO: '03131b53-1583-418e-a2c5-063e0b8da339',
    EN_TRANSITO: '0c2eb04f-72a2-461b-a548-131fba4436a7',
    EN_REVISION: '3b007332-171b-4e1f-b4b2-bc2e2c9f2227',
    LIBERADO: 'aff5374c-2786-4f3e-964b-8b1b43a77e95',
    RECHAZADO: 'da0e4ff9-a5b5-4d23-abcb-2e80a17671b2',
}

const ELIGIBLE_FOR_REVISION = [ESTATUS.PENDIENTE, ESTATUS.CONFIRMADO, ESTATUS.EN_TRANSITO]

export async function iniciarRevision(requisicionId: string) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    console.log('[Lab] iniciarRevision - profile:', profile?.rol, profile?.id)

    if (!profile || profile.rol !== 'laboratorio') {
        console.error('[Lab] Permiso denegado:', profile?.rol)
        return { error: 'Solo laboratorio puede iniciar revisión' }
    }

    // Verify current status is eligible
    const { data: req, error: fetchError } = await supabase
        .from('requisiciones')
        .select('estatus_id')
        .eq('id', requisicionId)
        .single()

    console.log('[Lab] Requisición actual:', { req, fetchError })

    if (!req || !ELIGIBLE_FOR_REVISION.includes(req.estatus_id)) {
        console.error('[Lab] Estatus no elegible:', req?.estatus_id)
        return { error: 'Esta requisición no puede pasar a revisión desde su estatus actual' }
    }

    const { error, data, count } = await supabase
        .from('requisiciones')
        .update({ estatus_id: ESTATUS.EN_REVISION })
        .eq('id', requisicionId)
        .select()

    console.log('[Lab] Update result:', { error, data, count })

    if (error) {
        console.error('[Lab] Update error:', error)
        return { error: error.message }
    }

    // Audit trail (non-blocking, table may not exist)
    try {
        await supabase.from('requisiciones_historial').insert({
            requisicion_id: requisicionId,
            campo_modificado: 'Estatus',
            valor_anterior: 'Anterior',
            valor_nuevo: 'En Revisión',
            usuario_id: profile.id,
        })
    } catch (e) {
        console.warn('[Lab] Historial insert failed (non-critical):', e)
    }

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { success: true }
}


export async function uploadLabEvidencia(
    requisicionId: string,
    formData: FormData
) {
    const supabase = await createClient()
    const profile = await getCurrentProfile()

    if (!profile || profile.rol !== 'laboratorio') {
        return { error: 'Solo laboratorio puede subir evidencias' }
    }

    // Verify status is En Revisión
    const { data: req } = await supabase
        .from('requisiciones')
        .select('estatus_id')
        .eq('id', requisicionId)
        .single()

    if (!req || req.estatus_id !== ESTATUS.EN_REVISION) {
        return { error: 'Solo se pueden subir evidencias cuando el estatus es "En Revisión"' }
    }

    const file = formData.get('foto') as File
    const notas = formData.get('notas') as string
    const resultado = formData.get('resultado') as 'liberado' | 'rechazado'

    if (!file || !file.size) return { error: 'Debe subir una foto' }
    if (!resultado) return { error: 'Debe seleccionar un resultado' }

    // Upload file to storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${requisicionId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('lab-evidencias')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (uploadError) return { error: 'Error al subir la foto: ' + uploadError.message }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('lab-evidencias')
        .getPublicUrl(fileName)

    // Insert evidencia record
    const { error: insertError } = await supabase.from('lab_evidencias').insert({
        requisicion_id: requisicionId,
        foto_url: urlData.publicUrl,
        notas: notas || null,
        resultado,
        usuario_id: profile.id,
    })

    if (insertError) return { error: 'Error al guardar evidencia: ' + insertError.message }

    // Update status based on resultado
    const newEstatus = resultado === 'liberado' ? ESTATUS.LIBERADO : ESTATUS.RECHAZADO
    const newEstatusName = resultado === 'liberado' ? 'Liberado' : 'Rechazado'

    const { error: updateError } = await supabase
        .from('requisiciones')
        .update({ estatus_id: newEstatus })
        .eq('id', requisicionId)

    if (updateError) return { error: 'Error al actualizar estatus: ' + updateError.message }

    // Audit trail
    await supabase.from('requisiciones_historial').insert({
        requisicion_id: requisicionId,
        campo_modificado: 'Estatus',
        valor_anterior: 'En Revisión',
        valor_nuevo: newEstatusName,
        usuario_id: profile.id,
    })

    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/requisiciones')
    return { success: true }
}

export async function getLabEvidencias(requisicionId: string) {
    const supabase = await createClient()

    // Fetch evidencias without the auto-join (FK points to auth.users, not profiles)
    const { data: evidencias, error } = await supabase
        .from('lab_evidencias')
        .select('*')
        .eq('requisicion_id', requisicionId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    if (!evidencias || evidencias.length === 0) return { data: [] }

    // Get unique user IDs and fetch their profiles
    const userIds = [...new Set(evidencias.map(e => e.usuario_id))]
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nombre_completo, rol')
        .in('id', userIds)

    // Map profiles by ID for quick lookup
    const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
    )

    // Enrich evidencias with profile data
    const enriched = evidencias.map(ev => ({
        ...ev,
        profiles: profileMap.get(ev.usuario_id) || null,
    }))

    return { data: enriched }
}
