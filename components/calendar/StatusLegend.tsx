'use client'

import React from 'react'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
import type { RequisicionFilters } from '@/types'
import {
    XCircle,
    CheckCircle2,
    Search,
    Truck,
    Clock,
    PackageCheck,
    AlertCircle,
    LucideIcon,
    Layers
} from 'lucide-react'

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

interface StatusLegendProps {
    filters: RequisicionFilters
    onFilterChange: (filters: RequisicionFilters) => void
}

export function StatusLegend({ filters, onFilterChange }: StatusLegendProps) {
    const { catalogos } = useCatalogos()

    if (!catalogos?.estatus?.length) return null

    // Status filter handler
    const handleStatusClick = (statusId: string) => {
        if (statusId === 'all') {
            const newFilters = { ...filters }
            delete newFilters.estatus_id
            onFilterChange(newFilters)
        } else {
            // Toggle off if already selected, otherwise select
            if (filters.estatus_id === statusId) {
                const newFilters = { ...filters }
                delete newFilters.estatus_id
                onFilterChange(newFilters)
            } else {
                onFilterChange({ ...filters, estatus_id: statusId })
            }
        }
    }

    const currentEstatus = filters.estatus_id || 'all'

    return (
        <div className="flex items-center gap-2 bg-[var(--card)] px-2 py-1.5 rounded-full border border-[var(--border)] shadow-sm ml-auto">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {/* Botón de TODOS */}
                <button
                    onClick={() => handleStatusClick('all')}
                    className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 ${currentEstatus === 'all'
                        ? 'bg-[var(--bg)] text-[var(--foreground)] shadow-sm border border-[var(--border)] font-bold'
                        : 'hover:bg-[var(--bg)] text-[var(--muted)] font-semibold border border-transparent'
                        }`}
                >
                    <Layers size={16} className={currentEstatus === 'all' ? 'text-[var(--navy)]' : 'text-[var(--muted)]'} />
                    <span className="text-[12px] whitespace-nowrap tracking-wide">
                        TODOS
                    </span>
                </button>

                <div className="w-px h-5 bg-[var(--border)] mx-1 hidden md:block"></div>

                {/* Lista de Estados */}
                {catalogos.estatus.map(e => {
                    const Icon = getStatusIcon(e.nombre)
                    const isSelected = currentEstatus === e.id

                    return (
                        <button
                            key={e.id}
                            onClick={() => handleStatusClick(e.id)}
                            className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full transition-all duration-200 ${isSelected
                                ? 'shadow-sm'
                                : 'hover:bg-[var(--bg)] border border-transparent'
                                }`}
                            style={isSelected ? {
                                backgroundColor: `${e.color_hex}1A`, // 10% opacity
                                borderColor: `${e.color_hex}40`  // 25% opacity
                            } : {}}
                        >
                            <Icon
                                size={18}
                                style={{ color: e.color_hex }}
                                className={`transition-all ${isSelected ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}
                            />
                            <span
                                className={`text-[12px] whitespace-nowrap tracking-wide ${isSelected ? 'font-bold' : 'font-semibold text-[var(--muted)]'
                                    }`}
                                style={isSelected ? { color: e.color_hex } : {}}
                            >
                                {e.nombre}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
