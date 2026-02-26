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
        <Card className="gap-0 py-0 shadow-sm border-[var(--border)] bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
            <CardHeader className="pt-3 pb-3 px-3.5 border-b border-[var(--border)] bg-[var(--card)] opacity-95 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[13px] font-bold text-[var(--navy)] flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-[var(--navy)]" />
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
            <CardContent className="p-3 pt-4 space-y-4">

                <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                        <Factory className="h-3 w-3 text-[var(--muted)]" />
                        Proveedor
                    </label>
                    <Select
                        value={filters.proveedor_id || 'all'}
                        onValueChange={(val) => handleChange('proveedor_id', val)}
                        disabled={loading}
                    >
                        <SelectTrigger className="h-9 bg-[var(--card)] border-[var(--border)] text-xs shadow-sm focus:ring-[#4266ac] pl-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <Factory className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
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
                    <label className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider ml-0.5 flex items-center gap-1.5">
                        <CalendarIcon className="h-3 w-3 text-[var(--muted)]" />
                        Desde Fecha
                    </label>
                    <div className="relative max-w-[140px]">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted)]" />
                        <Input
                            type="date"
                            className="h-9 pl-9 bg-[var(--card)] border-[var(--border)] text-xs shadow-sm focus:ring-[#4266ac]"
                            value={filters.fecha_desde || ''}
                            onChange={(e) => handleChange('fecha_desde', e.target.value || 'all')}
                        />
                    </div>
                </div>
            </CardContent>
        </Card >
    )
}
