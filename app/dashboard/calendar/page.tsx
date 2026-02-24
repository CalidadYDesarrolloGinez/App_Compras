'use client'

import { useState, useEffect } from 'react'
import { getRequisiciones } from '@/lib/actions/requisiciones'
import type { Requisicion, RequisicionFilters } from '@/types'
import { CalendarView } from '@/components/calendar/CalendarView'
import { SidebarFilters } from '@/components/calendar/SidebarFilters'
import { RequisicionFormModal } from '@/components/forms/RequisicionForm'
import { EventDetailModal } from '@/components/calendar/EventModal'
import { UpcomingDeliveries } from '@/components/layout/UpcomingDeliveries'

export default function CalendarPage() {
    const [requisiciones, setRequisiciones] = useState<Requisicion[]>([])
    const [filters, setFilters] = useState<RequisicionFilters>({})
    const [loading, setLoading] = useState(true)

    // Modal states
    const [formOpen, setFormOpen] = useState(false)
    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedReq, setSelectedReq] = useState<Requisicion | null>(null)

    const loadData = async () => {
        setLoading(true)
        const { data, error } = await getRequisiciones(filters)
        if (!error && data) {
            setRequisiciones(data as Requisicion[])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    return (
        <div className="flex flex-col h-full gap-4 w-full px-4 mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#4266ac]">Calendario de Recepción</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Visualiza y gestiona las entregas programadas de materias primas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0 container-calendar-main">
                <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[600px] flex flex-col">
                    <CalendarView
                        requisiciones={requisiciones}
                        isLoading={loading}
                        onEventClick={(req) => {
                            setSelectedReq(req)
                            setDetailOpen(true)
                        }}
                    />
                </div>

                <div className="xl:col-span-1 space-y-4">
                    <SidebarFilters filters={filters} onFilterChange={setFilters} />
                    <UpcomingDeliveries />
                </div>
            </div>

            <RequisicionFormModal
                open={formOpen}
                onOpenChange={setFormOpen}
                initialData={selectedReq}
                onSuccess={loadData}
            />

            <EventDetailModal
                open={detailOpen}
                onOpenChange={setDetailOpen}
                requisicion={selectedReq}
                onEdit={(req) => {
                    setSelectedReq(req)
                    setFormOpen(true)
                }}
                onSuccess={loadData}
            />
        </div>
    )
}
