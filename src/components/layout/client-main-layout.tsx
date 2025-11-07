'use client'
// Modules
import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CheckCircle, Leaf, Menu, X } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'
// Layout/Components
import { HeaderGroupSelectDropdown } from '@/components/layout/parts/header-group-select-dropdown'
import {
    HeaderNotificationDropdown,
    Notification,
} from '@/components/layout/parts/header-notification-dropdown'
import { HeaderUserMenuDropdown } from '@/components/layout/parts/header-user-menu-dropdown'
// Types
import type { LayoutNavItem } from '@/types/common'
import type { GroupRow } from '@/types/group'
// Constants
import { appInfo } from '@/constants/appInfo'
import { pageRoutes } from '@/constants/pageRoutes'
// Store
import { useCommonStore } from '@/store/common'
import { useProfileWithGroupsStore } from '@/store/profileWithGroup'
// Hooks
import { useMount } from '@/hooks/use-mount'
import { useIsMobile } from '@/hooks/use-mobile'
// Supabase
import type { ProfileWithGroups } from '@/lib/supabase/userData'
// Lib/Utils
import { cn } from '@/lib/utils'

interface ClientMainLayoutProps {
    children: React.ReactNode
    profileWithGroups: ProfileWithGroups | null
    selectedGroupId: string | null
}

/**
 * メインレイアウトコンポーネント(クライアントコンポーネント)
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function ClientMainLayout({
    children,
    profileWithGroups,
    selectedGroupId,
}: ClientMainLayoutProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const navItems: LayoutNavItem[] = [
        { href: pageRoutes.MAIN.HOME, label: 'ホーム', icon: require('lucide-react').Home },
        {
            href: pageRoutes.MAIN.TASK.LIST,
            label: 'タスク',
            icon: require('lucide-react').CheckCircle,
        },
        {
            href: pageRoutes.MAIN.REPORT.LIST,
            label: '日報',
            icon: require('lucide-react').FileText,
        },
        { href: pageRoutes.MAIN.ME.SETTING, label: '設定', icon: require('lucide-react').Settings },
        // { href: `/calendar`, label: "カレンダー", icon: require("lucide-react").Calendar },
        // { href: `/files`, label: "ファイル", icon: require("lucide-react").FolderOpen },
        // { href: `/member`, label: 'メンバー', icon: require('lucide-react').Users },
    ]
    // 最初に表示すべきグループオブジェクトを計算するヘルパー関数 (純粋関数)
    const getInitialGroup = (
        id: string | null,
        profileData: ProfileWithGroups | null
    ): GroupRow | null => {
        const memberships = profileData?.memberships || []
        if (memberships.length === 0) return null

        // 1. Props で渡された ID に対応するグループオブジェクトを探す
        const selectedMembership = memberships.find((m) => m.groups.id === id)
        if (selectedMembership) return selectedMembership.groups

        // 2. IDが無効または未設定の場合、個人グループを探す
        return memberships.find((m) => m.groups.is_personal)?.groups || null
    }

    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [currentGroup, setCurrentGroup] = useState<GroupRow | null>(() => {
        return getInitialGroup(selectedGroupId, profileWithGroups)
    })

    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    const { setProfileWithGroups } = useProfileWithGroupsStore()

    // ============================================================================
    // Effect(Watch)処理（Effect(Watch)）
    // ============================================================================
    useEffect(() => {
        // 1. プロファイル情報のストア設定 (既存)
        if (profileWithGroups) setProfileWithGroups(profileWithGroups)
        else setProfileWithGroups(null)

        // 2. 選択中グループの表示設定
        // 既に setCurrentGroup が実行済みの場合、Props が変わったときだけ更新
        const newGroup = getInitialGroup(selectedGroupId, profileWithGroups)
        if (newGroup?.id !== currentGroup?.id) {
            setCurrentGroup(newGroup)
        }

        // 3. ローディング終了処理
        const { isLoading, setIsLoading } = useCommonStore.getState()
        if (isLoading) {
            // Propsが更新された = サーバーからの応答が完了した
            setIsLoading(false)
            console.log('Loading reset complete via ClientMainLayout.')
        }
    }, [profileWithGroups, setProfileWithGroups, selectedGroupId])

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <div className="bg-background min-h-screen">
            <header className="bg-card sticky top-0 z-50 h-[58px] border-b shadow-xs">
                <div className="container mx-auto flex h-full items-center justify-between px-3 sm:px-6">
                    {/* 左側: ロゴ、グループ選択 */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/teams" className="flex items-center gap-2.5">
                            <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl shadow-sm">
                                <Leaf className="text-primary-foreground h-5 w-5" />
                            </div>
                            <span className="text-foreground text-xl font-bold">
                                {appInfo.APP_NAME}
                            </span>
                        </Link>
                        <div className="mx-2 hidden h-4 w-px bg-gray-300 md:block" />
                        {/* グループ選択/ドロップダウン */}
                        <HeaderGroupSelectDropdown
                            selectGroup={currentGroup}
                            membershipWithGroup={
                                profileWithGroups ? profileWithGroups.memberships : null
                            }
                        />
                    </div>
                    {/* 右側: お知らせ、ユーザーメニュー */}
                    <div className="flex items-center gap-2">
                        {/* お知らせ/ドロップダウン */}
                        <HeaderNotificationDropdown notifications={[]} unreadCount={3} />
                        {/* ユーザメニュー/ドロップダウン */}
                        <HeaderUserMenuDropdown
                            displayUserName={profileWithGroups ? profileWithGroups.name : null}
                            userIconSrc={profileWithGroups ? profileWithGroups.avatar_url : null}
                        />
                    </div>
                </div>
            </header>
            {/* ヘッダー下ナビ(スマホ以上の場合) */}
            <nav className="border-border bg-card/80 sticky top-[58px] z-40 hidden border-b backdrop-blur-sm md:block">
                <div className="container mx-auto px-4 lg:px-6">
                    <div className="flex items-center gap-1 overflow-x-auto py-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? 'default' : 'ghost'}
                                        size="sm"
                                        className={`cursor-pointer rounded-lg whitespace-nowrap ${isActive ? 'shadow-sm' : 'hover:bg-primary/10 hover:text-gray-700'}`}
                                    >
                                        <Icon className="mr-1.5 h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>
            {/* ヘッダー下ナビ(スマホの場合) */}
            <div className="bg-card border-border border-b md:hidden">
                <div className="flex items-center justify-between px-4.25 py-3">
                    <span className="text-muted-foreground text-sm font-medium">
                        {navItems.find((item) => item.href === pathname)?.label || 'メニュー'}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="h-8 w-8"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>

                {mobileMenuOpen && (
                    <div className="border-border border-t bg-white">
                        <nav className="space-y-1 p-2">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground hover:bg-secondary'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}
            </div>
            <main className="container mx-auto px-3 py-5.5 sm:px-6 sm:py-6">{children}</main>
        </div>
    )
}
