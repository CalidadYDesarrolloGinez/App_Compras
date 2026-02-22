'use client'

import { Sidebar, useSidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useEffect } from 'react'
import { useAuthRole } from '@/lib/hooks/useAuthRole'

// Routes that require admin/coordinadora privileges
const PROTECTED_ROUTES = [
    '/dashboard/requisiciones',
    '/dashboard/catalogos',
    '/dashboard/admin',
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { collapsed, toggle } = useSidebar()
    const pathname = usePathname()
    const router = useRouter()
    const { role, canViewOnly, isPendiente, loading } = useAuthRole()

    // Route guard
    useEffect(() => {
        if (loading) return

        // Pending users: redirect to waiting screen
        if (isPendiente && pathname !== '/dashboard/pendiente') {
            router.replace('/dashboard/pendiente')
            return
        }

        // View-only roles: block access to protected routes
        if (canViewOnly) {
            const isBlocked = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
            if (isBlocked) {
                router.replace('/dashboard/calendar')
            }
        }
    }, [role, loading, pathname, canViewOnly, isPendiente, router])

    const breadcrumbs = useMemo(() => {
        const paths = pathname.split('/').filter(Boolean)
        if (paths.length < 2) return [{ label: 'Panel Principal' }]
        const labels: Record<string, string> = {
            calendar: 'Calendario',
            requisiciones: 'Requisiciones',
            catalogos: 'Catálogos',
            admin: 'Administración',
            configuracion: 'Configuración',
            pendiente: 'Acceso Pendiente',
        }
        return [{ label: labels[paths[1]] ?? paths[1].charAt(0).toUpperCase() + paths[1].slice(1) }]
    }, [pathname])

    return (
        <div className="min-h-screen bg-[#F8F9FC] flex">
            <Sidebar collapsed={collapsed} onToggle={toggle} />

            <div
                className="flex-1 flex flex-col min-h-screen"
                style={{
                    marginLeft: collapsed ? '64px' : '220px',
                    transition: 'margin-left 0.2s ease'
                }}
            >
                <Header breadcrumbs={breadcrumbs} />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
