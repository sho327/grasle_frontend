'use client'
// Modules
import React from 'react'
import Link from 'next/link'
import { FolderOpen } from 'lucide-react'
// Types
import { ProjectWithDetails } from '@/lib/supabase/projectData'
// UI/Components
// import ProjectCard from '@/components/ui/ProjectCard'
// import { Separator } from '@/components/ui/separator'
// Layout/Components
import PageHeader from '@/components/layout/parts/page-header'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Star, Calendar } from 'lucide-react'

interface ProjectListProps {
    projects: ProjectWithDetails[]
}

/**
 * プロジェクト一覧ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function ProjectList({ projects }: ProjectListProps) {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    // プロジェクトの件数を表示
    const projectCount = projects.length
    console.log(projects)

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* ページヘッダー */}
            <PageHeader
                Icon={FolderOpen}
                iconVariant="project-list"
                pageTitle="プロジェクト一覧"
                pageDescription="あなたが所属するプロジェクト一覧です。"
                isBackButton={false}
            />

            {/* プロジェクト一覧 */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href={`/project/${project.id}/overview`}
                        passHref
                        className="block"
                    >
                        <Card className="rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-lg">
                            <CardHeader className="">
                                <div className="flex items-center justify-between">
                                    <Badge className={'bg-primary text-white'} variant="outline">
                                        active
                                    </Badge>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 text-amber-500" />
                                        <span className="text-sm text-slate-600">1</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <CardTitle className="line-clamp-2 text-lg font-semibold text-slate-900">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                                        {project.description}
                                    </CardDescription>
                                </div>

                                <div className="space-y-3">
                                    {/* 進捗状況 */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">進捗</span>
                                            <span className="font-medium text-slate-900">
                                                {/* {project.progress}% */}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            {/* <Progress value={project.progress} className="h-2" /> */}
                                            <div
                                                className={`absolute inset-0 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500`}
                                                // style={{ width: `${String(project.progress)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <div
                                        // className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(project.priority)}`}
                                        >
                                            {/* {getPriorityText(project.priority)} */}
                                        </div>
                                        {/* {project.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(project.dueDate).toLocaleDateString('ja-JP')}
                                        </div>
                                    )} */}
                                    </div>

                                    {/* {project.assignees.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <div className="flex -space-x-2">
                                            {project.assignees.slice(0, 3).map((assignee) => (
                                                <Avatar
                                                    key={assignee.id}
                                                    className="h-6 w-6 border-2 border-white"
                                                >
                                                    <AvatarImage
                                                        src={assignee.avatar}
                                                        alt={assignee.name}
                                                    />
                                                    <AvatarFallback className="text-xs">
                                                        {assignee.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {project.assignees.length > 3 && (
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs text-slate-600">
                                                    +{project.assignees.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )} */}
                                </div>

                                {/* {onView && (
                                <Button
                                    onClick={() => onView(project.id)}
                                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    詳細を見る
                                </Button>
                            )} */}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* EmptyState(空の場合の表示) */}
            {/* {filteredProjects.length === 0 && (
                <EmptyState
                icon={FolderOpen}
                title="プロジェクトが見つかりません"
                description="検索条件を変更するか、新しいプロジェクトを作成してください。"
                actionLabel="最初のプロジェクトを作成"
                onAction={() => setIsCreateModalOpen(true)}
                variant="project"
                />
            )} */}
        </div>
    )
}
