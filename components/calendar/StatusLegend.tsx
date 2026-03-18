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
        <div className="flex flex-wrap items-center gap-2">
            {/* Botón de TODOS */}
            <button
                onClick={() => handleStatusClick('all')}
                onMouseDown={(e) => e.preventDefault()}
                className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 border ${currentEstatus === 'all'
                    ? 'bg-[var(--navy)] text-white shadow-sm border-[var(--navy)] font-bold'
                    : 'bg-[var(--card)] hover:bg-[var(--bg)] text-[var(--muted)] font-semibold border-[var(--border)]'
                    }`}
            >
                <Layers size={14} className={currentEstatus === 'all' ? 'text-white' : 'text-[var(--muted)]'} />
                <span className="text-[11px] whitespace-nowrap tracking-wide">
                    TODOS
                </span>
            </button>

            {/* Lista de Estados */}
            {catalogos.estatus.map(e => {
                const Icon = getStatusIcon(e.nombre)
                const isSelected = currentEstatus === e.id

                return (
                    <button
                        key={e.id}
                        onClick={() => handleStatusClick(e.id)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full transition-all duration-200 border-2 ${isSelected
                            ? 'shadow-sm font-bold scale-105'
                            : 'bg-[var(--card)] hover:bg-[var(--bg)] font-semibold text-[var(--muted)] opacity-85 hover:opacity-100'
                            }`}
                        style={{
                            borderColor: isSelected ? e.color_hex : `${e.color_hex}33`, // 100% vs 20% opacity
                            backgroundColor: isSelected ? `${e.color_hex}1A` : 'transparent', // 10% vs 0%
                            color: isSelected ? e.color_hex : undefined
                        }}
                    >
                        <Icon
                            size={14}
                            style={{ color: e.color_hex }}
                            className={`transition-all ${isSelected ? 'scale-110' : 'opacity-90'}`}
                        />
                        <span className="text-[11px] whitespace-nowrap tracking-wide">
                            {e.nombre}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
