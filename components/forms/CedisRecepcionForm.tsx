'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, PackageCheck, RotateCcw } from 'lucide-react'
import { confirmarRecepcion, confirmarDevolucion } from '@/lib/actions/cedis'

interface CedisRecepcionFormProps {
    requisicionId: string
    estatusNombre: string
    requiereInspeccion?: boolean
    onStatusChange?: () => void
}

export function CedisRecepcionForm({
    requisicionId,
    estatusNombre,
    requiereInspeccion = true,
    onStatusChange,
}: CedisRecepcionFormProps) {
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const lower = estatusNombre.toLowerCase()
    const isRechazado = lower === 'rechazado'
    const canReceive = requiereInspeccion
        ? lower === 'liberado'
        : ['pendiente', 'confirmado', 'en tránsito', 'liberado'].includes(lower)

    if (!canReceive && !isRechazado) return null

    const handleRecepcion = async () => {
        setLoading(true)
        const res = await confirmarRecepcion(requisicionId)
        if (res.error) {
            toast.error('Error', { description: res.error })
        } else {
            toast.success('Recepción confirmada ✅', {
                description: 'Material marcado como recibido',
            })
            onStatusChange?.()
        }
        setLoading(false)
        setShowConfirm(false)
    }

    const handleDevolucion = async () => {
        setLoading(true)
        const res = await confirmarDevolucion(requisicionId)
        if (res.error) {
            toast.error('Error', { description: res.error })
        } else {
            toast.success('Devolución confirmada', {
                description: 'Material marcado para devolución a proveedor',
            })
            onStatusChange?.()
        }
        setLoading(false)
        setShowConfirm(false)
    }

    if (canReceive) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Confirmar Recepción (CEDIS)
                    </p>
                </div>
                <p className="text-xs text-emerald-700">
                    Confirma que el material ha sido recibido en CEDIS.
                </p>
                {showConfirm ? (
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            onClick={handleRecepcion}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                            Sí, confirmar recepción
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-xs text-[var(--muted)]"
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setShowConfirm(true)}
                    >
                        📦 Confirmar Recepción
                    </Button>
                )}
            </div>
        )
    }

    if (isRechazado) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                        Material Rechazado por Lab
                    </p>
                </div>
                <p className="text-xs text-amber-700">
                    Este material fue rechazado por laboratorio. Confirma la devolución al proveedor.
                </p>
                {showConfirm ? (
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs"
                            onClick={handleDevolucion}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                            Sí, confirmar devolución
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-xs text-[var(--muted)]"
                            onClick={() => setShowConfirm(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => setShowConfirm(true)}
                    >
                        ↩️ Confirmar Devolución
                    </Button>
                )}
            </div>
        )
    }

    return null
}
