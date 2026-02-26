'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getRequisiciones } from '@/lib/actions/requisiciones'
import type { Requisicion, RequisicionFilters } from '@/types'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import { FilterBar } from '@/components/forms/FilterBar'
import { RequisicionFormModal } from '@/components/forms/RequisicionForm'
import { EventDetailModal } from '@/components/calendar/EventModal'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Pencil } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function RequisicionesTablePage() {
    const [requisiciones, setRequisiciones] = useState<Requisicion[]>([])
    const [filters, setFilters] = useState<RequisicionFilters>({})
    const [loading, setLoading] = useState(true)

    const [formOpen, setFormOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedReq, setSelectedReq] = useState<Requisicion | null>(null)

    const { canCreate, canEdit } = useAuthRole()

    const loadData = async () => {
        setLoading(true)
        const { data, error } = await getRequisiciones(filters)
        if (!error && data) {
            // Sort: Recibido at the bottom, others at the top
            const sortedData = [...(data as Requisicion[])].sort((a, b) => {
                const isARecibido = a.estatus?.nombre === 'Recibido'
                const isBRecibido = b.estatus?.nombre === 'Recibido'

                if (isARecibido && !isBRecibido) return 1
                if (!isARecibido && isBRecibido) return -1

                // Secondary sort: by date
                return new Date(a.fecha_recepcion).getTime() - new Date(b.fecha_recepcion).getTime()
            })
            setRequisiciones(sortedData)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    return (
        <div className="flex flex-col h-full gap-4 w-full px-4 mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--navy)]">Lista de Requisiciones</h1>
                    <p className="text-sm text-[var(--muted)] mt-1">
                        Vista tabular de todas las entregas programadas.
                    </p>
                </div>

                {canCreate && (
                    <Button
                        className="bg-[#4266ac] hover:bg-[#62a4dc] text-white"
                        onClick={() => {
                            setSelectedReq(null)
                            setFormOpen(true)
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Requisición
                    </Button>
                )}
            </div>

            <div className="bg-[var(--card)] p-4 rounded-xl shadow-sm border border-[var(--border)] flex-shrink-0">
                <FilterBar filters={filters} onFilterChange={setFilters} />
            </div>

            <div className="flex-1 bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[var(--bg)]">
                            <TableRow>
                                <TableHead className="w-[100px] font-semibold text-[var(--navy)]"># Requi</TableHead>
                                <TableHead className="w-[110px] font-semibold text-[var(--navy)]">Fecha Rec.</TableHead>
                                <TableHead className="w-[100px] font-semibold text-[var(--navy)]">FOLIO OC</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Proveedor</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Producto</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Fecha Sol.</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Fecha Conf.</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Cant. Ent.</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">F. Entrega</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Cant. Pend.</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Estatus</TableHead>
                                <TableHead className="font-semibold text-[var(--navy)]">Destino</TableHead>
                                <TableHead className="text-right font-semibold text-[var(--navy)]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : requisiciones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="h-24 text-center text-[var(--muted)]">
                                        No se encontraron resultados para los filtros seleccionados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requisiciones.map((req) => (
                                    <TableRow key={req.id} className="hover:bg-blue-50/30">
                                        <TableCell className="font-mono text-xs text-[var(--muted)]">
                                            {req.requisicion_numero || '---'}
                                        </TableCell>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {format(new Date(req.fecha_recepcion + 'T00:00:00'), 'dd/MMM/yy', { locale: es })}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-[var(--foreground)]">
                                            {req.numero_oc || '---'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-[var(--foreground)]">{req.proveedor?.nombre}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-[var(--navy)]">{req.producto?.nombre}</div>
                                            <div className="text-xs text-[var(--muted)]">
                                                {Number(req.cantidad_solicitada).toLocaleString('es-MX')} {req.unidad_cantidad?.abreviatura} · {req.presentacion?.nombre}
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-[var(--muted)]">
                                            {req.fecha_solicitada_entrega
                                                ? format(new Date(req.fecha_solicitada_entrega + 'T00:00:00'), 'dd/MMM/yy', { locale: es })
                                                : '---'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm font-medium">
                                            {req.fecha_confirmada
                                                ? format(new Date(req.fecha_confirmada + 'T00:00:00'), 'dd/MMM/yy', { locale: es })
                                                : '---'}
                                        </TableCell>
                                        <TableCell className="text-sm font-bold text-emerald-700">
                                            {req.cantidad_entregada !== null ? `${req.cantidad_entregada} ${req.unidad_cantidad?.abreviatura}` : '---'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-[var(--muted)]">
                                            {req.fecha_entregado
                                                ? format(new Date(req.fecha_entregado + 'T00:00:00'), 'dd/MMM/yy', { locale: es })
                                                : '---'}
                                        </TableCell>
                                        <TableCell className="text-sm font-bold text-red-600">
                                            {(() => {
                                                const pendiente = Number(req.cantidad_solicitada) - Number(req.cantidad_entregada || 0)
                                                return pendiente > 0 ? `${pendiente.toLocaleString('es-MX')} ${req.unidad_cantidad?.abreviatura}` : '---'
                                            })()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="text-white border-0"
                                                style={{ backgroundColor: req.estatus?.color_hex }}
                                            >
                                                {req.estatus?.nombre}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[var(--muted)] text-sm">
                                            {req.destino?.nombre}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Ver detalles"
                                                    onClick={() => {
                                                        setSelectedReq(req)
                                                        setDetailOpen(true)
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 text-[var(--muted)]" />
                                                </Button>
                                                {canEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Editar"
                                                        onClick={() => {
                                                            setSelectedReq(req)
                                                            setFormOpen(true)
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4 text-[var(--navy)]" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <RequisicionFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                initialData={selectedReq}
                onSuccess={loadData}
            />

            <EventDetailModal
                open={detailOpen}
                onOpenChange={setDetailOpen}
                requisicion={selectedReq}
                onEdit={(req) => {
                    setSelectedReq(req)
                    setFormOpen(true)
                }}
                onSuccess={loadData}
            />
        </div>
    )
}
