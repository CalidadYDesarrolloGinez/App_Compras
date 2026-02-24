'use client'

import React from 'react'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
    Filter,
    X,
    Calendar as CalendarIcon,
    XCircle,
    CheckCircle2,
    Search,
    Truck,
    Clock,
    PackageCheck,
    AlertCircle,
    LucideIcon,
    ClipboardList,
    Factory
} from 'lucide-react'
import type { RequisicionFilters } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SidebarFiltersProps {
    filters: RequisicionFilters
    onFilterChange: (filters: RequisicionFilters) => void
}

const STATUS_ICONS: Record<string, LucideIcon> = {
    'cancelado': XCircle,
    'confirmado': CheckCircle2,
    'en revisión': Search,
    'en revision': Search,
    'en tránsito': Truck,
    'en transito': Truck,
    'pendiente': Clock,
    'recibido': PackageCheck,
}

const getStatusIcon = (statusName: string = '') => {
    return STATUS_ICONS[statusName.toLowerCase()] || AlertCircle
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
            <CardHeader className="pt-2 pb-0 px-3.5 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1.5">
                    <CardTitle className="text-[13px] font-bold text-[#4266ac] flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-[#4266ac]" />
                        Filtrar Vista
                    </CardTitle>
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            className="h-5 w-5 text-[#c41f1a] hover:text-red-700 hover:bg-red-50 rounded-full"
                            title="Limpiar filtros"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
                {/* Status Legend Guide */}
                <div className="space-y-1 pt-0 pb-2 border-b border-gray-100/80">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-0.5">Guía de Estatus</label>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 px-0.5">
                        {catalogos.estatus.map(e => {
                            const Icon = getStatusIcon(e.nombre)
                            return (
                                <div key={e.id} className="flex items-center gap-1.5">
                                    <Icon
                                        size={10}
                                        style={{ color: e.color_hex }}
                                        className="shrink-0"
                                    />
                                    <span className="text-[9px] font-semibold text-gray-600 truncate uppercase tracking-tighter">
                                        {e.nombre}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                        <ClipboardList className="h-3 w-3 text-gray-400" />
                        Estatus
                    </label>
                    <Select
                        value={filters.estatus_id || 'all'}
                        onValueChange={(val) => handleChange('estatus_id', val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#4266ac] pl-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <ClipboardList className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <SelectValue placeholder="Todos los estatus" />
                            </div>
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

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                        <Factory className="h-3 w-3 text-gray-400" />
                        Proveedor
                    </label>
                    <Select
                        value={filters.proveedor_id || 'all'}
                        onValueChange={(val) => handleChange('proveedor_id', val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#4266ac] pl-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Factory className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <SelectValue placeholder="Todos los proveedores" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los proveedores</SelectItem>
                            {catalogos.proveedores.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3 text-gray-400" />
                        Desde Fecha
                    </label>
                    <div className="relative max-w-[140px]">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            type="date"
                            className="h-9 pl-9 bg-white border-gray-200 text-xs shadow-sm focus:ring-[#4266ac]"
                            value={filters.fecha_desde || ''}
                            onChange={(e) => handleChange('fecha_desde', e.target.value || 'all')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
