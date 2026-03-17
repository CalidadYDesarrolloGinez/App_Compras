'use client'

import { useState, useEffect } from 'react'
import { getRequisiciones } from '@/lib/actions/requisiciones'
import type { Requisicion } from '@/types'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Truck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function UpcomingDeliveries() {
    const [upcoming, setUpcoming] = useState<Requisicion[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            // Fetch all recent requisitions (we'll filter the window in memory)
            // This ensures that if a requisition was requested long ago but confirmed for TODAY, it shows up.
            // And if it was requested for today but moved to next month, it disappears from this list.
            const { data, error } = await getRequisiciones({})

            if (!error && data) {
                const today = startOfDay(new Date())
                const endRange = addDays(today, 5)

                const processed = (data as Requisicion[])
                    .filter(req => {
                        // 1. Exclude finished statuses
                        const estatus = req.estatus?.nombre?.toLowerCase() || ''
                        if (['recibido', 'cancelado'].includes(estatus)) return false

                        // 2. Use confirmed date if available, else requested date
                        const activeDateStr = req.fecha_confirmada || req.fecha_recepcion
                        if (!activeDateStr) return false

                        const activeDate = new Date(activeDateStr + 'T00:00:00')

                        // 3. Match ONLY the 6-day window
                        return activeDate >= today && activeDate <= endRange
                    })
                    .sort((a, b) => {
                        const dateA = new Date((a.fecha_confirmada || a.fecha_recepcion) + 'T00:00:00').getTime()
                        const dateB = new Date((b.fecha_confirmada || b.fecha_recepcion) + 'T00:00:00').getTime()
                        return dateA - dateB
                    })

                setUpcoming(processed)
            }
            setLoading(false)
        }

        load()
    }, [])

    if (loading) {
        return (
            <Card className="shadow-sm border-[var(--border)] bg-[var(--card)]">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                    <CardTitle className="text-sm font-bold text-[var(--navy)] flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[var(--navy)]" />
                        Próximas Entregas (6 días)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="shadow-sm border-[var(--border)] bg-[var(--card)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Truck className="h-24 w-24 text-[var(--navy)]" />
            </div>

            <CardHeader className="pb-3 border-b border-[var(--border)] bg-[var(--card)] opacity-95 backdrop-blur-sm relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-[var(--navy)] flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[var(--navy)]" />
                        Próximas Entregas (6 días)
                    </CardTitle>
                    <Badge className="bg-[#4266ac] hover:bg-[#62a4dc]">
                        {upcoming.length}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative z-10">
                {upcoming.length === 0 ? (
                    <div className="p-6 text-center text-sm text-[var(--muted)] flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-300 mb-1" />
                        No hay entregas programadas<br />para los próximos 6 días.
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)] max-h-[500px] overflow-y-auto">
                        {upcoming.map(req => {
                            const dateToUse = req.fecha_confirmada || req.fecha_recepcion
                            const reqDate = new Date(dateToUse + 'T00:00:00')
                            const isToday = format(reqDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                            const estatusLower = (req.estatus?.nombre || '').toLowerCase()

                            return (
                                <div key={req.id} className="p-4 hover:bg-[var(--bg)] transition-colors flex flex-col gap-1 group">
                                    <div className="flex items-center justify-between">
                                        <div className="overflow-hidden min-w-0">
                                            <p className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider opacity-80">Material:</p>
                                            <p className="font-bold text-sm text-[var(--navy)] truncate group-hover:text-[var(--navy-light)] transition-colors leading-tight">
                                                {req.producto?.nombre}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ backgroundColor: req.estatus?.color_hex + '10', borderColor: req.estatus?.color_hex, color: req.estatus?.color_hex }}>
                                                {req.estatus?.nombre}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider opacity-80">Proveedor:</p>
                                            <p className="text-xs text-[var(--muted)] truncate font-medium">
                                                {req.proveedor?.nombre}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider opacity-80">
                                                {req.fecha_confirmada ? 'Fecha Confirmada:' : 'Fecha Solicitada:'}
                                            </p>
                                            <p className={`text-xs font-bold leading-tight ${isToday ? 'text-red-600 dark:text-red-400' : 'text-[var(--foreground)]'}`}>
                                                {isToday ? `Hoy (${format(reqDate, 'eee dd', { locale: es })})` : format(reqDate, 'eeee dd', { locale: es })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lab/CEDIS Status Indicators */}
                                    {estatusLower === 'en revisión' && (
                                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-orange-50 rounded-md border border-orange-200">
                                            <span className="text-[10px]">🔬</span>
                                            <span className="text-[10px] font-bold text-orange-700">En revisión por Lab</span>
                                        </div>
                                    )}
                                    {estatusLower === 'liberado' && (
                                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-emerald-50 rounded-md border border-emerald-200">
                                            <span className="text-[10px]">🧪✅</span>
                                            <span className="text-[10px] font-bold text-emerald-700">Liberado por Lab</span>
                                        </div>
                                    )}
                                    {estatusLower === 'rechazado' && (
                                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-red-50 rounded-md border border-red-200">
                                            <span className="text-[10px]">❌</span>
                                            <span className="text-[10px] font-bold text-red-700">Rechazado por Lab</span>
                                        </div>
                                    )}
                                    {estatusLower === 'recibido' && req.cantidad_entregada && (
                                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
                                            <span className="text-[10px]">📦</span>
                                            <span className="text-[10px] font-bold text-blue-700">
                                                Recibido: {Number(req.cantidad_entregada).toLocaleString('es-MX')} {req.unidad_cantidad?.abreviatura || ''}
                                            </span>
                                        </div>
                                    )}

                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
