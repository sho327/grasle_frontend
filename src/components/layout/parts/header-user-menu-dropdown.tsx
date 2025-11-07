// Modules
import { useTransition } from 'react'
import { User, LogOut } from 'lucide-react'
import Link from 'next/link'
// UI/Components
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
// Hooks
import { useIsMobile } from '@/hooks/use-mobile'
// Store
import { useCommonStore } from '@/store/common'
// Actions
import { logout } from '@/actions/authActions'
// Common/Components
import { UserAvatar } from '@/components/common/user-avatar'

interface HeaderUserMenuDropdownProps {
    displayUserName: string | null
    userIconSrc?: string | null
    // onClickLogoutItem?: () => void
}

/**
 * ヘッダー/ユーザメニュードロップダウンコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export const HeaderUserMenuDropdown = ({
    displayUserName,
    userIconSrc,
    // onClickLogoutItem,
}: HeaderUserMenuDropdownProps) => {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const isMobile = useIsMobile()
    const [isPending, startTransition] = useTransition()

    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    const { setIsLoading } = useCommonStore()

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const onClickLogoutItem = () => {
        startTransition(async () => {
            // サーバーアクションを呼び出し、リダイレクトまで全てサーバーで完結
            await logout()
        })
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
                    className="hover:bg-primary/10 relative h-8.5 w-8.5 rounded-full hover:bg-blue-50 hover:text-gray-700"
                >
                    <UserAvatar
                        name={displayUserName || ''}
                        avatar={userIconSrc}
                        level={99}
                        showLevel={true}
                        // isPremium={true}
                        // showPremium={true}
                        size="sm"
                    />
                </Button>
            </DropdownMenuTrigger>
            {/* ドロップダウンメニュー */}
            <DropdownMenuContent align="end" className="w-56 sm:w-40">
                {/* ドロップダウンメニュー/ヘッダー */}
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2 px-2 py-1.5">
                        <p className="text-sm leading-none font-medium">{displayUserName}</p>
                        <div className="flex items-center space-x-2">
                            <p className="text-muted-foreground text-xs leading-none">Lv. {99}</p>
                            <Badge className="border-0 bg-gray-700/10 text-[0.625rem] font-semibold text-gray-700">
                                無料
                            </Badge>
                        </div>
                        {/* <div className="flex items-center space-x-2">
                            <p className="text-muted-foreground text-xs leading-none">Lv. {99}</p>
                            <Badge className="border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-[0.625rem] font-semibold text-white">
                                プレミアム
                            </Badge>
                        </div> */}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* ドロップダウンメニュー/ユーザメニューアイテム */}
                <DropdownMenuItem
                    asChild
                    className="hover:bg-primary/10 cursor-pointer hover:text-gray-700"
                >
                    <Link href="/profile">
                        <User className="mr-0.5 h-4 w-4" />
                        プロフィール
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    asChild
                    className="hover:bg-primary/10 cursor-pointer hover:text-gray-700"
                >
                    <Link href="/setting">
                        <User className="mr-0.5 h-4 w-4" />
                        アプリ設定
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onClickLogoutItem} className="cursor-pointer">
                    <LogOut className="mr-0.5 h-4 w-4" />
                    ログアウト
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
