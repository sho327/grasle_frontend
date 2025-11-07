// =================================================================
// reports.rsx1 (日報ページ単一ファイル)
// =================================================================

'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FileText, Plus, Edit, X, ChevronDown, Calendar, Send } from 'lucide-react'

// 🚨 既存の Hooks と共通コンポーネントのインポート
// 実際には、これらのパスをあなたのプロジェクト構造に合わせて修正してください。
import { useStore } from '../hooks/useStore'
import { useGroupData } from '../hooks/useGroupData'
import { Button, Card, Textarea, Modal, Input, Select } from '../components/common/UI'

// =================================================================
// 1. ヘルパー関数 (通常は utils/helpers からインポート)
// =================================================================

const formatDate = (dateString) => {
    if (!dateString) return '日付なし'
    // タイムゾーンの問題を避けるため、UTCとして日付を扱う（必要に応じて調整）
    const date = new Date(dateString)
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
// 2. 日報表示・編集コンポーネント
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
    // 🚨 Hooksのルール: Hooksをトップレベルに配置
    const [editedReport, setEditedReport] = useState(report)
    const [isSaving, setIsSaving] = useState(false)

    // report prop が変更されるたびに内部 state をリセット
    useEffect(() => {
        setEditedReport(report)
    }, [report])

    // 早期リターンをHooksの後に配置
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

        // 模擬的な保存遅延
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
// 3. メインの日報ページコンポーネント (ReportApp)
// =================================================================

const ReportApp = () => {
    // 状態管理
    const store = useStore()
    const { users, currentGroupId, saveReport, isLoaded } = store
    const { currentGroup, groupReports, getUserName, getReportById } = useGroupData(store)

    // UIの状態
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReportId, setEditingReportId] = useState(null)

    // Hooks の後に早期リターンを配置
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

    // 最新の日報が上に来るようにソート
    const sortedReports = useMemo(() => {
        return [...groupReports].sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [groupReports])

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
