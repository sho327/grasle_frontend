'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Leaf, ArrowRight, Users, Trophy, Sparkles, Sprout } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-green-50/30">
            {/* ヘッダー */}
            <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-md">
                <div className="mx-auto max-w-6xl px-6 py-4 sm:py-3">
                    <div className="flex items-center justify-between">
                        {/* <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Growly</h1>
              </div>
            </div> */}
                        {/* <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl shadow-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">Growly</h1>
              </div>
            </div> */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm">
                                <Leaf className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Growly</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/login`}>
                                <Button
                                    variant="ghost"
                                    className="text-emerald-600 transition-colors hover:text-emerald-700"
                                >
                                    ログイン
                                </Button>
                            </Link>
                            <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/register`}>
                                <Button className="transform rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg">
                                    はじめる
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* メインコンテンツ */}
            <main className="mx-auto max-w-6xl px-6 py-20">
                {/* ヒーローセクション */}
                <div className="mb-24 text-center">
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-green-50 px-4 py-2 text-sm font-medium text-emerald-700">
                        <Sparkles className="h-4 w-4" />
                        チームの成長を可視化する新しい体験
                    </div>
                    <h1 className="mb-6 text-5xl leading-tight font-bold text-slate-900 md:text-6xl">
                        毎日のタスクが
                        <br />
                        <span className="relative bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            美しい庭園
                            <div className="absolute right-0 -bottom-2 left-0 h-1 rounded-full bg-green-300 opacity-60"></div>
                        </span>
                        に育つ
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-600">
                        タスク完了の積み重ねを草履歴で可視化。
                        <br />
                        チーム全体のモチベーションを自然に向上させる、新しいプロジェクト管理ツールです。
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/register`}>
                            <Button
                                size="lg"
                                className="transform rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            >
                                無料で始める
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-xl border-2 border-green-400 px-8 py-4 font-medium text-emerald-600 transition-colors hover:bg-green-50 hover:text-emerald-700"
                        >
                            デモを見る
                        </Button>
                    </div>
                </div>

                {/* 特徴セクション */}
                <div className="mb-24 grid gap-8 md:grid-cols-3">
                    <Card className="border-slate-200/60 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                                <Leaf className="h-7 w-7 text-emerald-600" />
                            </div>
                            <h3 className="mb-4 text-lg font-bold text-slate-900">成長の可視化</h3>
                            <p className="leading-relaxed text-slate-600">
                                GitHub風の草履歴で、チームの活動を美しく可視化。毎日のタスク完了が緑の草となって成長を実感できます。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                                <Users className="h-7 w-7 text-blue-600" />
                            </div>
                            <h3 className="mb-4 text-lg font-bold text-slate-900">チーム協力</h3>
                            <p className="leading-relaxed text-slate-600">
                                メンバー招待、貢献度ランキング、リアルタイム進捗共有で、自然にチーム全体のモチベーションが向上します。
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <CardContent className="p-8 text-center">
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                                <Trophy className="h-7 w-7 text-amber-600" />
                            </div>
                            <h3 className="mb-4 text-lg font-bold text-slate-900">継続の仕組み</h3>
                            <p className="leading-relaxed text-slate-600">
                                レベルアップ、ログインボーナス、実績システムで、タスク管理を楽しい日常の習慣に変えます。
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 統計セクション */}
                <div className="mb-24 rounded-3xl border border-slate-200/60 bg-white p-12 shadow-sm">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">
                            多くのチームに選ばれています
                        </h2>
                        <p className="text-slate-600">
                            日本全国のチームがGrowlyで成長を実感しています
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-green-600">1,200+</div>
                            <div className="font-medium text-slate-600">アクティブチーム</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-blue-600">15,000+</div>
                            <div className="font-medium text-slate-600">完了タスク数</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-amber-600">98%</div>
                            <div className="font-medium text-slate-600">継続率</div>
                        </div>
                        <div className="text-center">
                            <div className="mb-2 text-3xl font-bold text-purple-600">4.9</div>
                            <div className="font-medium text-slate-600">満足度評価</div>
                        </div>
                    </div>
                </div>

                {/* CTA セクション */}
                <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-green-500 p-12 text-center text-white shadow-lg">
                    <h2 className="mb-4 text-3xl font-bold">今日から始める、新しいチーム体験</h2>
                    <p className="mb-8 text-xl opacity-90">
                        無料プランでも充実した機能をご利用いただけます
                    </p>
                    <Link href={`${process.env.NEXT_PUBLIC_BASE_PATH}/register`}>
                        <Button
                            size="lg"
                            className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-emerald-600 shadow-md hover:bg-slate-50"
                        >
                            無料でアカウント作成
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </main>

            {/* フッター */}
            <footer className="bg-slate-900 py-16 text-white">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="mb-8 flex items-center justify-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-500">
                            <Leaf className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">Growly</span>
                    </div>
                    <div className="text-center text-slate-400">
                        <p>&copy; 2025 Growly. All rights reserved. </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
