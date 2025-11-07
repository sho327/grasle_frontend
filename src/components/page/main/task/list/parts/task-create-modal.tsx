'use client'
// Modules
import React from 'react'
import { Plus } from 'lucide-react'
// Ui/Components
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import { Task, TaskStatus } from '@/types'

interface TaskCreateModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}

/**
 * タスク新規作成モーダルコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function TaskCreateModal({ isOpen, onOpenChange, onSubmit }: TaskCreateModalProps) {
    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        status: 'todo' as TaskStatus,
        assigneeId: '',
        groupId: '',
    })

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit({
            groupId: formData.groupId || '1', // TODO: 実際のgroupIdを取得
            title: formData.title,
            description: formData.description || undefined,
            status: formData.status,
            assigneeId: formData.assigneeId || undefined,
        })
        setFormData({
            title: '',
            description: '',
            status: 'todo',
            assigneeId: '',
            groupId: '',
        })
        onOpenChange(false)
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {/* タスク登録更新モーダル */}
            <DialogTrigger asChild>
                <Button className="rounded-lg shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    新しいタスク
                </Button>
            </DialogTrigger>
            {/* モーダルコンテンツ */}
            <DialogContent className="rounded-lg">
                <DialogHeader>
                    <DialogTitle>新しいタスクを作成</DialogTitle>
                    <DialogDescription className="text-sm">
                        チームのボードにタスクを追加
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="taskTitle" className="text-sm">
                            タスク名 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="taskTitle"
                            type="text"
                            placeholder="何をする必要がありますか？"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taskDescription" className="text-sm">
                            説明
                        </Label>
                        <Textarea
                            id="taskDescription"
                            placeholder="タスクの詳細を入力してください"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="min-h-24 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="taskStatus" className="text-sm">
                            ステータス
                        </Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) =>
                                setFormData({ ...formData, status: value as TaskStatus })
                            }
                        >
                            <SelectTrigger className="rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todo">未着手</SelectItem>
                                <SelectItem value="in_progress">進行中</SelectItem>
                                <SelectItem value="completed">完了</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full rounded-lg">
                        タスク作成
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
