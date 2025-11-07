'use server'

import { cookies } from 'next/headers'

const SELECTED_GROUP_ID_COOKIE = 'selectedGroupId'

/**
 * ユーザーが選択したグループIDをCookieに保存するサーバーアクション
 * @param groupId 選択されたグループのID
 */
export async function setSelectedGroupCookie(groupId: string) {
    // cookies() の戻り値を 'any' にキャストして型エラーを回避
    const cookieStore: any = await cookies()

    if (!groupId) {
        // IDが空の場合はCookieを削除
        cookieStore.delete(SELECTED_GROUP_ID_COOKIE)
        return
    }

    // CookieにグループIDを保存
    cookieStore.set(SELECTED_GROUP_ID_COOKIE, groupId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
    })
}
