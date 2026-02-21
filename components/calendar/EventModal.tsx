'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
    Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import { deleteRequisicion } from '@/lib/actions/requisiciones'

interface EventDetailModalProps {
    requisicion: Requisicion | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: (req: Requisicion) => void
    onSuccess?: () => void
}

export function EventDetailModal({
    requisicion,
    open,
    onOpenChange,
    onEdit,
    onSuccess,
}: EventDetailModalProps) {
    const { canEdit, canDelete } = useAuthRole()

    if (!requisicion) return null

    const handleDelete = async () => {
        if (!confirm('¿Está seguro de que desea eliminar permanentemente esta requisición? Esta acción no se puede deshacer.')) return

        const result = await deleteRequisicion(requisicion.id)
        if (result?.error) {
            toast.error('Error al eliminar', { description: result.error })
        } else {
            toast.success('Requisición eliminada correctamente')
            onOpenChange(false)
            onSuccess?.()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white border-0 shadow-2xl p-0 overflow-hidden">
                {/* Header Ribbon */}
                <div
                    className="px-6 py-5 pb-8 relative"
                    style={{ backgroundColor: requisicion.estatus?.color_hex || '#1B3D8F' }}
                >
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Package className="h-24 w-24 text-white" />
                    </div>
                    <div className="relative z-10">
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3 shadow-none">
                            {requisicion.estatus?.nombre}
                        </Badge>
                        <DialogTitle className="text-white text-xl font-bold leading-tight shadow-sm">
                            {requisicion.producto?.nombre}
                        </DialogTitle>
                        <p className="text-white/90 text-sm mt-1">
                            {requisicion.proveedor?.nombre}
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="px-6 py-5 -mt-4 relative z-20 bg-white rounded-t-2xl flex flex-col gap-4">

                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <CalendarIcon className="h-3.5 w-3.5" /> Fecha
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {format(new Date(requisicion.fecha_recepcion + 'T00:00:00'), "dd 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Package className="h-3.5 w-3.5" /> Cantidad
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {Number(requisicion.cantidad_solicitada).toLocaleString('es-MX')} {requisicion.unidad_cantidad?.abreviatura}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Truck className="h-3.5 w-3.5" /> Presentación
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {requisicion.presentacion?.nombre}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <MapPin className="h-3.5 w-3.5" /> Destino
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {requisicion.destino?.nombre}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 col-span-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <Hash className="h-3.5 w-3.5" /> Orden de Compra
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                                {requisicion.numero_oc || <span className="text-gray-400 italic">No especificada</span>}
                            </p>
                        </div>

                        <div className="flex flex-col gap-1 col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                <FileText className="h-3.5 w-3.5" /> Comentarios
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {requisicion.comentarios || <span className="text-gray-400 italic">Sin comentarios.</span>}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between sm:justify-between">
                    <div className="flex gap-2">
                        {canDelete && (
                            <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 px-3" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                        {canEdit && (
                            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-white" onClick={() => {
                                onOpenChange(false)
                                onEdit(requisicion)
                            }}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        )}
                    </div>
                    <Button className="bg-[#1A2B4A] hover:bg-[#1B3D8F]" onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
