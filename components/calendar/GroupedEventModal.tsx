'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Requisicion } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface GroupedEventModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    requisiciones: Requisicion[]
    date: string
    providerName: string
    onRequisicionClick: (req: Requisicion) => void
}

export function GroupedEventModal({
    open,
    onOpenChange,
    requisiciones,
    date,
    providerName,
    onRequisicionClick,
}: GroupedEventModalProps) {
    if (!requisiciones || requisiciones.length === 0) return null

    // FullCalendar's startStr logic might append time or not, so we make sure to just parse YYYY-MM-DD correctly.
    const dateStr = date.split('T')[0]
    const formattedDate = dateStr ? format(new Date(dateStr + 'T12:00:00'), "EEEE d 'de' MMMM, yyyy", { locale: es }) : ''

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[var(--card)] border border-[var(--border)] shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <div className="bg-[#1A2B4A] px-6 py-4 sticky top-0 z-20">
                    <DialogTitle className="text-slate-50 text-lg font-bold">
                        {providerName}
                    </DialogTitle>
                    <DialogDescription className="text-slate-300 text-xs mt-1 capitalize font-medium">
                        {formattedDate} · {requisiciones.length} {requisiciones.length === 1 ? 'entrega programada' : 'entregas programadas'}
                    </DialogDescription>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                        {requisiciones.map((req) => (
                            <div
                                key={req.id}
                                className="border border-[var(--border)] rounded-md p-3 hover:bg-[var(--bg)] cursor-pointer transition-colors shadow-sm"
                                onClick={() => onRequisicionClick(req)}
                                style={{ borderLeft: `4px solid ${req.estatus?.color_hex || '#4266ac'}` }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-sm text-[var(--foreground)]">
                                        {req.producto?.nombre}
                                    </div>
                                    <Badge
                                        variant="outline"
                                        style={{
                                            backgroundColor: `${req.estatus?.color_hex}15` || '#f1f5f9',
                                            color: req.estatus?.color_hex || '#4266ac',
                                            borderColor: `${req.estatus?.color_hex}40` || '#cbd5e1'
                                        }}
                                        className="text-[10px] whitespace-nowrap ml-2"
                                    >
                                        {req.estatus?.nombre}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs text-[var(--muted)]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Cantidad</span>
                                        <span className="font-medium text-[var(--foreground)]">{req.cantidad_solicitada} {req.unidad_cantidad?.abreviatura}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[10px] uppercase font-bold text-[var(--muted)]">Folio OC</span>
                                        <span className="font-medium text-[var(--foreground)]">{req.numero_oc || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
