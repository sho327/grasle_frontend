// Modules
import { cookies } from 'next/headers'
// Layout/Components
import ClientMainLayout from '@/components/layout/client-main-layout'
// Supabase
import { fetchAuthenticatedUserData } from '@/lib/supabase/userData'

const SELECTED_GROUP_ID_COOKIE = 'selectedGroupId'

/**
 * メインレイアウト
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const profileWithGroups = await fetchAuthenticatedUserData()
    // *** Cookie/選択中グループID検証(ページよりも先に動くレイアウトで検証/再設定) ***
    // 1. Cookieから選択グループIDを安全に取得 (TSエラー回避のため as any を使用)
    const cookieStore = (await cookies()) as any
    const selectedGroupIdFromCookie: string | null =
        cookieStore.get(SELECTED_GROUP_ID_COOKIE)?.value || null
    // 2. 初期グループIDの決定ロジック
    const memberships = profileWithGroups?.memberships || []
    // 個人グループの特定
    const personalGroup = memberships.find((m: any) => m.groups.is_personal)?.groups || null
    const personalGroupId: string | null = personalGroup?.id || null
    let finalSelectedGroupId: string | null = null
    if (memberships.length === 0) {
        // 所属グループがない場合
        finalSelectedGroupId = null
    } else if (selectedGroupIdFromCookie) {
        // 3. Cookieが設定されている場合
        const isGroupExist = memberships.some((m: any) => m.groups.id === selectedGroupIdFromCookie)
        if (isGroupExist) {
            // 3C. 所属グループに存在する: CookieのIDを採用（現状維持）
            finalSelectedGroupId = selectedGroupIdFromCookie
        } else {
            // 3D. 所属グループに存在しない: 個人グループIDに切り替え
            finalSelectedGroupId = personalGroupId
        }
    } else {
        // 3A. Cookieが未設定の場合（初回アクセス）: 個人グループIDを採用
        finalSelectedGroupId = personalGroupId
    }
    // Cookieの値が変わる場合、ここで上書きする
    if (finalSelectedGroupId !== selectedGroupIdFromCookie) {
        if (finalSelectedGroupId) {
            // 新しいIDでCookieをセット
            ;((await cookies()) as any).set(SELECTED_GROUP_ID_COOKIE, finalSelectedGroupId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            })
        } else {
            // IDがない場合はCookieを削除
            ;((await cookies()) as any).delete(SELECTED_GROUP_ID_COOKIE)
        }
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <ClientMainLayout
            profileWithGroups={profileWithGroups}
            selectedGroupId={finalSelectedGroupId}
        >
            {children}
        </ClientMainLayout>
    )
}
