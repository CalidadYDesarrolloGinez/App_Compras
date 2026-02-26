'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
    collapsed?: boolean
}

export function ThemeToggle({ collapsed }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className={cn(
                "flex flex-row items-center justify-center p-2 rounded-lg text-[var(--muted)] opacity-50 cursor-not-allowed",
                !collapsed && "w-full justify-start px-4"
            )}>
                <Sun className="h-4 w-4" />
                {!collapsed && <span className="text-sm ml-3">Modo Claro</span>}
            </button>
        )
    }

    const isDark = theme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "flex flex-row items-center justify-center p-2 rounded-lg w-full transition-all",
                "text-[var(--muted)] hover:text-[var(--navy)] hover:bg-[var(--border)]",
                !collapsed && "justify-start px-4"
            )}
            title={collapsed ? (isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro") : undefined}
        >
            <div className="relative h-4 w-4 flex items-center justify-center">
                <Sun className={cn(
                    "h-4 w-4 absolute transition-all",
                    isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
                )} />
                <Moon className={cn(
                    "h-4 w-4 absolute transition-all",
                    isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                )} />
            </div>
            {!collapsed && (
                <span className="text-sm ml-3 truncate">
                    {isDark ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
            )}
        </button>
    )
}
