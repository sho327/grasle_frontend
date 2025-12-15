// Modules
import { redirect } from 'next/navigation'
// Page/Components
import ProjectList from '@/components/page/main/project/list'
// Supabase
import {
    fetchProjectsList,
    ProjectListOptions,
    ProjectWithDetails,
} from '@/lib/supabase/projectData'

interface ProjectListPageProps {
    searchParams: {
        search?: string // 検索テキスト
        dateFilter?: string // 日付フィルタータイプ (all/year/month)
        startDate?: string // 日付範囲の開始日
        endDate?: string // 日付範囲の終了日
        offset?: string // ページネーションのオフセット
        limit?: string // ページネーションのリミット
    }
}

/**
 * プロジェクト一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/09
 */
export default async function ProjectListPage({ searchParams }: ProjectListPageProps) {
    /* 1. ----- パラメータ読込 ----- */
    // searchParams を fetchProjectsList の options 型に変換
    const options: ProjectListOptions = {
        searchText: searchParams.search,
        // 日付フィルタリングロジックの調整 (page.tsxで行う)
        dateFilter:
            searchParams.dateFilter === 'year' || searchParams.dateFilter === 'month'
                ? searchParams.dateFilter
                : searchParams.startDate
                  ? { startDate: searchParams.startDate, endDate: searchParams.endDate }
                  : 'all',
        offset: searchParams.offset ? parseInt(searchParams.offset, 10) : 0,
        limit: searchParams.limit ? parseInt(searchParams.limit, 10) : 10,
    }

    /* 2. ----- プロジェクト一覧取得(検索パラメータ込) ----- */
    const projects = await fetchProjectsList(options)

    /* 3. ----- データ取得有無による分岐 ----- */
    // データがない場合はリダイレクト（未認証またはエラー時）
    // RLSエラーや認証エラーの場合、fetchProjectsListは null を返す
    if (!projects) {
        redirect('/auth/login')
    }

    // 3. データを Client Component のラッパーに渡す
    return (
        // ProjectList を Client Component のラッパーに変更します
        <ProjectList projects={projects} currentSearchParams={searchParams} />
    )
}
