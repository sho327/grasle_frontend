// Types
import { Task, TaskStatus } from '@/types'

export const mockTasks: Task[] = [
    {
        id: '1',
        groupId: '1',
        title: 'ホームページ/モックデザイン',
        description: 'ホームページのモックアップデザイン',
        assigneeId: '1',
        status: 'todo',
        createdAt: new Date('2025/11/01 00:00:00'),
        updatedAt: new Date('2025/11/01 00:00:00'),
    },
    {
        id: '2',
        groupId: '1',
        title: 'タスクページ/モックデザイン',
        description: 'タスクページのモックアップデザイン',
        assigneeId: '1',
        status: 'in_progress',
        createdAt: new Date('2025/11/01 00:00:00'),
        updatedAt: new Date('2025/11/01 00:00:00'),
    },
    {
        id: '3',
        groupId: '1',
        title: '完了したタスク',
        description: 'これは完了したタスクの例です',
        assigneeId: '1',
        status: 'completed',
        createdAt: new Date('2025/11/01 00:00:00'),
        updatedAt: new Date('2025/11/02 00:00:00'),
        completedAt: new Date('2025/11/02 00:00:00'),
    },
]
