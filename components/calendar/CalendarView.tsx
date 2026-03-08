'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import type { Requisicion, CalendarEvent } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useCatalogos } from '@/lib/hooks/useCatalogos'
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

// Map status names to Lucide icons
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

interface CalendarViewProps {
    requisiciones: Requisicion[]
    isLoading: boolean
    onEventClick: (req: Requisicion) => void
    onGroupedEventClick?: (requisiciones: Requisicion[], providerName: string, date: string) => void
}

export function CalendarView({ requisiciones, isLoading, onEventClick, onGroupedEventClick }: CalendarViewProps) {
    const { catalogos } = useCatalogos()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || isLoading) {
        return (
            <div className="h-full min-h-[500px] flex flex-col gap-2">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-10 w-48" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 h-full flex-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <Skeleton key={i} className="h-full w-full rounded-md min-h-[100px]" />
                    ))}
                </div>
            </div>
        )
    }

    // Group requisitions by date and provider
    const groupedMap = new Map<string, Requisicion[]>()
    requisiciones.forEach((req) => {
        const date = req.fecha_confirmada || req.fecha_recepcion || ''
        const providerId = req.proveedor_id || 'unknown'
        const key = `${date}_${providerId}`
        if (!groupedMap.has(key)) {
            groupedMap.set(key, [])
        }
        groupedMap.get(key)!.push(req)
    })

    const events: CalendarEvent[] = []
    groupedMap.forEach((reqs, key) => {
        const date = key.split('_')[0]
        const providerName = reqs[0].proveedor?.nombre || 'Proveedor Desconocido'
        const count = reqs.length

        const firstColor = reqs[0].estatus?.color_hex || '#4266ac'
        const isSameColor = reqs.every(r => (r.estatus?.color_hex || '#4266ac') === firstColor)
        const eventColor = isSameColor ? firstColor : '#64748b' // Slate 500 for mixed
        const isMixed = !isSameColor

        events.push({
            id: key,
            title: providerName,
            start: date, // YYYY-MM-DD format
            backgroundColor: eventColor,
            borderColor: eventColor,
            extendedProps: {
                isGrouped: true,
                requisiciones: reqs,
                proveedor_nombre: providerName,
                count: count,
                estatus_color: eventColor,
                estatus_nombre: reqs[0].estatus?.nombre,
                isMixed: isMixed
            }
        } as any)
    })

    // Custom render for the event block inside the grid cell
    const renderEventContent = (eventInfo: any) => {
        const { event } = eventInfo
        const props = event.extendedProps
        const color = props.estatus_color || '#4266ac'
        const isMixed = props.isMixed

        const StatusIcon = isMixed ? Layers : getStatusIcon(props.estatus_nombre)

        // Compute a lighter version for the background
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '14, 12, 155'
        }

        const rgb = hexToRgb(color)

        return (
            <div
                className="flex flex-col w-full overflow-hidden rounded-[4px] cursor-pointer relative"
                style={{
                    background: `rgba(${rgb}, 0.12)`,
                    borderLeft: `4px solid ${color}`,
                    padding: '6px 8px',
                    minHeight: '42px',
                }}
                title={`${event.title} (${props.count} requisiciones)`}
            >
                {/* Background Icon Watermark */}
                <div className="absolute -left-1 opacity-20" style={{ top: '50%', transform: 'translateY(-50%)' }}>
                    <StatusIcon className="shrink-0" style={{ width: '32px', height: '32px', color: color }} />
                </div>

                <div className="flex items-center gap-1.5 min-w-0 relative z-10 pl-6">
                    <div
                        className="font-bold leading-tight truncate tracking-tight drop-shadow-sm"
                        style={{ fontSize: '0.85rem', color: color }}
                    >
                        {event.title}
                    </div>
                </div>
                <div
                    className="truncate leading-snug font-medium relative z-10 pl-6"
                    style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}
                >
                    {props.count} {props.count === 1 ? 'entrega' : 'entregas'}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full bg-[var(--card)] rounded-lg calendar-wrapper">
            <style jsx global>{`
                .calendar-wrapper .fc-daygrid-day-number {
                    font-size: 1.1rem !important;
                    font-weight: 600 !important;
                    color: #1e293b !important;
                    padding: 4px 8px !important;
                }
                .calendar-wrapper .fc-col-header-cell-cushion {
                    font-size: 0.85rem !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                }
            `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locales={[esLocale]}
                locale="es"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek',
                }}
                events={events as any}
                eventContent={renderEventContent}
                eventClick={(info) => {
                    const props = info.event.extendedProps
                    if (onGroupedEventClick) {
                        onGroupedEventClick(props.requisiciones, props.proveedor_nombre, info.event.startStr)
                    } else if (props.requisiciones.length === 1 && onEventClick) {
                        onEventClick(props.requisiciones[0])
                    }
                }}
                dayMaxEvents={3}
                height="100%"
                contentHeight="auto"
                aspectRatio={1.5}
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                }}
            />
        </div>
    )
}
