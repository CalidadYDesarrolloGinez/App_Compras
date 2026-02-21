'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import { Skeleton } from '@/components/ui/skeleton'

export default function CatalogosPage() {
    const { catalogos, loading } = useCatalogos()
    const { isAdmin } = useAuthRole()

    if (loading) {
        return <div className="p-8 mx-auto space-y-4 max-w-7xl"><Skeleton className="h-10 text-xl w-64" /><Skeleton className="h-96 w-full" /></div>
    }

    // Helper renderer
    const renderList = (items: any[], columns: { key: string, label: string }[]) => (
        <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-[#1A2B4A] text-white">
                    <tr>
                        {columns.map(col => <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>)}
                        <th className="px-4 py-3 font-medium text-right">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            {columns.map(col => (
                                <td key={col.key} className="px-4 py-3 text-gray-700">
                                    {col.key === 'color_hex' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full border border-gray-200" style={{ backgroundColor: item[col.key] }} />
                                            <span className="font-mono text-xs">{item[col.key]}</span>
                                        </div>
                                    ) : item[col.key]}
                                </td>
                            ))}
                            <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {item.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">No hay registros</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="flex flex-col h-full gap-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="bg-[#1B3D8F]/10 p-2 rounded-lg">
                    <BookOpen className="h-6 w-6 text-[#1B3D8F]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1A2B4A]">Catálogos del Sistema</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestión de catálogos base utilizados en las requisiciones.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="proveedores" className="w-full mt-4">
                <TabsList className="bg-gray-100 p-1 rounded-xl h-auto flex flex-wrap max-w-[800px]">
                    <TabsTrigger value="proveedores" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A2B4A] data-[state=active]:shadow-sm">Proveedores</TabsTrigger>
                    <TabsTrigger value="productos" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A2B4A] data-[state=active]:shadow-sm">Productos</TabsTrigger>
                    <TabsTrigger value="presentaciones" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A2B4A] data-[state=active]:shadow-sm">Presentaciones</TabsTrigger>
                    <TabsTrigger value="destinos" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A2B4A] data-[state=active]:shadow-sm">Destinos</TabsTrigger>
                    <TabsTrigger value="estatus" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A2B4A] data-[state=active]:shadow-sm">Estatus</TabsTrigger>
                    <TabsTrigger value="unidades" className="rounded-lg py-2 data-[state=active]:bg-white data-[state=active]:text-[#1A2B4A] data-[state=active]:shadow-sm">Unidades</TabsTrigger>
                </TabsList>

                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
                    {isAdmin && (
                        <div className="mb-6 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg flex justify-between items-center border border-blue-100">
                            <div><strong>Modo Administrador:</strong> La edición CRUD de catálogos se gestionará en un panel posterior.</div>
                        </div>
                    )}

                    <TabsContent value="proveedores" className="m-0 focus-visible:outline-none focus:outline-none">
                        {renderList(catalogos.proveedores, [{ key: 'nombre', label: 'Nombre de la empresa' }])}
                    </TabsContent>

                    <TabsContent value="productos" className="m-0 focus-visible:outline-none focus:outline-none">
                        {renderList(catalogos.productos, [
                            { key: 'nombre', label: 'Nombre del Producto' },
                            { key: 'descripcion', label: 'Descripción' }
                        ])}
                    </TabsContent>

                    <TabsContent value="presentaciones" className="m-0 focus-visible:outline-none focus:outline-none">
                        {renderList(catalogos.presentaciones, [{ key: 'nombre', label: 'Tipo de Envase/Empaque' }])}
                    </TabsContent>

                    <TabsContent value="destinos" className="m-0 focus-visible:outline-none focus:outline-none">
                        {renderList(catalogos.destinos, [{ key: 'nombre', label: 'Ubicación' }])}
                    </TabsContent>

                    <TabsContent value="estatus" className="m-0 focus-visible:outline-none focus:outline-none">
                        {renderList(catalogos.estatus, [
                            { key: 'nombre', label: 'Estado' },
                            { key: 'color_hex', label: 'Color Asignado (HEX)' }
                        ])}
                    </TabsContent>

                    <TabsContent value="unidades" className="m-0 focus-visible:outline-none focus:outline-none">
                        {renderList(catalogos.unidades, [
                            { key: 'nombre', label: 'Unidad de Medida' },
                            { key: 'abreviatura', label: 'Abrev.' }
                        ])}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
