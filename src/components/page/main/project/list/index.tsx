'use client'
// Modules
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
    FolderOpen,
    Star,
    Calendar,
    Users,
    MoreHorizontal,
    ListChecks,
    CheckCircle,
    Plus,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    ChevronLeft,
    X,
} from 'lucide-react'
import { formatDistanceToNowStrict, subDays, subWeeks, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
// Types
import { ProjectWithDetails } from '@/lib/supabase/projectData'
// UI/Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
// Layout/Components
import PageHeader from '@/components/layout/parts/page-header'

import { Button } from '@/components/ui/button'

interface ProjectListProps {
    projects: ProjectWithDetails[]
}

// ----------------------------------------------------
// ヘルパー関数 (タスク進捗計算)
// ----------------------------------------------------
// ProjectWithDetails には tasks: TaskCount[] が含まれているが、ここでは仮の進捗データを使用
// 実際にはタスクテーブルから完了/合計件数を取得する必要があります
const calculateProgress = (project: ProjectWithDetails) => {
    // ⚠️ 暫定値: tasks: [{ count: N }] はタスクの総件数のみの場合があるため、ここでは仮の進捗率を計算
    // 実際のアプリケーションでは、タスクテーブルから完了したタスクの数を取得して進捗率を計算してください。

    // 仮にタスク総数を取得
    const totalTasks = project.tasks?.[0]?.count || 0

    // 仮に、進捗率はIDの長さに基づいて決定 (デモ用)
    const progressValue = totalTasks > 0 ? (project.id.length * 5) % 100 : 0

    // 完了タスク数も仮で計算
    const completedTasks = Math.floor(totalTasks * (progressValue / 100))

    return { totalTasks, completedTasks, progressValue }
}

/**
 * プロジェクト一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function ProjectList({ projects }: ProjectListProps) {
    // ============================================================================
    // 状態管理（State）
    // ============================================================================
    // フィルター状態
    const [projectNameFilter, setProjectNameFilter] = useState('')
    const [lastUpdatedFilter, setLastUpdatedFilter] = useState<string>('all')
    const [favoriteFilter, setFavoriteFilter] = useState(false)
    const [isFilterOpen, setIsFilterOpen] = useState(true)

    // ページネーション状態
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 1 // 1ページあたりの件数

    // フィルタークリア関数
    const clearFilters = () => {
        setProjectNameFilter('')
        setLastUpdatedFilter('all')
        setFavoriteFilter(false)
    }

    // フィルターが適用されているかチェック
    const hasActiveFilters =
        projectNameFilter.trim() !== '' || lastUpdatedFilter !== 'all' || favoriteFilter

    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    // お気に入り状態を仮で追加（ハリボテ）
    const projectsWithFavorite = projects.map((project) => ({
        ...project,
        isFavorite: Math.random() > 0.5, // 仮のランダム値
    }))

    // フィルタリング処理
    const filteredProjects = useMemo(() => {
        let filtered = projectsWithFavorite

        // プロジェクト名でフィルタリング
        if (projectNameFilter.trim()) {
            filtered = filtered.filter((project) =>
                project.name.toLowerCase().includes(projectNameFilter.toLowerCase())
            )
        }

        // 最終更新日でフィルタリング
        if (lastUpdatedFilter !== 'all') {
            const now = new Date()
            let cutoffDate: Date

            switch (lastUpdatedFilter) {
                case 'today':
                    cutoffDate = subDays(now, 1)
                    break
                case 'week':
                    cutoffDate = subWeeks(now, 1)
                    break
                case 'month':
                    cutoffDate = subMonths(now, 1)
                    break
                default:
                    cutoffDate = new Date(0) // すべて
            }

            filtered = filtered.filter((project) => {
                if (!project.updated_at) return false
                const updatedAt = new Date(project.updated_at)
                return updatedAt >= cutoffDate
            })
        }

        // お気に入りでフィルタリング
        if (favoriteFilter) {
            filtered = filtered.filter((project) => project.isFavorite)
        }

        return filtered
    }, [projectsWithFavorite, projectNameFilter, lastUpdatedFilter, favoriteFilter])

    // ページネーション処理
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    // ページ番号の配列を生成（現在のページの前後を表示）
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisiblePages = 5 // 表示する最大ページ数

        if (totalPages <= maxVisiblePages) {
            // ページ数が少ない場合は全ページを表示
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // 現在のページの前後を表示
            if (currentPage <= 3) {
                // 最初の方
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                // 最後の方
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                // 中間
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
    }

    // フィルター変更時にページをリセット
    React.useEffect(() => {
        setCurrentPage(1)
    }, [projectNameFilter, lastUpdatedFilter, favoriteFilter])

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <PageHeader
                Icon={FolderOpen}
                // iconVariant="project-list"
                iconVariant="home"
                pageTitle="プロジェクト一覧"
                pageDescription="あなたが所属するプロジェクト一覧です。"
                isBackButton={false}
            />

            <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                    {/* プロジェクト名フィルター */}
                    <div className="space-y-1.5">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="プロジェクト名"
                                value={projectNameFilter}
                                onChange={(e) => setProjectNameFilter(e.target.value)}
                                className="w-32 rounded-lg bg-white pl-8 text-sm sm:w-48"
                            />
                        </div>
                    </div>
                    {/* 最終更新日フィルター */}
                    <div className="space-y-1.5">
                        <Select value={lastUpdatedFilter} onValueChange={setLastUpdatedFilter}>
                            <SelectTrigger className="w-32 rounded-lg bg-white text-sm sm:w-48">
                                <SelectValue placeholder="期間を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">すべて</SelectItem>
                                <SelectItem value="today">今日</SelectItem>
                                <SelectItem value="week">今週</SelectItem>
                                <SelectItem value="month">今月</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Button className="cursor-pointer rounded-lg shadow-sm">
                    <Plus className="mr-1 h-4 w-4" />
                    新規登録
                </Button>
            </div>
            {/* ページネーションセクション */}
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="me-0.5 text-sm">ページ</span>
                    {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="bg-white"
                    >
                        {'<<'}
                        最初
                    </Button> */}
                    {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="me-1 bg-white"
                    >
                        <ChevronLeft />
                    </Button> */}
                    {getPageNumbers().map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-2 text-sm text-slate-400"
                                >
                                    ...
                                </span>
                            )
                        }
                        const pageNum = page as number
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-6 min-w-6 cursor-pointer rounded-full px-2 text-sm transition-colors ${
                                    currentPage === pageNum
                                        ? 'bg-primary font-medium text-white'
                                        : 'hover:bg-primary/10 text-slate-600'
                                }`}
                            >
                                {pageNum}
                            </button>
                        )
                    })}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        className="ms-1 bg-white"
                    >
                        {/* {'>'} */}
                        <ChevronRight />
                    </Button>
                    {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage >= totalPages || totalPages === 0}
                        className="bg-white"
                    >
                        {'>>'}
                        最後
                    </Button> */}
                </div>
                <div className="flex items-center justify-between gap-2 border-slate-200">
                    <div className="text-sm text-slate-600">
                        {filteredProjects.length}件中 {startIndex + 1}〜
                        {Math.min(endIndex, filteredProjects.length)}件を表示
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProjects.map((project) => {
                    // 仮の進捗計算
                    const { totalTasks, completedTasks, progressValue } = calculateProgress(project)
                    // 最終更新からどれだけ時間が経過したかを計算 (date-fnsが必要)
                    const updatedText = project.updated_at
                        ? formatDistanceToNowStrict(new Date(project.updated_at), {
                              addSuffix: true,
                              locale: ja,
                          })
                        : '不明'

                    return (
                        <Card
                            key={project.id}
                            className="flex h-full flex-col gap-4.5 rounded-lg border border-slate-200 bg-white pt-2 pb-1.5 shadow-xs transition-shadow hover:shadow-lg"
                        >
                            {/* カードボディ: 上部メタ情報/タイトル/説明 */}
                            <div className="flex flex-grow flex-col px-4 pt-2.75">
                                {/* 1. ヘッダー/メタ情報 (最終更新, お気に入り、ドロップダウン) */}
                                <div className="mb-3.75 flex items-start justify-between">
                                    <div className="flex-grow">
                                        <p className="text-[.825rem] text-slate-500">
                                            最終更新: {updatedText}
                                        </p>
                                    </div>
                                    {/* お気に入り/ドロップダウン */}
                                    <div className="flex items-center gap-2">
                                        {/* お気に入りボタン */}
                                        <button
                                            type="button"
                                            className={`-mt-1 p-1 transition-colors ${
                                                project.isFavorite
                                                    ? 'text-amber-500 hover:text-amber-600'
                                                    : 'text-slate-400 hover:text-amber-500'
                                            }`}
                                        >
                                            <Star
                                                className={`h-4 w-4 ${
                                                    project.isFavorite ? 'fill-amber-500' : ''
                                                }`}
                                            />
                                        </button>
                                        {/* ドロップダウン */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="btn btn-link text-muted -mt-2 p-1">
                                                    <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            {/* ... DropdownMenuContent は省略 ... */}
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* 2. アイコン, タイトル, 説明(リンク) */}
                                <Link
                                    href={`/project/${project.id}/overview`}
                                    passHref
                                    className="mb-1 flex min-h-0 flex-grow"
                                >
                                    <div className="mr-3 flex-shrink-0">
                                        {/* アイコン/ロゴの代替 */}
                                        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded p-1">
                                            <FolderOpen className="text-primary h-6 w-6" />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-grow">
                                        <CardTitle className="hover:text-primary mb-0.5 line-clamp-2 text-[1.065rem] font-semibold text-slate-900 transition-colors">
                                            {project.name}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-[.875rem] text-slate-500">
                                            {project.description}
                                        </CardDescription>
                                    </div>
                                </Link>

                                {/* 3. 進捗状況 (Progress) */}
                                <div className="mt-auto pt-2">
                                    <div className="mb-1.5 flex items-center justify-start text-xs">
                                        <div className="text-slate-600">進捗率</div>
                                    </div>
                                    <Progress value={progressValue} className="h-1.5 bg-gray-200">
                                        {/* Progressコンポーネントが背景とバーを制御 */}
                                    </Progress>
                                </div>

                                {/* タスクと期限 */}
                                <div className="flex items-center justify-between pt-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <ListChecks className="text-muted h-4 w-4" />
                                        <span>
                                            {completedTasks}/{totalTasks}タスク
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {project.end_date
                                                ? new Date(project.end_date).toLocaleDateString(
                                                      'ja-JP'
                                                  )
                                                : '未設定'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer: アバターと期日 */}
                            <div className="mb-2 border-t border-dashed border-slate-200 px-4 pt-2">
                                {/* メンバー */}
                                <div className="flex items-center justify-between">
                                    {/* メンバー数 */}
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-600" />
                                        <span className="text-[0.835rem] text-gray-600">10人</span>
                                    </div>
                                    {/* メンバーアイコン */}
                                    <div className="flex -space-x-1.5">
                                        <Avatar className="h-7 w-7 border-2 border-white">
                                            <AvatarImage src={'/placeholder.svg'} alt={''} />
                                            <AvatarFallback className="bg-gray-100 text-xs font-medium">
                                                {/* <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium"> */}
                                                K
                                            </AvatarFallback>
                                        </Avatar>
                                        <Avatar className="h-7 w-7 border-2 border-white">
                                            <AvatarImage src={'/placeholder.svg'} alt={''} />
                                            {/* <AvatarFallback className="bg-gray-100 text-xs font-medium"> */}
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                S
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100">
                                            <span className="text-xs font-medium text-gray-600">
                                                +10
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* EmptyState(空の場合の表示) */}
            {/* ... */}
        </div>
    )
}
