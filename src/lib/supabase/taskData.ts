// Module
import { supabaseServer } from './server'
// Types
import { TaskRow } from '@/types/task'
import { ProfileRow } from '@/types/profile'

// タスクに担当者情報 (ProfileRow) をネストした複合型
export type TaskWithAssignee = TaskRow & {
    profiles: ProfileRow | null // assign_id に紐づくプロファイル (NULLの可能性あり)
}

/**
 * 特定のグループに所属するタスク一覧をフェッチする
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export async function fetchTasksByGroup(groupId: string): Promise<TaskWithAssignee[] | null> {
    if (!groupId) {
        return null
    }

    const supabase = await supabaseServer()

    // RLSが有効な場合、ログインユーザーがこのグループに所属している必要があります
    const { data: tasksData, error } = await supabase
        .from('tasks')
        .select(
            `
                id,
                group_id,
                title,
                description,
                status,
                assignee_id,
                created_at,
                due_date,
                profiles!tasks_assignee_id_fkey(
                    id,
                    name,
                    avatar_url
                )
            `
        )
        .eq('group_id', groupId)
        .order('created_at', { ascending: false }) // 新しいタスクを上に表示

    if (error) {
        console.error('Error fetching tasks by group:', error.message)
        return null
    }

    // TaskWithAssignee[] として型キャストして返す
    return tasksData as unknown as TaskWithAssignee[]
}
