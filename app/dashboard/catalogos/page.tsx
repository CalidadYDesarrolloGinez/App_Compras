'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Plus, Trash2, Pencil, Factory, Package, Layers, MapPin, ClipboardList, Scale } from 'lucide-react'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { QuickAddModal } from '@/components/forms/QuickAddModal'
import { toggleCatalogStatus, deleteCatalogEntry } from '@/lib/actions/catalogos'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"

export default function CatalogosPage() {
    const { catalogos, loading, refresh } = useCatalogos()
    const { canCreate, isAdmin } = useAuthRole()
    const [activeTab, setActiveTab] = useState('proveedores')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any | null>(null)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null)
    const [showInactive, setShowInactive] = useState(false)

    if (loading) {
        return <div className="p-8 mx-auto space-y-4 max-w-7xl"><Skeleton className="h-10 text-xl w-64" /><Skeleton className="h-96 w-full" /></div>
    }

    const getActiveConfig = () => {
        switch (activeTab) {
            case 'proveedores': return { title: 'Proveedor', table: 'proveedores' }
            case 'productos': return { title: 'Producto', table: 'productos' }
            case 'presentaciones': return { title: 'Presentación', table: 'presentaciones' }
            case 'destinos': return { title: 'Destino', table: 'destinos' }
            case 'estatus': return { title: 'Estatus', table: 'estatus' }
            case 'unidades': return { title: 'Unidad', table: 'unidades' }
            default: return { title: '', table: '' }
        }
    }

    const { title, table } = getActiveConfig()

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setActionLoading(id)
        try {
            const result = await toggleCatalogStatus(table, id, !currentStatus)
            if (result.error) throw new Error(result.error)
            toast.success('Estado actualizado')
            refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteConfirm) return
        setActionLoading(deleteConfirm.id)
        try {
            const result = await deleteCatalogEntry(table, deleteConfirm.id)
            if (result.error) throw new Error(result.error)
            toast.success('Registro eliminado')
            refresh()
            setDeleteConfirm(null)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setActionLoading(null)
        }
    }

    // Helper renderer
    const renderList = (items: any[], columns: { key: string, label: string }[]) => {
        const filteredItems = showInactive ? items : items.filter(item => item.activo)

        return (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#1A2B4A] dark:bg-[var(--card)] text-white dark:text-[var(--foreground)] border-b border-[var(--border)]">
                        <tr>
                            {columns.map(col => <th key={col.key} className="px-4 py-3 font-medium uppercase tracking-wider">{col.label}</th>)}
                            <th className="px-4 py-3 font-medium text-center uppercase tracking-wider w-32">Estado</th>
                            <th className="px-4 py-3 font-medium text-right uppercase tracking-wider w-24">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] bg-[var(--card)] text-[var(--foreground)]">
                        {filteredItems.map(item => (
                            <tr key={item.id} className={`hover:bg-[var(--bg)] transition-colors ${!item.activo && 'bg-[var(--bg)] opacity-95 grayscale-[0.3]'}`}>
                                {columns.map(col => (
                                    <td key={col.key} className={`px-4 py-3 ${!item.activo && 'text-[var(--muted)]'}`}>
                                        {col.key === 'color_hex' ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded border border-[var(--border)] shadow-sm" style={{ backgroundColor: item[col.key] }} />
                                                <span className="font-mono text-xs text-[var(--muted)]">{item[col.key]}</span>
                                            </div>
                                        ) : item[col.key]}
                                    </td>
                                ))}
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => handleToggleStatus(item.id, item.activo)}
                                        disabled={actionLoading === item.id}
                                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${item.activo
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                            : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20'
                                            }`}
                                    >
                                        {item.activo ? 'Activo' : 'Inactivo'}
                                    </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-1">
                                        {(isAdmin || canCreate) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[var(--muted)] hover:text-blue-600 hover:bg-blue-50"
                                                onClick={() => {
                                                    setEditingItem(item)
                                                    setIsAddModalOpen(true)
                                                }}
                                                disabled={actionLoading === item.id}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        {isAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-[var(--muted)] hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setDeleteConfirm({ id: item.id, name: item.nombre })}
                                                disabled={actionLoading === item.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 && (
                            <tr><td colSpan={columns.length + 2} className="px-4 py-12 text-center text-[var(--muted)] italic">No hay registros {showInactive ? '' : 'activos'} definidos aún</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-[#3558a0] p-3 rounded-xl shadow-lg shadow-blue-900/10">
                        <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1A2B4A]">Catálogos del Sistema</h1>
                        <p className="text-sm text-[var(--muted)]">Gestione los datos maestros utilizados en las requisiciones.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2 bg-[var(--bg)]/50 px-3 py-1.5 rounded-lg border border-[var(--border)]/50">
                        {showInactive ? <Eye className="h-4 w-4 text-[#3558a0]" /> : <EyeOff className="h-4 w-4 text-[var(--muted)]" />}
                        <Label htmlFor="show-inactive" className="text-xs font-medium text-[var(--muted)] cursor-pointer">Ver Inactivos</Label>
                        <Switch
                            id="show-inactive"
                            checked={showInactive}
                            onCheckedChange={setShowInactive}
                            className="scale-75 data-[state=checked]:bg-[#3558a0]"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setEditingItem(null)
                            setIsAddModalOpen(true)
                        }}
                        className="bg-[#3558a0] hover:bg-[#1A2B4A] text-white shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo {title}
                    </Button>
                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-[var(--bg)]/80 p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-6 border border-[var(--border)]/50">
                    <TabsTrigger value="proveedores" className="rounded-lg py-2.5 px-4 flex items-center gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[#3558a0] data-[state=active]:shadow-md transition-all">
                        <Factory className="h-4 w-4" />
                        Proveedores
                    </TabsTrigger>
                    <TabsTrigger value="productos" className="rounded-lg py-2.5 px-4 flex items-center gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[#3558a0] data-[state=active]:shadow-md transition-all">
                        <Package className="h-4 w-4" />
                        Productos
                    </TabsTrigger>
                    <TabsTrigger value="presentaciones" className="rounded-lg py-2.5 px-4 flex items-center gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[#3558a0] data-[state=active]:shadow-md transition-all">
                        <Layers className="h-4 w-4" />
                        Presentaciones
                    </TabsTrigger>
                    <TabsTrigger value="destinos" className="rounded-lg py-2.5 px-4 flex items-center gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[#3558a0] data-[state=active]:shadow-md transition-all">
                        <MapPin className="h-4 w-4" />
                        Destinos
                    </TabsTrigger>
                    <TabsTrigger value="estatus" className="rounded-lg py-2.5 px-4 flex items-center gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[#3558a0] data-[state=active]:shadow-md transition-all">
                        <ClipboardList className="h-4 w-4" />
                        Estatus
                    </TabsTrigger>
                    <TabsTrigger value="unidades" className="rounded-lg py-2.5 px-4 flex items-center gap-2 data-[state=active]:bg-[var(--card)] data-[state=active]:text-[#3558a0] data-[state=active]:shadow-md transition-all">
                        <Scale className="h-4 w-4" />
                        Unidades
                    </TabsTrigger>
                </TabsList>

                <div className="bg-[var(--card)] rounded-2xl shadow-sm border border-[var(--border)] p-8 min-h-[500px]">
                    <TabsContent value="proveedores" className="m-0 focus-visible:outline-none">
                        {renderList(catalogos.proveedores, [{ key: 'nombre', label: 'Nombre de la empresa' }])}
                    </TabsContent>

                    <TabsContent value="productos" className="m-0 focus-visible:outline-none">
                        {renderList(catalogos.productos, [
                            { key: 'nombre', label: 'Nombre del Producto' },
                            { key: 'descripcion', label: 'Descripción' }
                        ])}
                    </TabsContent>

                    <TabsContent value="presentaciones" className="m-0 focus-visible:outline-none">
                        {renderList(catalogos.presentaciones, [{ key: 'nombre', label: 'Tipo de Envase/Empaque' }])}
                    </TabsContent>

                    <TabsContent value="destinos" className="m-0 focus-visible:outline-none">
                        {renderList(catalogos.destinos, [{ key: 'nombre', label: 'Ubicación' }])}
                    </TabsContent>

                    <TabsContent value="estatus" className="m-0 focus-visible:outline-none">
                        {renderList(catalogos.estatus, [
                            { key: 'nombre', label: 'Estado' },
                            { key: 'color_hex', label: 'Color Asignado (HEX)' }
                        ])}
                    </TabsContent>

                    <TabsContent value="unidades" className="m-0 focus-visible:outline-none">
                        {renderList(catalogos.unidades, [
                            { key: 'nombre', label: 'Unidad de Medida' },
                            { key: 'abreviatura', label: 'Abrev.' }
                        ])}
                    </TabsContent>
                </div>
            </Tabs>

            <QuickAddModal
                open={isAddModalOpen}
                onOpenChange={(open) => {
                    setIsAddModalOpen(open)
                    if (!open) setEditingItem(null)
                }}
                title={title}
                table={table}
                initialData={editingItem}
                onSuccess={() => {
                    refresh()
                    setIsAddModalOpen(false)
                }}
            />

            <Dialog open={!!deleteConfirm} onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Está completamente seguro?</DialogTitle>
                        <DialogDescription>
                            Esta acción eliminará permanentemente el registro "{deleteConfirm?.name}" del catálogo.
                            Si el registro tiene dependencias, no se podrá eliminar y se sugerirá desactivarlo.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
