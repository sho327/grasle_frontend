// Modules
import type React from 'react'
import Link from 'next/link'
import { Sparkles, Users, CheckSquare, FileText, Calendar, FolderOpen } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'

export default function LandingPage() {
    return (
        <div className="from-background to-secondary/20 min-h-screen bg-gradient-to-b">
            {/* ヘッダー */}
            <header className="border-border/50 bg-background/80 border-b backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-2xl">
                            <Sparkles className="text-primary-foreground h-6 w-6" />
                        </div>
                        <span className="text-foreground text-2xl font-bold">Grasle</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <Button variant="ghost" className="rounded-full">
                                ログイン
                            </Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button className="rounded-full">はじめる</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="mx-auto max-w-3xl space-y-6">
                    <h1 className="text-foreground text-5xl font-bold text-balance md:text-6xl">
                        チームのための、かわいいグループウェア
                    </h1>
                    <p className="text-muted-foreground text-xl text-balance">
                        チームがつながり、協力し、一緒に成長するための優しい空間。シンプルで直感的、そして心を込めてデザインされています。
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Link href="/auth/signup">
                            <Button size="lg" className="rounded-full px-8">
                                無料で始める
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full bg-transparent px-8"
                            >
                                ログイン
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4 py-16">
                <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={<Users className="h-8 w-8" />}
                        title="チームスペース"
                        description="各チーム専用のスペースを作成し、メンバー管理も簡単に"
                    />
                    <FeatureCard
                        icon={<CheckSquare className="h-8 w-8" />}
                        title="タスク管理"
                        description="絵文字やタグでタスクを管理し、進捗を可視化"
                    />
                    <FeatureCard
                        icon={<FileText className="h-8 w-8" />}
                        title="共有ノート"
                        description="ドキュメントで協力し、知識を整理して保管"
                    />
                    <FeatureCard
                        icon={<Calendar className="h-8 w-8" />}
                        title="チームカレンダー"
                        description="イベントをスケジュールし、みんなの予定を一目で確認"
                    />
                    <FeatureCard
                        icon={<FolderOpen className="h-8 w-8" />}
                        title="ファイルギャラリー"
                        description="ファイルを共有し、自動整理と美しいギャラリービュー"
                    />
                    <FeatureCard
                        icon={<Sparkles className="h-8 w-8" />}
                        title="チームホーム"
                        description="最近のアクティビティとチームの進捗を一つの優しいダッシュボードで"
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="border-border/50 mt-20 border-t">
                <div className="text-muted-foreground container mx-auto px-4 py-8 text-center">
                    <p>Unimoa - チームのつながりを優しくサポート</p>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <div className="bg-card border-border space-y-3 rounded-3xl border p-6 transition-shadow hover:shadow-lg">
            <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
                {icon}
            </div>
            <h3 className="text-card-foreground text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
    )
}
