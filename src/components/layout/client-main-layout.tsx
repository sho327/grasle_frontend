'use client'
// Modules
import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// UI/Components
import { SidebarInset } from '@/components/ui/sidebar'
// Layout/Components
import Header from '@/components/layout/parts/header'
import BottomNavigation from '@/components/layout/parts/bottom-navigation'
import Sidebar from '@/components/layout/parts/sidebar'
// Types
import type { TeamRow } from '@/types/team'
// Store
import { useCommonStore } from '@/store/common'
import { useProjectStore } from '@/store/projectStore'
// Hooks
import { useIsMobile } from '@/hooks/use-mobile'
// Supabase
import type { ProfileWithTeams } from '@/lib/supabase/userData'
// Actions
import { setSelectedTeamCookie } from '@/actions/teamActions'

interface ClientMainLayoutProps {
    children: React.ReactNode
    profileWithTeams: ProfileWithTeams | null
    selectedTeamId: string | null
    needsCookieUpdate?: boolean // Cookie更新が必要かどうか
}

/**
 * メインレイアウトコンポーネント(クライアントコンポーネント)
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export function ClientMainLayout({
    children,
    profileWithTeams,
    selectedTeamId,
    needsCookieUpdate,
}: ClientMainLayoutProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const isMobile = useIsMobile()
    const router = useRouter()
    // 最初に表示すべきチームオブジェクトを計算するヘルパー関数 (純粋関数)
    const getInitialTeam = (
        id: string | null,
        profileData: ProfileWithTeams | null
    ): TeamRow | null => {
        const memberships = profileData?.memberships || []
        if (memberships.length === 0) return null

        // 1. Props で渡された ID に対応するチームオブジェクトを探す
        const selectedMembership = memberships.find((m) => m.teams.id === id)
        if (selectedMembership) return selectedMembership.teams

        // 2. IDが無効または未設定の場合、個人チームを探す
        return memberships.find((m) => m.teams.is_personal)?.teams || null
    }

    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [currentTeam, setCurrentGroup] = useState<TeamRow | null>(() => {
        return getInitialTeam(selectedTeamId, profileWithTeams)
    })

    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    const { isLoading, setIsLoading } = useCommonStore()
    const { project } = useProjectStore()

    // ============================================================================
    // Effect(Watch)処理（Effect(Watch)）
    // ============================================================================
    useEffect(() => {
        // 1. 選択中チームの表示設定
        // 既に setCurrentGroup が実行済みの場合、Props が変わったときだけ更新
        const newTeam = getInitialTeam(selectedTeamId, profileWithTeams)
        if (newTeam?.id !== currentTeam?.id) {
            setCurrentGroup(newTeam)
        }

        // 2. Cookie更新が必要な場合、クライアント側からServer Actionを呼び出してCookieを更新
        if (needsCookieUpdate) {
            if (selectedTeamId) {
                setSelectedTeamCookie(selectedTeamId)
            } else {
                setSelectedTeamCookie('')
            }
            // Cookie更新後、Server Componentを再レンダリングして新しいCookieの値を読み込む
            router.refresh()
        }

        // 4. ローディング終了処理
        if (isLoading) {
            // Propsが更新された = サーバーからの応答が完了した
            setIsLoading(false)
            console.log('Loading reset complete via ClientMainLayout.')
        }
    }, [profileWithTeams, selectedTeamId, needsCookieUpdate, currentTeam?.id, router])

    // ============================================================================
    // Define(Computed)処理(状態等による変数定義)
    // ============================================================================
    // currentProject が null でない、かつ ID がある場合に true
    const isProjectSelected = !!project?.id

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <>
            <Sidebar profileWithTeams={profileWithTeams} selectTeam={currentTeam} />
            {/* メインコンテンツ(ヘッダー 〜 下部ナビゲーション) */}
            <SidebarInset className="flex h-screen flex-col overflow-scroll pe-0">
                {/* ヘッダー */}
                <Header profileWithTeams={profileWithTeams} project={project} />

                {/* ボディ箇所 */}
                {!isProjectSelected && (
                    <main className="container mx-auto px-3 py-5.5 sm:px-6 sm:py-6">
                        {children}
                    </main>
                )}
                {isProjectSelected && <>{children}</>}

                {/* プロジェクト未選択時 + モバイルの場合/下部ナビゲーション */}
                {!isProjectSelected && isMobile && <BottomNavigation />}
            </SidebarInset>
        </>
    )
}
