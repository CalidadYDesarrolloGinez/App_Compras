'use client'

import React from 'react'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react'
import type { RequisicionFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SidebarFiltersProps {
    filters: RequisicionFilters
    onFilterChange: (filters: RequisicionFilters) => void
}

export function SidebarFilters({ filters, onFilterChange }: SidebarFiltersProps) {
    const { catalogos, loading } = useCatalogos()

    const handleClear = () => {
        onFilterChange({})
    }

    const handleChange = (key: keyof RequisicionFilters, value: string) => {
        if (value === 'all') {
            const newFilters = { ...filters }
            delete newFilters[key]
            onFilterChange(newFilters)
        } else {
            onFilterChange({ ...filters, [key]: value })
        }
    }

    const hasFilters = Object.keys(filters).length > 0

    return (
        <Card className="shadow-sm border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader className="pb-3 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-[#0e0c9b] flex items-center gap-2">
                        <Filter className="h-4 w-4 text-[#0e0c9b]" />
                        Filtrar Vista
                    </CardTitle>
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="h-6 w-6 text-[#c41f1a] hover:text-red-700 hover:bg-red-50 rounded-full"
                            title="Limpiar filtros"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Proveedor</label>
                    <Select
                        value={filters.proveedor_id || 'all'}
                        onValueChange={(val) => handleChange('proveedor_id', val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#0e0c9b]">
                            <SelectValue placeholder="Todos los proveedores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los proveedores</SelectItem>
                            {catalogos.proveedores.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Destino</label>
                    <Select
                        value={filters.destino_id || 'all'}
                        onValueChange={(val) => handleChange('destino_id', val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#0e0c9b]">
                            <SelectValue placeholder="Todos los destinos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los destinos</SelectItem>
                            {catalogos.destinos.map(d => (
                                <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Estatus</label>
                    <Select
                        value={filters.estatus_id || 'all'}
                        onValueChange={(val) => handleChange('estatus_id', val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#0e0c9b]">
                            <SelectValue placeholder="Todos los estatus" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estatus</SelectItem>
                            {catalogos.estatus.map(e => (
                                <SelectItem key={e.id} value={e.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color_hex }} />
                                        {e.nombre}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Desde Fecha</label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            type="date"
                            className="h-9 pl-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#0e0c9b]"
                            value={filters.fecha_desde || ''}
                            onChange={(e) => handleChange('fecha_desde', e.target.value || 'all')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
