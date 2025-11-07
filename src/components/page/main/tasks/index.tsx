// =================================================================
// 🚨 全てをこのコードで上書きしてください 🚨
// =================================================================
'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Users,
    Settings,
    Plus,
    Menu,
    X,
    ChevronDown,
    CheckCircle,
    Clock,
    Calendar,
    File,
    Edit,
    Send,
    Info,
    List,
    Grid3X3,
    Trello,
} from 'lucide-react'

// =================================================================
// 0. 型定義とヘルパー関数
// =================================================================

/** @typedef {'Todo' | 'In Progress' | 'Completed'} TaskStatus */
/** @typedef {{ id: string, name: string, email: string }} User */
/** @typedef {{ id: string, name: string, owner_id: string }} Group */
/** @typedef {{ id: string, group_id: string, title: string, assignee: string, status: TaskStatus, completed_at: string | null, due_date: string | null, details: string, attachments: number }} Task */
/** @typedef {{ id: string, group_id: string, date: string, author_id: string, auto_content: string, manual_work: string, issues: string, improvements: string, attachments: number }} Report */
/** @typedef {{ currentUserId: string, currentGroupId: string, users: User[], groups: Group[], tasks: Task[], reports: Report[] }} StoreData */

const getStatusStyle = (status) => {
    switch (status) {
        case 'Completed':
            return 'bg-gray-100 text-gray-600 border border-gray-300'
        case 'In Progress':
            return 'bg-orange-500 text-white'
        case 'Todo':
            return 'bg-blue-500 text-white'
        default:
            return 'bg-gray-100 text-gray-600'
    }
}

const getStatusLabel = (status) => {
    switch (status) {
        case 'Completed':
            return '完了'
        case 'In Progress':
            return '進行中'
        case 'Todo':
            return 'ToDo'
        default:
            return '不明'
    }
}

// =================================================================
// 1. Utility Components (Shadcn/UI Mocks)
// =================================================================

