'use client'
// Modules
import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

/**
 * テーマプロバイダー/コンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
