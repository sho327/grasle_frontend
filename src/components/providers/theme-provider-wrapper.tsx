'use client'
// Modules
import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
// Stores
import { useCommonStore } from '@/store/common'

/**
 * テーマプロバイダー/ラップコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    const { theme } = useCommonStore()

    // ============================================================================
    // Effect(Watch)処理（Effect(Watch)）
    // ============================================================================
    // Zustand と next-themes の同期
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <ThemeProvider attribute="class" defaultTheme={theme}>
            {children}
        </ThemeProvider>
    )
}
