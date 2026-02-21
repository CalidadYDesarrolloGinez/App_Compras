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
            // Fetch next 7 days using date filters
            const today = startOfDay(new Date())
            const nextWeek = addDays(today, 7)

            const { data, error } = await getRequisiciones({
                fecha_desde: format(today, 'yyyy-MM-dd'),
                fecha_hasta: format(nextWeek, 'yyyy-MM-dd')
            })

            if (!error && data) {
                // Sort by date ascending
                const sorted = (data as Requisicion[]).sort((a, b) =>
                    new Date(a.fecha_recepcion).getTime() - new Date(b.fecha_recepcion).getTime()
                )
                setUpcoming(sorted.slice(0, 5)) // Take top 5
            }
            setLoading(false)
        }

        load()
    }, [])

    if (loading) {
        return (
            <Card className="shadow-sm border-gray-100 bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-sm font-bold text-[#1A2B4A] flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[#1B3D8F]" />
                        Próximas Entregas (7 días)
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
        <Card className="shadow-sm border-gray-100 bg-gradient-to-br from-white to-blue-50/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Truck className="h-24 w-24 text-[#1A2B4A]" />
            </div>

            <CardHeader className="pb-3 border-b border-gray-100 bg-white/50 backdrop-blur-sm relative z-10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-[#1A2B4A] flex items-center gap-2">
                        <Truck className="h-4 w-4 text-[#1B3D8F]" />
                        Próximas Entregas (7 días)
                    </CardTitle>
                    <Badge className="bg-[#1B3D8F] hover:bg-[#1A2B4A]">
                        {upcoming.length}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative z-10">
                {upcoming.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-gray-300 mb-1" />
                        No hay entregas programadas<br />para los próximos 7 días.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {upcoming.map(req => {
                            const reqDate = new Date(req.fecha_recepcion + 'T00:00:00')
                            const isToday = format(reqDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                            return (
                                <div key={req.id} className="p-4 hover:bg-white/60 transition-colors flex items-center justify-between group">
                                    <div className="overflow-hidden pr-4">
                                        <p className="font-semibold text-sm text-gray-900 truncate group-hover:text-[#1B3D8F] transition-colors">
                                            {req.producto?.nombre}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {req.proveedor?.nombre}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`text-xs font-bold ${isToday ? 'text-red-500' : 'text-gray-700'}`}>
                                            {isToday ? 'Hoy' : format(reqDate, 'EEEE dd', { locale: es })}
                                        </div>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1" style={{ borderColor: req.estatus?.color_hex, color: req.estatus?.color_hex }}>
                                            {req.estatus?.nombre}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
