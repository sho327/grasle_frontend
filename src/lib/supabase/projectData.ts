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

/**
 * カスタム日付範囲指定用の型
 */
export interface DateRange {
    startDate?: string // yyyy-mm-dd
    endDate?: string // yyyy-mm-dd
}

/**
 * プロジェクト一覧のフィルタリングオプション
 */
export interface ProjectListOptions {
    searchText?: string
    // 定義済み期間 ('all'|'year'|'month') またはカスタム範囲 (DateRange)
    dateFilter?: 'all' | 'year' | 'month' | DateRange
    offset?: number
    limit?: number
}

/**
 * ProjectRow に、関連する Teams の情報とタスク件数をネストした型
 * NOTE: tasks は PostgRESTの集計結果により { count: number } の配列として返されます。
 */
export type ProjectWithDetails = ProjectRow & {
    // チーム名のみを取得
    teams: Pick<TeamRow, 'name'>
    // タスク件数: 常に [{ count: N }] の形式
    tasks: { count: number }[]
}

/**
 * プロジェクト一覧の取得結果（データ配列と総件数を同梱）
 */
export interface ProjectListResult {
    projects: ProjectWithDetails[]
    totalCount: number
}

// ----------------------------------------------------
// プロジェクト一覧を取得する関数
// ----------------------------------------------------
/**
 * 認証済みユーザーが所属するチームの全プロジェクトと、関連情報をフェッチする。
 * 1回のDBアクセスでリストデータと総件数を取得します。
 * @returns ユーザーがアクセス可能なプロジェクトのリストと総件数 (ProjectListResult | null)
 */
export async function fetchProjectsList(
    options: ProjectListOptions = {}
): Promise<ProjectListResult | null> {
    const user = await getSessionUser()
    if (!user) {
        return null
    }

    const supabase = await supabaseServer()

    // 1. クエリの初期設定と総件数取得オプションの適用
    let query = supabase
        .from('projects')
        .select(
            `
                id, team_id, name, description, image_url, status, start_date, end_date, 
                created_at, updated_at, teams (name), tasks (count)
            `,
            { count: 'exact' } // 1回のDBアクセスで総件数も取得
        )
        .order('created_at', { ascending: false })

    // 2. テキスト検索の適用
    if (options.searchText) {
        const search = `%${options.searchText}%`
        query = query.or(`name.ilike.${search},description.ilike.${search}`)
    }

    // 3. 日付範囲の計算と適用
    const today = new Date()
    let startDate: string | undefined
    let endDate: string | undefined

    // 定義済み期間の計算
    if (options.dateFilter === 'year') {
        startDate = `${today.getFullYear()}-01-01`
        endDate = `${today.getFullYear()}-12-31`
    } else if (options.dateFilter === 'month') {
        startDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-01`
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
    }
    // カスタム期間の適用
    else if (typeof options.dateFilter === 'object') {
        startDate = options.dateFilter.startDate
        endDate = options.dateFilter.endDate
    }

    // クエリへの適用 (endDateのみでの絞り込みも許可)
    if (startDate) {
        query = query.gte('end_date', startDate)
    }
    if (endDate) {
        query = query.lte('end_date', endDate)
    }

    // 4. ページネーションの適用
    const limit = options.limit || 10
    const offset = options.offset || 0
    query = query.range(offset, offset + limit - 1)

    // 5. 実行と結果返却
    const { data: projectsList, error, count } = await query

    if (error) {
        console.error('Error fetching projects list:', error.message)
        return null
    }

    return {
        projects: projectsList as unknown as ProjectWithDetails[],
        totalCount: count || 0,
    }
}

// ----------------------------------------------------
// 個別プロジェクトの詳細を取得する関数 (機能維持)
// ----------------------------------------------------
/**
 * 特定のプロジェクトIDの詳細情報（チーム名とタスク件数を含む）をフェッチする
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
        .single()

    if (error) {
        console.error(`Error fetching project details for ${projectId}:`, error.message)
        return null
    }

    return projectData as unknown as ProjectWithDetails
}
