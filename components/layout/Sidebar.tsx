'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
    LayoutDashboard,
    CalendarDays,
    ClipboardList,
    BookOpen,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    History,
    Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthRole } from '@/lib/hooks/useAuthRole'

const navItems = [
    {
        section: 'GENERAL',
        items: [
            { href: '/dashboard/calendar', label: 'Panel Principal', icon: LayoutDashboard },
            { href: '/dashboard/calendar', label: 'Calendario', icon: CalendarDays },
        ],
    },
    {
        section: 'COMPRAS',
        items: [
            { href: '/dashboard/requisiciones', label: 'Requisiciones', icon: ClipboardList },
            { href: '/dashboard/catalogos', label: 'Catálogos', icon: BookOpen },
        ],
    },
    {
        section: 'SOPORTE',
        items: [
            { href: '/dashboard/historial', label: 'Historial', icon: History },
            { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
        ],
    },
]

const adminItems = [
    { href: '/dashboard/admin', label: 'Administración', icon: Shield },
    { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const { isAdmin } = useAuthRole()

    return (
        <aside
            className={cn(
                'sidebar',
                collapsed && 'collapsed'
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
                <div className="bg-white/15 rounded-lg p-1.5">
                    <ShoppingCart className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden animate-slide-in">
                        <div className="text-sm font-bold text-white leading-tight">GínEZ</div>
                        <div className="text-xs text-white/50 leading-tight">Compras</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3">
                {navItems.map((section) => (
                    <div key={section.section}>
                        {!collapsed && (
                            <p className="sidebar-section-label">{section.section}</p>
                        )}
                        {section.items.map((item) => {
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
                ))}

                {isAdmin && (
                    <div>
                        {!collapsed && <p className="sidebar-section-label">ADMIN</p>}
                        {adminItems.map((item) => {
                            const Icon = item.icon
                            const active = pathname === item.href
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
                )}
            </nav>

            {/* Collapse toggle */}
            <div className="border-t border-white/10 p-3">
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center w-full p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
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
