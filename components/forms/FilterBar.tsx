'use client'

import { useCatalogos } from '@/lib/hooks/useCatalogos'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Filter, X, Search, Factory, MapPin, ClipboardList } from 'lucide-react'
import type { RequisicionFilters } from '@/types'
import { Button } from '@/components/ui/button'

interface FilterBarProps {
    filters: RequisicionFilters
    onFilterChange: (filters: RequisicionFilters) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
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
        <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mr-2 flex-shrink-0">
                <Filter className="h-4 w-4" />
                Filtros:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                <Select
                    value={filters.proveedor_id || 'all'}
                    onValueChange={(val) => handleChange('proveedor_id', val)}
                    disabled={loading}
                >
                    <SelectTrigger className="bg-[var(--bg)] opacity-95 border-[var(--border)] pl-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Factory className="h-4 w-4 text-[var(--muted)] shrink-0" />
                            <SelectValue placeholder="Proveedor..." />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los proveedores</SelectItem>
                        {catalogos.proveedores.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.destino_id || 'all'}
                    onValueChange={(val) => handleChange('destino_id', val)}
                    disabled={loading}
                >
                    <SelectTrigger className="bg-[var(--bg)] opacity-95 border-[var(--border)] pl-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <MapPin className="h-4 w-4 text-[var(--muted)] shrink-0" />
                            <SelectValue placeholder="Destino..." />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los destinos</SelectItem>
                        {catalogos.destinos.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.nombre}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.estatus_id || 'all'}
                    onValueChange={(val) => handleChange('estatus_id', val)}
                    disabled={loading}
                >
                    <SelectTrigger className="bg-[var(--bg)] opacity-95 border-[var(--border)] pl-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <ClipboardList className="h-4 w-4 text-[var(--muted)] shrink-0" />
                            <SelectValue placeholder="Estatus..." />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estatus</SelectItem>
                        {catalogos.estatus.map(e => (
                            <SelectItem key={e.id} value={e.id}>
                                <div className="flex items-center gap-2">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: e.color_hex }} />
                                    {e.nombre}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    <Input
                        type="date"
                        className="pl-9 bg-[var(--bg)] opacity-95 border-[var(--border)] text-sm"
                        value={filters.fecha_desde || ''}
                        onChange={(e) => handleChange('fecha_desde', e.target.value || 'all')}
                    />
                </div>
            </div>

            {hasFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto h-9 px-3 shrink-0"
                >
                    <X className="h-4 w-4 mr-1.5" />
                    Limpiar
                </Button>
            )}
        </div>
    )
}
