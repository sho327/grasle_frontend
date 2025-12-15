'use client'
// Modules
import type React from 'react'
import Link from 'next/link'
import { Leaf, Search, ChevronLeft } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
// Layout/Components
import { HeaderNotificationDropdown } from '@/components/layout/parts/header-notification-dropdown'
import { HeaderUserMenuDropdown } from '@/components/layout/parts/header-user-menu-dropdown'
// Constants
import { appInfo } from '@/constants/appInfo'
// Hooks
import { useIsMobile } from '@/hooks/use-mobile'
// Supabase
import type { ProfileWithTeams } from '@/lib/supabase/userData'
import { ProjectWithDetails } from '@/lib/supabase/projectData'

interface HeaderProps {
    profileWithTeams: ProfileWithTeams | null
    project: ProjectWithDetails | null
}

/**
 * ヘッダーコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function HeaderLayout({ profileWithTeams, project }: HeaderProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const isMobile = useIsMobile()
    const isProjectSelected = !!project?.id

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <header className="border-border bg-card sticky top-0 flex h-15 items-center gap-4 border-b px-4 shadow-xs md:px-6">
            {/* 左側: ロゴ、チーム選択 */}
            <div className="flex h-13 min-w-0 flex-1 items-center gap-2.5 md:flex-initial">
                {(!isProjectSelected && isMobile) ||
                    (!isMobile && (
                        <SidebarTrigger className="hover:bg-primary/10 h-8.5 w-8.5 cursor-pointer hover:text-gray-700" />
                    ))}
                {isProjectSelected && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            location.href = '/project/list'
                        }}
                        className="hover:bg-primary/10 h-8.5 w-8.5 cursor-pointer hover:text-gray-700"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}

                {/* アプリ名 or 選択中プロジェクト名 */}
                {!isProjectSelected && isMobile && (
                    <Link href="/home" className="flex items-center gap-2.5">
                        <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-sm">
                            <Leaf className="text-primary-foreground h-5 w-5" />
                        </div>
                        <span className="text-foreground text-xl font-bold">
                            {appInfo.APP_NAME}
                        </span>
                    </Link>
                )}
                {isProjectSelected && (
                    <span className="text-foreground text-md font-semibold">{project?.name}</span>
                )}
            </div>

            {/* 中央: 検索バー */}
            {/* <div className="hidden max-w-md flex-1 lg:block">
                <div className="relative">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <input
                        type="search"
                        placeholder="検索..."
                        className="border-input focus:border-ring focus:ring-ring w-full rounded-lg border bg-white py-2 pr-4 pl-10 text-sm focus:ring-1 focus:outline-none"
                    />
                </div>
            </div> */}

            {/* 右側: お知らせ、ユーザーメニュー */}
            <div className="ml-auto flex shrink-0 items-center gap-2">
                {/* お知らせ/ドロップダウン */}
                <HeaderNotificationDropdown
                    notifications={[
                        {
                            id: 'xxxx',
                            type: 'task',
                            title: 'タスクタイトル',
                            description: '詳細メッセージ',
                            timestamp: '2秒前',
                            isRead: false,
                        },
                        {
                            id: 'yyyy',
                            type: 'note',
                            title: 'ノートタイトル',
                            description: 'ノート詳細メッセージ',
                            timestamp: '2025-10-11',
                            isRead: true,
                        },
                    ]}
                    unreadCount={3}
                />
                {/* ユーザメニュー/ドロップダウン */}
                <HeaderUserMenuDropdown
                    displayUserName={profileWithTeams ? profileWithTeams.name : null}
                    userIconSrc={profileWithTeams ? profileWithTeams.avatar_url : null}
                />
            </div>
        </header>
    )
}
