// Modules
import { cookies } from 'next/headers'

// Page/Components
import TaskList from '@/components/page/main/tasks'
// Supabase
import { fetchTasksByGroup } from '@/lib/supabase/taskData'

const SELECTED_GROUP_ID_COOKIE = 'selectedGroupId'

/**
 * タスク一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default async function TaskListPage() {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    // 1. Cookieから選択グループIDを取得
    const cookieStore = (await cookies()) as any
    const selectedGroupId = cookieStore.get(SELECTED_GROUP_ID_COOKIE)?.value || null
    if (!selectedGroupId) {
        // レイアウトがフォールバックに失敗した場合のみ発生するエラー
        // ユーザーにはログインを促すか、システムエラーとして処理します。
        // ※ ログアウト直後の場合は、リダイレクトされるためここには到達しないはずです。
        return (
            <div className="p-8 text-center">
                <p>グループIDが見つかりませんでした。ログイン状態をご確認ください。</p>
            </div>
        )
    }
    // 2. 有効なIDが確定している前提で、タスクデータをフェッチ
    const tasks = await fetchTasksByGroup(selectedGroupId)

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return <TaskList />
}
