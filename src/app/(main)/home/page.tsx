// Modules
import { redirect } from 'next/navigation'
// Page/Components
import Home from '@/components/page/main/home'

/**
 * ホームページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default async function HomePage() {
    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return <Home />
}
