'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { requisicionSchema, type RequisicionSchema } from '@/lib/validations/schemas'
import { createRequisicion, updateRequisicion } from '@/lib/actions/requisiciones'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import type { Requisicion, RequisicionFormData } from '@/types'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { QuickAddModal } from './QuickAddModal'
import { createClient } from '@/lib/supabase/client'
import { useAuthRole } from '@/lib/hooks/useAuthRole'

interface RequisicionFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: Requisicion | null
    onSuccess?: () => void
}

export function RequisicionFormModal({
    open,
    onOpenChange,
    initialData,
    onSuccess,
}: RequisicionFormModalProps) {
    const { catalogos, loading: loadingCatalogs, refresh } = useCatalogos()
    const { role } = useAuthRole()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [quickAdd, setQuickAdd] = useState<{ open: boolean; title: string; table: string; field: keyof RequisicionSchema } | null>(null)

    const isEdit = !!initialData
    const canEditConfirmedDate = role === 'admin' || role === 'coordinadora'

    const form = useForm<RequisicionSchema>({
        resolver: zodResolver(requisicionSchema),
        defaultValues: {
            fecha_recepcion: format(new Date(), 'yyyy-MM-dd'),
            proveedor_id: '',
            producto_id: '',
            presentacion_id: '',
            destino_id: '',
            estatus_id: '',
            cantidad_solicitada: 0,
            unidad_cantidad_id: '',
            numero_oc: '',
            requisicion_numero: '',
            fecha_oc: '',
            fecha_solicitada_entrega: '',
            fecha_confirmada: '',
            fecha_entregado: '',
            cantidad_entregada: null,
            factura_remision: '',
            comentarios: '',
        },
    })

    useEffect(() => {
        if (open && initialData) {
            form.reset({
                fecha_recepcion: initialData.fecha_recepcion,
                proveedor_id: initialData.proveedor_id,
                producto_id: initialData.producto_id,
                presentacion_id: initialData.presentacion_id,
                destino_id: initialData.destino_id,
                estatus_id: initialData.estatus_id,
                cantidad_solicitada: Number(initialData.cantidad_solicitada),
                unidad_cantidad_id: initialData.unidad_cantidad_id,
                numero_oc: initialData.numero_oc || '',
                requisicion_numero: initialData.requisicion_numero || '',
                fecha_oc: initialData.fecha_oc || '',
                fecha_solicitada_entrega: initialData.fecha_solicitada_entrega || '',
                fecha_confirmada: initialData.fecha_confirmada || '',
                fecha_entregado: initialData.fecha_entregado || '',
                cantidad_entregada: initialData.cantidad_entregada ? Number(initialData.cantidad_entregada) : null,
                factura_remision: initialData.factura_remision || '',
                comentarios: initialData.comentarios || '',
            })
        } else if (open && !initialData) {
            form.reset({
                fecha_recepcion: format(new Date(), 'yyyy-MM-dd'),
                proveedor_id: '',
                producto_id: '',
                presentacion_id: '',
                destino_id: '',
                estatus_id: '',
                cantidad_solicitada: 0,
                unidad_cantidad_id: '',
                numero_oc: '',
                requisicion_numero: '',
                fecha_oc: '',
                fecha_solicitada_entrega: '',
                fecha_confirmada: '',
                fecha_entregado: '',
                cantidad_entregada: null,
                factura_remision: '',
                comentarios: '',
            })
        }
    }, [open, initialData, form])

    const onSubmit = async (values: RequisicionSchema) => {
        setIsSubmitting(true)
        let result

        try {
            if (isEdit) {
                // Find modified fields for audit trail
                const fields: Record<string, string> = {
                    fecha_recepcion: 'Fecha de Recepción',
                    proveedor_id: 'Proveedor',
                    producto_id: 'Producto',
                    presentacion_id: 'Presentación',
                    destino_id: 'Destino',
                    estatus_id: 'Estatus',
                    cantidad_solicitada: 'Cantidad Solicitada',
                    unidad_cantidad_id: 'Unidad de Medida',
                    numero_oc: 'Número O.C.',
                    requisicion_numero: '№ Requi',
                    fecha_oc: 'Fecha de OC',
                    fecha_solicitada_entrega: 'Fecha Solicitada Entrega',
                    fecha_confirmada: 'Fecha Confirmada',
                    fecha_entregado: 'Fecha Entregado',
                    cantidad_entregada: 'Cantidad Entregada',
                    factura_remision: 'Factura/Remisión',
                    comentarios: 'Comentarios'
                }

                const modifications = Object.keys(values).reduce((acc, key) => {
                    const k = key as keyof RequisicionSchema
                    const newVal = String(values[k] ?? '')
                    const oldVal = String(initialData[k as keyof Requisicion] ?? '')

                    if (newVal !== oldVal) {
                        acc.push({
                            campo: fields[key] || key,
                            anterior: oldVal,
                            nuevo: newVal,
                        })
                    }
                    return acc
                }, [] as Array<{ campo: string; anterior: string; nuevo: string }>)

                result = await updateRequisicion(initialData.id, values as RequisicionFormData, modifications)
            } else {
                result = await createRequisicion(values as RequisicionFormData)
            }

            if (result?.error) {
                toast.error('Error al guardar', { description: result.error })
            } else {
                toast.success(`Requisición ${isEdit ? 'actualizada' : 'creada'} correctamente`)
                form.reset()
                onOpenChange(false)
                onSuccess?.()
            }
        } catch (e) {
            toast.error('Error inesperado', { description: 'Contacte al administrador' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-[#F8F9FC] border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh]">
                <div className="bg-[#1A2B4A] px-6 py-4 sticky top-0 z-20">
                    <DialogTitle className="text-white text-lg">
                        {isEdit ? 'Editar Requisición' : 'Nueva Requisición'}
                    </DialogTitle>
                    <DialogDescription className="text-blue-200 text-xs">
                        Complete los campos obligatorios (*) para agendar una entrega.
                    </DialogDescription>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        {/* Section 1: Manual Input Fields (Excel Style) */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-bold text-[#1A2B4A] mb-4 border-b pb-2">Datos de la Requisición</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">№ REQUI</Label>
                                    <Input {...form.register('requisicion_numero')} className="h-8 text-sm" placeholder="F0000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">FECHA DE OC</Label>
                                    <Input type="date" {...form.register('fecha_oc')} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">FOLIO OC</Label>
                                    <Input {...form.register('numero_oc')} className="h-8 text-sm" placeholder="GG-01000" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">FECHA SOLICITADA</Label>
                                    <Input type="date" {...form.register('fecha_solicitada_entrega')} className="h-8 text-sm" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className={`text-xs font-semibold ${canEditConfirmedDate ? 'text-[#1B3D8F]' : 'text-gray-400'}`}>FECHA CONFIRMADA *</Label>
                                    <Input
                                        type="date"
                                        {...form.register('fecha_confirmada')}
                                        className={`h-8 text-sm ${canEditConfirmedDate ? 'border-[#1B3D8F]' : 'bg-gray-50 cursor-not-allowed'}`}
                                        disabled={!canEditConfirmedDate}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">FACTURA / REMISIÓN</Label>
                                    <Input {...form.register('factura_remision')} className="h-8 text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Catalog Selection */}
                        <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-sm font-bold text-[#1A2B4A] mb-4 border-b border-blue-100 pb-2">Detalles del Material (Catálogo)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">PROVEEDOR *</Label>
                                    <div className="flex gap-1.5">
                                        <Select
                                            value={form.watch('proveedor_id')}
                                            onValueChange={(val) => form.setValue('proveedor_id', val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className="h-8 text-sm bg-white flex-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                {catalogos.proveedores
                                                    .filter(p => p.activo || p.id === form.getValues('proveedor_id'))
                                                    .map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 border-dashed border-gray-300 hover:border-[#1B3D8F] hover:text-[#1B3D8F]"
                                            onClick={() => setQuickAdd({ open: true, title: 'Proveedor', table: 'proveedores', field: 'proveedor_id' })}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">PRODUCTO *</Label>
                                    <div className="flex gap-1.5">
                                        <Select
                                            value={form.watch('producto_id')}
                                            onValueChange={(val) => form.setValue('producto_id', val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className="h-8 text-sm bg-white flex-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                {catalogos.productos
                                                    .filter(p => p.activo || p.id === form.getValues('producto_id'))
                                                    .map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 border-dashed border-gray-300 hover:border-[#1B3D8F] hover:text-[#1B3D8F]"
                                            onClick={() => setQuickAdd({ open: true, title: 'Producto', table: 'productos', field: 'producto_id' })}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">PRESENTACIÓN *</Label>
                                    <div className="flex gap-1.5">
                                        <Select
                                            value={form.watch('presentacion_id')}
                                            onValueChange={(val) => form.setValue('presentacion_id', val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className="h-8 text-sm bg-white flex-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                {catalogos.presentaciones
                                                    .filter(p => p.activo || p.id === form.getValues('presentacion_id'))
                                                    .map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 border-dashed border-gray-300 hover:border-[#1B3D8F] hover:text-[#1B3D8F]"
                                            onClick={() => setQuickAdd({ open: true, title: 'Presentación', table: 'presentaciones', field: 'presentacion_id' })}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">DESTINO *</Label>
                                    <div className="flex gap-1.5">
                                        <Select
                                            value={form.watch('destino_id')}
                                            onValueChange={(val) => form.setValue('destino_id', val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className="h-8 text-sm bg-white flex-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                {catalogos.destinos
                                                    .filter(d => d.activo || d.id === form.getValues('destino_id'))
                                                    .map(d => <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 border-dashed border-gray-300 hover:border-[#1B3D8F] hover:text-[#1B3D8F]"
                                            onClick={() => setQuickAdd({ open: true, title: 'Destino', table: 'destinos', field: 'destino_id' })}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">ESTATUS *</Label>
                                    <div className="flex gap-1.5">
                                        <Select
                                            value={form.watch('estatus_id')}
                                            onValueChange={(val) => form.setValue('estatus_id', val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className="h-8 text-sm bg-white flex-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                {catalogos.estatus
                                                    .filter(e => e.activo || e.id === form.getValues('estatus_id'))
                                                    .map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 border-dashed border-gray-300 hover:border-[#1B3D8F] hover:text-[#1B3D8F]"
                                            onClick={() => setQuickAdd({ open: true, title: 'Estatus', table: 'estatus', field: 'estatus_id' })}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">CANTIDAD Y UNIDAD *</Label>
                                    <div className="flex gap-2">
                                        <Input type="number" step="0.01" {...form.register('cantidad_solicitada', { valueAsNumber: true })} className="h-8 text-sm bg-white flex-1" />
                                        <div className="flex gap-1">
                                            <Select
                                                value={form.watch('unidad_cantidad_id')}
                                                onValueChange={(val) => form.setValue('unidad_cantidad_id', val, { shouldValidate: true })}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white w-20"><SelectValue placeholder="UM" /></SelectTrigger>
                                                <SelectContent>
                                                    {catalogos.unidades
                                                        .filter(u => u.activo || u.id === form.getValues('unidad_cantidad_id'))
                                                        .map(u => <SelectItem key={u.id} value={u.id}>{u.abreviatura}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 shrink-0 border-dashed border-gray-300 hover:border-[#1B3D8F] hover:text-[#1B3D8F]"
                                                onClick={() => setQuickAdd({ open: true, title: 'Unidad', table: 'unidades', field: 'unidad_cantidad_id' })}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information Section */}
                        <div className="bg-emerald-50/20 p-4 rounded-lg border border-emerald-100/50">
                            <h3 className="text-sm font-bold text-[#065F46] mb-4 border-b border-emerald-100 pb-2">Información de Entrega (Cierre)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">FECHA ENTREGADO</Label>
                                    <Input type="date" {...form.register('fecha_entregado')} className="h-8 text-sm bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-gray-600">CANTIDAD ENTREGADA</Label>
                                    <Input type="number" step="0.01" {...form.register('cantidad_entregada', { valueAsNumber: true })} className="h-8 text-sm bg-white" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-gray-600">COMENTARIOS / NOTAS</Label>
                            <Textarea
                                className="bg-white resize-none h-20 text-sm"
                                placeholder="Instrucciones adicionales..."
                                {...form.register('comentarios')}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-6 border-t border-gray-200 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#1B3D8F] hover:bg-[#1A2B4A] text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Guardar Cambios' : 'Generar Nueva Requisición'}
                        </Button>
                    </DialogFooter>
                </form>

                {quickAdd && (
                    <QuickAddModal
                        open={quickAdd.open}
                        onOpenChange={(open) => setQuickAdd(prev => prev ? { ...prev, open } : null)}
                        title={quickAdd.title}
                        table={quickAdd.table}
                        onSuccess={(newItem) => {
                            refresh()
                            form.setValue(quickAdd.field, newItem.id as any, { shouldValidate: true })
                            setQuickAdd(null)
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
