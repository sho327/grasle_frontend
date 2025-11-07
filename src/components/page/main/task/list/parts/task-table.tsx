'use client'

import { ChevronDown } from 'lucide-react'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Task } from '@/types'
import TaskTableItems from '@/components/page/main/task/list/parts/task-table-items'

interface TaskTableProps {
    tasks: Task[]
    sortKey: 'title' | 'status' | 'createdAt'
    sortDirection: 'asc' | 'desc'
    onToggleSort: (key: 'title' | 'status' | 'createdAt') => void
    onToggleStatus?: (taskId: string) => void
}

/**
 * タスク一覧テーブルコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function TaskTable({
    tasks,
    sortKey,
    sortDirection,
    onToggleSort,
    onToggleStatus,
}: TaskTableProps) {
    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <div className="rounded-md border bg-white shadow-sm">
            <Table>
                <TableHeader className="bg-gray-400/10">
                    <TableRow
                        className="hover:bg-gray-transparent"
                        style={{ borderBottom: '2.5px solid #dfe6e9' }}
                    >
                        <TableHead className="w-12 rounded-tl-lg"></TableHead>
                        <TableHead
                            onClick={() => onToggleSort('title')}
                            className="cursor-pointer font-semibold text-gray-600"
                        >
                            <div className="flex items-center gap-1">
                                タスク名
                                {sortKey === 'title' && (
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 text-gray-600 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-600">説明</TableHead>
                        <TableHead
                            onClick={() => onToggleSort('status')}
                            className="cursor-pointer font-bold text-gray-600"
                        >
                            <div className="flex items-center gap-1">
                                ステータス
                                {sortKey === 'status' && (
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 text-gray-600 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </div>
                        </TableHead>
                        <TableHead
                            onClick={() => onToggleSort('createdAt')}
                            className="cursor-pointer font-semibold text-gray-600"
                        >
                            <div className="flex items-center gap-1">
                                作成日
                                {sortKey === 'createdAt' && (
                                    <ChevronDown
                                        className={`h-3.5 w-3.5 text-gray-600 ${sortDirection === 'asc' ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </div>
                        </TableHead>
                        <TableHead className="w-12 rounded-tr-lg"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TaskTableItems tasks={tasks} onToggleStatus={onToggleStatus} />
                </TableBody>
            </Table>
        </div>
    )
}