const Button = ({
    children,
    onClick,
    variant = 'primary',
    size = 'default',
    className = '',
    disabled,
    ...props
}) => {
    let baseStyle =
        'inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-transform whitespace-nowrap'
    let colorStyle = ''
    let sizeStyle = ''

    switch (variant) {
        case 'primary':
            colorStyle =
                'bg-[#18BC9C] text-white hover:bg-opacity-90 focus-visible:ring-[#18BC9C] shadow-sm hover:shadow-md'
            break
        case 'secondary':
            colorStyle = 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400'
            break
        case 'ghost':
            colorStyle =
                'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400'
            break
        case 'destructive':
            colorStyle = 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500'
            break
        case 'outline':
            colorStyle =
                'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400'
            break
        default:
            colorStyle = 'bg-[#18BC9C] text-white hover:bg-opacity-90 focus-visible:ring-[#18BC9C]'
            break
    }

    switch (size) {
        case 'sm':
            sizeStyle = 'h-8 px-3'
            break
        case 'lg':
            sizeStyle = 'h-11 px-8'
            break
        case 'icon':
            sizeStyle = 'h-9 w-9'
            break
        default:
            sizeStyle = 'h-9 px-4 py-2'
            break
    }

    return (
        <button
            className={`${baseStyle} ${colorStyle} ${sizeStyle} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}

const Input = ({ className = '', ...props }) => (
    <input
        className={`flex h-9 w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#18BC9C] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
)

const Textarea = ({ className = '', ...props }) => (
    <textarea
        className={`flex min-h-[80px] w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#18BC9C] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
)

const Card = ({ children, className = '', ...props }) => (
    <div
        className={`rounded-sm border border-gray-200 bg-white p-4 shadow-sm ${className}`}
        {...props}
    >
        {children}
    </div>
)

const Modal = ({ isOpen, onClose, title, children }) => {
    // Modalコンポーネント自体にはHooksは無いので、この早期リターンはOK
    if (!isOpen) return null

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-2 sm:p-4">
            <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-3 sm:p-4">
                    <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">{title}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    )
}

const Select = ({ value, onChange, options, className = '' }) => (
    <div className={`relative ${className}`}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block h-9 w-full cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white py-2 pr-8 pl-3 text-sm focus:border-transparent focus:ring-2 focus:ring-[#18BC9C] focus:outline-none"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
)

// =================================================================
// 2. State Management (LocalStorage Mock)
// =================================================================

const STORAGE_KEY = 'tasrepo_pro_data_v2'

const getInitialData = () => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    return {
        currentUserId: 'user-1',
        currentGroupId: 'group-1',
        users: [
            { id: 'user-1', name: '田中太郎', email: 'taro@example.com' },
            { id: 'user-2', name: '佐藤花子', email: 'hanako@example.com' },
        ],
        groups: [
            { id: 'group-1', name: 'デザインゼミ', owner_id: 'user-1' },
            { id: 'group-2', name: '個人ワーク', owner_id: 'user-1' },
        ],
        tasks: [
            {
                id: 't1',
                group_id: 'group-1',
                title: 'LPデザインのレスポンシブ対応',
                assignee: 'user-1',
                status: 'In Progress',
                completed_at: null,
                due_date: today,
                details:
                    'モバイル表示時のレイアウト崩れ修正。デザインデータはFigmaを参照。**特にヘッダー**の表示をチェックすること。\n- 10月20日: 修正着手\n- 10月21日: レビュー依頼予定',
                attachments: 2,
            },
            {
                id: 't2',
                group_id: 'group-1',
                title: '要件定義書レビュー',
                assignee: 'user-2',
                status: 'Todo',
                completed_at: null,
                due_date: tomorrow,
                details:
                    '第3章「システム連携」の部分を中心にフィードバックを記載すること。特に[このセクション](https://example.com)の記述が不明瞭。',
                attachments: 1,
            },
            {
                id: 't3',
                group_id: 'group-2',
                title: 'ポートフォリオサイトの公開準備',
                assignee: 'user-1',
                status: 'Completed',
                completed_at: new Date(Date.now() - 90000000).toISOString(),
                due_date: yesterday,
                details: '最終的な画像圧縮とSEO設定を実施。**完了済み**',
                attachments: 0,
            },
            {
                id: 't4',
                group_id: 'group-1',
                title: 'デザインシステムドキュメント作成',
                assignee: 'user-1',
                status: 'Todo',
                completed_at: null,
                due_date: nextWeek,
                details: 'カラーパレット、タイポグラフィ、ボタンコンポーネントの定義を完了させる。',
                attachments: 0,
            },
        ],
        reports: [
            {
                id: 'r1',
                group_id: 'group-2',
                date: yesterday,
                author_id: 'user-1',
                auto_content: '【完了タスク】ポートフォリオサイトの公開準備 (14:30完了)',
                manual_work:
                    '・サーバーの負荷テストとデプロイ前の最終チェックを実施。\n・デプロイ環境で発生したCSSのバグ修正に時間を費やしました。',
                issues: 'デプロイ時に一部のアイコンが正しく表示されない問題が発生。',
                improvements: '次回はデプロイ手順にアイコンバンドルの確認ステップを追加する。',
                attachments: 1,
            },
        ],
    }
}

const useStore = () => {
    const [data, setData] = useState(getInitialData)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (storedData) {
            setData(JSON.parse(storedData))
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
    }, [data, isLoaded])

    const actions = useMemo(
        () => ({
            setCurrentGroup: (groupId) => {
                setData((prev) => ({ ...prev, currentGroupId: groupId }))
            },
            addTask: (group_id, title, assignee, due_date, details) => {
                const newTask = {
                    id: `t${Date.now()}`,
                    group_id,
                    title,
                    assignee,
                    status: 'Todo',
                    completed_at: null,
                    due_date: due_date || null,
                    details: details || '',
                    attachments: 0,
                }
                setData((prev) => ({
                    ...prev,
                    tasks: [...prev.tasks, newTask],
                }))
            },
            updateTask: (taskId, updates) => {
                setData((prev) => {
                    const updatedTasks = prev.tasks.map((t) =>
                        t.id === taskId ? { ...t, ...updates } : t
                    )

                    // タスクが完了になった場合の自動日報ロジックをここに移植
                    if (
                        updates.status === 'Completed' &&
                        !prev.tasks.find((t) => t.id === taskId)?.completed_at
                    ) {
                        const taskToComplete =
                            prev.tasks.find((t) => t.id === taskId) ||
                            updatedTasks.find((t) => t.id === taskId)
                        if (!taskToComplete) return prev

                        const todayDate = new Date().toISOString().split('T')[0]
                        let existingReport = prev.reports.find(
                            (r) =>
                                r.date === todayDate &&
                                r.group_id === prev.currentGroupId &&
                                r.author_id === prev.currentUserId
                        )

                        const taskTitle = taskToComplete.title
                        const completedTime = new Date().toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })
                        const newLogEntry = `【完了タスク】${taskTitle} (${completedTime}完了)`

                        if (existingReport) {
                            const updatedReport = {
                                ...existingReport,
                                auto_content:
                                    `${existingReport.auto_content}\n${newLogEntry}`.trim(),
                            }
                            return {
                                ...prev,
                                tasks: updatedTasks,
                                reports: prev.reports.map((r) =>
                                    r.id === existingReport.id ? updatedReport : r
                                ),
                            }
                        } else {
                            const newReport = {
                                id: `r${Date.now()}`,
                                group_id: prev.currentGroupId,
                                date: todayDate,
                                author_id: prev.currentUserId,
                                auto_content: newLogEntry,
                                manual_work: '',
                                issues: '',
                                improvements: '',
                                attachments: 0,
                            }
                            return {
                                ...prev,
                                tasks: updatedTasks,
                                reports: [...prev.reports, newReport],
                            }
                        }
                    }

                    return {
                        ...prev,
                        tasks: updatedTasks,
                    }
                })
            },
            completeTask: (taskId) => {
                // updateTask にロジックを集約
                const completed_at = new Date().toISOString()
                actions.updateTask(taskId, { status: 'Completed', completed_at })
            },
            saveReport: (reportId, updates) => {
                setData((prev) => ({
                    ...prev,
                    reports: prev.reports.map((r) =>
                        r.id === reportId ? { ...r, ...updates } : r
                    ),
                }))
            },
        }),
        [data.tasks, data.reports, data.currentUserId, data.currentGroupId]
    )

    return { ...data, ...actions, isLoaded }
}

const useGroupData = (store) => {
    const { currentGroupId, users, tasks } = store

    const currentGroup = store.groups.find((g) => g.id === currentGroupId)
    const groupTasks = tasks.filter((t) => t.group_id === currentGroupId)
    const groupReports = store.reports.filter((r) => r.group_id === currentGroupId)

    const getUserName = useCallback(
        (userId) => {
            return users.find((u) => u.id === userId)?.name || '不明なユーザー'
        },
        [users]
    )

    const getTaskById = useCallback(
        (taskId) => {
            return tasks.find((t) => t.id === taskId)
        },
        [tasks]
    )

    return {
        currentGroup,
        groupTasks,
        groupReports,
        getUserName,
        getTaskById,
    }
}

// =================================================================
// 3. Task Components (分割したコンポーネント)
// =================================================================

/**
 * ビュー切り替えコンポーネント
 */
const ViewSwitcher = ({ viewMode, setViewMode }) => {
    const views = [
        { id: 'table', icon: List, label: 'テーブル' },
        { id: 'card', icon: Grid3X3, label: 'カード' },
        { id: 'kanban', icon: Trello, label: 'カンバン' },
    ]
    return (
        <div className="flex w-full rounded-sm border bg-white p-1 shadow-sm sm:w-auto">
            {views.map((view) => (
                <button
                    key={view.id}
                    onClick={() => setViewMode(view.id)}
                    className={`flex flex-1 items-center justify-center rounded-sm p-2 text-sm font-medium transition-colors ${viewMode === view.id ? 'bg-[#18BC9C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <view.icon className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{view.label}</span>
                </button>
            ))}
        </div>
    )
}

