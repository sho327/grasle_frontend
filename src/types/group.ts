import { Database } from './Database'

/**
 * Groups テーブルの単一行のデータ型
 * - グループ一覧画面や、SelectedGroup の基底型として利用
 */
export type GroupRow = Database['public']['Tables']['groups']['Row']

/**
 * ユーザーが現在選択しているグループの型 (GroupRowと同じ構造)
 */
export type SelectedGroup = GroupRow

// 他にも Group のフォームで使う型など、汎用的な型をここに追加できます
