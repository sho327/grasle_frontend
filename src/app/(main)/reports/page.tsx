// =================================================================
// src/components/page/main/reports/index.tsx (完全単一ファイル)
// 外部依存は React と lucide-react のみ
// =================================================================

'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FileText, Plus, Edit, X, ChevronDown, Calendar, Send } from 'lucide-react'

// =================================================================
// 0. データと Hooks の定義
// =================================================================

const STORAGE_KEY = 'tasrepo_pro_data_v2'

/**
 * 初期データ生成関数
 * @returns {object} アプリの初期状態
 */
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
            // 日報の自動ログテスト用に完了タスクを含める
            {
                id: 't1',
                group_id: 'group-1',
                title: 'LPデザインのレスポンシブ対応',
                assignee: 'user-1',
                status: 'Completed',
                completed_at: new Date(Date.now() - 3600000).toISOString(),
                due_date: today,
                details: 'モバイル表示時のレイアウト崩れ修正。',
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
                details: '第3章「システム連携」の部分を中心にフィードバックを記載すること。',
                attachments: 1,
            },
        ],
        reports: [
            // ダミーの日報データ
            {
                id: 'r1',
                group_id: 'group-1',
                date: today,
                author_id: 'user-1',
                auto_content: '【完了タスク】LPデザインのレスポンシブ対応 (9:00完了)',
                manual_work: 'レスポンシブ対応のレビューを実施。特に問題なし。',
                issues: '',
                improvements: '次回はデザインカンプ作成時にブレイクポイントを先に定義する。',
                attachments: 1,
            },
            {
                id: 'r2',
                group_id: 'group-1',
                date: yesterday,
                author_id: 'user-2',
                auto_content: '【完了タスク】仕様書の作成',
                manual_work: '仕様書のドラフトを完成させた。',
                issues: '一部の外部連携仕様が未定。',
                improvements: '',
                attachments: 0,
            },
        ],
    }
}

/**
 * グローバルな状態管理 Hooks (useStore)
 */
const useStore = () => {
    const [data, setData] = useState(getInitialData)
    const [isLoaded, setIsLoaded] = useState(false)

    // 永続化 (LocalStorage) - 初期ロード
    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (storedData) {
            setData(JSON.parse(storedData))
        }
        setIsLoaded(true)
    }, [])

    // 永続化 (LocalStorage) - データ変更時
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        }
    }, [data, isLoaded])

    const actions = useMemo(
        () => ({
            // 日報の保存アクション
            saveReport: (reportId, updates) => {
                setData((prev) => ({
                    ...prev,
                    reports: prev.reports.map((r) =>
                        r.id === reportId ? { ...r, ...updates } : r
                    ),
                }))
            },
            // その他、タスク関連のアクション (日報ページでは使わないが、データ構造上必要)
            updateTask: (taskId, updates) => {
                setData((prev) => {
                    const updatedTasks = prev.tasks.map((t) =>
                        t.id === taskId ? { ...t, ...updates } : t
                    )
                    return { ...prev, tasks: updatedTasks }
                })
            },
        }),
        []
    )

    return { ...data, ...actions, isLoaded }
}

/**
 * グループ固有の派生データとヘルパー関数 Hooks (useGroupData)
 */
const useGroupData = (store) => {
    const { currentGroupId, users, tasks, reports } = store

    const currentGroup = store.groups.find((g) => g.id === currentGroupId)
    const groupReports = reports.filter((r) => r.group_id === currentGroupId)

    const getUserName = useCallback(
        (userId) => {
            return users.find((u) => u.id === userId)?.name || '不明なユーザー'
        },
        [users]
    )

    const getReportById = useCallback(
        (reportId) => {
            return reports.find((r) => r.id === reportId)
        },
        [reports]
    )

    return {
        currentGroup,
        groupReports,
        getUserName,
        getReportById,
    }
}

// =================================================================
// 1. UI コンポーネント (共通 UI)
// =================================================================

