'use client'
// Modules
import type React from 'react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'
// Layout/Components
import { HeaderGroupSelectDropdown } from '@/components/layout/parts/header-group-select-dropdown'
import {
    HeaderNotificationDropdown,
    Notification,
} from '@/components/layout/parts/header-notification-dropdown'
import { HeaderUserMenuDropdown } from '@/components/layout/parts/header-user-menu-dropdown'
// Types
import type { GroupRow } from '@/types/group'
// Constants
import { appInfo } from '@/constants/appInfo'
// Store
import { useCommonStore } from '@/store/common'
import { useProfileWithGroupsStore } from '@/store/profileWithGroup'
// Supabase
import type { ProfileWithGroups } from '@/lib/supabase/userData'

interface HeaderProps {
    profileWithGroups: ProfileWithGroups | null
    selectedGroupId: string | null
    notifications: Notification[]
}

/**
 * ヘッダーコンポーネント(クライアントコンポーネント)
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function Header({ profileWithGroups, selectedGroupId }: HeaderProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
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
    )
}
