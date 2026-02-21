'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import type { Requisicion, CalendarEvent } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface CalendarViewProps {
    requisiciones: Requisicion[]
    isLoading: boolean
    onEventClick: (req: Requisicion) => void
}

export function CalendarView({ requisiciones, isLoading, onEventClick }: CalendarViewProps) {
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

    // Transform requisiciones to FullCalendar format
    const events: CalendarEvent[] = requisiciones.map(req => {
        const eventColor = req.estatus?.color_hex || '#3b82f6'
        const title = `${req.producto?.nombre || 'S/P'} - ${req.proveedor?.nombre || 'S/P'}`
        return {
            id: req.id,
            title,
            start: req.fecha_confirmada || req.fecha_recepcion, // YYYY-MM-DD format
            backgroundColor: eventColor,
            borderColor: eventColor,
            extendedProps: {
                requisicion: req,
                proveedor_nombre: req.proveedor?.nombre || 'N/A',
                estatus_nombre: req.estatus?.nombre || 'N/A',
                estatus_color: eventColor,
            }
        }
    })

    // Custom render for the event block inside the grid cell
    const renderEventContent = (eventInfo: any) => {
        const { event } = eventInfo
        const props = event.extendedProps

        return (
            <div className="flex flex-col gap-0.5 overflow-hidden w-full text-[10px] leading-tight px-1 py-0.5" title={`${event.title} - ${props.proveedor_nombre}`}>
                <span className="font-bold truncate text-white">{event.title}</span>
                <span className="truncate text-white/80">{props.proveedor_nombre}</span>
            </div>
        )
    }

    return (
        <div className="h-full w-full bg-white rounded-lg">
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
                    onEventClick(info.event.extendedProps.requisicion)
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
