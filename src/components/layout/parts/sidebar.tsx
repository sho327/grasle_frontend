'use client'
// Modules
import Link from 'next/link'
import { Home, FolderOpen, Users, User, Settings, Crown, Leaf } from 'lucide-react'
// UI/Components
import {
    Sidebar as UISidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarRail,
} from '@/components/ui/sidebar'
// Layout/Components
import SidebarItem from '@/components/layout/parts/sidebar-item'
import { SidebarTeamSelectDropdown } from '@/components/layout/parts/sidebar-team-select-dropdown'
// Types
import type { TeamRow } from '@/types/team'
// Supabase
import type { ProfileWithTeams } from '@/lib/supabase/userData'

const navigationItems = [
    {
        title: 'ホーム',
        href: '/home',
        icon: Home,
        badge: '',
        // isPremium: true,
    },
    {
        title: 'プロジェクト',
        href: '/project/list',
        icon: FolderOpen,
        badge: '新機能',
        // isPremium: true,
    },
    // {
    //     title: 'ミッション',
    //     href: '/gamification',
    //     icon: Trophy,
    //     badge: '3',
    // },
    // {
    //     title: '実績',
    //     href: '/achievements',
    //     icon: Trophy,
    // },
    {
        title: 'チームメンバー',
        href: '/member/list',
        icon: Users,
        isPremium: false,
    },
]

const bottomItems = [
    {
        title: 'プロフィール',
        href: '/me/profile',
        icon: User,
        badge: undefined,
        isPremium: false,
    },
    {
        title: 'アプリ設定',
        href: '/me/settings',
        icon: Settings,
        badge: undefined,
        isPremium: false,
    },
    {
        title: 'プレミアム',
        href: '/me/premium',
        icon: Crown,
        badge: '',
        isPremium: true,
    },
]

interface SidebarProps {
    profileWithTeams: ProfileWithTeams | null
    selectTeam: TeamRow | null
}

/**
 * サイドバーアイテムコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/09
 */
export default function Sidebar({ profileWithTeams, selectTeam }: SidebarProps) {
    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <UISidebar className="border-r border-gray-200">
            <SidebarHeader className="border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 p-4">
                    <Link href="/home" className="flex items-center gap-2.5">
                        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
                            <Leaf className="text-primary-foreground h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">Grasle</h1>
                            <p className="text-muted-foreground text-xs">タスク完了で育てる</p>
                        </div>
                    </Link>
                </div>

                <div className="px-2 pb-4">
                    {/* チーム選択ドロップダウン */}
                    <SidebarTeamSelectDropdown
                        selectTeam={selectTeam}
                        membershipWithTeam={profileWithTeams ? profileWithTeams.memberships : null}
                    />
                </div>
            </SidebarHeader>

            {/* ナビゲーション */}
            <SidebarContent className="bg-white">
                <SidebarGroup>
                    <SidebarGroupLabel className="font-semibold text-gray-700">
                        メニュー
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="flex-1 space-y-1">
                            {navigationItems.map((navigationItem) => (
                                <SidebarItem
                                    key={navigationItem.href}
                                    title={navigationItem.title}
                                    href={navigationItem.href}
                                    icon={navigationItem.icon}
                                    badge={navigationItem.badge}
                                    isPremium={navigationItem.isPremium}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* 下部アイテム */}
            <SidebarFooter className="space-y-1 border-t bg-white px-2 pb-3">
                <SidebarMenu>
                    {bottomItems.map((item) => (
                        <SidebarItem
                            key={item.href}
                            title={item.title}
                            href={item.href}
                            icon={item.icon}
                            badge={item.badge}
                            isPremium={item.isPremium}
                        />
                    ))}
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </UISidebar>
    )
}
