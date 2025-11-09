// Modules
import { supabaseServer } from './server'
import type { User } from '@supabase/supabase-js'
// Types
import { ProjectRow } from '@/types/project'
import { TeamRow } from '@/types/team'
// Supabase
import { getSessionUser } from '@/lib/supabase/userData'

// ----------------------------------------------------
// プロジェクト一覧用の型定義
// ----------------------------------------------------

// Supabaseの集計結果が常に配列で返るため、タスク件数をオブジェクトの配列として定義
export type TaskCount = {
    count: number
}

/**
 * ProjectRow に、関連する Teams の情報（teams）とタスク件数（tasks）をネストした型
 */
export type ProjectWithDetails = ProjectRow & {
    // チーム名のみを取得
    teams: Pick<TeamRow, 'name'>
    // タスク件数 (PostgRESTの集計結果。tasks(count) の結果は常に配列)
    tasks: TaskCount[]
}

// ----------------------------------------------------
// プロジェクト一覧を取得する関数
// ----------------------------------------------------
/**
 * 認証済みユーザーが所属するチームの全プロジェクトと、関連情報をフェッチする
 * RLSにより自動で所属プロジェクトのみにフィルタリングされます。
 * * @returns ユーザーがアクセス可能なプロジェクトのリスト（ProjectWithDetails[]）
 * @createdBy KatoShogo
 * @createdAt 2025/11/09
 */
export async function fetchProjectsList(): Promise<ProjectWithDetails[] | null> {
    // RLSがセキュリティを担保するが、未認証アクセスを防ぐためセッションを確認
    const user = await getSessionUser()
    if (!user) {
        return null
    }

    const supabase = await supabaseServer()

    const { data: projectsList, error } = await supabase
        .from('projects')
        .select(
            `
                id,
                team_id,
                name,
                description,
                image_url,
                status,
                start_date,
                end_date,
                created_at,
                updated_at,
                teams (
                    name
                ),
                tasks (
                    count
                )
            `
        )
        .order('created_at', { ascending: false }) // 新しいプロジェクトを上に

    if (error) {
        console.error('Error fetching projects list:', error.message)
        return null
    }

    // 取得したデータを定義した ProjectWithDetails[] 型にキャスト
    return projectsList as unknown as ProjectWithDetails[]
}

// ----------------------------------------------------
// 個別プロジェクトの詳細を取得する関数
// ----------------------------------------------------
/**
 * 特定のプロジェクトIDの詳細情報（チーム名とタスク件数を含む）をフェッチする
 * RLSにより、アクセス権のないプロジェクトは null が返されます。
 * * @param projectId 取得したいプロジェクトのUUID
 * @returns ProjectWithDetails または null
 */
export async function fetchProjectDetails(projectId: string): Promise<ProjectWithDetails | null> {
    const user = await getSessionUser()
    if (!user) {
        return null
    }

    const supabase = await supabaseServer()

    const { data: projectData, error } = await supabase
        .from('projects')
        .select(
            `
                id,
                team_id,
                name,
                description,
                image_url,
                status,
                start_date,
                end_date,
                created_at,
                updated_at,
                teams (name),
                tasks (count)
            `
        )
        .eq('id', projectId)
        .single() // 単一の結果を期待

    if (error) {
        // RLSによる権限エラーもここで捕捉されます
        console.error(`Error fetching project details for ${projectId}:`, error.message)
        return null
    }

    // 取得したデータを ProjectWithDetails 型にキャスト
    return projectData as unknown as ProjectWithDetails
}
