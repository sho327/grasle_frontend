'use client'
// Modules
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
// Layout/Components
import PageHeader from '@/components/layout/parts/page-header'
// Types
import { Task, TaskStatus } from '@/types'
// Page/Components
import CreateModal from '@/components/page/main/[groupId]/task/list/parts/create-modal'
import TaskTable from '@/components/page/main/[groupId]/task/list/parts/task-table'
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

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <PageHeader
                Icon={CheckCircle}
                iconVariant="task"
                pageTitle="タスク"
                pageDescription="チームのタスクを管理して進捗を追跡"
                isBackButton={false}
            >
                {/* タスク新規作成モーダル */}
                <CreateModal
                    isOpen={isCreateModalOpen}
                    onOpenChange={setIsCreateModalOpen}
                    onSubmit={handleCreateTask}
                />
            </PageHeader>

            <TaskTable tasks={tasks} onToggleStatus={toggleTaskStatus} />
        </div>
    )
}