export const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled,
    ...props
}) => {
    let baseStyle =
        'inline-flex items-center justify-center rounded-sm text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] transition-transform whitespace-nowrap'
    let colorStyle =
        variant === 'primary'
            ? 'bg-[#18BC9C] text-white hover:bg-opacity-90 focus-visible:ring-[#18BC9C] shadow-sm hover:shadow-md'
            : variant === 'secondary'
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus-visible:ring-gray-400'
              : 'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400'
    let sizeStyle = 'h-9 px-4 py-2'

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

export const Textarea = ({ className = '', ...props }) => (
    <textarea
        className={`flex min-h-[80px] w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#18BC9C] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    />
)

export const Card = ({ children, className = '', ...props }) => (
    <div
        className={`rounded-sm border border-gray-200 bg-white p-4 shadow-sm ${className}`}
        {...props}
    >
        {children}
    </div>
)

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null
    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-2 sm:p-4">
            <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b p-3 sm:p-4">
                    <h2 className="text-lg font-semibold text-gray-800 sm:text-xl">{title}</h2>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="h-8 w-8 text-gray-500 hover:text-gray-800"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                {children}
            </div>
        </div>
    )
}

// =================================================================
// 2. ヘルパー関数
// =================================================================

const formatDate = (dateString) => {
    if (!dateString) return '日付なし'
    const date = new Date(dateString)
    // 日付のみを抽出するロジック
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

const getReportStatus = (report) => {
    if (report.manual_work || report.issues || report.improvements) {
        return '記入済み'
    }
    return '自動ログのみ'
}

const getReportStatusStyle = (report) => {
    return getReportStatus(report) === '記入済み'
        ? 'bg-[#18BC9C] text-white'
        : 'bg-yellow-100 text-yellow-800'
}

// =================================================================
// 3. 日報表示・編集コンポーネント
// =================================================================

/**
 * 日報サマリーカード (ReportList Item)
 */
const ReportSummaryCard = ({ report, onOpenModal, getUserName }) => {
    const statusLabel = getReportStatus(report)
    const statusClass = getReportStatusStyle(report)

    return (
        <Card
            className="cursor-pointer space-y-2 p-4 transition-shadow hover:shadow-lg"
            onClick={() => onOpenModal(report.id)}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                    <Calendar className="mr-2 inline h-5 w-5 text-gray-600" />
                    {formatDate(report.date)} の日報
                </h3>
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}
                >
                    {statusLabel}
                </span>
            </div>

            <div className="space-y-1 text-sm text-gray-700">
                <p>
                    <span className="font-semibold text-[#18BC9C]">担当者:</span>{' '}
                    {getUserName(report.author_id)}
                </p>
                <div className="line-clamp-2 text-gray-600">
                    <span className="font-semibold">完了タスク:</span>{' '}
                    {report.auto_content || 'なし'}
                </div>
            </div>

            <div className="flex justify-end pt-2 text-xs text-gray-500">
                <Edit className="mr-1 h-3 w-3" /> クリックして編集
            </div>
        </Card>
    )
}

/**
 * 日報編集モーダル
 */
const ReportEditModal = ({ isOpen, onClose, report, getUserName, onSave }) => {
    const [editedReport, setEditedReport] = useState(report)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setEditedReport(report)
    }, [report])

    if (!isOpen || !editedReport) return null

    const handleSave = () => {
        if (!editedReport || isSaving) return

        setIsSaving(true)
        const updates = {
            manual_work: editedReport.manual_work,
            issues: editedReport.issues,
            improvements: editedReport.improvements,
        }

        onSave(editedReport.id, updates)

        setTimeout(() => {
            setIsSaving(false)
            onClose()
        }, 300)
    }

    const handleChange = (name, value) => {
        setEditedReport((prev) => (prev ? { ...prev, [name]: value } : null))
    }

    const reportTitle = `${formatDate(editedReport.date)} の日報 (${getUserName(editedReport.author_id)})`

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={reportTitle}>
            <div className="p-4 sm:p-6">
                <h4 className="mb-4 text-lg font-semibold text-gray-800">
                    ✅ 自動ログ（完了タスク）
                </h4>
                <div className="rounded-sm border bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-700">
                    {editedReport.auto_content || '自動ログはありません。'}
                </div>

                <div className="mt-6 space-y-4">
                    {/* 手動作業 */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            🔥 手動作業内容（Markdown可）
                        </label>
                        <Textarea
                            value={editedReport.manual_work || ''}
                            onChange={(e) => handleChange('manual_work', e.target.value)}
                            placeholder="今日手動で取り組んだ作業内容を記述してください。"
                            rows={4}
                        />
                    </div>

                    {/* 課題 */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            ⚠️ 課題・問題点（Markdown可）
                        </label>
                        <Textarea
                            value={editedReport.issues || ''}
                            onChange={(e) => handleChange('issues', e.target.value)}
                            placeholder="今日発生した問題や、未解決の課題点を記述してください。"
                            rows={3}
                        />
                    </div>

                    {/* 改善点 */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            ✨ 改善提案・知見（Markdown可）
                        </label>
                        <Textarea
                            value={editedReport.improvements || ''}
                            onChange={(e) => handleChange('improvements', e.target.value)}
                            placeholder="学んだことや、次回以降の改善点を記述してください。"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 border-t pt-6">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        キャンセル
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSaving ? '保存中...' : '日報を保存'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

// =================================================================
// 4. メインの日報ページコンポーネント (ReportApp)
// =================================================================

const ReportApp = () => {
    // 状態管理 Hooks
    const store = useStore()
    const { saveReport, isLoaded } = store // saveReport は useStore から取得
    const { currentGroup, groupReports, getUserName, getReportById } = useGroupData(store) // groupReports, getReportById は useGroupData から取得

    // UIの状態 Hooks
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReportId, setEditingReportId] = useState(null)

    // ロジック Hooks
    const sortedReports = useMemo(() => {
        // 最新の日報が上に来るようにソート
        return [...groupReports].sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [groupReports])

    // 早期リターンを全ての Hooks の後に配置
    if (!isLoaded) {
        return <div className="p-8 text-center text-xl text-gray-500">データを読み込み中...</div>
    }

    // モーダル制御
    const handleOpenModal = (reportId) => {
        setEditingReportId(reportId)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingReportId(null)
    }

    // 編集対象の日報オブジェクトを取得
    const editingReport = editingReportId ? getReportById(editingReportId) : null

    return (
        <div className="mx-auto min-h-screen max-w-7xl space-y-6 bg-gray-50 p-4 sm:p-8">
            <h1 className="flex items-center text-3xl font-bold text-gray-800">
                <FileText className="mr-2 h-7 w-7 text-blue-600" />
                {currentGroup?.name || '日報管理'} グループ
            </h1>
            <hr />

            <div className="flex flex-col items-start justify-between pb-3 sm:flex-row sm:items-center">
                <h2 className="mb-3 text-xl font-semibold text-gray-800 sm:mb-0">
                    日報履歴 ({groupReports.length}件)
                </h2>
                <Button variant="secondary" className="text-blue-600 hover:bg-blue-50">
                    <Plus className="mr-2 h-4 w-4" />
                    手動で日報を作成
                </Button>
            </div>

            <div className="space-y-4">
                {sortedReports.length > 0 ? (
                    sortedReports.map((report) => (
                        <ReportSummaryCard
                            key={report.id}
                            report={report}
                            onOpenModal={handleOpenModal}
                            getUserName={getUserName}
                        />
                    ))
                ) : (
                    <Card className="p-8 text-center text-gray-500">
                        このグループの日報はまだありません。
                    </Card>
                )}
            </div>

            {/* 日報編集モーダル */}
            <ReportEditModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                report={editingReport}
                getUserName={getUserName}
                onSave={saveReport}
            />
        </div>
    )
}

export default ReportApp
