// Modules
import { redirect } from 'next/navigation'
// Page/Components
import MemberList from '@/components/page/main/member/list'

/**
 * チームメンバー一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/09
 */
export default async function MemberListPage() {
    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return <MemberList />
}
