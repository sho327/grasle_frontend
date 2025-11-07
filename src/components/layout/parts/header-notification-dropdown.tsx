'use client'
// Modules
import { useRouter } from 'next/navigation'
import { Bell, Trophy, Megaphone, CheckCircle, FolderOpen } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatTimestamp } from '@/utis/formatTimestamp'

export type Notification = {
    id: string
    type: 'task' | 'note' | 'calender' | 'fileManagement'
    title: string
    description: string
    timestamp: string
    isRead: boolean
}

interface HeaderNotificationDropdownProps {
    notifications: Notification[]
    unreadCount: number
}

/**
 * ヘッダー/通知ドロップダウンコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export function HeaderNotificationDropdown({
    notifications,
    unreadCount,
}: HeaderNotificationDropdownProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const router = useRouter()
    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'task':
                return <Trophy className="h-4 w-4 text-amber-600" />
            case 'note':
                return <Megaphone className="h-4 w-4 text-blue-600" />
            case 'calender':
                return <CheckCircle className="h-4 w-4 text-emerald-600" />
            case 'fileManagement':
                return <FolderOpen className="h-4 w-4 text-purple-600" />
            default:
                return <Bell className="h-4 w-4 text-slate-600" />
        }
    }

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const onClickNotificationItem = (notification: Notification) => {
        console.log('OnClickNotificationItem')
    }
    const onClickAllRead = () => {
        console.log('OnClickAllRead')
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <DropdownMenu>
            {/* ドロップダウントリガー */}
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-primary/10 relative hover:text-gray-700"
                >
                    <Bell className="size-4.5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-0 -right-0 flex h-3 w-3 items-center justify-center bg-red-500 p-1 text-xs text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            {/* ドロップダウンメニュー */}
            <DropdownMenuContent
                className="me-3.5 max-h-96 w-[calc(100vw-2rem)] sm:w-80"
                align="start"
                forceMount
            >
                {/* ドロップダウンメニュー/ヘッダー */}
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="font-semibold">お知らせ</span>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClickAllRead}
                            className="hover:bg-primary/10 h-6 border-gray-200 bg-transparent px-2 text-xs text-gray-700 hover:text-gray-700"
                        >
                            すべて既読
                        </Button>
                    )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* ドロップダウンメニュー/お知らせアイテム */}
                <ScrollArea className={notifications.length === 0 ? 'h-34' : 'h-64'}>
                    {notifications.length === 0 ? (
                        <div className="p-4 pt-6 text-center text-slate-500">
                            <Bell className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                            <p className="text-sm">お知らせはありません</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={`hover:bg-primary/10 cursor-pointer p-3 hover:text-gray-700 ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                                    onClick={() => onClickNotificationItem(notification)}
                                >
                                    <div className="flex w-full items-start gap-3">
                                        <div className="mt-0.5 flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={`text-sm leading-tight font-medium ${
                                                        !notification.isRead
                                                            ? 'text-slate-900'
                                                            : 'text-slate-700'
                                                    }`}
                                                >
                                                    {notification.title}
                                                </p>
                                                {!notification.isRead && (
                                                    <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                                {notification.description}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-400">
                                                {formatTimestamp(notification.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* ドロップダウンメニュー/すべてのお知らせを見る */}
                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="hover:bg-primary/10 cursor-pointer text-center text-sm text-slate-600 hover:text-gray-700"
                            onClick={() => {
                                router.push('/notifications')
                            }}
                        >
                            すべてのお知らせを見る
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
