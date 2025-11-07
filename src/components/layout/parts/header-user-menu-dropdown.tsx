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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// Hooks
import { useIsMobile } from '@/hooks/use-mobile'
// Store
import { useCommonStore } from '@/store/common'
// Actions
import { logout } from '@/actions/authActions'

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
                    className="hover:bg-primary/10 hover:text-gray-700"
                >
                    <Avatar className="mr-1 h-7.5 w-7.5">
                        {userIconSrc && (
                            <AvatarImage src={userIconSrc} alt={`${displayUserName}-icon`} />
                        )}
                        {!userIconSrc && (
                            <AvatarFallback className="bg-gray-400/10 text-sm font-medium">
                                {displayUserName?.charAt(0)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    {!isMobile && displayUserName}
                </Button>
            </DropdownMenuTrigger>
            {/* ドロップダウンメニュー */}
            <DropdownMenuContent align="end" className="w-56 sm:w-40">
                {/* ドロップダウンメニュー/ヘッダー */}
                {isMobile && (
                    <>
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-2 px-0.5 py-0.5">
                                <p className="leading-none font-semibold">{displayUserName}</p>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />
                    </>
                )}

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
