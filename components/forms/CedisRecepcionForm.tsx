'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, PackageCheck, RotateCcw } from 'lucide-react'
import { confirmarRecepcion, confirmarDevolucion } from '@/lib/actions/cedis'

interface CedisRecepcionFormProps {
    requisicionId: string
    estatusNombre: string
    unidadAbreviatura?: string
    onStatusChange?: () => void
}

export function CedisRecepcionForm({
    requisicionId,
    estatusNombre,
    unidadAbreviatura = '',
    onStatusChange,
}: CedisRecepcionFormProps) {
    const [cantidad, setCantidad] = useState('')
    const [loading, setLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const isLiberado = estatusNombre.toLowerCase() === 'liberado'
    const isRechazado = estatusNombre.toLowerCase() === 'rechazado'

    if (!isLiberado && !isRechazado) return null

    const handleRecepcion = async () => {
        const cantNum = parseFloat(cantidad)
        if (isNaN(cantNum) || cantNum <= 0) {
            toast.error('Ingrese una cantidad válida')
            return
        }

        setLoading(true)
        const res = await confirmarRecepcion(requisicionId, cantNum)
        if (res.error) {
            toast.error('Error', { description: res.error })
        } else {
            toast.success('Recepción confirmada ✅', {
                description: `${cantNum} ${unidadAbreviatura} registrados como recibido`,
            })
            onStatusChange?.()
        }
        setLoading(false)
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

    if (isLiberado) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2">
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        Confirmar Recepción (CEDIS)
                    </p>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-emerald-700">
                        Cantidad Recibida {unidadAbreviatura && `(${unidadAbreviatura})`}
                    </Label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="Ej: 1500"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        className="h-9 bg-white border-emerald-300 focus:border-emerald-500"
                    />
                </div>
                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleRecepcion}
                    disabled={loading || !cantidad}
                >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    📦 Confirmar Recepción
                </Button>
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
                        ↩️ Confirmar Devolución a Proveedor
                    </Button>
                )}
            </div>
        )
    }

    return null
}
