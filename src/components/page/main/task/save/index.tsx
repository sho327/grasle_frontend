'use client'
// Modules
import { useMemo, useState, useCallback } from 'react'
import { CheckCircle, Plus, Info, File, Upload, X } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
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
 * タスク登録更新ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function TaskSavePage() {
    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [tasks, setTasks] = useState<Task[]>(mockTasks)
    const [sortKey, setSortKey] = useState<'title' | 'status' | 'createdAt'>('createdAt')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState<boolean>(false)

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
    const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            setIsDragging(false)
            handleFileSelect(e.dataTransfer.files)
        },
        [handleFileSelect]
    )

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            handleFileSelect(e.target.files)
        },
        [handleFileSelect]
    )

    const handleRemoveFile = useCallback((index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }, [])

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <div className="mx-auto max-w-7xl space-y-4 rounded-xl bg-white p-4 sm:p-6.5">
            {/* ページヘッダー */}
            <PageHeader
                pageTitle="タスク新規登録"
                pageDescription="タスクを新規登録"
                isBackButton={true}
            />
            <hr />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
                    <div className="space-y-2">
                        <Label htmlFor="taskTitle" className="text-sm font-medium text-gray-700">
                            タイトル
                        </Label>
                        <Input
                            id="taskTitle"
                            value={''}
                            onChange={(e) => {}}
                            placeholder="タスク名"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="taskDescription"
                            className="flex items-center text-sm font-medium text-gray-700"
                        >
                            詳細・説明（Markdown対応）
                            <Info className="ml-1 h-3 w-3 text-[#18BC9C]" />
                        </Label>
                        <Textarea
                            id="taskDescription"
                            value={''}
                            onChange={(e) => {}}
                            placeholder="タスクの目的、手順、参考情報などをMarkdownで記述できます。"
                            rows={8}
                        />
                    </div>
                    <div className="space-y-2 border-t pt-4">
                        <Label className="flex items-center text-sm font-medium text-gray-700">
                            <File className="mr-1 h-4 w-4" /> 添付ファイル
                        </Label>
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`relative rounded-lg border-1 border-dashed transition-colors ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                        >
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <Upload
                                    className={`mb-3 h-10 w-10 ${
                                        isDragging ? 'text-primary' : 'text-gray-400'
                                    }`}
                                />
                                <p className="mb-1 text-sm font-medium text-gray-700">
                                    ファイルをドラッグ＆ドロップ
                                </p>
                                <p className="mb-4 text-xs text-gray-500">または</p>
                                <label htmlFor="file-upload">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-primary/10 cursor-pointer bg-white text-gray-700 hover:text-gray-700"
                                        asChild
                                    >
                                        <span>
                                            <Plus className="mr-1 h-4 w-4" /> ファイルを選択
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileInputChange}
                                />
                            </div>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-md border bg-white p-3"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <File className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-700">
                                                {file.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({(file.size / 1024).toFixed(1)} KB)
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFile(index)}
                                            className="hover:bg-destructive/10 hover:text-destructive h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="order-1 space-y-4 rounded-lg border bg-gray-50 p-4 lg:order-2 lg:col-span-1">
                    <h4 className="border-b pb-2 font-semibold text-gray-700">タスク属性</h4>
                    <div className="space-y-2">
                        <Label htmlFor="assignee" className="text-sm font-medium text-gray-700">
                            担当者
                        </Label>
                        <Select value={''} onValueChange={() => {}}>
                            <SelectTrigger
                                id="assignee"
                                className="hover:bg-primary/10 bg-white text-gray-700"
                            >
                                <SelectValue placeholder="担当者を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    value="user1"
                                    className="focus:bg-primary focus:text-primary-foreground"
                                >
                                    ユーザー1
                                </SelectItem>
                                <SelectItem
                                    value="user2"
                                    className="focus:bg-primary focus:text-primary-foreground"
                                >
                                    ユーザー2
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                            期限日
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="dueDate"
                                    variant="outline"
                                    className="hover:bg-primary/10 w-full justify-start bg-white text-left font-normal text-gray-700 hover:text-gray-700"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {''
                                        ? format(new Date(''), 'yyyy年MM月dd日', { locale: ja })
                                        : '期限日を選択'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={undefined}
                                    onSelect={() => {}}
                                    initialFocus
                                    classNames={{
                                        day_selected:
                                            'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                            ステータス
                        </Label>
                        <Select value={''} onValueChange={() => {}}>
                            <SelectTrigger
                                id="status"
                                className="hover:bg-primary/10 bg-white text-gray-700"
                            >
                                <SelectValue placeholder="ステータスを選択" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    value="todo"
                                    className="focus:bg-primary focus:text-primary-foreground"
                                >
                                    未着手
                                </SelectItem>
                                <SelectItem
                                    value="in_progress"
                                    className="focus:bg-primary focus:text-primary-foreground"
                                >
                                    進行中
                                </SelectItem>
                                <SelectItem
                                    value="completed"
                                    className="focus:bg-primary focus:text-primary-foreground"
                                >
                                    完了
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="border-t pt-2 text-xs text-gray-500">
                        <p className="mt-1">完了日時: 2025/11/07 00:00:00</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
