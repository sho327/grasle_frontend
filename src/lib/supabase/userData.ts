// Modules
import { supabaseServer } from './server'
import type { User } from '@supabase/supabase-js'
// Types
import { GroupRow } from '@/types/group'
import { MembershipRow } from '@/types/membership'
import { ProfileRow } from '@/types/profile'

// Memberships の Row に、関連する Groups の情報（groups）をネストして追加
export type MembershipWithGroup = MembershipRow & {
    groups: GroupRow
}
// プロフィールの Row に、関連する MembershipWithGroup のリスト（memberships）をネストして追加
export type ProfileWithGroups = ProfileRow & {
    // profileWithGroups が null でない場合、TypeScriptは memberships が null ではなく配列（[] または [...リスト]）であると判定
    memberships: MembershipWithGroup[]
}

// ----------------------------------------------------
// 認証済みユーザーのプロフィールとグループを取得する関数
// ----------------------------------------------------
/**
 * 現在ログインしているユーザーセッション情報を取得
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export const getSessionUser = async (): Promise<User | null> => {
    // ... (以前のロジック: userを取得)
    const supabase = await supabaseServer()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user
}

/**
 * 認証済みユーザーのプロフィールと所属グループ一覧をフェッチする
 * ----------------------------------------------------
 * 項目	ロジック	結果
 * profileWithGroupsが"null"の場合	profileWithGroups?.memberships	undefined
 * profileWithGroupsが"オブジェクト"の場合	profileWithGroups.memberships	MembershipWithGroup[](空または中身あり)
 * ----------------------------------------------------
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export async function fetchAuthenticatedUserData(): Promise<ProfileWithGroups | null> {
    const user = await getSessionUser()
    if (!user) {
        return null
    }

    const supabase = await supabaseServer()

    const { data: profileData, error } = await supabase
        .from('profiles')
        .select(
            `
				id,
				name,
				avatar_url,
				theme,
				created_at,
				memberships!memberships_user_id_fkey( 
					id,
					user_id,
					group_id,
					role,
					status,
					groups(*)
				)
			`
        )
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching user data in server utils:', error.message)
        return null
    }

    // `as unknown as ProfileWithGroups` で型キャストを強制
    // (ランタイムのデータ構造は正しいため、パーサーエラーを回避するために使用)
    return profileData as unknown as ProfileWithGroups
}

// ============================================================================
// ロール別フィルタリングの利用方法
// ============================================================================
// const profileData = await fetchAuthenticatedUserData();
// if (profileData) {
//     // 例: 自分が 'admin' の役割を持っているグループだけを抽出したい場合
//     const adminMemberships = profileData.memberships.filter(m => m.role === 'admin');

//     // 例: 自分が所属するグループ全体のリスト（ロールは問わない）
//     const allGroups = profileData.memberships.map(m => m.groups);

//     // 例: 個人グループを特定する
//     const personalGroup = profileData.memberships.find(m => m.groups.is_personal)?.groups;
// }
