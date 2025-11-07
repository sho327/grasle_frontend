// Modules
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Plus, Check, Users } from 'lucide-react'
// UI/Conponents
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// Types
import type { GroupRow } from '@/types/group'
// Hooks
import { useIsMobile } from '@/hooks/use-mobile'
// Store
import { useCommonStore } from '@/store/common'
// Supabase
import type { MembershipWithGroup } from '@/lib/supabase/userData'
// Actions
import { setSelectedGroupCookie } from '@/actions/groupActions'

interface HeaderGroupSelectDropdownProps {
    selectGroup: GroupRow | null
    membershipWithGroup: MembershipWithGroup[] | null
}

/**
 * ヘッダー/グループ選択コンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export const HeaderGroupSelectDropdown = ({
    selectGroup,
    membershipWithGroup,
}: HeaderGroupSelectDropdownProps) => {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const router = useRouter()
    const isMobile = useIsMobile()

    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    const { setIsLoading } = useCommonStore()

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const onSelectGroup = async (selectGroupId: string) => {
        setIsLoading(true)
        console.log(`selectGroup: ${selectGroupId}`)
        // Cookie設定アクションを呼び出す
        await setSelectedGroupCookie(selectGroupId)
        // 現在のページをサーバー側で再レンダリング（データ再フェッチ）
        router.refresh()
    }
    const onClickCreateGroup = () => {
        console.log('グループ新規作成ボタンが押下されました')
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <DropdownMenu>
            {/* ドロップダウンメニュー */}
            <DropdownMenuTrigger asChild className={isMobile ? 'w-32' : 'w-48'}>
                <Button
                    variant="outline"
                    className="w-hull hover:bg-primary/10 justify-between rounded-lg border-gray-200 bg-white"
                >
                    <div className="flex w-[80%] items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="truncate text-gray-700">{selectGroup?.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
            </DropdownMenuTrigger>
            {/* ドロップダウンメニュー */}
            <DropdownMenuContent className="w-56 rounded-xl border-gray-200" align="start">
                {/* ドロップダウンメニュー/ヘッダー */}
                <DropdownMenuLabel className="text-gray-700">グループを選択</DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* ドロップダウンメニュー/グループアイテム */}
                {membershipWithGroup &&
                    membershipWithGroup.map((membership, itemIndex) => (
                        <DropdownMenuItem
                            key={itemIndex}
                            onClick={() => onSelectGroup(membership.groups.id)}
                            className="flex cursor-pointer items-center justify-between rounded-lg"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {membership.groups.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{membership.role}</p>
                                </div>
                            </div>
                            {selectGroup && selectGroup.id === membership.groups.id && (
                                <Check className="h-4 w-4 text-emerald-600" />
                            )}
                        </DropdownMenuItem>
                    ))}

                <DropdownMenuSeparator />

                {/* ドロップダウンメニュー/新しいグループを作成 */}
                <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                        href="#"
                        className="flex items-center gap-2 rounded-lg"
                        onClick={onClickCreateGroup}
                    >
                        <Plus className="h-4 w-4 text-emerald-600" />
                        <span>新しいグループを作成</span>
                        {/* {!user.isPremium && <Crown className="w-3 h-3 text-amber-500 ml-auto" />} */}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
