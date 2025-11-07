'use client'
// Modules
import { useMemo, useState } from 'react'
import { CheckCircle, Plus } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'
// Layout/Components
import PageHeader from '@/components/layout/parts/page-header'
// Types
import { Task, TaskStatus } from '@/types'
// Page/Components
import CreateModal from '@/components/page/main/task/list/parts/task-create-modal'
import TaskTable from '@/components/page/main/task/list/parts/task-table'
// ================================================
// モックデータ
// ================================================
import { mockTasks } from '@/mocks/task'
// ================================================

/**
 * タスク一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function TaskListPage() {
    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [tasks, setTasks] = useState<Task[]>(mockTasks)
    const [sortKey, setSortKey] = useState<'title' | 'status' | 'createdAt'>('createdAt')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const handleCreateTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newTask: Task = {
            ...taskData,
            id: String(tasks.length + 1),
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        setTasks([...tasks, newTask])
    }
    const toggleTaskStatus = (taskId: string) => {
        setTasks(
            tasks.map((task) => {
                if (task.id === taskId) {
                    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'completed']
                    const currentIndex = statusOrder.indexOf(task.status)
                    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
                    const updatedTask: Task = {
                        ...task,
                        status: nextStatus,
                        updatedAt: new Date(),
                    }
                    if (nextStatus === 'completed') {
                        updatedTask.completedAt = new Date()
                    } else if (nextStatus === 'in_progress') {
                        updatedTask.startedAt = new Date()
                    }
                    return updatedTask
                }
                return task
            })
        )
    }
    const sortedTasks = useMemo(() => {
        const list = [...tasks]
        list.sort((a, b) => {
            let valA: unknown = a[sortKey]
            let valB: unknown = b[sortKey]

            if (sortKey === 'status') {
                const order: Record<TaskStatus, number> = { todo: 1, in_progress: 2, completed: 3 }
                valA = order[a.status]
                valB = order[b.status]
            }
            if (valA === undefined || valA === null) return 1
            if (valB === undefined || valB === null) return -1

            // Date の比較に対応
            const aVal = valA instanceof Date ? valA.getTime() : (valA as string | number)
            const bVal = valB instanceof Date ? valB.getTime() : (valB as string | number)

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
        return list
    }, [tasks, sortKey, sortDirection])
    const handleToggleSort = (key: 'title' | 'status' | 'createdAt') => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <div className="mx-auto max-w-7xl space-y-4 rounded-xl bg-white p-4 sm:p-6.5">
            {/* <div className="mx-auto min-h-screen max-w-7xl space-y-6 bg-gray-50 p-4 sm:p-8"></div> */}
            {/* ページヘッダー */}
            <PageHeader
                Icon={CheckCircle}
                iconVariant="task"
                pageTitle="タスク一覧"
                pageDescription="グループに紐づくタスク一覧"
                isBackButton={false}
            >
                {/* タスク新規作成(ボタン+モーダル) */}
                {/* <CreateModal
                    isOpen={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSubmit={handleCreateTask}
                /> */}
                <Button className="cursor-pointer rounded-lg shadow-sm">
                    <Plus className="mr-1 h-4 w-4" />
                    新しいタスク
                </Button>
            </PageHeader>
            <hr className="my-6" />
            {/* タスク一覧(テーブル) */}
            <TaskTable
                tasks={sortedTasks}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onToggleSort={handleToggleSort}
                onToggleStatus={toggleTaskStatus}
            />
        </div>
    )
}
