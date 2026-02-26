"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Correct type definitions for next-themes
// By importing the entire namespace or declaring inline props since next-themes 
// type definitions sometimes conflict with React 19

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
