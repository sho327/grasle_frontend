'use client'
// Modules
import type React from 'react'
import { useRouter } from 'next/navigation'
import { LucideIcon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
// UI/Components
import { Button } from '@/components/ui/button'

/**
 * ページヘッダーコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function PageHeader({
    Icon,
    iconVariant = 'default',
    pageTitle,
    pageDescription,
    isBackButton,
    children,
}: {
    Icon?: LucideIcon
    iconVariant?:
        | 'default'
        | 'home'
        | 'project-list'
        | 'member-list'
        | 'project-task'
        | 'project-report'
        | 'project-setting'
    pageTitle: string
    pageDescription: string
    isBackButton: boolean
    children?: React.ReactNode
}) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const router = useRouter()

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <>
            {/* ページアイコン/タイトル/詳細 */}
            <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* 戻るボタン */}
                    {isBackButton && (
                        <Link href="/task/list">
                            <Button
                                variant="outline"
                                size="sm"
                                className="mr-1.5 cursor-pointer rounded-md border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-gray-400/10 hover:text-gray-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {/* 戻る */}
                            </Button>
                        </Link>
                    )}
                    {/* アイコン */}
                    {Icon && (
                        <div className="mr-1.5 rounded-xl bg-gray-400/10 p-3">
                            <Icon
                                className={
                                    'h-6 w-6' +
                                    (iconVariant === 'default'
                                        ? ' text-gray-600'
                                        : iconVariant === 'home'
                                          ? ' text-chart-1'
                                          : iconVariant === 'project-list'
                                            ? ' text-chart-2'
                                            : iconVariant === 'member-list'
                                              ? ' text-chart-3'
                                              : iconVariant === 'project-task'
                                                ? ' text-chart-4'
                                                : iconVariant === 'project-report'
                                                  ? ' text-chart-5'
                                                  : iconVariant === 'project-setting'
                                                    ? ' text-chart-6'
                                                    : ' text-gray-600')
                                }
                            />
                        </div>
                    )}
                    <div>
                        <h1 className="text-foreground text-xl font-semibold sm:text-[1.425rem]">
                            {pageTitle}
                        </h1>
                        <p className="text-muted-foreground mt-0.75 text-sm">{pageDescription}</p>
                    </div>
                </div>
                {/* 作成ボタンがある場合等は、各自childrenにてページ側で設定 */}
                {children}
            </div>
        </>
    )
}
