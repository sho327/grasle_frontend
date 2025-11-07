'use client'
// Modules
import { Crown } from 'lucide-react'
// UI/Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface UserAvatarProps {
    name: string
    avatar?: string | null
    level?: number
    isPremium?: boolean
    size?: 'sm' | 'md' | 'lg'
    showLevel?: boolean
    showPremium?: boolean
}

/**
 * 共通ユーザアバターコンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/08
 */
export function UserAvatar({
    name,
    avatar,
    level,
    isPremium = false,
    size = 'md',
    showLevel = false,
    showPremium = true,
}: UserAvatarProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-12 w-12',
    }
    const premiumBadgeSizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    }
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <div className="relative inline-block">
            {/* アバター(画像がなければFallbackを表示) */}
            <Avatar className={`${sizeClasses[size]} border-primary/25 border-2`}>
                {avatar && <AvatarImage src={avatar || '/placeholder.svg'} alt={name} />}
                {/* <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 font-bold text-white"> */}
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 font-bold text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            {/* プレミアム表示 */}
            {isPremium && showPremium && (
                <div
                    className={`absolute -top-1 -right-1 ${premiumBadgeSizeClasses[size]} flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg`}
                >
                    <Crown
                        className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-white`}
                    />
                </div>
            )}
            {/* レベル表示 */}
            {level && showLevel && (
                // <Badge className="absolute -right-1 -bottom-1 flex min-h-3 min-w-3 items-center justify-center bg-gradient-to-r from-emerald-500 to-green-500 p-0 text-[0.625rem] text-white">
                <Badge className="bg-primary absolute -right-1 -bottom-1 flex min-h-3 min-w-3 items-center justify-center p-0 text-[0.625rem] text-white">
                    {level}
                </Badge>
            )}
        </div>
    )
}