/**
 * タスクサマリーカード (TaskCard/Kanban Item)
 */
const TaskSummaryCard = ({ task, onOpenModal, getUserName, completeTask }) => {
    const isOverdue =
        task.due_date &&
        new Date(task.due_date) < new Date(new Date().toISOString().split('T')[0]) &&
        task.status !== 'Completed'

    return (
        <Card
            className="cursor-pointer space-y-2 p-3 transition-shadow hover:shadow-md"
            onClick={() => onOpenModal(task.id)}
        >
            <div className="flex items-center justify-between">
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusStyle(task.status)}`}
                >
                    {getStatusLabel(task.status)}
                </span>
                <span className="text-xs text-gray-500">{getUserName(task.assignee)}</span>
            </div>

            <h3 className="line-clamp-2 font-semibold text-gray-900">{task.title}</h3>

            <div className="flex items-center justify-between border-t border-dashed pt-1 text-xs text-gray-500">
                <div
                    className={`flex items-center ${isOverdue ? 'font-semibold text-red-500' : ''}`}
                >
                    <Calendar className="mr-1 h-3 w-3" />
                    {task.due_date
                        ? new Date(task.due_date).toLocaleDateString('ja-JP')
                        : '期限なし'}
                </div>
                <div className="flex items-center space-x-2">
                    {task.attachments > 0 && (
                        <span className="flex items-center">
                            <File className="mr-0.5 h-3 w-3" />
                            {task.attachments}
                        </span>
                    )}
                    {task.status !== 'Completed' && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                completeTask(task.id)
                            }}
                            className="h-6 px-2"
                        >
                            完了
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

/**
 * テーブルの行 (TaskTable Item)
 */
const TaskListTableItem = ({ task, getUserName, onOpenModal, completeTask }) => {
    const isOverdue =
        task.due_date &&
        new Date(task.due_date) < new Date(new Date().toISOString().split('T')[0]) &&
        task.status !== 'Completed'

    return (
        <tr key={task.id} className="transition-colors hover:bg-gray-50">
            <td
                className="max-w-[300px] cursor-pointer truncate px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-900 hover:text-[#18BC9C]"
                onClick={() => onOpenModal(task.id)}
            >
                {task.title}
            </td>
            <td className="px-4 py-3 whitespace-nowrap">
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(task.status)}`}
                >
                    {getStatusLabel(task.status)}
                </span>
            </td>
            <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                {getUserName(task.assignee)}
            </td>
            <td
                className={`px-4 py-3 text-sm whitespace-nowrap ${isOverdue ? 'font-semibold text-red-500' : 'text-gray-600'}`}
            >
                {task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : '未設定'}
            </td>
            <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600">
                <div className="flex items-center space-x-1">
                    <File className="h-4 w-4 text-gray-400" />
                    <span>{task.attachments}</span>
                </div>
            </td>
            <td className="space-x-2 px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                {task.status !== 'Completed' ? (
                    <Button variant="primary" size="sm" onClick={() => completeTask(task.id)}>
                        完了
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => onOpenModal(task.id)}>
                        <Info className="mr-1 h-4 w-4" /> 詳細
                    </Button>
                )}
            </td>
        </tr>
    )
}

