'use client'

import { Sidebar, useSidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { collapsed, toggle } = useSidebar()
    const pathname = usePathname()

    const breadcrumbs = useMemo(() => {
        const paths = pathname.split('/').filter(Boolean)
        // Example: ['dashboard', 'calendar']
        if (paths.length < 2) return [{ label: 'Panel Principal' }]

        return [
            { label: paths[1].charAt(0).toUpperCase() + paths[1].slice(1) }
        ]
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
