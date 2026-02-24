'use client'

import { useState, useEffect } from 'react'
import { Plus, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const quickAddSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    descripcion: z.string().optional(),
    abreviatura: z.string().optional(),
    color_hex: z.string().optional(),
})

type QuickAddSchema = z.infer<typeof quickAddSchema>

interface QuickAddModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    table: string
    onSuccess: (newItem: any) => void
    initialData?: any | null
}

import { createCatalogEntry, updateCatalogEntry } from '@/lib/actions/catalogos'

export function QuickAddModal({
    open,
    onOpenChange,
    title,
    table,
    onSuccess,
    initialData,
}: QuickAddModalProps) {
    const [loading, setLoading] = useState(false)
    const isEditing = !!initialData?.id

    const form = useForm<QuickAddSchema>({
        resolver: zodResolver(quickAddSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            abreviatura: '',
            color_hex: '#3b82f6',
        },
    })

    // Update form when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                nombre: initialData.nombre || '',
                descripcion: initialData.descripcion || '',
                abreviatura: initialData.abreviatura || '',
                color_hex: initialData.color_hex || '#3b82f6',
            })
        } else {
            form.reset({
                nombre: '',
                descripcion: '',
                abreviatura: '',
                color_hex: '#3b82f6',
            })
        }
    }, [initialData, form, open])

    const onSubmit = async (values: QuickAddSchema) => {
        setLoading(true)
        try {
            // Clean up data based on table
            const data: any = { nombre: values.nombre }
            if (table === 'productos') data.descripcion = values.descripcion
            if (table === 'unidades') data.abreviatura = values.abreviatura
            if (table === 'estatus') data.color_hex = values.color_hex

            const result = isEditing
                ? await updateCatalogEntry(table, initialData.id, data)
                : await createCatalogEntry(table, data)

            if (result.error) throw new Error(result.error)

            toast.success(`${title} ${isEditing ? 'actualizado' : 'agregado'} correctamente`)
            onSuccess(result.data)
            if (!isEditing) form.reset()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(`Error al ${isEditing ? 'actualizar' : 'agregar'}: ` + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-white border-none shadow-2xl">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-[#1A2B4A]">
                        {isEditing ? 'Editar' : 'Agregar'} {title}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-gray-600 uppercase">Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder={`Ej: ${title === 'Proveedor' ? 'Distribuidora X' : 'Nombre'}`} {...field} className="h-9" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {table === 'productos' && (
                            <FormField
                                control={form.control}
                                name="descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-600 uppercase">Descripción</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Descripción breve..." {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {table === 'unidades' && (
                            <FormField
                                control={form.control}
                                name="abreviatura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-600 uppercase">Abreviatura</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej: KG, LT, PZ" {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {table === 'estatus' && (
                            <FormField
                                control={form.control}
                                name="color_hex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold text-gray-600 uppercase">Color distintivo</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input type="color" {...field} className="h-9 w-12 p-1" />
                                                <Input {...field} placeholder="#000000" className="h-9 flex-1" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                                className="text-gray-500"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[#1B3D8F] hover:bg-[#1A2B4A] text-white">
                                {loading ? (
                                    <Plus className="mr-2 h-4 w-4 animate-spin" />
                                ) : isEditing ? (
                                    <Save className="mr-2 h-4 w-4" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                {isEditing ? 'Actualizar' : 'Guardar'} Registro
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