/**
 * テーブル表示 (TaskTable View)
 */
const TaskListTable = ({
    tasks,
    onOpenModal,
    getUserName,
    completeTask,
    sortKey,
    sortDirection,
    toggleSort,
}) => {
    const renderSortIcon = (key) => {
        if (sortKey !== key) return <ChevronDown className="h-3 w-3 text-gray-400" />
        return sortDirection === 'asc' ? (
            <ChevronDown className="h-3 w-3 rotate-180 text-[#18BC9C]" />
        ) : (
            <ChevronDown className="h-3 w-3 text-[#18BC9C]" />
        )
    }

    return (
        <div className="overflow-x-auto rounded-sm border">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="sticky top-0 bg-gray-50">
                    <tr>
                        {[
                            { key: 'title', label: 'タスク名' },
                            { key: 'status', label: 'ステータス' },
                            { key: 'assignee', label: '担当者' },
                            { key: 'due_date', label: '期限日' },
                            { key: 'attachments', label: '添付' },
                        ].map((col) => (
                            <th
                                key={col.key}
                                className={`cursor-pointer px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase hover:bg-gray-100 ${col.key === 'title' ? 'w-1/3' : 'w-auto'}`}
                                onClick={() => toggleSort(col.key)}
                            >
                                <div className="flex items-center">
                                    {col.label}
                                    {renderSortIcon(col.key)}
                                </div>
                            </th>
                        ))}
                        <th className="w-24 px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-600 uppercase">
                            アクション
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {tasks.map((task) => (
                        <TaskListTableItem
                            key={task.id}
                            task={task}
                            getUserName={getUserName}
                            onOpenModal={onOpenModal}
                            completeTask={completeTask}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/**
 * カンバン表示の列 (Kanban Column)
 */
const KanbanColumn = ({ status, tasks, onOpenModal, getUserName, completeTask }) => {
    const title = getStatusLabel(status)
    const getColumnColor = (s) => {
        switch (s) {
            case 'Todo':
                return 'bg-blue-600'
            case 'In Progress':
                return 'bg-orange-600'
            case 'Completed':
                return 'bg-gray-600'
            default:
                return 'bg-gray-400'
        }
    }
    const colorClass = getColumnColor(status)

    return (
        <div className="flex h-full w-full flex-shrink-0 flex-col rounded-sm border bg-gray-50 shadow-md sm:w-80">
            <div className={`rounded-t-sm p-3 font-bold text-white ${colorClass}`}>
                {title} <span className="text-sm font-normal opacity-90">({tasks.length})</span>
            </div>
            {/* flex-1 を追加して縦スクロール可能にする */}
            <div className="min-h-[100px] flex-1 space-y-3 overflow-y-auto p-3">
                {tasks.map((task) => (
                    <TaskSummaryCard
                        key={task.id}
                        task={task}
                        onOpenModal={onOpenModal}
                        getUserName={getUserName}
                        completeTask={completeTask}
                    />
                ))}
                {tasks.length === 0 && (
                    <p className="p-4 text-center text-sm text-gray-500 italic">
                        タスクがありません。
                    </p>
                )}
            </div>
        </div>
    )
}

/**
 * タスク詳細・編集モーダル
 * Hooksのルールに準拠するため、早期リターンをHooksの後に移動
 */
const TaskEditModal = ({ isOpen, onClose, task, users, onSave }) => {
    // 1. Hooksをトップレベルに配置し、常に呼び出す
    const [editedTask, setEditedTask] = useState(task)
    const [isSaving, setIsSaving] = useState(false)

    // task prop が変更されるたびに内部 state をリセット
    useEffect(() => {
        setEditedTask(task)
    }, [task])

    // 2. 早期リターンをHooksの後に配置
    if (!isOpen || !editedTask) return null

    // ... (以下のロジックは変更なし) ...

    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.name,
    }))

    const statusOptions = [
        { value: 'Todo', label: 'ToDo (未着手)' },
        { value: 'In Progress', label: 'In Progress (進行中)' },
        { value: 'Completed', label: 'Completed (完了)' },
    ]

    const handleSave = () => {
        if (!editedTask || isSaving) return

        setIsSaving(true)
        const updates = {
            title: editedTask.title,
            assignee: editedTask.assignee,
            status: editedTask.status,
            due_date: editedTask.due_date,
            details: editedTask.details,
            attachments: editedTask.attachments,
            // 完了ステータス変更時の completed_at 更新ロジック
            completed_at:
                editedTask.status === 'Completed' && !task?.completed_at
                    ? new Date().toISOString()
                    : editedTask.status !== 'Completed'
                      ? null
                      : task?.completed_at,
        }

        onSave(editedTask.id, updates)

        setTimeout(() => {
            setIsSaving(false)
            onClose()
        }, 300)
    }

    const handleChange = (name, value) => {
        setEditedTask((prev) => (prev ? { ...prev, [name]: value } : null))
    }

    const handleAddAttachment = () => {
        setEditedTask((prev) => (prev ? { ...prev, attachments: prev.attachments + 1 } : null))
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`タスク編集: ${editedTask.title}`}>
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="order-2 space-y-4 lg:order-1 lg:col-span-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                タスクタイトル
                            </label>
                            <Input
                                value={editedTask.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="タスク名"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                詳細・説明（Markdown対応）
                                <Info className="ml-1 h-3 w-3 text-[#18BC9C]" />
                            </label>
                            <Textarea
                                value={editedTask.details}
                                onChange={(e) => handleChange('details', e.target.value)}
                                placeholder="タスクの目的、手順、参考情報などをMarkdownで記述できます。"
                                rows="8"
                            />
                        </div>
                        <div className="space-y-1 border-t pt-4">
                            <label className="flex items-center text-sm font-medium text-gray-700">
                                <File className="mr-1 h-4 w-4" /> 添付ファイル
                            </label>
                            <div className="flex items-center space-x-3">
                                <Button variant="outline" size="sm" onClick={handleAddAttachment}>
                                    <Plus className="mr-1 h-4 w-4" /> ファイルを追加 (モック)
                                </Button>
                                <span className="text-sm text-gray-500">
                                    {editedTask.attachments} 件のファイル
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 space-y-4 rounded-sm border bg-gray-50 p-4 lg:order-2 lg:col-span-1">
                        <h4 className="border-b pb-2 font-semibold text-gray-800">タスク属性</h4>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">担当者</label>
                            <Select
                                value={editedTask.assignee}
                                onChange={(val) => handleChange('assignee', val)}
                                options={userOptions}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">期限日</label>
                            <Input
                                type="date"
                                value={editedTask.due_date || ''}
                                onChange={(e) => handleChange('due_date', e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">ステータス</label>
                            <Select
                                value={editedTask.status}
                                onChange={(val) => handleChange('status', val)}
                                options={statusOptions}
                            />
                        </div>
                        <div className="border-t pt-2 text-xs text-gray-500">
                            {editedTask.completed_at && (
                                <p className="mt-1">
                                    完了日時:{' '}
                                    {new Date(editedTask.completed_at).toLocaleString('ja-JP')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t pt-6">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        キャンセル
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !editedTask.title.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSaving ? '保存中...' : '変更を保存'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

// =================================================================
// 4. Main Page Component
// =================================================================

// =================================================================
// 🚨 TaskApp コンポーネント全体をこのコードで上書きしてください 🚨
// =================================================================
const TaskApp = () => {
    // 状態管理
    const store = useStore()
    // const {
    //     users,
    //     currentUserId,
    //     currentGroupId,
    //     addTask,
    //     completeTask,
    //     updateTask,
    //     getTaskById,
    //     isLoaded,
    // } = store
    // ✅ 修正後: getTaskByIdを外し、useStoreから返されるもののみを取得
    const { users, currentUserId, currentGroupId, addTask, completeTask, updateTask, isLoaded } =
        store

    // ✅ 修正後: useGroupDataから getTaskById を取得
    const { currentGroup, groupTasks, getUserName, getTaskById } = useGroupData(store)
    // const { currentGroup, groupTasks, getUserName } = useGroupData(store)

    // UIの状態 (Hooks 8-10)
    const [viewMode, setViewMode] = useState('table')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTaskId, setEditingTaskId] = useState(null)

    // 新規タスクフォームの状態 (Hooks 11-13)
    const [newTaskTitle, setNewTaskTitle] = useState('')
    const [newTaskAssignee, setNewTaskAssignee] = useState(currentUserId)
    const [newTaskDueDate, setNewTaskDueDate] = useState('')

    // ソートの状態 (Hook 14)
    const [sort, setSort] = useState({ key: 'due_date', direction: 'asc' })

    // タスクのソートロジック 🚨 15. useMemo (早期リターンの上に移動)
    const sortedTasks = useMemo(() => {
        const sorted = [...groupTasks]
        sorted.sort((a, b) => {
            let valA = a[sort.key]
            let valB = b[sort.key]

            if (sort.key === 'assignee') {
                valA = getUserName(a.assignee)
                valB = getUserName(b.assignee)
            } else if (sort.key === 'status') {
                // ステータス順序: Todo -> In Progress -> Completed
                const statusOrder = { Todo: 1, 'In Progress': 2, Completed: 3 }
                valA = statusOrder[a.status]
                valB = statusOrder[b.status]
            } else if (sort.key === 'due_date') {
                // 期限なしを最後に
                if (!valA && valB) return 1
                if (valA && !valB) return -1
                if (!valA && !valB) return 0
            }

            if (valA < valB) return sort.direction === 'asc' ? -1 : 1
            if (valA > valB) return sort.direction === 'asc' ? 1 : -1
            return 0
        })
        return sorted
    }, [groupTasks, sort.key, sort.direction, getUserName])

    // 看板表示用にタスクをグループ化 🚨 16. useMemo (早期リターンの上に移動)
    const groupedKanbanTasks = useMemo(() => {
        const statuses = ['Todo', 'In Progress', 'Completed']
        return statuses.map((status) => ({
            status,
            tasks: groupTasks.filter((t) => t.status === status),
        }))
    }, [groupTasks])

    // ----------------------------------------------
    // ロード中表示 🚨 全ての Hooks の後に配置
    if (!isLoaded) {
        return <div className="p-8 text-center text-xl text-gray-500">データを読み込み中...</div>
    }
    // ----------------------------------------------

    // モーダル制御
    const handleOpenModal = (taskId) => {
        setEditingTaskId(taskId)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingTaskId(null)
    }

    const toggleSort = (key) => {
        if (sort.key === key) {
            setSort((prev) => ({ key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))
        } else {
            setSort({ key, direction: 'asc' })
        }
    }

    // 新規タスク作成
    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return
        addTask(currentGroupId, newTaskTitle.trim(), newTaskAssignee, newTaskDueDate || null, '')
        setNewTaskTitle('')
        setNewTaskDueDate('')
    }

    const editingTask = editingTaskId ? getTaskById(editingTaskId) : null

    return (
        <div className="mx-auto min-h-screen max-w-7xl space-y-6 bg-gray-50 p-4 sm:p-8">
            <h1 className="flex items-center text-3xl font-bold text-gray-800">
                <CheckSquare className="mr-2 h-7 w-7 text-[#18BC9C]" />
                {currentGroup?.name || 'タスク管理'} グループ
            </h1>
            <hr />

            {/* 新規タスク作成フォーム */}
            <Card className="flex flex-col items-end space-y-3 p-4 sm:flex-row sm:space-y-0 sm:space-x-3">
                <div className="w-full flex-1 space-y-1">
                    <label className="text-sm font-medium text-gray-700">新しいタスク</label>
                    <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="タスクのタイトルを入力してください"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                </div>
                <div className="w-full space-y-1 sm:w-40">
                    <label className="text-sm font-medium text-gray-700">期限</label>
                    <Input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                </div>
                <div className="w-full space-y-1 sm:w-40">
                    <label className="text-sm font-medium text-gray-700">担当</label>
                    <Select
                        value={newTaskAssignee}
                        onChange={setNewTaskAssignee}
                        options={users.map((u) => ({ value: u.id, label: u.name }))}
                    />
                </div>
                <Button
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim()}
                    className="w-full sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    タスク追加
                </Button>
            </Card>

            {/* ビュー切り替えとタスクリスト */}
            <div className="flex flex-col items-start justify-between border-b pb-3 sm:flex-row sm:items-center">
                <h2 className="mb-3 text-xl font-semibold text-gray-800 sm:mb-0">
                    タスク一覧 ({groupTasks.length}件)
                </h2>
                <ViewSwitcher viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="min-h-[500px]">
                {viewMode === 'table' && (
                    <TaskListTable
                        tasks={sortedTasks}
                        getUserName={getUserName}
                        onOpenModal={handleOpenModal}
                        completeTask={completeTask}
                        sortKey={sort.key}
                        sortDirection={sort.direction}
                        toggleSort={toggleSort}
                    />
                )}

                {viewMode === 'card' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {groupTasks.map((task) => (
                            <TaskSummaryCard
                                key={task.id}
                                task={task}
                                onOpenModal={handleOpenModal}
                                getUserName={getUserName}
                                completeTask={completeTask}
                            />
                        ))}
                    </div>
                )}

                {viewMode === 'kanban' && (
                    // h-[70vh] で縦のスペースを確保し、横スクロールを可能にする
                    <div className="flex h-[70vh] flex-col space-y-4 overflow-x-auto overflow-y-hidden sm:flex-row sm:space-y-0 sm:space-x-4">
                        {groupedKanbanTasks.map((col) => (
                            <KanbanColumn
                                key={col.status}
                                status={col.status}
                                tasks={col.tasks}
                                getUserName={getUserName}
                                onOpenModal={handleOpenModal}
                                completeTask={completeTask}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* タスク編集モーダル */}
            <TaskEditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                task={editingTask}
                users={users}
                onSave={updateTask}
            />
        </div>
    )
}

export default TaskApp
