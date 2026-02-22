'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    CalendarDays,
    ClipboardList,
    BookOpen,
    Settings,
    ChevronLeft,
    ChevronRight,
    Shield,
    Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthRole } from '@/lib/hooks/useAuthRole'

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const { isAdmin, isCoordinadora, canAccessAdmin, canCreate, canViewOnly, loading } = useAuthRole()

    // Items visible only to admin/coordinadora
    const fullNavItems = [
        { href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays },
        { href: '/dashboard/requisiciones', label: 'Administrar Requisiciones', icon: ClipboardList },
        { href: '/dashboard/catalogos', label: 'Catálogos', icon: BookOpen },
    ]

    // Items visible only to laboratorio/cedis
    const viewOnlyNavItems = [
        { href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays },
    ]

    const adminNavItems = [
        ...(canAccessAdmin ? [{ href: '/dashboard/admin', label: 'Administración', icon: Shield }] : []),
        { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
    ]

    const mainNavItems = canViewOnly ? viewOnlyNavItems : fullNavItems

    return (
        <aside
            className={cn(
                'sidebar',
                collapsed && 'collapsed'
            )}
        >
            {/* Logo */}
            <div className={cn(
                "flex items-center border-b border-gray-100 overflow-hidden bg-white",
                collapsed ? "px-4 py-5 justify-center" : "px-4 py-6 justify-center"
            )}>
                {collapsed ? (
                    <img
                        src="/logo-small.png"
                        alt="GínEZ Small"
                        className="h-7 w-auto object-contain animate-in fade-in duration-300"
                    />
                ) : (
                    <img
                        src="/Logo.png"
                        alt="GínEZ Logo"
                        className="w-full h-auto max-h-12 object-contain animate-in zoom-in-95 duration-500"
                    />
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3">
                {/* Main section */}
                <div>
                    {!collapsed && <p className="sidebar-section-label">GENERAL</p>}
                    {mainNavItems.map((item) => {
                        const Icon = item.icon
                        const active = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href + item.label}
                                href={item.href}
                                className={cn('sidebar-nav-item', active && 'active')}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && (
                                    <span className="text-sm whitespace-nowrap overflow-hidden animate-slide-in">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Admin section */}
                <div>
                    {!collapsed && <p className="sidebar-section-label">ADMINISTRACIÓN</p>}
                    {adminNavItems.map((item) => {
                        const Icon = item.icon
                        const active = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn('sidebar-nav-item', active && 'active')}
                                title={collapsed ? item.label : undefined}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {!collapsed && <span className="text-sm">{item.label}</span>}
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Collapse toggle */}
            <div className="border-t border-gray-100 p-3">
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center w-full p-2 rounded-lg text-gray-400 hover:text-[#0e0c9b] hover:bg-gray-50 transition-all"
                >
                    {collapsed
                        ? <ChevronRight className="h-4 w-4" />
                        : <ChevronLeft className="h-4 w-4" />
                    }
                </button>
            </div>
        </aside>
    )
}

export function useSidebar() {
    const [collapsed, setCollapsed] = useState(false)
    return { collapsed, toggle: () => setCollapsed((c) => !c) }
}
