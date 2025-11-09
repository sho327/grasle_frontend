// Modules
import { redirect } from 'next/navigation'
// Page/Components
import ProjectList from '@/components/page/main/project/list'
// Supabase
import { fetchProjectsList, ProjectWithDetails } from '@/lib/supabase/projectData'

/**
 * プロジェクト一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/09
 */
export default async function ProjectListPage() {
    // 1. プロジェクト一覧データをフェッチ
    const projects = await fetchProjectsList()

    // 2. データがない場合はリダイレクト（未認証またはエラー時）
    // RLSエラーや認証エラーの場合、fetchProjectsListは null を返す
    if (!projects) {
        // 例: ログインページやエラーページへリダイレクト
        redirect('/auth/login')
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return <ProjectList projects={projects} />
}
