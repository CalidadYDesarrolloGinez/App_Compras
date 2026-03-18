'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import type { Requisicion } from '@/types'
import {
    Calendar as CalendarIcon,
    MapPin,
    Package,
    Truck,
    Hash,
    FileText,
    Pencil,
    Trash2,
    X,
    FlaskConical,
    Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteRequisicion } from '@/lib/actions/requisiciones'
import { iniciarRevision } from '@/lib/actions/laboratorio'
import { LabEvidenciaSection } from '@/components/forms/LabEvidenciaSection'
import { CedisRecepcionForm } from '@/components/forms/CedisRecepcionForm'

interface EventDetailModalProps {
    requisicion: Requisicion | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: (req: Requisicion) => void
    onSuccess?: () => void
}

const ELIGIBLE_FOR_REVISION = ['pendiente', 'confirmado', 'en tránsito']

export function EventDetailModal({
    requisicion,
    open,
    onOpenChange,
    onEdit,
    onSuccess,
}: EventDetailModalProps) {
    const { canEdit, canDelete, canLiberate, canReceive } = useAuthRole()
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isStartingReview, setIsStartingReview] = useState(false)

    if (!requisicion) return null

    const estatusNombre = requisicion.estatus?.nombre || ''
    const estatusLower = estatusNombre.toLowerCase()

    const canStartReview = canLiberate && ELIGIBLE_FOR_REVISION.includes(estatusLower)
    const showLabSection = !['pendiente', 'confirmado', 'en tránsito', 'cancelado'].includes(estatusLower)
    const showCedisSection = canReceive && ['liberado', 'rechazado'].includes(estatusLower)

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteRequisicion(requisicion.id)
        if (result?.error) {
            toast.error('Error al eliminar', { description: result.error })
        } else {
            toast.success('Requisición eliminada correctamente')
            onOpenChange(false)
            onSuccess?.()
        }
        setIsDeleting(false)
        setShowConfirm(false)
    }

    const handleIniciarRevision = async () => {
        setIsStartingReview(true)
        const result = await iniciarRevision(requisicion.id)
        if (result.error) {
            toast.error('Error', { description: result.error })
        } else {
            toast.success('Material en revisión 🔬', {
                description: 'El estatus se actualizó a "En Revisión"',
            })
            onOpenChange(false)
            onSuccess?.()
        }
        setIsStartingReview(false)
    }

    const handleStatusChange = () => {
        onOpenChange(false)
        onSuccess?.()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="max-w-lg bg-[var(--card)] border-0 shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header Ribbon */}
                <div
                    className="px-6 py-5 pb-8 relative shrink-0"
                    style={{ backgroundColor: requisicion.estatus?.color_hex || '#4266ac' }}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Package className="h-24 w-24 text-white" />
                    </div>
                    <DialogClose className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white">
                        <X className="h-5 w-5 text-white" />
                        <span className="sr-only">Cerrar</span>
                    </DialogClose>
                    <div className="relative z-10 flex flex-col gap-0.5">
                        <div 
                            className="inline-flex items-center w-fit px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm border border-black/5 mb-3"
                            style={{ color: requisicion.estatus?.color_hex || '#4266ac' }}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                {requisicion.estatus?.nombre}
                            </span>
                        </div>
                        <DialogTitle className="text-white text-xl font-bold leading-tight shadow-sm">
                            {requisicion.producto?.nombre}
                        </DialogTitle>
                        <p className="text-white/90 text-sm mt-1">
                            {requisicion.proveedor?.nombre}
                        </p>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1">
                    {/* Details Grid */}
                    <div className="px-6 py-5 -mt-4 relative z-20 bg-[var(--card)] rounded-t-2xl flex flex-col gap-4">

                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                                    <CalendarIcon className="h-3.5 w-3.5" /> Fecha
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {format(new Date(requisicion.fecha_recepcion + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: es })}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                                    <Package className="h-3.5 w-3.5" /> Cantidad
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {Number(requisicion.cantidad_solicitada).toLocaleString('es-MX')} {requisicion.unidad_cantidad?.abreviatura}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                                    <Truck className="h-3.5 w-3.5" /> Presentación
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {requisicion.presentacion?.nombre}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                                    <MapPin className="h-3.5 w-3.5" /> Destino
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {requisicion.destino?.nombre}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 col-span-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                                    <Hash className="h-3.5 w-3.5" /> Orden de Compra
                                </div>
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {requisicion.numero_oc || <span className="text-[var(--muted)] italic">No especificada</span>}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1 col-span-2 bg-[var(--bg)] p-3 rounded-lg border border-[var(--border)] mt-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                                    <FileText className="h-3.5 w-3.5" /> Comentarios
                                </div>
                                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                                    {requisicion.comentarios || <span className="text-[var(--muted)] italic">Sin comentarios.</span>}
                                </p>
                            </div>
                        </div>

                        {/* Lab: Start Review Button */}
                        {canStartReview && (
                            <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                onClick={handleIniciarRevision}
                                disabled={isStartingReview}
                            >
                                {isStartingReview ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FlaskConical className="h-4 w-4 mr-2" />
                                )}
                                🔬 Iniciar Revisión
                            </Button>
                        )}

                        {/* Lab Evidencias Section (visible for all when applicable) */}
                        {showLabSection && (
                            <LabEvidenciaSection
                                requisicionId={requisicion.id}
                                isLab={canLiberate}
                                estatusNombre={estatusNombre}
                                onStatusChange={handleStatusChange}
                            />
                        )}

                        {/* CEDIS Reception/Return Section */}
                        {showCedisSection && (
                            <CedisRecepcionForm
                                requisicionId={requisicion.id}
                                estatusNombre={estatusNombre}
                                onStatusChange={handleStatusChange}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-[var(--bg)] opacity-95 border-t border-[var(--border)] flex items-center justify-between sm:justify-between shrink-0">
                    <div className="flex gap-2">
                        {canDelete && (
                            <div className="flex items-center gap-2">
                                {showConfirm ? (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                        <span className="text-[10px] font-bold text-[#c41f1a] uppercase tracking-tighter">¿Confirmar?</span>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="h-8 px-3 text-xs bg-[#c41f1a] hover:bg-[#a31a16]"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Eliminando...' : 'Sí, borrar'}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-xs text-[var(--muted)] hover:bg-[var(--border)]"
                                            onClick={() => setShowConfirm(false)}
                                            disabled={isDeleting}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        className="text-[#c41f1a] hover:bg-red-50 hover:text-[#a31a16] px-3 transition-colors"
                                        onClick={() => setShowConfirm(true)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                        {canEdit && !showConfirm && (
                            <Button variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--card)]" onClick={() => {
                                onOpenChange(false)
                                onEdit(requisicion)
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        )}
                    </div>
                    {!showConfirm && (
                        <Button className="bg-[#4266ac] text-white hover:bg-[#62a4dc]" onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
