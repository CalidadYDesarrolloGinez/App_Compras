'use client'

import { RequisicionFormModal } from '@/components/forms/RequisicionForm'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function NuevaRequisicionPage() {
    const router = useRouter()
    const [open, setOpen] = useState(true)

    // When the modal closes (via Cancel or Success), we go back to the table
    useEffect(() => {
        if (!open) {
            router.push('/dashboard/requisiciones')
        }
    }, [open, router])

    return (
        <div className="flex flex-col items-center justify-center h-full bg-[var(--bg)]">
            <div className="text-center">
                <h1 className="text-xl font-bold text-[#1A2B4A]">Nueva Requisición</h1>
                <p className="text-sm text-[var(--muted)]">Cargando formulario...</p>
            </div>
            <RequisicionFormModal
                open={open}
                onOpenChange={setOpen}
                onSuccess={() => {
                    setOpen(false)
                }}
            />
        </div>
    )
}
