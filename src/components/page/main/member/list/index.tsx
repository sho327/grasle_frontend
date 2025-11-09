'use client'
// Modules
import React from 'react'
import { Users } from 'lucide-react'
// Layout/Components
import PageHeader from '@/components/layout/parts/page-header'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Star, Calendar } from 'lucide-react'

interface MemberListClientProps {}

/**
 * チームメンバー一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function MemberListClient({}: MemberListClientProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* ページヘッダー */}
            <PageHeader
                Icon={Users}
                iconVariant="member-list"
                pageTitle="チームメンバー"
                pageDescription="あなたが所属するチームのメンバーです。"
                isBackButton={false}
            />
        </div>
    )
}
