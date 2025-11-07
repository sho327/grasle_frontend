// Modules
import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// Privider/Components
import { ThemeProviderWrapper } from '@/components/providers/theme-provider-wrapper'
// Layout/Components
import LoadingOverlay from '@/components/layout/parts/loading-overlay'
// Global/CSS
import '@/styles/globals.css'
// Constants
import { appInfo } from '@/constants/appInfo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: appInfo.APP_NAME,
    description: appInfo.APP_NAME,
    generator: appInfo.GENERATOR,
}

/**
 * 共通レイアウト
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <html lang="ja" suppressHydrationWarning>
            <body className={`${inter.className} font-sans antialiased`}>
                <ThemeProviderWrapper>
                    {children}
                    {/* ローディングオーバーレイ */}
                    <LoadingOverlay />
                </ThemeProviderWrapper>
            </body>
        </html>
    )
}

/**
  コンポーネント内でテーマを切り替える場合：
  Apply to layout.tsx
  テーマ切り替え
  ------------------------------------------------------------
  import { useTheme } from 'next-themes'

  function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    
    return (
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        テーマ切り替え
      </button>
    )
  }
  ------------------------------------------------------------
  このコンポーネントにより、ユーザーはアプリケーション全体でダークモードとライトモードを切り替えることができます。
 */
