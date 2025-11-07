'use server'
// Modules
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
// Supabase
import { supabaseServer } from '@/lib/supabase/server'
// Actions
import { setSelectedGroupCookie } from '@/actions/groupActions'

const SELECTED_GROUP_ID_COOKIE = 'selectedGroupId'

/**
 * ログインユーザーの個人グループIDを取得し、Cookieに設定する
 * @param userId ログインユーザーのID
 */
export async function getAndSetDefaultGroupId(userId: string) {
    if (!userId) {
        throw new Error('User ID is required.')
    }

    const supabase = await supabaseServer()
    const cookieStore: any = await cookies() // 型エラー回避のため 'any' にキャスト

    // 1. サーバー側で安全に個人グループIDを取得
    const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select(
            `
                memberships!memberships_user_id_fkey( 
                    groups(id, is_personal)
                )
            `
        )
        .eq('id', userId)
        .single()

    if (fetchError) {
        console.error('Failed to fetch user data for personal group ID:', fetchError.message)
        // DBアクセスが失敗したため、より具体的なエラーをログに出力
        console.error('Supabase error detail:', fetchError)
        throw new Error('Failed to find default group.')
    }

    // 2. 個人グループIDを特定
    let personalGroupId: string | null = null
    if (userData && userData.memberships.length > 0) {
        const personalMembership = userData.memberships.find((m: any) => m.groups?.is_personal)
        if (personalMembership) {
            personalGroupId = personalMembership.groups.id
        }
    }

    if (personalGroupId) {
        // 3. 取得したIDをCookieに設定(処理を分割: Cookie設定は groupActions に任せる)
        await setSelectedGroupCookie(personalGroupId)
    } else {
        // 個人グループが見つからない場合は、Cookieをクリア
        await setSelectedGroupCookie('')
        throw new Error('No personal group found for the user.')
    }
}

/**
 * ユーザーのログアウト処理
 * 1. Supabaseセッションを破棄
 * 2. 選択グループIDのCookieを破棄
 * 3. ログインページへリダイレクト
 */
export async function logout() {
    const supabase = await supabaseServer()

    // 1. Supabaseのセッションを破棄
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Supabase sign out failed:', error)
        // 🚨 失敗しても、Cookieクリアとリダイレクトは続行し、セキュリティを優先
    }

    // 2. 選択グループIDのCookieを破棄 (groupActionsを再利用)
    // グループIDを空文字列で渡すことで、Cookieを削除させる
    await setSelectedGroupCookie('')

    // 3. ログインページへリダイレクト (Server Action の機能)
    redirect('/auth/login')
}
