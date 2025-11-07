// Layout/Components
import ClientAuthLayout from '@/components/layout/client-auth-layout'

/**
 * 認証レイアウト
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return <ClientAuthLayout>{children}</ClientAuthLayout>
}
