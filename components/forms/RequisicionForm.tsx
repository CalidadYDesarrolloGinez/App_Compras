'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { requisicionSchema, type RequisicionSchema } from '@/lib/validations/schemas'
import { createRequisicion, updateRequisicion } from '@/lib/actions/requisiciones'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import type { Requisicion } from '@/types'

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
import { Loader2 } from 'lucide-react'

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
    const { catalogos, loading: loadingCatalogs } = useCatalogos()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isEdit = !!initialData

    const form = useForm<RequisicionSchema>({
        resolver: zodResolver(requisicionSchema),
        defaultValues: {
            fecha_recepcion: '',
            proveedor_id: '',
            producto_id: '',
            presentacion_id: '',
            destino_id: '',
            estatus_id: '',
            cantidad_solicitada: 0,
            unidad_cantidad_id: '',
            numero_oc: '',
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
                    comentarios: 'Comentarios'
                }

                const modifications = Object.keys(values).reduce((acc, key) => {
                    const k = key as keyof RequisicionSchema
                    const newVal = String(values[k] || '')
                    const oldVal = String(initialData[k as keyof Requisicion] || '')

                    if (newVal !== oldVal) {
                        acc.push({
                            campo: fields[key] || key,
                            anterior: oldVal,
                            nuevo: newVal,
                        })
                    }
                    return acc
                }, [] as Array<{ campo: string; anterior: string; nuevo: string }>)

                result = await updateRequisicion(initialData.id, values, modifications)
            } else {
                result = await createRequisicion(values)
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
            <DialogContent className="max-w-2xl bg-[#F8F9FC] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-[#1A2B4A] px-6 py-4">
                    <DialogTitle className="text-white text-lg">
                        {isEdit ? 'Editar Requisición' : 'Nueva Requisición'}
                    </DialogTitle>
                    <DialogDescription className="text-blue-200 text-xs">
                        Complete los campos obligatorios (*) para agendar una entrega.
                    </DialogDescription>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-1.5">
                            <Label htmlFor="fecha" className="text-sm font-semibold text-[#1A2B4A]">
                                Fecha de Recepción *
                            </Label>
                            <Input
                                id="fecha"
                                type="date"
                                className="bg-white"
                                {...form.register('fecha_recepcion')}
                            />
                            {form.formState.errors.fecha_recepcion && (
                                <p className="text-xs text-red-500">{form.formState.errors.fecha_recepcion.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Estatus *</Label>
                            <Select
                                disabled={loadingCatalogs}
                                value={form.watch('estatus_id')}
                                onValueChange={(val) => form.setValue('estatus_id', val, { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccione estatus" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogos.estatus.map(e => (
                                        <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.estatus_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.estatus_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Proveedor *</Label>
                            <Select
                                disabled={loadingCatalogs}
                                value={form.watch('proveedor_id')}
                                onValueChange={(val) => form.setValue('proveedor_id', val, { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccione proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogos.proveedores.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.proveedor_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.proveedor_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Producto *</Label>
                            <Select
                                disabled={loadingCatalogs}
                                value={form.watch('producto_id')}
                                onValueChange={(val) => form.setValue('producto_id', val, { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccione producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogos.productos.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.producto_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.producto_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Presentación *</Label>
                            <Select
                                disabled={loadingCatalogs}
                                value={form.watch('presentacion_id')}
                                onValueChange={(val) => form.setValue('presentacion_id', val, { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccione presentación" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogos.presentaciones.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.presentacion_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.presentacion_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Destino *</Label>
                            <Select
                                disabled={loadingCatalogs}
                                value={form.watch('destino_id')}
                                onValueChange={(val) => form.setValue('destino_id', val, { shouldValidate: true })}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Seleccione destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {catalogos.destinos.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.destino_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.destino_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Cantidad *</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="bg-white flex-1"
                                    {...form.register('cantidad_solicitada', { valueAsNumber: true })}
                                />
                                <Select
                                    disabled={loadingCatalogs}
                                    value={form.watch('unidad_cantidad_id')}
                                    onValueChange={(val) => form.setValue('unidad_cantidad_id', val, { shouldValidate: true })}
                                >
                                    <SelectTrigger className="bg-white w-24">
                                        <SelectValue placeholder="Unidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {catalogos.unidades.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.abreviatura}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {form.formState.errors.cantidad_solicitada && (
                                <p className="text-xs text-red-500">{form.formState.errors.cantidad_solicitada.message}</p>
                            )}
                            {form.formState.errors.unidad_cantidad_id && (
                                <p className="text-xs text-red-500">{form.formState.errors.unidad_cantidad_id.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Orden de Compra</Label>
                            <Input
                                className="bg-white"
                                placeholder="Ej. OC-2023-001"
                                {...form.register('numero_oc')}
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-sm font-semibold text-[#1A2B4A]">Comentarios</Label>
                            <Textarea
                                className="bg-white resize-none"
                                placeholder="Instrucciones de descarga, horarios, etc."
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
                            {isEdit ? 'Guardar Cambios' : 'Agendar Entrega'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
