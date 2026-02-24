'use client'

import { Bell, LogOut, ChevronRight, User } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthRole } from '@/lib/hooks/useAuthRole'
import { signOut } from '@/lib/actions/auth'
import { Skeleton } from '@/components/ui/skeleton'

const ROL_LABELS: Record<string, string> = {
    admin: 'Administrador',
    coordinadora: 'Coordinadora de Compras',
    consulta: 'Usuario Consulta',
}

interface HeaderProps {
    breadcrumbs?: Array<{ label: string; href?: string }>
}

export function Header({ breadcrumbs = [] }: HeaderProps) {
    const { user, profile, loading } = useAuthRole()

    const initials = profile?.nombre_completo
        ? profile.nombre_completo
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
        : (user?.email?.[0] ?? 'U').toUpperCase()

    return (
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                        <span className={i === breadcrumbs.length - 1
                            ? 'font-medium text-[#4266ac]'
                            : 'text-gray-400 hover:text-gray-600 cursor-pointer'
                        }>
                            {crumb.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2.5 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-all">
                            {loading ? (
                                <Skeleton className="h-8 w-8 rounded-full" />
                            ) : (
                                <Avatar className="h-8 w-8 border border-gray-100">
                                    <AvatarFallback className="bg-[#4266ac] text-white text-xs font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div className="text-left hidden sm:block">
                                {loading ? (
                                    <Skeleton className="h-3 w-24" />
                                ) : (
                                    <>
                                        <p className="text-xs font-semibold text-[#4266ac] leading-tight">
                                            {profile?.nombre_completo ?? user?.email}
                                        </p>
                                        <p className="text-[10px] text-gray-400 leading-tight uppercase tracking-wide">
                                            {ROL_LABELS[profile?.rol ?? ''] ?? profile?.rol}
                                        </p>
                                    </>
                                )}
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white opacity-100 shadow-xl border-gray-200">
                        <DropdownMenuLabel className="font-normal py-3">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-semibold text-gray-900">{profile?.nombre_completo}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard/configuracion">
                            <DropdownMenuItem className="gap-2 text-gray-700 cursor-pointer py-2.5">
                                <User className="h-4 w-4" />
                                Mi perfil
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer py-2.5"
                            onClick={() => signOut()}
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
