'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getHistorial } from '@/lib/actions/requisiciones'
import { useAuthRole } from '@/lib/hooks/useAuthRole'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { History, ArrowRight } from 'lucide-react'

export default function HistorialPage() {
    const [historial, setHistorial] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { canEdit } = useAuthRole()

    useEffect(() => {
        async function load() {
            if (!canEdit) return
            setLoading(true)
            const { data, error } = await getHistorial()
            if (!error && data) setHistorial(data)
            setLoading(false)
        }
        load()
    }, [canEdit])

    if (!canEdit) {
        return (
            <div className="flex items-center justify-center h-full text-red-500">
                No tienes permisos para ver esta página.
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="bg-[#1A2B4A]/10 p-2 rounded-lg">
                    <History className="h-6 w-6 text-[#1A2B4A]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A2B4A]">Registro de Auditoría</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Historial de cambios realizados en las requisiciones del sistema.
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-[500px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[180px] font-semibold text-[#1A2B4A]">Fecha / Hora</TableHead>
                                <TableHead className="font-semibold text-[#1A2B4A]">Usuario</TableHead>
                                <TableHead className="font-semibold text-[#1A2B4A]">Campo Modificado</TableHead>
                                <TableHead className="font-semibold text-[#1A2B4A]">Valor Anterior</TableHead>
                                <TableHead className="font-semibold text-[#1A2B4A]">Valor Nuevo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                    </TableRow>
                                ))
                            ) : historial.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                        No hay registros en el historial.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                historial.map((reg) => (
                                    <TableRow key={reg.id} className="text-sm">
                                        <TableCell className="text-gray-500 font-medium whitespace-nowrap">
                                            {format(new Date(reg.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-[#1A2B4A]">
                                                {reg.profiles?.nombre_completo || 'Usuario Desconocido'}
                                            </div>
                                            <div className="text-xs text-gray-400 capitalize">
                                                {reg.profiles?.rol}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-semibold tracking-wide">
                                                {reg.campo_modificado}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-500 max-w-[200px] truncate" title={reg.valor_anterior || 'Vacío'}>
                                            {reg.valor_anterior || <span className="text-gray-300 italic">Vacío</span>}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate font-medium text-emerald-600" title={reg.valor_nuevo}>
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                                                {reg.valor_nuevo}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
