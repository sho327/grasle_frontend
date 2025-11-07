import { Database } from './Database'
import { ProfileRow } from './profile'

/**
 * Tasks テーブルの単一行のデータ型
 */
export type TaskRow = Database['public']['Tables']['tasks']['Row']

/**
 * タスクに担当者情報 (ProfileRow) をネストした複合型
 */
export type TaskWithAssignee = TaskRow & {
    profiles: ProfileRow | null // assign_id に紐づくプロファイル (NULLの可能性あり)
}
