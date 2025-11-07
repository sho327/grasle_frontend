'use client'
// Modules
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
// UI/Components
import { Badge } from '@/components/ui/badge'
import { useSidebar } from '@/components/ui/sidebar'
// Libs
import { cn } from '@/lib/utils'

interface SidebarItemProps {
    title: string
    href: string
    icon: LucideIcon
    badge?: string
    premium?: boolean
}

export function SidebarItem({ title, href, icon: Icon, badge, premium }: SidebarItemProps) {
    const pathname = usePathname()

    // アクティブ判定を改善: 各ページの特性に合わせた判定
    const getIsActive = () => {
        // 完全一致の場合
        if (pathname === href) return true

        // ダッシュボードは完全一致のみ
        if (href === '/dashboard') return pathname === '/dashboard'

        // プロジェクトページ: /projects で始まるパスすべて
        if (href === '/projects') return pathname.startsWith('/projects')

        // タスクページ: /tasks で始まるパスすべて
        if (href === '/tasks') return pathname.startsWith('/tasks')

        // 組織管理ページ: /organizations で始まるパスすべて
        if (href === '/organizations') return pathname.startsWith('/organizations')

        // プロフィールページ: /profile で始まるパスすべて
        if (href === '/profile/me') return pathname.startsWith('/profile')

        // その他のページは先頭部分でマッチ
        return pathname.startsWith(href)
    }

    const isActive = getIsActive()

    const { isMobile, setOpenMobile } = useSidebar()

    const handleClick = () => {
        // スマホの場合のみサイドバーを閉じる
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    return (
        <Link
            href={href}
            onClick={handleClick}
            className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                premium
                    ? isActive
                        ? 'bg-yellow-50 text-yellow-800'
                        : 'text-yellow-700 hover:bg-slate-50 hover:text-yellow-700'
                    : isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
        >
            <Icon
                className={cn(
                    'h-4 w-4',
                    premium
                        ? isActive
                            ? 'text-yellow-800'
                            : 'text-yellow-700'
                        : isActive
                          ? 'text-blue-700'
                          : 'text-slate-600'
                )}
            />
            <span className="flex-1">{title}</span>
            {badge && (
                <Badge
                    variant="secondary"
                    className={cn(
                        'ml-auto text-xs',
                        premium
                            ? 'border-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                            : 'border-green-200 bg-green-100 text-green-800'
                    )}
                >
                    {badge}
                </Badge>
            )}
        </Link>
    )
}
